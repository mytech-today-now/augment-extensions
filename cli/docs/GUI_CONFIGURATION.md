# Terminal manager usage and scope

Run `augx gui` in an interactive terminal, or `augx gui --project "path with spaces"`. Without an explicit path the existing resolver uses the nearest ancestor `.augment/extensions.json` without crossing a Git boundary. The current scope is printed before actions. Change Project Scope accepts an existing directory. A project without Augx initialization can browse metadata and decision diagnostics; run `augx init` in that project before linking. Malformed configuration stops the manager without overwriting it.

The manager heading is followed by the installed Augx CLI version, read from the package metadata used by `augx version` and `augx --version`.

## Module workflows

- **Link / Unlink Modules** shows canonical IDs, available versions and linked badges. Space toggles, `a` toggles all, `i` inverts, Up/Down navigates and Enter opens a change summary. Apply or cancel there. Only the displayed IDs can change.
- **Search Modules** matches IDs, manifest/display names, descriptions, types and real tags without case sensitivity. Blank cancels. Manage the result links or open their details. Try JAVA, Spring Boot, Jev, TypeSafe, decision-layer, agent-engineering, harness, loops or graphs.
- **Browse Module Details and Usage** shows actual metadata and linked versions, then reads canonical content. Java and Spring link independently. The Java README explains language/platform practices; Spring explains framework practices. Agent Engineering exposes JSON contracts/templates, bounded loops, graphs and validator instructions as read-only files. Consult its README before explicitly running local fixtures in a disposable directory.
- **Link Collection** lists only available valid collections and previews new links. Existing linked versions stay pinned.
- **Browse Skills** retains the existing view, metadata validation and print/save injection flow. It does not automatically execute skill commands.

The session returns to the main menu and reloads state after an action. Partial failures include diagnostics; inspect configuration and mirror targets before retrying. Back/Cancel choices return without mutation. Ctrl+C exits a prompt session. No Ctrl+S, Ctrl+H, Ctrl+A or Ctrl+D binding is advertised by this manager.

## Jev / TypeSafe operations

Guidance is `workflows/decision-layer`; Jev is a provider capability within it. Viewing or linking the module does not install software or activate a provider.

| Menu operation | Inputs and behavior |
|---|---|
| Setup plan | Choose Codex or Claude Code skill host and automatic/portable Node choice. Runs setup --dry-run only. No downloads or writes. |
| Install software | Same choices, displays the actual plan, then requires default-no confirmation. Installs only through the existing pinned installer in the printed project. |
| Configure automatic chat judgments once | Choose Codex or Claude Code, save explicit public-data consent and a cumulative request ceiling, preview, then install native MCP registration and a companion implicit skill. Restart and trust/approve the project once in the host. No provider probe. |
| Disable automatic chat judgments | Disable saved runtime policy first, remove unchanged owned host entries and companion skill, retain edits and consumed requests. |
| Doctor | No credentials prompt or provider call. Reports software, config, credentials, connectivity and activation separately; unknowns remain unknown. |
| Decide | JSON capability input, explicit offline/live mode and probe identity. |
| Run | JSON task, mode and run identity. Runtime owns worker permissions, budgets and independent verification. |
| Resume | Existing identity and original mode; optional exact persisted review digest. Inspect the displayed review.json path before supplying its digest. No budget or deadline reset. |
| Evaluate | JSON labeled cases, mode and evaluation identity of at most 30 characters. |
| Examples | Explicit mode and identity for the eleven existing capability examples. |
| Inventory | JSON call inventory only; no mode or provider request. |
| Remove | Explicit confirmation; removes only unchanged receipt-owned software. Edits and run data stay. Does not unlink static guidance. |

Offline fixtures are deterministic runtime evidence, with provider connectivity/quality NOT VERIFIED. They require valid `.augx-decision/config.json` and Node 22+ or the separately provisioned runtime. Use the canonical module README/example config to prepare a disposable offline project; no SDK is loaded for ordinary module browsing. Missing config/runtime is reported as failure with diagnostics.

Live actions additionally collect a positive request budget, show scope/mode/identity/input and require explicit confirmation. The runtime checks the configured maximum, allowProviderData, credentials, schemas and all policy gates. Set TYPESAFE_API_KEY through your environment or secret manager; never enter keys into these menus. There is no silent fallback to offline. Doctor continues to report connectivity as NOT VERIFIED; inspect per-invocation results for actual provenance. Ctrl+C during a child requests cancellation and returns a cancellation outcome after process cleanup. Preserve saved state for recovery.

See the [canonical decision contracts and recovery guide](../../augment-extensions/workflows/decision-layer/README.md).

## Configuration status

The active Inquirer manager does not read `.augment/gui-config.json`, VS Code spacing settings, browser localStorage, CSS layouts or configurable fuzzy-search settings. Earlier GUI design/configuration examples described a proposed renderer. `types/gui.ts`, `utils/gui-helpers.ts` and `gui/state/` remain compatibility helpers, not an active alternative renderer. This change does not introduce new settings or dependencies.

Malformed project configuration stops the manager before any changes. Malformed decision input returns to the menu without dispatching an operation. JSON syntax diagnostics omit file contents; inspect and repair the local file, then retry. Read failures retain their filesystem diagnostics.

Non-interactive terminals receive a TTY diagnostic and do not open prompts. Use `augx list`, `search`, `show`, `link`, `unlink` or `decision <operation> --help` for scripted work. Node >=16 ordinary CLI compatibility is separate from the optional decision execution runtime's Node 22+ requirement.
