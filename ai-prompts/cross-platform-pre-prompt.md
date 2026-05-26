# JIRA Ticket: AUG-XXX - Cross-Platform Distribution of Augx Extension Modules to Non-Augment AI Coding Tools

## Summary
Extend the `augx` CLI so that modules linked via `augx link <module>` can be transparently materialized into the rules/context surfaces of other AI coding tools (Claude Code, Cursor, Windsurf, GitHub Copilot, and similar). Provide two complementary mechanisms - (1) a symlink/copy post-link hook that mirrors resolved module files into each tool's native rules directory, and (2) a new `augx export --target <tool>` aggregator command that concatenates linked module content into the single-file rule formats those tools expect. Continue to rely on the Beads MCP server as the primary live task-context channel for any MCP-capable agent so that all tools share the same task-context view that the Augment agent already has.

## Description

### Background
The `augx` extension system today targets Augment Code via `.augment/` rules and the `augment-extensions/` repository (see `AGENTS.md` for the integration contract). Modules are linked into a project with `augx link <module>` and queried by AI agents with `augx show <module>`. This works cleanly inside Augment, but other AI coding tools each look in their own location for project rules:

- **Claude Code**: a top-level `CLAUDE.md` (and/or `.claude/` directory) in the project root.
- **Cursor**: `.cursor/rules/*.mdc` files with frontmatter (`description`, `globs`, `alwaysApply`).
- **Windsurf**: a `.windsurfrules` file (or `.windsurf/rules/`) in the project root.
- **GitHub Copilot**: `.github/copilot-instructions.md` and/or `.github/instructions/*.instructions.md`.

Today, a user who wants the same module-driven guidance in those tools must hand-copy content from `augment-extensions/` modules into each of those locations and keep them in sync manually. The goal of this ticket is to make that distribution a first-class, non-breaking feature of `augx`.

### Goals
1. **Single source of truth**: linked Augx modules under `augment-extensions/modules/...` remain the canonical content; per-tool surfaces are derived artifacts.
2. **Non-breaking**: existing `augx init`, `augx link`, `augx show`, `augx list`, and `.augment/` behavior must be unchanged. The new functionality is opt-in via a new command and an optional post-link hook flag.
3. **Tool parity**: the same module set should produce equivalent guidance in Claude Code, Cursor, Windsurf, and Copilot, modulated only by each tool's file-format conventions.
4. **MCP-first task context**: dynamic, live data (open Beads tasks, dependencies, status) must continue to flow through the Beads MCP server rather than being baked into static rule files.

### Key Requirements

1. **Post-link Symlink/Copy Hook**
   - Extend `augx link <module>` with an optional `--mirror <tool>[,<tool>...]` flag (and a per-project default in `.augment/coordination.json` under a new `mirrors` key).
   - For each target tool, resolve the module's `rules/` files and either symlink them (preferred on POSIX) or copy them (fallback on Windows or when symlinks are disallowed) into:
     - Claude Code: `.claude/rules/<module>/...` (plus a stub include in `CLAUDE.md`).
     - Cursor: `.cursor/rules/augx-<module>.mdc` (one file per module, with generated frontmatter).
     - Windsurf: `.windsurf/rules/augx-<module>.md` (or append into `.windsurfrules` when the tool requires a single file).
     - Copilot: `.github/instructions/augx-<module>.instructions.md`.
   - The hook MUST be idempotent: re-running `augx link` updates existing links/copies in place and prunes stale ones.
   - Track every materialized path in `.augment/coordination.json` so `augx unlink` can clean them up.

2. **Aggregator Command: `augx export`**
   - New command:
     ```
     augx export --target claude-code|cursor|windsurf|copilot|all [--output <path>] [--dry-run]
     ```
   - For each target, concatenate the rules content of all currently linked modules into the tool's expected single-file (or directory) format:
     - `--target claude-code` -> writes/updates `CLAUDE.md`.
     - `--target cursor` -> writes `.cursor/rules/augx.mdc` with appropriate frontmatter (`description: "Augx aggregated rules"`, `alwaysApply: true`).
     - `--target windsurf` -> writes `.windsurfrules`.
     - `--target copilot` -> writes `.github/copilot-instructions.md`.
     - `--target all` -> emits all of the above in one pass.
   - Output MUST include:
     - A generated header banner identifying the file as produced by `augx export` with timestamp, augx version, and a hash of source modules (for drift detection).
     - Per-module section headers (`## Module: <name> (v<version>)`) so attribution is preserved.
     - A trailing footer pointing readers to the canonical module location.
   - Respect a project-level ignore list (e.g., `examples/` directories) to keep aggregated files under each tool's practical size budget.
   - `--dry-run` MUST print the resolved file list and a character/byte count per target without writing.

3. **MCP-First Task Context (no static duplication)**
   - Do NOT bake Beads task data into the exported rule files. Instead, ensure the export header for each target references the Beads MCP server and instructs the consuming agent to query it for current task state.
   - Provide a small, tool-agnostic snippet (template stored in `augment-extensions/workflows/mcp/templates/`) that describes how to wire up the Beads MCP server for each target tool, and inline that snippet into the exported file when the project's `.vscode/mcp.json` or `.augment/mcp/servers.json` declares a Beads server.
   - The `augx mcp` subcommands (`list`, `exec`, `discover`) remain the canonical interface; `augx export` only emits configuration guidance, never live task data.

4. **Configuration Surface**
   - Add an optional `export` block to `.augment/coordination.json`:
     ```json
     "export": {
       "targets": ["claude-code", "cursor"],
       "ignore": ["**/examples/**"],
       "mirror": false
     }
     ```
   - When present, `augx export` with no `--target` flag falls back to `export.targets`.
   - All keys are optional; absence preserves current behavior exactly.

5. **Safety and Determinism**
   - Generated files MUST begin with a clear `<!-- GENERATED BY augx export - DO NOT EDIT -->` marker so users (and other agents) do not hand-edit derived artifacts.
   - On every run, detect manual edits via the embedded source hash and refuse to overwrite unless `--force` is supplied.
   - Never write outside the project root. Never follow symlinks out of `augment-extensions/`.

6. **Cross-Platform Behavior**
   - On Windows, fall back to copy mode automatically when symlink creation fails (no admin / Developer Mode).
   - Normalize line endings to LF in generated files regardless of host OS.
   - Use forward-slash paths in all generated content.

### Acceptance Criteria
- [ ] `augx link <module> --mirror cursor,windsurf` materializes the module into both tools' rule locations and records the paths in `.augment/coordination.json`.
- [ ] `augx unlink <module>` removes every previously mirrored artifact for that module.
- [ ] `augx export --target claude-code` produces a single `CLAUDE.md` that contains all linked modules with per-module headers, a generation banner, and a source hash.
- [ ] `augx export --target all --dry-run` reports each target file path and its projected byte count, writing nothing.
- [ ] Re-running `augx export` without changes is a no-op (byte-identical output, same source hash).
- [ ] When a Beads MCP server is configured, exported files include the MCP wiring snippet but contain no static task data.
- [ ] Existing Augment Code workflows (`.augment/` rules, `augx show`, `augx list`) are unaffected.
- [ ] Unit tests cover: symlink fallback to copy on Windows, idempotent re-link, stale-artifact pruning on unlink, drift detection on manual edit, and `--dry-run` correctness.
- [ ] Integration tests link a sample module and verify the resulting files load correctly in at least two of the four target tools (Claude Code and Cursor at minimum).
- [ ] Documentation in `AGENTS.md` and `augment-extensions/workflows/` is updated to describe the new commands, flags, and the coordination.json `export` block.

### Out of Scope
- Importing rules authored natively in other tools (`.cursor/rules/*.mdc`, `.windsurfrules`, etc.) back into Augx modules. That is a separate, future ticket.
- Live, two-way synchronization between augx modules and tool-specific files. Generation is one-way: modules -> derived artifacts.
- Embedding Beads task data into static rule files. That responsibility stays with the Beads MCP server.

## Epic Link
Augx Core - Cross-Platform AI Tool Interoperability

## Labels
augx, cli, claude-code, cursor, windsurf, copilot, mcp, beads, interoperability, non-breaking

## Priority
High

## Story Points
8

## Next Steps
1. Convert this JIRA ticket into an OpenSpec change proposal under `openspec/changes/augx-cross-platform-export/` with spec deltas covering: the new `export` command, the `--mirror` flag on `link`, and the `export` block in `coordination.json`.
2. Decompose the OpenSpec change into Beads tasks (`bd-` prefixed) for: (a) symlink/copy hook, (b) `augx export` command per target, (c) coordination.json schema update, (d) MCP wiring template, (e) tests, (f) docs.
3. Implement against the existing `augx` CLI without modifying any current command surface; gate every new behavior behind explicit flags or new commands.
