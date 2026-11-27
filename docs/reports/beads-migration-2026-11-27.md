# Beads migration, November 27, 2026

Task: bd-18f800ab. Explicitly authorized by the user after the GUI prompt task.

## Outcome

Native Beads 1.3.1 now uses embedded Dolt in this checkout. Native task reads,
updates, comments, dependency queries, invalid-input rejection, remote push,
and `bd sync` work. A separate workspace recovered the published database
using `bd bootstrap` and matched the live export and ready-task set.

The migration recovered all 565 issues, 596 dependency edges, 93 original
comments, and 1,802 distinct per-issue labels from 680 append-only log entries.
The migration progress comment increases the current comment count to 94.
No unrelated task was closed or reclassified.

## Diagnosis and preservation

The installed npm-owned `bd` is version 1.3.1. The old `.local_version` was
0.60.0; metadata selected no database, and configuration still pointed to
SQLite. Current Beads correctly refused this historical Dolt layout.

With no database writer running, all 44 source files were copied and verified
against individual SHA-256 hashes. Their local backup root is:

```text
C:\Users\kyle_\AppData\Local\Augx\backups\augment-extensions\beads-20261127T062511Z
```

`source-beads/` is the verified sealed copy. `pre-cutover-beads/` contains the
original directory moved aside at cutover. `source-manifest.json` records its
file hashes. Reconciliation scripts, comparison results, diagnostic logs and
disposable trial databases are retained alongside them. These local artifacts
were not added to Git.

The historical Beads 0.60.0 Windows archive was verified against its official
release checksums before execution. Dolt 2.7.7 was verified against its
official release asset digest and used only from the backup tools directory.
No global Dolt installation was added. Inspection of the copied native root
found no tables and only its initial repository commit. Historical export
could not find the configured `beads` database. The JSONL task log therefore
provided the actual recoverable issue data; no successful historical export
is claimed.

The original tracked native files, stale server state, and nested daemon
artifacts were retired from the working tree. They remain in the backups and
Git history. Leaving that historical layout in new checkouts would trigger
the same current-version refusal.

## Reconciliation

Partial records were merged by issue ID in physical append order. The final
current-version import/export comparison found no differences in the
normalized records, including titles, descriptions, statuses, metadata,
labels, dependency relationships and comment contents.

- `bd-xplat5` and `bd-xplat7` changed from `in-progress` to `in_progress`.
- Legacy comment numbers were reused across issues. Stable unique comment
  IDs avoid native primary-key collisions; original IDs remain in
  `metadata.legacy.comment_ids`.
- Trial comparison exposed fractional-second rounding and offset handling in
  native timestamp import. Import timestamps were normalized to UTC whole
  seconds. Exact original text and precision remain in
  `metadata.legacy.source_timestamps` and `comment_timestamps`.
- Original `spec`, `claimed_by`, `blocked_by`, dependency attributes, and
  repeated label lists are retained in legacy metadata. Applicable fields
  also map to native `spec_id`, `assignee`, and dependency relationships.
- Failed trials remained disposable. The activated database was imported
  fresh and passed the complete comparison before cutover.

## Configuration and safeguards

`.beads/config.yaml` now selects the `bd` issue prefix, immediate compatibility
exports, and the native Git-backed Dolt remote. `.beads/issues.jsonl` is a
generated snapshot. The native database, local metadata and operation gates
are ignored by ordinary source control.

Native 1.3.1 marker-managed hooks replaced the 0.56.1 shims.
`core.hooksPath=.beads/hooks` and `beads.role=maintainer` are local Git settings.
The remote addition also created the native Beads commit named
`bd: update sync.remote`; it only changes the shared configuration.

Two existing Git Credential Manager accounts caused a blocked account chooser.
The global setting
`credential.https://github.com/mytech-today-now/augment-extensions.git.username`
now selects the already stored `mytech-today-now` account for this repository
URL only. No token was printed, copied, or requested. Fresh bootstrap then
exposed Windows filename limits in Dolt's generated Git cache; setting global
`core.longpaths=true` fixed the tested restore. Previous values and reasons
are recorded in `git-account-selection.json` and `git-longpaths-setting.json`
under the backup root.

Legacy JSONL-only write helpers now refuse writes for native Dolt projects.
The query helper also stops on malformed metadata. Read-only snapshot queries
and isolated legacy-only fixtures retain their behavior. AGENTS.md and the
local Beads guides now direct task mutations through native `bd` commands.

## Verification

| Check | Result |
|---|---|
| 44-file pre-cutover SHA-256 verification, repeated before activation | PASS |
| Fresh import/export comparison of 565 issues, 596 edges, 93 comments and 1,802 labels | PASS; no differences |
| Exact legacy metadata preservation after live operation and remote restore | PASS |
| Native `count`, `context`, repository identity reconciliation and `ping` | PASS |
| Native repair-task status update, progress comment and close | PASS |
| `ready` and dependency query | PASS |
| Missing issue and invalid priority | Rejected; exported bytes unchanged |
| Native Dolt push and `bd sync --attempts 1 --json` | PASS; pulled and pushed, zero blocked rows corrected |
| Separate-workspace `bd bootstrap`, export comparison and ready-set comparison | PASS; all 565 issues restored |
| `bd doctor --check=artifacts --json` | PASS; zero artifacts |
| Three legacy writer guards, malformed metadata and unchanged export bytes | PASS in disposable PowerShell fixtures |
| Snapshot query and isolated legacy-only write | PASS in disposable fixtures |
| PowerShell parser checks for the three changed scripts | PASS |
| `npm run lint` and `npm run build` | PASS |
| Application Jest/Vitest suites | NOT RUN; no TypeScript application code changed |

Initial import failures, timestamp discrepancies, the credential wait and
bootstrap path failures were retained and corrected before the successful
checks above. Server-mode doctor diagnostics do not apply to the selected
embedded storage mode. Cross-platform behavior was not tested.

## Recovery

Run `bd bootstrap` in a fresh clone to recover the published native history.
Use `bd backup init <destination>` and `bd backup sync` for future native
backups. JSONL export alone does not preserve complete Dolt history and state.

For local rollback, stop writers, preserve the current native database, and
restore the complete `pre-cutover-beads` directory. Restoring that original
layout also restores its known Beads 1.3.1 refusal. Do not overwrite published
native history or force-push Git branches to perform a local rollback.

Migration procedures were checked against the official
[Beads 1.3.1 cross-era guide](https://github.com/gastownhall/beads/blob/v1.3.1/docs/getting-started/upgrading.md#cross-era-upgrades)
and installed command help.
