'use strict';
const fs = require('fs');
const Ajv = require('ajv');
const { config, inside, read, atomic, lock, hash, safeData, check } = require('./common.cjs');
const decisions = require('./decisions.cjs');
const inputSchema = require('../schemas/automatic-input.schema.json');
const validate = new Ajv({ strict: true }).compile(inputSchema);
const fallback = reason => ({ status: 'fallback', reason, next: 'Continue the normal task using existing deterministic behavior or review; no judgment supplied.' });
function stateDigest(input) {
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  return hash(canonical({ ...input, state: { ...input.state, revision: 0 } }));
}

// Never accept provider options, credentials, permissions, budgets or filesystem paths from a tool caller.
async function automatic(root, host, input, options = {}) {
  let release;
  try {
    const policy = config(root), saved = policy.automatic;
    if (!saved?.enabled || saved.host !== host) return fallback('automatic-disabled-or-unsupported-host');
    if (!policy.allowProviderData) return fallback('provider-data-denied');
    if (!validate(input)) return fallback('unsupported-or-incomplete-context');
    if (!saved.capabilities.includes(input.capability) || !saved.dataClasses.includes(input.dataClass)) return fallback('decision-or-data-denied');
    if (input.capability === 'rank-retrieval' && input.candidates.some(c => c.accessible !== true)) return fallback('context-access-denied');
    if (!input.state.evidence.some(s => s.trim().length >= 12)) return fallback('insufficient-evidence');
    if (options.signal?.aborted) return fallback('cancelled');
    safeData(input);
    const prepared = decisions.prepare(input, policy);
    const request = { state: input.state, questions: prepared.questions, dataClass: input.dataClass };
    safeData(request);
    if (Buffer.byteLength(JSON.stringify(request)) > policy.limits.bytes) return fallback('context-too-large');
    if (!process.env.TYPESAFE_API_KEY?.trim()) return fallback('credentials-unavailable');
    const sdk = inside(root, '.augx-decision/software/sdk/node_modules/@typesafe-ai/sdk');
    if (!fs.existsSync(sdk)) return fallback('runtime-unavailable');
    // One writer across all hosts, processes and conversations. Never queue an unbounded backlog.
    release = lock(root, '.augx-decision/automatic.lock');
    const file = inside(root, '.augx-decision/automatic-ledger.json');
    const ledger = fs.existsSync(file) ? read(file) : { schemaVersion: 1, requests: 0, entries: {} };
    check(ledger.schemaVersion === 1 && Number.isSafeInteger(ledger.requests) && ledger.requests >= 0 && ledger.requests <= 100 && ledger.entries && typeof ledger.entries === 'object' && !Array.isArray(ledger.entries), 'Invalid automatic ledger');
    check(Object.keys(ledger.entries).length === ledger.requests && Object.values(ledger.entries).every(e => ['reserved', 'answered', 'failed'].includes(e?.status)), 'Invalid automatic accounting');
    // Revision numbers alone do not create fresh evidence or refund duplicate calls.
    const digest = stateDigest(input);
    if (Object.hasOwnProperty.call(ledger.entries, digest)) return fallback('unchanged-state-already-attempted');
    if (ledger.requests >= Math.min(saved.requests, policy.limits.requests)) return fallback('automatic-budget-exhausted');
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    const timeoutMs = Math.min(saved.timeoutMs, policy.limits.requestMs);
    const timer = setTimeout(abort, timeoutMs);
    try {
      if (options.signal?.aborted) return fallback('cancelled');
      // judge validates input and policy again and calls reserve immediately before SDK loading/network.
      const result = await decisions.decide(root, policy, input, { mode: 'live', requestBudget: Math.min(saved.requests, policy.limits.requests), signal: controller.signal, timeoutMs,
        reserve: () => {
          check(!controller.signal.aborted, 'Cancelled before reservation');
          // Reload consent before crossing the provider boundary.
          check(hash(config(root)) === hash(policy), 'Policy changed before request');
          ledger.requests += 1; ledger.entries[digest] = { status: 'reserved' }; atomic(file, ledger);
        }
      });
      check(!controller.signal.aborted && hash(config(root)) === hash(policy), 'Cancelled or policy changed');
      check(result.provenance === 'typesafe-sdk-0.7.0', 'Automatic path requires the configured live adapter');
      decisions.validateResult(prepared.questions, result); safeData(result);
      for (const answer of Object.values(result.answers)) {
        const fields = answer.type === 'noul' ? ['type', 'noul'] : answer.type === 'choice' ? ['type', 'choice', 'confidence', 'probabilities'] : ['type', 'score', 'confidence', 'probabilities', 'legend'];
        check(Object.keys(answer).every(key => fields.includes(key)), 'Unexpected typed answer fields');
      }
      ledger.entries[digest].status = 'answered'; atomic(file, ledger);
      // Do not return candidate text, raw usage metadata, provider errors or conversation history.
      return { status: 'judgment', capability: input.capability, outcome: result.outcome, selected: result.selected, answers: result.answers, model: result.model, provenance: result.provenance,
        requestsUsed: ledger.requests, next: 'Use this advisory judgment in the normal task; existing permissions and verification still apply.' };
    } catch {
      if (ledger.entries[digest]) { ledger.entries[digest].status = 'failed'; atomic(file, ledger); }
      return fallback(controller.signal.aborted ? 'cancelled-or-timed-out' : 'provider-or-validation-failed');
    } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); }
  } catch {
    // Do not echo validation details or upstream exceptions containing submitted data or secrets.
    return fallback('policy-runtime-or-writer-unavailable');
  } finally { release?.(); }
}
module.exports = { automatic, inputSchema, fallback, stateDigest };
