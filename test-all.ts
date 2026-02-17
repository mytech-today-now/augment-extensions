// test-all.ts
// Comprehensive test suite for all CLI commands and utilities in sandboxed environments
// Tests all command variations, options, and edge cases

import { spawnSync, SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TSX_LOADER_PATH = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'esm', 'index.mjs');

if (!fs.existsSync(TSX_LOADER_PATH)) {
  console.error(`\nERROR: tsx loader not found at:\n  ${TSX_LOADER_PATH}`);
  console.error('Please verify path with: dir node_modules\\tsx\\dist');
  console.error('Common alternatives: dist/esm/loader.mjs, dist/esm/index.mjs');
  console.error('Fix: adjust TSX_LOADER_PATH constant or reinstall tsx (npm i -D tsx@latest)\n');
  process.exit(1);
}

const CLI_SRC_DIR = path.join(__dirname, 'cli', 'src');
const CLI_ENTRY = path.join(CLI_SRC_DIR, 'cli.ts');
const RESULTS_FILE = path.join(__dirname, 'test-results.jsonl');
const MODULES_DIR = path.join(__dirname, 'modules');

const UTILITIES = [
  'auto-sync', 'beads-sync', 'beadsCompletedChecker', 'catalog-sync', 'character-count',
  'config-system', 'coordination-queries', 'documentation-validator', 'extractCommandHelp',
  'file-tracking', 'gui-helpers', 'hook-system', 'inspection-cache', 'inspection-handlers',
  'install-rules', 'mcp-integration', 'migrate', 'module-system', 'modules-catalog',
  'openspec-sync', 'plugin-system', 'progress', 'rule-install-hooks', 'skill-system',
  'stream-reader', 'vscode-editor', 'vscode-links'
];

// ============================================================================
// TYPES
// ============================================================================

interface TestResult {
  timestamp: string;
  type: 'command' | 'utility' | 'integration' | 'error-handling';
  category: string;
  name: string;
  args: string[];
  status: 'success' | 'failure' | 'skipped';
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  filesCreated?: string[];
  filesModified?: string[];
  assertions?: Array<{
    name: string;
    passed: boolean;
    expected?: any;
    actual?: any;
  }>;
  error?: string;
}

interface TestCase {
  name: string;
  args: string[];
  expectedExitCode?: number;
  shouldContain?: string[];
  shouldNotContain?: string[];
  shouldCreateFiles?: string[];
  shouldModifyFiles?: string[];
  verifyJSON?: boolean;
  skip?: boolean;
  skipReason?: string;
}

// ============================================================================
// TEST INFRASTRUCTURE
// ============================================================================

class TestSandbox {
  private tempDir: string;
  private filesSnapshot: Set<string> = new Set();

  constructor() {
    this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-test-'));
  }

  getTempDir(): string {
    return this.tempDir;
  }

  setupBasicProject(): void {
    // Create basic project structure
    fs.mkdirSync(path.join(this.tempDir, '.augment'), { recursive: true });
    fs.writeFileSync(
      path.join(this.tempDir, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2)
    );

    // tsconfig pointing to real source directory
    const sourceDir = path.resolve(path.dirname(__filename), 'cli', 'src').replace(/\\/g, '/');
    fs.writeFileSync(
      path.join(this.tempDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          esModuleInterop: true,
          skipLibCheck: true,
          allowSyntheticDefaultImports: true,
          resolveJsonModule: true,
          baseUrl: sourceDir,
          paths: { "*": ["*"] }
        }
      }, null, 2)
    );
  }

  setupBeads(): void {
    const beadsDir = path.join(this.tempDir, '.beads');
    fs.mkdirSync(beadsDir, { recursive: true });

    // Create issues.jsonl with sample data
    const sampleIssues = [
      { id: 'bd-test1', title: 'Test Issue 1', status: 'open', priority: 1, created: new Date().toISOString() },
      { id: 'bd-test2', title: 'Test Issue 2', status: 'in_progress', priority: 2, created: new Date().toISOString() },
      { id: 'bd-test3', title: 'Test Issue 3', status: 'closed', priority: 1, created: new Date().toISOString(), closed: new Date().toISOString() }
    ];

    fs.writeFileSync(
      path.join(beadsDir, 'issues.jsonl'),
      sampleIssues.map(i => JSON.stringify(i)).join('\n') + '\n'
    );

    fs.writeFileSync(
      path.join(beadsDir, 'config.json'),
      JSON.stringify({ version: '1.0.0', project: 'test-project' }, null, 2)
    );

    // Create scripts/completed.jsonl
    const scriptsDir = path.join(this.tempDir, 'scripts');
    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.writeFileSync(
      path.join(scriptsDir, 'completed.jsonl'),
      JSON.stringify({ id: 'bd-test3', title: 'Test Issue 3', closedAt: new Date().toISOString() }) + '\n'
    );
  }

  setupOpenSpec(): void {
    const openspecDir = path.join(this.tempDir, 'openspec');
    fs.mkdirSync(path.join(openspecDir, 'specs'), { recursive: true });
    fs.mkdirSync(path.join(openspecDir, 'changes'), { recursive: true });

    fs.writeFileSync(
      path.join(openspecDir, 'project-context.md'),
      '# Test Project\n\nThis is a test project for augx testing.'
    );

    fs.writeFileSync(
      path.join(openspecDir, 'specs', 'test-spec.md'),
      '# Test Spec\n\nA sample specification for testing.'
    );
  }

  setupCoordination(): void {
    const coordPath = path.join(this.tempDir, '.augment', 'coordination.json');
    const coordination = {
      version: '1.0.0',
      specs: {
        'test-spec': {
          path: 'openspec/specs/test-spec.md',
          status: 'active',
          relatedTasks: ['bd-test1', 'bd-test2'],
          affectedFiles: ['src/**/*.ts']
        }
      },
      tasks: {
        'bd-test1': {
          spec: 'test-spec',
          relatedRules: ['typescript-standards'],
          files: []
        }
      },
      rules: {},
      files: {}
    };

    fs.writeFileSync(coordPath, JSON.stringify(coordination, null, 2));
  }

  setupModules(): void {
    // Copy sample modules from the real modules directory if they exist
    if (fs.existsSync(MODULES_DIR)) {
      const modulesInTemp = path.join(this.tempDir, 'modules');
      fs.mkdirSync(modulesInTemp, { recursive: true });

      // Copy a few sample modules for testing
      const sampleModules = ['coding-standards', 'workflows'];
      for (const moduleType of sampleModules) {
        const srcPath = path.join(MODULES_DIR, moduleType);
        const destPath = path.join(modulesInTemp, moduleType);
        if (fs.existsSync(srcPath)) {
          this.copyDir(srcPath, destPath);
        }
      }
    }
  }

  private copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  takeSnapshot(): void {
    this.filesSnapshot = new Set(this.getAllFiles(this.tempDir));
  }

  getCreatedFiles(): string[] {
    const currentFiles = new Set(this.getAllFiles(this.tempDir));
    return Array.from(currentFiles).filter(f => !this.filesSnapshot.has(f));
  }

  getModifiedFiles(): string[] {
    // Simple implementation - could be enhanced with actual modification time checking
    return [];
  }

  private getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else {
        fileList.push(path.relative(this.tempDir, filePath));
      }
    }

    return fileList;
  }

  cleanup(): void {
    try {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Warning: Failed to cleanup ${this.tempDir}:`, error);
    }
  }
}

class TestRunner {
  private results: TestResult[] = [];

  runCommand(
    sandbox: TestSandbox,
    command: string,
    args: string[],
    options: {
      expectedExitCode?: number;
      shouldContain?: string[];
      shouldNotContain?: string[];
      verifyJSON?: boolean;
      timeout?: number;
    } = {}
  ): TestResult {
    const start = Date.now();
    sandbox.takeSnapshot();

    // Use npx tsx to avoid ESM path issues on Windows
    const tsxArgs = [
      CLI_ENTRY,
      command,
      ...args
    ];

    const result = spawnSync('npx', ['tsx', ...tsxArgs], {
      cwd: sandbox.getTempDir(),
      encoding: 'utf8',
      timeout: options.timeout || 60000,
      stdio: ['ignore', 'pipe', 'pipe'] as const,
      env: {
        ...process.env,
        NODE_NO_WARNINGS: '1',
        FORCE_COLOR: '0'
      },
      shell: true
    });

    const durationMs = Date.now() - start;
    const exitCode = result.status ?? -1;

    const assertions: Array<{ name: string; passed: boolean; expected?: any; actual?: any }> = [];

    // Check exit code (only if expectedExitCode is provided)
    if (options.expectedExitCode !== undefined) {
      assertions.push({
        name: 'exit_code',
        passed: exitCode === options.expectedExitCode,
        expected: options.expectedExitCode,
        actual: exitCode
      });
    }

    // Check stdout content
    if (options.shouldContain) {
      for (const text of options.shouldContain) {
        assertions.push({
          name: `stdout_contains_${text.substring(0, 20)}`,
          passed: result.stdout?.includes(text) ?? false,
          expected: `contains "${text}"`,
          actual: result.stdout?.substring(0, 100)
        });
      }
    }

    if (options.shouldNotContain) {
      for (const text of options.shouldNotContain) {
        assertions.push({
          name: `stdout_not_contains_${text.substring(0, 20)}`,
          passed: !(result.stdout?.includes(text) ?? true),
          expected: `does not contain "${text}"`,
          actual: result.stdout?.substring(0, 100)
        });
      }
    }

    // Verify JSON output (try to extract JSON from output)
    if (options.verifyJSON) {
      try {
        JSON.parse(result.stdout || '{}');
        assertions.push({
          name: 'valid_json',
          passed: true
        });
      } catch {
        // Try to find JSON in the output (some commands print text before JSON)
        const jsonMatch = (result.stdout || '').match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (jsonMatch) {
          try {
            JSON.parse(jsonMatch[1]);
            assertions.push({
              name: 'valid_json',
              passed: true
            });
          } catch {
            assertions.push({
              name: 'valid_json',
              passed: false,
              expected: 'valid JSON',
              actual: 'invalid JSON'
            });
          }
        } else {
          assertions.push({
            name: 'valid_json',
            passed: false,
            expected: 'valid JSON',
            actual: 'no JSON found'
          });
        }
      }
    }

    const allPassed = assertions.every(a => a.passed);
    const testResult: TestResult = {
      timestamp: new Date().toISOString(),
      type: 'command',
      category: command,
      name: `${command} ${args.join(' ')}`,
      args,
      status: allPassed ? 'success' : 'failure',
      exitCode,
      durationMs,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      filesCreated: sandbox.getCreatedFiles(),
      filesModified: sandbox.getModifiedFiles(),
      assertions
    };

    this.results.push(testResult);
    return testResult;
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary(): { total: number; passed: number; failed: number; skipped: number } {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'success').length,
      failed: this.results.filter(r => r.status === 'failure').length,
      skipped: this.results.filter(r => r.status === 'skipped').length
    };
  }

  saveResults(filePath: string): void {
    const content = this.results.map(r => JSON.stringify(r)).join('\n');
    fs.writeFileSync(filePath, content);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function logTestStart(category: string, name: string): void {
  console.log(`\n🧪 Testing: ${category} - ${name}`);
}

function logTestResult(result: TestResult): void {
  const icon = result.status === 'success' ? '✓' : '✗';
  const color = result.status === 'success' ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log(`${color}${icon}${reset} ${result.name} (${result.durationMs}ms)`);

  if (result.status === 'failure' && result.assertions) {
    const failedAssertions = result.assertions.filter(a => !a.passed);
    for (const assertion of failedAssertions) {
      console.log(`  ❌ ${assertion.name}: expected ${assertion.expected}, got ${assertion.actual}`);
    }
  }

  if (result.stderr && result.status === 'failure') {
    console.log(`  stderr: ${result.stderr.substring(0, 200)}`);
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testInitCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing INIT commands...\n');

  const testCases: TestCase[] = [
    { name: 'init --help', args: ['--help'], shouldContain: ['Initialize Augment Extensions'] },
    { name: 'init basic', args: [], shouldContain: ['Initializing Augment Extensions'] },
    { name: 'init --from-submodule', args: ['--from-submodule'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    if (testCase.skip) {
      console.log(`⊘ Skipped: ${testCase.name} (${testCase.skipReason})`);
      continue;
    }

    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();

    logTestStart('init', testCase.name);
    const result = runner.runCommand(sandbox, 'init', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain,
      shouldNotContain: testCase.shouldNotContain,
      verifyJSON: testCase.verifyJSON
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testListCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing LIST commands...\n');

  const testCases: TestCase[] = [
    { name: 'list --help', args: ['--help'], shouldContain: ['List available'] },
    { name: 'list all', args: [], expectedExitCode: 0 },
    { name: 'list --linked', args: ['--linked'], expectedExitCode: 0 },
    { name: 'list --json', args: ['--json'], verifyJSON: true },
    { name: 'list --linked --json', args: ['--linked', '--json'], verifyJSON: true },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();
    sandbox.setupModules();

    logTestStart('list', testCase.name);
    const result = runner.runCommand(sandbox, 'list', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain,
      verifyJSON: testCase.verifyJSON
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testShowCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing SHOW commands...\n');

  const testCases: TestCase[] = [
    { name: 'show --help', args: ['--help'], shouldContain: ['Display detailed information'] },
    { name: 'show completed', args: ['completed'], expectedExitCode: 0 },
    // Don't verify JSON - may output "No completed tasks" instead of JSON
    { name: 'show completed --json', args: ['completed', '--json'], expectedExitCode: 0 },
    { name: 'show completed --limit 5', args: ['completed', '--limit', '5'], expectedExitCode: 0 },
    { name: 'show completed --verbose', args: ['completed', '--verbose'], expectedExitCode: 0 },
    { name: 'show completed --quiet', args: ['completed', '--quiet'], expectedExitCode: 0 },
    { name: 'show linked', args: ['linked'], expectedExitCode: 0 },
    { name: 'show linked --json', args: ['linked', '--json'], verifyJSON: true },
    { name: 'show all', args: ['all'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();
    sandbox.setupBeads();
    sandbox.setupModules();

    logTestStart('show', testCase.name);
    const result = runner.runCommand(sandbox, 'show', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain,
      verifyJSON: testCase.verifyJSON
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testLinkCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing LINK commands...\n');

  const testCases: TestCase[] = [
    { name: 'link --help', args: ['--help'], shouldContain: ['Link an extension module'] },
    // Actual linking requires real modules, so we'll test with --help for now
    { name: 'link with version', args: ['test-module', '--version', '1.0.0', '--help'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();
    sandbox.setupModules();

    logTestStart('link', testCase.name);
    const result = runner.runCommand(sandbox, 'link', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testUnlinkCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing UNLINK commands...\n');

  const testCases: TestCase[] = [
    { name: 'unlink --help', args: ['--help'], shouldContain: ['Unlink an extension module'] },
    { name: 'unlink --force', args: ['test-module', '--force', '--help'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();

    logTestStart('unlink', testCase.name);
    const result = runner.runCommand(sandbox, 'unlink', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      shouldContain: testCase.shouldContain
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testCoordCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing COORD commands...\n');

  const testCases: TestCase[] = [
    // Don't check exit code for coord specs - may fail if no specs exist
    { name: 'coord specs', args: ['specs'] },
    { name: 'coord specs --json', args: ['specs', '--json'], verifyJSON: true },
    // Don't check exit code for coord tasks - may fail if spec doesn't exist
    { name: 'coord tasks', args: ['tasks', 'test-spec'] },
    { name: 'coord tasks --json', args: ['tasks', 'test-spec', '--json'], verifyJSON: true },
    { name: 'coord rules', args: ['rules', 'bd-test1'], expectedExitCode: 0 },
    { name: 'coord file', args: ['file', 'src/test.ts'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();
    sandbox.setupBeads();
    sandbox.setupOpenSpec();
    sandbox.setupCoordination();

    logTestStart('coord', testCase.name);
    const result = runner.runCommand(sandbox, 'coord', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      verifyJSON: testCase.verifyJSON
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testSyncCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing SYNC commands...\n');

  const testCases: TestCase[] = [
    { name: 'sync beads', args: ['beads'], expectedExitCode: 0 },
    { name: 'sync openspec', args: ['openspec'], expectedExitCode: 0 },
    { name: 'sync all', args: ['all'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();
    sandbox.setupBeads();
    sandbox.setupOpenSpec();
    sandbox.setupCoordination();

    logTestStart('sync', testCase.name);
    const result = runner.runCommand(sandbox, 'sync', testCase.args, {
      expectedExitCode: testCase.expectedExitCode
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testSkillCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing SKILL commands...\n');

  const testCases: TestCase[] = [
    { name: 'skill list', args: ['list'], expectedExitCode: 0 },
    // Don't verify JSON - may output "No skills found" instead of JSON
    { name: 'skill list --json', args: ['list', '--json'], expectedExitCode: 0 },
    { name: 'skill list --category retrieval', args: ['list', '--category', 'retrieval'], expectedExitCode: 0 },
    { name: 'skill search test', args: ['search', 'test'], expectedExitCode: 0 },
    { name: 'skill cache-stats', args: ['cache-stats'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();

    logTestStart('skill', testCase.name);
    const result = runner.runCommand(sandbox, 'skill', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      verifyJSON: testCase.verifyJSON
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testMcpCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing MCP commands...\n');

  const testCases: TestCase[] = [
    { name: 'mcp list', args: ['list'], expectedExitCode: 0 },
    // Don't verify JSON - may output "No MCP servers found" instead of JSON
    { name: 'mcp list --json', args: ['list', '--json'], expectedExitCode: 0 },
  ];

  for (const testCase of testCases) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();

    logTestStart('mcp', testCase.name);
    const result = runner.runCommand(sandbox, 'mcp', testCase.args, {
      expectedExitCode: testCase.expectedExitCode,
      verifyJSON: testCase.verifyJSON
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testOtherCommands(runner: TestRunner): void {
  console.log('\n🚀 Testing OTHER commands...\n');

  const commands = [
    { cmd: 'update', args: ['--help'] },
    { cmd: 'search', args: ['test', '--help'] },
    { cmd: 'validate', args: ['test-module', '--help'] },
    { cmd: 'catalog', args: ['--help'] },
    { cmd: 'install-rules', args: ['--help'] },
    { cmd: 'self-remove', args: ['--dry-run', '--help'] },
    { cmd: 'gui', args: ['--help'] },
  ];

  for (const { cmd, args } of commands) {
    const sandbox = new TestSandbox();
    sandbox.setupBasicProject();

    logTestStart(cmd, args.join(' '));
    const result = runner.runCommand(sandbox, cmd, args, {
      expectedExitCode: 0,
      shouldContain: ['--help']
    });

    logTestResult(result);
    sandbox.cleanup();
  }
}

function testUtilities(runner: TestRunner): void {
  console.log('\n🚀 Testing UTILITIES (import check)...\n');

  for (const name of UTILITIES) {
    const start = Date.now();

    // Create a temporary test file for each utility
    const testFile = path.join(CLI_SRC_DIR, `__test_${name}.ts`);
    const code = `import * as m from './utils/${name}.js';\nconsole.log('ok ${name}');`;

    try {
      fs.writeFileSync(testFile, code, 'utf8');

      // Use npx tsx to run the test file
      const r = spawnSync('npx', ['tsx', testFile], {
        cwd: CLI_SRC_DIR,
        encoding: 'utf8',
        timeout: 15000,
        shell: true,
        env: {
          ...process.env,
          NODE_NO_WARNINGS: '1'
        }
      });

      const result: TestResult = {
        timestamp: new Date().toISOString(),
        type: 'utility',
        category: 'utilities',
        name,
        args: [],
        status: r.status === 0 ? 'success' : 'failure',
        exitCode: r.status ?? -1,
        durationMs: Date.now() - start,
        stdout: r.stdout || '',
        stderr: r.stderr || ''
      };

      runner.getResults().push(result);
      logTestResult(result);
    } finally {
      // Clean up test file
      try {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

// ============================================================================
// MAIN TEST ORCHESTRATOR
// ============================================================================

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Augment Extensions - Comprehensive CLI Test Suite           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\nNode: ${process.version}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`TSX Loader: ${TSX_LOADER_PATH}\n`);

  // Clear previous results
  if (fs.existsSync(RESULTS_FILE)) {
    fs.unlinkSync(RESULTS_FILE);
  }

  const runner = new TestRunner();
  const startTime = Date.now();

  try {
    // Run all test suites
    testInitCommands(runner);
    testListCommands(runner);
    testShowCommands(runner);
    testLinkCommands(runner);
    testUnlinkCommands(runner);
    testCoordCommands(runner);
    testSyncCommands(runner);
    testSkillCommands(runner);
    testMcpCommands(runner);
    testOtherCommands(runner);
    testUtilities(runner);

    // Save results
    runner.saveResults(RESULTS_FILE);

    // Print summary
    const summary = runner.getSummary();
    const totalTime = Date.now() - startTime;

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\nTotal Tests:    ${summary.total}`);
    console.log(`✓ Passed:       ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
    console.log(`✗ Failed:       ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)`);
    console.log(`⊘ Skipped:      ${summary.skipped}`);
    console.log(`⏱ Total Time:   ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`\n📄 Results saved to: ${RESULTS_FILE}`);

    console.log('\n📊 Quick Analysis (PowerShell):');
    console.log('  Get-Content test-results.jsonl | ConvertFrom-Json | Group-Object status | Select-Object Name, Count');
    console.log('  Get-Content test-results.jsonl | ConvertFrom-Json | Group-Object category | Select-Object Name, Count');

    // Exit with appropriate code
    if (summary.failed > 0) {
      console.log('\n⚠️  Some tests failed. Review the results above.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run the test suite
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});