# Beads Query - Quick Reference Card

## 🚀 Setup Complete!

The `bd` alias has been added to your PowerShell profile. You can now use it from **any directory**!

---

## 📋 Essential Commands

### View Statistics
```powershell
bd stats
```
Shows comprehensive statistics: total issues, status breakdown, priority counts, ready issues.

### List Ready Issues
```powershell
bd ready
```
Shows issues that are ready to work on (open status, no blockers).

### Count Issues
```powershell
bd count
```
Quick count of issues grouped by status.

### List All Open Issues
```powershell
bd list
```
Lists all open issues (default limit: 50).

### Show Issue Details
```powershell
bd show bd-123
```
Display detailed information about a specific issue.

### Search Issues
```powershell
bd search "authentication"
```
Search for issues by text in title, description, or ID.

---

## 🎯 Common Filters

### Filter by Status
```powershell
bd list -Status open
bd list -Status in_progress
bd list -Status blocked
bd list -Status closed
```

### Filter by Priority
```powershell
bd list -Priority 0    # Critical
bd list -Priority 1    # High
bd list -Priority 2    # Medium
```

### Combine Filters
```powershell
bd list -Status open -Priority 1
bd list -Status open -Priority 1 -Limit 10
```

### Show All Issues (Including Closed)
```powershell
bd list -All
```

---

## 📊 Output Formats

### Table Format (Default)
```powershell
bd list
```

### Detailed Format
```powershell
bd list -Long
bd ready -Long
```

### JSON Format
```powershell
bd list -Json
bd list -Json > issues.json
```

---

## 🔍 Advanced Queries

### Find High Priority Work
```powershell
bd list -Priority 1 -Status open
```

### Search for Specific Issues
```powershell
bd search "shot list"
bd search "authentication" -Limit 5
```

### Filter by Title
```powershell
bd list -Title "Phase 1"
```

### Filter by Assignee
```powershell
bd list -Assignee "kyle"
```

### Filter by Label
```powershell
bd list -Label "bug"
bd list -Label "feature"
```

---

## 💡 Pro Tips

### Export to JSON
```powershell
bd list -All -Json > all-issues.json
bd ready -Json > ready-issues.json
```

### Unlimited Results
```powershell
bd list -Limit 0    # Show all results (no limit)
```

### Quick Status Check
```powershell
bd stats    # Full dashboard
bd count    # Quick counts
```

### Find Your Next Task
```powershell
bd ready -Limit 5    # Top 5 ready issues
```

---

## 🆘 Help

### Show Help
```powershell
bd help
```

### View Full Documentation
```powershell
Get-Content .beads\QUERY-README.md
```

---

## 📍 Profile Location

Your PowerShell profile is located at:
```
C:\Users\kyle\OneDrive\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
```

To edit it:
```powershell
notepad $PROFILE
```

---

## 🔧 Troubleshooting

### Alias Not Working?
1. Open a **new** PowerShell window
2. Or reload your profile: `. $PROFILE`

### Need to Update the Alias?
```powershell
.\.beads\setup-alias.ps1
```

### Check if Alias Exists
```powershell
Get-Command bd
```

---

## 📚 Examples

### Daily Workflow
```powershell
# Morning: Check what's ready
bd ready -Limit 5

# View details of an issue
bd show bd-shot-list-2.2

# Check overall progress
bd stats

# Find specific work
bd search "parser"
```

### Project Management
```powershell
# Count issues by status
bd count

# List all high priority items
bd list -Priority 1

# Export current state
bd list -All -Json > project-snapshot.json
```

### Quick Searches
```powershell
# Find all shot list issues
bd search "shot list"

# Find Phase 2 work
bd list -Title "Phase 2"

# Find blocked issues
bd list -Status blocked
```

---

**🎉 You're all set! Start using `bd` from anywhere in PowerShell!**

