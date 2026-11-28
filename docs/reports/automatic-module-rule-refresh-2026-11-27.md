# Automatic Module Rule Refresh Verification

## Implemented behavior

`augx context setup --host all` installs project-scoped Codex and Claude Code hooks. Their synchronous `UserPromptSubmit` handlers select current linked module rules for each prompt. Their `SessionStart` handlers restore the saved selection on compact or resume events. The handlers reread current module files and return complete selected rule content with canonical ID, version, source path, and SHA-256 metadata.

Selection uses the nearest Augx project manifest, canonical module IDs, metadata, prompt terms, file extensions, rule headings, and explicit module-relative rule paths. A canonical module ID selects the full module. Task and file relevance narrows aliases to matching files. The refresh does not fetch remote modules or change version pins. Per-session local state contains only a schema version, host, project root, hashed session key, update time, canonical module IDs, selection modes, and relative rule paths. It does not store prompts, transcripts, or rule content.

`augx context disable` removes only handlers whose hashes still match Augx's ownership receipt. Edited handlers and unrelated host settings remain in place. Cursor, Windsurf, and GitHub Copilot are reported as static export or mirror targets without live refresh support.

## Verified host capabilities

| Host | Officially documented lifecycle behavior | Implementation path | Evidence status |
|---|---|---|---|
| Codex | `UserPromptSubmit` receives the submitted prompt and can add `additionalContext`. `SessionStart` supports `source: compact` and runs before the next model request, including immediate continuation after automatic compaction. Project hooks load only from trusted project layers, and non-managed hooks require review and trust. | `.codex/hooks.json`, synchronous prompt and compact/resume handlers | Documentation verified. Live host behavior unverified. |
| Claude Code | `UserPromptSubmit` receives the submitted prompt and can add `additionalContext`. `SessionStart` supports `compact` for manual and automatic compaction. SessionStart hooks run in the background at startup or resume, but the first response waits for them. | `.claude/settings.json`, synchronous prompt and compact/resume handlers | Documentation verifies event and context output. Live compaction continuation unverified. |
| Cursor, Windsurf, GitHub Copilot | Repository support for these targets is static export and mirror behavior. This change does not establish a live lifecycle adapter for them. | No live adapter | No automatic refresh claim. |

Sources: [Codex hooks documentation](https://developers.openai.com/codex/hooks) and [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks). The Codex documentation explicitly states that compact hooks supply context to the immediate continuation after automatic compaction. Claude Code documents both the compact `SessionStart` event and that hook `additionalContext` reaches the next model request. The exact live compaction sequence was not exercised in this environment.

## Test matrix

| Requirement | Verification | Result |
|---|---|---|
| Ordinary prompt selects relevant linked modules | Deterministic host adapter test | Pass |
| Canonical module ID and exact rule path | Deterministic selection and containment tests | Pass |
| Current file content and hash refresh after source or version change | Deterministic refresh test | Pass |
| Compaction restores IDs when summary omits module names | Simulated Codex `SessionStart` test | Pass |
| Sessions and project roots remain isolated | Deterministic state isolation test | Pass |
| Missing, unlinked, malformed, unreadable, and oversized sources fail safely | Deterministic failure tests | Pass |
| Setup is idempotent and disablement preserves edits | Codex and Claude settings adapter tests | Pass |
| CLI setup connects to refresh and disable entrypoints | Isolated temporary project linked to the real TypeScript module | Pass |
| Static-only host is reported accurately | Unsupported-host adapter test | Pass |
| Actual Codex or Claude Code ordinary chat and compaction | Not run | Unverified |

## Commands and results

- `node node_modules/vitest/vitest.mjs run tests/automatic-module-context.test.ts tests/unit/modules/show.test.ts --maxWorkers=1 --reporter=dot`: pass, 2 files and 33 tests.
- `npm run build`: pass.
- `npm run lint`: pass.
- `node cli/dist/cli.js context --help`: pass.
- Isolated CLI setup, refresh, current rule content, and disablement smoke: pass.
- `node cli/dist/cli.js context status --host all`: pass. This project has no `.codex/hooks.json` or `.claude/settings.json`, so neither host is configured here.
- `openspec validate automatic-module-rule-refresh --strict`: pass.
- `openspec validate automatic-module-context --strict --type spec`: pass.
- `openspec validate --archived --strict`: pass, including the archived implementation change.
- `git diff --check`: pass.
- `npm run test:vitest -- --maxWorkers=1`: fail, 65 files passed and 4 failed, with 971 tests passed, 52 skipped, and 10 failed. Failures were in Visual Design character counts, cross-platform path handling, CLI update mocking, and MCP integration process tests. Vitest also reported one unhandled rejection tied to the MCP timeout test. A clean `HEAD` worktree with its CLI built reproduced the same 10 failures in those four files.
- `npm test -- --runInBand`: fail, 23 suites passed and 2 failed, with 313 tests passed and 3 failed. Failures were Visual Design character counts and a skill execution diagnostic expectation. The same 3 failures reproduced in a clean `HEAD` worktree.

## Environment limits

The `codex` executable resolves to a Windows npm shell wrapper in this WSL environment, but its interactive chat hooks were not exercised. Claude Code is not installed. This checkout has no project hook configuration, and linked-module discovery reports no linked modules. The new tests exercise deterministic adapters and simulated lifecycle input. The user must run `augx context setup --host all` in a project that links modules, then accept the host trust prompts before automatic refresh can run there.
