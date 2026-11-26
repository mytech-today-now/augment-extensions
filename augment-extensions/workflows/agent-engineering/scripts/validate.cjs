'use strict';
const fs = require('fs');
const path = require('path');
const { validate } = require('../examples/contracts.cjs');
const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'module.json');
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
// This matches calculateModuleCharacterCount in the maintained CLI: all decoded file contents.
const count = () => files(root).reduce((n, file) => n + fs.readFileSync(file, 'utf8').length, 0);
function main() {
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (process.argv.includes('--update-count')) {
    for (let pass = 0; pass < 5 && manifest.augment.characterCount !== count(); pass++) {
      manifest.augment.characterCount = count();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    }
  }
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.type !== 'workflows' || manifest.dependencies.length || manifest.augment.characterCount !== count()) throw new Error('Manifest or character count mismatch');
  for (const name of ['agent', 'invocation', 'task', 'tool', 'node', 'evidence', 'state', 'check-tool']) validate(name === 'check-tool' ? 'tool' : name, JSON.parse(fs.readFileSync(path.join(root, 'templates', name + '.json'), 'utf8')));
  for (const file of files(root)) {
    const body = fs.readFileSync(file, 'utf8');
    if (body.includes(String.fromCharCode(0x2014))) throw new Error('Prohibited punctuation');
    if (file.endsWith('.md')) for (const match of body.matchAll(/\]\(([^)]+)\)/g)) {
      if (!/^[a-z]+:|^#/i.test(match[1]) && !fs.existsSync(path.resolve(path.dirname(file), match[1].split('#')[0]))) throw new Error('Broken local link: ' + match[1]);
    }
  }
  const { exampleGraph } = require('../examples/graphs.cjs');
  for (const shape of ['chain', 'router', 'fan-out', 'cycle']) exampleGraph(shape);
  process.stdout.write(JSON.stringify({ module: manifest.name, characters: count(), templates: 8, graphShapes: 4 }) + '\n');
}
try { main(); } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
