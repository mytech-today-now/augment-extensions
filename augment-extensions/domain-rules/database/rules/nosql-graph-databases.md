# NoSQL Graph Databases

## Overview

This document covers graph databases (Neo4j, ArangoDB, Amazon Neptune), including node and relationship modeling, Cypher/AQL query languages, traversal optimization, graph algorithms, indexing, schema constraints, and use cases for social networks, recommendation engines, and knowledge graphs.

---

## Graph Database Fundamentals

### What is a Graph Database?

**Definition**: Database that stores data as nodes (entities) and relationships (edges) between nodes

**Characteristics:**
- Nodes represent entities (users, products, locations)
- Relationships connect nodes with direction and properties
- Properties stored on both nodes and relationships
- Optimized for traversing relationships
- Flexible schema
- Rich query language for graph operations

**Core Concepts:**
```
(Node)-[RELATIONSHIP]->(Node)

Example:
(User:Person {name: "Alice"})-[:FOLLOWS]->(User:Person {name: "Bob"})
```

### Popular Graph Databases

**Neo4j:**
- Most popular graph database
- Cypher query language
- ACID transactions
- Native graph storage and processing
- Rich ecosystem and tooling
- Community and Enterprise editions

**ArangoDB:**
- Multi-model database (document, graph, key-value)
- AQL query language
- Distributed architecture
- Horizontal scalability
- ACID transactions
- Open source

**Amazon Neptune:**
- Fully managed graph database
- Supports Gremlin and SPARQL
- High availability and durability
- Automatic backups
- Read replicas
- AWS integration

**JanusGraph:**
- Open source distributed graph database
- Supports Gremlin
- Pluggable storage backends (Cassandra, HBase, BerkeleyDB)
- Pluggable indexing (Elasticsearch, Solr)
- Horizontal scalability

---

## Node and Relationship Modeling

### Nodes

**Definition**: Entities in the graph (vertices)

**Components:**
- **Labels**: Categories/types (e.g., Person, Product, Location)
- **Properties**: Key-value pairs (e.g., name, age, email)
- **ID**: Unique identifier (auto-generated or custom)

**Example (Cypher - Neo4j):**
```cypher
// Create node with label and properties
CREATE (u:User {
  id: "user123",
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 28,
  created_at: datetime()
})

// Multiple labels
CREATE (p:Person:Employee {
  name: "Bob Smith",
  department: "Engineering"
})
```

**Example (AQL - ArangoDB):**
```aql
// Insert document into collection (becomes node)
INSERT {
  _key: "user123",
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 28,
  created_at: DATE_NOW()
} INTO users
```

### Relationships

**Definition**: Connections between nodes (edges)

**Components:**
- **Type**: Relationship category (e.g., FOLLOWS, LIKES, PURCHASED)
- **Direction**: From source node to target node
- **Properties**: Key-value pairs (e.g., since, weight, count)

**Example (Cypher):**
```cypher
// Create relationship between existing nodes
MATCH (a:User {name: "Alice"}), (b:User {name: "Bob"})
CREATE (a)-[:FOLLOWS {since: date(), weight: 1.0}]->(b)

// Create nodes and relationship in one statement
CREATE (a:User {name: "Alice"})-[:FOLLOWS {since: date()}]->(b:User {name: "Bob"})

// Bidirectional relationships (create two)
MATCH (a:User {name: "Alice"}), (b:User {name: "Bob"})
CREATE (a)-[:FRIENDS_WITH {since: date()}]->(b),
       (b)-[:FRIENDS_WITH {since: date()}]->(a)
```

**Example (AQL):**
```aql
// Insert edge document
INSERT {
  _from: "users/alice",
  _to: "users/bob",
  type: "follows",
  since: DATE_NOW(),
  weight: 1.0
} INTO follows
```

### Modeling Patterns

#### Pattern 1: Direct Relationships

**Use for**: Simple connections between entities

```cypher
// Social network
(User)-[:FOLLOWS]->(User)
(User)-[:LIKES]->(Post)
(User)-[:COMMENTED_ON]->(Post)

// E-commerce
(User)-[:PURCHASED]->(Product)
(Product)-[:BELONGS_TO]->(Category)
(User)-[:REVIEWED]->(Product)
```

#### Pattern 2: Intermediate Nodes

**Use for**: Complex relationships with rich metadata

```cypher
// ❌ BAD: Too many properties on relationship
(User)-[:PURCHASED {
  order_id: "order123",
  quantity: 2,
  price: 29.99,
  shipping_address: "123 Main St",
  payment_method: "credit_card",
  status: "shipped"
}]->(Product)

// ✅ GOOD: Use intermediate node
(User)-[:PLACED]->(Order {
  id: "order123",
  total: 59.98,
  status: "shipped",
  shipping_address: "123 Main St"
})-[:CONTAINS {quantity: 2, price: 29.99}]->(Product)
```

#### Pattern 3: Hyperedges (Multi-way Relationships)

**Use for**: Relationships involving more than two nodes

```cypher
// Meeting with multiple participants
(User1)-[:ATTENDED]->(Meeting)<-[:ATTENDED]-(User2)
(User1)-[:ATTENDED]->(Meeting)<-[:ATTENDED]-(User3)
(Meeting)-[:HELD_AT]->(Location)
(Meeting)-[:SCHEDULED_BY]->(User1)
```

---

## Cypher Query Language (Neo4j)

### Basic Queries

**Create:**
```cypher
// Create single node
CREATE (u:User {name: "Alice", email: "alice@example.com"})

// Create multiple nodes
CREATE (u1:User {name: "Alice"}),
       (u2:User {name: "Bob"}),
       (u1)-[:FOLLOWS]->(u2)

// Create and return
CREATE (u:User {name: "Charlie"})
RETURN u
```

**Read (Match):**
```cypher
// Find all users
MATCH (u:User)
RETURN u

// Find user by property
MATCH (u:User {name: "Alice"})
RETURN u

// Find with WHERE clause
MATCH (u:User)
WHERE u.age > 25
RETURN u.name, u.age

// Find relationships
MATCH (a:User)-[:FOLLOWS]->(b:User)
RETURN a.name AS follower, b.name AS following

// Find with relationship properties
MATCH (a:User)-[r:FOLLOWS]->(b:User)
WHERE r.since > date('2024-01-01')
RETURN a.name, b.name, r.since
```

**Update:**
```cypher
// Update properties
MATCH (u:User {name: "Alice"})
SET u.age = 29, u.updated_at = datetime()

// Add label
MATCH (u:User {name: "Alice"})
SET u:Premium

// Remove property
MATCH (u:User {name: "Alice"})
REMOVE u.age
```

**Delete:**
```cypher
// Delete node (must delete relationships first)
MATCH (u:User {name: "Alice"})
DETACH DELETE u  // Deletes node and all relationships

// Delete relationship only
MATCH (a:User)-[r:FOLLOWS]->(b:User)
WHERE a.name = "Alice" AND b.name = "Bob"
DELETE r
```

### Graph Traversal

**Pattern matching:**
```cypher
// Friends of friends
MATCH (me:User {name: "Alice"})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof)
RETURN DISTINCT fof.name

// Variable length paths (1 to 3 hops)
MATCH (a:User {name: "Alice"})-[:FOLLOWS*1..3]->(b:User)
RETURN b.name, length(path) AS hops

// Shortest path
MATCH path = shortestPath(
  (a:User {name: "Alice"})-[:FOLLOWS*]-(b:User {name: "Charlie"})
)
RETURN path, length(path) AS distance

// All paths
MATCH path = (a:User {name: "Alice"})-[:FOLLOWS*]-(b:User {name: "Charlie"})
RETURN path
```

**Aggregation:**
```cypher
// Count followers
MATCH (u:User)<-[:FOLLOWS]-(follower)
RETURN u.name, count(follower) AS follower_count
ORDER BY follower_count DESC

// Average age of followers
MATCH (u:User {name: "Alice"})<-[:FOLLOWS]-(follower)
RETURN avg(follower.age) AS avg_follower_age

// Group by
MATCH (u:User)-[:LIVES_IN]->(city:City)
RETURN city.name, count(u) AS user_count
ORDER BY user_count DESC
```

### Advanced Patterns

**Recommendations:**
```cypher
// Recommend users to follow (friends of friends not already following)
MATCH (me:User {name: "Alice"})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(recommendation)
WHERE NOT (me)-[:FOLLOWS]->(recommendation) AND recommendation <> me
RETURN recommendation.name, count(*) AS mutual_friends
ORDER BY mutual_friends DESC
LIMIT 10

// Recommend products (based on similar users' purchases)
MATCH (me:User {name: "Alice"})-[:PURCHASED]->(p:Product)<-[:PURCHASED]-(other:User)
MATCH (other)-[:PURCHASED]->(recommendation:Product)
WHERE NOT (me)-[:PURCHASED]->(recommendation)
RETURN recommendation.name, count(*) AS score
ORDER BY score DESC
LIMIT 10
```

**Mutual connections:**
```cypher
// Find mutual friends
MATCH (me:User {name: "Alice"})-[:FOLLOWS]->(mutual)<-[:FOLLOWS]-(other:User {name: "Bob"})
RETURN mutual.name

// Count mutual friends
MATCH (a:User {name: "Alice"})-[:FOLLOWS]->(mutual)<-[:FOLLOWS]-(b:User {name: "Bob"})
RETURN count(mutual) AS mutual_count
```

**Influence/Centrality:**
```cypher
// Find most influential users (most followers)
MATCH (u:User)<-[:FOLLOWS]-(follower)
RETURN u.name, count(follower) AS influence
ORDER BY influence DESC
LIMIT 10

// PageRank-style influence (followers of influential users)
MATCH (u:User)<-[:FOLLOWS]-(follower)<-[:FOLLOWS]-(fof)
RETURN u.name, count(DISTINCT fof) AS second_degree_influence
ORDER BY second_degree_influence DESC
```

---

## AQL Query Language (ArangoDB)

### Basic Queries

**Create:**
```aql
// Insert document (node)
INSERT {
  name: "Alice",
  email: "alice@example.com",
  age: 28
} INTO users

// Insert edge (relationship)
INSERT {
  _from: "users/alice",
  _to: "users/bob",
  type: "follows",
  since: DATE_NOW()
} INTO follows
```

**Read:**
```aql
// Find all users
FOR u IN users
  RETURN u

// Find by property
FOR u IN users
  FILTER u.name == "Alice"
  RETURN u

// Find with relationships
FOR u IN users
  FOR v, e IN 1..1 OUTBOUND u follows
    RETURN {user: u.name, follows: v.name}
```

**Traversal:**
```aql
// Friends of friends (2 hops)
FOR u IN users
  FILTER u.name == "Alice"
  FOR v IN 2..2 OUTBOUND u follows
    RETURN DISTINCT v.name

// Shortest path
FOR path IN OUTBOUND SHORTEST_PATH
  "users/alice" TO "users/charlie"
  follows
  RETURN path

// All paths with depth limit
FOR v, e, p IN 1..3 OUTBOUND "users/alice" follows
  RETURN {vertex: v.name, depth: LENGTH(p.edges)}
```

---

## Indexing and Performance

### Indexes

**Neo4j:**
```cypher
// Create index on property
CREATE INDEX user_email FOR (u:User) ON (u.email)

// Create composite index
CREATE INDEX user_name_age FOR (u:User) ON (u.name, u.age)

// Create unique constraint (creates index automatically)
CREATE CONSTRAINT user_email_unique FOR (u:User) REQUIRE u.email IS UNIQUE

// Full-text index
CREATE FULLTEXT INDEX user_search FOR (u:User) ON EACH [u.name, u.bio]

// List indexes
SHOW INDEXES

// Drop index
DROP INDEX user_email
```

**ArangoDB:**
```aql
// Create hash index
db.users.ensureIndex({ type: "hash", fields: ["email"], unique: true })

// Create skiplist index (for range queries)
db.users.ensureIndex({ type: "skiplist", fields: ["age"] })

// Create fulltext index
db.users.ensureIndex({ type: "fulltext", fields: ["name", "bio"] })

// Create geo index
db.locations.ensureIndex({ type: "geo", fields: ["coordinates"] })
```

### Query Optimization

**Use indexes:**
```cypher
// ❌ BAD: No index, full scan
MATCH (u:User)
WHERE u.email = "alice@example.com"
RETURN u

// ✅ GOOD: Create index first
CREATE INDEX user_email FOR (u:User) ON (u.email)

MATCH (u:User)
WHERE u.email = "alice@example.com"
RETURN u
```

**Limit traversal depth:**
```cypher
// ❌ BAD: Unbounded traversal (can be very slow)
MATCH (a:User {name: "Alice"})-[:FOLLOWS*]->(b:User)
RETURN b

// ✅ GOOD: Limit depth
MATCH (a:User {name: "Alice"})-[:FOLLOWS*1..3]->(b:User)
RETURN b
```

**Use LIMIT:**
```cypher
// ❌ BAD: Returns all results
MATCH (u:User)
RETURN u
ORDER BY u.created_at DESC

// ✅ GOOD: Limit results
MATCH (u:User)
RETURN u
ORDER BY u.created_at DESC
LIMIT 100
```

**Profile queries:**
```cypher
// Analyze query performance
PROFILE
MATCH (a:User {name: "Alice"})-[:FOLLOWS]->(b:User)
RETURN b

// Explain query plan
EXPLAIN
MATCH (a:User {name: "Alice"})-[:FOLLOWS]->(b:User)
RETURN b
```

---

## Graph Algorithms

### Centrality Algorithms

**Degree Centrality** (number of connections):
```cypher
// In Neo4j Graph Data Science library
CALL gds.degree.stream('myGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS user, score AS connections
ORDER BY score DESC
LIMIT 10
```

**PageRank** (importance based on connections):
```cypher
CALL gds.pageRank.stream('myGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS user, score AS pagerank
ORDER BY score DESC
LIMIT 10
```

**Betweenness Centrality** (bridge nodes):
```cypher
CALL gds.betweenness.stream('myGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS user, score AS betweenness
ORDER BY score DESC
LIMIT 10
```

### Community Detection

**Louvain** (find communities):
```cypher
CALL gds.louvain.stream('myGraph')
YIELD nodeId, communityId
RETURN communityId, collect(gds.util.asNode(nodeId).name) AS members
ORDER BY size(members) DESC
```

**Label Propagation**:
```cypher
CALL gds.labelPropagation.stream('myGraph')
YIELD nodeId, communityId
RETURN communityId, count(*) AS size
ORDER BY size DESC
```

### Pathfinding

**Shortest Path**:
```cypher
MATCH path = shortestPath(
  (a:User {name: "Alice"})-[:FOLLOWS*]-(b:User {name: "Charlie"})
)
RETURN path, length(path) AS distance
```

**All Shortest Paths**:
```cypher
MATCH path = allShortestPaths(
  (a:User {name: "Alice"})-[:FOLLOWS*]-(b:User {name: "Charlie"})
)
RETURN path
```

**Dijkstra (weighted shortest path)**:
```cypher
CALL gds.shortestPath.dijkstra.stream('myGraph', {
  sourceNode: id(a),
  targetNode: id(b),
  relationshipWeightProperty: 'weight'
})
YIELD path, totalCost
RETURN path, totalCost
```

---

## Schema Constraints

### Neo4j Constraints

**Unique constraints:**
```cypher
// Ensure email is unique
CREATE CONSTRAINT user_email_unique FOR (u:User) REQUIRE u.email IS UNIQUE

// Composite unique constraint
CREATE CONSTRAINT user_username_unique FOR (u:User) REQUIRE (u.username, u.domain) IS UNIQUE
```

**Existence constraints (Enterprise only):**
```cypher
// Require property exists
CREATE CONSTRAINT user_email_exists FOR (u:User) REQUIRE u.email IS NOT NULL

// Require relationship property exists
CREATE CONSTRAINT follows_since_exists FOR ()-[r:FOLLOWS]-() REQUIRE r.since IS NOT NULL
```

**Node key constraints:**
```cypher
// Combination of unique and existence
CREATE CONSTRAINT user_key FOR (u:User) REQUIRE (u.id) IS NODE KEY
```

### ArangoDB Validation

**Schema validation:**
```javascript
// Define schema for collection
db._create("users", {
  schema: {
    rule: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
        age: { type: "integer", minimum: 0 }
      },
      required: ["name", "email"]
    },
    level: "moderate"  // none, new, moderate, strict
  }
})
```

---

## Use Cases

### Social Networks

**Entities:**
- Users (nodes)
- Posts (nodes)
- Comments (nodes)

**Relationships:**
- FOLLOWS (User → User)
- LIKES (User → Post)
- COMMENTED_ON (User → Post)
- REPLIED_TO (Comment → Comment)

**Queries:**
- Find friends of friends
- Recommend users to follow
- Find mutual connections
- Calculate influence/reach

### Recommendation Engines

**Collaborative filtering:**
```cypher
// Recommend products based on similar users
MATCH (me:User {id: $userId})-[:PURCHASED]->(p:Product)<-[:PURCHASED]-(similar:User)
MATCH (similar)-[:PURCHASED]->(recommendation:Product)
WHERE NOT (me)-[:PURCHASED]->(recommendation)
RETURN recommendation.name, count(*) AS score
ORDER BY score DESC
LIMIT 10
```

**Content-based filtering:**
```cypher
// Recommend similar products
MATCH (me:User {id: $userId})-[:PURCHASED]->(p:Product)-[:IN_CATEGORY]->(c:Category)
MATCH (recommendation:Product)-[:IN_CATEGORY]->(c)
WHERE NOT (me)-[:PURCHASED]->(recommendation)
RETURN recommendation.name, count(c) AS category_overlap
ORDER BY category_overlap DESC
LIMIT 10
```

### Knowledge Graphs

**Entities:**
- Concepts (nodes)
- Documents (nodes)
- Authors (nodes)

**Relationships:**
- RELATED_TO (Concept → Concept)
- MENTIONS (Document → Concept)
- AUTHORED_BY (Document → Author)
- CITES (Document → Document)

**Queries:**
- Find related concepts
- Discover connections between topics
- Trace citation networks
- Expert finding

### Fraud Detection

**Pattern detection:**
```cypher
// Find suspicious transaction patterns
MATCH (a:Account)-[:TRANSFERRED]->(b:Account)-[:TRANSFERRED]->(c:Account)
WHERE a.id = $accountId AND c.id = $accountId
RETURN a, b, c  // Circular transfer pattern

// Find accounts with shared attributes
MATCH (a1:Account)-[:HAS_PHONE]->(p:Phone)<-[:HAS_PHONE]-(a2:Account)
WHERE a1 <> a2
RETURN a1, a2, p  // Multiple accounts with same phone
```

---

## Best Practices

### DO

✅ **Model relationships explicitly** (don't hide in properties)
✅ **Use meaningful relationship types** (FOLLOWS, LIKES, not RELATED_TO)
✅ **Create indexes on frequently queried properties**
✅ **Limit traversal depth** to avoid performance issues
✅ **Use LIMIT** to restrict result sets
✅ **Profile queries** to identify bottlenecks
✅ **Use graph algorithms** for complex analysis
✅ **Implement constraints** for data integrity
✅ **Denormalize when needed** (store computed values)

### DON'T

❌ **Don't use graphs for simple key-value lookups** (use key-value store instead)
❌ **Don't create unbounded relationships** (e.g., unlimited followers)
❌ **Don't store large binary data in nodes** (use external storage)
❌ **Don't use graphs for aggregations** (use OLAP database instead)
❌ **Don't create too many relationship types** (keep it simple)
❌ **Don't ignore indexes** (critical for performance)
❌ **Don't traverse without depth limits** (can cause infinite loops)

---

## Summary

**Graph databases excel at:**
- Relationship-heavy data
- Complex traversals
- Pattern matching
- Recommendation engines
- Social networks
- Fraud detection
- Knowledge graphs

**Key concepts:**
- **Nodes**: Entities with labels and properties
- **Relationships**: Directed connections with types and properties
- **Cypher/AQL**: Declarative query languages
- **Traversal**: Following relationships across nodes
- **Algorithms**: Centrality, community detection, pathfinding

**Performance tips:**
- Create indexes on queried properties
- Limit traversal depth
- Use LIMIT for large result sets
- Profile queries to identify bottlenecks
- Use graph algorithms for complex analysis


