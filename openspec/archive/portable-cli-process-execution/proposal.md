# Proposal: Portable CLI process execution

## Why

Augx invokes external programs for command help, skills, MCP servers, VS Code, TypeScript checks, and CLI updates. These paths currently mix shell command strings with direct process spawning. Windows package managers and tools commonly expose `.cmd` launchers, while Linux uses executable files. The current mix makes the same Augx command behave differently across those systems and can break arguments that contain spaces.

## What changes

Add one process execution utility that accepts an executable and argument array, resolves Windows command wrappers, captures output when needed, and preserves process status and timeout behavior. Route Augx external command integrations through it. Keep skill commands as literal arguments without shell evaluation.

## Scope

This change covers Augx CLI child processes on Linux and Windows. It includes help extraction, skill execution, MCP command discovery and launch, VS Code integration, TypeScript version detection, and npm-based CLI self-update.

## Success criteria

- Augx builds and starts on Linux and Windows.
- Augx help extraction and initialization can invoke installed Beads, OpenSpec, and Augx CLIs on both systems.
- External commands receive the same argument values on both systems, including paths with spaces.
- Skill commands continue to run without shell interpretation.
- Existing command output, status, timeout, and cancellation behavior remains available.
