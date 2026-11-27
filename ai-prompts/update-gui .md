```prompt
You are a senior TypeScript CLI engineer, terminal-interface designer, and test-automation engineer working in C:\GitHub\augx\augment-extensions.

Update the Augx GUI and supporting application so recent additions, including Java, Spring, Jev, and agent-engineering, are discoverable, understandable, manageable, and usable through the existing product. Inspect, diagnose, implement, test, and verify the changes directly. Deliver working integration rather than a plan or disconnected demonstrations.

## 1. Preserve the request and establish scope

The request is: "Update the Augx GUI and application to accommodate the recent additions, such as JAVA, Spring, Jev, and the agent-engineering modules."

1. Treat these additions as the minimum coverage, then inspect other recent module additions for the same integration gaps.
2. Preserve existing modules, collections, skills, project configuration, pinned versions, and supported command behavior.
3. Improve the existing terminal GUI. Do not introduce a browser application, framework migration, new orchestration platform, or unrelated redesign.
4. Integrate existing capabilities without rebuilding their runtimes or expanding their documented guarantees.
5. Proceed autonomously when repository evidence resolves a choice. State material assumptions and ask only questions that actually block correct implementation.

The following are inspection anchors from the current checkout. Revalidate them before editing:

| User-facing addition | Canonical module ID | Integration meaning |
|---|---|---|
| Java | coding-standards/java | Java Coding Standards; manifest name java-standards |
| Spring | coding-standards/spring | Spring Framework and Spring Boot Standards; manifest name spring-standards |
| Jev / TypeSafe | workflows/decision-layer | Decision Layer Workflow; Jev is a provider capability within this module |
| Agent engineering | workflows/agent-engineering | Agent Engineering Workflow; scoped agents, harnesses, bounded loops, durable graphs, contracts, and verification |

Do not create a duplicate module named jev or confuse linking guidance with installing or activating operational software.

The checkout already contains terminal-manager integration for these additions. Read docs/reports/gui-integration-2026-11-26.md and openspec/specs/terminal-manager/spec.md, then verify the current source and behavior. Prior reports describe historical evidence, not checks executed in this session. Complete demonstrated remaining gaps and preserve working integration. If an acceptance criterion already passes, retain and verify it rather than manufacturing a replacement.

## 2. Inspect instructions, architecture, and actual behavior

1. Read applicable AGENTS.md files, README.md, module-development.md, package manifests, lockfiles, VERSIONING.md, ignore rules, and relevant specifications. Inspect Git status and diffs first; preserve all unrelated staged, unstaged, untracked, and ignored work.
2. Consult .augment/COMMAND_HELP.md, then verify relevant syntax with current checkout-local help. Check linked modules, inspect applicable rules, and inspect .augment/coordination.json and related Beads records. Follow repository tracking and OpenSpec requirements. Architectural changes require the prescribed proposal, deltas, and tasks.
3. Establish the active entry point and runtime dependencies. cli/src/commands/gui.ts delegates to gui-module-manager.ts using InteractivePrompt/Inquirer. React, Ink dependencies, GUI helpers, types, state files, and design documents do not establish that a separate renderer is active.
4. Trace discovery through rendering, selection, search, link/unlink, persistence, command execution, and refresh. Inspect cli/src/cli.ts; commands/gui.ts, gui-module-manager.ts, gui-decision.ts, decision.ts, list.ts, search.ts, show.ts, link.ts, unlink.ts; utils/module-system.ts, gui-helpers.ts, interactive-prompt.ts, extensions-config.ts, modules-catalog.ts, decision-runner.ts; types/gui.ts; and gui/state/ under cli/src/.
5. Read the four module manifests, READMEs, relevant rules, examples, validators, and decision-layer runtime contracts. Inspect cli/docs/GUI_ARCHITECTURE.md and GUI_CONFIGURATION.md critically, distinguishing proposals and placeholders from implemented behavior.
6. Reuse existing tests, including cli/src/commands/__tests__/gui.test.ts, gui-repo-filtering.test.ts, __tests__/gui/gui-components.test.ts, tests/gui-integration.test.ts, tests/gui-decision.test.ts, tests/decision-bridge.test.ts, tests/agent-engineering.test.ts, and tests/decision-layer.test.ts, with their actual runner configurations.

Use the checkout-local compiled CLI, node cli/dist/cli.js, after establishing its build is current. An installed global augx may refer to another package version.

## 3. Diagnose gaps before changing them

Create a compact working matrix covering each recent addition against discovery, display, search, details, linking, unlinking, applicable operational actions, documentation, and packaged availability. Confirm gaps through code and reproducible behavior; existing coverage may already satisfy some requirements.

Identify causes such as inconsistent identity handling, missing metadata propagation, stale catalogs, inactive helpers, incomplete command integration, filtering, or stale state. Do not assume the four modules are absent simply because they were recently added. Fix confirmed gaps across all affected paths using the smallest coherent change.

## 4. Make discovery and search consistent

1. Use canonical manifest discovery and metadata rather than a separate hard-coded registry or GUI-only copies of module content. A valid future module must appear without editing a fixed list of these four additions.
2. Preserve canonical fullName IDs for actions and persisted state. Display names, manifest names, versions, descriptions, tags, categories, priorities, and character counts must retain their actual meanings.
3. Make GUI search find relevant modules case-insensitively by canonical ID, manifest name, display name, description, and actual tags. Cover JAVA/java, Spring/Spring Boot, Jev/TypeSafe/decision-layer, and agent-engineering/harness/loops/graphs using source metadata. Preserve the CLI's documented search behavior.
4. If helpers are used, preserve real tags through their data transformations. Do not substitute a type/category value for the tags field. Reuse a shared search path when appropriate without introducing a speculative search framework.
5. Preserve intentional repository filtering, including existing writing-standards exclusion and invalid-collection handling, unless an explicit requirement requires a justified change. Do not silently expose unavailable modules or remove unrelated configured entries.

## 5. Complete module-management workflows

1. Present readable module choices and details with identity, purpose, version, linked state, and supported usage. Provide access to canonical rules, examples, templates, or their existing display commands without duplicating their contents.
2. Java and Spring remain independently selectable standards modules. Explain their complementary roles without inventing an installation dependency, requiring a JDK for browsing, or forcing them to link together.
3. Make agent-engineering contracts, templates, bounded-loop examples, graph examples, and local validation guidance discoverable through the existing interface. Respect its documented executable boundaries; do not invent an agent service or arbitrary script runner.
4. Route mutations through existing link/unlink and collection facilities. Preserve version and ownership semantics, unrelated configuration, and mirror/export protections.
5. Treat selections from a filtered result set as changes only to that managed set. Searching for and linking Java must never unlink an already linked module outside those results. Cancellation and repeated unchanged selections must have no unintended effects.
6. Refresh discovery and linked state after successful mutations. Show accurate partial failures and recoverable next actions rather than unconditional success messages or stale badges.

## 6. Connect the existing Jev workflow

Make the existing decision command operations reachable from an understandable workflow menu: setup, doctor, decide, run, resume, evaluate, examples, inventory, and remove. Reuse the authoritative command/service implementation and validation. Do not duplicate provider, installer, budget, approval, recovery, or worker logic inside GUI callbacks.

1. Separate viewing/linking the module, inspecting a setup dry run, explicitly installing dependencies, diagnosing readiness, executing offline fixtures, and explicitly invoking live work.
2. Collect only operation-relevant inputs using the existing contracts: selected project scope, supported host, input file, run identity, offline/live mode, request budget, and exact persisted review digest where applicable. Validate required combinations before dispatch.
3. Expose setup planning before installation. Show the concrete scope and supported installation choices. Browsing, searching, viewing help, and linking static guidance must not install software, provision runtimes, contact providers, or execute workers.
4. Distinguish software installed, configuration valid, credentials available, provider connectivity verified, and live operation enabled. Preserve unknown values. Missing credentials must yield actionable diagnostics without preventing ordinary module management or offline use.
5. Label offline fixtures explicitly. Live execution needs the existing explicit activation and bounded request settings. Never silently switch modes or report fixture results as provider verification.
6. Keep review/resume bound to the persisted action digest and original state. Preserve consumed budgets, deadlines, independent verification, ownership checks, and cancellation behavior. Display meaningful statuses and failures without weakening policy.
7. Removal must retain the runtime's existing ownership and edited-file protections. Unlinking guidance and removing operational software must remain distinct actions.

Preserve optional SDK/runtime isolation. Ordinary Augx startup and module discovery must not eagerly load TypeSafe or inherit the optional runtime's higher Node requirement. Revalidate ordinary Node >=16 compatibility separately from optional decision execution on Node 22+. Provider judgments cannot grant permissions or prove task completion.

## 7. Preserve terminal usability and safe execution

1. Keep menus keyboard-operable with clear labels, selection feedback, back/cancel behavior, sensible pagination, and readable output at ordinary and narrow terminal sizes. Do not advertise shortcuts that are not implemented.
2. Keep project context visible before mutations. Reuse canonical project/configuration resolution, including ancestor behavior where supported, and handle paths containing spaces and Unicode.
3. Handle absent initialization, malformed configuration, empty results, missing assets, permission failures, partial setup, unavailable runtimes, subprocess errors, and non-interactive terminals explicitly.
4. Honor Ctrl+C and existing child-process cleanup; avoid leaked listeners, orphaned workers, misleading success, or commands unexpectedly terminating the parent menu. Use structured argument arrays and shell:false where subprocesses are needed. Never interpolate input into shell command strings.
5. Redact secrets from prompts, output, logs, receipts, and artifacts. Do not request API keys in chat, persist them in GUI settings, or expose credentials when displaying readiness.
6. Browsing metadata must not execute module-supplied commands. Validate identifiers, paths, input schemas, and project boundaries at the existing trust boundaries.

## 8. Integrate documentation, packaging, and compatibility

Update active user guidance and command help for the implemented workflows. Reconcile README.md, modules.md, cli/MODULES.md, relevant GUI guides, specifications, package assets, and generated outputs only where affected. Verify catalogs through their actual generator, including catalog --output cli/MODULES.md --check.

Preserve npm's explicit files allowlist, static-only export/mirror boundaries, hand-edit protections, and MCP-first live-task lookup. Do not embed runtime files, credentials, task snapshots, or live statuses into exported static guidance. Reuse existing behavior rather than broadening export content.

Do not bump versions gratuitously. If a version change is necessary under repository policy, edit the canonical VERSION and run the prescribed synchronization. Preserve declared Augx runtime compatibility, deterministic offline use, and current dependency conventions. Add dependencies only when necessary and justified.

## 9. Add behavior-based tests

Use isolated temporary projects and existing Jest/Vitest conventions. Test production functions and real integration boundaries with controlled dependencies. Keep tests deterministic, order-independent, and focused on observable behavior.

1. Positive paths: all four real modules discover and display correctly; documented queries find them; details resolve; linking/unlinking persists and refreshes; decision actions dispatch the correct validated inputs; offline execution produces clearly identified results.
2. Negative paths: invalid IDs, malformed or absent config, missing assets, unavailable runtime, missing credentials, invalid option combinations, provider/subprocess failure, installation failure, and rejected review digests produce truthful outcomes without unintended mutations or provider calls.
3. Boundaries: empty/whitespace and mixed-case searches, missing optional metadata, duplicate display names with distinct IDs, many modules, narrow terminals, paths with spaces/Unicode, repeated actions, cancellation, and legacy config remain predictable.
4. Regressions: filtered selection preserves linked modules outside results; future valid modules appear without registration edits; intentional exclusions and collections still work; skill browsing, existing links, exports, mirrors, and ordinary startup remain intact.
5. Integration: exercise the actual prompt/command flow with the injectable prompt seam and temporary filesystem state, then smoke-test built/package-consumer behavior. Assert that browsing and static linking perform no SDK installation, provider access, or worker execution.

Demonstrate a pre-fix failure for each confirmed defect when practical. Never weaken valid tests, hide failures with mocks, or replace integration proof with assertions about menu strings. Map every acceptance criterion and material risk to a meaningful test or explicit verification procedure.

## 10. Verify the implementation

Run targeted GUI/search/lifecycle tests first, then affected decision and agent-engineering checks, lint, type/build checks, module validators, catalog checks, package inspection, and broader suites where justified. Derive commands from the checkout. Use npm run lint, npm run build, and the existing test scripts where applicable.

Smoke-test discovery and the GUI from a disposable packed consumer, including all four modules and optional assets. Verify ordinary startup on declared supported Node versions when runtimes are available, separately from decision-layer's optional execution runtime.

Consult docs/reports/gui-windows-test-reliability-follow-up.md if readiness timeouts or concurrent-delete failures recur. Reproduce and distinguish baseline fixture problems from changed behavior; retain failed attempts and never weaken assertions or hide failures behind retries.

Exercise a real interactive TTY for navigation, filtering, mutation refresh, cancellation, and offline workflows when available. This is terminal software; browser screenshots do not prove its interaction behavior. Report automated prompt tests, actual TTY checks, and any genuinely discovered additional frontend checks separately. Test any active frontend you change using its existing harness.

Do not install global software, run live paid inference, use production credentials, or publish a package merely to validate this change. Mark unavailable checks NOT RUN and unsupported conclusions NOT VERIFIED, with precise reasons. Never claim unexecuted checks passed.

## 11. Acceptance criteria

1. Each named addition appears with its canonical identity and accurate metadata through installed/package-consumer discovery and the GUI.
2. The specified queries find the correct modules; a newly added valid fixture module is discovered without a manual registry change.
3. Module details and usage are accessible; valid link/unlink changes persist and refresh; filtered operations and cancellation preserve unrelated state.
4. Existing Jev decision operations are reachable with validated inputs, correct project scope, explicit offline/live provenance, safe setup/removal, and existing policy enforcement.
5. Agent-engineering guidance and supported examples are accessible without claiming an unimplemented execution platform.
6. Invalid inputs and operational failures produce accurate diagnostics without corruption, secret exposure, unintended installation, provider requests, or permission escalation.
7. Existing modules, collections, skills, config compatibility, runtime isolation, exports, and mirrors retain their supported behavior.
8. Relevant tests, build, catalog, and package checks pass. Any unavailable TTY, runtime, platform, or provider evidence is explicitly bounded; incomplete validation is not reported as full verification.

## 12. Completion and report

Finish with a concise report containing outcome, verified root causes/design basis, changed files and purposes, important compatibility decisions, tests added, commands executed and results, unexecuted checks with reasons, remaining limits, and rollback guidance.

Include this test matrix, covering every acceptance criterion and material risk:

| Requirement or risk | Test level | Positive or negative path | Expected result | Verification status |
|---|---|---|---|---|

Complete required issue/coordination updates and the repository's commit, synchronization, push, and remote-verification workflow within current authorization. Preserve unrelated work and stashes; never force-push. If legacy Beads/Dolt tooling blocks synchronization, disclose the exact failure and preserve its database rather than performing an implicit migration.

Express genuinely separate unresolved work as specific follow-up prompts with scope, inputs, acceptance checks, and evidence limits. Refine each once using [the prompt-refinement template](https://raw.githubusercontent.com/mytech-today-now/prompt-refined/refs/heads/main/highest-quality-most-effective-prompt-possible.md), inserting that follow-up between its software development request markers. Disclose retrieval failures, avoid recursive refinement, and do not execute separate follow-ups without authorization. Do not invent follow-ups when none remain.

Do not invent repository contents, APIs, commands, execution results, or compatibility evidence. Do not leave placeholders, conceal failures, disable validation, silently change requirements, or report completion while relevant checks fail.

Do not use em-dashes in any generated content, documentation, comments, test descriptions, summaries, or other written output.
```
