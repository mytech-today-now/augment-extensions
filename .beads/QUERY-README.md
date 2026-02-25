# Beads JSONL Query Scripts

These PowerShell scripts allow you to query Beads issues directly from the JSONL file without requiring a Dolt server connection.

## 🚀 Quick Start

### Using the Simple Wrapper

```powershell
# List all open issues
.\.beads\bd.ps1 list

# Show ready-to-work issues
.\.beads\bd.ps1 ready

# Show issue details
.\.beads\bd.ps1 show bd-123

# Get statistics
.\.beads\bd.ps1 stats

# Search for issues
.\.beads\bd.ps1 search "authentication"
```

### Using the Full Script

```powershell
# List issues with filters
.\.beads\bd-query.ps1 list -Status open -Priority 1

# Show high priority issues
.\.beads\bd-query.ps1 list -Priority 1 -Limit 10

# Search in title and description
.\.beads\bd-query.ps1 search "shot list"

# Get detailed output
.\.beads\bd-query.ps1 list -Long

# Export to JSON
.\.beads\bd-query.ps1 list -Json > issues.json
```

## 📋 Available Commands

### `list` - List Issues
List issues with optional filtering.

**Options:**
- `-Status <status>` - Filter by status (open, in_progress, blocked, deferred, closed)
- `-Priority <0-4>` - Filter by priority (0=highest, 4=lowest)
- `-Assignee <name>` - Filter by assignee
- `-Label <label>` - Filter by label
- `-Title <text>` - Filter by title text
- `-Limit <n>` - Limit results (default: 50, use 0 for all)
- `-All` - Show all issues including closed
- `-Long` - Show detailed output
- `-Json` - Output in JSON format

**Examples:**
```powershell
.\.beads\bd-query.ps1 list
.\.beads\bd-query.ps1 list -Status open -Priority 1
.\.beads\bd-query.ps1 list -Label "bug" -Limit 20
.\.beads\bd-query.ps1 list -All -Json
```

### `show` - Show Issue Details
Display detailed information about a specific issue.

**Usage:**
```powershell
.\.beads\bd-query.ps1 show <issue-id>
.\.beads\bd-query.ps1 show bd-123
.\.beads\bd-query.ps1 show bd-shot-list-1 -Json
```

### `ready` - Show Ready Issues
List issues that are ready to work on (open status, no blockers).

**Usage:**
```powershell
.\.beads\bd-query.ps1 ready
.\.beads\bd-query.ps1 ready -Limit 10
.\.beads\bd-query.ps1 ready -Long
```

### `count` - Count Issues by Status
Show a count of issues grouped by status.

**Usage:**
```powershell
.\.beads\bd-query.ps1 count
```

### `stats` - Show Statistics
Display comprehensive statistics about all issues.

**Usage:**
```powershell
.\.beads\bd-query.ps1 stats
```

### `search` - Search Issues
Search for issues by text in title, description, or ID.

**Usage:**
```powershell
.\.beads\bd-query.ps1 search "authentication"
.\.beads\bd-query.ps1 search "shot list" -Limit 5
```

### `help` - Show Help
Display help information.

**Usage:**
```powershell
.\.beads\bd-query.ps1 help
```

## 🎯 Common Use Cases

### Find High Priority Work
```powershell
.\.beads\bd-query.ps1 list -Priority 1 -Status open
```

### See What's Ready to Work On
```powershell
.\.beads\bd-query.ps1 ready -Limit 5
```

### Check Project Status
```powershell
.\.beads\bd-query.ps1 stats
```

### Find Specific Issues
```powershell
.\.beads\bd-query.ps1 search "shot list"
```

### Export Issues to JSON
```powershell
.\.beads\bd-query.ps1 list -All -Json > all-issues.json
```

### View Issue Details
```powershell
.\.beads\bd-query.ps1 show bd-shot-list-2.2
```

## 📝 Notes

- **JSONL Format**: The script handles the append-only JSONL format by automatically getting the latest state of each issue.
- **No Database Required**: These scripts read directly from `issues.jsonl` without requiring a Dolt server or SQLite database.
- **Read-Only**: These scripts only read data. To create or update issues, you'll need the full `bd` CLI with Dolt server.
- **Performance**: For large JSONL files (>10,000 issues), queries may take a few seconds.

## 🔧 Troubleshooting

### Script Execution Policy
If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### File Not Found
Make sure you're running the script from the repository root:
```powershell
cd g:\_kyle\temp_documents\GitHub\augx\augment-extensions
.\.beads\bd-query.ps1 list
```

## 🚀 Creating an Alias

To make it even easier, create a PowerShell alias:

```powershell
# Add to your PowerShell profile
function bd { & "g:\_kyle\temp_documents\GitHub\augx\augment-extensions\.beads\bd.ps1" @args }

# Now you can use:
bd list
bd ready
bd stats
```

To edit your profile:
```powershell
notepad $PROFILE
```

---

**Need the full Beads experience?** Install and start a Dolt server to use the complete `bd` CLI with write operations.

