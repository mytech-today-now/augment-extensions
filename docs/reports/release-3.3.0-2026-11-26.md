# Version 3.3.0 release verification

Date: November 26, 2026. Release tracking: bd-gy62.

The user explicitly requested a version bump and commitment/push of every reviewed safe change to `origin/main`. The initial tree at `5405b00` was clean, with no staged, unstaged, untracked, or stashed work. Fetch confirmed no divergence from the intended GitHub repository, `mytech-today-now/augment-extensions`. The previously untracked Jev prompt was already included in `5405b00`.

## Ignore review completed before documentation and version edits

Reviewed root `.gitignore`, `.beads/.gitignore`, `.beads/.beads/.gitignore`, and the C/Go module `.gitignore` files. Hidden-file discovery found no applicable npm, Docker, formatter, or deployment ignore files or Docker build contexts. The npm package uses the explicit `package.json.files` allowlist. No ignore edits were necessary.

`git check-ignore -v --no-index` confirmed exclusions for dependencies, compiled CLI output, local release artifacts, `.env`, and Dolt server state. It also confirmed the explicit coordination-manifest inclusion. Source documents, the lockfile, and Beads JSONL history remain included. The package content check separately verifies required compiled/module inputs and exclusion of local artifacts. No files were deleted or hidden from review.

## Documentation and version decision

The minor bump from `3.2.0` to `3.3.0` follows the contributor guide's SemVer convention for new capabilities. Reviewed history since the previous version commit `fb6579a` includes Java and Spring standards, Agent Engineering, the Jev / TypeSafe Decision Layer, terminal-manager integration, and Windows/CommonJS compatibility corrections. The new changelog section records those verified changes without asserting npm publication.

Updated `README.md` release copy, badge, workflow list, and example export banner; `CHANGELOG.md`; canonical root `VERSION`; `package.json`; and both workspace version values in `package-lock.json`. Independent module versions and the `ink` dependency's unrelated `3.2.0` value remain unchanged. There is no `VERSIONS` or `VERSIONING.md` in this repository.

The instruction-required `pnpm version:sync` was attempted with Corepack network access and auto-pinning disabled. It exited 1: `Command "version:sync" not found`. `package.json` has no such script. Existing `scripts/bump-and-push.ps1` confirms that this project's release version records are `VERSION`, `package.json`, and `package-lock.json`, but couples their update to commit/tag/push behavior. Those three records were aligned with minimal edits instead of changing tooling or resolving dependencies. This is an explicit sync-tool failure, not a passing synchronization check. Follow-up: bd-1ybt.

The four export goldens were regenerated with the existing Vitest snapshot mechanism. Review confirmed that only their CLI version banner changed. No production code, dependencies, lockfile dependency entries, runtime policies, or package allowlists were changed.

## Verification

Commands below ran on Windows with Node.js 24.14.1 unless another runtime is stated. Local logs and rendered HTML are ignored under `test-artifacts/release-3.3.0/`.

| Requirement | Command or evidence | Result |
|---|---|---|
| Initial inspection | `git status --porcelain=v2 --branch`, staged/unstaged diffs, untracked listing, history, `git stash list`, safe origin comparison, `git fetch origin`, `git rev-list --left-right --count HEAD...origin/main` | Clean `main`, intended origin, 0 ahead / 0 behind |
| Instructions and ignore files | `Get-Content`, scoped `rg --files --hidden`, `git ls-files`, `git check-ignore -v --no-index` on representative paths | Reviewed before documentation edits; no ignore changes |
| Linked guidance | `node cli/dist/cli.js list --linked`, coordination/rule inspection | Existing PowerShell, TypeScript, and marketing guidance discovered; applicable local rules read |
| Static analysis | `npm run lint` | Passed |
| Compilation | `npm run build` | Passed |
| Export fixtures | `npm run test:vitest -- tests/export-e2e.test.ts --maxWorkers=1 -u` | Passed, four expected banner updates; real exports remain byte-identical on repeat |
| README rendering | Python Markdown with fenced-code and table extensions; assertions on release text, badge, escaped banner, and changelog link | Passed; `README.html` retained locally; manual visual inspection not run |
| Jest | `npm test -- --runInBand` | Passed: 25 suites, 316 tests |
| Vitest | `npm run test:vitest -- --maxWorkers=1` | Failed: 66 files passed, one failed; 970 tests passed, one concurrent-delete EPERM failure; all 70 decision tests passed |
| Targeted diagnosis and export regression | `npm run test:vitest -- tests/unit/collections/delete.test.ts tests/export-e2e.test.ts --maxWorkers=1` | Passed: 19 unchanged tests, including all 18 deletion tests and the versioned export fixture comparison |
| Version and dependency integrity | `python test-artifacts/release-3.3.0/audit.py`; Node 24 and Node 16 compiled CLI `--version` | Passed: both report 3.3.0; package and lockfile differ only in workspace version fields; original coordination/history and module/source state preserved |
| Package review | `npm pack --ignore-scripts --json --pack-destination test-artifacts/release-3.3.0` and archive content review | Passed: 1,140 files, compiled CLI and all four recent modules present, no local artifacts or prompts |
| Installed-package checks | `node scripts/verify-gui-package.cjs test-artifacts/release-3.3.0/mytechtoday-augment-extensions-3.3.0.tgz tmp/agent-engineering/node16/node.exe` | Passed: 26 checks on Node 24.14.1 and 25 on Node 16.20.2; ordinary lifecycle, discovery/search, GUI, static exports/mirrors, hand-edit protection and Node 24 offline examples |
| Installed release identity | Receipt SHA-256 compared with archive hash; installed CLI `--version` under both runtimes | Passed: receipt matches reviewed archive and both installed CLIs report 3.3.0 |
| Catalog consistency | `node cli/dist/cli.js catalog --output cli/MODULES.md --check` | Passed |
| Task history | `scripts/beads-query.ps1` create/update/show/close operations | Native sync unavailable; append-only JSONL helper used |
| Native Beads synchronization | `bd sync` | Failed: installed CLI refuses legacy bd 0.60.0 Dolt workspace; database preserved; existing bd-18f800ab remains open |
| Required version sync | `pnpm version:sync` | Failed: command absent; version records aligned directly and separately checked; bd-1ybt open |
| Diff and content review | `git diff --check`, complete changed-file review, added-content credential and em-dash scans | Passed; staged review and final remote status are reported in the user handoff |

One inspection command used a mistyped historical revision, `024d790..HEAD`, and failed as ambiguous. The corrected history query `git log --oneline fb6579a..HEAD` succeeded. This did not mutate the tree or affect validation.

The first local audit helper attempt failed because it assumed all existing coordination `modifiedBy` fields were arrays. Some are null. The helper was corrected to preserve and compare null values; the subsequent audit passed. No production code or coordination meaning was changed to satisfy this check.

Jest and the first full Vitest run overlapped. After both ended, the unchanged deletion file and export fixture were run together and all 19 tests passed. Inspection confirmed the reported deletion test calls `fs/promises.rm` twice concurrently on its owned disposable collection directory. The same Windows EPERM observation was already recorded before this release. No root-cause claim about Windows locking or the overlapping runs is established. No assertions, timeouts, or production behavior were changed, and the full-suite failure remains recorded as bd-zqy2. No repeated full-suite retries were used to erase it.

Archive: `test-artifacts/release-3.3.0/mytechtoday-augment-extensions-3.3.0.tgz`. SHA-256: `c270cba76d6ec1426550c8151c6e92f73d6b62e5b95cdffe9c10f27a5285dddf`.

Installed-package evidence: `C:\Users\kyle_\AppData\Local\Temp\augx GUI package Nw0ymY\verification.json`. The disposable install used the existing verifier with lifecycle scripts disabled. Its ordinary Node 16 checks do not imply Node 16 can execute the optional decision runtime; Node 24 additionally exercised all eleven labeled offline examples. No provider was called.

## Commit and remote handoff

The reviewed release files comprise README/changelog, three version records, four generated export goldens, this report, and task/coordination tracking. The commit subject is `chore(release): bump version to v3.3.0 (bd-gy62)`. The final user handoff records the resulting commit hash and observed remote verification. This pre-commit report does not assert a push that has not happened yet.

After committing, the required sequence is `git pull --rebase`, `bd sync`, and `git push origin main`, followed by `git fetch --prune origin`, `git ls-remote origin refs/heads/main`, `git rev-parse HEAD`, `git status --short --branch`, and `git stash list`. No force push, existing-commit rewrite, stash deletion, npm publication, or tag publication is part of this task.

## Limits and focused follow-ups

Npm publication, live paid providers, other operating systems, manual README visual inspection, and physical narrow-terminal testing were not run. Existing Windows test intermittence remains separately tracked as bd-zqy2, with its [previously refined execution prompt](gui-windows-test-reliability-follow-up.md). A passing release run does not resolve that repeatability issue.

The two prompts below were refined once using the successfully retrieved [requested refinement template](https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md). They record separate work and were not executed during release finalization.

### bd-1ybt: version-tooling contract

```prompt
You are a senior Node.js release-tooling maintainer working in C:\GitHub\augx\augment-extensions. Resolve the mismatch between AGENTS.md requiring pnpm version:sync and package.json providing no such command. VERSIONING.md is also absent. Inspect current instructions, VERSION, package metadata, scripts/bump-and-push.ps1, and release history before choosing the smallest consistent correction.

Preserve VERSION as the workspace authority and independently versioned modules. Reuse existing tooling where possible. Synchronization must not install packages, resolve dependencies, stage files, commit, tag, or push. Demonstrate a preview, a real update in an isolated fixture, an unchanged-input no-op, and failure without partial edits for invalid versions or conflicting records. If documentation alone resolves the intended contract, do not add a redundant synchronizer.

Preserve dirty work and legacy Beads data. Update bd-1ybt and coordination, run relevant existing checks, and report exact results and limits. Do not bump the live repository version merely to test synchronization. Do not use em-dashes in any generated content.
```

### bd-18f800ab: existing Beads compatibility blocker

```prompt
You are a Windows repository-tooling maintainer working in C:\GitHub\augx\augment-extensions. Investigate bd-18f800ab: native bd sync refuses the legacy bd 0.60.0 Dolt workspace. Inspect installed tool versions, existing JSONL helper, current database metadata, and the official cross-era upgrade guidance using read-only operations first.

Find a compatible supported access path without initializing, replacing, or implicitly migrating the store. If migration is necessary, prepare a concrete backup, rollback, and isolated-copy verification procedure before requesting authorization for that separate database operation. Prove existing issue identities, history, dependencies, and statuses survive, including negative-path rollback checks. Keep the append-only JSONL history intact and never expose credentials. Report read/query and synchronization outcomes separately. Do not claim this blocker resolved from a successful Git push. Do not use em-dashes in any generated content.
```
