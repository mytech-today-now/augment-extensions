'use strict';
// Explicit integration runner: installs official dependencies in a disposable test scope.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..'), project = path.join(root, 'test-artifacts/decision-consumer-source');
fs.mkdirSync(project, { recursive: true });
const cli = path.join(root, 'cli/dist/cli.js');
cp.execFileSync(process.execPath, [cli, 'decision', 'setup', '--project', project], { stdio: 'inherit', windowsHide: true });
cp.execFileSync(process.execPath, [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', 'tests/decision-layer.test.ts'], { cwd: root, stdio: 'inherit', windowsHide: true });
