# Windows verification reliability follow-up

Tracking: bd-zqy2, open. This separate follow-up was not implemented during bd-lluw.

Refined once on November 26, 2026 using the [requested refinement template](https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md), with the concrete Windows test-reliability request substituted for its request placeholder. Retrieval succeeded. No recursive refinement was performed.

```prompt
You are a senior TypeScript test engineer and Windows process/filesystem reliability engineer working in C:\GitHub\augx\augment-extensions.

Objective: make the existing Windows readiness-diagnostic and concurrent-collection-deletion tests deterministic while retaining meaningful behavioral assertions, production safety contracts and honest evidence. Implement the smallest justified correction after diagnosis. This is the separately recorded bd-zqy2 follow-up to terminal-manager integration bd-lluw.

The request is: "Stabilize Windows readiness and concurrent-delete test fixtures without weakening valid tests, changing decision runtime policy, or hiding process and filesystem failures."

Observed evidence

During terminal-manager verification on Windows, Node 24.14.1, one full Vitest run passed 970 tests but the unchanged test named "diagnoses unavailable optional software without activating it" exceeded its five-second default at 6.27 seconds. The original test immediately passed alone in 1.02 seconds. Another full run passed all 70 decision tests, including doctor, but "should handle deletion during concurrent operations" failed with Windows EPERM while two fs/promises.rm calls targeted the same disposable collection directory. The original collection-deletion file then passed all 18 tests unchanged in isolation. A later full run passed all 971 tests across 67 files. Therefore a green retry does not establish deterministic behavior, and these observations do not establish a GUI regression or a particular filesystem-lock cause.

Read docs/reports/gui-integration-2026-11-26.md. When still available, inspect test-artifacts/gui-package/vitest-doctor-timeout.log and vitest-concurrent-delete.log, alongside vitest-final.log. These local ignored logs may be absent in another checkout; their absence requires fresh reproduction, not invented results. The earlier failures did not justify disabling assertions, increasing timeouts, skipping tests, changing runtime policy or implementing a separate diagnostic system.

Scope and inspection

1. Inspect Git status, diffs, ignore rules, applicable AGENTS.md files, package scripts, Vitest configuration, linked rules, .augment/COMMAND_HELP.md and .augment/coordination.json before edits. Preserve unrelated files, worktrees, stashes and ignored installations. Query tracking through the supported repository mechanism. Native bd may still refuse the legacy Dolt workspace; preserve its database and use the documented append-only helper when appropriate. Do not initialize or migrate it implicitly.
2. Trace tests/decision-layer.test.ts, augment-extensions/workflows/decision-layer/runtime/install.cjs, and the runtime's existing process and path helpers. Inspect detect, doctor, execute, runtime/npm discovery, optional host version probes, subprocess timeouts and environment handling. Determine which real external executables are invoked, their argument arrays, elapsed times, exit statuses and cleanup behavior. Record sanitized observations without credentials.
3. Trace tests/unit/collections/delete.test.ts and tests/helpers/test-env.ts. Establish whether the concurrent-deletion test exercises Augx behavior, fixture lifecycle behavior or only the Node filesystem API. Inspect the resolved disposable paths and the ordering of creation, both removal calls, test assertions and cleanup. Do not assume antivirus, ACLs or another process caused EPERM without supporting evidence.
4. Reuse existing fixtures, process seams and Windows retry utilities where their contracts fit. Identify actual runner versions and installed optional prerequisites. Distinguish source/unit checks, real subprocess checks, installed-SDK loopback tests and external-provider evidence.

Diagnosis and implementation

Reproduce each problem narrowly before editing where practical, then compare serial and full-suite execution. Separate deterministic behavior assertions from dependence on uncontrolled local host startup time. If the defect is in a fixture, correct the fixture at that boundary. If production code is implicated, demonstrate the production defect and explain the smallest necessary change before implementing it. Existing permission, installation and runtime policy must remain authoritative.

Keep ordinary Augx startup independent of optional SDK loading. Do not install software simply to discover readiness. Preserve the separate meanings of installed software, valid configuration, available credentials, unknown connectivity and enabled live execution. Use controlled dependencies for unit-level version-probe outcomes, while retaining real process integration evidence for executable selection and failure handling. Do not replace every subprocess check with mocks.

For concurrent deletion, retain the required final state and prove unrelated paths survive. Any retry must be bounded, justified by observed transient errors, and limited to the correctly resolved disposable target. Persistent denial must remain a failure. Do not silently catch every rejection, replace Promise.all with unconditional success, remove concurrency, or assert only that a callback ran. Verify absolute targets remain inside the intended temporary workspace before recursive deletion or movement. Never enumerate paths in one shell and pass destructive commands to another shell.

Do not raise timeouts or performance thresholds merely to obtain green output. A proposed correction to a mistaken timing contract requires explicit evidence of the intended contract and a bounded acceptance procedure; preserve the behavioral assertions. Do not add unconditional sleeps, automatic reruns that hide the first failure, global environment changes, dependencies or a framework migration. Avoid modifications to unrelated tests and generated module assets. If authoritative module files must change, apply their existing metadata/count validation requirements without broad churn.

Required verification

Add or adapt only meaningful checks for the diagnosed boundaries. Cover successful and unavailable local executables, malformed or failing version output, child timeout/error cleanup, persistent filesystem denial, legitimate transient recovery if introduced, concurrent deletion, repeated operations, and preservation of unrelated files. Use project paths with spaces and Unicode where path or process handling changes. Keep controlled negative paths deterministic and independent of installed optional host tools.

Run the narrow affected tests first, then the decision and collection suites, relevant lint/build checks and the full Vitest suite using checkout-derived commands. Retain real installed-SDK checks when their prerequisites are available and report when they are unavailable. Record at least three serial full-suite runs on the available Windows environment as a bounded repeatability procedure. Preserve every failed attempt and its cause; a retry is separate evidence rather than proof that the original failure did not occur. Do not keep rerunning indefinitely without investigating repeated failures.

Acceptance criteria

1. Each observed failure has either a reproduced, corrected cause or an explicit evidence-backed limitation that prevents completion claims.
2. Unit behavior remains reliable when optional host executables are absent, slow, malformed or fail, with truthful readiness fields and no provider invocation.
3. Concurrent deletion asserts the intended supported contract, removes only its owned target and preserves unrelated files; persistent denial still fails.
4. Process listeners, timers, workers and fixture paths do not leak after success, timeout, cancellation or failure.
5. Valid policy, ownership, path containment, SDK isolation, budget, review and verification assertions remain intact.
6. The bounded Windows repeatability procedure passes without hidden retries, skipped cases or unexplained threshold changes.
7. Changes remain focused, dependency/version conventions are preserved and unsupported cross-platform or provider conclusions are explicitly unverified.

Completion and reporting

Update bd-zqy2 and coordination records, then follow the repository's authorized commit, synchronization, push and remote-verification workflow. Preserve unrelated work and stashes and never force-push. Disclose the exact legacy Beads synchronization failure if it remains; do not migrate its store to make this task appear complete.

Finish with the diagnosed causes, changed files and purposes, commands and outcomes, repeatability evidence, remaining limits and rollback instructions. Include a matrix with these columns: Requirement or risk; Test level; Positive or negative path; Expected result; Verification status. Distinguish controlled tests from real process, SDK, provider and other-platform evidence. Do not claim checks ran when they did not. Do not run paid inference, use production credentials, publish packages or install global software for this follow-up. Record genuinely separate remaining scope without executing it or starting recursive prompt-refinement work.

Do not use em-dashes in any generated content, documentation, comments, test descriptions, summaries, or other written output.
```
