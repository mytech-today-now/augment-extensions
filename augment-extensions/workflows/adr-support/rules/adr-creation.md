# ADR Creation Guidelines

## Overview

This document defines the process for creating Architecture Decision Records (ADRs), including automation, metadata generation, context extraction, and file creation workflow.

## Creation Workflow

### Step 1: Initiate ADR Creation

ADRs can be created through:

1. **Automatic Detection** - AI agent detects decision and prompts user
2. **Manual Request** - User explicitly requests ADR creation
3. **Workflow Integration** - Created as part of OpenSpec/Beads workflow

### Step 2: Gather Decision Information

Collect the following information:

#### Required Information
- **Title**: Brief, descriptive decision title
- **Status**: Initial status (usually "draft" or "proposed")
- **Decision**: What are we doing?
- **Context**: Why are we making this decision?

#### Optional Information
- **Alternatives Considered**: What other options were evaluated?
- **Consequences**: What are the expected outcomes?
- **Related Decisions**: Links to other ADRs
- **Related Specs**: Links to OpenSpec documents
- **Related Tasks**: Links to Beads tasks

### Step 3: Select Template

Choose appropriate template based on decision type:

| Decision Type | Template | Use When |
|--------------|----------|----------|
| Simple, straightforward | Nygard | Quick decisions, clear context |
| Standard decision | MADR Simple | Most common use case |
| Complex with options | MADR Elaborate | Multiple alternatives evaluated |
| Cost/ROI focused | Business Case | Financial implications important |

See [Template Selection Rules](./template-selection.md) for detailed guidance.

### Step 4: Generate Metadata

Create frontmatter with required and optional fields:

```yaml
---
# Required fields
id: adr-NNNN
title: "Use PostgreSQL for Primary Database"
status: proposed
date: 2026-02-05
deciders: ["kyle@mytech.today", "team-lead"]

# Optional fields
tags: ["database", "infrastructure", "postgresql"]
supersedes: []
superseded_by: null
related_decisions: []
related_specs: ["openspec/specs/database/schema.md"]
related_tasks: ["bd-db01", "bd-db02"]
---
```

#### Metadata Field Definitions

**Required Fields:**
- `id`: Unique identifier (format: `adr-NNNN` where NNNN is zero-padded number)
- `title`: Descriptive title (50-80 characters)
- `status`: Current status (see [Lifecycle Management](./lifecycle-management.md))
- `date`: Creation date (ISO 8601 format: YYYY-MM-DD)
- `deciders`: Array of people who made/approved the decision

**Optional Fields:**
- `tags`: Array of relevant tags for categorization
- `supersedes`: Array of ADR IDs this decision replaces
- `superseded_by`: ADR ID that replaces this decision (null if active)
- `related_decisions`: Array of related ADR IDs
- `related_specs`: Array of OpenSpec file paths
- `related_tasks`: Array of Beads task IDs

### Step 5: Extract Context

Automatically extract context from:

#### Code Context
```typescript
// Example: Detecting database decision from code
const codeContext = {
  trigger: "New dependency: @prisma/client",
  files: ["package.json", "src/db/client.ts"],
  changes: "Added Prisma ORM for database access"
};
```

#### Conversation Context
```typescript
// Example: Extracting from conversation
const conversationContext = {
  problem: "Need type-safe database queries",
  alternatives: ["Prisma", "TypeORM", "Sequelize"],
  criteria: ["Type safety", "Performance", "Developer experience"]
};
```

#### Workflow Context
```typescript
// Example: From OpenSpec change
const workflowContext = {
  spec: "openspec/specs/database/schema.md",
  change: "openspec/changes/add-user-sessions/",
  tasks: ["bd-db01", "bd-db02"]
};
```

### Step 6: Create ADR File

#### File Naming Convention

```
adr/NNNN-brief-title.md
```

**Rules:**
- `NNNN`: Zero-padded sequential number (0001, 0002, etc.)
- `brief-title`: Lowercase, hyphen-separated, descriptive
- Maximum 50 characters for filename

**Examples:**
- `adr/0001-use-postgresql-database.md`
- `adr/0015-migrate-to-microservices.md`
- `adr/0042-implement-api-versioning.md`

#### File Location

ADRs are stored in the `adr/` directory at the repository root:

```
repository-root/
├── adr/
│   ├── 0001-use-postgresql-database.md
│   ├── 0002-implement-jwt-authentication.md
│   └── 0003-adopt-microservices-architecture.md
├── openspec/
├── .beads/
└── .augment/
```

### Step 7: Populate Template

Fill in the selected template with gathered information:

**Example (Nygard Template):**
```markdown
---
id: adr-0001
title: "Use PostgreSQL for Primary Database"
status: proposed
date: 2026-02-05
deciders: ["kyle@mytech.today"]
tags: ["database", "infrastructure"]
---

# Use PostgreSQL for Primary Database

## Status

Proposed

## Context

We need to select a primary database for our application. Requirements:
- ACID compliance for financial transactions
- JSON support for flexible data structures
- Strong community and ecosystem
- Proven scalability

Current situation: Using SQLite for development, need production database.

## Decision

We will use PostgreSQL as our primary database.

## Consequences

### Positive
- ACID compliance ensures data integrity
- JSONB support provides flexibility
- Excellent performance for our scale
- Strong TypeScript integration via Prisma

### Negative
- Requires PostgreSQL hosting (cost)
- Team needs to learn PostgreSQL-specific features
- More complex than SQLite for local development

### Neutral
- Need to set up connection pooling
- Requires migration from SQLite
```

## Automation Guidelines

### AI Agent Responsibilities

When creating ADRs, AI agents should:

1. **Auto-generate ID**
   - Find highest existing ADR number
   - Increment by 1
   - Zero-pad to 4 digits

2. **Auto-populate Metadata**
   - Set creation date to current date
   - Extract deciders from conversation/commits
   - Generate tags from decision context
   - Link related specs/tasks automatically

3. **Extract Context Automatically**
   - Parse code changes for technical context
   - Extract problem statement from conversation
   - Identify alternatives from discussion
   - Capture evaluation criteria

4. **Suggest Template**
   - Analyze decision complexity
   - Recommend appropriate template
   - Allow user override

5. **Validate Completeness**
   - Check required fields present
   - Verify context is clear
   - Ensure decision is stated
   - Validate consequences documented

### User Interaction

Provide clear prompts and options:

**Creation Prompt:**
```
I'll create an ADR for this decision. Let me gather some information:

1. Title: "Use PostgreSQL for Primary Database"
   [Edit] [Accept]

2. Template: MADR Simple (recommended for this decision)
   [Change] [Accept]

3. Context detected:
   - Problem: Need production database
   - Alternatives: PostgreSQL, MySQL, MongoDB
   - Criteria: ACID, JSON support, scalability
   [Edit] [Accept]

4. Related items:
   - Spec: openspec/specs/database/schema.md
   - Tasks: bd-db01, bd-db02
   [Edit] [Accept]

[Create ADR] [Cancel]
```

## Integration with Workflows

### OpenSpec Integration

When creating ADR from OpenSpec change:

1. Extract context from proposal.md
2. Link to spec files in change
3. Reference in coordination manifest
4. Update proposal with ADR link

**Example:**
```json
// .augment/coordination.json
{
  "adrs": {
    "adr-0001": {
      "file": "adr/0001-use-postgresql-database.md",
      "status": "proposed",
      "relatedSpecs": ["database/schema"],
      "relatedTasks": ["bd-db01", "bd-db02"]
    }
  }
}
```

### Beads Integration

When creating ADR from Beads task:

1. Extract context from task description
2. Link to related tasks
3. Add ADR reference to task comments
4. Update coordination manifest

**Example:**
```bash
# Add comment to task
bd comment bd-db01 "Documented in ADR-0001: Use PostgreSQL for Primary Database (adr/0001-use-postgresql-database.md)"
```

## Validation Rules

Before creating ADR file, validate:

### Required Validations
- [ ] Unique ID (no duplicates)
- [ ] Valid status value
- [ ] Title is descriptive (not generic)
- [ ] Date is valid ISO 8601
- [ ] At least one decider listed

### Content Validations
- [ ] Context section explains "why"
- [ ] Decision section states "what"
- [ ] Consequences section covers positive/negative
- [ ] No placeholder text (e.g., "TODO", "TBD")

### Reference Validations
- [ ] Related specs exist
- [ ] Related tasks exist
- [ ] Superseded ADRs exist and are valid

## Best Practices

1. **Create Early**
   - Document decisions when made, not later
   - Capture context while fresh
   - Don't wait for "perfect" documentation

2. **Be Concise**
   - Focus on "why" not "how"
   - Avoid implementation details
   - Keep it readable (< 500 words for simple decisions)

3. **Link Generously**
   - Connect to related ADRs
   - Link to specs and tasks
   - Reference external resources

4. **Update Status**
   - Keep status current
   - Document when implemented
   - Mark as superseded when replaced

5. **Review Regularly**
   - Revisit ADRs during retrospectives
   - Update consequences with actual outcomes
   - Archive obsolete decisions

## Examples

See [examples/](../examples/) directory for complete examples:
- [Simple Decision Example](../examples/simple-decision-example.md)
- [Complete Lifecycle Example](../examples/complete-lifecycle-example.md)
- [Integration Example](../examples/integration-example.md)

## See Also

- [Decision Detection Rules](./decision-detection.md)
- [Template Selection Rules](./template-selection.md)
- [Lifecycle Management](./lifecycle-management.md)
- [Validation Rules](./validation-rules.md)

