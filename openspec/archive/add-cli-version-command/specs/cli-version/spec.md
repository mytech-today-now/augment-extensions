## ADDED Requirements

### Requirement: Installed CLI version discovery

The CLI SHALL provide an `augx version` command that prints the installed Augx package version. The existing `augx --version` and `augx -V` options SHALL continue to print the same version, and `augx --v` SHALL do so as an alias.

#### Scenario: Show version from the command line

- WHEN a user runs `augx version`
- THEN Augx prints the installed package version
- AND `augx --version`, `augx -V`, and `augx --v` report the same value

### Requirement: Installed CLI version in the terminal manager

The terminal manager SHALL display the installed Augx package version when it opens, using the same version source as the CLI command.

#### Scenario: Open the terminal manager

- WHEN a user opens `augx gui`
- THEN the manager heading displays the installed Augx package version

### Requirement: Help access

The CLI SHALL show its application help when invoked with `-h`, `--h`, or `--help`. The aliases SHALL work consistently on Linux and Windows.

#### Scenario: Show application help

- WHEN a user runs `augx -h`, `augx --h`, or `augx --help`
- THEN Augx prints the application help output
