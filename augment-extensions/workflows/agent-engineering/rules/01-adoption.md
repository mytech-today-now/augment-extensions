# Responsibilities and Adoption

## Boundaries

- The harness supplies task boundaries, context access, tools, permissions, persistence, observations, and completion evidence.
- The loop decides whether to attempt work again using feedback, accumulated state, measured progress, and termination rules.
- The graph describes task decomposition, data dependencies, routing, joins, resource conflicts, and approval boundaries.

```text
authorized task -> harness -> graph node -> attempt -> independent check
                                          ^             |
                                          +-- feedback -+
check evidence -> accept | repair within budget | local handoff | stop
```

The model's tool-call cycle ends when the model ends its turn. An externally checked work cycle ends when its acceptance rule passes or a stop condition fires. A session restart restores compatible durable state. A recurring timer or webhook starts execution but supplies neither verification nor recovery. A separate improvement cycle changes the harness only after review and replay.

## Choose the Smallest System

1. Define one bounded outcome and a reliable check. If parsing, sorting, validation, deduplication, or routing has a deterministic answer, implement ordinary code.
2. Use a plain script for repeatable deterministic work. Keep a single short agent task in the current session when its result is easy to verify and interruption is cheap.
3. Add persistence when interrupted work must resume. Record revision, artifacts, decisions, rejected approaches, remaining allocation, and next action.
4. Add graph structure when steps have genuine data, write-ownership, resource, or policy dependencies. Name what every edge carries. Remove ordering that carries nothing.
5. Add agents only for independently scoped work or independent reviews whose value exceeds coordination cost. Reuse an agent for closely related context; use fresh contexts for independent reviewers or stale assumptions. A new conversation does not create a sandbox.

For example, normalize a list with code; use one agent to interpret an ambiguous issue; add a verifier with a separate rejection rubric when semantic judgment is necessary. Split several unrelated file areas only after assigning ownership and defining their integration evidence. A graph is useful even when one executor runs every node sequentially.

## Completion

Model confidence, a quiet log, and a reviewer saying yes are observations. Acceptance requires evidence for each contracted criterion. A passing schema proves shape; it does not prove that a research claim is supported or that a feature solves the user's problem. Verify the original failure and at least one deliberate defect before trusting a completion check.
