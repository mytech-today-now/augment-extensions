# Beads task tracking

This checkout uses native Beads 1.3.1 with embedded Dolt. The database in
`.beads/embeddeddolt/` is authoritative. It needs no separate Dolt server or
global Dolt installation.

## Daily commands

```powershell
bd version
bd list
bd ready
bd show bd-18f800ab
bd create "Task title" --type task --priority 2
bd update <id> --status in_progress
bd comments add <id> "Progress and verification"
bd dep add <task-id> <blocker-id> --type blocks
bd close <id> --reason "Completed and verified"
bd sync
```

Run `bd bootstrap` after cloning to recover the published native database.
`bd sync` pulls and pushes Dolt history through the Git remote's
`refs/dolt/data` reference. Ordinary `git push` publishes source changes
separately. See `bd sync --help` for failure codes and bounded retry behavior.

## Compatibility exports

Native writes refresh `.beads/issues.jsonl` with no export throttle. Existing
Augx, PowerShell and MCP readers can read that snapshot. It is a generated
export, not an append-only task store. Do not hand-edit it or use it as a
database backup. Run `bd export --all -o .beads/issues.jsonl` if an explicit
refresh is needed.

`.beads/bd-write.ps1`, `.beads/bd-sync.ps1`, and mutation commands in
`scripts/beads-query.ps1` are legacy JSONL writers. They reject writes when
native Dolt metadata is present. Use the corresponding native commands above.
Read-only snapshot queries remain available. Do not run `setup-alias.ps1` to
replace native `bd` with the old JSONL wrapper.

## Migration and recovery

The November 27, 2026 migration recovered 565 issues, 596 dependency edges,
93 comments and 1,802 distinct per-issue labels from 680 legacy log entries.
The old Dolt root contained no tables. Its native files and the complete
original JSONL log were retained in verified local backups before cutover.

Partial records were merged in append order. Two `in-progress` statuses became
`in_progress`. Reused numeric comment IDs became stable unique IDs; original
IDs remain in `metadata.legacy.comment_ids`. Native timestamps use UTC whole
seconds; their original text and precision remain in
`metadata.legacy.source_timestamps` and `comment_timestamps`. Original custom
fields and dependency attributes also remain in `metadata.legacy`.

Use `bd backup init <destination>` followed by `bd backup sync` for a native
backup that preserves Dolt history and state. `bd export --all` is useful for
issue interchange and comparison, but it does not preserve the full database.
Do not copy or restore a live database while a writer is running.

For a local rollback, stop writers, retain a new copy of the current database,
and restore the complete pre-cutover `.beads` directory from the recorded
backup. That returns this machine to the old layout and its known current-CLI
guard; it does not roll back published Dolt history on other clones. Never
force-push or overwrite a remote database as part of a local rollback.

See [the migration report](../docs/reports/beads-migration-2026-11-27.md) for
backup locations and verification, and the official
[cross-era upgrade guide](https://github.com/gastownhall/beads/blob/v1.3.1/docs/getting-started/upgrading.md#cross-era-upgrades)
for the historical migration contract.
