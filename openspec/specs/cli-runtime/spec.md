# cli-runtime Specification

## Purpose

Define how the Augx CLI launches external programs consistently on Linux and Windows.

## Requirements

### Requirement: Cross-platform external command execution

Augx MUST launch external commands with their executable and arguments represented separately. It MUST support executable files on Linux and Windows command wrappers, including `.cmd` launchers, without requiring the user to change Augx command configuration between operating systems.

#### Scenario: Initialize on Linux

- **WHEN** a user runs `augx init` on Linux with Beads, OpenSpec, and Augx installed
- **THEN** Augx can query those tools for help and write the generated command reference
- **AND** command arguments containing spaces remain intact

#### Scenario: Initialize on Windows

- **WHEN** a user runs `augx init` on Windows with Beads, OpenSpec, and Augx installed through Windows package managers
- **THEN** Augx can invoke their command wrappers and write the generated command reference
- **AND** command arguments containing spaces remain intact

#### Scenario: Execute a skill command

- **WHEN** Augx executes a skill CLI command on either operating system
- **THEN** Augx passes the executable and literal arguments to the process launcher
- **AND** it does not evaluate the command through a shell
