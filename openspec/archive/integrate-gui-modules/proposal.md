# Integrate recent modules with the terminal manager

## Why

The request is: "Update the Augx GUI and application to accommodate the recent additions, such as JAVA, Spring, Jev, and the agent-engineering modules."

Manifest discovery and the npm allowlist already contain all four additions. The active Inquirer GUI omits identity fields from search, can unlink unrelated search-excluded modules, exits after a mutation, has no module content browser, and does not expose decision commands. CLI search omits actual tags. GUI architecture/configuration guides describe inactive proposals.

## What Changes

- Keep manifest discovery, canonical IDs, repository exclusions, collections and skill browsing.
- Share metadata substring search across CLI and GUI, including tags.
- Add an iterative prompt session with refreshed state, safe scoped selection, explicit cancel, details and static asset browsing.
- Reuse non-exiting link/unlink services and the isolated decision process bridge. Expose setup planning before installation, diagnostics, explicit offline/live actions and protected removal.
- Correct active help and verify source and packed-consumer behavior without changing optional runtime policy, dependencies or package version.

## Impact

Governs cli/src/commands/gui.ts, decision.ts, link.ts, unlink.ts, related helpers, tests, documentation and package-consumer checks. Runtime contracts and static-only exports/mirrors remain authoritative. No browser renderer or arbitrary execution facility is added.
