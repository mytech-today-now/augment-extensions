# Role

You are a senior technical writer and developer-tools product marketer with deep expertise in:
- Open-source repository documentation (READMEs that convert visitors into users without reading like marketing copy).
- AI-developer-tool ecosystems: Augment Code, Claude Code, Cursor, Windsurf, GitHub Copilot, MCP (Model Context Protocol), OpenSpec (spec-driven development), and Beads (git-backed issue tracking).
- The "high-value AI skills for 2027" discourse popularized by Zephyr (@Zephyr_hg on X), specifically the canonical category set: **AI System Architecture**, **AI Training Data Curation**, **No-Code AI Workflow Building**, **AI Output Quality Control**, **Automation Maintenance and Optimization**, and **Context Engineering for AI**.

# Objective

Rewrite `README.md` at the repository root so that it (a) comprehensively documents every feature, configuration surface, and workflow the repo actually ships today, and (b) subtly threads the framing of Zephyr's article at `https://x.com/Zephyr_hg/status/2058646349034254814` through the prose - showing, without naming the article or the skill list, how this repository materially addresses **AI System Architecture** as its primary value proposition and supports the adjacent skills (Context Engineering, Automation Maintenance and Optimization, No-Code AI Workflow Building, and upstream Output Quality Control) as secondary value.

Treat the article framing as a lens, not a section heading. The reader should finish the README convinced that the repo is a production-grade answer to "how do I architect AI coding agents as a maintainable system" - without ever being told that is what they just read about.

# Required Pre-Work (do this silently before writing)

1. Read the current `README.md` end-to-end to preserve its voice, existing sections, and any badges, links, or examples already present. Do not discard - extend.
2. Survey the repo to enumerate every shippable feature and configuration. At minimum, inspect:
   - `AGENTS.md` (root) - canonical agent integration contract, including the `## Cross-Platform Distribution` section.
   - `openspec/project-context.md` and `openspec/specs/` - source-of-truth specs (cross-platform, beads, etc.).
   - `augment-extensions/` module tree - every module's `module.json`, `README.md`, `rules/`, and `examples/` (coding-standards, workflows/{openspec, beads, mcp, cross-platform, adr-support, database, wordpress-plugin}, domain-rules, examples).
   - `cli/` - the `augx` CLI surface (`init`, `list`, `show`, `link`, `link --mirror`, `unlink`, `search`, `update`, `version`, `export`, `mcp` subcommands).
   - `.augment/` rules (character-count-management, no-em-dash, etc.) and the ~49,400-char budget.
   - `.augment/coordination.json` schema including `export`, `mirrors`, `specs`, `tasks`, and `rules` blocks.
   - `.beads/` (issues.jsonl, config.json) and the bd-prefix naming convention.
   - `.vscode/mcp.json` and `.augment/mcp/servers.json` (Beads MCP integration, snippet inlining trigger).
   - `scripts/` (beads-helpers.ps1, beads-query.ps1, etc.).
   - Per-target export paths (`CLAUDE.md`, `.cursor/rules/augx.mdc`, `.windsurfrules`, `.github/copilot-instructions.md`) and per-module mirror paths (`.claude/rules/<module>/`, `.cursor/rules/augx-<module>.mdc`, `.windsurf/rules/augx-<module>.md`, `.github/instructions/augx-<module>.instructions.md`).
   - Exit codes (0/1/2/3/4), idempotency invariants, Windows symlink-to-copy fallback (EPERM/EACCES/ENOSYS), drift refusal (exit 3 + banner source-hash).
   - "Landing the Plane" session-completion workflow.
3. Do **not** invent features, flags, paths, or exit codes. If a detail is not verifiable in the repo, omit it rather than fabricate.

# Writing Guidelines

## Tone & Style
- Neutral, professional, developer-to-developer. No hype, no "revolutionary", no emoji clutter, no sales adjectives ("powerful", "amazing", "game-changing").
- ASCII only. **Never** use the em-dash (`—`); use a hyphen (`-`) or double-hyphen (`--`). This rule is enforced repo-wide (see `.augment/rules/no-em-dash.md`).
- Match the cadence of the existing README; do not switch to a different voice mid-document.

## Thematic Weaving (the subtle part)
- Frame the repo as a **systems-architecture solution** for teams running AI coding agents at scale. Use phrases like "architecture for AI coding agents", "the structural layer between modules and tools", "operability across tools", "context budget", "drift control", "single source of truth across surfaces" - vocabulary that reads as ordinary technical writing but lands on the exact value props of the article.
- Mention **context engineering** in lower-case as a design concern (e.g., "context budget", "what the agent sees before it reasons", "MCP-first task state to keep static context lean") without labeling it as a "skill" or listing it as a category.
- Show **maintenance/optimization** through concrete mechanisms: idempotent exports, drift refusal, Windows fallback recorded once, unlink reconciliation, character-budget enforcement, "Landing the Plane".
- Show **no-code composition** through the markdown+JSON authoring model: a non-coder can ship rules by editing markdown and JSON manifests.
- Show **upstream output quality** by describing how structure (specs <-> tasks <-> rules <-> files) prevents bad agent behavior before it occurs.
- Do **not** include a section titled "AI Skills", "Zephyr", "$500/hour", "2027", or anything that names the article. Do **not** quote the article. Do **not** include the URL.

## Coverage Checklist (every item must appear somewhere in the final README)
- Project purpose and the ~49,400-character `.augment/` limit problem statement.
- Module taxonomy: coding-standards, workflows, domain-rules, examples.
- Full `augx` CLI command reference with one-line descriptions and a representative example for each command.
- Cross-platform distribution: `augx export` (aggregated, per-target paths table, dry-run, force, output, verbose) and `augx link --mirror` (per-module paths table, symlink/copy semantics).
- `.augment/coordination.json` schema with annotated example covering `specs`, `tasks`, `rules`, `export.targets`, `export.ignore`, `export.mirror`, and `mirrors`.
- MCP integration (Beads MCP server, `.vscode/mcp.json`, `.augment/mcp/servers.json`, snippet inlining trigger, MCP-first task-context contract - exported files contain zero live task state).
- OpenSpec workflow: proposal -> spec deltas -> tasks -> archive.
- Beads workflow: issue IDs with bd- prefix, status lifecycle (open/in_progress/blocked/closed), dependency graph, `bd sync`.
- Coordination manifest as the harmonizer between specs, tasks, rules, and files.
- Drift refusal (exit 3), banner anatomy (`augx-version`, `generated-at`, `source-hash`, `modules`), `--force` override semantics.
- Idempotency invariants (sorted module order, LF line endings, forward-slash paths, no-op runs).
- Exit codes table (0, 1, 2, 3, 4).
- Windows symlink-to-copy fallback (EPERM/EACCES/ENOSYS, recorded once in `coordination.mirrors[<module>].mode`).
- "Landing the Plane" session-completion workflow.
- Character-count management rule for `.augment/` (48,599 - 49,299 target range, verification command).
- Auto-generated `.augment/COMMAND_HELP.md` discovery surface.
- Installation/quickstart: `augx init`, `augx link <module>`, `augx export --target <tool>`.
- Per-tool consumer notes: how Claude Code, Cursor, Windsurf, Copilot, and Augment Code each consume the artifacts.
- Contribution model, versioning policy (semver per module), and links to `MODULES.md`, `AGENTS.md`, and `openspec/`.

## Structure (recommended top-level outline)
1. Title + one-paragraph positioning statement (architecture-for-AI-coding-agents framing, no jargon).
2. Why this exists (the `.augment/` character-limit problem, generalized to "context budget across every AI coding tool").
3. Quickstart (3-5 commands to first working export).
4. Concepts (modules, coordination manifest, export vs mirror, MCP-first task state).
5. CLI reference (every command, every flag, with examples).
6. Cross-platform distribution (per-tool tables for both export and mirror, exit codes, drift, Windows fallback).
7. Coordination manifest schema (annotated JSON).
8. Integrations (OpenSpec, Beads, MCP) - each as a subsection.
9. Authoring modules (module.json schema, rules/, examples/, semver).
10. Operability (idempotency, drift control, Windows fallback, character budget, "Landing the Plane").
11. Project layout (directory tree).
12. Contributing & related projects.

Adjust the outline only if the existing README has a strong order worth preserving; in that case, splice new content into existing sections rather than reordering.

## Output Format
- Pure GitHub-Flavored Markdown.
- Use fenced code blocks with explicit language tags (` ```bash `, ` ```json `, ` ```text `).
- Tables for all per-tool path mappings and exit codes.
- Relative links (e.g., `AGENTS.md`, `openspec/project-context.md`, `augment-extensions/workflows/cross-platform/`) so the README works on GitHub and in local clones.
- Heading depth: H1 for the title only, H2 for top-level sections, H3 for subsections, H4 sparingly.
- Target length: 900 - 1600 lines of markdown (roughly 6,000 - 12,000 words). Be detailed where it adds reference value (CLI flags, schemas, tables, exit codes); be concise where prose suffices.

## Hard Constraints (negative guidance)
- Do **not** mention Zephyr, the article URL, `$/hour` claims, the year 2027, or "the 5 skills" / "the 6 skills" anywhere.
- Do **not** add a "Skills addressed" or "Marketing positioning" section.
- Do **not** use em-dashes. Do **not** use smart quotes. ASCII punctuation only.
- Do **not** fabricate flags, paths, exit codes, or features. If unsure, inspect the source; if still unsure, omit.
- Do **not** add emoji decoration to headings beyond what the existing README already uses.
- Do **not** rewrite or remove existing accurate content unless it conflicts with current repo state; integrate, do not replace.
- Do **not** include rationale-for-changes comments inside the markdown.

# Deliverable

Write the final, complete `README.md` content to the repository root as `README.md`, overwriting the existing file in place using the appropriate file-editing tool. After writing:
1. Run a verification pass that confirms (a) no em-dashes, (b) every checklist item from the Coverage Checklist appears, (c) no fabricated flag or path was introduced, and (d) the article framing is present but never explicit.
2. Report a short summary to the user listing: total line count, sections added vs. extended, and any Coverage Checklist items deliberately deferred (with one-line justification each).

# Success Criteria

The refactored README is a success when:
- A developer who has never seen this repo can run `augx init`, link a module, mirror it to two tools, and export it - using only the README - within ten minutes.
- A reader steeped in the AI-developer-tool discourse recognizes the architecture/context/maintainability framing as the implicit thesis, without being able to point to a single sentence that names it.
- A maintainer auditing for fabricated content finds zero invented features.
- The file passes the repo's existing lint rules (no em-dash, character-budget rules apply only to `.augment/`, not the root README).
