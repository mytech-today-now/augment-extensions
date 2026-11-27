# Automatic decision judgments in chat

## Problem and approach

The official TypeSafe skill teaches SDK integration, while the existing Augx runtime only executes explicit operations. Static linking cannot connect a chat session to that runtime.

Add a project-owned stdio MCP server and a separate, implicitly discoverable `augx-judgments` skill for the two installer hosts, Codex and Claude Code. The host agent selects classification or retrieval-ranking decision points in ordinary tasks and calls the native tool. The existing decision adapter validates typed answers. Saved policy, a project-wide durable request ledger, input allowlists and cancellation remain code-owned. No message interceptor, scheduler, hosted service or new dependency is needed.

Setup remains explicit. `setup --automatic --requests N` records provider-data consent for public data, a cumulative request ceiling, host registration and tool permission. Internal data requires a separate policy edit. Repeating setup never refunds usage. Disable or remove disconnects owned registrations while preserving edits. Existing explicit operations retain their contracts.

## Evidence and boundaries

Official host docs establish implicit skill discovery and stdio MCP configuration, not guaranteed model selection. Codex project configuration requires workspace trust. Claude Code project MCP registration requires one-time approval. Organization policies remain authoritative. Tests will distinguish protocol/agent fixtures, installed host configuration inspection, manual chat and live provider evidence. No live paid requests are authorized in this change.

## Tracking

Native Beads task: bd-8e46. Existing provider/platform follow-up: bd-758d.
