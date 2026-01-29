# Vector-Based MCP Example: Knowledge Base Q&A

## Use Case

A knowledge base Q&A system that retrieves relevant documentation using semantic search (RAG - Retrieval Augmented Generation).

**Challenges**:
- Large knowledge base (10,000+ documents)
- Semantic similarity search
- Relevance ranking
- Context window management

---

## Configuration

```json
{
  "mcp": {
    "type": "vector",
    "embedding": {
      "model": "voyage-3-large",
      "dimensions": 1024,
      "batchSize": 100
    },
    "vectorStore": {
      "backend": "pinecone",
      "index": "knowledge-base",
      "metric": "cosine"
    },
    "retrieval": {
      "topK": 10,
      "minScore": 0.7,
      "rerankingEnabled": true,
      "rerankingModel": "cohere-rerank-v3"
    },
    "chunking": {
      "strategy": "semantic",
      "chunkSize": 512,
      "overlap": 50
    }
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Knowledge Base (10,000 documents)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Document Processing Pipeline                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Chunking (semantic, 512 tokens, 50 overlap)      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 2. Embedding (voyage-3-large, 1024 dims)            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 3. Indexing (Pinecone, cosine similarity)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Query Processing                                │
│  User Query → Embed → Vector Search → Rerank → Context      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LLM Generation                                  │
│  Context + Query → GPT-4o → Answer                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: Document Processor

```python
import voyageai
from pinecone import Pinecone
from typing import List, Dict, Any
import hashlib

class DocumentProcessor:
    def __init__(self, voyage_api_key: str, pinecone_api_key: str, index_name: str):
        self.voyage_client = voyageai.Client(api_key=voyage_api_key)
        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index = self.pc.Index(index_name)
        self.chunk_size = 512
        self.overlap = 50
    
    def chunk_document(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Chunk document using semantic chunking"""
        # Simple sentence-based chunking (use semantic chunking in production)
        sentences = text.split('. ')
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            
            if current_length + sentence_length > self.chunk_size:
                # Save current chunk
                chunk_text = '. '.join(current_chunk) + '.'
                chunk_id = hashlib.md5(chunk_text.encode()).hexdigest()
                
                chunks.append({
                    "id": chunk_id,
                    "text": chunk_text,
                    "metadata": {
                        **metadata,
                        "chunk_index": len(chunks),
                        "chunk_length": current_length
                    }
                })
                
                # Start new chunk with overlap
                overlap_sentences = current_chunk[-self.overlap:] if len(current_chunk) > self.overlap else current_chunk
                current_chunk = overlap_sentences + [sentence]
                current_length = sum(len(s.split()) for s in current_chunk)
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        # Add final chunk
        if current_chunk:
            chunk_text = '. '.join(current_chunk) + '.'
            chunk_id = hashlib.md5(chunk_text.encode()).hexdigest()
            chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    **metadata,
                    "chunk_index": len(chunks),
                    "chunk_length": current_length
                }
            })
        
        return chunks
    
    def embed_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate embeddings for chunks"""
        texts = [chunk["text"] for chunk in chunks]
        
        # Batch embedding
        embeddings = self.voyage_client.embed(
            texts=texts,
            model="voyage-3-large",
            input_type="document"
        ).embeddings
        
        for chunk, embedding in zip(chunks, embeddings):
            chunk["embedding"] = embedding
        
        return chunks
    
    def index_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        """Index chunks in Pinecone"""
        vectors = [
            {
                "id": chunk["id"],
                "values": chunk["embedding"],
                "metadata": {
                    "text": chunk["text"],
                    **chunk["metadata"]
                }
            }
            for chunk in chunks
        ]
        
        # Upsert in batches
        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i+batch_size]
            self.index.upsert(vectors=batch)

    def process_document(self, text: str, metadata: Dict[str, Any]) -> None:
        """Full pipeline: chunk → embed → index"""
        chunks = self.chunk_document(text, metadata)
        chunks_with_embeddings = self.embed_chunks(chunks)
        self.index_chunks(chunks_with_embeddings)
```

### Step 2: Retrieval System

```python
import cohere
import openai
from typing import List, Dict, Any

class KnowledgeBaseQA:
    def __init__(
        self,
        voyage_api_key: str,
        pinecone_api_key: str,
        cohere_api_key: str,
        openai_api_key: str,
        index_name: str
    ):
        self.voyage_client = voyageai.Client(api_key=voyage_api_key)
        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index = self.pc.Index(index_name)
        self.cohere_client = cohere.Client(api_key=cohere_api_key)
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.top_k = 10
        self.min_score = 0.7

    def retrieve(self, query: str) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks using vector search"""
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

        # Filter by score
        filtered_results = [
            {
                "id": match.id,
                "score": match.score,
                "text": match.metadata["text"],
                "metadata": {k: v for k, v in match.metadata.items() if k != "text"}
            }
            for match in results.matches
            if match.score >= self.min_score
        ]

        return filtered_results

    def rerank(self, query: str, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rerank documents using Cohere Rerank"""
        if not documents:
            return []

        # Prepare documents for reranking
        texts = [doc["text"] for doc in documents]

        # Rerank
        rerank_results = self.cohere_client.rerank(
            model="rerank-english-v3.0",
            query=query,
            documents=texts,
            top_n=5
        )

        # Map back to original documents
        reranked_docs = []
        for result in rerank_results.results:
            doc = documents[result.index]
            doc["rerank_score"] = result.relevance_score
            reranked_docs.append(doc)

        return reranked_docs

    def answer_question(self, query: str) -> Dict[str, Any]:
        """Answer question using RAG"""
        # Retrieve relevant documents
        retrieved_docs = self.retrieve(query)

        if not retrieved_docs:
            return {
                "answer": "I couldn't find relevant information to answer your question.",
                "sources": []
            }

        # Rerank documents
        reranked_docs = self.rerank(query, retrieved_docs)

        # Build context from top documents
        context_parts = []
        for i, doc in enumerate(reranked_docs[:5], 1):
            source = doc["metadata"].get("source", "Unknown")
            context_parts.append(f"[{i}] {doc['text']}\nSource: {source}")

        context = "\n\n".join(context_parts)

        # Generate answer
        messages = [
            {
                "role": "system",
                "content": """You are a helpful assistant that answers questions based on the provided context.

Rules:
1. Only use information from the provided context
2. If the context doesn't contain the answer, say so
3. Cite sources using [1], [2], etc.
4. Be concise and accurate"""
            },
            {
                "role": "user",
                "content": f"""Context:
{context}

Question: {query}

Answer:"""
            }
        ]

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.3
        )

        answer = response.choices[0].message.content

        return {
            "answer": answer,
            "sources": [
                {
                    "text": doc["text"],
                    "score": doc["score"],
                    "rerank_score": doc["rerank_score"],
                    "metadata": doc["metadata"]
                }
                for doc in reranked_docs
            ]
        }
```

---

## Usage Example

```python
# Initialize processor
processor = DocumentProcessor(
    voyage_api_key="your-voyage-key",
    pinecone_api_key="your-pinecone-key",
    index_name="knowledge-base"
)

# Process documents
documents = [
    {
        "text": "Python is a high-level programming language...",
        "metadata": {"source": "python-docs.pdf", "category": "programming"}
    },
    {
        "text": "Machine learning is a subset of artificial intelligence...",
        "metadata": {"source": "ml-guide.pdf", "category": "ai"}
    }
]

for doc in documents:
    processor.process_document(doc["text"], doc["metadata"])

# Initialize Q&A system
qa_system = KnowledgeBaseQA(
    voyage_api_key="your-voyage-key",
    pinecone_api_key="your-pinecone-key",
    cohere_api_key="your-cohere-key",
    openai_api_key="your-openai-key",
    index_name="knowledge-base"
)

# Ask questions
result = qa_system.answer_question("What is Python?")
print(f"Answer: {result['answer']}")
print(f"\nSources:")
for i, source in enumerate(result['sources'], 1):
    print(f"[{i}] Score: {source['score']:.3f}, Rerank: {source['rerank_score']:.3f}")
    print(f"    {source['metadata']['source']}")
```

---

## Key Features

### 1. Semantic Chunking
- Sentence-based chunking with overlap
- Preserves semantic coherence
- Configurable chunk size

### 2. Vector Embeddings
- Voyage AI embeddings (1024 dimensions)
- Batch processing for efficiency
- Separate embeddings for documents and queries

### 3. Vector Search
- Pinecone vector database
- Cosine similarity metric
- Top-K retrieval with score filtering

### 4. Reranking
- Cohere Rerank for improved relevance
- Cross-encoder architecture
- Top-N selection after reranking

### 5. RAG Generation
- Context-aware answer generation
- Source citation
- Hallucination prevention

---

## Testing

```python
import pytest
from unittest.mock import Mock, patch

def test_chunking():
    processor = DocumentProcessor("key", "key", "index")

    text = "Sentence one. Sentence two. Sentence three."
    metadata = {"source": "test.txt"}

    chunks = processor.chunk_document(text, metadata)

    assert len(chunks) > 0
    assert all("text" in chunk for chunk in chunks)
    assert all("metadata" in chunk for chunk in chunks)

def test_retrieval():
    qa_system = KnowledgeBaseQA("key", "key", "key", "key", "index")

    with patch.object(qa_system.index, 'query') as mock_query:
        mock_query.return_value = Mock(matches=[
            Mock(id="1", score=0.9, metadata={"text": "Test document"})
        ])

        results = qa_system.retrieve("test query")

        assert len(results) > 0
        assert results[0]["score"] >= qa_system.min_score

def test_answer_generation():
    qa_system = KnowledgeBaseQA("key", "key", "key", "key", "index")

    with patch.object(qa_system, 'retrieve') as mock_retrieve:
        mock_retrieve.return_value = [
            {"id": "1", "score": 0.9, "text": "Python is a programming language", "metadata": {}}
        ]

        with patch.object(qa_system, 'rerank') as mock_rerank:
            mock_rerank.return_value = [
                {"id": "1", "score": 0.9, "rerank_score": 0.95, "text": "Python is a programming language", "metadata": {}}
            ]

            result = qa_system.answer_question("What is Python?")

            assert "answer" in result
            assert "sources" in result
```

---

## Best Practices

1. **Chunking Strategy**: Use semantic chunking for better coherence
2. **Embedding Model**: Choose model based on domain (general vs. specialized)
3. **Vector Store**: Select based on scale (Pinecone, Weaviate, Qdrant)
4. **Reranking**: Always rerank for improved relevance
5. **Metadata**: Include rich metadata for filtering and attribution
6. **Monitoring**: Track retrieval quality metrics (MRR, NDCG)
7. **Caching**: Cache embeddings for frequently queried documents
8. **Hybrid Search**: Combine vector search with keyword search

---

## Performance Optimization

- **Batch Embedding**: Process documents in batches (100-1000)
- **Async Processing**: Use async I/O for embedding and indexing
- **Index Optimization**: Use appropriate index type (HNSW, IVF)
- **Caching**: Cache query embeddings for repeated queries
- **Compression**: Use quantization for reduced storage
- **Sharding**: Distribute index across multiple shards

---

## Security

- **Access Control**: Implement document-level access control
- **Data Encryption**: Encrypt vectors at rest
- **Query Sanitization**: Sanitize user queries
- **Rate Limiting**: Limit queries per user
- **Audit Logging**: Log all retrieval operations
- **PII Filtering**: Remove PII before indexing
```

