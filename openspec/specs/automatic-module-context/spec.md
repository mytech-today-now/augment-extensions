# automatic-module-context Specification

## Purpose

Defines project-scoped lifecycle hooks that refresh current linked Augx module rules during supported host chats.

## Requirements

### Requirement: Automatic linked module refresh

Setup SHALL register documented host lifecycle hooks for Codex and Claude Code that refresh relevant linked Augx rule content on every user prompt and before model continuation after compaction. The refresh SHALL run without a per-turn user command. Host trust and approval requirements SHALL be reported accurately.

#### Scenario: Ordinary prompt selects a linked module
- GIVEN a project has an enabled host integration and a linked module whose metadata or rule headings match the prompt
- WHEN the user submits an ordinary task prompt
- THEN the synchronous host hook injects the current selected rule files with module, version, path, and SHA-256 metadata

#### Scenario: Compaction omits module names
- GIVEN the session previously selected linked module IDs and relative rule paths
- WHEN the host compacts the conversation and the compacted text omits those names
- THEN the host compact or resume lifecycle hook restores the current rule files before the next model request

### Requirement: Project scoped relevance selection

Refresh SHALL select modules only from the nearest Augx project manifest. It SHALL evaluate canonical module references, rule-file paths, prompt relevance, metadata, and rule headings on every user prompt. Invalid or unavailable links SHALL produce diagnostics and SHALL NOT fall back to stale content.

#### Scenario: Prompt relevance selects scoped rules
- GIVEN a project links TypeScript and Python modules
- WHEN a prompt names a TypeScript source file and asks about its tests
- THEN the refresh selects the linked TypeScript test rules and excludes the unrelated Python module

### Requirement: Current source and per-session recovery

Session selection state SHALL be isolated by host, session, and project root and SHALL NOT contain chat text or rule content. Every refresh SHALL reread current local files and verify linked version constraints without silently changing pins or fetching remote updates.

#### Scenario: Source or link changes after injection
- GIVEN a module was injected earlier in the chat
- WHEN its source content or linked version changes before the next prompt or compaction
- THEN the hook injects only content resolved from the current canonical local source and reports unresolved version constraints

#### Scenario: Concurrent chats and projects
- GIVEN two host sessions or project roots select different modules
- WHEN each session refreshes or compacts
- THEN each receives only its own stored selection and current project links

### Requirement: Exact rule content and safe failure

Refresh SHALL inject complete selected rule files within a documented per-host context budget, not summaries. It SHALL use Augx module path containment checks, deduplicate files, and return machine-readable diagnostics for omitted, oversized, invalid, unreadable, or unlinked selections. It SHALL never reuse cached rule content after a refresh failure.

#### Scenario: Exact file reference
- GIVEN a prompt names a linked module and a module-relative rule file
- WHEN the hook refreshes the prompt
- THEN it injects the current complete file when the path is contained and reports the same file-not-found or outside-module class of error when it is not

#### Scenario: Unsupported live host
- GIVEN a host has only a static export or mirror integration
- WHEN setup or status is requested for automatic context refresh
- THEN Augx reports that live lifecycle refresh is unsupported for that host and does not claim activation

### Requirement: Idempotent host ownership

Setup SHALL preserve unrelated host settings, detect malformed configuration and conflicts without overwriting them, and be idempotent. Disablement SHALL remove only unchanged Augx-owned hook handlers and retain hand-edited or unrelated configuration.

#### Scenario: Repeated setup and removal
- GIVEN a host has unrelated hooks or settings
- WHEN Augx setup runs repeatedly and is later disabled
- THEN it creates at most one Augx hook per event, preserves unrelated settings, and removes only unchanged Augx-owned handlers
