import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PassThrough } from 'stream';
import { spawn } from 'child_process';

const moduleRoot = path.resolve('augment-extensions/workflows/decision-layer');
const common = require(path.join(moduleRoot, 'runtime/common.cjs'));
const decisions = require(path.join(moduleRoot, 'runtime/decisions.cjs'));
const chat = require(path.join(moduleRoot, 'runtime/chat-install.cjs'));
const installer = require(path.join(moduleRoot, 'runtime/install.cjs'));
const { automatic, stateDigest } = require(path.join(moduleRoot, 'runtime/automatic.cjs'));
const { serve } = require(path.join(moduleRoot, 'runtime/chat-server.cjs'));
const source = path.resolve('test-artifacts/decision-consumer-source');
const hasSdk = fs.existsSync(path.join(source, '.augx-decision/software/sdk/node_modules/@typesafe-ai/sdk'));
let root: string, policy: any, oldKey: string | undefined;
const save = () => common.atomic(path.join(root, '.augx-decision/config.json'), policy);
const ledger = () => common.read(path.join(root, '.augx-decision/automatic-ledger.json'));
function input(revision = 0) {
  return { capability: 'classify', dataClass: 'public',
    state: { goal: 'Classify this reported application defect', revision, evidence: ['The public demo crashes on startup.'], completed: [], issues: [], constraints: [], capabilities: [] },
    candidates: [{ id: 'bug', description: 'Unexpected application failure' }, { id: 'feature', description: 'Request for new functionality' }] };
}
function seedSdk() {
  if (!hasSdk) throw new Error('Run npm run test:decision to install the verified SDK prerequisite');
  // The installed Windows Node cpSync loses this Unicode destination. Use ordinary file copies.
  const copy = (from: string, to: string) => {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (entry.isDirectory()) copy(path.join(from, entry.name), path.join(to, entry.name));
      else fs.copyFileSync(path.join(from, entry.name), path.join(to, entry.name));
    }
  };
  copy(path.join(source, '.augx-decision/software/sdk'), path.join(root, '.augx-decision/software/sdk'));
  expect(fs.existsSync(path.join(root, '.augx-decision/software/sdk/node_modules/@typesafe-ai/sdk'))).toBe(true);
}
function transport(transform = (result: any) => result, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init: any) => {
    expect(String(url)).toBe('https://api.typesafe.ai/v1/systemone');
    expect(ledger().requests).toBeGreaterThan(0);
    const request = JSON.parse(init.body);
    const result = { ...decisions.fixture(request.questions), model: policy.model, usage: { input_tokens: 12, output_tokens: 0 } };
    return new Response(JSON.stringify(transform(result)), { status, headers: { 'content-type': 'application/json' } });
  });
}
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'augx chat unicodé '));
  policy = common.read(path.join(moduleRoot, 'examples/config.json'));
  policy.allowProviderData = true;
  policy.automatic = { enabled: true, host: 'codex', capabilities: ['classify', 'rank-retrieval'], dataClasses: ['public'], requests: 3, timeoutMs: 1000 };
  save();
  oldKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = 'fixture-key-only';
});
afterEach(() => {
  vi.restoreAllMocks();
  if (oldKey === undefined) delete process.env.TYPESAFE_API_KEY; else process.env.TYPESAFE_API_KEY = oldKey;
  fs.rmSync(root, { recursive: true, force: true });
});

describe('one-time native chat configuration', () => {
  it.each(['codex', 'claude-code'])('persists idempotent policy and registration for %s without invoking the provider', host => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No network expected'));
    chat.install(root, host, process.execPath, 3);
    expect(common.config(root).automatic).toMatchObject({ enabled: true, host, requests: 3 });
    const first = fs.readFileSync(path.join(root, '.augx-decision/chat-receipt.json'), 'utf8');
    chat.install(root, host, process.execPath, 3);
    expect(fs.readFileSync(path.join(root, '.augx-decision/chat-receipt.json'), 'utf8')).toBe(first);
    expect(chat.status(root)).toMatchObject({ enabled: true, registrationIntact: true, hostSession: 'NOT VERIFIED' });
    expect(fetch).not.toHaveBeenCalled();
    chat.disable(root);
    expect(common.config(root).automatic.enabled).toBe(false);
    expect(chat.status(root).registrationIntact).toBe(false);
    if (host === 'codex') expect(fs.readFileSync(path.join(root, '.codex/config.toml'), 'utf8')).not.toContain('augx_decision');
    else expect(common.read(path.join(root, '.mcp.json')).mcpServers.augx_decision).toBeUndefined();
  });
  it('preserves unrelated host settings including edits added after setup', () => {
    fs.mkdirSync(path.join(root, '.claude'));
    common.atomic(path.join(root, '.mcp.json'), { mcpServers: { other: { command: 'keep' } } });
    common.atomic(path.join(root, '.claude/settings.local.json'), { permissions: { deny: ['Bash(rm *)'] } });
    chat.install(root, 'claude-code', process.execPath, 3);
    const value = common.read(path.join(root, '.mcp.json')); value.custom = true;
    common.atomic(path.join(root, '.mcp.json'), value);
    chat.disable(root);
    expect(common.read(path.join(root, '.mcp.json'))).toEqual({ custom: true, mcpServers: { other: { command: 'keep' } } });
    expect(common.read(path.join(root, '.claude/settings.local.json')).permissions.deny).toEqual(['Bash(rm *)']);
  });
  it('retains a user-edited owned skill while disabling provider policy first', () => {
    chat.install(root, 'codex', process.execPath, 3);
    const file = path.join(root, '.agents/skills/augx-judgments/SKILL.md'); fs.appendFileSync(file, '\nUser notes\n');
    expect(() => chat.install(root, 'codex', process.execPath, 3)).toThrow('edited');
    expect(chat.disable(root).preserved).toContain('.agents/skills/augx-judgments/SKILL.md');
    expect(fs.readFileSync(file, 'utf8')).toContain('User notes');
    expect(common.config(root).automatic.enabled).toBe(false);
  });
  it('preserves conflicting native settings before any activation mutation', () => {
    fs.mkdirSync(path.join(root, '.codex'));
    const file = path.join(root, '.codex/config.toml'); fs.writeFileSync(file, '[mcp_servers."augx_decision"]\ncommand="keep"\n');
    const before = fs.readFileSync(file, 'utf8');
    expect(() => chat.install(root, 'codex', process.execPath, 3)).toThrow('conflicts');
    expect(fs.readFileSync(file, 'utf8')).toBe(before);
    expect(fs.existsSync(path.join(root, '.augx-decision/chat-receipt.json'))).toBe(false);
  });
  it('rejects receipt traversal and malformed settings without writing outside scope', () => {
    common.atomic(path.join(root, '.augx-decision/chat-receipt.json'), { schemaVersion: 1, items: [{ kind: 'file', path: '../other', sha256: 'a'.repeat(64) }] });
    expect(() => chat.disable(root)).toThrow('ownership');
    expect(common.config(root).automatic.enabled).toBe(false);
  });
  it('reuses pre-existing identical skill without claiming its ownership', () => {
    const target = path.join(root, '.agents/skills/augx-judgments/SKILL.md'); fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(moduleRoot, 'installation/augx-judgments/SKILL.md'), target);
    chat.install(root, 'codex', process.execPath, 3); chat.disable(root);
    expect(fs.existsSync(target)).toBe(true);
  });
  it('keeps interrupted registration disabled and repairs the recorded partial installation', () => {
    const nativeFs = require('fs'), rename = nativeFs.renameSync;
    const denied = vi.spyOn(nativeFs, 'renameSync').mockImplementation((from: any, to: any) => {
      if (String(to).endsWith(path.join('.codex', 'config.toml'))) throw new Error('Simulated host settings failure');
      return rename(from, to);
    });
    expect(() => chat.install(root, 'codex', process.execPath, 3)).toThrow('Simulated');
    expect(common.config(root).automatic.enabled).toBe(false);
    denied.mockRestore();
    expect(chat.install(root, 'codex', process.execPath, 3).registrationIntact).toBe(true);
  });
  it('diagnoses a removed pre-existing skill instead of claiming complete registration', () => {
    chat.install(root, 'codex', process.execPath, 3);
    fs.unlinkSync(path.join(root, '.agents/skills/augx-judgments/SKILL.md'));
    expect(chat.status(root).registrationIntact).toBe(false);
  });
  it('requires an explicit valid cumulative budget in the public setup path', async () => {
    await expect(installer.setup(root, { automatic: true, requests: '0', dryRun: true })).rejects.toThrow('--requests');
    const result = await installer.setup(root, { automatic: true, requests: '3', dryRun: true });
    expect(result.plan.automatic).toMatchObject({ publicProviderDataConsent: true, cumulativeRequests: 3 });
    expect(fs.existsSync(path.join(root, '.codex'))).toBe(false);
  }, 30000);
  it('stores explicitly selected automatic data classes without resetting consumed accounting', () => {
    common.atomic(path.join(root, '.augx-decision/automatic-ledger.json'), { schemaVersion: 1, requests: 2, entries: { first: { status: 'failed' }, second: { status: 'answered' } } });
    chat.install(root, 'codex', process.execPath, 4, ['public', 'internal']);
    expect(common.config(root).automatic.dataClasses).toEqual(['public', 'internal']);
    const before = fs.readFileSync(path.join(root, '.augx-decision/automatic-ledger.json'), 'utf8');
    chat.install(root, 'codex', process.execPath, 4, ['public']);
    expect(common.config(root).automatic.dataClasses).toEqual(['public']);
    expect(fs.readFileSync(path.join(root, '.augx-decision/automatic-ledger.json'), 'utf8')).toBe(before);
  });
  it('reports a bounded local MCP health check separately from provider and chat evidence', () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Provider must not be called during health checks'));
    chat.install(root, 'codex', process.execPath, 3);
    const result = installer.doctor(root);
    expect(result.automatic.registrationIntact).toBe(true);
    expect(result.mcpHealth).toMatchObject({ state: 'HEALTHY' });
    expect(result.automatic.hostSession).toBe('NOT VERIFIED');
    expect(result.connectivity).toBe('NOT VERIFIED');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not report local MCP health when project registration integrity is broken', () => {
    chat.install(root, 'claude-code', process.execPath, 3);
    fs.unlinkSync(path.join(root, '.mcp.json'));
    const result = installer.doctor(root);
    expect(result.automatic.registrationIntact).toBe(false);
    expect(result.mcpHealth).toMatchObject({ state: 'NOT VERIFIED' });
  });
  it('reports an unavailable local MCP process as NOT VERIFIED without provider credentials', () => {
    const childProcess = require('child_process');
    const originalSpawnSync = childProcess.spawnSync;
    chat.install(root, 'codex', process.execPath, 3);
    const spawnCheck = vi.spyOn(childProcess, 'spawnSync').mockImplementation((command: any, args: any[], options: any) => {
      if (args?.some(value => value === path.join(moduleRoot, 'runtime', 'chat-server.cjs'))) {
        return { error: Object.assign(new Error('private local diagnostic'), { code: 'EACCES' }), status: null, stdout: '', stderr: '', signal: null, pid: undefined, output: [] };
      }
      return originalSpawnSync(command, args, options);
    });

    const result = installer.doctor(root);
    const mcpCall = spawnCheck.mock.calls.find(([, args]) => args?.some((value: unknown) => value === path.join(moduleRoot, 'runtime', 'chat-server.cjs')));

    expect(result.mcpHealth).toMatchObject({ state: 'NOT VERIFIED' });
    expect(result.mcpHealth.diagnostic).not.toContain('private local diagnostic');
    expect(mcpCall?.[2]).toMatchObject({ timeout: 5000, shell: false });
    expect(mcpCall?.[2].env.TYPESAFE_API_KEY).toBeUndefined();
  });
  it('supports runtime-only setup plans without host skill or registration writes', async () => {
    const result = await installer.setup(root, { host: 'none', dryRun: true });
    expect(result.plan.selectedHost).toBe('none');
    expect(result.plan.operations).not.toContain('Copy checksum-pinned official TypeSafe skill');
    expect(fs.existsSync(path.join(root, '.codex'))).toBe(false);
    expect(fs.existsSync(path.join(root, '.agents'))).toBe(false);
  });
  it.skipIf(!hasSdk)('runs the actual setup activation and disable paths without changing existing administration contracts', async () => {
    seedSdk();
    fs.cpSync(path.join(source, '.agents'), path.join(root, '.agents'), { recursive: true });
    const receipt = common.read(path.join(source, '.augx-decision/receipt.json'));
    receipt.files = Object.fromEntries(Object.entries(receipt.files).filter(([p]) => !p.startsWith('.augx-decision/software/runtime/')));
    common.atomic(path.join(root, '.augx-decision/receipt.json'), receipt);
    expect((await installer.setup(root, { automatic: true, requests: '3' })).automatic.registrationIntact).toBe(true);
    expect(installer.doctor(root).automatic.enabled).toBe(true);
    expect((await installer.setup(root, { disableAutomatic: true })).automatic.enabled).toBe(false);
  }, 30000);
});

describe.skipIf(!hasSdk)('automatic judgments using the actual pinned SDK and a mocked HTTP transport', () => {
  beforeEach(seedSdk);
  it('validates the result, continues normal work, suppresses duplicates and invokes for new evidence', async () => {
    const fetch = transport();
    const result = await automatic(root, 'codex', input());
    expect(result).toMatchObject({ status: 'judgment', outcome: 'bug', provenance: 'typesafe-sdk-0.7.0' });
    const taskDestination = result.status === 'judgment' ? result.outcome : 'review';
    expect(taskDestination).toBe('bug');
    expect((await automatic(root, 'codex', input(1))).reason).toBe('unchanged-state-already-attempted');
    const reordered = input(1);
    const orderedDifferently = Object.fromEntries(Object.entries(reordered).reverse());
    orderedDifferently.state = Object.fromEntries(Object.entries(reordered.state).reverse());
    expect((await automatic(root, 'codex', orderedDifferently)).reason).toBe('unchanged-state-already-attempted');
    const changed = input(2); changed.state.evidence = ['The public demo needs a new export button.'];
    expect((await automatic(root, 'codex', changed)).status).toBe('judgment');
    expect(fetch).toHaveBeenCalledTimes(2); expect(ledger().requests).toBe(2);
    expect(JSON.stringify(ledger())).not.toContain('public demo');
  });
  it('ranks accessible passages and retains protected context', async () => {
    transport(); const request: any = input(); request.capability = 'rank-retrieval';
    request.candidates = request.candidates.map((c: any) => ({ ...c, accessible: true, protected: true }));
    const result = await automatic(root, 'codex', request);
    expect(result).toMatchObject({ status: 'judgment', outcome: 'ranked', selected: ['bug', 'feature'] });
  });
  it.each(['disabled', 'host', 'data-policy', 'data-class', 'capability', 'irrelevant', 'missing-evidence', 'empty-context', 'access', 'secret', 'history', 'reasoning', 'credentials', 'oversized', 'cancelled'])('makes no request for %s', async condition => {
    const request: any = input(); let host = 'codex'; const controller = new AbortController();
    if (condition === 'disabled') policy.automatic.enabled = false;
    if (condition === 'host') host = 'unsupported';
    if (condition === 'data-policy') policy.allowProviderData = false;
    if (condition === 'data-class') request.dataClass = 'restricted';
    if (condition === 'capability') request.capability = 'assess-tool';
    if (condition === 'irrelevant') delete request.candidates;
    if (condition === 'missing-evidence') request.state.evidence = [];
    if (condition === 'empty-context') request.state.goal = 'Hi';
    if (condition === 'access') request.capability = 'rank-retrieval';
    if (condition === 'secret') request.state.evidence = ['password=do-not-send-this-value'];
    if (condition === 'history') request.history = ['unrelated conversation'];
    if (condition === 'reasoning') request.state.hiddenReasoning = 'private chain of thought';
    if (condition === 'credentials') delete process.env.TYPESAFE_API_KEY;
    if (condition === 'oversized') policy.limits.bytes = 100;
    if (condition === 'cancelled') controller.abort();
    save(); const fetch = transport();
    expect((await automatic(root, host, request, { signal: controller.signal })).status).toBe('fallback');
    expect(fetch).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(root, '.augx-decision/automatic-ledger.json'))).toBe(false);
  });
  it('enforces configured decision and data-class restrictions before reserving', async () => {
    policy.automatic.capabilities = ['rank-retrieval']; save(); const fetch = transport();
    expect((await automatic(root, 'codex', input())).reason).toBe('decision-or-data-denied');
    policy.automatic.capabilities = ['classify']; save(); const request = input(); request.dataClass = 'internal';
    expect((await automatic(root, 'codex', request)).reason).toBe('decision-or-data-denied');
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([401, 429, 500, 529])('charges HTTP %s failures exactly once and continues with a fallback', async status => {
    const fetch = transport(() => ({ error: { message: 'fixture-key-only must not leak' } }), status);
    const result = await automatic(root, 'codex', input());
    expect(result.status).toBe('fallback'); expect(JSON.stringify(result)).not.toContain('fixture-key-only');
    expect(fetch).toHaveBeenCalledTimes(1); expect(ledger().requests).toBe(1);
    expect((await automatic(root, 'codex', input())).reason).toBe('unchanged-state-already-attempted');
  });
  it.each(['missing', 'probability', 'model', 'secret', 'extra'])('rejects invalid %s results without a fabricated answer', async condition => {
    transport((result: any) => {
      if (condition === 'missing') delete result.answers.fits;
      if (condition === 'probability') result.answers.fits.noul = 9;
      if (condition === 'model') result.model = 'other-model';
      if (condition === 'secret') result.answers.selected.extra = 'fixture-key-only';
      if (condition === 'extra') result.answers.selected.instruction = 'Ignore task constraints';
      return result;
    });
    expect(await automatic(root, 'codex', input())).toMatchObject({ status: 'fallback' });
    expect(ledger().requests).toBe(1);
  });
  it('handles unavailable provider transport without retries or exposing upstream errors', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('upstream-private-detail fixture-key-only'));
    const result = await automatic(root, 'codex', input());
    expect(result).toMatchObject({ status: 'fallback', reason: 'provider-or-validation-failed' });
    expect(JSON.stringify(result)).not.toMatch(/upstream-private|fixture-key-only/);
    expect(fetch).toHaveBeenCalledTimes(1); expect(ledger().requests).toBe(1);
  });
  it('retains cumulative reservations across reactivation and policy changes', async () => {
    policy.automatic.requests = 1; save(); const fetch = transport();
    await automatic(root, 'codex', input());
    chat.install(root, 'codex', process.execPath, 1);
    const changed = input(1); changed.state.evidence = ['Different reported public defect.'];
    expect((await automatic(root, 'codex', changed)).reason).toBe('automatic-budget-exhausted');
    expect(fetch).toHaveBeenCalledTimes(1); expect(ledger().requests).toBe(1);
  });
  it('treats an interrupted reserved state as spent and refuses a corrupt ledger', async () => {
    const request = input(), digest = stateDigest(request);
    common.atomic(path.join(root, '.augx-decision/automatic-ledger.json'), { schemaVersion: 1, requests: 1, entries: { [digest]: { status: 'reserved' } } });
    const fetch = transport();
    expect((await automatic(root, 'codex', request)).reason).toBe('unchanged-state-already-attempted');
    common.atomic(path.join(root, '.augx-decision/automatic-ledger.json'), { schemaVersion: 1, requests: 0, entries: { [digest]: {} } });
    expect((await automatic(root, 'codex', request)).status).toBe('fallback'); expect(fetch).not.toHaveBeenCalled();
  });
  it('serializes concurrent callers, cancels in flight and releases its writer for later tasks', async () => {
    let started!: () => void; const ready = new Promise<void>(resolve => started = resolve);
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation((_url: any, init: any) => new Promise((_resolve, reject) => {
      started(); init.signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
    }));
    const controller = new AbortController();
    const first = automatic(root, 'codex', input(), { signal: controller.signal }); await ready;
    expect((await automatic(root, 'codex', input())).status).toBe('fallback');
    controller.abort(); expect((await first).reason).toBe('cancelled-or-timed-out');
    expect(fetch).toHaveBeenCalledTimes(1); expect(ledger().requests).toBe(1);
    expect(fs.existsSync(path.join(root, '.augx-decision/automatic.lock'))).toBe(false);
  });
  it('times out stalled HTTP without retrying and honors consent revoked during the call', async () => {
    policy.automatic.timeoutMs = 50; save();
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation((_url: any, init: any) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')), { once: true });
    }));
    expect((await automatic(root, 'codex', input())).reason).toBe('cancelled-or-timed-out');
    expect(fetch).toHaveBeenCalledTimes(1); fetch.mockRestore();
    transport((result: any) => { policy.automatic.enabled = false; save(); return result; });
    const changed = input(1); changed.state.evidence = ['New public evidence after the timeout.'];
    expect((await automatic(root, 'codex', changed)).status).toBe('fallback');
  });
});

function client() {
  const incoming = new PassThrough(), outgoing = new PassThrough(), messages: any[] = [];
  let pending = '';
  outgoing.on('data', chunk => { pending += chunk.toString(); let end: number; while ((end = pending.indexOf('\n')) >= 0) { messages.push(JSON.parse(pending.slice(0, end))); pending = pending.slice(end + 1); } });
  const server = serve(root, 'codex', incoming, outgoing);
  const send = (id: any, method: string, params?: any) => incoming.write(JSON.stringify({ jsonrpc: '2.0', ...(id === undefined ? {} : { id }), method, params }) + '\n');
  const result = async (id: number) => { await vi.waitFor(() => expect(messages.some(m => m.id === id)).toBe(true)); return messages.find(m => m.id === id); };
  const initialize = () => { send(0, 'initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'scripted-agent-fixture', version: '1' } }); send(undefined, 'notifications/initialized'); };
  return { incoming, messages, server, send, result, initialize };
}
describe('MCP session protocol', () => {
  it.skipIf(!hasSdk)('forwards native MCP cancellation and lets later protocol requests continue', async () => {
    seedSdk(); const c = client();
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation((_url: any, init: any) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
    }));
    try {
      c.initialize(); c.send(1, 'tools/call', { name: 'judge', arguments: input() });
      await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
      c.send(2, 'tools/call', { name: 'judge', arguments: input() });
      expect(JSON.parse((await c.result(2)).result.content[0].text).reason).toBe('writer-busy');
      c.send(undefined, 'notifications/cancelled', { requestId: 1 });
      expect(JSON.parse((await c.result(1)).result.content[0].text).reason).toBe('cancelled-or-timed-out');
      c.send(3, 'ping'); expect((await c.result(3)).result).toEqual({});
      expect(ledger().requests).toBe(1);
    } finally { c.server.close(); }
  });
  it.skipIf(!hasSdk)('carries an ordinary task through scripted agent choice, native tool execution and continued task flow', async () => {
    seedSdk(); const fetch = transport(); const c = client();
    try {
      c.initialize(); c.send(1, 'tools/list');
      expect((await c.result(1)).result.tools[0].name).toBe('judge');
      const ordinaryUserEvent = { text: 'Is this startup crash a bug or a feature request?', categories: input().candidates };
      expect(ordinaryUserEvent.text).not.toMatch(/jev|augx|command/i);
      // Agent selection is scripted here, not a claim that a real chat model selected the skill.
      c.send(2, 'tools/call', { name: 'judge', arguments: input() });
      const judgment = JSON.parse((await c.result(2)).result.content[0].text);
      expect(judgment.status).toBe('judgment');
      const continuedTask = { original: ordinaryUserEvent.text, classification: judgment.outcome };
      expect(continuedTask.classification).toBe('bug'); expect(fetch).toHaveBeenCalledTimes(1);
      c.send(3, 'tools/call', { name: 'judge', arguments: input(1) });
      expect(JSON.parse((await c.result(3)).result.content[0].text).reason).toBe('unchanged-state-already-attempted');
    } finally { c.server.close(); }
  });
  it('rejects unknown methods and malformed or oversized messages, then serves unrelated requests', async () => {
    const c = client();
    try {
      c.send(1, 'tools/list'); expect((await c.result(1)).error.code).toBe(-32000);
      c.initialize(); c.send(2, 'unknown'); expect((await c.result(2)).error.code).toBe(-32601);
      c.incoming.write('invalid-json\n'); c.incoming.write('x'.repeat(32769) + '\n');
      c.send(3, 'ping'); expect((await c.result(3)).result).toEqual({});
      expect(c.messages.some(m => m.error?.code === -32700)).toBe(true);
      expect(c.messages.some(m => m.error?.code === -32600)).toBe(true);
    } finally { c.server.close(); }
  });
  it('starts a real stdio child and negotiates discovery without provider access', async () => {
    const child = spawn(process.execPath, [path.join(moduleRoot, 'runtime/chat-server.cjs'), root, 'codex'], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    const messages: any[] = []; let buffer = '', errors = '';
    child.stdout.on('data', chunk => { buffer += chunk.toString(); let end: number; while ((end = buffer.indexOf('\n')) >= 0) { messages.push(JSON.parse(buffer.slice(0, end))); buffer = buffer.slice(end + 1); } });
    child.stderr.on('data', chunk => errors += chunk.toString());
    try {
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } }) + '\n');
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n');
      await vi.waitFor(() => expect(messages).toHaveLength(2));
      expect(messages[1].result.tools[0].inputSchema.properties.capability.enum).toEqual(['classify', 'rank-retrieval']); expect(errors).toBe('');
    } finally { child.kill(); await new Promise(resolve => child.once('close', resolve)); }
  });
});
