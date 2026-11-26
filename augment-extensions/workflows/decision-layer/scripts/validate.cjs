'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..'), manifestPath = path.join(root, 'module.json');
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const count = () => files(root).reduce((n, p) => n + fs.readFileSync(p, 'utf8').length, 0);
let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (process.argv.includes('--update-count')) for (let i = 0; i < 6 && manifest.augment.characterCount !== count(); i++) { manifest.augment.characterCount = count(); fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n'); }
if (manifest.augment.characterCount !== count()) throw new Error('Module character count mismatch');
for (const file of files(root)) {
  const body = fs.readFileSync(file, 'utf8');
  if (body.includes(String.fromCharCode(0x2014))) throw new Error('Prohibited punctuation in ' + file);
  if (file.endsWith('.json')) JSON.parse(body);
  if (file.endsWith('.md')) for (const match of body.matchAll(/\]\(([^)]+)\)/g)) if (!/^[a-z]+:|^#/.test(match[1]) && !fs.existsSync(path.resolve(path.dirname(file), match[1].split('#')[0]))) throw new Error('Broken local link: ' + match[1]);
}
console.log(JSON.stringify({ module: manifest.name, files: files(root).length, characters: count() }));
