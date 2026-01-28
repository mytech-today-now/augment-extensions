# Relational Query Optimization

## Overview

This document covers query optimization techniques for relational databases, including query execution plans, JOIN optimization, subquery strategies, N+1 query prevention, and database-specific optimizations.

---

## Query Execution Plans

### Understanding Execution Plans

**Purpose**: Visualize how the database executes a query

**Key concepts:**
- **Scan types**: Sequential scan, index scan, index-only scan
- **Join methods**: Nested loop, hash join, merge join
- **Cost estimates**: Relative cost of operations
- **Row estimates**: Expected number of rows processed

### Analyzing Execution Plans

#### PostgreSQL

```sql
-- Basic execution plan
EXPLAIN
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';

-- Execution plan with actual runtime statistics
EXPLAIN ANALYZE
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';

-- Detailed execution plan with buffer usage
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';
```

**Key metrics:**
- **Seq Scan**: Full table scan (slow for large tables)
- **Index Scan**: Using index to find rows (fast)
- **Index Only Scan**: Using covering index (fastest)
- **Bitmap Heap Scan**: Using index bitmap (good for multiple conditions)

#### MySQL

```sql
-- Execution plan
EXPLAIN
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';

-- Extended execution plan
EXPLAIN FORMAT=JSON
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';

-- Analyze query (executes and shows stats)
EXPLAIN ANALYZE
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';
```

#### SQL Server

```sql
-- Show execution plan
SET SHOWPLAN_TEXT ON;
GO
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';
GO
SET SHOWPLAN_TEXT OFF;
GO

-- Include actual execution plan
SET STATISTICS PROFILE ON;
GO
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01';
GO
SET STATISTICS PROFILE OFF;
GO
```

---

## JOIN Optimization

### JOIN Types and Performance

#### INNER JOIN

```sql
-- ✅ GOOD: Use INNER JOIN for required relationships
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON o.user_id = u.id;

-- ❌ BAD: Implicit join (less readable)
SELECT u.name, o.total
FROM users u, orders o
WHERE o.user_id = u.id;
```

#### LEFT JOIN

```sql
-- ✅ GOOD: Use LEFT JOIN when right side is optional
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- ❌ BAD: Using LEFT JOIN when INNER JOIN would work
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NOT NULL;  -- This makes it an INNER JOIN
```

### JOIN Order Optimization

**Principle**: Join smaller result sets first

```sql
-- ❌ BAD: Large table first
SELECT *
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE u.email = 'user@example.com';

-- ✅ GOOD: Filter first, then join
SELECT *
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.email = 'user@example.com';

-- ✅ BETTER: Use subquery to filter first
SELECT *
FROM (
  SELECT id FROM users WHERE email = 'user@example.com'
) u
JOIN orders o ON o.user_id = u.id;
```

### Multiple JOINs

```sql
-- ✅ GOOD: Join in logical order
SELECT u.name, o.total, p.name AS product_name
FROM users u
JOIN orders o ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE u.created_at > '2024-01-01';
```

### JOIN Method Selection

**Database chooses based on:**
- Table sizes
- Available indexes
- Join conditions
- Statistics

**Common methods:**
- **Nested Loop**: Good for small datasets, indexed joins
- **Hash Join**: Good for large datasets, equality conditions
- **Merge Join**: Good for sorted data, range conditions

---

## Subquery vs JOIN

### When to Use Subqueries

```sql
-- ✅ GOOD: Subquery for existence check
SELECT *
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- ✅ GOOD: Subquery for scalar value
SELECT u.name,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;

-- ❌ BAD: Subquery in WHERE with IN (can be slow)
SELECT *
FROM users
WHERE id IN (SELECT user_id FROM orders);

-- ✅ BETTER: Use JOIN instead
SELECT DISTINCT u.*
FROM users u
JOIN orders o ON o.user_id = u.id;
```

### Correlated vs Non-Correlated Subqueries

```sql
-- ❌ BAD: Correlated subquery (executes for each row)
SELECT u.name,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;

-- ✅ BETTER: Use JOIN with GROUP BY
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

---

## Avoiding N+1 Queries

### The N+1 Problem

**Problem**: Executing 1 query to get N records, then N queries to get related data

```javascript
// ❌ BAD: N+1 queries
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
  user.orders = orders;
}
```

### Solutions

#### 1. Use JOINs

```javascript
// ✅ GOOD: Single query with JOIN
const result = await db.query(`
  SELECT u.*, o.id AS order_id, o.total, o.created_at AS order_date
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
`);

// Group results by user
const users = groupByUser(result);
```

#### 2. Use Batch Loading

```javascript
// ✅ GOOD: Batch load related data
const users = await db.query('SELECT * FROM users');
const userIds = users.map(u => u.id);

const orders = await db.query(
  'SELECT * FROM orders WHERE user_id = ANY(?)',
  [userIds]
);

// Map orders to users
const ordersByUser = groupBy(orders, 'user_id');
users.forEach(user => {
  user.orders = ordersByUser[user.id] || [];
});
```

#### 3. Use DataLoader (GraphQL)

```javascript
// ✅ GOOD: Use DataLoader for batching
const orderLoader = new DataLoader(async (userIds) => {
  const orders = await db.query(
    'SELECT * FROM orders WHERE user_id = ANY(?)',
    [userIds]
  );
  return userIds.map(id => orders.filter(o => o.user_id === id));
});

// Usage
const orders = await orderLoader.load(userId);
```

---

## SELECT Optimization

### Select Only Needed Columns

```sql
-- ❌ BAD: Select all columns
SELECT * FROM users;

-- ✅ GOOD: Select only needed columns
SELECT id, email, name FROM users;

-- ✅ BETTER: Use covering index
CREATE INDEX idx_users_email_name ON users(email, name);
SELECT email, name FROM users WHERE email = 'user@example.com';
```

### Avoid SELECT DISTINCT When Possible

```sql
-- ❌ BAD: DISTINCT to hide duplicate rows
SELECT DISTINCT u.name
FROM users u
JOIN orders o ON o.user_id = u.id;

-- ✅ BETTER: Use GROUP BY
SELECT u.name
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- ✅ BEST: Use EXISTS if you only need to check existence
SELECT u.name
FROM users u
WHERE EXISTS (SELECT 1 FROM orders WHERE user_id = u.id);
```

---

## WHERE Clause Optimization

### Use Indexes Effectively

```sql
-- ✅ GOOD: Indexed column in WHERE
SELECT * FROM users WHERE email = 'user@example.com';

-- ❌ BAD: Function on indexed column (can't use index)
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- ✅ BETTER: Use functional index
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
```

### Avoid OR Conditions

```sql
-- ❌ BAD: OR condition (may not use indexes efficiently)
SELECT * FROM users WHERE email = 'user@example.com' OR name = 'John';

-- ✅ BETTER: Use UNION
SELECT * FROM users WHERE email = 'user@example.com'
UNION
SELECT * FROM users WHERE name = 'John';

-- ✅ BEST: Use IN for same column
SELECT * FROM users WHERE status IN ('active', 'pending');
```

### Use BETWEEN for Ranges

```sql
-- ❌ BAD: Multiple comparisons
SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at <= '2024-12-31';

-- ✅ GOOD: Use BETWEEN
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
```

---

## Aggregation Optimization

### Use Indexes for GROUP BY

```sql
-- ✅ GOOD: Index on GROUP BY column
CREATE INDEX idx_orders_user_id ON orders(user_id);

SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id;
```

### Avoid HAVING When Possible

```sql
-- ❌ BAD: HAVING filters after aggregation
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING user_id > 100;

-- ✅ BETTER: WHERE filters before aggregation
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE user_id > 100
GROUP BY user_id;
```

### Use Materialized Views for Complex Aggregations

```sql
-- ✅ GOOD: Precompute expensive aggregations
CREATE MATERIALIZED VIEW user_order_stats AS
SELECT
  u.id,
  u.name,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent,
  MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- Refresh periodically
REFRESH MATERIALIZED VIEW user_order_stats;

-- Query is now fast
SELECT * FROM user_order_stats WHERE order_count > 10;
```

---

## Pagination Strategies

### Offset-Based Pagination

```sql
-- ❌ BAD: Large offset (slow for deep pages)
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;

-- ✅ BETTER: Use indexed column for ordering
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT 20 OFFSET 100;
```

### Cursor-Based Pagination

```sql
-- ✅ BEST: Use cursor (keyset pagination)
-- First page
SELECT * FROM orders
WHERE created_at < NOW()
ORDER BY created_at DESC
LIMIT 20;

-- Next page (using last created_at from previous page)
SELECT * FROM orders
WHERE created_at < '2024-01-15 10:30:00'
ORDER BY created_at DESC
LIMIT 20;
```

**Benefits:**
- ✅ Consistent performance regardless of page depth
- ✅ No duplicate or missing rows when data changes
- ✅ Works well with real-time data

### Seek Method (Best for Large Datasets)

```sql
-- ✅ BEST: Seek method with composite key
CREATE INDEX idx_orders_created_id ON orders(created_at DESC, id DESC);

-- First page
SELECT * FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (using last created_at and id from previous page)
SELECT * FROM orders
WHERE (created_at, id) < ('2024-01-15 10:30:00', 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

---

## Database-Specific Optimizations

### PostgreSQL

```sql
-- Use EXPLAIN ANALYZE to identify slow queries
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = 123;

-- Use partial indexes for filtered queries
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Use VACUUM ANALYZE to update statistics
VACUUM ANALYZE orders;

-- Use parallel query execution
SET max_parallel_workers_per_gather = 4;

-- Use LATERAL joins for correlated subqueries
SELECT u.*, recent_orders.*
FROM users u
LEFT JOIN LATERAL (
  SELECT * FROM orders WHERE user_id = u.id ORDER BY created_at DESC LIMIT 5
) recent_orders ON true;
```

### MySQL

```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM orders WHERE user_id = 123;

-- Use FORCE INDEX to force index usage
SELECT * FROM orders FORCE INDEX (idx_user_id) WHERE user_id = 123;

-- Use query cache (MySQL 5.7 and earlier)
SET GLOBAL query_cache_size = 268435456;  -- 256MB

-- Optimize table to reclaim space
OPTIMIZE TABLE orders;

-- Analyze table to update statistics
ANALYZE TABLE orders;
```

### SQL Server

```sql
-- Use execution plan
SET SHOWPLAN_TEXT ON;

-- Use query hints
SELECT * FROM orders WITH (INDEX(idx_user_id)) WHERE user_id = 123;

-- Update statistics
UPDATE STATISTICS orders;

-- Rebuild indexes
ALTER INDEX idx_user_id ON orders REBUILD;
```

---

## Query Optimization Checklist

### Before Writing Queries

- [ ] Understand the data model and relationships
- [ ] Identify required columns (avoid SELECT *)
- [ ] Check existing indexes
- [ ] Consider query frequency and data volume

### While Writing Queries

- [ ] Use appropriate JOIN types
- [ ] Filter early (WHERE before JOIN when possible)
- [ ] Use indexes effectively
- [ ] Avoid functions on indexed columns
- [ ] Use prepared statements for security and performance

### After Writing Queries

- [ ] Analyze execution plan
- [ ] Check for table scans on large tables
- [ ] Verify indexes are being used
- [ ] Test with production-like data volumes
- [ ] Monitor query performance in production

### Optimization Techniques

- [ ] Add indexes on frequently queried columns
- [ ] Use covering indexes for index-only scans
- [ ] Rewrite subqueries as JOINs when appropriate
- [ ] Use batch loading to avoid N+1 queries
- [ ] Implement cursor-based pagination for large datasets
- [ ] Cache frequently accessed data
- [ ] Use materialized views for complex aggregations

---

## Related Documentation

- **relational-databases.md**: Relational database fundamentals
- **relational-indexing.md**: Indexing strategies
- **relational-schema-design.md**: Schema design and normalization
- **performance-optimization.md**: General performance optimization
- **relational-transactions.md**: Transaction management


