# Spec Delta: Beads Prefix Standardization

## Overview

This spec delta documents the changes needed to standardize and validate the "bd-" prefix for all Beads issue IDs.

---

## ADDED: Beads Naming Convention Spec

**File**: `openspec/specs/beads/naming-convention.md`

### Content

```markdown
# Beads Naming Convention Specification

## Issue ID Prefix

**Standard**: All Beads issue IDs in this project MUST use the "bd-" prefix.

### Format

- **Standard IDs**: `bd-<hash>` (e.g., `bd-a1b2`, `bd-c3d4`)
- **Hierarchical IDs**: `bd-<hash>.<number>` (e.g., `bd-a1b2.1`, `bd-a1b2.1.1`)
- **Named IDs**: `bd-<name>` (e.g., `bd-rename1`, `bd-init`)

### Hash Format

- **Length**: 4 characters
- **Character Set**: Hexadecimal (0-9, a-f)
- **Generation**: MD5 hash of timestamp or content, truncated to 4 chars

### Examples

Valid:
- `bd-a1b2` ✅
- `bd-rename1` ✅
- `bd-a1b2.1` ✅
- `bd-init` ✅

Invalid:
- `augment-a1b2` ❌
- `task-a1b2` ❌
- `a1b2` ❌
- `bd_a1b2` ❌

## Rationale

1. **Consistency**: Single prefix across all issues
2. **Brevity**: "bd" is short and memorable
3. **Clarity**: Clearly identifies Beads issues
4. **Git-Friendly**: Short prefix reduces commit message length
5. **Collision-Free**: Hash-based IDs prevent conflicts

## Validation

All new issues MUST be validated to ensure they use the "bd-" prefix.

### Pre-Commit Hook

```bash
# Validate all issue IDs in .beads/issues.jsonl
grep -E '"id":"(?!bd-)[^"]+' .beads/issues.jsonl && exit 1 || exit 0
```

### Coordination Manifest

The coordination manifest MUST validate that all task IDs use "bd-" prefix.

## Migration

If issues with incorrect prefixes are found:

1. Create new issue with correct "bd-" prefix
2. Copy all fields from old issue
3. Add tombstone for old issue ID
4. Update all references to use new ID

## Configuration

The prefix is configured in `.beads/config.yaml`:

```yaml
# Issue prefix for this repository
issue-prefix: "bd"
```

And in the Beads database metadata.
```

---

## MODIFIED: Coordination System Rules

**File**: `.augment/rules/coordination-system.md`

### Changes

Add validation rule for Beads issue prefix:

```markdown
### Task ID Validation

All task IDs in the coordination manifest MUST use the "bd-" prefix.

**Validation**:
- Check all task IDs in `coordination.json`
- Ensure they match pattern: `^bd-[a-z0-9]+(\.[0-9]+)*$`
- Reject any task IDs that don't match

**Example**:
```json
{
  "tasks": {
    "bd-a1b2": { ... },  // ✅ Valid
    "augment-a1b2": { ... }  // ❌ Invalid
  }
}
```
```

---

## MODIFIED: Beads Workflow Documentation

**File**: `augment-extensions/workflows/beads/rules/workflow.md`

### Changes

Add explicit section on naming convention:

```markdown
## Naming Convention

All Beads issues in this project use the **"bd-" prefix**.

### Standard Format

- `bd-<hash>` - Standard hash-based ID (e.g., `bd-a1b2`)
- `bd-<name>` - Named ID for important tasks (e.g., `bd-init`, `bd-rename1`)
- `bd-<hash>.<number>` - Hierarchical ID (e.g., `bd-a1b2.1`)

### Why "bd"?

- **Brevity**: Short and memorable
- **Clarity**: Clearly identifies Beads issues
- **Consistency**: Single prefix across all issues
- **Git-Friendly**: Reduces commit message length

### Validation

All new issues are validated to ensure they use the "bd-" prefix. See the pre-commit hook in `.git/hooks/pre-commit`.
```

---

## ADDED: Validation Script

**File**: `scripts/validate-beads-prefix.ps1`

### Content

```powershell
# Validate Beads Issue Prefix
# Ensures all issues in .beads/issues.jsonl use "bd-" prefix

$issuesFile = ".beads/issues.jsonl"

if (-not (Test-Path $issuesFile)) {
    Write-Host "✅ No issues file found (OK for new repos)"
    exit 0
}

$invalidIssues = Get-Content $issuesFile | 
    ConvertFrom-Json | 
    Where-Object { $_.id -notmatch '^bd-' } |
    Select-Object -ExpandProperty id

if ($invalidIssues) {
    Write-Host "❌ Found issues with invalid prefix:"
    $invalidIssues | ForEach-Object { Write-Host "  - $_" }
    Write-Host ""
    Write-Host "All issues must use 'bd-' prefix"
    exit 1
}

Write-Host "✅ All issues use correct 'bd-' prefix"
exit 0
```

---

## Files Affected

- `openspec/specs/beads/naming-convention.md` (NEW)
- `.augment/rules/coordination-system.md` (MODIFIED)
- `augment-extensions/workflows/beads/rules/workflow.md` (MODIFIED)
- `scripts/validate-beads-prefix.ps1` (NEW)
- `openspec/project-context.md` (MODIFIED - add reference to naming convention)

