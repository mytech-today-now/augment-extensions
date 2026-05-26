# Test Plan: cross-platform

Test coverage required for the acceptance criteria in `proposal.md`. Tests live under `cli/test/` (unit) and `cli/test/integration/` (integration) once the implementation phase begins. This document is the contract those test files must satisfy.

## Unit Tests

### U1. Source hash stability (`source-hash.test.ts`)

- Same modules in different array order produce the same hash.
- Version bump on one module changes the hash.
- Edit of one file's content changes the hash.
- Hash is deterministic across OS (golden vector).

### U2. Symlink fallback on Windows (`mirror-symlink-fallback.test.ts`)

- Mock `fs.symlinkSync` to throw `EPERM`.
- Assert `copyFile` is called with same arguments.
- Assert coordination manifest records `mode: 'copy'`.
- Re-run: second invocation calls `copyFile` again (not `symlinkSync`) because tracked mode is `copy`.

### U3. Idempotent re-link and stale prune (`mirror-idempotent.test.ts`)

- Link a module with 3 rule files; assert 3 tracked entries.
- Delete one source file; re-link.
- Assert tracked entries == 2 and the orphaned destination file is removed.
- Add a new source file; re-link.
- Assert tracked entries == 3 and new destination exists.

### U4. Drift detection refuses overwrite (`drift-detection.test.ts`)

- Run `augx export --target claude-code`; capture banner hash.
- Append a stray line to `CLAUDE.md`.
- Re-run `augx export --target claude-code` without `--force`.
- Assert exit code 3 and `CLAUDE.md` unchanged.
- Re-run with `--force`.
- Assert exit code 0 and content regenerated (stray line gone).

### U5. `--dry-run` writes nothing (`dry-run.test.ts`)

- Stub `fs.writeFile` and `fs.writeFileSync` to fail if called.
- Run `augx export --target all --dry-run`.
- Assert stdout contains four `[dry-run]` lines with byte counts.
- Assert no writes occurred.

### U6. Unlink cleanup (`unlink-cleanup.test.ts`)

- Link a module with `--mirror cursor,claude-code`.
- Assert tracked entries for both tools.
- Run `augx unlink <module>`.
- Assert all tracked target files are gone and `mirrors[<module>]` is removed.
- Hand-edit one tracked file's content first.
- Re-run `unlink`.
- Assert the hand-edited file remains and a warning is emitted.

### U7. Coordination schema round-trip (`coordination-schema.test.ts`)

- Read a `.augment/coordination.json` containing unknown top-level keys.
- Write it back.
- Assert unknown keys are preserved.
- Assert keys are alphabetically sorted at each object level.

### U8. MCP snippet inlining (`mcp-snippet.test.ts`)

- Without `.vscode/mcp.json` or `.augment/mcp/servers.json`, assert exported files contain NO snippet.
- With either file declaring server id `beads`, assert exported files contain the snippet.
- Assert the snippet contains no `bd-` IDs and no status assertions.

### U9. Per-target adapter rendering (`adapter-*.test.ts`, one file per adapter)

- Given a fixed `ResolvedModule[]`, snapshot the rendered output for each adapter.
- Assert frontmatter / banner placement matches the spec.
- Assert alphabetical module ordering.

## Integration Tests

### I1. End-to-end export against fixture project (`export-e2e.test.ts`)

- Project fixture under `cli/test/fixtures/cross-platform-e2e/`.
- Two linked modules: `typescript-standards` and `openspec-workflow`.
- Run `augx export --target all`.
- Snapshot all four output files; compare against committed goldens.
- Re-run; assert byte-identical (no-op) output.

### I2. Mirror + unlink round-trip (`mirror-roundtrip.test.ts`)

- `augx link typescript-standards --mirror cursor,claude-code`.
- Assert files exist at the spec-defined paths.
- Assert `.augment/coordination.json.mirrors.typescript-standards` populated.
- `augx unlink typescript-standards`.
- Assert files gone; assert `mirrors.typescript-standards` removed.

### I3. Claude Code and Cursor parse generated files (`tool-parse.test.ts`)

- After I1 runs, load `CLAUDE.md` and `.cursor/rules/augx.mdc` with each tool's official parser (or a known-good schema).
- Assert no parse errors.
- Assert YAML frontmatter on `.mdc` parses cleanly and contains the expected keys.

## Fixtures

- `cli/test/fixtures/cross-platform-e2e/augment-extensions/modules/typescript-standards/` - minimal `rules/` + `module.json`.
- `cli/test/fixtures/cross-platform-e2e/augment-extensions/modules/openspec-workflow/` - same.
- `cli/test/fixtures/cross-platform-e2e/.augment/coordination.json` - pre-linked.
- `cli/test/fixtures/cross-platform-e2e/.vscode/mcp.json` - declares `beads`.

## Determinism Harness

- All tests set `AUGX_FAKE_NOW=2026-05-25T12:00:00Z` so timestamp-bearing banners are stable across runs.
- Hash inputs exclude the timestamp; only content + module identity contribute to `source-hash`.

## Coverage Targets

| Area | Min coverage |
|---|---|
| `cli/src/lib/source-hash.ts` | 100% |
| `cli/src/adapters/*.ts` | 95% |
| `cli/src/commands/export.ts` | 90% |
| `cli/src/commands/link.ts` (mirror paths only) | 90% |

## Out of Scope for Tests

- Behavior of the actual Claude Code, Cursor, Windsurf, or Copilot clients beyond parse success.
- Beads MCP server behavior (covered by Beads' own test suite).
