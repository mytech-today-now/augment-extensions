# Conflict Detection Rules

## Overview

This document defines how to detect and resolve conflicts between Architecture Decision Records (ADRs), including analysis methods, detection criteria, conflict types, and resolution workflows.

## Conflict Types

### 1. Direct Conflicts

**Definition:** Two ADRs make contradictory decisions about the same topic.

**Example:**
- ADR-0042: "Use PostgreSQL for all databases"
- ADR-0055: "Use MongoDB for user data storage"

**Detection:**
- Same domain/category
- Contradictory decisions
- Overlapping scope

### 2. Implicit Conflicts

**Definition:** ADRs don't directly contradict but create incompatible system states.

**Example:**
- ADR-0030: "Use synchronous REST APIs for all services"
- ADR-0048: "Implement event-driven architecture with message queues"

**Detection:**
- Different approaches to same problem
- Incompatible architectural patterns
- Conflicting assumptions

### 3. Supersession Conflicts

**Definition:** New ADR supersedes old one but supersession not properly documented.

**Example:**
- ADR-0010: "Use MySQL" (status: implemented)
- ADR-0025: "Migrate to PostgreSQL" (status: approved)
- ADR-0010 should be marked as superseded

**Detection:**
- New ADR replaces old decision
- Old ADR still marked as active
- Missing supersedes/superseded_by links

### 4. Scope Conflicts

**Definition:** ADRs have overlapping but not identical scopes.

**Example:**
- ADR-0020: "Use Redis for all caching"
- ADR-0035: "Use Memcached for session caching"

**Detection:**
- Overlapping domains
- Different specificity levels
- Unclear precedence

## Detection Methods

### Automated Detection

#### Keyword Analysis

```typescript
function detectKeywordConflicts(adr: ADR, allADRs: ADR[]): Conflict[] {
  const conflicts = [];
  const keywords = extractKeywords(adr);
  
  allADRs.forEach(otherADR => {
    if (otherADR.id === adr.id) return;
    if (otherADR.status === 'superseded' || otherADR.status === 'sunset') return;
    
    const otherKeywords = extractKeywords(otherADR);
    const overlap = keywords.filter(k => otherKeywords.includes(k));
    
    if (overlap.length > 2) {
      // Significant keyword overlap, potential conflict
      conflicts.push({
        type: 'potential',
        adr1: adr.id,
        adr2: otherADR.id,
        reason: `Significant keyword overlap: ${overlap.join(', ')}`,
        severity: 'medium'
      });
    }
  });
  
  return conflicts;
}
```

#### Category Analysis

```typescript
function detectCategoryConflicts(adr: ADR, allADRs: ADR[]): Conflict[] {
  const conflicts = [];
  const categories = extractCategories(adr);
  
  allADRs.forEach(otherADR => {
    if (otherADR.id === adr.id) return;
    if (otherADR.status === 'superseded' || otherADR.status === 'sunset') return;
    
    const otherCategories = extractCategories(otherADR);
    const overlap = categories.filter(c => otherCategories.includes(c));
    
    if (overlap.length > 0) {
      // Same category, check for contradictions
      const contradiction = detectContradiction(adr, otherADR);
      if (contradiction) {
        conflicts.push({
          type: 'direct',
          adr1: adr.id,
          adr2: otherADR.id,
          reason: contradiction,
          severity: 'high'
        });
      }
    }
  });
  
  return conflicts;
}
```

#### Technology Stack Analysis

```typescript
function detectTechnologyConflicts(adr: ADR, allADRs: ADR[]): Conflict[] {
  const conflicts = [];
  const technologies = extractTechnologies(adr);
  
  allADRs.forEach(otherADR => {
    if (otherADR.id === adr.id) return;
    if (otherADR.status === 'superseded' || otherADR.status === 'sunset') return;
    
    const otherTechnologies = extractTechnologies(otherADR);
    
    // Check for mutually exclusive technologies
    const mutuallyExclusive = checkMutualExclusion(technologies, otherTechnologies);
    if (mutuallyExclusive) {
      conflicts.push({
        type: 'direct',
        adr1: adr.id,
        adr2: otherADR.id,
        reason: `Mutually exclusive technologies: ${mutuallyExclusive}`,
        severity: 'high'
      });
    }
  });
  
  return conflicts;
}
```

### Manual Detection

#### Review Checklist

When creating or reviewing ADR, check for conflicts:

- [ ] Search for ADRs in same category
- [ ] Review ADRs with similar keywords
- [ ] Check for technology overlaps
- [ ] Verify no contradictory decisions
- [ ] Confirm supersession properly documented

#### Peer Review

During ADR review, reviewers should:

1. **Search Related ADRs**
   ```bash
   # Search for related ADRs
   grep -r "database" adr/
   grep -r "PostgreSQL\|MySQL\|MongoDB" adr/
   ```

2. **Compare Decisions**
   - Read related ADRs
   - Identify potential conflicts
   - Raise concerns in review

3. **Validate Supersession**
   - Check if new ADR supersedes old ones
   - Verify supersession links
   - Ensure old ADRs updated

## Conflict Severity Levels

### High Severity

**Characteristics:**
- Direct contradiction
- Same scope
- Both ADRs active
- Incompatible implementation

**Action Required:**
- Immediate resolution
- Block new ADR until resolved
- Update one or both ADRs

**Example:**
```
CONFLICT: High Severity
ADR-0042: Use PostgreSQL for all databases (status: implemented)
ADR-0055: Use MongoDB for user database (status: proposed)

Resolution Required: Decide which database to use for user data.
```

### Medium Severity

**Characteristics:**
- Implicit conflict
- Overlapping scope
- May be resolvable
- Requires clarification

**Action Required:**
- Review before approval
- Clarify scope boundaries
- Document relationship

**Example:**
```
CONFLICT: Medium Severity
ADR-0030: Use REST APIs for services (status: implemented)
ADR-0048: Use event-driven architecture (status: proposed)

Resolution: Clarify when to use REST vs events. May coexist.
```

### Low Severity

**Characteristics:**
- Potential conflict
- Different scopes
- May be complementary
- Needs verification

**Action Required:**
- Review during approval
- Document relationship
- No blocking required

**Example:**
```
CONFLICT: Low Severity
ADR-0020: Use Redis for caching (status: implemented)
ADR-0035: Use CDN for static assets (status: proposed)

Resolution: Different types of caching, likely complementary.
```

## Resolution Workflows

### Workflow 1: Supersession

**Use when:** New ADR replaces old decision.

```
1. Identify old ADR to be superseded
2. Update new ADR metadata:
   supersedes: [adr-0042]
3. Update old ADR metadata:
   status: superseded
   superseded_by: adr-0055
   superseded_date: 2026-02-05
4. Update coordination manifest
5. Close related tasks for old ADR
```

**Example:**
```yaml
# New ADR (adr-0055)
---
id: adr-0055
title: "Migrate to MongoDB for User Data"
status: proposed
supersedes: [adr-0042]
---

# Old ADR (adr-0042)
---
id: adr-0042
title: "Use PostgreSQL for All Databases"
status: superseded
superseded_by: adr-0055
superseded_date: 2026-02-05
---
```

### Workflow 2: Scope Clarification

**Use when:** ADRs can coexist with clear boundaries.

```
1. Identify scope overlap
2. Clarify boundaries in both ADRs
3. Add cross-references
4. Document relationship
5. Update coordination manifest
```

**Example:**
```markdown
# ADR-0020: Use Redis for Caching

## Scope

This ADR covers **application-level caching** including:
- Session data
- API response caching
- Database query caching

**Out of Scope:** Static asset caching (see ADR-0035)

## Related Decisions

- [ADR-0035: Use CDN for Static Assets](./0035-use-cdn-static-assets.md) - Complementary caching strategy
```

### Workflow 3: Consolidation

**Use when:** Multiple ADRs should be merged into one.

```
1. Create new consolidated ADR
2. Reference all previous ADRs
3. Mark previous ADRs as superseded
4. Update all related specs/tasks
5. Update coordination manifest
```

**Example:**
```yaml
# New consolidated ADR
---
id: adr-0060
title: "Unified Caching Strategy"
status: proposed
supersedes: [adr-0020, adr-0035, adr-0041]
---

## Context

This ADR consolidates previous caching decisions:
- ADR-0020: Redis for application caching
- ADR-0035: CDN for static assets
- ADR-0041: Browser caching headers

## Decision

[Unified caching strategy...]
```

### Workflow 4: Rejection

**Use when:** New ADR conflicts and should not proceed.

```
1. Document conflict
2. Reject new ADR
3. Add comment explaining conflict
4. Suggest alternative approach
```

**Example:**
```yaml
---
id: adr-0055
title: "Use MongoDB for User Data"
status: rejected
rejected_date: 2026-02-05
rejected_reason: "Conflicts with ADR-0042 (Use PostgreSQL). Team decided to maintain PostgreSQL for consistency."
---
```

## Prevention Strategies

### 1. Pre-Creation Search

Before creating ADR, search for related decisions:

```bash
# Search by keyword
grep -ri "database" adr/

# Search by technology
grep -ri "postgresql\|mysql\|mongodb" adr/

# Search by category
grep -ri "category: database" adr/
```

### 2. Category Taxonomy

Maintain clear category taxonomy:

```
- architecture
  - patterns
  - layers
  - services
- infrastructure
  - database
  - caching
  - messaging
- security
  - authentication
  - authorization
  - encryption
```

### 3. ADR Index

Maintain index of ADRs by category:

```markdown
# ADR Index

## Database
- ADR-0001: Use PostgreSQL for Primary Database
- ADR-0015: Use Redis for Caching
- ADR-0028: Database Backup Strategy

## Architecture
- ADR-0042: Migrate to Microservices
- ADR-0043: Use gRPC for Service Communication
```

### 4. Automated Checks

Run automated conflict detection:

```bash
# Check for conflicts before creating ADR
augx adr check-conflicts adr/0055-use-mongodb.md

# Output:
# ⚠️  Potential conflict detected:
# ADR-0055 (proposed) conflicts with ADR-0042 (implemented)
# Both make decisions about primary database
# Severity: High
# 
# Recommendation: Review ADR-0042 and clarify relationship
```

## Best Practices

1. **Search Before Creating**
   - Always search for related ADRs
   - Review similar decisions
   - Check for conflicts early

2. **Document Relationships**
   - Use supersedes/superseded_by
   - Add related_decisions links
   - Clarify scope boundaries

3. **Review Thoroughly**
   - Include conflict check in review
   - Have multiple reviewers
   - Use automated tools

4. **Resolve Promptly**
   - Don't ignore conflicts
   - Resolve before approval
   - Update all affected ADRs

5. **Maintain Index**
   - Keep ADR index current
   - Categorize consistently
   - Make searchable

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [Lifecycle Management](./lifecycle-management.md)
- [Validation Rules](./validation-rules.md)

