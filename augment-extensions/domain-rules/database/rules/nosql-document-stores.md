# NoSQL Document Stores

## Overview

This document covers document store databases (MongoDB, CouchDB, Couchbase), including schema design patterns (embedding vs referencing), denormalization strategies, indexing, aggregation pipelines, transactions, sharding, replication, and query optimization.

---

## Document Store Fundamentals

### What is a Document Store?

**Definition**: Database that stores data as documents (typically JSON/BSON)

**Characteristics:**
- Documents are self-contained units of data
- Flexible schema (each document can have different fields)
- Nested data structures (arrays, objects)
- Rich query capabilities
- Horizontal scalability

**Document Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "addresses": [
    {
      "type": "home",
      "street": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zip": "02101"
    }
  ],
  "preferences": {
    "newsletter": true,
    "notifications": {
      "email": true,
      "sms": false
    }
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Popular Document Databases

**MongoDB:**
- Most popular document database
- BSON (Binary JSON) format
- Rich query language
- Aggregation framework
- Sharding and replication
- ACID transactions (4.0+)

**CouchDB:**
- HTTP/REST API
- Multi-version concurrency control (MVCC)
- Eventual consistency
- Master-master replication
- MapReduce views

**Couchbase:**
- Combines document store with key-value store
- N1QL query language (SQL-like)
- Built-in caching
- High performance
- Mobile sync (Couchbase Lite)

---

## Schema Design Patterns

### Embedding vs Referencing

**Key Decision**: Should related data be embedded or referenced?

#### Embedding (Denormalization)

**Store related data within the same document:**

```javascript
// User with embedded addresses
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "addresses": [
    { "type": "home", "street": "123 Main St", "city": "Boston" },
    { "type": "work", "street": "456 Office Blvd", "city": "Cambridge" }
  ],
  "payment_methods": [
    { "type": "credit_card", "last4": "1234", "brand": "Visa" },
    { "type": "paypal", "email": "john@paypal.com" }
  ]
}
```

**Advantages:**
- ✅ Single query to retrieve all data
- ✅ Better read performance
- ✅ Atomic updates (single document)
- ✅ Data locality (related data stored together)

**Disadvantages:**
- ❌ Data duplication
- ❌ Document size limits (16MB in MongoDB)
- ❌ Difficult to query embedded data across documents
- ❌ Update complexity if data is duplicated

**When to embed:**
- ✅ One-to-few relationships (< 100 items)
- ✅ Data is always accessed together
- ✅ Data doesn't change frequently
- ✅ Embedded data is specific to parent document

#### Referencing (Normalization)

**Store references (IDs) to related data:**

```javascript
// User document
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com"
}

// Address documents (separate collection)
{
  "_id": "addr456",
  "user_id": "user123",
  "type": "home",
  "street": "123 Main St",
  "city": "Boston"
}

{
  "_id": "addr789",
  "user_id": "user123",
  "type": "work",
  "street": "456 Office Blvd",
  "city": "Cambridge"
}
```

**Advantages:**
- ✅ No data duplication
- ✅ Smaller document size
- ✅ Easier to query related data independently
- ✅ Easier to update (single location)

**Disadvantages:**
- ❌ Multiple queries required (application-level joins)
- ❌ Slower read performance
- ❌ No atomic updates across documents (without transactions)

**When to reference:**
- ✅ One-to-many or many-to-many relationships
- ✅ Data is accessed independently
- ✅ Data changes frequently
- ✅ Embedded data would exceed document size limits
- ✅ Data is shared across multiple documents

### Hybrid Approach

**Combine embedding and referencing:**

```javascript
// Blog post with embedded author summary + reference
{
  "_id": "post123",
  "title": "Introduction to NoSQL",
  "content": "...",
  "author": {
    "id": "user456",           // Reference to full user document
    "name": "John Doe",        // Embedded for display
    "avatar_url": "..."        // Embedded for display
  },
  "comments": [
    {
      "id": "comment789",
      "author": {
        "id": "user789",
        "name": "Jane Smith"
      },
      "text": "Great article!",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ],
  "tags": ["nosql", "mongodb", "databases"],  // Embedded (small, static)
  "category_id": "cat123",                     // Reference (shared across posts)
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Benefits:**
- ✅ Fast reads (embedded display data)
- ✅ Consistent updates (reference to source of truth)
- ✅ Flexible querying

### One-to-Many Relationships

**Pattern 1: Embed child in parent (one-to-few)**
```javascript
// Order with embedded line items
{
  "_id": "order123",
  "customer_id": "user456",
  "items": [
    { "product_id": "prod789", "name": "Widget", "quantity": 2, "price": 10.00 },
    { "product_id": "prod012", "name": "Gadget", "quantity": 1, "price": 25.00 }
  ],
  "total": 45.00,
  "status": "shipped"
}
```

**Pattern 2: Reference parent in child (one-to-many)**
```javascript
// User document
{ "_id": "user456", "name": "John Doe" }

// Order documents (many)
{ "_id": "order123", "user_id": "user456", "total": 45.00 }
{ "_id": "order124", "user_id": "user456", "total": 99.99 }
```

**Pattern 3: Reference children in parent (one-to-many)**
```javascript
// User with order references
{
  "_id": "user456",
  "name": "John Doe",
  "order_ids": ["order123", "order124", "order125"]
}

// Order documents
{ "_id": "order123", "total": 45.00 }
{ "_id": "order124", "total": 99.99 }
```

### Many-to-Many Relationships

**Pattern 1: Embed array of references**
```javascript
// Product with category references
{
  "_id": "prod123",
  "name": "Laptop",
  "category_ids": ["cat_electronics", "cat_computers", "cat_office"]
}

// Category with product references
{
  "_id": "cat_electronics",
  "name": "Electronics",
  "product_ids": ["prod123", "prod456", "prod789"]
}
```

**Pattern 2: Junction collection**
```javascript
// Product document
{ "_id": "prod123", "name": "Laptop" }

// Category document
{ "_id": "cat_electronics", "name": "Electronics" }

// ProductCategory junction
{
  "_id": "pc123",
  "product_id": "prod123",
  "category_id": "cat_electronics",
  "featured": true,
  "sort_order": 1
}
```

---

## Indexing

### Index Types

**Single Field Index:**
```javascript
// Create index on email field
db.users.createIndex({ email: 1 });  // 1 = ascending, -1 = descending

// Query uses index
db.users.find({ email: "john@example.com" });
```

**Compound Index:**
```javascript
// Create compound index
db.orders.createIndex({ user_id: 1, created_at: -1 });

// Queries that use this index
db.orders.find({ user_id: "user123" }).sort({ created_at: -1 });
db.orders.find({ user_id: "user123", created_at: { $gte: new Date("2024-01-01") } });
```

**Multikey Index (Arrays):**
```javascript
// Create index on array field
db.products.createIndex({ tags: 1 });

// Query uses index
db.products.find({ tags: "electronics" });
```

**Text Index (Full-Text Search):**
```javascript
// Create text index
db.articles.createIndex({ title: "text", content: "text" });

// Full-text search
db.articles.find({ $text: { $search: "mongodb tutorial" } });
```

**Geospatial Index:**
```javascript
// Create 2dsphere index for location data
db.places.createIndex({ location: "2dsphere" });

// Find places near coordinates
db.places.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-73.97, 40.77] },
      $maxDistance: 5000  // meters
    }
  }
});
```

**Unique Index:**
```javascript
// Create unique index
db.users.createIndex({ email: 1 }, { unique: true });

// Duplicate emails will be rejected
```

**Partial Index:**
```javascript
// Index only documents matching filter
db.orders.createIndex(
  { user_id: 1, created_at: -1 },
  { partialFilterExpression: { status: "active" } }
);

// Only indexes active orders
```

**TTL Index (Time-To-Live):**
```javascript
// Auto-delete documents after expiration
db.sessions.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 3600 }  // Delete after 1 hour
);
```

### Index Best Practices

**DO:**
- ✅ Create indexes for frequently queried fields
- ✅ Use compound indexes for multi-field queries
- ✅ Create indexes before querying large collections
- ✅ Use covered queries (query only indexed fields)
- ✅ Monitor index usage with explain()
- ✅ Remove unused indexes

**DON'T:**
- ❌ Create too many indexes (slows writes)
- ❌ Index low-cardinality fields (few unique values)
- ❌ Forget to index foreign keys
- ❌ Create redundant indexes

---

## Aggregation Pipelines

### What is Aggregation?

**Definition**: Process documents through a pipeline of stages to compute results

**Common stages:**
- `$match`: Filter documents
- `$group`: Group by field and compute aggregates
- `$project`: Select/transform fields
- `$sort`: Sort documents
- `$limit`: Limit number of documents
- `$skip`: Skip documents
- `$lookup`: Join with another collection
- `$unwind`: Deconstruct array field

### Aggregation Examples

**Example 1: Group and count**
```javascript
// Count orders by status
db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// Result:
// [
//   { "_id": "shipped", "count": 150 },
//   { "_id": "pending", "count": 45 },
//   { "_id": "cancelled", "count": 5 }
// ]
```

**Example 2: Filter, group, and calculate**
```javascript
// Total revenue by user for orders in 2024
db.orders.aggregate([
  { $match: { created_at: { $gte: new Date("2024-01-01") } } },
  { $group: {
      _id: "$user_id",
      total_revenue: { $sum: "$total" },
      order_count: { $sum: 1 },
      avg_order: { $avg: "$total" }
    }
  },
  { $sort: { total_revenue: -1 } },
  { $limit: 10 }
]);
```

**Example 3: Unwind array and group**
```javascript
// Count products by tag
db.products.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

**Example 4: Lookup (join)**
```javascript
// Join orders with user data
db.orders.aggregate([
  { $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  { $project: {
      order_id: "$_id",
      total: 1,
      user_name: "$user.name",
      user_email: "$user.email"
    }
  }
]);
```

**Example 5: Complex aggregation with multiple stages**
```javascript
// Top 5 customers by revenue with order details
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: {
      _id: "$user_id",
      total_spent: { $sum: "$total" },
      order_count: { $sum: 1 },
      orders: { $push: { order_id: "$_id", total: "$total", date: "$created_at" } }
    }
  },
  { $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  { $project: {
      user_name: "$user.name",
      user_email: "$user.email",
      total_spent: 1,
      order_count: 1,
      avg_order: { $divide: ["$total_spent", "$order_count"] },
      orders: 1
    }
  },
  { $sort: { total_spent: -1 } },
  { $limit: 5 }
]);
```

---

## Transactions

### Multi-Document Transactions (MongoDB 4.0+)

**ACID transactions across multiple documents:**

```javascript
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    // Deduct from sender
    await db.accounts.updateOne(
      { _id: senderId },
      { $inc: { balance: -amount } },
      { session }
    );

    // Add to receiver
    await db.accounts.updateOne(
      { _id: receiverId },
      { $inc: { balance: amount } },
      { session }
    );

    // Log transaction
    await db.transactions.insertOne({
      from: senderId,
      to: receiverId,
      amount: amount,
      timestamp: new Date()
    }, { session });
  });

  console.log("Transaction committed");
} catch (error) {
  console.log("Transaction aborted:", error);
} finally {
  await session.endSession();
}
```

### Single-Document Atomicity

**All updates to a single document are atomic:**

```javascript
// Atomic update - all fields updated together
db.orders.updateOne(
  { _id: orderId },
  {
    $set: { status: "shipped", shipped_at: new Date() },
    $inc: { version: 1 },
    $push: { status_history: { status: "shipped", timestamp: new Date() } }
  }
);
```

### Optimistic Concurrency Control

**Use version field to prevent conflicts:**

```javascript
// Read document with version
const product = await db.products.findOne({ _id: productId });
const currentVersion = product.version;

// Update with version check
const result = await db.products.updateOne(
  { _id: productId, version: currentVersion },
  {
    $set: { stock: product.stock - quantity },
    $inc: { version: 1 }
  }
);

if (result.modifiedCount === 0) {
  throw new Error("Concurrent modification detected - retry");
}
```

---

## Sharding

### What is Sharding?

**Definition**: Horizontal partitioning of data across multiple servers

**Benefits:**
- ✅ Horizontal scalability
- ✅ Distribute load across servers
- ✅ Store more data than single server can handle

**Shard Key**: Field used to partition data

### Choosing a Shard Key

**Good shard keys:**
- ✅ High cardinality (many unique values)
- ✅ Even distribution of data
- ✅ Supports common query patterns
- ✅ Rarely updated

**Bad shard keys:**
- ❌ Low cardinality (few unique values)
- ❌ Monotonically increasing (e.g., auto-increment ID, timestamp)
- ❌ Frequently updated

**Example: Shard by user_id**
```javascript
// Enable sharding on database
sh.enableSharding("myapp");

// Shard collection by user_id
sh.shardCollection("myapp.orders", { user_id: 1 });

// Queries with user_id are routed to specific shard
db.orders.find({ user_id: "user123" });  // Targeted query

// Queries without user_id scan all shards
db.orders.find({ status: "pending" });  // Scatter-gather query
```

**Example: Compound shard key**
```javascript
// Shard by user_id and created_at
sh.shardCollection("myapp.events", { user_id: 1, created_at: 1 });

// Better distribution for time-series data
```

---

## Replication

### What is Replication?

**Definition**: Maintain multiple copies of data across servers

**Benefits:**
- ✅ High availability (failover)
- ✅ Data redundancy
- ✅ Read scalability (read from replicas)
- ✅ Disaster recovery

### MongoDB Replica Set

**Architecture:**
- **Primary**: Accepts writes
- **Secondary**: Replicates from primary
- **Arbiter**: Participates in elections (no data)

**Example: Configure replica set**
```javascript
// Initialize replica set
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});

// Check status
rs.status();
```

**Read Preferences:**
```javascript
// Read from primary (default)
db.users.find().readPref("primary");

// Read from secondary (eventual consistency)
db.users.find().readPref("secondary");

// Read from primary preferred
db.users.find().readPref("primaryPreferred");

// Read from nearest (lowest latency)
db.users.find().readPref("nearest");
```

**Write Concerns:**
```javascript
// Wait for write to be acknowledged by majority
db.orders.insertOne(
  { user_id: "user123", total: 99.99 },
  { writeConcern: { w: "majority", wtimeout: 5000 } }
);

// Write to primary only (faster, less durable)
db.logs.insertOne(
  { message: "User logged in" },
  { writeConcern: { w: 1 } }
);
```

---

## Query Optimization

### Use Indexes

**Always create indexes for queried fields:**

```javascript
// Create index
db.users.createIndex({ email: 1 });

// Query uses index
db.users.find({ email: "john@example.com" });
```

### Analyze Query Performance

**Use explain() to analyze queries:**

```javascript
// Explain query execution
db.users.find({ email: "john@example.com" }).explain("executionStats");

// Look for:
// - "IXSCAN" (index scan) vs "COLLSCAN" (collection scan)
// - executionTimeMillis
// - totalDocsExamined vs nReturned
```

### Covered Queries

**Query only indexed fields (no document fetch):**

```javascript
// Create index
db.users.createIndex({ email: 1, name: 1 });

// Covered query (only returns indexed fields)
db.users.find(
  { email: "john@example.com" },
  { _id: 0, email: 1, name: 1 }
);
```

### Limit Results

**Always limit results when possible:**

```javascript
// Limit to 10 results
db.users.find({ status: "active" }).limit(10);

// Pagination
db.users.find({ status: "active" }).skip(20).limit(10);
```

### Project Only Needed Fields

**Don't fetch unnecessary fields:**

```javascript
// ❌ BAD: Fetch entire document
db.users.find({ status: "active" });

// ✅ GOOD: Fetch only needed fields
db.users.find(
  { status: "active" },
  { name: 1, email: 1, _id: 0 }
);
```

### Avoid Large Documents

**Keep documents under 16MB (MongoDB limit):**

```javascript
// ❌ BAD: Unbounded array growth
{
  "_id": "user123",
  "events": [/* thousands of events */]
}

// ✅ GOOD: Reference separate collection
{
  "_id": "user123",
  "name": "John Doe"
}

// Events in separate collection
{
  "_id": "event456",
  "user_id": "user123",
  "type": "login",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## Best Practices

### DO

✅ **Design schema for your queries** (query-driven design)
✅ **Use embedding for one-to-few relationships**
✅ **Use referencing for one-to-many relationships**
✅ **Create indexes for frequently queried fields**
✅ **Use aggregation pipelines for complex queries**
✅ **Implement schema validation** (MongoDB schema validation)
✅ **Use transactions when needed** (MongoDB 4.0+)
✅ **Monitor query performance** with explain()
✅ **Shard for horizontal scalability**
✅ **Replicate for high availability**

### DON'T

❌ **Don't over-normalize** - embrace denormalization
❌ **Don't create unbounded arrays** - use separate collections
❌ **Don't skip indexing** - queries will be slow
❌ **Don't use monotonically increasing shard keys**
❌ **Don't ignore document size limits** (16MB in MongoDB)
❌ **Don't fetch entire documents** - project only needed fields
❌ **Don't use $where or $regex without indexes**
❌ **Don't forget to validate data** at application level
❌ **Don't ignore replication lag** - use appropriate read preferences
❌ **Don't skip backups** - data loss is catastrophic

---

## Summary

**Document stores are ideal for:**
- Flexible schema requirements
- Nested/hierarchical data
- Read-heavy workloads
- Horizontal scalability

**Key patterns:**
- **Embedding**: One-to-few relationships, data accessed together
- **Referencing**: One-to-many relationships, data accessed independently
- **Hybrid**: Combine embedding and referencing for optimal performance

**Performance tips:**
- Create indexes for queried fields
- Use aggregation pipelines for complex queries
- Limit and project results
- Monitor with explain()
- Shard for scale, replicate for availability

