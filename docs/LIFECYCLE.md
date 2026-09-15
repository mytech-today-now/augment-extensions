# Lifecycle Management

This repository treats `.augment/lifecycle.json` as the canonical project-level lifecycle record for Augment Extensions.

## What It Covers

- Fresh installation
- Same-version reinstallation
- Upgrade and refresh flows
- Rollback from a retained backup
- Diagnostic review and redacted reports
- Safe repair actions
- Explicit uninstall cleanup

## State Model

The lifecycle status field is one of:

- `not-installed`
- `installation-detected`
- `installation-in-progress`
- `installation-completed`
- `installation-partially-completed`
- `installation-failed`
- `upgrade-available`
- `upgrade-in-progress`
- `rollback-available`
- `rollback-in-progress`
- `uninstallation-pending-confirmation`
- `uninstallation-in-progress`
- `uninstallation-partially-completed`
- `uninstallation-completed`
- `diagnostic-analysis-in-progress`
- `repair-available`
- `repair-in-progress`
- `recovery-required`

The command line also reports individual issues, backup availability, archive availability, and safe fixes.

## Main Command

Use `augx lifecycle` for inspection and recovery:

- `augx lifecycle status`
- `augx lifecycle repair`
- `augx lifecycle rollback`
- `augx lifecycle report`
- `augx lifecycle uninstall`

When run with no action in an interactive terminal, the command opens a menu.

## Artifact Locations

- Artifact: `.augment/lifecycle.json`
- Backups: `.augment/lifecycle/backups/`
- Archives: `.augment/lifecycle/archives/`
- Reports: `.augment/lifecycle/reports/`

The artifact is JSON and is safe to regenerate when the current state is valid. Invalid or unsupported artifacts are preserved for diagnostics.

## Safe Fixes

The repair flow can apply these safe fixes when they are relevant:

- `recreate-config`
- `restore-backup`
- `restore-ai-prompts-directory`
- `reinstall-core-rules`
- `rebuild-command-help`
- `rebuild-ai-prompts-archive`
- `refresh-artifact`

## Recovery Flow

Recommended recovery sequence:

1. Run `augx lifecycle status`.
2. Export a report with `augx lifecycle report`.
3. Use `augx lifecycle repair --all-safe` or choose specific fixes.
4. If repair fails, run `augx lifecycle rollback`.
5. If uninstall is desired, run `augx lifecycle uninstall`.

## Security Notes

- The lifecycle artifact does not store plaintext credentials.
- Diagnostic reports redact path-like evidence strings.
- ZIP extraction rejects traversal and symbolic-link ancestry.
- Uninstall and rollback create backups before changing state.

## Limitations

- This repository does not manage operating-system credential managers or external services directly.
- Credential values are not captured in the lifecycle artifact.
- If a project already has an invalid artifact, the repair flow preserves it until an explicit recovery action replaces it.

