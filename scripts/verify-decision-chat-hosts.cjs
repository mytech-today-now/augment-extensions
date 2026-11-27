'use strict';
// Isolated host registration/health checks only. Never starts a chat model or provider request.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const repo = path.resolve(__dirname, '..');
const chat = require(path.join(repo, 'augment-extensions/workflows/decision-layer/runtime/chat-install.cjs'));
const common = require(path.join(repo, 'augment-extensions/workflows/decision-layer/runtime/common.cjs'));
const artifacts = path.join(repo, 'test-artifacts/decision-chat'); fs.mkdirSync(artifacts, { recursive: true });
const results = [];
for (const host of ['codex', 'claude-code']) {
  const root = fs.mkdtempSync(path.join(artifacts, host + '-'));
  fs.mkdirSync(path.join(root, '.git'));
  common.atomic(path.join(root, '.augx-decision/config.json'), common.read(path.join(repo, 'augment-extensions/workflows/decision-layer/examples/config.json')));
  chat.install(root, host, process.execPath, 2);
  const profile = path.join(root, 'isolated-profile'); fs.mkdirSync(profile);
  const env = { ...process.env }; delete env.TYPESAFE_API_KEY; delete env.ANTHROPIC_API_KEY; delete env.OPENAI_API_KEY;
  if (host === 'codex') {
    env.CODEX_HOME = profile;
    fs.writeFileSync(path.join(profile, 'config.toml'), `[projects.${JSON.stringify(root)}]\ntrust_level = "trusted"\n`);
  } else {
    env.CLAUDE_CONFIG_DIR = profile;
    const file = path.join(root, '.claude/settings.local.json'); const value = common.read(file);
    value.enabledMcpjsonServers = ['augx_decision']; common.atomic(file, value);
  }
  const command = (host === 'codex' ? 'codex' : 'claude') + (process.platform === 'win32' ? '.exe' : '');
  const args = ['mcp', 'get', 'augx_decision', ...(host === 'codex' ? ['--json'] : [])];
  const version = cp.spawnSync(command, ['--version'], { cwd: root, env, encoding: 'utf8', windowsHide: true, timeout: 10000 });
  const result = cp.spawnSync(command, args, { cwd: root, env, encoding: 'utf8', windowsHide: true, timeout: 30000, maxBuffer: 1048576 });
  results.push({ host, version: version.stdout?.trim(), root, command: [command, ...args], status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.code,
    category: 'installed-host-configuration-and-health-inspection; no chat model or provider' });
  if (result.status !== 0 || result.error) process.exitCode = 1;
}
fs.writeFileSync(path.join(artifacts, 'host-probe.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
