# NoSQL Key-Value Stores

## Overview

This document covers key-value store databases (Redis, DynamoDB, Memcached), including data modeling patterns, caching strategies, TTL management, atomic operations, pub/sub patterns, data structures, and persistence options.

---

## Key-Value Store Fundamentals

### What is a Key-Value Store?

**Definition**: Database that stores data as simple key-value pairs

**Characteristics:**
- Simplest NoSQL database model
- Fast lookups by key (O(1) complexity)
- Limited query capabilities (no complex queries)
- High performance and scalability
- In-memory or persistent storage

**Basic Operations:**
- `GET key` - Retrieve value by key
- `SET key value` - Store value with key
- `DELETE key` - Remove key-value pair
- `EXISTS key` - Check if key exists

**Example:**
```
Key: "user:123:name"
Value: "John Doe"

Key: "session:abc123"
Value: '{"user_id": 123, "expires_at": "2024-01-15T12:00:00Z"}'

Key: "cache:product:456"
Value: '{"id": 456, "name": "Widget", "price": 19.99}'
```

### Popular Key-Value Databases

**Redis:**
- In-memory data store
- Rich data structures (strings, lists, sets, hashes, sorted sets)
- Pub/sub messaging
- Persistence options (RDB, AOF)
- Replication and clustering
- Lua scripting

**DynamoDB (AWS):**
- Fully managed NoSQL database
- Key-value and document store
- Automatic scaling
- Single-digit millisecond latency
- ACID transactions
- Global tables (multi-region)

**Memcached:**
- In-memory caching system
- Simple key-value storage
- No persistence
- Multi-threaded
- LRU eviction

**Riak:**
- Distributed key-value store
- High availability (AP in CAP)
- Eventual consistency
- Multi-datacenter replication

---

## Data Modeling

### Key Design Patterns

**Pattern 1: Namespace with colons**
```
user:123:profile
user:123:settings
user:123:sessions
product:456:details
product:456:inventory
cache:homepage:en
```

**Pattern 2: Hierarchical keys**
```
app:production:user:123:name
app:production:user:123:email
app:staging:user:123:name
```

**Pattern 3: Composite keys**
```
user_session:123:abc123
order_item:456:789
```

### Key Naming Conventions

**Best practices:**
- ✅ Use descriptive names
- ✅ Use consistent separators (`:` or `_`)
- ✅ Include entity type in key
- ✅ Keep keys short but readable
- ✅ Use namespaces to avoid collisions

**Examples:**
```
✅ GOOD:
user:123:profile
session:abc123
cache:product:456

❌ BAD:
u123p (too cryptic)
user_profile_for_user_id_123 (too long)
123 (no context)
```

### Value Serialization

**Store complex data as JSON:**

```javascript
// Node.js with Redis
const user = {
  id: 123,
  name: "John Doe",
  email: "john@example.com",
  created_at: "2024-01-15T10:00:00Z"
};

// Store as JSON string
await redis.set(`user:${user.id}`, JSON.stringify(user));

// Retrieve and parse
const data = await redis.get(`user:${user.id}`);
const user = JSON.parse(data);
```

**Store binary data:**
```javascript
// Store image as binary
const imageBuffer = fs.readFileSync('avatar.jpg');
await redis.set(`avatar:${userId}`, imageBuffer);

// Retrieve binary data
const avatar = await redis.get(`avatar:${userId}`);
```

---

## Caching Strategies

### Cache-Aside (Lazy Loading)

**Pattern**: Application checks cache first, then database

```javascript
async function getUser(userId) {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  let user = await redis.get(cacheKey);
  if (user) {
    return JSON.parse(user);
  }
  
  // Cache miss - query database
  user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // Store in cache with TTL
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}

async function updateUser(userId, data) {
  // Update database
  await db.query('UPDATE users SET ... WHERE id = $1', [userId]);
  
  // Invalidate cache
  await redis.del(`user:${userId}`);
}
```

**Advantages:**
- ✅ Only requested data is cached
- ✅ Cache failures don't break application

**Disadvantages:**
- ❌ Cache miss penalty (extra latency)
- ❌ Stale data possible

### Write-Through Cache

**Pattern**: Write to cache and database simultaneously

```javascript
async function updateUser(userId, data) {
  const cacheKey = `user:${userId}`;
  
  // Update database
  const user = await db.query('UPDATE users SET ... WHERE id = $1 RETURNING *', [userId]);
  
  // Update cache
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}
```

**Advantages:**
- ✅ Cache always up-to-date
- ✅ No stale data

**Disadvantages:**
- ❌ Write latency (two operations)
- ❌ Unused data may be cached

### Write-Behind Cache (Write-Back)

**Pattern**: Write to cache immediately, write to database asynchronously

```javascript
async function updateUser(userId, data) {
  const cacheKey = `user:${userId}`;
  
  // Update cache immediately
  await redis.setex(cacheKey, 3600, JSON.stringify(data));
  
  // Queue database write (async)
  await queue.add('update-user', { userId, data });
  
  return data;
}

// Background worker processes queue
async function processUpdateQueue(job) {
  const { userId, data } = job.data;
  await db.query('UPDATE users SET ... WHERE id = $1', [userId]);
}
```

**Advantages:**
- ✅ Fast writes
- ✅ Reduced database load

**Disadvantages:**
- ❌ Data loss risk if cache fails
- ❌ Complex implementation

### Cache Invalidation Strategies

**Strategy 1: TTL (Time-To-Live)**
```javascript
// Set expiration time
await redis.setex('user:123', 3600, JSON.stringify(user));  // Expires in 1 hour

// Check TTL
const ttl = await redis.ttl('user:123');  // Returns seconds remaining
```

**Strategy 2: Explicit invalidation**
```javascript
// Delete on update
async function updateUser(userId, data) {
  await db.query('UPDATE users SET ... WHERE id = $1', [userId]);
  await redis.del(`user:${userId}`);
}
```

**Strategy 3: Tag-based invalidation**
```javascript
// Store tags for related keys
await redis.sadd('tag:user:123', 'user:123:profile', 'user:123:settings');

// Invalidate all keys with tag
async function invalidateUserCache(userId) {
  const keys = await redis.smembers(`tag:user:${userId}`);
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(`tag:user:${userId}`);
  }
}
```

**Strategy 4: Version-based invalidation**
```javascript
// Include version in key
const version = await redis.incr('user:123:version');
const cacheKey = `user:123:v${version}`;
await redis.setex(cacheKey, 3600, JSON.stringify(user));

// Increment version to invalidate
await redis.incr('user:123:version');  // Old cache keys become stale
```

---

## TTL Management

### Setting TTL

**Set TTL on creation:**
```javascript
// Redis: SETEX (set with expiration)
await redis.setex('session:abc123', 1800, JSON.stringify(session));  // 30 minutes

// Redis: SET with EX option
await redis.set('session:abc123', JSON.stringify(session), 'EX', 1800);
```

**Set TTL on existing key:**
```javascript
// Redis: EXPIRE
await redis.expire('session:abc123', 1800);

// Redis: EXPIREAT (expire at timestamp)
const expiresAt = Math.floor(Date.now() / 1000) + 1800;
await redis.expireat('session:abc123', expiresAt);
```

**Remove TTL:**
```javascript
// Redis: PERSIST (remove expiration)
await redis.persist('session:abc123');
```

### TTL Patterns

**Pattern 1: Sliding expiration (extend on access)**
```javascript
async function getSession(sessionId) {
  const session = await redis.get(`session:${sessionId}`);
  if (session) {
    // Extend TTL on access
    await redis.expire(`session:${sessionId}`, 1800);
    return JSON.parse(session);
  }
  return null;
}
```

**Pattern 2: Absolute expiration**
```javascript
// Session expires at specific time
const expiresAt = new Date('2024-01-15T23:59:59Z');
const ttl = Math.floor((expiresAt - Date.now()) / 1000);
await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(session));
```

**Pattern 3: Tiered TTL**
```javascript
// Different TTL for different data types
await redis.setex('cache:hot:product:123', 300, data);      // 5 minutes
await redis.setex('cache:warm:product:123', 3600, data);    // 1 hour
await redis.setex('cache:cold:product:123', 86400, data);   // 24 hours
```

---

## Atomic Operations

### Increment/Decrement

**Counters:**
```javascript
// Increment counter
await redis.incr('page:views:123');

// Increment by amount
await redis.incrby('user:points:123', 10);

// Decrement
await redis.decr('inventory:product:456');

// Decrement by amount
await redis.decrby('inventory:product:456', 5);
```

**Rate limiting:**
```javascript
async function checkRateLimit(userId) {
  const key = `ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`;  // Per minute
  const count = await redis.incr(key);
  await redis.expire(key, 60);  // Expire after 1 minute

  if (count > 100) {
    throw new Error('Rate limit exceeded');
  }
}
```

### Compare-and-Set (CAS)

**Optimistic locking with WATCH:**
```javascript
// Redis: WATCH for optimistic locking
async function transferPoints(fromUser, toUser, points) {
  const fromKey = `user:points:${fromUser}`;
  const toKey = `user:points:${toUser}`;

  await redis.watch(fromKey);

  const balance = parseInt(await redis.get(fromKey));
  if (balance < points) {
    await redis.unwatch();
    throw new Error('Insufficient points');
  }

  // Execute transaction
  const result = await redis.multi()
    .decrby(fromKey, points)
    .incrby(toKey, points)
    .exec();

  if (!result) {
    throw new Error('Transaction failed - retry');
  }
}
```

### Transactions (MULTI/EXEC)

**Atomic batch operations:**
```javascript
// Redis: MULTI/EXEC transaction
await redis.multi()
  .set('user:123:name', 'John Doe')
  .set('user:123:email', 'john@example.com')
  .sadd('users:active', '123')
  .incr('stats:total_users')
  .exec();

// All commands execute atomically
```

---

## Redis Data Structures

### Strings

**Simple key-value:**
```javascript
await redis.set('user:123:name', 'John Doe');
const name = await redis.get('user:123:name');

// Append
await redis.append('log:123', 'New log entry\n');

// Get substring
const substr = await redis.getrange('log:123', 0, 10);
```

### Lists

**Ordered collection:**
```javascript
// Push to list
await redis.lpush('queue:tasks', 'task1', 'task2', 'task3');  // Left push
await redis.rpush('queue:tasks', 'task4');  // Right push

// Pop from list
const task = await redis.lpop('queue:tasks');  // Left pop
const task = await redis.rpop('queue:tasks');  // Right pop

// Blocking pop (wait for item)
const task = await redis.blpop('queue:tasks', 5);  // Wait 5 seconds

// Get range
const tasks = await redis.lrange('queue:tasks', 0, 9);  // First 10 items

// List length
const length = await redis.llen('queue:tasks');
```

**Use cases:**
- Task queues
- Activity feeds
- Recent items

### Sets

**Unordered unique collection:**
```javascript
// Add to set
await redis.sadd('user:123:tags', 'developer', 'nodejs', 'react');

// Check membership
const isMember = await redis.sismember('user:123:tags', 'nodejs');

// Get all members
const tags = await redis.smembers('user:123:tags');

// Remove from set
await redis.srem('user:123:tags', 'react');

// Set operations
await redis.sinter('user:123:tags', 'user:456:tags');  // Intersection
await redis.sunion('user:123:tags', 'user:456:tags');  // Union
await redis.sdiff('user:123:tags', 'user:456:tags');   // Difference

// Random member
const randomTag = await redis.srandmember('user:123:tags');

// Set size
const size = await redis.scard('user:123:tags');
```

**Use cases:**
- Tags
- Unique visitors
- Relationships

### Hashes

**Field-value pairs within a key:**
```javascript
// Set hash fields
await redis.hset('user:123', 'name', 'John Doe');
await redis.hset('user:123', 'email', 'john@example.com');

// Set multiple fields
await redis.hmset('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  age: '30'
});

// Get field
const name = await redis.hget('user:123', 'name');

// Get all fields
const user = await redis.hgetall('user:123');

// Increment field
await redis.hincrby('user:123', 'login_count', 1);

// Check field exists
const exists = await redis.hexists('user:123', 'name');

// Delete field
await redis.hdel('user:123', 'age');

// Get all keys
const keys = await redis.hkeys('user:123');

// Get all values
const values = await redis.hvals('user:123');
```

**Use cases:**
- User profiles
- Object storage
- Counters per entity

### Sorted Sets

**Ordered collection with scores:**
```javascript
// Add to sorted set
await redis.zadd('leaderboard', 100, 'user:123');
await redis.zadd('leaderboard', 200, 'user:456');
await redis.zadd('leaderboard', 150, 'user:789');

// Get rank (0-based)
const rank = await redis.zrank('leaderboard', 'user:123');

// Get score
const score = await redis.zscore('leaderboard', 'user:123');

// Increment score
await redis.zincrby('leaderboard', 10, 'user:123');

// Get range by rank
const top10 = await redis.zrange('leaderboard', 0, 9, 'WITHSCORES');

// Get range by score
const highScorers = await redis.zrangebyscore('leaderboard', 150, 200);

// Reverse range (highest first)
const top10Desc = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Remove by rank
await redis.zremrangebyrank('leaderboard', 0, 0);  // Remove lowest

// Remove by score
await redis.zremrangebyscore('leaderboard', 0, 50);  // Remove scores 0-50

// Count in range
const count = await redis.zcount('leaderboard', 100, 200);

// Sorted set size
const size = await redis.zcard('leaderboard');
```

**Use cases:**
- Leaderboards
- Priority queues
- Time-series data (score = timestamp)

---

## Pub/Sub Patterns

### Publish/Subscribe

**Pattern**: Broadcast messages to multiple subscribers

```javascript
// Subscriber 1
const subscriber1 = redis.duplicate();
await subscriber1.subscribe('notifications');
subscriber1.on('message', (channel, message) => {
  console.log(`Subscriber 1 received: ${message}`);
});

// Subscriber 2
const subscriber2 = redis.duplicate();
await subscriber2.subscribe('notifications');
subscriber2.on('message', (channel, message) => {
  console.log(`Subscriber 2 received: ${message}`);
});

// Publisher
await redis.publish('notifications', 'New message!');
// Both subscribers receive the message
```

**Pattern matching:**
```javascript
// Subscribe to pattern
await subscriber.psubscribe('user:*:notifications');

// Publish to specific channels
await redis.publish('user:123:notifications', 'Message for user 123');
await redis.publish('user:456:notifications', 'Message for user 456');
// Subscriber receives both
```

### Use Cases

**Real-time notifications:**
```javascript
// Publish notification
await redis.publish('user:123:notifications', JSON.stringify({
  type: 'new_message',
  from: 'user:456',
  message: 'Hello!'
}));

// Subscribe to notifications
await subscriber.subscribe('user:123:notifications');
subscriber.on('message', (channel, message) => {
  const notification = JSON.parse(message);
  // Display notification to user
});
```

**Cache invalidation:**
```javascript
// Publish cache invalidation event
await redis.publish('cache:invalidate', JSON.stringify({
  keys: ['user:123', 'user:456']
}));

// All application servers subscribe and invalidate local cache
await subscriber.subscribe('cache:invalidate');
subscriber.on('message', (channel, message) => {
  const { keys } = JSON.parse(message);
  keys.forEach(key => localCache.delete(key));
});
```

**Event broadcasting:**
```javascript
// Publish event
await redis.publish('events:order', JSON.stringify({
  type: 'order_created',
  order_id: 'order123',
  user_id: 'user456'
}));

// Multiple services subscribe
// Service 1: Send email
// Service 2: Update inventory
// Service 3: Log analytics
```

---

## Persistence Options

### Redis Persistence

**RDB (Redis Database Backup):**
- Point-in-time snapshots
- Compact binary format
- Fast restarts
- Data loss possible (between snapshots)

```conf
# redis.conf
save 900 1      # Save after 900 seconds if 1 key changed
save 300 10     # Save after 300 seconds if 10 keys changed
save 60 10000   # Save after 60 seconds if 10000 keys changed
```

**AOF (Append-Only File):**
- Log every write operation
- Better durability
- Larger file size
- Slower restarts

```conf
# redis.conf
appendonly yes
appendfsync everysec  # Sync every second (default)
# appendfsync always  # Sync every write (slowest, most durable)
# appendfsync no      # Let OS decide (fastest, least durable)
```

**Hybrid (RDB + AOF):**
```conf
# Use both for best durability and performance
save 900 1
appendonly yes
appendfsync everysec
```

### DynamoDB Persistence

**Automatic persistence:**
- All data automatically persisted
- Point-in-time recovery (PITR)
- On-demand backups
- Continuous backups (35 days)

---

## DynamoDB Patterns

### Primary Key Design

**Simple primary key (partition key only):**
```javascript
// Table: Users
// Partition key: user_id

await dynamodb.putItem({
  TableName: 'Users',
  Item: {
    user_id: { S: 'user123' },
    name: { S: 'John Doe' },
    email: { S: 'john@example.com' }
  }
});

// Query by partition key
await dynamodb.getItem({
  TableName: 'Users',
  Key: { user_id: { S: 'user123' } }
});
```

**Composite primary key (partition key + sort key):**
```javascript
// Table: Orders
// Partition key: user_id
// Sort key: order_date

await dynamodb.putItem({
  TableName: 'Orders',
  Item: {
    user_id: { S: 'user123' },
    order_date: { S: '2024-01-15' },
    order_id: { S: 'order456' },
    total: { N: '99.99' }
  }
});

// Query all orders for user
await dynamodb.query({
  TableName: 'Orders',
  KeyConditionExpression: 'user_id = :userId',
  ExpressionAttributeValues: {
    ':userId': { S: 'user123' }
  }
});

// Query orders in date range
await dynamodb.query({
  TableName: 'Orders',
  KeyConditionExpression: 'user_id = :userId AND order_date BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':userId': { S: 'user123' },
    ':start': { S: '2024-01-01' },
    ':end': { S: '2024-01-31' }
  }
});
```

### Secondary Indexes

**Global Secondary Index (GSI):**
```javascript
// Create GSI on email
await dynamodb.createTable({
  TableName: 'Users',
  KeySchema: [
    { AttributeName: 'user_id', KeyType: 'HASH' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ]
});

// Query by email
await dynamodb.query({
  TableName: 'Users',
  IndexName: 'EmailIndex',
  KeyConditionExpression: 'email = :email',
  ExpressionAttributeValues: {
    ':email': { S: 'john@example.com' }
  }
});
```

**Local Secondary Index (LSI):**
```javascript
// Create LSI on status (same partition key as table)
await dynamodb.createTable({
  TableName: 'Orders',
  KeySchema: [
    { AttributeName: 'user_id', KeyType: 'HASH' },
    { AttributeName: 'order_date', KeyType: 'RANGE' }
  ],
  LocalSecondaryIndexes: [
    {
      IndexName: 'StatusIndex',
      KeySchema: [
        { AttributeName: 'user_id', KeyType: 'HASH' },
        { AttributeName: 'status', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ]
});

// Query orders by status
await dynamodb.query({
  TableName: 'Orders',
  IndexName: 'StatusIndex',
  KeyConditionExpression: 'user_id = :userId AND status = :status',
  ExpressionAttributeValues: {
    ':userId': { S: 'user123' },
    ':status': { S: 'shipped' }
  }
});
```

### Conditional Writes

**Optimistic locking:**
```javascript
// Update only if version matches
await dynamodb.updateItem({
  TableName: 'Users',
  Key: { user_id: { S: 'user123' } },
  UpdateExpression: 'SET #name = :name, #version = :newVersion',
  ConditionExpression: '#version = :currentVersion',
  ExpressionAttributeNames: {
    '#name': 'name',
    '#version': 'version'
  },
  ExpressionAttributeValues: {
    ':name': { S: 'John Doe' },
    ':currentVersion': { N: '5' },
    ':newVersion': { N: '6' }
  }
});
```

**Prevent overwrites:**
```javascript
// Create only if doesn't exist
await dynamodb.putItem({
  TableName: 'Users',
  Item: { user_id: { S: 'user123' }, name: { S: 'John Doe' } },
  ConditionExpression: 'attribute_not_exists(user_id)'
});
```

---

## Best Practices

### DO

✅ **Use descriptive key names** with namespaces
✅ **Set appropriate TTLs** for cached data
✅ **Use atomic operations** for counters and flags
✅ **Implement connection pooling** for better performance
✅ **Monitor memory usage** (Redis is in-memory)
✅ **Use appropriate data structures** (lists, sets, hashes, sorted sets)
✅ **Enable persistence** for critical data (Redis RDB/AOF)
✅ **Use pub/sub** for real-time messaging
✅ **Implement retry logic** for transient failures
✅ **Use pipelining** for batch operations

### DON'T

❌ **Don't store large values** (> 1MB) - use object storage instead
❌ **Don't use key-value stores for complex queries** - use document/relational DB
❌ **Don't skip TTL** - memory will fill up
❌ **Don't use blocking operations** in production (BLPOP with long timeout)
❌ **Don't ignore eviction policies** - configure LRU/LFU appropriately
❌ **Don't use KEYS command** in production - use SCAN instead
❌ **Don't forget to handle cache misses** gracefully
❌ **Don't store sensitive data unencrypted**
❌ **Don't skip monitoring** - track hit rates, memory, latency
❌ **Don't use Redis as primary database** without persistence

---

## Summary

**Key-value stores are ideal for:**
- Simple lookups by key
- Caching frequently accessed data
- Session storage
- Real-time counters and metrics
- Message queues and pub/sub

**Redis data structures:**
- **Strings**: Simple key-value
- **Lists**: Ordered collections, queues
- **Sets**: Unique collections, tags
- **Hashes**: Object storage
- **Sorted Sets**: Leaderboards, priority queues

**Caching strategies:**
- **Cache-aside**: Lazy loading
- **Write-through**: Always up-to-date
- **Write-behind**: Fast writes, async persistence

**Performance tips:**
- Use appropriate data structures
- Set TTLs to prevent memory bloat
- Use pipelining for batch operations
- Monitor hit rates and memory usage
- Enable persistence for critical data

