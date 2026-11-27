'use strict';
// Disposable installed-package checks. Never installs decision software or calls a provider.
const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');
const assert = require('assert');
const crypto = require('crypto');
const expected = ['coding-standards/java', 'coding-standards/spring', 'workflows/decision-layer', 'workflows/agent-engineering', 'workflows/cross-platform'];
const env = { ...process.env, TYPESAFE_API_KEY: '' };
const checks = [];
function check(name, callback) { const value = callback(); checks.push(name); return value; }

async function verify(consumer, packageRoot) {
  process.chdir(consumer);
  const cli = path.join(packageRoot, 'cli/dist/cli.js');
  const command = (args, success = true) => {
    const result = cp.spawnSync(process.execPath, [cli, ...args], { cwd: consumer, env, encoding: 'utf8', shell: false, windowsHide: true, timeout: 30000 });
    if (success) assert.strictEqual(result.status, 0, `${args.join(' ')}: ${result.stderr}`);
    return result;
  };
  const config = path.join(consumer, '.augment/extensions.json');
  fs.mkdirSync(path.dirname(config), { recursive: true });
  const initial = [{ name: 'coding-standards/python', version: '1.0.0', pinnedAt: 'preserved', custom: 7 }];
  fs.writeFileSync(config, JSON.stringify({ version: 'legacy', modules: initial, settings: { custom: true } }));
  const read = () => JSON.parse(fs.readFileSync(config, 'utf8'));
  check('ordinary startup and declared package engine', () => {
    assert.match(command(['--help']).stdout, /decision/);
    assert.strictEqual(require(path.join(packageRoot, 'package.json')).engines.node, '>=16.0.0');
  });
  const listed = check('recent canonical additions packaged and discoverable', () => JSON.parse(command(['list', '--json']).stdout));
  for (const id of expected) assert(listed.some(m => m.name === id), `Packaged discovery is missing ${id}`);
  for (const [query, id] of [['JAVA', expected[0]], ['java-standards', expected[0]], ['Spring Boot', expected[1]], ['Jev', expected[2]], ['TypeSafe', expected[2]], ['decision-layer', expected[2]], ['harness', expected[3]], ['loops', expected[3]], ['graphs', expected[3]], ['cross-platform', expected[4]]]) {
    check(`search ${query}`, () => assert(command(['search', query]).stdout.includes(id)));
  }
  const { guiCommand } = require(path.join(packageRoot, 'cli/dist/commands/gui.js'));
  const { getGuiModuleAssets } = require(path.join(packageRoot, 'cli/dist/commands/gui-module-manager.js'));
  const { discoverModules } = require(path.join(packageRoot, 'cli/dist/utils/module-system.js'));
  check('packaged optional guidance, contracts and runtime assets are available', () => {
    const modules = discoverModules();
    for (const [id, assets] of [
      [expected[3], ['schemas/contracts.schema.json', 'templates/agent.json', 'examples/loop.cjs', 'examples/graphs.cjs', 'scripts/validate.cjs']],
      [expected[2], ['schemas/config.schema.json', 'runtime/contracts.d.ts', 'examples/config.json']]
    ]) {
      const module = modules.find(m => m.fullName === id);
      for (const asset of assets) assert(getGuiModuleAssets(module).includes(asset), `Missing packaged guidance ${id}/${asset}`);
    }
    for (const asset of ['runtime/cli.cjs', 'runtime/runner.cjs', 'installation/package-lock.json']) {
      assert(fs.existsSync(path.join(packageRoot, 'augment-extensions', expected[2], asset)), `Missing optional runtime asset ${asset}`);
    }
    command(['validate', expected[4]]);
  });
  const logs = [], errors = [];
  const originalLog = console.log, originalError = console.error;
  const session = async (answers, inspect) => {
    console.log = (...args) => logs.push(args.join(' ')); console.error = (...args) => errors.push(args.join(' '));
    try {
      await guiCommand({}, { prompt: async questions => {
        if (inspect) inspect(questions);
        assert(answers.length, 'Unexpected extra prompt in installed manager');
        return answers.shift();
      } });
      assert.strictEqual(answers.length, 0, 'Manager returned before consuming the intended flow');
      assert.deepStrictEqual(errors, [], `Installed manager diagnostics: ${errors.join('\n')}`);
    } finally { console.log = originalLog; console.error = originalError; }
  };
  for (const id of expected) {
    const module = discoverModules().find(m => m.fullName === id);
    assert(module && getGuiModuleAssets(module).includes('README.md'));
    await session([{ action: 'browse-modules' }, { moduleId: id }, { asset: 'README.md' }, { asset: 'back' }, { action: 'exit' }]);
    assert(logs.join('\n').includes(`Manifest name: ${module.metadata.name}`));
    check(`GUI details/assets ${id}`, () => assert(logs.join('\n').includes(module.metadata.description)));
  }
  let checkboxVisit = 0;
  await session([{ action: 'search' }, { searchTerm: 'Java Coding Standards' }, { linkNow: true }, { selectedModules: [expected[0]] }, { confirm: true },
    { action: 'link-modules' }, { selectedModules: [initial[0].name, expected[0]] }, { action: 'exit' }], questions => {
    const checkbox = questions.find(q => q.name === 'selectedModules');
    if (checkbox && ++checkboxVisit === 2) assert(checkbox.choices.find(c => c.value === expected[0]).checked);
  });
  check('filtered mutation, refresh and unchanged selection preserve pinned unrelated state', () => {
    assert.deepStrictEqual(read().modules[0], initial[0]); assert.strictEqual(read().modules.length, 2); assert(read().settings.custom);
  });
  check('ordinary GUI browsing/linking has no optional runtime or SDK side effects', () => {
    assert(!fs.existsSync(path.join(consumer, '.augx-decision')));
    assert(!Object.keys(require.cache).some(file => /typesafe-ai[\\/]sdk|decision-layer[\\/]runtime/.test(file)));
  });
  // All fixture assets below belong to this disposable installed package.
  const fixture = path.join(packageRoot, 'augment-extensions/coding-standards/future-fixture');
  fs.mkdirSync(path.join(fixture, 'rules'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'module.json'), JSON.stringify({ name: 'future-standards', version: '1.0.0', displayName: 'Java Coding Standards', description: 'Future fixture', type: 'coding-standards', tags: ['future-sentinel'] }));
  fs.writeFileSync(path.join(fixture, 'README.md'), '# Future fixture\n');
  fs.writeFileSync(path.join(fixture, 'rules/fixture.md'), '# Static future rule\n');
  check('new valid manifest discovered without registry edits', () => assert(JSON.parse(command(['list', '--json']).stdout).some(m => m.name === 'coding-standards/future-fixture')));
  await session([{ action: 'search' }, { searchTerm: 'future-sentinel' }, { linkNow: true }, { selectedModules: ['coding-standards/future-fixture'] }, { confirm: true }, { action: 'exit' }]);
  check('future module and duplicate display name use canonical identity for selection', () => assert(read().modules.some(m => m.name === 'coding-standards/future-fixture')));
  const originalConfig = fs.readFileSync(config, 'utf8');
  await session([{ action: 'link-modules' }, { selectedModules: [] }, { confirm: false }, { action: 'exit' }]);
  check('cancellation leaves configuration byte-identical', () => assert.strictEqual(fs.readFileSync(config, 'utf8'), originalConfig));
  check('packaged configuration diagnostics omit malformed source contents', () => {
    fs.writeFileSync(config, 'private-config-sentinel');
    try {
      const { loadExtensionsConfig } = require(path.join(packageRoot, 'cli/dist/utils/extensions-config.js'));
      const loaded = loadExtensionsConfig(consumer);
      assert.strictEqual(loaded.valid, false);
      assert.strictEqual(loaded.error, 'invalid JSON in .augment/extensions.json');
      assert.strictEqual(fs.readFileSync(config, 'utf8'), 'private-config-sentinel');
    } finally { fs.writeFileSync(config, originalConfig); }
  });
  check('packaged decision input validation omits malformed source contents', () => {
    const input = path.join(consumer, 'invalid input.json');
    fs.writeFileSync(input, 'private-input-sentinel');
    const { validateGuiDecisionOptions } = require(path.join(packageRoot, 'cli/dist/commands/gui-decision.js'));
    assert.throws(() => validateGuiDecisionOptions('run', { project: consumer, input, offline: true, id: 'invalid' }),
      /^Error: Input file contains invalid JSON\. Fix its syntax before retrying\.$/);
    assert(!fs.existsSync(path.join(consumer, '.augx-decision')));
  });
  for (const id of expected.slice(1)) command(['link', id]);
  command(['export', '--target', 'all']);
  const targets = ['CLAUDE.md', '.cursor/rules/augx.mdc', '.windsurfrules', '.github/copilot-instructions.md'];
  const before = targets.map(file => fs.readFileSync(path.join(consumer, file), 'utf8'));
  command(['export', '--target', 'all']);
  check('four exports remain deterministic and static', () => {
    assert.deepStrictEqual(targets.map(file => fs.readFileSync(path.join(consumer, file), 'utf8')), before);
    assert(before.every(body => !body.includes('deterministic-offline-fixture')));
  });
  fs.appendFileSync(path.join(consumer, targets[0]), '\nRetained hand edit\n');
  check('export hand-edit protection', () => assert.strictEqual(command(['export', '--target', 'claude-code'], false).status, 3));
  command(['link', expected[2], '--mirror', 'all']);
  check('mirrors remain rules-only', () => {
    const mirrors = JSON.parse(fs.readFileSync(path.join(consumer, '.augment/coordination.json'), 'utf8')).mirrors[expected[2]];
    assert.strictEqual(mirrors.length, 6);
    for (const entry of mirrors) {
      const body = fs.readFileSync(path.join(consumer, entry.targetPath), 'utf8');
      assert(!body.includes('deterministic-offline-fixture'));
      assert(body.includes('Decision') || body.includes('decision') || body.includes('TypeSafe'));
    }
  });
  command(['unlink', expected[2]]);
  check('unlink does not install or remove operational software', () => assert(!fs.existsSync(path.join(consumer, '.augx-decision'))));
  const nonTty = command(['gui']);
  check('non-interactive diagnostic', () => assert(nonTty.stdout.includes('interactive TTY')));
  if (Number(process.versions.node.split('.')[0]) >= 22) {
    const moduleRoot = path.join(packageRoot, 'augment-extensions/workflows/decision-layer');
    fs.mkdirSync(path.join(consumer, '.augx-decision'), { recursive: true });
    fs.copyFileSync(path.join(moduleRoot, 'examples/config.json'), path.join(consumer, '.augx-decision/config.json'));
    await session([{ action: 'decision' }, { operation: 'examples' }, { mode: 'offline' }, { id: 'package-gui' }, { confirm: true }, { action: 'exit' }]);
    check('packed GUI executes explicit offline examples without SDK installation', () => {
      const probe = JSON.parse(fs.readFileSync(path.join(consumer, '.augx-decision/probes/package-gui.json'), 'utf8'));
      assert.strictEqual(probe.result.provenance, 'offline'); assert.strictEqual(probe.result.results.length, 11);
      assert(!fs.existsSync(path.join(consumer, '.augx-decision/software')));
    });
  }
  assert.deepStrictEqual(errors, [], 'Installed GUI reported errors');
  console.log(JSON.stringify({ node: process.version, consumer, checks }));
}

async function main() {
  if (process.argv[2] === '--consumer') return verify(path.resolve(process.argv[3]), path.resolve(process.argv[4]));
  const tarball = path.resolve(process.argv[2]);
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'augx GUI package '));
  const npm = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const install = cp.spawnSync(process.execPath, [npm, 'install', '--prefix', workspace, tarball, '--ignore-scripts', '--no-audit', '--no-fund', '--offline=false', '--registry=https://registry.npmjs.org'], { env, encoding: 'utf8', shell: false, windowsHide: true, timeout: 180000 });
  assert.strictEqual(install.status, 0, install.stderr);
  const packageRoot = path.join(workspace, 'node_modules/@mytechtoday/augment-extensions');
  const results = [];
  for (const executable of [process.execPath, process.argv[3] && path.resolve(process.argv[3])].filter(Boolean)) {
    const consumer = path.join(workspace, `project unicodé ${results.length}`); fs.mkdirSync(consumer);
    const result = cp.spawnSync(executable, [__filename, '--consumer', consumer, packageRoot], { env, encoding: 'utf8', shell: false, windowsHide: true, timeout: 180000, maxBuffer: 10485760 });
    if (result.status !== 0) throw new Error(`Packed GUI consumer failed: ${result.stdout}\n${result.stderr}`);
    const lines = result.stdout.trim().split(/\r?\n/);
    results.push(JSON.parse(lines[lines.length - 1]));
  }
  const evidence = { tarball, sha256: crypto.createHash('sha256').update(fs.readFileSync(tarball)).digest('hex'), workspace, results };
  fs.writeFileSync(path.join(workspace, 'verification.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ status: 'passed', workspace, runtimes: results.map(result => ({ node: result.node, checks: result.checks.length })) }));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
