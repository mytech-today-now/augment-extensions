#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');
const { check, config, read, inside, atomic, lock, hash, safeData } = require('./common.cjs');
const install = require('./install.cjs');

async function main() {
  const operation = process.argv[2], options = JSON.parse(process.argv[3] || '{}');
  check(['setup', 'doctor', 'decide', 'run', 'resume', 'evaluate', 'examples', 'inventory', 'remove'].includes(operation), 'Unknown decision operation');
  const root = fs.realpathSync(path.resolve(options.project || process.cwd()));
  if (operation === 'setup') return install.setup(root, options);
  if (operation === 'remove') return install.remove(root);
  if (operation === 'doctor') return install.doctor(root);
  if (Number(process.versions.node.split('.')[0]) < 22) {
    const node = install.portable(root).node;
    check(fs.existsSync(node), 'Decision execution requires Node 22+; run augx decision setup to provision its isolated runtime');
    await new Promise((resolve, reject) => {
      const child = cp.spawn(node, [__filename, operation, JSON.stringify(options)], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'], windowsHide: true, shell: false });
      const forward = message => { if (message?.type === 'cancel' && child.connected) child.send({ type: 'cancel' }, () => {}); };
      process.on('message', forward);
      child.on('error', reject);
      child.on('close', code => { process.removeListener('message', forward); process.exitCode = code ?? 1; resolve(); });
    });
    return undefined;
  }
  const policy = config(root);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  const message = packet => { if (packet?.type === 'cancel') cancel(); };
  process.on('message', message);
  process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
  const mode = options.live && !options.offline ? 'live' : options.offline && !options.live ? 'offline' : null;
  check(options.providerDataConsent === undefined || operation === 'decide' && mode === 'live' && options.providerDataConsent === true, 'One-time provider consent applies only to an explicit live decide operation');
  const requestBudget = options.requests === undefined ? undefined : Number(options.requests);
  const shared = { mode, requestBudget, runId: options.id, approve: options.approve, signal: controller.signal, providerDataConsent: options.providerDataConsent === true };
  try {
    if (operation === 'inventory') { check(options.input, 'Supply --input inventory.json'); return require('./evaluate.cjs').inventory(read(path.resolve(options.input))); }
    check(mode, 'Select exactly one of --offline or --live');
    if (mode === 'live') check(Number.isInteger(requestBudget) && requestBudget > 0 && requestBudget <= policy.limits.requests, 'Live operation requires --requests within configured limit');
    if (operation === 'run' || operation === 'resume') {
      let task;
      if (operation === 'resume') { check(options.id, 'Resume requires --id'); task = read(inside(root, `.augx-decision/runs/${options.id}/state.json`)).task; }
      else { check(options.input, 'Supply --input task.json'); task = read(path.resolve(options.input)); }
      const result = await require('./runner.cjs').run(root, policy, task, { ...shared, resume: operation === 'resume' });
      if (result.status !== 'completed') process.exitCode = 1;
      return result;
    }
    if (operation === 'evaluate') { check(options.input, 'Supply --input labeled-cases.json'); return require('./evaluate.cjs').evaluate(root, policy, read(path.resolve(options.input)), shared); }
    if (operation === 'decide' || operation === 'examples') {
      const probeId = options.id || `probe-${crypto.randomBytes(8).toString('hex')}`;
      check(/^[a-z][a-z0-9_-]{0,63}$/.test(probeId), 'Invalid probe identity');
      const ledgerFile = inside(root, `.augx-decision/probes/${probeId}.json`), unlock = lock(root, `.augx-decision/probes/${probeId}.lock`);
      try {
        const input = operation === 'decide' ? read(path.resolve(options.input || '')) : { operation: 'examples' };
        safeData(input);
        const digest = hash({ input, policy, mode });
        const ledger = fs.existsSync(ledgerFile) ? read(ledgerFile) : { schemaVersion: 1, requests: 0, digest, requestBudget: requestBudget || 0 };
        check(ledger.digest === digest, 'Probe state or policy changed; choose a new --id');
        if (ledger.result) return ledger.result;
        const reserve = () => { check(ledger.requests < Math.min(ledger.requestBudget, policy.limits.requests), 'Provider probe budget exhausted'); ledger.requests += 1; atomic(ledgerFile, ledger); };
        const params = { ...shared, reserve };
        const result = operation === 'decide' ? await require('./decisions.cjs').decide(root, policy, input, params) : await require('./evaluate.cjs').examples(root, policy, params);
        ledger.result = result; atomic(ledgerFile, ledger); return result;
      } finally { unlock(); }
    }
  } finally { process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); process.removeListener('message', message); }
}
main().then(result => { if (result !== undefined) process.stdout.write(JSON.stringify(result, null, 2) + '\n'); }).catch(error => { process.stderr.write(`Decision workflow: ${String(error.message).replace(/[\r\n]/g, ' ')}\n`); process.exitCode = 2; });
