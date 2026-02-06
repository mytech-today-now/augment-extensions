# Template Selection Rules

## Overview

This document defines how to select the appropriate ADR template based on decision type, complexity, and context. Choosing the right template ensures ADRs are appropriately detailed without being overly burdensome.

## Available Templates

### 1. Michael Nygard Template (Nygard)

**File:** `templates/nygard.md`

**Structure:**
- Title
- Status
- Context
- Decision
- Consequences

**Best For:**
- Simple, straightforward decisions
- Quick decisions with clear context
- Decisions with obvious trade-offs
- When brevity is important

**Characteristics:**
- Minimal structure
- Fast to complete
- Easy to read
- Focuses on essentials

**Example Use Cases:**
- "Use PostgreSQL for primary database"
- "Adopt ESLint for code linting"
- "Use JWT for authentication tokens"

### 2. MADR Simple Template

**File:** `templates/madr-simple.md`

**Structure:**
- Title and metadata
- Context and Problem Statement
- Decision Drivers
- Considered Options
- Decision Outcome
- Consequences

**Best For:**
- Standard decisions (most common)
- Decisions with 2-4 alternatives
- When decision drivers are important
- Balanced detail level

**Characteristics:**
- Structured but not overwhelming
- Captures alternatives considered
- Documents decision drivers
- Good for team review

**Example Use Cases:**
- "Select state management library (Redux vs MobX vs Zustand)"
- "Choose deployment platform (AWS vs Azure vs GCP)"
- "Pick testing framework (Jest vs Vitest vs Mocha)"

### 3. MADR Elaborate Template

**File:** `templates/madr-elaborate.md`

**Structure:**
- Title and metadata
- Context and Problem Statement
- Decision Drivers
- Considered Options (with detailed pros/cons)
- Decision Outcome
- Validation
- Consequences
- Confirmation

**Best For:**
- Complex decisions with many alternatives
- High-stakes decisions
- Decisions requiring detailed analysis
- When stakeholder buy-in is critical

**Characteristics:**
- Comprehensive structure
- Detailed pros/cons for each option
- Validation and confirmation sections
- Takes more time to complete

**Example Use Cases:**
- "Migrate from monolith to microservices"
- "Select enterprise database (PostgreSQL vs Oracle vs SQL Server)"
- "Choose cloud provider for multi-year commitment"

### 4. Business Case Template

**File:** `templates/business-case.md`

**Structure:**
- Executive Summary
- Problem Statement
- Proposed Solution
- Cost Analysis
- ROI Projection
- Risk Assessment
- Implementation Plan
- Success Metrics

**Best For:**
- Decisions with significant cost implications
- When ROI justification is needed
- Vendor selection decisions
- Budget approval required

**Characteristics:**
- Business-focused language
- Financial analysis
- Risk/benefit quantification
- Executive-friendly format

**Example Use Cases:**
- "Purchase enterprise monitoring solution"
- "Hire dedicated DevOps team"
- "Migrate to cloud infrastructure"

## Selection Decision Tree

```
Start
  ↓
Does decision have significant cost/ROI implications?
  ├─ Yes → Business Case Template
  └─ No → Continue
       ↓
How many alternatives are being seriously considered?
  ├─ 1-2 → Continue
  │         ↓
  │    Is decision straightforward with clear trade-offs?
  │      ├─ Yes → Nygard Template
  │      └─ No → MADR Simple Template
  │
  └─ 3+ → Continue
           ↓
      Is this a high-stakes decision requiring detailed analysis?
        ├─ Yes → MADR Elaborate Template
        └─ No → MADR Simple Template
```

## Selection Criteria

### Complexity Assessment

**Low Complexity → Nygard**
- Single clear option
- Obvious trade-offs
- Limited stakeholders
- Low risk

**Medium Complexity → MADR Simple**
- 2-4 alternatives
- Multiple decision drivers
- Several stakeholders
- Moderate risk

**High Complexity → MADR Elaborate**
- 5+ alternatives
- Complex trade-offs
- Many stakeholders
- High risk/impact

**Financial Focus → Business Case**
- Significant cost
- ROI justification needed
- Budget approval required
- Executive stakeholders

### Decision Type Mapping

| Decision Type | Recommended Template | Rationale |
|--------------|---------------------|-----------|
| Technology selection (simple) | Nygard | Quick, clear choice |
| Technology selection (complex) | MADR Simple | Multiple options to evaluate |
| Architecture pattern | MADR Elaborate | High impact, needs analysis |
| Tool/library selection | MADR Simple | Standard evaluation process |
| Infrastructure change | MADR Simple or Elaborate | Depends on complexity |
| Vendor selection | Business Case | Cost and ROI important |
| Process change | Nygard or MADR Simple | Depends on impact |
| Security decision | MADR Elaborate | High stakes, needs detail |
| Performance optimization | Nygard or MADR Simple | Depends on scope |
| Deprecation decision | MADR Simple | Need to document alternatives |

### Stakeholder Considerations

**Few Stakeholders (1-3) → Nygard or MADR Simple**
- Faster consensus
- Less formal review needed
- Can iterate quickly

**Many Stakeholders (4+) → MADR Elaborate or Business Case**
- Need comprehensive documentation
- Formal review process
- Multiple perspectives to capture

### Time Constraints

**Urgent Decision → Nygard**
- Need to document quickly
- Can elaborate later if needed
- Focus on essentials

**Standard Timeline → MADR Simple**
- Balanced approach
- Adequate time for review
- Good detail level

**Extended Timeline → MADR Elaborate or Business Case**
- Time for thorough analysis
- Multiple review cycles
- Comprehensive documentation

## AI Agent Selection Logic

### Automatic Template Recommendation

```typescript
function recommendTemplate(decision: DecisionContext): Template {
  // Check for financial implications
  if (decision.hasCostImplications && decision.estimatedCost > threshold) {
    return Template.BusinessCase;
  }
  
  // Check complexity
  const complexity = assessComplexity(decision);
  const alternativesCount = decision.alternatives.length;
  
  if (complexity === 'low' && alternativesCount <= 2) {
    return Template.Nygard;
  }
  
  if (complexity === 'high' || alternativesCount >= 5) {
    return Template.MADRElaborate;
  }
  
  // Default to MADR Simple for most cases
  return Template.MADRSimple;
}

function assessComplexity(decision: DecisionContext): 'low' | 'medium' | 'high' {
  let score = 0;
  
  // Factor in various complexity indicators
  if (decision.stakeholders.length > 5) score += 2;
  if (decision.affectedSystems.length > 3) score += 2;
  if (decision.isReversible === false) score += 2;
  if (decision.riskLevel === 'high') score += 3;
  if (decision.alternatives.length > 4) score += 2;
  
  if (score <= 3) return 'low';
  if (score <= 7) return 'medium';
  return 'high';
}
```

### User Prompt for Template Selection

```
I recommend the MADR Simple template for this decision because:
- You're evaluating 3 alternatives (PostgreSQL, MySQL, MongoDB)
- Decision has moderate complexity
- Multiple stakeholders involved
- Standard evaluation process

Would you like to:
1. Use MADR Simple (recommended)
2. Use Nygard (simpler, faster)
3. Use MADR Elaborate (more detailed)
4. Use Business Case (cost-focused)

[1] [2] [3] [4]
```

## Template Switching

### When to Switch Templates

**Upgrade to More Detailed Template:**
- Decision becomes more complex than initially thought
- Additional alternatives discovered
- Stakeholder requests more detail
- Risk level increases

**Downgrade to Simpler Template:**
- Decision simpler than expected
- Time constraints require faster documentation
- Stakeholders prefer brevity
- Low-risk decision

### How to Switch Templates

1. **Copy existing content** to new template
2. **Map sections** from old to new template
3. **Fill in additional sections** if upgrading
4. **Preserve all context** and decisions
5. **Update metadata** to reflect template change

## Best Practices

1. **Start Simple, Elaborate if Needed**
   - Begin with Nygard or MADR Simple
   - Upgrade if complexity warrants
   - Don't over-engineer documentation

2. **Consider Your Audience**
   - Technical team → Nygard or MADR Simple
   - Executive stakeholders → Business Case
   - Mixed audience → MADR Elaborate

3. **Match Template to Decision Impact**
   - Low impact → Nygard
   - Medium impact → MADR Simple
   - High impact → MADR Elaborate or Business Case

4. **Respect Time Constraints**
   - Urgent → Nygard
   - Standard → MADR Simple
   - Extended → MADR Elaborate

5. **Allow Template Override**
   - AI recommendation is a suggestion
   - User knows context best
   - Support manual template selection

## Examples

### Example 1: Simple Decision → Nygard

**Decision:** "Use Prettier for code formatting"

**Why Nygard:**
- Single clear option (Prettier)
- Straightforward decision
- Low complexity
- Quick to document

### Example 2: Standard Decision → MADR Simple

**Decision:** "Select state management library"

**Why MADR Simple:**
- 3 alternatives (Redux, MobX, Zustand)
- Multiple decision drivers (learning curve, bundle size, DevTools)
- Standard evaluation process
- Moderate complexity

### Example 3: Complex Decision → MADR Elaborate

**Decision:** "Migrate to microservices architecture"

**Why MADR Elaborate:**
- High-stakes decision
- Multiple architectural patterns to consider
- Many stakeholders (dev team, ops, management)
- Significant consequences
- Need detailed analysis

### Example 4: Financial Decision → Business Case

**Decision:** "Purchase Datadog for monitoring"

**Why Business Case:**
- Significant annual cost ($50k+)
- ROI justification needed
- Budget approval required
- Executive stakeholders
- Need cost/benefit analysis

## Configuration

Projects can configure template preferences in `.adr-config.json`:

```json
{
  "templates": {
    "default": "madr-simple",
    "autoSelect": true,
    "allowOverride": true,
    "complexityThresholds": {
      "low": 3,
      "medium": 7
    },
    "costThreshold": 10000
  }
}
```

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [Nygard Template](../templates/nygard.md)
- [MADR Simple Template](../templates/madr-simple.md)
- [MADR Elaborate Template](../templates/madr-elaborate.md)
- [Business Case Template](../templates/business-case.md)

