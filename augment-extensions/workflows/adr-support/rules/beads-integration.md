# Beads Integration Rules

## Overview

This document defines how Architecture Decision Records (ADRs) integrate with Beads task tracking, including task creation from ADRs, linking tasks to ADRs, status updates, and workflow coordination.

## Integration Points

### 1. Tasks from ADRs

When ADRs require implementation work:

```
ADR Approved
  ↓
Create Implementation Tasks
  ↓
Link Tasks to ADR
  ↓
Track Progress
  ↓
Update ADR Status when Complete
```

### 2. ADRs from Tasks

When tasks reveal architectural decisions:

```
Working on Task
  ↓
Architectural Decision Identified
  ↓
Create ADR
  ↓
Link ADR to Task
  ↓
Document Decision
```

## Linking ADRs to Tasks

### In ADR Metadata

```yaml
---
id: adr-0042
title: "Migrate to Microservices Architecture"
status: approved
date: 2026-02-05
related_tasks:
  - "bd-ms01"  # Create user service
  - "bd-ms02"  # Create payment service
  - "bd-ms03"  # Set up service mesh
implementation_epic: "bd-ms00"  # Parent epic task
---
```

### In Beads Task

```bash
# Create task with ADR reference
bd create "Implement user microservice" \
  --description "Implement user service as defined in ADR-0042: Migrate to Microservices Architecture" \
  --labels "adr-0042,microservices,implementation"

# Add comment linking to ADR
bd comment bd-ms01 "Implementing ADR-0042: Migrate to Microservices (adr/0042-migrate-to-microservices.md)"
```

### In Coordination Manifest

```json
{
  "adrs": {
    "adr-0042": {
      "file": "adr/0042-migrate-to-microservices.md",
      "status": "approved",
      "relatedTasks": ["bd-ms00", "bd-ms01", "bd-ms02", "bd-ms03"],
      "implementationProgress": "in_progress"
    }
  },
  "tasks": {
    "bd-ms01": {
      "title": "Create user microservice",
      "status": "in_progress",
      "relatedADRs": ["adr-0042"],
      "relatedSpecs": ["architecture/microservices"]
    }
  }
}
```

## Task Creation from ADRs

### Automatic Task Generation

When ADR is approved, AI agent should prompt to create implementation tasks:

```
ADR-0042 has been approved: "Migrate to Microservices Architecture"

Would you like me to create implementation tasks?

Suggested tasks based on ADR:
1. Create user microservice (bd-ms01)
2. Create payment microservice (bd-ms02)
3. Set up service mesh (bd-ms03)
4. Implement API gateway (bd-ms04)
5. Set up monitoring (bd-ms05)

[Create All] [Select Tasks] [Skip]
```

### Task Template from ADR

```typescript
function generateTasksFromADR(adr: ADR): Task[] {
  const tasks = [];
  
  // Create epic task
  const epic = {
    id: generateTaskId(),
    title: `Implement ${adr.title}`,
    description: `Epic task for implementing ADR-${adr.id}`,
    type: 'epic',
    labels: [`adr-${adr.id}`, 'implementation'],
    related_adrs: [adr.id]
  };
  tasks.push(epic);
  
  // Extract implementation steps from ADR
  const steps = extractImplementationSteps(adr);
  steps.forEach((step, index) => {
    tasks.push({
      id: generateTaskId(),
      title: step.title,
      description: `${step.description}\n\nPart of ADR-${adr.id}: ${adr.title}`,
      type: 'task',
      parent: epic.id,
      labels: [`adr-${adr.id}`, 'implementation'],
      related_adrs: [adr.id]
    });
  });
  
  return tasks;
}
```

### Manual Task Creation

```bash
# Create epic for ADR implementation
bd create "Implement ADR-0042: Migrate to Microservices" \
  --type epic \
  --labels "adr-0042,architecture,microservices"

# Create subtasks
bd create "Create user microservice" \
  --parent bd-ms00 \
  --labels "adr-0042,microservices" \
  --description "Implement user service as defined in ADR-0042"

bd create "Create payment microservice" \
  --parent bd-ms00 \
  --labels "adr-0042,microservices" \
  --description "Implement payment service as defined in ADR-0042"
```

## Status Synchronization

### ADR Status from Task Progress

Update ADR status based on task completion:

```typescript
function updateADRFromTasks(adrId: string) {
  const adr = loadADR(adrId);
  const tasks = loadTasksByADR(adrId);
  
  // Calculate progress
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'closed').length;
  const progress = completed / total;
  
  // Update ADR status
  if (progress === 0 && adr.status === 'approved') {
    // No change needed
  } else if (progress > 0 && progress < 1 && adr.status === 'approved') {
    // Implementation started
    updateADRStatus(adrId, 'implemented', {
      implementation_notes: `Implementation in progress (${completed}/${total} tasks completed)`
    });
  } else if (progress === 1 && adr.status === 'implemented') {
    // All tasks complete, move to maintained
    updateADRStatus(adrId, 'maintained', {
      implemented_date: new Date().toISOString(),
      implementation_notes: `All ${total} implementation tasks completed`
    });
  }
}
```

### Task Updates from ADR Changes

When ADR status changes, update related tasks:

```typescript
function updateTasksFromADR(adr: ADR, oldStatus: string, newStatus: string) {
  const tasks = loadTasksByADR(adr.id);
  
  if (newStatus === 'superseded') {
    // ADR superseded, close related tasks
    tasks.forEach(task => {
      if (task.status !== 'closed') {
        bd.close(task.id, `ADR-${adr.id} superseded by ADR-${adr.superseded_by}`);
      }
    });
  }
  
  if (newStatus === 'approved' && oldStatus === 'proposed') {
    // ADR approved, tasks can now be started
    tasks.forEach(task => {
      bd.comment(task.id, `ADR-${adr.id} approved, implementation can begin`);
    });
  }
}
```

## Workflow Integration Patterns

### Pattern 1: ADR-Driven Development

**Use when:** Clear architectural decision drives implementation work.

```
1. Create ADR (draft)
2. Evaluate alternatives
3. Approve ADR
4. Generate implementation tasks from ADR
5. Work on tasks
6. Update ADR as implementation progresses
7. Mark ADR as maintained when complete
```

**Example:**
```bash
# Step 1-3: Create and approve ADR
# ADR-0042: Migrate to Microservices

# Step 4: Generate tasks
bd create "Implement ADR-0042: Migrate to Microservices" --type epic
bd create "Create user service" --parent bd-ms00 --labels "adr-0042"
bd create "Create payment service" --parent bd-ms00 --labels "adr-0042"

# Step 5-6: Work on tasks, update ADR
bd start bd-ms01
# ... implementation work ...
bd close bd-ms01 "User service implemented"

# Step 7: All tasks complete, update ADR
# ADR status: approved → implemented → maintained
```

### Pattern 2: Task-Discovered ADR

**Use when:** Architectural decision emerges during task work.

```
1. Working on task
2. Identify architectural decision needed
3. Create ADR (draft)
4. Link ADR to current task
5. Evaluate alternatives
6. Approve ADR
7. Continue task with approved decision
8. Update task with ADR reference
```

**Example:**
```bash
# Step 1: Working on task
bd start bd-cache01 "Implement caching layer"

# Step 2-4: Decision needed, create ADR
# Created ADR-0045: Use Redis for Caching
bd comment bd-cache01 "Created ADR-0045 to document caching decision"

# Step 5-6: Evaluate and approve ADR

# Step 7-8: Continue with approved decision
bd comment bd-cache01 "Implementing Redis caching per ADR-0045"
bd close bd-cache01 "Caching implemented using Redis (ADR-0045)"
```

### Pattern 3: Epic with Multiple ADRs

**Use when:** Large initiative requires multiple architectural decisions.

```
1. Create epic task
2. Break down into subtasks
3. Identify architectural decisions needed
4. Create ADRs for each decision
5. Link ADRs to epic and subtasks
6. Approve ADRs
7. Implement subtasks
8. Update ADRs as work completes
```

**Example:**
```bash
# Step 1-2: Create epic and subtasks
bd create "Modernize authentication system" --type epic
bd create "Replace session storage" --parent bd-auth00
bd create "Implement OAuth2" --parent bd-auth00
bd create "Add MFA support" --parent bd-auth00

# Step 3-5: Create and link ADRs
# ADR-0050: Use Redis for Session Storage (linked to bd-auth01)
# ADR-0051: Use Auth0 for OAuth2 (linked to bd-auth02)
# ADR-0052: Use TOTP for MFA (linked to bd-auth03)

bd comment bd-auth00 "Architectural decisions: ADR-0050, ADR-0051, ADR-0052"
```

## Task Labels for ADRs

### Standard Labels

Use consistent labels to link tasks to ADRs:

```bash
# ADR reference label
--labels "adr-0042"

# Implementation phase label
--labels "adr-0042,implementation"

# ADR category labels
--labels "adr-0042,architecture"
--labels "adr-0045,infrastructure"
--labels "adr-0050,security"
```

### Querying Tasks by ADR

```bash
# Find all tasks for an ADR
bd list --labels "adr-0042"

# Find open tasks for an ADR
bd list --labels "adr-0042" --status open

# Find implementation tasks
bd list --labels "implementation" --status in_progress
```

## Progress Tracking

### ADR Implementation Dashboard

Track ADR implementation progress:

```typescript
function getADRImplementationStatus(adrId: string) {
  const adr = loadADR(adrId);
  const tasks = loadTasksByADR(adrId);
  
  return {
    adr: {
      id: adr.id,
      title: adr.title,
      status: adr.status
    },
    tasks: {
      total: tasks.length,
      open: tasks.filter(t => t.status === 'open').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      closed: tasks.filter(t => t.status === 'closed').length
    },
    progress: tasks.filter(t => t.status === 'closed').length / tasks.length
  };
}
```

### Reporting

```bash
# Generate ADR implementation report
bd report --adr adr-0042

# Output:
# ADR-0042: Migrate to Microservices Architecture
# Status: implemented
# Progress: 3/5 tasks completed (60%)
# 
# Tasks:
# ✓ bd-ms01: Create user service (closed)
# ✓ bd-ms02: Create payment service (closed)
# ✓ bd-ms03: Set up service mesh (closed)
# ○ bd-ms04: Implement API gateway (in_progress)
# ○ bd-ms05: Set up monitoring (open)
```

## Best Practices

1. **Create Epic for Complex ADRs**
   - Use epic task to group related work
   - Link epic to ADR
   - Break down into subtasks

2. **Use Consistent Labels**
   - Always use `adr-NNNN` label format
   - Add category labels (architecture, infrastructure, etc.)
   - Include implementation phase labels

3. **Keep Tasks and ADRs in Sync**
   - Update ADR when tasks complete
   - Update tasks when ADR status changes
   - Use coordination manifest for tracking

4. **Document Decisions in Tasks**
   - Reference ADR in task description
   - Add comments linking to ADR
   - Explain how task implements ADR

5. **Track Progress Actively**
   - Review ADR implementation status regularly
   - Update ADR with implementation notes
   - Close tasks promptly when complete

## Examples

See [examples/integration-example.md](../examples/integration-example.md) for complete workflow example.

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [OpenSpec Integration](./openspec-integration.md)
- [Lifecycle Management](./lifecycle-management.md)
- [Coordination System](../../../../.augment-guidelines/system-integration/coordination-system.md)

