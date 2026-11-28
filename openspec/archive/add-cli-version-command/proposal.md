# Add an Augx version command and GUI display

## Why

Users need a direct way to identify the installed Augx CLI version from both a shell and the interactive terminal manager.

## What Changes

- Add `augx version`, which prints the installed package version.
- Keep the existing `augx --version` option and add `augx --v` as a shorter alias.
- Preserve the standard help flags and accept `augx --h` as an alias for `augx --help`.
- Display that same package version when the terminal GUI opens.

## Impact

- Affects the Augx CLI entry point, terminal manager, CLI documentation, and the CLI version specification.
- Does not change package versioning or update behavior.

## Related Beads

- `bd-ilua`
