# Complete ADR Lifecycle Example

This example demonstrates the full lifecycle of an Architecture Decision Record (ADR) from initial draft through all status transitions to final superseded state.

## Overview

This example tracks ADR-0042 "Migrate to Microservices Architecture" through its complete lifecycle:

```
draft → proposed → approved → implemented → maintained → superseded
```

## Timeline Summary

- **2026-02-05**: Created (draft)
- **2026-02-08**: Proposed for review
- **2026-02-12**: Approved by team
- **2026-03-15**: Implemented (first services migrated)
- **2026-06-01**: Moved to maintained (initial review)
- **2027-06-01**: Superseded by ADR-0089 (return to modular monolith)

---

## Version 1: Draft Status

**File:** `adr/0042-migrate-to-microservices.md`

```markdown
# ADR-0042: Migrate to Microservices Architecture

**Status:** Draft

**Date:** 2026-02-05

**Deciders:** Tech Lead, Senior Architect, Development Team

**Technical Story:** Related to OpenSpec change: scaling-architecture

---

## Context

Our monolithic application is experiencing scaling challenges:
- Deployment takes 45+ minutes
- Cannot scale individual components independently
- Team coordination bottlenecks with 20+ developers
- Database contention during peak loads

### Forces

- Need to scale user service independently (10x traffic growth expected)
- Payment processing requires PCI compliance isolation
- Team wants to use different tech stacks for different services
- Operations team concerned about complexity
- Limited experience with distributed systems

---

## Decision

We will migrate our monolithic application to a microservices architecture, starting with user and payment services.

### Rationale

- Independent scaling of high-traffic services
- Faster deployment cycles (target: \u003c 10 minutes)
- Team autonomy and technology flexibility
- Better fault isolation

---

## Consequences

### Positive

- Independent service scaling
- Faster deployments
- Team autonomy
- Technology flexibility

### Negative

- Increased operational complexity
- Distributed system challenges (network, consistency)
- Need for service mesh/API gateway
- Higher infrastructure costs initially

### Neutral

- Learning curve for team
- Need to build DevOps capabilities
- Monitoring and observability requirements

---

## Related Decisions

- Related to: ADR-0038 (API Gateway Selection)
- Related to: ADR-0040 (Service Mesh Evaluation)

---

## Notes

### References

- [Microservices Patterns](https://microservices.io/patterns/)
- [Building Microservices by Sam Newman](https://samnewman.io/books/building_microservices/)

### Implementation Notes

**DRAFT - INCOMPLETE**
- Need to finalize service boundaries
- Need to evaluate service mesh options
- Need to plan data migration strategy
```

**Actions Taken:**
- Initial draft created
- Context gathered from team discussions
- Basic structure in place
- Marked as DRAFT - not ready for review

---

## Version 2: Proposed Status

**File:** `adr/0042-migrate-to-microservices.md` (updated)

**Changes from Draft:**
- Added complete service boundary analysis
- Added detailed migration plan
- Added risk assessment
- Identified reviewers and review deadline
- Completed all required sections

**Metadata Updates:**
```yaml
status: proposed
review_by: 2026-02-12
reviewers: ["tech-lead", "senior-architect", "ops-lead", "team"]
```

**Actions Taken:**
- Completed all sections
- Added migration phases
- Documented risks and mitigation
- Sent to team for review
- Scheduled review meeting for 2026-02-12

---

## Version 3: Approved Status

**File:** `adr/0042-migrate-to-microservices.md` (updated)

**Changes from Proposed:**
- Added approval metadata
- Addressed review feedback
- Created implementation tasks
- Linked to Beads tasks

**Metadata Updates:**
```yaml
status: approved
approved_date: 2026-02-12
approved_by: ["tech-lead", "senior-architect", "ops-lead"]
related_tasks: ["bd-ms01", "bd-ms02", "bd-ms03", "bd-ms04"]
related_specs: ["openspec/changes/microservices-migration"]
```

**Review Feedback Addressed:**
1. ✅ Added rollback plan
2. ✅ Defined service SLAs
3. ✅ Created monitoring requirements
4. ✅ Documented data consistency strategy

**Implementation Tasks Created:**
- `bd-ms01`: Set up API gateway (Kong)
- `bd-ms02`: Migrate user service
- `bd-ms03`: Migrate payment service
- `bd-ms04`: Implement service mesh (Istio)

**Actions Taken:**
- Team approved decision
- Created implementation tasks in Beads
- Updated coordination manifest
- Began implementation planning

---

## Version 4: Implemented Status

**File:** `adr/0042-migrate-to-microservices.md` (updated)

**Changes from Approved:**
- Added implementation completion date
- Documented implementation notes
- Updated with actual outcomes
- Linked to deployed services

**Metadata Updates:**
```yaml
status: implemented
approved_date: 2026-02-12
implemented_date: 2026-03-15
implementation_notes: |
  Completed migration of user service and payment service.

  Services deployed:
  - user-service: https://api.example.com/users
  - payment-service: https://api.example.com/payments

  Infrastructure:
  - Kong API Gateway configured
  - Istio service mesh deployed
  - Prometheus + Grafana monitoring

  Metrics (first week):
  - User service: 99.9% uptime, avg response 45ms
  - Payment service: 99.95% uptime, avg response 120ms
  - Deployment time reduced from 45min to 8min
```

**Implementation Completed:**
- ✅ `bd-ms01`: API gateway deployed
- ✅ `bd-ms02`: User service migrated and deployed
- ✅ `bd-ms03`: Payment service migrated and deployed
- ✅ `bd-ms04`: Service mesh configured

**Actions Taken:**
- Marked all implementation tasks as complete
- Updated ADR with implementation notes
- Scheduled 3-month review
- Began monitoring consequences

---

## Version 5: Maintained Status

**File:** `adr/0042-migrate-to-microservices.md` (updated)

**Changes from Implemented:**
- Added review schedule
- Documented lessons learned
- Updated consequences with actual outcomes
- Added review notes

**Metadata Updates:**
```yaml
status: maintained
implemented_date: 2026-03-15
last_reviewed: 2026-06-01
next_review: 2027-02-01
review_frequency: annual
review_notes: |
  First review completed 3 months after implementation.

  Observed Benefits (as expected):
  - ✅ Deployment time: 45min → 8min (82% improvement)
  - ✅ Independent scaling working well
  - ✅ Team velocity increased 30%
  - ✅ Zero downtime deployments achieved

  Observed Benefits (unexpected):
  - ✅ Improved developer satisfaction
  - ✅ Better fault isolation than anticipated
  - ✅ Easier to onboard new developers

  Challenges (expected):
  - ⚠️ Operational complexity higher than estimated
  - ⚠️ Monitoring requires dedicated attention
  - ⚠️ Network latency between services

  Challenges (unexpected):
  - ⚠️ Data consistency more complex than planned
  - ⚠️ Testing distributed transactions difficult
  - ⚠️ Infrastructure costs 40% higher than budgeted

  Actions Taken:
  - Created ADR-0095: Monitoring and Observability Strategy
  - Created ADR-0096: Distributed Transaction Patterns
  - Scheduled cost optimization review

  Decision: Continue with microservices, address challenges
```

**Actions Taken:**
- Conducted first review
- Documented actual vs expected outcomes
- Created follow-up ADRs for challenges
- Scheduled annual review
- Updated team on findings

---

## Version 6: Superseded Status

**File:** `adr/0042-migrate-to-microservices.md` (updated)

**Changes from Maintained:**
- Marked as superseded
- Linked to superseding ADR
- Documented superseding reason
- Preserved historical context

**Metadata Updates:**
```yaml
status: superseded
implemented_date: 2026-03-15
last_reviewed: 2027-05-15
superseded_date: 2027-06-01
superseded_by: adr-0089
superseded_reason: |
  After 15 months of operation, team decided to migrate back to
  modular monolith architecture. See ADR-0089 for details.

  Key factors in decision reversal:
  - Operational costs 60% higher than monolith
  - Team size (20 developers) not large enough to justify complexity
  - Most services don't need independent scaling
  - Distributed system complexity outweighed benefits

  Lessons learned preserved in ADR-0089.
```

**Final Status:**
- Decision reversed after 15 months
- Superseded by ADR-0089: "Migrate to Modular Monolith"
- Historical record preserved
- Lessons learned documented

**Actions Taken:**
- Created ADR-0089 with lessons learned
- Updated cross-references
- Preserved this ADR for historical context
- Shared findings with broader team

---

## Coordination Manifest Updates

Throughout the lifecycle, the `.augment/coordination.json` was updated to track relationships:

### Draft → Proposed
```json
{
  "adrs": {
    "adr-0042": {
      "status": "proposed",
      "file": "adr/0042-migrate-to-microservices.md",
      "relatedSpecs": [],
      "relatedTasks": []
    }
  }
}
```

### Approved → Implemented
```json
{
  "adrs": {
    "adr-0042": {
      "status": "implemented",
      "file": "adr/0042-migrate-to-microservices.md",
      "relatedSpecs": ["microservices-migration"],
      "relatedTasks": ["bd-ms01", "bd-ms02", "bd-ms03", "bd-ms04"],
      "affectedFiles": [
        "services/user-service/**",
        "services/payment-service/**",
        "infrastructure/kong/**",
        "infrastructure/istio/**"
      ]
    }
  },
  "specs": {
    "microservices-migration": {
      "relatedADRs": ["adr-0042"]
    }
  },
  "tasks": {
    "bd-ms01": { "relatedADRs": ["adr-0042"] },
    "bd-ms02": { "relatedADRs": ["adr-0042"] },
    "bd-ms03": { "relatedADRs": ["adr-0042"] },
    "bd-ms04": { "relatedADRs": ["adr-0042"] }
  }
}
```

### Superseded
```json
{
  "adrs": {
    "adr-0042": {
      "status": "superseded",
      "file": "adr/0042-migrate-to-microservices.md",
      "supersededBy": "adr-0089",
      "relatedSpecs": ["microservices-migration"],
      "relatedTasks": ["bd-ms01", "bd-ms02", "bd-ms03", "bd-ms04"]
    },
    "adr-0089": {
      "status": "approved",
      "file": "adr/0089-modular-monolith.md",
      "supersedes": "adr-0042",
      "relatedSpecs": ["modular-monolith-migration"]
    }
  }
}
```

---

## Key Takeaways

### Status Transitions

1. **Draft → Proposed**: Complete all sections, identify reviewers
2. **Proposed → Approved**: Address feedback, create implementation tasks
3. **Approved → Implemented**: Complete tasks, document outcomes
4. **Implemented → Maintained**: Review consequences, schedule ongoing reviews
5. **Maintained → Superseded**: Create superseding ADR, document reasons

### Best Practices Demonstrated

1. ✅ **Incremental Updates**: Each status change adds metadata
2. ✅ **Traceability**: Links to specs, tasks, and related ADRs
3. ✅ **Lessons Learned**: Documented actual vs expected outcomes
4. ✅ **Historical Context**: Preserved even after superseding
5. ✅ **Coordination**: Manifest kept in sync throughout lifecycle

### Common Pitfalls Avoided

1. ❌ Skipping status transitions (e.g., draft → implemented)
2. ❌ Not documenting actual outcomes
3. ❌ Deleting superseded ADRs
4. ❌ Not linking to implementation tasks
5. ❌ Forgetting to schedule reviews

---

## See Also

- [Lifecycle Management Rules](../rules/lifecycle-management.md)
- [ADR Creation Guidelines](../rules/adr-creation.md)
- [Validation Rules](../rules/validation-rules.md)
- [Nygard Template](../templates/nygard.md)
- [Superseding Example](./superseding-example.md)
- [Integration Example](./integration-example.md)

