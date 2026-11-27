import * as fs from 'fs';
import * as path from 'path';
import type { InteractivePrompt } from '../utils/interactive-prompt';
import { DECISION_OPERATIONS, runDecisionOperation, type DecisionOperation, type DecisionOptions } from '../utils/decision-runner';

const execution = new Set(['decide', 'run', 'resume', 'evaluate', 'examples']);
const needsInput = new Set(['decide', 'run', 'evaluate', 'inventory']);
const validId = (value: string) => /^[a-z][a-z0-9_-]{0,63}$/.test(value);

/** Validate prompt combinations before dispatch; the runtime retains schema and policy authority. */
export function validateGuiDecisionOptions(operation: DecisionOperation, options: DecisionOptions): void {
  if (!fs.statSync(options.project).isDirectory()) throw new Error('Project scope must be an existing directory');
  if (operation === 'setup' && !['codex', 'claude-code'].includes(options.host || '')) throw new Error('Select a supported skill host');
  if (needsInput.has(operation)) {
    if (!options.input) throw new Error('A JSON input file is required');
    if (!fs.statSync(options.input).isFile() || fs.statSync(options.input).size > 1048576) throw new Error('Input must be a JSON file of at most 1 MiB');
    const input = fs.readFileSync(options.input, 'utf8').replace(/^\uFEFF/, '');
    try { JSON.parse(input); }
    catch { throw new Error('Input file contains invalid JSON. Fix its syntax before retrying.'); }
  }
  if (execution.has(operation)) {
    if (Boolean(options.offline) === Boolean(options.live)) throw new Error('Select exactly one offline or live mode');
    if (!options.id || !validId(options.id)) throw new Error('Use a run identity starting with a lowercase letter, then up to 63 lowercase letters, digits, underscores or hyphens');
    if (operation === 'evaluate' && options.id.length > 30) throw new Error('Evaluation identity must fit 30 characters');
    const budget = Number(options.requests);
    if (options.live && (!Number.isSafeInteger(budget) || budget < 1)) throw new Error('Live mode requires a positive integer request budget within the configured limit');
    if (options.offline && options.requests !== undefined) throw new Error('Offline fixtures do not take a provider request budget');
  }
  if (options.approve !== undefined && (operation !== 'resume' || !/^[a-f0-9]{64}$/.test(options.approve))) throw new Error('Approval requires the exact 64-character persisted review digest for resume');
}

export async function decisionWorkflowInteractive(
  promptApi: InteractivePrompt,
  project: string,
  execute: typeof runDecisionOperation = runDecisionOperation
): Promise<void> {
  console.log(`\nJev / TypeSafe decision workflow\nProject: ${project}`);
  console.log('Linking workflows/decision-layer loads static guidance. Operational actions below are separate.');
  const { operation: selection } = await promptApi.prompt([{ type: 'list', name: 'operation', message: 'Choose a decision operation:', pageSize: 12, choices: [
    { name: 'Setup plan (read only, no downloads)', value: 'setup-plan' },
    { name: 'Install software (preview plan first)', value: 'setup' },
    { name: 'Doctor (readiness, no provider probe)', value: 'doctor' },
    { name: 'Decide (validated capability input)', value: 'decide' },
    { name: 'Run (bounded local task)', value: 'run' },
    { name: 'Resume (original state and review digest)', value: 'resume' },
    { name: 'Evaluate (labeled cases)', value: 'evaluate' },
    { name: 'Examples (eleven capabilities)', value: 'examples' },
    { name: 'Inventory (classify supplied call inventory)', value: 'inventory' },
    { name: 'Remove owned software (retain edits and run data)', value: 'remove' },
    { name: 'Back', value: 'back' }
  ] }]);
  if (selection === 'back' || !selection) return;
  const operation = selection === 'setup-plan' ? 'setup' : selection;
  if (!DECISION_OPERATIONS.includes(operation)) throw new Error('Unknown decision operation');
  const options: DecisionOptions = { project };
  if (operation === 'setup') {
    const { host } = await promptApi.prompt([{ type: 'list', name: 'host', message: 'Project-local official skill destination:', choices: [
      { name: 'Codex (.agents/skills/typesafe-ai)', value: 'codex' },
      { name: 'Claude Code (.claude/skills/typesafe-ai)', value: 'claude-code' }, { name: 'Cancel', value: 'cancel' }
    ] }]);
    if (host === 'cancel' || !host) return;
    options.host = host;
    const { runtime } = await promptApi.prompt([{ type: 'list', name: 'runtime', message: 'Runtime choice for this project:', choices: [
      { name: 'Reuse compatible Node 22+ with npm, otherwise provision pinned portable Node', value: 'auto' },
      { name: 'Provision pinned portable Node in this project', value: 'portable' }, { name: 'Cancel', value: 'cancel' }
    ] }]);
    if (runtime === 'cancel' || !runtime) return;
    if (!['auto', 'portable'].includes(runtime)) throw new Error('Invalid runtime choice');
    if (runtime === 'portable') options.portable = true;
    validateGuiDecisionOptions(operation, options);
    const planned = await execute(operation, { ...options, dryRun: true });
    if (planned !== 0) { reportDecisionResult('setup plan', planned); return; }
    if (selection === 'setup-plan') { reportDecisionResult('setup plan', planned); return; }
    if (!await confirm(promptApi, `Install the planned pinned software and skill in ${project}? Downloads may be required.`)) return;
  }
  if (needsInput.has(operation)) {
    const { input } = await promptApi.prompt([{ type: 'input', name: 'input', message: `JSON input for ${operation} (relative to project or absolute; blank cancels):` }]);
    if (typeof input !== 'string' || !input.trim()) return;
    options.input = path.resolve(project, input.trim());
  }
  if (execution.has(operation)) {
    const { mode } = await promptApi.prompt([{ type: 'list', name: 'mode', message: 'Execution provenance:', choices: [
      { name: 'Offline deterministic fixtures (no provider verification)', value: 'offline' },
      { name: 'Live TypeSafe provider (explicit activation and bounded requests)', value: 'live' }, { name: 'Cancel', value: 'cancel' }
    ] }]);
    if (mode === 'cancel' || !mode) return;
    if (!['offline', 'live'].includes(mode)) throw new Error('Invalid execution mode');
    if (mode === 'offline') options.offline = true; else options.live = true;
    const { id } = await promptApi.prompt([{ type: 'input', name: 'id', message: 'Run/probe identity (lowercase, blank cancels):' }]);
    if (typeof id !== 'string' || !id.trim()) return;
    options.id = id.trim();
    if (operation === 'resume') {
      if (!validId(options.id)) throw new Error('Invalid run identity');
      console.log(`Inspect ${path.join(project, '.augx-decision/runs', options.id, 'review.json')} before approving an action.`);
      const { approve } = await promptApi.prompt([{ type: 'input', name: 'approve', message: 'Exact persisted review digest (blank resumes without approval):' }]);
      if (typeof approve === 'string' && approve.trim()) options.approve = approve.trim();
    }
    if (mode === 'live') {
      console.log('Credentials come from TYPESAFE_API_KEY in your environment. Never enter keys here. Runtime policy must explicitly allow provider data.');
      const { requests } = await promptApi.prompt([{ type: 'input', name: 'requests', message: 'Maximum provider requests including retries (positive integer, within configured limit):' }]);
      options.requests = typeof requests === 'string' ? requests.trim() : '';
    }
  }
  validateGuiDecisionOptions(operation, options);
  if (execution.has(operation)) {
    console.log(`Project: ${project}\nOperation: ${operation}\nMode: ${options.offline ? 'OFFLINE FIXTURES, provider NOT VERIFIED' : 'LIVE, explicit request budget ' + options.requests}\nIdentity: ${options.id}`);
    if (options.input) console.log(`Input: ${options.input}`);
    if (!await confirm(promptApi, `Execute ${operation} in this scope${options.approve ? ' using the supplied exact review digest' : ''}?`)) return;
  }
  if (operation === 'remove' && !await confirm(promptApi, `Remove unchanged receipt-owned software in ${project}? Edits and run data are retained; guidance stays linked.`)) return;
  reportDecisionResult(operation, await execute(operation, options));
}

async function confirm(promptApi: InteractivePrompt, message: string): Promise<boolean> {
  const answer = await promptApi.prompt([{ type: 'confirm', name: 'confirm', message, default: false }]);
  if (answer.confirm !== true) console.log('Cancelled.');
  return answer.confirm === true;
}

function reportDecisionResult(operation: string, code: number): void {
  if (code === 0) console.log(`Decision ${operation} finished (exit 0). Read the reported fields for readiness and provenance.`);
  else if (code === 130) console.log(`Decision ${operation} cancelled. State and consumed budgets are retained.`);
  else console.error(`Decision ${operation} ${code === 1 ? 'ended without verified completion' : 'failed'} (exit ${code}). Inspect diagnostics; use Doctor or resume the original state after resolving the cause.`);
}
