# End-To-End Session: Link, Mirror, Export, Unlink

A worked example of using `augx link --mirror` and `augx export` together in a single project from a clean state through to cleanup.

## Scenario

A new TypeScript project wants both:

- **Cursor** to see per-module rules (one file per module, easy to inspect).
- **Claude Code** to see one aggregated `CLAUDE.md` (single-file consumption).
- Live task state queried via the **Beads MCP server** rather than baked into either file.

Tools to be linked:

- `coding-standards/typescript`
- `workflows/openspec`

## Step 0: Initial State

```bash
$ ls
package.json  src/
$ augx list --linked
(no modules linked)
$ cat .augment/coordination.json
{
  "version": "1.0.0",
  "lastUpdated": "2026-05-25T12:00:00.000Z",
  "specs": {},
  "tasks": {}
}
```

`.vscode/mcp.json` already declares the `beads` MCP server (assumed for this scenario).

## Step 1: Declare Project Defaults

Add to `.augment/coordination.json`:

```json
{
  "export": {
    "targets": ["claude-code"],
    "ignore": ["**/examples/**"],
    "mirror": false
  }
}
```

`export.targets` records the convention "this project's aggregated export goes to Claude Code". `export.mirror: false` keeps the per-module mirror opt-in (we will request it explicitly).

## Step 2: Link Modules With Cursor Mirror

```bash
$ augx link coding-standards/typescript --mirror cursor
linked: coding-standards/typescript (v1.0.0)
  cursor wrote symlink .cursor/rules/augx-typescript-standards.mdc

$ augx link workflows/openspec --mirror cursor
linked: workflows/openspec (v1.0.0)
  cursor wrote symlink .cursor/rules/augx-openspec.mdc
```

Both modules are now mirrored individually into `.cursor/rules/`. The coordination manifest records:

```json
{
  "mirrors": {
    "coding-standards/typescript": [
      { "tool": "cursor",
        "sourcePath": "augment-extensions/modules/typescript-standards/rules/...",
        "targetPath": ".cursor/rules/augx-typescript-standards.mdc",
        "mode": "symlink" }
    ],
    "workflows/openspec": [
      { "tool": "cursor", "sourcePath": "...", "targetPath": ".cursor/rules/augx-openspec.mdc", "mode": "symlink" }
    ]
  }
}
```

## Step 3: Aggregated Export For Claude Code

```bash
$ augx export
[wrote] claude-code -> CLAUDE.md (14_502 bytes, 2 modules)
```

`CLAUDE.md` now contains:

- The banner (with `source-hash`).
- The Beads MCP snippet (because `.vscode/mcp.json` declares `beads`).
- A `## Module: coding-standards/typescript (v1.0.0)` section.
- A `## Module: workflows/openspec (v1.0.0)` section.
- The footer.

## Step 4: Verify Both Surfaces

```bash
$ augx export --dry-run
[dry-run] claude-code -> CLAUDE.md (no-op, byte-identical)

$ augx link coding-standards/typescript --mirror cursor
linked: coding-standards/typescript (v1.0.0)
  cursor reused symlink .cursor/rules/augx-typescript-standards.mdc
```

Both commands are now no-ops. The system has reached a stable fixed point.

## Step 5: Edit A Module And Re-Sync

A new convention is added to `augment-extensions/modules/typescript-standards/rules/naming.md`.

```bash
$ augx export
[wrote] claude-code -> CLAUDE.md (14_640 bytes, 2 modules)

$ augx link coding-standards/typescript --mirror cursor
linked: coding-standards/typescript (v1.0.0)
  cursor wrote symlink .cursor/rules/augx-typescript-standards.mdc
```

The aggregated `CLAUDE.md` and the per-module `.cursor/rules/augx-typescript-standards.mdc` are both refreshed. Modules that did not change are not rewritten.

## Step 6: Handle A Drift Refusal

A teammate has manually edited `CLAUDE.md`:

```bash
$ augx export
error: CLAUDE.md has been hand-edited since the last 'augx export'.
       (banner source-hash 'a1b2...' does not match body hash 'e5f6...')
       Pass --force to overwrite, or edit module sources and re-run.
$ echo $?
3
```

Apply the drift-resolution playbook:

```bash
$ git diff CLAUDE.md
# review the edit
$ # decision: the edit belongs in the typescript module
$ git checkout HEAD -- CLAUDE.md
$ # move the edit into augment-extensions/modules/typescript-standards/rules/...
$ augx export
[wrote] claude-code -> CLAUDE.md (14_780 bytes, 2 modules)
$ echo $?
0
```

See `rules/drift-resolution.md` for the full decision tree.

## Step 7: Unlink One Module

```bash
$ augx unlink workflows/openspec
unlinked: workflows/openspec
  removed symlink .cursor/rules/augx-openspec.mdc
  cleared mirrors["workflows/openspec"]

$ augx export
[wrote] claude-code -> CLAUDE.md (8_120 bytes, 1 module)
```

The Cursor per-module file is gone, the coordination manifest entry is gone, and `CLAUDE.md` is regenerated without the `openspec` section.

## Step 8: Full Cleanup

```bash
$ augx unlink coding-standards/typescript
unlinked: coding-standards/typescript
  removed symlink .cursor/rules/augx-typescript-standards.mdc
  cleared mirrors["coding-standards/typescript"]
  (mirrors block now empty, removed key)

$ rm CLAUDE.md
$ augx list --linked
(no modules linked)
```

The project is back to its initial state. `.augment/coordination.json` is restored to having no `mirrors` block; the `export.targets` convention remains for next time.

## Recap

| Step | Surface | Outcome |
|---|---|---|
| 2 | Cursor (per-module) | Two `augx-<module>.mdc` files written as symlinks. |
| 3 | Claude Code (aggregated) | One `CLAUDE.md` written with banner + MCP snippet + 2 module sections. |
| 4 | Both | No-op rerun confirms idempotency. |
| 5 | Both | Module edit refreshes both surfaces. |
| 6 | Claude Code | Drift refusal recovered by moving edit into modules. |
| 7 | Both | One unlink prunes one Cursor file and one CLAUDE.md section. |
| 8 | Both | Full unlink restores initial state; coordination manifest stays clean. |

The Augment Code surface (`.augment/` rules) was untouched throughout. The Beads MCP server was the source of truth for task state; no task IDs ever appeared in `CLAUDE.md` or `.cursor/rules/augx-*.mdc`.
