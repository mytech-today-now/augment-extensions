# Examples: cross-platform

These files illustrate the artifacts produced by `augx export` and the state recorded by `augx link --mirror`. They are reference outputs, not live project files.

| File | Produced by | Target tool |
|---|---|---|
| `CLAUDE.md` | `augx export --target claude-code` | Claude Code |
| `augx.mdc` | `augx export --target cursor` | Cursor (placed at `.cursor/rules/augx.mdc`) |
| `.windsurfrules` | `augx export --target windsurf` | Windsurf |
| `copilot-instructions.md` | `augx export --target copilot` | GitHub Copilot (placed at `.github/copilot-instructions.md`) |
| `coordination.json` | `augx link --mirror ...` | Updates `.augment/coordination.json` |

All four exported files share:

- Identical generation banner (`augx-version`, `generated-at`, `source-hash`, `modules`).
- Identical `source-hash` value, proving the same inputs were aggregated for every target.
- The Beads MCP wiring snippet (no live task data).
- Per-module sections in alphabetical order.

The coordination JSON example shows both the input `export` block (project defaults) and the output `mirrors` block (tracked materializations) that the mirror hook populates.

## Round-Trip Properties

- Re-running `augx export` against unchanged inputs is byte-identical (idempotent).
- `augx unlink typescript-standards` removes only the `typescript-standards` entries from `mirrors` and deletes the corresponding target files when they still match their tracked source.
- Hand-editing any generated file flips the source-hash check; the next `augx export` exits non-zero with code 3 unless `--force` is supplied.
