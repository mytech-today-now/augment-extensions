# Migration Example: Adding Wishlist Feature

## Scenario

Add a wishlist feature to the e-commerce platform (from schema-design-example.md) that allows users to save products for later.

**Requirements**:
- Users can add/remove products to their wishlist
- Track when products were added to wishlist
- Support multiple wishlists per user (e.g., "Birthday", "Holiday")
- Zero downtime migration
- Backward compatible with existing code

**Constraints**:
- Production database has 100,000 users
- Cannot take downtime
- Existing application code must continue working during migration

---

## Step 1: Plan the Migration

### Schema Changes

**New Tables**:
1. `wishlists` - User wishlists with names
2. `wishlist_items` - Products in each wishlist

**Relationships**:
- `wishlists.user_id` → `users.id` (many-to-one)
- `wishlist_items.wishlist_id` → `wishlists.id` (many-to-one)
- `wishlist_items.product_id` → `products.id` (many-to-one)

### Migration Strategy

**Approach**: Single-phase migration (low risk, no schema changes to existing tables)

**Why Single-Phase**:
- Adding new tables only (no changes to existing tables)
- No data migration needed
- No backward compatibility concerns
- Can deploy code and schema together

**Timeline**:
1. Create migration scripts (30 minutes)
2. Test on staging (1 hour)
3. Execute on production (< 1 minute)
4. Deploy application code (5 minutes)
5. Monitor (24 hours)

---

## Step 2: Create Migration Scripts

### Up Migration

**File**: `migrations/20240128_add_wishlist_feature.sql`

```sql
-- Migration: Add wishlist feature
-- Date: 2024-01-28
-- Author: AI Agent
-- Issue: bd-wishlist.1
-- 
-- Purpose: Add wishlist functionality for users to save products
-- 
-- Breaking Changes: None (new tables only)
-- 
-- Rollback: Safe to rollback; tables will be dropped
-- 
-- Estimated Execution Time: < 5 seconds
-- 
-- Dependencies: None

BEGIN;

-- Create wishlists table
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'My Wishlist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_user_wishlist_name UNIQUE (user_id, name)
);

-- Indexes for wishlists
CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- Comments
COMMENT ON TABLE wishlists IS 'User wishlists for saving products';
COMMENT ON COLUMN wishlists.name IS 'User-defined wishlist name (e.g., "Birthday", "Holiday")';
COMMENT ON CONSTRAINT unique_user_wishlist_name ON wishlists IS 'Prevent duplicate wishlist names per user';

-- Create wishlist_items table
CREATE TABLE wishlist_items (
  id SERIAL PRIMARY KEY,
  wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- Indexes for wishlist_items
CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id, added_at DESC);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);

-- Comments
COMMENT ON TABLE wishlist_items IS 'Products saved in user wishlists';
COMMENT ON COLUMN wishlist_items.notes IS 'Optional user notes about the product';
COMMENT ON CONSTRAINT unique_wishlist_product ON wishlist_items IS 'Prevent duplicate products in same wishlist';

-- Create function to update wishlist updated_at timestamp
CREATE OR REPLACE FUNCTION update_wishlist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wishlists SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.wishlist_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update wishlist timestamp when items are added/removed
CREATE TRIGGER trigger_update_wishlist_timestamp
AFTER INSERT OR UPDATE OR DELETE ON wishlist_items
FOR EACH ROW EXECUTE FUNCTION update_wishlist_timestamp();

COMMIT;
```

### Down Migration (Rollback)

**File**: `migrations/20240128_add_wishlist_feature_down.sql`

```sql
-- Rollback: Remove wishlist feature
-- Date: 2024-01-28

BEGIN;

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_update_wishlist_timestamp ON wishlist_items;
DROP FUNCTION IF EXISTS update_wishlist_timestamp();

-- Drop tables (cascade will remove foreign key constraints)
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;

COMMIT;
```

---

## Step 3: Test the Migration

### Test on Local Development

```bash
# Apply migration
psql -U postgres -d ecommerce_dev -f migrations/20240128_add_wishlist_feature.sql

# Verify tables created
psql -U postgres -d ecommerce_dev -c "\d wishlists"
psql -U postgres -d ecommerce_dev -c "\d wishlist_items"

# Test rollback
psql -U postgres -d ecommerce_dev -f migrations/20240128_add_wishlist_feature_down.sql

# Verify tables dropped
psql -U postgres -d ecommerce_dev -c "\d wishlists"
```

### Test on Staging with Production-Like Data

```bash
# Restore production snapshot to staging
pg_restore -U postgres -d ecommerce_staging production_snapshot.dump

# Apply migration
psql -U postgres -d ecommerce_staging -f migrations/20240128_add_wishlist_feature.sql

# Verify migration success
psql -U postgres -d ecommerce_staging -c "
  SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
  FROM information_schema.tables t
  WHERE table_name IN ('wishlists', 'wishlist_items');
"

# Test sample data insertion
psql -U postgres -d ecommerce_staging -c "
  INSERT INTO wishlists (user_id, name) VALUES (1, 'Test Wishlist');
  INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (1, 1);
  SELECT * FROM wishlists;
  SELECT * FROM wishlist_items;
"

# Test rollback
psql -U postgres -d ecommerce_staging -f migrations/20240128_add_wishlist_feature_down.sql
```

### Testing Checklist

- [x] Migration runs without errors
- [x] Tables created with correct schema
- [x] Indexes created successfully
- [x] Foreign key constraints work correctly
- [x] Unique constraints prevent duplicates
- [x] Trigger updates wishlist timestamp
- [x] Rollback script works correctly
- [x] No impact on existing tables
- [x] Execution time < 5 seconds

---

## Step 4: Execute on Production

### Pre-Migration Checklist

- [x] Backup database (snapshot created)
- [x] Rollback script tested on staging
- [x] Migration tested on production-like data
- [x] Stakeholders notified
- [x] Monitoring dashboards prepared
- [x] Execution window scheduled (low-traffic period)

### Execution Steps

```bash
# 1. Create database backup
pg_dump -U postgres -d ecommerce_prod -F c -f backup_before_wishlist_$(date +%Y%m%d_%H%M%S).dump

# 2. Verify backup
ls -lh backup_before_wishlist_*.dump

# 3. Start monitoring
# - Open database metrics dashboard
# - Open application error logs
# - Open APM dashboard

# 4. Execute migration
psql -U postgres -d ecommerce_prod -f migrations/20240128_add_wishlist_feature.sql

# 5. Verify migration success
psql -U postgres -d ecommerce_prod -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE tablename IN ('wishlists', 'wishlist_items');
"

# 6. Verify indexes created
psql -U postgres -d ecommerce_prod -c "
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename IN ('wishlists', 'wishlist_items');
"

# 7. Test basic operations
psql -U postgres -d ecommerce_prod -c "
  -- Create test wishlist
  INSERT INTO wishlists (user_id, name) VALUES (1, 'Test Wishlist') RETURNING id;

  -- Add item to wishlist
  INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (1, 1);

  -- Verify trigger updated timestamp
  SELECT id, name, created_at, updated_at FROM wishlists WHERE id = 1;

  -- Clean up test data
  DELETE FROM wishlists WHERE id = 1;
"
```

### Post-Migration Verification

```sql
-- Verify table structure
\d wishlists
\d wishlist_items

-- Verify constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN ('wishlists'::regclass, 'wishlist_items'::regclass);

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('wishlists', 'wishlist_items');

-- Verify trigger
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgrelid = 'wishlist_items'::regclass;
```

---

## Step 5: Deploy Application Code

### API Endpoints to Add

```javascript
// POST /api/wishlists - Create wishlist
app.post('/api/wishlists', async (req, res) => {
  const { userId, name } = req.body;

  const result = await db.query(
    'INSERT INTO wishlists (user_id, name) VALUES ($1, $2) RETURNING *',
    [userId, name]
  );

  res.json(result.rows[0]);
});

// GET /api/wishlists/:userId - Get user's wishlists
app.get('/api/wishlists/:userId', async (req, res) => {
  const { userId } = req.params;

  const result = await db.query(
    `SELECT w.*, COUNT(wi.id) as item_count
     FROM wishlists w
     LEFT JOIN wishlist_items wi ON w.id = wi.wishlist_id
     WHERE w.user_id = $1
     GROUP BY w.id
     ORDER BY w.updated_at DESC`,
    [userId]
  );

  res.json(result.rows);
});

// POST /api/wishlists/:wishlistId/items - Add item to wishlist
app.post('/api/wishlists/:wishlistId/items', async (req, res) => {
  const { wishlistId } = req.params;
  const { productId, notes } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO wishlist_items (wishlist_id, product_id, notes) VALUES ($1, $2, $3) RETURNING *',
      [wishlistId, productId, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {  // Unique constraint violation
      res.status(409).json({ error: 'Product already in wishlist' });
    } else {
      throw error;
    }
  }
});

// GET /api/wishlists/:wishlistId/items - Get wishlist items
app.get('/api/wishlists/:wishlistId/items', async (req, res) => {
  const { wishlistId } = req.params;

  const result = await db.query(
    `SELECT
       wi.*,
       p.name as product_name,
       p.price,
       p.inventory_count,
       (SELECT url FROM product_images WHERE product_id = p.id ORDER BY display_order LIMIT 1) as thumbnail
     FROM wishlist_items wi
     JOIN products p ON wi.product_id = p.id
     WHERE wi.wishlist_id = $1
     ORDER BY wi.added_at DESC`,
    [wishlistId]
  );

  res.json(result.rows);
});

// DELETE /api/wishlists/:wishlistId/items/:productId - Remove item from wishlist
app.delete('/api/wishlists/:wishlistId/items/:productId', async (req, res) => {
  const { wishlistId, productId } = req.params;

  await db.query(
    'DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2',
    [wishlistId, productId]
  );

  res.json({ success: true });
});
```

---

## Step 6: Monitor and Validate

### Monitoring Metrics

**Database Metrics** (first 24 hours):
- Table sizes: `wishlists` and `wishlist_items`
- Index usage: Verify indexes are being used
- Query performance: Monitor wishlist query times
- Lock contention: Check for blocking queries

**Application Metrics**:
- API endpoint response times
- Error rates for wishlist operations
- User adoption (wishlists created, items added)

### Validation Queries

```sql
-- Check wishlist growth
SELECT
  DATE(created_at) as date,
  COUNT(*) as wishlists_created
FROM wishlists
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;

-- Check wishlist item growth
SELECT
  DATE(added_at) as date,
  COUNT(*) as items_added
FROM wishlist_items
GROUP BY DATE(added_at)
ORDER BY date DESC
LIMIT 7;

-- Check most popular wishlist names
SELECT name, COUNT(*) as count
FROM wishlists
GROUP BY name
ORDER BY count DESC
LIMIT 10;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE tablename IN ('wishlists', 'wishlist_items')
ORDER BY idx_scan DESC;
```

---

## Rollback Plan (If Needed)

### When to Rollback

- Migration fails during execution
- Data integrity issues discovered
- Performance degradation detected
- Critical bugs in application code

### Rollback Steps

```bash
# 1. Stop application deployments
# 2. Execute rollback script
psql -U postgres -d ecommerce_prod -f migrations/20240128_add_wishlist_feature_down.sql

# 3. Verify tables dropped
psql -U postgres -d ecommerce_prod -c "\d wishlists"

# 4. Restore from backup (if needed)
pg_restore -U postgres -d ecommerce_prod backup_before_wishlist_*.dump

# 5. Verify database state
# 6. Notify stakeholders
```

---

## Key Takeaways

1. **Low-Risk Migration**: Adding new tables is safer than modifying existing ones
2. **No Downtime**: Migration completed in < 5 seconds with no service interruption
3. **Backward Compatible**: Existing code continued working during migration
4. **Tested Thoroughly**: Tested on local, staging, and production-like data
5. **Monitored Closely**: Tracked metrics for 24 hours after deployment
6. **Rollback Ready**: Tested rollback script before production execution

---

## Next Steps

- See `optimization-example.md` for optimizing wishlist queries
- See `../rules/testing-patterns.md` for testing wishlist functionality
- See `../rules/documentation-standards.md` for documenting the migration


