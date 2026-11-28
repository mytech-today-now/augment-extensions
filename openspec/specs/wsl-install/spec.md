# wsl-install Specification

## Purpose

Define how WSL users identify and correct Augx installs that use Windows npm shims with no Linux Node.js runtime available.

## Requirements

### Requirement: Diagnose Windows npm shims in WSL

The npm package MUST include a shell-only check that runs without Node.js and identifies when Node, npm, npm's global prefix, or the `augx` command resolves to a Windows installation from WSL. It MUST provide a corrective direction to install and use Linux Node.js and npm inside WSL.

#### Scenario: Linux Node is unavailable

- **WHEN** the check runs in a WSL shell without a Linux `node` executable
- **THEN** it reports that Augx cannot start because Linux Node is unavailable
- **AND** it directs the user to install Linux Node.js and npm inside WSL before installing Augx

#### Scenario: Windows npm shim shadows Augx

- **WHEN** Linux Node is available but npm, npm's global prefix, or `augx` resolves under a Windows-mounted path
- **THEN** the check identifies the Windows path
- **AND** it directs the user to correct Linux `PATH` order and reinstall Augx using Linux npm

#### Scenario: Linux installation is selected

- **WHEN** Node reports the Linux platform and npm, its global prefix, and Augx resolve to Linux paths
- **THEN** the check reports the selected paths as Linux-native

#### Scenario: Diagnose an installed Windows npm shim

- **WHEN** the `augx` command resolves to a Windows npm shim and cannot start because Linux Node is missing
- **THEN** the installed npm package contains the shell-only check
- **AND** the user can run that check with Bash without starting Augx
