# terminal-manager Specification

## Purpose

Provide canonical module discovery, scoped link management, static guidance browsing and explicit isolated decision operations through the existing terminal manager.

## Requirements

### Requirement: Canonical module browsing and search

The terminal manager SHALL discover available manifests dynamically, retain canonical IDs, show real metadata and linked versions, and search IDs, manifest/display names, descriptions and actual tags case-insensitively. It SHALL provide static access to canonical guidance, templates and examples without executing module content. Existing exclusions and valid collection filtering SHALL remain.

#### Scenario: Future module and provider alias
- WHEN a valid future module is added or a user searches Jev
- THEN discovery needs no registration edit and the provider tag finds workflows/decision-layer.

### Requirement: Scoped reversible module management

The manager SHALL use existing lifecycle services, preserve unrelated and pinned configuration, limit checkbox changes to displayed IDs, offer cancellation, refresh after actions, and report partial failures without terminating the menu.

#### Scenario: Filtered selection
- GIVEN Python is linked and Java is the only search result
- WHEN Java is selected
- THEN Python remains linked and Java appears linked after refresh.

### Requirement: Explicit decision operations

The manager SHALL expose setup, doctor, decide, run, resume, evaluate, examples, inventory and remove through the authoritative isolated command bridge. Setup SHALL show its concrete plan before installation. Live mode SHALL require explicit activation and a positive bounded request budget. Resume SHALL pass the exact user-supplied persisted review digest without deriving or changing it. Runtime policy, ownership, budgets, deadlines and verification SHALL remain authoritative.

#### Scenario: Browse without optional software
- WHEN guidance is browsed, searched or linked
- THEN no SDK installation, worker or provider request occurs.

#### Scenario: Failed or cancelled operation
- WHEN a subprocess fails or is cancelled
- THEN its exit status is reported, listeners are cleaned up and the menu remains recoverable without claiming success.

### Requirement: Terminal and packaged compatibility

The manager SHALL resolve project scope using the existing ancestor resolver, use structured subprocess arguments with shell disabled, preserve optional SDK/runtime isolation and provide truthful non-TTY diagnostics. Packaged consumers SHALL contain module assets and the compiled manager.

#### Scenario: Missing configuration or runtime
- WHEN configuration is malformed or optional runtime assets are unavailable
- THEN mutation fails without corrupting configuration and diagnostics identify a recoverable next step.
