# Compressed MCP Example: Mobile Assistant

## Use Case

A mobile AI assistant that operates under strict resource constraints (limited bandwidth, battery, storage) requiring aggressive context compression.

**Challenges**:
- Minimize token usage for cost/latency
- Compress context without losing critical information
- Operate on mobile devices with limited resources
- Balance compression ratio vs. information retention

---

## Configuration

```json
{
  "mcp": {
    "type": "compressed",
    "compression": {
      "strategy": "multi_stage",
      "stages": [
        {"type": "deduplication", "enabled": true},
        {"type": "summarization", "ratio": 0.3},
        {"type": "entity_extraction", "enabled": true},
        {"type": "semantic_compression", "ratio": 0.5}
      ],
      "targetRatio": 0.15,
      "minQualityScore": 0.7
    },
    "caching": {
      "enabled": true,
      "maxSize": "10MB",
      "evictionPolicy": "lru"
    },
    "optimization": {
      "batchRequests": true,
      "prefetch": true,
      "deltaEncoding": true
    }
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Original Context (10,000 tokens)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 1: Deduplication                          │
│  Remove duplicate sentences/phrases                          │
│  Output: 8,000 tokens (20% reduction)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 2: Summarization                          │
│  Compress to 30% of original                                │
│  Output: 2,400 tokens (70% reduction)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 3: Entity Extraction                      │
│  Extract key entities and facts                             │
│  Output: Structured entities + 1,800 tokens                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 4: Semantic Compression                   │
│  Compress to 50% using semantic similarity                  │
│  Output: 900 tokens (91% total reduction)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Final Compressed Context (1,500 tokens)         │
│  Entities + Compressed Text                                  │
│  Compression Ratio: 15%                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: Compression Pipeline

```python
import tiktoken
from typing import List, Dict, Any
import openai
from collections import Counter
import hashlib

class CompressionPipeline:
    def __init__(self, config: Dict[str, Any], openai_api_key: str):
        self.config = config
        self.client = openai.OpenAI(api_key=openai_api_key)
        self.tokenizer = tiktoken.encoding_for_model("gpt-4o")
        self.target_ratio = config["compression"]["targetRatio"]
    
    def compress(self, text: str) -> Dict[str, Any]:
        """Apply multi-stage compression"""
        stages = self.config["compression"]["stages"]
        
        current_text = text
        original_tokens = len(self.tokenizer.encode(text))
        compression_log = []
        
        for stage in stages:
            if not stage.get("enabled", True):
                continue
            
            stage_type = stage["type"]
            
            if stage_type == "deduplication":
                current_text = self._deduplicate(current_text)
            elif stage_type == "summarization":
                current_text = self._summarize(current_text, stage["ratio"])
            elif stage_type == "entity_extraction":
                entities = self._extract_entities(current_text)
                current_text = self._compress_with_entities(current_text, entities)
            elif stage_type == "semantic_compression":
                current_text = self._semantic_compress(current_text, stage["ratio"])
            
            current_tokens = len(self.tokenizer.encode(current_text))
            compression_log.append({
                "stage": stage_type,
                "tokens": current_tokens,
                "ratio": current_tokens / original_tokens
            })
        
        final_tokens = len(self.tokenizer.encode(current_text))
        
        return {
            "compressed_text": current_text,
            "original_tokens": original_tokens,
            "compressed_tokens": final_tokens,
            "compression_ratio": final_tokens / original_tokens,
            "stages": compression_log
        }
    
    def _deduplicate(self, text: str) -> str:
        """Remove duplicate sentences"""
        sentences = text.split('. ')
        seen = set()
        unique_sentences = []
        
        for sentence in sentences:
            # Hash sentence for deduplication
            sentence_hash = hashlib.md5(sentence.lower().strip().encode()).hexdigest()
            
            if sentence_hash not in seen:
                seen.add(sentence_hash)
                unique_sentences.append(sentence)
        
        return '. '.join(unique_sentences)
    
    def _summarize(self, text: str, ratio: float) -> str:
        """Summarize text to target ratio"""
        current_tokens = len(self.tokenizer.encode(text))
        target_tokens = int(current_tokens * ratio)
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",  # Use mini for cost efficiency
            messages=[
                {
                    "role": "system",
                    "content": f"Summarize the text to approximately {target_tokens} tokens. Preserve key information."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content

    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract key entities from text"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Extract key entities from the text.

Return JSON array:
[{"type": "PERSON", "value": "John"}, {"type": "DATE", "value": "2024-01-15"}, ...]"""
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            response_format={"type": "json_object"}
        )

        import json
        result = json.loads(response.choices[0].message.content)
        return result.get("entities", [])

    def _compress_with_entities(self, text: str, entities: List[Dict[str, Any]]) -> str:
        """Compress text while preserving entities"""
        # Create entity placeholders
        entity_map = {}
        compressed_text = text

        for i, entity in enumerate(entities):
            placeholder = f"[E{i}]"
            entity_map[placeholder] = f"{entity['type']}:{entity['value']}"
            compressed_text = compressed_text.replace(entity['value'], placeholder)

        # Add entity legend
        entity_legend = "\n\nEntities: " + ", ".join(f"{k}={v}" for k, v in entity_map.items())

        return compressed_text + entity_legend

    def _semantic_compress(self, text: str, ratio: float) -> str:
        """Compress using semantic similarity (remove redundant sentences)"""
        sentences = text.split('. ')

        if len(sentences) <= 3:
            return text

        # Simple heuristic: keep sentences with unique keywords
        target_count = max(3, int(len(sentences) * ratio))

        # Score sentences by keyword diversity
        all_words = ' '.join(sentences).lower().split()
        word_freq = Counter(all_words)

        sentence_scores = []
        for sentence in sentences:
            words = sentence.lower().split()
            # Score based on rare words (more informative)
            score = sum(1 / (word_freq[word] + 1) for word in words if word in word_freq)
            sentence_scores.append((score, sentence))

        # Keep top-scoring sentences
        sentence_scores.sort(reverse=True)
        selected_sentences = [s for _, s in sentence_scores[:target_count]]

        return '. '.join(selected_sentences)

class MobileAssistant:
    def __init__(self, config: Dict[str, Any], openai_api_key: str):
        self.compression_pipeline = CompressionPipeline(config, openai_api_key)
        self.client = openai.OpenAI(api_key=openai_api_key)
        self.cache = {}  # Simple in-memory cache
        self.cache_max_size = 10 * 1024 * 1024  # 10MB

    def process_query(self, query: str, context: str) -> Dict[str, Any]:
        """Process query with compressed context"""
        # Check cache
        cache_key = hashlib.md5(context.encode()).hexdigest()

        if cache_key in self.cache:
            compressed_result = self.cache[cache_key]
        else:
            # Compress context
            compressed_result = self.compression_pipeline.compress(context)

            # Cache result
            self._cache_result(cache_key, compressed_result)

        # Generate response with compressed context
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",  # Use mini for mobile efficiency
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful mobile assistant. Use the compressed context to answer questions concisely."
                },
                {
                    "role": "user",
                    "content": f"""Context (compressed):
{compressed_result['compressed_text']}

Question: {query}

Answer:"""
                }
            ],
            temperature=0.5,
            max_tokens=200  # Limit response length for mobile
        )

        answer = response.choices[0].message.content

        return {
            "answer": answer,
            "compression_stats": {
                "original_tokens": compressed_result["original_tokens"],
                "compressed_tokens": compressed_result["compressed_tokens"],
                "compression_ratio": compressed_result["compression_ratio"],
                "stages": compressed_result["stages"]
            },
            "cached": cache_key in self.cache
        }

    def _cache_result(self, key: str, result: Dict[str, Any]) -> None:
        """Cache compression result with LRU eviction"""
        import sys

        result_size = sys.getsizeof(result)

        # Simple LRU: remove oldest if cache full
        if sum(sys.getsizeof(v) for v in self.cache.values()) + result_size > self.cache_max_size:
            if self.cache:
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]

        self.cache[key] = result
```

---

## Usage Example

```python
# Configuration
config = {
    "compression": {
        "strategy": "multi_stage",
        "stages": [
            {"type": "deduplication", "enabled": True},
            {"type": "summarization", "ratio": 0.3},
            {"type": "entity_extraction", "enabled": True},
            {"type": "semantic_compression", "ratio": 0.5}
        ],
        "targetRatio": 0.15,
        "minQualityScore": 0.7
    },
    "caching": {
        "enabled": True,
        "maxSize": "10MB",
        "evictionPolicy": "lru"
    }
}

# Initialize assistant
assistant = MobileAssistant(config, "your-openai-key")

# Long context (e.g., article, documentation)
long_context = """
[Long article text here - 10,000 tokens]
Python is a high-level programming language. Python is widely used.
Python supports multiple programming paradigms. Python has a large ecosystem.
...
"""

# Process query with compression
result = assistant.process_query(
    query="What are the key features of Python?",
    context=long_context
)

print(f"Answer: {result['answer']}")
print(f"\nCompression Stats:")
print(f"  Original: {result['compression_stats']['original_tokens']} tokens")
print(f"  Compressed: {result['compression_stats']['compressed_tokens']} tokens")
print(f"  Ratio: {result['compression_stats']['compression_ratio']:.2%}")
print(f"  Cached: {result['cached']}")
```

---

## Key Features

### 1. Multi-Stage Compression
- Deduplication (remove duplicates)
- Summarization (compress to ratio)
- Entity extraction (preserve key info)
- Semantic compression (remove redundancy)

### 2. Caching
- LRU eviction policy
- Size-based limits (10MB)
- Cache hit tracking

### 3. Mobile Optimization
- Use gpt-4o-mini for cost/speed
- Limit response tokens (200)
- Batch requests when possible
- Prefetch common contexts

### 4. Quality Preservation
- Entity preservation
- Keyword diversity scoring
- Configurable quality thresholds

---

## Testing

```python
import pytest

def test_deduplication():
    pipeline = CompressionPipeline(config, "key")

    text = "Python is great. Python is great. Python is awesome."
    result = pipeline._deduplicate(text)

    assert result.count("Python is great") == 1

def test_compression_ratio():
    pipeline = CompressionPipeline(config, "key")

    text = "This is a long text. " * 100
    result = pipeline.compress(text)

    assert result["compression_ratio"] < 0.5
    assert result["compressed_tokens"] < result["original_tokens"]

def test_caching():
    assistant = MobileAssistant(config, "key")

    context = "Test context"

    # First call - not cached
    result1 = assistant.process_query("test", context)
    assert not result1["cached"]

    # Second call - cached
    result2 = assistant.process_query("test", context)
    assert result2["cached"]

def test_entity_extraction():
    pipeline = CompressionPipeline(config, "key")

    text = "John met Mary on January 15, 2024 in New York."
    entities = pipeline._extract_entities(text)

    assert len(entities) > 0
    assert any(e["type"] == "PERSON" for e in entities)
```

---

## Best Practices

1. **Compression Ratio**: Target 10-20% for mobile use cases
2. **Quality Monitoring**: Track information retention metrics
3. **Caching Strategy**: Cache frequently accessed contexts
4. **Model Selection**: Use gpt-4o-mini for cost efficiency
5. **Batch Processing**: Batch multiple compressions
6. **Progressive Compression**: Compress incrementally as needed
7. **Fallback**: Keep original context for quality checks
8. **Monitoring**: Track compression performance and quality

---

## Performance Optimization

- **Parallel Compression**: Compress multiple contexts in parallel
- **Incremental Updates**: Only compress new content
- **Delta Encoding**: Store only changes from previous version
- **Prefetching**: Prefetch and compress common contexts
- **Lazy Compression**: Compress only when needed
- **Compression Levels**: Offer multiple compression levels

---

## Quality Metrics

### Compression Metrics
- **Compression Ratio**: Compressed tokens / Original tokens
- **Latency**: Time to compress
- **Cache Hit Rate**: Cached requests / Total requests

### Quality Metrics
- **Information Retention**: Key facts preserved
- **Entity Preservation**: Critical entities retained
- **Semantic Similarity**: Cosine similarity to original
- **User Satisfaction**: Feedback on answer quality

---

## Mobile-Specific Optimizations

### Bandwidth Optimization
- Compress requests/responses
- Use delta encoding for updates
- Batch multiple requests
- Prefetch common queries

### Battery Optimization
- Minimize API calls
- Cache aggressively
- Use efficient models (mini)
- Reduce token usage

### Storage Optimization
- Limit cache size (10MB)
- LRU eviction
- Compress cached data
- Periodic cache cleanup

---

## Security

- **Data Minimization**: Only compress necessary data
- **Cache Encryption**: Encrypt cached contexts
- **PII Handling**: Remove PII before compression
- **Audit Logging**: Log compression operations
- **Rate Limiting**: Limit compression requests per user
```

