# Windows Symlink Fallback

## TL;DR

On Windows, `fs.symlinkSync` requires administrator privileges or Developer Mode. When neither is available, the mirror hook automatically falls back to `copyFile`, records `mode: 'copy'` in the coordination manifest, and never retries `symlink` for that destination again.

No user action is required. This document explains the behavior contract so you know what to expect.

## Detection

The mirror hook attempts a symlink first and catches a closed set of errnos:

| Errno | Meaning on Windows | Fallback? |
|---|---|---|
| `EPERM` | Not running elevated / Developer Mode off | Yes -> copyFile |
| `EACCES` | Permission denied on target directory | Yes -> copyFile |
| `ENOSYS` | Filesystem does not support symlinks (e.g., FAT32) | Yes -> copyFile |
| `EEXIST` | Destination already exists | No -> reconciled by idempotency rules |
| `ENOSPC` | Disk full | No -> re-thrown |
| any other | Unexpected | No -> re-thrown |

`copyFile` is invoked with the **same source and target arguments** that were passed to `symlink`. The chosen `mode` is then recorded in `.augment/coordination.json.mirrors[<module>][i].mode`.

## Per-Run Behavior After Fallback

Once `mode: 'copy'` is recorded for a destination, the mirror hook **skips the symlink attempt** on subsequent runs and copies directly. This avoids:

- A retry storm: re-attempting symlink hundreds of times per `augx link` on a Windows machine without Developer Mode.
- Spurious EPERM noise in logs.
- Race conditions where the symlink half-succeeds, leaves a broken link, and then the copy lands.

To force a fresh attempt (e.g., after enabling Developer Mode), clear the `mode` field for that destination or run `augx unlink <module>` followed by `augx link <module> --mirror ...`.

## Source Hash Validation

When `mode: 'copy'` is in effect, the mirror hook still revalidates the copy against the source hash on each re-link. If the source has changed, the destination is rewritten. The recorded `mode` only affects **how** the destination is materialized, not **whether** it is kept in sync.

## What `augx unlink` Does With Copies

`augx unlink <module>` honors both modes:

| Tracked entry | Cleanup action |
|---|---|
| `mode: 'symlink'`, target is still that symlink | Delete the symlink. |
| `mode: 'symlink'`, target has been replaced by a regular file | Warn and leave in place. |
| `mode: 'copy'`, target content matches recorded source hash | Delete the copy. |
| `mode: 'copy'`, target has been hand-edited (hash mismatch) | Warn and leave in place. |

User edits are never silently destroyed, regardless of materialization mode.

## Enabling Developer Mode (Optional)

On Windows 10/11, enabling Developer Mode lets a non-elevated process create symlinks:

1. Settings -> Privacy & Security -> For developers
2. Toggle "Developer Mode" on
3. Restart the shell

After enabling, run `augx unlink <module>` and then `augx link <module> --mirror ...` to recreate the destinations as symlinks. Subsequent runs will record `mode: 'symlink'`.

If you cannot enable Developer Mode (corporate policy), the `copy` mode is fully supported and produces the same end-user experience; the only differences are disk usage (small) and update granularity (every re-link rewrites the file).

## POSIX Behavior

On Linux and macOS, `fs.symlinkSync` succeeds for any user with write access to the parent directory. `mode: 'symlink'` is recorded. The fallback path is never exercised in normal operation.

## Verification

To confirm the fallback worked on a specific destination:

```bash
augx link <module> --mirror cursor --verbose
```

Verbose output:

```
  cursor wrote symlink .cursor/rules/augx-<module>.mdc
```

or

```
  cursor wrote copy    .cursor/rules/augx-<module>.mdc
```

The recorded mode is also visible directly in the manifest:

```bash
cat .augment/coordination.json
# .mirrors["<module>"][...]"mode": "copy"
```

## Cross-Platform Invariants

The mirror hook guarantees these invariants regardless of the active mode:

- The destination's content equals the source's content after a successful link.
- A re-link of an unchanged module is a no-op (no rewrites, no symlink/copy churn).
- A re-link of a changed module updates the destination in place.
- `augx unlink` removes only tracked entries; hand-edited destinations survive.
- The coordination manifest is the single source of truth for what was materialized and how.

## When `mode` Changes Between Runs

Recorded `mode` changes only when one of:

- `augx unlink` clears the entry and the next `augx link` is performed under different filesystem capabilities.
- A future `augx remirror` (not in this change's scope) explicitly requests re-materialization.

The mirror hook never silently flips an existing `'copy'` entry to `'symlink'` on its own. Stability across runs is more important than mode optimization.
