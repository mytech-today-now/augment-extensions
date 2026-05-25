# Cross-Platform Distribution Workflow

**Version:** 1.0.0
**Type:** Workflow
**Category:** Interoperability / Multi-Tool Distribution

## Overview

This workflow module is the day-to-day reference for sharing a single set of Augx extension modules across **Claude Code**, **Cursor**, **Windsurf**, **GitHub Copilot**, and **Augment Code**. Two CLI surfaces drive the integration; both are opt-in and safe to run together:

1. `augx export --target <tool>` - produces the **single aggregated file** each tool expects.
2. `augx link <module> --mirror <tool>` - produces a **per-module file (or directory)** in the tool's native rules location.

The Augment Code surface (`.augment/` rules and root `AGENTS.md`) is **never modified** by either command. The cross-platform feature is purely additive.

## Per-Tool Target Paths

### Aggregated Export (`augx export`)

| Target | Path | Format |
|---|---|---|
| `claude-code` | `CLAUDE.md` | Markdown |
| `cursor` | `.cursor/rules/augx.mdc` | Markdown + YAML frontmatter |
| `windsurf` | `.windsurfrules` | Markdown |
| `copilot` | `.github/copilot-instructions.md` | Markdown |
| `all` | all of the above | per-format |

### Per-Module Mirror (`augx link --mirror`)

| Target | Per-Module Path |
|---|---|
| `claude-code` | `.claude/rules/<module>/...` + include stub in `CLAUDE.md` |
| `cursor` | `.cursor/rules/augx-<module>.mdc` |
| `windsurf` | `.windsurf/rules/augx-<module>.md` |
| `copilot` | `.github/instructions/augx-<module>.instructions.md` |

## Quick Reference

```bash
# One-shot export for one tool
augx export --target claude-code

# Export to every target listed in .augment/coordination.json.export.targets
augx export

# Preview only (no writes)
augx export --target all --dry-run

# Link a module and mirror it into two tools
augx link coding-standards/typescript --mirror cursor,windsurf

# Reverse a mirrored link (also prunes tracked copies / symlinks)
augx unlink coding-standards/typescript
```

## When To Use Which

- **Use `augx export`** when the consuming tool reads a single rules file (Cursor's `augx.mdc`, Windsurf's `.windsurfrules`, Copilot's `copilot-instructions.md`, Claude Code's `CLAUDE.md`). Best for one aggregated handoff per checkout.
- **Use `augx link --mirror`** when you want per-module attribution (one file per module, faster diffs, finer-grained `unlink`). Best for active development where modules change frequently.
- The two surfaces are complementary; you can run both in the same project. `augx export` writes the aggregate file; `augx link --mirror` writes the per-module files. They never share a target path.

## MCP-First Task-Context Contract

Exported files contain **zero** live task data: no `bd-` IDs, no statuses, no dependency snapshots, no endpoint URLs. When the project declares a Beads MCP server in either `.vscode/mcp.json` or `.augment/mcp/servers.json`, `augx export` inlines a single tool-agnostic snippet (from `augment-extensions/workflows/mcp/templates/beads.md`) directly after the banner. The snippet tells the consuming AI agent to query the `beads` MCP server for task state rather than parsing prose.

When neither MCP config declares `beads`, the snippet is omitted entirely. See `rules/mcp-snippet-inlining.md` for the trigger details.

## Drift Refusal (Exit Code 3)

If `augx export` finds the target file has been hand-edited (banner hash does not match recomputed body hash), it **refuses to overwrite** and exits with code 3. Resolve drift either by:

- Editing module sources under `augment-extensions/modules/` and re-running `augx export` (preferred), or
- Re-running with `--force` (discards local edits).

See `rules/drift-resolution.md` for the full playbook.

## Windows Symlink Fallback

On Windows without Developer Mode, `fs.symlinkSync` raises `EPERM`. The mirror hook catches `EPERM`, `EACCES`, and `ENOSYS`, falls back to `copyFile`, and records `mode: 'copy'` in `.augment/coordination.json.mirrors[<module>]`. Subsequent runs see the recorded mode and skip the symlink attempt entirely, so there is no per-run retry storm.

See `rules/windows-fallback.md` for the detailed behavior contract.

## Directory Structure

```
augment-extensions/workflows/cross-platform/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/                               # Day-to-day guidance
│   ├── export-guide.md                  # 'augx export' walkthrough
│   ├── mirror-guide.md                  # 'augx link --mirror' walkthrough
│   ├── drift-resolution.md              # Recovering from exit code 3
│   ├── windows-fallback.md              # EPERM -> copy fallback details
│   └── mcp-snippet-inlining.md          # When the Beads MCP snippet appears
└── examples/                            # Worked example
    └── end-to-end-session.md            # Full link -> mirror -> export -> unlink walkthrough
```

## Related Specs

Source-of-truth canonical specs live under `openspec/specs/cross-platform/`:

- `export-command.md` - grammar, flags, exit codes, drift detection.
- `mirror-hook.md` - materialization strategy, idempotency, unlink cleanup.
- `coordination-export-block.md` - schema for `export` and `mirrors` keys in `.augment/coordination.json`.
- `mcp-template.md` - canonical Beads MCP snippet contract.

This module is the **operator-facing** counterpart; consult the specs for normative grammar and exit-code definitions.

## Installation

```bash
augx link workflows/cross-platform
```

No additional setup is required: the workflow module is pure documentation.
