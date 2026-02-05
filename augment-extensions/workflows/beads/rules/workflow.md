# Beads Workflow Guide

## Overview

Beads provides a git-backed issue tracker optimized for AI agents. Issues are stored as JSONL (JSON Lines) in `.beads/issues.jsonl`, making them version-controlled, mergeable, and agent-readable.

## Naming Convention

All Beads issues in this project use the **"bd-" prefix**.

### Standard Format

- `bd-<hash>` - Standard hash-based ID (e.g., `bd-a1b2`)
- `bd-<name>` - Named ID for important tasks (e.g., `bd-init`, `bd-rename1`)
- `bd-<hash>.<number>` - Hierarchical ID (e.g., `bd-a1b2.1`)

### Why "bd"?

- **Brevity**: Short and memorable (2 characters)
- **Clarity**: Clearly identifies Beads issues
- **Consistency**: Single prefix across all issues
- **Git-Friendly**: Reduces commit message length

### Validation

All new issues are validated to ensure they use the "bd-" prefix. See `openspec/specs/beads/naming-convention.md` for complete specification.

## Core Workflow

```
┌─────────────────┐
│ Create Task     │
│ bd create       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add Dependencies│
│ bd dep add      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Find Ready Tasks│
│ bd ready        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Work on Task    │
│ bd comment      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Close Task      │
│ bd close        │
└─────────────────┘
```

## Coordination with OpenSpec and .augment/

Beads tasks can reference OpenSpec specifications and `.augment/` rules for better coordination:

```bash
# Create task with spec and rules
bd create "Implement authentication" -p 1
# Then manually add spec and rules fields to .beads/issues.jsonl:
# {"id":"bd-xyz","spec":"features/authentication","rules":["security-guidelines.md"],"updated":"..."}
```

**Benefits**:
- **Traceability**: Link tasks to specifications
- **Context**: AI agents load relevant rules automatically
- **Coordination**: Integration with coordination manifest

See `.augment-guidelines/system-integration/coordination-system.md` for details.

---

## Step 1: Initialize Beads

### With CLI

```bash
cd your-project
bd init
```

This creates:
- `.beads/issues.jsonl` - Issue storage
- `.beads/config.json` - Configuration
- Updates `AGENTS.md` with Beads instructions

### Without CLI

Create the directory structure manually:

```bash
mkdir .beads
touch .beads/issues.jsonl
echo '{"version": "1.0"}' > .beads/config.json
```

Add to `AGENTS.md`:

```markdown
# Beads Task Tracking

This project uses Beads for task tracking. Issues are stored in `.beads/issues.jsonl`.

## Workflow
1. Create tasks by appending to `.beads/issues.jsonl`
2. Use hash-based IDs: `bd-<hash>`
3. Track dependencies with `blocks` and `blocked_by` fields
4. Mark tasks closed with `status: "closed"`
```

## Step 2: Create Tasks

### With CLI

```bash
# Create a P0 task
bd create "Implement user authentication" -p 0

# Create with description
bd create "Add login endpoint" -p 1 -d "POST /api/auth/login with email/password"

# Create subtask
bd create "Add password hashing" -p 1 --parent bd-a3f8.1
```

### Without CLI

Append JSON to `.beads/issues.jsonl`:

```json
{"id":"bd-a1b2","title":"Implement user authentication","status":"open","priority":0,"created":"2024-01-20T10:00:00Z","updated":"2024-01-20T10:00:00Z"}
```

### AI Agent Pattern

Ask your AI:

```
Create a Beads task for implementing user authentication with priority 0
```

The AI will either:
- Run `bd create` if CLI is available
- Append to `.beads/issues.jsonl` if working manually

## Step 3: Add Dependencies

### With CLI

```bash
# Task bd-b2c3 blocks task bd-a1b2
bd dep add bd-a1b2 bd-b2c3

# View dependencies
bd show bd-a1b2
```

### Without CLI

Update the issue in `.beads/issues.jsonl`:

```json
{"id":"bd-a1b2","title":"Implement user authentication","status":"open","priority":0,"blocks":["bd-b2c3"],"created":"2024-01-20T10:00:00Z","updated":"2024-01-20T10:00:00Z"}
```

### Dependency Types

- **blocks** - This task blocks another task
- **blocked_by** - This task is blocked by another task
- **related** - Related but not blocking
- **parent** - Parent task (for hierarchical IDs)

## Step 4: Find Ready Tasks

### With CLI

```bash
# List tasks with no open blockers
bd ready

# List all open tasks
bd list

# Filter by priority
bd list -p 0
```

### Without CLI

Parse `.beads/issues.jsonl` to find tasks where:
- `status` is `"open"`
- `blocked_by` is empty or all blockers are closed

### AI Agent Pattern

Ask your AI:

```
What Beads tasks are ready to work on?
```

The AI will:
- Run `bd ready` if CLI available
- Parse `.beads/issues.jsonl` manually otherwise

## Step 5: Work on Task

### With CLI

```bash
# Add comment
bd comment bd-a1b2 "Started implementation, added login endpoint"

# Update status
bd update bd-a1b2 --status in_progress

# Add labels
bd update bd-a1b2 --labels backend,auth
```

### Without CLI

Append update to `.beads/issues.jsonl`:

```json
{"id":"bd-a1b2","title":"Implement user authentication","status":"in_progress","priority":0,"comments":[{"text":"Started implementation","timestamp":"2024-01-20T11:00:00Z"}],"updated":"2024-01-20T11:00:00Z"}
```

## Step 6: Close Task

### With CLI

```bash
bd close bd-a1b2
```

### Without CLI

Update status in `.beads/issues.jsonl`:

```json
{"id":"bd-a1b2","title":"Implement user authentication","status":"closed","priority":0,"closed":"2024-01-20T12:00:00Z","updated":"2024-01-20T12:00:00Z"}
```

## Essential Commands

### With CLI

| Command | Action |
|---------|--------|
| `bd create "Title" -p 0` | Create P0 task |
| `bd ready` | List tasks with no blockers |
| `bd list` | List all open tasks |
| `bd show <id>` | View task details |
| `bd dep add <child> <parent>` | Add dependency |
| `bd comment <id> "Text"` | Add comment |
| `bd close <id>` | Close task |
| `bd compact` | Summarize old closed tasks |

### Without CLI

All operations are manual edits to `.beads/issues.jsonl`. See `file-format.md` for JSONL structure.

## Advanced Features

### Hierarchical Tasks

Create epic/task/subtask structure:

```bash
# Create epic
bd create "User Management" -p 0
# Returns: bd-a3f8

# Create task under epic
bd create "Add authentication" -p 1 --parent bd-a3f8
# Returns: bd-a3f8.1

# Create subtask
bd create "Hash passwords" -p 2 --parent bd-a3f8.1
# Returns: bd-a3f8.1.1
```

### Stealth Mode

Use Beads without committing to main repo:

```bash
bd init --stealth
```

This creates `.beads/` in a separate branch that doesn't merge to main.

### Compaction

Summarize old closed tasks to save context:

```bash
bd compact
```

This uses AI to create semantic summaries of closed tasks, reducing context window usage.

## Best Practices

1. **Use Descriptive Titles**: Clear, specific task names
2. **Set Priorities**: P0 (critical) to P3 (nice-to-have)
3. **Track Dependencies**: Use `bd dep add` to show relationships
4. **Add Comments**: Document progress and decisions
5. **Close Promptly**: Mark tasks closed when done
6. **Compact Regularly**: Run `bd compact` to manage context

## Next Steps

- See `file-format.md` for JSONL structure
- See `manual-setup.md` for CLI-free setup
- See `best-practices.md` for advanced patterns

