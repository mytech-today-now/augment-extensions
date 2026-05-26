/**
 * Unit tests for `augx export --dry-run` (acceptance criterion U5).
 *
 * Verifies the three behaviors mandated by the cross-platform test plan:
 *   1. `fs.writeFile` and `fs.writeFileSync` are stubbed to fail if invoked
 *      during a dry-run; the run completes without triggering them.
 *   2. `augx export --target all --dry-run` emits exactly four `[dry-run]`
 *      lines on stdout (one per Phase-1 adapter), each carrying the
 *      destination path and a numeric byte count.
 *   3. The runner exits with `EXIT.OK` (0) and no destination file is
 *      materialized on disk.
 *
 * `@cli/lib/module-resolver` is mocked so the resolved-module set is
 * deterministic and the test does not depend on the workspace's real
 * linked-module list.
 *
 * See: openspec/changes/cross-platform/tests/test-plan.md (U5)
 * See: openspec/specs/cross-platform/export-command.md (Per dry-run behavior)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import type { ResolvedModule } from '@cli/adapters/types';

const resolverMocks = vi.hoisted(() => ({
  modules: [] as ResolvedModule[],
}));

vi.mock('@cli/lib/module-resolver', async () => {
  const actual = await vi.importActual<typeof import('@cli/lib/module-resolver')>(
    '@cli/lib/module-resolver'
  );
  return {
    ...actual,
    resolveLinkedModules: () => resolverMocks.modules,
  };
});

/**
 * Shared mutable state for the hoisted `fs` mock. `blockWrites` lets the
 * test set up its fixture using the real `writeFileSync` and then flip the
 * switch so any subsequent invocation during `exportCommand` throws.
 */
const fsMocks = vi.hoisted(() => ({
  blockWrites: false,
  writeFileSyncSpy: null as null | ReturnType<typeof vi.fn>,
  writeFileSpy: null as null | ReturnType<typeof vi.fn>,
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  const writeFileSyncSpy = vi.fn(
    (...args: Parameters<typeof actual.writeFileSync>) => {
      if (fsMocks.blockWrites) {
        throw new Error('fs.writeFileSync must not be called during --dry-run');
      }
      return actual.writeFileSync(...args);
    }
  );
  const writeFileSpy = vi.fn(((...args: unknown[]) => {
    if (fsMocks.blockWrites) {
      throw new Error('fs.writeFile must not be called during --dry-run');
    }
    return (actual.writeFile as unknown as (...a: unknown[]) => unknown)(...args);
  }) as unknown as typeof actual.writeFile);
  fsMocks.writeFileSyncSpy = writeFileSyncSpy;
  fsMocks.writeFileSpy = writeFileSpy;
  return {
    ...actual,
    default: actual,
    writeFileSync: writeFileSyncSpy,
    writeFile: writeFileSpy,
  };
});

// Imports below resolve to the mocked `fs` above.
import * as fs from 'fs';
import { exportCommand } from '@cli/commands/export';
import { EXIT } from '@cli/lib/export-runner';

/** Pinned timestamp keeps banner output stable for projected byte-count math. */
const FIXED_TIMESTAMP = '2026-05-25T12:00:00Z';

/** All four Phase-1 adapter ids. Order matches the alphabetical loop in `allAdapters()`. */
const ALL_TOOLS: readonly string[] = ['claude-code', 'copilot', 'cursor', 'windsurf'];

function makeModule(id: string, ruleBody: string): ResolvedModule {
  return {
    id,
    version: '1.0.0',
    rootPath: `/virtual/${id}`,
    rulesFiles: [{ relativePath: 'rules/main.md', content: ruleBody }],
    examplesFiles: [],
  };
}

describe('augx export --dry-run (U5)', () => {
  let tmp: string;
  let cwdSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.AUGX_FAKE_NOW;

  beforeEach(() => {
    fsMocks.blockWrites = false;
    fsMocks.writeFileSyncSpy?.mockClear();
    fsMocks.writeFileSpy?.mockClear();

    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-u5-'));
    fs.mkdirSync(path.join(tmp, '.augment'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, '.augment', 'extensions.json'),
      JSON.stringify({ version: '1.0.0', modules: [] }, null, 2),
      'utf-8'
    );

    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    process.env.AUGX_FAKE_NOW = FIXED_TIMESTAMP;

    resolverMocks.modules = [
      makeModule('coding-standards/u5-demo', '# u5 demo rule\n'),
      makeModule('domain-rules/u5-other', '# u5 other rule\n'),
    ];

    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.exitCode = 0;
  });

  afterEach(() => {
    fsMocks.blockWrites = false;
    logSpy.mockRestore();
    cwdSpy.mockRestore();
    if (originalEnv === undefined) {
      delete process.env.AUGX_FAKE_NOW;
    } else {
      process.env.AUGX_FAKE_NOW = originalEnv;
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    process.exitCode = 0;
  });

  it('emits four [dry-run] lines and performs no writes', async () => {
    // From this point any write must throw, matching the spec wording.
    fsMocks.blockWrites = true;
    const writeCallsBefore = fsMocks.writeFileSyncSpy!.mock.calls.length;
    const writeAsyncCallsBefore = fsMocks.writeFileSpy!.mock.calls.length;

    const code = await exportCommand({ target: 'all', dryRun: true });

    // No write API may have been invoked while writes were blocked.
    expect(fsMocks.writeFileSyncSpy!.mock.calls.length).toBe(writeCallsBefore);
    expect(fsMocks.writeFileSpy!.mock.calls.length).toBe(writeAsyncCallsBefore);
    expect(code).toBe(EXIT.OK);

    // Collect every captured stdout line.
    const lines = logSpy.mock.calls
      .map((args) => String(args[0] ?? ''))
      .filter((line) => line.startsWith('[dry-run]'));

    expect(lines).toHaveLength(4);
    for (const tool of ALL_TOOLS) {
      const hit = lines.find((l) => l.includes(tool));
      expect(hit, `expected a [dry-run] line for ${tool}`).toBeDefined();
      expect(hit).toMatch(/\(\d[\d_]* bytes, 2 modules\)/);
    }

    // No destination file should exist on disk.
    expect(fs.existsSync(path.join(tmp, 'CLAUDE.md'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, '.cursor', 'rules', 'augx.mdc'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, '.windsurfrules'))).toBe(false);
    expect(
      fs.existsSync(path.join(tmp, '.github', 'copilot-instructions.md'))
    ).toBe(false);
  });
});
