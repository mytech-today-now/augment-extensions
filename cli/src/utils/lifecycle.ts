import * as fs from 'fs';
import * as path from 'path';
import semver from 'semver';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync, rmSync, realpathSync, lstatSync } from 'fs';
import { createHash } from 'crypto';
import { discoverModules, compareSemanticVersions, findModule } from './module-system';
import { loadExtensionsConfig, type ExtensionsConfig, type LinkedModuleRecord } from './extensions-config';
import {
  type LifecycleArchive,
  type LifecycleArtifact,
  type LifecycleBackup,
  type LifecycleBackupFile,
  type LifecycleFixId,
  type LifecycleIssue,
  type LifecycleOperation,
  type LifecycleOperationName,
  type LifecycleOperationStatus,
  type LifecycleSeverity,
  type LifecycleSnapshot,
  type LifecycleStatus,
} from '../types/lifecycle';
import { checksumFile, createZipArchiveFromDirectory, extractZipArchiveSafely } from './zip-archive';

const LIFECYCLE_SCHEMA_VERSION = 1;
const LIFECYCLE_ROOT_DIR = 'lifecycle';
const LIFECYCLE_BACKUP_DIR = 'backups';
const LIFECYCLE_ARCHIVE_DIR = 'archives';
const LIFECYCLE_REPORT_DIR = 'reports';
const LIFECYCLE_ARTIFACT_FILE = 'lifecycle.json';
const AI_PROMPTS_DIR = 'ai-prompts';
const COMMAND_HELP_PATH = path.join('.augment', 'COMMAND_HELP.md');
const AUGMENT_RULES_DIR = path.join('.augment', 'rules');
const AUGMENT_CONFIG_PATH = path.join('.augment', 'extensions.json');
const VERSION_FILE_PATH = path.join('package.json');
const LIFECYCLE_APPLICATION_NAME = 'augment-extensions';
const LIFECYCLE_STATUS_VALUES: LifecycleStatus[] = [
  'not-installed',
  'installation-detected',
  'installation-in-progress',
  'installation-completed',
  'installation-partially-completed',
  'installation-failed',
  'upgrade-available',
  'upgrade-in-progress',
  'rollback-available',
  'rollback-in-progress',
  'uninstallation-pending-confirmation',
  'uninstallation-in-progress',
  'uninstallation-partially-completed',
  'uninstallation-completed',
  'diagnostic-analysis-in-progress',
  'repair-available',
  'repair-in-progress',
  'recovery-required',
];
const LIFECYCLE_OPERATION_NAME_VALUES: LifecycleOperationName[] = [
  'init',
  'update',
  'upgrade',
  'migrate',
  'self-remove',
  'repair',
  'rollback',
  'diagnose',
  'report',
];
const LIFECYCLE_OPERATION_STATUS_VALUES: LifecycleOperationStatus[] = [
  'running',
  'succeeded',
  'failed',
];

export interface LifecycleArtifactInspection {
  exists: boolean;
  valid: boolean;
  artifact: LifecycleArtifact | null;
  issues: LifecycleIssue[];
  artifactPath: string;
  error?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function readPackageVersion(): string {
  const packagePath = path.join(__dirname, '../../../package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  return typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';
}

function lifecycleRoot(projectRoot: string): string {
  return path.join(projectRoot, '.augment', LIFECYCLE_ROOT_DIR);
}

export function getLifecycleArtifactPath(projectRoot: string): string {
  return path.join(projectRoot, '.augment', LIFECYCLE_ARTIFACT_FILE);
}

export function getLifecycleBackupRoot(projectRoot: string): string {
  return path.join(lifecycleRoot(projectRoot), LIFECYCLE_BACKUP_DIR);
}

export function getLifecycleArchiveRoot(projectRoot: string): string {
  return path.join(lifecycleRoot(projectRoot), LIFECYCLE_ARCHIVE_DIR);
}

export function getLifecycleReportRoot(projectRoot: string): string {
  return path.join(lifecycleRoot(projectRoot), LIFECYCLE_REPORT_DIR);
}

function ensureLifecycleDirectories(projectRoot: string): void {
  mkdirSync(path.join(projectRoot, '.augment'), { recursive: true });
  mkdirSync(lifecycleRoot(projectRoot), { recursive: true });
  mkdirSync(getLifecycleBackupRoot(projectRoot), { recursive: true });
  mkdirSync(getLifecycleArchiveRoot(projectRoot), { recursive: true });
  mkdirSync(getLifecycleReportRoot(projectRoot), { recursive: true });
}

function stableClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function safeReadJson(filePath: string): any | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJsonAtomic(filePath: string, data: unknown): void {
  const tempPath = `${filePath}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  renameSync(tempPath, filePath);
}

function normalizeLinkedModuleRecord(entry: unknown): LinkedModuleRecord {
  if (typeof entry === 'string') {
    return { name: entry, version: '0.0.0' };
  }

  const objectEntry = (entry ?? {}) as Record<string, unknown>;
  const name = typeof objectEntry.name === 'string'
    ? objectEntry.name
    : typeof objectEntry.id === 'string'
      ? objectEntry.id
      : '(unknown)';
  const version = typeof objectEntry.version === 'string' ? objectEntry.version : '0.0.0';

  return {
    ...objectEntry,
    name,
    version,
  } as LinkedModuleRecord;
}

function snapshotExtensionsConfig(projectRoot: string, fallback?: LifecycleArtifact): LifecycleArtifact['extensionsConfig'] {
  const loaded = loadExtensionsConfig(projectRoot);
  if (loaded.exists && loaded.valid) {
    return stableClone({
      ...loaded.config,
      modules: Array.isArray(loaded.config.modules)
        ? loaded.config.modules.map((entry) => normalizeLinkedModuleRecord(entry))
        : []
    });
  }

  if (fallback) {
    return stableClone(fallback.extensionsConfig);
  }

  return { modules: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLifecycleStatusValue(value: unknown): value is LifecycleStatus {
  return typeof value === 'string' && LIFECYCLE_STATUS_VALUES.includes(value as LifecycleStatus);
}

function isLifecycleOperationNameValue(value: unknown): value is LifecycleOperationName {
  return typeof value === 'string' && LIFECYCLE_OPERATION_NAME_VALUES.includes(value as LifecycleOperationName);
}

function isLifecycleOperationStatusValue(value: unknown): value is LifecycleOperationStatus {
  return typeof value === 'string' && LIFECYCLE_OPERATION_STATUS_VALUES.includes(value as LifecycleOperationStatus);
}

function hasLifecycleValidationIssue(issues: LifecycleIssue[]): boolean {
  return issues.some((issue) => issue.id.startsWith('lifecycle-artifact-'));
}

function validateLifecycleArtifactData(
  artifactPath: string,
  parsed: unknown
): { artifact: LifecycleArtifact | null; issues: LifecycleIssue[] } {
  const issues: LifecycleIssue[] = [];

  if (!isRecord(parsed)) {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact is corrupted',
        'The lifecycle artifact could not be parsed as a JSON object.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will replace the corrupted copy after confirmation.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`]
      )
    );
    return { artifact: null, issues };
  }

  const schemaVersion = parsed.schemaVersion;
  if (schemaVersion !== LIFECYCLE_SCHEMA_VERSION) {
    issues.push(
      buildIssue(
        'lifecycle-artifact-unsupported-schema',
        'critical',
        'Lifecycle artifact schema is unsupported',
        typeof schemaVersion === 'number'
          ? `The lifecycle artifact uses schema version ${schemaVersion}, but this CLI supports ${LIFECYCLE_SCHEMA_VERSION}.`
          : 'The lifecycle artifact is missing a supported schema version.',
        artifactPath,
        true,
        'Export a diagnostic report, then regenerate the artifact with the current CLI.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A new artifact will be generated using the supported schema.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`, `Observed schema version: ${String(schemaVersion)}`]
      )
    );
  }

  const application = parsed.application;
  if (!isRecord(application) || typeof application.name !== 'string' || typeof application.version !== 'string') {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact metadata is incomplete',
        'The lifecycle artifact is missing application metadata.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will replace the incomplete copy after confirmation.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`]
      )
    );
  } else if (application.name !== LIFECYCLE_APPLICATION_NAME) {
    issues.push(
      buildIssue(
        'lifecycle-artifact-wrong-identity',
        'critical',
        'Lifecycle artifact belongs to a different application',
        `The artifact application name is ${application.name}, not ${LIFECYCLE_APPLICATION_NAME}.`,
        artifactPath,
        true,
        'Review the diagnostic report and refresh the artifact only if this project owns the file.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'The artifact will be rebuilt for this project after confirmation.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`, `Observed application name: ${application.name}`]
      )
    );
  }

  if (typeof parsed.projectRoot !== 'string') {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact is missing the project root',
        'The lifecycle artifact does not record the project root path.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will include the missing project root.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`]
      )
    );
  } else {
    const resolvedProjectRoot = path.resolve(parsed.projectRoot);
    const currentProjectRoot = path.resolve(path.dirname(artifactPath), '..');
    if (resolvedProjectRoot !== currentProjectRoot) {
      issues.push(
        buildIssue(
          'artifact-project-mismatch',
          'warning',
          'Lifecycle artifact was created for a different project root',
          `The artifact records ${resolvedProjectRoot}, but the current project root is ${currentProjectRoot}.`,
          artifactPath,
          false,
          'Review the report before using the artifact for restoration.',
          'medium',
          true,
          ['read lifecycle artifact'],
          false,
          'The diagnostic report will keep the mismatch visible for review.',
          'refresh-artifact',
          [`Artifact project root: ${resolvedProjectRoot}`, `Current project root: ${currentProjectRoot}`]
        )
      );
    }
  }

  if (!isLifecycleStatusValue(parsed.status)) {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact status is invalid',
        'The lifecycle artifact records an unknown status value.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will contain a supported status.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`, `Observed status: ${String(parsed.status)}`]
      )
    );
  }

  const lastOperation = parsed.lastOperation;
  if (!isRecord(lastOperation) || !isLifecycleOperationNameValue(lastOperation.name) || !isLifecycleOperationStatusValue(lastOperation.status) || typeof lastOperation.startedAt !== 'string') {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact operation history is incomplete',
        'The lifecycle artifact is missing a valid last operation record.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will include a valid last operation record.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`]
      )
    );
  }

  if (!isRecord(parsed.extensionsConfig) || !Array.isArray(parsed.extensionsConfig.modules)) {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact configuration snapshot is incomplete',
        'The lifecycle artifact is missing the captured extensions configuration.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will include a captured configuration snapshot.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`]
      )
    );
  }

  if (!Array.isArray(parsed.backups) || !Array.isArray(parsed.archives) || !Array.isArray(parsed.issues)) {
    issues.push(
      buildIssue(
        'lifecycle-artifact-corrupted',
        'critical',
        'Lifecycle artifact collections are incomplete',
        'The lifecycle artifact is missing one or more collection fields.',
        artifactPath,
        true,
        'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
        'high',
        true,
        ['read lifecycle artifact'],
        true,
        'A repaired lifecycle artifact will include complete collection fields.',
        'refresh-artifact',
        [`Checked path: ${artifactPath}`]
      )
    );
  }

  if (issues.some((issue) => issue.severity === 'critical')) {
    return { artifact: null, issues };
  }

  const record = parsed as Record<string, unknown>;
  const currentProjectRoot = path.resolve(path.dirname(artifactPath), '..');
  const applicationRecord = isRecord(record.application) ? record.application : undefined;
  const lastOperationRecord = isRecord(record.lastOperation) ? record.lastOperation : undefined;
  const extensionsConfigRecord = isRecord(record.extensionsConfig) ? record.extensionsConfig : undefined;
  const backupRecords = Array.isArray(record.backups) ? record.backups : [];
  const archiveRecords = Array.isArray(record.archives) ? record.archives : [];
  const issueRecords = Array.isArray(record.issues) ? record.issues : [];
  const extensionModules =
    extensionsConfigRecord && Array.isArray(extensionsConfigRecord.modules)
      ? (extensionsConfigRecord.modules as unknown[])
      : [];

  const artifact = {
    ...record,
    schemaVersion: LIFECYCLE_SCHEMA_VERSION,
    application: {
      name: applicationRecord && typeof applicationRecord.name === 'string' ? applicationRecord.name : LIFECYCLE_APPLICATION_NAME,
      version: applicationRecord && typeof applicationRecord.version === 'string' ? applicationRecord.version : readPackageVersion(),
    },
    projectRoot: typeof record.projectRoot === 'string' ? path.resolve(record.projectRoot) : currentProjectRoot,
    status: isLifecycleStatusValue(record.status) ? record.status : 'recovery-required',
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : nowIso(),
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : nowIso(),
    lastOperation: {
      name: lastOperationRecord && isLifecycleOperationNameValue(lastOperationRecord.name) ? lastOperationRecord.name : 'diagnose',
      status: lastOperationRecord && isLifecycleOperationStatusValue(lastOperationRecord.status) ? lastOperationRecord.status : 'failed',
      startedAt: lastOperationRecord && typeof lastOperationRecord.startedAt === 'string' ? lastOperationRecord.startedAt : nowIso(),
      finishedAt: lastOperationRecord && typeof lastOperationRecord.finishedAt === 'string' ? lastOperationRecord.finishedAt : undefined,
      error: lastOperationRecord && typeof lastOperationRecord.error === 'string' ? lastOperationRecord.error : undefined,
    },
    extensionsConfig: {
      ...(extensionsConfigRecord ?? {}),
      modules: extensionModules.map((entry: unknown) => normalizeLinkedModuleRecord(entry)),
    },
    backups: backupRecords as LifecycleBackup[],
    archives: archiveRecords as LifecycleArchive[],
    issues: issueRecords as LifecycleIssue[],
    notes: isStringArray(record.notes) ? record.notes : undefined,
  } as LifecycleArtifact;

  return { artifact, issues };
}

export function inspectLifecycleArtifact(projectRoot: string): LifecycleArtifactInspection {
  const artifactPath = getLifecycleArtifactPath(projectRoot);
  if (!existsSync(artifactPath)) {
    return {
      exists: false,
      valid: true,
      artifact: null,
      issues: [],
      artifactPath,
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(artifactPath, 'utf-8'));
    const validation = validateLifecycleArtifactData(artifactPath, parsed);
    const hasFatalValidationIssue = validation.issues.some((issue) => issue.severity === 'critical');

    return {
      exists: true,
      valid: !hasFatalValidationIssue && validation.artifact !== null,
      artifact: validation.artifact,
      issues: validation.issues,
      artifactPath,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      exists: true,
      valid: false,
      artifact: null,
      artifactPath,
      error: message,
      issues: [
        buildIssue(
          'lifecycle-artifact-corrupted',
          'critical',
          'Lifecycle artifact is corrupted',
          'The lifecycle artifact could not be parsed as JSON.',
          artifactPath,
          true,
          'Export a diagnostic report, then rebuild the artifact from a verified installation or backup.',
          'high',
          true,
          ['read lifecycle artifact'],
          true,
          'A repaired lifecycle artifact will replace the corrupted copy after confirmation.',
          'refresh-artifact',
          [`Checked path: ${artifactPath}`, `Parse error: ${message}`]
        ),
      ],
    };
  }
}

function buildIssue(
  id: string,
  severity: LifecycleSeverity,
  title: string,
  message: string,
  pathLabel: string | undefined,
  blocksLifecycle: boolean,
  recommendedSolution: string,
  riskLevel: 'low' | 'medium' | 'high',
  reversible: boolean,
  requiredPermissions: string[],
  confirmationRequired: boolean,
  expectedResult: string,
  safeFix?: LifecycleFixId,
  evidence: string[] = []
): LifecycleIssue {
  return {
    id,
    severity,
    title,
    message,
    evidence,
    path: pathLabel,
    blocksLifecycle,
    recommendedSolution,
    riskLevel,
    reversible,
    requiredPermissions,
    confirmationRequired,
    expectedResult,
    safeFix,
  };
}

function getLatestBackup(projectRoot: string): LifecycleBackup | null {
  const root = getLifecycleBackupRoot(projectRoot);
  if (!existsSync(root)) {
    return null;
  }

  const backupDirs = fs.readdirSync(root, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(root, dirent.name))
    .sort((a, b) => b.localeCompare(a));

  for (const backupPath of backupDirs) {
    const manifestPath = path.join(backupPath, 'manifest.json');
    const manifest = safeReadJson(manifestPath);
    if (manifest && typeof manifest.id === 'string') {
      return manifest as LifecycleBackup;
    }
  }

  return null;
}

function moduleUpgradeIssues(projectRoot: string, artifact: LifecycleArtifact | null): LifecycleIssue[] {
  const loaded = loadExtensionsConfig(projectRoot);
  if (!loaded.exists || !loaded.valid) {
    return [];
  }

  const issues: LifecycleIssue[] = [];
  const modules = Array.isArray(loaded.config.modules) ? loaded.config.modules : [];
  for (const moduleEntry of modules) {
    const normalized = normalizeLinkedModuleRecord(moduleEntry);
    const found = findModule(normalized.name);

    if (!found) {
      issues.push(
        buildIssue(
          `linked-module-missing:${normalized.name}`,
          'warning',
          `Linked module missing from repository: ${normalized.name}`,
          `The linked module ${normalized.name} no longer resolves in this checkout.`,
          normalized.name,
          false,
          'Re-link the module or remove the stale record from .augment/extensions.json.',
          'medium',
          true,
          ['read module tree'],
          true,
          'The stale record will be replaced or removed.',
          'refresh-artifact',
          [`Linked module snapshot version: ${normalized.version}`]
        )
      );
      continue;
    }

    const currentVersion = found.metadata.version;
    try {
      if (compareSemanticVersions(currentVersion, normalized.version) > 0) {
        issues.push(
          buildIssue(
            `module-upgrade-available:${normalized.name}`,
            'info',
            `Module upgrade available: ${normalized.name}`,
            `The repository now ships ${currentVersion}, which is newer than the linked version ${normalized.version}.`,
            normalized.name,
            false,
            `Run augx upgrade ${normalized.name} or augx update to refresh the linked module record.`,
            'low',
            true,
            ['read module tree', 'write .augment/extensions.json'],
            false,
            'The linked module record will match the latest local module version.',
            'refresh-artifact',
            [`Linked version: ${normalized.version}`, `Repository version: ${currentVersion}`]
          )
        );
      }
    } catch {
      continue;
    }
  }

  if (artifact && semver.valid(artifact.application.version) && semver.valid(readPackageVersion())) {
    const currentAppVersion = readPackageVersion();
    if (semver.gt(currentAppVersion, artifact.application.version)) {
      issues.push(
        buildIssue(
          'application-upgrade-available',
          'info',
          'Application upgrade available',
          `The stored lifecycle artifact records ${artifact.application.version}, but the current package is ${currentAppVersion}.`,
          getLifecycleArtifactPath(projectRoot),
          false,
          'Run the CLI upgrade path for the package, then refresh the lifecycle artifact.',
          'low',
          true,
          ['read package metadata'],
          false,
          'The lifecycle artifact will reflect the current package version.',
          'refresh-artifact',
          [`Stored application version: ${artifact.application.version}`, `Current application version: ${currentAppVersion}`]
        )
      );
    }
  }

  return issues;
}

function detectCoreIssues(
  projectRoot: string,
  artifact: LifecycleArtifact | null,
  artifactKnownPresent: boolean = Boolean(artifact)
): LifecycleIssue[] {
  const issues: LifecycleIssue[] = [];
  const configPath = path.join(projectRoot, AUGMENT_CONFIG_PATH);
  const config = loadExtensionsConfig(projectRoot);

  if (!config.exists) {
    issues.push(
      buildIssue(
        'missing-installation',
        'critical',
        'Augment Extensions is not installed',
        'No .augment/extensions.json file was found in this project.',
        AUGMENT_CONFIG_PATH,
        true,
        'Run augx init to create the project installation, or restore a retained lifecycle artifact.',
        'high',
        true,
        ['write .augment'],
        false,
        'A new .augment/extensions.json file will be created.',
        'recreate-config',
        [`Checked path: ${configPath}`]
      )
    );
    return issues;
  }

  if (!config.valid) {
    issues.push(
      buildIssue(
        'invalid-installation-config',
        'critical',
        'The installation configuration is invalid',
        config.error || 'The .augment/extensions.json file could not be parsed.',
        AUGMENT_CONFIG_PATH,
        true,
        'Restore the last backup or recreate the installation configuration from the lifecycle artifact.',
        'high',
        true,
        ['write .augment'],
        true,
        'A valid .augment/extensions.json file will replace the invalid one.',
        'restore-backup',
        [`Checked path: ${configPath}`]
      )
    );
    return issues;
  }

  const modules = Array.isArray(config.config.modules) ? config.config.modules.map(normalizeLinkedModuleRecord) : [];
  if (modules.length === 0 && !artifactKnownPresent) {
    issues.push(
      buildIssue(
        'installation-detected',
        'info',
        'Installation detected',
        'The project has a valid .augment/extensions.json file, but no lifecycle artifact has been written yet.',
        AUGMENT_CONFIG_PATH,
        false,
        'Run augx lifecycle status or augx lifecycle repair to create the canonical lifecycle artifact.',
        'low',
        true,
        ['write .augment'],
        false,
        'The lifecycle artifact will be created and the installation will be tracked.',
        'refresh-artifact',
        ['A valid configuration file exists, but no lifecycle artifact is present.']
      )
    );
  }

  const characterCountRule = path.join(projectRoot, AUGMENT_RULES_DIR, 'character-count-management.md');
  if (!existsSync(characterCountRule)) {
    issues.push(
      buildIssue(
        'missing-core-rule-character-count',
        'high',
        'Character count rule is missing',
        'The canonical .augment/rules/character-count-management.md file is absent.',
        path.join(AUGMENT_RULES_DIR, 'character-count-management.md'),
        false,
        'Run augx lifecycle repair to reinstall the core rule set.',
        'medium',
        true,
        ['write .augment/rules'],
        false,
        'The character count rule will be restored.',
        'reinstall-core-rules',
        [`Checked path: ${characterCountRule}`]
      )
    );
  }

  const emDashRule = path.join(projectRoot, AUGMENT_RULES_DIR, 'no-em-dash.md');
  if (!existsSync(emDashRule)) {
    issues.push(
      buildIssue(
        'missing-core-rule-em-dash',
        'high',
        'No-em-dash rule is missing',
        'The canonical .augment/rules/no-em-dash.md file is absent.',
        path.join(AUGMENT_RULES_DIR, 'no-em-dash.md'),
        false,
        'Run augx lifecycle repair to reinstall the core rule set.',
        'medium',
        true,
        ['write .augment/rules'],
        false,
        'The no-em-dash rule will be restored.',
        'reinstall-core-rules',
        [`Checked path: ${emDashRule}`]
      )
    );
  }

  const commandHelp = path.join(projectRoot, COMMAND_HELP_PATH);
  if (!existsSync(commandHelp)) {
    issues.push(
      buildIssue(
        'missing-command-help',
        'warning',
        'Command help reference is missing',
        'The .augment/COMMAND_HELP.md file has not been generated.',
        COMMAND_HELP_PATH,
        false,
        'Run augx lifecycle repair to regenerate command help.',
        'low',
        true,
        ['write .augment'],
        false,
        'The command help reference will be regenerated.',
        'rebuild-command-help',
        [`Checked path: ${commandHelp}`]
      )
    );
  }

  const promptsDir = path.join(projectRoot, AI_PROMPTS_DIR);
  if (!existsSync(promptsDir)) {
    issues.push(
      buildIssue(
        'missing-ai-prompts-directory',
        'warning',
        'ai-prompts directory is missing',
        'The ai-prompts source directory could not be found in the project root.',
        AI_PROMPTS_DIR,
        false,
        'Restore the directory from the repository or re-clone the checkout before continuing.',
        'medium',
        true,
        ['read repository files'],
        false,
        'The ai-prompts directory will be available again.',
        artifact?.archives.length ? 'restore-ai-prompts-directory' : undefined,
        [`Checked path: ${promptsDir}`]
      )
    );
  } else if ((artifact?.archives ?? []).length === 0) {
    issues.push(
      buildIssue(
        'missing-ai-prompts-archive',
        'info',
        'ai-prompts archive is missing',
        'The lifecycle artifact does not yet retain a ZIP archive of the ai-prompts directory.',
        AI_PROMPTS_DIR,
        false,
        'Run augx lifecycle repair to archive ai-prompts safely.',
        'low',
        true,
        ['write .augment/lifecycle'],
        false,
        'A ZIP archive of ai-prompts will be retained in the lifecycle artifact.',
        'rebuild-ai-prompts-archive',
        [`Checked path: ${promptsDir}`]
      )
    );
  }

  const backup = getLatestBackup(projectRoot);
  if (backup) {
    issues.push(
      buildIssue(
        'rollback-available',
        'info',
        'Rollback is available',
        `A backup exists at ${path.relative(projectRoot, backup.path)}`,
        path.relative(projectRoot, backup.path),
        false,
        'Run augx lifecycle rollback to restore the retained backup if the current state is not correct.',
        'low',
        true,
        ['read backup files', 'write .augment'],
        true,
        'The last known good installation state will be restored.',
        'restore-backup',
        [`Backup id: ${backup.id}`, `Backup reason: ${backup.reason}`]
      )
    );
  }

  const artifactIssues = artifact?.issues ?? [];
  for (const issue of artifactIssues) {
    if (issue.severity === 'critical' || issue.severity === 'high') {
      issues.push(issue);
    }
  }

  issues.push(...moduleUpgradeIssues(projectRoot, artifact));

  return issues;
}

function deriveLifecycleStatus(
  projectRoot: string,
  artifact: LifecycleArtifact | null,
  issues: LifecycleIssue[]
): LifecycleStatus {
  if (hasLifecycleValidationIssue(issues)) {
    return 'recovery-required';
  }

  if (!artifact) {
    const config = loadExtensionsConfig(projectRoot);
    if (!config.exists) {
      return 'not-installed';
    }
    if (!config.valid) {
      return 'installation-failed';
    }
    return 'installation-detected';
  }

  if (artifact.lastOperation.status === 'running') {
    switch (artifact.lastOperation.name) {
      case 'init':
        return 'installation-in-progress';
      case 'upgrade':
      case 'update':
        return 'upgrade-in-progress';
      case 'rollback':
        return 'rollback-in-progress';
      case 'self-remove':
        return 'uninstallation-in-progress';
      case 'repair':
        return 'repair-in-progress';
      case 'diagnose':
        return 'diagnostic-analysis-in-progress';
      default:
        return 'diagnostic-analysis-in-progress';
    }
  }

  if (artifact.lastOperation.status === 'failed') {
    if (artifact.lastOperation.name === 'self-remove') {
      return 'uninstallation-partially-completed';
    }
    if (artifact.lastOperation.name === 'rollback') {
      return 'recovery-required';
    }
    return 'recovery-required';
  }

  if (!existsSync(path.join(projectRoot, AUGMENT_CONFIG_PATH))) {
    if (artifact.backups.length > 0) {
      return 'rollback-available';
    }
    return 'recovery-required';
  }

  const config = loadExtensionsConfig(projectRoot);
  if (!config.valid) {
    return 'installation-failed';
  }

  const missingCoreFiles = issues.some((issue) =>
    issue.safeFix === 'reinstall-core-rules' || issue.safeFix === 'rebuild-command-help'
  );
  if (missingCoreFiles) {
    return 'installation-partially-completed';
  }

  if (issues.some((issue) => issue.id === 'rollback-available')) {
    return 'rollback-available';
  }

  if (issues.some((issue) => issue.id === 'application-upgrade-available' || issue.id.startsWith('module-upgrade-available'))) {
    return 'upgrade-available';
  }

  if (artifact.status === 'uninstallation-pending-confirmation') {
    return 'uninstallation-pending-confirmation';
  }

  if (artifact.status === 'uninstallation-completed') {
    return 'uninstallation-completed';
  }

  return 'installation-completed';
}

function createDefaultOperation(name: LifecycleOperationName): LifecycleOperation {
  return {
    name,
    status: 'running',
    startedAt: nowIso(),
  };
}

function mergeOperations(
  existing: LifecycleOperation | undefined,
  override?: Partial<LifecycleOperation>
): LifecycleOperation {
  if (!existing) {
    return {
      name: override?.name ?? 'diagnose',
      status: override?.status ?? 'running',
      startedAt: override?.startedAt ?? nowIso(),
      finishedAt: override?.finishedAt,
      error: override?.error,
    };
  }

  return {
    ...existing,
    ...override,
  };
}

export function loadLifecycleArtifact(projectRoot: string): LifecycleArtifact | null {
  const inspection = inspectLifecycleArtifact(projectRoot);
  return inspection.valid ? inspection.artifact : null;
}

export function writeLifecycleArtifact(
  projectRoot: string,
  artifact: LifecycleArtifact,
  options: { allowOverwriteInvalidArtifact?: boolean } = {}
): LifecycleArtifact {
  ensureLifecycleDirectories(projectRoot);
  const artifactPath = getLifecycleArtifactPath(projectRoot);
  if (existsSync(artifactPath) && !options.allowOverwriteInvalidArtifact) {
    const inspection = inspectLifecycleArtifact(projectRoot);
    if (inspection.exists && !inspection.valid) {
      throw new Error(
        `Refusing to overwrite an invalid lifecycle artifact without explicit recovery: ${artifactPath}`
      );
    }
  }
  writeJsonAtomic(artifactPath, artifact);
  return artifact;
}

export function refreshLifecycleArtifact(
  projectRoot: string,
  options: {
    status?: LifecycleStatus;
    operation?: Partial<LifecycleOperation> & { name?: LifecycleOperationName };
    backup?: LifecycleBackup;
    archive?: LifecycleArchive;
    issues?: LifecycleIssue[];
    notes?: string[];
    allowOverwriteInvalidArtifact?: boolean;
  } = {}
): LifecycleArtifact {
  const inspection = inspectLifecycleArtifact(projectRoot);
  if (inspection.exists && !inspection.valid && !options.allowOverwriteInvalidArtifact) {
    throw new Error(
      `Refusing to refresh an invalid lifecycle artifact without explicit recovery: ${inspection.artifactPath}`
    );
  }

  const existing = inspection.valid ? inspection.artifact : null;
  const currentConfig = snapshotExtensionsConfig(projectRoot, existing ?? undefined);
  const currentIssues =
    options.issues ??
    (inspection.exists && !inspection.valid && options.allowOverwriteInvalidArtifact
      ? collectLifecycleIssuesWithoutArtifact(projectRoot)
      : detectLifecycleIssues(projectRoot));
  const currentStatus = options.status ?? deriveLifecycleStatus(projectRoot, existing, currentIssues);
  const operation = mergeOperations(existing?.lastOperation, options.operation);
  const backups = existing?.backups ? [...existing.backups] : [];
  const archives = existing?.archives ? [...existing.archives] : [];

  if (options.backup && !backups.some((item) => item.id === options.backup!.id)) {
    backups.push(options.backup);
  }

  if (options.archive && !archives.some((item) => item.id === options.archive!.id)) {
    archives.push(options.archive);
  }

  const artifact: LifecycleArtifact = {
    schemaVersion: LIFECYCLE_SCHEMA_VERSION,
    application: {
      name: 'augment-extensions',
      version: readPackageVersion(),
    },
    projectRoot: path.resolve(projectRoot),
    status: currentStatus,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
    lastOperation: operation,
    extensionsConfig: currentConfig,
    backups,
    archives,
    issues: currentIssues,
    notes: options.notes,
  };

  return writeLifecycleArtifact(projectRoot, artifact, {
    allowOverwriteInvalidArtifact: options.allowOverwriteInvalidArtifact,
  });
}

export function createLifecycleOperation(name: LifecycleOperationName): LifecycleOperation {
  return createDefaultOperation(name);
}

export function completeLifecycleOperation(
  operation: LifecycleOperation,
  status: LifecycleOperationStatus,
  error?: string
): LifecycleOperation {
  return {
    ...operation,
    status,
    finishedAt: nowIso(),
    error,
  };
}

export function createLifecycleBackup(
  projectRoot: string,
  reason: string
): LifecycleBackup {
  ensureLifecycleDirectories(projectRoot);
  const backupId = nowIso().replace(/[:.]/g, '-');
  const backupDir = path.join(getLifecycleBackupRoot(projectRoot), backupId);
  mkdirSync(backupDir, { recursive: true });

  const files: LifecycleBackupFile[] = [];
  const candidates = [
    AUGMENT_CONFIG_PATH,
    path.join('.augment', LIFECYCLE_ARTIFACT_FILE),
    COMMAND_HELP_PATH,
    path.join('.vscode', 'extensions.json'),
  ];

  for (const relativePath of candidates) {
    const sourcePath = path.join(projectRoot, relativePath);
    if (!existsSync(sourcePath)) {
      continue;
    }

    const targetPath = path.join(backupDir, relativePath);
    mkdirSync(path.dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);
    files.push({
      path: relativePath,
      checksum: checksumFile(targetPath),
      size: fs.statSync(targetPath).size,
    });
  }

  const backup: LifecycleBackup = {
    id: backupId,
    createdAt: nowIso(),
    reason,
    path: backupDir,
    files,
  };

  writeJsonAtomic(path.join(backupDir, 'manifest.json'), backup);
  return backup;
}

export function restoreLifecycleBackup(
  projectRoot: string,
  backup: LifecycleBackup
): LifecycleBackup {
  for (const file of backup.files) {
    const backupFilePath = path.join(backup.path, file.path);
    if (!existsSync(backupFilePath)) {
      throw new Error(`Backup file missing: ${backupFilePath}`);
    }

    if (checksumFile(backupFilePath) !== file.checksum) {
      throw new Error(`Backup checksum mismatch: ${backupFilePath}`);
    }

    const targetPath = path.join(projectRoot, file.path);
    mkdirSync(path.dirname(targetPath), { recursive: true });
    copyFileSync(backupFilePath, targetPath);
  }

  return backup;
}

export function restoreExtensionsConfigFromArtifact(projectRoot: string): LifecycleArtifact | null {
  const inspection = inspectLifecycleArtifact(projectRoot);
  if (!inspection.valid || !inspection.artifact) {
    return null;
  }

  ensureLifecycleDirectories(projectRoot);
  const configPath = path.join(projectRoot, AUGMENT_CONFIG_PATH);
  const config: ExtensionsConfig = {
    ...stableClone(inspection.artifact.extensionsConfig),
    modules: Array.isArray(inspection.artifact.extensionsConfig.modules)
      ? inspection.artifact.extensionsConfig.modules.map((entry) => normalizeLinkedModuleRecord(entry))
      : [],
  };

  mkdirSync(path.dirname(configPath), { recursive: true });
  writeJsonAtomic(configPath, config);
  return refreshLifecycleArtifact(projectRoot, {
    status: 'installation-completed',
    operation: {
      name: 'repair',
      status: 'succeeded',
      startedAt: nowIso(),
      finishedAt: nowIso(),
    },
    notes: ['Restored .augment/extensions.json from the retained lifecycle artifact.'],
  });
}

export function createAiPromptsArchive(
  projectRoot: string,
  reason: string
): LifecycleArchive {
  const promptsDir = path.join(projectRoot, AI_PROMPTS_DIR);
  if (!existsSync(promptsDir)) {
    throw new Error(`Source directory not found: ${promptsDir}`);
  }

  ensureLifecycleDirectories(projectRoot);
  const archiveId = nowIso().replace(/[:.]/g, '-');
  const archivePath = path.join(getLifecycleArchiveRoot(projectRoot), `${archiveId}.zip`);
  const archiveResult = createZipArchiveFromDirectory(promptsDir, archivePath, {
    rootFolder: AI_PROMPTS_DIR,
  });

  return {
    id: archiveId,
    createdAt: nowIso(),
    path: archiveResult.path,
    checksum: archiveResult.checksum,
    source: reason,
  };
}

export async function restoreAiPromptsArchive(
  zipPath: string,
  destinationDir: string
): Promise<{ extracted: number; directories: number }> {
  return extractZipArchiveSafely(zipPath, destinationDir, { force: true });
}

function collectLifecycleIssues(
  projectRoot: string,
  inspection: LifecycleArtifactInspection
): LifecycleIssue[] {
  const issues: LifecycleIssue[] = [...inspection.issues];
  const artifact = inspection.artifact;

  issues.push(...detectCoreIssues(projectRoot, artifact, inspection.exists));

  if (artifact) {
    for (const issue of artifact.issues) {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        issues.push(issue);
      }
    }
  }

  issues.push(...moduleUpgradeIssues(projectRoot, artifact));

  const deduped = new Map<string, LifecycleIssue>();
  for (const issue of issues) {
    if (!deduped.has(issue.id)) {
      deduped.set(issue.id, issue);
    }
  }

  return Array.from(deduped.values());
}

function collectLifecycleIssuesWithoutArtifact(projectRoot: string): LifecycleIssue[] {
  return collectLifecycleIssues(projectRoot, {
    exists: false,
    valid: true,
    artifact: null,
    issues: [],
    artifactPath: getLifecycleArtifactPath(projectRoot),
  });
}

function createDiagnosticArtifact(
  projectRoot: string,
  inspection: LifecycleArtifactInspection,
  status: LifecycleStatus,
  issues: LifecycleIssue[]
): LifecycleArtifact {
  const now = nowIso();
  const artifact = inspection.artifact;

  return {
    schemaVersion: LIFECYCLE_SCHEMA_VERSION,
    application: {
      name: LIFECYCLE_APPLICATION_NAME,
      version: readPackageVersion(),
    },
    projectRoot: path.resolve(projectRoot),
    status,
    createdAt: artifact?.createdAt ?? now,
    updatedAt: now,
    lastOperation: artifact?.lastOperation ?? {
      name: 'diagnose',
      status: 'failed',
      startedAt: now,
      finishedAt: now,
      error: inspection.error ?? 'Lifecycle artifact validation failed.',
    },
    extensionsConfig: artifact?.extensionsConfig ?? snapshotExtensionsConfig(projectRoot),
    backups: artifact?.backups ?? [],
    archives: artifact?.archives ?? [],
    issues,
    notes: artifact?.notes,
  };
}

export function createLifecycleSnapshotFromArtifact(
  projectRoot: string,
  artifact: LifecycleArtifact,
  issues: LifecycleIssue[]
): LifecycleSnapshot {
  const repairableIssues = issues.filter((issue) => Boolean(issue.safeFix));
  const latestBackup = getLatestBackup(projectRoot);
  const status = deriveLifecycleStatus(projectRoot, artifact, issues);

  return {
    status,
    issues,
    repairableIssues,
    backupCount: artifact.backups.length,
    archiveCount: artifact.archives.length,
    installedModuleCount: Array.isArray(artifact.extensionsConfig.modules)
      ? artifact.extensionsConfig.modules.length
      : 0,
    rollbackAvailable: Boolean(latestBackup),
    upgradeAvailable: issues.some((issue) => issue.id === 'application-upgrade-available' || issue.id.startsWith('module-upgrade-available')),
    artifact,
  };
}

export function detectLifecycleIssues(projectRoot: string): LifecycleIssue[] {
  return collectLifecycleIssues(projectRoot, inspectLifecycleArtifact(projectRoot));
}

export function buildLifecycleSnapshot(projectRoot: string): LifecycleSnapshot {
  const inspection = inspectLifecycleArtifact(projectRoot);
  const issues = collectLifecycleIssues(projectRoot, inspection);
  const status = deriveLifecycleStatus(projectRoot, inspection.artifact, issues);

  let artifact: LifecycleArtifact;
  if (inspection.exists && !inspection.valid) {
    artifact = createDiagnosticArtifact(projectRoot, inspection, status, issues);
  } else {
    artifact = refreshLifecycleArtifact(projectRoot, {
      status,
      operation: {
        name: 'diagnose',
        status: 'succeeded',
        startedAt: nowIso(),
        finishedAt: nowIso(),
      },
      issues,
      allowOverwriteInvalidArtifact: true,
    });
  }

  return createLifecycleSnapshotFromArtifact(projectRoot, artifact, issues);
}

export function exportLifecycleReport(snapshot: LifecycleSnapshot): Record<string, unknown> {
  return {
    schemaVersion: LIFECYCLE_SCHEMA_VERSION,
    generatedAt: nowIso(),
    status: snapshot.status,
    installedModuleCount: snapshot.installedModuleCount,
    backupCount: snapshot.backupCount,
    archiveCount: snapshot.archiveCount,
    upgradeAvailable: snapshot.upgradeAvailable,
    rollbackAvailable: snapshot.rollbackAvailable,
    issues: snapshot.issues.map((issue) => ({
      ...issue,
      evidence: issue.evidence.map((value) =>
        value.includes('\\') || value.includes('/') ? '<redacted-path>' : value
      ),
    })),
  };
}

export function writeLifecycleReportFile(
  projectRoot: string,
  snapshot: LifecycleSnapshot,
  outputPath?: string
): string {
  ensureLifecycleDirectories(projectRoot);
  const reportId = nowIso().replace(/[:.]/g, '-');
  const reportPath = outputPath
    ? path.resolve(projectRoot, outputPath)
    : path.join(getLifecycleReportRoot(projectRoot), `${reportId}.json`);
  writeJsonAtomic(reportPath, exportLifecycleReport(snapshot));
  return reportPath;
}

export function listSafeFixes(snapshot: LifecycleSnapshot): LifecycleFixId[] {
  return Array.from(new Set(snapshot.repairableIssues.map((issue) => issue.safeFix).filter(Boolean))) as LifecycleFixId[];
}

export function getLatestLifecycleBackup(projectRoot: string): LifecycleBackup | null {
  return getLatestBackup(projectRoot);
}
