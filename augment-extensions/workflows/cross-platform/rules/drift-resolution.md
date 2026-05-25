# Drift Resolution Playbook

## Symptom

```
$ augx export --target claude-code
error: CLAUDE.md has been hand-edited since the last 'augx export'.
       (banner source-hash 'a1b2c3d4...' does not match body hash 'e5f6a7b8...')
       Pass --force to overwrite, or edit module sources and re-run.
$ echo $?
3
```

`augx export` refuses to overwrite a target file when the banner's recorded `source-hash` does not match a freshly-computed hash of the body. This protects manual edits from being silently clobbered.

## Why Drift Happens

| Cause | How It Got There |
|---|---|
| Local edit | A human (or another tool) modified the exported file directly. |
| Different `augx` version | A teammate ran `augx export` from a version with a different rendering pipeline; their banner hash will not match yours after upgrade. |
| Module mutation outside augx | Files under `augment-extensions/modules/` were edited but `augx export` was not re-run on the original machine. |
| Merge conflict | A `git merge` left mixed content from two branches inside the exported file. |

## Resolution Decision Tree

```
Did the exported file change for a real reason?
├── No (accidental save, stale clone)
│   └── git checkout HEAD -- <path-to-exported-file>
│       Then re-run 'augx export'.
│
├── Yes, the edits should be reflected in modules
│   └── Move the edits into augment-extensions/modules/<module>/rules/<file>.md
│       Run 'augx export' again.
│       The new banner hash will match the new body.
│
└── Yes, but the edits are intentionally local (one-off override)
    └── Run 'augx export --force'.
        Confirm the local edits are gone, then add the override
        somewhere outside the augx-managed file (e.g., .augment/rules/).
```

## Recommended Sequence

### Step 1: Inspect

```bash
git diff CLAUDE.md
```

Look at what changed. If git also shows changes under `augment-extensions/modules/`, those are the upstream source; the exported diff is downstream.

### Step 2: Decide where the change belongs

- **Belongs in a module**: move the edit into the module's `rules/*.md`, commit, then re-export.
- **Belongs nowhere** (a stray edit, copy/paste mistake): discard with `git checkout`.
- **Belongs only locally**: accept the loss by running with `--force`, then re-add the local override outside the augx-managed file.

### Step 3: Re-export

```bash
augx export --target claude-code
```

Verify exit code 0. The new banner records the new source hash.

### Step 4: Validate

```bash
augx export --target claude-code --dry-run
```

Should report `(no-op)` or zero bytes changed.

## Bypassing Drift Detection

```bash
augx export --target claude-code --force
```

`--force` writes regardless of drift. Use only after one of:

- You have already moved the edits into modules and just want the canonical file to refresh.
- You are intentionally discarding the local edits.
- You are running in CI where the drift is known to be from an `augx` version bump.

Do NOT use `--force` reflexively. Drift refusal is a feature; it is the only thing standing between an `augx` re-run and silent data loss.

## CI Recipe

In CI, the typical sequence is:

```bash
augx export --target all --dry-run    # see what would change
augx export --target all              # write only if no drift
test $? -eq 0
```

If CI hits exit 3, it should fail loudly rather than silently `--force`. Drift in CI usually means a stale checkout or a forgotten commit; investigate before forcing.

## Per-Tool Considerations

| Tool | Drift Manifests As |
|---|---|
| `claude-code` (`CLAUDE.md`) | Comment-stripping by editors (some IDEs auto-format HTML comments). |
| `cursor` (`.cursor/rules/augx.mdc`) | YAML frontmatter being reformatted (key order changes). |
| `windsurf` (`.windsurfrules`) | Trailing-whitespace fixes from editor save-on-format. |
| `copilot` (`.github/copilot-instructions.md`) | GitHub's web editor adding a trailing newline. |

The banner is content-stable across whitespace edits **inside the body** (the hash is computed over the body excluding the banner), but a single character change does invalidate the recorded hash. If your editor cannot be told to leave the file alone, consider adding it to `.gitattributes`:

```
CLAUDE.md           text eol=lf -text-conversion
.cursor/rules/**    text eol=lf -text-conversion
.windsurfrules      text eol=lf -text-conversion
```

## When To Escalate

If `augx export` keeps exiting 3 on a clean checkout and a re-run from a known-good `augx` version, file a Beads task. The expected invariants:

- Two runs from the same `augx` version on the same modules MUST produce identical banner and body hashes.
- A no-op re-run MUST exit 0 with no writes.

A reproducible violation is a bug in the export pipeline, not a drift condition.
