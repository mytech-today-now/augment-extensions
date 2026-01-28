# Vector Embeddings

## Overview

This document covers vector embedding fundamentals, including embedding models (OpenAI, Cohere, sentence-transformers), embedding dimensions, chunking strategies, metadata storage, embedding updates, versioning, batch processing, and cost optimization.

---

## What are Vector Embeddings?

### Definition

**Vector Embedding**: A numerical representation of data (text, images, audio) as a high-dimensional vector

**Key Concepts:**
- Converts unstructured data to structured vectors
- Captures semantic meaning in numerical form
- Similar items have similar embeddings (close in vector space)
- Enables mathematical operations on meaning

**Example:**
```
Text: "The cat sat on the mat"
Embedding: [0.234, -0.567, 0.891, ..., 0.123]  # 1536 dimensions

Text: "A feline rested on the rug"
Embedding: [0.241, -0.553, 0.879, ..., 0.118]  # Similar vector!
```

### How Embeddings Work

**1. Training:**
- ML models trained on large datasets
- Learn to represent semantic meaning as vectors
- Similar meanings → similar vectors

**2. Generation:**
- Input data (text, image, etc.)
- Model processes input
- Outputs fixed-size vector

**3. Usage:**
- Store vectors in vector database
- Compare vectors using distance metrics
- Find similar items by vector similarity

---

## Embedding Models

### Popular Embedding Models

**OpenAI Embeddings**
- **Model**: `text-embedding-3-small`, `text-embedding-3-large`
- **Dimensions**: 1536 (small), 3072 (large)
- **Max Input**: 8191 tokens
- **Cost**: $0.02 / 1M tokens (small), $0.13 / 1M tokens (large)
- **Best for**: General-purpose text embeddings, high quality
- **API**: OpenAI API (requires API key)

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)

embedding = response.data[0].embedding  # 1536-dimensional vector
```

**Cohere Embeddings**
- **Model**: `embed-english-v3.0`, `embed-multilingual-v3.0`
- **Dimensions**: 1024 (default), configurable
- **Max Input**: 512 tokens
- **Cost**: $0.10 / 1M tokens
- **Best for**: Multilingual support, semantic search
- **API**: Cohere API (requires API key)

```python
import cohere

co = cohere.Client("your-api-key")

response = co.embed(
    texts=["Your text here"],
    model="embed-english-v3.0",
    input_type="search_document"  # or "search_query"
)

embedding = response.embeddings[0]  # 1024-dimensional vector
```

**Sentence Transformers (Open Source)**
- **Models**: `all-MiniLM-L6-v2`, `all-mpnet-base-v2`, `multi-qa-mpnet-base-dot-v1`
- **Dimensions**: 384 (MiniLM), 768 (mpnet)
- **Max Input**: 256-512 tokens (model-dependent)
- **Cost**: Free (self-hosted)
- **Best for**: Self-hosting, cost optimization, privacy
- **Library**: Hugging Face Transformers

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

embedding = model.encode("Your text here")  # 384-dimensional vector
```

**Voyage AI**
- **Model**: `voyage-2`, `voyage-code-2`
- **Dimensions**: 1024
- **Max Input**: 16000 tokens
- **Cost**: $0.12 / 1M tokens
- **Best for**: Long documents, code embeddings
- **API**: Voyage AI API

**Google Vertex AI (PaLM)**
- **Model**: `textembedding-gecko`
- **Dimensions**: 768
- **Max Input**: 3072 tokens
- **Cost**: $0.025 / 1M tokens
- **Best for**: Google Cloud users
- **API**: Google Cloud Vertex AI

### Model Selection Criteria

| Model | Dimensions | Quality | Cost | Speed | Best For |
|-------|------------|---------|------|-------|----------|
| OpenAI (large) | 3072 | Highest | High | Medium | Production, high quality |
| OpenAI (small) | 1536 | High | Medium | Fast | Production, balanced |
| Cohere | 1024 | High | Medium | Fast | Multilingual, semantic search |
| Sentence Transformers | 384-768 | Medium | Free | Fast | Self-hosting, cost optimization |
| Voyage AI | 1024 | High | Medium | Medium | Long documents, code |

**Recommendation**: 
- **Production**: OpenAI `text-embedding-3-small` (balanced quality/cost)
- **Self-hosted**: Sentence Transformers `all-mpnet-base-v2` (best quality)
- **Multilingual**: Cohere `embed-multilingual-v3.0`
- **Code**: Voyage AI `voyage-code-2`

---

## Embedding Dimensions

### Understanding Dimensions

**Dimension**: Number of values in the embedding vector

**Trade-offs:**
- **Higher dimensions** (1536, 3072):
  - More expressive (capture more nuance)
  - Better quality (more accurate similarity)
  - Slower search (more computations)
  - More storage (larger vectors)
  
- **Lower dimensions** (384, 768):
  - Less expressive (less nuance)
  - Lower quality (less accurate)
  - Faster search (fewer computations)
  - Less storage (smaller vectors)

### Dimension Recommendations

**Small datasets (< 100k documents):**
- Use higher dimensions (1536+)
- Quality > speed
- Storage cost is minimal

**Large datasets (> 1M documents):**
- Consider lower dimensions (384-768)
- Speed and storage matter
- Quality may still be acceptable

**Real-time applications:**
- Use lower dimensions (384-768)
- Latency is critical
- Batch pre-compute embeddings

---

## Chunking Strategies

### Why Chunking Matters

**Problem**: Documents are often too long for embedding models (max 512-8191 tokens)

**Solution**: Split documents into smaller chunks, embed each chunk separately

**Benefits:**
- Fit within model token limits
- More granular search (find specific sections)
- Better context matching

**Challenges:**
- Losing context across chunks
- Determining optimal chunk size
- Handling chunk boundaries

### Chunking Methods

**Method 1: Fixed-Size Chunking**
```python
def chunk_by_tokens(text, chunk_size=512, overlap=50):
    """Split text into fixed-size chunks with overlap"""
    tokens = tokenize(text)
    chunks = []

    for i in range(0, len(tokens), chunk_size - overlap):
        chunk = tokens[i:i + chunk_size]
        chunks.append(detokenize(chunk))

    return chunks

# Example
text = "Long document..."
chunks = chunk_by_tokens(text, chunk_size=512, overlap=50)
```

**Pros**: Simple, predictable chunk sizes
**Cons**: May split sentences/paragraphs awkwardly

**Method 2: Sentence-Based Chunking**
```python
def chunk_by_sentences(text, max_tokens=512):
    """Split text by sentences, group until max_tokens"""
    sentences = split_into_sentences(text)
    chunks = []
    current_chunk = []
    current_tokens = 0

    for sentence in sentences:
        sentence_tokens = count_tokens(sentence)

        if current_tokens + sentence_tokens > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_tokens = sentence_tokens
        else:
            current_chunk.append(sentence)
            current_tokens += sentence_tokens

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
```

**Pros**: Preserves sentence boundaries
**Cons**: Variable chunk sizes

**Method 3: Paragraph-Based Chunking**
```python
def chunk_by_paragraphs(text, max_tokens=512):
    """Split text by paragraphs, group until max_tokens"""
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_tokens = 0

    for para in paragraphs:
        para_tokens = count_tokens(para)

        if para_tokens > max_tokens:
            # Split large paragraph by sentences
            chunks.extend(chunk_by_sentences(para, max_tokens))
        elif current_tokens + para_tokens > max_tokens:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [para]
            current_tokens = para_tokens
        else:
            current_chunk.append(para)
            current_tokens += para_tokens

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks
```

**Pros**: Preserves logical structure
**Cons**: More complex, variable sizes

**Method 4: Semantic Chunking**
```python
def chunk_by_semantics(text, max_tokens=512):
    """Split text by semantic similarity"""
    sentences = split_into_sentences(text)
    embeddings = [embed(s) for s in sentences]

    chunks = []
    current_chunk = [sentences[0]]

    for i in range(1, len(sentences)):
        similarity = cosine_similarity(embeddings[i-1], embeddings[i])

        if similarity < 0.7 or count_tokens(" ".join(current_chunk)) > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
```

**Pros**: Preserves semantic coherence
**Cons**: Expensive (requires embeddings), complex

### Chunking Best Practices

**Chunk Size:**
- **Small chunks (128-256 tokens)**: More granular, better for specific queries
- **Medium chunks (256-512 tokens)**: Balanced, good default
- **Large chunks (512-1024 tokens)**: More context, better for broad queries

**Overlap:**
- Use 10-20% overlap to preserve context across boundaries
- Example: 512 token chunks with 50 token overlap

**Metadata:**
- Store chunk metadata (document ID, chunk index, position)
- Enable reconstruction of original document
- Track chunk relationships

```python
# Example with metadata
chunks = [
    {
        "text": "First chunk...",
        "embedding": [0.1, 0.2, ...],
        "metadata": {
            "document_id": "doc123",
            "chunk_index": 0,
            "total_chunks": 5,
            "source": "article.pdf",
            "page": 1
        }
    },
    # ...
]
```

---

## Metadata Storage

### Why Store Metadata?

**Metadata**: Additional information stored with embeddings

**Benefits:**
- Filter search results (by date, category, author, etc.)
- Reconstruct original content
- Track embedding provenance
- Enable hybrid search

### Metadata Schema

**Essential Metadata:**
```python
{
    "id": "unique-id",
    "text": "Original text content",
    "embedding": [0.1, 0.2, ...],
    "metadata": {
        # Source information
        "source": "document.pdf",
        "source_type": "pdf",
        "url": "https://example.com/doc",

        # Content information
        "title": "Document Title",
        "author": "John Doe",
        "category": "technology",
        "tags": ["ai", "ml", "nlp"],

        # Temporal information
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-20T15:30:00Z",
        "published_date": "2024-01-10",

        # Chunking information
        "chunk_index": 0,
        "total_chunks": 5,
        "chunk_size": 512,

        # Embedding information
        "embedding_model": "text-embedding-3-small",
        "embedding_version": "1.0",
        "embedding_date": "2024-01-15T10:00:00Z"
    }
}
```

### Metadata Filtering

**Example: Filter by category and date**
```python
# Pinecone
results = index.query(
    vector=query_embedding,
    top_k=10,
    filter={
        "category": {"$eq": "technology"},
        "published_date": {"$gte": "2024-01-01"}
    }
)

# Weaviate
results = client.query.get("Document", ["text", "title"]) \
    .with_near_vector({"vector": query_embedding}) \
    .with_where({
        "operator": "And",
        "operands": [
            {"path": ["category"], "operator": "Equal", "valueString": "technology"},
            {"path": ["published_date"], "operator": "GreaterThanEqual", "valueString": "2024-01-01"}
        ]
    }) \
    .with_limit(10) \
    .do()
```

---

## Embedding Updates

### When to Update Embeddings

**Update embeddings when:**
- ✅ Content changes significantly
- ✅ Embedding model is upgraded
- ✅ Embedding quality is poor
- ✅ New metadata is added

**Don't update when:**
- ❌ Minor typo fixes
- ❌ Metadata-only changes
- ❌ Formatting changes

### Update Strategies

**Strategy 1: Full Reindex**
```python
def full_reindex(documents, index):
    """Re-embed all documents"""
    for doc in documents:
        embedding = embed(doc.text)
        index.upsert(id=doc.id, vector=embedding, metadata=doc.metadata)
```

**Pros**: Clean, consistent
**Cons**: Expensive, time-consuming

**Strategy 2: Incremental Update**
```python
def incremental_update(changed_documents, index):
    """Update only changed documents"""
    for doc in changed_documents:
        embedding = embed(doc.text)
        index.upsert(id=doc.id, vector=embedding, metadata=doc.metadata)
```

**Pros**: Efficient, fast
**Cons**: May have inconsistent embeddings (different models)

**Strategy 3: Versioned Embeddings**
```python
def versioned_update(documents, index, new_version):
    """Create new version of embeddings"""
    for doc in documents:
        embedding = embed(doc.text)
        index.upsert(
            id=f"{doc.id}_v{new_version}",
            vector=embedding,
            metadata={**doc.metadata, "version": new_version}
        )

    # Optionally delete old versions
    # delete_old_versions(index, old_version)
```

**Pros**: Rollback capability, A/B testing
**Cons**: More storage, complex management

---

## Embedding Versioning

### Why Version Embeddings?

**Reasons:**
- Track which model generated embeddings
- Enable rollback if new model performs poorly
- A/B test different embedding models
- Maintain consistency across updates

### Versioning Schema

```python
{
    "id": "doc123",
    "text": "Document content",
    "embedding": [0.1, 0.2, ...],
    "metadata": {
        "embedding_model": "text-embedding-3-small",
        "embedding_version": "v2",
        "embedding_date": "2024-01-15T10:00:00Z",
        "previous_versions": ["v1"]
    }
}
```

### Version Migration

```python
def migrate_embeddings(index, old_version, new_version, new_model):
    """Migrate embeddings to new version"""
    # Fetch all documents with old version
    docs = index.fetch(filter={"embedding_version": old_version})

    # Re-embed with new model
    for doc in docs:
        new_embedding = embed(doc.text, model=new_model)

        # Update with new version
        index.upsert(
            id=doc.id,
            vector=new_embedding,
            metadata={
                **doc.metadata,
                "embedding_model": new_model,
                "embedding_version": new_version,
                "embedding_date": datetime.now().isoformat(),
                "previous_versions": doc.metadata.get("previous_versions", []) + [old_version]
            }
        )
```

---

## Batch Processing

### Why Batch Process?

**Benefits:**
- Faster processing (parallel requests)
- Lower cost (batch discounts)
- Better resource utilization
- Reduced API rate limiting

### Batch Embedding

**Example with OpenAI:**
```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def batch_embed(texts, batch_size=100):
    """Embed texts in batches"""
    embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=batch
        )

        batch_embeddings = [item.embedding for item in response.data]
        embeddings.extend(batch_embeddings)

    return embeddings

# Usage
texts = ["Text 1", "Text 2", ..., "Text 1000"]
embeddings = batch_embed(texts, batch_size=100)
```

**Example with Sentence Transformers:**
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def batch_embed_local(texts, batch_size=32):
    """Embed texts in batches (local model)"""
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=True
    )
    return embeddings

# Usage
texts = ["Text 1", "Text 2", ..., "Text 10000"]
embeddings = batch_embed_local(texts, batch_size=32)
```

### Batch Upsert

```python
def batch_upsert(index, documents, batch_size=100):
    """Upsert documents in batches"""
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]

        # Prepare batch data
        ids = [doc.id for doc in batch]
        vectors = [doc.embedding for doc in batch]
        metadata = [doc.metadata for doc in batch]

        # Upsert batch
        index.upsert(vectors=list(zip(ids, vectors, metadata)))
```

---

## Cost Optimization

### Embedding Cost Factors

**1. Model Selection:**
- OpenAI small: $0.02 / 1M tokens
- OpenAI large: $0.13 / 1M tokens
- Cohere: $0.10 / 1M tokens
- Sentence Transformers: Free (self-hosted)

**2. Token Count:**
- Longer texts = more tokens = higher cost
- Chunking strategy affects total tokens

**3. Update Frequency:**
- Frequent updates = higher cost
- Cache embeddings when possible

### Cost Optimization Strategies

**Strategy 1: Use Smaller Models**
```python
# Instead of text-embedding-3-large (expensive)
# Use text-embedding-3-small (cheaper, still good quality)
model = "text-embedding-3-small"
```

**Strategy 2: Self-Host Open Source Models**
```python
# Free (after infrastructure cost)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

**Strategy 3: Cache Embeddings**
```python
import hashlib
import json

embedding_cache = {}

def embed_with_cache(text, model):
    """Cache embeddings to avoid re-computation"""
    # Create cache key
    cache_key = hashlib.md5(f"{model}:{text}".encode()).hexdigest()

    # Check cache
    if cache_key in embedding_cache:
        return embedding_cache[cache_key]

    # Generate embedding
    embedding = embed(text, model)

    # Store in cache
    embedding_cache[cache_key] = embedding

    return embedding
```

**Strategy 4: Batch Processing**
```python
# Batch requests for better throughput and potential discounts
embeddings = batch_embed(texts, batch_size=100)
```

**Strategy 5: Optimize Chunking**
```python
# Larger chunks = fewer embeddings = lower cost
# But balance with search quality
chunk_size = 512  # Instead of 256
```

### Cost Estimation

```python
def estimate_embedding_cost(num_documents, avg_tokens_per_doc, model="text-embedding-3-small"):
    """Estimate embedding cost"""
    costs = {
        "text-embedding-3-small": 0.02 / 1_000_000,
        "text-embedding-3-large": 0.13 / 1_000_000,
        "embed-english-v3.0": 0.10 / 1_000_000
    }

    total_tokens = num_documents * avg_tokens_per_doc
    cost_per_token = costs.get(model, 0)
    total_cost = total_tokens * cost_per_token

    return {
        "total_tokens": total_tokens,
        "total_cost": total_cost,
        "cost_per_document": total_cost / num_documents
    }

# Example
estimate = estimate_embedding_cost(
    num_documents=100_000,
    avg_tokens_per_doc=500,
    model="text-embedding-3-small"
)
print(f"Total cost: ${estimate['total_cost']:.2f}")
# Output: Total cost: $1.00
```

---

## Best Practices

### 1. Model Selection

✅ **DO:**
- Use OpenAI for production (high quality, reliable)
- Use Sentence Transformers for self-hosting (cost optimization)
- Use Cohere for multilingual (best multilingual support)
- Benchmark models on your data before choosing

❌ **DON'T:**
- Mix embeddings from different models in same index
- Choose model based on dimensions alone
- Ignore cost implications
- Skip model evaluation

### 2. Chunking

✅ **DO:**
- Use 256-512 token chunks as default
- Add 10-20% overlap between chunks
- Preserve sentence/paragraph boundaries
- Store chunk metadata (index, total chunks)

❌ **DON'T:**
- Use chunks larger than model max tokens
- Split mid-sentence without overlap
- Ignore chunk boundaries
- Forget to store chunk relationships

### 3. Metadata

✅ **DO:**
- Store original text with embeddings
- Include source, author, date, category
- Track embedding model and version
- Enable filtering by metadata

❌ **DON'T:**
- Store only embeddings without metadata
- Forget to version embeddings
- Ignore temporal information
- Skip source tracking

### 4. Updates

✅ **DO:**
- Version embeddings for rollback
- Update incrementally when possible
- Cache embeddings to avoid re-computation
- Monitor embedding quality over time

❌ **DON'T:**
- Re-embed everything for minor changes
- Mix old and new embeddings without versioning
- Ignore embedding drift
- Skip quality monitoring

### 5. Cost Optimization

✅ **DO:**
- Batch embed documents
- Cache embeddings
- Use appropriate model for use case
- Monitor and optimize token usage

❌ **DON'T:**
- Embed one document at a time
- Re-embed unnecessarily
- Use expensive models when cheaper ones suffice
- Ignore cost monitoring

---

## Common Pitfalls

### 1. Mixing Embedding Models

**Problem**: Using different models for indexing and querying

**Solution**: Use same model consistently

### 2. Poor Chunking

**Problem**: Chunks too large (exceed token limit) or too small (lose context)

**Solution**: Use 256-512 token chunks with overlap

### 3. Missing Metadata

**Problem**: Can't filter or reconstruct original content

**Solution**: Store comprehensive metadata with embeddings

### 4. No Versioning

**Problem**: Can't track which model generated embeddings

**Solution**: Version embeddings with model name and date

### 5. Inefficient Batch Processing

**Problem**: Embedding one document at a time (slow, expensive)

**Solution**: Batch embed documents (100+ at a time)

---

## Summary

**Key Takeaways:**
1. Choose embedding model based on quality, cost, and use case
2. Use 256-512 token chunks with 10-20% overlap
3. Store comprehensive metadata (source, author, date, version)
4. Version embeddings for rollback and consistency
5. Batch process for efficiency and cost optimization
6. Cache embeddings to avoid re-computation

**Model Recommendations:**
- **Production**: OpenAI `text-embedding-3-small`
- **Self-hosted**: Sentence Transformers `all-mpnet-base-v2`
- **Multilingual**: Cohere `embed-multilingual-v3.0`
- **Code**: Voyage AI `voyage-code-2`

**Next Steps:**
- See `vector-databases.md` for vector storage and search
- See `vector-indexing.md` for index optimization
- See `examples/vector-database-example.md` for complete implementation

