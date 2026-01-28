# Migration Workflow

## Purpose

Provide structured guidance for safely planning, executing, and managing database migrations with minimal downtime and risk.

---

## Core Principles

1. **Safety First**: Always have a tested rollback plan
2. **Zero Downtime**: Design migrations to run without service interruption
3. **Backward Compatibility**: Ensure old code works during migration
4. **Incremental Changes**: Break large migrations into smaller, safer steps
5. **Test Thoroughly**: Test migrations on production-like data volumes
6. **Monitor Closely**: Watch for issues during and after migration execution

---

## Migration Workflow

### Step 1: Plan the Migration

**Purpose**: Understand the change, assess impact, and plan execution strategy

**Questions to Answer**:
- What is changing? (schema, data, indexes, constraints)
- What is the impact? (downtime, performance, data loss risk)
- What is the rollback strategy?
- What are the dependencies? (code changes, other migrations)
- What is the timeline? (when to execute, estimated duration)
- What is the data volume? (affects execution time and strategy)

**Output**: Migration plan document with strategy and timeline

**AI Prompt Template**:
```
Plan a database migration for [describe change].

Current schema:
[paste current schema]

Desired schema:
[paste desired schema or describe changes]

Constraints:
- Zero downtime required: [yes/no]
- Backward compatibility needed: [yes/no]
- Data volume: [number of rows]
- Database: [type and version]

Please create a migration plan with:
1. Step-by-step migration strategy
2. Impact analysis
3. Rollback plan
4. Testing checklist
5. Estimated execution time
```

### Step 2: Create Migration Scripts

**Purpose**: Write executable migration scripts with rollback capability

**Up Migration** (apply changes):
```sql
-- Migration: Add email verification
-- Date: 2024-01-28
-- Author: AI Agent
-- Issue: bd-dbmod.32
-- 
-- Purpose: Add email_verified column to track email verification status
-- Breaking Changes: None (column is nullable with default value)
-- Rollback: Safe to rollback; column will be dropped
-- Estimated Execution Time: < 1 second (table has ~10k rows)

-- UP Migration
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_users_email_verified ON users(email_verified)
WHERE email_verified = FALSE;
```

**Down Migration** (rollback):
```sql
-- DOWN Migration
DROP INDEX IF EXISTS idx_users_email_verified;
ALTER TABLE users DROP COLUMN email_verified;
```

**Best Practices**:
- Make scripts idempotent (safe to run multiple times)
- Add comprehensive comments
- Include rollback scripts
- Estimate execution time
- Use transactions where appropriate

**AI Prompt Template**:
```
Create migration scripts for [describe change].

Database: [PostgreSQL/MySQL/MongoDB/etc.]
Current schema: [paste schema]
Desired change: [describe change]

Requirements:
- Idempotent (safe to run multiple times)
- Include rollback script
- Add detailed comments
- Estimate execution time
- Use appropriate indexes

Please generate up and down migration scripts.
```

### Step 3: Test the Migration

**Purpose**: Validate migration works correctly and safely

**Testing Checklist**:
- [ ] Test on local development database
- [ ] Test on staging with production-like data volume
- [ ] Test rollback script works correctly
- [ ] Verify data integrity after migration
- [ ] Check application still works during migration
- [ ] Measure actual execution time
- [ ] Test edge cases (NULL values, duplicates, etc.)

**Test Environments**:
1. **Local**: Quick validation of syntax and logic
2. **Staging**: Production-like data volume and configuration
3. **Canary**: Small subset of production (if available)

**Output**: Validated migration scripts ready for production

### Step 4: Execute the Migration

**Purpose**: Apply migration to production database safely

**Pre-Migration Checklist**:
- [ ] Backup database (full backup or snapshot)
- [ ] Verify rollback plan is tested
- [ ] Schedule maintenance window (if downtime needed)
- [ ] Notify stakeholders of migration
- [ ] Prepare monitoring dashboards
- [ ] Review execution plan one final time

**Execution Steps**:
1. Start monitoring (database metrics, application metrics, error logs)
2. Begin migration execution
3. Monitor progress (for long-running migrations)
4. Verify migration success (check schema, data, indexes)
5. Monitor application behavior
6. If issues detected: execute rollback plan immediately
7. If success: mark migration as complete

**Post-Migration**:
- Verify data integrity (row counts, checksums)
- Check application logs for errors
- Monitor performance metrics (query times, resource usage)
- Document any issues encountered
- Update migration status in tracking system

---

## Zero-Downtime Migration Strategies

### Expand-Contract Pattern

**Best for**: Schema changes that need backward compatibility

**Phase 1: Expand** (add new schema elements)
1. Add new columns/tables alongside old ones
2. Deploy code that writes to both old and new schema
3. Backfill data to new schema (in batches)
4. Verify data consistency

**Phase 2: Contract** (remove old schema elements)
1. Deploy code that reads from new schema only
2. Stop writing to old schema
3. Remove old columns/tables
4. Clean up migration code

**Example**: Renaming a column
- Expand: Add `email_address` column, write to both `email` and `email_address`
- Contract: Remove `email` column after all code uses `email_address`

### Online Schema Change Tools

**PostgreSQL**:
- `CREATE INDEX CONCURRENTLY` - Non-blocking index creation
- `pg_repack` - Online table reorganization
- `pgslice` - Partition management

**MySQL**:
- `pt-online-schema-change` (Percona Toolkit)
- `gh-ost` (GitHub's online schema migration)
- `ALTER TABLE ... ALGORITHM=INPLACE`

**MongoDB**:
- Built-in online schema changes
- Background index creation

### Batched Data Migrations

**Best for**: Large data updates or backfills

**Strategy**:
```sql
-- Process in batches to avoid long locks
DO $$
DECLARE
  batch_size INT := 1000;
  processed INT := 0;
BEGIN
  LOOP
    UPDATE users
    SET email_verified = FALSE
    WHERE email_verified IS NULL
    AND id IN (
      SELECT id FROM users
      WHERE email_verified IS NULL
      LIMIT batch_size
    );

    GET DIAGNOSTICS processed = ROW_COUNT;
    EXIT WHEN processed = 0;

    -- Small delay between batches
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

---

## Common Migration Patterns

### Adding a Column

**Safe Pattern**:
```sql
-- 1. Add column as nullable with default
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- 2. Backfill existing rows (if needed)
UPDATE users SET status = 'active' WHERE status IS NULL;

-- 3. Add NOT NULL constraint (optional, after backfill)
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
```

### Renaming a Column

**Safe Pattern** (Expand-Contract):
```sql
-- Phase 1: Expand
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);
UPDATE users SET email_address = email;
-- Deploy code that writes to both columns

-- Phase 2: Contract (after code deployment)
ALTER TABLE users DROP COLUMN email;
```

### Adding an Index

**Safe Pattern**:
```sql
-- PostgreSQL: Non-blocking index creation
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- MySQL: Online DDL
ALTER TABLE users ADD INDEX idx_users_email (email), ALGORITHM=INPLACE, LOCK=NONE;
```

### Changing Column Type

**Safe Pattern**:
```sql
-- 1. Add new column with new type
ALTER TABLE users ADD COLUMN age_new INTEGER;

-- 2. Backfill data with conversion
UPDATE users SET age_new = CAST(age AS INTEGER);

-- 3. Verify data integrity
SELECT COUNT(*) FROM users WHERE age_new IS NULL AND age IS NOT NULL;

-- 4. Drop old column, rename new column
ALTER TABLE users DROP COLUMN age;
ALTER TABLE users RENAME COLUMN age_new TO age;
```

---

## Common Pitfalls

❌ **Running long migrations without batching**: Locks tables, causes downtime
✅ **Solution**: Process in small batches with delays between batches

❌ **Not testing rollback**: Rollback fails when needed in production
✅ **Solution**: Test rollback in staging environment before production

❌ **Deploying code and migration together**: Code expects new schema before migration runs
✅ **Solution**: Deploy backward-compatible code first, then migrate schema

❌ **Not monitoring during migration**: Issues go unnoticed until too late
✅ **Solution**: Set up alerts and watch dashboards during execution

❌ **Forgetting to backfill data**: New column has NULL values for existing rows
✅ **Solution**: Plan backfill as separate step after adding column

❌ **Adding NOT NULL constraint immediately**: Fails if any NULL values exist
✅ **Solution**: Add column as nullable, backfill, then add constraint

---

## Best Practices

### DO

✅ Always create rollback scripts
✅ Test migrations on production-like data volumes
✅ Use transactions for atomic changes
✅ Monitor database metrics during migration
✅ Document migration purpose and impact
✅ Version control all migration scripts
✅ Use idempotent scripts (safe to re-run)
✅ Estimate execution time before running

### DON'T

❌ Make schema changes directly in production
❌ Skip testing rollback procedures
❌ Deploy code and schema changes simultaneously
❌ Run migrations without backups
❌ Ignore database locks and blocking
❌ Forget to communicate with stakeholders
❌ Use production as testing environment

---

## Next Steps

- See `data-migration.md` for detailed data migration strategies
- See `optimization-workflow.md` for post-migration optimization
- See `testing-patterns.md` for migration testing approaches
- See `documentation-standards.md` for documenting migrations
- See `../examples/migration-example.md` for complete migration example


