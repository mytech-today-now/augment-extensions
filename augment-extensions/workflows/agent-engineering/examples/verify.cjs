'use strict';
const fs = require('fs');
const crypto = require('crypto');
// Acceptance is deliberately independent of the worker's normalization code.
const expected = ['a', 'b', 'c'];
function inspect(candidate) {
  const passed = Array.isArray(candidate) && JSON.stringify(candidate) === JSON.stringify(expected);
  const score = Array.isArray(candidate) ? expected.filter((v, i) => candidate[i] === v).length : 0;
  return { passed, score, expected, actual: Array.isArray(candidate) ? candidate : [], condition: 'Exact sorted unique fixture', location: 'candidate.json' };
}
if (require.main === module) {
  try {
    const input = fs.readFileSync(process.argv[2]);
    if (input.length > 1024) throw new Error('Oversized candidate');
    const result = inspect(JSON.parse(input));
    result.artifact = crypto.createHash('sha256').update(input).digest('hex');
    process.stdout.write(JSON.stringify(result));
    process.exitCode = result.passed ? 0 : 1;
  } catch { process.stdout.write(JSON.stringify({ failure: 'unrecoverable' })); process.exitCode = 2; }
}
module.exports = { inspect };
