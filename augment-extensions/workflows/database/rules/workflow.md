# Database Design and Development Workflow

## Overview

This workflow provides comprehensive guidance for AI agents working on database-related tasks, from initial database selection through schema design, implementation, migration, optimization, and testing.

## Core Workflow

```
┌─────────────────────┐
│ Database Selection  │
│ Choose DB type      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Schema Design       │
│ Model entities      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Implementation      │
│ Create schema       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Migration           │
│ Version changes     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Optimization        │
│ Tune performance    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Testing             │
│ Validate behavior   │
└─────────────────────┘
```

## Coordination with OpenSpec and Beads

Database work should be tracked using OpenSpec specifications and Beads tasks:

**OpenSpec Integration**:
- Create specs in `openspec/specs/database/`
- Document schema requirements and design decisions
- Track breaking changes and migration strategies

**Beads Integration**:
- Create tasks with `bd create "Task description"`
- Reference specs: `"spec": "database/schema-design"`
- Track dependencies between schema changes

**Example Task**:
```json
{
  "id": "bd-db01",
  "title": "Design user authentication schema",
  "spec": "database/user-auth-schema",
  "rules": ["schema-design-workflow.md"],
  "status": "open",
  "priority": 0
}
```

## Workflow Steps

### Step 1: Database Selection

**Purpose**: Choose the right database type for your use case

**Decision Framework**:

1. **Analyze Data Structure**:
   - Structured (tables, rows) → Relational (PostgreSQL, MySQL)
   - Semi-structured (documents) → NoSQL (MongoDB, DynamoDB)
   - Graph relationships → Graph DB (Neo4j, ArangoDB)
   - Vector embeddings → Vector DB (Pinecone, Milvus)
   - Simple key-value → Redis, DynamoDB
   - Flat files → CSV, JSON

2. **Analyze Query Patterns**:
   - Complex joins and aggregations → Relational
   - Document retrieval → NoSQL
   - Graph traversal → Graph DB
   - Similarity search → Vector DB
   - Simple lookups → Key-value store

3. **Analyze Scale Requirements**:
   - < 1M records → SQLite, PostgreSQL, MySQL
   - 1M - 100M records → PostgreSQL, MySQL, MongoDB
   - > 100M records → Distributed DB (DynamoDB, Cassandra)

4. **Consider Operational Requirements**:
   - ACID guarantees needed → Relational
   - Eventual consistency acceptable → NoSQL
   - Managed service preferred → Cloud-native (RDS, DynamoDB)
   - Self-hosted required → PostgreSQL, MySQL, MongoDB

**Output**: Database selection with documented rationale

**AI Prompt Template**:
```
I need to select a database for [use case]. Requirements:
- Data structure: [structured/semi-structured/unstructured]
- Query patterns: [describe common queries]
- Scale: [number of records, growth rate]
- Consistency needs: [strong/eventual]
- Operational constraints: [managed/self-hosted, budget]

Please recommend a database type and specific database, with rationale.
```

### Step 2: Schema Design

**Purpose**: Design optimal database schema

See `schema-design-workflow.md` for detailed guidance.

**Quick Steps**:
1. Identify entities and attributes
2. Map relationships between entities
3. Apply normalization (relational) or denormalization (NoSQL)
4. Define constraints and validation rules
5. Plan indexes for common queries
6. Review and validate design

**Output**: Schema design document with ERD or data model

### Step 3: Implementation

**Purpose**: Create database schema in target database

**Steps**:

1. **Set Up Database Environment**:
   - Install database locally or provision cloud instance
   - Configure connection settings
   - Set up database users and permissions

2. **Create Schema**:
   - Write DDL (Data Definition Language) scripts
   - Include comments for documentation
   - Add constraints and indexes
   - Version control schema files

3. **Seed Initial Data** (if needed):
   - Create seed data scripts
   - Include reference data (countries, categories, etc.)
   - Document data sources

**Output**: Executable schema scripts in version control

**AI Prompt Template**:
```
Create database schema for [database type] based on this design:

[paste schema design]

Requirements:
- Include table/collection definitions
- Add appropriate constraints
- Create indexes for common queries
- Add comments for documentation
- Make scripts idempotent

Please generate DDL/schema creation scripts.
```

### Step 4: Migration Management

**Purpose**: Safely evolve database schema over time

See `data-migration.md` for detailed guidance.

**Quick Steps**:
1. Plan migration (what changes, impact, rollback)
2. Create up and down migration scripts
3. Test on staging data
4. Execute migration with monitoring
5. Verify success and data integrity

**Output**: Versioned migration scripts with rollback plans

### Step 5: Optimization

**Purpose**: Improve database performance

See `optimization-workflow.md` for detailed guidance.

**Quick Steps**:
1. Identify slow queries (profiling, logs)
2. Analyze query execution plans
3. Add or optimize indexes
4. Refactor queries
5. Consider denormalization or caching
6. Measure improvements

**Output**: Optimized queries and schema with performance metrics

### Step 6: Testing

**Purpose**: Validate database behavior and performance

See `testing-patterns.md` for detailed guidance.

**Quick Steps**:
1. Set up test database environment
2. Create test fixtures and seed data
3. Write unit tests (constraints, validation)
4. Write integration tests (queries, transactions)
5. Write performance tests (load, stress)
6. Run tests in CI/CD pipeline

**Output**: Comprehensive test suite with fixtures

---

## Database Type-Specific Workflows

### Relational Databases (PostgreSQL, MySQL, SQL Server)

**Schema Design**:
- Normalize to 3NF (Third Normal Form)
- Use foreign keys for referential integrity
- Add check constraints for validation
- Create indexes on foreign keys and query columns

**Migration Tools**:
- **PostgreSQL**: Flyway, Liquibase, Alembic (Python), Knex (Node.js)
- **MySQL**: Flyway, Liquibase, Laravel Migrations (PHP)
- **SQL Server**: Entity Framework Migrations, Flyway

**Best Practices**:
- Use transactions for data consistency
- Add indexes carefully (balance read vs write performance)
- Use EXPLAIN/EXPLAIN ANALYZE to understand query plans
- Monitor connection pool usage

### NoSQL Databases (MongoDB, DynamoDB)

**Schema Design**:
- Denormalize for query efficiency
- Embed related data in documents
- Use references for large or frequently updated data
- Design for access patterns, not normalization

**Migration Strategies**:
- Schema-less doesn't mean schema-free
- Version documents with schema version field
- Migrate data lazily (on read) or in batches
- Use application-level schema validation

**Best Practices**:
- Design for your query patterns
- Avoid large documents (> 16MB in MongoDB)
- Use indexes on query fields
- Monitor document size and collection growth

### Vector Databases (Pinecone, Milvus, Weaviate)

**Schema Design**:
- Define vector dimensions (match embedding model)
- Choose distance metric (cosine, euclidean, dot product)
- Plan metadata fields for filtering
- Consider hybrid search (vector + keyword)

**Index Configuration**:
- Choose index type (HNSW, IVF, etc.)
- Tune index parameters (ef_construction, M)
- Balance accuracy vs speed
- Plan for index rebuild time

**Best Practices**:
- Normalize vectors before insertion
- Use metadata filtering to reduce search space
- Batch insertions for better performance
- Monitor index size and query latency

### Flat Databases (CSV, JSON files)

**Schema Design**:
- Define clear column/field names
- Document data types and formats
- Use consistent date/time formats (ISO 8601)
- Plan for schema evolution

**File Management**:
- Use version control for schema definitions
- Validate data on read/write
- Consider file size limits (split large files)
- Use compression for storage efficiency

**Best Practices**:
- Validate data with JSON Schema or CSV schema
- Use streaming for large files
- Implement proper error handling
- Consider migration to database if data grows

---

## AI Prompt Templates

### Database Selection

```
I need to select a database for [application type]. Requirements:

**Data Characteristics**:
- Structure: [structured/semi-structured/unstructured]
- Volume: [current size, growth rate]
- Relationships: [simple/complex graph]

**Query Patterns**:
- [Query pattern 1]: [frequency, complexity]
- [Query pattern 2]: [frequency, complexity]

**Non-Functional Requirements**:
- Consistency: [strong ACID / eventual consistency]
- Availability: [uptime requirements]
- Scale: [read/write throughput]
- Budget: [constraints]
- Expertise: [team skills]

Please recommend a database with rationale and trade-offs.
```

### Schema Design

```
Design a database schema for [application type].

**Entities**:
- [Entity 1]: [attributes and types]
- [Entity 2]: [attributes and types]

**Relationships**:
- [Entity 1] [relationship type] [Entity 2]

**Common Queries**:
- [Query 1]: [description]
- [Query 2]: [description]

**Constraints**:
- [Constraint 1]
- [Constraint 2]

Please design an optimal schema with normalization, constraints, and indexes.
```

### Migration Planning

```
Plan a database migration for [describe change].

**Current Schema**:
[paste current schema]

**Desired Schema**:
[paste desired schema or describe changes]

**Constraints**:
- Zero downtime: [yes/no]
- Backward compatibility: [yes/no]
- Data volume: [number of rows]
- Database: [type and version]

Please create a migration plan with up/down scripts and rollback strategy.
```

### Query Optimization

```
Optimize this slow query:

**Query**:
[paste query]

**Execution Plan**:
[paste EXPLAIN output]

**Schema**:
[paste relevant table definitions]

**Performance Issue**:
- Current execution time: [time]
- Target execution time: [time]
- Data volume: [number of rows]

Please suggest optimizations (indexes, query rewrite, schema changes).
```

---

## Best Practices

### DO

✅ Document database selection rationale
✅ Version control all schema and migration scripts
✅ Test migrations on production-like data
✅ Monitor database performance metrics
✅ Use transactions for data consistency
✅ Add indexes based on query patterns
✅ Plan for rollback before executing migrations
✅ Use connection pooling in applications

### DON'T

❌ Choose database without analyzing requirements
❌ Make schema changes without migration scripts
❌ Skip testing migrations before production
❌ Add indexes without measuring impact
❌ Store sensitive data without encryption
❌ Ignore database performance metrics
❌ Deploy code and schema changes simultaneously
❌ Forget to document design decisions

---

## Common Pitfalls

**Pitfall 1: Premature Optimization**
- ❌ Adding indexes before understanding query patterns
- ✅ Profile queries first, then optimize based on data

**Pitfall 2: Over-Normalization**
- ❌ Normalizing to 5NF causing excessive joins
- ✅ Balance normalization with query performance

**Pitfall 3: Under-Indexing**
- ❌ No indexes on foreign keys or query columns
- ✅ Add indexes for common query patterns

**Pitfall 4: Ignoring Migrations**
- ❌ Making schema changes directly in production
- ✅ Use versioned migration scripts with rollback

**Pitfall 5: Not Testing at Scale**
- ❌ Testing with small datasets
- ✅ Test with production-like data volumes

---

## Next Steps

- See `schema-design-workflow.md` for detailed schema design process
- See `data-migration.md` for migration management strategies
- See `optimization-workflow.md` for performance tuning guidance
- See `testing-patterns.md` for database testing approaches
- See `documentation-standards.md` for documenting database designs

