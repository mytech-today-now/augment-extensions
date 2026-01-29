# Vector-Based MCP Guidelines

## Overview

**Vector-based MCP** uses semantic embeddings and vector databases to enable efficient retrieval of relevant context from large knowledge bases. This is the foundation of Retrieval-Augmented Generation (RAG).

**Key Challenge**: Balancing retrieval quality, latency, and cost while maintaining semantic relevance across diverse content types.

---

## 1. Embedding Model Selection

### Model Characteristics

Choose embedding models based on use case:

| Model | Dimensions | Max Tokens | Use Case |
|-------|-----------|------------|----------|
| text-embedding-3-small | 1536 | 8191 | General purpose, cost-effective |
| text-embedding-3-large | 3072 | 8191 | High accuracy, semantic search |
| voyage-2 | 1024 | 16000 | Long documents, code |
| cohere-embed-v3 | 1024 | 512 | Multilingual, classification |

**Best Practices**:
- Use smaller models for high-volume, cost-sensitive applications
- Use larger models for complex semantic matching
- Consider domain-specific models (e.g., code embeddings for technical docs)
- Benchmark on your specific data

### Embedding Generation

```python
from openai import OpenAI

def generate_embeddings(texts: list[str], model="text-embedding-3-small"):
    """Generate embeddings with batching"""
    client = OpenAI()
    
    # Batch for efficiency (max 2048 texts per request)
    batch_size = 2048
    embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            input=batch,
            model=model
        )
        embeddings.extend([item.embedding for item in response.data])
    
    return embeddings
```

**Best Practices**:
- Batch embedding requests for efficiency
- Cache embeddings to avoid recomputation
- Normalize embeddings for cosine similarity
- Handle rate limits and retries

---

## 2. Chunking and Indexing

### Chunking Strategies

**Fixed-size chunking**:

```python
def fixed_size_chunk(text: str, chunk_size=512, overlap=50):
    """Split text into fixed-size chunks with overlap"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks
```

**Semantic chunking**:

```python
def semantic_chunk(text: str, model="text-embedding-3-small", threshold=0.5):
    """Split text at semantic boundaries"""
    sentences = split_sentences(text)
    embeddings = generate_embeddings(sentences, model)
    
    chunks = []
    current_chunk = [sentences[0]]
    
    for i in range(1, len(sentences)):
        similarity = cosine_similarity(embeddings[i-1], embeddings[i])
        
        if similarity < threshold:
            # Low similarity = semantic boundary
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])
    
    chunks.append(' '.join(current_chunk))
    return chunks
```

**Document-structure chunking**:

```python
def structure_chunk(markdown_text: str):
    """Chunk by document structure (headers, sections)"""
    sections = []
    current_section = []
    current_header = None
    
    for line in markdown_text.split('\n'):
        if line.startswith('#'):
            if current_section:
                sections.append({
                    'header': current_header,
                    'content': '\n'.join(current_section)
                })
            current_header = line
            current_section = []
        else:
            current_section.append(line)
    
    if current_section:
        sections.append({
            'header': current_header,
            'content': '\n'.join(current_section)
        })
    
    return sections
```

**Best Practices**:
- Use semantic chunking for narrative content
- Use structure chunking for technical docs
- Maintain chunk overlap (10-20%) for context continuity
- Keep chunks between 256-1024 tokens
- Preserve metadata (source, section, page number)

### Indexing Patterns

**Hierarchical indexing**:

```python
def hierarchical_index(document: str):
    """Create multi-level index"""
    # Level 1: Document summary
    doc_summary = summarize(document, max_tokens=200)
    doc_embedding = generate_embeddings([doc_summary])[0]
    
    # Level 2: Section summaries
    sections = structure_chunk(document)
    section_embeddings = []
    
    for section in sections:
        summary = summarize(section['content'], max_tokens=100)
        embedding = generate_embeddings([summary])[0]
        section_embeddings.append({
            'header': section['header'],
            'summary': summary,
            'embedding': embedding
        })
    
    # Level 3: Chunk embeddings
    chunks = []
    for section in sections:
        section_chunks = fixed_size_chunk(section['content'])
        chunk_embeddings = generate_embeddings(section_chunks)
        
        for chunk, embedding in zip(section_chunks, chunk_embeddings):
            chunks.append({
                'text': chunk,
                'section': section['header'],
                'embedding': embedding
            })
    
    return {
        'document': {'summary': doc_summary, 'embedding': doc_embedding},
        'sections': section_embeddings,
        'chunks': chunks
    }
```

**Best Practices**:
- Index at multiple granularities (document, section, chunk)
- Store metadata with embeddings
- Use hierarchical retrieval (coarse-to-fine)
- Update indexes incrementally

---

## 3. Retrieval Strategies

### Similarity Search

**Cosine similarity** (most common):

```python
import numpy as np

def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two vectors"""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def retrieve_top_k(query_embedding, chunk_embeddings, k=5):
    """Retrieve top-k most similar chunks"""
    similarities = [
        cosine_similarity(query_embedding, chunk_emb)
        for chunk_emb in chunk_embeddings
    ]

    # Get top-k indices
    top_k_indices = np.argsort(similarities)[-k:][::-1]

    return [(idx, similarities[idx]) for idx in top_k_indices]
```

**Approximate Nearest Neighbor (ANN)**:

```python
import faiss

def build_faiss_index(embeddings, dimension=1536):
    """Build FAISS index for fast similarity search"""
    # Convert to numpy array
    embeddings_np = np.array(embeddings).astype('float32')

    # Create index (IVF with PQ for large datasets)
    quantizer = faiss.IndexFlatL2(dimension)
    index = faiss.IndexIVFPQ(quantizer, dimension, 100, 8, 8)

    # Train and add vectors
    index.train(embeddings_np)
    index.add(embeddings_np)

    return index

def search_faiss(index, query_embedding, k=5):
    """Search FAISS index"""
    query_np = np.array([query_embedding]).astype('float32')
    distances, indices = index.search(query_np, k)
    return list(zip(indices[0], distances[0]))
```

**Best Practices**:
- Use exact search for small datasets (< 10k vectors)
- Use ANN (FAISS, Annoy) for large datasets (> 100k vectors)
- Tune ANN parameters (nprobe, nlist) for accuracy/speed tradeoff
- Monitor recall@k metrics

### Hybrid Search

Combine vector search with keyword search:

```python
from rank_bm25 import BM25Okapi

def hybrid_search(query: str, chunks: list[str], chunk_embeddings, alpha=0.5, k=10):
    """Combine vector and keyword search"""
    # Vector search
    query_embedding = generate_embeddings([query])[0]
    vector_scores = [
        cosine_similarity(query_embedding, emb)
        for emb in chunk_embeddings
    ]

    # Keyword search (BM25)
    tokenized_chunks = [chunk.split() for chunk in chunks]
    bm25 = BM25Okapi(tokenized_chunks)
    keyword_scores = bm25.get_scores(query.split())

    # Normalize scores
    vector_scores = normalize(vector_scores)
    keyword_scores = normalize(keyword_scores)

    # Combine scores
    hybrid_scores = [
        alpha * v + (1 - alpha) * k
        for v, k in zip(vector_scores, keyword_scores)
    ]

    # Get top-k
    top_k_indices = np.argsort(hybrid_scores)[-k:][::-1]
    return [(idx, hybrid_scores[idx]) for idx in top_k_indices]

def normalize(scores):
    """Min-max normalization"""
    min_score = min(scores)
    max_score = max(scores)
    if max_score == min_score:
        return [0.5] * len(scores)
    return [(s - min_score) / (max_score - min_score) for s in scores]
```

**Best Practices**:
- Use hybrid search for keyword-heavy queries
- Tune alpha parameter (0.5 is a good default)
- Consider query type (semantic vs keyword)
- Use BM25 or Elasticsearch for keyword component

### Metadata Filtering

Filter by metadata before similarity search:

```python
def filtered_search(query_embedding, chunks, metadata, filters, k=5):
    """Search with metadata filters"""
    # Apply filters
    filtered_indices = []
    for i, meta in enumerate(metadata):
        if all(meta.get(key) == value for key, value in filters.items()):
            filtered_indices.append(i)

    # Search only filtered chunks
    filtered_embeddings = [chunks[i]['embedding'] for i in filtered_indices]
    similarities = [
        cosine_similarity(query_embedding, emb)
        for emb in filtered_embeddings
    ]

    # Get top-k from filtered results
    top_k_local = np.argsort(similarities)[-k:][::-1]
    top_k_global = [filtered_indices[i] for i in top_k_local]

    return [(idx, similarities[top_k_local[i]]) for i, idx in enumerate(top_k_global)]
```

**Best Practices**:
- Filter before similarity search for efficiency
- Index metadata for fast filtering
- Support multiple filter types (exact, range, contains)
- Combine filters with AND/OR logic

---

## 4. Reranking Techniques

### Cross-Encoder Reranking

Use cross-encoders for final reranking:

```python
from sentence_transformers import CrossEncoder

def rerank_with_cross_encoder(query: str, candidates: list[str], top_k=5):
    """Rerank candidates using cross-encoder"""
    model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    # Score all query-candidate pairs
    pairs = [[query, candidate] for candidate in candidates]
    scores = model.predict(pairs)

    # Get top-k
    top_k_indices = np.argsort(scores)[-top_k:][::-1]
    return [(idx, scores[idx]) for idx in top_k_indices]
```

**Best Practices**:
- Use bi-encoder for initial retrieval (fast)
- Use cross-encoder for reranking top-k (accurate)
- Typical pipeline: retrieve 50-100, rerank to 5-10
- Cache cross-encoder results when possible

### LLM-Based Reranking

Use LLM to judge relevance:

```python
def llm_rerank(query: str, candidates: list[str], top_k=5):
    """Rerank using LLM relevance scoring"""
    prompt = f"""
    Query: {query}

    Rate the relevance of each passage to the query on a scale of 0-10.

    Passages:
    {chr(10).join(f"{i+1}. {c}" for i, c in enumerate(candidates))}

    Return only a JSON array of scores: [score1, score2, ...]
    """

    response = llm_call(prompt)
    scores = json.loads(response)

    # Get top-k
    top_k_indices = np.argsort(scores)[-top_k:][::-1]
    return [(idx, scores[idx]) for idx in top_k_indices]
```

**Best Practices**:
- Use for complex relevance judgments
- More expensive than cross-encoders
- Consider caching for repeated queries
- Validate JSON output

---

## 5. Vector Database Options

### Comparison

| Database | Type | Scale | Features |
|----------|------|-------|----------|
| **Pinecone** | Managed | Billions | Serverless, metadata filtering, hybrid search |
| **Weaviate** | Self-hosted/Managed | Millions | GraphQL, multi-tenancy, hybrid search |
| **Qdrant** | Self-hosted/Managed | Millions | Filtering, payload, quantization |
| **Chroma** | Embedded/Self-hosted | Millions | Simple API, local-first |
| **FAISS** | Library | Billions | Fast, in-memory, no persistence |
| **pgvector** | PostgreSQL extension | Millions | SQL integration, ACID |

### Pinecone Example

```python
import pinecone

# Initialize
pinecone.init(api_key="your-api-key", environment="us-west1-gcp")

# Create index
index = pinecone.Index("my-index")

# Upsert vectors
index.upsert(vectors=[
    ("id1", embedding1, {"source": "doc1.pdf", "page": 1}),
    ("id2", embedding2, {"source": "doc1.pdf", "page": 2}),
])

# Query with metadata filter
results = index.query(
    vector=query_embedding,
    top_k=5,
    filter={"source": "doc1.pdf"}
)
```

### Weaviate Example

```python
import weaviate

# Initialize
client = weaviate.Client("http://localhost:8080")

# Create schema
schema = {
    "class": "Document",
    "vectorizer": "none",
    "properties": [
        {"name": "content", "dataType": ["text"]},
        {"name": "source", "dataType": ["string"]},
    ]
}
client.schema.create_class(schema)

# Add objects
client.data_object.create(
    data_object={"content": "...", "source": "doc1.pdf"},
    class_name="Document",
    vector=embedding
)

# Query
result = client.query.get("Document", ["content", "source"]) \
    .with_near_vector({"vector": query_embedding}) \
    .with_limit(5) \
    .do()
```

**Best Practices**:
- Use managed services (Pinecone, Weaviate Cloud) for production
- Use embedded databases (Chroma, FAISS) for development
- Consider pgvector for existing PostgreSQL deployments
- Benchmark on your data and query patterns

---

## 6. Best Practices

### DO

✅ **Chunk appropriately**: 256-1024 tokens with 10-20% overlap
✅ **Use hierarchical indexing**: Document → Section → Chunk
✅ **Implement hybrid search**: Combine vector + keyword
✅ **Rerank top results**: Use cross-encoders or LLMs
✅ **Filter by metadata**: Reduce search space
✅ **Cache embeddings**: Avoid recomputation
✅ **Monitor retrieval quality**: Track precision@k, recall@k
✅ **Version embeddings**: Track model and version

### DON'T

❌ **Don't use fixed chunking for all content**: Adapt to structure
❌ **Don't skip reranking**: Initial retrieval is often noisy
❌ **Don't ignore metadata**: Filtering improves relevance
❌ **Don't use exact search for large datasets**: Use ANN
❌ **Don't forget to normalize**: Embeddings should be unit vectors
❌ **Don't over-retrieve**: More isn't always better (diminishing returns)
❌ **Don't ignore query type**: Semantic vs keyword queries differ

---

## 7. Common Pitfalls

### Chunking Too Large/Small

**Problem**: Large chunks dilute relevance; small chunks lose context

**Solution**:
- Target 256-1024 tokens per chunk
- Use semantic boundaries
- Maintain overlap for continuity

### Poor Retrieval Quality

**Problem**: Retrieved chunks not relevant to query

**Solution**:
- Use hybrid search (vector + keyword)
- Implement reranking
- Tune chunk size and overlap
- Use query expansion

### Slow Retrieval

**Problem**: High latency for similarity search

**Solution**:
- Use ANN algorithms (FAISS, Annoy)
- Implement caching
- Filter by metadata first
- Use hierarchical retrieval

### Embedding Drift

**Problem**: Embeddings become stale as content changes

**Solution**:
- Version embeddings with model version
- Implement incremental updates
- Monitor embedding quality over time
- Re-embed periodically

---

## 8. Integration with Token-Based MCP

Vector-based MCP complements token-based MCP:

```python
def rag_with_token_budget(query: str, token_budget=4096):
    """RAG with token budget management"""
    # Retrieve candidates
    query_embedding = generate_embeddings([query])[0]
    candidates = retrieve_top_k(query_embedding, chunk_embeddings, k=20)

    # Rerank
    reranked = rerank_with_cross_encoder(query, [c[0] for c in candidates], top_k=10)

    # Select chunks within token budget
    selected_chunks = []
    total_tokens = 0

    for idx, score in reranked:
        chunk = chunks[idx]
        chunk_tokens = count_tokens(chunk)

        if total_tokens + chunk_tokens <= token_budget:
            selected_chunks.append(chunk)
            total_tokens += chunk_tokens
        else:
            break

    return selected_chunks, total_tokens
```

**Best Practices**:
- Always respect token budget
- Prioritize by relevance score
- Leave buffer for output
- Consider compression if needed

---

## Configuration Example

```json
{
  "mcp": {
    "type": "vector",
    "embedding": {
      "model": "text-embedding-3-small",
      "dimensions": 1536,
      "batchSize": 2048
    },
    "chunking": {
      "strategy": "semantic",
      "chunkSize": 512,
      "overlap": 50,
      "preserveStructure": true
    },
    "retrieval": {
      "topK": 20,
      "rerankTopK": 5,
      "hybridAlpha": 0.5,
      "useReranking": true,
      "rerankModel": "cross-encoder/ms-marco-MiniLM-L-6-v2"
    },
    "vectorDatabase": {
      "provider": "pinecone",
      "index": "my-knowledge-base",
      "namespace": "production"
    },
    "tokenBudget": {
      "maxRetrievalTokens": 4096,
      "outputBuffer": 2048
    }
  }
}
```

---

