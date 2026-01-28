# Vector Indexing

## Overview

This document covers vector indexing fundamentals, including index types (HNSW, IVF, Flat, LSH), index parameters (ef_construction, M, nlist, nprobe), index selection criteria, index building strategies, index maintenance, performance tuning, and accuracy vs speed tradeoffs.

---

## What is Vector Indexing?

### Definition

**Vector Index**: Data structure optimized for fast similarity search in high-dimensional vector spaces

**Key Concepts:**
- Enables fast approximate nearest neighbor (ANN) search
- Trade-off between accuracy and speed
- Different index types for different use cases
- Critical for large-scale vector databases (>100k vectors)

**Why Indexing Matters:**
- **Without index**: Linear scan (O(n)) - slow for large datasets
- **With index**: Sublinear search (O(log n) or better) - fast even for billions of vectors

**Example:**
```
Dataset: 1 million vectors (1536 dimensions)
Linear scan: ~1000ms per query
HNSW index: ~10ms per query (100x faster!)
```

---

## Index Types

### 1. HNSW (Hierarchical Navigable Small World)

**Overview:**
- Graph-based index
- Best accuracy/speed trade-off
- Most popular for production systems
- Used by: Pinecone, Weaviate, Qdrant, Milvus

**How it works:**
- Builds multi-layer graph of vectors
- Each layer has different connectivity
- Search starts at top layer, navigates down
- Finds approximate nearest neighbors efficiently

**Pros:**
- ✅ Excellent accuracy (>95% recall)
- ✅ Fast search (milliseconds)
- ✅ Good for high-dimensional data
- ✅ Incremental updates supported

**Cons:**
- ❌ High memory usage (stores full graph)
- ❌ Slower index building
- ❌ Not ideal for very large datasets (>100M vectors)

**Best for:**
- Production applications
- High accuracy requirements
- Real-time search
- Datasets < 100M vectors

**Key Parameters:**
- `M`: Number of connections per node (16-64)
- `ef_construction`: Search depth during index building (100-500)
- `ef_search`: Search depth during querying (50-500)

### 2. IVF (Inverted File Index)

**Overview:**
- Clustering-based index
- Partitions vectors into clusters
- Searches only relevant clusters
- Used by: Milvus, Faiss

**How it works:**
- Cluster vectors using k-means
- Create inverted index mapping clusters to vectors
- Search: find nearest clusters, search within clusters
- Trade accuracy for speed (fewer clusters searched)

**Pros:**
- ✅ Lower memory usage than HNSW
- ✅ Faster search for very large datasets
- ✅ Scalable to billions of vectors
- ✅ Good for distributed systems

**Cons:**
- ❌ Lower accuracy than HNSW (80-90% recall)
- ❌ Requires full rebuild for updates
- ❌ Sensitive to cluster quality
- ❌ Slower for small datasets

**Best for:**
- Very large datasets (>100M vectors)
- Distributed systems
- Batch processing
- Lower accuracy tolerance

**Key Parameters:**
- `nlist`: Number of clusters (sqrt(n) to 4*sqrt(n))
- `nprobe`: Number of clusters to search (1-nlist)

### 3. Flat (Exact Search)

**Overview:**
- No index, linear scan
- Exact nearest neighbor search
- Baseline for accuracy comparison

**How it works:**
- Compare query vector to every vector in database
- Return k most similar vectors
- Guaranteed exact results

**Pros:**
- ✅ 100% accuracy (exact search)
- ✅ No index building time
- ✅ No memory overhead
- ✅ Simple implementation

**Cons:**
- ❌ Very slow for large datasets (O(n))
- ❌ Not scalable
- ❌ High query latency

**Best for:**
- Small datasets (<10k vectors)
- Accuracy benchmarking
- Development/testing
- When exact results are critical

**Key Parameters:**
- None (no index)

### 4. LSH (Locality-Sensitive Hashing)

**Overview:**
- Hash-based index
- Maps similar vectors to same hash buckets
- Probabilistic search

**How it works:**
- Hash vectors using LSH functions
- Similar vectors hash to same buckets
- Search: hash query, search matching buckets
- Trade accuracy for speed

**Pros:**
- ✅ Very fast search
- ✅ Low memory usage
- ✅ Good for very high dimensions
- ✅ Supports streaming updates

**Cons:**
- ❌ Lower accuracy (70-85% recall)
- ❌ Requires careful tuning
- ❌ Sensitive to hash function choice
- ❌ Less popular (fewer implementations)

**Best for:**
- Very high-dimensional data (>2000 dimensions)
- Streaming data
- Extreme speed requirements
- Lower accuracy tolerance

**Key Parameters:**
- `num_tables`: Number of hash tables (10-50)
- `num_bits`: Hash size (8-32 bits)

---

## Index Selection Criteria

### Decision Matrix

| Dataset Size | Accuracy Need | Memory Budget | Recommended Index |
|--------------|---------------|---------------|-------------------|
| < 10k | Exact | Any | Flat |
| 10k - 1M | High (>95%) | High | HNSW |
| 1M - 100M | High (>95%) | High | HNSW |
| 100M+ | High (>95%) | Very High | HNSW (distributed) |
| 1M - 100M | Medium (85-95%) | Medium | IVF |
| 100M+ | Medium (85-95%) | Medium | IVF |
| Any | Low (<85%) | Low | LSH |

### Selection Guidelines

**Choose HNSW if:**
- You need high accuracy (>95% recall)
- Dataset < 100M vectors
- Memory is available
- Real-time search is critical
- **Most common choice for production**

**Choose IVF if:**
- Dataset > 100M vectors
- Memory is limited
- Batch processing is acceptable
- 85-95% accuracy is sufficient
- Distributed system is available

**Choose Flat if:**
- Dataset < 10k vectors
- 100% accuracy is required
- Development/testing phase
- Benchmarking other indexes

**Choose LSH if:**
- Very high dimensions (>2000)
- Extreme speed is critical
- 70-85% accuracy is acceptable
- Streaming updates are needed

---

## Index Parameters

### HNSW Parameters

**M (Number of Connections)**
- **Definition**: Number of bi-directional links per node in the graph
- **Range**: 4-64 (typical: 16-32)
- **Impact**:
  - Higher M → Better accuracy, slower search, more memory
  - Lower M → Faster search, less memory, lower accuracy
- **Recommendation**: 16 (balanced), 32 (high accuracy), 8 (low memory)

```python
# Pinecone
index = pinecone.Index("my-index")
index.configure_index(
    pod_type="p1.x1",
    replicas=1,
    metadata_config={"indexed": ["category"]},
    # M is set by pod type (typically 16)
)

# Qdrant
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, HnswConfigDiff

client = QdrantClient("localhost", port=6333)
client.create_collection(
    collection_name="my_collection",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    hnsw_config=HnswConfigDiff(m=16)  # Set M parameter
)
```

**ef_construction (Build-time Search Depth)**
- **Definition**: Size of dynamic candidate list during index construction
- **Range**: 100-500 (typical: 200)
- **Impact**:
  - Higher ef_construction → Better index quality, slower building
  - Lower ef_construction → Faster building, lower quality
- **Recommendation**: 200 (balanced), 400 (high quality), 100 (fast build)

```python
# Qdrant
client.create_collection(
    collection_name="my_collection",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    hnsw_config=HnswConfigDiff(
        m=16,
        ef_construct=200  # Build-time parameter
    )
)
```

**ef_search (Query-time Search Depth)**
- **Definition**: Size of dynamic candidate list during search
- **Range**: 50-500 (typical: 100)
- **Impact**:
  - Higher ef_search → Better accuracy, slower queries
  - Lower ef_search → Faster queries, lower accuracy
- **Recommendation**: 100 (balanced), 200 (high accuracy), 50 (fast queries)

```python
# Qdrant
from qdrant_client.models import SearchParams

results = client.search(
    collection_name="my_collection",
    query_vector=[0.1, 0.2, ...],
    limit=10,
    search_params=SearchParams(hnsw_ef=100)  # Query-time parameter
)
```

### IVF Parameters

**nlist (Number of Clusters)**
- **Definition**: Number of clusters to partition vectors into
- **Range**: sqrt(n) to 4*sqrt(n) where n = number of vectors
- **Impact**:
  - Higher nlist → More granular partitioning, slower search
  - Lower nlist → Coarser partitioning, faster search
- **Recommendation**: sqrt(n) for small datasets, 4*sqrt(n) for large datasets

```python
# Faiss (used by Milvus)
import faiss

# For 1M vectors: nlist = sqrt(1,000,000) = 1000
nlist = 1000
quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, nlist)

# Train index (required for IVF)
index.train(training_vectors)
index.add(vectors)
```

**nprobe (Number of Clusters to Search)**
- **Definition**: Number of nearest clusters to search during query
- **Range**: 1 to nlist (typical: 10-100)
- **Impact**:
  - Higher nprobe → Better accuracy, slower search
  - Lower nprobe → Faster search, lower accuracy
- **Recommendation**: 10 (fast), 50 (balanced), 100 (high accuracy)

```python
# Faiss
index.nprobe = 10  # Search 10 nearest clusters

# Search
distances, indices = index.search(query_vectors, k=10)
```

### LSH Parameters

**num_tables (Number of Hash Tables)**
- **Definition**: Number of independent hash tables
- **Range**: 10-50 (typical: 20)
- **Impact**:
  - More tables → Better accuracy, more memory
  - Fewer tables → Less memory, lower accuracy

**num_bits (Hash Size)**
- **Definition**: Number of bits in hash code
- **Range**: 8-32 (typical: 16)
- **Impact**:
  - More bits → More buckets, better precision
  - Fewer bits → Fewer buckets, faster search

---

## Index Building Strategies

### Strategy 1: Batch Building

**When to use:**
- Initial index creation
- Full reindex
- Offline processing

**Process:**
```python
def batch_build_index(vectors, batch_size=10000):
    """Build index in batches"""
    index = create_index()

    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.add(batch)

    return index

# Example with Pinecone
import pinecone

index = pinecone.Index("my-index")

# Batch upsert
batch_size = 100
for i in range(0, len(vectors), batch_size):
    batch = vectors[i:i + batch_size]
    index.upsert(vectors=batch)
```

**Pros:**
- Efficient for large datasets
- Better resource utilization
- Can parallelize batches

**Cons:**
- Requires all data upfront
- Longer initial build time

### Strategy 2: Incremental Building

**When to use:**
- Streaming data
- Real-time updates
- Continuous ingestion

**Process:**
```python
def incremental_add(index, new_vectors):
    """Add vectors incrementally"""
    for vector in new_vectors:
        index.add([vector])
    return index

# Example with Qdrant
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

client = QdrantClient("localhost", port=6333)

# Add vectors one at a time or in small batches
client.upsert(
    collection_name="my_collection",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, ...],
            payload={"text": "Document 1"}
        )
    ]
)
```

**Pros:**
- No downtime
- Immediate availability
- Handles streaming data

**Cons:**
- Slower than batch building
- May degrade index quality over time
- Requires periodic optimization

### Strategy 3: Parallel Building

**When to use:**
- Very large datasets (>10M vectors)
- Distributed systems
- Time-critical builds

**Process:**
```python
from concurrent.futures import ThreadPoolExecutor

def parallel_build_index(vectors, num_workers=4):
    """Build index in parallel"""
    chunk_size = len(vectors) // num_workers
    chunks = [vectors[i:i + chunk_size] for i in range(0, len(vectors), chunk_size)]

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [executor.submit(build_partial_index, chunk) for chunk in chunks]
        partial_indexes = [f.result() for f in futures]

    # Merge partial indexes
    final_index = merge_indexes(partial_indexes)
    return final_index
```

**Pros:**
- Fastest for large datasets
- Utilizes multiple cores/machines
- Scalable

**Cons:**
- More complex implementation
- Requires merge step
- Higher resource usage

---

## Index Maintenance

### When to Maintain Indexes

**Triggers for maintenance:**
- ✅ After large batch of updates (>10% of index size)
- ✅ Degraded query performance
- ✅ High memory usage
- ✅ Scheduled maintenance windows
- ✅ After deleting many vectors

### Maintenance Operations

**1. Index Optimization**
```python
# Qdrant
client.optimize(collection_name="my_collection")

# Weaviate (automatic, but can trigger manually)
client.schema.update_config(
    class_name="Document",
    config={"vectorIndexConfig": {"cleanupIntervalSeconds": 300}}
)
```

**2. Index Rebuilding**
```python
def rebuild_index(old_index, vectors):
    """Rebuild index from scratch"""
    # Create new index
    new_index = create_index()

    # Add all vectors
    new_index.add(vectors)

    # Swap indexes (zero downtime)
    swap_indexes(old_index, new_index)

    # Delete old index
    delete_index(old_index)
```

**3. Compaction**
```python
# Remove deleted vectors and optimize storage
# Qdrant
client.update_collection(
    collection_name="my_collection",
    optimizer_config={"deleted_threshold": 0.2}  # Compact when 20% deleted
)
```

**4. Vacuuming**
```python
# Reclaim space from deleted vectors
# Similar to database VACUUM operation
def vacuum_index(index):
    """Remove deleted vectors and reclaim space"""
    # Implementation depends on vector database
    index.vacuum()
```

### Maintenance Best Practices

✅ **DO:**
- Schedule maintenance during low-traffic periods
- Monitor index health metrics
- Automate routine maintenance
- Test maintenance procedures
- Keep backups before major operations

❌ **DON'T:**
- Maintain during peak traffic
- Skip monitoring
- Manually trigger without testing
- Forget to backup
- Ignore performance degradation

---

## Performance Tuning

### Tuning for Accuracy

**Goal**: Maximize recall (find most similar vectors)

**HNSW Tuning:**
```python
# High accuracy configuration
hnsw_config = {
    "m": 32,                    # More connections
    "ef_construct": 400,        # Better index quality
    "ef_search": 200            # Deeper search
}

# Expected: 98-99% recall, ~50ms query latency
```

**IVF Tuning:**
```python
# High accuracy configuration
ivf_config = {
    "nlist": 4 * sqrt(n),       # More clusters
    "nprobe": 100               # Search more clusters
}

# Expected: 90-95% recall, ~30ms query latency
```

### Tuning for Speed

**Goal**: Minimize query latency

**HNSW Tuning:**
```python
# High speed configuration
hnsw_config = {
    "m": 8,                     # Fewer connections
    "ef_construct": 100,        # Faster building
    "ef_search": 50             # Shallow search
}

# Expected: 90-95% recall, ~5ms query latency
```

**IVF Tuning:**
```python
# High speed configuration
ivf_config = {
    "nlist": sqrt(n),           # Fewer clusters
    "nprobe": 10                # Search fewer clusters
}

# Expected: 80-85% recall, ~5ms query latency
```

### Tuning for Memory

**Goal**: Minimize memory usage

**Strategies:**
1. **Use IVF instead of HNSW** (lower memory footprint)
2. **Reduce M parameter** (fewer connections = less memory)
3. **Use quantization** (compress vectors)
4. **Use product quantization** (PQ) for very large datasets

```python
# Faiss with Product Quantization
import faiss

# Original: 1536 dimensions * 4 bytes = 6KB per vector
# PQ: 1536 dimensions → 64 bytes per vector (96x compression!)

dimension = 1536
m = 8  # Number of sub-quantizers
nbits = 8  # Bits per sub-quantizer

quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFPQ(quantizer, dimension, nlist=1000, m=m, nbits=nbits)

# Train and add vectors
index.train(training_vectors)
index.add(vectors)
```

### Tuning for Scale

**Goal**: Handle billions of vectors

**Strategies:**
1. **Use IVF with PQ** (memory efficient)
2. **Distribute across multiple nodes** (horizontal scaling)
3. **Use GPU acceleration** (faster search)
4. **Implement sharding** (partition data)

```python
# Distributed Milvus example
from pymilvus import connections, Collection

# Connect to Milvus cluster
connections.connect(host="milvus-cluster", port=19530)

# Create collection with sharding
collection = Collection(
    name="large_collection",
    schema=schema,
    shards_num=4  # Distribute across 4 shards
)
```

---

## Accuracy vs Speed Tradeoffs

### Understanding the Tradeoff

**Key Insight**: You can't have perfect accuracy AND maximum speed

**Tradeoff Spectrum:**
```
Flat Index          HNSW (high params)    HNSW (low params)    IVF (low nprobe)
|                   |                     |                    |
100% accuracy       98% accuracy          92% accuracy         80% accuracy
Slowest             Slow                  Fast                 Fastest
```

### Measuring Accuracy

**Recall**: Percentage of true nearest neighbors found

```python
def measure_recall(index, query_vectors, ground_truth, k=10):
    """Measure index recall"""
    total_recall = 0

    for i, query in enumerate(query_vectors):
        # Get results from index
        results = index.search(query, k=k)
        result_ids = set([r.id for r in results])

        # Compare to ground truth
        true_ids = set(ground_truth[i][:k])

        # Calculate recall
        recall = len(result_ids & true_ids) / k
        total_recall += recall

    return total_recall / len(query_vectors)

# Example
recall = measure_recall(index, test_queries, ground_truth, k=10)
print(f"Recall@10: {recall:.2%}")  # e.g., "Recall@10: 95.50%"
```

### Measuring Speed

**Query Latency**: Time to execute a single query

```python
import time

def measure_latency(index, query_vectors, k=10):
    """Measure average query latency"""
    latencies = []

    for query in query_vectors:
        start = time.time()
        results = index.search(query, k=k)
        latency = (time.time() - start) * 1000  # Convert to ms
        latencies.append(latency)

    return {
        "mean": sum(latencies) / len(latencies),
        "p50": sorted(latencies)[len(latencies) // 2],
        "p95": sorted(latencies)[int(len(latencies) * 0.95)],
        "p99": sorted(latencies)[int(len(latencies) * 0.99)]
    }

# Example
latency = measure_latency(index, test_queries, k=10)
print(f"Mean latency: {latency['mean']:.2f}ms")
print(f"P95 latency: {latency['p95']:.2f}ms")
```

### Choosing the Right Balance

**Use Case: Semantic Search (User-Facing)**
- **Target**: 95%+ recall, <50ms latency
- **Index**: HNSW with M=16, ef_search=100
- **Rationale**: Users expect accurate results, 50ms is acceptable

**Use Case: RAG (LLM Context Retrieval)**
- **Target**: 90%+ recall, <20ms latency
- **Index**: HNSW with M=16, ef_search=50
- **Rationale**: LLM can handle slightly less accurate context, speed matters

**Use Case: Recommendation Engine (Batch)**
- **Target**: 85%+ recall, <100ms latency
- **Index**: IVF with nprobe=50
- **Rationale**: Batch processing, accuracy less critical, cost optimization

**Use Case: Real-Time Anomaly Detection**
- **Target**: 80%+ recall, <5ms latency
- **Index**: IVF with nprobe=10 or LSH
- **Rationale**: Speed is critical, false negatives acceptable

### Benchmarking Example

```python
def benchmark_index_configs(vectors, queries, ground_truth):
    """Benchmark different index configurations"""
    configs = [
        {"name": "High Accuracy", "m": 32, "ef_search": 200},
        {"name": "Balanced", "m": 16, "ef_search": 100},
        {"name": "High Speed", "m": 8, "ef_search": 50}
    ]

    results = []

    for config in configs:
        # Build index
        index = build_hnsw_index(vectors, m=config["m"])

        # Measure recall
        recall = measure_recall(index, queries, ground_truth, k=10)

        # Measure latency
        latency = measure_latency(index, queries, k=10)

        results.append({
            "config": config["name"],
            "recall": recall,
            "latency_p95": latency["p95"]
        })

    return results

# Example output:
# [
#   {"config": "High Accuracy", "recall": 0.98, "latency_p95": 45.2},
#   {"config": "Balanced", "recall": 0.95, "latency_p95": 12.5},
#   {"config": "High Speed", "recall": 0.90, "latency_p95": 5.1}
# ]
```

---

## Best Practices

### 1. Index Selection

✅ **DO:**
- Use HNSW for most production use cases
- Use IVF for very large datasets (>100M vectors)
- Use Flat for small datasets (<10k vectors)
- Benchmark on your data before choosing

❌ **DON'T:**
- Use Flat for large datasets
- Choose index based on popularity alone
- Skip benchmarking
- Ignore memory constraints

### 2. Parameter Tuning

✅ **DO:**
- Start with recommended defaults
- Tune based on accuracy/speed requirements
- Measure recall and latency
- Document parameter choices

❌ **DON'T:**
- Use random parameters
- Tune without measuring
- Ignore tradeoffs
- Skip documentation

### 3. Index Building

✅ **DO:**
- Batch build for initial index
- Use incremental updates for streaming data
- Parallelize for large datasets
- Monitor build progress

❌ **DON'T:**
- Build one vector at a time
- Skip batching
- Ignore build time
- Forget to monitor

### 4. Index Maintenance

✅ **DO:**
- Schedule regular maintenance
- Monitor index health
- Rebuild when performance degrades
- Keep backups

❌ **DON'T:**
- Skip maintenance
- Ignore performance degradation
- Maintain during peak traffic
- Forget backups

### 5. Performance Optimization

✅ **DO:**
- Measure before optimizing
- Tune for your use case
- Balance accuracy and speed
- Monitor production metrics

❌ **DON'T:**
- Optimize prematurely
- Tune without measuring
- Ignore use case requirements
- Skip production monitoring

---

## Common Pitfalls

### 1. Wrong Index Type

**Problem**: Using Flat index for 1M vectors (very slow)

**Solution**: Use HNSW or IVF for large datasets

### 2. Poor Parameter Tuning

**Problem**: Using default parameters without tuning

**Solution**: Benchmark and tune for your use case

### 3. No Index Maintenance

**Problem**: Index performance degrades over time

**Solution**: Schedule regular maintenance and rebuilds

### 4. Ignoring Accuracy

**Problem**: Optimizing only for speed, poor results

**Solution**: Measure recall, balance accuracy and speed

### 5. Not Benchmarking

**Problem**: Choosing index/parameters without testing

**Solution**: Benchmark on representative data before production

---

## Summary

**Key Takeaways:**
1. HNSW is best for most production use cases (high accuracy, good speed)
2. IVF is best for very large datasets (>100M vectors, lower memory)
3. Tune parameters based on accuracy/speed requirements
4. Measure recall and latency to validate configuration
5. Maintain indexes regularly for optimal performance
6. Balance accuracy and speed based on use case

**Parameter Recommendations:**
- **HNSW (balanced)**: M=16, ef_construct=200, ef_search=100
- **HNSW (high accuracy)**: M=32, ef_construct=400, ef_search=200
- **HNSW (high speed)**: M=8, ef_construct=100, ef_search=50
- **IVF (balanced)**: nlist=sqrt(n), nprobe=50
- **IVF (high accuracy)**: nlist=4*sqrt(n), nprobe=100
- **IVF (high speed)**: nlist=sqrt(n), nprobe=10

**Next Steps:**
- See `vector-databases.md` for vector database fundamentals
- See `vector-embeddings.md` for embedding generation
- See `examples/vector-database-example.md` for complete implementation


