# Relational Schema Design

## Overview

This document covers relational database schema design principles, including entity-relationship modeling, normalization, denormalization strategies, keys, constraints, data types, naming conventions, and schema evolution.

---

## Entity-Relationship Modeling

### Identifying Entities

**Entity**: A thing or object in the real world with independent existence

**Examples:**
- User
- Product
- Order
- Category
- Payment

**Guidelines:**
- ✅ Entities should represent distinct concepts
- ✅ Entities should have attributes
- ✅ Entities should have a unique identifier
- ❌ Avoid creating entities for simple attributes

### Identifying Relationships

**Relationship types:**
- **One-to-One (1:1)**: User ↔ Profile
- **One-to-Many (1:N)**: User → Orders
- **Many-to-Many (M:N)**: Products ↔ Categories

**Example: E-commerce ERD**
```
User (1) ──→ (N) Order
Order (1) ──→ (N) OrderItem
Product (1) ──→ (N) OrderItem
Category (1) ──→ (N) Product
Product (N) ←──→ (N) Tag  [via ProductTag junction table]
```

### Cardinality and Participation

**Cardinality**: Number of instances in relationship
- Minimum cardinality: 0 (optional) or 1 (mandatory)
- Maximum cardinality: 1 or N (many)

**Example:**
- User (1) → (0..N) Orders: User can have zero or many orders
- Order (1) → (1..N) OrderItems: Order must have at least one item

---

## Normalization

### Purpose of Normalization

**Goals:**
- ✅ Eliminate data redundancy
- ✅ Ensure data integrity
- ✅ Reduce update anomalies
- ✅ Improve data consistency

### First Normal Form (1NF)

**Rules:**
- Each column contains atomic (indivisible) values
- Each column contains values of a single type
- Each column has a unique name
- Order of rows doesn't matter

**Violation Example:**
```sql
-- ❌ NOT in 1NF (phone_numbers contains multiple values)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    phone_numbers VARCHAR(255)  -- "555-1234, 555-5678"
);
```

**1NF Solution:**
```sql
-- ✅ 1NF compliant
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE user_phones (
    id INT PRIMARY KEY,
    user_id INT REFERENCES users(id),
    phone_number VARCHAR(20)
);
```

### Second Normal Form (2NF)

**Rules:**
- Must be in 1NF
- All non-key attributes must depend on the entire primary key (no partial dependencies)

**Violation Example:**
```sql
-- ❌ NOT in 2NF (product_name depends only on product_id, not on order_id)
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(255),  -- Partial dependency
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

**2NF Solution:**
```sql
-- ✅ 2NF compliant
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT REFERENCES products(id),
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

### Third Normal Form (3NF)

**Rules:**
- Must be in 2NF
- No transitive dependencies (non-key attributes depend only on primary key)

**Violation Example:**
```sql
-- ❌ NOT in 3NF (city and state depend on zip_code, not on user_id)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    zip_code VARCHAR(10),
    city VARCHAR(100),      -- Transitive dependency
    state VARCHAR(50)       -- Transitive dependency
);
```

**3NF Solution:**
```sql
-- ✅ 3NF compliant
CREATE TABLE zip_codes (
    zip_code VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100),
    state VARCHAR(50)
);

CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    zip_code VARCHAR(10) REFERENCES zip_codes(zip_code)
);
```

### Boyce-Codd Normal Form (BCNF)

**Rules:**
- Must be in 3NF
- Every determinant must be a candidate key

**When to use:**
- Rare cases where 3NF still has anomalies
- Most applications don't need BCNF

### Normalization Trade-offs

**Advantages:**
- ✅ Reduces data redundancy
- ✅ Improves data integrity
- ✅ Easier to maintain
- ✅ Smaller database size

**Disadvantages:**
- ❌ More complex queries (more JOINs)
- ❌ Potentially slower reads
- ❌ More tables to manage

---

## Denormalization Strategies

### When to Denormalize

**Consider denormalization when:**
- ✅ Read performance is critical
- ✅ Data is read much more than written
- ✅ Complex JOINs are causing performance issues
- ✅ Aggregations are expensive
- ✅ Reporting queries are slow

**Avoid denormalization when:**
- ❌ Data changes frequently
- ❌ Data consistency is critical
- ❌ Storage space is limited
- ❌ Write performance is more important than read performance

### Denormalization Techniques

#### 1. Add Redundant Columns

**Example: Store user name in orders table**
```sql
-- Normalized (requires JOIN)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT REFERENCES users(id)
);

-- Denormalized (no JOIN needed)
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT REFERENCES users(id),
    user_name VARCHAR(255)  -- Redundant, but faster reads
);
```

#### 2. Precompute Aggregations

**Example: Store order count and total in users table**
```sql
-- Normalized (requires aggregation)
SELECT u.*, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

-- Denormalized (precomputed)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    order_count INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0
);

-- Update with triggers
CREATE TRIGGER update_user_stats
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE users
    SET order_count = order_count + 1,
        total_spent = total_spent + NEW.total
    WHERE id = NEW.user_id;
END;
```

#### 3. Materialized Views

**Example: Precompute complex aggregations**
```sql
-- PostgreSQL: Materialized view
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

-- Refresh materialized view
REFRESH MATERIALIZED VIEW user_order_stats;
```

---

## Primary and Foreign Keys

### Primary Keys

**Definition**: Unique identifier for each row in a table

**Types:**
- **Natural key**: Existing attribute (e.g., email, SSN)
- **Surrogate key**: Artificial identifier (e.g., auto-increment ID)

**Best Practices:**
- ✅ Use surrogate keys (auto-increment integers or UUIDs)
- ✅ Keep primary keys immutable
- ✅ Use smallest data type that fits
- ❌ Avoid composite primary keys unless necessary
- ❌ Avoid using business data as primary keys

**Example:**
```sql
-- Auto-increment integer (most common)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- PostgreSQL
    -- id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    name VARCHAR(255)
);

-- UUID (for distributed systems)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- PostgreSQL
    name VARCHAR(255)
);

-- Composite primary key (for junction tables)
CREATE TABLE product_tags (
    product_id INT REFERENCES products(id),
    tag_id INT REFERENCES tags(id),
    PRIMARY KEY (product_id, tag_id)
);
```

### Foreign Keys

**Definition**: Column that references primary key in another table

**Benefits:**
- ✅ Enforces referential integrity
- ✅ Prevents orphaned records
- ✅ Documents relationships

**Example:**
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- With ON DELETE and ON UPDATE actions
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id)
        ON DELETE CASCADE      -- Delete orders when user is deleted
        ON UPDATE CASCADE,     -- Update orders when user ID changes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**ON DELETE actions:**
- `CASCADE`: Delete child rows when parent is deleted
- `SET NULL`: Set foreign key to NULL when parent is deleted
- `SET DEFAULT`: Set foreign key to default value when parent is deleted
- `RESTRICT`: Prevent deletion of parent if children exist (default)
- `NO ACTION`: Same as RESTRICT

**ON UPDATE actions:**
- Same options as ON DELETE

---

## Constraints

### NOT NULL Constraint

**Ensures column cannot contain NULL values:**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT  -- Can be NULL
);
```

### UNIQUE Constraint

**Ensures column values are unique:**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL
);

-- Composite unique constraint
CREATE TABLE user_preferences (
    user_id INT REFERENCES users(id),
    preference_key VARCHAR(50),
    preference_value TEXT,
    UNIQUE (user_id, preference_key)
);
```

### CHECK Constraint

**Ensures column values meet specific conditions:**

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) CHECK (price >= 0),
    stock INT CHECK (stock >= 0),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'discontinued'))
);

-- Named constraint
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    balance DECIMAL(10, 2),
    CONSTRAINT check_positive_balance CHECK (balance >= 0)
);
```

### DEFAULT Constraint

**Provides default value for column:**

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Data Types Selection

### Numeric Types

**Integers:**
```sql
-- PostgreSQL
SMALLINT    -- -32,768 to 32,767 (2 bytes)
INTEGER     -- -2,147,483,648 to 2,147,483,647 (4 bytes)
BIGINT      -- -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 (8 bytes)

-- MySQL
TINYINT     -- -128 to 127 (1 byte)
SMALLINT    -- -32,768 to 32,767 (2 bytes)
MEDIUMINT   -- -8,388,608 to 8,388,607 (3 bytes)
INT         -- -2,147,483,648 to 2,147,483,647 (4 bytes)
BIGINT      -- -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 (8 bytes)
```

**Decimals:**
```sql
-- Fixed-point (exact)
DECIMAL(precision, scale)  -- e.g., DECIMAL(10, 2) for money
NUMERIC(precision, scale)  -- Same as DECIMAL

-- Floating-point (approximate)
REAL        -- 4 bytes
DOUBLE PRECISION  -- 8 bytes
```

**Best Practices:**
- ✅ Use DECIMAL for money (exact precision)
- ✅ Use smallest integer type that fits
- ✅ Use BIGINT for IDs in large tables
- ❌ Avoid FLOAT/REAL for financial data

### String Types

```sql
-- Fixed-length (padded with spaces)
CHAR(n)     -- e.g., CHAR(2) for state codes

-- Variable-length (up to n characters)
VARCHAR(n)  -- e.g., VARCHAR(255) for email

-- Unlimited length
TEXT        -- PostgreSQL, MySQL
```

**Best Practices:**
- ✅ Use VARCHAR for variable-length strings
- ✅ Use TEXT for long content
- ✅ Use CHAR for fixed-length codes
- ✅ Set appropriate VARCHAR length (not always 255)
- ❌ Don't use CHAR for variable-length data

### Date and Time Types

```sql
DATE        -- Date only (YYYY-MM-DD)
TIME        -- Time only (HH:MM:SS)
TIMESTAMP   -- Date and time with timezone
TIMESTAMPTZ -- Timestamp with timezone (PostgreSQL)
INTERVAL    -- Time interval (PostgreSQL)
```

**Best Practices:**
- ✅ Use TIMESTAMP for created_at/updated_at
- ✅ Use TIMESTAMPTZ for timezone-aware timestamps
- ✅ Store dates in UTC
- ❌ Don't store dates as strings

### Boolean Type

```sql
BOOLEAN     -- TRUE, FALSE, NULL
```

### JSON Types

```sql
-- PostgreSQL
JSON        -- Text-based JSON (slower)
JSONB       -- Binary JSON (faster, indexable)

-- MySQL
JSON        -- Binary JSON (MySQL 5.7+)
```

**Best Practices:**
- ✅ Use JSONB in PostgreSQL (faster and indexable)
- ✅ Use JSON for semi-structured data
- ❌ Don't use JSON for structured relational data

---

## Naming Conventions

### Table Names

**Best Practices:**
- ✅ Use plural nouns: `users`, `orders`, `products`
- ✅ Use snake_case: `order_items`, `user_preferences`
- ✅ Be descriptive: `product_categories` not `prod_cats`
- ❌ Avoid prefixes: `tbl_users` (unnecessary)

### Column Names

**Best Practices:**
- ✅ Use snake_case: `first_name`, `created_at`
- ✅ Be descriptive: `email_address` not `email_addr`
- ✅ Use consistent naming: `created_at`, `updated_at` (not `creation_date`)
- ❌ Avoid reserved words: `user`, `order`, `select`
- ❌ Don't repeat table name: `users.user_name` → `users.name`

### Primary Key Names

**Best Practices:**
- ✅ Use `id` for primary key
- ✅ Or use `{table_name}_id`: `user_id`, `order_id`

### Foreign Key Names

**Best Practices:**
- ✅ Use `{referenced_table}_id`: `user_id`, `product_id`
- ✅ Be explicit for multiple references: `author_id`, `reviewer_id`

### Index Names

**Best Practices:**
- ✅ Use `idx_{table}_{columns}`: `idx_users_email`
- ✅ Use `idx_{table}_{columns}_{type}`: `idx_users_name_gin`

### Constraint Names

**Best Practices:**
- ✅ Use `{table}_{column}_{type}`: `users_email_unique`
- ✅ Use `fk_{table}_{referenced_table}`: `fk_orders_users`
- ✅ Use `check_{table}_{column}`: `check_products_price`

---

## Schema Evolution

### Migration Strategies

**Best Practices:**
- ✅ Use migration tools (Flyway, Liquibase, Alembic, Prisma Migrate)
- ✅ Version all schema changes
- ✅ Make migrations reversible (up/down migrations)
- ✅ Test migrations in staging before production
- ✅ Include migrations in version control
- ❌ Never manually modify production schemas

### Adding Columns

**Safe approach:**
```sql
-- Add nullable column (safe, no downtime)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add column with default (may lock table)
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- PostgreSQL: Add column with default (no lock in PG 11+)
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
```

**Best Practices:**
- ✅ Add columns as nullable first
- ✅ Backfill data in separate step
- ✅ Add NOT NULL constraint after backfill
- ❌ Don't add NOT NULL columns directly (causes downtime)

### Removing Columns

**Safe approach:**
```sql
-- Step 1: Stop using column in application code
-- Step 2: Deploy application
-- Step 3: Remove column
ALTER TABLE users DROP COLUMN phone;
```

**Best Practices:**
- ✅ Remove column usage from code first
- ✅ Wait for deployment before dropping column
- ✅ Consider soft delete (rename to `deprecated_column`)
- ❌ Don't drop columns still in use

### Renaming Columns

**Safe approach:**
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);

-- Step 2: Backfill data
UPDATE users SET email_address = email;

-- Step 3: Update application to use new column
-- Step 4: Deploy application
-- Step 5: Drop old column
ALTER TABLE users DROP COLUMN email;
```

**Best Practices:**
- ✅ Use add + backfill + drop approach
- ✅ Avoid direct renames (causes downtime)
- ❌ Don't use ALTER TABLE RENAME COLUMN in production

### Changing Column Types

**Safe approach:**
```sql
-- Step 1: Add new column with new type
ALTER TABLE products ADD COLUMN price_new DECIMAL(10, 2);

-- Step 2: Backfill data
UPDATE products SET price_new = CAST(price AS DECIMAL(10, 2));

-- Step 3: Update application to use new column
-- Step 4: Deploy application
-- Step 5: Drop old column and rename new column
ALTER TABLE products DROP COLUMN price;
ALTER TABLE products RENAME COLUMN price_new TO price;
```

**Best Practices:**
- ✅ Use add + backfill + drop approach
- ✅ Test type conversion thoroughly
- ❌ Don't use ALTER TABLE ALTER COLUMN TYPE directly (locks table)

### Adding Indexes

**Safe approach:**
```sql
-- PostgreSQL: Create index concurrently (no lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- MySQL: Create index (locks table)
CREATE INDEX idx_users_email ON users(email);
```

**Best Practices:**
- ✅ Use CONCURRENTLY in PostgreSQL
- ✅ Create indexes during low-traffic periods
- ✅ Monitor index creation progress
- ❌ Don't create indexes on large tables during peak hours

### Adding Foreign Keys

**Safe approach:**
```sql
-- Step 1: Add column
ALTER TABLE orders ADD COLUMN user_id INT;

-- Step 2: Backfill data
UPDATE orders SET user_id = (SELECT id FROM users WHERE users.email = orders.user_email);

-- Step 3: Add NOT NULL constraint
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE orders ADD CONSTRAINT fk_orders_users
    FOREIGN KEY (user_id) REFERENCES users(id);
```

**Best Practices:**
- ✅ Add column first, then constraint
- ✅ Validate data before adding constraint
- ✅ Use NOT VALID in PostgreSQL for large tables
- ❌ Don't add foreign keys without validating data

---

## Schema Design Checklist

### Planning Phase

- [ ] Identify all entities and relationships
- [ ] Define cardinality and participation
- [ ] Choose primary key strategy (surrogate vs natural)
- [ ] Identify all attributes
- [ ] Determine data types
- [ ] Plan for schema evolution

### Normalization Phase

- [ ] Ensure 1NF (atomic values)
- [ ] Ensure 2NF (no partial dependencies)
- [ ] Ensure 3NF (no transitive dependencies)
- [ ] Consider BCNF if needed
- [ ] Document denormalization decisions

### Constraints Phase

- [ ] Add NOT NULL constraints
- [ ] Add UNIQUE constraints
- [ ] Add CHECK constraints
- [ ] Add DEFAULT values
- [ ] Add foreign key constraints
- [ ] Define ON DELETE/ON UPDATE actions

### Indexing Phase

- [ ] Index primary keys (automatic)
- [ ] Index foreign keys
- [ ] Index frequently queried columns
- [ ] Index columns used in JOINs
- [ ] Index columns used in WHERE clauses
- [ ] Consider composite indexes

### Documentation Phase

- [ ] Document entity relationships (ERD)
- [ ] Document constraints and their purpose
- [ ] Document denormalization decisions
- [ ] Document migration strategy
- [ ] Document naming conventions

---

## Common Schema Patterns

### Soft Delete

**Pattern: Mark records as deleted instead of removing them**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query active users
SELECT * FROM users WHERE deleted_at IS NULL;

-- Soft delete
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1;

-- Restore
UPDATE users SET deleted_at = NULL WHERE id = 1;
```

### Audit Trail

**Pattern: Track all changes to records**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT REFERENCES users(id)
);

-- Separate audit table
CREATE TABLE user_audit (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(20),  -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by INT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Polymorphic Associations

**Pattern: Associate records with multiple table types**

```sql
-- Comments can belong to posts or products
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    commentable_type VARCHAR(50),  -- 'post' or 'product'
    commentable_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Better approach: Use separate foreign keys
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id),
    product_id INT REFERENCES products(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (post_id IS NOT NULL AND product_id IS NULL) OR
        (post_id IS NULL AND product_id IS NOT NULL)
    )
);
```

### Self-Referencing Tables

**Pattern: Hierarchical data (categories, org charts)**

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query with recursive CTE
WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT id, name, parent_id, 0 AS level
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: child categories
    SELECT c.id, c.name, c.parent_id, ct.level + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, name;
```

### Many-to-Many with Attributes

**Pattern: Junction table with additional attributes**

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

-- Junction table with enrollment date and grade
CREATE TABLE enrollments (
    student_id INT REFERENCES students(id),
    course_id INT REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(2),
    PRIMARY KEY (student_id, course_id)
);
```

---

## Related Documentation

- **relational-databases.md**: Relational database fundamentals
- **relational-indexing.md**: Indexing strategies
- **relational-query-optimization.md**: Query optimization
- **relational-transactions.md**: Transaction management
- **data-migration.md**: Migration strategies
- **universal-best-practices.md**: General database best practices

