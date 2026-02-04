# Beads Best Practices

## Task Creation

### Use Descriptive Titles

✅ **Good**: Clear, actionable titles
- "Implement JWT authentication"
- "Fix login timeout bug"
- "Refactor database connection pool"

❌ **Bad**: Vague or cryptic titles
- "Fix bug"
- "Update code"
- "Task 123"

### Set Appropriate Priorities

- **P0** - Critical, blocking production
- **P1** - High priority, needed soon
- **P2** - Medium priority (default)
- **P3** - Nice to have, low priority

### Add Descriptions

Include context in the description field:

```json
{
  "id": "bd-a1b2",
  "title": "Implement JWT authentication",
  "description": "Add JWT-based authentication with email/password login. Use bcrypt for password hashing. Tokens expire after 24 hours.",
  "priority": 0
}
```

## Dependency Management

### Model Real Dependencies

Only use `blocks`/`blocked_by` for actual dependencies:

✅ **Good**: Real blocking relationships
```
bd-a1b2: "Add database schema"
  blocks: ["bd-b2c3", "bd-c3d4"]

bd-b2c3: "Add API endpoint"
  blocked_by: ["bd-a1b2"]
```

❌ **Bad**: Artificial dependencies
```
bd-a1b2: "Write documentation"
  blocks: ["bd-b2c3"]  # Doesn't actually block implementation
```

### Use Related for Loose Coupling

Use `related` for tasks that should be aware of each other but don't block:

```json
{
  "id": "bd-c3d4",
  "title": "Add frontend login form",
  "related": ["bd-b2c3"]  # Related to backend endpoint
}
```

### Break Circular Dependencies

Avoid circular dependencies:

❌ **Bad**:
```
bd-a1b2 blocks bd-b2c3
bd-b2c3 blocks bd-a1b2  # Circular!
```

✅ **Good**: Break into smaller tasks
```
bd-a1b2: "Add database schema"
bd-b2c3: "Add API endpoint" (blocked_by: bd-a1b2)
bd-c3d4: "Add validation" (blocked_by: bd-b2c3)
```

## Hierarchical Tasks

### Use for Epics

Create hierarchical IDs for large features:

```
bd-a3f8: "User Management System" (Epic)
  ├─ bd-a3f8.1: "Add authentication"
  │   ├─ bd-a3f8.1.1: "Hash passwords"
  │   └─ bd-a3f8.1.2: "Generate JWT tokens"
  └─ bd-a3f8.2: "Add user profiles"
      ├─ bd-a3f8.2.1: "Create profile model"
      └─ bd-a3f8.2.2: "Add profile API"
```

### Keep Hierarchy Shallow

Limit to 3 levels:
- Level 1: Epic
- Level 2: Task
- Level 3: Subtask

Deeper hierarchies become hard to manage.

## Status Management

### Update Status Promptly

Keep status current:

```
open → in_progress → closed
```

### Use Blocked Status

Mark tasks as blocked when waiting:

```json
{
  "id": "bd-b2c3",
  "status": "blocked",
  "blocked_by": ["bd-a1b2"]
}
```

### Close Completed Tasks

Always close tasks when done:

```json
{
  "id": "bd-a1b2",
  "status": "closed",
  "closed": "2024-01-20T12:00:00Z"
}
```

## Comments and Documentation

### Add Progress Comments

Document progress and decisions:

```json
{
  "id": "bd-a1b2",
  "comments": [
    {
      "text": "Started implementation, using bcrypt for hashing",
      "timestamp": "2024-01-20T11:00:00Z"
    },
    {
      "text": "Completed password hashing, moving to JWT generation",
      "timestamp": "2024-01-20T12:00:00Z"
    }
  ]
}
```

### Document Blockers

Explain why tasks are blocked:

```json
{
  "id": "bd-b2c3",
  "status": "blocked",
  "blocked_by": ["bd-a1b2"],
  "comments": [
    {
      "text": "Waiting for database schema to be finalized",
      "timestamp": "2024-01-20T10:00:00Z"
    }
  ]
}
```

## Labels and Organization

### Use Consistent Labels

Establish label conventions:

- **Component**: `backend`, `frontend`, `database`, `api`
- **Type**: `bug`, `feature`, `refactor`, `docs`
- **Area**: `auth`, `users`, `payments`, `search`

```json
{
  "id": "bd-a1b2",
  "title": "Implement JWT authentication",
  "labels": ["backend", "feature", "auth"]
}
```

### Filter by Labels

Use labels to find related tasks:

```bash
# With CLI
bd list --labels auth

# Without CLI - parse and filter
```

## Multi-Agent Workflows

### Use Assignees

Track who is working on what:

```json
{
  "id": "bd-a1b2",
  "title": "Add authentication",
  "assignee": "agent-1",
  "status": "in_progress"
}
```

### Avoid Conflicts

Use hash-based IDs to prevent merge conflicts:

✅ **Good**: Hash-based IDs
```
bd-a1b2
bd-b2c3
```

❌ **Bad**: Sequential IDs
```
task-1
task-2  # Conflicts in parallel branches
```

### Sync Regularly

With CLI, the daemon auto-syncs. Without CLI, commit and pull regularly:

```bash
git add .beads/issues.jsonl
git commit -m "Update tasks"
git pull --rebase
git push
```

## Performance

### Use CLI for Large Projects

For projects with >100 tasks, use the CLI:
- SQLite cache provides fast queries
- Auto-sync daemon keeps data current
- Compaction reduces context window usage

### Compact Regularly

Run compaction to summarize old tasks:

```bash
bd compact
```

This creates semantic summaries of closed tasks, reducing file size.

### Archive Old Tasks

Move very old closed tasks to archive:

```bash
# With CLI
bd archive --older-than 90d

# Without CLI - manually move to separate file
```

## Git Integration

### Commit Task Updates

Commit `.beads/issues.jsonl` with related code:

```bash
git add .beads/issues.jsonl src/auth.py
git commit -m "Implement JWT authentication (bd-a1b2)"
```

### Reference in Commits

Reference task IDs in commit messages:

```
Implement JWT authentication (bd-a1b2)

- Add JWT generation
- Add password hashing with bcrypt
- Add login endpoint
```

### Branch Naming

Include task ID in branch names:

```bash
git checkout -b bd-a1b2-add-authentication
```

## Stealth Mode

### Personal Use on Shared Projects

Use stealth mode for personal task tracking:

```bash
bd init --stealth
```

This creates `.beads/` in a separate branch that doesn't merge to main.

### Team Adoption

When team is ready, disable stealth:

```bash
bd config set stealth false
git add .beads/
git commit -m "Enable Beads for team"
```

## Common Pitfalls

### ❌ Forgetting to Update Status

Don't leave tasks in "open" when you're working on them.

### ❌ Creating Too Many Dependencies

Only model real blocking relationships.

### ❌ Vague Titles

Be specific about what needs to be done.

### ❌ Not Closing Tasks

Always close completed tasks to keep the list clean.

### ❌ Ignoring Ready Tasks

Use `bd ready` to find tasks you can work on now.

## AI Agent Collaboration

### Provide Context

When asking AI to create tasks:

```
Create a Beads task for implementing user authentication.
Priority: 0
Description: Add JWT-based auth with email/password login
Labels: backend, feature, auth
```

### Check Ready Tasks

Ask AI to check what's ready:

```
What Beads tasks are ready to work on right now?
```

### Update Progress

Ask AI to document progress:

```
Add a comment to bd-a1b2: "Completed password hashing, starting JWT generation"
```

### Close When Done

Ask AI to close completed tasks:

```
Close Beads task bd-a1b2, we've finished the implementation
```

