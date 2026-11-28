# Automatic module rule refresh in chat

## Why

Linked Augx rules are currently loaded only when an agent or user asks for them. After compaction, an active chat may lose those rules even though the project links and source files have not changed.

## What Changes

- Add project setup and removal for automatic Codex and Claude Code lifecycle hooks.
- Select relevant linked modules from each submitted prompt, retain only minimal per-session module and file selections, and restore them on resume or compaction.
- Resolve rule files from the current canonical local source on every refresh, validate project version pins, and include identity hashes with the full selected content.
- Preserve user host settings and remove only unchanged Augx-owned hook entries.
- Report static-only support for Cursor, Windsurf, and GitHub Copilot without claiming live refresh there.

## Design

Codex uses synchronous `UserPromptSubmit` and `SessionStart` hooks. Its official hook documentation says a `SessionStart` hook matching `source: compact` runs before the next model request, including an immediate continuation after automatic compaction. Claude Code uses `UserPromptSubmit` and `SessionStart` for `compact` and `resume`. Both hooks provide session identity and working directory and accept additional context. Project hook trust remains controlled by each host.

Hook state contains the project root, host, canonical module IDs, and selected relative rule paths. It does not store prompt text, transcripts, or rule contents. Each hook resolves current linked modules and rereads selected files. Missing, unlinked, unreadable, or version-mismatched sources are omitted with diagnostics.

## Compatibility

Existing `show`, linking, export, mirror, and decision-layer commands keep their current contracts. Automatic refresh is opt-in through a one-time `augx context setup` command. No remote fetch or module update is performed.

## Capabilities

- Affected capability: automatic-module-context
- Related Beads task: bd-fa9h
