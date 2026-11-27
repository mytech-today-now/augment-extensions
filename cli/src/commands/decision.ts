import { Command } from 'commander';
import { DECISION_OPERATIONS, redactDecisionText, runDecisionOperation, type DecisionOptions } from '../utils/decision-runner';

/** Keep optional SDK loading and its Node requirement outside ordinary Augx startup. */
export function registerDecisionCommands(program: Command): void {
  const group = program.command('decision').description('Install and invoke the optional bounded TypeSafe decision workflow');
  for (const operation of DECISION_OPERATIONS) {
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
        try {
          process.exitCode = await runDecisionOperation(operation, options as unknown as DecisionOptions);
        } catch (error) {
          console.error(redactDecisionText(`Decision workflow: ${error instanceof Error ? error.message : String(error)}`));
          process.exitCode = 2;
        }
      });
  }
}
