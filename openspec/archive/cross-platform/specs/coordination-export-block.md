# Spec: Coordination Manifest `export` and `mirrors` Blocks

## Purpose

Define two new optional top-level keys in `.augment/coordination.json` that let the `cross-platform` feature read project defaults and persist materialization state across runs.

## Schema

### `export` (object, optional)

```json
{
  "export": {
    "targets": ["claude-code", "cursor"],
    "ignore": ["**/examples/**"],
    "mirror": false
  }
}
```

| Key | Type | Default | Description |
|---|---|---|---|
| `targets` | `string[]` | `[]` | Default target list for `augx export` when `--target` is omitted. Each element is one of `claude-code`, `cursor`, `windsurf`, `copilot`. |
| `ignore` | `string[]` | `["**/examples/**"]` | Glob patterns excluded from aggregation, relative to each module root. Forward-slash paths. |
| `mirror` | `boolean` | `false` | When `true`, `augx link` runs the mirror hook for all `targets` without requiring `--mirror`. |

Validation:
- `targets` elements MUST be from the closed enumeration above.
- `ignore` MUST be strings; invalid globs are reported but do not block.
- `mirror` MUST be a boolean.

Absence of the entire `export` block preserves current behavior exactly.

### `mirrors` (object, optional)

```json
{
  "mirrors": {
    "<module-id>": [
      {
        "tool": "cursor",
        "sourcePath": "augment-extensions/modules/typescript-standards/rules/naming.md",
        "targetPath": ".cursor/rules/augx-typescript-standards.mdc",
        "mode": "symlink"
      }
    ]
  }
}
```

| Key | Type | Description |
|---|---|---|
| `<module-id>` | `string` | Module ID as resolved by `augx link`. |
| `tool` | `enum` | One of `claude-code`, `cursor`, `windsurf`, `copilot`. |
| `sourcePath` | `string` | Forward-slash path relative to project root, pointing into `augment-extensions/modules/`. |
| `targetPath` | `string` | Forward-slash path relative to project root, inside one of the per-tool conventional locations. |
| `mode` | `enum` | `"symlink"` or `"copy"`. Recorded by the mirror hook based on what actually succeeded. |

The `mirrors` block is written and maintained by the CLI; it should not be hand-edited. `augx unlink` removes a module's entire entry when cleanup completes.

## Reader Behavior

- Loaders that do not recognize `export` or `mirrors` MUST ignore them silently. The coordination manifest schema is forward-compatible by convention.
- The CLI MUST treat missing keys as `undefined`, never raise on absence.
- Writers MUST preserve unknown top-level keys when round-tripping the file.

## Writer Behavior

- Keys are serialized in alphabetical order at each object level.
- File ends with a trailing newline.
- Two-space indentation, LF line endings.

## Migration

Existing `.augment/coordination.json` files require no migration. The new keys appear lazily the first time `augx export` or `augx link --mirror` runs.

## Interaction with `augx unlink`

When `augx unlink <module>` is invoked, the CLI:

1. Iterates `mirrors[<module>]`.
2. Removes each tracked target file per the rules in `mirror-hook.md`.
3. Deletes `mirrors[<module>]`.
4. If `mirrors` becomes empty, deletes the `mirrors` key entirely to keep the file clean.

## Interaction with `augx export`

When `augx export` is invoked without `--target`:

1. CLI reads `export.targets`.
2. If empty or missing, exits with usage error.
3. Otherwise runs the export for each listed target, applying `export.ignore`.

`export.mirror` is only consulted by `augx link`; `augx export` ignores it.

## Example: Full `.augment/coordination.json` Excerpt

```json
{
  "specs": { ... },
  "tasks": { ... },
  "export": {
    "targets": ["claude-code", "cursor"],
    "ignore": ["**/examples/**", "**/CHANGELOG.md"],
    "mirror": true
  },
  "mirrors": {
    "typescript-standards": [
      {
        "tool": "claude-code",
        "sourcePath": "augment-extensions/modules/typescript-standards/rules/naming.md",
        "targetPath": ".claude/rules/typescript-standards/naming.md",
        "mode": "symlink"
      },
      {
        "tool": "cursor",
        "sourcePath": "augment-extensions/modules/typescript-standards/rules/naming.md",
        "targetPath": ".cursor/rules/augx-typescript-standards.mdc",
        "mode": "copy"
      }
    ]
  }
}
```
