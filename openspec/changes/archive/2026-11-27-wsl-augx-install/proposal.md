# WSL-safe Augx Installation Checks

## Why

Installing the package with Windows npm from a WSL terminal can place the `augx` shell wrapper under `/mnt/c/Users/.../AppData/Roaming/npm`. That wrapper invokes `node`, and WSL reports `node: not found` when Linux Node is not available in the shell's `PATH`. The error occurs before Augx starts, so CLI runtime handling cannot diagnose it.

## What Changes

Add a shell-only check that can run without Node and reports whether Node, npm, npm's global prefix, and Augx resolve to Linux or Windows locations. Ship the check in the npm package and update the install guide with WSL-specific checks and a Linux-native installation path.

The change does not alter the user's Windows PATH, install a runtime, or modify shell startup files.
