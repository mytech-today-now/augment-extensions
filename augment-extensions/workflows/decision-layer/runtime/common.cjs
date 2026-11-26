'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
function check(ok, message) { if (!ok) throw new Error(message); }
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const finite = (x, min, max) => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max;
const id = x => typeof x === 'string' && /^[a-z][a-z0-9_-]{0,63}$/.test(x);
function text(value, name, max = 16000) { check(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `Invalid ${name}`); return value; }
function inside(root, relative) {
  check(typeof relative === 'string' && relative.length > 0 && !path.isAbsolute(relative) && !relative.includes(':'), 'Invalid relative path');
  check(!relative.split(/[\\/]/).some(p => /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p) || /[\x00-\x1f]/.test(p)), 'Unsupported device or control character path');
  const base = fs.realpathSync(root), target = path.resolve(base, relative), rel = path.relative(base, target);
  check(rel && !rel.startsWith('..') && !path.isAbsolute(rel), 'Path escapes workspace');
  let current = base;
  for (const part of rel.split(path.sep)) {
    current = path.join(current, part);
    if (fs.existsSync(current) || (() => { try { return fs.lstatSync(current).isSymbolicLink(); } catch { return false; } })()) {
      check(!fs.lstatSync(current).isSymbolicLink(), 'Symbolic links are not supported in managed paths');
    }
  }
  return target;
}
function read(file, max = 1048576) {
  check(fs.statSync(file).size <= max, 'Input exceeds size limit');
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}
function atomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  try {
    // Windows readers can briefly prevent replacement. Retain both files until a bounded retry succeeds.
    for (let attempt = 0; ; attempt++) {
      try { fs.renameSync(temporary, file); break; }
      catch (error) {
        if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 10) throw error;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
      }
    }
  } catch (error) { fs.unlinkSync(temporary); throw error; }
}
function lock(root, name) {
  const file = inside(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const token = crypto.randomBytes(16).toString('hex');
  try { fs.writeFileSync(file, JSON.stringify({ pid: process.pid, token }), { flag: 'wx', mode: 0o600 }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const owner = read(file);
    check(Number.isInteger(owner.pid) && owner.pid > 0, 'Invalid lock; inspect manually');
    let alive = true;
    try { process.kill(owner.pid, 0); } catch (e) { if (e.code === 'ESRCH') alive = false; }
    check(!alive, 'Writer already active; do not remove a live lock');
    // A recovery claimant must win another exclusive file before replacing a dead lock.
    const claim = `${file}.recovery`;
    fs.writeFileSync(claim, token, { flag: 'wx', mode: 0o600 });
    try {
      check(read(file).token === owner.token, 'Lock changed during recovery');
      fs.unlinkSync(file);
      fs.writeFileSync(file, JSON.stringify({ pid: process.pid, token }), { flag: 'wx', mode: 0o600 });
    } finally { fs.unlinkSync(claim); }
  }
  return () => { if (fs.existsSync(file) && read(file).token === token) fs.unlinkSync(file); };
}
function safeData(value) {
  const serialized = JSON.stringify(value);
  const secret = process.env.TYPESAFE_API_KEY;
  check(!secret || !serialized.includes(secret), 'Secret detected in input');
  check(!/(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_-]?key|authorization|password|secret|token)["']?\s*[:=]\s*["']?[^\s,"'}]{8,}|\b(?:sk|ghp|github_pat)-[A-Za-z0-9_-]{12,})/i.test(serialized), 'Potential secret detected; de-identify input');
  return value;
}
function config(root) {
  const value = read(inside(root, '.augx-decision/config.json'));
  const schema = require('../schemas/config.schema.json');
  const Ajv = require('ajv');
  const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);
  check(validate(value), `Invalid decision configuration: ${JSON.stringify(validate.errors)}`);
  return value;
}
module.exports = { ROOT, hash, check, object, finite, id, text, inside, read, atomic, lock, safeData, config };
