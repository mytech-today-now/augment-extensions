# Change Proposal: Cross-Platform Distribution of Augx Extension Modules

## Metadata

- **Change ID**: `cross-platform`
- **Status**: Proposed
- **Created**: 2026-05-25
- **Author**: AI Agent
- **Priority**: High
- **Type**: Feature (additive, non-breaking)
- **Story Points**: 8
- **Related JIRA**: AUG-XXX

## Problem Statement

The `augx` extension system today targets Augment Code via `.augment/` rules and the `augment-extensions/` repository. Modules are linked into a project with `augx link <module>` and queried by AI agents with `augx show <module>`. This works cleanly inside Augment, but other AI coding tools each look in their own location for project rules:

- **Claude Code**: top-level `CLAUDE.md` (and/or `.claude/` directory) in the project root.
- **Cursor**: `.cursor/rules/*.mdc` files with frontmatter (`description`, `globs`, `alwaysApply`).
- **Windsurf**: `.windsurfrules` file (or `.windsurf/rules/`) in the project root.
- **GitHub Copilot**: `.github/copilot-instructions.md` and/or `.github/instructions/*.instructions.md`.

A user who wants the same module-driven guidance in those tools must hand-copy content from `augment-extensions/` modules into each location and keep them in sync manually.

## Goals

1. **Single source of truth**: linked Augx modules under `augment-extensions/modules/...` remain the canonical content; per-tool surfaces are derived artifacts.
2. **Non-breaking**: existing `augx init`, `augx link`, `augx show`, `augx list`, and `.augment/` behavior is unchanged. New functionality is opt-in via a new command and an optional post-link hook flag.
3. **Tool parity**: the same module set produces equivalent guidance in Claude Code, Cursor, Windsurf, and Copilot, modulated only by each tool's file-format conventions.
4. **MCP-first task context**: dynamic, live data (open Beads tasks, dependencies, status) continues to flow through the Beads MCP server rather than being baked into static rule files.

## Proposed Solution

Provide two complementary mechanisms:

1. **Post-link Mirror Hook**: extend `augx link <module>` with an optional `--mirror <tool>[,<tool>...]` flag that symlinks or copies resolved module rules into each tool's native rules directory.
2. **Aggregator Command**: add `augx export --target <tool>` that concatenates linked module content into the single-file rule formats those tools expect.

Continue to rely on the Beads MCP server as the primary live task-context channel for any MCP-capable agent so all tools share the same task-context view that the Augment agent already has.

## Key Requirements

### 1. Post-link Symlink/Copy Hook

- New `--mirror <tool>[,<tool>...]` flag on `augx link`.
- Per-project default in `.augment/coordination.json` under a new `mirrors` key.
- For each target tool, resolve the module's `rules/` files and either symlink (preferred on POSIX) or copy (fallback on Windows or when symlinks are disallowed) into:
  - Claude Code: `.claude/rules/<module>/...` + stub include in `CLAUDE.md`.
  - Cursor: `.cursor/rules/augx-<module>.mdc` (one file per module, generated frontmatter).
  - Windsurf: `.windsurf/rules/augx-<module>.md` (or append into `.windsurfrules`).
  - Copilot: `.github/instructions/augx-<module>.instructions.md`.
- Idempotent: re-running `augx link` updates in place and prunes stale entries.
- Track every materialized path in `.augment/coordination.json` so `augx unlink` can clean them up.

### 2. Aggregator Command: `augx export`

- Syntax:
  ```
  augx export --target claude-code|cursor|windsurf|copilot|all [--output <path>] [--dry-run] [--force]
  ```
- Per-target output:
  - `claude-code` -> `CLAUDE.md`
  - `cursor` -> `.cursor/rules/augx.mdc` with frontmatter (`description: "Augx aggregated rules"`, `alwaysApply: true`)
  - `windsurf` -> `.windsurfrules`
  - `copilot` -> `.github/copilot-instructions.md`
  - `all` -> all of the above in one pass
- Output structure:
  - Generated header banner with timestamp, augx version, and a hash of source modules.
  - Per-module section headers `## Module: <name> (v<version>)` to preserve attribution.
  - Trailing footer pointing back to the canonical module location.
- Respect a project-level ignore list (e.g., `examples/` directories).
- `--dry-run` prints the resolved file list and character/byte count per target without writing.

### 3. MCP-First Task Context

- Do NOT bake Beads task data into exported rule files.
- Export header for each target references the Beads MCP server and instructs the consuming agent to query it for current task state.
- Provide a small, tool-agnostic snippet (template under `augment-extensions/workflows/mcp/templates/`) that describes how to wire up the Beads MCP server for each target tool. Inline that snippet into the exported file when `.vscode/mcp.json` or `.augment/mcp/servers.json` declares a Beads server.
- `augx mcp` subcommands (`list`, `exec`, `discover`) remain the canonical interface.

### 4. Configuration Surface

Add an optional `export` block to `.augment/coordination.json`:

```json
"export": {
  "targets": ["claude-code", "cursor"],
  "ignore": ["**/examples/**"],
  "mirror": false
}
```

When present, `augx export` with no `--target` flag falls back to `export.targets`. All keys are optional; absence preserves current behavior exactly.

### 5. Safety and Determinism

- Generated files begin with `<!-- GENERATED BY augx export - DO NOT EDIT -->`.
- Detect manual edits via an embedded source hash; refuse to overwrite unless `--force` is supplied.
- Never write outside the project root. Never follow symlinks out of `augment-extensions/`.

### 6. Cross-Platform Behavior

- On Windows, fall back to copy mode automatically when symlink creation fails (no admin / Developer Mode).
- Normalize line endings to LF in generated files regardless of host OS.
- Use forward-slash paths in all generated content.

## Acceptance Criteria

- [ ] `augx link <module> --mirror cursor,windsurf` materializes the module into both tools' rule locations and records the paths in `.augment/coordination.json`.
- [ ] `augx unlink <module>` removes every previously mirrored artifact for that module.
- [ ] `augx export --target claude-code` produces a single `CLAUDE.md` with all linked modules, per-module headers, generation banner, and source hash.
- [ ] `augx export --target all --dry-run` reports each target file path and projected byte count, writing nothing.
- [ ] Re-running `augx export` without changes is a no-op (byte-identical output, same source hash).
- [ ] When a Beads MCP server is configured, exported files include the MCP wiring snippet but contain no static task data.
- [ ] Existing Augment Code workflows (`.augment/` rules, `augx show`, `augx list`) are unaffected.
- [ ] Unit tests cover: symlink fallback to copy on Windows, idempotent re-link, stale-artifact pruning on unlink, drift detection on manual edit, `--dry-run` correctness.
- [ ] Integration tests link a sample module and verify resulting files load correctly in at least two of the four target tools.
- [ ] Documentation in `AGENTS.md` and `augment-extensions/workflows/` is updated.

## Out of Scope

- Importing rules authored natively in other tools back into Augx modules.
- Live, two-way synchronization. Generation is one-way: modules -> derived artifacts.
- Embedding Beads task data into static rule files.

## Risks

- **Symlink permissions on Windows**: mitigated by automatic copy fallback.
- **Tool format drift**: mitigated by per-target adapter layer that is independently versioned.
- **Aggregate file size budget**: mitigated by `ignore` patterns and `--dry-run` reporting.

## Labels

augx, cli, claude-code, cursor, windsurf, copilot, mcp, beads, interoperability, non-breaking
