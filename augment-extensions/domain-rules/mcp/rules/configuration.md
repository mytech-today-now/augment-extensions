# MCP Configuration System

## Overview

The MCP module uses a flexible configuration system that allows projects to customize MCP behavior through `.augment/mcp-config.json`.

---

## Configuration File Format

### Location
`.augment/mcp-config.json` (project root)

### Schema

```json
{
  "version": "1.0",
  "mcpTypes": ["token", "vector"],
  "strictMode": true,
  "universalRules": true,
  "typeSpecificConfig": {
    "token": {
      "maxContextWindow": 200000,
      "outputBuffer": 4096,
      "compressionThreshold": 0.85,
      "chunkSize": 512,
      "chunkOverlap": 50,
      "strategy": "hierarchical-summarization"
    },
    "state": {
      "persistence": "postgresql",
      "hotPath": "redis",
      "format": "typed-json",
      "versionControl": true,
      "concurrency": "optimistic"
    },
    "vector": {
      "embeddingModel": "voyage-3-large",
      "indexType": "hnsw",
      "topK": 10,
      "minRelevanceScore": 0.76,
      "hybridSearch": true,
      "reranker": "cohere-rerank-v3"
    },
    "hybrid": {
      "memoryTypes": ["token", "vector", "state"],
      "orchestration": "parallel",
      "budgetAllocation": {
        "token": 0.4,
        "vector": 0.4,
        "state": 0.2
      }
    },
    "graph": {
      "database": "neo4j",
      "temporalDecay": 0.92,
      "maxHops": 3,
      "entityExtraction": "llm-based"
    },
    "compressed": {
      "compressionRatio": 10,
      "strategy": "hierarchical-summarization",
      "compressionInterval": 15
    }
  },
  "monitoring": {
    "enabled": true,
    "logTokenUsage": true,
    "logRetrievalMetrics": true,
    "alertOnOverflow": true,
    "metricsEndpoint": "http://localhost:9090/metrics"
  }
}
```

---

## Configuration Fields

### Top-Level Fields

#### `version` (required)
- **Type**: string
- **Description**: Configuration schema version
- **Valid values**: "1.0"

#### `mcpTypes` (required)
- **Type**: array of strings
- **Description**: MCP types to enable for this project
- **Valid values**: ["token", "state", "vector", "hybrid", "graph", "compressed"]
- **Default**: ["token"]
- **Note**: First type in array is primary type

#### `strictMode` (optional)
- **Type**: boolean
- **Description**: Enable strict validation of MCP patterns
- **Default**: true
- **Effect**: Throws errors on validation failures instead of warnings

#### `universalRules` (optional)
- **Type**: boolean
- **Description**: Apply universal cross-cutting rules
- **Default**: true
- **Effect**: Enables security, monitoring, testing rules

---

## Type-Specific Configuration

### Token-Based MCP

```json
"token": {
  "maxContextWindow": 200000,        // Model's max context window
  "outputBuffer": 4096,              // Reserved tokens for output
  "compressionThreshold": 0.85,      // Compress at 85% of window
  "chunkSize": 512,                  // Chunk size in tokens
  "chunkOverlap": 50,                // Overlap between chunks
  "strategy": "hierarchical-summarization"  // Compression strategy
}
```

**Strategies**: "hierarchical-summarization", "sliding-window", "entity-spotlighting"

### State-Based MCP

```json
"state": {
  "persistence": "postgresql",       // Primary persistence layer
  "hotPath": "redis",                // Hot-path cache
  "format": "typed-json",            // Serialization format
  "versionControl": true,            // Enable schema versioning
  "concurrency": "optimistic"        // Concurrency control
}
```

**Persistence**: "postgresql", "mongodb", "dynamodb", "file"
**Hot Path**: "redis", "memcached", "in-memory"
**Concurrency**: "optimistic", "pessimistic", "none"

### Vector-Based MCP

```json
"vector": {
  "embeddingModel": "voyage-3-large",  // Embedding model
  "indexType": "hnsw",                 // Vector index type
  "topK": 10,                          // Number of results to retrieve
  "minRelevanceScore": 0.76,           // Minimum relevance threshold
  "hybridSearch": true,                // Enable hybrid search
  "reranker": "cohere-rerank-v3"       // Reranker model
}
```

**Embedding Models**: "voyage-3-large", "bge-m3", "openai-ada-003", "cohere-embed-v3"
**Index Types**: "hnsw", "ivf", "flat"

### Hybrid MCP

```json
"hybrid": {
  "memoryTypes": ["token", "vector", "state"],  // Memory types to combine
  "orchestration": "parallel",                  // Orchestration strategy
  "budgetAllocation": {                         // Budget allocation
    "token": 0.4,
    "vector": 0.4,
    "state": 0.2
  }
}
```

**Orchestration**: "sequential", "parallel", "conditional", "adaptive"

### Graph-Augmented MCP

```json
"graph": {
  "database": "neo4j",                 // Graph database
  "temporalDecay": 0.92,               // Decay factor per month
  "maxHops": 3,                        // Max traversal hops
  "entityExtraction": "llm-based"      // Entity extraction method
}
```

**Databases**: "neo4j", "networkx", "janusgraph"
**Entity Extraction**: "llm-based", "spacy", "flair"

### Compressed MCP

```json
"compressed": {
  "compressionRatio": 10,              // Target compression ratio
  "strategy": "hierarchical-summarization",  // Compression strategy
  "compressionInterval": 15            // Compress every N turns
}
```

**Strategies**: "hierarchical-summarization", "key-value", "gist-tokens"

---

## Configuration Validation

### Validation Rules

1. **Required fields**: `version`, `mcpTypes` must be present
2. **Type checking**: All fields must match expected types
3. **Enum validation**: Enum fields must have valid values
4. **Dependency checking**: Hybrid config requires valid memory types
5. **Range validation**: Numeric fields must be within valid ranges

### Validation Example

```python
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional

class MCPConfig(BaseModel):
    version: str = Field(..., pattern="^1\\.0$")
    mcpTypes: List[str] = Field(..., min_items=1)
    strictMode: bool = True
    universalRules: bool = True
    typeSpecificConfig: Optional[Dict] = None
    monitoring: Optional[Dict] = None

    @validator('mcpTypes')
    def validate_mcp_types(cls, v):
        valid_types = {"token", "state", "vector", "hybrid", "graph", "compressed"}
        if not all(t in valid_types for t in v):
            raise ValueError(f"Invalid MCP type. Must be one of {valid_types}")
        return v
```

---

## Override Semantics

### Precedence Order (highest to lowest)

1. **Project-level config** (`.augment/mcp-config.json`)
2. **Type-specific rules** (from `rules/[type]-mcp.md`)
3. **Universal rules** (from `rules/universal-rules.md`)
4. **Module defaults** (from `module.json`)

### Override Examples

**Example 1**: Project disables strict mode
```json
{
  "strictMode": false  // Overrides module default (true)
}
```

**Example 2**: Project customizes token budget
```json
{
  "typeSpecificConfig": {
    "token": {
      "compressionThreshold": 0.90  // Overrides default (0.85)
    }
  }
}
```

---

## Multi-Type Configuration

### Primary Type

The **first type** in `mcpTypes` array is the primary type:

```json
{
  "mcpTypes": ["vector", "token"]  // Vector is primary
}
```

### Budget Allocation

For hybrid configurations, define budget allocation:

```json
{
  "mcpTypes": ["token", "vector", "state"],
  "typeSpecificConfig": {
    "hybrid": {
      "budgetAllocation": {
        "token": 0.5,   // 50% of budget
        "vector": 0.3,  // 30% of budget
        "state": 0.2    // 20% of budget
      }
    }
  }
}
```

### Conflict Resolution

When multiple types have conflicting settings:
1. Use primary type's settings
2. Log warning about conflict
3. Allow explicit override in `hybrid` config

---

## Example Configurations

### Minimal Configuration

```json
{
  "version": "1.0",
  "mcpTypes": ["token"]
}
```

### Production Configuration

```json
{
  "version": "1.0",
  "mcpTypes": ["vector", "state"],
  "strictMode": true,
  "universalRules": true,
  "typeSpecificConfig": {
    "vector": {
      "embeddingModel": "voyage-3-large",
      "topK": 10,
      "hybridSearch": true
    },
    "state": {
      "persistence": "postgresql",
      "hotPath": "redis",
      "concurrency": "optimistic"
    }
  },
  "monitoring": {
    "enabled": true,
    "logTokenUsage": true,
    "alertOnOverflow": true
  }
}
```

