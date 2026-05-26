/**
 * Unit tests for the symlink-first / copy-fallback materializer in
 * `cli/src/lib/mirror-runner.ts` (acceptance criterion U2).
 *
 * Validates the four behaviors from the cross-platform test plan:
 *   1. When `fs.symlinkSync` throws `EPERM`, the runner falls back to
 *      `fs.copyFileSync` with the same source/target arguments.
 *   2. The resulting `MirrorEntry` records `mode: 'copy'`.
 *   3. A subsequent call with `recordedMode: 'copy'` calls `copyFileSync`
 *      again WITHOUT touching `symlinkSync` (no retry storm on Windows).
 *   4. End-to-end `mirrorModule` integration: the entry surfaced through
 *      the claude-code mirror pathway carries the `copy` mode forward.
 *
 * See: openspec/changes/cross-platform/tests/test-plan.md (U2)
 * See: openspec/specs/cross-platform/mirror-hook.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import type { ResolvedModule } from '@cli/adapters/types';

/**
 * Shared mutable state for the hoisted `fs` mock. Tests flip `symlinkThrow`
 * to install an error factory and read `symlinkSpy` / `copySpy` to assert
 * call sites and argument shapes. Using `vi.hoisted` keeps these references
 * stable across the mock factory and the test bodies because `vi.mock` is
 * hoisted to the top of the module by the transformer.
 */
const fsMocks = vi.hoisted(() => ({
  symlinkThrow: null as null | (() => NodeJS.ErrnoException),
  symlinkSpy: null as null | ReturnType<typeof vi.fn>,
  copySpy: null as null | ReturnType<typeof vi.fn>,
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  const symlinkSpy = vi.fn(
    (src: fs.PathLike, dest: fs.PathLike, type?: fs.symlink.Type | null) => {
      if (fsMocks.symlinkThrow) {
        throw fsMocks.symlinkThrow();
      }
      return actual.symlinkSync(src, dest, type ?? undefined);
    }
  );
  const copySpy = vi.fn((src: fs.PathLike, dest: fs.PathLike, mode?: number) =>
    actual.copyFileSync(src, dest, mode)
  );
  fsMocks.symlinkSpy = symlinkSpy;
  fsMocks.copySpy = copySpy;
  return { ...actual, default: actual, symlinkSync: symlinkSpy, copyFileSync: copySpy };
});

// Imports below this line resolve to the mocked module above.
import * as fs from 'fs';
import { materializeFile, mirrorModule } from '@cli/lib/mirror-runner';

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
}

function writeRule(root: string, rel: string, body: string): string {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body, 'utf-8');
  return abs;
}

function epermError(): NodeJS.ErrnoException {
  const err = new Error('EPERM: operation not permitted, symlink') as NodeJS.ErrnoException;
  err.code = 'EPERM';
  err.errno = -4048;
  err.syscall = 'symlink';
  return err;
}

function resetFsMocks(): void {
  fsMocks.symlinkThrow = null;
  fsMocks.symlinkSpy?.mockClear();
  fsMocks.copySpy?.mockClear();
}

describe('materializeFile: symlink fallback (U2)', () => {
  let tmp: string;
  let sourceAbs: string;
  let targetAbs: string;

  beforeEach(() => {
    resetFsMocks();
    tmp = makeTempDir('augx-u2');
    sourceAbs = writeRule(tmp, 'src/rule.md', '# rule body\n');
    targetAbs = path.join(tmp, 'out', 'mirror-rule.md');
  });

  afterEach(() => {
    resetFsMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('falls back to copyFileSync with identical arguments when symlinkSync throws EPERM', () => {
    fsMocks.symlinkThrow = () => epermError();

    const result = materializeFile(sourceAbs, targetAbs);

    expect(fsMocks.symlinkSpy).toHaveBeenCalledTimes(1);
    expect(fsMocks.symlinkSpy).toHaveBeenCalledWith(sourceAbs, targetAbs, 'file');
    expect(fsMocks.copySpy).toHaveBeenCalledTimes(1);
    expect(fsMocks.copySpy?.mock.calls[0]?.slice(0, 2)).toEqual([sourceAbs, targetAbs]);
    expect(result).toEqual({ mode: 'copy', reused: false });

    // Sanity: the target file actually exists with the source content.
    expect(fs.existsSync(targetAbs)).toBe(true);
    expect(fs.readFileSync(targetAbs, 'utf-8')).toBe('# rule body\n');
  });

  it('skips symlinkSync entirely when recordedMode is "copy" (second-run path)', () => {
    // First run: symlink fails, we land in copy mode.
    fsMocks.symlinkThrow = () => epermError();
    materializeFile(sourceAbs, targetAbs);

    // Second run: simulate the coordination manifest replaying mode='copy'.
    // Clear the symlink throw so we can verify it is never consulted.
    resetFsMocks();

    // Edit the source so the existing target is not byte-equal and gets rewritten.
    fs.writeFileSync(sourceAbs, '# rule body v2\n', 'utf-8');

    const result = materializeFile(sourceAbs, targetAbs, { recordedMode: 'copy' });

    expect(fsMocks.symlinkSpy).not.toHaveBeenCalled();
    expect(fsMocks.copySpy).toHaveBeenCalledTimes(1);
    expect(fsMocks.copySpy?.mock.calls[0]?.slice(0, 2)).toEqual([sourceAbs, targetAbs]);
    expect(result).toEqual({ mode: 'copy', reused: false });
    expect(fs.readFileSync(targetAbs, 'utf-8')).toBe('# rule body v2\n');
  });

  it('re-throws unexpected errnos instead of falling back', () => {
    fsMocks.symlinkThrow = () => {
      const err = new Error('disk full') as NodeJS.ErrnoException;
      err.code = 'ENOSPC';
      return err;
    };

    expect(() => materializeFile(sourceAbs, targetAbs)).toThrow(/ENOSPC|disk full/);
    expect(fsMocks.copySpy).not.toHaveBeenCalled();
  });
});

describe('mirrorModule: records mode "copy" after EPERM fallback (U2)', () => {
  let tmp: string;

  beforeEach(() => {
    resetFsMocks();
    tmp = makeTempDir('augx-u2-mod');
  });

  afterEach(() => {
    resetFsMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('produces a MirrorEntry with mode="copy" for claude-code under EPERM', () => {
    const moduleRoot = path.join(tmp, 'augment-extensions', 'coding-standards', 'demo');
    writeRule(moduleRoot, 'rules/style.md', '# style rule\n');

    const module: ResolvedModule = {
      id: 'coding-standards/demo',
      version: '1.0.0',
      rootPath: moduleRoot,
      rulesFiles: [{ relativePath: 'rules/style.md', content: '# style rule\n' }],
      examplesFiles: [],
    };

    fsMocks.symlinkThrow = () => epermError();

    const result = mirrorModule(module, ['claude-code'], {
      projectRoot: tmp,
      augxVersion: '0.0.0-test',
      ignorePatterns: [],
      now: () => '2026-05-25T12:00:00.000Z',
      recordedByTarget: new Map(),
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].tool).toBe('claude-code');
    expect(result.entries[0].mode).toBe('copy');
    expect(result.claudeStubsAdded).toBe(true);
  });
});
