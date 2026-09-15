import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { getInteractivePrompt, type InteractivePrompt } from '../utils/interactive-prompt';
import { writeExtensionsConfig } from '../utils/extensions-config';
import { installCharacterCountRule, installEmDashRule } from '../utils/install-rules';
import { extractCommandHelp } from '../utils/extractCommandHelp';
import { selfRemoveCommand } from './self-remove';
import {
  buildLifecycleSnapshot,
  createAiPromptsArchive,
  createLifecycleBackup,
  createLifecycleSnapshotFromArtifact,
  exportLifecycleReport,
  getLatestLifecycleBackup,
  listSafeFixes,
  refreshLifecycleArtifact,
  restoreAiPromptsArchive,
  restoreExtensionsConfigFromArtifact,
  restoreLifecycleBackup,
  writeLifecycleReportFile,
} from '../utils/lifecycle';
import type {
  LifecycleArchive,
  LifecycleFixId,
  LifecycleIssue,
  LifecycleSnapshot,
} from '../types/lifecycle';

interface LifecycleCommandOptions {
  json?: boolean;
  dryRun?: boolean;
  force?: boolean;
  fix?: string;
  allSafe?: boolean;
  report?: string;
  keepData?: boolean;
  removeData?: boolean;
}

const DEFAULT_FIX_ORDER: LifecycleFixId[] = [
  'recreate-config',
  'restore-backup',
  'restore-ai-prompts-directory',
  'reinstall-core-rules',
  'rebuild-command-help',
  'rebuild-ai-prompts-archive',
  'refresh-artifact',
];

function projectRoot(): string {
  return process.cwd();
}

function lifecycleLabel(issue: LifecycleIssue): string {
  return `${issue.severity.toUpperCase()}: ${issue.title}`;
}

function orderedFixes(fixes: LifecycleFixId[]): LifecycleFixId[] {
  return DEFAULT_FIX_ORDER.filter((fix) => fixes.includes(fix));
}

function printIssue(issue: LifecycleIssue): void {
  console.log(chalk.gray(`  - ${lifecycleLabel(issue)}`));
  console.log(chalk.gray(`    ${issue.message}`));
  if (issue.path) {
    console.log(chalk.gray(`    Path: ${issue.path}`));
  }
  if (issue.recommendedSolution) {
    console.log(chalk.gray(`    Fix: ${issue.recommendedSolution}`));
  }
  if (issue.safeFix) {
    console.log(chalk.gray(`    Safe fix: ${issue.safeFix}`));
  }
}

function printSnapshot(snapshot: LifecycleSnapshot): void {
  console.log(chalk.bold.blue('\nLifecycle status\n'));
  console.log(chalk.gray(`  Status: ${snapshot.status}`));
  console.log(chalk.gray(`  Installed modules: ${snapshot.installedModuleCount}`));
  console.log(chalk.gray(`  Backups: ${snapshot.backupCount}`));
  console.log(chalk.gray(`  Archives: ${snapshot.archiveCount}`));
  console.log(chalk.gray(`  Rollback available: ${snapshot.rollbackAvailable ? 'yes' : 'no'}`));
  console.log(chalk.gray(`  Upgrade available: ${snapshot.upgradeAvailable ? 'yes' : 'no'}`));

  if (snapshot.repairableIssues.length > 0) {
    console.log(chalk.bold.blue('\nSafe fixes\n'));
    for (const issue of snapshot.repairableIssues) {
      if (issue.safeFix) {
        console.log(chalk.gray(`  - ${issue.safeFix}: ${issue.title}`));
      }
    }
  }

  if (snapshot.issues.length > 0) {
    console.log(chalk.bold.blue('\nDiagnostics\n'));
    for (const issue of snapshot.issues) {
      printIssue(issue);
    }
  } else {
    console.log(chalk.green('\nNo lifecycle issues were detected.\n'));
  }
}

async function chooseFixes(
  snapshot: LifecycleSnapshot,
  options: LifecycleCommandOptions,
  promptApi: InteractivePrompt | null
): Promise<LifecycleFixId[]> {
  if (options.fix) {
    const requested = options.fix
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean) as LifecycleFixId[];
    return orderedFixes(requested);
  }

  const safeFixes = orderedFixes(listSafeFixes(snapshot));
  if (safeFixes.length === 0) {
    return [];
  }

  if (options.allSafe || options.force || !promptApi) {
    return safeFixes;
  }

  const { fixes } = await promptApi.prompt([
    {
      type: 'checkbox',
      name: 'fixes',
      message: 'Select safe fixes to apply',
      choices: safeFixes.map((fix) => ({
        name: fix,
        value: fix,
        checked: true,
      })),
    },
  ]);

  return Array.isArray(fixes) ? orderedFixes(fixes as LifecycleFixId[]) : [];
}

async function applyRepairFix(
  fix: LifecycleFixId,
  snapshot: LifecycleSnapshot,
  options: LifecycleCommandOptions
): Promise<LifecycleArchive | undefined> {
  const root = projectRoot();

  switch (fix) {
    case 'recreate-config': {
      const configPath = path.join(root, '.augment', 'extensions.json');
      if (snapshot.artifact) {
        const restored = restoreExtensionsConfigFromArtifact(root);
        if (restored) {
          return undefined;
        }
      }

      if (!fs.existsSync(configPath)) {
        writeExtensionsConfig(root, {
          version: '0.1.0',
          modules: [],
          settings: {
            autoUpdate: false,
            checkUpdatesOnInit: true,
          },
        });
        return undefined;
      }

      return undefined;
    }
    case 'restore-backup': {
      const backup = getLatestLifecycleBackup(root);
      if (!backup) {
        throw new Error('No lifecycle backup is available for restoration.');
      }
      restoreLifecycleBackup(root, backup);
      return undefined;
    }
    case 'restore-ai-prompts-directory': {
      const archives = snapshot.artifact?.archives ?? [];
      const archive = archives[archives.length - 1];
      if (!archive) {
        throw new Error('No retained ai-prompts archive is available.');
      }
      await restoreAiPromptsArchive(archive.path, root);
      return undefined;
    }
    case 'reinstall-core-rules': {
      const results = await Promise.all([
        installCharacterCountRule({
          targetDir: root,
          force: true,
          verbose: false,
        }),
        installEmDashRule({
          targetDir: root,
          force: true,
          verbose: false,
        }),
      ]);

      const failed = results.find((result) => !result.success);
      if (failed) {
        throw new Error(failed.error || 'Failed to reinstall core rules.');
      }
      return undefined;
    }
    case 'rebuild-command-help': {
      await extractCommandHelp(root, '.augment/COMMAND_HELP.md');
      return undefined;
    }
    case 'rebuild-ai-prompts-archive': {
      return createAiPromptsArchive(root, 'lifecycle repair');
    }
    case 'refresh-artifact':
      return undefined;
    default:
      return undefined;
  }
}

function finalizeLifecycleSnapshot(
  snapshot: LifecycleSnapshot,
  artifactOptions: {
    backup?: ReturnType<typeof createLifecycleBackup>;
    archive?: LifecycleArchive;
    status?: LifecycleSnapshot['status'];
    operationName?: 'repair' | 'rollback' | 'self-remove';
  } = {}
): LifecycleSnapshot {
  const root = projectRoot();
  const startedAt = new Date().toISOString();
  const firstArtifact = refreshLifecycleArtifact(root, {
    status: artifactOptions.status,
    backup: artifactOptions.backup,
    archive: artifactOptions.archive,
    operation: {
      name: artifactOptions.operationName ?? 'repair',
      status: 'succeeded',
      startedAt,
      finishedAt: new Date().toISOString(),
    },
    allowOverwriteInvalidArtifact: true,
  });

  const finalArtifact = refreshLifecycleArtifact(root, {
    status: artifactOptions.status,
    operation: {
      name: artifactOptions.operationName ?? 'repair',
      status: 'succeeded',
      startedAt,
      finishedAt: new Date().toISOString(),
    },
    allowOverwriteInvalidArtifact: true,
  });

  return createLifecycleSnapshotFromArtifact(root, finalArtifact ?? firstArtifact, finalArtifact?.issues ?? firstArtifact.issues);
}

async function runStatus(options: LifecycleCommandOptions): Promise<void> {
  const snapshot = buildLifecycleSnapshot(projectRoot());
  let reportPath: string | null = null;
  if (options.report) {
    reportPath = writeLifecycleReportFile(projectRoot(), snapshot, options.report);
  }

  if (options.json) {
    console.log(JSON.stringify(exportLifecycleReport(snapshot), null, 2));
    if (reportPath) {
      console.log(chalk.gray(`Report written to ${reportPath}`));
    }
    return;
  }

  printSnapshot(snapshot);

  if (reportPath) {
    console.log(chalk.gray(`\nReport written to ${reportPath}`));
  }
}

async function runRepair(options: LifecycleCommandOptions, promptApi: InteractivePrompt | null): Promise<void> {
  const snapshot = buildLifecycleSnapshot(projectRoot());
  const fixes = await chooseFixes(snapshot, options, promptApi);

  if (fixes.length === 0) {
    if (!options.json) {
      console.log(chalk.gray('No safe fixes are available. Use augx lifecycle report for details.'));
    }
    return;
  }

  if (options.dryRun) {
    console.log(chalk.blue('\nDry run repair plan\n'));
    for (const fix of fixes) {
      console.log(chalk.gray(`  - ${fix}`));
    }
    return;
  }

  const backup = createLifecycleBackup(projectRoot(), 'lifecycle repair');
  let archive: LifecycleArchive | undefined;

  for (const fix of fixes) {
    const createdArchive = await applyRepairFix(fix, snapshot, options);
    if (createdArchive) {
      archive = createdArchive;
    }
  }

  const updatedSnapshot = finalizeLifecycleSnapshot(snapshot, {
    backup,
    archive,
    operationName: 'repair',
  });

  if (options.json) {
    console.log(JSON.stringify(exportLifecycleReport(updatedSnapshot), null, 2));
    return;
  }

  console.log(chalk.green('\nRepair complete.\n'));
  printSnapshot(updatedSnapshot);
}

async function runRollback(options: LifecycleCommandOptions): Promise<void> {
  const snapshot = buildLifecycleSnapshot(projectRoot());
  const backup = getLatestLifecycleBackup(projectRoot());

  if (!backup) {
    console.log(chalk.yellow('No rollback backup is available.'));
    return;
  }

  if (options.dryRun) {
    console.log(chalk.blue('\nRollback plan\n'));
    console.log(chalk.gray(`  Backup: ${backup.id}`));
    console.log(chalk.gray(`  Path: ${backup.path}`));
    return;
  }

  const promptApi = options.force ? null : await getInteractivePrompt();
  if (!options.force && !promptApi) {
    console.log(chalk.yellow('Rollback requires an interactive confirmation or --force.'));
    return;
  }

  if (promptApi) {
    const { confirm } = await promptApi.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Restore backup ${backup.id}?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Rollback cancelled.'));
      return;
    }
  }

  const preRollbackBackup = createLifecycleBackup(projectRoot(), 'rollback preflight');
  restoreLifecycleBackup(projectRoot(), backup);

  const updatedSnapshot = finalizeLifecycleSnapshot(snapshot, {
    backup: preRollbackBackup,
    operationName: 'rollback',
  });

  if (options.json) {
    console.log(JSON.stringify(exportLifecycleReport(updatedSnapshot), null, 2));
    return;
  }

  console.log(chalk.green('\nRollback complete.\n'));
  printSnapshot(updatedSnapshot);
}

async function runReport(options: LifecycleCommandOptions): Promise<void> {
  const snapshot = buildLifecycleSnapshot(projectRoot());
  const report = exportLifecycleReport(snapshot);
  const reportPath = writeLifecycleReportFile(projectRoot(), snapshot, options.report);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(chalk.green(`Lifecycle report written to ${reportPath}`));
  printSnapshot(snapshot);
}

async function runUninstall(options: LifecycleCommandOptions, promptApi: InteractivePrompt | null): Promise<void> {
  const snapshot = buildLifecycleSnapshot(projectRoot());

  if (options.dryRun) {
    console.log(chalk.blue('\nUninstall plan\n'));
    printSnapshot(snapshot);
    console.log(chalk.gray('  Preserved: .augment/, backups, archives, user content'));
    return;
  }

  if (!options.force && !promptApi) {
    console.log(chalk.yellow('Uninstall requires an interactive confirmation or --force.'));
    return;
  }

  if (!options.force && promptApi) {
    const { confirm } = await promptApi.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Remove linked modules and preserve project data?',
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Uninstall cancelled.'));
      return;
    }

    if (options.removeData) {
      const { remove } = await promptApi.prompt([
        {
          type: 'confirm',
          name: 'remove',
          message: 'Also remove the ai-prompts directory after archiving it?',
          default: false,
        },
      ]);

      if (!remove) {
        options.removeData = false;
      }
    }
  }

  const preflightBackup = createLifecycleBackup(projectRoot(), 'uninstall preflight');
  let archive: LifecycleArchive | undefined;
  const promptsDir = path.join(projectRoot(), 'ai-prompts');
  if (fs.existsSync(promptsDir)) {
    archive = createAiPromptsArchive(projectRoot(), 'uninstall');
  }

  await selfRemoveCommand({ force: true });

  if (options.removeData && fs.existsSync(promptsDir)) {
    fs.rmSync(promptsDir, { recursive: true, force: true });
  }

  const updatedSnapshot = finalizeLifecycleSnapshot(snapshot, {
    backup: preflightBackup,
    archive,
    status: 'uninstallation-completed',
    operationName: 'self-remove',
  });

  if (options.json) {
    console.log(JSON.stringify(exportLifecycleReport(updatedSnapshot), null, 2));
    return;
  }

  console.log(chalk.green('\nUninstall complete.\n'));
  printSnapshot(updatedSnapshot);
}

async function runInteractiveMenu(options: LifecycleCommandOptions): Promise<void> {
  const promptApi = await getInteractivePrompt();
  if (!promptApi) {
    await runStatus(options);
    return;
  }

  const { action } = await promptApi.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Status', value: 'status' },
        { name: 'Repair', value: 'repair' },
        { name: 'Rollback', value: 'rollback' },
        { name: 'Report', value: 'report' },
        { name: 'Uninstall', value: 'uninstall' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  if (action === 'exit') {
    return;
  }

  await lifecycleCommand(action, options, promptApi);
}

export async function lifecycleCommand(
  action: string | undefined,
  options: LifecycleCommandOptions = {},
  promptApi?: InteractivePrompt | null
): Promise<void> {
  const loadedPrompt = promptApi ?? (options.force ? null : await getInteractivePrompt());

  switch ((action || 'interactive').toLowerCase()) {
    case 'interactive':
      await runInteractiveMenu(options);
      return;
    case 'status':
    case 'diagnose':
      await runStatus(options);
      return;
    case 'repair':
    case 'reinstall':
    case 'install':
      await runRepair(options, loadedPrompt);
      return;
    case 'rollback':
      await runRollback(options);
      return;
    case 'report':
      await runReport(options);
      return;
    case 'uninstall':
      await runUninstall(options, loadedPrompt);
      return;
    default:
      console.log(chalk.yellow(`Unknown lifecycle action: ${action}`));
      await runStatus(options);
      return;
  }
}
