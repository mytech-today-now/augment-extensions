# Vector Database Example: Semantic Search Application

## Overview

This example demonstrates a complete semantic search application using vector databases. It covers:
- Document ingestion and preprocessing
- Embedding generation with OpenAI
- Vector storage in Pinecone and Weaviate
- Similarity search
- Hybrid search (vector + keyword)
- Metadata filtering
- Sample queries with explanations

**Use Case**: Knowledge base search for technical documentation

**Tech Stack:**
- **Vector Database**: Pinecone (managed) or Weaviate (self-hosted)
- **Embedding Model**: OpenAI `text-embedding-3-small`
- **Language**: Python
- **Framework**: LangChain (optional, for RAG)

---

## Architecture

```
Documents (PDF, Markdown, HTML)
    ↓
Document Loader & Chunker
    ↓
Embedding Generator (OpenAI)
    ↓
Vector Database (Pinecone/Weaviate)
    ↓
Search API (Similarity + Hybrid)
    ↓
Results (Ranked by relevance)
```

---

## Setup

### Install Dependencies

```bash
pip install openai pinecone-client weaviate-client tiktoken langchain
```

### Environment Variables

```bash
# .env file
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp
WEAVIATE_URL=http://localhost:8080
```

---

## Step 1: Document Ingestion

### Load Documents

```python
import os
from pathlib import Path
from typing import List, Dict

class DocumentLoader:
    """Load documents from various sources"""
    
    def load_markdown_files(self, directory: str) -> List[Dict]:
        """Load all markdown files from directory"""
        documents = []
        
        for file_path in Path(directory).rglob("*.md"):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                documents.append({
                    "id": str(file_path),
                    "text": content,
                    "metadata": {
                        "source": str(file_path),
                        "filename": file_path.name,
                        "type": "markdown"
                    }
                })
        
        return documents
    
    def load_pdf_files(self, directory: str) -> List[Dict]:
        """Load PDF files (requires PyPDF2)"""
        import PyPDF2
        documents = []
        
        for file_path in Path(directory).rglob("*.pdf"):
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                text = ""
                
                for page in pdf_reader.pages:
                    text += page.extract_text()
                
                documents.append({
                    "id": str(file_path),
                    "text": text,
                    "metadata": {
                        "source": str(file_path),
                        "filename": file_path.name,
                        "type": "pdf",
                        "pages": len(pdf_reader.pages)
                    }
                })
        
        return documents

# Usage
loader = DocumentLoader()
documents = loader.load_markdown_files("./docs")
print(f"Loaded {len(documents)} documents")
```

### Chunk Documents

```python
import tiktoken

class DocumentChunker:
    """Chunk documents into smaller pieces"""
    
    def __init__(self, chunk_size: int = 512, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def chunk_by_tokens(self, text: str) -> List[str]:
        """Split text into chunks by token count"""
        tokens = self.tokenizer.encode(text)
        chunks = []
        
        for i in range(0, len(tokens), self.chunk_size - self.overlap):
            chunk_tokens = tokens[i:i + self.chunk_size]
            chunk_text = self.tokenizer.decode(chunk_tokens)
            chunks.append(chunk_text)
        
        return chunks
    
    def chunk_documents(self, documents: List[Dict]) -> List[Dict]:
        """Chunk all documents"""
        chunked_docs = []
        
        for doc in documents:
            chunks = self.chunk_by_tokens(doc["text"])
            
            for i, chunk in enumerate(chunks):
                chunked_docs.append({
                    "id": f"{doc['id']}_chunk_{i}",
                    "text": chunk,
                    "metadata": {
                        **doc["metadata"],
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "parent_id": doc["id"]
                    }
                })
        
        return chunked_docs

# Usage
chunker = DocumentChunker(chunk_size=512, overlap=50)
chunked_documents = chunker.chunk_documents(documents)
print(f"Created {len(chunked_documents)} chunks from {len(documents)} documents")
```

---

## Step 2: Embedding Generation

### Generate Embeddings with OpenAI

```python
from openai import OpenAI
from typing import List
import time

class EmbeddingGenerator:
    """Generate embeddings using OpenAI"""

    def __init__(self, api_key: str, model: str = "text-embedding-3-small"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        response = self.client.embeddings.create(
            model=self.model,
            input=text
        )
        return response.data[0].embedding

    def generate_embeddings_batch(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        """Generate embeddings in batches"""
        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]

            # Rate limiting: wait if needed
            time.sleep(0.1)

            response = self.client.embeddings.create(
                model=self.model,
                input=batch
            )

            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)

            print(f"Generated embeddings for {len(embeddings)}/{len(texts)} texts")

        return embeddings

    def embed_documents(self, documents: List[Dict]) -> List[Dict]:
        """Add embeddings to documents"""
        texts = [doc["text"] for doc in documents]
        embeddings = self.generate_embeddings_batch(texts)

        for doc, embedding in zip(documents, embeddings):
            doc["embedding"] = embedding

        return documents

# Usage
import os
from dotenv import load_dotenv

load_dotenv()

generator = EmbeddingGenerator(api_key=os.getenv("OPENAI_API_KEY"))
embedded_documents = generator.embed_documents(chunked_documents)
print(f"Generated embeddings for {len(embedded_documents)} chunks")
```

---

## Step 3: Vector Storage

### Option 1: Pinecone (Managed)

```python
import pinecone
from typing import List, Dict

class PineconeVectorStore:
    """Store and search vectors in Pinecone"""

    def __init__(self, api_key: str, environment: str, index_name: str):
        pinecone.init(api_key=api_key, environment=environment)
        self.index_name = index_name
        self.index = None

    def create_index(self, dimension: int = 1536):
        """Create Pinecone index"""
        if self.index_name not in pinecone.list_indexes():
            pinecone.create_index(
                name=self.index_name,
                dimension=dimension,
                metric="cosine",
                metadata_config={"indexed": ["source", "type", "filename"]}
            )

        self.index = pinecone.Index(self.index_name)
        print(f"Created/connected to index: {self.index_name}")

    def upsert_documents(self, documents: List[Dict], batch_size: int = 100):
        """Upsert documents to Pinecone"""
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]

            # Prepare vectors for upsert
            vectors = [
                (
                    doc["id"],
                    doc["embedding"],
                    {
                        "text": doc["text"],
                        **doc["metadata"]
                    }
                )
                for doc in batch
            ]

            self.index.upsert(vectors=vectors)
            print(f"Upserted {min(i + batch_size, len(documents))}/{len(documents)} documents")

    def search(self, query_embedding: List[float], top_k: int = 10, filter: Dict = None):
        """Search for similar vectors"""
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            filter=filter,
            include_metadata=True
        )

        return [
            {
                "id": match.id,
                "score": match.score,
                "text": match.metadata.get("text", ""),
                "metadata": match.metadata
            }
            for match in results.matches
        ]

# Usage
pinecone_store = PineconeVectorStore(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT"),
    index_name="knowledge-base"
)

pinecone_store.create_index(dimension=1536)
pinecone_store.upsert_documents(embedded_documents)
```

### Option 2: Weaviate (Self-Hosted)

```python
import weaviate
from typing import List, Dict

class WeaviateVectorStore:
    """Store and search vectors in Weaviate"""

    def __init__(self, url: str):
        self.client = weaviate.Client(url)
        self.class_name = "Document"

    def create_schema(self):
        """Create Weaviate schema"""
        schema = {
            "class": self.class_name,
            "description": "Technical documentation chunks",
            "vectorizer": "none",  # We provide our own vectors
            "properties": [
                {
                    "name": "text",
                    "dataType": ["text"],
                    "description": "Document text content"
                },
                {
                    "name": "source",
                    "dataType": ["string"],
                    "description": "Source file path"
                },
                {
                    "name": "filename",
                    "dataType": ["string"],
                    "description": "File name"
                },
                {
                    "name": "type",
                    "dataType": ["string"],
                    "description": "Document type (markdown, pdf, etc.)"
                },
                {
                    "name": "chunk_index",
                    "dataType": ["int"],
                    "description": "Chunk index"
                },
                {
                    "name": "parent_id",
                    "dataType": ["string"],
                    "description": "Parent document ID"
                }
            ]
        }

        # Delete class if exists
        if self.client.schema.exists(self.class_name):
            self.client.schema.delete_class(self.class_name)

        self.client.schema.create_class(schema)
        print(f"Created schema for class: {self.class_name}")

    def upsert_documents(self, documents: List[Dict], batch_size: int = 100):
        """Upsert documents to Weaviate"""
        with self.client.batch as batch:
            batch.batch_size = batch_size

            for i, doc in enumerate(documents):
                properties = {
                    "text": doc["text"],
                    "source": doc["metadata"].get("source", ""),
                    "filename": doc["metadata"].get("filename", ""),
                    "type": doc["metadata"].get("type", ""),
                    "chunk_index": doc["metadata"].get("chunk_index", 0),
                    "parent_id": doc["metadata"].get("parent_id", "")
                }

                batch.add_data_object(
                    data_object=properties,
                    class_name=self.class_name,
                    vector=doc["embedding"],
                    uuid=doc["id"]
                )

                if (i + 1) % 100 == 0:
                    print(f"Upserted {i + 1}/{len(documents)} documents")

    def search(self, query_embedding: List[float], top_k: int = 10, where_filter: Dict = None):
        """Search for similar vectors"""
        query = self.client.query.get(
            self.class_name,
            ["text", "source", "filename", "type", "chunk_index"]
        ).with_near_vector({
            "vector": query_embedding
        }).with_limit(top_k)

        if where_filter:
            query = query.with_where(where_filter)

        results = query.do()

        return [
            {
                "text": item["text"],
                "metadata": {
                    "source": item.get("source", ""),
                    "filename": item.get("filename", ""),
                    "type": item.get("type", ""),
                    "chunk_index": item.get("chunk_index", 0)
                }
            }
            for item in results["data"]["Get"][self.class_name]
        ]

# Usage
weaviate_store = WeaviateVectorStore(url=os.getenv("WEAVIATE_URL"))
weaviate_store.create_schema()
weaviate_store.upsert_documents(embedded_documents)
```

---

## Step 4: Similarity Search

### Basic Similarity Search

```python
class SemanticSearchEngine:
    """Semantic search engine using vector database"""

    def __init__(self, vector_store, embedding_generator):
        self.vector_store = vector_store
        self.embedding_generator = embedding_generator

    def search(self, query: str, top_k: int = 10) -> List[Dict]:
        """Search for documents similar to query"""
        # Generate query embedding
        query_embedding = self.embedding_generator.generate_embedding(query)

        # Search vector database
        results = self.vector_store.search(query_embedding, top_k=top_k)

        return results

    def format_results(self, results: List[Dict]) -> str:
        """Format search results for display"""
        output = []

        for i, result in enumerate(results, 1):
            output.append(f"\n--- Result {i} (Score: {result.get('score', 'N/A'):.4f}) ---")
            output.append(f"Source: {result['metadata'].get('source', 'Unknown')}")
            output.append(f"Text: {result['text'][:200]}...")

        return "\n".join(output)

# Usage
search_engine = SemanticSearchEngine(pinecone_store, generator)

# Example query
query = "How do I configure database indexing?"
results = search_engine.search(query, top_k=5)
print(search_engine.format_results(results))
```

**Example Output:**
```
--- Result 1 (Score: 0.8923) ---
Source: docs/database/indexing.md
Text: Database indexing is crucial for query performance. To configure indexes,
you should first identify frequently queried columns. Create indexes using the
CREATE INDEX statement...

--- Result 2 (Score: 0.8654) ---
Source: docs/database/performance.md
Text: Index configuration affects query speed significantly. Best practices include
creating composite indexes for multi-column queries and monitoring index usage...
```

---

## Step 5: Hybrid Search (Vector + Keyword)

### Hybrid Search with Metadata Filtering

```python
class HybridSearchEngine:
    """Hybrid search combining vector similarity and metadata filtering"""

    def __init__(self, vector_store, embedding_generator):
        self.vector_store = vector_store
        self.embedding_generator = embedding_generator

    def search_with_filter(
        self,
        query: str,
        top_k: int = 10,
        document_type: str = None,
        source_pattern: str = None
    ) -> List[Dict]:
        """Search with metadata filtering"""
        # Generate query embedding
        query_embedding = self.embedding_generator.generate_embedding(query)

        # Build filter
        filter_dict = {}
        if document_type:
            filter_dict["type"] = {"$eq": document_type}
        if source_pattern:
            filter_dict["source"] = {"$regex": source_pattern}

        # Search with filter
        results = self.vector_store.search(
            query_embedding,
            top_k=top_k,
            filter=filter_dict if filter_dict else None
        )

        return results

    def search_by_category(self, query: str, category: str, top_k: int = 10) -> List[Dict]:
        """Search within a specific category"""
        return self.search_with_filter(
            query=query,
            top_k=top_k,
            source_pattern=f".*{category}.*"
        )

# Usage
hybrid_engine = HybridSearchEngine(pinecone_store, generator)

# Search only in database documentation
results = hybrid_engine.search_by_category(
    query="How to optimize queries?",
    category="database",
    top_k=5
)

# Search only markdown files
results = hybrid_engine.search_with_filter(
    query="API authentication",
    document_type="markdown",
    top_k=5
)
```

### Hybrid Search with Keyword Boosting

```python
from typing import List, Dict, Set

class KeywordBoostingSearch:
    """Hybrid search with keyword boosting"""

    def __init__(self, vector_store, embedding_generator):
        self.vector_store = vector_store
        self.embedding_generator = embedding_generator

    def extract_keywords(self, query: str) -> Set[str]:
        """Extract important keywords from query"""
        # Simple keyword extraction (can use NLP libraries for better results)
        stopwords = {"the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or"}
        words = query.lower().split()
        keywords = {word for word in words if word not in stopwords and len(word) > 3}
        return keywords

    def keyword_match_score(self, text: str, keywords: Set[str]) -> float:
        """Calculate keyword match score"""
        text_lower = text.lower()
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        return matches / len(keywords) if keywords else 0

    def hybrid_search(
        self,
        query: str,
        top_k: int = 10,
        vector_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> List[Dict]:
        """Hybrid search with weighted scoring"""
        # Extract keywords
        keywords = self.extract_keywords(query)

        # Vector search (get more results for re-ranking)
        query_embedding = self.embedding_generator.generate_embedding(query)
        vector_results = self.vector_store.search(query_embedding, top_k=top_k * 2)

        # Re-rank with keyword boosting
        for result in vector_results:
            vector_score = result.get("score", 0)
            keyword_score = self.keyword_match_score(result["text"], keywords)

            # Combined score
            result["combined_score"] = (
                vector_weight * vector_score +
                keyword_weight * keyword_score
            )

        # Sort by combined score
        vector_results.sort(key=lambda x: x["combined_score"], reverse=True)

        return vector_results[:top_k]

# Usage
keyword_search = KeywordBoostingSearch(pinecone_store, generator)

results = keyword_search.hybrid_search(
    query="database indexing performance optimization",
    top_k=5,
    vector_weight=0.7,
    keyword_weight=0.3
)

for result in results:
    print(f"Combined Score: {result['combined_score']:.4f}")
    print(f"Text: {result['text'][:100]}...\n")
```

---

## Step 6: Sample Queries with Explanations

### Query 1: Basic Semantic Search

```python
# Query: "How do I set up authentication?"
query = "How do I set up authentication?"
results = search_engine.search(query, top_k=3)

# Explanation:
# - Converts query to embedding vector
# - Finds documents with similar embeddings (semantic similarity)
# - Returns top 3 most similar documents
# - Will find documents about "authentication setup", "auth configuration", etc.
#   even if they don't use exact words "set up authentication"
```

**Why it works:**
- Semantic understanding: "set up" ≈ "configure" ≈ "initialize"
- Finds conceptually similar content, not just keyword matches

### Query 2: Filtered Search

```python
# Query: "API rate limiting" (only in API documentation)
query = "API rate limiting"
results = hybrid_engine.search_with_filter(
    query=query,
    source_pattern=".*api.*",
    top_k=5
)

# Explanation:
# - Semantic search for "API rate limiting"
# - Filters results to only include documents from API docs
# - Combines vector similarity with metadata filtering
# - More precise results than pure semantic search
```

**Why it works:**
- Narrows search scope to relevant documentation section
- Reduces noise from unrelated documents
- Faster search (fewer vectors to compare)

### Query 3: Hybrid Search with Keyword Boosting

```python
# Query: "PostgreSQL index optimization"
query = "PostgreSQL index optimization"
results = keyword_search.hybrid_search(
    query=query,
    top_k=5,
    vector_weight=0.6,
    keyword_weight=0.4
)

# Explanation:
# - Semantic search finds conceptually similar documents
# - Keyword matching boosts documents containing "PostgreSQL", "index", "optimization"
# - Weighted combination: 60% semantic similarity, 40% keyword match
# - Balances semantic understanding with exact term matching
```

**Why it works:**
- Semantic search finds related concepts (e.g., "database tuning")
- Keyword boosting prioritizes documents with specific terms (e.g., "PostgreSQL")
- Best of both worlds: semantic understanding + term precision

### Query 4: Multi-Filter Search

```python
# Query: "error handling" (only in Python docs, markdown files)
query = "error handling"
results = hybrid_engine.search_with_filter(
    query=query,
    document_type="markdown",
    source_pattern=".*python.*",
    top_k=5
)

# Explanation:
# - Semantic search for "error handling"
# - Filter 1: Only markdown files
# - Filter 2: Only Python documentation
# - Highly targeted results
```

**Why it works:**
- Multiple filters narrow search scope significantly
- Reduces false positives from other languages/formats
- Faster and more accurate results

### Query 5: RAG (Retrieval-Augmented Generation)

```python
def rag_query(question: str, search_engine, llm_client):
    """Answer question using RAG"""
    # 1. Retrieve relevant context
    results = search_engine.search(question, top_k=5)
    context = "\n\n".join([r["text"] for r in results])

    # 2. Augment prompt with context
    prompt = f"""
    Context from documentation:
    {context}

    Question: {question}

    Answer the question based on the context above. If the context doesn't
    contain enough information, say so.
    """

    # 3. Generate answer with LLM
    response = llm_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": [r["metadata"]["source"] for r in results]
    }

# Usage
question = "What are the best practices for database indexing?"
result = rag_query(question, search_engine, OpenAI(api_key=os.getenv("OPENAI_API_KEY")))

print(f"Answer: {result['answer']}")
print(f"\nSources: {', '.join(result['sources'])}")

# Explanation:
# - Retrieves top 5 most relevant documents
# - Provides context to LLM
# - LLM generates answer based on retrieved context
# - Returns answer with source citations
```

**Why it works:**
- Combines retrieval (vector search) with generation (LLM)
- Grounds LLM responses in actual documentation
- Provides source attribution for verification
- Reduces hallucinations (LLM making up information)

---

## Complete Example: End-to-End Workflow

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 1. Load documents
print("Step 1: Loading documents...")
loader = DocumentLoader()
documents = loader.load_markdown_files("./docs")
print(f"Loaded {len(documents)} documents")

# 2. Chunk documents
print("\nStep 2: Chunking documents...")
chunker = DocumentChunker(chunk_size=512, overlap=50)
chunked_documents = chunker.chunk_documents(documents)
print(f"Created {len(chunked_documents)} chunks")

# 3. Generate embeddings
print("\nStep 3: Generating embeddings...")
generator = EmbeddingGenerator(api_key=os.getenv("OPENAI_API_KEY"))
embedded_documents = generator.embed_documents(chunked_documents)
print(f"Generated embeddings for {len(embedded_documents)} chunks")

# 4. Store in vector database
print("\nStep 4: Storing in Pinecone...")
pinecone_store = PineconeVectorStore(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT"),
    index_name="knowledge-base"
)
pinecone_store.create_index(dimension=1536)
pinecone_store.upsert_documents(embedded_documents)
print("Documents stored successfully")

# 5. Create search engines
print("\nStep 5: Creating search engines...")
search_engine = SemanticSearchEngine(pinecone_store, generator)
hybrid_engine = HybridSearchEngine(pinecone_store, generator)
keyword_search = KeywordBoostingSearch(pinecone_store, generator)

# 6. Run sample queries
print("\n" + "="*80)
print("SAMPLE QUERIES")
print("="*80)

# Query 1: Basic semantic search
print("\n[Query 1] Basic Semantic Search")
print("Query: 'How to configure database indexes?'")
results = search_engine.search("How to configure database indexes?", top_k=3)
print(search_engine.format_results(results))

# Query 2: Filtered search
print("\n[Query 2] Filtered Search")
print("Query: 'API authentication' (only markdown files)")
results = hybrid_engine.search_with_filter(
    query="API authentication",
    document_type="markdown",
    top_k=3
)
print(search_engine.format_results(results))

# Query 3: Hybrid search with keyword boosting
print("\n[Query 3] Hybrid Search with Keyword Boosting")
print("Query: 'PostgreSQL performance optimization'")
results = keyword_search.hybrid_search(
    query="PostgreSQL performance optimization",
    top_k=3,
    vector_weight=0.7,
    keyword_weight=0.3
)
for i, result in enumerate(results, 1):
    print(f"\n--- Result {i} (Combined Score: {result['combined_score']:.4f}) ---")
    print(f"Source: {result['metadata'].get('source', 'Unknown')}")
    print(f"Text: {result['text'][:200]}...")

print("\n" + "="*80)
print("Search system ready!")
print("="*80)
```

---

## Performance Metrics

### Measuring Search Quality

```python
def evaluate_search_quality(search_engine, test_queries, ground_truth):
    """Evaluate search quality using test queries"""
    metrics = {
        "precision_at_5": [],
        "recall_at_5": [],
        "mrr": []  # Mean Reciprocal Rank
    }

    for query, relevant_docs in zip(test_queries, ground_truth):
        results = search_engine.search(query, top_k=5)
        result_ids = [r["id"] for r in results]

        # Precision@5
        relevant_found = len(set(result_ids) & set(relevant_docs))
        precision = relevant_found / 5
        metrics["precision_at_5"].append(precision)

        # Recall@5
        recall = relevant_found / len(relevant_docs) if relevant_docs else 0
        metrics["recall_at_5"].append(recall)

        # MRR
        for i, result_id in enumerate(result_ids, 1):
            if result_id in relevant_docs:
                metrics["mrr"].append(1 / i)
                break
        else:
            metrics["mrr"].append(0)

    return {
        "precision_at_5": sum(metrics["precision_at_5"]) / len(metrics["precision_at_5"]),
        "recall_at_5": sum(metrics["recall_at_5"]) / len(metrics["recall_at_5"]),
        "mrr": sum(metrics["mrr"]) / len(metrics["mrr"])
    }

# Example
test_queries = [
    "How to configure database indexes?",
    "API authentication best practices",
    "PostgreSQL performance tuning"
]

ground_truth = [
    ["docs/database/indexing.md_chunk_0", "docs/database/indexing.md_chunk_1"],
    ["docs/api/auth.md_chunk_0", "docs/api/security.md_chunk_2"],
    ["docs/database/postgres.md_chunk_5", "docs/database/performance.md_chunk_3"]
]

metrics = evaluate_search_quality(search_engine, test_queries, ground_truth)
print(f"Precision@5: {metrics['precision_at_5']:.2%}")
print(f"Recall@5: {metrics['recall_at_5']:.2%}")
print(f"MRR: {metrics['mrr']:.4f}")
```

---

## Summary

**What We Built:**
1. ✅ Document ingestion pipeline (markdown, PDF)
2. ✅ Intelligent chunking with overlap
3. ✅ Embedding generation with OpenAI
4. ✅ Vector storage in Pinecone/Weaviate
5. ✅ Semantic similarity search
6. ✅ Hybrid search (vector + metadata filtering)
7. ✅ Keyword boosting for precision
8. ✅ RAG implementation for Q&A
9. ✅ Performance evaluation metrics

**Key Takeaways:**
- Vector databases enable semantic search (meaning-based, not keyword-based)
- Chunking strategy affects search quality (512 tokens with 50 token overlap works well)
- Hybrid search (vector + metadata) provides best results
- RAG combines retrieval with LLM generation for accurate answers
- Always measure search quality with precision, recall, and MRR metrics

**Next Steps:**
- See `../rules/vector-databases.md` for vector database fundamentals
- See `../rules/vector-embeddings.md` for embedding strategies
- See `../rules/vector-indexing.md` for index optimization
- Experiment with different chunking strategies and embedding models
- Tune hybrid search weights for your use case
