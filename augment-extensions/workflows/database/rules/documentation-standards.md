# Database Documentation Standards

## Purpose

Establish standards for documenting database schemas, migrations, queries, and design decisions.

---

## Core Principles

1. **Document Why, Not What**: Code shows what; documentation explains why
2. **Keep Documentation Close**: Store docs near the code they describe
3. **Update Documentation with Changes**: Outdated docs are worse than no docs
4. **Use Standard Formats**: Follow consistent documentation patterns
5. **Make Documentation Discoverable**: Easy to find and navigate

---

## Schema Documentation

### Table Documentation

**What to Document**:
- Purpose of the table
- Key relationships
- Important constraints
- Performance considerations
- Data retention policies

**Format** (SQL comments):
```sql
-- Users table
-- Stores user account information and authentication credentials.
-- Related tables: user_profiles, user_sessions, orders
-- Indexes: idx_users_email (for login lookups), idx_users_created_at (for analytics)
-- Retention: User data retained indefinitely unless user requests deletion
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Email must be unique for authentication
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Created_at index for analytics queries (user growth over time)
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Format** (Markdown documentation):
```markdown
# Users Table

## Purpose
Stores user account information and authentication credentials.

## Schema
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email (used for login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

## Relationships
- **One-to-One**: `user_profiles` (extended user information)
- **One-to-Many**: `user_sessions` (active login sessions)
- **One-to-Many**: `orders` (user purchase history)

## Indexes
- `idx_users_email` (UNIQUE): Fast email lookups for authentication
- `idx_users_created_at`: Analytics queries for user growth over time

## Data Retention
User data retained indefinitely unless user requests deletion (GDPR compliance).

## Performance Notes
- Email lookups are O(log n) due to unique index
- Avoid full table scans; always filter by id or email
```

### Column Documentation

**What to Document**:
- Purpose of the column
- Valid values or ranges
- Business rules
- Calculation logic (for computed columns)

**Example**:
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  
  -- Order status: pending, processing, shipped, delivered, cancelled
  -- Transitions: pending -> processing -> shipped -> delivered
  --              pending -> cancelled, processing -> cancelled
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Total order amount in cents (to avoid floating point errors)
  -- Calculated as: SUM(order_items.quantity * order_items.price_at_purchase)
  total_cents INTEGER NOT NULL,
  
  -- Timestamp when order was placed (immutable)
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Timestamp of last status change
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Migration Documentation

### Migration File Header

**What to Document**:
- Purpose of the migration
- Related ticket/issue
- Breaking changes
- Rollback considerations
- Estimated execution time

**Example**:
```sql
-- Migration: Add email verification
-- Date: 2024-01-15
-- Author: AI Agent
-- Issue: bd-dbmod.5
-- 
-- Purpose: Add email_verified column to track email verification status
-- 
-- Breaking Changes: None (column is nullable with default value)
-- 
-- Rollback: Safe to rollback; column will be dropped
-- 
-- Estimated Execution Time: < 1 second (table has ~10k rows)
-- 
-- Dependencies: None

-- UP Migration
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.email_verified IS 
  'Whether user has verified their email address. Default FALSE for new users.';

-- DOWN Migration (Rollback)
-- ALTER TABLE users DROP COLUMN email_verified;
```

### Migration Changelog

**Purpose**: Track all migrations in chronological order

**Format** (CHANGELOG.md):
```markdown
# Database Migration Changelog

## 2024-01-15: Add Email Verification
- **Migration**: `20240115_add_email_verified.sql`
- **Issue**: bd-dbmod.5
- **Changes**: Added `email_verified` column to `users` table
- **Impact**: No breaking changes; backward compatible
- **Rollback**: Safe to rollback

## 2024-01-10: Create Orders Table
- **Migration**: `20240110_create_orders.sql`
- **Issue**: bd-dbmod.3
- **Changes**: Created `orders` and `order_items` tables
- **Impact**: New tables; no impact on existing code
- **Rollback**: Safe to rollback if no orders created
```

---

## Query Documentation

### Complex Query Documentation

**What to Document**:
- Purpose of the query
- Performance characteristics
- Assumptions and limitations
- Example usage

**Example**:
```sql
-- Get top 10 customers by total order value in the last 30 days
-- 
-- Performance: Uses idx_orders_created_at and idx_orders_user_id
-- Expected execution time: < 100ms for ~100k orders
-- 
-- Assumptions:
-- - Orders table has created_at index
-- - Total_cents is accurate (no refunds deducted)
-- 
-- Limitations:
-- - Does not account for cancelled orders
-- - Does not account for refunds
-- 
-- Example usage:
-- SELECT * FROM top_customers_last_30_days;

CREATE VIEW top_customers_last_30_days AS
SELECT 
  u.id,
  u.email,
  u.name,
  COUNT(o.id) AS order_count,
  SUM(o.total_cents) / 100.0 AS total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE 
  o.created_at >= NOW() - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY u.id, u.email, u.name
ORDER BY total_spent DESC
LIMIT 10;
```

---

## Design Decision Documentation

### Architecture Decision Records (ADRs)

**Purpose**: Document important database design decisions

**Format**:
```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need to select a database for our e-commerce application. Requirements:
- Strong consistency for financial transactions
- Complex queries for analytics
- ACID compliance
- Mature ecosystem

## Decision
Use PostgreSQL as the primary database.

## Consequences

### Positive
- Strong ACID guarantees for transactions
- Rich query capabilities (JSON, full-text search, etc.)
- Excellent performance for our scale (< 1M users)
- Large community and ecosystem

### Negative
- Vertical scaling limitations (will need sharding at very large scale)
- More complex than NoSQL for simple key-value operations

## Alternatives Considered
- **MySQL**: Similar capabilities, but PostgreSQL has better JSON support
- **MongoDB**: Better for unstructured data, but lacks ACID guarantees
- **DynamoDB**: Excellent scalability, but limited query capabilities
```

---

## Documentation Locations

### Where to Store Documentation

**1. SQL Comments** (for schema):
- Table and column comments
- Index purposes
- Constraint explanations

**2. Migration Files** (for changes):
- Migration headers
- Rollback instructions
- Impact analysis

**3. README.md** (for overview):
- Database setup instructions
- Schema overview
- Common queries

**4. docs/database/** (for detailed docs):
- Schema documentation
- ADRs
- Query guides
- Performance tuning

**5. Code Comments** (for application code):
- Query explanations
- Transaction boundaries
- Performance notes

---

## AI Prompt Templates

### Documenting a Schema

```
Document this database schema:

[paste schema]

Please create comprehensive documentation including:
- Table purposes and relationships
- Column descriptions
- Index purposes
- Performance considerations
- Data retention policies

Format: [SQL comments / Markdown table]
```

### Documenting a Migration

```
Create documentation for this migration:

[paste migration SQL]

Please include:
- Purpose and context
- Breaking changes (if any)
- Rollback considerations
- Estimated execution time
- Dependencies

Format: SQL comment header
```

