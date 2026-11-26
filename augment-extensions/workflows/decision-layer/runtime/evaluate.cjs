'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, check, object, inside, read, atomic, hash, id, lock } = require('./common.cjs');
const { run, registeredWorkers } = require('./runner.cjs');
const { capabilities, decide } = require('./decisions.cjs');

function state(goal = 'Prepare a local evidence briefing') { return { goal, revision: 1, evidence: [], completed: [], issues: [], constraints: ['Local only'], capabilities: ['local-document'] }; }
async function examples(root, policy, options) {
  const menu = ['research', 'write', 'review'].map(id => ({ id, description: `Handle ${id} local evidence`, available: true, compatible: true, capabilities: ['local-document'], dataClasses: ['public'], cost: null, accessible: true, source: 'example.txt' }));
  const results = [];
  for (const capability of capabilities) {
    const input = { capability, state: state(), candidates: menu, action: { id: 'read-local', args: { path: 'example.txt' } }, menuRevision: 1 };
    results.push({ capability, result: await decide(root, policy, input, { ...options, hints: { repeating: 0.01, needs_review: 0.01 } }, { workers: registeredWorkers(), authorize: action => action.id === 'read-local', verify: () => ({ passed: false, reason: 'Example intentionally provides no artifact' }) }) });
  }
  return { provenance: options.mode, results };
}
function inventory(input) {
  check(Array.isArray(input) && input.length > 0 && input.length <= 1000, 'Expected a nonempty explicit call inventory');
  const groups = { generation: [], judgment: [], deterministic: [] };
  for (const entry of input) {
    check(object(entry) && typeof entry.name === 'string' && Object.hasOwnProperty.call(groups, entry.kind), 'Inventory entries require name and generation, judgment or deterministic kind');
    check(Number.isInteger(entry.callsPerDay) && entry.callsPerDay >= 0, 'Invalid call frequency');
    groups[entry.kind].push(entry);
  }
  groups.judgment.sort((a, b) => b.callsPerDay - a.callsPerDay);
  return { groups, firstAdoption: groups.judgment[0]?.name || null, next: 'Probe this one judgment against de-identified labeled state; keep all exact logic in code' };
}
async function evaluateCases(root, policy, cases, options) {
  check(Array.isArray(cases) && cases.length >= 20 && cases.length <= 100, 'Evaluation requires 20..100 labeled cases');
  const ids = new Set();
  for (const c of cases) { check(!ids.has(c.id) && ['calibration', 'held-out'].includes(c.split) && ['research', 'write', 'review'].includes(c.expected) && typeof c.shouldEscalate === 'boolean', 'Invalid evaluation identity, label or split'); ids.add(c.id); }
  check(cases.some(c => c.split === 'held-out') && cases.some(c => c.split === 'calibration'), 'Separate held-out cases are required');
  const evaluationId = options.runId || `eval-${hash(cases).slice(0, 12)}`, records = [];
  check(id(evaluationId) && evaluationId.length <= 30, 'Evaluation identity must fit 30 characters');
  for (const c of cases) {
    const task = { id: c.id, goal: c.goal, kind: c.expected, capabilities: ['local-document'], sources: c.sources, acceptance: c.acceptance };
    const baseline = await run(root, policy, task, { ...options, mode: 'baseline', runId: `${evaluationId}-${c.id}-base` });
    const layered = await run(root, policy, task, { ...options, runId: `${evaluationId}-${c.id}-layer` });
    const escalated = layered.status === 'review';
    records.push({ id: c.id, split: c.split, baseline: { status: baseline.status, verified: baseline.verification?.passed === true, elapsedMs: baseline.elapsedMs || baseline.updatedAt - baseline.startedAt }, decisionLayer: { status: layered.status, verified: layered.verification?.passed === true, elapsedMs: layered.elapsedMs || layered.updatedAt - layered.startedAt, requests: layered.requests, attempts: layered.attempts, providerMs: layered.decisions.reduce((n, d) => n + (d.providerMs || 0), 0) || null }, expected: c.expected, escalated, inappropriateEscalation: escalated && !c.shouldEscalate, missedEscalation: !escalated && c.shouldEscalate, provenance: options.mode === 'offline' ? 'simulated-routing-with-real-local-workers' : 'live-provider-with-real-local-workers' });
  }
  const count = records.length, completed = records.filter(r => r.decisionLayer.verified).length;
  const summarize = list => ({ cases: list.length, verifiedCompletionRate: list.filter(r => r.decisionLayer.verified).length / list.length, baselineCompletionRate: list.filter(r => r.baseline.verified).length / list.length, escalationRate: list.filter(r => r.escalated).length / list.length, inappropriateEscalations: list.filter(r => r.inappropriateEscalation).length, missedEscalations: list.filter(r => r.missedEscalation).length });
  const report = { schemaVersion: 1, evaluationId, policyVersion: policy.policyVersion, mode: options.mode, metrics: { ...summarize(records), completed, medianEndToEndMs: [...records].map(r => r.decisionLayer.elapsedMs).sort((a, b) => a - b)[Math.floor(count / 2)], providerMs: records.some(r => r.decisionLayer.providerMs !== null) ? records.reduce((n, r) => n + (r.decisionLayer.providerMs || 0), 0) : null, requests: records.reduce((n, r) => n + r.decisionLayer.requests, 0), workerAttempts: records.reduce((n, r) => n + r.decisionLayer.attempts, 0), retries: records.reduce((n, r) => n + Math.max(0, r.decisionLayer.attempts - 1), 0), costPerCompletedTask: null, workerCost: null, cacheCost: null }, calibration: summarize(records.filter(r => r.split === 'calibration')), heldOut: summarize(records.filter(r => r.split === 'held-out')), records, policyPromotion: 'No automatic changes. Review held-out results and explicitly create a new policyVersion before promotion.' };
  atomic(inside(root, `.augx-decision/evaluations/${evaluationId}.json`), report);
  return report;
}
module.exports = { examples, inventory, evaluate, state };
async function evaluate(root, policy, cases, options) {
  const evaluationId = options.runId || `eval-${hash(cases).slice(0, 12)}`;
  check(id(evaluationId) && evaluationId.length <= 30, 'Invalid evaluation identity');
  const unlock = lock(root, `.augx-decision/evaluations/${evaluationId}.lock`);
  try {
    const ledgerFile = inside(root, `.augx-decision/evaluations/${evaluationId}-budget.json`);
    const digest = hash({ cases, policy, mode: options.mode });
    const ledger = fs.existsSync(ledgerFile) ? read(ledgerFile) : { digest, requests: 0, requestBudget: options.requestBudget || 0 };
    check(ledger.digest === digest, 'Evaluation inputs changed; select a new identity');
    return await evaluateCases(root, policy, cases, { ...options, runId: evaluationId, reserveParent: () => { check(ledger.requests < Math.min(ledger.requestBudget, policy.limits.requests), 'Aggregate evaluation request budget exhausted'); ledger.requests += 1; atomic(ledgerFile, ledger); } });
  } finally { unlock(); }
}
