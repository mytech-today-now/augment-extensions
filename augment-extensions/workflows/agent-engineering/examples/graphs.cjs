'use strict';
const fs = require('fs');
const { validate, checkSchema, hash, atomic, read, safePath } = require('./contracts.cjs');

function validateGraph(graph) {
  validate('graph', graph);
  const ids = new Set(graph.nodes.map(n => n.id));
  if (ids.size !== graph.nodes.length || !ids.has(graph.entry) || !graph.terminals.length || graph.terminals.some(t => !ids.has(t))) throw new Error('Invalid node identifiers');
  for (const n of graph.nodes) {
    // Compile both schemas even if a router never selects this node.
    const Ajv = require('ajv'); const ajv = new Ajv({ strict: true });
    ajv.compile(n.inputSchema); ajv.compile(n.outputSchema);
    if (n.dependencies.some(d => !ids.has(d) || d === n.id) || n.allocation.timeoutMs > 750) throw new Error('Invalid dependencies or allocation');
    if (n.acceptance === 'all-required' && !n.dependencies.length) throw new Error('Join requires explicit branches');
  }
  const seenEdges = new Set();
  for (const e of graph.edges) {
    const key = [e.to, e.artifact, e.condition].join(':');
    if (!ids.has(e.from) || !ids.has(e.to) || seenEdges.has(key)) throw new Error('Invalid or ambiguous edge');
    seenEdges.add(key);
    if (graph.terminals.includes(e.from) || (e.from === e.to && (e.condition === 'always' || graph.nodes.find(n => n.id === e.from).dependencies.length))) throw new Error('Invalid terminal or cycle edge');
  }
  // The reference supports DAGs plus bounded single-node repair cycles.
  const active = new Set(); const complete = new Set();
  const acyclic = id => {
    if (active.has(id)) throw new Error('Multi-node cycles require a different scheduler');
    if (complete.has(id)) return;
    active.add(id);
    for (const e of graph.edges) if (e.from === id && e.to !== id) acyclic(e.to);
    active.delete(id); complete.add(id);
  };
  acyclic(graph.entry);
  const visit = (start, reverse) => {
    const found = new Set(); const queue = [...start];
    while (queue.length) { const id = queue.shift(); if (found.has(id)) continue; found.add(id); for (const e of graph.edges) if ((reverse ? e.to : e.from) === id) queue.push(reverse ? e.from : e.to); }
    return found;
  };
  if (visit([graph.entry], false).size !== ids.size || visit(graph.terminals, true).size !== ids.size) throw new Error('Unreachable node or terminal');
  for (const n of graph.nodes) if (n.dependencies.some(d => !graph.edges.some(e => e.from === d && e.to === n.id))) throw new Error('Join dependency has no artifact edge');
  for (const n of graph.nodes) if (n.id !== graph.entry && (n.inputSchema.required || []).some(key => !graph.edges.some(e => e.to === n.id && e.artifact === key))) throw new Error('Required input has no artifact edge');
  return graph;
}

async function runGraph({ graph, handlers, root, revision = 'fixture-v1', input = { seed: ['c', 'a', 'a', 'b'] }, now = Date.now, signal, pauseAfter = Infinity }) {
  validateGraph(graph);
  if (!root || !handlers || graph.nodes.some(n => typeof handlers[n.id] !== 'function')) throw new Error('Explicit local root and trusted handlers required');
  fs.mkdirSync(root, { recursive: true });
  const lock = safePath(root, 'graph.lock'); const fd = fs.openSync(lock, 'wx');
  try {
    const policy = hash([fs.readFileSync(__filename, 'utf8'), fs.readFileSync(require.resolve('./contracts.cjs'), 'utf8'), fs.readFileSync(require.resolve('../schemas/contracts.schema.json'), 'utf8'), Object.keys(handlers).sort().map(id => [id, handlers[id].toString()])]);
    const contract = hash([graph, input, revision, policy]);
    let s;
    if (fs.existsSync(safePath(root, 'graph-state.json'))) {
      const record = read(root, 'graph-state.json'); s = validate('graphState', record.state);
      if (record.checksum !== hash(s) || s.version !== 1 || s.contract !== contract || s.revision !== revision || !Number.isInteger(s.steps) || s.steps < 0 || s.steps > Math.min(12, graph.maxSteps) || s.deadline !== s.startedAt + 5000 || !['running', 'success', 'error', 'cancelled', 'exhausted'].includes(s.status)) throw new Error('Incompatible graph checkpoint');
      for (const [id, output] of Object.entries(s.outputs)) {
        const node = graph.nodes.find(n => n.id === id);
        if (!node) throw new Error('Unknown checkpoint node');
        checkSchema(node.outputSchema, output);
        if (s.digests[id] !== hash(output)) throw new Error('Stale graph artifact');
      }
      if (s.status === 'success' && (!Object.keys(s.outputs).some(id => graph.terminals.includes(id)) || s.pending.length)) throw new Error('Incomplete graph success');
    } else {
      s = { version: 1, contract, revision, startedAt: now(), deadline: 0, steps: 0, visits: {}, outputs: {}, digests: {}, pending: [{ id: graph.entry, input }], status: 'running', trace: [], reason: 'dispatch' };
      s.deadline = s.startedAt + 5000;
    }
    const persist = () => { validate('graphState', s); atomic(root, 'graph-state.json', { checksum: hash(s), state: s }); };
    let rounds = 0;
    while (s.status === 'running' && s.pending.length && rounds++ < pauseAfter) {
      if (signal?.aborted) { s.status = 'cancelled'; s.reason = 'cancelled'; break; }
      if (now() >= s.deadline || s.steps >= Math.min(12, graph.maxSteps)) { s.status = 'exhausted'; s.reason = 'shared-allocation'; break; }
      const index = s.pending.findIndex(p => graph.nodes.find(n => n.id === p.id)?.dependencies.every(d => Object.hasOwnProperty.call(s.outputs, d)));
      if (index < 0) { s.status = 'error'; s.reason = 'missing-required-branch'; break; }
      const packet = s.pending[index];
      const node = graph.nodes.find(n => n.id === packet.id);
      s.visits[node.id] = (s.visits[node.id] || 0) + 1;
      if (s.visits[node.id] > graph.maxVisits) { s.status = 'exhausted'; s.reason = 'bounded-cycle'; break; }
      s.steps++;
      persist(); // Leave packet pending until its output is durably recorded.
      try {
        checkSchema(node.inputSchema, packet.input);
        const controller = new AbortController();
        const abort = () => controller.abort(); signal?.addEventListener('abort', abort, { once: true });
        let timer;
        let result;
        try {
          result = await Promise.race([
            Promise.resolve().then(() => handlers[node.id](packet.input, { signal: controller.signal, visit: s.visits[node.id] })),
            new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('node-timeout')); }, Math.max(1, Math.min(node.allocation.timeoutMs, s.deadline - now()))); controller.signal.addEventListener('abort', () => reject(new Error('cancelled-or-timeout')), { once: true }); })
          ]);
        } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
        if (signal?.aborted) { s.status = 'cancelled'; s.reason = 'cancelled'; break; }
        if (now() >= s.deadline) { s.status = 'exhausted'; s.reason = 'deadline'; break; }
        if (!result || !Object.hasOwnProperty.call(result, 'value') || !['always', 'valid', 'invalid', 'left', 'right'].includes(result.route || 'always')) throw new Error('invalid-route');
        checkSchema(node.outputSchema, result.value);
        s.outputs[node.id] = result.value; s.digests[node.id] = hash(result.value);
        s.pending.splice(index, 1);
        const edges = graph.edges.filter(e => e.from === node.id && (e.condition === 'always' || e.condition === result.route));
        if (!edges.length && !graph.terminals.includes(node.id)) throw new Error('route-has-no-edge');
        for (const edge of edges) {
          let target = s.pending.find(p => p.id === edge.to);
          if (!target) { target = { id: edge.to, input: {} }; s.pending.push(target); }
          target.input[edge.artifact] = result.value;
        }
        s.trace.push({ node: node.id, step: s.steps, contract, artifact: hash(result.value), route: result.route || 'always', elapsedMs: now() - s.startedAt, calls: s.steps, outcome: 'schema-accepted' });
        persist();
      } catch {
        s.status = signal?.aborted ? 'cancelled' : 'error'; s.reason = node.failureRoute === 'handoff' ? 'local-handoff-required' : 'node-rejected';
      }
    }
    if (s.status === 'running' && !s.pending.length) {
      s.status = graph.terminals.some(t => Object.hasOwnProperty.call(s.outputs, t)) ? 'success' : 'error';
      s.reason = s.status === 'success' ? 'selected-terminal-reached' : 'missing-terminal';
    }
    persist();
    if (s.status !== 'running') atomic(root, 'graph-receipt.json', { outcome: s.status, changedArtifacts: ['graph-state.json'], verifiedChecks: ['Schemas and selected transitions'], unverified: ['Provider quality', 'Parallel scheduling', 'OS isolation'], remainingRisk: 'Trusted handlers must honor cancellation; use process isolation for untrusted code', nextOwner: 'controller', nextAction: s.reason, calls: s.steps });
    return s;
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}

function exampleGraph(shape) {
  const list = { type: 'array', items: { type: 'string' }, maxItems: 8 };
  const input = key => ({ type: 'object', additionalProperties: false, properties: { [key]: list }, required: [key] });
  const node = (id, schema, dependencies = []) => ({ id, responsibility: `Produce ${id} artifact`, executor: 'code', inputSchema: schema, outputSchema: list, dependencies, acceptance: dependencies.length ? 'all-required' : 'schema', failureRoute: 'handoff', allocation: { calls: 1, timeoutMs: 100 } });
  const edge = (from, to, artifact, condition = 'always') => ({ from, to, artifact, condition });
  const g = { version: 1, id: shape, entry: 'start', terminals: ['done'], maxSteps: 10, maxVisits: 3, joinPolicy: 'all-required', nodes: [node('start', input('seed'))], edges: [] };
  const handlers = { start: x => ({ value: x.seed }), done: x => ({ value: Object.values(x).flat() }) };
  if (shape === 'chain') {
    g.nodes.push(node('normalize', input('raw')), node('done', input('normalized')));
    g.edges.push(edge('start', 'normalize', 'raw'), edge('normalize', 'done', 'normalized'));
    handlers.normalize = x => ({ value: [...new Set(x.raw)].sort() });
  } else if (shape === 'router') {
    g.terminals = ['left', 'right'];
    g.nodes.push(node('left', input('selected')), node('right', input('selected')));
    g.edges.push(edge('start', 'left', 'selected', 'left'), edge('start', 'right', 'selected', 'right'));
    handlers.start = x => ({ value: x.seed, route: x.seed.length < 5 ? 'left' : 'right' });
    handlers.left = handlers.right = x => ({ value: x.selected });
  } else if (shape === 'fan-out') {
    g.nodes.push(node('left', input('source')), node('right', input('source')), node('done', { type: 'object', additionalProperties: false, properties: { left: list, right: list }, required: ['left', 'right'] }, ['left', 'right']));
    g.edges.push(edge('start', 'left', 'source'), edge('start', 'right', 'source'), edge('left', 'done', 'left'), edge('right', 'done', 'right'));
    handlers.left = x => ({ value: [...new Set(x.source)] }); handlers.right = x => ({ value: [...x.source].sort() });
  } else if (shape === 'cycle') {
    g.nodes.push(node('repair', input('candidate')), node('done', input('checked')));
    g.edges.push(edge('start', 'repair', 'candidate'), edge('repair', 'repair', 'candidate', 'invalid'), edge('repair', 'done', 'checked', 'valid'));
    handlers.repair = (x, context) => ({ value: context.visit === 1 ? x.candidate : [...new Set(x.candidate)].sort(), route: context.visit === 1 ? 'invalid' : 'valid' });
  } else throw new Error('Unknown graph shape');
  return { graph: validateGraph(g), handlers };
}
module.exports = { validateGraph, runGraph, exampleGraph };
