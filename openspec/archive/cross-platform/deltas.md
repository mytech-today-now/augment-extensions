# Spec Deltas: cross-platform

This document records ADDED, MODIFIED, and REMOVED specs for the `cross-platform` change. Each delta block names the target spec file and the nature of the change.

---

## ADDED: Augx Export Command Spec

**File**: `openspec/specs/cross-platform/export-command.md`

Introduces the `augx export` command and its targets (`claude-code`, `cursor`, `windsurf`, `copilot`, `all`), the generated-file banner contract, the source-hash-based drift detection, `--dry-run`, `--force`, and `--output` behaviors. See the spec file for full grammar and exit codes.

---

## ADDED: Augx Mirror Hook Spec

**File**: `openspec/specs/cross-platform/mirror-hook.md`

Adds the `--mirror <tool>[,<tool>...]` flag to `augx link`, the symlink-preferred / copy-fallback materialization strategy, per-tool target paths, idempotent re-link semantics, and stale-artifact pruning during `augx unlink`. See the spec file for full path conventions and Windows fallback rules.

---

## ADDED: Coordination Export Block Spec

**File**: `openspec/specs/cross-platform/coordination-export-block.md`

Defines the optional `export` block in `.augment/coordination.json`:

```json
{
  "export": {
    "targets": ["claude-code", "cursor"],
    "ignore": ["**/examples/**"],
    "mirror": false
  }
}
```

All keys optional. Absence preserves current behavior exactly. Also defines the `mirrors` tracking key used by the mirror hook to record materialized paths for later cleanup.

---

## ADDED: MCP Wiring Template Spec

**File**: `openspec/specs/cross-platform/mcp-template.md`

Defines the tool-agnostic Beads MCP wiring snippet stored under `augment-extensions/workflows/mcp/templates/`, the per-target adapter rules (Claude Code, Cursor, Windsurf, Copilot), and the rule that exported files MUST reference the MCP server for live task data rather than embedding it.

---

## MODIFIED: AGENTS.md

**File**: `AGENTS.md`

Add a new section under `## Cross-Platform Distribution` documenting:
- The `augx export` command and supported targets.
- The `--mirror` flag on `augx link`.
- The `export` block in `.augment/coordination.json`.
- The MCP-first task-context contract (no static task data in exported files).

The existing Augx, OpenSpec, JIRA, Beads, Coordination, and MCP sections are unchanged.

---

## MODIFIED: Augment Extensions Workflows Index

**File**: `augment-extensions/workflows/README.md` (if present; create if absent only as part of this change's implementation, not as part of this spec)

Add an entry pointing to `augment-extensions/workflows/mcp/templates/` and to a new `augment-extensions/workflows/cross-platform/` workflow guide describing how to use `augx export` and `--mirror` in day-to-day development.

---

## MODIFIED: Project Context

**File**: `openspec/project-context.md`

Add a bullet under `## Target Users` clarifying that exported artifacts make the modules consumable by Claude Code, Cursor, Windsurf, and GitHub Copilot in addition to Augment Code. Add a bullet under `## Future Roadmap` removing the cross-platform distribution item once this change archives.

---

## MODIFIED: `.augment/coordination.json` Schema

**File**: `.augment/coordination.json` (data file; schema documented in `openspec/specs/cross-platform/coordination-export-block.md`)

Add two new top-level optional keys:
- `export` - aggregator configuration (see spec).
- `mirrors` - tracking record of materialized per-tool artifact paths, keyed by module ID. Used by `augx unlink` for cleanup.

Both keys are optional. Existing consumers ignore unknown keys.

---

## REMOVED

None. This change is strictly additive. No existing commands, flags, files, or behaviors are removed or renamed.

---

## Files Affected (Summary)

New spec files:
- `openspec/specs/cross-platform/export-command.md`
- `openspec/specs/cross-platform/mirror-hook.md`
- `openspec/specs/cross-platform/coordination-export-block.md`
- `openspec/specs/cross-platform/mcp-template.md`

Modified docs:
- `AGENTS.md`
- `openspec/project-context.md`
- `augment-extensions/workflows/README.md` (optional)

New workflow / templates (implementation phase, not spec phase):
- `augment-extensions/workflows/cross-platform/`
- `augment-extensions/workflows/mcp/templates/`

New CLI surface (implementation phase):
- `cli/src/commands/export.ts`
- `cli/src/commands/link.ts` (extended with `--mirror`)
- `cli/src/adapters/{claude-code,cursor,windsurf,copilot}.ts`
- `cli/src/lib/source-hash.ts`
- `cli/src/lib/coordination.ts` (extended with `export` and `mirrors` keys)

Tracking data:
- `.augment/coordination.json` (gains optional `export` and `mirrors` keys)
