# Optimization Workflow

## Purpose

Provide structured guidance for identifying, analyzing, and resolving database performance issues through systematic optimization.

---

## Core Principles

1. **Measure First**: Profile before optimizing - don't guess
2. **Focus on Impact**: Optimize high-impact queries first
3. **Understand Trade-offs**: Every optimization has costs
4. **Test Changes**: Benchmark before and after optimization
5. **Monitor Continuously**: Performance degrades over time
6. **Document Decisions**: Record why optimizations were made

---

## Optimization Workflow

### Step 1: Identify Performance Issues

**Purpose**: Find slow queries and performance bottlenecks

**Methods**:
- **Slow Query Logs**: Enable and analyze database slow query logs
- **Application Monitoring**: Track query execution times in application
- **Database Metrics**: Monitor CPU, memory, disk I/O, connection pool
- **User Reports**: Investigate user-reported slowness

**Tools by Database**:
- **PostgreSQL**: `pg_stat_statements`, `EXPLAIN ANALYZE`
- **MySQL**: Slow query log, `EXPLAIN`, Performance Schema
- **MongoDB**: Profiler, `explain()`, Database Profiler
- **SQLite**: `EXPLAIN QUERY PLAN`

**Output**: List of slow queries with execution times and frequency

**AI Prompt Template**:
```
Analyze these slow queries and identify optimization opportunities:

Database: [PostgreSQL/MySQL/MongoDB/etc.]

Slow Queries:
1. Query: [paste query]
   Execution time: [time]
   Frequency: [calls per minute]
   
2. Query: [paste query]
   Execution time: [time]
   Frequency: [calls per minute]

Please identify which queries to optimize first and why.
```

### Step 2: Analyze Query Execution Plans

**Purpose**: Understand how the database executes queries

**PostgreSQL Example**:
```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;
```

**What to Look For**:
- **Sequential Scans**: Full table scans (often slow)
- **Index Scans**: Using indexes (usually fast)
- **Nested Loops**: Can be slow with large datasets
- **Hash Joins**: Good for large joins
- **Sort Operations**: Can be expensive
- **Estimated vs Actual Rows**: Large differences indicate stale statistics

**Output**: Understanding of query execution and bottlenecks

**AI Prompt Template**:
```
Analyze this query execution plan:

Query:
[paste query]

Execution Plan:
[paste EXPLAIN ANALYZE output]

Schema:
[paste relevant table definitions and indexes]

Please identify:
1. Performance bottlenecks
2. Missing indexes
3. Query optimization opportunities
4. Estimated impact of each optimization
```

### Step 3: Implement Optimizations

**Purpose**: Apply optimizations based on analysis

**Optimization Strategies**:

#### 3.1 Add Indexes

**When to Add**:
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY clauses
- Foreign key columns

**Example**:
```sql
-- Before: Sequential scan on users table
-- After: Index scan
CREATE INDEX idx_users_created_at ON users(created_at);

-- Composite index for multiple columns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index for specific conditions
CREATE INDEX idx_users_active ON users(email) WHERE status = 'active';
```

#### 3.2 Optimize Queries

**Query Rewriting**:
```sql
-- ❌ Inefficient: Using OR
SELECT * FROM users WHERE status = 'active' OR status = 'pending';

-- ✅ Efficient: Using IN
SELECT * FROM users WHERE status IN ('active', 'pending');

-- ❌ Inefficient: Function on indexed column
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- ✅ Efficient: Use functional index or case-insensitive collation
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
```

**Avoid N+1 Queries**:
```sql
-- ❌ N+1: One query per user
SELECT * FROM users;
-- Then for each user: SELECT * FROM orders WHERE user_id = ?

-- ✅ Single query with JOIN
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

#### 3.3 Denormalization

**When to Denormalize**:
- Read-heavy workloads
- Complex joins are slow
- Acceptable data redundancy

**Example**:
```sql
-- Add denormalized column to avoid JOIN
ALTER TABLE orders ADD COLUMN user_email VARCHAR(255);

-- Keep it updated with trigger or application logic
CREATE TRIGGER update_order_user_email
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE orders SET user_email = NEW.email WHERE user_id = NEW.id;
END;
```

#### 3.4 Caching

**Strategies**:
- **Query Result Caching**: Cache expensive query results
- **Materialized Views**: Pre-compute complex aggregations
- **Application-Level Caching**: Redis, Memcached

**PostgreSQL Materialized View**:
```sql
CREATE MATERIALIZED VIEW user_order_stats AS
SELECT 
  u.id,
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Refresh periodically
REFRESH MATERIALIZED VIEW user_order_stats;
```

#### 3.5 Partitioning

**When to Partition**:
- Very large tables (millions of rows)
- Time-series data
- Queries filter on partition key

**Example** (PostgreSQL):
```sql
-- Partition by date range
CREATE TABLE orders (
  id SERIAL,
  user_id INTEGER,
  created_at TIMESTAMP,
  total DECIMAL(10,2)
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_q1 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_q2 PARTITION OF orders
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

**AI Prompt Template**:
```
Suggest optimizations for this slow query:

Query:
[paste query]

Execution Plan:
[paste EXPLAIN output]

Schema:
[paste table definitions and existing indexes]

Performance Issue:
- Current execution time: [time]
- Target execution time: [time]
- Data volume: [number of rows]

Please suggest:
1. Index additions or modifications
2. Query rewrites
3. Schema changes (denormalization, partitioning)
4. Caching strategies
5. Estimated impact of each optimization
```

### Step 4: Benchmark and Validate

**Purpose**: Measure improvement and ensure correctness

**Benchmarking Process**:
1. **Baseline**: Measure performance before optimization
2. **Apply**: Implement optimization
3. **Measure**: Measure performance after optimization
4. **Compare**: Calculate improvement percentage
5. **Validate**: Ensure results are still correct

**Example Benchmark**:
```sql
-- Baseline
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';
-- Execution time: 245ms

-- Add index
CREATE INDEX idx_users_email ON users(email);

-- After optimization
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';
-- Execution time: 2ms
-- Improvement: 99.2%
```

**Validation Checklist**:
- [ ] Query returns same results as before
- [ ] Execution time improved
- [ ] No negative impact on write performance
- [ ] Index size is acceptable
- [ ] Application behavior unchanged

**Output**: Validated optimization with measured improvement

### Step 5: Monitor Ongoing Performance

**Purpose**: Ensure optimizations remain effective over time

**Monitoring Metrics**:
- **Query Execution Time**: Track slow query trends
- **Index Usage**: Ensure indexes are being used
- **Cache Hit Ratio**: Monitor cache effectiveness
- **Database Size**: Track growth over time
- **Connection Pool**: Monitor connection usage

**Tools**:
- **PostgreSQL**: `pg_stat_statements`, `pg_stat_user_indexes`
- **MySQL**: Performance Schema, `sys` schema
- **MongoDB**: Database Profiler, Cloud Manager
- **Application**: APM tools (New Relic, Datadog, etc.)

**Alerts to Set**:
- Query execution time exceeds threshold
- Index not being used
- Cache hit ratio drops below threshold
- Database size grows unexpectedly
- Connection pool exhaustion

---

## Optimization Patterns by Database Type

### Relational Databases (PostgreSQL, MySQL)

**Common Optimizations**:
1. Add indexes on frequently queried columns
2. Use EXPLAIN to analyze query plans
3. Optimize JOIN order and types
4. Use connection pooling
5. Partition large tables
6. Update statistics regularly

**PostgreSQL-Specific**:
- Use `VACUUM` and `ANALYZE` regularly
- Create partial indexes for filtered queries
- Use `EXPLAIN (ANALYZE, BUFFERS)` for detailed analysis
- Consider table inheritance for partitioning

**MySQL-Specific**:
- Choose appropriate storage engine (InnoDB vs MyISAM)
- Optimize `innodb_buffer_pool_size`
- Use covering indexes
- Avoid `SELECT *` in queries

### NoSQL Databases (MongoDB)

**Common Optimizations**:
1. Create indexes on query fields
2. Use compound indexes for multiple fields
3. Avoid large documents (> 16MB limit)
4. Use projection to limit returned fields
5. Implement sharding for horizontal scaling
6. Use aggregation pipeline efficiently

**MongoDB-Specific**:
```javascript
// Create compound index
db.users.createIndex({ email: 1, status: 1 });

// Use projection to limit fields
db.users.find({ status: 'active' }, { name: 1, email: 1 });

// Optimize aggregation pipeline
db.orders.aggregate([
  { $match: { status: 'completed' } },  // Filter early
  { $group: { _id: '$user_id', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
]);
```

### Vector Databases (Pinecone, Milvus)

**Common Optimizations**:
1. Choose appropriate index type (HNSW, IVF, etc.)
2. Tune index parameters (ef_construction, M)
3. Use metadata filtering efficiently
4. Batch upsert operations
5. Monitor query latency and recall

---

## Common Pitfalls

❌ **Adding indexes without measuring**: Too many indexes slow down writes
✅ **Solution**: Profile queries first, add indexes strategically

❌ **Optimizing low-impact queries**: Wasting time on queries that run rarely
✅ **Solution**: Focus on high-frequency or high-impact queries

❌ **Not testing on production-like data**: Optimization works on small data but not at scale
✅ **Solution**: Test with production-like data volumes

❌ **Ignoring write performance**: Indexes speed up reads but slow down writes
✅ **Solution**: Balance read and write performance needs

❌ **Over-denormalizing**: Data inconsistency and update complexity
✅ **Solution**: Denormalize only when necessary and manageable

❌ **Not monitoring after optimization**: Performance degrades over time
✅ **Solution**: Set up continuous monitoring and alerts

---

## Best Practices

### DO

✅ Profile before optimizing (measure, don't guess)
✅ Focus on high-impact queries first
✅ Benchmark before and after changes
✅ Monitor index usage and effectiveness
✅ Update database statistics regularly
✅ Document optimization decisions
✅ Test on production-like data volumes
✅ Consider trade-offs (read vs write performance)

### DON'T

❌ Add indexes without profiling
❌ Optimize without measuring baseline
❌ Ignore write performance impact
❌ Over-denormalize data
❌ Skip testing optimizations
❌ Forget to monitor ongoing performance
❌ Optimize low-impact queries first

---

## Next Steps

- See `schema-design-workflow.md` for designing performant schemas
- See `migration-workflow.md` for applying schema optimizations
- See `testing-patterns.md` for performance testing strategies
- See `documentation-standards.md` for documenting optimizations
- See `../examples/optimization-example.md` for complete optimization example


