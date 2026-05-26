/**
 * Unit tests for the mirror-runner's idempotent re-link and stale-prune
 * behavior (acceptance criterion U3).
 *
 * Exercises `mirrorModule` over three runs that simulate a module's rule
 * file set shrinking and growing between invocations:
 *   1. Link a module with 3 rule files; assert 3 tracked entries and that
 *      all destination files exist on disk.
 *   2. Delete one source file and re-link; assert tracked entries == 2 and
 *      the orphaned destination has been pruned.
 *   3. Add a new source file and re-link; assert tracked entries == 3 and
 *      the new destination exists.
 *
 * See: openspec/changes/cross-platform/tests/test-plan.md (U3)
 * See: openspec/specs/cross-platform/mirror-hook.md
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ResolvedModule, ResolvedRuleFile } from '@cli/adapters/types';
import type { MirrorEntry } from '@cli/types/coordination-export';
import { mirrorModule } from '@cli/lib/mirror-runner';

/** Module id reused across all three runs. */
const MODULE_ID = 'coding-standards/idempotent-demo';
const MODULE_VERSION = '1.0.0';

/** Fixed timestamp factory so banners in any rendered files are stable. */
const FAKE_NOW = () => '2026-05-25T12:00:00Z';

/**
 * Build a `ResolvedModule` from the on-disk state of `rules/` under
 * `moduleRoot`. Reads files in alphabetical order with LF normalization to
 * match the resolver's invariants.
 */
function readModuleFromDisk(moduleRoot: string): ResolvedModule {
  const rulesRoot = path.join(moduleRoot, 'rules');
  const rels = fs.existsSync(rulesRoot) ? fs.readdirSync(rulesRoot).sort() : [];
  const rulesFiles: ResolvedRuleFile[] = rels.map((rel) => ({
    relativePath: `rules/${rel}`,
    content: fs.readFileSync(path.join(rulesRoot, rel), 'utf-8').replace(/\r\n?/g, '\n'),
  }));
  return {
    id: MODULE_ID,
    version: MODULE_VERSION,
    rootPath: moduleRoot,
    rulesFiles,
    examplesFiles: [],
  };
}

/** Convert a `MirrorEntry[]` into the recorded-by-target map shape. */
function toRecordedMap(entries: readonly MirrorEntry[]): Map<string, MirrorEntry> {
  return new Map(entries.map((e) => [e.targetPath, e]));
}

describe('mirrorModule: idempotent re-link and stale prune (U3)', () => {
  let tmp: string;
  let moduleRoot: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-u3-'));
    moduleRoot = path.join(tmp, 'augment-extensions', 'coding-standards', 'idempotent-demo');
    fs.mkdirSync(path.join(moduleRoot, 'rules'), { recursive: true });
    fs.writeFileSync(path.join(moduleRoot, 'rules', 'alpha.md'), '# alpha\n', 'utf-8');
    fs.writeFileSync(path.join(moduleRoot, 'rules', 'beta.md'), '# beta\n', 'utf-8');
    fs.writeFileSync(path.join(moduleRoot, 'rules', 'gamma.md'), '# gamma\n', 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('tracks 3 entries, prunes 1 on shrink, restores 3 on grow', () => {
    // ----- Run 1: 3 rule files -> 3 tracked entries -----
    const r1 = mirrorModule(readModuleFromDisk(moduleRoot), ['claude-code'], {
      projectRoot: tmp,
      augxVersion: '0.0.0-test',
      ignorePatterns: [],
      now: FAKE_NOW,
      recordedByTarget: new Map(),
    });

    expect(r1.entries).toHaveLength(3);
    expect(r1.claudeStubsAdded).toBe(true);

    const claudeDir = path.join(tmp, '.claude', 'rules', 'coding-standards-idempotent-demo');
    for (const name of ['alpha.md', 'beta.md', 'gamma.md']) {
      const dest = path.join(claudeDir, 'rules', name);
      expect(fs.existsSync(dest)).toBe(true);
      expect(fs.readFileSync(dest, 'utf-8')).toBe(`# ${path.basename(name, '.md')}\n`);
    }
    const targetPaths1 = r1.entries.map((e) => e.targetPath).sort();
    expect(targetPaths1).toEqual([
      '.claude/rules/coding-standards-idempotent-demo/rules/alpha.md',
      '.claude/rules/coding-standards-idempotent-demo/rules/beta.md',
      '.claude/rules/coding-standards-idempotent-demo/rules/gamma.md',
    ]);

    // ----- Run 2: delete beta.md, re-link -> 2 tracked entries, orphan pruned -----
    fs.unlinkSync(path.join(moduleRoot, 'rules', 'beta.md'));
    const r2 = mirrorModule(readModuleFromDisk(moduleRoot), ['claude-code'], {
      projectRoot: tmp,
      augxVersion: '0.0.0-test',
      ignorePatterns: [],
      now: FAKE_NOW,
      recordedByTarget: toRecordedMap(r1.entries),
    });

    expect(r2.entries).toHaveLength(2);
    expect(fs.existsSync(path.join(claudeDir, 'rules', 'alpha.md'))).toBe(true);
    expect(fs.existsSync(path.join(claudeDir, 'rules', 'beta.md'))).toBe(false);
    expect(fs.existsSync(path.join(claudeDir, 'rules', 'gamma.md'))).toBe(true);
    const targetPaths2 = r2.entries.map((e) => e.targetPath).sort();
    expect(targetPaths2).toEqual([
      '.claude/rules/coding-standards-idempotent-demo/rules/alpha.md',
      '.claude/rules/coding-standards-idempotent-demo/rules/gamma.md',
    ]);

    // ----- Run 3: add delta.md, re-link -> 3 tracked entries -----
    fs.writeFileSync(path.join(moduleRoot, 'rules', 'delta.md'), '# delta\n', 'utf-8');
    const r3 = mirrorModule(readModuleFromDisk(moduleRoot), ['claude-code'], {
      projectRoot: tmp,
      augxVersion: '0.0.0-test',
      ignorePatterns: [],
      now: FAKE_NOW,
      recordedByTarget: toRecordedMap(r2.entries),
    });

    expect(r3.entries).toHaveLength(3);
    const targetPaths3 = r3.entries.map((e) => e.targetPath).sort();
    expect(targetPaths3).toEqual([
      '.claude/rules/coding-standards-idempotent-demo/rules/alpha.md',
      '.claude/rules/coding-standards-idempotent-demo/rules/delta.md',
      '.claude/rules/coding-standards-idempotent-demo/rules/gamma.md',
    ]);
    expect(fs.existsSync(path.join(claudeDir, 'rules', 'delta.md'))).toBe(true);
    expect(fs.readFileSync(path.join(claudeDir, 'rules', 'delta.md'), 'utf-8')).toBe('# delta\n');
  });
});
