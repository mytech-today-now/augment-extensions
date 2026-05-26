# cross-platform

OpenSpec change: distribute Augx extension modules to non-Augment AI coding tools.

## Quick Reference

- **Change ID**: `cross-platform`
- **Status**: Proposed
- **Priority**: High
- **Story Points**: 8
- **Created**: 2026-05-25
- **Type**: Feature (additive, non-breaking)
- **Source**: `ai-prompts/cross-platform-pre-prompt.md` (JIRA AUG-XXX)

## Summary

Extend the `augx` CLI so that modules linked via `augx link <module>` can be transparently materialized into the rules / context surfaces of Claude Code, Cursor, Windsurf, and GitHub Copilot. Two complementary mechanisms:

1. **`augx link --mirror <tool>[,<tool>...]`** - per-module symlink (or copy fallback) into each tool's native rules directory.
2. **`augx export --target <tool>`** - aggregator that concatenates linked modules into the single-file format each tool expects.

Beads task data stays behind the Beads MCP server. Exported files reference the MCP server; they never embed live task state.

## Files in this Change

| File | Purpose |
|---|---|
| `README.md` | This overview. |
| `proposal.md` | Problem, goals, requirements, acceptance criteria. |
| `deltas.md` | ADDED / MODIFIED / REMOVED spec deltas. |
| `design.md` | Components, data flow, source-hash, cross-platform behavior. |
| `tasks.md` | Phase-organized task breakdown (bd-xplat1 ... bd-xplat7). |
| `cross-platform.json` | Machine-readable metadata: targets, schema additions, acceptance. |
| `specs/export-command.md` | `augx export` grammar, output structure, drift detection, exit codes. |
| `specs/mirror-hook.md` | `augx link --mirror`, materialization, idempotency, unlink cleanup. |
| `specs/coordination-export-block.md` | `.augment/coordination.json` `export` and `mirrors` keys. |
| `specs/mcp-template.md` | Beads MCP wiring snippet, conditional inlining, content contract. |
| `examples/CLAUDE.md` | Sample Claude Code aggregator output. |
| `examples/augx.mdc` | Sample Cursor `.mdc` output (placed at `.cursor/rules/augx.mdc`). |
| `examples/.windsurfrules` | Sample Windsurf output. |
| `examples/copilot-instructions.md` | Sample GitHub Copilot output. |
| `examples/coordination.json` | Sample `.augment/coordination.json` with `export` + `mirrors` blocks. |
| `examples/README.md` | Index of the example artifacts. |
| `tests/test-plan.md` | Authoritative U1-U9 / I1-I3 test contract. |
| `tests/fixtures/*` | Coordination, MCP, and golden-output fixtures. |
| `tests/README.md` | Index of test fixtures and mapping to acceptance criteria. |

## Per-Tool Target Paths

| Tool | Aggregated (`augx export`) | Per-Module (`augx link --mirror`) |
|---|---|---|
| Claude Code | `CLAUDE.md` | `.claude/rules/<module>/...` + stub in `CLAUDE.md` |
| Cursor | `.cursor/rules/augx.mdc` | `.cursor/rules/augx-<module>.mdc` |
| Windsurf | `.windsurfrules` | `.windsurf/rules/augx-<module>.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/instructions/augx-<module>.instructions.md` |

## Non-Breaking Guarantees

- `augx init`, `augx link`, `augx show`, `augx list` retain current behavior when no new flags are passed and the new coordination keys are absent.
- `.augment/` rules and the Augment Code surface are untouched.
- Existing `.augment/coordination.json` files require no migration. New keys appear lazily on first use.

## Implementation Sketch

| Phase | Focus | Tasks |
|---|---|---|
| 1 | Foundations: specs, schema, adapter contract, source-hash | `bd-xplat1-*` |
| 2 | `augx export` + four adapters + drift detection | `bd-xplat2-*` |
| 3 | `augx link --mirror`, symlink/copy fallback, unlink | `bd-xplat3-*` |
| 4 | MCP wiring template + conditional inlining | `bd-xplat4-*` |
| 5 | Tests (unit + integration) | `bd-xplat5-*` |
| 6 | Documentation updates | `bd-xplat6-*` |
| 7 | Finalization + archive | `bd-xplat7-*` |

Total estimated effort: ~21 hours.

## Acceptance Criteria (at a glance)

- [ ] `augx link <module> --mirror cursor,windsurf` records paths in coordination.json.
- [ ] `augx unlink <module>` removes every previously mirrored artifact.
- [ ] `augx export --target claude-code` produces a single `CLAUDE.md` with banner, per-module headers, source hash.
- [ ] `augx export --target all --dry-run` reports paths and byte counts; writes nothing.
- [ ] Re-running `augx export` with no input changes is byte-identical.
- [ ] Beads MCP wiring snippet appears only when MCP is configured; no static task data is embedded.
- [ ] Existing Augment Code workflows are unaffected.
- [ ] Unit + integration tests cover all scenarios in `tests/test-plan.md`.

## Out of Scope

- Importing rules from other tools into Augx modules (separate, future ticket).
- Live two-way synchronization between modules and tool-specific files.
- Embedding Beads task data into static rule files.

## Next Steps

1. Review and approve `proposal.md` and `deltas.md`.
2. File the Beads tasks listed in `tasks.md` under the `bd-xplat*` prefix.
3. Begin Phase 1 (`bd-xplat1`) implementation against the specs in `specs/`.
4. On completion, move this directory to `openspec/archive/cross-platform/`.
