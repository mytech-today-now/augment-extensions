## ADDED Requirements

### Requirement: Init-time Jev onboarding
Interactive `augx init` SHALL offer optional Jev setup paths and preserve successful base initialization when Jev is skipped, cancelled, or blocked.

#### Scenario: Skip or cancel Jev setup
- GIVEN a project initialization
- WHEN the user skips or cancels Jev onboarding
- THEN Augx completes unrelated base initialization and makes no provider request

#### Scenario: Non-interactive initialization
- GIVEN `augx init --yes` or a non-interactive terminal
- WHEN initialization reaches Jev onboarding
- THEN it does not infer consent, approve a budget, enable automatic chat, call a provider, or install host software

### Requirement: Automatic chat consent
Automatic chat setup SHALL require an available supported host, an explicit data-class choice, and a positive cumulative request ceiling within the current policy limit.

#### Scenario: Automatic setup preserves accounting
- GIVEN explicit host, data scope, and cumulative ceiling choices
- WHEN automatic setup completes
- THEN it uses existing project-scoped setup and preserves existing request reservations
- AND setup makes no provider request

### Requirement: Internal data consent
Public context SHALL remain the default automatic data scope. Internal context requires its own explicit choice. Secrets and restricted data remain prohibited.

#### Scenario: Internal scope selection
- GIVEN the user selects automatic chat
- WHEN the user chooses `public,internal` and confirms the displayed scope
- THEN automatic policy stores both selected classes
- AND declining confirmation leaves automatic chat disabled

### Requirement: One-time live probe
A live probe SHALL use a positive caller-entered ceiling within policy, separate from the automatic ceiling. Init SHALL show the synthetic request, model, destination, and ceiling before a default-no final confirmation.

#### Scenario: Confirmed synthetic probe
- GIVEN a valid probe ceiling and available credential
- WHEN the user confirms the displayed sample in the same init invocation
- THEN Augx sends only that synthetic sample within the probe ceiling
- AND probe consent does not change saved automatic policy

#### Scenario: Rejected or incomplete live gate
- GIVEN a missing credential, invalid budget, denied consent, cancellation, or failed software check
- WHEN init reaches the live probe gate
- THEN no provider request is made and the live result remains NOT VERIFIED

### Requirement: Credential handling
Provider credentials SHALL be read from the execution environment and SHALL NOT be displayed, persisted, or passed as command-line arguments.

#### Scenario: Missing or available credential
- GIVEN the credential is absent or present in the execution environment
- WHEN init reports credential availability
- THEN it reports only AVAILABLE or MISSING and never prints the value

### Requirement: Host and initialization evidence
Init SHALL report host CLI availability, project registration integrity, and bounded local MCP health as separate states. Ordinary-chat model selection remains NOT VERIFIED without direct evidence.

#### Scenario: Missing or broken host
- GIVEN a host executable is absent or fails startup
- WHEN init reports host status
- THEN it distinguishes MISSING from BROKEN and offers an available host, offline continuation, repair guidance, or cancellation

#### Scenario: Registration and MCP evidence
- GIVEN project registration or local MCP checks run
- WHEN init prints its gate summary
- THEN each result is reported separately and no host check claims ordinary-chat selection
