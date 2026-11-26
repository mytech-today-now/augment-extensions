# Controlled Improvement and Evaluation

## Improve the Harness Separately

1. Group repeated failures by normalized fingerprint, failed criterion, location, and relevant tool/context version. Preserve both accepted and rejected attempts. Separate observations from proposed explanations.
2. Propose one small harness change addressing an observed cause. Prefer a schema, gateway check, architecture constraint, or sensor over additional prose. Operational workers cannot edit their policy, verifier, acceptance criteria, budget, evaluation cases, or scoring.
3. Use the repository's proposal, review, and task process. Review the actual diff and its rollback before adoption. Do not let the worker being evaluated authorize its own harness change.
4. Replay representative saved successes and failures plus held-out regressions. Keep evaluation cases and scoring inaccessible to the optimizer. Reject any change that introduces false success or regresses previously accepted behavior.
5. Adopt only after review, record new harness/contract versions, and invalidate incompatible cached evidence. Keep failed proposals as evidence rather than repeatedly rediscovering them.

```javascript
const result = evaluateChange(baselineCheck, proposedCheck);
// eligibleForReview is replay evidence, not authorization to adopt.
// An always-green proposedCheck must fail saved defective cases.
```

The local replay compares deterministic check behavior on protected fixture cases. It does not estimate model effectiveness. The negative cases are intentionally known to the maintainer and are not a production held-out benchmark.

## Measure Accepted Work

| Measure | Definition |
|---|---|
| Accepted tasks | Outputs satisfying independently recorded acceptance criteria |
| False success | Accepted outputs later shown to violate those criteria |
| Recovery | Initially failed tasks later accepted within the same allocation |
| Repeated failures | Recurrent normalized failures, including rejected approaches |
| Cost per accepted task | All run costs, including failures and review, divided by accepted tasks |
| Latency | Elapsed request-to-verified-outcome time, including retries and joins |
| Human effort | Review minutes, interventions, and unresolved handoffs |

If no task is accepted, cost per accepted task is undefined. Unknown token cost remains unknown. Label deterministic stub results, actual provider tests, and production observations separately. Compare single-agent and graph variants on equivalent cases, checks, budgets, host conditions, and accounting. Routing tests alone cannot support quality, speed, or cost claims.

## Ablation and Decay

- After model, tool, or task changes, name the failure each component prevents and measure whether it still occurs.
- Remove one optional router, context layer, evaluator, or workaround at a time in an isolated variant. Replay equivalent cases and compare correctness, false success, cost, latency, and human effort.
- Preserve security and approval safeguards until evidence and governing policy support removal. A lower measured overhead does not grant authority to remove a required control.
- Reject regressions, retain the baseline, and make rollback a small versioned revert. Keep evaluation and improvement separate from operational execution.
