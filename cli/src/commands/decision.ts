import { Command } from 'commander';
import { spawn, spawnSync } from 'child_process';
import { join } from 'path';

/** Keep optional SDK loading and its Node requirement outside ordinary Augx startup. */
export function registerDecisionCommands(program: Command): void {
  const group = program.command('decision').description('Install and invoke the optional bounded TypeSafe decision workflow');
  for (const operation of ['setup', 'doctor', 'decide', 'run', 'resume', 'evaluate', 'examples', 'inventory', 'remove']) {
    group.command(operation)
      .description({ setup: 'Plan or install isolated software and official skill', doctor: 'Report installation, configuration and activation separately', decide: 'Evaluate a validated capability input', run: 'Dispatch and consume a local task with independent verification', resume: 'Reconcile an existing run without refunding budgets', evaluate: 'Run labeled matched baseline and dispatcher cases', examples: 'Execute examples for all eleven decision capabilities', inventory: 'Classify an explicit call inventory before adoption', remove: 'Remove only unchanged tracked installation files' }[operation] || operation)
      .option('--project <path>', 'Project-owned installation and workspace scope', process.cwd())
      .option('--dry-run', 'Show setup plan without filesystem writes')
      .option('--portable', 'Provision a separate pinned Node runtime during setup')
      .option('--host <host>', 'Official skill destination: codex or claude-code', 'codex')
      .option('--input <path>', 'JSON capability, task, cases, or inventory file')
      .option('--id <id>', 'Stable run or probe identity')
      .option('--offline', 'Use explicitly identified deterministic fixtures')
      .option('--live', 'Use the configured TypeSafe provider')
      .option('--requests <count>', 'Explicit maximum provider requests including retries')
      .option('--approve <digest>', 'Resume the exact persisted review action by digest')
      .action(async (options: Record<string, unknown>) => {
        const script = join(__dirname, '../../../augment-extensions/workflows/decision-layer/runtime/cli.cjs');
        await new Promise<void>((resolve, reject) => {
          const child = spawn(process.execPath, [script, operation, JSON.stringify(options)], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'], windowsHide: true, shell: false });
          let cancellationTimer: NodeJS.Timeout | undefined;
          const stop = () => {
            if (child.connected) child.send({ type: 'cancel' }, () => {});
            if (!cancellationTimer) cancellationTimer = setTimeout(() => {
              if (process.platform === 'win32' && child.pid) spawnSync(join(process.env.SystemRoot || 'C:\\Windows', 'System32/taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, timeout: 5000, stdio: 'ignore' });
              else child.kill('SIGTERM');
            }, 5000);
          };
          process.on('SIGINT', stop);
          process.on('SIGTERM', stop);
          child.on('error', reject);
          child.on('close', code => { if (cancellationTimer) clearTimeout(cancellationTimer); process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); process.exitCode = code ?? 1; resolve(); });
        });
      });
  }
}
