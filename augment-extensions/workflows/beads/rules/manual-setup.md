# Beads Manual Setup (Without CLI)

## Overview

You can use Beads without installing the CLI by working directly with `.beads/issues.jsonl` files. This guide shows how to set up and use Beads manually.

## Initial Setup

### 1. Create Directory Structure

```bash
mkdir .beads
touch .beads/issues.jsonl
```

### 2. Create Configuration File

Create `.beads/config.json`:

```json
{
  "version": "1.0",
  "stealth": false,
  "compact_threshold": 100,
  "auto_sync": true
}
```

### 3. Add to .gitignore

Add to `.gitignore`:

```
.beads/cache.db
.beads/cache.db-*
```

**Note**: Commit `.beads/issues.jsonl` and `.beads/config.json`, but not the cache.

### 4. Create AGENTS.md Integration

Add to your project's `AGENTS.md` (or create it):

```markdown
# Beads Task Tracking

This project uses Beads for task tracking. Issues are stored in `.beads/issues.jsonl`.

## File Format

Each line in `.beads/issues.jsonl` is a JSON object representing an issue or update.

### Creating Tasks

Append a JSON line:

```json
{"id":"bd-<hash>","title":"Task title","status":"open","priority":0,"created":"<ISO-8601>","updated":"<ISO-8601>"}
```

### Updating Tasks

Append a JSON line with the same ID and updated fields:

```json
{"id":"bd-<hash>","status":"in_progress","updated":"<ISO-8601>"}
```

### Closing Tasks

Append a JSON line with status "closed":

```json
{"id":"bd-<hash>","status":"closed","closed":"<ISO-8601>","updated":"<ISO-8601>"}
```

## Task States

- **open** - Ready to work on
- **in_progress** - Currently being worked on
- **blocked** - Waiting on dependencies
- **closed** - Completed

## Dependencies

Use `blocks` and `blocked_by` fields:

```json
{"id":"bd-a1b2","blocks":["bd-b2c3"],"updated":"<ISO-8601>"}
```

## Finding Ready Tasks

Tasks are ready when:
- Status is "open"
- `blocked_by` is empty or all blockers are closed

## Workflow

1. Create task by appending to `.beads/issues.jsonl`
2. Add dependencies with `blocks`/`blocked_by` fields
3. Find ready tasks (no open blockers)
4. Update status to "in_progress"
5. Add comments as needed
6. Close task when complete
```

## Generating Hash-Based IDs

### Simple Method

Use the first 4 characters of a hash:

```bash
# Linux/macOS
echo -n "$(date +%s%N)" | md5sum | cut -c1-4

# Or use a random string
echo -n "task-$(date +%s)" | md5sum | cut -c1-4
```

### In Code (Python)

```python
import hashlib
import time

def generate_id():
    hash_input = f"task-{time.time()}"
    hash_hex = hashlib.md5(hash_input.encode()).hexdigest()
    return f"bd-{hash_hex[:4]}"

print(generate_id())  # bd-a1b2
```

### In Code (JavaScript)

```javascript
const crypto = require('crypto');

function generateId() {
  const hashInput = `task-${Date.now()}`;
  const hash = crypto.createHash('md5').update(hashInput).digest('hex');
  return `bd-${hash.substring(0, 4)}`;
}

console.log(generateId());  // bd-a1b2
```

## Creating Your First Task

### 1. Generate ID

```bash
# Generate a unique ID
ID="bd-$(echo -n "task-$(date +%s)" | md5sum | cut -c1-4)"
echo $ID  # bd-a1b2
```

### 2. Create JSON

```bash
# Create task JSON
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TASK=$(cat <<EOF
{"id":"$ID","title":"Implement user authentication","status":"open","priority":0,"created":"$TIMESTAMP","updated":"$TIMESTAMP"}
EOF
)
```

### 3. Append to File

```bash
echo "$TASK" >> .beads/issues.jsonl
```

## Working with AI Agents

### Creating Tasks

Ask your AI:

```
Create a Beads task for implementing user authentication with priority 0.
Append the JSON to .beads/issues.jsonl with a unique hash-based ID.
```

The AI will:
1. Generate a unique ID (e.g., `bd-a1b2`)
2. Create JSON with required fields
3. Append to `.beads/issues.jsonl`

### Finding Ready Tasks

Ask your AI:

```
What Beads tasks are ready to work on?
Parse .beads/issues.jsonl and find tasks where:
- status is "open"
- blocked_by is empty or all blockers are closed
```

### Updating Tasks

Ask your AI:

```
Update Beads task bd-a1b2 to status "in_progress"
Append an update to .beads/issues.jsonl
```

### Adding Dependencies

Ask your AI:

```
Make Beads task bd-b2c3 depend on bd-a1b2
Append updates to .beads/issues.jsonl:
- bd-a1b2 blocks bd-b2c3
- bd-b2c3 is blocked_by bd-a1b2
```

## Reading Current State

### Parse JSONL (Python)

```python
import json

def read_issues(filepath='.beads/issues.jsonl'):
    issues = {}
    with open(filepath, 'r') as f:
        for line in f:
            issue = json.loads(line.strip())
            issue_id = issue['id']
            if issue_id not in issues:
                issues[issue_id] = {}
            issues[issue_id].update(issue)
    return issues

# Get all issues
all_issues = read_issues()

# Find ready tasks
ready_tasks = [
    issue for issue in all_issues.values()
    if issue.get('status') == 'open' and not issue.get('blocked_by')
]
```

### Parse JSONL (JavaScript)

```javascript
const fs = require('fs');

function readIssues(filepath = '.beads/issues.jsonl') {
  const issues = {};
  const lines = fs.readFileSync(filepath, 'utf-8').split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const issue = JSON.parse(line);
    const issueId = issue.id;
    if (!issues[issueId]) {
      issues[issueId] = {};
    }
    Object.assign(issues[issueId], issue);
  }
  
  return issues;
}

// Get all issues
const allIssues = readIssues();

// Find ready tasks
const readyTasks = Object.values(allIssues).filter(
  issue => issue.status === 'open' && (!issue.blocked_by || issue.blocked_by.length === 0)
);
```

## Limitations Without CLI

- ❌ No SQLite cache (slower queries)
- ❌ No auto-sync daemon
- ❌ No validation
- ❌ No compaction
- ❌ Manual ID generation
- ❌ Manual JSONL parsing

## Benefits Without CLI

- ✅ No installation required
- ✅ Works immediately
- ✅ Full control over data
- ✅ Simple git workflow
- ✅ Compatible with all AI agents

## Upgrading to CLI Later

If you decide to install the CLI later:

```bash
npm install -g @beads/bd
cd your-project
bd init
```

The CLI will:
- Detect existing `.beads/issues.jsonl`
- Build SQLite cache from existing data
- Start auto-sync daemon
- Continue working with your existing issues

