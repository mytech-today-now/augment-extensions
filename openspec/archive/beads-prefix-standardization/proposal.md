# Change Proposal: Beads Prefix Standardization

## Metadata

- **Change ID**: `beads-prefix-standardization`
- **Status**: Proposed
- **Created**: 2026-01-21
- **Author**: AI Agent
- **Priority**: Medium
- **Type**: Documentation & Validation

## Problem Statement

The Beads issue tracking system uses "bd-" as the prefix for all issue IDs (e.g., `bd-a1b2`, `bd-rename1`). However, there is inconsistency in documentation and potential confusion about the naming convention:

1. **Historical Context**: The project may have previously used "augment-" prefix
2. **Doctor Warning**: `bd doctor` shows a false positive warning about prefix mismatch
3. **Documentation Gaps**: Not all documentation clearly states the "bd-" prefix convention
4. **Validation Needed**: No automated validation ensures all new issues use "bd-" prefix

## Current State

### What's Working

- ✅ All 32 issues in `.beads/issues.jsonl` use "bd-" prefix correctly
- ✅ Most documentation references "bd-" prefix (AGENTS.md, workflow docs)
- ✅ Beads CLI configured with "bd" prefix in database
- ✅ Examples in documentation use "bd-" prefix

### What's Not Working

- ❌ `bd doctor` shows false positive: "Prefix mismatch: database uses 'augment' but most JSONL issues use 'bd'"
- ❌ No explicit spec documenting the "bd-" prefix as the standard
- ❌ No validation to prevent future issues from using wrong prefix
- ❌ Coordination manifest doesn't enforce prefix convention

## Proposed Solution

### 1. Create Specification

Create a formal spec documenting the "bd-" prefix as the official standard for this project.

### 2. Update Documentation

Ensure all documentation consistently references "bd-" prefix:
- OpenSpec project context
- Beads workflow documentation
- AGENTS.md
- Coordination system rules

### 3. Add Validation

Add validation rules to prevent incorrect prefixes:
- Git pre-commit hook validation
- Coordination manifest validation
- Documentation linting

### 4. Fix False Positive

Investigate and resolve the `bd doctor` false positive warning about prefix mismatch.

## Benefits

1. **Clarity**: Clear, documented standard for issue ID prefixes
2. **Consistency**: All issues follow the same naming convention
3. **Validation**: Automated checks prevent future mistakes
4. **Onboarding**: New contributors understand the convention immediately
5. **Integration**: Better integration with coordination system

## Risks

- **Low Risk**: This is primarily a documentation and validation change
- **No Breaking Changes**: All existing issues already use "bd-" prefix
- **Minimal Effort**: Most work is documentation updates

## Success Criteria

- [ ] Spec created documenting "bd-" prefix standard
- [ ] All documentation updated to reference "bd-" prefix
- [ ] Validation added to prevent incorrect prefixes
- [ ] `bd doctor` false positive resolved or documented
- [ ] Coordination manifest enforces prefix convention
- [ ] All tests pass

## Timeline

- **Estimated Effort**: 2-4 hours
- **Phases**: 3 phases (spec, validation, testing)

## Dependencies

- Requires understanding of Beads CLI internals for fixing false positive
- May require coordination with Beads upstream project

## Related Work

- Related to `bd-rename1` (modules → augment-extensions rename)
- Related to coordination system implementation
- Related to Beads workflow integration

## Open Questions

1. Should we support multiple prefixes in the future?
2. Should prefix be configurable per-project?
3. How to handle prefix in hierarchical IDs (e.g., `bd-a1b2.1`)?
4. Should we validate prefix in coordination manifest?

## Next Steps

1. Review and approve this proposal
2. Create spec delta
3. Create task breakdown
4. Implement changes
5. Test and validate
6. Archive completed change

