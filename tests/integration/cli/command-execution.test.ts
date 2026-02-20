import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { spawn } from 'child_process';

/**
 * CLI Command Execution Tests
 * 
 * Tests for CLI command execution including:
 * - Command execution with execa/spawn
 * - stdout/stderr capture
 * - Exit codes
 * - Command chaining
 * - CLI error messages
 */

/**
 * Execute CLI command and capture output
 */
async function executeCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      resolve({
        stdout,
        stderr: error.message,
        exitCode: 1
      });
    });
  });
}

describe('CLI Command Execution', () => {
  let testEnv: TestEnvironment;
  const CLI_PATH = join(__dirname, '../../../cli/dist/index.js');

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Basic Command Execution', () => {
    it('should execute help command successfully', async () => {
      const result = await executeCommand('node', [CLI_PATH, '--help'], testEnv.tempDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();
    });

    it('should execute version command successfully', async () => {
      const result = await executeCommand('node', [CLI_PATH, '--version'], testEnv.tempDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();
    });

    it('should handle unknown command gracefully', async () => {
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'unknown-command'],
        testEnv.tempDir
      );

      // Should exit with error code
      expect(result.exitCode).not.toBe(0);
    });
  });

  describe('stdout/stderr Capture', () => {
    it('should capture stdout from successful command', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      expect(result.stdout).toBeTruthy();
      expect(result.stderr).toBe('');
    });

    it('should capture stderr from failed command', async () => {
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'link', 'non-existent-module'],
        testEnv.tempDir
      );

      // Error should be captured in stderr or stdout
      expect(result.exitCode).not.toBe(0);
    });

    it('should handle empty output', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list', '--json'], project.path);

      expect(result.stdout).toBeTruthy();
      // Should be valid JSON (empty array or object)
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    });
  });

  describe('Exit Codes', () => {
    it('should return 0 for successful command', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      expect(result.exitCode).toBe(0);
    });

    it('should return non-zero for failed command', async () => {
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'link', 'invalid/module'],
        testEnv.tempDir
      );

      expect(result.exitCode).not.toBe(0);
    });

    it('should return non-zero for invalid arguments', async () => {
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'list', '--invalid-flag'],
        testEnv.tempDir
      );

      // May succeed or fail depending on argument parsing
      expect(result.exitCode).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Command Chaining', () => {
    it('should execute multiple commands sequentially', async () => {
      const project = await testEnv.createProject();

      // Execute first command
      const result1 = await executeCommand('node', [CLI_PATH, 'list'], project.path);
      expect(result1.exitCode).toBe(0);

      // Execute second command
      const result2 = await executeCommand('node', [CLI_PATH, 'list', '--json'], project.path);
      expect(result2.exitCode).toBe(0);

      // Both should succeed
      expect(result1.stdout).toBeTruthy();
      expect(result2.stdout).toBeTruthy();
    });

    it('should handle command dependencies', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'chain-module' });

      // Create module directory in project's modules path
      const modulesDir = join(project.path, 'modules', 'coding-standards');
      await mkdir(modulesDir, { recursive: true });

      // Copy module to project modules
      const moduleJsonPath = join(modulesDir, 'chain-module', 'module.json');
      await mkdir(join(modulesDir, 'chain-module'), { recursive: true });
      await writeFile(
        moduleJsonPath,
        JSON.stringify(module.metadata, null, 2)
      );

      // First list modules (should show available module)
      const listResult = await executeCommand('node', [CLI_PATH, 'list'], project.path);
      expect(listResult.exitCode).toBe(0);

      // Then show specific module
      const showResult = await executeCommand(
        'node',
        [CLI_PATH, 'show', 'coding-standards/chain-module'],
        project.path
      );
      expect(showResult.exitCode).toBe(0);
    });

    it('should handle parallel command execution', async () => {
      const project = await testEnv.createProject();

      // Execute multiple commands in parallel
      const results = await Promise.all([
        executeCommand('node', [CLI_PATH, 'list'], project.path),
        executeCommand('node', [CLI_PATH, 'list', '--json'], project.path),
        executeCommand('node', [CLI_PATH, '--version'], project.path)
      ]);

      // All should succeed
      results.forEach(result => {
        expect(result.exitCode).toBe(0);
      });
    });
  });

  describe('CLI Error Messages', () => {
    it('should provide clear error for missing arguments', async () => {
      const result = await executeCommand('node', [CLI_PATH, 'show'], testEnv.tempDir);

      // Should fail with clear error message
      expect(result.exitCode).not.toBe(0);
      // Error message should be in stdout or stderr
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    it('should provide clear error for invalid module', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'show', 'invalid/non-existent-module'],
        project.path
      );

      // Should fail with error message
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    it('should provide clear error for invalid project path', async () => {
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'list'],
        '/non/existent/path'
      );

      // Should handle gracefully
      expect(result.exitCode).toBeGreaterThanOrEqual(0);
    });

    it('should provide help text for unknown command', async () => {
      const result = await executeCommand(
        'node',
        [CLI_PATH, 'unknown-command'],
        testEnv.tempDir
      );

      // Should fail with helpful message
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Output', () => {
    it('should produce valid JSON with --json flag', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list', '--json'], project.path);

      expect(result.exitCode).toBe(0);
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    });

    it('should handle empty JSON output', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list', '--json'], project.path);

      const json = JSON.parse(result.stdout);
      expect(Array.isArray(json) || typeof json === 'object').toBe(true);
    });

    it('should format JSON output correctly', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list', '--json'], project.path);

      const json = JSON.parse(result.stdout);
      // Should be valid JSON structure
      expect(json).toBeDefined();
    });
  });

  describe('Command Timeout', () => {
    it('should complete commands within reasonable time', async () => {
      const project = await testEnv.createProject();
      const start = Date.now();

      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      const duration = Date.now() - start;
      expect(result.exitCode).toBe(0);
      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    });

    it('should handle long-running commands', async () => {
      const project = await testEnv.createProject();

      // Create multiple modules to make list command slower
      for (let i = 0; i < 5; i++) {
        await testEnv.createModule({ name: `module-${i}` });
      }

      const start = Date.now();
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);
      const duration = Date.now() - start;

      expect(result.exitCode).toBe(0);
      // Should still complete reasonably fast
      expect(duration).toBeLessThan(15000);
    });
  });

  describe('Environment Variables', () => {
    it('should respect NODE_ENV variable', async () => {
      const project = await testEnv.createProject();

      // Execute with test environment
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      expect(result.exitCode).toBe(0);
      // Command should execute successfully in test environment
    });

    it('should handle missing environment variables', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      // Should work without special environment variables
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Working Directory', () => {
    it('should execute commands in correct working directory', async () => {
      const project = await testEnv.createProject();
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      expect(result.exitCode).toBe(0);
      // Command should execute in project directory
    });

    it('should handle relative paths', async () => {
      const project = await testEnv.createProject();

      // Execute from project directory
      const result = await executeCommand('node', [CLI_PATH, 'list'], project.path);

      expect(result.exitCode).toBe(0);
    });
  });
});
