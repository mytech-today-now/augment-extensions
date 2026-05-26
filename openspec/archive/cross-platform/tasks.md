# Tasks: cross-platform

Task breakdown for implementing cross-platform distribution of Augx extension modules. Tasks use the `bd-` prefix per `openspec/specs/beads/naming-convention.md`.

---

## Phase 1: Foundations (bd-xplat1)

**Parent**: Land the spec, the adapter contract, and the coordination schema.

### bd-xplat1-1: Write per-capability specs
- Create `openspec/specs/cross-platform/export-command.md`, `mirror-hook.md`, `coordination-export-block.md`, `mcp-template.md`.
- Estimated time: 1 h.

### bd-xplat1-2: Update `.augment/coordination.json` schema
- Add optional `export` and `mirrors` top-level keys to coordination loader.
- Backfill validation: unknown keys allowed, schema versioned.
- Estimated time: 45 min.

### bd-xplat1-3: Define `ToolAdapter` interface
- Create `cli/src/adapters/types.ts` with the adapter contract.
- Estimated time: 30 min.

### bd-xplat1-4: Implement source-hash utility
- `cli/src/lib/source-hash.ts` with canonical JSON encoding and SHA-256.
- Unit tests for stability across module reorder and version bumps.
- Estimated time: 1 h.

---

## Phase 2: Aggregator Command (bd-xplat2)

**Parent**: Ship `augx export` with all four targets.

### bd-xplat2-1: Claude Code adapter
- Render `CLAUDE.md` with banner, per-module headers, footer.
- Estimated time: 1 h.

### bd-xplat2-2: Cursor adapter
- Render `.cursor/rules/augx.mdc` with YAML frontmatter + banner.
- Estimated time: 1 h.

### bd-xplat2-3: Windsurf adapter
- Render `.windsurfrules` (single file).
- Estimated time: 45 min.

### bd-xplat2-4: Copilot adapter
- Render `.github/copilot-instructions.md`.
- Estimated time: 45 min.

### bd-xplat2-5: `augx export` command wiring
- Flag parsing: `--target`, `--output`, `--dry-run`, `--force`.
- Fall-back to `.augment/coordination.json.export.targets` when `--target` absent.
- Estimated time: 1 h.

### bd-xplat2-6: Drift detection
- Read existing target file, extract banner hash, compare with computed hash; refuse without `--force`.
- Estimated time: 45 min.

---

## Phase 3: Mirror Hook (bd-xplat3)

**Parent**: Extend `augx link` and `augx unlink` with per-tool materialization.

### bd-xplat3-1: `--mirror` flag on `augx link`
- Accept comma-separated tool list; honor `.augment/coordination.json.export.mirror` default.
- Estimated time: 45 min.

### bd-xplat3-2: Symlink-first / copy-fallback materializer
- Cross-platform try-symlink-then-copy with mode recorded.
- Estimated time: 1 h.

### bd-xplat3-3: Idempotent re-link
- Diff tracked entries vs. desired set; create / update / prune.
- Estimated time: 1 h.

### bd-xplat3-4: `augx unlink` cleanup
- Remove tracked mirror entries; refuse to delete hand-edited copies.
- Estimated time: 45 min.

---

## Phase 4: MCP Wiring Template (bd-xplat4)

**Parent**: Provide the Beads MCP snippet that exported files inline conditionally.

### bd-xplat4-1: Author template
- Create `augment-extensions/workflows/mcp/templates/beads.md`.
- Estimated time: 30 min.

### bd-xplat4-2: Per-target inlining
- Adapter detects Beads MCP server in `.vscode/mcp.json` or `.augment/mcp/servers.json`; inlines snippet.
- Estimated time: 45 min.

---

## Phase 5: Tests (bd-xplat5)

**Parent**: Unit and integration coverage of acceptance criteria.

### bd-xplat5-1: Unit - source hash stability
- Estimated time: 30 min.

### bd-xplat5-2: Unit - symlink fallback on Windows
- Mock `fs.symlinkSync` to throw `EPERM`; assert copy mode + tracked entry.
- Estimated time: 45 min.

### bd-xplat5-3: Unit - idempotent re-link and stale prune
- Estimated time: 45 min.

### bd-xplat5-4: Unit - drift detection refuses overwrite
- Estimated time: 30 min.

### bd-xplat5-5: Unit - `--dry-run` writes nothing and reports byte counts
- Estimated time: 30 min.

### bd-xplat5-6: Integration - end-to-end export against fixture project
- Link two sample modules, export to all four targets, snapshot output.
- Estimated time: 1 h.

### bd-xplat5-7: Integration - Claude Code + Cursor load test
- Load generated files in actual tool sandboxes; verify parse success.
- Estimated time: 1 h.

---

## Phase 6: Documentation (bd-xplat6)

**Parent**: Update docs to reflect the new surface.

### bd-xplat6-1: Update `AGENTS.md`
- Add `## Cross-Platform Distribution` section.
- Estimated time: 30 min.

### bd-xplat6-2: Update `openspec/project-context.md`
- Mention new export targets under Target Users.
- Estimated time: 15 min.

### bd-xplat6-3: Author `augment-extensions/workflows/cross-platform/` guide
- Day-to-day workflow for `augx export` and `--mirror`.
- Estimated time: 1 h.

---

## Phase 7: Finalization (bd-xplat7)

### bd-xplat7-1: Coordination manifest update
- Register this change, its specs, and its tasks in `.augment/coordination.json`.
- Estimated time: 30 min.

### bd-xplat7-2: Run full validation suite
- All unit + integration tests pass; `augx export --dry-run` on this repo succeeds.
- Estimated time: 30 min.

### bd-xplat7-3: Archive
- Move this change to `openspec/archive/cross-platform/`.
- Estimated time: 15 min.

---

## Summary

- **Total tasks**: 27
- **Total estimated time**: ~21 hours
- **Phases**: 7
- **Dependencies**: Phase 2 + 3 depend on Phase 1; Phase 5 depends on Phase 2 + 3 + 4; Phase 7 depends on all prior phases.
