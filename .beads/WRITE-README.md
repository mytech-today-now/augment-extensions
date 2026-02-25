# Beads JSONL Write Operations

The `bd-write.ps1` script provides write operations for Beads issues directly to the JSONL file without requiring a Dolt server.

## 🚀 Quick Start

### Using the Wrapper

```powershell
# Create a new issue
.\.beads\bd.ps1 create "Fix parser bug" --priority 1 --description "Parser fails on edge case"

# Update issue status
.\.beads\bd.ps1 update bd-abc123 --status in_progress

# Close an issue
.\.beads\bd.ps1 close bd-abc123 --reason "Fixed in PR #42"

# Add a comment
.\.beads\bd.ps1 comment bd-abc123 "Working on this now"

# Assign an issue
.\.beads\bd.ps1 assign bd-abc123 --assignee "kyle@mytech.today"

# Add dependency
.\.beads\bd.ps1 link bd-abc123 --blocks bd-def456
```

### Using the Direct Script

```powershell
# Create with all options
.\.beads\bd-write.ps1 create "Implement feature X" `
    -Priority 1 `
    -Description "Add new feature" `
    -IssueType feature `
    -Labels @("enhancement", "phase-2")

# Update multiple fields
.\.beads\bd-write.ps1 update bd-abc123 -Status in_progress -Priority 0

# Close with reason
.\.beads\bd-write.ps1 close bd-abc123 -Reason "Completed in commit abc123"
```

## 📋 Available Commands

### `create` - Create New Issue

Create a new issue with auto-generated ID.

**Usage:**
```powershell
bd-write.ps1 create <title> [options]
```

**Options:**
- `-Description <text>` - Issue description
- `-Priority <0-4>` - Priority (0=highest, 4=lowest, default: 2)
- `-IssueType <type>` - Type: task, bug, feature, epic, story (default: task)
- `-Owner <email>` - Owner email (default: current user)
- `-Labels <label1,label2>` - Comma-separated labels
- `-Status <status>` - Initial status (default: open)

**Examples:**
```powershell
bd-write.ps1 create "Fix authentication bug" -Priority 0 -IssueType bug
bd-write.ps1 create "Add user dashboard" -Description "Create user dashboard page" -Labels @("ui", "phase-3")
```

### `update` - Update Existing Issue

Update status, priority, or assignee of an existing issue.

**Usage:**
```powershell
bd-write.ps1 update <issue-id> [options]
```

**Options:**
- `-Status <status>` - New status (open, in_progress, blocked, deferred, closed)
- `-Priority <0-4>` - New priority
- `-Assignee <email>` - New assignee

**Examples:**
```powershell
bd-write.ps1 update bd-abc123 -Status in_progress
bd-write.ps1 update bd-abc123 -Priority 0 -Assignee "kyle@mytech.today"
```

### `close` - Close Issue

Close an issue with optional reason.

**Usage:**
```powershell
bd-write.ps1 close <issue-id> [-Reason <text>]
```

**Examples:**
```powershell
bd-write.ps1 close bd-abc123 -Reason "Fixed in PR #42"
bd-write.ps1 close bd-abc123
```

### `reopen` - Reopen Closed Issue

Reopen a previously closed issue.

**Usage:**
```powershell
bd-write.ps1 reopen <issue-id>
```

**Examples:**
```powershell
bd-write.ps1 reopen bd-abc123
```

### `comment` - Add Comment

Add a comment to an existing issue.

**Usage:**
```powershell
bd-write.ps1 comment <issue-id> <text>
```

**Examples:**
```powershell
bd-write.ps1 comment bd-abc123 "Working on this now"
bd-write.ps1 comment bd-abc123 "Found the root cause - fixing now"
```

### `assign` - Assign Issue

Assign an issue to a user.

**Usage:**
```powershell
bd-write.ps1 assign <issue-id> -Assignee <email>
```

**Examples:**
```powershell
bd-write.ps1 assign bd-abc123 -Assignee "kyle@mytech.today"
```

### `link` - Add Dependency

Add a dependency/blocker relationship between issues.

**Usage:**
```powershell
bd-write.ps1 link <issue-id> [-Blocks <id> | -BlockedBy <id>]
```

**Examples:**
```powershell
# This issue blocks another
bd-write.ps1 link bd-abc123 -Blocks bd-def456

# This issue is blocked by another
bd-write.ps1 link bd-abc123 -BlockedBy bd-def456
```

## 🔧 Common Workflows

### Create and Start Working on Issue
```powershell
# Create issue
.\.beads\bd.ps1 create "Implement login feature" --priority 1 --issue-type feature

# Get the ID from output (e.g., bd-a1b2)
.\.beads\bd.ps1 update bd-a1b2 --status in_progress
.\.beads\bd.ps1 assign bd-a1b2 --assignee "kyle@mytech.today"
.\.beads\bd.ps1 comment bd-a1b2 "Starting implementation"
```

### Track Progress with Comments
```powershell
.\.beads\bd.ps1 comment bd-a1b2 "Completed authentication logic"
.\.beads\bd.ps1 comment bd-a1b2 "Added unit tests"
.\.beads\bd.ps1 comment bd-a1b2 "Ready for review"
```

### Close When Complete
```powershell
.\.beads\bd.ps1 close bd-a1b2 --reason "Completed in PR #123"
```

## 📝 Notes

- **JSONL Format**: All operations append to `issues.jsonl` following the append-only format
- **Auto-Generated IDs**: Issue IDs are automatically generated using MD5 hash (format: `bd-xxxx`)
- **Timestamps**: All operations include ISO 8601 timestamps
- **Validation**: Input validation ensures data integrity
- **Safe Operations**: All writes are atomic appends - no data is ever deleted

## 🎯 Integration with bd-query.ps1

Use `bd-write.ps1` for write operations and `bd-query.ps1` for read operations:

```powershell
# Write: Create issue
.\.beads\bd.ps1 create "Fix bug" --priority 1

# Read: View ready issues
.\.beads\bd.ps1 ready

# Write: Update status
.\.beads\bd.ps1 update bd-abc123 --status in_progress

# Read: Show issue details
.\.beads\bd.ps1 show bd-abc123
```

## 🔄 Syncing with completed.jsonl

If you have a `completed.jsonl` file with closed tasks that aren't reflected in `issues.jsonl`, use the sync command:

```powershell
# Dry run - see what would be synced
.\.beads\bd.ps1 sync -DryRun

# Sync completed tasks to issues.jsonl
.\.beads\bd.ps1 sync
```

This will:
- Read all tasks from `completed.jsonl`
- Find tasks that are marked as completed but still show as open in `issues.jsonl`
- Append closure entries to `issues.jsonl` with proper timestamps and close reasons
- Skip malformed JSON lines and report them

---

**Need the full Beads experience?** Install and start a Dolt server to use the complete `bd` CLI with advanced features.

