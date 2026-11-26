# Agent Creation, Delegation, and Ownership

## Creation and Invocation

- Start from the agent and invocation JSON templates. Define purpose, allowed inputs and outputs, read/write paths, tools, permission ceiling, timeout, shared allocation, verification responsibility, termination rules, and local escalation destination.
- Keep the role definition independent of deployment configuration. An operator separately supplies executable identity, actual repository revision, provider configuration, credential references, and enforced host restrictions. Never put secrets in a role or work packet.
- Each work packet names its task, bounded scope, dependencies, relevant files, acceptance evidence, output schema, and owner. Validate the packet and intersect its paths, tools, allocation, and permissions with its parent's boundary before dispatch.

```json
{"task":"local-demo","owner":"worker-one","scope":["candidate.json only"],"dependencies":[],"acceptanceEvidence":["protected sorted-unique check"],"delegationDepth":0}
```

This excerpt is a planning aid; use the complete validated invocation template for execution.

## Optional Roles

| Role | Input and output | Writes and tools | Completion responsibility |
|---|---|---|---|
| Planner | Authorized task and source map -> bounded work packets | No implementation writes; read-only retrieval | Confirm dependencies, scopes, and feasible checks |
| Implementer | Packet and targeted feedback -> candidate | Only owned candidate paths and authorized tools | Supply artifact identity; cannot approve itself |
| Independent verifier | Contract and exact candidate -> rejecting or accepting evidence | Read candidate; invoke protected checks; no candidate or oracle edits | Reproduce original defect and challenge edge cases |
| Aggregator | Accepted outputs and evidence -> integration receipt | One named integration owner | Reject missing branches and rerun affected integration checks |

Choose roles by need. Four roles do not require four agents. Independent reviewers need fresh contexts without the implementer's reasoning transcript. They may share the task contract and candidate artifact. The sequential fallback in the examples uses one controller plus an independent checker process, not simulated independent model reviewers.

## Ownership and Cancellation

1. Choose a single writer for shared files or isolated worktrees with a named integration step. Resolve overlapping ownership before launch, including case aliases and resolved symlink paths.
2. Reserve child allocation from the parent's remaining allocation. Retries and child calls consume the same counters. A child inherits an equal or narrower permission ceiling. Prohibit recursive delegation unless a separately bounded, authorized contract explicitly permits it; the example's depth is zero.
3. Claim a task once with a run-scoped exclusive record. Do not interpret a stale timestamp as permission to steal work. Check the owner and recover abandoned claims explicitly.
4. On cancellation, revoke new dispatch, signal running children, wait for termination, preserve partial artifacts, and release ownership. Reconcile any effect before reassigning abandoned work.
5. Without native subagents, execute the same packets sequentially. Do not increase scope or remove checks to imitate parallelism. The reference `claim` function demonstrates overlap, unauthorized-tool, and allocation rejection with a one-worker ceiling.

Separate conversation histories reduce correlated assumptions. A shared filesystem, a worktree, or a different role name does not enforce security isolation.
