# Spec Delta: MCP Module

This document defines the specifications for the Model Context Protocol (MCP) Augment Extension module.

## ADDED: Module Metadata Specification

**File**: `augment-extensions/domain-rules/mcp/module.json`

```json
{
  "name": "mcp",
  "version": "1.0.0",
  "displayName": "Model Context Protocol (MCP) Guidelines",
  "description": "Comprehensive guidelines for designing and implementing Model Context Protocol systems including token-based, state-based, vector-based, hybrid, graph-augmented, and compressed MCP",
  "type": "domain-rules",
  "tags": ["mcp", "context-management", "rag", "state-management", "llm", "ai-agents"],
  "author": "MyTech Today Now",
  "license": "MIT",
  "repository": "https://github.com/mytech-today-now/augment",
  "augment": {
    "characterCount": 0,
    "priority": "high",
    "category": "domain-rules",
    "appliesTo": {
      "filePatterns": [
        "**/*mcp*.py",
        "**/*context*.py",
        "**/*memory*.py",
        "**/*rag*.py",
        "**/*agent*.py",
        "**/*state*.py"
      ],
      "projectTypes": ["ai-agent", "llm-application", "rag-system"]
    }
  },
  "dependencies": [],
  "configuration": {
    "mcpTypes": {
      "type": "array",
      "description": "MCP types to enable for this project",
      "items": {
        "enum": ["token", "state", "vector", "hybrid", "graph", "compressed"]
      },
      "default": ["token"]
    },
    "strictMode": {
      "type": "boolean",
      "description": "Enable strict validation of MCP patterns",
      "default": true
    },
    "universalRules": {
      "type": "boolean",
      "description": "Apply universal cross-cutting rules",
      "default": true
    }
  }
}
```

## ADDED: Universal Rules Specification

**File**: `augment-extensions/domain-rules/mcp/rules/universal-rules.md`

### Context Optimization
- **Compression**: Apply context compression before hitting token limits
- **Prioritization**: Rank context by relevance/recency/importance
- **Deduplication**: Remove redundant information across context sources
- **Budgeting**: Allocate token budget across system/user/retrieved content

### Error Handling
- **Overflow**: Graceful degradation when context exceeds limits
- **Corruption**: Validation and recovery for corrupted context
- **Fallbacks**: Default behaviors when context unavailable
- **Logging**: Comprehensive error logging with context metadata

### Security and Privacy
- **PII Prevention**: Detect and redact personally identifiable information
- **Access Controls**: Context-level permissions and isolation
- **Sanitization**: Clean user inputs before context injection
- **Audit Trails**: Log context access and modifications

### Monitoring and Observability
- **Token Usage**: Track tokens consumed per request/session
- **Retrieval Metrics**: Measure recall@K, precision, latency
- **Hallucination Detection**: Monitor for factual inconsistencies
- **Drift Detection**: Track context quality degradation over time

### Testing and Validation
- **Synthetic Testing**: Replay scenarios with known contexts
- **Adversarial Testing**: Test with malformed/oversized contexts
- **Performance Testing**: Benchmark under load
- **Regression Testing**: Validate context handling after changes

### Documentation Standards
- **Type Hints**: Full type annotations for context structures
- **Docstrings**: Document context schemas and transformations
- **Examples**: Provide before/after context examples
- **Versioning**: Track context schema versions

## ADDED: Token-Based MCP Specification

**File**: `augment-extensions/domain-rules/mcp/rules/token-based-mcp.md`

### Context Window Management
- **Window Sizing**: Calculate effective context window (model max - output buffer)
- **Sliding Windows**: Implement rolling context with overlap
- **Hierarchical Summarization**: Multi-level summaries for long documents
- **Entity Spotlighting**: Maintain entity reference tables

### Prompt Compression
- **Template Optimization**: Minimize system prompt tokens
- **Instruction Compression**: Use concise, effective instructions
- **Example Selection**: Choose minimal representative examples
- **Format Efficiency**: Use token-efficient formats (JSON vs verbose)

### Chunking Strategies
- **Semantic Chunking**: Split on logical boundaries (paragraphs, sections)
- **Size Optimization**: Balance chunk size vs retrieval granularity
- **Overlap**: Include context overlap between chunks
- **Metadata**: Attach source/position metadata to chunks

### Token Budgeting
- **Allocation**: Define budget for system/user/retrieved/output
- **Monitoring**: Track actual vs budgeted token usage
- **Dynamic Adjustment**: Reallocate budget based on request type
- **Cost Estimation**: Calculate cost before API calls

### Best Practices
- Use token counters (tiktoken, transformers) for accurate counting
- Cap injected context at 80-85% of window to allow output space
- Implement token-aware truncation (preserve important content)
- Cache tokenized prompts when possible
- Profile token usage in production

## ADDED: State-Based MCP Specification

**File**: `augment-extensions/domain-rules/mcp/rules/state-based-mcp.md`

### State Tracking
- **State Machines**: Define explicit state transitions
- **State Schema**: Use typed schemas (Pydantic, TypedDict)
- **State Validation**: Validate state on load and mutation
- **State History**: Maintain audit trail of state changes

### Serialization and Persistence
- **Format**: Use JSON with schema version field
- **Compression**: Apply compression for large states (gzip, zstd)
- **Encryption**: Encrypt sensitive state data at rest
- **Versioning**: Support schema migration across versions

### Concurrency Safety
- **Optimistic Locking**: Use ETags or version numbers
- **Pessimistic Locking**: Acquire locks for critical sections
- **Conflict Resolution**: Define merge strategies for conflicts
- **Idempotency**: Ensure state operations are idempotent

### Integration Patterns
- **LangGraph**: State as graph nodes with typed edges
- **CrewAI**: Agent state with task context
- **AutoGen**: Conversation state with message history
- **Custom**: Framework-agnostic state management

### Best Practices
- Always validate state schema on deserialization
- Log state deltas, not full snapshots (unless checkpointing)
- Implement graceful rollback on corruption
- Use Redis/Memcached for hot-path state
- Persist to PostgreSQL/MongoDB for durability
- Test state serialization round-trips

## ADDED: Vector-Based MCP Specification

**File**: `augment-extensions/domain-rules/mcp/rules/vector-based-mcp.md`

### Embedding Model Selection
- **Model Choice**: voyage-3, bge-m3, OpenAI ada-002/003, Cohere embed-v3
- **Dimensionality**: Balance between quality and storage/speed
- **Domain Adaptation**: Fine-tune embeddings for specific domains
- **Multilingual**: Use multilingual models when needed

### Chunking and Indexing
- **Chunk Size**: 256-512 tokens for most use cases
- **Overlap**: 10-20% overlap between chunks
- **Metadata**: Attach source, timestamp, category metadata
- **Index Type**: HNSW for speed, IVF for scale, Flat for accuracy

### Retrieval Strategies
- **Dense Retrieval**: Semantic similarity via embeddings
- **Sparse Retrieval**: BM25 for keyword matching
- **Hybrid Search**: Combine dense + sparse with fusion
- **Metadata Filtering**: Pre-filter by date, category, permissions

### Reranking
- **Cross-Encoder**: Use reranker models (Cohere, bge-reranker)
- **Reciprocal Rank Fusion**: Combine multiple retrieval sources
- **Threshold**: Set minimum relevance score (e.g., 0.76)
- **Top-K**: Retrieve more, rerank, return top-K

### Vector Database Options
- **Pinecone**: Managed, serverless, good for production
- **Weaviate**: Open-source, hybrid search, GraphQL API
- **Qdrant**: Fast, Rust-based, good for on-prem
- **Chroma**: Simple, embedded, good for prototyping
- **FAISS**: In-memory, fast, good for research

### Best Practices
- Benchmark embedding models on your domain
- Use hybrid search for better recall
- Apply metadata filtering before vector search
- Monitor retrieval latency and recall@K
- Cache frequent queries
- Version embeddings when model changes

## ADDED: Hybrid MCP Specification

**File**: `augment-extensions/domain-rules/mcp/rules/hybrid-mcp.md`

### Multi-Memory Architecture
- **Short-term**: Token buffer for recent conversation
- **Long-term**: Vector store for persistent knowledge
- **Working Memory**: State for current task context
- **Episodic**: Graph for event sequences

### Budget Allocation
- **Dynamic Budgeting**: Adjust allocation based on request type
- **Priority Queuing**: Rank memory sources by relevance
- **Fallback Strategy**: Degrade gracefully when budget exceeded
- **Cost Tracking**: Monitor token/compute costs per memory type

### Orchestration Patterns
- **Sequential**: Query memories in order (fast → slow)
- **Parallel**: Query all memories concurrently
- **Conditional**: Query based on request classification
- **Adaptive**: Learn optimal strategy over time

### Conflict Resolution
- **Recency Bias**: Prefer newer information
- **Source Authority**: Weight by source reliability
- **Confidence Scores**: Use retrieval confidence
- **Human-in-Loop**: Escalate conflicts to user

### Best Practices
- Start with 2-3 memory types, add more as needed
- Profile each memory type's latency and cost
- Implement circuit breakers for slow/failing memories
- Use async/parallel queries when possible
- Monitor memory coherence across types

## ADDED: Graph-Augmented MCP Specification

**File**: `augment-extensions/domain-rules/mcp/rules/graph-augmented-mcp.md`

### Entity Extraction
- **NER Models**: spaCy, Flair, LLM-based extraction
- **Entity Linking**: Resolve entities to canonical IDs
- **Relation Extraction**: Extract typed relationships
- **Temporal Tagging**: Track entity/relation timestamps

### Graph Modeling
- **Schema**: Define node types and edge types
- **Properties**: Attach metadata to nodes/edges
- **Temporal Edges**: Model time-varying relationships
- **Provenance**: Track source of facts

### Graph Traversal
- **Shortest Path**: Find connections between entities
- **Community Detection**: Identify entity clusters
- **PageRank**: Rank entity importance
- **Subgraph Extraction**: Extract relevant subgraphs

### Retrieval Strategies
- **Cypher Queries**: Use graph query language
- **Vector Similarity**: Embed nodes, search by similarity
- **Hybrid**: Combine graph traversal + vector search
- **Caching**: Cache frequent subgraph queries

### Temporal Decay
- **Decay Function**: Exponential decay by age (e.g., 0.92/month)
- **Freshness Scoring**: Boost recent facts
- **Fact Retirement**: Archive or delete stale facts
- **Update Tracking**: Monitor fact update frequency

### Graph Databases
- **Neo4j**: Industry standard, Cypher, ACID
- **In-Memory**: NetworkX, igraph for small graphs
- **Distributed**: JanusGraph, TigerGraph for scale

### Best Practices
- Use graph for structured knowledge, vectors for unstructured
- Implement temporal decay for time-sensitive domains
- Cache frequent traversal patterns
- Monitor graph size and query latency
- Version graph schema

## ADDED: Compressed MCP Specification

**File**: `augment-extensions/domain-rules/mcp/rules/compressed-mcp.md`

### Summarization Techniques
- **Extractive**: Select key sentences/phrases
- **Abstractive**: LLM-generated summaries
- **Hierarchical**: Multi-level summaries (gist → detail)
- **Incremental**: Update summaries as context grows

### Key-Value Memory
- **Factual Triples**: (subject, predicate, object)
- **Structured Data**: Store as JSON/dict
- **Selective Recall**: Retrieve only relevant facts
- **Compression Ratio**: Target 10:1 or higher

### Gist Tokens
- **Concept**: Compress context into special tokens
- **Training**: Fine-tune model to use gist tokens
- **Inference**: Inject gist tokens in prompt
- **Limitations**: Requires model support

### Context Distillation
- **Teacher-Student**: Distill long context into short
- **Prompt Compression**: Use compression models
- **Lossy Compression**: Accept fidelity trade-offs
- **Fidelity Metrics**: Measure information retention

### Best Practices
- Compress every N turns (e.g., 15 turns)
- Store factual information separately from conversation
- Only decompress on explicit entity reference
- Monitor compression ratio and fidelity
- Test decompression accuracy
- Use for resource-constrained environments (mobile, edge)

## ADDED: Configuration Specification

**File**: `augment-extensions/domain-rules/mcp/rules/configuration.md`

### Configuration File Format

**`.augment/mcp-config.json`**:
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
      "chunkOverlap": 50
    },
    "vector": {
      "embeddingModel": "voyage-3-large",
      "indexType": "hnsw",
      "topK": 10,
      "minRelevanceScore": 0.76,
      "hybridSearch": true
    }
  },
  "monitoring": {
    "enabled": true,
    "logTokenUsage": true,
    "logRetrievalMetrics": true,
    "alertOnOverflow": true
  }
}
```

### Configuration Validation
- **Schema Validation**: Validate against JSON schema
- **Type Checking**: Ensure MCP types are valid
- **Conflict Detection**: Check for incompatible settings
- **Default Values**: Apply sensible defaults

### Override Semantics
- **Type-Specific**: Type rules override universal rules
- **Project-Level**: Project config overrides module defaults
- **Explicit**: Explicit settings override implicit defaults

### Multi-Type Configuration
- **Primary Type**: First type in array is primary
- **Budget Allocation**: Distribute resources across types
- **Conflict Resolution**: Define precedence rules

## ADDED: Testing and Validation Specification

**File**: `augment-extensions/domain-rules/mcp/rules/testing-validation.md`

### Unit Testing
- **Context Transformations**: Test compression, chunking, filtering
- **State Serialization**: Test round-trip serialization
- **Configuration Validation**: Test config parsing and validation
- **Error Handling**: Test overflow, corruption scenarios

### Integration Testing
- **End-to-End**: Test full MCP pipeline
- **Multi-Type**: Test hybrid MCP configurations
- **Performance**: Benchmark latency and throughput
- **Regression**: Validate against known good outputs

### Synthetic Testing
- **Context Replay**: Replay saved contexts
- **Adversarial Inputs**: Test with malformed contexts
- **Edge Cases**: Test boundary conditions
- **Stress Testing**: Test with maximum context sizes

### Monitoring and Metrics
- **Token Usage**: Track tokens per request/session
- **Retrieval Quality**: Measure recall@K, precision
- **Latency**: Monitor p50, p95, p99 latencies
- **Error Rates**: Track overflow, corruption, failures
- **Cost**: Monitor API costs and compute usage

### Validation Checklist
- [ ] All MCP types have comprehensive tests
- [ ] Configuration validation works correctly
- [ ] Error handling covers all failure modes
- [ ] Performance meets SLA requirements
- [ ] Security tests pass (PII, access control)
- [ ] Documentation is accurate and complete

## ADDED: Example Specifications

### Example 1: Token-Based MCP (Legal Contract Analysis)

**File**: `augment-extensions/domain-rules/mcp/examples/token-based-example.md`

**Configuration**:
```json
{
  "mcpTypes": ["token"],
  "typeSpecificConfig": {
    "token": {
      "maxContextWindow": 200000,
      "strategy": "hierarchical-summarization",
      "entitySpotlighting": true,
      "compressionThreshold": 0.82
    }
  }
}
```

**Architecture**:
- Model: GPT-4o or Claude-3.5-Sonnet (200k context)
- Strategy: Hierarchical summarization + rolling window + entity reference table
- Key Rule: "Maintain running summary of prior sections; insert entity reference table every 60k tokens; cap injected context at 82% of window"

**Implementation Pattern**:
```python
class LegalContractAnalyzer:
    def __init__(self, max_window=200000):
        self.max_window = max_window
        self.output_buffer = 4096
        self.compression_threshold = 0.82
        self.entity_table = {}
        self.section_summaries = []

    def process_contract(self, contract_text):
        chunks = self.chunk_document(contract_text)
        for i, chunk in enumerate(chunks):
            # Update entity table every 60k tokens
            if i % 10 == 0:
                self.update_entity_table(chunk)

            # Generate section summary
            summary = self.summarize_section(chunk)
            self.section_summaries.append(summary)

            # Check token budget
            context_tokens = self.calculate_tokens()
            if context_tokens > self.max_window * self.compression_threshold:
                self.compress_context()
```

### Example 2: State-Based MCP (Customer Support Agent)

**File**: `augment-extensions/domain-rules/mcp/examples/state-based-example.md`

**Configuration**:
```json
{
  "mcpTypes": ["state"],
  "typeSpecificConfig": {
    "state": {
      "persistence": "postgresql",
      "hotPath": "redis",
      "format": "typed-json",
      "versionControl": true,
      "concurrency": "optimistic"
    }
  }
}
```

**Architecture**:
- Persistence: PostgreSQL + Redis (hot path)
- Format: Typed JSON with schema version + ETag
- Key Rule: "Implement optimistic concurrency with version check on load; always log state delta on mutation; support graceful rollback on deserialization failure"

**Implementation Pattern**:
```python
from pydantic import BaseModel
from typing import Optional
import json

class AgentState(BaseModel):
    schema_version: str = "1.0"
    session_id: str
    customer_id: str
    conversation_history: list[dict]
    context: dict
    etag: Optional[str] = None

    class Config:
        validate_assignment = True

class StateManager:
    def load_state(self, session_id: str) -> AgentState:
        # Load from Redis (hot path)
        cached = self.redis.get(f"session:{session_id}")
        if cached:
            return AgentState.parse_raw(cached)

        # Fallback to PostgreSQL
        row = self.db.query("SELECT * FROM agent_states WHERE session_id = %s", session_id)
        state = AgentState(**row)

        # Cache in Redis
        self.redis.setex(f"session:{session_id}", 3600, state.json())
        return state

    def save_state(self, state: AgentState) -> bool:
        # Optimistic concurrency check
        current = self.load_state(state.session_id)
        if current.etag != state.etag:
            raise ConcurrencyError("State was modified by another process")

        # Update ETag
        state.etag = self.generate_etag(state)

        # Log delta
        self.log_state_delta(current, state)

        # Save to both stores
        self.db.execute("UPDATE agent_states SET data = %s, etag = %s WHERE session_id = %s",
                       state.json(), state.etag, state.session_id)
        self.redis.setex(f"session:{state.session_id}", 3600, state.json())
        return True
```

