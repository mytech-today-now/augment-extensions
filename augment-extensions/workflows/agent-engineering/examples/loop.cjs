'use strict';
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { validate, checkSchema, hash, safePath, atomic, read, validateTask, writeCandidate } = require('./contracts.cjs');

function policyHash() {
  return hash(['contracts.cjs', 'loop.cjs', 'stub.cjs', 'verify.cjs', '../schemas/contracts.schema.json', '../templates/tool.json', '../templates/check-tool.json'].map(p => fs.readFileSync(path.join(__dirname, p), 'utf8')));
}
const artifactHash = root => hash(fs.readFileSync(safePath(root, 'candidate.json'), 'utf8'));
function save(root, state) { validate('state', state); atomic(root, 'state.json', { checksum: hash(state), state }); }
function load(root, task, mode) {
  const wrapper = read(root, 'state.json');
  const s = validate('state', wrapper.state);
  if (wrapper.checksum !== hash(s) || s.contract !== hash(task) || s.policy !== policyHash() || s.revision !== task.revision || s.mode !== mode || s.run !== task.id || s.calls > task.budget.maxCalls || s.attempts > task.budget.maxAttempts || s.deadline !== s.startedAt + task.budget.wallMs || s.calls < s.attempts) throw new Error('Incompatible checkpoint; preserve and inspect it');
  if (s.artifact && artifactHash(root) !== s.artifact) throw new Error('Stale candidate evidence');
  for (const e of s.evidence) if (e.contract !== s.contract || e.policy !== s.policy || e.revision !== s.revision) throw new Error('Stale evidence');
  if (s.status === 'success' && !s.evidence.some(e => e.passed && e.exitCode === 0 && e.artifact === s.artifact)) throw new Error('Success lacks evidence');
  return s;
}

async function runLoop({ root, task = require('../templates/task.json'), mode = 'repair', now = Date.now, signal, pauseAfter = Infinity } = {}) {
  validateTask(task);
  if (!['repair', 'exhaust', 'stall', 'denied', 'error', 'transient', 'timeout'].includes(mode)) throw new Error('Invalid mode');
  if (!root) throw new Error('Explicit local root required');
  fs.mkdirSync(root, { recursive: true });
  const lock = safePath(root, 'owner.lock');
  const fd = fs.openSync(lock, 'wx', 0o600);
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, task: task.id }));
  let state;
  try {
    const startedAt = now();
    state = fs.existsSync(safePath(root, 'state.json')) ? load(root, task, mode) : {
      version: 1, run: task.id, contract: hash(task), policy: policyHash(), revision: task.revision, mode,
      startedAt, deadline: startedAt + task.budget.wallMs, attempts: 0, calls: 0, dryRounds: 0, bestScore: 0,
      status: 'running', nextAction: 'dispatch', artifact: null, facts: ['Protected fixture values: a, b, c'], decisions: ['Single controller writer; no native subagents'], accepted: [], rejected: [], evidence: [], trace: []
    };
    const event = (name, classification = 'none', retryReason = 'none') => {
      state.trace.push({ run: state.run, node: name === 'check' ? 'verifier' : 'worker', attempt: state.attempts, event: name, contract: state.contract, artifact: state.artifact, elapsedMs: Math.max(0, now() - state.startedAt), calls: state.calls, classification, retryReason, approval: 'no-external-effects' });
    };
    const terminal = (status, reason) => { state.status = status; state.nextAction = reason; event('terminal', status); };
    const remaining = () => state.deadline - now();
    const boundary = (dispatching = true) => {
      if (signal?.aborted) { terminal('cancelled', 'Local owner reviews partial artifacts'); return false; }
      if (remaining() <= 0 || (dispatching && state.calls >= task.budget.maxCalls)) { terminal('exhausted', 'Local owner reviews allocation'); return false; }
      return true;
    };
    const dispatch = async (tool, args) => {
      const contract = require(tool === 'check' ? '../templates/check-tool.json' : '../templates/tool.json');
      validate('tool', contract);
      if (!['stub', 'check'].includes(tool)) throw new Error('Tool denied');
      checkSchema(contract.inputSchema, tool === 'stub' ? { attempt: Number(args[1]) } : { path: args[0] });
      if (!boundary()) return null;
      state.calls++;
      event('dispatch');
      save(root, state); // Reserve before launch; interrupted calls are never refunded.
      const timeout = Math.max(1, Math.min(task.budget.callMs, contract.deadlineMs, remaining()));
      const script = path.join(__dirname, tool === 'stub' ? 'stub.cjs' : 'verify.cjs');
      return new Promise(resolve => {
        execFile(process.execPath, [script, ...args], { cwd: root, timeout, killSignal: 'SIGKILL', maxBuffer: 32768, encoding: 'utf8', windowsHide: true, signal, env: process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {} }, (error, stdout) => {
          if (signal?.aborted) return resolve({ failure: 'cancelled' });
          if (error && (error.killed || error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER')) return resolve({ failure: 'exhausted' });
          if (error && error.code !== 1) return resolve({ failure: 'unrecoverable' });
          try { resolve({ value: JSON.parse(stdout), exitCode: error ? 1 : 0, command: [process.execPath, script, ...args] }); }
          catch { resolve({ failure: 'unrecoverable' }); }
        });
      });
    };
    const fail = (classification, actual = []) => {
      const feedback = { fingerprint: hash([classification, actual]), condition: 'Candidate must satisfy protected check', location: 'candidate.json', expected: ['a', 'b', 'c'], actual, repairScope: 'candidate.json', classification };
      if (!state.rejected.some(f => f.fingerprint === feedback.fingerprint)) state.rejected.push(feedback);
      event('rejected', classification, classification === 'transient' ? 'bounded-backoff' : 'repair-candidate-only');
    };
    let rounds = 0;
    while (state.status === 'running' && rounds < pauseAfter) {
      if (!boundary()) break;
      if (state.attempts >= task.budget.maxAttempts) { terminal('exhausted', 'Attempt allocation used'); break; }
      if (policyHash() !== state.policy) { terminal('denied', 'Guardrails changed; reviewed contract revision required'); break; }
      state.attempts++;
      rounds++;
      const work = await dispatch('stub', [mode, String(state.attempts)]);
      if (!work) break;
      const failure = work.failure || work.value?.failure;
      if (failure) {
        if (failure === 'transient' && state.attempts < task.budget.maxAttempts) {
          fail('transient'); state.nextAction = 'retry-after-transient-cleared'; save(root, state);
          await new Promise(resolve => { const timer = setTimeout(done, Math.min(20 * state.attempts, Math.max(0, remaining()))); function done() { clearTimeout(timer); signal?.removeEventListener('abort', done); resolve(); } signal?.addEventListener('abort', done, { once: true }); });
          continue;
        }
        terminal(failure === 'cancelled' ? 'cancelled' : failure === 'exhausted' ? 'exhausted' : failure === 'denied' ? 'denied' : 'error', 'Local owner reviews structured failure');
        break;
      }
      if (!boundary(false)) break;
      try { writeCandidate(root, task, 'candidate.json', work.value); }
      catch { terminal('denied', 'Candidate write rejected'); break; }
      state.artifact = artifactHash(root);
      const checked = await dispatch('check', [safePath(root, 'candidate.json')]);
      if (!checked) break;
      if (checked.failure) { terminal(checked.failure === 'cancelled' ? 'cancelled' : checked.failure === 'exhausted' ? 'exhausted' : 'error', 'Verifier did not complete'); break; }
      if (!boundary(false)) break;
      const result = checked.value;
      try { checkSchema(require('../templates/check-tool.json').outputSchema, result); }
      catch { terminal('error', 'Invalid verifier payload'); break; }
      if (policyHash() !== state.policy || result.artifact !== artifactHash(root) || result.artifact !== state.artifact || typeof result.passed !== 'boolean' || !Number.isInteger(result.score) || result.score < 0 || result.score > 3) { terminal('error', 'Verifier or artifact changed'); break; }
      const evidence = { check: 'sorted-unique', artifact: state.artifact, contract: state.contract, policy: state.policy, revision: task.revision, timestamp: new Date(now()).toISOString(), command: checked.command, exitCode: checked.exitCode, expected: result.expected, actual: result.actual, passed: result.passed && checked.exitCode === 0, scope: 'Local deterministic fixture', limitations: ['No provider, production, or OS isolation evidence'] };
      validate('evidence', evidence); state.evidence.push(evidence); event('check');
      if (evidence.passed) { state.accepted.push(state.artifact); terminal('success', 'Local owner may inspect receipt'); break; }
      fail('behavioral', result.actual);
      state.dryRounds = result.score > state.bestScore ? 0 : state.dryRounds + 1;
      state.bestScore = Math.max(state.bestScore, result.score);
      state.nextAction = 'repair-candidate-only-with-next-attempt';
      if (state.dryRounds >= task.budget.stallRounds) terminal('stalled', 'Local owner revises plan or contract');
      save(root, state);
    }
    if (state.status === 'running' && state.attempts >= task.budget.maxAttempts) terminal('exhausted', 'Attempt allocation used');
    save(root, state);
    if (state.status !== 'running') {
      const receipt = { run: state.run, outcome: state.status, changedArtifacts: state.artifact ? ['candidate.json'] : [], verifiedChecks: state.evidence.filter(e => e.passed && e.artifact === state.artifact), unverified: ['Provider behavior', 'Production behavior', 'Host security isolation'], remainingRisk: state.status === 'success' ? 'Fixture coverage only' : state.nextAction, nextOwner: task.owner, nextAction: state.nextAction, accounting: { attempts: state.attempts, calls: state.calls, elapsedMs: now() - state.startedAt, providerTokens: null, providerCost: null } };
      atomic(root, 'receipt.json', receipt);
      if (state.status !== 'success') atomic(root, task.handoff, receipt);
    }
    return state;
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
module.exports = { runLoop, load, policyHash, artifactHash };
