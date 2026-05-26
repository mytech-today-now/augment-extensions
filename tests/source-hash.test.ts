/**
 * Unit tests for `cli/src/lib/source-hash.ts` (acceptance criterion U1).
 *
 * Covers the four stability requirements from the cross-platform test plan:
 *   1. Reorder invariance     - same modules in any array order -> same hash
 *   2. Version sensitivity    - bumping one module version -> different hash
 *   3. Content sensitivity    - changing one contentDigest  -> different hash
 *   4. Cross-OS determinism   - a pinned golden hex vector
 *
 * See: openspec/changes/cross-platform/tests/test-plan.md (U1)
 * See: openspec/specs/cross-platform/export-command.md (Drift Detection)
 */

import { describe, it, expect } from 'vitest';
import {
  canonicalEncode,
  computeSourceHash,
  SOURCE_HASH_HEX_LENGTH,
  type SourceHashInput,
  type SourceHashModule,
} from '@cli/lib/source-hash';

const MOD_A: SourceHashModule = { id: 'a', version: '1.0.0', contentDigest: '00' };
const MOD_B: SourceHashModule = { id: 'b', version: '2.0.0', contentDigest: 'ff' };
const MOD_C: SourceHashModule = {
  id: 'coding-standards/typescript',
  version: '3.1.4',
  contentDigest: 'deadbeefcafef00d',
};

function input(
  modules: SourceHashModule[],
  ignorePatterns: string[] = []
): SourceHashInput {
  return { modules, ignorePatterns };
}

describe('computeSourceHash', () => {
  it('emits a lowercase 16-char hex digest', () => {
    const hash = computeSourceHash(input([MOD_A, MOD_B]));
    expect(hash).toHaveLength(SOURCE_HASH_HEX_LENGTH);
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is invariant under module-array reordering', () => {
    const forward = computeSourceHash(input([MOD_A, MOD_B, MOD_C]));
    const reversed = computeSourceHash(input([MOD_C, MOD_B, MOD_A]));
    const interleaved = computeSourceHash(input([MOD_B, MOD_C, MOD_A]));
    expect(reversed).toBe(forward);
    expect(interleaved).toBe(forward);
  });

  it('is invariant under ignorePatterns reordering', () => {
    const patterns = ['**/examples/**', '**/dist/**', 'tests/**'];
    const forward = computeSourceHash(input([MOD_A], patterns));
    const reversed = computeSourceHash(input([MOD_A], [...patterns].reverse()));
    expect(reversed).toBe(forward);
  });

  it('changes when any module version is bumped', () => {
    const baseline = computeSourceHash(input([MOD_A, MOD_B]));
    const bumped = computeSourceHash(
      input([{ ...MOD_A, version: '1.0.1' }, MOD_B])
    );
    expect(bumped).not.toBe(baseline);
  });

  it('changes when a module contentDigest is edited', () => {
    const baseline = computeSourceHash(input([MOD_A, MOD_B]));
    const edited = computeSourceHash(
      input([MOD_A, { ...MOD_B, contentDigest: 'fe' }])
    );
    expect(edited).not.toBe(baseline);
  });

  it('changes when ignorePatterns are added', () => {
    const baseline = computeSourceHash(input([MOD_A]));
    const withIgnore = computeSourceHash(input([MOD_A], ['**/dist/**']));
    expect(withIgnore).not.toBe(baseline);
  });

  it('changes when a module is added', () => {
    const single = computeSourceHash(input([MOD_A]));
    const pair = computeSourceHash(input([MOD_A, MOD_B]));
    expect(pair).not.toBe(single);
  });

  it('matches the pinned golden hex vector for cross-OS determinism', () => {
    // Golden vector: the truncated SHA-256 of the canonical encoding of the
    // two-module fixture below. Computed once on Node 20 and pinned here.
    // If this value ever changes, every banner emitted by `augx export`
    // changes, breaking idempotent re-export across user machines.
    const golden = 'adb4c15304e2bed5';
    expect(computeSourceHash(input([MOD_A, MOD_B]))).toBe(golden);
  });
});

describe('canonicalEncode', () => {
  it('produces the documented top-level shape with sorted keys', () => {
    const encoded = canonicalEncode(input([MOD_B, MOD_A]));
    expect(encoded).toBe(
      '{"modules":[' +
        '{"id":"a","version":"1.0.0","contentDigest":"00"},' +
        '{"id":"b","version":"2.0.0","contentDigest":"ff"}' +
        '],"ignorePatterns":[]}'
    );
  });

  it('sorts ignorePatterns lexicographically inside the envelope', () => {
    const encoded = canonicalEncode(
      input([MOD_A], ['z-pattern', 'a-pattern', 'm-pattern'])
    );
    expect(encoded).toContain(
      '"ignorePatterns":["a-pattern","m-pattern","z-pattern"]'
    );
  });

  it('escapes strings via JSON quoting (quotes, backslashes, control chars)', () => {
    const tricky: SourceHashModule = {
      id: 'a"b\\c',
      version: '1.0.0\n',
      contentDigest: '00',
    };
    const encoded = canonicalEncode(input([tricky]));
    // Must remain valid JSON and round-trip through JSON.parse.
    expect(() => JSON.parse(encoded)).not.toThrow();
    const parsed = JSON.parse(encoded) as { modules: SourceHashModule[] };
    expect(parsed.modules[0].id).toBe('a"b\\c');
    expect(parsed.modules[0].version).toBe('1.0.0\n');
  });

  it('does not depend on input mutability after the call', () => {
    const mods = [MOD_A, MOD_B];
    const before = canonicalEncode(input(mods));
    mods.reverse();
    const after = canonicalEncode(input(mods));
    expect(after).toBe(before);
  });
});
