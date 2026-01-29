# Hybrid MCP Guidelines

## Overview

**Hybrid MCP** combines multiple memory types (token, state, vector, graph, compressed) to create sophisticated multi-memory architectures. This enables optimal context management across diverse use cases.

**Key Challenge**: Orchestrating multiple memory systems with different characteristics, budgets, and retrieval patterns while maintaining coherence and performance.

---

## 1. Multi-Memory Architecture

### Memory Type Characteristics

| Memory Type | Latency | Capacity | Precision | Cost | Use Case |
|-------------|---------|----------|-----------|------|----------|
| **Token** | Instant | Limited (200k) | Perfect | High | Immediate context |
| **State** | Low | Medium | Perfect | Low | Session continuity |
| **Vector** | Medium | High | Approximate | Medium | Semantic search |
| **Graph** | Medium | High | Structured | Medium | Relationships |
| **Compressed** | Low | High | Lossy | Low | Long-term memory |

### Architecture Patterns

**Tiered Memory**:

```python
class TieredMemory:
    """Multi-tier memory with hot/warm/cold storage"""
    
    def __init__(self):
        # Tier 1: Hot (token-based, immediate context)
        self.hot_memory = TokenMemory(max_tokens=4096)
        
        # Tier 2: Warm (state-based, session context)
        self.warm_memory = StateMemory()
        
        # Tier 3: Cold (vector-based, long-term knowledge)
        self.cold_memory = VectorMemory()
    
    def retrieve(self, query: str, token_budget=4096):
        """Retrieve from all tiers with budget allocation"""
        # Allocate budget across tiers
        hot_budget = int(token_budget * 0.5)   # 50% for immediate context
        warm_budget = int(token_budget * 0.3)  # 30% for session context
        cold_budget = int(token_budget * 0.2)  # 20% for knowledge base
        
        # Retrieve from each tier
        hot_context = self.hot_memory.get_recent(hot_budget)
        warm_context = self.warm_memory.get_session(warm_budget)
        cold_context = self.cold_memory.search(query, cold_budget)
        
        # Combine contexts
        return self.merge_contexts(hot_context, warm_context, cold_context)
    
    def merge_contexts(self, hot, warm, cold):
        """Merge contexts with deduplication"""
        # Deduplicate and prioritize by tier
        seen = set()
        merged = []
        
        for context in [hot, warm, cold]:
            for item in context:
                key = self.get_key(item)
                if key not in seen:
                    merged.append(item)
                    seen.add(key)
        
        return merged
```

**Specialized Memory**:

```python
class SpecializedMemory:
    """Different memory types for different content"""
    
    def __init__(self):
        # Vector memory for documents
        self.document_memory = VectorMemory()
        
        # Graph memory for entities and relationships
        self.entity_memory = GraphMemory()
        
        # State memory for conversation
        self.conversation_memory = StateMemory()
        
        # Compressed memory for long-term history
        self.history_memory = CompressedMemory()
    
    def retrieve(self, query: str, query_type: str):
        """Route to appropriate memory based on query type"""
        if query_type == "factual":
            return self.document_memory.search(query)
        elif query_type == "relational":
            return self.entity_memory.traverse(query)
        elif query_type == "conversational":
            return self.conversation_memory.get_context()
        elif query_type == "historical":
            return self.history_memory.recall(query)
        else:
            # Hybrid retrieval
            return self.hybrid_retrieve(query)
```

**Best Practices**:
- Allocate token budget across memory types
- Use tiered memory for general-purpose agents
- Use specialized memory for domain-specific agents
- Implement fallback strategies

---

## 2. Budget Allocation

### Static Allocation

Fixed budget per memory type:

```python
class StaticBudgetAllocator:
    """Fixed budget allocation across memory types"""
    
    def __init__(self, total_budget=4096):
        self.total_budget = total_budget
        self.allocations = {
            'token': 0.4,    # 40% for immediate context
            'state': 0.2,    # 20% for session state
            'vector': 0.3,   # 30% for semantic search
            'graph': 0.1     # 10% for relationships
        }
    
    def allocate(self):
        """Return budget for each memory type"""
        return {
            memory_type: int(self.total_budget * ratio)
            for memory_type, ratio in self.allocations.items()
        }
```

### Dynamic Allocation

Adaptive budget based on query:

```python
class DynamicBudgetAllocator:
    """Adaptive budget allocation based on query characteristics"""
    
    def __init__(self, total_budget=4096):
        self.total_budget = total_budget
    
    def allocate(self, query: str, query_type: str):
        """Allocate budget based on query type"""
        if query_type == "factual":
            # Prioritize vector search
            return {
                'token': int(self.total_budget * 0.2),
                'vector': int(self.total_budget * 0.6),
                'graph': int(self.total_budget * 0.2)
            }
        elif query_type == "conversational":
            # Prioritize conversation history
            return {
                'token': int(self.total_budget * 0.5),
                'state': int(self.total_budget * 0.4),
                'vector': int(self.total_budget * 0.1)
            }
        elif query_type == "analytical":
            # Prioritize graph traversal
            return {
                'token': int(self.total_budget * 0.2),
                'graph': int(self.total_budget * 0.5),
                'vector': int(self.total_budget * 0.3)
            }
        else:
            # Balanced allocation
            return {
                'token': int(self.total_budget * 0.3),
                'state': int(self.total_budget * 0.2),
                'vector': int(self.total_budget * 0.3),
                'graph': int(self.total_budget * 0.2)
            }
```

**Best Practices**:
- Start with static allocation for simplicity
- Use dynamic allocation for complex agents
- Monitor actual usage vs allocation
- Adjust based on performance metrics

---

## 3. Orchestration Patterns

### Sequential Orchestration

Retrieve from memory types in sequence:

```python
class SequentialOrchestrator:
    """Retrieve from memory types sequentially"""

    def __init__(self, memories: dict):
        self.memories = memories

    def retrieve(self, query: str, budget_allocation: dict):
        """Retrieve sequentially with early stopping"""
        results = []
        total_tokens = 0

        # Define retrieval order
        order = ['token', 'state', 'vector', 'graph']

        for memory_type in order:
            if memory_type not in self.memories:
                continue

            budget = budget_allocation.get(memory_type, 0)
            if budget == 0:
                continue

            # Retrieve from this memory type
            memory_results = self.memories[memory_type].retrieve(query, budget)

            # Add to results
            for result in memory_results:
                result_tokens = count_tokens(result)
                if total_tokens + result_tokens <= sum(budget_allocation.values()):
                    results.append(result)
                    total_tokens += result_tokens
                else:
                    # Budget exhausted
                    return results

        return results
```

### Parallel Orchestration

Retrieve from all memory types simultaneously:

```python
import asyncio

class ParallelOrchestrator:
    """Retrieve from memory types in parallel"""

    def __init__(self, memories: dict):
        self.memories = memories

    async def retrieve(self, query: str, budget_allocation: dict):
        """Retrieve in parallel and merge"""
        # Create retrieval tasks
        tasks = []
        for memory_type, memory in self.memories.items():
            budget = budget_allocation.get(memory_type, 0)
            if budget > 0:
                task = memory.retrieve_async(query, budget)
                tasks.append((memory_type, task))

        # Execute in parallel
        results_by_type = {}
        for memory_type, task in tasks:
            results_by_type[memory_type] = await task

        # Merge and deduplicate
        return self.merge_results(results_by_type, budget_allocation)

    def merge_results(self, results_by_type: dict, budget_allocation: dict):
        """Merge results with priority weighting"""
        merged = []
        seen = set()

        # Priority order
        priority = ['token', 'state', 'vector', 'graph']

        for memory_type in priority:
            if memory_type not in results_by_type:
                continue

            for result in results_by_type[memory_type]:
                key = self.get_key(result)
                if key not in seen:
                    merged.append(result)
                    seen.add(key)

        return merged
```

### Hierarchical Orchestration

Use coarse-to-fine retrieval:

```python
class HierarchicalOrchestrator:
    """Hierarchical retrieval with refinement"""

    def __init__(self, memories: dict):
        self.memories = memories

    def retrieve(self, query: str, budget_allocation: dict):
        """Retrieve hierarchically"""
        # Stage 1: Coarse retrieval (compressed memory)
        if 'compressed' in self.memories:
            coarse_results = self.memories['compressed'].retrieve(
                query,
                budget_allocation.get('compressed', 512)
            )

            # Extract relevant topics/entities
            topics = self.extract_topics(coarse_results)
        else:
            topics = [query]

        # Stage 2: Medium retrieval (vector memory)
        if 'vector' in self.memories:
            medium_results = []
            for topic in topics:
                results = self.memories['vector'].retrieve(
                    topic,
                    budget_allocation.get('vector', 2048) // len(topics)
                )
                medium_results.extend(results)

            # Extract specific entities
            entities = self.extract_entities(medium_results)
        else:
            entities = []

        # Stage 3: Fine retrieval (graph memory)
        if 'graph' in self.memories and entities:
            fine_results = self.memories['graph'].traverse(
                entities,
                budget_allocation.get('graph', 1024)
            )
        else:
            fine_results = []

        # Combine all stages
        return self.combine_stages(coarse_results, medium_results, fine_results)
```

**Best Practices**:
- Use sequential for simple agents
- Use parallel for low-latency requirements
- Use hierarchical for complex queries
- Monitor latency and adjust

---

## 4. Conflict Resolution

### Deduplication

Remove duplicate information:

```python
def deduplicate_results(results: list, similarity_threshold=0.9):
    """Remove duplicate results based on semantic similarity"""
    unique_results = []
    embeddings = generate_embeddings([r['text'] for r in results])

    for i, result in enumerate(results):
        is_duplicate = False

        for j, unique_result in enumerate(unique_results):
            similarity = cosine_similarity(embeddings[i], embeddings[j])
            if similarity > similarity_threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            unique_results.append(result)

    return unique_results
```

### Contradiction Detection

Identify conflicting information:

```python
def detect_contradictions(results: list):
    """Detect contradictions in retrieved results"""
    contradictions = []

    for i, result1 in enumerate(results):
        for j, result2 in enumerate(results[i+1:], start=i+1):
            # Use LLM to detect contradiction
            prompt = f"""
            Do these two statements contradict each other?

            Statement 1: {result1['text']}
            Statement 2: {result2['text']}

            Answer with YES or NO and explain briefly.
            """

            response = llm_call(prompt)
            if response.startswith("YES"):
                contradictions.append({
                    'result1': result1,
                    'result2': result2,
                    'explanation': response
                })

    return contradictions
```

### Priority-Based Resolution

Resolve conflicts using priority:

```python
def resolve_conflicts(results: list, priority_order: list):
    """Resolve conflicts using memory type priority"""
    # Group by memory type
    by_type = {}
    for result in results:
        memory_type = result['memory_type']
        if memory_type not in by_type:
            by_type[memory_type] = []
        by_type[memory_type].append(result)

    # Detect contradictions
    contradictions = detect_contradictions(results)

    # Resolve using priority
    resolved = []
    for contradiction in contradictions:
        result1 = contradiction['result1']
        result2 = contradiction['result2']

        # Choose based on priority
        type1_priority = priority_order.index(result1['memory_type'])
        type2_priority = priority_order.index(result2['memory_type'])

        if type1_priority < type2_priority:
            resolved.append(result1)
        else:
            resolved.append(result2)

    # Add non-conflicting results
    conflicting_ids = set()
    for c in contradictions:
        conflicting_ids.add(c['result1']['id'])
        conflicting_ids.add(c['result2']['id'])

    for result in results:
        if result['id'] not in conflicting_ids:
            resolved.append(result)

    return resolved
```

**Best Practices**:
- Always deduplicate results
- Detect contradictions for critical applications
- Use priority-based resolution (token > state > vector > graph)
- Log conflicts for debugging

---

## 5. Best Practices

### DO

✅ **Allocate budget strategically**: Prioritize based on query type
✅ **Use parallel retrieval**: Reduce latency
✅ **Deduplicate results**: Avoid redundant context
✅ **Detect contradictions**: Ensure consistency
✅ **Monitor performance**: Track latency and quality
✅ **Implement fallbacks**: Handle memory failures gracefully
✅ **Version memory schemas**: Support evolution
✅ **Cache frequently accessed data**: Improve performance

### DON'T

❌ **Don't use all memory types for every query**: Be selective
❌ **Don't ignore conflicts**: Contradictions confuse LLMs
❌ **Don't over-allocate**: Respect token budgets
❌ **Don't forget to deduplicate**: Wastes tokens
❌ **Don't use sequential when parallel is better**: Optimize latency
❌ **Don't hard-code allocations**: Make them configurable
❌ **Don't ignore memory type characteristics**: Match to use case

---

## 6. Common Pitfalls

### Over-Complexity

**Problem**: Too many memory types, complex orchestration

**Solution**:
- Start simple (2-3 memory types)
- Add complexity only when needed
- Measure impact of each memory type

### Budget Imbalance

**Problem**: Poor allocation leads to suboptimal retrieval

**Solution**:
- Monitor actual usage
- Adjust allocations based on query patterns
- Use dynamic allocation for diverse queries

### Latency Issues

**Problem**: Sequential retrieval too slow

**Solution**:
- Use parallel orchestration
- Implement caching
- Optimize each memory type independently

### Conflict Proliferation

**Problem**: Too many contradictions, unclear resolution

**Solution**:
- Establish clear priority order
- Use recency as tiebreaker
- Log and review conflicts regularly

---

## 7. Integration Example

Complete hybrid MCP implementation:

```python
class HybridMCP:
    """Complete hybrid MCP with multiple memory types"""

    def __init__(self, config: dict):
        # Initialize memory types
        self.token_memory = TokenMemory(config['token'])
        self.state_memory = StateMemory(config['state'])
        self.vector_memory = VectorMemory(config['vector'])
        self.graph_memory = GraphMemory(config['graph'])

        # Initialize orchestrator
        memories = {
            'token': self.token_memory,
            'state': self.state_memory,
            'vector': self.vector_memory,
            'graph': self.graph_memory
        }
        self.orchestrator = ParallelOrchestrator(memories)

        # Initialize budget allocator
        self.allocator = DynamicBudgetAllocator(config['total_budget'])

    async def retrieve(self, query: str, query_type: str = "general"):
        """Retrieve context from all memory types"""
        # Allocate budget
        budget = self.allocator.allocate(query, query_type)

        # Retrieve in parallel
        results = await self.orchestrator.retrieve(query, budget)

        # Deduplicate
        results = deduplicate_results(results)

        # Detect and resolve conflicts
        contradictions = detect_contradictions(results)
        if contradictions:
            priority_order = ['token', 'state', 'vector', 'graph']
            results = resolve_conflicts(results, priority_order)

        return results

    def update(self, content: str, memory_types: list):
        """Update multiple memory types"""
        for memory_type in memory_types:
            if memory_type == 'token':
                self.token_memory.add(content)
            elif memory_type == 'state':
                self.state_memory.update(content)
            elif memory_type == 'vector':
                self.vector_memory.index(content)
            elif memory_type == 'graph':
                self.graph_memory.add_entities(content)
```

---

## Configuration Example

```json
{
  "mcp": {
    "type": "hybrid",
    "total_budget": 8192,
    "memories": {
      "token": {
        "max_tokens": 4096,
        "sliding_window": true
      },
      "state": {
        "persistence": "redis",
        "ttl": 3600
      },
      "vector": {
        "provider": "pinecone",
        "embedding_model": "text-embedding-3-small",
        "chunk_size": 512
      },
      "graph": {
        "provider": "neo4j",
        "entity_extraction": "llm"
      }
    },
    "orchestration": {
      "mode": "parallel",
      "deduplication": true,
      "conflict_detection": true,
      "priority_order": ["token", "state", "vector", "graph"]
    },
    "allocation": {
      "mode": "dynamic",
      "default": {
        "token": 0.3,
        "state": 0.2,
        "vector": 0.3,
        "graph": 0.2
      }
    }
  }
}
```

---

