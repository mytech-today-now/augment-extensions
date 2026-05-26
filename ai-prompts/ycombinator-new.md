# Show HN Drafts: augment-extensions

Ten post angles, two versions each (20 entries), scaled from strictly laymans terms (1) to academic (10). Every headline is 22-29 characters. No em-dashes anywhere (repo rule).

**The pitch every post must carry**: the reader uses exactly one AI coding tool. Maybe Cursor. Maybe Claude Code. Maybe Augment Code, Windsurf, or Copilot. Whichever one they picked, `augment-extensions` makes their rules richer, reusable, versioned, and portable. The reader does not need to use more than one tool to benefit. Multi-tool support is a free upside, not the central pitch.

- Repo: https://github.com/mytech-today-now/augment-extensions
- Install: `npm i -g @mytechtoday/augment-extensions`

## How ratings work

Each version is rated 1-10 on predicted HN performance, grounded in patterns from real high-scoring Show HN posts (Xcapture-BPF 447 pts, HN Update 644 pts, GitDiagram 222 pts, Gitingest 185 pts, Layerform launch notes). Five rubric criteria, 2 points each:

1. **Specificity** - concrete technical claim, no "AI-powered" hype.
2. **Pain-point clarity** - the reader recognizes their own problem in the first line.
3. **Working artifact** - clear that this is real, installable, MIT.
4. **Title fit** - HN prefers 8-12 word titles; the 22-29 char headline constraint costs some performance.
5. **Builder credibility** - personal motivation, honest stage, no salesy language.

---

## Scale 1 - Strictly laymans

### Version 1A - `Show HN: Your AI Helper Needs Rules` (26)

You know that little AI thing in your code editor that finishes your sentences and answers questions? Whichever one you use, it does noticeably better work when you tell it the rules of your project. House style, naming, what files to never touch.

The catch: you tell it those rules by typing into a special file your editor reads. That file is small, has no structure, and only works for that one editor. If you want to write good rules, there is nowhere proper to put them.

`augx` is a small tool that holds your rules as proper little reusable packs, then drops them into whichever editor you use, in whatever shape that editor wants. About 40 packs come with it (TypeScript, security, API design, more). You pick the ones you need. MIT, free, `npm i -g @mytechtoday/augment-extensions`.

**Rating: 7.5/10** - Plain language, real pain, concrete install. HN's typical reader sits closer to scale 4-7, so pure layman framing reads thin in headlines but engages well in comments.

### Version 1B - `Show HN: Teach Your Code Helper Once` (27)

The AI assistant built into your code editor (whichever one you use) gets better when you give it project rules. The trouble is, every editor wants those rules written into a different file, in a different format, in a different place, and there is no way to share rules between projects.

I built `augx` so you can write the rules once as small Markdown packs, then let a tool drop them into your editor's expected shape. Switch editors later and the rules come with you. Forty packs ship in the box. Open source, MIT.

`npm i -g @mytechtoday/augment-extensions`.

**Rating: 7/10** - Soft on specificity. "Rules come with you" is the right hook for non-AI-native readers.

---

## Scale 2 - Layman, slightly more aware

### Version 2A - `Show HN: When AI Rules Stop Fitting` (26)

You added a rules file to your project so the AI in your editor knows how things should be done. You filled it up. Then you noticed the assistant was ignoring half of it, or that the file had become an unstructured wall of text you stopped wanting to edit.

`augx` is the structural layer for that file. Your rules become small Markdown modules outside the editor's tiny rules surface, and the tool generates the in-editor file from them on demand. It carries a hash so it will not silently overwrite hand edits.

Works with Cursor, Claude Code, Augment Code, Windsurf, Copilot, or whichever one you happen to use. MIT.

**Rating: 8/10** - Vivid pain ("unstructured wall of text"). Concrete fix. Title is HN-native.

### Version 2B - `Show HN: Bigger Rules, Smaller Box` (25)

Every AI coding tool gives you a small box to type rules into. Augment Code caps it around 49 KB. Cursor, Windsurf, Copilot, and Claude Code are softer but the same diminishing-returns curve applies: bigger file, less the assistant actually applies.

`augx` keeps your rules outside the box as small versioned modules, then generates the in-box rules file from them whenever you ask. The generated file carries a content hash so the CLI refuses to overwrite hand edits without `--force`. Works whichever AI editor you use. ~40 modules ship. MIT, npm.

**Rating: 8/10** - The number (49 KB) earns trust. Headline reads like an HN-native riddle.

---

## Scale 3 - Tool-portability / future-proofing

### Version 3A - `Show HN: Rules That Move With You` (24)

You picked an AI coding assistant. Maybe Cursor, maybe Claude Code, maybe Augment, maybe Copilot. Whichever one, you spent real time writing rules so it behaves like a member of your team. That work is currently locked to that one tool.

`augx` is a CLI that holds your rules as versioned modules separate from any one tool, and emits them into the format any of the major AI editors expects. Today you use Cursor, and `augx export --target cursor` writes the file Cursor wants. Tomorrow you try Claude Code: `augx export --target claude-code` writes the file Claude Code wants, from the same modules.

Open source, MIT.

**Rating: 8.5/10** - "Locked to that one tool" is a fear HN's audience explicitly feels. Future-proofing plus working CLI is a strong combo.

### Version 3B - `Show HN: Don't Marry Your AI Editor` (26)

You probably use one AI editor right now and have no plans to switch. Fine. But the rules you wrote for it are an asset, and right now that asset only works in that one editor. If a better tool comes out next year (and one will), every line of rules you wrote becomes friction.

`augx` decouples the rules from the editor. Your rules live as versioned Markdown modules in your repo. A CLI emits them into whichever editor format you need today, plus any others you try later. Whichever editor you pick, the rules come with you.

MIT, npm.

**Rating: 8/10** - Strong contrarian title. Slight risk of reading marketing-flavored; back it up with the working CLI in the body.


---

## Scale 4 - Rules-as-code framing

### Version 4A - `Show HN: Treat AI Rules Like Code` (24)

Whichever AI coding tool you use (Cursor, Claude Code, Windsurf, Copilot, Augment), you already maintain a rules file telling that tool how your project works. Most teams treat that file like a sticky note: edited in place, no review, no version, no tests.

`augx` makes the rules look like code instead. Modules are versioned per semver, validated by a schema (`augx validate`), tested for emitter idempotency and drift, and pinned per project. The CLI emits them into the right format for whichever editor you use. ~40 modules ship today across coding standards, domain rules, workflows, and examples. MIT.

**Rating: 8.5/10** - The sticky-note-vs-code reframe is sticky. Tests, schemas, semver hit HN's engineering-tribe markers.

### Version 4B - `Show HN: Versioned Rules for Agents` (26)

The rules file you give your AI coding agent should be a dependency, not a scratch pad. Versioned, validated, dependency-aware, reusable across projects.

`augx` makes them that. Each module has `module.json` (semver, dependencies, tags), a `rules/` tree of Markdown, optional `examples/`, and a CHANGELOG. `augx link` adds a module to your project. `augx export --target <tool>` emits the result into the format your AI editor wants (any of the major ones). Drift detection by content hash; refuses to overwrite hand-edited generated files unless forced.

`npm i -g @mytechtoday/augment-extensions`. MIT.

**Rating: 8.5/10** - "Dependency, not a scratch pad" is the HN-native reframe. Concrete schema fields earn credibility.

---

## Scale 5 - Modular composition

### Version 5A - `Show HN: Modular Rules for AI Coders` (27)

A single big rules file is the wrong unit for AI coding-assistant guidance. Different projects need different combinations of standards, and rebuilding that combination by hand each time is the friction `augx` removes.

Modules are addressable by canonical id (`coding-standards/typescript`, `domain-rules/security`, `workflows/cross-platform`). You compose them per project: `augx link coding-standards/typescript domain-rules/security workflows/database`. The CLI emits the composed set into your AI editor's preferred format. Modules declare semver dependencies on other modules; `augx upgrade` walks them safely.

~40 modules in the box. MIT.

**Rating: 8.5/10** - Composable-by-id is a familiar HN idea (npm, cargo). Lands well with package-manager-shaped intuition.

### Version 5B - `Show HN: Composable AI Rule Packs` (24)

`augx` is a CLI for composing reusable rule modules into the rules file your AI editor reads. Modules are tiny (one concept per module), versioned (semver), and addressable by id. You compose them in your project with `augx link`, and the CLI handles emission into whichever editor surface you use.

Modules are addressable by canonical id (`coding-standards/typescript`, `domain-rules/security`, `workflows/cross-platform`). You compose them per project: `augx link coding-standards/typescript domain-rules/security workflows/database`. The CLI emits the composed set into your AI editor's preferred format.

If you have ever copy-pasted a "TypeScript naming conventions" section between projects, modules are what you actually wanted. ~40 ship today. MIT.

**Rating: 8/10** - The copy-paste closer is the kind of universal-recognition line HN upvotes. Slightly less concrete than 5A.

---

## Scale 6 - Cross-tool / pipeline framing

### Version 6A - `Show HN: Cross-Tool Rule Pipeline` (24)

You probably committed to one AI coding tool: Cursor, Claude Code, Augment Code, Windsurf, or Copilot. `augx` is the build pipeline that keeps your rules deployable to that one (and to any others, when you eventually try them).

Pipeline: link modules, validate, export to whichever target you need. Output paths follow each tool's native conventions exactly (`CLAUDE.md`, `.cursor/rules/augx.mdc`, `.windsurfrules`, `.github/copilot-instructions.md`). The export carries a content hash; running it twice with no input change is a byte-identical no-op.

If you only use one tool today, `augx export --target <that-tool>` is the whole loop. MIT.

**Rating: 8.5/10** - "Build pipeline for rules" is the productive metaphor. "Byte-identical no-op" earns CI/CD credibility.

### Version 6B - `Show HN: Polyglot Agent Rule Modules` (27)

A single rule module (`coding-standards/typescript`) should drive any AI coding assistant that touches a TypeScript codebase, regardless of which one the developer prefers. `augx` is the materializer that makes it so.

Modules are tool-agnostic Markdown. Adapters per tool know how to project a module into that tool's expected shape. New tool support is one adapter file. Today's adapters: Augment Code, Claude Code, Cursor, Windsurf, GitHub Copilot. The same module set drives every adapter.

Add a tool, your rules follow. Drop a tool, your rules stay.

**Rating: 8.5/10** - Adapter-pattern framing reads as production-grade. The dual-clause kicker lands.

---

## Scale 7 - Drift detection / content hashing

### Version 7A - `Show HN: Hash-Gated Rule Exports` (23)

When a CLI generates a file in your repo, the obvious failure mode is silently overwriting hand edits the user forgot they made. `augx export` solves this with a `source-hash` header: 16 hex chars over `{ sortedModuleIds, versions, contentDigests, ignorePatterns }`. If the file's actual hash and the recorded hash diverge on the next export, the CLI exits 3 and refuses to overwrite. `--force` overrides.

The rules file your AI editor reads (Cursor, Claude, Augment, Windsurf, Copilot) can be safely co-owned by `augx` and you: edits are detected, never destroyed silently.

MIT, TypeScript, npm.

**Rating: 9/10** - Specific hash composition, exit code, safety guarantee. Exactly the engineering content HN promotes.

### Version 7B - `Show HN: Content-Hashed Rule Bundles` (27)

Idempotent codegen is a solved problem in build tools but mostly unsolved in the AI rules space, where the generated files are user-editable and small. `augx export` brings the same discipline to whichever AI editor you use: every export carries a banner with a content hash; reruns with no upstream change are byte-identical; runs against a hand-edited file refuse to overwrite without `--force`.

Co-owned by the CLI and you. MIT.

**Rating: 8.5/10** - "Co-owned by tool and user" is the HN-correct way to describe it. Slightly more abstract than 7A.

---

## Scale 8 - MCP / live data

### Version 8A - `Show HN: MCP-First Agent Context` (23)

Embedding live task state (open issues, blockers, dependency graphs) into a static rules file is a known dead-end: the file goes stale within hours and the agent confidently references closed tickets. `augx` enforces the opposite contract by construction.

Exported rule artifacts NEVER embed live task data. Instead, when a Beads MCP server is declared in `.vscode/mcp.json` or `.augment/mcp/servers.json`, the export inlines a tool-agnostic snippet pointing the agent at the MCP server for `tasks/list`, `tasks/get`, `dependencies/list`, `status/get`. No IDs, statuses, or endpoints in the static file.

Works regardless of which AI coding tool the agent runs in. MIT.

**Rating: 9/10** - Names the failure mode (stale state) and the resolution (MCP). Draws MCP-curious comments, which lift rank.

### Version 8B - `Show HN: Live State Beats Stale Rules` (28)

Static rules and live task state belong in different places. The rules file your AI editor reads should hold timeless guidance: code style, security posture, naming. Volatile state (open tickets, dependency graph, build status) should be fetched from a live source when the agent actually needs it.

`augx` enforces this split. Its exporter refuses to embed live data; when a Model Context Protocol server is configured, it inlines a wiring snippet directing the agent there instead. Result: a rules file that does not rot, and an agent that always sees fresh state.

**Rating: 8.5/10** - Crisp split-of-concerns argument. Title borders on overconfident; back it up with a demo link.

---

## Scale 9 - Provenance / coordination

### Version 9A - `Show HN: Provenance for AI Rules` (23)

`augx` keeps a `.augment/coordination.json` manifest recording which OpenSpec specs are active, which Beads tasks they spawned, which rule modules are linked, and which materialization mode each mirror entry uses (symlink or copy).

`augx coord file <path>` answers "which rules governed this file when it was last touched?" `augx coord tasks <spec>` lists the tasks a spec produced. Whichever AI coding tool you use, the same provenance graph (spec to task to rules to file) sits underneath your rule distribution.

MIT, TypeScript. ~40 rule modules ship.

**Rating: 8.5/10** - Provenance is a niche-but-loved HN topic. Concrete query examples sell it.

### Version 9B - `Show HN: Coordination Graph for Rules` (28)

Most rule-management tools stop at "deploy the rules." `augx` adds a coordination graph: a versioned manifest linking specs, tasks, rule modules, and files into a query-able structure. Specs come from OpenSpec; tasks from Beads; rules from the module catalog; files from your working tree. The CLI keeps the graph current via `augx sync`.

Whichever AI editor you use, the graph stays useful: it answers questions about your project's rule landscape that no single editor knows how to ask.

**Rating: 8.5/10** - "Most tools stop at deploy" is good positioning. Slightly heavier read.

---

## Scale 10 - Most academic

### Version 10A - `Show HN: Spec-Driven Rule Pipelines` (26)

`augx` formalizes AI-agent rule distribution as a spec-driven pipeline. Specs are authored as OpenSpec proposals with ADDED / MODIFIED / REMOVED deltas relative to canonical specs under `openspec/specs/`. Each spec decomposes into Beads tasks (append-only JSONL log, `bd-` prefixed IDs, `blocked_by`/`blocks` dependency edges). Tasks reference the rule modules they apply.

The emitter is content-addressed and idempotent: aggregated exports carry a 16-hex `source-hash` over `{ sortedModuleIds, versions, contentDigests, ignorePatterns }`, refusing overwrite on hash mismatch (exit 3 unless `--force`). Per-module mirrors prefer `symlink` and fall back to `copyFile` on `EPERM`/`EACCES`/`ENOSYS`, recording the mode for reuse so subsequent runs do not re-attempt symlink on locked-down hosts. Unlink walks the tracked set with content-equality checks before deletion to preserve hand edits.

The same pipeline targets Augment Code, Claude Code, Cursor, Windsurf, and Copilot from one source. Whichever consumer you favor, you get the same provenance guarantees.

**Rating: 9/10** - Dense, accurate, verifiable. HN's engineering-leaning audience will find at least three things to argue about constructively.

### Version 10B - `Show HN: Idempotent Rule Materializer` (28)

The cross-platform feature of `augx` is a materializer over a heterogeneous set of consumer surfaces (per-tool conventions for path, format, frontmatter, include-stub semantics) with two emission modes and one provenance store:

- Per-module mirror: `(module, tool) -> file`. `fs.symlink` primary; `copyFile` fallback on `EPERM`/`EACCES`/`ENOSYS`; mode persisted in `.augment/coordination.json.mirrors[module]` for reuse.
- Aggregated export: `Σ(linked modules) -> file`. Canonical sort by module id; LF normalization; forward-slash path normalization; banner-recorded content hash for drift refusal (exit 3 unless `--force`).
- Manifest: `.augment/coordination.json` as the distribution provenance graph (specs, tasks, rules, files, mirrors, export defaults).

The same source set drives any supported consumer (Augment Code, Claude Code, Cursor, Windsurf, Copilot) with byte-identical no-op reruns on stable input. You only need one consumer for the model to pay off.

**Rating: 9.5/10** - Reads like the abstract of a tooling paper. Polarizing: half love it, half demand a demo. Front-page caliber if paired with a working live link and the founder responsive in comments.

---

## How to pick a draft

- **Aiming for the front page**: 7A, 8A, 10A. Specific engineering claims, named failure modes, verifiable mechanisms.
- **Aiming for "thoughtful indie hacker" audience**: 3A, 4A, 5A. Reframe-driven, package-manager-shaped intuition.
- **Aiming for non-HN readers (dev.to, Lobste.rs cross-post, newsletter)**: 1A, 1B, 2A. Plain language, recognizable pain.
- **Avoid as standalone**: 3B's "Don't Marry" headline risks reading as marketing copy without the working CLI evidence in the first paragraph.

Whichever draft you pick, the HN-launch playbook applies: post between 8-10am PT on a weekday, the first comment should answer "what did you build, why, what surprised you while building it," and the builder should stay in the thread for at least the first two hours.

## Headline character counts (all in 22-29 range)

| Scale | Version A | Chars | Version B | Chars |
|---|---|---|---|---|
| 1 | Your AI Helper Needs Rules | 26 | Teach Your Code Helper Once | 27 |
| 2 | When AI Rules Stop Fitting | 26 | Bigger Rules, Smaller Box | 25 |
| 3 | Rules That Move With You | 24 | Don't Marry Your AI Editor | 26 |
| 4 | Treat AI Rules Like Code | 24 | Versioned Rules for Agents | 26 |
| 5 | Modular Rules for AI Coders | 27 | Composable AI Rule Packs | 24 |
| 6 | Cross-Tool Rule Pipeline | 24 | Polyglot Agent Rule Modules | 27 |
| 7 | Hash-Gated Rule Exports | 23 | Content-Hashed Rule Bundles | 27 |
| 8 | MCP-First Agent Context | 23 | Live State Beats Stale Rules | 28 |
| 9 | Provenance for AI Rules | 23 | Coordination Graph for Rules | 28 |
| 10 | Spec-Driven Rule Pipelines | 26 | Idempotent Rule Materializer | 28 |
