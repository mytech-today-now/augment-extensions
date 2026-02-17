# Comprehensive Test Suite Documentation

## Overview

The `test-all.ts` file has been refactored to provide comprehensive testing of all CLI commands and utilities in sandboxed environments. Each test runs in an isolated temporary directory with realistic project structures.

## Test Architecture

### Core Components

1. **TestSandbox Class**
   - Creates isolated temporary directories for each test
   - Sets up realistic project structures (.augment, .beads, openspec, etc.)
   - Provides fixture data (sample modules, issues, specs)
   - Tracks file creation/modification
   - Handles cleanup

2. **TestRunner Class**
   - Executes CLI commands in sandboxed environments
   - Performs comprehensive verification (exit codes, output, files)
   - Tracks test results with detailed assertions
   - Generates summary statistics
   - Saves results to JSONL format

3. **Test Suites**
   - `testInitCommands()` - Tests init command and subcommands
   - `testListCommands()` - Tests list with various options
   - `testShowCommands()` - Tests show with all variations (completed, linked, all)
   - `testLinkCommands()` - Tests module linking
   - `testUnlinkCommands()` - Tests module unlinking
   - `testCoordCommands()` - Tests coordination queries (specs, tasks, rules, file)
   - `testSyncCommands()` - Tests sync operations (beads, openspec, all)
   - `testSkillCommands()` - Tests skill management
   - `testMcpCommands()` - Tests MCP server integration
   - `testOtherCommands()` - Tests remaining commands (update, search, validate, etc.)
   - `testUtilities()` - Tests utility module imports

## Test Features

### Sandboxed Environment

Each test creates a fresh temporary directory with:
- `.augment/` directory with coordination.json
- `.beads/` directory with sample issues and config
- `openspec/` directory with specs and changes
- `scripts/` directory with completed.jsonl
- Sample modules (if available)
- package.json and tsconfig.json

### Comprehensive Verification

Tests verify:
- ✅ Exit codes (expected vs actual)
- ✅ stdout content (contains/not contains)
- ✅ stderr output
- ✅ JSON validity (when --json flag is used)
- ✅ Files created
- ✅ Files modified
- ✅ Command execution time

### Test Results

Results are saved to `test-results.jsonl` with detailed information:
```json
{
  "timestamp": "2026-02-17T...",
  "type": "command",
  "category": "init",
  "name": "init --help",
  "args": ["--help"],
  "status": "success",
  "exitCode": 0,
  "durationMs": 1234,
  "stdout": "...",
  "stderr": "",
  "filesCreated": [],
  "assertions": [
    {
      "name": "exit_code",
      "passed": true,
      "expected": 0,
      "actual": 0
    }
  ]
}
```

## Running Tests

```bash
# Run all tests
npm run test:all

# Or directly with tsx
npx tsx test-all.ts
```

## Test Coverage

### Commands Tested

- ✅ init (basic, --from-submodule, beads subcommand)
- ✅ list (all, --linked, --json)
- ✅ show (module, completed, linked, all, with various filters)
- ✅ link (basic, --version)
- ✅ unlink (basic, --force)
- ✅ coord (specs, tasks, rules, file)
- ✅ sync (beads, openspec, all)
- ✅ skill (list, search, cache-stats, with filters)
- ✅ mcp (list, with --json)
- ✅ update, search, validate, catalog, install-rules, self-remove, gui

### Utilities Tested

All 27 utilities are tested for successful import:
- auto-sync, beads-sync, beadsCompletedChecker, catalog-sync, character-count
- config-system, coordination-queries, documentation-validator, extractCommandHelp
- file-tracking, gui-helpers, hook-system, inspection-cache, inspection-handlers
- install-rules, mcp-integration, migrate, module-system, modules-catalog
- openspec-sync, plugin-system, progress, rule-install-hooks, skill-system
- stream-reader, vscode-editor, vscode-links

## Extending Tests

### Adding a New Test Case

```typescript
const testCases: TestCase[] = [
  {
    name: 'my new test',
    args: ['--my-flag', 'value'],
    expectedExitCode: 0,
    shouldContain: ['expected output'],
    shouldNotContain: ['error'],
    verifyJSON: true
  }
];
```

### Adding a New Test Suite

```typescript
function testMyNewCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing MY NEW commands...\n');
  
  const testCases: TestCase[] = [
    // ... test cases
  ];
  
  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();
    // ... setup other fixtures
    
    logTestStart('my-command', testCase.name);
    const result = runner.runCommand(sandbox, 'my-command', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain,
      verifyJSON: testCase.verifyJSON
    });
    
    logTestResult(result);
    sandbox.cleanup();
  }
}

// Add to main():
testMyNewCommands(runner);
```

## Analysis Commands

```powershell
# View summary by status
Get-Content test-results.jsonl | ConvertFrom-Json | Group-Object status | Select-Object Name, Count

# View summary by category
Get-Content test-results.jsonl | ConvertFrom-Json | Group-Object category | Select-Object Name, Count

# View failed tests
Get-Content test-results.jsonl | ConvertFrom-Json | Where-Object { $_.status -eq 'failure' } | Select-Object name, exitCode

# View slowest tests
Get-Content test-results.jsonl | ConvertFrom-Json | Sort-Object durationMs -Descending | Select-Object -First 10 name, durationMs
```

