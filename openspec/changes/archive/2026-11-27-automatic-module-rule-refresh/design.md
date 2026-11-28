# Design

## Context

See `proposal.md` for the user problem and scope. The implementation shares Augx module discovery, link manifests, semantic version checks, project-root resolution, and contained file resolution. Host-specific lifecycle registration belongs behind separate adapters because Codex and Claude Code use different hook files and trust flows.

Official host documentation confirms a synchronous prompt hook that can add context for Codex and Claude Code. Codex `SessionStart` provides `source: compact` before the next model request, including the immediate continuation after automatic compaction. Claude Code `SessionStart` fires for manual or automatic compaction and its `additionalContext` is read on the next model request. Claude Code documents that its first response waits for startup hooks to finish. These API behaviors are documented, but live chat behavior has not been exercised in this workspace.

## Goals / Non-Goals

**Goals:**

- Keep selection, current content resolution, and host output formatting independently testable.
- Register hooks with minimal project-scoped edits and an ownership record that permits safe removal.
- Recover selections from bounded per-session state without storing prompts, transcripts, or rule content.

**Non-Goals:**

- Add live refresh to hosts that only expose static rule files or export targets.
- Fetch remote modules, alter a project's version pins, or inspect undocumented host transcript formats.

## Decisions

### Use documented lifecycle hooks for delivery

Register Codex `UserPromptSubmit` and `SessionStart` hooks in `.codex/hooks.json`, and Claude Code `UserPromptSubmit` and `SessionStart` hooks in `.claude/settings.json`. These hooks run automatically during ordinary chat and allow Augx to return current content. A manual CLI query, model instruction to remember a tool, or static export cannot guarantee refresh after compaction.

Codex requires users to review and trust the exact non-managed hook definition and only loads project hooks from trusted project layers. Claude Code can ask the user to trust the project settings. Setup reports these steps rather than claiming it can bypass host trust.

### Reuse canonical module resolution and keep state minimal

Resolve links from the nearest Augx project manifest, then find each linked canonical module through the existing resolver and validate the requested version against the current local source. Canonical module IDs, explicit rule paths, metadata, prompt terms, file extensions, and rule headings guide selection. A full canonical module ID selects the module as requested; a short alias with task context narrows it to relevant rule files.

Persist only a schema version, host, canonical module IDs, selection modes, relative rule paths, project root, hashed session key, and update time. Keep separate files for host, project, and session. Store them with owner-only file permissions. Never use a previous rule body as fallback. On every prompt and compact/resume event, resolve links again and reread the current local rule files.

Use a shared module-file resolver for both `show` and context refresh. It rejects absolute paths, parent traversal, and symlinks that resolve outside the module root, preserving the established `show` containment behavior.

### Return full files within bounded host budgets

Return complete selected Markdown files with module ID, local version, source path, and SHA-256. Do not summarize or truncate individual files. If a complete file does not fit the hook's character budget, omit it and return a structured diagnostic. Codex uses a 24,000 character budget and passes its capped context with `additionalContextLimit: 0`. Claude Code uses 9,000 characters, below its documented 10,000 character threshold for saving oversized hook context to a file with only a preview.

### Track only unchanged hook entries

Merge hook entries into host configuration while preserving unrelated keys and handlers. Store a project-local ownership receipt containing hashes of Augx-owned handlers and whether Augx created the host file or hooks object. Disablement removes entries only when their recorded hash still matches. Edited or conflicting entries remain and are reported. Avoid replacing the whole host settings file with an Augx-generated file.

### Keep static-only hosts outside the live adapter

Cursor, Windsurf, and GitHub Copilot retain export and mirror support. Setup and status report that this integration cannot inject current context during their chats. This prevents static rule materialization from being presented as lifecycle refresh.

## Risks / Trade-offs

- [Host trust is required before project hooks run] → Setup reports trust steps and status confirms registration integrity without claiming host approval.
- [Lexical matching can miss a relevant module or choose several related files] → Re-evaluate every user prompt, prioritize exact file paths and headings, report unresolved references, and keep selection behavior deterministic in tests.
- [A selected rule file can be too large for the host context surface] → Omit the complete file with a machine-readable budget diagnostic instead of injecting stale, summarized, or partial rule content.
- [Host configuration can change after setup] → Verify handler hashes, preserve edits, and require setup again to refresh an edited registration.

## Migration Plan

1. Build and publish the CLI with `augx context setup` and `augx context status`.
2. In a project that links Augx modules, run setup once and accept the host trust prompt.
3. Verify configured hook registration with `augx context status`; the host performs refresh automatically on future prompts and compact or resume events.
4. Upgrade by running setup again. Remove Augx handlers with `augx context disable`; unchanged Augx entries are removed while modified and unrelated entries are retained.

Rollback does not change module links, version pins, or rule sources. It removes only the unchanged hook handlers recorded in the ownership receipt.

## Open Questions

None that block this implementation. Live host and compaction checks require a trusted Codex or Claude Code session and remain unverified here.
