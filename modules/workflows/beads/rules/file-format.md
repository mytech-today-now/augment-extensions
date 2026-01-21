# Beads File Format Specification

## Overview

Beads stores issues in `.beads/issues.jsonl` using JSONL (JSON Lines) format. Each line is a complete JSON object representing an issue or update.

## JSONL Format

**JSONL** = One JSON object per line, newline-separated.

```jsonl
{"id":"bd-a1b2","title":"Task 1","status":"open"}
{"id":"bd-b2c3","title":"Task 2","status":"closed"}
{"id":"bd-c3d4","title":"Task 3","status":"open"}
```

## Issue Schema

### Minimal Issue

```json
{
  "id": "bd-a1b2",
  "title": "Implement user authentication",
  "status": "open",
  "created": "2024-01-20T10:00:00Z",
  "updated": "2024-01-20T10:00:00Z"
}
```

### Complete Issue

```json
{
  "id": "bd-a1b2",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with email/password login",
  "status": "open",
  "priority": 0,
  "labels": ["backend", "auth", "security"],
  "assignee": "agent-1",
  "blocks": ["bd-b2c3", "bd-c3d4"],
  "blocked_by": [],
  "related": ["bd-d4e5"],
  "parent": null,
  "spec": "features/authentication",
  "rules": ["module-development.md", "security-guidelines.md"],
  "comments": [
    {
      "text": "Started implementation",
      "author": "agent-1",
      "timestamp": "2024-01-20T11:00:00Z"
    }
  ],
  "created": "2024-01-20T10:00:00Z",
  "updated": "2024-01-20T11:00:00Z",
  "closed": null
}
```

## Field Definitions

### Required Fields

- **id** (string): Unique hash-based ID, format: `bd-<hash>` or `bd-<hash>.<number>` for hierarchical
- **title** (string): Short description of the task
- **status** (string): One of: `"open"`, `"in-progress"`, `"blocked"`, `"closed"`
- **created** (string): ISO 8601 timestamp
- **updated** (string): ISO 8601 timestamp

### Optional Fields

- **description** (string): Detailed description
- **priority** (integer): 0 (highest) to 3 (lowest), default: 2
- **labels** (array of strings): Tags for categorization
- **assignee** (string): Who is working on this
- **blocks** (array of strings): IDs of tasks this task blocks
- **blocked_by** (array of strings): IDs of tasks blocking this task
- **related** (array of strings): IDs of related tasks
- **parent** (string): ID of parent task (for hierarchical IDs)
- **comments** (array of objects): Comments and updates
- **closed** (string): ISO 8601 timestamp when closed
- **spec** (string): OpenSpec specification ID this task implements (e.g., "features/authentication")
- **rules** (array of strings): `.augment/` rule files that apply to this task (e.g., ["module-development.md"])

## ID Format

### Standard IDs

Hash-based, 4-character hex:

```
bd-a1b2
bd-b2c3
bd-c3d4
```

### Hierarchical IDs

Epic/task/subtask structure:

```
bd-a3f8        # Epic
bd-a3f8.1      # Task under epic
bd-a3f8.1.1    # Subtask
bd-a3f8.2      # Another task under epic
```

## Status Values

- **open** - Task is ready to work on (no blockers)
- **in-progress** - Currently being worked on
- **blocked** - Waiting on dependencies
- **closed** - Completed or cancelled

## Priority Values

- **0** - Critical (P0)
- **1** - High (P1)
- **2** - Medium (P2) - default
- **3** - Low (P3)

## Coordination Fields

### spec

References an OpenSpec specification that this task implements:

```json
{
  "id": "bd-a1b2",
  "title": "Add authentication API",
  "spec": "features/authentication"
}
```

The `spec` field links the task to an OpenSpec specification file (e.g., `openspec/specs/features/authentication.md`). This enables:
- Automatic traceability from spec to implementation
- Discovery of all tasks implementing a spec
- Coordination manifest integration

### rules

Lists `.augment/` rule files that apply to this task:

```json
{
  "id": "bd-a1b2",
  "title": "Add authentication API",
  "rules": ["module-development.md", "security-guidelines.md"]
}
```

The `rules` field helps AI agents:
- Load relevant coding standards and guidelines
- Apply appropriate validation rules
- Maintain consistency across tasks

**Note**: These fields are optional and backward compatible. Existing tasks without these fields continue to work normally.

---

## Dependency Types

### blocks

Tasks that this task prevents from starting:

```json
{
  "id": "bd-a1b2",
  "title": "Add database schema",
  "blocks": ["bd-b2c3", "bd-c3d4"]
}
```

Means: `bd-b2c3` and `bd-c3d4` cannot start until `bd-a1b2` is closed.

### blocked_by

Tasks that must be completed before this task can start:

```json
{
  "id": "bd-b2c3",
  "title": "Add API endpoint",
  "blocked_by": ["bd-a1b2"]
}
```

Means: `bd-b2c3` cannot start until `bd-a1b2` is closed.

### related

Tasks that are related but not blocking:

```json
{
  "id": "bd-c3d4",
  "title": "Add frontend form",
  "related": ["bd-b2c3"]
}
```

## Comments Format

```json
{
  "comments": [
    {
      "text": "Started implementation",
      "author": "agent-1",
      "timestamp": "2024-01-20T11:00:00Z"
    },
    {
      "text": "Added login endpoint",
      "author": "agent-1",
      "timestamp": "2024-01-20T12:00:00Z"
    }
  ]
}
```

## Append-Only Log

`.beads/issues.jsonl` is an **append-only log**. Updates are appended as new lines:

```jsonl
{"id":"bd-a1b2","title":"Task 1","status":"open","created":"2024-01-20T10:00:00Z","updated":"2024-01-20T10:00:00Z"}
{"id":"bd-a1b2","status":"in-progress","updated":"2024-01-20T11:00:00Z"}
{"id":"bd-a1b2","status":"closed","closed":"2024-01-20T12:00:00Z","updated":"2024-01-20T12:00:00Z"}
```

The **latest entry** for each ID is the current state.

## Reading Issues

### With CLI

The CLI maintains a SQLite cache (`.beads/cache.db`) for fast queries:

```bash
bd list        # Query cache
bd ready       # Query cache
bd show bd-a1b2  # Query cache
```

### Without CLI

Parse `.beads/issues.jsonl` manually:

1. Read all lines
2. Parse each line as JSON
3. Group by `id`
4. Merge fields (latest wins)
5. Return current state

## Writing Issues

### With CLI

```bash
bd create "Title" -p 0
# Appends to issues.jsonl and updates cache
```

### Without CLI

Append JSON line to `.beads/issues.jsonl`:

```bash
echo '{"id":"bd-a1b2","title":"New task","status":"open","created":"2024-01-20T10:00:00Z","updated":"2024-01-20T10:00:00Z"}' >> .beads/issues.jsonl
```

## Configuration File

`.beads/config.json`:

```json
{
  "version": "1.0",
  "stealth": false,
  "compact_threshold": 100,
  "auto_sync": true
}
```

## Best Practices

1. **Always append**: Never edit existing lines
2. **Include timestamps**: Use ISO 8601 format
3. **Unique IDs**: Use hash-based IDs to avoid conflicts
4. **Atomic updates**: One field change per line
5. **Validate JSON**: Ensure each line is valid JSON

## Example Workflow

### Create Task

```jsonl
{"id":"bd-a1b2","title":"Add authentication","status":"open","priority":0,"spec":"features/authentication","rules":["module-development.md"],"created":"2024-01-20T10:00:00Z","updated":"2024-01-20T10:00:00Z"}
```

### Add Dependency

```jsonl
{"id":"bd-a1b2","blocks":["bd-b2c3"],"updated":"2024-01-20T10:05:00Z"}
```

### Start Work

```jsonl
{"id":"bd-a1b2","status":"in-progress","updated":"2024-01-20T11:00:00Z"}
```

### Add Comment

```jsonl
{"id":"bd-a1b2","comments":[{"text":"Added login endpoint","timestamp":"2024-01-20T12:00:00Z"}],"updated":"2024-01-20T12:00:00Z"}
```

### Close Task

```jsonl
{"id":"bd-a1b2","status":"closed","closed":"2024-01-20T13:00:00Z","updated":"2024-01-20T13:00:00Z"}
```

