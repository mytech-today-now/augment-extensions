# Database Performance Optimization

## Overview

This document covers comprehensive performance optimization strategies for databases, including indexing, query optimization, connection pooling, caching, batch operations, and monitoring.

---

## Indexing Strategies

### When to Create Indexes

**Create indexes for:**
- ✅ Primary keys (automatic in most databases)
- ✅ Foreign keys
- ✅ Columns used in WHERE clauses
- ✅ Columns used in JOIN conditions
- ✅ Columns used in ORDER BY clauses
- ✅ Columns used in GROUP BY clauses
- ✅ Columns with high cardinality (many unique values)

**Avoid indexes for:**
- ❌ Small tables (< 1000 rows)
- ❌ Columns with low cardinality (few unique values)
- ❌ Columns that are frequently updated
- ❌ Tables with high write-to-read ratio

### Index Types

#### B-Tree Indexes (Default)

**Best for:** Equality and range queries

```sql
-- PostgreSQL: Create B-tree index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Range query benefits from B-tree index
SELECT * FROM orders
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
```

#### Hash Indexes

**Best for:** Equality comparisons only

```sql
-- PostgreSQL: Create hash index
CREATE INDEX idx_users_email_hash ON users USING HASH(email);

-- Equality query benefits from hash index
SELECT * FROM users WHERE email = 'user@example.com';
```

#### Composite Indexes

**Best for:** Queries filtering on multiple columns

```sql
-- Create composite index
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Query benefits from composite index
SELECT * FROM orders
WHERE user_id = 123 AND status = 'pending';

-- Query partially benefits (uses user_id only)
SELECT * FROM orders WHERE user_id = 123;

-- Query does NOT benefit (status is not leftmost column)
SELECT * FROM orders WHERE status = 'pending';
```

**Index Column Order:**
- Put most selective column first
- Put columns used in equality comparisons before range comparisons
- Consider query patterns

#### Covering Indexes

**Include all columns needed by query:**

```sql
-- PostgreSQL: Create covering index
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name, created_at);

-- Query uses index-only scan (no table access needed)
SELECT name, created_at FROM users WHERE email = 'user@example.com';
```

#### Partial Indexes

**Index only subset of rows:**

```sql
-- PostgreSQL: Create partial index
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- Query benefits from smaller, more efficient index
SELECT * FROM orders
WHERE status = 'pending' AND created_at > '2024-01-01';
```

#### Full-Text Search Indexes

**Best for:** Text search queries

```sql
-- PostgreSQL: Create GIN index for full-text search
CREATE INDEX idx_articles_content_fts ON articles
USING GIN(to_tsvector('english', content));

-- Full-text search query
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database & optimization');
```

### Index Maintenance

```sql
-- PostgreSQL: Analyze index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_toast%';

-- Rebuild index to reduce bloat
REINDEX INDEX idx_users_email;

-- Rebuild all indexes on table
REINDEX TABLE users;
```

---

## Query Optimization

### Analyze Query Execution Plans

```sql
-- PostgreSQL: Explain query execution plan
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;
```

**Key metrics to look for:**
- **Seq Scan**: Table scan (slow for large tables)
- **Index Scan**: Using index (fast)
- **Index Only Scan**: Using covering index (fastest)
- **Nested Loop**: Join method (good for small datasets)
- **Hash Join**: Join method (good for large datasets)
- **Merge Join**: Join method (good for sorted data)

### Optimize SELECT Queries

```sql
-- ❌ BAD: Select all columns
SELECT * FROM users;

-- ✅ GOOD: Select only needed columns
SELECT id, email, name FROM users;

-- ❌ BAD: No LIMIT on large result set
SELECT * FROM orders ORDER BY created_at DESC;

-- ✅ GOOD: Use LIMIT for pagination
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 0;
```

### Optimize WHERE Clauses

```sql
-- ❌ BAD: Function on indexed column prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- ✅ GOOD: Use functional index or case-insensitive collation
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- ❌ BAD: Leading wildcard prevents index usage
SELECT * FROM users WHERE email LIKE '%@example.com';

-- ✅ GOOD: No leading wildcard allows index usage
SELECT * FROM users WHERE email LIKE 'user@%';
```

### Optimize JOIN Queries

```sql
-- ❌ BAD: Cartesian product (no join condition)
SELECT * FROM users, orders;

-- ✅ GOOD: Proper join condition
SELECT * FROM users u
INNER JOIN orders o ON o.user_id = u.id;

-- ❌ BAD: Subquery in SELECT (N+1 problem)
SELECT 
    u.id,
    u.name,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;

-- ✅ GOOD: Use JOIN with aggregation
SELECT 
    u.id,
    u.name,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

### Avoid N+1 Queries

```javascript
// ❌ BAD: N+1 query problem
async function getUsersWithOrders() {
  const users = await db.query('SELECT * FROM users');

  for (const user of users.rows) {
    // This executes N queries (one per user)
    const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [user.id]);
    user.orders = orders.rows;
  }

  return users.rows;
}

// ✅ GOOD: Single query with JOIN
async function getUsersWithOrders() {
  const result = await db.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      json_agg(
        json_build_object(
          'id', o.id,
          'total', o.total,
          'created_at', o.created_at
        )
      ) AS orders
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    GROUP BY u.id, u.name, u.email
  `);

  return result.rows;
}

// ✅ GOOD: Two queries (better for large datasets)
async function getUsersWithOrders() {
  const users = await db.query('SELECT * FROM users');
  const userIds = users.rows.map(u => u.id);

  const orders = await db.query(
    'SELECT * FROM orders WHERE user_id = ANY($1)',
    [userIds]
  );

  // Group orders by user_id in application
  const ordersByUser = orders.rows.reduce((acc, order) => {
    if (!acc[order.user_id]) acc[order.user_id] = [];
    acc[order.user_id].push(order);
    return acc;
  }, {});

  users.rows.forEach(user => {
    user.orders = ordersByUser[user.id] || [];
  });

  return users.rows;
}
```

---

## Connection Pooling

### Why Connection Pooling?

**Benefits:**
- ✅ Reuse existing connections (avoid connection overhead)
- ✅ Limit concurrent connections to database
- ✅ Improve application performance
- ✅ Prevent connection exhaustion

### Connection Pool Configuration

```javascript
// Node.js with pg (PostgreSQL)
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  max: 20,                    // Maximum connections in pool
  min: 5,                     // Minimum connections in pool
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000,  // Wait 2s for available connection

  // Keep-alive settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Use pool for queries
async function getUser(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
```

```python
# Python with psycopg2 (PostgreSQL)
import psycopg2
from psycopg2 import pool

# Create connection pool
connection_pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=5,
    maxconn=20,
    host=os.environ['DB_HOST'],
    database=os.environ['DB_NAME'],
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASSWORD']
)

# Use connection from pool
def get_user(user_id):
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        return cursor.fetchone()
    finally:
        connection_pool.putconn(conn)
```

### Connection Pool Best Practices

✅ **DO:**
- Set appropriate pool size (start with 10-20 connections)
- Monitor pool utilization
- Use connection timeouts
- Implement graceful shutdown
- Return connections to pool after use

❌ **DON'T:**
- Create new pool for each request
- Set pool size too high (wastes resources)
- Set pool size too low (causes bottlenecks)
- Forget to release connections

---

## Caching Strategies

### Application-Level Caching

```javascript
// Redis caching example
const redis = require('redis');
const client = redis.createClient();

async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss: query database
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];

  // Store in cache (TTL: 1 hour)
  await client.setEx(cacheKey, 3600, JSON.stringify(user));

  return user;
}

// Invalidate cache on update
async function updateUser(userId, updates) {
  await db.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [updates.name, updates.email, userId]
  );

  // Invalidate cache
  await client.del(`user:${userId}`);
}
```

### Query Result Caching

```javascript
// Cache expensive query results
async function getTopProducts() {
  const cacheKey = 'top_products';

  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      COUNT(oi.id) AS sales_count,
      SUM(oi.quantity * oi.price) AS total_revenue
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    WHERE oi.created_at > NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name
    ORDER BY sales_count DESC
    LIMIT 10
  `);

  // Cache for 15 minutes
  await client.setEx(cacheKey, 900, JSON.stringify(result.rows));

  return result.rows;
}
```

### Database-Level Caching

```sql
-- PostgreSQL: Increase shared_buffers for better caching
-- In postgresql.conf:
-- shared_buffers = 256MB  (25% of RAM for dedicated DB server)
-- effective_cache_size = 1GB  (50-75% of RAM)

-- Monitor cache hit ratio
SELECT
    sum(heap_blks_read) AS heap_read,
    sum(heap_blks_hit) AS heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
FROM pg_statio_user_tables;
-- Target: > 0.99 (99% cache hit ratio)
```

### Caching Best Practices

✅ **DO:**
- Cache frequently accessed data
- Set appropriate TTL (time-to-live)
- Invalidate cache on updates
- Monitor cache hit ratio
- Use cache for expensive queries

❌ **DON'T:**
- Cache everything (wastes memory)
- Set TTL too long (stale data)
- Set TTL too short (cache thrashing)
- Forget to invalidate cache on updates

---

## Batch Operations

### Batch Inserts

```javascript
// ❌ BAD: Individual inserts
async function createUsers(users) {
  for (const user of users) {
    await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      [user.name, user.email]
    );
  }
}

// ✅ GOOD: Batch insert
async function createUsers(users) {
  const values = users.map((user, i) =>
    `($${i * 2 + 1}, $${i * 2 + 2})`
  ).join(', ');

  const params = users.flatMap(user => [user.name, user.email]);

  await db.query(
    `INSERT INTO users (name, email) VALUES ${values}`,
    params
  );
}

// ✅ BETTER: Use COPY for large datasets (PostgreSQL)
const { from } = require('pg-copy-streams');
const fs = require('fs');

async function bulkInsertUsers(csvFilePath) {
  const client = await pool.connect();
  try {
    const stream = client.query(
      from('COPY users (name, email) FROM STDIN WITH CSV')
    );
    const fileStream = fs.createReadStream(csvFilePath);
    fileStream.pipe(stream);

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  } finally {
    client.release();
  }
}
```

### Batch Updates

```javascript
// ❌ BAD: Individual updates
async function updateUserStatuses(userIds, status) {
  for (const userId of userIds) {
    await db.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      [status, userId]
    );
  }
}

// ✅ GOOD: Batch update
async function updateUserStatuses(userIds, status) {
  await db.query(
    'UPDATE users SET status = $1 WHERE id = ANY($2)',
    [status, userIds]
  );
}
```

### Batch Deletes

```javascript
// ❌ BAD: Individual deletes
async function deleteOrders(orderIds) {
  for (const orderId of orderIds) {
    await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  }
}

// ✅ GOOD: Batch delete
async function deleteOrders(orderIds) {
  await db.query('DELETE FROM orders WHERE id = ANY($1)', [orderIds]);
}
```

---

## Pagination

### Offset-Based Pagination

```sql
-- Simple but slow for large offsets
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000;  -- Slow: database must scan 1020 rows
```

### Cursor-Based Pagination (Keyset Pagination)

```sql
-- Fast for any page
-- First page
SELECT * FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (using last item from previous page)
SELECT * FROM orders
WHERE (created_at, id) < ('2024-01-15 10:30:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

```javascript
// Cursor-based pagination implementation
async function getOrders(cursor = null, limit = 20) {
  let query = 'SELECT * FROM orders';
  let params = [limit];

  if (cursor) {
    const [createdAt, id] = cursor.split('_');
    query += ' WHERE (created_at, id) < ($2, $3)';
    params.push(createdAt, id);
  }

  query += ' ORDER BY created_at DESC, id DESC LIMIT $1';

  const result = await db.query(query, params);
  const orders = result.rows;

  // Generate cursor for next page
  const nextCursor = orders.length > 0
    ? `${orders[orders.length - 1].created_at}_${orders[orders.length - 1].id}`
    : null;

  return { orders, nextCursor };
}
```

---

## Denormalization

### When to Denormalize

**Consider denormalization when:**
- ✅ Read performance is critical
- ✅ Data is read much more than written
- ✅ Complex joins are causing performance issues
- ✅ Aggregations are expensive

**Avoid denormalization when:**
- ❌ Data changes frequently
- ❌ Data consistency is critical
- ❌ Storage space is limited

### Denormalization Strategies

#### Materialized Views

```sql
-- PostgreSQL: Create materialized view for expensive aggregation
CREATE MATERIALIZED VIEW user_order_stats AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(o.id) AS total_orders,
    SUM(o.total) AS total_spent,
    MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name, u.email;

-- Create index on materialized view
CREATE INDEX idx_user_order_stats_user_id ON user_order_stats(user_id);

-- Refresh materialized view (run periodically)
REFRESH MATERIALIZED VIEW user_order_stats;

-- Query materialized view (fast)
SELECT * FROM user_order_stats WHERE user_id = 123;
```

#### Computed Columns

```sql
-- PostgreSQL: Add computed column
ALTER TABLE orders ADD COLUMN total_items INTEGER;

-- Update computed column with trigger
CREATE OR REPLACE FUNCTION update_order_total_items()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_items = (
        SELECT COUNT(*) FROM order_items WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total_items_trigger
AFTER INSERT OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_total_items();
```

#### Redundant Data

```sql
-- Store frequently accessed data redundantly
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_email VARCHAR(255),  -- Redundant: also in users table
    user_name VARCHAR(255),   -- Redundant: also in users table
    total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update redundant data with trigger
CREATE OR REPLACE FUNCTION sync_user_data_to_orders()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET user_email = NEW.email, user_name = NEW.name
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_data_trigger
AFTER UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_user_data_to_orders();
```

---

## Monitoring & Profiling

### Key Performance Metrics

```sql
-- PostgreSQL: Monitor slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    stddev_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Monitor table statistics
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Monitor index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor database size
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- Monitor table bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS external_size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### Application-Level Monitoring

```javascript
// Monitor query performance
const queryDuration = new Map();

async function monitoredQuery(query, params) {
  const start = Date.now();

  try {
    const result = await db.query(query, params);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, query);
    }

    // Track query statistics
    if (!queryDuration.has(query)) {
      queryDuration.set(query, []);
    }
    queryDuration.get(query).push(duration);

    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Report query statistics
function reportQueryStats() {
  for (const [query, durations] of queryDuration.entries()) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    console.log(`Query: ${query.substring(0, 50)}...`);
    console.log(`  Calls: ${durations.length}`);
    console.log(`  Avg: ${avg.toFixed(2)}ms`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
  }
}
```

---

## Database-Specific Optimizations

### PostgreSQL

```sql
-- Vacuum and analyze regularly
VACUUM ANALYZE users;

-- Auto-vacuum settings (postgresql.conf)
-- autovacuum = on
-- autovacuum_vacuum_scale_factor = 0.1
-- autovacuum_analyze_scale_factor = 0.05

-- Increase work_mem for complex queries
SET work_mem = '256MB';

-- Increase maintenance_work_mem for index creation
SET maintenance_work_mem = '512MB';

-- Enable parallel query execution
SET max_parallel_workers_per_gather = 4;

-- Use EXPLAIN (ANALYZE, BUFFERS) for detailed query analysis
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = 123;
```

### MySQL

```sql
-- Optimize table
OPTIMIZE TABLE users;

-- Analyze table
ANALYZE TABLE users;

-- Use query cache (MySQL 5.7 and earlier)
SET GLOBAL query_cache_size = 268435456;  -- 256MB
SET GLOBAL query_cache_type = 1;

-- Increase buffer pool size (my.cnf)
-- innodb_buffer_pool_size = 1G

-- Enable slow query log (my.cnf)
-- slow_query_log = 1
-- long_query_time = 1
-- slow_query_log_file = /var/log/mysql/slow.log
```

### MongoDB

```javascript
// Create index
db.users.createIndex({ email: 1 });

// Create compound index
db.orders.createIndex({ user_id: 1, created_at: -1 });

// Analyze query performance
db.orders.find({ user_id: 123 }).explain('executionStats');

// Use aggregation pipeline for complex queries
db.orders.aggregate([
  { $match: { user_id: 123 } },
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// Use projection to limit returned fields
db.users.find({ email: 'user@example.com' }, { name: 1, email: 1 });
```

---

## Performance Optimization Checklist

### Schema Design

- [ ] Use appropriate data types (smallest that fits)
- [ ] Create indexes on foreign keys
- [ ] Create indexes on frequently queried columns
- [ ] Use composite indexes for multi-column queries
- [ ] Consider partial indexes for filtered queries
- [ ] Use covering indexes for index-only scans
- [ ] Normalize data to reduce redundancy
- [ ] Denormalize when read performance is critical

### Query Optimization

- [ ] Select only needed columns (avoid SELECT *)
- [ ] Use LIMIT for pagination
- [ ] Avoid N+1 queries (use JOINs or batch queries)
- [ ] Use EXPLAIN ANALYZE to understand query plans
- [ ] Optimize WHERE clauses (avoid functions on indexed columns)
- [ ] Use appropriate JOIN types
- [ ] Avoid subqueries in SELECT (use JOINs instead)
- [ ] Use EXISTS instead of COUNT(*) for existence checks

### Connection Management

- [ ] Use connection pooling
- [ ] Set appropriate pool size (10-20 connections)
- [ ] Monitor pool utilization
- [ ] Implement connection timeouts
- [ ] Release connections after use

### Caching

- [ ] Cache frequently accessed data
- [ ] Set appropriate TTL
- [ ] Invalidate cache on updates
- [ ] Monitor cache hit ratio (target > 90%)
- [ ] Use Redis or Memcached for distributed caching

### Batch Operations

- [ ] Use batch inserts for multiple rows
- [ ] Use batch updates with IN or ANY
- [ ] Use COPY for bulk data loading
- [ ] Limit batch size (1000-5000 rows)

### Monitoring

- [ ] Monitor slow queries (> 1 second)
- [ ] Track query execution time trends
- [ ] Monitor connection pool utilization
- [ ] Monitor cache hit ratio
- [ ] Monitor database size and growth
- [ ] Set up alerts for performance degradation

---

## Common Performance Pitfalls

### ❌ DON'T

```sql
-- Don't use SELECT *
SELECT * FROM users;

-- Don't use functions on indexed columns
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Don't use leading wildcards
SELECT * FROM users WHERE email LIKE '%@example.com';

-- Don't use OR on different columns (prevents index usage)
SELECT * FROM users WHERE email = 'user@example.com' OR name = 'John';

-- Don't use subqueries in SELECT (N+1 problem)
SELECT
    u.id,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;

-- Don't forget LIMIT on large result sets
SELECT * FROM orders ORDER BY created_at DESC;

-- Don't use OFFSET for large offsets
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
```

### ✅ DO

```sql
-- Select only needed columns
SELECT id, email, name FROM users;

-- Use functional index or case-insensitive collation
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Avoid leading wildcards
SELECT * FROM users WHERE email LIKE 'user@%';

-- Use UNION or separate queries
SELECT * FROM users WHERE email = 'user@example.com'
UNION
SELECT * FROM users WHERE name = 'John';

-- Use JOIN with aggregation
SELECT
    u.id,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

-- Always use LIMIT
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;

-- Use cursor-based pagination
SELECT * FROM orders
WHERE (created_at, id) < ('2024-01-15 10:30:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

---

## Summary

**Key Performance Principles:**

1. **Index Strategically**: Create indexes on frequently queried columns, but avoid over-indexing
2. **Optimize Queries**: Use EXPLAIN ANALYZE, select only needed columns, avoid N+1 queries
3. **Use Connection Pooling**: Reuse connections, set appropriate pool size
4. **Cache Wisely**: Cache frequently accessed data with appropriate TTL
5. **Batch Operations**: Use batch inserts/updates/deletes for multiple rows
6. **Monitor Continuously**: Track slow queries, connection pool, cache hit ratio

**Performance Optimization Workflow:**
1. **Identify**: Use monitoring to find slow queries
2. **Analyze**: Use EXPLAIN ANALYZE to understand query execution
3. **Optimize**: Add indexes, rewrite queries, implement caching
4. **Test**: Measure performance improvement
5. **Monitor**: Track metrics to ensure sustained performance

**Critical Rules:**
- ❌ NEVER use SELECT * in production
- ❌ NEVER forget to add indexes on foreign keys
- ❌ NEVER use OFFSET for large offsets
- ❌ NEVER ignore slow query warnings
- ❌ NEVER skip connection pooling


