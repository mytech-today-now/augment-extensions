---
id: beads/naming-convention
relatedTasks: [bd-prefix1-1]
relatedRules: [coordination-system.md, module-development.md]
status: active
---

# Beads Naming Convention Specification

## Purpose

This specification defines the standard naming convention for Beads issue IDs in this project.

## Requirements

### Requirement: Issue ID Prefix
All Beads issue IDs in this project MUST use the "bd-" prefix.

#### Scenario: Standard hash-based ID
- GIVEN a new issue is created
- WHEN generating the issue ID
- THEN it MUST use format `bd-<hash>`
- AND the hash MUST be 4 hexadecimal characters
- AND the hash MUST be generated from MD5 hash of timestamp or content

**Examples**:
- `bd-a1b2` ✅
- `bd-c3d4` ✅
- `bd-f6g7` ✅

#### Scenario: Named ID for important tasks
- GIVEN a significant or well-known task is created
- WHEN assigning a memorable ID
- THEN it MUST use format `bd-<name>`
- AND the name MUST be lowercase alphanumeric with hyphens

**Examples**:
- `bd-init` ✅
- `bd-rename1` ✅
- `bd-coord1` ✅

#### Scenario: Hierarchical ID for subtasks
- GIVEN a task has subtasks
- WHEN creating hierarchical IDs
- THEN it MAY use format `bd-<hash>.<number>` OR `bd-<name>-<number>`
- AND nested levels MAY use dots or hyphens as separators

**Examples**:
- `bd-a1b2.1` ✅ (dot separator)
- `bd-a1b2.1.1` ✅ (nested with dots)
- `bd-rename1-1` ✅ (hyphen separator)
- `bd-prefix1-1` ✅ (hyphen separator)

#### Scenario: Invalid prefixes are rejected
- GIVEN an issue ID is being validated
- WHEN the ID does not use "bd-" prefix
- THEN it MUST be rejected
- AND an error message MUST be shown

**Invalid Examples**:
- `augment-a1b2` ❌ (wrong prefix)
- `task-a1b2` ❌ (wrong prefix)
- `a1b2` ❌ (no prefix)
- `bd_a1b2` ❌ (underscore instead of hyphen)

### Requirement: Hash Format
Hash-based IDs MUST follow a specific format.

#### Scenario: Hash generation
- GIVEN a hash-based ID is needed
- WHEN generating the hash
- THEN it MUST be 4 characters long
- AND it MUST use hexadecimal character set (0-9, a-f)
- AND it MUST be generated from MD5 hash truncated to 4 characters

### Requirement: Validation
All new issues MUST be validated to ensure they use the "bd-" prefix.

#### Scenario: Pre-commit validation
- GIVEN changes are being committed
- WHEN the pre-commit hook runs
- THEN it MUST validate all issue IDs in `.beads/issues.jsonl`
- AND it MUST reject commits with invalid prefixes
- AND it MUST show clear error messages

#### Scenario: Coordination manifest validation
- GIVEN task IDs are added to coordination manifest
- WHEN validating the manifest
- THEN all task IDs MUST match pattern `^bd-[a-z0-9]+([.-][a-z0-9]+)*$`
- AND invalid task IDs MUST be rejected

## Rationale

### Why "bd-" prefix?

1. **Consistency**: Single prefix across all issues in the project
2. **Brevity**: "bd" is short (2 characters) and memorable
3. **Clarity**: Clearly identifies Beads issues vs other identifiers
4. **Git-Friendly**: Short prefix reduces commit message length
5. **Collision-Free**: Hash-based IDs prevent conflicts across projects

### Why not other prefixes?

- `augment-`: Too long (8 characters vs 2)
- `task-`: Generic, doesn't identify the system
- No prefix: Ambiguous, could conflict with other IDs

## Configuration

The prefix is configured in `.beads/config.yaml`:

```yaml
# Issue prefix for this repository
issue-prefix: "bd"
```

And stored in the Beads database metadata.

## Migration

If issues with incorrect prefixes are found:

1. Create new issue with correct "bd-" prefix
2. Copy all fields from old issue
3. Add tombstone entry for old issue ID
4. Update all references in code/docs to use new ID
5. Close old issue with reference to new ID

## Validation Scripts

### PowerShell Validation

See `scripts/validate-beads-prefix.ps1` for automated validation.

### Pre-Commit Hook

```bash
# Validate all issue IDs in .beads/issues.jsonl
grep -E '"id":"(?!bd-)[^"]+' .beads/issues.jsonl && exit 1 || exit 0
```

## Success Criteria

- [ ] All issues in `.beads/issues.jsonl` use "bd-" prefix
- [ ] Validation script exists and passes
- [ ] Pre-commit hook validates prefixes
- [ ] Coordination manifest enforces prefix convention
- [ ] Documentation references this spec

