# ADR Superseding Example

This example demonstrates how to properly supersede an Architecture Decision Record (ADR) when a previous decision needs to be replaced with a new one.

## Overview

This example shows:
- **ADR-0023**: "Use MongoDB for Primary Database" (original decision)
- **ADR-0067**: "Migrate to PostgreSQL" (superseding decision)

The superseding workflow includes proper linking, status updates, and coordination manifest updates.

---

## Step 1: Original ADR (Active)

**File:** `adr/0023-use-mongodb.md`

```markdown
# ADR-0023: Use MongoDB for Primary Database

**Status:** Implemented

**Date:** 2025-06-15

**Deciders:** Tech Lead, Database Architect, Backend Team

**Technical Story:** Related to OpenSpec spec: database/schema

---

## Context

We need a database solution for our new application with the following requirements:
- Flexible schema for rapid iteration
- Horizontal scalability
- JSON-like document storage
- Strong community support

### Forces

- Development speed is critical (6-month deadline)
- Schema may evolve frequently during MVP phase
- Team has MongoDB experience
- Uncertain about final data model

---

## Decision

We will use MongoDB as our primary database.

### Rationale

1. **Flexible Schema**: Document model allows rapid iteration
2. **Team Experience**: Team has 2+ years MongoDB experience
3. **Development Speed**: Faster prototyping with dynamic schema
4. **Scalability**: Built-in sharding for horizontal scaling

---

## Consequences

### Positive

- Faster initial development
- Easy schema evolution
- Good developer experience
- Strong ecosystem and tooling

### Negative

- Limited transaction support (at time of decision)
- Eventual consistency challenges
- Complex aggregation queries
- Higher memory usage

### Neutral

- Need to learn MongoDB-specific patterns
- Different backup/restore procedures

---

## Related Decisions

- Related to: [ADR-0022](0022-microservices-architecture.md)

---

## Notes

### Implementation Notes

- MongoDB 4.2 selected for multi-document transactions
- Replica set with 3 nodes for high availability
- Mongoose ODM for Node.js integration
```

---

## Step 2: Identifying Need for Change

**Trigger:** After 18 months of production use, several issues emerged:

1. **Transaction Complexity**: Multi-collection transactions causing performance issues
2. **Query Performance**: Complex joins requiring multiple queries
3. **Data Integrity**: Lack of foreign key constraints causing data inconsistencies
4. **Operational Costs**: Higher memory and storage costs than anticipated
5. **Team Growth**: New team members prefer relational databases

**Decision Point:** Team decides to migrate to PostgreSQL.

---

## Step 3: Create Superseding ADR

**File:** `adr/0067-migrate-to-postgresql.md`

```markdown
# ADR-0067: Migrate to PostgreSQL

**Status:** Approved

**Date:** 2026-12-01

**Deciders:** Tech Lead, Database Architect, Backend Team, DevOps Lead

**Technical Story:** Related to OpenSpec change: postgresql-migration

---

## Context

After 18 months using MongoDB (ADR-0023), we've encountered several challenges:

1. **Transaction Complexity**: Multi-collection transactions causing 200ms+ latency
2. **Query Performance**: Complex aggregations requiring multiple round-trips
3. **Data Integrity**: 47 data inconsistency incidents due to lack of foreign keys
4. **Operational Costs**: 40% higher than projected ($12k/month vs $8.5k/month)
5. **Team Expertise**: 5 new hires with strong PostgreSQL background

### Forces

- Production system with 50k active users
- Cannot afford extended downtime
- Need to maintain feature velocity during migration
- Must preserve all existing data
- Team capacity: 2 backend engineers for migration

---

## Decision

We will migrate from MongoDB to PostgreSQL as our primary database.

### Rationale

1. **ACID Transactions**: Native support for complex multi-table transactions
2. **Query Performance**: Relational model better fits our evolved data structure
3. **Data Integrity**: Foreign key constraints prevent inconsistencies
4. **Cost Efficiency**: Projected 35% cost reduction
5. **Team Expertise**: Better alignment with current team skills
6. **JSON Support**: PostgreSQL JSONB provides flexibility where needed

---

## Consequences

### Positive

- Improved data integrity with foreign key constraints
- Better query performance for complex joins
- Lower operational costs
- Stronger ACID guarantees
- Better tooling and monitoring

### Negative

- 3-4 month migration effort
- Temporary dual-database complexity
- Need to rewrite aggregation queries
- Learning curve for PostgreSQL-specific features

### Neutral

- Different backup/restore procedures
- Schema migrations become more structured
- Need to adopt new ORM (Sequelize or TypeORM)

---

## Related Decisions

- **Supersedes**: [ADR-0023](0023-use-mongodb.md) - Use MongoDB for Primary Database
- Related to: [ADR-0022](0022-microservices-architecture.md)

---

## Notes

### Migration Strategy

1. **Phase 1**: Set up PostgreSQL infrastructure (2 weeks)
2. **Phase 2**: Dual-write to both databases (4 weeks)
3. **Phase 3**: Migrate historical data (2 weeks)
4. **Phase 4**: Switch reads to PostgreSQL (2 weeks)
5. **Phase 5**: Decommission MongoDB (2 weeks)

### Implementation Notes

- PostgreSQL 15 selected for improved JSON performance
- Primary-replica setup with 2 read replicas
- Sequelize ORM for Node.js integration
- Automated schema migration with db-migrate

### References

- [Migration Plan](../openspec/changes/postgresql-migration/proposal.md)
- [Performance Benchmarks](../docs/postgresql-benchmarks.md)
```

---

## Step 4: Update Original ADR Status

Update `adr/0023-use-mongodb.md` to mark it as superseded:

```diff
- **Status:** Implemented
+ **Status:** Superseded

+ **Superseded By:** [ADR-0067](0067-migrate-to-postgresql.md)
+ **Superseded Date:** 2026-12-01
```

Add superseded reason to the end of the file:

```markdown
---

## Superseded

**Date:** 2026-12-01

**Superseded By:** [ADR-0067](0067-migrate-to-postgresql.md) - Migrate to PostgreSQL

**Reason:** After 18 months in production, we encountered transaction complexity, query performance issues, data integrity challenges, and higher operational costs than anticipated. PostgreSQL better aligns with our evolved data model and team expertise.

**Historical Context:** This decision was appropriate for our MVP phase when schema flexibility and development speed were critical. As the application matured, the need for strong data integrity and complex transactions became more important.
```

---

## Step 5: Update Coordination Manifest

Update `.augment/coordination.json` to reflect the superseding relationship:

```json
{
  "adrs": {
    "adr-0023": {
      "file": "adr/0023-use-mongodb.md",
      "title": "Use MongoDB for Primary Database",
      "status": "superseded",
      "supersededBy": "adr-0067",
      "supersededDate": "2026-12-01",
      "relatedSpecs": ["database/schema"],
      "relatedTasks": ["bd-db01", "bd-db02", "bd-db03"]
    },
    "adr-0067": {
      "file": "adr/0067-migrate-to-postgresql.md",
      "title": "Migrate to PostgreSQL",
      "status": "approved",
      "supersedes": ["adr-0023"],
      "relatedSpecs": ["database/postgresql-schema"],
      "relatedChanges": ["postgresql-migration"],
      "relatedTasks": ["bd-pg01", "bd-pg02", "bd-pg03", "bd-pg04", "bd-pg05"]
    }
  },
  "specs": {
    "database/schema": {
      "file": "openspec/specs/database/schema.md",
      "status": "superseded",
      "relatedADRs": ["adr-0023"],
      "supersededBy": "database/postgresql-schema"
    },
    "database/postgresql-schema": {
      "file": "openspec/specs/database/postgresql-schema.md",
      "status": "active",
      "relatedADRs": ["adr-0067"],
      "supersedes": "database/schema"
    }
  },
  "tasks": {
    "bd-pg01": {
      "title": "Set up PostgreSQL infrastructure",
      "status": "in_progress",
      "relatedADRs": ["adr-0067"],
      "relatedSpecs": ["database/postgresql-schema"]
    },
    "bd-pg02": {
      "title": "Implement dual-write layer",
      "status": "open",
      "relatedADRs": ["adr-0067"]
    },
    "bd-pg03": {
      "title": "Migrate historical data",
      "status": "open",
      "relatedADRs": ["adr-0067"]
    },
    "bd-pg04": {
      "title": "Switch reads to PostgreSQL",
      "status": "open",
      "relatedADRs": ["adr-0067"]
    },
    "bd-pg05": {
      "title": "Decommission MongoDB",
      "status": "open",
      "relatedADRs": ["adr-0067"],
      "blockedBy": ["bd-pg04"]
    }
  }
}
```

---

## Step 6: Create Beads Tasks

Create implementation tasks for the migration:

```bash
# Create epic for migration
bd create "Migrate from MongoDB to PostgreSQL" \
  --type epic \
  --priority 1 \
  --labels "adr-0067,database,migration"

# Create subtasks
bd create "Set up PostgreSQL infrastructure" \
  --parent bd-pg00 \
  --priority 1 \
  --labels "adr-0067,infrastructure"

bd create "Implement dual-write layer" \
  --parent bd-pg00 \
  --priority 1 \
  --labels "adr-0067,implementation" \
  --blocks bd-pg03

bd create "Migrate historical data" \
  --parent bd-pg00 \
  --priority 1 \
  --labels "adr-0067,migration" \
  --blocks bd-pg04

bd create "Switch reads to PostgreSQL" \
  --parent bd-pg00 \
  --priority 1 \
  --labels "adr-0067,cutover" \
  --blocks bd-pg05

bd create "Decommission MongoDB" \
  --parent bd-pg00 \
  --priority 2 \
  --labels "adr-0067,cleanup"

# Link epic to ADR
bd comment bd-pg00 "Implementing ADR-0067: Migrate to PostgreSQL (adr/0067-migrate-to-postgresql.md)"
```

---

## Step 7: Update OpenSpec

Create OpenSpec change for the migration:

**File:** `openspec/changes/postgresql-migration/proposal.md`

```markdown
# PostgreSQL Migration

## Related ADR

- [ADR-0067: Migrate to PostgreSQL](../../../adr/0067-migrate-to-postgresql.md)
- Supersedes: [ADR-0023: Use MongoDB](../../../adr/0023-use-mongodb.md)

## Overview

Migrate from MongoDB to PostgreSQL based on architectural decision ADR-0067.

## Motivation

See ADR-0067 for detailed context and rationale.

## Proposed Changes

[Migration details...]
```

---

## Workflow Summary

### Superseding Checklist

- [x] **Create new ADR** with superseding decision
- [x] **Link to original ADR** in "Supersedes" section
- [x] **Update original ADR** status to "Superseded"
- [x] **Add superseded metadata** to original ADR
- [x] **Update coordination manifest** with both ADRs
- [x] **Create implementation tasks** in Beads
- [x] **Link OpenSpec changes** to new ADR
- [x] **Document migration strategy** in new ADR
- [x] **Preserve historical context** in original ADR

### Key Principles

1. **Never delete superseded ADRs** - They provide historical context
2. **Always link bidirectionally** - Both ADRs should reference each other
3. **Document the reason** - Explain why the decision changed
4. **Preserve context** - Original ADR shows why it made sense at the time
5. **Update all references** - Coordination manifest, specs, tasks

---

## See Also

- [Complete Lifecycle Example](./complete-lifecycle-example.md)
- [Integration Example](./integration-example.md)
- [Lifecycle Management Rules](../rules/lifecycle-management.md)
- [OpenSpec Integration](../rules/openspec-integration.md)
- [Beads Integration](../rules/beads-integration.md)


