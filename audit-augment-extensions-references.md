# Audit: augment-extensions/ Directory References

**Date:** 2026-02-07  
**Task:** bd-zlc - Phase 1: Preparation - Audit and backup  
**Purpose:** Identify all references to `augment-extensions/` directory (excluding node_modules/)

## Summary

Total files with references to `augment-extensions/`: **Multiple files identified**

## Files to Modify

### Documentation Files (.md)
1. `docs/INSPECT_COMMAND.md` - Line 79, 323
2. `docs/INTEGRATION.md` - Lines 42, 138-139
3. `docs/commands/module-inspection.md` - Line 207
4. `docs/examples/module-inspection-workflows.md` - References in code examples
5. `docs/MIGRATION_GUIDE.md` - Lines 90, 106
6. `AGENTS.md` - Line 1 (title), multiple references throughout
7. `README.md` - Line 288, 304
8. `augment-extensions/coding-standards/typescript/README.md` - Line 19
9. `augment-extensions/coding-standards/php/module.json` - Line 160
10. `augment-extensions/coding-standards/js/module.json` - Line 31
11. `augment-extensions/coding-standards/powershell/module.json` - Line 159
12. `augment-extensions/workflows/adr-support/examples/integration-example.md` - Multiple references
13. `augment-extensions/workflows/beads-integration/module.json` - Line 36

### Configuration Files (.json)
1. `package.json` - Line 11 (files array)
2. `augment-extensions/workflows/adr-support/module.json` - Line 51
3. Multiple module.json files in augment-extensions/ subdirectories

### TypeScript/JavaScript Files (.ts, .js)
- CLI source files in `cli/src/commands/` (to be identified in next phase)
- CLI utility files in `cli/src/utils/` (to be identified in next phase)

### PowerShell Files (.ps1)
- `tests/coordination-tests.ps1` (to be identified)
- `tests/functional-tests.ps1` (to be identified)

## Exclusions

**IMPORTANT:** The following must NOT be modified:
- `node_modules/` directory and all contents
- Any references to `node_modules/augment-extensions/` or similar npm package paths

## Next Steps

1. ✅ Audit complete
2. ⏳ Create git branch: `feat/rename-augment-extensions-to-augment-extensions`
3. ⏳ Commit current changes before starting rename
4. ⏳ Proceed with Phase 2: Rename physical directory

## Git Status

Branch creation and backup will be performed next.

