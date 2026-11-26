'use strict';
const path = require('path');
const { runLoop } = require('./loop.cjs');
const { exampleGraph, runGraph } = require('./graphs.cjs');
async function main() {
  const [kind = 'loop', mode = 'repair', destination] = process.argv.slice(2);
  if (!destination) throw new Error('Usage: node examples/demo.cjs <loop|graph> <mode|shape> <explicit-local-directory>');
  const root = path.resolve(destination);
  const controller = new AbortController();
  process.once('SIGINT', () => controller.abort());
  const baseline = require('../templates/task.json');
  const task = mode === 'exhaust' ? { ...baseline, budget: { ...baseline.budget, maxAttempts: 2 } } : baseline;
  const result = kind === 'loop' ? await runLoop({ root, task, mode, signal: controller.signal }) : kind === 'graph' ? await runGraph({ ...exampleGraph(mode), root, signal: controller.signal }) : (() => { throw new Error('Invalid example kind'); })();
  process.stdout.write(JSON.stringify({ outcome: result.status, root, evidence: 'local-deterministic-fixture' }) + '\n');
  process.exitCode = result.status === 'success' ? 0 : 1;
}
main().catch(() => { process.stderr.write('Example rejected input or checkpoint; inspect local files without overwriting them.\n'); process.exitCode = 2; });
