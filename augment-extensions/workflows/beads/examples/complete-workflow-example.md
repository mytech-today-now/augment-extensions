# Complete Beads Workflow Example

This example shows a complete Beads workflow from start to finish.

## Scenario

Building a user authentication system with multiple dependent tasks.

## Step 1: Initialize Beads

```bash
# With CLI
bd init

# Without CLI
mkdir .beads
touch .beads/issues.jsonl
echo '{"version": "1.0"}' > .beads/config.json
```

## Step 2: Create Epic

```bash
# With CLI
bd create "User Authentication System" -p 0
# Returns: bd-a3f8
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```json
{"id":"bd-a3f8","title":"User Authentication System","status":"open","priority":0,"spec":"features/authentication","rules":["security-guidelines.md"],"created":"2024-01-20T10:00:00Z","updated":"2024-01-20T10:00:00Z"}
```

## Step 3: Create Tasks

```bash
# With CLI
bd create "Add database schema" -p 0 --parent bd-a3f8
# Returns: bd-a3f8.1

bd create "Add password hashing" -p 1 --parent bd-a3f8
# Returns: bd-a3f8.2

bd create "Add JWT generation" -p 1 --parent bd-a3f8
# Returns: bd-a3f8.3

bd create "Add login endpoint" -p 1 --parent bd-a3f8
# Returns: bd-a3f8.4
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8.1","title":"Add database schema","status":"open","priority":0,"parent":"bd-a3f8","spec":"features/authentication","rules":["module-development.md"],"created":"2024-01-20T10:01:00Z","updated":"2024-01-20T10:01:00Z"}
{"id":"bd-a3f8.2","title":"Add password hashing","status":"open","priority":1,"parent":"bd-a3f8","spec":"features/authentication","rules":["security-guidelines.md"],"created":"2024-01-20T10:02:00Z","updated":"2024-01-20T10:02:00Z"}
{"id":"bd-a3f8.3","title":"Add JWT generation","status":"open","priority":1,"parent":"bd-a3f8","spec":"features/authentication","rules":["security-guidelines.md"],"created":"2024-01-20T10:03:00Z","updated":"2024-01-20T10:03:00Z"}
{"id":"bd-a3f8.4","title":"Add login endpoint","status":"open","priority":1,"parent":"bd-a3f8","spec":"features/authentication","rules":["module-development.md","security-guidelines.md"],"created":"2024-01-20T10:04:00Z","updated":"2024-01-20T10:04:00Z"}
```

## Step 4: Add Dependencies

```bash
# With CLI
bd dep add bd-a3f8.2 bd-a3f8.1  # Password hashing depends on schema
bd dep add bd-a3f8.3 bd-a3f8.1  # JWT generation depends on schema
bd dep add bd-a3f8.4 bd-a3f8.2  # Login endpoint depends on password hashing
bd dep add bd-a3f8.4 bd-a3f8.3  # Login endpoint depends on JWT generation
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8.1","blocks":["bd-a3f8.2","bd-a3f8.3"],"updated":"2024-01-20T10:05:00Z"}
{"id":"bd-a3f8.2","blocked_by":["bd-a3f8.1"],"blocks":["bd-a3f8.4"],"updated":"2024-01-20T10:05:00Z"}
{"id":"bd-a3f8.3","blocked_by":["bd-a3f8.1"],"blocks":["bd-a3f8.4"],"updated":"2024-01-20T10:05:00Z"}
{"id":"bd-a3f8.4","blocked_by":["bd-a3f8.2","bd-a3f8.3"],"updated":"2024-01-20T10:05:00Z"}
```

## Step 5: Find Ready Tasks

```bash
# With CLI
bd ready
```

**Output**:
```
bd-a3f8.1  Add database schema  P0
```

Only `bd-a3f8.1` is ready because it has no blockers.

## Step 6: Work on First Task

```bash
# With CLI
bd update bd-a3f8.1 --status in-progress
bd comment bd-a3f8.1 "Creating users table with email, password_hash, created_at columns"
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8.1","status":"in-progress","updated":"2024-01-20T11:00:00Z"}
{"id":"bd-a3f8.1","comments":[{"text":"Creating users table with email, password_hash, created_at columns","timestamp":"2024-01-20T11:00:00Z"}],"updated":"2024-01-20T11:00:00Z"}
```

## Step 7: Complete First Task

```bash
# With CLI
bd close bd-a3f8.1
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8.1","status":"closed","closed":"2024-01-20T12:00:00Z","updated":"2024-01-20T12:00:00Z"}
```

## Step 8: Find Next Ready Tasks

```bash
# With CLI
bd ready
```

**Output**:
```
bd-a3f8.2  Add password hashing  P1
bd-a3f8.3  Add JWT generation     P1
```

Now both `bd-a3f8.2` and `bd-a3f8.3` are ready because their blocker (`bd-a3f8.1`) is closed.

## Step 9: Work on Multiple Tasks

```bash
# With CLI - work on password hashing
bd update bd-a3f8.2 --status in-progress
bd comment bd-a3f8.2 "Using bcrypt with cost factor 12"

# Complete it
bd close bd-a3f8.2

# Work on JWT generation
bd update bd-a3f8.3 --status in-progress
bd comment bd-a3f8.3 "Using HS256 algorithm, 24-hour expiry"

# Complete it
bd close bd-a3f8.3
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8.2","status":"in-progress","updated":"2024-01-20T12:30:00Z"}
{"id":"bd-a3f8.2","comments":[{"text":"Using bcrypt with cost factor 12","timestamp":"2024-01-20T12:30:00Z"}],"updated":"2024-01-20T12:30:00Z"}
{"id":"bd-a3f8.2","status":"closed","closed":"2024-01-20T13:00:00Z","updated":"2024-01-20T13:00:00Z"}
{"id":"bd-a3f8.3","status":"in-progress","updated":"2024-01-20T13:30:00Z"}
{"id":"bd-a3f8.3","comments":[{"text":"Using HS256 algorithm, 24-hour expiry","timestamp":"2024-01-20T13:30:00Z"}],"updated":"2024-01-20T13:30:00Z"}
{"id":"bd-a3f8.3","status":"closed","closed":"2024-01-20T14:00:00Z","updated":"2024-01-20T14:00:00Z"}
```

## Step 10: Complete Final Task

```bash
# With CLI
bd ready
```

**Output**:
```
bd-a3f8.4  Add login endpoint  P1
```

Now `bd-a3f8.4` is ready because both blockers are closed.

```bash
# With CLI
bd update bd-a3f8.4 --status in-progress
bd comment bd-a3f8.4 "POST /api/auth/login endpoint created, returns JWT on success"
bd close bd-a3f8.4
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8.4","status":"in-progress","updated":"2024-01-20T14:30:00Z"}
{"id":"bd-a3f8.4","comments":[{"text":"POST /api/auth/login endpoint created, returns JWT on success","timestamp":"2024-01-20T14:30:00Z"}],"updated":"2024-01-20T14:30:00Z"}
{"id":"bd-a3f8.4","status":"closed","closed":"2024-01-20T15:00:00Z","updated":"2024-01-20T15:00:00Z"}
```

## Step 11: Close Epic

```bash
# With CLI
bd close bd-a3f8
```

**Without CLI** - Append to `.beads/issues.jsonl`:

```jsonl
{"id":"bd-a3f8","status":"closed","closed":"2024-01-20T15:00:00Z","updated":"2024-01-20T15:00:00Z"}
```

## Final State

All tasks completed:

```
✓ bd-a3f8    User Authentication System
  ✓ bd-a3f8.1  Add database schema
  ✓ bd-a3f8.2  Add password hashing
  ✓ bd-a3f8.3  Add JWT generation
  ✓ bd-a3f8.4  Add login endpoint
```

## Viewing History

```bash
# With CLI
bd show bd-a3f8.4
```

**Output**:
```
ID: bd-a3f8.4
Title: Add login endpoint
Status: closed
Priority: P1
Parent: bd-a3f8
Blocked by: bd-a3f8.2, bd-a3f8.3

Comments:
  [2024-01-20 14:30] POST /api/auth/login endpoint created, returns JWT on success

Created: 2024-01-20 10:04
Closed: 2024-01-20 15:00
```

## AI Agent Workflow

### Creating Tasks

```
Create a Beads epic for "User Authentication System" with priority 0.
Then create 4 subtasks:
1. Add database schema (P0)
2. Add password hashing (P1)
3. Add JWT generation (P1)
4. Add login endpoint (P1)

Add dependencies:
- Tasks 2 and 3 depend on task 1
- Task 4 depends on tasks 2 and 3
```

### Finding Work

```
What Beads tasks are ready to work on?
```

### Documenting Progress

```
Update Beads task bd-a3f8.2 to in-progress.
Add comment: "Using bcrypt with cost factor 12"
```

### Completing Tasks

```
Close Beads task bd-a3f8.2, password hashing is complete.
```

