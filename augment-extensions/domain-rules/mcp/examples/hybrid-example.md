# Hybrid MCP Example: Research Assistant

## Use Case

An AI research assistant that combines multiple memory types for complex research tasks: token-based for document analysis, vector-based for knowledge retrieval, and state-based for workflow tracking.

**Challenges**:
- Manage multiple memory types simultaneously
- Coordinate between different context sources
- Maintain consistency across memory systems
- Optimize for both retrieval and generation

---

## Configuration

```json
{
  "mcp": {
    "type": "hybrid",
    "components": {
      "token": {
        "enabled": true,
        "maxContextWindow": 200000,
        "compressionThreshold": 0.85
      },
      "vector": {
        "enabled": true,
        "embeddingModel": "voyage-3-large",
        "vectorStore": "pinecone",
        "topK": 10
      },
      "state": {
        "enabled": true,
        "backend": "redis",
        "ttl": 86400
      }
    },
    "orchestration": {
      "strategy": "priority_based",
      "priorities": {
        "vector": 1,
        "state": 2,
        "token": 3
      },
      "contextBudget": {
        "vector": 0.4,
        "state": 0.3,
        "token": 0.3
      }
    }
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Research Query                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Orchestrator                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Priority-based routing                               │  │
│  │ Context budget allocation                            │  │
│  │ Memory coordination                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Vector MCP   │    │ State MCP    │    │ Token MCP    │
│              │    │              │    │              │
│ Knowledge    │    │ Workflow     │    │ Document     │
│ Retrieval    │    │ State        │    │ Analysis     │
│              │    │              │    │              │
│ (40% budget) │    │ (30% budget) │    │ (30% budget) │
└──────────────┘    └──────────────┘    └──────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Context                                 │
│  - Retrieved knowledge (vector)                              │
│  - Workflow state (state)                                    │
│  - Document excerpts (token)                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LLM Generation                                  │
│  Unified Context → GPT-4o → Research Output                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: Context Orchestrator

```python
from typing import Dict, Any, List, Optional
from enum import Enum
import redis
import voyageai
from pinecone import Pinecone
import openai
import tiktoken

class MemoryType(Enum):
    VECTOR = "vector"
    STATE = "state"
    TOKEN = "token"

class ContextOrchestrator:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tokenizer = tiktoken.encoding_for_model("gpt-4o")
        
        # Initialize memory components
        self.vector_memory = VectorMemory(config["components"]["vector"])
        self.state_memory = StateMemory(config["components"]["state"])
        self.token_memory = TokenMemory(config["components"]["token"])
        
        # Context budget allocation
        self.context_budget = config["orchestration"]["contextBudget"]
        self.max_context_window = config["components"]["token"]["maxContextWindow"]
    
    def allocate_context_budget(self) -> Dict[MemoryType, int]:
        """Allocate token budget to each memory type"""
        total_budget = self.max_context_window
        
        return {
            MemoryType.VECTOR: int(total_budget * self.context_budget["vector"]),
            MemoryType.STATE: int(total_budget * self.context_budget["state"]),
            MemoryType.TOKEN: int(total_budget * self.context_budget["token"])
        }

    def gather_context(self, query: str, session_id: str) -> Dict[str, Any]:
        """Gather context from all memory types"""
        budget = self.allocate_context_budget()

        # Retrieve from vector memory (knowledge base)
        vector_context = self.vector_memory.retrieve(
            query=query,
            max_tokens=budget[MemoryType.VECTOR]
        )

        # Retrieve from state memory (workflow state)
        state_context = self.state_memory.get_state(
            session_id=session_id,
            max_tokens=budget[MemoryType.STATE]
        )

        # Retrieve from token memory (document analysis)
        token_context = self.token_memory.get_relevant_chunks(
            query=query,
            max_tokens=budget[MemoryType.TOKEN]
        )

        return {
            "vector": vector_context,
            "state": state_context,
            "token": token_context
        }

    def build_unified_context(self, contexts: Dict[str, Any]) -> str:
        """Build unified context from all memory types"""
        parts = []

        # Add vector context (knowledge base)
        if contexts["vector"]:
            parts.append("=== Knowledge Base ===")
            for i, doc in enumerate(contexts["vector"]["documents"], 1):
                parts.append(f"[{i}] {doc['text']}")
                parts.append(f"Source: {doc['metadata'].get('source', 'Unknown')}")
            parts.append("")

        # Add state context (workflow)
        if contexts["state"]:
            parts.append("=== Research Workflow ===")
            parts.append(f"Current Phase: {contexts['state']['phase']}")
            parts.append(f"Completed Steps: {', '.join(contexts['state']['completed_steps'])}")
            parts.append(f"Next Steps: {', '.join(contexts['state']['next_steps'])}")
            parts.append("")

        # Add token context (document excerpts)
        if contexts["token"]:
            parts.append("=== Document Analysis ===")
            for i, chunk in enumerate(contexts["token"]["chunks"], 1):
                parts.append(f"[{i}] {chunk['text']}")
                parts.append(f"Document: {chunk['metadata'].get('document', 'Unknown')}")
            parts.append("")

        return "\n".join(parts)

class VectorMemory:
    def __init__(self, config: Dict[str, Any]):
        self.voyage_client = voyageai.Client(api_key=config.get("voyageApiKey"))
        self.pc = Pinecone(api_key=config.get("pineconeApiKey"))
        self.index = self.pc.Index(config.get("indexName", "research-kb"))
        self.top_k = config.get("topK", 10)
        self.tokenizer = tiktoken.encoding_for_model("gpt-4o")

    def retrieve(self, query: str, max_tokens: int) -> Dict[str, Any]:
        """Retrieve relevant documents within token budget"""
        # Embed query
        query_embedding = self.voyage_client.embed(
            texts=[query],
            model="voyage-3-large",
            input_type="query"
        ).embeddings[0]

        # Vector search
        results = self.index.query(
            vector=query_embedding,
            top_k=self.top_k,
            include_metadata=True
        )

        # Filter by token budget
        documents = []
        total_tokens = 0

        for match in results.matches:
            text = match.metadata["text"]
            tokens = len(self.tokenizer.encode(text))

            if total_tokens + tokens <= max_tokens:
                documents.append({
                    "text": text,
                    "score": match.score,
                    "metadata": {k: v for k, v in match.metadata.items() if k != "text"}
                })
                total_tokens += tokens
            else:
                break

        return {
            "documents": documents,
            "total_tokens": total_tokens
        }

class StateMemory:
    def __init__(self, config: Dict[str, Any]):
        self.redis = redis.from_url(config.get("redisUrl", "redis://localhost:6379"))
        self.ttl = config.get("ttl", 86400)
        self.tokenizer = tiktoken.encoding_for_model("gpt-4o")

    def get_state(self, session_id: str, max_tokens: int) -> Optional[Dict[str, Any]]:
        """Retrieve workflow state within token budget"""
        state_key = f"research:{session_id}:state"
        state_data = self.redis.get(state_key)

        if not state_data:
            return None

        import json
        state = json.loads(state_data)

        # Truncate if exceeds budget
        state_text = json.dumps(state)
        tokens = len(self.tokenizer.encode(state_text))

        if tokens > max_tokens:
            # Truncate history
            state["history"] = state.get("history", [])[-5:]

        return state

    def update_state(self, session_id: str, state: Dict[str, Any]) -> None:
        """Update workflow state"""
        import json
        state_key = f"research:{session_id}:state"
        state_data = json.dumps(state)
        self.redis.setex(state_key, self.ttl, state_data)

class TokenMemory:
    def __init__(self, config: Dict[str, Any]):
        self.max_context_window = config.get("maxContextWindow", 200000)
        self.tokenizer = tiktoken.encoding_for_model("gpt-4o")
        self.documents = {}  # In-memory storage (use persistent storage in production)

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any]) -> None:
        """Add document to token memory"""
        self.documents[doc_id] = {
            "text": text,
            "metadata": metadata,
            "chunks": self._chunk_document(text)
        }

    def _chunk_document(self, text: str, chunk_size: int = 4096) -> List[Dict[str, Any]]:
        """Chunk document for retrieval"""
        sentences = text.split('. ')
        chunks = []
        current_chunk = []
        current_tokens = 0

        for sentence in sentences:
            sentence_tokens = len(self.tokenizer.encode(sentence))

            if current_tokens + sentence_tokens > chunk_size:
                chunk_text = '. '.join(current_chunk) + '.'
                chunks.append({
                    "text": chunk_text,
                    "tokens": current_tokens
                })
                current_chunk = [sentence]
                current_tokens = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_tokens += sentence_tokens

        if current_chunk:
            chunk_text = '. '.join(current_chunk) + '.'
            chunks.append({
                "text": chunk_text,
                "tokens": current_tokens
            })

        return chunks

    def get_relevant_chunks(self, query: str, max_tokens: int) -> Dict[str, Any]:
        """Get relevant document chunks within token budget"""
        # Simple keyword matching (use semantic search in production)
        query_terms = set(query.lower().split())

        scored_chunks = []
        for doc_id, doc in self.documents.items():
            for chunk in doc["chunks"]:
                chunk_terms = set(chunk["text"].lower().split())
                overlap = len(query_terms & chunk_terms)

                if overlap > 0:
                    scored_chunks.append({
                        "text": chunk["text"],
                        "score": overlap,
                        "tokens": chunk["tokens"],
                        "metadata": {"document": doc_id, **doc["metadata"]}
                    })

        # Sort by score and filter by budget
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)

        selected_chunks = []
        total_tokens = 0

        for chunk in scored_chunks:
            if total_tokens + chunk["tokens"] <= max_tokens:
                selected_chunks.append(chunk)
                total_tokens += chunk["tokens"]
            else:
                break

        return {
            "chunks": selected_chunks,
            "total_tokens": total_tokens
        }
```

### Step 2: Research Assistant

```python
class ResearchAssistant:
    def __init__(self, config: Dict[str, Any], openai_api_key: str):
        self.orchestrator = ContextOrchestrator(config)
        self.client = openai.OpenAI(api_key=openai_api_key)

    def research(self, query: str, session_id: str) -> Dict[str, Any]:
        """Conduct research using hybrid MCP"""
        # Gather context from all memory types
        contexts = self.orchestrator.gather_context(query, session_id)

        # Build unified context
        unified_context = self.orchestrator.build_unified_context(contexts)

        # Generate research output
        messages = [
            {
                "role": "system",
                "content": """You are a research assistant that synthesizes information from multiple sources.

Use the provided context from:
1. Knowledge Base - General knowledge and references
2. Research Workflow - Current research phase and progress
3. Document Analysis - Specific document excerpts

Provide comprehensive, well-cited answers."""
            },
            {
                "role": "user",
                "content": f"""Context:
{unified_context}

Research Query: {query}

Provide a comprehensive answer with citations."""
            }
        ]

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.5
        )

        answer = response.choices[0].message.content

        # Update workflow state
        self._update_workflow_state(session_id, query, answer)

        return {
            "answer": answer,
            "contexts_used": {
                "vector": len(contexts["vector"].get("documents", [])),
                "state": bool(contexts["state"]),
                "token": len(contexts["token"].get("chunks", []))
            },
            "token_usage": {
                "vector": contexts["vector"].get("total_tokens", 0),
                "state": 0,  # Calculate in production
                "token": contexts["token"].get("total_tokens", 0)
            }
        }

    def _update_workflow_state(self, session_id: str, query: str, answer: str) -> None:
        """Update research workflow state"""
        current_state = self.orchestrator.state_memory.get_state(session_id, max_tokens=10000)

        if not current_state:
            current_state = {
                "phase": "exploration",
                "completed_steps": [],
                "next_steps": [],
                "history": []
            }

        # Add to history
        current_state["history"].append({
            "query": query,
            "answer": answer[:200],  # Truncate for storage
            "timestamp": "2026-01-29T00:00:00Z"
        })

        # Update phase based on progress
        if len(current_state["history"]) > 5:
            current_state["phase"] = "synthesis"

        self.orchestrator.state_memory.update_state(session_id, current_state)
```

---

## Usage Example

```python
# Configuration
config = {
    "components": {
        "token": {"maxContextWindow": 200000, "compressionThreshold": 0.85},
        "vector": {
            "voyageApiKey": "your-voyage-key",
            "pineconeApiKey": "your-pinecone-key",
            "indexName": "research-kb",
            "topK": 10
        },
        "state": {"redisUrl": "redis://localhost:6379", "ttl": 86400}
    },
    "orchestration": {
        "strategy": "priority_based",
        "priorities": {"vector": 1, "state": 2, "token": 3},
        "contextBudget": {"vector": 0.4, "state": 0.3, "token": 0.3}
    }
}

# Initialize assistant
assistant = ResearchAssistant(config, "your-openai-key")

# Add documents to token memory
assistant.orchestrator.token_memory.add_document(
    "paper-1",
    "This paper discusses machine learning techniques...",
    {"source": "ml-paper.pdf", "year": 2024}
)

# Conduct research
result = assistant.research(
    query="What are the latest advances in machine learning?",
    session_id="research-session-001"
)

print(f"Answer: {result['answer']}")
print(f"\nContexts Used: {result['contexts_used']}")
print(f"Token Usage: {result['token_usage']}")
```

---

## Key Features

### 1. Multi-Memory Coordination
- Vector memory for knowledge retrieval
- State memory for workflow tracking
- Token memory for document analysis

### 2. Context Budget Allocation
- Proportional allocation (40% vector, 30% state, 30% token)
- Dynamic adjustment based on availability
- Token-aware filtering

### 3. Unified Context Building
- Structured context from all sources
- Clear section separation
- Source attribution

### 4. Workflow State Management
- Phase tracking (exploration → synthesis)
- History maintenance
- Progress monitoring

---

## Best Practices

1. **Budget Allocation**: Adjust based on use case requirements
2. **Priority Ordering**: Set priorities based on information value
3. **State Synchronization**: Keep state consistent across memories
4. **Error Handling**: Handle failures in individual memory components
5. **Monitoring**: Track usage and performance per memory type
6. **Caching**: Cache frequently accessed context
7. **Versioning**: Version state schema for compatibility

---

## Performance Optimization

- **Parallel Retrieval**: Fetch from all memories concurrently
- **Lazy Loading**: Load only required memory components
- **Connection Pooling**: Reuse connections to Redis/Pinecone
- **Batch Operations**: Batch updates to state memory
- **Compression**: Compress large state objects

---

## Testing

```python
def test_context_orchestration():
    config = {...}  # Test config
    orchestrator = ContextOrchestrator(config)

    # Test budget allocation
    budget = orchestrator.allocate_context_budget()
    assert sum(budget.values()) <= orchestrator.max_context_window

    # Test context gathering
    contexts = orchestrator.gather_context("test query", "session-1")
    assert "vector" in contexts
    assert "state" in contexts
    assert "token" in contexts
```
```

