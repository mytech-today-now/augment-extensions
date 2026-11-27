# Terminal manager architecture

The active entry point is `cli/src/cli.ts` -> `commands/gui.ts` -> `commands/gui-module-manager.ts`. Rendering uses the injectable `InteractivePrompt` interface and a lazily imported Inquirer. React/Ink dependencies, helper configuration types, localStorage state helpers and earlier CSS/component sketches do not activate another renderer.

## Discovery and state

Each main-menu iteration calls canonical `discoverModules` and `discoverCollections` and reads the selected project configuration. There is no fixed module registry or GUI copy of module content. Full canonical IDs identify actions, selections and persisted links. Writing standards remain excluded; collections with empty, invalid or unavailable module sets stay hidden. Unavailable configured entries remain in the file.

`moduleMatchesSearch` provides CLI and GUI substring matching for IDs, manifest/display names, descriptions, types and actual tags. The GUI treats blank search as cancellation. CLI blank search retains list-like matching. GUI helper transformations also preserve actual tags independently of type and category.

The manager uses the existing ancestor project resolver. `--project` or Change Project Scope chooses an explicit scope. No separate GUI settings or persisted navigation state controls this flow. Terminal height bounds module pagination; Inquirer wraps long choices at the terminal width. Canonical identity remains visible.

## Static details and mutations

Details show manifest metadata and the linked version separately. Existing file enumeration and realpath containment provide read-only access to README, rules, examples, templates, schemas, validator source and typed runtime contracts. Choosing a file only reads it. No module-supplied command is executed. Files above 1 MiB direct users to open the canonical file in a text viewer.

Checkbox changes are restricted to the displayed canonical IDs. A summary and default-no confirmation precede writes. Link/unlink services share the existing CLI implementation and mirror protections but throw errors to interactive callers. Existing CLI wrappers retain exit behavior. Independent operations can succeed after another fails; the summary reports both counts and the next menu iteration reloads actual state. Dependency blocks are retained without implicit force. Existing linked collection versions are preserved.

## Optional decision workflow

`commands/gui-decision.ts` collects operation-relevant choices and validates combinations and JSON syntax before calling `utils/decision-runner.ts`. The CLI decision commands use the same bridge. It starts the authoritative runtime using structured arguments and `shell: false`, forwards cancellation over IPC, bounds process cleanup, redacts output lines, returns the child exit code and removes signal listeners on close or spawn error.

The bridge imports no TypeSafe SDK. The existing runtime owns installation, schemas, policy, provider access, request reservation, review digest checks, original deadlines, worker execution, independent verification and receipt-based removal. The menu does not implement those mechanisms. Setup previews before installation; doctor makes no provider probe; offline/live provenance is explicit. A cancelled child reports cancellation rather than completion. Diagnostic unknowns are printed unchanged.

## Validation boundaries

Vitest prompt tests exercise real temporary project files and the isolated child boundary. Controlled process tests cover spawn errors, split-secret redaction and cancellation/listener cleanup. Jest retains GUI/filter/helper regression coverage. The packed consumer verifier checks actual installed assets, future manifest discovery, prompt navigation, lifecycle, static exports/mirrors and Node compatibility. Real TTY evidence and platform/provider limits are recorded separately in [the implementation report](../../docs/reports/gui-integration-2026-11-26.md).
