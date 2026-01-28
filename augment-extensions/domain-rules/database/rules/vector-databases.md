# Vector Databases

## Overview

This document covers vector database fundamentals, including when to use vector databases, embedding generation, vector storage, similarity search, distance metrics, hybrid search, database selection, and use cases for semantic search, RAG (Retrieval-Augmented Generation), and recommendation systems.

---

## When to Use Vector Databases

### Ideal Use Cases

**Use vector databases when:**
- ✅ Semantic search is required (meaning-based, not keyword-based)
- ✅ Building RAG (Retrieval-Augmented Generation) systems
- ✅ Similarity search across unstructured data (text, images, audio)
- ✅ Recommendation engines based on content similarity
- ✅ Anomaly detection using vector similarity
- ✅ Duplicate detection (near-duplicate content)
- ✅ Question-answering systems
- ✅ Image/video search by content

**Examples:**
- Semantic document search (find similar documents by meaning)
- Chatbots with context retrieval (RAG systems)
- Product recommendations (similar items)
- Image similarity search (reverse image search)
- Code search (find similar code snippets)
- Customer support (find similar tickets/solutions)
- Content moderation (detect similar harmful content)

### When to Use Traditional Databases Instead

**Use relational/NoSQL databases when:**
- ❌ Exact keyword matching is sufficient
- ❌ Structured data with clear relationships
- ❌ No need for semantic understanding
- ❌ Simple filtering and sorting operations
- ❌ ACID transactions are critical
- ❌ Cost optimization is priority (vector DBs can be expensive)

---

## Vector Database Fundamentals

### What is a Vector Database?

**Definition**: Database optimized for storing and querying high-dimensional vectors (embeddings)

**Key Characteristics:**
- Stores vectors (arrays of numbers representing data)
- Optimized for similarity search (nearest neighbor search)
- Supports high-dimensional data (100s to 1000s of dimensions)
- Fast approximate nearest neighbor (ANN) search
- Metadata filtering combined with vector search

**Example Vector:**
```
Text: "The cat sat on the mat"
Embedding: [0.234, -0.567, 0.891, ..., 0.123]  # 1536 dimensions (OpenAI)
```

### How Vector Databases Work

**1. Embedding Generation:**
- Convert data (text, images, etc.) to vectors using ML models
- Each vector represents semantic meaning in high-dimensional space
- Similar items have similar vectors (close in vector space)

**2. Vector Storage:**
- Store vectors with metadata (original text, IDs, tags, etc.)
- Index vectors for fast similarity search
- Support CRUD operations on vectors

**3. Similarity Search:**
- Query with a vector (e.g., embedding of search query)
- Find k-nearest neighbors (most similar vectors)
- Return results ranked by similarity score

---

## Distance Metrics

### Common Distance Metrics

**1. Cosine Similarity (Most Common)**
- Measures angle between vectors
- Range: -1 (opposite) to 1 (identical)
- Ignores magnitude, focuses on direction
- **Best for**: Text embeddings, semantic search

```python
# Cosine similarity
from numpy import dot
from numpy.linalg import norm

def cosine_similarity(a, b):
    return dot(a, b) / (norm(a) * norm(b))
```

**2. Euclidean Distance (L2)**
- Measures straight-line distance between vectors
- Range: 0 (identical) to ∞ (very different)
- Considers both direction and magnitude
- **Best for**: Image embeddings, spatial data

```python
# Euclidean distance
import numpy as np

def euclidean_distance(a, b):
    return np.linalg.norm(a - b)
```

**3. Dot Product**
- Measures alignment and magnitude
- Range: -∞ to ∞
- Faster than cosine (no normalization)
- **Best for**: Normalized embeddings, performance-critical applications

```python
# Dot product
import numpy as np

def dot_product(a, b):
    return np.dot(a, b)
```

**4. Manhattan Distance (L1)**
- Sum of absolute differences
- Range: 0 to ∞
- Less sensitive to outliers than Euclidean
- **Best for**: High-dimensional sparse data

### Choosing a Distance Metric

| Metric | Use Case | Pros | Cons |
|--------|----------|------|------|
| Cosine | Text embeddings, semantic search | Ignores magnitude, intuitive | Slower than dot product |
| Euclidean | Image embeddings, spatial data | Considers magnitude | Sensitive to scale |
| Dot Product | Normalized embeddings, speed | Fastest | Requires normalized vectors |
| Manhattan | Sparse high-dimensional data | Robust to outliers | Less intuitive |

**Recommendation**: Use **cosine similarity** for most text-based applications

---

## Popular Vector Databases

### Database Comparison

**Pinecone (Managed)**
- Fully managed cloud service
- Easy to use, minimal setup
- Auto-scaling and high availability
- Metadata filtering
- Hybrid search (vector + metadata)
- **Best for**: Production applications, minimal ops overhead

**Weaviate (Open Source + Managed)**
- Open source with managed cloud option
- Built-in vectorization (multiple models)
- GraphQL API
- Hybrid search (vector + keyword)
- Multi-tenancy support
- **Best for**: Flexibility, self-hosting option

**Milvus (Open Source)**
- Open source, CNCF project
- High performance, scalable
- Multiple index types (HNSW, IVF, etc.)
- GPU acceleration support
- Kubernetes-native
- **Best for**: Large-scale deployments, self-hosting

**Qdrant (Open Source + Managed)**
- Open source with managed cloud option
- Written in Rust (high performance)
- Rich filtering capabilities
- Payload-based filtering
- Snapshots and backups
- **Best for**: Advanced filtering, self-hosting

**Chroma (Open Source)**
- Open source, embedded database
- Simple API, easy to get started
- Built for LLM applications
- Local-first development
- Python/JavaScript SDKs
- **Best for**: Development, prototyping, local applications

**pgvector (PostgreSQL Extension)**
- PostgreSQL extension for vector storage
- Leverage existing PostgreSQL infrastructure
- ACID transactions with vectors
- Combine relational + vector data
- Familiar SQL interface
- **Best for**: Existing PostgreSQL users, hybrid workloads

### Selection Criteria

**Choose Pinecone if:**
- You want fully managed service
- Minimal ops overhead is priority
- You need auto-scaling
- Budget allows for managed service

**Choose Weaviate if:**
- You want built-in vectorization
- GraphQL API is preferred
- You need self-hosting option
- Hybrid search is critical

**Choose Milvus if:**
- You need maximum performance
- Large-scale deployment (billions of vectors)
- GPU acceleration is required
- Kubernetes infrastructure exists

**Choose Qdrant if:**
- Advanced filtering is critical
- You want Rust performance
- Self-hosting with managed option
- Payload-based search is needed

**Choose Chroma if:**
- You're prototyping/developing locally
- Simple API is priority
- Embedded database is preferred
- LLM application focus

**Choose pgvector if:**
- You already use PostgreSQL
- You need ACID transactions with vectors
- Hybrid relational + vector data
- Familiar SQL interface is preferred

---

## Hybrid Search

### What is Hybrid Search?

**Definition**: Combining vector similarity search with traditional keyword/metadata filtering

**Benefits:**
- More accurate results (semantic + keyword matching)
- Filter by metadata (date, category, author, etc.)
- Combine multiple ranking signals
- Better user experience

### Hybrid Search Patterns

**Pattern 1: Vector Search + Metadata Filtering**
```python
# Search for similar documents, filtered by category
results = index.query(
    vector=query_embedding,
    top_k=10,
    filter={"category": "technology", "date": {"$gte": "2024-01-01"}}
)
```

**Pattern 2: Vector Search + Keyword Search**
```python
# Combine semantic search with keyword matching
vector_results = vector_search(query_embedding, top_k=50)
keyword_results = keyword_search(query_text, top_k=50)

# Merge and re-rank results
final_results = merge_and_rerank(vector_results, keyword_results)
```

**Pattern 3: Weighted Hybrid Search**
```python
# Weight vector and keyword scores
final_score = (0.7 * vector_score) + (0.3 * keyword_score)
```

### Implementing Hybrid Search

**Example with Weaviate:**
```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# Hybrid search (vector + keyword)
result = client.query.get("Article", ["title", "content"]) \
    .with_hybrid(
        query="machine learning",
        alpha=0.5  # 0.5 = equal weight vector/keyword
    ) \
    .with_where({
        "path": ["category"],
        "operator": "Equal",
        "valueString": "AI"
    }) \
    .with_limit(10) \
    .do()
```

**Example with Pinecone:**
```python
import pinecone

index = pinecone.Index("my-index")

# Vector search with metadata filtering
results = index.query(
    vector=query_embedding,
    top_k=10,
    filter={
        "category": {"$eq": "AI"},
        "published_date": {"$gte": "2024-01-01"}
    },
    include_metadata=True
)
```

---

## Use Cases

### 1. Semantic Search

**Problem**: Keyword search misses semantically similar content

**Solution**: Vector search finds documents by meaning, not just keywords

**Example:**
```
Query: "How to fix a leaky faucet"
Keyword search: Finds documents with exact words "leaky faucet"
Vector search: Also finds "dripping tap repair", "water fixture maintenance"
```

**Implementation:**
1. Generate embeddings for all documents
2. Store embeddings in vector database
3. Generate embedding for search query
4. Find k-nearest neighbors
5. Return ranked results

### 2. RAG (Retrieval-Augmented Generation)

**Problem**: LLMs lack domain-specific knowledge or up-to-date information

**Solution**: Retrieve relevant context from vector database, augment LLM prompt

**Workflow:**
1. User asks question
2. Generate embedding for question
3. Search vector database for relevant documents
4. Retrieve top-k most similar documents
5. Augment LLM prompt with retrieved context
6. Generate answer using LLM + context

**Example:**
```python
# RAG implementation
def rag_query(question, index, llm):
    # 1. Generate question embedding
    question_embedding = embed(question)

    # 2. Retrieve relevant documents
    results = index.query(question_embedding, top_k=5)
    context = "\n".join([r.text for r in results])

    # 3. Augment prompt with context
    prompt = f"""
    Context: {context}

    Question: {question}

    Answer based on the context above:
    """

    # 4. Generate answer
    answer = llm.generate(prompt)
    return answer
```

### 3. Recommendation Systems

**Problem**: Recommend similar items based on content, not just collaborative filtering

**Solution**: Find items with similar embeddings

**Example:**
```python
# Product recommendation
def recommend_similar_products(product_id, index, top_k=5):
    # Get product embedding
    product_embedding = index.fetch([product_id])[0].vector

    # Find similar products
    results = index.query(
        vector=product_embedding,
        top_k=top_k + 1,  # +1 to exclude self
        filter={"product_id": {"$ne": product_id}}
    )

    return results[1:]  # Exclude the product itself
```

---

## Best Practices

### 1. Embedding Generation

✅ **DO:**
- Use consistent embedding models (same model for indexing and querying)
- Normalize embeddings if using dot product
- Batch embed documents for efficiency
- Cache embeddings to avoid re-computation
- Version embeddings (track which model generated them)

❌ **DON'T:**
- Mix embeddings from different models
- Re-embed documents unnecessarily
- Ignore embedding model updates
- Store embeddings without metadata

### 2. Vector Storage

✅ **DO:**
- Store metadata with vectors (original text, IDs, timestamps)
- Use appropriate index type for your scale
- Monitor index size and performance
- Implement backup and recovery
- Version your vector data

❌ **DON'T:**
- Store only vectors without metadata
- Use flat index for large datasets (>100k vectors)
- Ignore index maintenance
- Skip backups

### 3. Similarity Search

✅ **DO:**
- Choose appropriate distance metric (cosine for text)
- Tune top_k based on use case
- Implement hybrid search for better accuracy
- Monitor query latency
- Use metadata filtering to narrow results

❌ **DON'T:**
- Use wrong distance metric
- Return too many results (top_k > 100)
- Rely solely on vector search (ignore metadata)
- Ignore performance optimization

### 4. Performance Optimization

✅ **DO:**
- Use approximate nearest neighbor (ANN) algorithms
- Tune index parameters (ef_construction, M for HNSW)
- Implement caching for frequent queries
- Batch operations when possible
- Monitor and optimize query latency

❌ **DON'T:**
- Use exact nearest neighbor for large datasets
- Ignore index tuning
- Query one vector at a time
- Skip performance monitoring

---

## Common Pitfalls

### 1. Wrong Distance Metric

**Problem**: Using Euclidean distance for text embeddings

**Solution**: Use cosine similarity for text, Euclidean for images

### 2. Not Normalizing Embeddings

**Problem**: Dot product gives inconsistent results

**Solution**: Normalize embeddings before using dot product

### 3. Ignoring Metadata

**Problem**: Vector search returns irrelevant results

**Solution**: Combine vector search with metadata filtering

### 4. Poor Chunking Strategy

**Problem**: Embeddings represent too much or too little context

**Solution**: Chunk documents appropriately (see vector-embeddings.md)

### 5. Not Versioning Embeddings

**Problem**: Can't track which model generated embeddings

**Solution**: Store embedding model version with vectors

---

## Summary

**Key Takeaways:**
1. Vector databases enable semantic search and similarity-based retrieval
2. Choose distance metric based on data type (cosine for text)
3. Use hybrid search for better accuracy (vector + metadata)
4. Popular options: Pinecone (managed), Weaviate (flexible), Milvus (scale)
5. Common use cases: semantic search, RAG, recommendations
6. Best practices: consistent embeddings, metadata storage, performance tuning

**Next Steps:**
- See `vector-embeddings.md` for embedding generation strategies
- See `vector-indexing.md` for index optimization
- See `examples/vector-database-example.md` for complete implementation

