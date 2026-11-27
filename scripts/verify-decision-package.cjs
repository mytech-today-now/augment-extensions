'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');
const crypto = require('crypto');
const os = require('os');
const repository = path.resolve(__dirname, '..');
const tarball = path.resolve(process.argv[2]);
const node16 = process.argv[3] ? path.resolve(process.argv[3]) : null;
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-decision-packed-'));
fs.mkdirSync(path.join(consumer, '.augment'));
fs.writeFileSync(path.join(consumer, '.augment/extensions.json'), JSON.stringify({ version: '0.1.0', modules: [], settings: { autoUpdate: false, checkUpdatesOnInit: false } }));
const results = [];
function command(node, args, json = false) {
  const result = cp.spawnSync(node, args, { cwd: consumer, encoding: 'utf8', shell: false, windowsHide: true, timeout: 180000, maxBuffer: 10485760 });
  results.push({ executable: node, arguments: args, status: result.status });
  if (result.status !== 0 || result.error) throw new Error(`Consumer command failed: ${args.join(' ')}\n${result.stderr}\n${result.stdout}`);
  return json ? JSON.parse(result.stdout) : result.stdout;
}
async function main() {
  const npm = require('../augment-extensions/workflows/decision-layer/runtime/install.cjs').detect(consumer).npm;
  command(process.execPath, [npm, 'install', '--prefix', consumer, tarball, '--ignore-scripts', '--no-audit', '--no-fund', '--offline=false', '--registry=https://registry.npmjs.org']);
  const packageRoot = path.join(consumer, 'node_modules/@mytechtoday/augment-extensions');
  const cli = path.join(packageRoot, 'cli/dist/cli.js');
  const moduleRoot = path.join(packageRoot, 'augment-extensions/workflows/decision-layer');
  assert.strictEqual(fs.readFileSync(path.join(packageRoot, 'modules.md'), 'utf8').replace(/\r\n/g, '\n'), fs.readFileSync(path.join(repository, 'modules.md'), 'utf8').replace(/\r\n/g, '\n'), 'Packed catalog differs from reviewed source');
  for (const node of [process.execPath, node16].filter(Boolean)) {
    assert.match(command(node, [cli, '--help']), /decision/);
    assert.match(command(node, [cli, 'search', 'decision-layer']), /workflows\/decision-layer/);
    assert.match(command(node, [cli, 'show', 'workflows/decision-layer', 'rules/00-index.md']), /Decision Layer/);
  }
  assert(!fs.existsSync(path.join(consumer, '.augx-decision')), 'Discovery caused installation side effects');
  command(process.execPath, [cli, 'link', 'workflows/decision-layer']);
  command(process.execPath, [cli, 'export', '--target', 'all']);
  const surfaces = ['CLAUDE.md', '.cursor/rules/augx.mdc', '.windsurfrules', '.github/copilot-instructions.md'];
  const before = surfaces.map(p => fs.readFileSync(path.join(consumer, p), 'utf8'));
  command(process.execPath, [cli, 'export', '--target', 'all']);
  assert.deepStrictEqual(surfaces.map(p => fs.readFileSync(path.join(consumer, p), 'utf8')), before);
  assert(before.every(body => !/requestBudget|offline-fixture-v1|local-contract-test-only/.test(body)), 'Runtime state leaked into static rules');
  command(process.execPath, [cli, 'link', 'workflows/decision-layer', '--mirror', 'all']);
  const mirrored = JSON.parse(fs.readFileSync(path.join(consumer, '.augment/coordination.json'), 'utf8')).mirrors;
  assert.strictEqual(Object.values(mirrored).flat().length, 6);
  command(process.execPath, [cli, 'link', 'workflows/decision-layer', '--mirror', 'all']);
  command(process.execPath, [path.join(moduleRoot, 'scripts/validate.cjs')]);
  const plan = command(process.execPath, [cli, 'decision', 'setup', '--dry-run'], true);
  assert(plan.dryRun && !fs.existsSync(path.join(consumer, '.augx-decision')), 'Dry run wrote installation state');
  // Node 16 must provision a separate runtime with no global runtime mutation.
  const setupNode = node16 || process.execPath;
  assert(command(setupNode, [cli, 'decision', 'setup'], true).softwareInstalled);
  const receiptBefore = fs.readFileSync(path.join(consumer, '.augx-decision/receipt.json'), 'utf8');
  assert(command(setupNode, [cli, 'decision', 'setup'], true).softwareInstalled);
  assert.strictEqual(fs.readFileSync(path.join(consumer, '.augx-decision/receipt.json'), 'utf8'), receiptBefore);
  assert(command(process.execPath, [cli, 'decision', 'doctor'], true).softwareInstalled);
  const activation = command(setupNode, [cli, 'decision', 'setup', '--automatic', '--requests', '2'], true);
  assert(activation.automatic.enabled && activation.automatic.registrationIntact);
  assert(fs.existsSync(path.join(consumer, '.agents/skills/augx-judgments/SKILL.md')));
  assert(fs.existsSync(path.join(moduleRoot, 'runtime/chat-server.cjs')));
  assert(command(setupNode, [cli, 'decision', 'setup', '--disable-automatic'], true).automatic.enabled === false);
  fs.copyFileSync(path.join(moduleRoot, 'examples/source.txt'), path.join(consumer, 'source.txt'));
  const taskFile = path.join(moduleRoot, 'examples/task.json');
  const run = command(setupNode, [cli, 'decision', 'run', '--input', taskFile, '--offline', '--id', 'packed'], true);
  assert.strictEqual(run.status, 'completed'); assert(run.verification.passed);
  const resumed = command(setupNode, [cli, 'decision', 'resume', '--id', 'packed', '--offline'], true);
  assert.strictEqual(resumed.attempts, run.attempts);
  assert.strictEqual(command(process.execPath, [cli, 'decision', 'examples', '--offline', '--id', 'packed-examples'], true).results.length, 11);
  const evaluated = command(process.execPath, [cli, 'decision', 'evaluate', '--input', path.join(moduleRoot, 'examples/labeled-cases.json'), '--offline', '--id', 'packed-eval'], true);
  assert.strictEqual(evaluated.records.length, 24); assert.strictEqual(evaluated.metrics.verifiedCompletionRate, 20 / 24); assert.strictEqual(evaluated.metrics.missedEscalations, 0);
  fs.appendFileSync(path.join(consumer, '.agents/skills/typesafe-ai/SKILL.md'), '\nRetained local edit\n');
  const removed = command(process.execPath, [cli, 'decision', 'remove'], true);
  assert(removed.preserved.includes('.agents/skills/typesafe-ai/SKILL.md'));
  assert(fs.existsSync(path.join(consumer, '.augx-decision/runs/packed/state.json')));
  command(process.execPath, [cli, 'unlink', 'workflows/decision-layer']);
  const evidence = { status: 'passed', tarball, tarballSha256: crypto.createHash('sha256').update(fs.readFileSync(tarball)).digest('hex'), consumer, node: process.version, legacyNode: node16 ? command(node16, ['--version']).trim() : 'NOT VERIFIED', checks: results };
  fs.writeFileSync(path.join(consumer, 'verification.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ status: evidence.status, consumer, checks: results.length, legacyNode: evidence.legacyNode }));
}
main().catch(error => { console.error(error.message); fs.writeFileSync(path.join(consumer, 'failure.json'), JSON.stringify({ error: error.message, checks: results }, null, 2)); process.exitCode = 1; });
