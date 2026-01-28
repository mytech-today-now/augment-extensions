# Relational Database Indexing

## Overview

This document covers relational database indexing strategies, including index types (B-tree, hash, GiST, GIN), when to create indexes, composite indexes, covering indexes, partial indexes, index maintenance, query plan analysis, and database-specific indexing features.

---

## Index Fundamentals

### What is an Index?

**Definition**: A data structure that improves the speed of data retrieval operations

**Analogy**: Like an index in a book - helps you find information quickly without reading every page

**Trade-offs:**
- ✅ **Faster reads**: Queries using indexed columns are faster
- ❌ **Slower writes**: INSERT, UPDATE, DELETE operations are slower
- ❌ **Storage overhead**: Indexes consume disk space
- ❌ **Maintenance overhead**: Indexes need to be updated

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
- ❌ Columns rarely used in queries

---

## Index Types

### B-Tree Indexes (Default)

**Best for:** Equality and range queries

**Characteristics:**
- Default index type in most databases
- Balanced tree structure
- Supports <, <=, =, >=, >, BETWEEN, IN
- Supports ORDER BY
- Supports prefix matching (LIKE 'prefix%')

**Example:**
```sql
-- PostgreSQL: Create B-tree index (default)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Queries that benefit from B-tree index
SELECT * FROM users WHERE email = 'user@example.com';
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
SELECT * FROM orders ORDER BY created_at DESC;
SELECT * FROM users WHERE email LIKE 'user%';
```

**When to use:**
- ✅ Most common use case
- ✅ Range queries
- ✅ Sorting
- ✅ Prefix matching

### Hash Indexes

**Best for:** Equality comparisons only

**Characteristics:**
- Faster than B-tree for equality comparisons
- Does NOT support range queries
- Does NOT support ORDER BY
- Smaller than B-tree indexes

**Example:**
```sql
-- PostgreSQL: Create hash index
CREATE INDEX idx_users_email_hash ON users USING HASH(email);

-- Query that benefits from hash index
SELECT * FROM users WHERE email = 'user@example.com';

-- Queries that do NOT benefit from hash index
SELECT * FROM users WHERE email > 'a@example.com';  -- Range query
SELECT * FROM users ORDER BY email;  -- Sorting
```

**When to use:**
- ✅ Equality comparisons only
- ✅ High cardinality columns
- ❌ Not widely used (B-tree is usually sufficient)

### GiST Indexes (Generalized Search Tree)

**Best for:** Geometric data, full-text search, custom data types

**Characteristics:**
- Supports complex data types
- Extensible (custom operators)
- Used by PostGIS for geospatial data

**Example:**
```sql
-- PostgreSQL: GiST index for geometric data
CREATE INDEX idx_locations_point ON locations USING GIST(point);

-- Query geometric data
SELECT * FROM locations
WHERE point <-> '(0,0)'::point < 10;  -- Within 10 units of origin

-- GiST index for full-text search
CREATE INDEX idx_articles_content_gist ON articles USING GIST(to_tsvector('english', content));
```

**When to use:**
- ✅ Geospatial queries (PostGIS)
- ✅ Full-text search
- ✅ Range types
- ✅ Custom data types

### GIN Indexes (Generalized Inverted Index)

**Best for:** Array, JSONB, full-text search

**Characteristics:**
- Optimized for multi-value columns
- Larger than B-tree indexes
- Slower writes, faster reads
- Ideal for JSONB and array queries

**Example:**
```sql
-- PostgreSQL: GIN index for JSONB
CREATE INDEX idx_products_attributes ON products USING GIN(attributes);

-- Query JSONB
SELECT * FROM products WHERE attributes @> '{"brand": "Dell"}';

-- GIN index for arrays
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Query arrays
SELECT * FROM posts WHERE tags @> ARRAY['postgresql'];

-- GIN index for full-text search
CREATE INDEX idx_articles_content_gin ON articles USING GIN(to_tsvector('english', content));

-- Full-text search
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database & optimization');
```

**When to use:**
- ✅ JSONB queries
- ✅ Array queries
- ✅ Full-text search
- ✅ Multi-value columns

### BRIN Indexes (Block Range Index)

**Best for:** Very large tables with naturally ordered data

**Characteristics:**
- Extremely small index size
- Fast index creation
- Best for time-series data
- Only effective if data is physically ordered

**Example:**
```sql
-- PostgreSQL: BRIN index for time-series data
CREATE INDEX idx_logs_created_at_brin ON logs USING BRIN(created_at);

-- Query time-series data
SELECT * FROM logs WHERE created_at > '2024-01-01';
```

**When to use:**
- ✅ Very large tables (millions of rows)
- ✅ Time-series data
- ✅ Naturally ordered data
- ✅ Range queries on ordered columns
- ❌ Not for randomly distributed data

---

## Composite Indexes

### Definition

**Composite index**: Index on multiple columns

**Example:**
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

### Column Order Matters

**Rule**: Leftmost prefix rule

**Best Practices:**
- ✅ Put most selective column first
- ✅ Put columns used in equality comparisons before range comparisons
- ✅ Consider query patterns

**Example:**
```sql
-- Good: Most selective column first
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at);

-- Queries that benefit:
-- 1. All three columns
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending' AND created_at > '2024-01-01';

-- 2. First two columns
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';

-- 3. First column only
SELECT * FROM orders WHERE user_id = 123;

-- Queries that do NOT benefit:
-- 1. Second column only
SELECT * FROM orders WHERE status = 'pending';

-- 2. Third column only
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

### When to Use Composite Indexes

**Use composite indexes when:**
- ✅ Queries filter on multiple columns together
- ✅ Columns are frequently queried together
- ✅ Single-column indexes are not selective enough

**Example:**
```sql
-- Instead of two separate indexes:
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Use one composite index:
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

---

## Covering Indexes

### Definition

**Covering index**: Index that includes all columns needed by a query

**Benefit**: Query can be satisfied entirely from the index (index-only scan)

**Example:**
```sql
-- PostgreSQL: Create covering index with INCLUDE
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name, created_at);

-- Query uses index-only scan (no table access needed)
SELECT name, created_at FROM users WHERE email = 'user@example.com';

-- EXPLAIN output shows "Index Only Scan"
EXPLAIN SELECT name, created_at FROM users WHERE email = 'user@example.com';
```

**MySQL: Covering index**
```sql
-- MySQL: Add columns to index to create covering index
CREATE INDEX idx_users_email_name_created ON users(email, name, created_at);

-- Query uses covering index
SELECT name, created_at FROM users WHERE email = 'user@example.com';
```

**When to use:**
- ✅ Frequently executed queries
- ✅ Queries selecting few columns
- ✅ Performance-critical queries
- ❌ Don't include too many columns (index bloat)

---

## Partial Indexes

### Definition

**Partial index**: Index on subset of rows

**Benefit**: Smaller, more efficient index

**Example:**
```sql
-- PostgreSQL: Create partial index
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- Query benefits from smaller, more efficient index
SELECT * FROM orders
WHERE status = 'pending' AND created_at > '2024-01-01';

-- Another example: Index only active users
CREATE INDEX idx_users_active_email ON users(email)
WHERE deleted_at IS NULL;

-- Query benefits
SELECT * FROM users
WHERE email = 'user@example.com' AND deleted_at IS NULL;
```

**When to use:**
- ✅ Queries frequently filter on specific values
- ✅ Large tables with subset of active rows
- ✅ Soft-delete patterns
- ✅ Status-based filtering

**Database support:**
- ✅ PostgreSQL: Full support
- ❌ MySQL: No support (use filtered index workaround)
- ✅ SQL Server: Filtered indexes

---

## Unique Indexes

### Definition

**Unique index**: Enforces uniqueness constraint

**Example:**
```sql
-- Create unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Composite unique index
CREATE UNIQUE INDEX idx_user_prefs_unique ON user_preferences(user_id, preference_key);

-- Partial unique index (PostgreSQL)
CREATE UNIQUE INDEX idx_users_username_active ON users(username)
WHERE deleted_at IS NULL;
```

**When to use:**
- ✅ Enforce uniqueness constraints
- ✅ Prevent duplicate data
- ✅ Faster than CHECK constraint

---

## Index Maintenance

### Analyzing Index Usage

**PostgreSQL: Check index usage**
```sql
-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find index size
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find duplicate indexes
SELECT
    pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS size,
    (array_agg(idx))[1] AS idx1,
    (array_agg(idx))[2] AS idx2,
    (array_agg(idx))[3] AS idx3,
    (array_agg(idx))[4] AS idx4
FROM (
    SELECT
        indexrelid::regclass AS idx,
        (indrelid::text ||E'\n'|| indclass::text ||E'\n'|| indkey::text ||E'\n'||
         COALESCE(indexprs::text,'')||E'\n' || COALESCE(indpred::text,'')) AS key
    FROM pg_index
) sub
GROUP BY key
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;
```

**MySQL: Check index usage**
```sql
-- Find unused indexes
SELECT
    t.TABLE_SCHEMA,
    t.TABLE_NAME,
    s.INDEX_NAME,
    s.COLUMN_NAME
FROM information_schema.TABLES t
LEFT JOIN information_schema.STATISTICS s
    ON t.TABLE_SCHEMA = s.TABLE_SCHEMA
    AND t.TABLE_NAME = s.TABLE_NAME
WHERE t.TABLE_SCHEMA NOT IN ('mysql', 'information_schema', 'performance_schema')
  AND s.INDEX_NAME IS NOT NULL
ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, s.INDEX_NAME;
```

### Index Bloat

**Definition**: Wasted space in indexes due to updates and deletes

**PostgreSQL: Check index bloat**
```sql
-- Estimate index bloat
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    ROUND(100 * (pg_relation_size(indexrelid) - pg_relation_size(indexrelid, 'main')) /
          NULLIF(pg_relation_size(indexrelid), 0), 2) AS bloat_pct
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Fix index bloat:**
```sql
-- PostgreSQL: Rebuild index concurrently
REINDEX INDEX CONCURRENTLY idx_users_email;

-- Or recreate index
DROP INDEX CONCURRENTLY idx_users_email;
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- MySQL: Rebuild index
ALTER TABLE users DROP INDEX idx_users_email, ADD INDEX idx_users_email(email);
```

### Vacuuming (PostgreSQL)

**Purpose**: Reclaim space and update statistics

```sql
-- Vacuum table (reclaim space)
VACUUM users;

-- Vacuum and analyze (reclaim space + update statistics)
VACUUM ANALYZE users;

-- Full vacuum (locks table, reclaims more space)
VACUUM FULL users;

-- Autovacuum settings (postgresql.conf)
autovacuum = on
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
```

---

## Analyzing Query Plans

### EXPLAIN Command

**PostgreSQL:**
```sql
-- Show query plan
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Show query plan with actual execution
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- Show query plan with more details
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT * FROM users WHERE email = 'user@example.com';
```

**MySQL:**
```sql
-- Show query plan
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Show query plan with more details
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE email = 'user@example.com';
```

### Reading Query Plans

**Key metrics:**
- **Seq Scan**: Full table scan (slow for large tables)
- **Index Scan**: Using index (good)
- **Index Only Scan**: Using covering index (best)
- **Bitmap Index Scan**: Using multiple indexes
- **Cost**: Estimated cost (lower is better)
- **Rows**: Estimated rows returned
- **Actual Time**: Actual execution time (EXPLAIN ANALYZE)

**Example:**
```sql
-- Bad: Sequential scan
EXPLAIN SELECT * FROM users WHERE name = 'John';
-- Output: Seq Scan on users (cost=0.00..1000.00 rows=100)

-- Good: Index scan
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';
-- Output: Index Scan using idx_users_email on users (cost=0.29..8.30 rows=1)

-- Best: Index only scan
EXPLAIN SELECT name FROM users WHERE email = 'user@example.com';
-- Output: Index Only Scan using idx_users_email_covering on users (cost=0.29..8.30 rows=1)
```

---

## Database-Specific Indexing Features

### PostgreSQL

**Expression Indexes:**
```sql
-- Index on expression
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- Query uses expression index
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
```

**Concurrent Index Creation:**
```sql
-- Create index without locking table
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Index-Only Scans:**
```sql
-- Covering index for index-only scans
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name, created_at);
```

### MySQL

**Prefix Indexes:**
```sql
-- Index first 10 characters of column
CREATE INDEX idx_users_email_prefix ON users(email(10));
```

**Fulltext Indexes:**
```sql
-- Create fulltext index
CREATE FULLTEXT INDEX idx_articles_content ON articles(content);

-- Fulltext search
SELECT * FROM articles WHERE MATCH(content) AGAINST('database optimization');
```

### SQL Server

**Columnstore Indexes:**
```sql
-- Create columnstore index for analytics
CREATE COLUMNSTORE INDEX idx_sales_columnstore ON sales(product_id, sale_date, amount);
```

**Filtered Indexes:**
```sql
-- Create filtered index (like PostgreSQL partial index)
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';
```

---

## Indexing Best Practices

### DO

- ✅ Index primary keys (automatic)
- ✅ Index foreign keys
- ✅ Index columns used in WHERE clauses
- ✅ Index columns used in JOIN conditions
- ✅ Index columns used in ORDER BY
- ✅ Use composite indexes for multi-column queries
- ✅ Use covering indexes for frequently executed queries
- ✅ Use partial indexes for filtered queries
- ✅ Monitor index usage and remove unused indexes
- ✅ Rebuild indexes periodically to reduce bloat
- ✅ Use EXPLAIN to verify index usage

### DON'T

- ❌ Index every column
- ❌ Create duplicate indexes
- ❌ Index small tables (< 1000 rows)
- ❌ Index columns with low cardinality
- ❌ Index columns that are frequently updated
- ❌ Create indexes without testing
- ❌ Ignore index maintenance
- ❌ Create indexes during peak hours (without CONCURRENTLY)

---

## Indexing Checklist

### Planning Phase

- [ ] Identify frequently executed queries
- [ ] Identify columns used in WHERE clauses
- [ ] Identify columns used in JOIN conditions
- [ ] Identify columns used in ORDER BY
- [ ] Identify columns used in GROUP BY
- [ ] Consider composite indexes for multi-column queries
- [ ] Consider covering indexes for frequently executed queries
- [ ] Consider partial indexes for filtered queries

### Implementation Phase

- [ ] Create indexes on foreign keys
- [ ] Create indexes on frequently queried columns
- [ ] Use appropriate index type (B-tree, hash, GIN, GiST, BRIN)
- [ ] Use CONCURRENTLY in PostgreSQL (no table lock)
- [ ] Test index creation in staging first
- [ ] Verify index usage with EXPLAIN

### Maintenance Phase

- [ ] Monitor index usage
- [ ] Remove unused indexes
- [ ] Rebuild bloated indexes
- [ ] Update statistics (ANALYZE)
- [ ] Vacuum tables (PostgreSQL)
- [ ] Review query plans regularly

---

## Related Documentation

- **relational-databases.md**: Relational database fundamentals
- **relational-schema-design.md**: Schema design and normalization
- **relational-query-optimization.md**: Query optimization
- **performance-optimization.md**: General performance optimization
- **universal-best-practices.md**: General database best practices

