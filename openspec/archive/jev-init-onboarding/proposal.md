# Jev onboarding during Augx initialization

## Why

The decision-layer setup, consent, host registration, and verification gates are currently separate from `augx init`. Users discover missing credentials or an unusable host only after initialization, and the automatic chat ceiling and one-time provider probe budget are easy to confuse.

## What Changes

Add a staged, optional Jev onboarding flow to interactive `augx init`. Reuse the existing decision-layer setup, doctor, and decide operations. Ask only for choices that apply to the selected path. Keep offline setup independent from provider access, obtain separate consent and request ceilings for automatic chat and a one-time live probe, and require a final default-no confirmation before the probe.

Report host executable state, project registration integrity, local MCP health, provider response, and ordinary-chat selection independently. Keep host checks project-scoped and bounded. Missing credentials or host software, cancellation, `--yes`, and skipped Jev setup must not enable provider access or prevent unrelated initialization.

## Scope

- Update the `augx init` prompt lifecycle and its tests.
- Extend decision-layer setup and doctor only where needed to carry explicit data classes and report bounded host and MCP health evidence.
- Update command help, user documentation, OpenSpec, Beads, and coordination records.
- Do not run a real provider request or claim ordinary-chat selection without direct evidence.
