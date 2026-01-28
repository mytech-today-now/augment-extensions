# Beads Usage Guide

## Current Status

✅ **Beads is initialized and configured**

However, the `bd` CLI tool has a module resolution error. You can either:
1. Use the PowerShell helper scripts (recommended for now)
2. Fix the `bd` CLI installation

---

## Option 1: Using PowerShell Helper Scripts (Recommended)

### Load Helper Commands

```powershell
. .\scripts\beads-helpers.ps1
```

### Available Commands

```powershell
# List all open issues
bd-list-open

# List all issues (including closed)
bd-list-all

# Show issue details
bd-show bd-augext
bd-show bd-augext.1
bd-show bd-charcount.1

# List augment-extensions epic tasks
bd-list-augext

# List character count installation tasks
bd-list-charcount

# Show help
bd-help
```

### Direct Query Script

You can also use the query script directly:

```powershell
# List open issues
.\scripts\beads-query.ps1 -Command list -Status open

# List all issues
.\scripts\beads-query.ps1 -Command list

# Show issue details
.\scripts\beads-query.ps1 -Command show -Id bd-augext.1
```

---

## Option 2: Fix the bd CLI

### Reinstall bd CLI

```powershell
# Uninstall current version
npm uninstall -g @beads/bd

# Reinstall
npm install -g @beads/bd

# Verify installation
bd --version
```

### Once Fixed, Use These Commands

```bash
# List all issues
bd list

# List open issues only
bd list --status open

# Show issue details
bd show bd-augext
bd show bd-augext.1

# Update issue status
bd update bd-augext.1 --status in_progress

# Add comment to issue
bd comment bd-augext.1 "Started implementation"

# Close issue
bd close bd-augext.1

# Sync with git
bd sync
```

---

## Current Tasks

### Epic 1: Augment Extensions System (bd-augext)

**10 subtasks:**
- `bd-augext.1` - Implement module system core functionality [P1]
- `bd-augext.2` - Implement character count calculation and validation [P1]
- `bd-augext.3` - Implement module category system [P2]
- `bd-augext.4` - Implement 'augx list' command [P1]
- `bd-augext.5` - Implement 'augx show' command [P1]
- `bd-augext.6` - Implement 'augx link' command [P1]
- `bd-augext.7` - Implement semantic versioning validation [P2]
- `bd-augext.8` - Implement project-agnostic content validation [P2]
- `bd-augext.9` - Implement module documentation validation [P2]
- `bd-augext.10` - Implement MODULES.md catalog auto-update [P2]

### Epic 2: Character Count Rule Installation (bd-charcount)

**12 subtasks:**
- `bd-charcount.1` - Implement .augment/ directory creation [P1]
- `bd-charcount.2` - Implement character-count-management.md installation [P1]
- `bd-charcount.3` - Implement duplicate rule prevention [P1]
- `bd-charcount.4` - Implement cross-platform file operations [P1]
- `bd-charcount.5` - Implement comprehensive error handling [P1]
- `bd-charcount.6` - Implement user notification system [P2]
- `bd-charcount.7` - Implement async file I/O operations [P2]
- `bd-charcount.8` - Implement installation trigger hooks [P1]
- `bd-charcount.9` - Implement installation configuration options [P3]
- `bd-charcount.10` - Write unit tests for installation logic [P1]
- `bd-charcount.11` - Write integration tests for installation [P2]
- `bd-charcount.12` - Optimize installation performance [P3]

---

## Task Dependencies

### Augment Extensions System
- `bd-augext.1` (Module system) blocks:
  - `bd-augext.3` (Categories)
  - `bd-augext.4` (CLI list)
  - `bd-augext.5` (CLI show)
  - `bd-augext.6` (CLI link)
- `bd-augext.2` (Character count) blocks:
  - `bd-augext.10` (Catalog auto-update)

### Character Count Installation
- `bd-charcount.1` (Directory creation) blocks:
  - `bd-charcount.2` (File installation)
  - `bd-charcount.10` (Unit tests)
- `bd-charcount.2` (File installation) blocks:
  - `bd-charcount.3` (Duplicate prevention)
  - `bd-charcount.6` (Notifications)
  - `bd-charcount.10` (Unit tests)
- `bd-charcount.10` (Unit tests) blocks:
  - `bd-charcount.11` (Integration tests)

---

## Integration with OpenSpec

All tasks are linked to their OpenSpec specifications:

- **bd-augext tasks** → `openspec/specs/augment-extensions/spec.md`
- **bd-charcount tasks** → `openspec/specs/augment-extensions/character-count-rule-installation.md`

Each task includes:
- `spec` field: References the OpenSpec specification
- `rules` field: References applicable `.augment/` rules
- Dependencies: Parent-child and blocking relationships

---

## Quick Start

```powershell
# 1. Load helper commands
. .\scripts\beads-helpers.ps1

# 2. View open tasks
bd-list-open

# 3. View epic details
bd-list-augext
bd-list-charcount

# 4. View specific task
bd-show bd-augext.1
```

---

## Next Steps

1. **Choose a task** from the open list
2. **Review the task details** using `bd-show <id>`
3. **Check dependencies** to ensure blockers are complete
4. **Start implementation** following the OpenSpec specification
5. **Update task status** as you progress (once bd CLI is fixed)

