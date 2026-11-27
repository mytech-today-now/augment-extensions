## ADDED Requirements

### Requirement: Saved-policy chat integration

Setup SHALL optionally register a project-owned native MCP tool and an implicitly discoverable skill for Codex or Claude Code. Eligible ordinary tasks SHALL reach the existing runtime through that tool without a user command. Registration SHALL preserve unrelated settings and edited owned files, report partial activation, support disabling and removal, and keep provider credentials out of files.

#### Scenario: Ordinary classification task
- GIVEN one-time host trust, tool approval and enabled saved public-data policy
- WHEN the agent reaches classification among supplied candidates
- THEN the host invokes the tool and receives validated typed judgments to continue its task.

### Requirement: Bounded automatic judgments

Automatic execution SHALL permit only configured classification and retrieval ranking, reject unknown context fields and prohibited data, reserve cumulatively across turns and processes before requests, suppress duplicate state, bound deadlines without automatic retries, honor cancellation and return explicit fallback outcomes without manufacturing provider answers. Advice SHALL grant no permissions and execute no actions.

#### Scenario: Restart or failure
- GIVEN a reserved request or previously evaluated state
- WHEN a process restarts or a provider fails
- THEN reservations remain consumed, duplicate requests are suppressed and unrelated work can continue using the normal fallback.

### Requirement: Evidence for host automation

Reports SHALL distinguish simulated agent choice, real host registration inspection, manual ordinary-chat execution and live provider execution. Static guidance alone SHALL NOT count as runtime activation evidence.

#### Scenario: No authorized provider check
- WHEN only protocol and host configuration checks are performed
- THEN manual chat selection and live provider behavior remain explicitly unverified.
