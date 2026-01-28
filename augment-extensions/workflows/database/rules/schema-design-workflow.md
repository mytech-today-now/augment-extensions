# Schema Design Workflow

## Purpose

Provide structured guidance for designing optimal database schemas across different database types (relational, NoSQL, vector, flat).

---

## Core Principles

1. **Design for Access Patterns**: Optimize for how data will be queried, not just how it's structured
2. **Balance Normalization**: Find the right balance between normalization and query performance
3. **Plan for Growth**: Design schemas that can scale with data volume and complexity
4. **Enforce Constraints**: Use database constraints to maintain data integrity
5. **Document Decisions**: Record why design choices were made

---

## Schema Design Workflow

```
┌─────────────────────┐
│ Gather Requirements │
│ Identify entities   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Model Entities      │
│ Define attributes   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Map Relationships   │
│ Define associations │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Apply Normalization │
│ Or denormalization  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Define Constraints  │
│ Validation rules    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Plan Indexes        │
│ Query optimization  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Review & Validate   │
│ Check design        │
└─────────────────────┘
```

---

## Step 1: Gather Requirements

**Questions to Answer**:

1. **What entities exist in the domain?**
   - Users, products, orders, etc.
   - What are the core business objects?

2. **What attributes does each entity have?**
   - User: id, email, name, created_at
   - Product: id, name, price, inventory

3. **What are the relationships between entities?**
   - User has many Orders
   - Order has many OrderItems
   - Product belongs to Category

4. **What are the common query patterns?**
   - Find user by email
   - Get all orders for a user
   - Search products by category
   - Calculate total sales by month

5. **What are the data volume expectations?**
   - Number of users: 10K, 100K, 1M+
   - Number of transactions per day
   - Growth rate

6. **What are the consistency requirements?**
   - Strong consistency (ACID) needed?
   - Eventual consistency acceptable?
   - Real-time updates required?

**Output**: Requirements document with entities, relationships, and query patterns

**AI Prompt Template**:
```
Help me gather requirements for a database schema for [application type].

**Domain**: [e-commerce, social media, analytics, etc.]

**Known Entities**: [list entities if known]

**Key Features**:
- [Feature 1]
- [Feature 2]

Please help me identify:
1. All entities and their attributes
2. Relationships between entities
3. Common query patterns
4. Data volume expectations
5. Consistency requirements
```

---

## Step 2: Model Entities

**For Each Entity, Define**:

1. **Entity Name**: Clear, singular noun (User, Product, Order)
2. **Attributes**: All properties with data types
3. **Primary Key**: Unique identifier
4. **Required vs Optional**: Which fields are mandatory
5. **Data Types**: String, integer, date, boolean, etc.
6. **Default Values**: Sensible defaults where applicable

**Example Entity Model**:

```
Entity: User
- id: UUID (primary key)
- email: String (required, unique)
- name: String (required)
- password_hash: String (required)
- email_verified: Boolean (default: false)
- created_at: Timestamp (default: now)
- updated_at: Timestamp (default: now)
- last_login_at: Timestamp (optional)
```

**Output**: Entity models with all attributes and types

---

## Step 3: Map Relationships

**Relationship Types**:

1. **One-to-One** (1:1)
   - User has one Profile
   - Profile belongs to one User

2. **One-to-Many** (1:N)
   - User has many Orders
   - Order belongs to one User

3. **Many-to-Many** (M:N)
   - Product has many Categories
   - Category has many Products
   - Requires join table: ProductCategories

**Relationship Mapping**:

For each relationship, define:
- **Parent Entity**: The "one" side
- **Child Entity**: The "many" side
- **Foreign Key**: Column linking child to parent
- **Cascade Rules**: What happens on delete/update
- **Optionality**: Required or optional relationship

**Example Relationships**:

```
User (1) ──< Orders (N)
- Foreign key: orders.user_id → users.id
- Cascade: ON DELETE CASCADE (delete orders when user deleted)
- Required: Yes (order must have a user)

Product (M) ──< ProductCategories >── Category (N)
- Join table: product_categories
- Foreign keys:
  - product_categories.product_id → products.id
  - product_categories.category_id → categories.id
- Cascade: ON DELETE CASCADE
```

**Output**: Entity Relationship Diagram (ERD) or relationship documentation

---

## Step 4: Apply Normalization (Relational) or Denormalization (NoSQL)

### For Relational Databases: Normalize

**Normalization Levels**:

**1NF (First Normal Form)**:
- Eliminate repeating groups
- Each cell contains atomic values
- Each row is unique

**2NF (Second Normal Form)**:
- Meet 1NF requirements
- Remove partial dependencies
- All non-key attributes depend on entire primary key

**3NF (Third Normal Form)**:
- Meet 2NF requirements
- Remove transitive dependencies
- Non-key attributes depend only on primary key

**When to Denormalize**:
- Read-heavy workloads with expensive joins
- Reporting and analytics queries
- Caching frequently accessed data
- After measuring performance issues

### For NoSQL Databases: Denormalize

**Denormalization Strategies**:

1. **Embed Related Data**:
   ```json
   {
     "user_id": "123",
     "name": "John Doe",
     "orders": [
       {"order_id": "456", "total": 99.99},
       {"order_id": "789", "total": 149.99}
     ]
   }
   ```

2. **Reference Large or Frequently Updated Data**:
   ```json
   {
     "user_id": "123",
     "name": "John Doe",
     "order_ids": ["456", "789"]
   }
   ```

3. **Duplicate Data for Query Efficiency**:
   - Store user name in order document
   - Avoid joins at query time
   - Accept eventual consistency

**Output**: Normalized (relational) or denormalized (NoSQL) schema design

---

## Step 5: Define Constraints

**Constraint Types**:

1. **Primary Key**: Unique identifier for each row
2. **Foreign Key**: Referential integrity between tables
3. **Unique**: Ensure column values are unique
4. **Not Null**: Require value for column
5. **Check**: Validate data meets conditions
6. **Default**: Provide default value

**Example Constraints**:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  age INTEGER CHECK (age >= 18),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Output**: Schema with all constraints defined

---

## Step 6: Plan Indexes

**Index Planning**:

1. **Identify Query Patterns**:
   - Which columns are used in WHERE clauses?
   - Which columns are used in JOIN conditions?
   - Which columns are used in ORDER BY?

2. **Create Indexes**:
   - Primary key (automatic)
   - Foreign keys (important for joins)
   - Columns used in WHERE clauses
   - Columns used for sorting

3. **Consider Index Types**:
   - **B-tree**: Default, good for equality and range queries
   - **Hash**: Fast equality lookups, no range queries
   - **GIN/GiST**: Full-text search, JSON queries (PostgreSQL)
   - **Covering Index**: Include all columns needed by query

4. **Balance Read vs Write Performance**:
   - Indexes speed up reads
   - Indexes slow down writes
   - Don't over-index

**Example Indexes**:

```sql
-- Index on foreign key for joins
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Index on frequently queried column
CREATE INDEX idx_users_email ON users(email);

-- Composite index for common query pattern
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index for specific condition
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Covering index (includes all columns needed)
CREATE INDEX idx_orders_covering ON orders(user_id, status) INCLUDE (total, created_at);
```

**Output**: Index plan with rationale for each index

---

## Step 7: Review & Validate

**Review Checklist**:

- [ ] All entities have primary keys
- [ ] All relationships have foreign keys (relational)
- [ ] All required fields have NOT NULL constraints
- [ ] All validation rules have CHECK constraints
- [ ] All unique fields have UNIQUE constraints
- [ ] All common queries have supporting indexes
- [ ] Schema is normalized to appropriate level
- [ ] Design supports all required query patterns
- [ ] Design can scale with expected data volume
- [ ] Design decisions are documented

**Validation Questions**:

1. **Can all required queries be executed efficiently?**
2. **Are there any N+1 query problems?**
3. **Are there any missing indexes for common queries?**
4. **Are there any over-indexed tables?**
5. **Is the schema normalized appropriately?**
6. **Are all constraints enforced at database level?**
7. **Is the design flexible for future requirements?**

**Output**: Validated schema design ready for implementation

---

## Database Type-Specific Guidance

### Relational Databases (PostgreSQL, MySQL)

**Best Practices**:
- Normalize to 3NF by default
- Use foreign keys for referential integrity
- Use CHECK constraints for validation
- Use SERIAL/AUTO_INCREMENT for integer IDs
- Use UUID for distributed systems
- Use TIMESTAMP WITH TIME ZONE for dates
- Use JSONB for semi-structured data (PostgreSQL)

**Common Patterns**:
- Soft deletes: Add `deleted_at` column
- Audit trails: Add `created_at`, `updated_at`, `created_by`, `updated_by`
- Versioning: Add `version` column with optimistic locking
- Multi-tenancy: Add `tenant_id` to all tables

### NoSQL Databases (MongoDB, DynamoDB)

**Best Practices**:
- Design for access patterns, not normalization
- Embed related data for 1:1 and 1:N relationships
- Use references for M:N relationships
- Denormalize for read performance
- Use schema validation (MongoDB)
- Plan for document size limits (16MB in MongoDB)
- Use compound indexes for multi-field queries

**Common Patterns**:
- Embed arrays for 1:N relationships (up to ~100 items)
- Reference for large or frequently updated data
- Duplicate data to avoid joins
- Use schema version field for migrations

### Vector Databases (Pinecone, Milvus)

**Best Practices**:
- Match vector dimensions to embedding model
- Choose appropriate distance metric (cosine, euclidean)
- Plan metadata fields for filtering
- Use namespaces for multi-tenancy
- Consider hybrid search (vector + keyword)

**Common Patterns**:
- Store metadata alongside vectors
- Use metadata filtering to reduce search space
- Normalize vectors before insertion
- Batch insertions for performance

### Flat Databases (CSV, JSON)

**Best Practices**:
- Define clear schema (column names, types)
- Use consistent date/time formats (ISO 8601)
- Validate data on read/write
- Use JSON Schema for validation
- Consider file size limits

**Common Patterns**:
- One file per entity type
- Use IDs for relationships (manual joins)
- Version schema in separate file
- Compress large files

---

## AI Prompt Templates

### Entity Modeling

```
Model database entities for [application type].

**Domain**: [e-commerce, social media, etc.]

**Requirements**:
[paste requirements]

Please create entity models with:
- Entity names
- All attributes with data types
- Primary keys
- Required vs optional fields
- Default values
```

### Relationship Mapping

```
Map relationships between these entities:

**Entities**:
- [Entity 1]: [attributes]
- [Entity 2]: [attributes]
- [Entity 3]: [attributes]

**Known Relationships**:
- [Relationship 1]
- [Relationship 2]

Please create:
- Entity Relationship Diagram (ERD)
- Foreign key definitions
- Cascade rules
- Join tables for M:N relationships
```

### Schema Validation

```
Review this database schema design:

[paste schema]

**Query Patterns**:
- [Query 1]
- [Query 2]

**Data Volume**: [expected records]

Please validate:
- Normalization level appropriate?
- All constraints defined?
- Indexes support query patterns?
- Any missing relationships?
- Any performance concerns?
```

---

## Common Pitfalls

**Pitfall 1: Over-Normalization**
- ❌ Normalizing to 5NF causing excessive joins
- ✅ Stop at 3NF unless specific reason to go further

**Pitfall 2: Missing Constraints**
- ❌ Relying on application-level validation only
- ✅ Enforce constraints at database level

**Pitfall 3: Poor Index Planning**
- ❌ No indexes or too many indexes
- ✅ Index based on actual query patterns

**Pitfall 4: Ignoring Data Types**
- ❌ Using VARCHAR for everything
- ✅ Use appropriate types (INTEGER, DECIMAL, TIMESTAMP)

**Pitfall 5: Not Planning for Growth**
- ❌ Designing for current data volume only
- ✅ Consider future scale and query patterns

---

## Next Steps

- See `workflow.md` for overall database workflow
- See `data-migration.md` for implementing schema changes
- See `optimization-workflow.md` for performance tuning
- See `testing-patterns.md` for validating schema design
- See `documentation-standards.md` for documenting schemas
