# Database Design and Development Workflow Module

**Comprehensive workflow for database design, schema development, migration management, optimization, and testing.**

## Overview

This workflow module provides structured guidance for AI agents working on database-related tasks. It covers the complete lifecycle from database selection and schema design through implementation, testing, optimization, and maintenance.

## Key Benefits

- **Structured Workflows**: Step-by-step guidance for schema design, migrations, and optimization
- **Database Selection**: Decision frameworks for choosing the right database type
- **Migration Management**: Safe, zero-downtime migration strategies
- **Performance Optimization**: Systematic approach to query and schema optimization
- **Testing Strategies**: Comprehensive database testing patterns
- **AI Prompt Templates**: Ready-to-use prompts for each workflow phase

## Database Types Covered

- **Relational Databases**: PostgreSQL, MySQL, SQL Server, SQLite
- **NoSQL Databases**: MongoDB, Redis, DynamoDB, Neo4j, ArangoDB
- **Vector Databases**: Pinecone, Milvus, Weaviate, Qdrant, Chroma
- **Flat Databases**: CSV, JSON file management

## Installation

```bash
augx link workflows/database
```

## Directory Structure

```
augment-extensions/workflows/database/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/                               # Workflow guides
│   ├── workflow.md                      # Main workflow overview
│   ├── schema-design-workflow.md        # Schema design process
│   ├── migration-workflow.md            # Migration management
│   └── optimization-workflow.md         # Performance optimization
└── examples/                            # Workflow examples
    ├── schema-design-example.md         # E-commerce schema design
    ├── migration-example.md             # Adding new table migration
    └── optimization-example.md          # Query optimization case study
```

## Core Workflows

### 1. Database Selection Workflow

**Purpose**: Choose the right database type for your use case

**Steps**:
1. Analyze requirements (data structure, query patterns, scale)
2. Evaluate database types (relational, NoSQL, vector, flat)
3. Consider operational requirements (hosting, cost, expertise)
4. Make selection and document rationale

**AI Prompt Template**:
```
I need to select a database for [use case]. Requirements:
- Data structure: [structured/semi-structured/unstructured]
- Query patterns: [read-heavy/write-heavy/balanced]
- Scale: [records count, growth rate]
- Consistency needs: [strong/eventual]
- Budget: [constraints]

Please recommend a database type and specific database, with rationale.
```

### 2. Schema Design Workflow

**Purpose**: Design optimal database schema

**Steps**:
1. Gather requirements and identify entities
2. Map relationships between entities
3. Apply normalization (for relational) or denormalization (for NoSQL)
4. Define constraints and validation rules
5. Plan indexes for common queries
6. Review and validate design

**AI Prompt Template**:
```
I need to design a schema for [application type]. Entities:
- [Entity 1]: [attributes]
- [Entity 2]: [attributes]

Relationships:
- [Entity 1] [relationship type] [Entity 2]

Common queries:
- [Query 1]
- [Query 2]

Please design an optimal schema with proper normalization, constraints, and indexes.
```

### 3. Migration Workflow

**Purpose**: Safely migrate database schema changes

**Steps**:
1. Plan migration (what changes, impact analysis)
2. Create migration script (up and down)
3. Test migration on development database
4. Plan rollback strategy
5. Execute migration with monitoring
6. Validate migration success

**AI Prompt Template**:
```
I need to migrate the database to [add/modify/remove] [table/column/index].
Current schema: [description]
Desired schema: [description]
Constraints: [zero-downtime/backward-compatible]

Please create migration scripts (up and down) with rollback strategy.
```

### 4. Optimization Workflow

**Purpose**: Improve database performance

**Steps**:
1. Profile current performance (identify slow queries)
2. Analyze query execution plans
3. Identify optimization opportunities (indexes, query rewrites, schema changes)
4. Implement optimizations
5. Benchmark and validate improvements
6. Monitor ongoing performance

**AI Prompt Template**:
```
I need to optimize this query:
[SQL/query code]

Current performance: [execution time, rows scanned]
Expected performance: [target]
Schema: [relevant tables and indexes]

Please analyze and suggest optimizations (indexes, query rewrites, schema changes).
```

### 5. Testing Workflow

**Purpose**: Ensure database reliability and correctness

**Steps**:
1. Set up test database environment
2. Create test fixtures and seed data
3. Write unit tests (data validation, constraints)
4. Write integration tests (queries, transactions)
5. Write performance tests (load, stress)
6. Run tests in CI/CD pipeline

**AI Prompt Template**:
```
I need to test [database feature/migration/query].
Database: [type and version]
Test framework: [framework]
Scope: [unit/integration/performance]

Please create comprehensive tests with fixtures and assertions.
```

## Usage Examples

### Example 1: E-commerce Schema Design

See `examples/schema-design-example.md` for a complete walkthrough of designing an e-commerce database schema from requirements to implementation.

### Example 2: Zero-Downtime Migration

See `examples/migration-example.md` for a step-by-step guide to adding a new table with foreign keys without downtime.

### Example 3: Query Optimization

See `examples/optimization-example.md` for a case study of optimizing a slow reporting query.

## Character Count

~0 characters (to be calculated after all workflow files are created)

## Version

1.0.0

## Related Modules

- **domain-rules/database**: Database design guidelines and best practices
- **coding-standards/sql**: SQL coding standards (if available)
- **domain-rules/api-design**: API design for database access layers

