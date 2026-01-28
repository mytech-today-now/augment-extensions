# NoSQL Databases

## Overview

This document covers NoSQL database fundamentals, including when to use NoSQL, CAP theorem, eventual consistency, BASE properties, NoSQL types (document, key-value, column-family, graph), database selection criteria, common patterns, and limitations.

---

## When to Use NoSQL Databases

### Ideal Use Cases

**Use NoSQL databases when:**
- ✅ Schema changes frequently or is undefined
- ✅ Horizontal scaling is critical
- ✅ Data is unstructured or semi-structured
- ✅ Eventual consistency is acceptable
- ✅ Simple key-value lookups dominate
- ✅ Document-oriented data model fits naturally
- ✅ High write throughput is required
- ✅ Flexible data models are needed

**Examples:**
- Social media platforms (user profiles, posts, feeds)
- Real-time analytics (logs, metrics, events)
- Content management (articles, media, metadata)
- IoT applications (sensor data, telemetry)
- Session stores (user sessions, shopping carts)
- Caching layers (frequently accessed data)
- Recommendation engines (user preferences, behavior)

### When to Use Relational Instead

**Use relational databases when:**
- ❌ ACID compliance is required
- ❌ Complex queries with JOINs are needed
- ❌ Data integrity is critical
- ❌ Transactions across multiple entities are essential
- ❌ Reporting and analytics with complex aggregations
- ❌ Schema is stable and well-defined
- ❌ Strong consistency is required

---

## CAP Theorem

### Understanding CAP

**CAP Theorem**: A distributed system can provide at most two of three guarantees:

1. **Consistency (C)**: All nodes see the same data at the same time
2. **Availability (A)**: Every request receives a response (success or failure)
3. **Partition Tolerance (P)**: System continues to operate despite network partitions

**Trade-offs:**
- **CP (Consistency + Partition Tolerance)**: Sacrifice availability during partitions
- **AP (Availability + Partition Tolerance)**: Sacrifice consistency during partitions
- **CA (Consistency + Availability)**: Not possible in distributed systems with partitions

### Database Classifications

**CP Databases (Consistency + Partition Tolerance):**
- MongoDB (with majority write concern)
- HBase
- Redis (with replication)
- Consul

**AP Databases (Availability + Partition Tolerance):**
- Cassandra
- DynamoDB
- Riak
- CouchDB

**Note**: Most modern databases allow tuning consistency/availability trade-offs

---

## BASE Properties

### BASE vs ACID

**BASE**: Alternative to ACID for distributed systems

- **Basically Available**: System guarantees availability
- **Soft state**: State may change over time without input (due to eventual consistency)
- **Eventual consistency**: System will become consistent over time

**Comparison:**

| Property | ACID (Relational) | BASE (NoSQL) |
|----------|-------------------|--------------|
| Consistency | Strong | Eventual |
| Availability | May sacrifice | Prioritized |
| Partition Tolerance | Limited | High |
| Transactions | Multi-row | Limited |
| Scalability | Vertical | Horizontal |
| Use Case | Financial, critical data | High-scale, flexible data |

### Eventual Consistency

**Definition**: All replicas will eventually converge to the same value

**Example:**
```javascript
// Write to primary node
await db.users.updateOne(
  { _id: userId },
  { $set: { status: 'active' } }
);

// Read from replica (may return old value temporarily)
const user = await db.users.findOne({ _id: userId });
// user.status might still be 'inactive' for a short time
```

**Strategies:**
- **Read-your-writes consistency**: User sees their own writes immediately
- **Session consistency**: Consistency within a session
- **Monotonic reads**: Once a value is read, subsequent reads return same or newer value
- **Causal consistency**: Related operations are seen in order

---

## NoSQL Database Types

### 1. Document Databases

**Characteristics:**
- Store data as documents (JSON, BSON, XML)
- Flexible schema
- Nested data structures
- Rich query capabilities

**Examples:**
- MongoDB
- CouchDB
- Couchbase
- RavenDB

**Use Cases:**
- Content management systems
- User profiles
- Product catalogs
- Event logging

**See**: `nosql-document-stores.md` for detailed guide

### 2. Key-Value Stores

**Characteristics:**
- Simple key-value pairs
- Fast lookups by key
- Limited query capabilities
- High performance

**Examples:**
- Redis
- DynamoDB
- Riak
- Memcached

**Use Cases:**
- Caching
- Session storage
- Shopping carts
- User preferences

**See**: `nosql-key-value-stores.md` for detailed guide

### 3. Column-Family Databases

**Characteristics:**
- Store data in column families (groups of columns)
- Optimized for write-heavy workloads
- Horizontal scalability
- Sparse data support

**Examples:**
- Cassandra
- HBase
- ScyllaDB
- Google Bigtable

**Use Cases:**
- Time-series data
- Event logging
- IoT sensor data
- Analytics

**Example: Cassandra**
```cql
-- Create keyspace (database)
CREATE KEYSPACE analytics WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 3
};

-- Create column family (table)
CREATE TABLE analytics.events (
  user_id UUID,
  event_time TIMESTAMP,
  event_type TEXT,
  event_data MAP<TEXT, TEXT>,
  PRIMARY KEY (user_id, event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);

-- Insert data
INSERT INTO analytics.events (user_id, event_time, event_type, event_data)
VALUES (uuid(), toTimestamp(now()), 'page_view', {'page': '/home', 'duration': '5s'});

-- Query by partition key
SELECT * FROM analytics.events WHERE user_id = ?;
```

### 4. Graph Databases

**Characteristics:**
- Store data as nodes and relationships
- Optimized for traversing relationships
- Rich query language for graph operations
- Flexible schema

**Examples:**
- Neo4j
- ArangoDB
- Amazon Neptune
- JanusGraph

**Use Cases:**
- Social networks
- Recommendation engines
- Fraud detection
- Knowledge graphs

**See**: `nosql-graph-databases.md` for detailed guide

---

## Database Selection Criteria

### Decision Framework

**1. Data Structure**
- **Structured, relational**: Relational database
- **Documents with nested data**: Document database
- **Simple key-value pairs**: Key-value store
- **Time-series, events**: Column-family database
- **Highly connected data**: Graph database

**2. Query Patterns**
- **Complex JOINs**: Relational database
- **Simple lookups by ID**: Key-value store
- **Rich queries on documents**: Document database
- **Graph traversals**: Graph database
- **Range queries on time-series**: Column-family database

**3. Scalability Requirements**
- **Vertical scaling (single server)**: Relational database, SQLite
- **Horizontal scaling (distributed)**: NoSQL databases
- **Massive write throughput**: Column-family database
- **Massive read throughput**: Key-value store with caching

**4. Consistency Requirements**
- **Strong consistency (ACID)**: Relational database
- **Eventual consistency acceptable**: NoSQL databases
- **Tunable consistency**: Cassandra, DynamoDB, MongoDB

**5. Transaction Requirements**
- **Multi-row transactions**: Relational database
- **Single-document transactions**: Document database
- **No transactions needed**: Key-value store, column-family

### Database Comparison Matrix

| Database | Type | Consistency | Scalability | Query Complexity | Use Case |
|----------|------|-------------|-------------|------------------|----------|
| PostgreSQL | Relational | Strong | Vertical | High | Complex queries, ACID |
| MongoDB | Document | Tunable | Horizontal | Medium | Flexible schema, nested data |
| Redis | Key-Value | Strong | Horizontal | Low | Caching, sessions |
| Cassandra | Column-Family | Tunable | Horizontal | Low | Time-series, high writes |
| Neo4j | Graph | Strong | Vertical | High | Relationships, traversals |
| DynamoDB | Key-Value | Tunable | Horizontal | Low | Simple lookups, high scale |

---

## Common Patterns

### Denormalization

**Principle**: Store redundant data to avoid JOINs and improve read performance

**Example: Blog Application**
```javascript
// ❌ Normalized (relational approach)
// users table: { id, name, email }
// posts table: { id, user_id, title, content }
// Requires JOIN to get author name

// ✅ Denormalized (NoSQL approach)
{
  "_id": "post123",
  "title": "Introduction to NoSQL",
  "content": "...",
  "author": {
    "id": "user456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "created_at": "2024-01-15T10:00:00Z"
}
// Author data embedded in post document
```

**Trade-offs:**
- ✅ Faster reads (no JOINs)
- ✅ Single query to get all data
- ❌ Data duplication
- ❌ Update complexity (must update all copies)

**When to denormalize:**
- ✅ Read-heavy workloads
- ✅ Data rarely changes
- ✅ Query performance is critical
- ❌ Data changes frequently
- ❌ Strong consistency is required

### Embedding vs Referencing

**Embedding**: Store related data within the same document

**Referencing**: Store references (IDs) to related data in separate documents

**Example:**
```javascript
// Embedding (one-to-few relationship)
{
  "_id": "user123",
  "name": "John Doe",
  "addresses": [
    { "type": "home", "street": "123 Main St", "city": "Boston" },
    { "type": "work", "street": "456 Office Blvd", "city": "Boston" }
  ]
}

// Referencing (one-to-many relationship)
// User document
{
  "_id": "user123",
  "name": "John Doe"
}

// Order documents (separate collection)
{
  "_id": "order456",
  "user_id": "user123",
  "total": 99.99,
  "items": [...]
}
```

**When to embed:**
- ✅ One-to-few relationships (< 100 items)
- ✅ Data is always accessed together
- ✅ Data doesn't change frequently
- ✅ Document size stays under limit (16MB in MongoDB)

**When to reference:**
- ✅ One-to-many or many-to-many relationships
- ✅ Data is accessed independently
- ✅ Data changes frequently
- ✅ Document size would exceed limits

### Caching Pattern

**Use NoSQL as cache layer in front of relational database:**

```javascript
// Node.js: Redis cache with PostgreSQL fallback
async function getUser(userId) {
  // Try cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss - query database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // Store in cache with TTL
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
}

// Invalidate cache on update
async function updateUser(userId, data) {
  await db.query('UPDATE users SET ... WHERE id = $1', [userId]);
  await redis.del(`user:${userId}`);  // Invalidate cache
}
```

### Event Sourcing

**Store events instead of current state:**

```javascript
// Event store (append-only)
{
  "_id": "event123",
  "aggregate_id": "account456",
  "event_type": "MoneyDeposited",
  "amount": 100,
  "timestamp": "2024-01-15T10:00:00Z"
}

{
  "_id": "event124",
  "aggregate_id": "account456",
  "event_type": "MoneyWithdrawn",
  "amount": 50,
  "timestamp": "2024-01-15T11:00:00Z"
}

// Rebuild current state by replaying events
function getCurrentBalance(accountId) {
  const events = db.events.find({ aggregate_id: accountId }).sort({ timestamp: 1 });
  let balance = 0;

  for (const event of events) {
    if (event.event_type === 'MoneyDeposited') {
      balance += event.amount;
    } else if (event.event_type === 'MoneyWithdrawn') {
      balance -= event.amount;
    }
  }

  return balance;
}
```

---

## Limitations and Challenges

### Lack of JOINs

**Problem**: NoSQL databases don't support JOINs like relational databases

**Solutions:**
- **Denormalization**: Embed related data
- **Application-level joins**: Fetch related data in multiple queries
- **Aggregation pipelines**: Use database-specific aggregation features (MongoDB)

**Example: Application-level join**
```javascript
// Fetch user
const user = await db.users.findOne({ _id: userId });

// Fetch user's orders (separate query)
const orders = await db.orders.find({ user_id: userId });

// Combine in application
const result = {
  ...user,
  orders: orders
};
```

### No ACID Transactions (Traditional)

**Problem**: Many NoSQL databases don't support multi-document transactions

**Solutions:**
- **Single-document atomicity**: Design schema to keep related data in one document
- **Eventual consistency**: Accept temporary inconsistencies
- **Saga pattern**: Use compensating transactions
- **Modern NoSQL**: Use databases with transaction support (MongoDB 4.0+, DynamoDB transactions)

### Schema Flexibility Can Be a Curse

**Problem**: No enforced schema can lead to data inconsistencies

**Solutions:**
- **Application-level validation**: Validate data before inserting
- **Schema versioning**: Include version field in documents
- **Migration scripts**: Update old documents to new schema
- **Database-level validation**: Use schema validation features (MongoDB schema validation)

**Example: MongoDB schema validation**
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^.+@.+$"
        },
        name: {
          bsonType: "string"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150
        }
      }
    }
  }
});
```

### Query Limitations

**Problem**: Limited query capabilities compared to SQL

**Solutions:**
- **Indexing**: Create indexes for common query patterns
- **Aggregation pipelines**: Use database-specific aggregation features
- **Materialized views**: Pre-compute and store query results
- **Hybrid approach**: Use relational database for complex queries

### Consistency Challenges

**Problem**: Eventual consistency can lead to stale reads

**Solutions:**
- **Read-your-writes consistency**: Configure database to return user's own writes
- **Strong consistency reads**: Use consistency level options (DynamoDB, Cassandra)
- **Conflict resolution**: Implement application-level conflict resolution
- **Version vectors**: Track causality to resolve conflicts

---

## Best Practices

### DO

✅ **Understand your access patterns** before choosing a database
✅ **Design schema for your queries** (query-driven design)
✅ **Use indexes** for frequently queried fields
✅ **Monitor performance** and adjust as needed
✅ **Plan for data growth** and scalability
✅ **Implement proper error handling** for eventual consistency
✅ **Use connection pooling** for better performance
✅ **Validate data** at application level
✅ **Version your schema** for easier migrations
✅ **Test with production-like data volumes**

### DON'T

❌ **Don't use NoSQL for everything** - choose the right tool
❌ **Don't ignore consistency requirements** - understand trade-offs
❌ **Don't over-denormalize** - balance read/write performance
❌ **Don't skip indexing** - queries will be slow
❌ **Don't ignore data modeling** - schema design still matters
❌ **Don't assume infinite scalability** - test at scale
❌ **Don't forget backups** - data loss is catastrophic
❌ **Don't ignore security** - encrypt data, use authentication
❌ **Don't mix paradigms** - understand the database model
❌ **Don't skip monitoring** - observe performance and errors

---

## Summary

**NoSQL databases offer:**
- Flexible schema
- Horizontal scalability
- High performance for specific use cases
- Eventual consistency (trade-off for availability)

**Choose NoSQL when:**
- Schema flexibility is needed
- Horizontal scaling is critical
- Eventual consistency is acceptable
- Simple query patterns dominate

**Choose Relational when:**
- ACID compliance is required
- Complex queries with JOINs are needed
- Strong consistency is critical
- Schema is stable and well-defined

**Key Takeaway**: NoSQL is not a replacement for relational databases - it's a complementary tool for specific use cases. Choose the right database for your requirements.

