# Relational Databases

## Overview

This document covers relational database fundamentals, SQL standards, database-specific features, ACID compliance, transaction management, connection handling, and when to use relational databases.

---

## When to Use Relational Databases

### Ideal Use Cases

**Use relational databases when:**
- ✅ Data has clear relationships and structure
- ✅ ACID compliance is required
- ✅ Complex queries with JOINs are needed
- ✅ Data integrity is critical
- ✅ Transactions are essential
- ✅ Reporting and analytics are important
- ✅ Schema is relatively stable

**Examples:**
- Financial systems (banking, accounting)
- E-commerce platforms (orders, inventory)
- CRM systems (customers, contacts)
- ERP systems (resources, planning)
- Content management systems

### When to Consider Alternatives

**Consider NoSQL when:**
- ❌ Schema changes frequently
- ❌ Horizontal scaling is critical
- ❌ Data is unstructured or semi-structured
- ❌ Eventual consistency is acceptable
- ❌ Simple key-value lookups dominate
- ❌ Document-oriented data model fits better

---

## ACID Compliance

### ACID Properties

#### Atomicity

**Definition**: All operations in a transaction succeed or all fail

```sql
-- Example: Transfer money between accounts
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If either UPDATE fails, both are rolled back
COMMIT;
```

#### Consistency

**Definition**: Database remains in valid state before and after transaction

```sql
-- Example: Constraint ensures consistency
ALTER TABLE accounts ADD CONSTRAINT check_balance CHECK (balance >= 0);

-- This transaction will fail if it violates the constraint
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
COMMIT;  -- Fails if balance would go negative
```

#### Isolation

**Definition**: Concurrent transactions don't interfere with each other

**Isolation Levels** (see `relational-transactions.md` for details):
- Read Uncommitted
- Read Committed (default in most databases)
- Repeatable Read
- Serializable

#### Durability

**Definition**: Committed transactions persist even after system failure

**Implementation:**
- Write-ahead logging (WAL)
- Transaction logs
- Checkpoints
- Replication

---

## SQL Standards

### ANSI SQL Standards

**Major versions:**
- SQL-86 (SQL-87): First standard
- SQL-92: Widely adopted baseline
- SQL:1999: Added triggers, recursive queries
- SQL:2003: Added window functions, XML
- SQL:2011: Added temporal data
- SQL:2016: Added JSON support

### Standard SQL Data Types

```sql
-- Numeric types
INTEGER, SMALLINT, BIGINT
DECIMAL(precision, scale), NUMERIC(precision, scale)
REAL, DOUBLE PRECISION

-- Character types
CHAR(n), VARCHAR(n)
TEXT

-- Date/time types
DATE, TIME, TIMESTAMP
INTERVAL

-- Boolean
BOOLEAN

-- Binary
BLOB, BYTEA
```

### Standard SQL Syntax

```sql
-- SELECT statement
SELECT column1, column2
FROM table1
JOIN table2 ON table1.id = table2.foreign_id
WHERE condition
GROUP BY column1
HAVING aggregate_condition
ORDER BY column1 DESC
LIMIT 10 OFFSET 20;

-- INSERT statement
INSERT INTO table_name (column1, column2)
VALUES (value1, value2);

-- UPDATE statement
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;

-- DELETE statement
DELETE FROM table_name
WHERE condition;
```

---

## Database-Specific Features

### PostgreSQL

**Strengths:**
- Advanced data types (JSON, JSONB, arrays, hstore)
- Full-text search
- Geospatial data (PostGIS)
- Advanced indexing (GiST, GIN, BRIN)
- Window functions
- CTEs and recursive queries
- MVCC (Multi-Version Concurrency Control)
- Extensibility (custom functions, types, operators)

**Example: JSONB**
```sql
-- PostgreSQL: Store and query JSON data
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    attributes JSONB
);

INSERT INTO products (name, attributes)
VALUES ('Laptop', '{"brand": "Dell", "ram": "16GB", "storage": "512GB SSD"}');

-- Query JSON fields
SELECT * FROM products
WHERE attributes->>'brand' = 'Dell';

-- Index JSON fields
CREATE INDEX idx_products_brand ON products USING GIN ((attributes->'brand'));
```

**Example: Arrays**
```sql
-- PostgreSQL: Array data type
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    tags TEXT[]
);

INSERT INTO posts (title, tags)
VALUES ('Database Guide', ARRAY['database', 'sql', 'postgresql']);

-- Query arrays
SELECT * FROM posts WHERE 'postgresql' = ANY(tags);
```

**Example: Full-Text Search**
```sql
-- PostgreSQL: Full-text search
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    search_vector tsvector
);

-- Create GIN index for full-text search
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Update search vector
UPDATE articles
SET search_vector = to_tsvector('english', title || ' ' || content);

-- Search
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'database & optimization');
```

### MySQL

**Strengths:**
- High performance for read-heavy workloads
- Replication (master-slave, master-master)
- Storage engines (InnoDB, MyISAM)
- Partitioning
- Full-text search
- JSON support (MySQL 5.7+)

**Example: Storage Engines**
```sql
-- MySQL: InnoDB (default, supports transactions)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- MySQL: MyISAM (faster reads, no transactions)
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM;
```

**Example: JSON**
```sql
-- MySQL: JSON data type
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    preferences JSON
);

INSERT INTO users (name, preferences)
VALUES ('John', '{"theme": "dark", "language": "en"}');

-- Query JSON
SELECT * FROM users
WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark';
```

### SQL Server

**Strengths:**
- Integration with Microsoft ecosystem
- Advanced analytics (SQL Server Analysis Services)
- Reporting (SQL Server Reporting Services)
- Integration Services (ETL)
- Columnstore indexes
- In-memory OLTP
- Temporal tables

**Example: Temporal Tables**
```sql
-- SQL Server: System-versioned temporal table
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name NVARCHAR(255),
    salary DECIMAL(10, 2),
    valid_from DATETIME2 GENERATED ALWAYS AS ROW START,
    valid_to DATETIME2 GENERATED ALWAYS AS ROW END,
    PERIOD FOR SYSTEM_TIME (valid_from, valid_to)
) WITH (SYSTEM_VERSIONING = ON);

-- Query historical data
SELECT * FROM employees
FOR SYSTEM_TIME AS OF '2024-01-01';
```

### SQLite

**Strengths:**
- Embedded database (no server)
- Zero configuration
- Single file database
- Cross-platform
- ACID compliant
- Small footprint

**Use cases:**
- Mobile applications
- Desktop applications
- Embedded systems
- Testing and development
- Small to medium websites

**Example:**
```sql
-- SQLite: Create database (single file)
-- No server setup required

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

INSERT INTO settings (key, value)
VALUES ('theme', 'dark');
```

---

## Transaction Isolation Levels

### Overview

**Isolation levels** control how transactions interact with each other.

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|-----------|---------------------|--------------|
| Read Uncommitted | Yes | Yes | Yes |
| Read Committed | No | Yes | Yes |
| Repeatable Read | No | No | Yes |
| Serializable | No | No | No |

### Setting Isolation Level

```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- SQL Server
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**See `relational-transactions.md` for detailed transaction management.**

---

## Connection Management

### Connection Pooling

**Why use connection pooling:**
- ✅ Reduces connection overhead
- ✅ Improves performance
- ✅ Limits concurrent connections
- ✅ Reuses existing connections

**Example: Node.js (pg pool)**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'myuser',
  password: 'mypassword',
  max: 20,                // Maximum pool size
  idleTimeoutMillis: 30000,  // Close idle clients after 30s
  connectionTimeoutMillis: 2000  // Return error after 2s if no connection available
});

// Use connection from pool
async function getUser(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } finally {
    client.release();  // Return connection to pool
  }
}
```

**Example: Python (SQLAlchemy)**
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    'postgresql://user:password@localhost/mydb',
    poolclass=QueuePool,
    pool_size=10,           # Number of connections to maintain
    max_overflow=20,        # Maximum overflow connections
    pool_timeout=30,        # Timeout for getting connection
    pool_recycle=3600       # Recycle connections after 1 hour
)

# Use connection
with engine.connect() as conn:
    result = conn.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = result.fetchone()
```

### Connection Best Practices

**DO:**
- ✅ Use connection pooling
- ✅ Set appropriate pool size (typically 10-20)
- ✅ Set connection timeouts
- ✅ Close connections when done
- ✅ Handle connection errors gracefully
- ✅ Monitor connection pool metrics

**DON'T:**
- ❌ Create new connection for each query
- ❌ Leave connections open indefinitely
- ❌ Set pool size too high (wastes resources)
- ❌ Set pool size too low (causes bottlenecks)
- ❌ Ignore connection pool exhaustion

---

## ORM vs Raw SQL

### Object-Relational Mapping (ORM)

**Advantages:**
- ✅ Database abstraction
- ✅ Type safety
- ✅ Automatic migrations
- ✅ Reduced boilerplate
- ✅ Protection against SQL injection

**Disadvantages:**
- ❌ Performance overhead
- ❌ Complex queries can be difficult
- ❌ Learning curve
- ❌ Less control over SQL

**Example: Prisma (TypeScript)**
```typescript
// Define schema
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}

// Query with ORM
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { posts: true }
});
```

**Example: SQLAlchemy (Python)**
```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
    posts = relationship('Post', back_populates='author')

class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(String)
    author_id = Column(Integer, ForeignKey('users.id'))
    author = relationship('User', back_populates='posts')

# Query with ORM
user = session.query(User).filter_by(email='user@example.com').first()
```

### Raw SQL

**Advantages:**
- ✅ Full control over queries
- ✅ Better performance for complex queries
- ✅ Database-specific features
- ✅ Easier to optimize

**Disadvantages:**
- ❌ More boilerplate code
- ❌ SQL injection risk (if not using prepared statements)
- ❌ Database-specific syntax
- ❌ Manual type mapping

**Example: Raw SQL with Prepared Statements**
```javascript
// Node.js (pg)
const result = await client.query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Python (psycopg2)
cursor.execute(
  'SELECT * FROM users WHERE email = %s',
  ('user@example.com',)
)
```

### When to Use Each

**Use ORM when:**
- ✅ Building CRUD applications
- ✅ Schema changes frequently
- ✅ Team prefers type safety
- ✅ Simple to moderate queries
- ✅ Database abstraction is valuable

**Use Raw SQL when:**
- ✅ Complex queries with multiple JOINs
- ✅ Performance is critical
- ✅ Using database-specific features
- ✅ Reporting and analytics queries
- ✅ Bulk operations

**Hybrid Approach:**
- Use ORM for most queries
- Use raw SQL for complex/performance-critical queries
- Most ORMs support raw SQL queries

---

## Common Patterns

### Repository Pattern

**Encapsulate database access logic:**

```typescript
// TypeScript: Repository pattern
interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: number, user: UpdateUserDto): Promise<User>;
  delete(id: number): Promise<void>;
}

class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(user: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async update(id: number, user: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: user });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
```

### Unit of Work Pattern

**Manage transactions across multiple operations:**

```typescript
// TypeScript: Unit of Work pattern
class UnitOfWork {
  constructor(private prisma: PrismaClient) {}

  async execute<T>(work: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return work(tx);
    });
  }
}

// Usage
const uow = new UnitOfWork(prisma);
await uow.execute(async (tx) => {
  const user = await tx.user.create({ data: { email: 'user@example.com' } });
  await tx.post.create({ data: { title: 'First Post', authorId: user.id } });
});
```

### Query Builder Pattern

**Build queries programmatically:**

```typescript
// TypeScript: Query builder (Knex.js)
const users = await knex('users')
  .select('id', 'name', 'email')
  .where('status', 'active')
  .andWhere('created_at', '>', '2024-01-01')
  .orderBy('created_at', 'desc')
  .limit(10);
```

---

## Best Practices

### General Guidelines

**DO:**
- ✅ Use prepared statements to prevent SQL injection
- ✅ Use connection pooling
- ✅ Index foreign keys
- ✅ Use transactions for multi-step operations
- ✅ Handle errors gracefully
- ✅ Monitor query performance
- ✅ Use appropriate data types
- ✅ Normalize data (see `relational-schema-design.md`)
- ✅ Document complex queries

**DON'T:**
- ❌ Concatenate user input into SQL queries
- ❌ Use SELECT * in production code
- ❌ Create indexes on every column
- ❌ Ignore transaction isolation levels
- ❌ Store sensitive data unencrypted
- ❌ Use NOLOCK hint without understanding implications

### Performance Tips

- ✅ Use EXPLAIN/EXPLAIN ANALYZE to understand query plans
- ✅ Create indexes on frequently queried columns
- ✅ Avoid N+1 queries (use JOINs or batch loading)
- ✅ Use pagination for large result sets
- ✅ Cache frequently accessed data
- ✅ Use database-specific optimizations

**See `performance-optimization.md` for detailed performance guidelines.**

---

## Related Documentation

- **relational-schema-design.md**: Schema design and normalization
- **relational-indexing.md**: Indexing strategies
- **relational-query-optimization.md**: Query optimization
- **relational-transactions.md**: Transaction management
- **security-standards.md**: Database security
- **performance-optimization.md**: Performance tuning
```

