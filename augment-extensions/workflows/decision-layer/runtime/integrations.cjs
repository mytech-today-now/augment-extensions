'use strict';
const fs = require('fs');
const path = require('path');
const { check, inside, hash, safeData } = require('./common.cjs');
const { decide } = require('./decisions.cjs');

/** Load applicable repository instructions without consulting a relevance model. */
function scopedGuidance(root, target) {
  const absolute = inside(root, target), relative = path.relative(fs.realpathSync(root), path.dirname(absolute));
  const directories = [''];
  let current = '';
  for (const part of relative.split(path.sep).filter(Boolean)) { current = current ? `${current}/${part}` : part; directories.push(current); }
  const result = [];
  for (const directory of directories) {
    const source = directory ? `${directory}/AGENTS.md` : 'AGENTS.md', file = inside(root, source);
    if (!fs.existsSync(file)) continue;
    check(fs.statSync(file).size <= 65536, 'Applicable instructions exceed guidance bound; inspect before continuing');
    const content = fs.readFileSync(file, 'utf8');
    result.push({ id: `guidance-${result.length}`, description: content, source, sha256: hash(content), kind: 'instructions', protected: true, accessible: true });
  }
  return result;
}
function actionPolicy(root, registrations, authorize) {
  const Ajv = require('ajv'), ajv = new Ajv({ strict: true });
  const validators = new Map();
  return action => {
    if (!action || typeof action.id !== 'string') return false;
    const registered = registrations.find(r => r.id === action.id);
    if (!registered) return false;
    if (!validators.has(action.id)) validators.set(action.id, ajv.compile(registered.schema));
    if (!validators.get(action.id)(action.args)) return false;
    try { for (const key of registered.pathArguments || []) inside(root, action.args[key]); } catch { return false; }
    return authorize(action) === true;
  };
}
async function executeAction(root, policy, input, registrations, authorize, options) {
  const allowed = actionPolicy(root, registrations, authorize);
  const decision = await decide(root, policy, { ...input, capability: 'assess-tool' }, options, { authorize: allowed });
  if (decision.outcome !== 'allow' || !allowed(input.action)) return { decision, executed: false };
  const registration = registrations.find(r => r.id === input.action.id);
  check(typeof registration.execute === 'function', 'Registered action handler unavailable');
  return { decision, executed: true, result: await registration.execute(input.action.args, options.signal) };
}
async function routeGeneration(root, policy, input, adapters, options) {
  const decision = await decide(root, policy, { ...input, capability: 'route-model' }, options, { models: adapters });
  const adapter = adapters.find(a => a.id === decision.outcome);
  if (!adapter) return { decision, result: null };
  check(adapter.available === true && typeof adapter.generate === 'function', 'Generative adapter became unavailable');
  safeData(input.state);
  return { decision, result: await adapter.generate(input.state, options.signal) };
}
async function rerank(root, policy, state, retriever, options) {
  const found = await retriever(state.goal, { limit: 64, signal: options.signal });
  return decide(root, policy, { capability: 'rank-retrieval', state, candidates: found }, options);
}
function inspectReadonly(root, paths) {
  check(Array.isArray(paths) && paths.length <= 16, 'Read-only inspection limit exceeded');
  return paths.map(source => {
    const file = inside(root, source); check(fs.statSync(file).size <= 65536, 'Inspection file too large');
    const content = fs.readFileSync(file, 'utf8'); safeData(content);
    return { source, sha256: hash(content), bytes: Buffer.byteLength(content) };
  });
}
module.exports = { scopedGuidance, actionPolicy, executeAction, routeGeneration, rerank, inspectReadonly };
