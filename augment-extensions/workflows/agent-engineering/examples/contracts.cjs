'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Ajv = require('ajv');
const schema = require('../schemas/contracts.schema.json');
const ajv = new Ajv({ allErrors: true, strict: true });
ajv.addSchema(schema, 'contracts');
const validators = new Map();
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

function validate(kind, value) {
  if (!validators.has(kind)) validators.set(kind, ajv.compile({ $ref: `contracts#/definitions/${kind}` }));
  const check = validators.get(kind);
  if (!check(value)) throw new Error(`Invalid ${kind}: ${ajv.errorsText(check.errors)}`);
  for (const name of ['inputSchema', 'outputSchema']) if (value[name]) ajv.compile(value[name]);
  return value;
}

function checkSchema(schemaValue, value) {
  const check = ajv.compile(schemaValue);
  if (!check(value)) throw new Error('Payload does not match schema');
  return value;
}

function safePath(root, relative) {
  if (typeof relative !== 'string' || !/^[a-zA-Z0-9_.\/-]+$/.test(relative) || relative.includes('\\') || path.isAbsolute(relative)) throw new Error('Unsafe path');
  const segments = relative.split('/');
  if (segments.some(s => !s || s === '.' || s === '..' || /[. ]$/.test(s) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(s))) throw new Error('Unsafe path');
  const base = fs.realpathSync(root);
  let current = base;
  for (const segment of segments) {
    current = path.join(current, segment);
    if (fs.existsSync(current) || fs.lstatSync(path.dirname(current)).isSymbolicLink()) {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Symlink path denied');
      const rel = path.relative(base, fs.realpathSync(current));
      if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Path escape');
    }
  }
  return current;
}

function atomic(root, name, value) {
  const destination = safePath(root, name);
  const temporary = safePath(root, `${name}.${crypto.randomBytes(6).toString('hex')}.tmp`);
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n'); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temporary, destination);
}

function read(root, name) {
  const file = safePath(root, name);
  if (fs.statSync(file).size > 262144) throw new Error('Oversized local state');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function validateTask(task) {
  validate('task', task);
  if (task.writePaths.length !== 1 || task.writePaths[0] !== 'candidate.json' || task.readPaths.some(p => p !== 'candidate.json') || task.requiredChecks.join() !== 'sorted-unique' || task.approvals.length || task.budget.maxWorkers !== 1 || task.budget.maxAttempts > 5 || task.budget.maxCalls > 12 || task.budget.wallMs > 5000 || task.budget.callMs > 750 || task.budget.stallRounds > 2) throw new Error('Reference policy denied task');
  return task;
}

function writeCandidate(root, task, requested, candidate) {
  validateTask(task);
  if (!task.writePaths.includes(requested) || requested !== 'candidate.json') throw new Error('Write permission denied');
  checkSchema({ type: 'array', maxItems: 8, items: { type: 'string', enum: ['a', 'b', 'c'] } }, candidate);
  atomic(root, requested, candidate);
}

function claim(packets, task) {
  validateTask(task);
  const paths = new Set();
  let calls = 0;
  for (const packet of packets) {
    validate('invocation', packet);
    if (packet.task !== task.id || packet.allocation.timeoutMs > task.budget.callMs || packet.tools.some(t => !['stub', 'check'].includes(t))) throw new Error('Delegation permission denied');
    calls += packet.allocation.calls;
    for (const p of packet.writePaths) {
      if (!task.writePaths.includes(p) || paths.has(p.toLowerCase())) throw new Error('Write ownership conflict');
      paths.add(p.toLowerCase());
    }
  }
  if (packets.length > task.budget.maxWorkers) throw new Error('Worker limit exceeded');
  if (calls > task.budget.maxCalls) throw new Error('Shared allocation exceeded');
  return { mode: 'sequential', owners: packets.map(p => p.owner), reservedCalls: calls };
}

module.exports = { validate, checkSchema, hash, safePath, atomic, read, validateTask, writeCandidate, claim };
