'use strict';
const fs = require('fs');
const { hash, safePath, atomic, read } = require('./contracts.cjs');

function localEffect(root, key, payload, crashAfterWrite = false) {
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(key)) throw new Error('Invalid idempotency key');
  const name = `effect-${key}.json`;
  const digest = hash(payload);
  // One controller owns this root. Payload is only a local fixture, never an external action.
  if (fs.existsSync(safePath(root, name))) {
    if (read(root, name).digest !== digest) throw new Error('Reconciliation required');
  } else atomic(root, name, { digest, payload });
  if (crashAfterWrite) throw new Error('Simulated crash after local effect');
  atomic(root, `effect-${key}-receipt.json`, { key, digest, reconciled: true });
  return { key, digest };
}

function discoveryRound(state, findings, dryLimit = 2) {
  if (!Number.isInteger(dryLimit) || dryLimit < 1 || dryLimit > 5) throw new Error('Invalid dry limit');
  const seen = new Set(state.seen); let fresh = 0;
  for (const finding of findings) {
    if (!finding || typeof finding.key !== 'string' || !['accepted', 'rejected'].includes(finding.disposition)) throw new Error('Invalid finding');
    const key = hash(finding.key.trim().toLowerCase().replace(/\s+/g, ' '));
    if (!seen.has(key)) { seen.add(key); fresh++; }
  }
  return { seen: [...seen], dry: fresh ? 0 : state.dry + 1, stop: !fresh && state.dry + 1 >= dryLimit, fresh };
}

function evaluateChange(baseline, proposed, cases = require('./evaluation-cases.json')) {
  // Evaluated functions are trusted review inputs, never loaded from worker output.
  const score = check => cases.reduce((s, c) => {
    const actual = check(c.candidate).passed;
    if (actual && c.expected) s.accepted++;
    if (actual && !c.expected) s.falseSuccess++;
    if (!actual && c.expected) s.falseRejection++;
    return s;
  }, { accepted: 0, falseSuccess: 0, falseRejection: 0 });
  const before = score(baseline); const after = score(proposed);
  return { before, after, eligibleForReview: after.falseSuccess === 0 && after.accepted >= before.accepted && after.falseRejection <= before.falseRejection, evidenceClass: 'deterministic-replay', providerQuality: 'NOT VERIFIED' };
}
function groupFailures(feedback) {
  const groups = new Map();
  for (const record of feedback) {
    require('./contracts.cjs').validate('feedback', record);
    const key = hash([record.classification, record.condition.trim().toLowerCase(), record.location]);
    const group = groups.get(key) || { fingerprint: key, classification: record.classification, location: record.location, count: 0 };
    group.count++; groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.fingerprint.localeCompare(b.fingerprint));
}
module.exports = { localEffect, discoveryRound, evaluateChange, groupFailures };
