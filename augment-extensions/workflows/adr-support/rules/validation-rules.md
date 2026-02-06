# ADR Validation Rules

## Overview

This document defines validation and completeness checks for Architecture Decision Records (ADRs). These rules ensure ADRs are well-formed, complete, and useful for their intended purpose.

## Validation Levels

### Level 1: Structural Validation (Required)

Must pass before ADR can be created or status changed.

### Level 2: Content Validation (Warning)

Should pass for quality, but won't block creation.

### Level 3: Reference Validation (Warning)

Validates links and references, warns if broken.

## Structural Validation Rules

### Metadata Validation

#### Required Fields

**Rule:** All required metadata fields must be present and valid.

```yaml
---
id: adr-NNNN              # Required: Format adr-NNNN
title: "Decision Title"   # Required: 10-100 characters
status: proposed          # Required: Valid status value
date: 2026-02-05         # Required: ISO 8601 format
deciders: ["person"]     # Required: At least one decider
---
```

**Validation Checks:**

```typescript
function validateMetadata(adr: ADR): ValidationResult {
  const errors = [];
  
  // ID validation
  if (!adr.id) {
    errors.push("Missing required field: id");
  } else if (!/^adr-\d{4}$/.test(adr.id)) {
    errors.push("Invalid ID format. Must be adr-NNNN (e.g., adr-0001)");
  }
  
  // Title validation
  if (!adr.title) {
    errors.push("Missing required field: title");
  } else if (adr.title.length < 10 || adr.title.length > 100) {
    errors.push("Title must be 10-100 characters");
  }
  
  // Status validation
  const validStatuses = ['draft', 'proposed', 'approved', 'implemented', 'maintained', 'superseded', 'sunset'];
  if (!adr.status) {
    errors.push("Missing required field: status");
  } else if (!validStatuses.includes(adr.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Date validation
  if (!adr.date) {
    errors.push("Missing required field: date");
  } else if (!isValidISO8601(adr.date)) {
    errors.push("Invalid date format. Must be ISO 8601 (YYYY-MM-DD)");
  }
  
  // Deciders validation
  if (!adr.deciders || adr.deciders.length === 0) {
    errors.push("At least one decider must be specified");
  }
  
  return { valid: errors.length === 0, errors };
}
```

#### Optional Fields Validation

**Rule:** Optional fields, if present, must be valid.

```typescript
function validateOptionalFields(adr: ADR): ValidationResult {
  const warnings = [];
  
  // Tags validation
  if (adr.tags && !Array.isArray(adr.tags)) {
    warnings.push("Tags must be an array");
  }
  
  // Supersedes validation
  if (adr.supersedes) {
    if (!Array.isArray(adr.supersedes)) {
      warnings.push("Supersedes must be an array");
    } else {
      adr.supersedes.forEach(id => {
        if (!/^adr-\d{4}$/.test(id)) {
          warnings.push(`Invalid ADR ID in supersedes: ${id}`);
        }
      });
    }
  }
  
  // Superseded_by validation
  if (adr.superseded_by && !/^adr-\d{4}$/.test(adr.superseded_by)) {
    warnings.push(`Invalid ADR ID in superseded_by: ${adr.superseded_by}`);
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

### File Naming Validation

**Rule:** ADR files must follow naming convention.

**Format:** `adr/NNNN-brief-title.md`

```typescript
function validateFileName(filePath: string): ValidationResult {
  const errors = [];
  const pattern = /^adr\/\d{4}-[a-z0-9-]+\.md$/;
  
  if (!pattern.test(filePath)) {
    errors.push("Invalid file name. Must be adr/NNNN-brief-title.md");
  }
  
  // Extract number from filename
  const match = filePath.match(/^adr\/(\d{4})-/);
  if (match) {
    const fileNumber = match[1];
    // Should match ID in metadata
    // (checked in cross-validation)
  }
  
  return { valid: errors.length === 0, errors };
}
```

## Content Validation Rules

### Required Sections

**Rule:** ADRs must contain required sections based on template.

#### Nygard Template Requirements

```markdown
# Title

## Status
[Must be present and match metadata]

## Context
[Must be present and non-empty]

## Decision
[Must be present and non-empty]

## Consequences
[Must be present and non-empty]
```

**Validation:**

```typescript
function validateNygardContent(content: string): ValidationResult {
  const warnings = [];
  
  if (!content.includes('## Status')) {
    warnings.push("Missing required section: Status");
  }
  
  if (!content.includes('## Context')) {
    warnings.push("Missing required section: Context");
  }
  
  if (!content.includes('## Decision')) {
    warnings.push("Missing required section: Decision");
  }
  
  if (!content.includes('## Consequences')) {
    warnings.push("Missing required section: Consequences");
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

#### MADR Template Requirements

```markdown
# Title

## Context and Problem Statement
[Must be present and non-empty]

## Decision Drivers
[Must be present with at least one driver]

## Considered Options
[Must be present with at least one option]

## Decision Outcome
[Must be present and non-empty]

## Consequences
[Must be present and non-empty]
```

### Content Quality Checks

**Rule:** Content should be meaningful, not placeholder text.

```typescript
function validateContentQuality(content: string): ValidationResult {
  const warnings = [];
  
  // Check for placeholder text
  const placeholders = ['TODO', 'TBD', 'FIXME', 'XXX', '[Insert', 'Lorem ipsum'];
  placeholders.forEach(placeholder => {
    if (content.includes(placeholder)) {
      warnings.push(`Contains placeholder text: ${placeholder}`);
    }
  });
  
  // Check for minimum content length
  const sections = extractSections(content);
  Object.entries(sections).forEach(([section, text]) => {
    if (text.trim().length < 50) {
      warnings.push(`Section "${section}" is too brief (< 50 characters)`);
    }
  });
  
  return { valid: warnings.length === 0, warnings };
}
```

### Context Section Validation

**Rule:** Context should explain "why" not "how".

```typescript
function validateContext(context: string): ValidationResult {
  const warnings = [];
  
  // Should contain problem statement
  const problemIndicators = ['problem', 'issue', 'challenge', 'need', 'requirement'];
  const hasProblem = problemIndicators.some(word => 
    context.toLowerCase().includes(word)
  );
  
  if (!hasProblem) {
    warnings.push("Context should clearly state the problem or need");
  }
  
  // Should not be too implementation-focused
  const implDetails = ['function', 'class', 'variable', 'line', 'file'];
  const tooDetailed = implDetails.filter(word => 
    context.toLowerCase().includes(word)
  ).length > 2;
  
  if (tooDetailed) {
    warnings.push("Context contains too many implementation details. Focus on 'why' not 'how'");
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

### Decision Section Validation

**Rule:** Decision should clearly state what is being done.

```typescript
function validateDecision(decision: string): ValidationResult {
  const warnings = [];
  
  // Should contain action verbs
  const actionVerbs = ['will', 'use', 'adopt', 'implement', 'migrate', 'choose', 'select'];
  const hasAction = actionVerbs.some(verb => 
    decision.toLowerCase().includes(verb)
  );
  
  if (!hasAction) {
    warnings.push("Decision should clearly state what action is being taken");
  }
  
  // Should not be a question
  if (decision.includes('?')) {
    warnings.push("Decision should be a statement, not a question");
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

### Consequences Section Validation

**Rule:** Consequences should cover both positive and negative outcomes.

```typescript
function validateConsequences(consequences: string): ValidationResult {
  const warnings = [];
  
  // Should have positive consequences
  const positiveIndicators = ['benefit', 'advantage', 'pro', 'positive', 'improve'];
  const hasPositive = positiveIndicators.some(word => 
    consequences.toLowerCase().includes(word)
  );
  
  // Should have negative consequences
  const negativeIndicators = ['cost', 'risk', 'con', 'negative', 'trade-off', 'challenge'];
  const hasNegative = negativeIndicators.some(word => 
    consequences.toLowerCase().includes(word)
  );
  
  if (!hasPositive) {
    warnings.push("Consequences should include positive outcomes");
  }
  
  if (!hasNegative) {
    warnings.push("Consequences should include negative outcomes or trade-offs");
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

## Reference Validation Rules

### ADR Reference Validation

**Rule:** Referenced ADRs must exist.

```typescript
function validateADRReferences(adr: ADR, allADRs: ADR[]): ValidationResult {
  const warnings = [];
  const adrIds = new Set(allADRs.map(a => a.id));
  
  // Validate supersedes references
  if (adr.supersedes) {
    adr.supersedes.forEach(id => {
      if (!adrIds.has(id)) {
        warnings.push(`Referenced ADR does not exist: ${id}`);
      }
    });
  }
  
  // Validate superseded_by reference
  if (adr.superseded_by && !adrIds.has(adr.superseded_by)) {
    warnings.push(`Referenced ADR does not exist: ${adr.superseded_by}`);
  }
  
  // Validate related_decisions
  if (adr.related_decisions) {
    adr.related_decisions.forEach(id => {
      if (!adrIds.has(id)) {
        warnings.push(`Related ADR does not exist: ${id}`);
      }
    });
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

### Spec Reference Validation

**Rule:** Referenced specs should exist.

```typescript
function validateSpecReferences(adr: ADR): ValidationResult {
  const warnings = [];
  
  if (adr.related_specs) {
    adr.related_specs.forEach(specPath => {
      if (!fileExists(specPath)) {
        warnings.push(`Referenced spec does not exist: ${specPath}`);
      }
    });
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

### Task Reference Validation

**Rule:** Referenced tasks should exist.

```typescript
function validateTaskReferences(adr: ADR): ValidationResult {
  const warnings = [];
  
  if (adr.related_tasks) {
    adr.related_tasks.forEach(taskId => {
      if (!taskExists(taskId)) {
        warnings.push(`Referenced task does not exist: ${taskId}`);
      }
    });
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

## Status Transition Validation

**Rule:** Status transitions must be valid.

See [Lifecycle Management](./lifecycle-management.md) for detailed transition rules.

```typescript
function validateStatusTransition(currentStatus: string, newStatus: string): ValidationResult {
  const validTransitions = {
    'draft': ['proposed'],
    'proposed': ['approved', 'draft'],
    'approved': ['implemented', 'proposed'],
    'implemented': ['maintained', 'superseded'],
    'maintained': ['superseded', 'sunset'],
    'superseded': [],
    'sunset': []
  };
  
  const errors = [];
  const allowed = validTransitions[currentStatus] || [];
  
  if (!allowed.includes(newStatus)) {
    errors.push(`Invalid transition from ${currentStatus} to ${newStatus}`);
  }
  
  return { valid: errors.length === 0, errors };
}
```

## Completeness Criteria

### Draft Completeness

**Minimum requirements for draft status:**
- [ ] Valid metadata
- [ ] Title present
- [ ] At least one section started

### Proposed Completeness

**Requirements for proposed status:**
- [ ] All required sections present
- [ ] Context explains problem
- [ ] Decision stated clearly
- [ ] Consequences documented
- [ ] No placeholder text
- [ ] Reviewers identified

### Approved Completeness

**Requirements for approved status:**
- [ ] All proposed requirements met
- [ ] Approvers documented
- [ ] Approval date recorded
- [ ] Implementation tasks created (if applicable)

### Implemented Completeness

**Requirements for implemented status:**
- [ ] All approved requirements met
- [ ] Implementation date recorded
- [ ] Implementation notes added
- [ ] Related tasks completed

## Validation Workflow

### Pre-Creation Validation

```
User creates ADR
  ↓
Validate metadata (Level 1)
  ├─ Fail → Show errors, block creation
  └─ Pass → Continue
       ↓
Validate content (Level 2)
  ├─ Warnings → Show warnings, allow creation
  └─ Pass → Continue
       ↓
Create ADR file
```

### Pre-Status-Change Validation

```
User changes status
  ↓
Validate transition (Level 1)
  ├─ Fail → Show errors, block change
  └─ Pass → Continue
       ↓
Validate completeness (Level 2)
  ├─ Warnings → Show warnings, allow change
  └─ Pass → Continue
       ↓
Update status
```

## Best Practices

1. **Validate Early**
   - Check metadata before content
   - Fail fast on structural issues
   - Provide clear error messages

2. **Warn, Don't Block (for quality)**
   - Content quality is subjective
   - Allow user override
   - Educate through warnings

3. **Validate References Lazily**
   - Don't block on broken references
   - Warn and allow fixing later
   - Provide tools to find broken links

4. **Provide Helpful Messages**
   - Explain what's wrong
   - Suggest how to fix
   - Link to documentation

5. **Support Incremental Improvement**
   - Allow draft ADRs to be incomplete
   - Enforce completeness at status transitions
   - Enable iterative refinement

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [Lifecycle Management](./lifecycle-management.md)
- [Template Selection](./template-selection.md)

