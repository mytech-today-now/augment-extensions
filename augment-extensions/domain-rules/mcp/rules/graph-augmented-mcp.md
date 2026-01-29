# Graph-Augmented MCP Guidelines

## Overview

**Graph-augmented MCP** uses knowledge graphs to model entities, relationships, and temporal dynamics. This enables structured reasoning, relationship traversal, and context-aware retrieval.

**Key Challenge**: Extracting entities and relationships accurately, maintaining graph consistency, and efficiently traversing large graphs.

---

## 1. Entity Extraction

### Named Entity Recognition (NER)

Extract entities using NER models:

```python
import spacy

def extract_entities_ner(text: str):
    """Extract entities using spaCy NER"""
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    
    entities = []
    for ent in doc.ents:
        entities.append({
            'text': ent.text,
            'type': ent.label_,
            'start': ent.start_char,
            'end': ent.end_char
        })
    
    return entities
```

### LLM-Based Extraction

Use LLMs for complex entity extraction:

```python
def extract_entities_llm(text: str):
    """Extract entities using LLM"""
    prompt = f"""
    Extract all entities from the following text.
    For each entity, provide:
    - name: The entity name
    - type: The entity type (PERSON, ORG, LOCATION, PRODUCT, etc.)
    - description: Brief description
    
    Text: {text}
    
    Return as JSON array: [{{"name": "...", "type": "...", "description": "..."}}, ...]
    """
    
    response = llm_call(prompt)
    entities = json.loads(response)
    
    return entities
```

### Hybrid Extraction

Combine NER and LLM:

```python
def extract_entities_hybrid(text: str):
    """Hybrid entity extraction"""
    # Stage 1: NER for common entities
    ner_entities = extract_entities_ner(text)
    
    # Stage 2: LLM for domain-specific entities
    llm_entities = extract_entities_llm(text)
    
    # Merge and deduplicate
    all_entities = {}
    
    for entity in ner_entities:
        key = entity['text'].lower()
        all_entities[key] = entity
    
    for entity in llm_entities:
        key = entity['name'].lower()
        if key not in all_entities:
            all_entities[key] = {
                'text': entity['name'],
                'type': entity['type'],
                'description': entity.get('description', '')
            }
    
    return list(all_entities.values())
```

**Best Practices**:
- Use NER for speed and common entities
- Use LLM for domain-specific entities
- Combine both for best results
- Validate and deduplicate entities

---

## 2. Relationship Extraction

### Pattern-Based Extraction

Use dependency parsing:

```python
def extract_relationships_pattern(text: str):
    """Extract relationships using dependency parsing"""
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    
    relationships = []
    
    for token in doc:
        if token.dep_ in ['nsubj', 'dobj']:
            # Subject-Verb-Object pattern
            subject = token.text
            verb = token.head.text
            
            # Find object
            for child in token.head.children:
                if child.dep_ == 'dobj':
                    obj = child.text
                    relationships.append({
                        'subject': subject,
                        'predicate': verb,
                        'object': obj
                    })
    
    return relationships
```

### LLM-Based Extraction

Use LLMs for complex relationships:

```python
def extract_relationships_llm(text: str, entities: list):
    """Extract relationships using LLM"""
    entity_names = [e['text'] for e in entities]
    
    prompt = f"""
    Given these entities: {', '.join(entity_names)}
    
    Extract all relationships from the text.
    For each relationship, provide:
    - subject: Entity 1
    - predicate: Relationship type
    - object: Entity 2
    - confidence: 0-1 score
    
    Text: {text}
    
    Return as JSON array: [{{"subject": "...", "predicate": "...", "object": "...", "confidence": 0.9}}, ...]
    """
    
    response = llm_call(prompt)
    relationships = json.loads(response)
    
    return relationships
```

**Best Practices**:
- Extract entities first, then relationships
- Use pattern-based for simple relationships
- Use LLM for complex, domain-specific relationships
- Validate relationship consistency

---

## 3. Graph Modeling

### Graph Schema

Define graph schema:

```python
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class Entity(BaseModel):
    id: str
    name: str
    type: str
    properties: Dict[str, any] = {}
    created_at: datetime
    updated_at: datetime

class Relationship(BaseModel):
    id: str
    subject_id: str
    predicate: str
    object_id: str
    properties: Dict[str, any] = {}
    confidence: float = 1.0
    created_at: datetime
    updated_at: datetime

class KnowledgeGraph(BaseModel):
    entities: Dict[str, Entity] = {}
    relationships: List[Relationship] = []
```

### Graph Construction

Build graph from text:

```python
class GraphBuilder:
    """Build knowledge graph from text"""
    
    def __init__(self):
        self.graph = KnowledgeGraph()
    
    def add_text(self, text: str):
        """Add text to graph"""
        # Extract entities
        entities = extract_entities_hybrid(text)
        
        # Add entities to graph
        for entity in entities:
            entity_id = self.generate_id(entity['text'])
            if entity_id not in self.graph.entities:
                self.graph.entities[entity_id] = Entity(
                    id=entity_id,
                    name=entity['text'],
                    type=entity['type'],
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
        
        # Extract relationships
        relationships = extract_relationships_llm(text, entities)
        
        # Add relationships to graph
        for rel in relationships:
            subject_id = self.generate_id(rel['subject'])
            object_id = self.generate_id(rel['object'])
            
            if subject_id in self.graph.entities and object_id in self.graph.entities:
                self.graph.relationships.append(Relationship(
                    id=self.generate_id(f"{subject_id}-{rel['predicate']}-{object_id}"),
                    subject_id=subject_id,
                    predicate=rel['predicate'],
                    object_id=object_id,
                    confidence=rel.get('confidence', 1.0),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                ))
    
    def generate_id(self, text: str) -> str:
        """Generate stable ID from text"""
        import hashlib
        return hashlib.md5(text.lower().encode()).hexdigest()[:8]
```

**Best Practices**:
- Use stable IDs (hash-based)
- Version graph schema
- Validate graph consistency
- Support incremental updates

---

## 4. Graph Traversal

### Breadth-First Search (BFS)

Find related entities:

```python
from collections import deque

def bfs_traverse(graph: KnowledgeGraph, start_entity_id: str, max_depth=2):
    """BFS traversal from start entity"""
    visited = set()
    queue = deque([(start_entity_id, 0)])
    results = []

    while queue:
        entity_id, depth = queue.popleft()

        if entity_id in visited or depth > max_depth:
            continue

        visited.add(entity_id)

        # Add entity to results
        if entity_id in graph.entities:
            results.append({
                'entity': graph.entities[entity_id],
                'depth': depth
            })

        # Find connected entities
        for rel in graph.relationships:
            if rel.subject_id == entity_id and rel.object_id not in visited:
                queue.append((rel.object_id, depth + 1))
            elif rel.object_id == entity_id and rel.subject_id not in visited:
                queue.append((rel.subject_id, depth + 1))

    return results
```

### Path Finding

Find paths between entities:

```python
def find_paths(graph: KnowledgeGraph, start_id: str, end_id: str, max_depth=3):
    """Find all paths between two entities"""
    paths = []

    def dfs(current_id, target_id, path, visited, depth):
        if depth > max_depth:
            return

        if current_id == target_id:
            paths.append(path.copy())
            return

        visited.add(current_id)

        # Explore neighbors
        for rel in graph.relationships:
            next_id = None
            if rel.subject_id == current_id and rel.object_id not in visited:
                next_id = rel.object_id
            elif rel.object_id == current_id and rel.subject_id not in visited:
                next_id = rel.subject_id

            if next_id:
                path.append((rel, next_id))
                dfs(next_id, target_id, path, visited, depth + 1)
                path.pop()

        visited.remove(current_id)

    dfs(start_id, end_id, [], set(), 0)
    return paths
```

### Subgraph Extraction

Extract relevant subgraph:

```python
def extract_subgraph(graph: KnowledgeGraph, entity_ids: list, max_depth=1):
    """Extract subgraph around entities"""
    subgraph_entities = set(entity_ids)
    subgraph_relationships = []

    # BFS from each entity
    for entity_id in entity_ids:
        neighbors = bfs_traverse(graph, entity_id, max_depth)
        for neighbor in neighbors:
            subgraph_entities.add(neighbor['entity'].id)

    # Extract relationships within subgraph
    for rel in graph.relationships:
        if rel.subject_id in subgraph_entities and rel.object_id in subgraph_entities:
            subgraph_relationships.append(rel)

    return KnowledgeGraph(
        entities={eid: graph.entities[eid] for eid in subgraph_entities if eid in graph.entities},
        relationships=subgraph_relationships
    )
```

**Best Practices**:
- Limit traversal depth to avoid explosion
- Use BFS for finding nearby entities
- Use DFS for path finding
- Extract subgraphs for context

---

## 5. Retrieval Strategies

### Entity-Based Retrieval

Retrieve by entity:

```python
def retrieve_by_entity(graph: KnowledgeGraph, entity_name: str, max_depth=2):
    """Retrieve context around an entity"""
    # Find entity
    entity_id = None
    for eid, entity in graph.entities.items():
        if entity.name.lower() == entity_name.lower():
            entity_id = eid
            break

    if not entity_id:
        return []

    # Traverse graph
    results = bfs_traverse(graph, entity_id, max_depth)

    # Format results
    context = []
    for result in results:
        entity = result['entity']
        depth = result['depth']

        # Find relationships
        rels = [r for r in graph.relationships
                if r.subject_id == entity.id or r.object_id == entity.id]

        context.append({
            'entity': entity.name,
            'type': entity.type,
            'depth': depth,
            'relationships': [
                f"{graph.entities[r.subject_id].name} {r.predicate} {graph.entities[r.object_id].name}"
                for r in rels
                if r.subject_id in graph.entities and r.object_id in graph.entities
            ]
        })

    return context
```

### Relationship-Based Retrieval

Retrieve by relationship type:

```python
def retrieve_by_relationship(graph: KnowledgeGraph, predicate: str, limit=10):
    """Retrieve entities connected by relationship type"""
    results = []

    for rel in graph.relationships:
        if rel.predicate.lower() == predicate.lower():
            subject = graph.entities.get(rel.subject_id)
            obj = graph.entities.get(rel.object_id)

            if subject and obj:
                results.append({
                    'subject': subject.name,
                    'predicate': rel.predicate,
                    'object': obj.name,
                    'confidence': rel.confidence
                })

        if len(results) >= limit:
            break

    return results
```

**Best Practices**:
- Use entity-based retrieval for specific queries
- Use relationship-based retrieval for pattern queries
- Combine with vector search for best results
- Limit depth and breadth to control context size

---

## 6. Temporal Decay

### Time-Based Weighting

Weight entities by recency:

```python
from datetime import datetime, timedelta
import math

def apply_temporal_decay(entities: list, decay_rate=0.1):
    """Apply temporal decay to entity scores"""
    now = datetime.now()

    for entity in entities:
        # Calculate age in days
        age_days = (now - entity['updated_at']).days

        # Apply exponential decay
        decay_factor = math.exp(-decay_rate * age_days)

        # Update score
        entity['score'] = entity.get('score', 1.0) * decay_factor

    return sorted(entities, key=lambda x: x['score'], reverse=True)
```

### Sliding Window

Keep only recent entities:

```python
def sliding_window_filter(graph: KnowledgeGraph, window_days=30):
    """Filter graph to recent entities"""
    cutoff = datetime.now() - timedelta(days=window_days)

    # Filter entities
    recent_entities = {
        eid: entity
        for eid, entity in graph.entities.items()
        if entity.updated_at >= cutoff
    }

    # Filter relationships
    recent_relationships = [
        rel for rel in graph.relationships
        if rel.updated_at >= cutoff
        and rel.subject_id in recent_entities
        and rel.object_id in recent_entities
    ]

    return KnowledgeGraph(
        entities=recent_entities,
        relationships=recent_relationships
    )
```

**Best Practices**:
- Apply temporal decay for long-running agents
- Use sliding windows to limit graph size
- Adjust decay rate based on domain
- Preserve important entities regardless of age

---

## 7. Graph Database Options

### Comparison

| Database | Type | Scale | Query Language | Features |
|----------|------|-------|----------------|----------|
| **Neo4j** | Native graph | Billions | Cypher | ACID, clustering, visualization |
| **Amazon Neptune** | Managed | Billions | Gremlin/SPARQL | Serverless, high availability |
| **ArangoDB** | Multi-model | Millions | AQL | Document + Graph, flexible |
| **NetworkX** | In-memory | Thousands | Python API | Simple, local, analysis |

### Neo4j Example

```python
from neo4j import GraphDatabase

class Neo4jGraph:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def add_entity(self, entity: Entity):
        """Add entity to Neo4j"""
        with self.driver.session() as session:
            session.run(
                "MERGE (e:Entity {id: $id}) "
                "SET e.name = $name, e.type = $type, e.updated_at = datetime()",
                id=entity.id, name=entity.name, type=entity.type
            )

    def add_relationship(self, rel: Relationship):
        """Add relationship to Neo4j"""
        with self.driver.session() as session:
            session.run(
                "MATCH (a:Entity {id: $subject_id}), (b:Entity {id: $object_id}) "
                "MERGE (a)-[r:RELATES {predicate: $predicate}]->(b) "
                "SET r.confidence = $confidence, r.updated_at = datetime()",
                subject_id=rel.subject_id,
                object_id=rel.object_id,
                predicate=rel.predicate,
                confidence=rel.confidence
            )

    def traverse(self, entity_id: str, max_depth=2):
        """Traverse graph from entity"""
        with self.driver.session() as session:
            result = session.run(
                "MATCH path = (start:Entity {id: $id})-[*1..$depth]-(end:Entity) "
                "RETURN path",
                id=entity_id, depth=max_depth
            )
            return [record["path"] for record in result]
```

**Best Practices**:
- Use Neo4j for production graph workloads
- Use NetworkX for prototyping and analysis
- Use managed services (Neptune) for scale
- Optimize queries with indexes

---

## 8. Best Practices

### DO

✅ **Extract entities accurately**: Use hybrid NER + LLM
✅ **Validate relationships**: Ensure consistency
✅ **Limit traversal depth**: Avoid graph explosion
✅ **Apply temporal decay**: Keep graph relevant
✅ **Use graph databases**: For large-scale graphs
✅ **Combine with vector search**: Best of both worlds
✅ **Version graph schema**: Support evolution
✅ **Monitor graph size**: Prune periodically

### DON'T

❌ **Don't extract all entities**: Be selective
❌ **Don't ignore confidence scores**: Use for filtering
❌ **Don't traverse entire graph**: Limit scope
❌ **Don't keep stale entities**: Apply decay
❌ **Don't use in-memory for large graphs**: Use database
❌ **Don't forget to deduplicate**: Entities and relationships
❌ **Don't ignore graph structure**: Leverage relationships

---

## 9. Common Pitfalls

### Graph Explosion

**Problem**: Graph grows too large, traversal too slow

**Solution**:
- Limit traversal depth (1-3 hops)
- Apply temporal decay
- Prune low-confidence relationships
- Use subgraph extraction

### Poor Entity Extraction

**Problem**: Missing or incorrect entities

**Solution**:
- Use hybrid NER + LLM extraction
- Validate entities against schema
- Implement entity resolution (deduplication)
- Use domain-specific models

### Relationship Noise

**Problem**: Too many low-quality relationships

**Solution**:
- Filter by confidence threshold
- Validate relationship types
- Use pattern-based extraction for precision
- Review and prune periodically

---

## Configuration Example

```json
{
  "mcp": {
    "type": "graph",
    "entityExtraction": {
      "method": "hybrid",
      "nerModel": "en_core_web_sm",
      "llmModel": "gpt-4o-mini",
      "confidenceThreshold": 0.7
    },
    "relationshipExtraction": {
      "method": "llm",
      "llmModel": "gpt-4o-mini",
      "confidenceThreshold": 0.8
    },
    "graphDatabase": {
      "provider": "neo4j",
      "uri": "bolt://localhost:7687",
      "maxConnections": 50
    },
    "traversal": {
      "maxDepth": 2,
      "maxResults": 50
    },
    "temporalDecay": {
      "enabled": true,
      "decayRate": 0.1,
      "slidingWindowDays": 30
    },
    "tokenBudget": {
      "maxGraphTokens": 2048
    }
  }
}
```

---

