/**
 * End-to-end export test (acceptance criterion I1).
 *
 * Drives the real `exportCommand` against a synthetic two-module project
 * (a `coding-standards/typescript-standards` module and a
 * `workflows/openspec-workflow` module) and verifies:
 *
 *   1. All four Phase-1 destination files are written and match committed
 *      goldens under `tests/fixtures/cross-platform-e2e/goldens/`. Goldens
 *      are managed by Vitest's `toMatchFileSnapshot` helper; regenerate
 *      with `npx vitest run -u`.
 *   2. A second `augx export --target all` against the unchanged fixture
 *      produces byte-identical output (the runner takes the `equivalent`
 *      branch and skips the write).
 *
 * `@cli/lib/module-resolver` is mocked so the resolved-module set stays
 * deterministic; `AUGX_FAKE_NOW` pins the timestamp so the banner is
 * stable across hosts.
 *
 * See: openspec/changes/cross-platform/tests/test-plan.md (I1)
 * See: openspec/specs/cross-platform/export-command.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
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

import { exportCommand } from '@cli/commands/export';
import { EXIT } from '@cli/lib/export-runner';

const FIXED_TIMESTAMP = '2026-05-25T12:00:00Z';

const GOLDENS_DIR = path.resolve(
  __dirname,
  'fixtures',
  'cross-platform-e2e',
  'goldens'
);

/** TypeScript-standards module body. Stable on purpose so source-hash is pinned. */
const TS_RULE_BODY = `# TypeScript Standards

## Strict Mode

- Always enable strict mode in tsconfig.json.
- Avoid \`any\`; prefer \`unknown\` with narrowing.
- All public functions must have explicit return types.
`;

/** OpenSpec-workflow module body. */
const OS_RULE_BODY = `# OpenSpec Workflow

## Drafting

- Create proposal.md before writing code.
- Define spec deltas under specs/.
- Break work into tasks.md.
`;

function makeModule(
  id: string,
  ruleRelativePath: string,
  body: string
): ResolvedModule {
  return {
    id,
    version: '1.0.0',
    rootPath: `/virtual/${id}`,
    rulesFiles: [{ relativePath: ruleRelativePath, content: body }],
    examplesFiles: [],
  };
}

/** All four destinations, paired with the golden file used for comparison. */
const TARGETS: Array<{
  tool: string;
  relPath: string;
  goldenName: string;
}> = [
  { tool: 'claude-code', relPath: 'CLAUDE.md', goldenName: 'CLAUDE.md' },
  {
    tool: 'cursor',
    relPath: path.join('.cursor', 'rules', 'augx.mdc'),
    goldenName: 'cursor.augx.mdc',
  },
  { tool: 'windsurf', relPath: '.windsurfrules', goldenName: 'windsurfrules' },
  {
    tool: 'copilot',
    relPath: path.join('.github', 'copilot-instructions.md'),
    goldenName: 'copilot-instructions.md',
  },
];

describe('augx export --target all (I1, end-to-end)', () => {
  let tmp: string;
  let cwdSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.AUGX_FAKE_NOW;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-i1-'));
    fs.mkdirSync(path.join(tmp, '.augment'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, '.augment', 'extensions.json'),
      JSON.stringify({ version: '1.0.0', modules: [] }, null, 2),
      'utf-8'
    );
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    process.env.AUGX_FAKE_NOW = FIXED_TIMESTAMP;
    resolverMocks.modules = [
      makeModule(
        'coding-standards/typescript-standards',
        'rules/strict-mode.md',
        TS_RULE_BODY
      ),
      makeModule(
        'workflows/openspec-workflow',
        'rules/drafting.md',
        OS_RULE_BODY
      ),
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

  it('writes four files matching committed goldens and re-exports byte-identically', async () => {
    // First export: produces the four target files.
    const first = await exportCommand({ target: 'all' });
    expect(first).toBe(EXIT.OK);

    const firstSnapshot: Record<string, string> = {};
    for (const t of TARGETS) {
      const abs = path.join(tmp, t.relPath);
      expect(fs.existsSync(abs), `expected ${t.relPath} after first export`).toBe(
        true
      );
      firstSnapshot[t.tool] = fs.readFileSync(abs, 'utf-8');
    }

    // Compare each captured file against its committed golden. Vitest
    // creates the golden on first run; regenerate via `vitest -u` after
    // bumping `package.json#version` or changing adapter output.
    for (const t of TARGETS) {
      await expect(firstSnapshot[t.tool]).toMatchFileSnapshot(
        path.join(GOLDENS_DIR, t.goldenName)
      );
    }

    // Second export against the unchanged fixture: drift = equivalent,
    // no write, files unchanged byte-for-byte.
    const second = await exportCommand({ target: 'all' });
    expect(second).toBe(EXIT.OK);
    for (const t of TARGETS) {
      const abs = path.join(tmp, t.relPath);
      const after = fs.readFileSync(abs, 'utf-8');
      expect(
        after,
        `${t.relPath} must be byte-identical on idempotent re-export`
      ).toBe(firstSnapshot[t.tool]);
    }
  });
});
