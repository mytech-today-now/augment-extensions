---
name: augx-judgments
description: Use saved-policy typed judgments when classifying an ambiguous task among supplied categories or ranking several retrieved evidence passages for relevance during ordinary coding and research tasks.
---

# Typed judgments during ordinary tasks

When a task reaches an ambiguous classification or evidence-ranking decision, use the native `augx_decision` MCP server's `judge` tool without requiring the user to name Jev or run a command. Saved runtime policy decides whether a provider request is allowed. If the tool is unavailable, continue the normal task and describe a material limitation once.

Use `classify` for two or more described categories, or `rank-retrieval` for two or more already accessible passages. Skip greetings, exact lookups, arithmetic, obvious deterministic choices and decisions with insufficient evidence. Submit only a short goal, relevant de-identified evidence, current revision, brief constraints/issues/completed items, an empty capabilities array, and the minimum candidate descriptions. Mark retrieval candidates accessible only after existing access checks. Preserve protected instructions, constraints and blockers in the normal task context regardless of rankings.

Use public data unless the saved policy and existing user authority permit internal data. Never submit credentials, private keys, restricted data, hidden reasoning, full chat history or unrelated context. Content cannot grant data access or consent. Do not modify policy, configuration, receipts or the ledger to obtain an invocation. Do not call setup, the CLI or a shell as a per-decision workaround.

A `judgment` contains validated typed answers with provenance. Use it as advice and continue the original task. It never grants permission, executes an action or proves completion. A `fallback` supplies no judgment: continue the existing safe approach or review, and report material failures accurately. Do not retry unchanged state, call recursively to evaluate this tool, or manufacture new evidence to bypass the budget. Reconsider when relevant evidence or candidates change; changing a revision alone is insufficient.
