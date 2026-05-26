# Spec: MCP Wiring Template (Beads MCP, Tool-Agnostic Snippet)

## Purpose

Provide a single canonical snippet that exported per-tool rule files inline conditionally, so that any AI agent reading those files knows to query the Beads MCP server for live task state rather than expecting static task data baked into the rules.

## Storage

`augment-extensions/workflows/mcp/templates/beads.md`

The template is a single Markdown file owned by this change. It contains no tool-specific content; per-target adapters wrap it in whatever syntax their tool requires (comment, frontmatter note, code fence).

## When Inlined

A target's exported file (`CLAUDE.md`, `.cursor/rules/augx.mdc`, `.windsurfrules`, `.github/copilot-instructions.md`) inlines this snippet only when either of the following declares an MCP server with id `beads`:

- `.vscode/mcp.json`
- `.augment/mcp/servers.json`

When neither is present, exported files OMIT the snippet entirely so that they stay focused on static guidance.

## Inlining Position

Immediately after the generated banner, before the first `## Module:` section header.

## Content Contract

The snippet:

- Names the Beads MCP server and indicates that it provides real-time access to project tasks.
- Lists the public MCP operations relevant to AI agents (`tasks/list`, `tasks/get`, `dependencies/list`, `status/get`).
- Tells the consuming agent to query the server for task context rather than inferring task state from prose.
- References `augment-extensions/workflows/beads/` for human-readable command reference.
- Includes NO task IDs, statuses, dependency lists, or other live data.
- Includes NO secrets, API keys, tokens, or endpoint URLs beyond the canonical local server name.

## Template Source (canonical)

The file at `augment-extensions/workflows/mcp/templates/beads.md` MUST contain at minimum:

```markdown
### Live Task Context via Beads MCP

This project exposes its task tracker through the **Beads MCP server**.
For any task-related context (open tasks, dependencies, status, blocked items),
query the MCP server directly rather than relying on static rules.

**Server id**: `beads`

**Common operations**:

- `tasks/list` - enumerate open tasks
- `tasks/get` - fetch a specific task by id
- `dependencies/list` - blockers / blocked-by graph
- `status/get` - current status of a task

**Reference**: `augment-extensions/workflows/beads/` for full command guide.

Do NOT assume task state from prose in this file - this file contains no
live task data by design.
```

Per-target adapters MAY add a single wrapping line above the snippet (e.g., a Cursor `> Note:` callout) but MUST NOT alter the substantive content.

## Validation

The template MUST satisfy a content check at build time:

- Contains the string `Beads MCP server`.
- Contains all four operation names listed above.
- Contains NO `bd-` issue IDs.
- Contains NO status keywords from the closed set (`open`, `closed`, `in_progress`, `blocked`) used as data assertions; the words may appear only inside operation descriptions.

The validation is implemented as a unit test under `tests/mcp-template.test.ts` (created in Phase 5 / bd-xplat5).

## Relationship to `augx mcp` Subcommands

The template is documentation about how to use MCP. It is NOT a substitute for `augx mcp list`, `augx mcp exec`, or `augx mcp discover`. Those CLI surfaces remain the canonical interactive interface for humans; this template is the inline guidance for AI agents reading the exported rule files.

## Versioning

The template is versioned together with the `cross-platform` capability. If the operation list expands (e.g., a new `comments/append` MCP method), the template is updated in lockstep and the source hash recomputes for all exported files on the next `augx export` run.

## Removal Conditions

The snippet is removed from exported files (on the next run) whenever:

- The Beads MCP server declaration is removed from both `.vscode/mcp.json` and `.augment/mcp/servers.json`.
- The user passes `--ignore-mcp` to `augx export` (reserved future flag, not in this change's scope).
