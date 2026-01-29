# Compressed MCP Guidelines

## Overview

**Compressed MCP** uses context compression techniques to maximize information density within token budgets. This enables long-term memory and efficient context management.

**Key Challenge**: Balancing compression ratio with information preservation while maintaining semantic coherence and retrieval quality.

---

## 1. Summarization Techniques

### Extractive Summarization

Select key sentences:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

def extractive_summarize(text: str, num_sentences=5):
    """Extract key sentences using TF-IDF"""
    sentences = text.split('. ')
    
    if len(sentences) <= num_sentences:
        return text
    
    # Compute TF-IDF
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)
    
    # Score sentences by sum of TF-IDF values
    scores = np.array(tfidf_matrix.sum(axis=1)).flatten()
    
    # Get top sentences
    top_indices = np.argsort(scores)[-num_sentences:]
    top_indices = sorted(top_indices)  # Maintain order
    
    summary = '. '.join([sentences[i] for i in top_indices])
    return summary
```

### Abstractive Summarization

Generate new summary:

```python
def abstractive_summarize(text: str, max_tokens=200):
    """Generate abstractive summary using LLM"""
    prompt = f"""
    Summarize the following text in {max_tokens} tokens or less.
    Preserve key information and maintain coherence.
    
    Text: {text}
    
    Summary:
    """
    
    response = llm_call(prompt, max_tokens=max_tokens)
    return response.strip()
```

### Hierarchical Summarization

Multi-level compression:

```python
def hierarchical_summarize(text: str, levels=3):
    """Create multi-level summaries"""
    summaries = {'original': text}
    current_text = text
    
    compression_ratios = [0.5, 0.4, 0.25]  # 50%, 40%, 25% of previous
    
    for i, ratio in enumerate(compression_ratios[:levels]):
        current_tokens = count_tokens(current_text)
        target_tokens = int(current_tokens * ratio)
        
        summary = abstractive_summarize(current_text, max_tokens=target_tokens)
        summaries[f'level_{i+1}'] = summary
        current_text = summary
    
    return summaries
```

**Best Practices**:
- Use extractive for factual content
- Use abstractive for narrative content
- Use hierarchical for long documents
- Validate summary quality

---

## 2. Key-Value Memory

### Key-Value Store

Store compressed facts:

```python
class KeyValueMemory:
    """Key-value memory for compressed facts"""
    
    def __init__(self):
        self.memory = {}
    
    def extract_facts(self, text: str):
        """Extract key-value facts from text"""
        prompt = f"""
        Extract key facts from the text as key-value pairs.
        
        Text: {text}
        
        Return as JSON object: {{"key1": "value1", "key2": "value2", ...}}
        """
        
        response = llm_call(prompt)
        facts = json.loads(response)
        
        return facts
    
    def add(self, text: str):
        """Add text to memory"""
        facts = self.extract_facts(text)
        self.memory.update(facts)
    
    def retrieve(self, query: str, k=5):
        """Retrieve relevant facts"""
        # Compute relevance scores
        query_embedding = generate_embeddings([query])[0]
        
        scored_facts = []
        for key, value in self.memory.items():
            fact_text = f"{key}: {value}"
            fact_embedding = generate_embeddings([fact_text])[0]
            score = cosine_similarity(query_embedding, fact_embedding)
            scored_facts.append((key, value, score))
        
        # Return top-k
        scored_facts.sort(key=lambda x: x[2], reverse=True)
        return [(k, v) for k, v, s in scored_facts[:k]]
```

**Best Practices**:
- Extract atomic facts
- Use consistent key naming
- Index keys for fast retrieval
- Deduplicate facts

---

## 4. Context Distillation

### Progressive Distillation

Iteratively compress context:

```python
def progressive_distillation(text: str, target_tokens=500, iterations=3):
    """Progressively distill text to target size"""
    current_text = text
    current_tokens = count_tokens(current_text)

    for i in range(iterations):
        if current_tokens <= target_tokens:
            break

        # Calculate compression ratio for this iteration
        ratio = (target_tokens / current_tokens) ** (1 / (iterations - i))
        target_for_iteration = int(current_tokens * ratio)

        # Compress
        prompt = f"""
        Compress the following text to approximately {target_for_iteration} tokens.
        Preserve the most important information.

        Text: {current_text}

        Compressed:
        """

        current_text = llm_call(prompt, max_tokens=target_for_iteration)
        current_tokens = count_tokens(current_text)

    return current_text
```

### Selective Distillation

Compress based on importance:

```python
def selective_distillation(text: str, importance_threshold=0.7):
    """Distill text by removing low-importance content"""
    sentences = text.split('. ')

    # Score importance of each sentence
    prompt = f"""
    Rate the importance of each sentence on a scale of 0-1.

    Sentences:
    {chr(10).join(f"{i+1}. {s}" for i, s in enumerate(sentences))}

    Return as JSON array: [0.9, 0.5, 0.8, ...]
    """

    response = llm_call(prompt)
    scores = json.loads(response)

    # Keep only important sentences
    important_sentences = [
        sentences[i] for i, score in enumerate(scores)
        if score >= importance_threshold
    ]

    return '. '.join(important_sentences)
```

### Lossy Compression

Trade accuracy for compression:

```python
def lossy_compress(text: str, compression_level='medium'):
    """Apply lossy compression"""
    levels = {
        'low': {'ratio': 0.7, 'detail': 'high'},
        'medium': {'ratio': 0.4, 'detail': 'medium'},
        'high': {'ratio': 0.2, 'detail': 'low'}
    }

    config = levels[compression_level]
    target_tokens = int(count_tokens(text) * config['ratio'])

    prompt = f"""
    Compress the text to {target_tokens} tokens with {config['detail']} detail level.
    Focus on key information, omit minor details.

    Text: {text}

    Compressed:
    """

    return llm_call(prompt, max_tokens=target_tokens)
```

**Best Practices**:
- Use progressive distillation for gradual compression
- Use selective distillation to preserve important content
- Use lossy compression when high compression is needed
- Monitor information loss

---

## 5. Compression Strategies

### Temporal Compression

Compress older content more aggressively:

```python
from datetime import datetime, timedelta

class TemporalCompressor:
    """Compress content based on age"""

    def __init__(self):
        self.memory = []

    def add(self, text: str):
        """Add text with timestamp"""
        self.memory.append({
            'text': text,
            'timestamp': datetime.now(),
            'compressed': None
        })

    def compress_by_age(self):
        """Compress based on age"""
        now = datetime.now()

        for item in self.memory:
            age_days = (now - item['timestamp']).days

            if age_days < 1:
                # Recent: no compression
                item['compressed'] = item['text']
            elif age_days < 7:
                # 1-7 days: light compression (70%)
                item['compressed'] = lossy_compress(item['text'], 'low')
            elif age_days < 30:
                # 7-30 days: medium compression (40%)
                item['compressed'] = lossy_compress(item['text'], 'medium')
            else:
                # 30+ days: high compression (20%)
                item['compressed'] = lossy_compress(item['text'], 'high')

    def retrieve(self, query: str, token_budget=2048):
        """Retrieve compressed content within budget"""
        self.compress_by_age()

        # Score relevance
        query_embedding = generate_embeddings([query])[0]
        scored_items = []

        for item in self.memory:
            text = item['compressed'] or item['text']
            embedding = generate_embeddings([text])[0]
            score = cosine_similarity(query_embedding, embedding)
            scored_items.append((item, score))

        # Select within budget
        scored_items.sort(key=lambda x: x[1], reverse=True)
        selected = []
        total_tokens = 0

        for item, score in scored_items:
            text = item['compressed'] or item['text']
            tokens = count_tokens(text)

            if total_tokens + tokens <= token_budget:
                selected.append(text)
                total_tokens += tokens
            else:
                break

        return selected
```

### Adaptive Compression

Adjust compression based on usage:

```python
class AdaptiveCompressor:
    """Adaptively compress based on access patterns"""

    def __init__(self):
        self.memory = {}

    def add(self, key: str, text: str):
        """Add text to memory"""
        self.memory[key] = {
            'original': text,
            'compressed': None,
            'access_count': 0,
            'last_accessed': datetime.now()
        }

    def access(self, key: str):
        """Access and update stats"""
        if key in self.memory:
            self.memory[key]['access_count'] += 1
            self.memory[key]['last_accessed'] = datetime.now()
            return self.memory[key]['compressed'] or self.memory[key]['original']
        return None

    def compress_all(self):
        """Compress based on access patterns"""
        for key, item in self.memory.items():
            # Frequently accessed: light compression
            if item['access_count'] > 10:
                compression_level = 'low'
            # Moderately accessed: medium compression
            elif item['access_count'] > 3:
                compression_level = 'medium'
            # Rarely accessed: high compression
            else:
                compression_level = 'high'

            item['compressed'] = lossy_compress(item['original'], compression_level)
```

**Best Practices**:
- Compress older content more aggressively
- Preserve frequently accessed content
- Adjust compression based on usage patterns
- Monitor compression ratios

---

## 6. Best Practices

### DO

✅ **Use hierarchical summarization**: Multiple compression levels
✅ **Extract key-value facts**: Atomic information
✅ **Apply temporal compression**: Age-based compression
✅ **Monitor compression ratios**: Track information loss
✅ **Validate compressed content**: Ensure quality
✅ **Combine techniques**: Summarization + key-value + gist
✅ **Cache compressed results**: Avoid recomputation
✅ **Use adaptive compression**: Based on access patterns

### DON'T

❌ **Don't over-compress**: Balance ratio vs quality
❌ **Don't lose critical information**: Validate preservation
❌ **Don't compress everything equally**: Prioritize by importance
❌ **Don't forget original text**: Maintain mapping
❌ **Don't ignore compression artifacts**: Monitor quality
❌ **Don't use single compression level**: Adapt to content
❌ **Don't compress without validation**: Test quality

---

## 7. Common Pitfalls

### Information Loss

**Problem**: Critical information lost in compression

**Solution**:
- Use extractive summarization for facts
- Validate compressed content
- Maintain importance scores
- Keep original text accessible

### Poor Compression Ratio

**Problem**: Compression doesn't save enough tokens

**Solution**:
- Use abstractive summarization
- Apply progressive distillation
- Combine multiple techniques
- Use gist tokens for extreme compression

### Semantic Drift

**Problem**: Compressed content loses original meaning

**Solution**:
- Validate semantic similarity
- Use hierarchical compression
- Test retrieval quality
- Adjust compression parameters

---

## 8. Integration Example

Complete compressed MCP implementation:

```python
class CompressedMCP:
    """Complete compressed MCP implementation"""

    def __init__(self, config: dict):
        self.config = config
        self.temporal_compressor = TemporalCompressor()
        self.kv_memory = KeyValueMemory()
        self.gist_memory = GistMemory()

    def add(self, text: str):
        """Add text to all memory types"""
        # Add to temporal compressor
        self.temporal_compressor.add(text)

        # Extract and add key-value facts
        self.kv_memory.add(text)

        # Add as gist tokens
        self.gist_memory.add(text, num_gist_tokens=10)

    def retrieve(self, query: str, token_budget=2048):
        """Retrieve compressed context"""
        # Allocate budget
        temporal_budget = int(token_budget * 0.5)
        kv_budget = int(token_budget * 0.3)
        gist_budget = int(token_budget * 0.2)

        # Retrieve from each memory type
        temporal_results = self.temporal_compressor.retrieve(query, temporal_budget)
        kv_results = self.kv_memory.retrieve(query, k=10)
        gist_results = self.gist_memory.retrieve(query, k=5)

        # Combine results
        context = {
            'temporal': temporal_results,
            'facts': kv_results,
            'gists': gist_results
        }

        return context
```

---

## Configuration Example

```json
{
  "mcp": {
    "type": "compressed",
    "summarization": {
      "method": "hierarchical",
      "levels": 3,
      "compressionRatios": [0.5, 0.4, 0.25]
    },
    "keyValue": {
      "enabled": true,
      "maxFacts": 1000
    },
    "gistTokens": {
      "enabled": true,
      "tokensPerGist": 10,
      "maxGists": 100
    },
    "temporalCompression": {
      "enabled": true,
      "ageBuckets": [
        {"days": 1, "compressionLevel": "none"},
        {"days": 7, "compressionLevel": "low"},
        {"days": 30, "compressionLevel": "medium"},
        {"days": 999999, "compressionLevel": "high"}
      ]
    },
    "tokenBudget": {
      "maxCompressedTokens": 2048,
      "allocation": {
        "temporal": 0.5,
        "keyValue": 0.3,
        "gist": 0.2
      }
    }
  }
}
```

---

## 3. Gist Tokens

### Gist Token Generation

Compress context into special tokens:

```python
def generate_gist_tokens(text: str, num_gist_tokens=10):
    """Generate gist tokens for text"""
    # Use LLM to generate ultra-compressed representation
    prompt = f"""
    Compress the following text into exactly {num_gist_tokens} key phrases.
    Each phrase should be 2-5 words and capture essential information.
    
    Text: {text}
    
    Return as JSON array: ["phrase1", "phrase2", ...]
    """
    
    response = llm_call(prompt)
    gist_tokens = json.loads(response)
    
    return gist_tokens[:num_gist_tokens]

class GistMemory:
    """Memory using gist tokens"""
    
    def __init__(self):
        self.gists = []
    
    def add(self, text: str, num_gist_tokens=10):
        """Add text as gist tokens"""
        gist_tokens = generate_gist_tokens(text, num_gist_tokens)
        self.gists.append({
            'gist_tokens': gist_tokens,
            'original_length': count_tokens(text),
            'compressed_length': sum(count_tokens(t) for t in gist_tokens)
        })
    
    def retrieve(self, query: str, k=5):
        """Retrieve relevant gists"""
        query_embedding = generate_embeddings([query])[0]
        
        scored_gists = []
        for gist in self.gists:
            gist_text = ' '.join(gist['gist_tokens'])
            gist_embedding = generate_embeddings([gist_text])[0]
            score = cosine_similarity(query_embedding, gist_embedding)
            scored_gists.append((gist, score))
        
        scored_gists.sort(key=lambda x: x[1], reverse=True)
        return [g for g, s in scored_gists[:k]]
```

**Best Practices**:
- Use gist tokens for extreme compression
- Maintain mapping to original text
- Use for long-term memory
- Combine with other compression techniques

---


