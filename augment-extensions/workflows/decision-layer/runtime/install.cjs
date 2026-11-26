'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const cp = require('child_process');
const { ROOT, check, inside, hash, read, atomic, lock, config } = require('./common.cjs');
const pins = require('../installation/sources.json');

function processEnv() {
  // Installation and workers receive no provider credentials or npm lifecycle hooks.
  const result = {};
  for (const key of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA']) if (process.env[key]) result[key] = process.env[key];
  return result;
}
function execute(executable, args, timeout = 120000) {
  const result = cp.spawnSync(executable, args, { encoding: 'utf8', timeout, windowsHide: true, shell: false, env: processEnv(), maxBuffer: 1048576 });
  check(!result.error && result.status === 0, 'Installation command failed or timed out; inspect software and rerun setup (no credentials required)');
  return result.stdout.trim();
}
function npmFor(node) {
  return [path.join(path.dirname(node), 'node_modules/npm/bin/npm-cli.js'), path.resolve(path.dirname(node), '../lib/node_modules/npm/bin/npm-cli.js')].find(p => fs.existsSync(p));
}
function portable(root) {
  const entry = pins.archives[`${process.platform}-${process.arch}`];
  check(entry, `Unsupported platform ${process.platform}-${process.arch}; supported: Windows, macOS, Linux x64/arm64`);
  const folder = entry[0].replace(/\.(zip|tar\.gz)$/, '');
  return { entry, folder, node: inside(root, `.augx-decision/software/runtime/${folder}/${process.platform === 'win32' ? 'node.exe' : 'bin/node'}`) };
}
function detect(root, forcePortable = false) {
  const item = portable(root);
  const currentCompatible = Number(process.versions.node.split('.')[0]) >= 22 && !!npmFor(process.execPath);
  const node = !forcePortable && currentCompatible ? process.execPath : item.node;
  let version = null;
  if (fs.existsSync(node)) { try { version = execute(node, ['--version'], 10000); } catch { /* Diagnostics reports a missing usable runtime. */ } }
  const npm = npmFor(node) || null;
  let npmVersion = null, installedSdkVersion = null;
  if (version && npm) { try { npmVersion = execute(node, [npm, '--version'], 10000); } catch { /* Plan reports unavailable npm explicitly. */ } }
  const sdkManifest = inside(root, '.augx-decision/software/sdk/node_modules/@typesafe-ai/sdk/package.json');
  if (fs.existsSync(sdkManifest)) { try { const found = read(sdkManifest).version; if (typeof found === 'string' && /^\d+\.\d+\.\d+$/.test(found)) installedSdkVersion = found; } catch { /* Setup repairs an invalid SDK manifest. */ } }
  const hostExecutables = {};
  for (const host of ['codex', 'claude']) {
    const names = process.platform === 'win32' ? [host + '.exe', host + '.cmd', host + '.ps1'] : [host];
    const found = (process.env.PATH || process.env.Path || '').split(path.delimiter).flatMap(directory => names.map(name => path.join(directory, name))).find(file => fs.existsSync(file) && fs.statSync(file).isFile());
    hostExecutables[host] = { path: found || null, version: null };
    if (found && (!path.extname(found) || path.extname(found) === '.exe')) { try { hostExecutables[host].version = execute(found, ['--version'], 10000); } catch { /* An installed host can remain unavailable; no host is launched for work. */ } }
  }
  return { platform: process.platform, architecture: process.arch, augxNode: process.version, runtime: node, version, npm, npmVersion, installedSdkVersion, existingConfiguration: fs.existsSync(inside(root, '.augx-decision/config.json')), hostExecutables, portable: node === item.node,
    hosts: ['.agents', '.claude'].filter(p => fs.existsSync(path.join(root, p))),
    sdk: pins.sdkVersion, skillCommit: pins.skillCommit };
}
function download(url, expected, maximum = 125829120) {
  check(/^https:\/\/(nodejs\.org\/dist\/v22\.23\.5\/|raw\.githubusercontent\.com\/typesafe-ai\/skills\/302eea662c54bca6730873fe245bec1d69ebc23d\/skills\/typesafe-ai\/)/.test(url), 'Download source not allowlisted');
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 30000 }, response => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`Official download unavailable (${response.statusCode}); no ready receipt written`)); return; }
      const chunks = []; let size = 0;
      response.on('data', chunk => { size += chunk.length; if (size > maximum) request.destroy(new Error('Download exceeds bound')); else chunks.push(chunk); });
      response.on('error', reject);
      response.on('end', () => { const bytes = Buffer.concat(chunks); if (hash(bytes) !== expected) reject(new Error('Official download checksum mismatch')); else resolve(bytes); });
    });
    const total = setTimeout(() => request.destroy(new Error('Download deadline exceeded')), 120000);
    request.on('close', () => clearTimeout(total));
    request.on('timeout', () => request.destroy(new Error('Download timed out')));
    request.on('error', reject);
  });
}
function inventory(root, relative) {
  const target = inside(root, relative), result = {};
  if (!fs.existsSync(target)) return result;
  const stat = fs.lstatSync(target);
  check(!stat.isSymbolicLink(), 'Managed root cannot be a symlink');
  if (stat.isFile()) { result[relative] = hash(fs.readFileSync(target)); return result; }
  for (const item of fs.readdirSync(target, { withFileTypes: true })) {
    if (item.isSymbolicLink()) continue;
    Object.assign(result, inventory(root, `${relative}/${item.name}`));
  }
  return result;
}
function ownedPath(relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || path.posix.normalize(relative) !== relative || relative.split('/').some(p => p === '..' || p === '.')) return false;
  return /^\.augx-decision\/(software\/[^\0]+|config\.json|install-journal\.json)$/.test(relative) || /^\.(agents|claude)\/skills\/typesafe-ai\/(SKILL\.md|LICENSE)$/.test(relative);
}
function unchanged(root, files) {
  for (const [relative, digest] of Object.entries(files)) {
    check(ownedPath(relative), 'Receipt contains an unsupported ownership path');
    const file = inside(root, relative);
    check(!fs.existsSync(file) || hash(fs.readFileSync(file)) === digest, 'Owned installation file was edited; preserve it and resolve manually');
  }
}
async function setup(root, options = {}) {
  const environment = detect(root, options.portable), host = options.host || 'codex';
  check(['codex', 'claude-code'].includes(host), 'Supported skill hosts: codex, claude-code');
  const plan = { scope: root, ...environment, selectedHost: host, operations: [environment.version ? 'Reuse compatible Node runtime and npm' : 'Download checksum-pinned portable Node with npm', 'npm ci: pinned isolated SDK, scripts disabled', 'Copy checksum-pinned official TypeSafe skill', 'Preserve or create validated config', 'Verify loading and write redacted ownership receipt'], credentialsRequired: false };
  if (options.dryRun) return { dryRun: true, plan };
  const unlock = lock(root, '.augx-decision/install.lock');
  const receiptPath = inside(root, '.augx-decision/receipt.json');
  const journalPath = inside(root, '.augx-decision/install-journal.json');
  try {
    const previous = fs.existsSync(receiptPath) ? read(receiptPath) : null;
    if (previous) unchanged(root, Object.fromEntries(Object.entries(previous.files).filter(([p]) => p !== '.augx-decision/config.json')));
    const software = inside(root, '.augx-decision/software');
    check(!fs.existsSync(software) || previous || fs.existsSync(journalPath), 'Unowned software directory exists; setup will not replace it');
    const journal = fs.existsSync(journalPath) ? read(journalPath) : { schemaVersion: 1, status: 'installing', sdk: pins.sdkVersion, files: {} };
    check(journal.schemaVersion === 1 && journal.sdk === pins.sdkVersion && journal.files && typeof journal.files === 'object', 'Invalid partial-install journal');
    atomic(journalPath, journal);
    fs.mkdirSync(software, { recursive: true });
    if (!environment.version) {
      const item = portable(root), runtimeDir = inside(root, '.augx-decision/software/runtime');
      fs.mkdirSync(runtimeDir, { recursive: true });
      const archive = path.join(runtimeDir, item.entry[0]);
      const bytes = await download(`https://nodejs.org/dist/v${pins.nodeVersion}/${item.entry[0]}`, item.entry[1]);
      fs.writeFileSync(archive, bytes, { mode: 0o600 });
      if (process.platform === 'win32') {
        const entries = await require('unzipper').Open.buffer(bytes);
        for (const entry of entries.files) {
          const output = inside(root, `.augx-decision/software/runtime/${entry.path.replace(/\/$/, '')}`);
          if (entry.type === 'Directory') fs.mkdirSync(output, { recursive: true });
          else { fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, await entry.buffer()); }
        }
      } else execute('/usr/bin/tar', ['-xzf', archive, '-C', runtimeDir], 120000);
      check(/^v2[2-9]\./.test(execute(environment.runtime, ['--version'], 10000)), 'Portable runtime validation failed');
    }
    const npm = npmFor(environment.runtime);
    check(npm, 'Runtime npm is unavailable; rerun setup --portable');
    const sdkDir = inside(root, '.augx-decision/software/sdk');
    fs.mkdirSync(sdkDir, { recursive: true });
    for (const name of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(ROOT, 'installation', name), path.join(sdkDir, name));
    let sdkReady = false;
    try { sdkReady = execute(environment.runtime, ['-e', 'const s=require(process.argv[1]);if(typeof s.TypeSafeClient!=="function"||require(process.argv[1]+"/package.json").version!=="0.7.0")process.exit(2)', path.join(sdkDir, 'node_modules/@typesafe-ai/sdk')], 10000) === ''; } catch { /* A partial install is repaired by npm ci. */ }
    if (!sdkReady) execute(environment.runtime, [npm, 'ci', '--prefix', sdkDir, '--ignore-scripts', '--no-audit', '--no-fund', '--offline=false', '--registry=https://registry.npmjs.org'], 120000);
    const skillPrefix = `${host === 'codex' ? '.agents' : '.claude'}/skills/typesafe-ai`;
    const ownedSkill = {};
    for (const [name, digest] of Object.entries(pins.skillFiles)) {
      const relative = `${skillPrefix}/${name}`, file = inside(root, relative);
      if (fs.existsSync(file)) { check(hash(fs.readFileSync(file)) === digest, 'Existing TypeSafe skill differs; preserving it. Resolve before setup.'); if (previous?.files[relative] || journal.files[relative]) ownedSkill[relative] = digest; }
      else {
        const bytes = await download(`https://raw.githubusercontent.com/typesafe-ai/skills/${pins.skillCommit}/skills/typesafe-ai/${name}`, digest, 65536);
        journal.files[relative] = digest; atomic(journalPath, journal);
        fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 }); ownedSkill[relative] = digest;
      }
    }
    const configFile = inside(root, '.augx-decision/config.json');
    const createdConfig = !fs.existsSync(configFile);
    if (createdConfig) { journal.files['.augx-decision/config.json'] = hash(fs.readFileSync(path.join(ROOT, 'examples/config.json'))); atomic(journalPath, journal); fs.copyFileSync(path.join(ROOT, 'examples/config.json'), configFile, fs.constants.COPYFILE_EXCL); }
    config(root);
    execute(environment.runtime, ['-e', 'const s=require(process.argv[1]);if(typeof s.TypeSafeClient!=="function")process.exit(2)', path.join(sdkDir, 'node_modules/@typesafe-ai/sdk')], 10000);
    check(require('../module.json').name === 'decision-layer', 'Module discovery metadata unavailable');
    const files = { ...inventory(root, '.augx-decision/software'), ...ownedSkill };
    if (createdConfig || previous?.files['.augx-decision/config.json'] || journal.files['.augx-decision/config.json']) files['.augx-decision/config.json'] = previous?.files['.augx-decision/config.json'] || journal.files['.augx-decision/config.json'] || hash(fs.readFileSync(configFile));
    const receipt = { schemaVersion: 1, status: 'installed', sdk: pins.sdkVersion, runtime: environment.runtime, runtimeVersion: execute(environment.runtime, ['--version'], 10000), host, skillCommit: pins.skillCommit, files };
    atomic(receiptPath, receipt); fs.unlinkSync(journalPath);
    return { softwareInstalled: true, configurationValid: true, credentialsAvailable: !!process.env.TYPESAFE_API_KEY, connectivity: 'NOT VERIFIED', liveEnabled: false, receipt: '.augx-decision/receipt.json' };
  } finally { unlock(); }
}
function doctor(root) {
  let configurationValid = false, softwareInstalled = false;
  try { config(root); configurationValid = true; } catch { /* Expose validity separately. */ }
  const environment = detect(root);
  try {
    check(!fs.existsSync(inside(root, '.augx-decision/install-journal.json')), 'Installation is partial');
    const receipt = read(inside(root, '.augx-decision/receipt.json'));
    check(receipt.status === 'installed' && Object.keys(receipt.files).every(p => fs.existsSync(inside(root, p))), 'Installation resources are missing');
    unchanged(root, Object.fromEntries(Object.entries(receipt.files).filter(([p]) => p !== '.augx-decision/config.json')));
    execute(environment.runtime, ['-e', 'const s=require(process.argv[1]);if(typeof s.TypeSafeClient!=="function")process.exit(2)', inside(root, '.augx-decision/software/sdk/node_modules/@typesafe-ai/sdk')], 10000);
    softwareInstalled = true;
  } catch { /* A partial installation never reports ready. */ }
  return { ...environment, softwareInstalled, configurationValid, credentialsAvailable: !!process.env.TYPESAFE_API_KEY, connectivity: 'NOT VERIFIED', liveEnabled: false, next: softwareInstalled ? 'Use --live with an explicit --requests budget and allowProviderData=true for a provider probe' : 'Run augx decision setup; partial installs can be retried' };
}
function remove(root) {
  const unlock = lock(root, '.augx-decision/install.lock');
  try {
    const receiptPath = inside(root, '.augx-decision/receipt.json'), receipt = read(receiptPath), removed = [], preserved = [];
    check(receipt.files && Object.keys(receipt.files).every(ownedPath), 'Unsupported receipt ownership');
    for (const [relative, digest] of Object.entries(receipt.files)) {
      check(ownedPath(relative), 'Unsupported receipt ownership');
      const file = inside(root, relative);
      if (!fs.existsSync(file)) continue;
      if (hash(fs.readFileSync(file)) !== digest) { preserved.push(relative); continue; }
      fs.unlinkSync(file); removed.push(relative);
    }
    if (!preserved.length) fs.unlinkSync(receiptPath);
    else atomic(receiptPath, { ...receipt, status: 'removed-with-preserved-edits', files: Object.fromEntries(preserved.map(p => [p, receipt.files[p]])) });
    return { removed: removed.length, preserved, retained: 'Run data, user files, credentials, unrelated runtimes, and empty directories' };
  } finally { unlock(); }
}
module.exports = { setup, doctor, remove, detect, download, inventory, execute, processEnv, portable };
