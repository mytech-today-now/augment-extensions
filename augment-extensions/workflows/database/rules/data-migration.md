# Data Migration Workflow

## Purpose

Provide structured guidance for safely migrating database schema and data changes with minimal downtime and risk.

---

## Core Principles

1. **Safety First**: Always have a rollback plan
2. **Zero Downtime**: Design migrations to run without service interruption
3. **Backward Compatibility**: Ensure old code works during migration
4. **Incremental Changes**: Break large migrations into smaller steps
5. **Test Thoroughly**: Test migrations on production-like data
6. **Monitor Closely**: Watch for issues during and after migration

---

## Migration Types

### 1. Schema Migrations

**Adding Columns**:
- Add column as nullable or with default value
- Backfill data if needed (separate step)
- Add constraints after backfill

**Removing Columns**:
- Stop writing to column (deploy code first)
- Wait for old code to drain
- Remove column (separate migration)

**Renaming Columns**:
- Create new column
- Dual-write to both columns
- Backfill old data to new column
- Switch reads to new column
- Stop writing to old column
- Remove old column

**Changing Column Types**:
- Create new column with new type
- Dual-write and transform data
- Backfill old data
- Switch reads to new column
- Remove old column

### 2. Data Migrations

**Backfilling Data**:
- Process in batches (avoid locking entire table)
- Use idempotent operations (safe to retry)
- Add progress tracking
- Handle failures gracefully

**Data Transformations**:
- Validate data before transformation
- Transform in batches
- Verify transformation correctness
- Keep audit trail

### 3. Index Migrations

**Adding Indexes**:
- Use concurrent index creation (PostgreSQL: `CREATE INDEX CONCURRENTLY`)
- Monitor index build progress
- Verify index is used by queries

**Removing Indexes**:
- Verify index is not used (check query plans)
- Remove index
- Monitor query performance

---

## Migration Workflow

### Step 1: Plan Migration

**Questions to Answer**:
- What is changing? (schema, data, indexes)
- What is the impact? (downtime, performance, data loss risk)
- What is the rollback strategy?
- What are the dependencies? (code changes, other migrations)
- What is the timeline? (when to execute, how long will it take)

**Output**: Migration plan document

### Step 2: Create Migration Scripts

**Up Migration**:
```sql
-- Example: Add column with default value
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Example: Create index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Down Migration** (Rollback):
```sql
-- Example: Remove column
ALTER TABLE users DROP COLUMN email_verified;

-- Example: Drop index
DROP INDEX idx_users_email;
```

**Best Practices**:
- Make migrations idempotent (safe to run multiple times)
- Use transactions where appropriate
- Add comments explaining the change
- Include timing estimates

### Step 3: Test Migration

**Test Environments**:
1. **Local**: Test on local development database
2. **Staging**: Test on production-like data and load
3. **Production Clone**: Test on actual production data (if possible)

**Test Scenarios**:
- Migration succeeds
- Migration can be rolled back
- Application works during migration
- Application works after migration
- Performance is acceptable

### Step 4: Execute Migration

**Pre-Migration Checklist**:
- [ ] Backup database
- [ ] Verify rollback plan
- [ ] Schedule maintenance window (if needed)
- [ ] Notify stakeholders
- [ ] Prepare monitoring dashboards

**Execution Steps**:
1. Start monitoring (database metrics, application metrics)
2. Run migration script
3. Verify migration success (check schema, data, indexes)
4. Monitor application behavior
5. If issues: execute rollback plan
6. If success: mark migration as complete

**Post-Migration**:
- Verify data integrity
- Check application logs for errors
- Monitor performance metrics
- Document any issues encountered

---

## Zero-Downtime Migration Strategies

### Expand-Contract Pattern

**Phase 1: Expand** (add new schema elements)
- Add new columns/tables
- Deploy code that writes to both old and new schema
- Backfill data to new schema

**Phase 2: Contract** (remove old schema elements)
- Deploy code that reads from new schema only
- Stop writing to old schema
- Remove old columns/tables

### Blue-Green Database Migration

**Setup**:
- Create new database (green) with new schema
- Keep old database (blue) running

**Migration**:
- Replicate data from blue to green
- Switch application to green database
- Keep blue as backup

### Online Schema Change Tools

**Tools**:
- **PostgreSQL**: `pg_repack`, `pgslice`
- **MySQL**: `pt-online-schema-change`, `gh-ost`
- **MongoDB**: Built-in online schema changes

---

## Common Pitfalls

❌ **Running long migrations without batching**: Locks tables, causes downtime
✅ **Solution**: Process in small batches with delays

❌ **Not testing rollback**: Rollback fails when needed
✅ **Solution**: Test rollback in staging environment

❌ **Deploying code and migration together**: Code expects new schema before migration runs
✅ **Solution**: Deploy backward-compatible code first, then migrate

❌ **Not monitoring during migration**: Issues go unnoticed
✅ **Solution**: Set up alerts and watch dashboards

❌ **Forgetting to backfill data**: New column has NULL values
✅ **Solution**: Plan backfill as separate step after adding column

---

## AI Prompt Templates

### Planning a Migration

```
I need to plan a database migration for [describe change].

Current schema:
[paste current schema]

Desired schema:
[paste desired schema]

Constraints:
- Zero downtime required: [yes/no]
- Backward compatibility needed: [yes/no]
- Data volume: [number of rows]

Please create a migration plan with:
1. Step-by-step migration strategy
2. Up and down migration scripts
3. Rollback plan
4. Testing checklist
```

### Creating Migration Scripts

```
Create migration scripts for [describe change].

Database: [PostgreSQL/MySQL/etc.]
Current schema: [paste schema]
Desired change: [describe change]

Requirements:
- Idempotent (safe to run multiple times)
- Include rollback script
- Add comments
- Estimate execution time
```

