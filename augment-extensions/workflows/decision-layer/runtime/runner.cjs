'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { ROOT, check, object, finite, text, id, inside, hash, read, atomic, lock, safeData } = require('./common.cjs');
const { decide } = require('./decisions.cjs');
const { processEnv } = require('./install.cjs');
const { descriptions } = require('./workers.cjs');
const terminal = ['completed', 'failed', 'cancelled', 'exhausted', 'verification_failed'];
const transitions = {
  pending: ['deciding', 'review', 'exhausted', 'cancelled'], deciding: ['queued', 'review', 'failed', 'exhausted', 'cancelled'],
  queued: ['running', 'review', 'cancelled', 'exhausted'], running: ['verifying', 'pending', 'failed', 'review', 'cancelled', 'exhausted'],
  verifying: ['completed', 'pending', 'review', 'verification_failed', 'cancelled', 'exhausted'], review: ['pending', 'cancelled']
};
function transition(record, status) { check(transitions[record.status]?.includes(status), `Invalid transition ${record.status} to ${status}`); record.status = status; }
function registeredWorkers() {
  const modulePath = path.join(__dirname, 'workers.cjs'), sha256 = hash(fs.readFileSync(modulePath));
  return Object.entries(descriptions).map(([id, description]) => ({ id, description, capabilities: ['local-document'], available: true, modulePath, sha256 }));
}
function validateTask(task) {
  check(object(task) && id(task.id), 'Task requires a valid identity'); text(task.goal, 'task goal');
  check(Array.isArray(task.sources) && task.sources.length > 0 && task.sources.length <= 16 && task.sources.every(p => typeof p === 'string'), 'Task requires 1..16 local source paths');
  check(Array.isArray(task.capabilities) && task.capabilities.length > 0 && task.capabilities.every(id), 'Task requires explicit capabilities');
  check(['research', 'write', 'review'].includes(task.kind), 'Unsupported local task kind');
  check(object(task.acceptance) && Number.isInteger(task.acceptance.minBytes) && finite(task.acceptance.minBytes, 1, 1048576) && Array.isArray(task.acceptance.contains) && task.acceptance.contains.length > 0 && task.acceptance.contains.length <= 32 && task.acceptance.contains.every(x => typeof x === 'string' && x.length > 0 && x.length <= 2000), 'Invalid independent acceptance criteria');
  safeData(task); return task;
}
function loadSources(root, task) {
  let size = 0;
  return task.sources.map(relative => {
    check(!/(^|[\\/])(?:\.git|\.env[^\\/]*|node_modules|\.augx-decision|\.npmrc|credentials[^\\/]*)($|[\\/])/i.test(relative), 'Source path is sensitive or operational state');
    const file = inside(root, relative), stat = fs.statSync(file); size += stat.size;
    check(stat.isFile() && size <= 524288, 'Source corpus exceeds bound');
    const content = fs.readFileSync(file, 'utf8'); safeData(content);
    return { path: relative, sha256: hash(content), content };
  });
}
function verifier(file, task, sources) {
  if (!fs.existsSync(file)) return { passed: false, reason: 'Required artifact missing' };
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size < task.acceptance.minBytes || stat.size > 1048576) return { passed: false, reason: 'Artifact type or size rejected' };
  const bytes = fs.readFileSync(file, 'utf8');
  let value;
  try { value = JSON.parse(bytes); } catch { return { passed: false, reason: 'Artifact JSON invalid' }; }
  const passed = value.schemaVersion === 1 && value.goal === task.goal && value.kind === task.kind && typeof value.body === 'string' && task.acceptance.contains.every(x => bytes.includes(x)) && Array.isArray(value.sources) && sources.every(s => value.sources.some(v => v.source === s.path && v.sha256 === s.sha256));
  return { passed, reason: passed ? 'Artifact independently matches acceptance and source digests' : 'Artifact does not satisfy acceptance', sha256: hash(bytes), bytes: stat.size };
}
function killOwned(child) {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    const taskkill = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
    cp.spawnSync(taskkill, ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, timeout: 5000, stdio: 'ignore', env: processEnv() });
  } else { try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); } }
}
function invokeWorker(worker, context, timeout, signal) {
  check(path.isAbsolute(worker.modulePath) && hash(fs.readFileSync(worker.modulePath)) === worker.sha256, 'Unregistered or changed worker executable');
  return new Promise((resolve, reject) => {
    const child = cp.spawn(process.execPath, [path.join(__dirname, 'worker-child.cjs'), worker.modulePath, worker.sha256], { shell: false, windowsHide: true, detached: process.platform !== 'win32', env: processEnv(), stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '', stopped = false;
    const stop = reason => { if (!stopped) { stopped = true; killOwned(child); reject(new Error(reason)); } };
    const timer = setTimeout(() => stop('Worker timeout'), timeout);
    const cancel = () => stop('Worker cancelled');
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', value => { output += value; if (Buffer.byteLength(output) > 1048576) stop('Worker output exceeds bound'); });
    child.stderr.resume();
    child.stdin.on('error', () => {});
    child.on('error', () => stop('Worker executable unavailable'));
    child.on('close', code => {
      clearTimeout(timer); signal?.removeEventListener('abort', cancel);
      if (stopped) return;
      if (code !== 0) reject(new Error('Registered worker failed'));
      else { try { resolve(safeData(JSON.parse(output))); } catch { reject(new Error('Invalid worker output')); } }
    });
    child.stdin.end(JSON.stringify(context));
  });
}
function inputState(task, revision, sources, record, workers) {
  return { goal: task.goal, revision, evidence: sources.map(s => ({ source: s.path, sha256: s.sha256, content: s.content.slice(0, 2000) })), completed: record.verification?.passed ? [record.verification] : [], issues: [], constraints: ['Local artifacts only', 'Do not publish or contact recipients'], capabilities: task.capabilities, workers: workers.map(w => ({ id: w.id, description: w.description })), requiredKind: task.kind };
}
function fixtureWorker(goal) {
  const value = goal.toLowerCase();
  if (/unclear|ambiguous|missing requirements/.test(value)) return 'review';
  if (/draft|write|compose/.test(value)) return 'write';
  if (/review|inspect|audit/.test(value)) return 'review';
  return 'research';
}
async function run(root, policy, suppliedTask, options = {}) {
  const task = validateTask(suppliedTask), sources = loadSources(root, task), taskHash = hash({ task, sources: sources.map(({ path, sha256 }) => ({ path, sha256 })) });
  check(options.mode === 'offline' || options.mode === 'live' || options.mode === 'baseline', 'Select offline, live or baseline mode');
  const runId = options.runId || task.id; check(id(runId), 'Invalid run identity');
  const prefix = `.augx-decision/runs/${runId}`, recordFile = inside(root, `${prefix}/state.json`), artifact = inside(root, `${prefix}/artifacts/result.json`);
  const unlock = lock(root, `${prefix}/writer.lock`);
  let record;
  const save = () => { record.revision += 1; record.updatedAt = Date.now(); atomic(recordFile, record); };
  try {
    if (fs.existsSync(recordFile)) {
      record = read(recordFile);
      check(record.schemaVersion === 1 && record.taskHash === taskHash && record.policyHash === hash(policy) && record.mode === options.mode, 'Run task, source, policy or mode changed; start a new run identity');
      check(Number.isInteger(record.requests) && record.requests >= 0 && Number.isInteger(record.attempts) && record.attempts >= 0 && Number.isInteger(record.revision) && typeof record.startedAt === 'number', 'Invalid persisted run accounting');
    } else {
      check(!options.resume, 'No run to resume');
      record = { schemaVersion: 1, id: runId, task, taskHash, policyHash: hash(policy), policyVersion: policy.policyVersion, mode: options.mode, status: 'pending', revision: 0, requests: 0, attempts: 0, noProgress: 0, requestBudget: options.requestBudget || 0, startedAt: Date.now(), updatedAt: Date.now(), decisions: [], artifacts: [], verification: null, usage: { input_tokens: 0, output_tokens: 0, complete: true, cost: null, cacheCost: null }, nextAction: 'dispatch' };
      save();
    }
    if (record.status === 'completed') {
      const current = verifier(artifact, task, sources);
      if (!current.passed || current.sha256 !== record.verification.sha256) { record.status = 'verification_failed'; record.verification = current; record.nextAction = 'Inspect modified artifact; use a new run identity for repair'; save(); }
      return record;
    }
    if (terminal.includes(record.status)) return record;
    const review = reason => {
      if (record.status !== 'review') transition(record, 'review');
      record.nextAction = reason;
      record.review = { reason, taskHash, policyHash: record.policyHash, selectedWorker: record.selectedWorker || null, action: { kind: task.kind, args: { sources: task.sources, artifact: `${prefix}/artifacts/result.json` } }, stateRevision: record.revision + 1 };
      record.review.digest = hash(record.review); save();
      atomic(inside(root, `${prefix}/review.json`), record.review);
      return record;
    };
    if (record.status === 'review') {
      if (!options.approve) return record;
      check(options.approve === record.review.digest && record.review.taskHash === taskHash && record.review.policyHash === hash(policy), 'Approval does not match concrete action, arguments, state and policy');
      const approved = { ...record.review }; delete approved.digest;
      check(hash(approved) === options.approve, 'Review request changed after approval');
      record.authorization = { digest: options.approve, worker: task.kind, taskHash, policyHash: hash(policy) };
      transition(record, 'pending'); record.review = null; save();
    }
    const deadline = () => record.startedAt + policy.limits.runMs - Date.now();
    if (['running', 'verifying'].includes(record.status)) {
      const reconciled = verifier(artifact, task, sources);
      if (reconciled.passed) { record.status = 'completed'; record.verification = reconciled; record.artifacts = [{ path: `${prefix}/artifacts/result.json`, sha256: reconciled.sha256 }]; record.nextAction = 'none'; save(); return record; }
      if (fs.existsSync(artifact)) return review('Uncertain artifact effect requires inspection before another attempt');
      record.status = 'pending'; record.noProgress += 1; save();
    } else if (record.status === 'deciding') return review('Interrupted decision reserved a request; inspect before redispatch');
    const workers = options.workers || registeredWorkers();
    check(workers.every(w => id(w.id) && typeof w.description === 'string' && Array.isArray(w.capabilities)), 'Invalid trusted worker registry');
    while (!terminal.includes(record.status)) {
      if (options.signal?.aborted) { transition(record, 'cancelled'); record.nextAction = 'Inspect cancellation; no automatic restart'; save(); break; }
      if (deadline() <= 0 || record.attempts >= policy.limits.attempts) { transition(record, 'exhausted'); record.nextAction = 'Inspect run limits; use a new reviewed run'; save(); break; }
      if (record.noProgress >= policy.limits.noProgress) return review('Deterministic no-progress limit reached');
      if (record.status !== 'queued') {
        transition(record, 'deciding'); save();
        const state = inputState(task, record.revision, sources, record, workers);
        let decision;
        try {
          if (options.mode === 'baseline' || record.authorization) decision = { outcome: task.kind, selected: task.kind, provenance: record.authorization ? 'explicit-action-approval' : 'deterministic-matched-baseline', cost: null };
          else decision = await decide(root, policy, { capability: 'dispatch', state }, { ...options, timeoutMs: Math.min(policy.limits.requestMs, deadline()), requestBudget: record.requestBudget, hints: { selected: fixtureWorker(task.goal) }, reserve: () => {
            check(record.requests < Math.min(record.requestBudget, policy.limits.requests) && deadline() > 0, 'Provider request budget exhausted');
            options.reserveParent?.();
            record.requests += 1; record.usage.complete = false; save();
          } }, { workers });
        } catch (error) { return review(error.message); }
        record.decisions.push(decision);
        if (decision.usage) for (const key of ['input_tokens', 'output_tokens']) { if (decision.usage[key] !== null) record.usage[key] += decision.usage[key]; }
        if (decision.provenance === 'deterministic-offline-fixture') record.usage.complete = false;
        const worker = workers.find(w => w.id === decision.outcome && w.available === true && task.capabilities.every(c => w.capabilities.includes(c)));
        if (!worker) return review('Decision requires review or selected worker is unavailable');
        record.selectedWorker = worker.id; record.selectionRevision = record.revision; record.nextAction = 'consume queued worker';
        transition(record, 'queued'); save();
        atomic(inside(root, `${prefix}/queue/${worker.id}.json`), { schemaVersion: 1, taskId: task.id, stateRevision: record.revision, worker: worker.id, status: 'queued', attempts: record.attempts });
      }
      const worker = workers.find(w => w.id === record.selectedWorker && w.available === true && task.capabilities.every(c => w.capabilities.includes(c)));
      if (!worker) return review('Queued worker no longer available');
      if (deadline() <= 0) { transition(record, 'exhausted'); record.nextAction = 'Overall deadline exhausted before worker launch'; save(); break; }
      if (record.selectedWorker !== task.kind) return review('Selected worker conflicts with required artifact contract');
      const sourceRevision = list => hash(list.map(({ path, sha256 }) => ({ path, sha256 })));
      if (sourceRevision(loadSources(root, task)) !== sourceRevision(sources)) return review('Source observation changed after dispatch; create a fresh run');
      const workerRequests = worker.requestsPerAttempt || 0;
      check(Number.isInteger(workerRequests) && workerRequests >= 0, 'Invalid registered worker request reservation');
      if (workerRequests > 0) {
        if (options.mode !== 'live' || record.requests + workerRequests > Math.min(record.requestBudget, policy.limits.requests)) return review('Insufficient aggregate provider budget for registered worker');
        for (let i = 0; i < workerRequests; i++) options.reserveParent?.();
        record.requests += workerRequests; record.workerRequestReservations = (record.workerRequestReservations || 0) + workerRequests; record.usage.complete = false;
      }
      transition(record, 'running'); record.attempts += 1; record.nextAction = 'verify worker effect'; save();
      atomic(inside(root, `${prefix}/queue/${worker.id}.json`), { schemaVersion: 1, taskId: task.id, stateRevision: record.revision, worker: worker.id, status: 'claimed', attempts: record.attempts });
      try {
        const output = await invokeWorker(worker, { task: { id: task.id, goal: task.goal, kind: task.kind }, sources, worker: worker.id, requestBudget: workerRequests }, Math.max(1, Math.min(policy.limits.workerMs, deadline())), options.signal);
        if (output.usage) {
          for (const key of ['input_tokens', 'output_tokens']) { check(output.usage[key] === null || Number.isInteger(output.usage[key]) && output.usage[key] >= 0, 'Invalid worker usage'); if (output.usage[key] !== null) record.usage[key] += output.usage[key]; }
          check(Number.isInteger(output.usage.requests) && output.usage.requests >= 0 && output.usage.requests <= workerRequests, 'Worker exceeded declared request reservations');
        }
        check(!fs.existsSync(artifact), 'Uncertain existing artifact; refusing overwrite');
        atomic(artifact, output);
        transition(record, 'verifying'); save();
        const verification = sourceRevision(loadSources(root, task)) === sourceRevision(sources) ? verifier(artifact, task, sources) : { passed: false, reason: 'Source state changed during worker execution' }; record.verification = verification;
        if (verification.passed) { transition(record, 'completed'); record.artifacts = [{ path: `${prefix}/artifacts/result.json`, sha256: verification.sha256 }]; record.nextAction = 'none'; }
        else { transition(record, 'verification_failed'); record.nextAction = 'Inspect rejected artifact; acceptance is controller-owned'; }
        atomic(inside(root, `${prefix}/queue/${worker.id}.json`), { schemaVersion: 1, taskId: task.id, worker: worker.id, status: record.status, attempts: record.attempts, verification });
        save();
      } catch {
        if (options.signal?.aborted) { transition(record, 'cancelled'); record.nextAction = 'Inspect cancellation'; save(); }
        else if (fs.existsSync(artifact)) return review('Worker effect uncertain; inspect existing artifact');
        else { transition(record, 'pending'); record.noProgress += 1; record.nextAction = 'retry within remaining limits'; save(); }
      }
    }
    record.elapsedMs = Date.now() - record.startedAt; save(); return record;
  } finally { unlock(); }
}
module.exports = { run, verifier, validateTask, loadSources, invokeWorker, registeredWorkers, transition, terminal, fixtureWorker };
