# Tests: cross-platform

This directory holds the test plan and fixture artifacts for the `cross-platform` OpenSpec change. The actual test source files live in the `cli/` package once the implementation phase begins (see `tasks.md`, Phase 5).

## Contents

| File | Purpose |
|---|---|
| `test-plan.md` | Authoritative list of unit (U1-U9) and integration (I1-I3) tests, with coverage targets. |
| `fixtures/coordination.before.json` | Initial coordination manifest used by I2 (mirror round-trip). |
| `fixtures/coordination.after-mirror.json` | Expected coordination manifest after `augx link --mirror`. |
| `fixtures/mcp.beads.json` | Sample MCP server declaration that should trigger snippet inlining. |
| `fixtures/expected-CLAUDE.md` | Golden output for I1 (export end-to-end). |

## Determinism

All tests pin time via `AUGX_FAKE_NOW=2026-05-25T12:00:00Z` and pin the version via the package manifest. Fixture goldens are byte-stable across host OS because all writes normalize to LF and all generated paths use forward slashes.

## Mapping to Acceptance Criteria

| Acceptance criterion (from `proposal.md`) | Test |
|---|---|
| `augx link --mirror cursor,windsurf` records paths in coordination.json | U2, U3, I2 |
| `augx unlink` removes mirrored artifacts | U6, I2 |
| `augx export --target claude-code` produces CLAUDE.md with banner + hash | U9 (claude-code adapter), I1 |
| `augx export --target all --dry-run` reports paths and byte counts, writes nothing | U5 |
| Re-running export with no changes is byte-identical | I1 (second run) |
| MCP snippet present only when Beads is configured | U8 |
| Existing `.augment/` workflows unaffected | I1 (project fixture has no `.augment/` writes) |
| Drift detection refuses overwrite without `--force` | U4 |

## Running

Once `cli/` has the implementation in place, the suite runs via:

```
npm test
npm run test:integration
```

These commands are reserved by Phase 5 / task `bd-xplat5`.
