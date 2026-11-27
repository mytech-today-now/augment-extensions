# Terminal manager verification, November 27, 2026

Task: bd-m83j. Base revision: 9c1a2b8. This report records checks executed in this session. The November 26 report remains a historical artifact.

The request is: "Update the Augx GUI and application to accommodate the recent additions, such as JAVA, Spring, Jev, and the agent-engineering modules."

## Outcome and diagnosis

The four named additions were already integrated through the active InteractivePrompt/Inquirer manager. The initial fresh build and checkout-local help, discovery, search and prompt tests confirmed that integration. No alternative renderer, module registry, provider wrapper or agent service was needed.

Two remaining defects were reproduced and corrected. Native JSON syntax errors included excerpts from malformed decision input and extensions configuration. The GUI now supplies actionable syntax messages without those excerpts. Filesystem read errors remain diagnostic, invalid configuration stops before prompts or mutation, and invalid decision input returns to the menu without dispatch. Files remain unchanged.

The broader module/package comparison found that workflows/cross-platform was discovered in the checkout but absent from the explicit npm allowlist. The first tarball contained 46 of the checkout's 47 module manifests. The extended consumer discovery assertion failed against that installed tarball. The allowlist now includes that specific directory and retains all previous entries. The final tarball contains all 47 canonical manifests, 1,148 files and no test-artifacts tree.

The cross-platform module's existing validator also failed before correction: its legacy type/category and dependency shape were invalid, required README sections were missing, and its declared character count was zero. Its manifest now uses the supported workflows category and empty dependency array. Required sections, stale source paths and references to an unavailable example module were corrected. Its exact decoded character count is 40,880. The validator now passes with the existing long-description advisory. Its ID and version remain unchanged; existing project records are not rewritten.

| Addition | Discovery and display | Search and details | Link/unlink and refresh | Operational meaning and documentation | Package availability |
|---|---|---|---|---|---|
| coding-standards/java | Correct canonical ID and metadata | JAVA/java and manifest/display names; canonical README/rules/example | Existing scoped lifecycle retained and verified | Independent language/platform guidance; no JDK needed to browse | Present before this change |
| coding-standards/spring | Correct canonical ID and metadata | Spring/Spring Boot and real tags; canonical content | Independently selectable; existing pins retained | Complementary framework guidance; no forced Java link | Present before this change |
| workflows/decision-layer | Jev/TypeSafe resolves to this module | Provider aliases come from actual tags | Static links stay separate from software ownership | Nine authoritative operations; explicit setup, offline/live, budgets and review digest | Runtime, contracts, schemas and installation resources present |
| workflows/agent-engineering | Correct canonical ID and metadata | Harness/loops/graphs and canonical name | Static lifecycle retained | Contracts, templates, bounded loops, graphs and validator exposed as readable files | Present, including optional example assets |
| workflows/cross-platform | Checkout discovery worked; metadata corrected | Canonical search and guide access retained | Existing lifecycle and mirror/export services reused | Source paths, valid example module, required sections and count corrected | Missing before; specific allowlist entry added |
| Q, Visual Design and other discovered modules | Existing canonical discovery retained | Shared metadata search retained | No registry or configuration migration | Existing guidance preserved | All 47 source manifests included |

## Changed files and compatibility decisions

- cli/src/commands/gui-decision.ts and cli/src/utils/extensions-config.ts: suppress malformed JSON source excerpts at their existing validation boundaries.
- tests/gui-decision.test.ts and tests/gui-integration.test.ts: strengthen the malformed-input assertion; add configuration privacy, menu recovery/no-dispatch and cross-platform metadata/assets regressions. Two new privacy assertions failed before the fix. The existing cross-platform validator supplied independent pre-fix failure evidence.
- package.json: add only augment-extensions/workflows/cross-platform/ to the explicit files allowlist. No dependency, lockfile, engine or version change.
- scripts/verify-gui-package.cjs: extend real installed-consumer coverage to cross-platform discovery, search, details, validation and lifecycle; check optional assets and packaged privacy diagnostics.
- augment-extensions/workflows/cross-platform/module.json and README.md: correct manifest schema, required documentation sections and maintained count. Its export-guide, mirror-guide, drift-resolution and end-to-end-session files use canonical source/module paths. The example transcript is explicitly illustrative.
- modules.md and generated cli/MODULES.md: expose the cross-platform guide and reconcile its count and supported category. The generated catalog was rebuilt through the actual generator. README.md already described these workflows correctly and required no edit.
- cli/docs/GUI_CONFIGURATION.md: document malformed-input/configuration recovery and privacy behavior.
- .augment/coordination.json, generated .beads/issues.jsonl and this report: task/spec/file traceability and fresh evidence. Native bd owns every task mutation; the export was never hand-edited.

The existing terminal-manager specification covers these bug fixes. No architectural change or new proposal was needed. Canonical IDs, pinned versions, selected project scope, filtered managed sets, cancellation, writing exclusions and invalid-collection filtering remain authoritative. Existing lifecycle services retain ownership, dependency and hand-edit protections. The root and module versions remain unchanged. VERSIONING.md and the documented version:sync script are absent in this checkout, already tracked by bd-1ybt; no version synchronization was needed or attempted.

Ordinary Augx startup remains independent of the optional SDK and its execution runtime. Decision runtime code, policy, budgets, deadlines, review digests, worker permissions, provider validation, removal receipts and independent verification were not changed. Static exports/mirrors remain rules-only, with MCP-first live task lookup. Module browsing does not install software or execute module content.

## Commands and observed results

Logs and tarballs are retained under ignored test-artifacts/gui-2026-11-27/. Commands below used the current checkout's built CLI, not global augx. The installed host was Node 24.14.1; ordinary compatibility also uses the existing Node 16.20.2 executable. Jest and Vitest use their actual checkout configurations.

| Command or procedure | Result |
|---|---|
| npm run build; checkout-local --help, gui --help, decision resume --help, list --linked and search JeV | PASS; active dispatcher, scope and canonical provider identity confirmed |
| Initial targeted Jest GUI/filter/helper tests | PASS: 49 tests across 3 suites |
| Initial GUI integration/decision/bridge Vitest tests | PASS: 77 tests |
| New malformed-input/configuration checks before production fix | Expected failures: both leaked source excerpts; prefix-diagnostics.log retained |
| Extended discovery against the first installed tarball | Expected failure: workflows/cross-platform missing; prefix-package-discovery.log retained |
| Initial cross-platform validator | FAIL before correction: manifest/documentation errors and zero count; validate-cross-platform.log retained |
| npm run lint | PASS |
| npm run build after final source changes | PASS |
| npm test -- --runInBand | PASS: 25 suites, 316 tests |
| Affected serial-worker Vitest run including decision and agent suites | 181 PASS, 1 FAIL: unchanged doctor check took 6,906 ms against its 5,000 ms limit |
| Original unchanged doctor check in isolation | PASS: 1,075 ms; separate evidence, not a repair of the earlier timeout |
| Final focused GUI/decision/bridge/documentation/drift Vitest run | PASS: 88 tests across 5 files |
| First full serial-worker Vitest run | PASS: 973 tests across 67 files, before the additional module metadata contract |
| npm run test:vitest -- --maxWorkers=1 after final module/test changes | PASS: 974 tests across 67 files, 128.60 seconds |
| Built CLI validate coding-standards/java and coding-standards/spring | PASS with existing URL/inline-example advisories |
| Built CLI validate workflows/cross-platform after corrections | PASS with existing long-description advisory; exact count 40,880 |
| Agent engineering scripts/validate.cjs | PASS: 87,100 characters, 8 templates, 4 graph shapes |
| Decision layer scripts/validate.cjs | PASS: 27 files, 117,091 characters |
| catalog --output cli/MODULES.md, then catalog --output cli/MODULES.md --check | Regenerated; PASS, up to date |
| openspec validate terminal-manager --type spec --strict --no-interactive | PASS |
| node --check scripts/verify-gui-package.cjs | PASS |
| npm pack --json --ignore-scripts and manifest/artifact inspection | PASS: explicit allowlist retained, all 47 module manifests included, local artifacts excluded |
| node scripts/verify-gui-package.cjs verified tarball, existing Node 16 executable | PASS: 31 installed Node 24.14.1 checks and 30 installed Node 16.20.2 checks |
| Existing Node 22.23.5 executable, same verifier in --consumer mode | PASS: 31 installed-consumer checks, including explicit offline execution |
| Windows actual TTY procedures | PASS within the scope described below |
| git diff --check; added-content punctuation and credential-pattern scan | PASS; no prohibited punctuation or credential patterns introduced |

The final tarball is test-artifacts/gui-2026-11-27/verified-package/mytechtoday-augment-extensions-3.3.0.tgz. Its SHA-256 is 86c28c9801670d752691aa0c24b7d6616e901d844cb76e35ae465478736c9502. Installed receipts are verification.json and node22-verification.json under C:\Users\kyle_\AppData\Local\Temp\augx GUI package 8sRBgx. These disposable local files are not package contents. The consumer checks cover discovery, all five module details, optional assets, future manifest discovery, filtered lifecycle/refresh, cancellation, privacy diagnostics, exports, mirrors and hand-edit protection. Node 22/24 additionally execute explicit offline examples; Node 16 ordinary management does not claim bare Node 16 decision execution.

The affected-run failure is the documented bd-zqy2 readiness timing problem. Its unchanged isolated check passed, and both later full serial-worker runs passed. All attempts remain recorded; no timeout, assertion, retry policy or runtime policy was weakened. bd-zqy2 received the fresh timings and log locations. A green run does not establish repeatability.

One first attempt to run the consumer regression used a nonexistent disposable consumer directory and stopped at chdir before testing discovery. That harness setup failure is retained in prefix-package.log. After creating the directory, the actual missing-module assertion failed as intended. It was not counted as product evidence until that assertion ran.

## Acceptance and material-risk matrix

PASS describes the stated local evidence only.

| Requirement or risk | Test level | Positive or negative path | Expected result | Verification status |
|---|---|---|---|---|
| AC1: four named module identities, metadata and packaged assets | Source prompts, tarball inventory, installed consumer | Positive | Correct canonical IDs, names, versions and purpose | PASS |
| AC2: JAVA/java, Spring Boot, Jev, TypeSafe, decision-layer, agent-engineering, harness, loops, graphs | Shared production search, built CLI and GUI prompts | Positive and mixed case | Find actual metadata and tags | PASS |
| AC2: future module, duplicate display names, optional metadata | Disposable installed fixture and source prompt tests | Boundary | No registry edits; canonical identity selects the intended module | PASS |
| Other recent additions, including cross-platform | Package parity and production validators | Positive and pre-fix negative | All 47 source manifests ship; newly shipped guide validates | PASS |
| AC3: details, real files, persisted linking/unlinking and refreshed badges | Production prompts, filesystem, actual TTY | Positive and repeated actions | Canonical content; accurate refreshed links | PASS |
| AC3: filtered changes, pinned/unavailable siblings, cancellation | Source/installed prompts and actual TTY | Negative | Preserve unrelated state and cancelled bytes | PASS |
| AC4: all nine decision operations and project scope | Prompt seam through authoritative bridge | Positive | Relevant validated arguments only | PASS |
| AC4: setup plan before explicit install; cancelled/failed installation; removal ownership | Controlled prompt executor plus existing real SDK/installer suite | Positive and negative | No implicit installation; truthful failures; retain edits/run data | PASS locally; new network installation NOT RUN |
| AC4: offline provenance | Actual subprocess, installed consumer and TTY | Positive | Eleven fixtures labeled offline; no provider verification claim | PASS |
| AC4: live activation, explicit budgets, missing credentials and provider failures | Prompt tests, runtime policy tests and actual SDK loopback | Positive dispatch and negative outcomes | No fallback, extra permission or unbounded requests | PASS locally; external provider NOT RUN |
| AC4: exact persisted digest, original state, accounting and independent verification | Actual runtime and existing decision suite | Positive and negative | Reject stale approval; retain attempts, requests and deadlines | PASS locally |
| AC5: agent contracts/templates/loops/graphs/local validation | Canonical static assets, validator and agent suite | Positive | Guidance accessible without claiming a service | PASS |
| AC6: invalid IDs/options/scopes/JSON and absent/malformed configuration | Production validation and prompt integration | Negative | No dispatch or corruption; recoverable diagnostics | PASS |
| AC6: malformed JSON privacy | Pre-fix failures and final production prompt/packaged validation | Negative | Omit file excerpts; preserve bytes and return to menu where possible | PASS |
| AC6: write denial, dependency block and partial operation failure | Controlled filesystem fault through real lifecycle | Negative | Preserve denied bytes, report counts, continue independent work | PASS controlled; actual OS ACL denial NOT VERIFIED |
| AC6: missing assets/runtime, subprocess error and provider errors | Bridge fault seam and real SDK loopback | Negative | Useful failure with no silent mode switch or parent-menu exit | PASS locally |
| AC6: structured arguments, Unicode, redaction and cancellation | Controlled bridge streams/processes; real runtime and TTY | Negative and boundary | shell:false; no secret excerpts, listener leaks or budget refunds | PASS within tested process ownership; arbitrary detached workers NOT VERIFIED |
| AC7: collections, skills, legacy config and intentional exclusions | Full Jest/Vitest regression suites | Positive and negative | Existing supported behavior retained | PASS |
| AC7: exports/mirrors, hand edits, MCP-first lookup and static content | Existing full suites and installed consumer | Positive and negative | Deterministic static guidance; protected edits retained | PASS |
| AC7: ordinary Node >=16 compatibility versus optional Node 22+ execution | Installed consumer and actual Windows TTY | Positive | No eager SDK/runtime import for ordinary management | PASS on tested Windows runtimes; other OS NOT VERIFIED |
| AC8: lint/build/catalog/module/spec/package checks | Actual repository gates | Positive | Current build, valid affected modules and correct package | PASS |
| Many modules, short terminal and whitespace | Existing source prompt/helper tests | Boundary | No lost canonical choices; bounded pagination; blank GUI search cancels | PASS automated at 40 columns/12 rows; physical narrow window NOT VERIFIED |
| Windows diagnostic/deletion test repeatability | Recorded affected/full/isolated runs | Timing boundary | Preserve failures and distinguish later green runs | Known doctor intermittence remains bd-zqy2; no repeatability claim |
| Production, provider quality/cost, external connectivity and other platforms | External evidence | Outside local validation | Preserve unknown values and evidence limits | NOT VERIFIED |

## Actual terminal evidence and limits

An actual Windows PTY reported stdin/stdout TTY=true, 80 columns and 24 rows. On Node 24.14.1, arrow-key navigation opened mixed-case JAVA search, selected Java, reviewed and applied a filtered link, and returned to refreshed Java/Python checked badges. The pinned Python 0.7.0 record and settings survived. Enter on the unchanged selection made no change; blank search cancelled. The decision menu explicitly selected offline examples, confirmed the project and identity, produced all eleven offline results, and returned to the main menu. No decision software directory was installed. Ctrl+C ended this PTY with process status 1; this is an observed exit, not a claim of successful status 0 or child-cancellation coverage. Existing bridge/runtime tests cover owned-child cancellation separately.

On Node 16.20.2, the actual Inquirer menu rendered in the same project and arrow-key Exit selection returned status 0. Its broader ordinary lifecycle evidence comes from installed prompt tests. No optional execution on bare Node 16 is claimed. The retained receipt is test-artifacts/gui-2026-11-27/tty-evidence.json.

Live paid inference, production credentials, external provider requests, new decision SDK/runtime installation, global software installation, npm publication, actual OS ACL denial, physical narrow-window rendering and other operating systems were NOT RUN. Browser/device checks were NOT RUN because no active browser frontend changed. The existing local decision SDK prerequisite was reused by the plain Vitest suite, including loopback transport checks; npm run test:decision was not run because it would reinstall that prerequisite. Loopback results do not verify provider connectivity or quality.

## Remaining scope and rollback

No separate implementation gap was left from this change. Existing Windows test-reliability work remains bd-zqy2; its specific scoped prompt, inputs, acceptance checks and evidence limits are already [refined once](gui-windows-test-reliability-follow-up.md) using the requested template. It was not re-refined or executed here. The current task only reproduced its known boundary and updated its evidence. No new follow-up prompt or unsupported production task was invented.

Revert the commit carrying bd-m83j, then run npm run build. This reverses the source, guidance, catalog and future package changes without deleting project configuration, runtimes or run data. Existing installed consumers are unaffected until they install a new package. For an intentional project-level reversal, use the existing unlink command and its mirror protections; removing operational decision software remains a separate explicit decision remove action. No package was published and no version rollback is required.

The unrelated untracked .agents/ directory and pre-existing ignored state were preserved. The stash list was empty and no stash was cleared. Native Beads synchronization and source push are finalized through the repository's session workflow; their observed outcomes are recorded in the final handoff.
