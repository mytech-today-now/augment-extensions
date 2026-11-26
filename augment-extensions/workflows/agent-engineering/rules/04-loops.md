# Bounded Execution and Recovery

## Work Cycle

```text
validate -> reserve shared allocation -> attempt -> independent check
check passed -> bind evidence -> verified success
check failed -> classify -> targeted feedback -> changed attempt
allocation used | stalled | cancelled | denied | unrecoverable -> receipt and handoff
```

- Set finite attempts, wall time, per-call deadline, stall threshold, child count, and measurable resource caps before execution. Example defaults: five attempts, five seconds, 750 ms per subprocess, twelve calls, two dry rounds, one worker. Reserve before dispatch, check remaining resources, and kill outstanding subprocess work on cancellation or timeout.
- A hard cap applies across children, retries, compaction, and restart. Never reset counters when changing agents or contexts. Downtime counts against a wall deadline. Provider adapters must track requests, input/output tokens, and monetary usage including failed attempts. Report caps that are advisory or cannot be enforced; unknown usage is not zero.
- Progress must measure distance to acceptance or new evidence. The fixture measures correctly positioned values. Keep best observed progress so oscillating candidates cannot reset stall detection indefinitely.
- Persist accepted and rejected approaches, normalized failure fingerprints, prior evidence, decisions, and next action. In discovery, deduplicate rejected findings too and terminate after the configured number of rounds with no new evidence.

## Failure Routes

| Class | Next action | Retry condition |
|---|---|---|
| Invalid arguments | Repair typed arguments within current authority | The invalid field changes |
| Transient fault | Bounded backoff and retry | The transient condition clears; counters remain shared |
| Missing context | Retrieve a named source or replan | Required context becomes available |
| Behavioral defect | Repair only the failing work unit | Specific expected/actual feedback guides a different candidate |
| Denied authority | Stop and hand off locally | New authority requires an explicit authorized contract |
| Repeated or unrecoverable failure | Stop or escalate | A reviewed change addresses the cause |

The reference directly executes transient, behavioral, denied, unrecoverable, cancellation, timeout, exhaustion, and stall paths. Invalid arguments fail preflight; missing context is a documented replan route, with no fabricated retrieval adapter.

Feedback contains the failed condition, location, expected result, actual result, failure class, and permitted repair scope. For example: expected ordered values a/b/c, actual c/a/a, candidate.json only. Do not rerun an unchanged defect without a relevant change. Retain valid sibling artifacts and recheck integrations affected by the repair.

## Durable Ownership and Receipts

1. Keep facts, decisions, progress, and proposed lessons separately. Facts include source identity and freshness; assumptions are labelled. The reference has explicit facts, decisions, accepted/rejected progress, and trace fields; lessons remain proposals for a separate review.
2. A single controller writes versioned atomic checkpoints and holds an exclusive lock. Resume checks schema, checksum, contract, policy, revision, candidate digest, and shared accounting. Preserve corrupt state instead of guessing repairs or refunding resources.
3. Emit structured run/node/attempt events, transitions, contract/artifact identities, check outcomes, failure classes, retry reasons, approval status, elapsed time, calls, and terminal outcome. Do not persist private reasoning or sensitive payloads.
4. Every executed terminal path produces a receipt: changed artifacts, checks actually verified, unverified behavior, remaining risk, and next owner/action. Non-success also writes to the configured local handoff destination. Preflight/ownership/corruption errors fail closed for operator inspection and do not overwrite untrusted state to manufacture a receipt.

A timer is a trigger, not recovery. Introduce scheduling only after verified execution, duplicate-trigger handling, ownership, and recovery are established and separately authorized.
