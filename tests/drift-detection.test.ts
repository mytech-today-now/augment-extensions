/**
 * Unit tests for drift detection in `augx export` (acceptance criterion U4).
 *
 * Validates the three-step contract from the cross-platform test plan:
 *   1. Run `augx export --target claude-code` against a fixture project and
 *      capture the embedded source-hash from the generated CLAUDE.md.
 *   2. Append a stray line to CLAUDE.md and re-run without `--force`.
 *      Assert the runner exits with `EXIT.DRIFT` (3) and the file is
 *      unchanged byte-for-byte.
 *   3. Re-run with `--force`. Assert exit `EXIT.OK` (0) and the stray line
 *      has been overwritten by regenerated content with the same hash.
 *
 * The test mocks `@cli/lib/module-resolver` so it does not depend on the
 * workspace's real module set; `process.cwd()` is spied to point at a
 * fresh temp project root for each invocation.
 *
 * See: openspec/changes/cross-platform/tests/test-plan.md (U4)
 * See: openspec/specs/cross-platform/export-command.md (Drift Detection)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ResolvedModule } from '@cli/adapters/types';

/**
 * Shared mutable state for the hoisted module-resolver mock so the test
 * body can pivot the resolved module set between invocations without
 * tearing down the mock factory.
 */
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

// Imports below resolve against the mocked module-resolver.
import { exportCommand } from '@cli/commands/export';
import { EXIT } from '@cli/lib/export-runner';
import { extractEmbeddedHash } from '@cli/lib/source-hash';

const FIXED_TIMESTAMP = '2026-05-25T12:00:00Z';

/** Construct a synthetic `ResolvedModule` with a stable digest input. */
function makeModule(id: string, ruleBody: string): ResolvedModule {
  return {
    id,
    version: '1.0.0',
    rootPath: `/virtual/${id}`,
    rulesFiles: [{ relativePath: 'rules/main.md', content: ruleBody }],
    examplesFiles: [],
  };
}

describe('augx export: drift detection (U4)', () => {
  let tmp: string;
  let cwdSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.AUGX_FAKE_NOW;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-u4-'));
    fs.mkdirSync(path.join(tmp, '.augment'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, '.augment', 'extensions.json'),
      JSON.stringify({ version: '1.0.0', modules: [] }, null, 2),
      'utf-8'
    );
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    process.env.AUGX_FAKE_NOW = FIXED_TIMESTAMP;
    resolverMocks.modules = [
      makeModule('coding-standards/u4-demo', '# u4 demo rule\n'),
    ];
    process.exitCode = 0;
  });

  afterEach(() => {
    cwdSpy.mockRestore();
    if (originalEnv === undefined) {
      delete process.env.AUGX_FAKE_NOW;
    } else {
      process.env.AUGX_FAKE_NOW = originalEnv;
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    process.exitCode = 0;
  });

  it('refuses overwrite on drift and regenerates with --force', async () => {
    const claudePath = path.join(tmp, 'CLAUDE.md');

    // Step 1: fresh export populates CLAUDE.md with a banner-bearing body.
    const initialCode = await exportCommand({ target: 'claude-code' });
    expect(initialCode).toBe(EXIT.OK);
    expect(fs.existsSync(claudePath)).toBe(true);
    const initialContent = fs.readFileSync(claudePath, 'utf-8');
    const initialHash = extractEmbeddedHash(initialContent);
    expect(initialHash).toMatch(/^[0-9a-f]{16}$/);

    // Step 2: hand-edit (append a stray line) and re-run without --force.
    const tampered = initialContent + '\n<!-- stray hand-edit -->\n';
    fs.writeFileSync(claudePath, tampered, 'utf-8');

    const driftCode = await exportCommand({ target: 'claude-code' });
    expect(driftCode).toBe(EXIT.DRIFT);

    // File must be byte-identical to the tampered version.
    expect(fs.readFileSync(claudePath, 'utf-8')).toBe(tampered);

    // Step 3: re-run with --force; stray line must be gone and hash stable.
    const forceCode = await exportCommand({ target: 'claude-code', force: true });
    expect(forceCode).toBe(EXIT.OK);

    const regenerated = fs.readFileSync(claudePath, 'utf-8');
    expect(regenerated).not.toContain('<!-- stray hand-edit -->');
    expect(extractEmbeddedHash(regenerated)).toBe(initialHash);
    // Content matches the initial export because inputs/timestamp are pinned.
    expect(regenerated).toBe(initialContent);
  });

  it('returns EXIT.DRIFT with no banner when the existing file lacks one', async () => {
    const claudePath = path.join(tmp, 'CLAUDE.md');
    // Pre-populate an untagged file as if a user wrote it by hand.
    fs.writeFileSync(claudePath, '# my hand-written notes\n', 'utf-8');

    const code = await exportCommand({ target: 'claude-code' });
    expect(code).toBe(EXIT.DRIFT);
    // Original hand-written file is preserved verbatim.
    expect(fs.readFileSync(claudePath, 'utf-8')).toBe('# my hand-written notes\n');
  });
});
