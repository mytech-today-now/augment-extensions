#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { automatic, inputSchema, fallback } = require('./automatic.cjs');

// Narrow MCP stdio surface: no sampling, subprocess tools, resources or provider endpoint overrides.
function serve(root, host, input = process.stdin, output = process.stdout) {
  let negotiated = false, initialized = false, pending = Buffer.alloc(0), dropping = false;
  const running = new Map();
  const send = message => output.write(JSON.stringify(message) + '\n');
  const error = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });
  const toolResult = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }], isError: false });
  async function handle(message) {
    if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') { error(null, -32600, 'Invalid request'); return; }
    const hasId = Object.hasOwnProperty.call(message, 'id');
    const id = message.id;
    if (hasId && !(typeof id === 'string' || Number.isSafeInteger(id))) { error(null, -32600, 'Invalid request identity'); return; }
    if (message.method === 'notifications/cancelled') { running.get(message.params?.requestId)?.abort(); return; }
    if (message.method === 'notifications/initialized' && negotiated) { initialized = true; return; }
    if (!hasId) return;
    if (message.method === 'ping') { send({ jsonrpc: '2.0', id, result: {} }); return; }
    if (message.method === 'initialize' && !negotiated) {
      negotiated = true;
      const supported = ['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25'];
      send({ jsonrpc: '2.0', id, result: { protocolVersion: supported.includes(message.params?.protocolVersion) ? message.params.protocolVersion : '2025-11-25',
        capabilities: { tools: {} }, serverInfo: { name: 'augx-decision', version: '1.1.0' },
        instructions: 'Use judge selectively for ambiguous ordinary-task classification or retrieval relevance. Saved policy enforces data and request limits. Continue normal work after judgments or fallbacks.' } }); return;
    }
    if (!initialized) { error(id, -32000, 'Initialize the MCP session first'); return; }
    if (message.method === 'tools/list') {
      send({ jsonrpc: '2.0', id, result: { tools: [{ name: 'judge',
        description: 'Classify an ambiguous task among supplied categories or rank retrieved evidence for relevance. Use during ordinary work without a user command when deterministic selection is insufficient. Sends only supplied de-identified public or approved internal context to the configured Jev provider under saved policy. Returns typed advice or an explicit safe fallback. Does not execute actions or grant permissions.',
        inputSchema, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true } }] } }); return;
    }
    if (message.method !== 'tools/call') { error(id, -32601, 'Unsupported method'); return; }
    if (message.params?.name !== 'judge') { error(id, -32602, 'Unknown tool'); return; }
    if (running.size) { send({ jsonrpc: '2.0', id, result: toolResult(fallback('writer-busy')) }); return; }
    const controller = new AbortController(); running.set(id, controller);
    try { send({ jsonrpc: '2.0', id, result: toolResult(await automatic(root, host, message.params.arguments, { signal: controller.signal })) }); }
    catch { send({ jsonrpc: '2.0', id, result: toolResult(fallback('runtime-unavailable')) }); }
    finally { running.delete(id); }
  }
  const data = chunk => {
    // Bound each line before JSON parsing, including newline-free malicious input.
    const bytes = Buffer.from(chunk);
    for (let offset = 0; offset < bytes.length;) {
      const newline = bytes.indexOf(10, offset), finish = newline < 0 ? bytes.length : newline;
      if (!dropping) {
        if (pending.length + finish - offset > 32768) { pending = Buffer.alloc(0); dropping = true; error(null, -32600, 'Request exceeds size bound'); }
        else pending = Buffer.concat([pending, bytes.subarray(offset, finish)]);
      }
      if (newline < 0) break;
      if (!dropping && pending.length) { try { void handle(JSON.parse(pending.toString('utf8'))); } catch { error(null, -32700, 'Invalid JSON'); } }
      pending = Buffer.alloc(0); dropping = false; offset = finish + 1;
    }
  };
  const stop = () => { for (const controller of running.values()) controller.abort(); };
  input.on('data', data); input.on('end', stop); input.on('close', stop);
  return { stop, close: () => { stop(); input.removeListener('data', data); input.removeListener('end', stop); input.removeListener('close', stop); } };
}
if (require.main === module) {
  try {
    const root = fs.realpathSync(path.resolve(process.argv[2] || '.')), host = process.argv[3];
    if (Number(process.versions.node.split('.')[0]) < 22 || !['codex', 'claude-code'].includes(host)) throw new Error('Unsupported host/runtime');
    const server = serve(root, host);
    const shutdown = () => { server.stop(); process.stdin.destroy(); };
    process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
  } catch { process.stderr.write('Augx decision chat runtime unavailable; inspect setup and doctor.\n'); process.exitCode = 2; }
}
module.exports = { serve };
