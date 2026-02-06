# OpenSpec Integration Rules

## Overview

This document defines how Architecture Decision Records (ADRs) integrate with OpenSpec workflow, including linking ADRs to specs, cross-referencing, coordination manifest updates, and workflow integration.

## Integration Points

### 1. ADRs from OpenSpec Changes

When architectural decisions are made during OpenSpec changes:

```
OpenSpec Change Proposal
  ↓
Architectural Decision Identified
  ↓
Create ADR
  ↓
Link ADR to Spec
  ↓
Update Coordination Manifest
```

### 2. Specs from ADRs

When ADRs require specification changes:

```
ADR Created/Approved
  ↓
Spec Changes Needed
  ↓
Create OpenSpec Change
  ↓
Link Spec to ADR
  ↓
Update Coordination Manifest
```

## Linking ADRs to Specs

### In ADR Metadata

```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: approved
date: 2026-02-05
related_specs:
  - "openspec/specs/architecture/microservices.md"
  - "openspec/specs/deployment/kubernetes.md"
related_changes:
  - "openspec/changes/microservices-migration/"
---
```

### In OpenSpec Proposal

```markdown
# Microservices Migration Proposal

## Related ADRs

- [ADR-0042: Migrate to Microservices Architecture](../../adr/0042-migrate-to-microservices.md)
  - Status: Approved
  - Decision: Adopt microservices architecture for user and payment services
  - Rationale: See ADR for detailed analysis

## Architectural Decisions

This change implements the decisions documented in ADR-0042:
- Service boundaries defined
- Communication patterns established
- Deployment strategy selected
```

### In Spec Files

```markdown
# Microservices Architecture Specification

## Architectural Decisions

This specification is based on the following ADRs:

- [ADR-0042: Migrate to Microservices](../../adr/0042-migrate-to-microservices.md) - Core architecture decision
- [ADR-0043: Use gRPC for Service Communication](../../adr/0043-use-grpc-communication.md) - Communication protocol
- [ADR-0044: Deploy on Kubernetes](../../adr/0044-deploy-on-kubernetes.md) - Deployment platform

## Architecture Overview

[Specification content based on ADR decisions...]
```

## Coordination Manifest Integration

### Manifest Structure

```json
{
  "adrs": {
    "adr-0042": {
      "file": "adr/0042-migrate-to-microservices.md",
      "title": "Migrate to Microservices Architecture",
      "status": "approved",
      "relatedSpecs": ["architecture/microservices"],
      "relatedChanges": ["microservices-migration"],
      "relatedTasks": ["bd-ms01", "bd-ms02"]
    }
  },
  "specs": {
    "architecture/microservices": {
      "file": "openspec/specs/architecture/microservices.md",
      "status": "active",
      "relatedADRs": ["adr-0042", "adr-0043", "adr-0044"],
      "relatedTasks": ["bd-ms01", "bd-ms02", "bd-ms03"]
    }
  },
  "changes": {
    "microservices-migration": {
      "directory": "openspec/changes/microservices-migration/",
      "status": "in-progress",
      "relatedADRs": ["adr-0042"],
      "relatedSpecs": ["architecture/microservices"],
      "relatedTasks": ["bd-ms01", "bd-ms02", "bd-ms03"]
    }
  }
}
```

### Updating Coordination Manifest

**When ADR is created:**

```typescript
function addADRToCoordination(adr: ADR) {
  const coordination = loadCoordinationManifest();
  
  coordination.adrs[adr.id] = {
    file: `adr/${adr.id}-${slugify(adr.title)}.md`,
    title: adr.title,
    status: adr.status,
    relatedSpecs: adr.related_specs?.map(extractSpecId) || [],
    relatedChanges: adr.related_changes?.map(extractChangeId) || [],
    relatedTasks: adr.related_tasks || []
  };
  
  // Update related specs
  adr.related_specs?.forEach(specPath => {
    const specId = extractSpecId(specPath);
    if (coordination.specs[specId]) {
      coordination.specs[specId].relatedADRs.push(adr.id);
    }
  });
  
  saveCoordinationManifest(coordination);
}
```

**When ADR status changes:**

```typescript
function updateADRStatus(adrId: string, newStatus: string) {
  const coordination = loadCoordinationManifest();
  
  if (coordination.adrs[adrId]) {
    coordination.adrs[adrId].status = newStatus;
    
    // If implemented, update related specs
    if (newStatus === 'implemented') {
      coordination.adrs[adrId].relatedSpecs.forEach(specId => {
        if (coordination.specs[specId]) {
          // Spec can now be considered "implemented" or "active"
          coordination.specs[specId].status = 'active';
        }
      });
    }
  }
  
  saveCoordinationManifest(coordination);
}
```

## Workflow Integration Patterns

### Pattern 1: ADR-First Workflow

**Use when:** Architectural decision needs to be made before spec work begins.

```
1. Detect architectural decision
2. Create ADR (draft)
3. Evaluate alternatives
4. Approve ADR
5. Create OpenSpec change based on ADR
6. Implement spec
7. Update ADR status to implemented
```

**Example:**
```bash
# Step 1-4: Create and approve ADR
# ADR-0042: Migrate to Microservices

# Step 5: Create OpenSpec change
mkdir -p openspec/changes/microservices-migration
cat > openspec/changes/microservices-migration/proposal.md << EOF
# Microservices Migration

## Related ADRs
- ADR-0042: Migrate to Microservices Architecture

## Proposal
Implement the architecture defined in ADR-0042...
EOF

# Step 6-7: Implement and update
```

### Pattern 2: Spec-First Workflow

**Use when:** Spec work reveals need for architectural decision.

```
1. Create OpenSpec change
2. During spec work, identify architectural decision
3. Create ADR to document decision
4. Link ADR to spec
5. Continue spec work
6. Approve ADR
7. Complete spec implementation
```

**Example:**
```markdown
<!-- In openspec/changes/add-caching/proposal.md -->

# Add Caching Layer

## Architectural Decisions

During this work, we identified the need to decide on a caching strategy.

Created [ADR-0045: Use Redis for Caching](../../adr/0045-use-redis-caching.md)

## Proposal

Based on ADR-0045, we will implement Redis caching...
```

### Pattern 3: Parallel Workflow

**Use when:** ADR and spec work happen simultaneously.

```
1. Identify need for both ADR and spec
2. Create ADR (draft) and OpenSpec change (draft)
3. Work on both in parallel
4. Cross-reference between ADR and spec
5. Approve ADR
6. Finalize spec based on approved ADR
7. Implement
```

## Cross-Referencing Best Practices

### 1. Bidirectional Links

Always link in both directions:

**In ADR:**
```yaml
related_specs:
  - "openspec/specs/architecture/microservices.md"
```

**In Spec:**
```markdown
## Related ADRs
- [ADR-0042: Migrate to Microservices](../../adr/0042-migrate-to-microservices.md)
```

### 2. Descriptive Link Text

Use descriptive text, not just "see ADR-0042":

**Good:**
```markdown
The service boundaries are defined in [ADR-0042: Migrate to Microservices](../../adr/0042-migrate-to-microservices.md), which evaluated domain-driven design principles.
```

**Bad:**
```markdown
See [ADR-0042](../../adr/0042-migrate-to-microservices.md).
```

### 3. Context in Links

Provide context for why the link is relevant:

```markdown
## Communication Protocol

We chose gRPC for inter-service communication based on [ADR-0043: Use gRPC for Service Communication](../../adr/0043-use-grpc-communication.md), which compared gRPC, REST, and message queues for our specific performance and type-safety requirements.
```

### 4. Link Status Awareness

Indicate if linked ADR is still draft or has been superseded:

```markdown
## Deployment Strategy

**Note:** This section is based on [ADR-0044: Deploy on Kubernetes](../../adr/0044-deploy-on-kubernetes.md) (Status: Approved, pending implementation).
```

## Spec Delta Integration

When ADRs affect specs, document in spec deltas:

```markdown
# Spec Delta: Microservices Architecture

## ADDED

### Architecture Decision Records

- [ADR-0042: Migrate to Microservices Architecture](../../adr/0042-migrate-to-microservices.md)
  - Establishes microservices as the target architecture
  - Defines service boundaries
  - Specifies communication patterns

## MODIFIED

### openspec/specs/architecture/overview.md

**Before:**
```
Monolithic architecture with layered design.
```

**After:**
```
Microservices architecture based on ADR-0042.
Service boundaries defined by domain-driven design principles.
```

## REMOVED

None
```

## Validation and Consistency

### Validate ADR-Spec Links

```typescript
function validateADRSpecLinks(adr: ADR): ValidationResult {
  const warnings = [];
  
  // Check that referenced specs exist
  adr.related_specs?.forEach(specPath => {
    if (!fileExists(specPath)) {
      warnings.push(`Referenced spec does not exist: ${specPath}`);
    } else {
      // Check if spec references this ADR back
      const specContent = readFile(specPath);
      if (!specContent.includes(adr.id)) {
        warnings.push(`Spec ${specPath} does not reference ADR ${adr.id} (one-way link)`);
      }
    }
  });
  
  return { valid: warnings.length === 0, warnings };
}
```

### Sync Coordination Manifest

```typescript
function syncCoordinationManifest() {
  const coordination = loadCoordinationManifest();
  const adrs = loadAllADRs();
  const specs = loadAllSpecs();
  
  // Ensure all ADRs are in manifest
  adrs.forEach(adr => {
    if (!coordination.adrs[adr.id]) {
      addADRToCoordination(adr);
    }
  });
  
  // Ensure all links are bidirectional
  Object.entries(coordination.adrs).forEach(([adrId, adrEntry]) => {
    adrEntry.relatedSpecs.forEach(specId => {
      if (coordination.specs[specId]) {
        if (!coordination.specs[specId].relatedADRs.includes(adrId)) {
          coordination.specs[specId].relatedADRs.push(adrId);
        }
      }
    });
  });
  
  saveCoordinationManifest(coordination);
}
```

## Examples

### Example 1: Database Decision

**ADR:**
```yaml
---
id: adr-0001
title: "Use PostgreSQL for Primary Database"
status: approved
related_specs:
  - "openspec/specs/database/schema.md"
  - "openspec/specs/database/connection-pooling.md"
---
```

**Spec:**
```markdown
# Database Schema Specification

## Architectural Foundation

This specification implements [ADR-0001: Use PostgreSQL for Primary Database](../../adr/0001-use-postgresql-database.md).

PostgreSQL-specific features used:
- JSONB for flexible data
- Array types for tags
- Full-text search
```

**Coordination Manifest:**
```json
{
  "adrs": {
    "adr-0001": {
      "file": "adr/0001-use-postgresql-database.md",
      "status": "approved",
      "relatedSpecs": ["database/schema", "database/connection-pooling"]
    }
  },
  "specs": {
    "database/schema": {
      "file": "openspec/specs/database/schema.md",
      "relatedADRs": ["adr-0001"]
    }
  }
}
```

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [Beads Integration](./beads-integration.md)
- [Lifecycle Management](./lifecycle-management.md)
- [Coordination System](../../../../.augment-guidelines/system-integration/coordination-system.md)

