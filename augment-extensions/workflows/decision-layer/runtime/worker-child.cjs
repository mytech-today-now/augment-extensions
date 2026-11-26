'use strict';
const fs = require('fs');
const crypto = require('crypto');
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; if (Buffer.byteLength(input) > 1048576) process.exit(2); });
process.stdin.on('end', async () => {
  try {
    const [file, expected] = process.argv.slice(2);
    if (crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== expected) throw new Error('Worker registration changed');
    const handler = require(file);
    const result = await handler.execute(JSON.parse(input));
    process.stdout.write(JSON.stringify(result));
  } catch { process.stderr.write('Registered worker failed\n'); process.exitCode = 1; }
});
