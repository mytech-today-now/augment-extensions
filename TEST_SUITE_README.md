# Augment Extensions - Comprehensive Test Suite

This document describes the comprehensive test suite for the Augment Extensions CLI, including all Phase 3 and Phase 4 commands and utilities.

## Overview

The test suite has been refactored and optimized to:
1. Test all CLI commands (existing + Phase 3 + Phase 4)
2. Test all utilities (core + Phase 3 + Phase 4) - 44 utilities total
3. Run standalone with `npx tsx test-all.ts` in ~103 seconds
4. Integrate with Jest test framework
5. Provide real-time progress indicators
6. Use optimized timeouts (10s for commands, 5s for utilities)

## Running Tests

### Standalone Mode

Run the comprehensive test suite directly:

```bash
npm run test:all
# or
npx tsx test-all.ts
```

This will:
- Run all command tests in isolated sandboxes
- Test all utilities by importing them
- Generate `test-results.jsonl` with detailed results
- Print a summary to console

### Jest Integration

Run tests through Jest framework:

```bash
npm test
# or
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

This will:
- Run all tests through Jest
- Provide Jest's test reporting
- Generate coverage reports
- Support watch mode for development

## Test Structure

### Test Categories

1. **Init Commands** - `augx init`, `augx init beads`
2. **List Commands** - `augx list`, `augx list --linked`, `augx list --json`
3. **Show Commands** - `augx show <module>`, `augx show completed`
4. **Link Commands** - `augx link <module>`
5. **Unlink Commands** - `augx unlink <module>`
6. **Coordination Commands** - `augx coord specs`, `augx coord tasks`, etc.
7. **Sync Commands** - `augx sync beads`, `augx sync openspec`, `augx sync all`
8. **Skill Commands** - `augx skill list`, `augx skill search`, etc.
9. **MCP Commands** - `augx mcp list`, `augx mcp add`, etc.
10. **Other Commands** - `augx update`, `augx search`, `augx validate`, etc.
11. **Phase 3 Commands** - Beads, Task, Spec, Change management
12. **Utilities** - All utility modules (core + Phase 3 + Phase 4)

### Phase 3 Commands Tested

**Beads Commands:**
- `beads status` - Show Beads system status
- `beads validate` - Validate issues.jsonl file
- `beads list` - List all tasks
- `beads ready` - Show ready tasks

**Task Commands:**
- `task list` - List tasks with filters
- `task search` - Search tasks

**Spec Commands:**
- `spec list` - List OpenSpec specifications
- `spec stats` - Show specification statistics

**Change Commands:**
- `change list` - List change proposals
- `change stats` - Show change statistics

### Utilities Tested

**Core Utilities:**
- auto-sync, beads-sync, beadsCompletedChecker, catalog-sync, character-count
- config-system, coordination-queries, documentation-validator, extractCommandHelp
- file-tracking, gui-helpers, hook-system, inspection-cache, inspection-handlers
- install-rules, mcp-integration, migrate, module-system, modules-catalog
- openspec-sync, plugin-system, progress, rule-install-hooks, skill-system
- stream-reader, vscode-editor, vscode-links

**Phase 3 Utilities:**
- beads-integration, beads-reporter, beads-graph
- spec-manager, change-manager

**Phase 4 Utilities:**
- config-manager-enhanced, export-system, import-system
- agent-config, context-manager, prompt-manager
- template-engine, diff-engine, health-checker
- cache-manager, stats-collector, module-cloner

## Test Results

### Standalone Mode Output

Results are saved to `test-results.jsonl` in JSONL format. Each line is a JSON object with:

```json
{
  "timestamp": "2026-02-18T...",
  "type": "command|utility|integration",
  "category": "init|list|show|...",
  "name": "test name",
  "args": ["arg1", "arg2"],
  "status": "success|failure|skipped",
  "exitCode": 0,
  "durationMs": 1234,
  "stdout": "...",
  "stderr": "...",
  "filesCreated": ["file1", "file2"],
  "filesModified": ["file3"],
  "assertions": [...]
}
```

### Analyzing Results

PowerShell commands to analyze results:

```powershell
# Group by status
Get-Content test-results.jsonl | ConvertFrom-Json | Group-Object status | Select-Object Name, Count

# Group by category
Get-Content test-results.jsonl | ConvertFrom-Json | Group-Object category | Select-Object Name, Count

# Show failures
Get-Content test-results.jsonl | ConvertFrom-Json | Where-Object { $_.status -eq 'failure' } | Format-Table name, exitCode

# Show slow tests
Get-Content test-results.jsonl | ConvertFrom-Json | Sort-Object durationMs -Descending | Select-Object -First 10 name, durationMs
```

## Test Isolation

Each test runs in an isolated sandbox with:
- Temporary directory
- Sample `.beads/` structure
- Sample `openspec/` structure
- Sample `.augment/` coordination manifest
- Sample modules

This ensures tests don't interfere with each other or the actual project.

## Adding New Tests

To add new tests:

1. Add test function in `test-all.ts`:
```typescript
function testMyNewCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing MY NEW commands...\n');
  // ... test implementation
}
```

2. Call it from `main()`:
```typescript
async function main(): Promise<void> {
  // ...
  testMyNewCommands(runner);
  // ...
}
```

3. Export it for Jest:
```typescript
export {
  // ...
  testMyNewCommands
};
```

4. Add Jest test in `__tests__/test-all.test.ts`:
```typescript
describe('My New Commands', () => {
  it('should run all my new command tests', () => {
    testMyNewCommands(runner);
    // ... assertions
  }, 60000);
});
```

## Performance Optimizations

The test suite has been optimized to complete in ~103 seconds:

1. **Reduced Timeouts**:
   - Command tests: 10 seconds (down from 60s)
   - Utility tests: 5 seconds (down from 15s)
   - Phase 3 tests: 5 seconds (down from 15s)

2. **Progress Indicators**:
   - Suite-level progress: `[1/12] Running Init Commands...`
   - Utility-level progress: `[1/44] Testing auto-sync... ✓ (563ms)`
   - Real-time duration display

3. **Skipped Interactive Tests**:
   - `gui` command skipped (interactive, would hang)
   - Phase 3 commands verify file existence only (not yet registered in CLI)

4. **Test Results**:
   - 91 total tests
   - 44 utility import tests
   - 43 command tests
   - 4 Phase 3 file existence checks

## Troubleshooting

### Tests Failing

1. Check `test-results.jsonl` for detailed error messages
2. Look at `stdout` and `stderr` fields
3. Check `exitCode` for command failures
4. Verify sandbox setup is correct

### Timeout Issues

If tests timeout:
1. Check which test is hanging (progress indicators show this)
2. Increase timeout for that specific test category
3. Consider if the test is interactive (like `gui` command)

Increase timeout in Jest tests:
```typescript
it('should run tests', () => {
  // ...
}, 120000); // 2 minutes
```

### Import Errors

Ensure all utilities are listed in the `UTILITIES` array in `test-all.ts`.

### Hanging Tests

If a test hangs:
1. Check if it's an interactive command (inquirer, prompts, etc.)
2. Add it to the skip list in the test function
3. Or add `--help` flag to prevent interactive mode

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Run comprehensive tests
  run: npm run test:all

- name: Run Jest tests
  run: npm test

- name: Upload test results
  uses: actions/upload-artifact@v2
  with:
    name: test-results
    path: test-results.jsonl
```

