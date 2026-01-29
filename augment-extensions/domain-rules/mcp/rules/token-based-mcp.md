# Token-Based MCP Guidelines

## Overview

**Token-based MCP** focuses on managing context within the constraints of LLM token limits. This is the most fundamental MCP type and applies to all LLM applications.

**Key Challenge**: Modern LLMs have large but finite context windows (e.g., 200k tokens). Effective token management ensures optimal use of this limited resource.

---

## 1. Context Window Management

### Window Sizing

Calculate the **effective context window**:

```python
effective_window = model_max_tokens - output_buffer - system_prompt_tokens

# Example: GPT-4o (200k context)
model_max_tokens = 200000
output_buffer = 4096  # Reserve for response
system_prompt_tokens = 500
effective_window = 200000 - 4096 - 500 = 195404 tokens
```

**Best Practices**:
- Always reserve output buffer (typically 2k-4k tokens)
- Account for system prompt in budget
- Use token counters (tiktoken, transformers) for accuracy
- Monitor actual vs budgeted usage

### Sliding Windows

Implement rolling context with overlap:

```python
def sliding_window(text, window_size=4096, overlap=512):
    """Create sliding windows with overlap"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + window_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap  # Overlap for context continuity
    
    return chunks
```

**Use Cases**:
- Long document processing
- Streaming applications
- Incremental analysis

### Hierarchical Summarization

Multi-level summaries for long documents:

```python
def hierarchical_summarize(document, levels=3):
    """Create multi-level summaries"""
    summaries = {}
    
    # Level 1: Detailed summary (50% compression)
    summaries['detailed'] = summarize(document, ratio=0.5)
    
    # Level 2: Medium summary (20% compression)
    summaries['medium'] = summarize(summaries['detailed'], ratio=0.4)
    
    # Level 3: Gist (5% compression)
    summaries['gist'] = summarize(summaries['medium'], ratio=0.25)
    
    return summaries
```

**Use Cases**:
- Legal contracts
- Research papers
- Technical documentation

### Entity Spotlighting

Maintain entity reference tables:

```python
def extract_entity_table(text):
    """Extract key entities and their context"""
    entities = {}
    
    # Extract entities (using NER or LLM)
    for entity in extract_entities(text):
        entities[entity.name] = {
            'type': entity.type,
            'first_mention': entity.first_occurrence,
            'context': entity.surrounding_text[:200],
            'frequency': entity.count
        }
    
    return entities
```

**Use Cases**:
- Multi-party conversations
- Complex narratives
- Technical documents with many terms

---

## 2. Prompt Compression

### Template Optimization

Minimize system prompt tokens:

```python
# ❌ Verbose (150 tokens)
system_prompt = """
You are a helpful AI assistant. Your role is to provide accurate and 
comprehensive answers to user questions. Please be polite, professional, 
and thorough in your responses. Always cite sources when possible.
"""

# ✅ Concise (40 tokens)
system_prompt = "Helpful AI assistant. Provide accurate, cited answers."
```

**Best Practices**:
- Remove filler words
- Use abbreviations where clear
- Combine related instructions
- Test that compression doesn't hurt quality

### Instruction Compression

Use concise, effective instructions:

```python
# ❌ Verbose
instruction = "Please analyze the following document and extract all the key points, then summarize them in a bullet list format"

# ✅ Concise
instruction = "Extract and list key points from document"
```

### Example Selection

Choose minimal representative examples:

```python
def select_few_shot_examples(query, example_pool, k=3):
    """Select most relevant examples for few-shot prompting"""
    # Embed query and examples
    query_embedding = embed(query)
    example_embeddings = [embed(ex) for ex in example_pool]
    
    # Select top-k most similar
    similarities = [cosine_similarity(query_embedding, ex_emb) 
                   for ex_emb in example_embeddings]
    top_k_indices = sorted(range(len(similarities)), 
                          key=lambda i: similarities[i], 
                          reverse=True)[:k]
    
    return [example_pool[i] for i in top_k_indices]
```

### Format Efficiency

Use token-efficient formats:

```python
# ❌ Verbose JSON (120 tokens)
data = {
    "customer_name": "John Smith",
    "customer_email": "john@example.com",
    "order_id": "ORD-12345",
    "order_total": "$99.99"
}

# ✅ Compact format (60 tokens)
data = "Name: John Smith | Email: john@example.com | Order: ORD-12345 | Total: $99.99"
```

---

## 3. Chunking Strategies

### Semantic Chunking

Split on logical boundaries:

```python
def semantic_chunk(text, max_chunk_size=512):
    """Chunk text on semantic boundaries"""
    # Split on paragraphs first
    paragraphs = text.split('\n\n')
    
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para_tokens = count_tokens(para)
        current_tokens = count_tokens(current_chunk)
        
        if current_tokens + para_tokens > max_chunk_size:
            # Chunk is full, start new one
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = para
        else:
            current_chunk += "\n\n" + para if current_chunk else para
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks
```

**Boundaries** (in order of preference):
1. Document sections
2. Paragraphs
3. Sentences
4. Fixed token count (last resort)

### Size Optimization

Balance chunk size vs retrieval granularity:

```python
# Small chunks (256 tokens): High precision, low recall
# Medium chunks (512 tokens): Balanced (recommended)
# Large chunks (1024 tokens): High recall, low precision

CHUNK_SIZE_GUIDELINES = {
    'qa': 512,           # Question answering
    'summarization': 1024,  # Document summarization
    'search': 256,       # Semantic search
    'chat': 512          # Conversational AI
}
```

### Overlap

Include context overlap between chunks:

```python
def chunk_with_overlap(text, chunk_size=512, overlap=50):
    """Create chunks with overlap for context continuity"""
    tokens = tokenize(text)
    chunks = []
    
    start = 0
    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(detokenize(chunk_tokens))
        start = end - overlap  # Overlap for continuity
    
    return chunks
```

**Overlap Guidelines**:
- 10-20% overlap for most use cases
- Higher overlap (30-40%) for complex documents
- Lower overlap (5-10%) for cost-sensitive applications

### Metadata

Attach source/position metadata to chunks:

```python
def chunk_with_metadata(document, chunk_size=512):
    """Create chunks with metadata"""
    chunks = []
    
    for i, chunk_text in enumerate(semantic_chunk(document.text, chunk_size)):
        chunks.append({
            'text': chunk_text,
            'metadata': {
                'source': document.source,
                'chunk_index': i,
                'total_chunks': len(chunks),
                'document_id': document.id,
                'timestamp': document.timestamp
            }
        })
    
    return chunks
```

---

## 4. Token Budgeting

### Allocation

Define budget for each component:

```python
class TokenBudget:
    def __init__(self, max_tokens=200000):
        self.max_tokens = max_tokens
        self.allocation = {
            'system_prompt': 500,      # 0.25%
            'user_input': 2000,        # 1%
            'retrieved_context': 160000,  # 80%
            'conversation_history': 33404,  # 16.7%
            'output_buffer': 4096      # 2.05%
        }
    
    def validate(self):
        total = sum(self.allocation.values())
        assert total <= self.max_tokens, f"Budget exceeds max: {total} > {self.max_tokens}"
```

### Monitoring

Track actual vs budgeted usage:

```python
def monitor_token_usage(request_id, actual_tokens, budgeted_tokens):
    """Monitor token usage"""
    usage_ratio = actual_tokens / budgeted_tokens
    
    if usage_ratio > 1.0:
        logger.warning(f"Token budget exceeded: {actual_tokens} > {budgeted_tokens}")
        metrics.increment('token_budget_exceeded', tags={'request_id': request_id})
    
    metrics.gauge('token_usage_ratio', usage_ratio, tags={'request_id': request_id})
```

### Dynamic Adjustment

Reallocate budget based on request type:

```python
def adjust_budget(request_type, base_budget):
    """Adjust budget based on request type"""
    adjustments = {
        'simple_qa': {'retrieved_context': 0.5, 'output_buffer': 1.5},
        'summarization': {'retrieved_context': 1.2, 'output_buffer': 0.8},
        'analysis': {'retrieved_context': 1.0, 'output_buffer': 1.2}
    }
    
    multipliers = adjustments.get(request_type, {})
    adjusted = base_budget.copy()
    
    for component, multiplier in multipliers.items():
        adjusted[component] = int(base_budget[component] * multiplier)
    
    return adjusted
```

### Cost Estimation

Calculate cost before API calls:

```python
def estimate_cost(tokens, model='gpt-4o'):
    """Estimate API cost"""
    pricing = {
        'gpt-4o': {'input': 0.005, 'output': 0.015},  # per 1k tokens
        'claude-3.5-sonnet': {'input': 0.003, 'output': 0.015}
    }
    
    input_cost = (tokens['input'] / 1000) * pricing[model]['input']
    output_cost = (tokens['output'] / 1000) * pricing[model]['output']
    
    return input_cost + output_cost
```

---

## Best Practices

✅ **DO**:
- Use accurate token counters (tiktoken for OpenAI, transformers for others)
- Cap injected context at 80-85% of window to allow output space
- Implement token-aware truncation (preserve important content)
- Cache tokenized prompts when possible
- Profile token usage in production
- Use semantic chunking over fixed-size chunking
- Include overlap between chunks for context continuity

❌ **DON'T**:
- Estimate tokens by character count (inaccurate)
- Fill entire context window (no room for output)
- Truncate context arbitrarily (lose important information)
- Ignore token budget overruns
- Use verbose prompts unnecessarily
- Chunk on arbitrary boundaries (mid-sentence)

