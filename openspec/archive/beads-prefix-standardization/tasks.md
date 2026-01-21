# Tasks: Beads Prefix Standardization

## Overview

Task breakdown for implementing Beads prefix standardization across the project.

---

## Phase 1: Specification (bd-prefix1)

**Parent Task**: Create formal specification for "bd-" prefix standard

### bd-prefix1-1: Create naming convention spec
- **Description**: Create `openspec/specs/beads/naming-convention.md` with formal specification
- **Priority**: 1
- **Estimated Time**: 30 minutes
- **Deliverables**:
  - Spec file created
  - Format rules documented
  - Examples provided
  - Validation rules defined

### bd-prefix1-2: Update project context
- **Description**: Update `openspec/project-context.md` to reference naming convention
- **Priority**: 1
- **Estimated Time**: 15 minutes
- **Deliverables**:
  - Project context updated
  - Reference to naming convention added

---

## Phase 2: Documentation (bd-prefix2)

**Parent Task**: Update all documentation to reference "bd-" prefix standard

### bd-prefix2-1: Update coordination system rules
- **Description**: Add task ID validation to `.augment/rules/coordination-system.md`
- **Priority**: 1
- **Estimated Time**: 20 minutes
- **Deliverables**:
  - Validation rule added
  - Examples provided
  - Pattern documented

### bd-prefix2-2: Update Beads workflow documentation
- **Description**: Add naming convention section to `augment-extensions/workflows/beads/rules/workflow.md`
- **Priority**: 1
- **Estimated Time**: 20 minutes
- **Deliverables**:
  - Naming convention section added
  - Rationale explained
  - Examples provided

### bd-prefix2-3: Update AGENTS.md
- **Description**: Ensure AGENTS.md clearly states "bd-" prefix convention
- **Priority**: 2
- **Estimated Time**: 10 minutes
- **Deliverables**:
  - AGENTS.md updated
  - Convention clearly stated

### bd-prefix2-4: Audit all documentation
- **Description**: Search all .md files for references to issue IDs and ensure they use "bd-" prefix
- **Priority**: 2
- **Estimated Time**: 30 minutes
- **Deliverables**:
  - All documentation audited
  - Any incorrect references fixed

---

## Phase 3: Validation (bd-prefix3)

**Parent Task**: Add automated validation for "bd-" prefix

### bd-prefix3-1: Create validation script
- **Description**: Create `scripts/validate-beads-prefix.ps1` to validate all issue IDs
- **Priority**: 1
- **Estimated Time**: 30 minutes
- **Deliverables**:
  - Validation script created
  - Tests all issues in .beads/issues.jsonl
  - Returns exit code 0 on success, 1 on failure

### bd-prefix3-2: Add coordination manifest validation
- **Description**: Update coordination manifest to validate task ID prefixes
- **Priority**: 2
- **Estimated Time**: 45 minutes
- **Deliverables**:
  - Validation logic added to coordination system
  - Rejects invalid task IDs
  - Clear error messages

### bd-prefix3-3: Update git hooks
- **Description**: Add prefix validation to pre-commit hook
- **Priority**: 2
- **Estimated Time**: 20 minutes
- **Deliverables**:
  - Pre-commit hook updated
  - Validates issue IDs before commit
  - Clear error messages

### bd-prefix3-4: Test validation
- **Description**: Test all validation mechanisms with valid and invalid IDs
- **Priority**: 1
- **Estimated Time**: 30 minutes
- **Deliverables**:
  - All validation tested
  - Edge cases covered
  - Documentation updated

---

## Phase 4: Investigation (bd-prefix4)

**Parent Task**: Investigate and resolve `bd doctor` false positive

### bd-prefix4-1: Investigate bd doctor warning
- **Description**: Investigate why `bd doctor` shows prefix mismatch warning
- **Priority**: 2
- **Estimated Time**: 45 minutes
- **Deliverables**:
  - Root cause identified
  - Solution proposed

### bd-prefix4-2: Fix or document false positive
- **Description**: Either fix the false positive or document it as known issue
- **Priority**: 2
- **Estimated Time**: 30 minutes
- **Deliverables**:
  - False positive fixed OR
  - Known issue documented with workaround

---

## Phase 5: Finalization (bd-prefix5)

**Parent Task**: Final checks and documentation

### bd-prefix5-1: Update coordination manifest
- **Description**: Update `.augment/coordination.json` with this change
- **Priority**: 1
- **Estimated Time**: 15 minutes
- **Deliverables**:
  - Coordination manifest updated
  - All tasks linked
  - All specs linked

### bd-prefix5-2: Run all tests
- **Description**: Run all validation scripts and tests
- **Priority**: 1
- **Estimated Time**: 20 minutes
- **Deliverables**:
  - All tests pass
  - No regressions

### bd-prefix5-3: Commit and archive
- **Description**: Commit all changes and archive the OpenSpec change
- **Priority**: 1
- **Estimated Time**: 15 minutes
- **Deliverables**:
  - All changes committed
  - OpenSpec change archived
  - Documentation complete

---

## Summary

**Total Tasks**: 15
**Total Estimated Time**: 5 hours 30 minutes
**Phases**: 5

**Dependencies**:
- Phase 2 depends on Phase 1 (need spec before updating docs)
- Phase 3 depends on Phase 1 (need spec for validation)
- Phase 5 depends on all previous phases

