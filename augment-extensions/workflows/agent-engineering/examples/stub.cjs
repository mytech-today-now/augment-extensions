'use strict';
const [mode, count] = process.argv.slice(2);
const attempt = Number(count);
if (!['repair', 'exhaust', 'stall', 'denied', 'error', 'transient', 'timeout'].includes(mode) || !Number.isInteger(attempt) || attempt < 1 || attempt > 5) process.exit(2);
if (mode === 'timeout') setTimeout(() => process.exit(2), 15000);
else if (mode === 'denied' || mode === 'error' || (mode === 'transient' && attempt === 1)) {
  process.stdout.write(JSON.stringify({ failure: mode === 'error' ? 'unrecoverable' : mode }));
} else {
  const candidate = mode === 'stall' ? ['c'] : mode === 'exhaust' ? ['a', 'b', 'c'].slice(0, Math.min(attempt, 2)) : attempt === 1 ? ['c', 'a', 'a'] : ['a', 'b', 'c'];
  process.stdout.write(JSON.stringify(candidate));
}
