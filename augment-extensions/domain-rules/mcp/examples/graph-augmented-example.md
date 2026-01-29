# Graph-Augmented MCP Example: Supply Chain Analysis

## Use Case

A supply chain analysis system that uses knowledge graphs to track entities (suppliers, products, warehouses) and their relationships for complex queries and reasoning.

**Challenges**:
- Model complex entity relationships
- Support multi-hop reasoning
- Handle graph traversal efficiently
- Integrate graph context with LLM generation

---

## Configuration

```json
{
  "mcp": {
    "type": "graph",
    "graphDatabase": {
      "backend": "neo4j",
      "uri": "bolt://localhost:7687",
      "database": "supply-chain"
    },
    "entityExtraction": {
      "enabled": true,
      "model": "gpt-4o",
      "entityTypes": ["SUPPLIER", "PRODUCT", "WAREHOUSE", "CUSTOMER", "ORDER"]
    },
    "relationshipTypes": [
      "SUPPLIES",
      "STORED_IN",
      "ORDERED_BY",
      "SHIPS_TO",
      "DEPENDS_ON"
    ],
    "traversal": {
      "maxDepth": 3,
      "maxNodes": 100,
      "algorithm": "bidirectional_bfs"
    }
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supply Chain Query                        │
│  "Which suppliers can fulfill order #12345?"                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Entity Extraction                               │
│  Entities: [Order #12345]                                   │
│  Intent: Find suppliers                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Knowledge Graph (Neo4j)                         │
│                                                              │
│  (Order #12345) -[CONTAINS]→ (Product A)                    │
│                                    ↓                         │
│                              [SUPPLIED_BY]                   │
│                                    ↓                         │
│                            (Supplier X, Y, Z)                │
│                                    ↓                         │
│                              [STORED_IN]                     │
│                                    ↓                         │
│                            (Warehouse 1, 2)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Graph Traversal                                 │
│  Path: Order → Product → Supplier → Warehouse               │
│  Depth: 3 hops                                              │
│  Nodes: 15 entities                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Serialization                           │
│  Graph → Natural Language Description                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LLM Generation                                  │
│  Graph Context → GPT-4o → Answer                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: Graph Manager

```python
from neo4j import GraphDatabase
from typing import List, Dict, Any, Optional
import openai

class GraphManager:
    def __init__(self, uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        self.driver.close()
    
    def create_entity(self, entity_type: str, properties: Dict[str, Any]) -> str:
        """Create entity node in graph"""
        with self.driver.session() as session:
            result = session.run(
                f"""
                CREATE (e:{entity_type} $properties)
                RETURN elementId(e) as id
                """,
                properties=properties
            )
            return result.single()["id"]
    
    def create_relationship(
        self,
        from_id: str,
        to_id: str,
        rel_type: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> None:
        """Create relationship between entities"""
        with self.driver.session() as session:
            session.run(
                f"""
                MATCH (a), (b)
                WHERE elementId(a) = $from_id AND elementId(b) = $to_id
                CREATE (a)-[r:{rel_type} $properties]->(b)
                """,
                from_id=from_id,
                to_id=to_id,
                properties=properties or {}
            )
    
    def find_paths(
        self,
        start_entity: Dict[str, Any],
        end_entity: Dict[str, Any],
        max_depth: int = 3
    ) -> List[Dict[str, Any]]:
        """Find paths between entities"""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH path = (start)-[*1..$max_depth]-(end)
                WHERE start.id = $start_id AND end.id = $end_id
                RETURN path
                LIMIT 10
                """,
                start_id=start_entity["id"],
                end_id=end_entity["id"],
                max_depth=max_depth
            )
            
            paths = []
            for record in result:
                path = record["path"]
                paths.append(self._serialize_path(path))
            
            return paths
    
    def traverse_from_entity(
        self,
        entity_id: str,
        max_depth: int = 2,
        max_nodes: int = 100
    ) -> Dict[str, Any]:
        """Traverse graph from entity"""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH path = (start)-[*1..$max_depth]-(connected)
                WHERE elementId(start) = $entity_id
                RETURN path
                LIMIT $max_nodes
                """,
                entity_id=entity_id,
                max_depth=max_depth,
                max_nodes=max_nodes
            )
            
            nodes = []
            relationships = []
            
            for record in result:
                path = record["path"]
                for node in path.nodes:
                    nodes.append({
                        "id": node.element_id,
                        "labels": list(node.labels),
                        "properties": dict(node)
                    })
                
                for rel in path.relationships:
                    relationships.append({
                        "type": rel.type,
                        "start": rel.start_node.element_id,
                        "end": rel.end_node.element_id,
                        "properties": dict(rel)
                    })
            
            return {
                "nodes": nodes,
                "relationships": relationships
            }

    def _serialize_path(self, path) -> Dict[str, Any]:
        """Serialize Neo4j path to dict"""
        nodes = [
            {
                "id": node.element_id,
                "labels": list(node.labels),
                "properties": dict(node)
            }
            for node in path.nodes
        ]

        relationships = [
            {
                "type": rel.type,
                "properties": dict(rel)
            }
            for rel in path.relationships
        ]

        return {
            "nodes": nodes,
            "relationships": relationships
        }

class SupplyChainAnalyzer:
    def __init__(self, graph_manager: GraphManager, openai_api_key: str):
        self.graph = graph_manager
        self.client = openai.OpenAI(api_key=openai_api_key)

    def extract_entities(self, query: str) -> List[Dict[str, Any]]:
        """Extract entities from query using LLM"""
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Extract entities from the query.

Entity types: SUPPLIER, PRODUCT, WAREHOUSE, CUSTOMER, ORDER

Return JSON array of entities:
[{"type": "ORDER", "value": "#12345"}, ...]"""
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            response_format={"type": "json_object"}
        )

        import json
        result = json.loads(response.choices[0].message.content)
        return result.get("entities", [])

    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze supply chain query using graph"""
        # Extract entities from query
        entities = self.extract_entities(query)

        if not entities:
            return {"answer": "No entities found in query", "graph_context": None}

        # Get graph context for entities
        graph_contexts = []
        for entity in entities:
            # Find entity in graph
            entity_id = self._find_entity_id(entity)

            if entity_id:
                # Traverse graph from entity
                subgraph = self.graph.traverse_from_entity(
                    entity_id=entity_id,
                    max_depth=3,
                    max_nodes=100
                )
                graph_contexts.append(subgraph)

        # Serialize graph to natural language
        graph_description = self._serialize_graph_to_text(graph_contexts)

        # Generate answer using LLM
        answer = self._generate_answer(query, graph_description)

        return {
            "answer": answer,
            "graph_context": graph_contexts,
            "entities_found": entities
        }

    def _find_entity_id(self, entity: Dict[str, Any]) -> Optional[str]:
        """Find entity ID in graph"""
        with self.graph.driver.session() as session:
            result = session.run(
                f"""
                MATCH (e:{entity['type']})
                WHERE e.id = $value OR e.name = $value
                RETURN elementId(e) as id
                LIMIT 1
                """,
                value=entity["value"]
            )

            record = result.single()
            return record["id"] if record else None

    def _serialize_graph_to_text(self, graph_contexts: List[Dict[str, Any]]) -> str:
        """Convert graph structure to natural language"""
        parts = []

        for i, context in enumerate(graph_contexts, 1):
            parts.append(f"=== Subgraph {i} ===")

            # Describe nodes
            parts.append("Entities:")
            for node in context["nodes"][:20]:  # Limit to 20 nodes
                labels = ", ".join(node["labels"])
                props = ", ".join(f"{k}={v}" for k, v in node["properties"].items())
                parts.append(f"  - {labels}: {props}")

            # Describe relationships
            parts.append("\nRelationships:")
            for rel in context["relationships"][:20]:  # Limit to 20 relationships
                parts.append(f"  - {rel['type']}")

            parts.append("")

        return "\n".join(parts)

    def _generate_answer(self, query: str, graph_context: str) -> str:
        """Generate answer using graph context"""
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are a supply chain analyst.

Use the provided graph context to answer questions about:
- Supplier relationships
- Product availability
- Warehouse locations
- Order fulfillment
- Dependencies

Be specific and cite entities from the graph."""
                },
                {
                    "role": "user",
                    "content": f"""Graph Context:
{graph_context}

Query: {query}

Answer:"""
                }
            ],
            temperature=0.3
        )

        return response.choices[0].message.content
```

---

## Usage Example

```python
# Initialize graph manager
graph = GraphManager(
    uri="bolt://localhost:7687",
    user="neo4j",
    password="password"
)

# Create sample supply chain graph
supplier_id = graph.create_entity("SUPPLIER", {"id": "SUP-001", "name": "Acme Corp"})
product_id = graph.create_entity("PRODUCT", {"id": "PROD-123", "name": "Widget A"})
warehouse_id = graph.create_entity("WAREHOUSE", {"id": "WH-001", "location": "New York"})
order_id = graph.create_entity("ORDER", {"id": "#12345", "status": "pending"})

# Create relationships
graph.create_relationship(supplier_id, product_id, "SUPPLIES", {"quantity": 1000})
graph.create_relationship(product_id, warehouse_id, "STORED_IN", {"quantity": 500})
graph.create_relationship(order_id, product_id, "CONTAINS", {"quantity": 10})

# Initialize analyzer
analyzer = SupplyChainAnalyzer(graph, "your-openai-key")

# Analyze query
result = analyzer.analyze_query("Which suppliers can fulfill order #12345?")

print(f"Answer: {result['answer']}")
print(f"\nEntities Found: {result['entities_found']}")
print(f"Graph Nodes: {len(result['graph_context'][0]['nodes']) if result['graph_context'] else 0}")

# Clean up
graph.close()
```

---

## Key Features

### 1. Entity Extraction
- LLM-based entity recognition
- Support for multiple entity types
- Flexible matching (ID or name)

### 2. Graph Traversal
- Bidirectional BFS algorithm
- Configurable depth and node limits
- Path finding between entities

### 3. Relationship Modeling
- Typed relationships (SUPPLIES, STORED_IN, etc.)
- Relationship properties
- Multi-hop reasoning

### 4. Context Serialization
- Graph → Natural language conversion
- Structured entity descriptions
- Relationship summaries

---

## Testing

```python
import pytest

def test_entity_creation():
    graph = GraphManager("bolt://localhost:7687", "neo4j", "password")

    entity_id = graph.create_entity("SUPPLIER", {"id": "TEST-001", "name": "Test Corp"})
    assert entity_id is not None

    graph.close()

def test_graph_traversal():
    graph = GraphManager("bolt://localhost:7687", "neo4j", "password")

    # Create test entities
    supplier_id = graph.create_entity("SUPPLIER", {"id": "SUP-TEST"})
    product_id = graph.create_entity("PRODUCT", {"id": "PROD-TEST"})
    graph.create_relationship(supplier_id, product_id, "SUPPLIES")

    # Traverse
    subgraph = graph.traverse_from_entity(supplier_id, max_depth=2)

    assert len(subgraph["nodes"]) > 0
    assert len(subgraph["relationships"]) > 0

    graph.close()

def test_entity_extraction():
    analyzer = SupplyChainAnalyzer(None, "your-openai-key")

    entities = analyzer.extract_entities("Which suppliers can fulfill order #12345?")

    assert len(entities) > 0
    assert any(e["type"] == "ORDER" for e in entities)
```

---

## Best Practices

1. **Entity Modeling**: Define clear entity types and properties
2. **Relationship Types**: Use descriptive relationship names
3. **Graph Indexing**: Index frequently queried properties
4. **Traversal Limits**: Set appropriate depth and node limits
5. **Caching**: Cache frequently accessed subgraphs
6. **Batch Operations**: Batch entity/relationship creation
7. **Schema Validation**: Validate graph schema consistency
8. **Monitoring**: Track query performance and graph size

---

## Performance Optimization

- **Indexing**: Create indexes on entity IDs and names
- **Query Optimization**: Use Cypher query profiling
- **Connection Pooling**: Reuse Neo4j connections
- **Caching**: Cache subgraph results
- **Pagination**: Paginate large result sets
- **Parallel Queries**: Execute independent queries in parallel

---

## Security

- **Access Control**: Implement role-based access control
- **Query Validation**: Sanitize Cypher queries
- **Encryption**: Encrypt graph data at rest
- **Audit Logging**: Log all graph modifications
- **Rate Limiting**: Limit traversal depth and nodes per query
```

