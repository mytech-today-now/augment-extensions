# Terminal manager integration, November 26, 2026

Task: bd-lluw. Change: integrate-gui-modules.

## Initial diagnosis

| Addition | Discovery/package | Display/details | Search | Link/unlink/refresh | Operations and documentation |
|---|---|---|---|---|---|
| coding-standards/java | Present in manifests and npm allowlist | Choice present; no details flow | Canonical/manifest names omitted in GUI | Filtered unlink defect; one-shot session | Static independent standard; README exists |
| coding-standards/spring | Present | Same gap | Same identity gap; Spring Boot display works | Same shared defect | Independent framework guidance; no JDK needed to browse |
| workflows/decision-layer | Present | Jev identity only in tags; no details flow | Built CLI `search Jev` returns no results | Same shared defect | Nine existing operations absent from GUI |
| workflows/agent-engineering | Present | No templates/contracts/example browser | Canonical ID omitted in GUI; description terms work | Same shared defect | Local fixture/validator guidance exists; no service |
| Other/future modules | Dynamic discovery already works | Same shared details gap | Same identity/tag gaps | Same shared lifecycle defects | Retain writing exclusion and invalid collection filtering |

Revalidated with a fresh `npm run build`, checkout-local CLI help, list --linked, search Jev and search agent-engineering. Active renderer is InteractivePrompt/Inquirer; GUI helpers and localStorage state files do not activate an Ink or browser renderer. No relevant newer module is absent from discovery. Unrelated untracked ai-prompts/jev.md is preserved.

Native `bd list --title gui --json` fails: `legacy Dolt workspace from bd 0.60.0 detected; explicit migration is required before this bd version can open or modify the workspace`. The repository JSONL helper records this task without migrating the store.

## Outcome and design basis

The existing terminal manager now discovers and manages the named additions through canonical manifests. Shared substring search includes canonical IDs, manifest/display names, descriptions, types and actual tags. Static module browsing exposes READMEs, rules, examples, templates, schemas, validator source and decision contracts. No fixed registry, duplicate Jev module, browser renderer, new dependency, version bump or automatic runtime activation was introduced.

The session loops and reloads discovery/configuration after actions. Checkbox changes are restricted to displayed IDs and require a default-no review. Non-exiting lifecycle services preserve existing CLI wrappers, version semantics, dependency checks, and mirror protections. Results report successful and failed operations separately. Canonical project resolution preserves ancestor inheritance and paths with spaces/Unicode; invalid explicit scopes fail before mutation.

The decision menu reaches setup, doctor, decide, run, resume, evaluate, examples, inventory and remove through the same isolated process bridge used by CLI decision commands. Setup always previews before installation. Operation-relevant prompts validate scope, JSON syntax, identity, mode, budget syntax and digest shape; the authoritative runtime still validates schemas, policy limits, credentials, digest/state binding, ownership, deadlines, request accounting and independent verification. Browsing/static linking imports no optional SDK and performs no provider or worker work. Known credentials and secret assignments are redacted, including output split across chunks.

The catalog generator also omitted four discovered legacy-category modules: workflows/adr-support, workflows/cross-platform, workflows/database and workflows/wordpress-plugin. A new test reproduced this omission before the fix. The generator now includes every discovered category without rewriting manifest types. The generated cli/MODULES.md was regenerated; the curated root catalog retains its existing descriptions with a focused GUI usage link.

Pre-fix production checks failed for filtered selection removing an unrelated Python link, the one-action menu failing to refresh, built CLI search missing the Jev tag, helper transformations losing actual tags, and the catalog dropping four discovered IDs. An additional negative redaction check exposed authorization schemes, short secrets and quoted values; the shared bridge now removes these values while preserving JSON string quoting. These checks pass after their corresponding fixes.

The broader Jest run also exposed the existing short-name lookup loading every discovered module before selecting the first match. Its 100 ms search guard failed at 209.98 ms under concurrent checks and again serially; a separate serial run measured 113.61 ms. Exact lookup now loads candidates in the same canonical discovery order and stops at the first match. It retains containment checks and fresh filesystem discovery without a cache or registry. The unchanged timing test then passed at 60.08 ms. No threshold, retry policy or assertion was weakened.

One full Vitest attempt passed 970 checks but timed out in the unchanged five-second doctor test while detecting local runtime/host versions (6.27 seconds). The isolated original test passed in 1.02 seconds without modifications. The timeout log is retained at test-artifacts/gui-package/vitest-doctor-timeout.log. Runtime code, assertions and timeouts remain unchanged; subsequent final gate results are listed below.

Another full attempt passed doctor and the 70 decision tests, but the unchanged concurrent-collection-deletion test received Windows EPERM from two simultaneous filesystem removals. All 18 original collection-deletion tests immediately passed unchanged on their own. That full-run log is retained at test-artifacts/gui-package/vitest-concurrent-delete.log. No deletion assertion, retry or timeout was changed.

## Changed files and purposes

| Files | Purpose |
|---|---|
| cli/src/commands/gui.ts, gui-module-manager.ts | Active prompt entry, iterative navigation, canonical details/assets, scoped mutations, refresh and project context; existing skill flow retained |
| cli/src/commands/gui-decision.ts | Relevant input collection, explicit setup/install/offline/live/removal choices and truthful outcomes |
| cli/src/utils/decision-runner.ts, commands/decision.ts | Shared optional process bridge, structured arguments, redaction, signal cleanup and non-exiting return codes |
| cli/src/commands/link.ts, unlink.ts | Reuse existing lifecycle logic as throwing services while retaining standalone command behavior |
| cli/src/utils/module-system.ts, commands/search.ts | Shared canonical metadata search with actual tags; stop exact lookup after the first canonical match |
| cli/src/types/gui.ts, utils/gui-helpers.ts | Preserve tags, manifest identity, version and category through compatibility helper transformations |
| cli/src/utils/modules-catalog.ts, cli/MODULES.md | Include dynamically discovered categories and reconcile generated catalog |
| cli/src/cli.ts, README.md, modules.md, cli/docs/GUI_ARCHITECTURE.md, GUI_CONFIGURATION.md | Accurate CLI options, supported controls, actual renderer and implemented workflows |
| tests/gui-integration.test.ts, gui-decision.test.ts, decision-bridge.test.ts, cli/src/commands/__tests__/gui.test.ts, gui-repo-filtering.test.ts | Real prompt/filesystem tests, controlled operation dispatch, real offline subprocesses, failure/cancellation/redaction boundaries and retained Jest coverage |
| scripts/verify-gui-package.cjs | Disposable installed consumer checks with current Node and an optional explicitly supplied Node 16 executable |
| docs/reports/gui-windows-test-reliability-follow-up.md | Once-refined, unexecuted prompt for independently observed baseline Windows test intermittence, bd-zqy2 |
| openspec terminal-manager spec/archive, .beads/issues.jsonl, .augment/coordination.json | Requirements, implementation record, task and affected-file traceability |

## Acceptance and material-risk matrix

PASS means the listed local evidence was executed. It does not imply provider, production, OS-sandbox or other-platform proof.

| Requirement or risk | Test level | Positive or negative path | Expected result | Verification status |
|---|---|---|---|---|
| AC1: all four canonical additions and real metadata | Real source prompts and installed package | Positive | Correct IDs, manifest names, versions and descriptions in discovery/details | PASS |
| AC2: JAVA, Spring Boot, Jev, TypeSafe, decision-layer, agent-engineering, harness, loops, graphs | Shared production search, CLI and GUI prompts | Positive, mixed case and trimmed queries | Match canonical source metadata | PASS |
| AC2: future module and duplicate display name | Disposable installed module fixture | Positive | Discover and act on canonical ID without registry edits | PASS |
| AC3: persisted link/unlink and refresh | Real temporary project and TTY | Positive and repeated unchanged selection | Persist actual changes, refresh badges, retain pin metadata | PASS |
| AC3: filtered selection and cancellation | Real temporary project, packed consumer and TTY | Negative | Preserve unrelated/unavailable links and byte-identical cancelled config | PASS |
| AC4: nine decision operations | Injected prompt seam with controlled executor | Positive | Dispatch only operation-relevant validated scope/arguments | PASS |
| AC4: setup preview, explicit installation, failure and removal | Prompt tests plus existing installer tests | Positive and negative | Plan first; failed plan/cancel prevents install; errors do not claim readiness; removal retains edits | PASS |
| AC4: explicit offline examples | Real prompt/process boundary, package and TTY | Positive | Eleven capability results labeled offline; no SDK install or provider verification | PASS |
| AC4: live activation and budget | Prompt combination tests and existing runtime tests | Negative and controlled positive dispatch | No live fallback; positive explicit budget; runtime policy remains authoritative | PASS locally; actual paid provider NOT RUN |
| AC4: exact review digest and durable accounting | Real runtime review/resume and existing decision suite | Positive and negative | Reject stale approval; preserve attempts/requests and original state/deadline | PASS locally |
| AC5: agent templates/contracts/loops/graphs/validator | Static content prompt tests and existing agent suite | Positive | Canonical assets accessible; no invented service or script runner | PASS |
| AC6: invalid IDs, JSON, modes, budgets, digest, malformed/absent config and invalid scopes | Production prompt/validation paths | Negative | Clear failure without unintended mutation or provider call | PASS |
| AC6: lifecycle write denial and partial failure | Controlled filesystem fault through real lifecycle; dependency block | Negative | Preserve bytes on denied write; continue independent work and report counts | PASS with simulated denial; actual OS ACL denial NOT VERIFIED |
| AC6: missing runtime assets, unavailable SDK/credentials, provider and child failures | Controlled bridge and existing real SDK loopback tests | Negative | No fallback or parent-menu termination; useful diagnostics | PASS within local boundaries |
| AC6: redaction and structured subprocess execution | Production bridge with controlled streams/child | Negative | Redact split credentials, preserve Unicode, shell:false and argument arrays | PASS |
| AC6: cancellation/listener and worker cleanup | Controlled bridge, existing IPC runtime test and TTY prompt exit | Negative | Forward cancellation, bounded cleanup, no leaked listeners; retain accounting | PASS locally; arbitrary detached custom workers outside guarantee |
| AC7: existing collections, skills, exclusions and legacy config | Real collection/pin tests; retained Jest and full regression suites | Positive and negative | Preserve existing behavior and unavailable records | PASS |
| AC7: four exports, mirrors and edited-file protection | Full existing suites and installed package | Positive and negative | Rules-only deterministic surfaces; edited export refusal | PASS |
| AC7: optional runtime isolation and Node compatibility | Installed Node 16.20.2 and 24.14.1 consumer checks; Node 22.23.5 startup smoke | Positive | Ordinary startup/discovery/GUI seam need no SDK; decision execution stays separate | PASS on Windows; Node 22 limited to five startup checks; other OS NOT VERIFIED |
| AC8: build/lint/catalog/module/spec/package checks | Repository gates and pack inspection | Positive | Current compiled code, all four module assets, no local test artifacts in package | PASS |
| Empty input, missing optional metadata and many modules | Production metadata/prompt tests | Boundary | Blank search cancels; absent metadata safe; no ID truncation or dropped choices | PASS |
| Short-name lookup latency with the expanded module set | Existing unchanged Jest performance suite | Positive | First-match behavior preserved and median search below 100 ms | PASS after lookup optimization |
| Narrow terminal dimensions | Prompt seam at 40 columns/12 rows | Boundary | Four-row pagination retains all canonical choices | PASS automated; physical narrow-window visual check NOT VERIFIED |
| Real interactive terminal | Windows PTY, actual Inquirer | Navigation, filter, mutation, refresh, cancellation and offline workflow | Keyboard flow works with accurate outcomes | PASS at ordinary terminal size |
| Baseline Windows test repeatability | Full-suite and isolated original reruns | Negative/environment boundary | Retain failures, preserve assertions and report a green final run separately | Final run PASS; intermittent doctor/deletion cases remain tracked in bd-zqy2 |
| Provider quality/cost, production and other platforms | External/provider/platform work | Out of local verification scope | No unsupported conclusion | NOT VERIFIED; existing bd-758d remains applicable |

## Compatibility and limits

The npm files allowlist, package/CLI version 3.2.0, declared Node >=16 compatibility, module source versions, runtime policy and schemas are unchanged. Node 22+ remains the separate optional decision execution requirement. No package was published, global software installed, paid inference invoked or production credentials used. Existing local SDK prerequisites were reused by the decision suite; loopback SDK tests are not provider connectivity evidence. No active browser frontend changed, so browser screenshots or browser/device checks would not validate this terminal UI.

Windows Node 24 actual TTY checks navigated to search, matched JAVA, linked Java in a disposable project while preserving pinned Python, returned to refreshed checked choices, repeated an unchanged selection, cancelled blank search, executed all eleven explicitly offline examples, returned through Back and exited with Ctrl+C. The Node 16 actual TTY check rendered the ordinary menu and exited; its full lifecycle coverage comes from the installed-package prompt seam. Narrow dimensions were injected into prompts, without a physical narrow-window visual session.

Actual installation/provider/platform evidence continues to use the existing decision and agent module limits. No new external orchestration or execution guarantees are claimed. No remaining GUI implementation gap was identified. The independently observed baseline test intermittence is recorded as bd-zqy2 with a [specific follow-up prompt](gui-windows-test-reliability-follow-up.md), refined once using the requested source and left unexecuted. Existing live-provider/platform work (bd-758d) and legacy Beads migration work (bd-18f800ab) remain separate; their existing follow-ups are not executed by this GUI change.

## Rollback and handoff

Revert the integration commit identified in the session handoff, then run npm run build. This restores CLI behavior and active guidance; it does not delete project data or operational installations. To reverse a project link, use augx unlink with its existing mirror protections. To remove decision software, explicitly use decision remove and inspect preserved edits/run data. No version or published package rollback is needed.

Git synchronization and remote verification are recorded in the session handoff. Unrelated ai-prompts/jev.md and pre-existing local state/stashes are preserved.

Native `bd sync` was attempted and failed with exit 1:

```text
Error: legacy Dolt workspace from bd 0.60.0 detected; explicit migration is required before this bd version can open or modify the workspace. Preserve .beads unchanged and follow docs/getting-started/upgrading.md#cross-era-upgrades
```

The legacy database was not initialized, migrated or rewritten. Task progress uses the repository's existing append-only scripts/beads-query.ps1 helper; Git still carries the task records and implementation. Existing bd-18f800ab tracks the separate migration.

## Final verification evidence

The change adds 77 Vitest cases and one Jest case, while adapting retained GUI tests to the iterative menu. No assertion, threshold or timeout was weakened. Earlier failed attempts are described above; the following are the final successful gate results.

| Command or procedure | Result |
|---|---|
| npm run lint | PASS |
| npm run build | PASS |
| npm test -- --runInBand | PASS: 25 suites, 316 tests; search median 57.69 ms against unchanged 100 ms limit |
| npm run test:vitest -- --maxWorkers=1 | PASS: 67 files, 971 tests; 108.42 seconds, including all 70 decision tests with existing SDK prerequisites |
| node cli/dist/cli.js validate coding-standards/java | PASS; existing advisory URL/inline-example warnings retained |
| node cli/dist/cli.js validate coding-standards/spring | PASS; existing advisory URL/inline-example warnings retained |
| node augment-extensions/workflows/agent-engineering/scripts/validate.cjs | PASS: 87,100 characters, eight templates, four graph shapes |
| node augment-extensions/workflows/decision-layer/scripts/validate.cjs | PASS: 27 files, 117,091 characters |
| node cli/dist/cli.js catalog --output cli/MODULES.md, then catalog --output cli/MODULES.md --check | Generated and verified up to date |
| openspec validate integrate-gui-modules --strict --no-interactive | PASS before archive |
| openspec validate terminal-manager --type spec --strict --no-interactive | PASS for canonical requirements |
| npm pack --json --ignore-scripts --pack-destination test-artifacts/gui-package | PASS: 1,140 files; four manifests and compiled GUI present; local prompts, tmp and test artifacts excluded |
| node scripts/verify-gui-package.cjs test-artifacts/gui-package/mytechtoday-augment-extensions-3.2.0.tgz tmp/agent-engineering/node16/node.exe | PASS: 26 Node 24.14.1 checks and 25 Node 16.20.2 checks |
| Existing Node 22.23.5 executable, installed-package startup probe via stdin | PASS: help, four-module discovery, Jev search, non-TTY diagnostic, injected GUI exit with empty project and no optional SDK/runtime imports |
| Windows actual TTY procedures described above | PASS within the stated Node/runtime and terminal-size limits |
| git diff --check and changed-content no-em-dash review | PASS |

Final tarball SHA-256: b23ce54ead98c65ae45ffb263443d3bda3ddc391e60c88b98bba1cd714dd0a81.

The disposable installed-consumer receipt is C:\Users\kyle_\AppData\Local\Temp\augx GUI package xPXFcD\verification.json. Its Node 22 startup receipt is node22-startup.json in the same directory. Repository suite logs and tarball metadata are retained under ignored test-artifacts/gui-package/. Temporary consumer state and local evidence are not published package contents.

Live provider calls, paid inference, production verification, global installation, npm publication, physical narrow-window rendering and other operating systems were NOT RUN. Provider quality/connectivity, actual OS ACL denial, arbitrary detached workers and cross-platform UI behavior remain NOT VERIFIED. These limits do not become positive evidence through the controlled tests or the successful final reruns.
