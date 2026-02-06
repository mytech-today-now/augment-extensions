# ADR Lifecycle Management

## Overview

This document defines the lifecycle of Architecture Decision Records (ADRs), including status transitions, validation rules, and review scheduling.

## ADR Lifecycle States

```
draft → proposed → approved → implemented → maintained
                                              ↓
                                         superseded
                                              ↓
                                           sunset
```

### State Definitions

#### 1. **Draft**
- **Purpose**: Initial creation, work in progress
- **Who**: Decision author
- **Duration**: Hours to days
- **Characteristics**:
  - May be incomplete
  - Under active editing
  - Not yet ready for review
  - Can be deleted without ceremony

**Example:**
```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: draft
date: 2026-02-05
---
```

#### 2. **Proposed**
- **Purpose**: Ready for review and decision
- **Who**: Decision author + stakeholders
- **Duration**: Days to weeks
- **Characteristics**:
  - Complete and well-documented
  - Awaiting team review
  - Open for feedback
  - May be revised based on feedback

**Example:**
```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: proposed
date: 2026-02-05
review_by: 2026-02-12
reviewers: ["tech-lead", "architect", "team"]
---
```

#### 3. **Approved**
- **Purpose**: Decision accepted, ready for implementation
- **Who**: Decision makers
- **Duration**: Days to months (until implemented)
- **Characteristics**:
  - Team consensus reached
  - Implementation can begin
  - Changes require re-approval
  - Linked to implementation tasks

**Example:**
```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: approved
date: 2026-02-05
approved_date: 2026-02-12
approved_by: ["tech-lead", "architect"]
related_tasks: ["bd-ms01", "bd-ms02", "bd-ms03"]
---
```

#### 4. **Implemented**
- **Purpose**: Decision has been implemented
- **Who**: Development team
- **Duration**: Months to years (active use)
- **Characteristics**:
  - Code changes completed
  - Decision is in production
  - Consequences can be observed
  - May need updates based on outcomes

**Example:**
```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: implemented
date: 2026-02-05
approved_date: 2026-02-12
implemented_date: 2026-03-15
implementation_notes: "Completed migration of user service and payment service"
---
```

#### 5. **Maintained**
- **Purpose**: Long-term active decision with ongoing updates
- **Who**: Team
- **Duration**: Years
- **Characteristics**:
  - Regularly reviewed
  - Updated with lessons learned
  - Consequences documented
  - May spawn related ADRs

**Example:**
```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: maintained
date: 2026-02-05
implemented_date: 2026-03-15
last_reviewed: 2026-08-01
next_review: 2027-02-01
review_notes: "Architecture working well, documented scaling challenges"
---
```

#### 6. **Superseded**
- **Purpose**: Decision replaced by newer decision
- **Who**: Team
- **Duration**: Permanent (historical record)
- **Characteristics**:
  - No longer active
  - Replaced by another ADR
  - Kept for historical context
  - Links to superseding ADR

**Example:**
```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: superseded
date: 2026-02-05
implemented_date: 2026-03-15
superseded_date: 2027-06-01
superseded_by: adr-0089
superseded_reason: "Migrating back to modular monolith for operational simplicity"
---
```

#### 7. **Sunset**
- **Purpose**: Decision no longer relevant
- **Who**: Team
- **Duration**: Permanent (historical record)
- **Characteristics**:
  - Technology/approach no longer used
  - Not replaced by another decision
  - Archived for reference
  - Documents why it's no longer relevant

**Example:**
```yaml
---
id: adr-0015
title: "Use Flash for Video Playback"
status: sunset
date: 2015-03-01
implemented_date: 2015-04-01
sunset_date: 2020-12-31
sunset_reason: "Flash deprecated and removed from browsers"
---
```

## Status Transition Rules

### Valid Transitions

```
draft → proposed ✓
draft → [deleted] ✓

proposed → approved ✓
proposed → draft ✓
proposed → rejected ✓

approved → implemented ✓
approved → proposed ✓ (if changes needed)

implemented → maintained ✓
implemented → superseded ✓

maintained → superseded ✓
maintained → sunset ✓

superseded → [no transitions] (terminal state)
sunset → [no transitions] (terminal state)
```

### Invalid Transitions

```
draft → implemented ✗ (must be approved first)
proposed → superseded ✗ (must be implemented first)
implemented → draft ✗ (can't go backward)
superseded → approved ✗ (terminal state)
```

### Transition Validation

When transitioning status, validate:

#### draft → proposed
- [ ] All required sections complete
- [ ] Context clearly documented
- [ ] Decision stated
- [ ] Consequences documented
- [ ] Reviewers identified

#### proposed → approved
- [ ] Review period completed
- [ ] Approvers documented
- [ ] Feedback addressed
- [ ] Implementation tasks created

#### approved → implemented
- [ ] Implementation tasks completed
- [ ] Code changes merged
- [ ] Implementation date recorded
- [ ] Implementation notes added

#### implemented → maintained
- [ ] Initial review completed
- [ ] Consequences validated
- [ ] Next review scheduled
- [ ] Lessons learned documented

#### maintained → superseded
- [ ] Superseding ADR created
- [ ] Superseding ADR approved
- [ ] Superseded reason documented
- [ ] Cross-references updated

#### maintained → sunset
- [ ] Sunset reason documented
- [ ] Sunset date recorded
- [ ] Related ADRs updated
- [ ] Historical context preserved

## Review Scheduling

### Review Triggers

ADRs should be reviewed when:

1. **Time-Based**
   - Proposed: Before review_by date
   - Implemented: 3 months after implementation
   - Maintained: Annually or as configured

2. **Event-Based**
   - Major version upgrades
   - Architecture changes
   - Performance issues
   - Security incidents

3. **Workflow-Based**
   - Sprint retrospectives
   - Architecture review meetings
   - Quarterly planning

### Review Process

**Step 1: Schedule Review**
```yaml
---
status: maintained
last_reviewed: 2026-02-01
next_review: 2027-02-01
review_frequency: annual
---
```

**Step 2: Conduct Review**
- Validate decision still relevant
- Check if consequences match reality
- Identify lessons learned
- Determine if update needed

**Step 3: Update ADR**
```yaml
---
status: maintained
last_reviewed: 2027-02-01
next_review: 2028-02-01
review_notes: |
  Decision still valid. Observed benefits:
  - Improved scalability as expected
  - Team productivity increased
  
  Unexpected challenges:
  - Operational complexity higher than anticipated
  - Need better monitoring tools
  
  Actions:
  - Created ADR-0095 for monitoring strategy
---
```

**Step 4: Take Action**
- Update status if needed
- Create new ADRs for related decisions
- Link to related specs/tasks
- Schedule next review

## Automation Guidelines

### AI Agent Responsibilities

#### Status Transition Detection

Automatically detect when status should change:

```typescript
// Example: Detect implementation completion
if (allTasksCompleted(adr.related_tasks) && adr.status === 'approved') {
  promptStatusTransition(adr, 'implemented');
}
```

#### Review Reminders

Prompt for reviews when due:

```typescript
// Example: Review reminder
if (isReviewDue(adr)) {
  notifyReviewDue(adr);
}
```

#### Validation Enforcement

Validate transitions before allowing:

```typescript
// Example: Transition validation
function validateTransition(adr, newStatus) {
  const rules = transitionRules[adr.status][newStatus];
  return rules.every(rule => rule.validate(adr));
}
```

## Best Practices

1. **Keep Status Current**
   - Update status promptly
   - Don't skip states
   - Document transition reasons

2. **Review Regularly**
   - Schedule reviews
   - Actually conduct them
   - Document findings

3. **Link to Work**
   - Connect ADRs to tasks
   - Track implementation progress
   - Update when work completes

4. **Preserve History**
   - Don't delete superseded ADRs
   - Document why decisions changed
   - Maintain cross-references

5. **Learn from Outcomes**
   - Compare expected vs actual consequences
   - Document lessons learned
   - Share insights with team

## Examples

### Example 1: Full Lifecycle

```markdown
# ADR-0042: Migrate to Microservices

## Timeline

- 2026-02-05: Created (draft)
- 2026-02-08: Proposed for review
- 2026-02-12: Approved by team
- 2026-03-15: Implemented (first services migrated)
- 2026-06-01: Moved to maintained (initial review)
- 2027-06-01: Superseded by ADR-0089 (return to monolith)

## Status History

### Draft (2026-02-05)
Initial creation, gathering context and alternatives.

### Proposed (2026-02-08)
Completed documentation, sent for team review.

### Approved (2026-02-12)
Team approved after addressing concerns about operational complexity.

### Implemented (2026-03-15)
Migrated user service and payment service to microservices.

### Maintained (2026-06-01)
First review completed. Benefits realized but operational costs higher than expected.

### Superseded (2027-06-01)
Decision reversed due to operational complexity. See ADR-0089.
```

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [Validation Rules](./validation-rules.md)
- [OpenSpec Integration](./openspec-integration.md)
- [Beads Integration](./beads-integration.md)

