# Model Context Protocol (MCP) Guidelines

## Overview

This module provides comprehensive guidelines for designing and implementing **Model Context Protocol (MCP)** systems. MCP refers to the strategies and patterns for managing context in Large Language Model (LLM) applications, including how context is stored, retrieved, compressed, and injected into prompts.

## Key Benefits

- **Multi-Type Coverage**: Guidelines for 6 MCP types (token, state, vector, hybrid, graph, compressed)
- **Universal Rules**: Cross-cutting concerns (security, monitoring, testing)
- **Configuration System**: Flexible project-level configuration
- **Practical Examples**: Real-world implementation patterns
- **Best Practices**: Industry-proven patterns and anti-patterns

## Installation

### With CLI (Future)
```bash
augx link domain-rules/mcp
```

### Without CLI (Current)
1. Copy this module to your project's `.augment/` folder
2. Reference rule files in your project's AGENTS.md
3. Create `.augment/mcp-config.json` with your configuration

## Directory Structure

```
augment-extensions/domain-rules/mcp/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/                               # Detailed guidelines
│   ├── universal-rules.md               # Cross-cutting concerns
│   ├── configuration.md                 # Configuration system
│   ├── testing-validation.md            # Testing strategies
│   ├── token-based-mcp.md               # Token-based MCP
│   ├── state-based-mcp.md               # State-based MCP
│   ├── vector-based-mcp.md              # Vector-based MCP (RAG)
│   ├── hybrid-mcp.md                    # Hybrid multi-memory
│   ├── graph-augmented-mcp.md           # Graph-augmented MCP
│   └── compressed-mcp.md                # Compressed MCP
└── examples/                            # Implementation examples
    ├── token-based-example.md           # Legal contract analysis
    ├── state-based-example.md           # Customer support agent
    ├── vector-based-example.md          # Knowledge base Q&A
    ├── hybrid-example.md                # Research assistant
    ├── graph-augmented-example.md       # Supply chain analysis
    └── compressed-example.md            # Mobile assistant
```

## MCP Types

### 1. Token-Based MCP
Manage context within token limits using compression, chunking, and budgeting.

**Use Cases**: Long document analysis, legal contracts, research papers

### 2. State-Based MCP
Persist conversation state across sessions with serialization and concurrency control.

**Use Cases**: Customer support, multi-turn agents, workflow automation

### 3. Vector-Based MCP
Retrieve relevant context using semantic search and embeddings (RAG).

**Use Cases**: Knowledge base Q&A, documentation search, semantic retrieval

### 4. Hybrid MCP
Combine multiple memory types (token + vector + state) for complex applications.

**Use Cases**: Research assistants, enterprise agents, multi-modal systems

### 5. Graph-Augmented MCP
Use knowledge graphs for structured context with entity relationships.

**Use Cases**: Supply chain analysis, fraud detection, knowledge management

### 6. Compressed MCP
Apply aggressive compression for resource-constrained environments.

**Use Cases**: Mobile apps, edge devices, cost-sensitive applications

## Core Workflow

### 1. Choose MCP Type(s)

Analyze your requirements:
- **Token limits?** → Token-based
- **Persistent state?** → State-based
- **Large knowledge base?** → Vector-based
- **Complex requirements?** → Hybrid
- **Structured knowledge?** → Graph-augmented
- **Resource constraints?** → Compressed

### 2. Configure Module

Create `.augment/mcp-config.json`:

```json
{
  "version": "1.0",
  "mcpTypes": ["token", "vector"],
  "strictMode": true,
  "universalRules": true,
  "typeSpecificConfig": {
    "token": {
      "maxContextWindow": 200000,
      "compressionThreshold": 0.85
    },
    "vector": {
      "embeddingModel": "voyage-3-large",
      "topK": 10
    }
  }
}
```

### 3. Apply Rules

Follow type-specific guidelines from `rules/` directory:
- Read universal rules first
- Apply type-specific patterns
- Implement testing strategies
- Monitor and optimize

### 4. Validate Implementation

Use testing checklist from `rules/testing-validation.md`:
- Unit tests for transformations
- Integration tests for pipelines
- Performance benchmarks
- Security validation

## Character Count

**Total**: ~219,130 characters

## Contents

- **Universal Rules**: Context optimization, error handling, security, monitoring, testing, documentation
- **Type-Specific Rules**: Detailed guidelines for each of 6 MCP types
- **Configuration System**: JSON schema, validation, override semantics
- **Testing Framework**: Unit, integration, synthetic testing strategies
- **Examples**: 6 complete implementation examples with code

## Version History

- **1.0.0** (2026-01-29): Initial release with 6 MCP types and universal rules

