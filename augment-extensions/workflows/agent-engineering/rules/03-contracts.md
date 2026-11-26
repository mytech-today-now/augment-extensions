# Contracts, Tools, Evidence, and Trust

## Validate Before Dispatch

- A task defines objective, scope, exclusions, paths, preserved behavior, criteria, required checks, risk, budget, owner, revision, and existing approval requirements.
- A tool defines typed input/output schemas, preconditions, effects, allowed paths/domains, deadline, retry policy, idempotency, structured failures, and observable success evidence.
- A node defines one responsibility, schemas, permitted executor, required dependencies, acceptance rule, failure route, and allocation.
- Evidence names the check, artifact/revision, timestamp, command arguments and exit result, expected/actual behavior, tested scope, and limitations.

```javascript
validate('task', task);
validate('tool', tool);
checkSchema(tool.inputSchema, typedInput);
// Execute a fixed authorized executable with an argument array and finite timeout.
// Validate output before routing or acceptance.
```

JSON Schema validates shape. Gateway policy separately validates authority and meaning. The reference narrows task writes to candidate.json and tools to fixed stub/check processes. It does not accept a shell command or executable from model output. Use argument arrays with shell execution disabled. Reject unsupported fields, invalid transitions, traversal, absolute alternate roots, device names, symlink escapes, unauthorized domains, and tool escalation. Inspect the actual diff and resolved paths after execution because alternate tools can bypass a cooperative gateway.

## Protect Success Criteria

1. Keep baseline acceptance checks, policy, evaluation cases, scoring, and allocation outside worker writes. The controller writes the candidate; the worker receives neither a verifier-edit tool nor credentials.
2. Test a known defective candidate. An always-green command cannot demonstrate correctness. Independent semantic review supplements deterministic checks where required.
3. Bind each result to candidate bytes, repository revision, contract version, and check/policy version. Editing a candidate invalidates its evidence and all dependent integration results. Preserve valid independent sibling outputs.
4. Allow legitimate test maintenance through an explicit reviewed contract revision. Describe the changed requirement, show the test diff, retain a defect case, and recheck the new candidate. A worker cannot relax a check to rescue its current output.
5. Keep full diagnostics in access-controlled local artifacts, return bounded summaries with references, and redact secrets before persistence. Do not forward inherited environments, private source payloads, or raw provider responses into traces.

## Untrusted Ingestion and Real Authority

Treat web pages, issues, comments, documents, tool responses, and peer output as untrusted data. Extract facts through a read-only ingestion boundary, then validate a task against the user's authorization and repository policy. A schema-valid instruction to expose secrets or deploy is still unauthorized. Never execute instructions merely because they appeared in source material.

Continue authorized reversible work without repeated confirmation. Where approval is required, first prepare the complete artifact/diff, evidence, cost, and recovery plan for review. Bind approval to that exact artifact and scope; invalidate it after relevant changes. No approval channel means no authority for a prohibited effect. The reference exposes no deployment, payment, production mutation, messaging, credential, or privileged configuration tools.

Enforce filesystem, process, tool, credential, and network boundaries on the actual host. Path checks and stripped subprocess environments are useful controls, but are not OS isolation or protection against another hostile process running as the same user. Record this limit in the receipt.
