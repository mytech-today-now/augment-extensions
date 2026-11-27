'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, check, inside, read, atomic, hash, config } = require('./common.cjs');
const receiptName = '.augx-decision/chat-receipt.json';
const begin = '# BEGIN AUGX DECISION MCP';
const end = '# END AUGX DECISION MCP';
const permission = 'mcp__augx_decision__judge';
const writeText = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Host settings are small. Exclusive temporary writes and rename preserve the previous file on failure.
  const temporary = file + '.' + require('crypto').randomBytes(8).toString('hex') + '.tmp';
  try { fs.writeFileSync(temporary, content, { flag: 'wx', mode: 0o600 }); fs.renameSync(temporary, file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
};
function receipt(root) {
  const file = inside(root, receiptName);
  const value = fs.existsSync(file) ? read(file) : { schemaVersion: 1, items: [] };
  check(value.schemaVersion === 1 && Array.isArray(value.items), 'Invalid chat ownership receipt');
  for (const item of value.items) check([
    'file:.agents/skills/augx-judgments/SKILL.md', 'file:.claude/skills/augx-judgments/SKILL.md',
    'toml:.codex/config.toml', 'mcp:.mcp.json', 'permission:.claude/settings.local.json'
  ].includes(`${item.kind}:${item.path}`) && /^[a-f0-9]{64}$/.test(item.sha256) && (!item.previousSha256 || /^[a-f0-9]{64}$/.test(item.previousSha256)), 'Unsupported chat ownership path');
  return value;
}
function json(root, relative) {
  const file = inside(root, relative);
  const value = fs.existsSync(file) ? read(file) : {};
  check(value && typeof value === 'object' && !Array.isArray(value), 'Invalid host settings');
  return value;
}
function block(content) {
  const start = content.indexOf(begin), finish = content.indexOf(end);
  if (start < 0 && finish < 0) return null;
  check(start >= 0 && finish > start && content.indexOf(begin, start + begin.length) < 0 && content.indexOf(end, finish + end.length) < 0, 'Invalid managed host block');
  return content.slice(start, finish + end.length);
}
function current(root, item) {
  const file = inside(root, item.path);
  if (!fs.existsSync(file)) return null;
  if (item.kind === 'file') return fs.readFileSync(file, 'utf8');
  if (item.kind === 'toml') return block(fs.readFileSync(file, 'utf8'));
  const value = json(root, item.path);
  if (item.kind === 'mcp') return value.mcpServers?.augx_decision ?? null;
  return value.permissions?.allow?.includes(permission) ? permission : null;
}
function plan(root, host, runtime) {
  const script = path.join(ROOT, 'runtime/chat-server.cjs');
  const args = [script, root, host];
  const skill = fs.readFileSync(path.join(ROOT, 'installation/augx-judgments/SKILL.md'), 'utf8');
  const assets = [{ kind: 'file', path: `${host === 'codex' ? '.agents' : '.claude'}/skills/augx-judgments/SKILL.md`, value: skill }];
  if (host === 'codex') assets.push({ kind: 'toml', path: '.codex/config.toml', value:
    `${begin}\n[mcp_servers.augx_decision]\ncommand = ${JSON.stringify(runtime)}\nargs = ${JSON.stringify(args)}\nenv_vars = ["TYPESAFE_API_KEY"]\nstartup_timeout_sec = 20\ntool_timeout_sec = 65\nenabled_tools = ["judge"]\n[mcp_servers.augx_decision.tools.judge]\napproval_mode = "approve"\n${end}` });
  else assets.push({ kind: 'mcp', path: '.mcp.json', value: { type: 'stdio', command: runtime, args } }, { kind: 'permission', path: '.claude/settings.local.json', value: permission });
  return assets;
}
function preflight(root, host, runtime) {
  check(['codex', 'claude-code'].includes(host), 'Unsupported automatic host');
  const previous = receipt(root), assets = plan(root, host, runtime);
  for (const item of previous.items) {
    const value = current(root, item);
    check(value === null || [item.sha256, item.previousSha256].includes(hash(value)), 'Owned chat integration was edited; preserving it');
  }
  for (const item of assets) {
    if (item.kind === 'mcp' || item.kind === 'permission') {
      const settings = json(root, item.path);
      const object = value => value && typeof value === 'object' && !Array.isArray(value);
      if (item.kind === 'mcp') check(settings.mcpServers === undefined || object(settings.mcpServers), 'Invalid MCP host settings');
      else check(settings.permissions === undefined || object(settings.permissions) && (settings.permissions.allow === undefined || Array.isArray(settings.permissions.allow) && settings.permissions.allow.every(p => typeof p === 'string')), 'Invalid host permission settings');
    }
    const value = current(root, item);
    if (value !== null) check(hash(value) === hash(item.value) || previous.items.some(p => p.kind === item.kind && p.path === item.path), 'Existing chat integration conflicts; preserving it');
    if (item.kind === 'toml') {
      const file = inside(root, item.path), content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      // Conservative conflict detection also covers quoted and inline TOML forms.
      check(!content.replace(block(content) || '', '').includes('augx_decision'), 'Existing Codex server key conflicts');
    }
  }
  return { previous, assets };
}
function install(root, host, runtime, requests) {
  const { previous, assets } = preflight(root, host, runtime);
  const policy = config(root);
  check(Number.isSafeInteger(requests) && requests > 0 && requests <= policy.limits.requests, 'Automatic setup requires --requests within configured limit');
  // Disable before any registration mutation so interrupted activation cannot send data.
  if (policy.automatic) { policy.automatic.enabled = false; atomic(inside(root, '.augx-decision/config.json'), policy); }
  for (const item of assets) {
    const value = current(root, item), owned = previous.items.find(p => p.kind === item.kind && p.path === item.path);
    if (value !== null && !owned) continue;
    const entry = { kind: item.kind, path: item.path, sha256: hash(item.value), ...(value !== null ? { previousSha256: hash(value) } : {}) };
    // Record intent first. An interrupted write stays disabled and is repairable on rerun.
    previous.items = previous.items.filter(p => !(p.kind === item.kind && p.path === item.path));
    previous.items.push(entry); atomic(inside(root, receiptName), previous);
    const file = inside(root, item.path);
    if (item.kind === 'file') writeText(file, item.value);
    else if (item.kind === 'toml') {
      const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      writeText(file, value === null ? content + '\n' + item.value + '\n' : content.replace(value, item.value));
    } else {
      const content = json(root, item.path);
      if (item.kind === 'mcp') { content.mcpServers ||= {}; content.mcpServers.augx_decision = item.value; }
      else { content.permissions ||= {}; content.permissions.allow ||= []; if (!content.permissions.allow.includes(permission)) content.permissions.allow.push(permission); }
      atomic(file, content);
    }
    delete entry.previousSha256; atomic(inside(root, receiptName), previous);
  }
  policy.automatic = { capabilities: ['classify', 'rank-retrieval'], dataClasses: ['public'], timeoutMs: Math.min(10000, policy.limits.requestMs), ...policy.automatic, enabled: true, host, requests };
  policy.allowProviderData = true;
  atomic(inside(root, '.augx-decision/config.json'), policy);
  return status(root);
}
function disable(root) {
  const policy = config(root);
  if (policy.automatic) { policy.automatic.enabled = false; atomic(inside(root, '.augx-decision/config.json'), policy); }
  const previous = receipt(root), preserved = [];
  for (const item of previous.items) {
    const value = current(root, item);
    if (value === null) continue;
    if (hash(value) !== item.sha256) { preserved.push(item); continue; }
    const file = inside(root, item.path);
    if (item.kind === 'file') fs.unlinkSync(file);
    else if (item.kind === 'toml') writeText(file, fs.readFileSync(file, 'utf8').replace(value, ''));
    else {
      const content = json(root, item.path);
      if (item.kind === 'mcp') delete content.mcpServers.augx_decision;
      else content.permissions.allow = content.permissions.allow.filter(p => p !== permission);
      atomic(file, content);
    }
  }
  if (preserved.length) atomic(inside(root, receiptName), { ...previous, items: preserved });
  else if (fs.existsSync(inside(root, receiptName))) fs.unlinkSync(inside(root, receiptName));
  return { enabled: false, preserved: preserved.map(p => p.path), retained: 'Automatic request ledger and all unrelated host settings' };
}
function status(root) {
  try {
    const policy = config(root), saved = policy.automatic;
    receipt(root);
    const installation = inside(root, '.augx-decision/receipt.json');
    const runtime = fs.existsSync(installation) ? read(installation).runtime : process.execPath;
    const required = saved ? plan(root, saved.host, runtime || process.execPath) : [];
    return { enabled: saved?.enabled === true, host: saved?.host || null,
      registrationIntact: required.length > 0 && required.every(item => { const value = current(root, item); return value !== null && hash(value) === hash(item.value); }),
      providerDataAllowed: policy.allowProviderData, requestLimit: saved?.requests ?? 0,
      requestsUsed: fs.existsSync(inside(root, '.augx-decision/automatic-ledger.json')) ? read(inside(root, '.augx-decision/automatic-ledger.json')).requests : 0,
      hostSession: 'NOT VERIFIED', connectivity: 'NOT VERIFIED',
      next: 'Restart the host in this trusted project; approve its project MCP server once if requested. Managed deny/ask rules remain authoritative.' };
  } catch { return { enabled: false, registrationIntact: false, hostSession: 'NOT VERIFIED', connectivity: 'NOT VERIFIED', error: 'Inspect automatic policy, host settings and chat ownership receipt locally' }; }
}
module.exports = { install, disable, status, preflight };
