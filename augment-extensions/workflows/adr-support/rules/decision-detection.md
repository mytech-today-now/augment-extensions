# Decision Detection Rules

## Overview

This document defines how AI agents detect architectural decisions that warrant ADR creation. The goal is to automatically identify significant decisions during development and prompt for ADR documentation.

## Detection Triggers

### Code-Based Triggers

AI agents should detect potential architectural decisions when encountering:

#### 1. **Dependency Changes**
- Adding new external dependencies (npm, pip, composer, etc.)
- Upgrading major versions of existing dependencies
- Replacing one dependency with another
- Removing dependencies

**Example Triggers:**
```json
// package.json changes
"dependencies": {
  "react": "^17.0.0" → "^18.0.0"  // Major version upgrade
  "axios": "^1.0.0"                // New HTTP client
}
```

**Significance Criteria:**
- Major version upgrades (breaking changes)
- New categories of dependencies (e.g., first state management library)
- Security-critical dependencies (auth, crypto, etc.)

#### 2. **Schema/Database Changes**
- Creating new database tables
- Modifying existing schemas
- Changing database engines
- Adding indexes or constraints

**Example Triggers:**
```sql
-- New table creation
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  expires_at TIMESTAMP
);
```

**Significance Criteria:**
- Changes affecting data integrity
- Performance-impacting schema changes
- Migration complexity (data transformation required)

#### 3. **API Design Changes**
- Defining new API endpoints
- Changing API contracts (request/response formats)
- API versioning decisions
- Authentication/authorization changes

**Example Triggers:**
```typescript
// New API endpoint
router.post('/api/v2/users', createUser);  // API versioning

// Breaking change
interface UserResponse {
  id: string;
  email: string;
  // REMOVED: username field
}
```

**Significance Criteria:**
- Breaking changes to public APIs
- New API versions
- Authentication mechanism changes

#### 4. **Infrastructure Changes**
- Deployment configuration changes
- CI/CD pipeline modifications
- Environment variable additions
- Cloud service integrations

**Example Triggers:**
```yaml
# .github/workflows/deploy.yml
- name: Deploy to Kubernetes  # New deployment target
  uses: azure/k8s-deploy@v1
```

**Significance Criteria:**
- Changes to deployment strategy
- New cloud services or platforms
- Security or compliance implications

### Conversation-Based Triggers

AI agents should detect decisions during conversations when:

#### 1. **Explicit Decision Language**
User statements containing:
- "We should use..."
- "Let's switch to..."
- "I've decided to..."
- "We're going with..."

#### 2. **Comparison Discussions**
Conversations comparing alternatives:
- "Should we use X or Y?"
- "What are the pros and cons of..."
- "X vs Y for our use case"

#### 3. **Problem-Solution Patterns**
Discussions following this pattern:
1. Problem statement
2. Multiple solution options
3. Evaluation criteria
4. Final decision

## Significance Criteria

Not every decision needs an ADR. Use these criteria to determine significance:

### High Significance (Always Create ADR)

1. **Structural Impact**
   - Changes affecting multiple modules/services
   - Architectural pattern changes (monolith → microservices)
   - Technology stack changes

2. **Long-Term Consequences**
   - Decisions difficult to reverse
   - Vendor lock-in implications
   - Technical debt creation/resolution

3. **Team Impact**
   - Requires team training
   - Changes development workflow
   - Affects multiple team members

4. **Cost/Risk**
   - Significant cost implications
   - Security or compliance impact
   - Performance or scalability concerns

### Medium Significance (Prompt for ADR)

1. **Module-Level Changes**
   - Affects single module but important
   - New patterns or conventions
   - Dependency changes within module

2. **Process Changes**
   - Testing strategy changes
   - Code review process updates
   - Documentation standards

### Low Significance (No ADR Needed)

1. **Implementation Details**
   - Variable naming
   - Code formatting
   - Minor refactoring

2. **Temporary Solutions**
   - Quick fixes
   - Experimental features
   - Prototype code

## Detection Workflow

### Step 1: Trigger Detection

When a trigger is detected:

```
[AI Agent detects trigger]
  ↓
[Evaluate significance]
  ↓
[High/Medium] → Prompt user
[Low] → Continue without ADR
```

### Step 2: User Prompting

For high/medium significance decisions:

**Prompt Template:**
```
I've detected a potentially significant architectural decision:

Decision: [Brief description]
Trigger: [What triggered detection]
Significance: [Why this might be important]

Would you like me to create an ADR for this decision?
Options:
1. Yes, create ADR now
2. Yes, but I'll provide more context first
3. No, this doesn't need an ADR
4. Remind me later
```

### Step 3: Context Gathering

If user agrees to create ADR, gather:

1. **Decision Context**
   - What problem are we solving?
   - What constraints exist?
   - What alternatives were considered?

2. **Decision Details**
   - What exactly are we doing?
   - Why this option over others?

3. **Consequences**
   - What are the expected benefits?
   - What are the trade-offs?
   - What risks exist?

## Examples

### Example 1: Dependency Addition (High Significance)

**Trigger:**
```bash
npm install @prisma/client
```

**Detection Logic:**
- New dependency added
- Category: Database ORM (first ORM in project)
- Significance: High (affects data layer architecture)

**AI Prompt:**
```
I've detected a significant architectural decision:

Decision: Adding Prisma as database ORM
Trigger: New dependency @prisma/client
Significance: This is the first ORM in the project and will affect how we interact with the database across all services.

Would you like me to create an ADR documenting:
- Why Prisma over alternatives (TypeORM, Sequelize, raw SQL)?
- Migration strategy from current approach?
- Impact on existing code?
```

### Example 2: API Versioning (High Significance)

**Trigger:**
```typescript
// Creating /api/v2/ endpoints
router.use('/api/v2', v2Router);
```

**Detection Logic:**
- New API version created
- Significance: High (affects API consumers, backward compatibility)

**AI Prompt:**
```
I've detected an API versioning decision:

Decision: Creating API v2
Trigger: New /api/v2 route namespace
Significance: This affects all API consumers and requires versioning strategy.

Would you like me to create an ADR documenting:
- Versioning strategy (URL-based, header-based)?
- v1 deprecation timeline?
- Breaking changes in v2?
```

### Example 3: Configuration Change (Low Significance)

**Trigger:**
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true
}
```

**Detection Logic:**
- Configuration change
- Category: Code formatting
- Significance: Low (no architectural impact)

**Action:** No ADR needed, continue without prompting.

## Integration with Workflows

### OpenSpec Integration

When decision detected in OpenSpec change:
1. Check if change proposal exists
2. Link ADR to change proposal
3. Update coordination manifest

### Beads Integration

When decision detected during task execution:
1. Check if task is linked to spec
2. Create ADR and link to task
3. Update task with ADR reference

## Best Practices

1. **Be Proactive, Not Intrusive**
   - Detect early but don't interrupt flow
   - Batch prompts when multiple decisions detected
   - Allow "remind me later" option

2. **Provide Context**
   - Explain why detection triggered
   - Show what was detected
   - Suggest what to document

3. **Learn from User Feedback**
   - Track which prompts user accepts/rejects
   - Adjust significance thresholds
   - Improve detection accuracy

4. **Respect User Preferences**
   - Allow disabling detection for certain categories
   - Support "always create" or "never create" rules
   - Honor project-specific configuration

## Configuration

Projects can configure detection in `.adr-config.json`:

```json
{
  "detection": {
    "enabled": true,
    "autoPrompt": true,
    "significanceThreshold": "medium",
    "triggers": {
      "dependencies": true,
      "schema": true,
      "api": true,
      "infrastructure": true
    },
    "excludePatterns": [
      "devDependencies",
      "*.test.ts"
    ]
  }
}
```

## See Also

- [ADR Creation Guidelines](./adr-creation.md)
- [Lifecycle Management](./lifecycle-management.md)
- [Template Selection](./template-selection.md)

