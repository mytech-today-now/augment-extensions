# Optimization Example: Slow Product Search Query

## Scenario

The product search feature in the e-commerce platform (from schema-design-example.md) is experiencing performance issues.

**Problem**:
- Product search query takes 2-3 seconds to execute
- Users complaining about slow search results
- Database CPU usage spikes during search operations
- Search is used frequently (1000+ searches per minute)

**Requirements**:
- Reduce search query time to < 100ms
- Support full-text search on product names and descriptions
- Filter by category and price range
- Sort by relevance, price, or rating

---

## Step 1: Identify the Problem

### Current Query

```sql
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.average_rating,
  c.name as category_name,
  (SELECT url FROM product_images WHERE product_id = p.id ORDER BY display_order LIMIT 1) as thumbnail
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE 
  (LOWER(p.name) LIKE '%wireless%' OR LOWER(p.description) LIKE '%wireless%')
  AND p.price BETWEEN 50 AND 200
  AND c.slug = 'electronics'
ORDER BY p.average_rating DESC NULLS LAST
LIMIT 20 OFFSET 0;
```

### Performance Metrics

**Baseline Performance**:
- Execution time: 2,345ms
- Rows scanned: 50,000 (full table scan)
- Frequency: 1,000 queries/minute
- Database CPU: 80% during peak

---

## Step 2: Analyze Execution Plan

### Get Execution Plan

```sql
EXPLAIN ANALYZE
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.average_rating,
  c.name as category_name,
  (SELECT url FROM product_images WHERE product_id = p.id ORDER BY display_order LIMIT 1) as thumbnail
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE 
  (LOWER(p.name) LIKE '%wireless%' OR LOWER(p.description) LIKE '%wireless%')
  AND p.price BETWEEN 50 AND 200
  AND c.slug = 'electronics'
ORDER BY p.average_rating DESC NULLS LAST
LIMIT 20 OFFSET 0;
```

### Execution Plan Output

```
Limit  (cost=15234.56..15234.61 rows=20 width=256) (actual time=2345.123..2345.145 rows=20 loops=1)
  ->  Sort  (cost=15234.56..15359.78 rows=50087 width=256) (actual time=2345.121..2345.135 rows=20 loops=1)
        Sort Key: p.average_rating DESC NULLS LAST
        Sort Method: top-N heapsort  Memory: 28kB
        ->  Hash Join  (cost=234.56..14123.45 rows=50087 width=256) (actual time=12.345..2234.567 rows=48234 loops=1)
              Hash Cond: (p.category_id = c.id)
              ->  Seq Scan on products p  (cost=0.00..13456.78 rows=50123 width=234) (actual time=0.123..2123.456 rows=48456 loops=1)
                    Filter: ((LOWER(name) ~~ '%wireless%'::text OR LOWER(description) ~~ '%wireless%'::text) AND (price >= 50) AND (price <= 200))
                    Rows Removed by Filter: 51544
              ->  Hash  (cost=234.45..234.45 rows=1 width=22) (actual time=0.234..0.234 rows=1 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 9kB
                    ->  Index Scan using idx_categories_slug on categories c  (cost=0.15..234.45 rows=1 width=22) (actual time=0.123..0.123 rows=1 loops=1)
                          Index Cond: (slug = 'electronics'::text)
Planning Time: 1.234 ms
Execution Time: 2345.234 ms
```

### Issues Identified

1. **Sequential Scan on products**: Full table scan (50,000 rows)
2. **LOWER() function on columns**: Prevents index usage
3. **LIKE with leading wildcard**: Cannot use B-tree index
4. **Subquery for thumbnail**: Executed for each row (N+1 problem)
5. **No full-text search index**: Text search is inefficient

---

## Step 3: Implement Optimizations

### Optimization 1: Add Full-Text Search Index

**Problem**: `LOWER(name) LIKE '%wireless%'` causes sequential scan

**Solution**: Use PostgreSQL full-text search with GIN index

```sql
-- Add tsvector column for full-text search
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Populate search vector
UPDATE products 
SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''));

-- Create GIN index for full-text search
CREATE INDEX idx_products_search_vector ON products USING gin(search_vector);

-- Create trigger to keep search_vector updated
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_search_vector_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();
```

### Optimization 2: Add Composite Index for Filtering

**Problem**: Filtering by category and price requires sequential scan

**Solution**: Create composite index

```sql
-- Composite index for category and price range queries
CREATE INDEX idx_products_category_price ON products(category_id, price);
```

### Optimization 3: Denormalize Thumbnail URL

**Problem**: Subquery for thumbnail executes for each row

**Solution**: Add thumbnail column to products table

```sql
-- Add thumbnail column
ALTER TABLE products ADD COLUMN thumbnail_url VARCHAR(500);

-- Populate thumbnail from first image
UPDATE products p
SET thumbnail_url = (
  SELECT url 
  FROM product_images 
  WHERE product_id = p.id 
  ORDER BY display_order 
  LIMIT 1
);

-- Create trigger to update thumbnail when images change
CREATE OR REPLACE FUNCTION update_product_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET thumbnail_url = (
    SELECT url 
    FROM product_images 
    WHERE product_id = NEW.product_id 
    ORDER BY display_order 
    LIMIT 1
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_thumbnail
AFTER INSERT OR UPDATE OR DELETE ON product_images
FOR EACH ROW EXECUTE FUNCTION update_product_thumbnail();
```

### Optimization 4: Rewrite Query to Use Indexes

**Problem**: Original query doesn't leverage new indexes

**Solution**: Rewrite query to use full-text search and indexes

```sql
-- Optimized query using full-text search
SELECT
  p.id,
  p.name,
  p.description,
  p.price,
  p.average_rating,
  c.name as category_name,
  p.thumbnail_url,
  ts_rank(p.search_vector, query) as relevance
FROM products p
JOIN categories c ON p.category_id = c.id,
to_tsquery('english', 'wireless') as query
WHERE
  p.search_vector @@ query
  AND p.price BETWEEN 50 AND 200
  AND c.slug = 'electronics'
ORDER BY relevance DESC, p.average_rating DESC NULLS LAST
LIMIT 20 OFFSET 0;
```

---

## Step 4: Benchmark and Validate

### Test Optimized Query

```sql
EXPLAIN ANALYZE
SELECT
  p.id,
  p.name,
  p.description,
  p.price,
  p.average_rating,
  c.name as category_name,
  p.thumbnail_url,
  ts_rank(p.search_vector, query) as relevance
FROM products p
JOIN categories c ON p.category_id = c.id,
to_tsquery('english', 'wireless') as query
WHERE
  p.search_vector @@ query
  AND p.price BETWEEN 50 AND 200
  AND c.slug = 'electronics'
ORDER BY relevance DESC, p.average_rating DESC NULLS LAST
LIMIT 20 OFFSET 0;
```

### Optimized Execution Plan

```
Limit  (cost=234.56..234.61 rows=20 width=264) (actual time=45.123..45.145 rows=20 loops=1)
  ->  Sort  (cost=234.56..259.78 rows=10087 width=264) (actual time=45.121..45.135 rows=20 loops=1)
        Sort Key: (ts_rank(p.search_vector, query)) DESC, p.average_rating DESC NULLS LAST
        Sort Method: top-N heapsort  Memory: 28kB
        ->  Nested Loop  (cost=12.45..123.45 rows=10087 width=264) (actual time=2.345..34.567 rows=8234 loops=1)
              ->  Index Scan using idx_categories_slug on categories c  (cost=0.15..8.17 rows=1 width=22) (actual time=0.123..0.123 rows=1 loops=1)
                    Index Cond: (slug = 'electronics'::text)
              ->  Bitmap Heap Scan on products p  (cost=12.30..115.28 rows=10087 width=242) (actual time=2.222..33.444 rows=8234 loops=1)
                    Recheck Cond: (search_vector @@ query)
                    Filter: ((price >= 50) AND (price <= 200) AND (category_id = c.id))
                    Rows Removed by Filter: 1766
                    Heap Blocks: exact=1234
                    ->  Bitmap Index Scan on idx_products_search_vector  (cost=0.00..9.78 rows=10000 width=0) (actual time=1.234..1.234 rows=10000 loops=1)
                          Index Cond: (search_vector @@ query)
Planning Time: 0.234 ms
Execution Time: 45.234 ms
```

### Performance Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Execution Time | 2,345ms | 45ms | **98.1%** |
| Rows Scanned | 50,000 | 10,000 | 80% |
| Index Usage | None | GIN + B-tree | ✅ |
| Subqueries | 1 per row | 0 | ✅ |
| Database CPU | 80% | 15% | 81.3% |

### Validation Tests

```sql
-- Test 1: Verify results are the same
-- Compare original query results with optimized query results
WITH original AS (
  SELECT p.id
  FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE
    (LOWER(p.name) LIKE '%wireless%' OR LOWER(p.description) LIKE '%wireless%')
    AND p.price BETWEEN 50 AND 200
    AND c.slug = 'electronics'
  ORDER BY p.average_rating DESC NULLS LAST
  LIMIT 20
),
optimized AS (
  SELECT p.id
  FROM products p
  JOIN categories c ON p.category_id = c.id,
  to_tsquery('english', 'wireless') as query
  WHERE
    p.search_vector @@ query
    AND p.price BETWEEN 50 AND 200
    AND c.slug = 'electronics'
  ORDER BY ts_rank(p.search_vector, query) DESC, p.average_rating DESC NULLS LAST
  LIMIT 20
)
SELECT
  COUNT(*) as matching_results,
  (SELECT COUNT(*) FROM original) as original_count,
  (SELECT COUNT(*) FROM optimized) as optimized_count
FROM original
INNER JOIN optimized ON original.id = optimized.id;

-- Test 2: Verify index is being used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE indexname = 'idx_products_search_vector';

-- Test 3: Verify thumbnail denormalization
SELECT COUNT(*)
FROM products
WHERE thumbnail_url IS NULL
  AND id IN (SELECT DISTINCT product_id FROM product_images);
-- Should return 0
```

---

## Step 5: Monitor Ongoing Performance

### Monitoring Queries

```sql
-- Monitor search query performance over time
SELECT
  DATE_TRUNC('hour', query_start) as hour,
  COUNT(*) as query_count,
  AVG(total_exec_time) as avg_time_ms,
  MAX(total_exec_time) as max_time_ms
FROM pg_stat_statements
WHERE query LIKE '%search_vector%'
GROUP BY DATE_TRUNC('hour', query_start)
ORDER BY hour DESC
LIMIT 24;

-- Monitor index usage
SELECT
  indexrelname as index_name,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'products'
ORDER BY idx_scan DESC;

-- Monitor index bloat
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'LOW USAGE'
    ELSE 'ACTIVE'
  END as usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'products';
```

### Performance Alerts

Set up alerts for:
- Search query time > 100ms (threshold exceeded)
- Index not being used (idx_scan = 0 after 1 hour)
- Database CPU > 70% (resource constraint)
- Search query error rate > 1% (potential issues)

---

## Step 6: Additional Optimizations

### Optimization 5: Add Caching Layer

**Problem**: Same searches executed repeatedly

**Solution**: Cache search results in Redis

```javascript
// Application-level caching
const redis = require('redis');
const client = redis.createClient();

async function searchProducts(searchTerm, category, minPrice, maxPrice) {
  // Create cache key
  const cacheKey = `search:${searchTerm}:${category}:${minPrice}:${maxPrice}`;

  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Execute query
  const results = await db.query(`
    SELECT
      p.id,
      p.name,
      p.price,
      p.average_rating,
      c.name as category_name,
      p.thumbnail_url,
      ts_rank(p.search_vector, query) as relevance
    FROM products p
    JOIN categories c ON p.category_id = c.id,
    to_tsquery('english', $1) as query
    WHERE
      p.search_vector @@ query
      AND p.price BETWEEN $2 AND $3
      AND c.slug = $4
    ORDER BY relevance DESC, p.average_rating DESC NULLS LAST
    LIMIT 20
  `, [searchTerm, minPrice, maxPrice, category]);

  // Cache results for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(results.rows));

  return results.rows;
}
```

### Optimization 6: Materialized View for Popular Searches

**Problem**: Popular searches still hit database

**Solution**: Create materialized view for top categories

```sql
-- Materialized view for electronics category
CREATE MATERIALIZED VIEW popular_electronics AS
SELECT
  p.id,
  p.name,
  p.price,
  p.average_rating,
  p.thumbnail_url,
  p.search_vector
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'electronics'
  AND p.inventory_count > 0
ORDER BY p.average_rating DESC NULLS LAST;

-- Index on materialized view
CREATE INDEX idx_popular_electronics_search ON popular_electronics USING gin(search_vector);

-- Refresh every hour
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-popular-electronics', '0 * * * *', 'REFRESH MATERIALIZED VIEW popular_electronics');
```

---

## Key Takeaways

1. **Measure First**: Used EXPLAIN ANALYZE to identify bottlenecks
2. **Full-Text Search**: Replaced LIKE with PostgreSQL full-text search (98% faster)
3. **Denormalization**: Added thumbnail_url to avoid N+1 subquery
4. **Composite Indexes**: Created indexes for common filter combinations
5. **Caching**: Added Redis caching for repeated searches
6. **Monitoring**: Set up continuous monitoring to track performance
7. **Validation**: Verified results are correct and performance improved

**Result**: Query time reduced from 2,345ms to 45ms (98.1% improvement)

---

## Next Steps

- See `../rules/optimization-workflow.md` for systematic optimization process
- See `../rules/testing-patterns.md` for performance testing strategies
- See `migration-example.md` for deploying optimizations safely


