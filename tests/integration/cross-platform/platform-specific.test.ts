import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { platform, type, arch, homedir, tmpdir } from 'os';
import { join } from 'path';
import { createTestEnvironment, type TestEnvironment } from '../../helpers/test-env';
import { chmod, access, constants, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

/**
 * Platform-Specific Tests
 * 
 * Tests platform-specific behavior across Windows, Linux, and macOS:
 * - Shell command execution
 * - File permissions
 * - Environment variables
 * - Platform detection
 * - Fallback strategies
 */
describe('Platform-Specific Behavior', () => {
  let env: TestEnvironment;

  beforeEach(async () => {
    env = await createTestEnvironment();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  describe('Platform Detection', () => {
    it('should detect current platform', () => {
      const currentPlatform = platform();
      
      expect(['win32', 'linux', 'darwin', 'freebsd', 'openbsd', 'sunos', 'aix']).toContain(currentPlatform);
    });

    it('should detect OS type', () => {
      const osType = type();
      
      expect(['Windows_NT', 'Linux', 'Darwin']).toContain(osType);
    });

    it('should detect architecture', () => {
      const architecture = arch();
      
      expect(['x64', 'arm64', 'ia32', 'arm', 'ppc64', 's390x']).toContain(architecture);
    });

    it('should provide platform-specific home directory', () => {
      const home = homedir();
      
      expect(home).toBeTruthy();
      expect(home.length).toBeGreaterThan(0);
      
      const currentPlatform = platform();
      if (currentPlatform === 'win32') {
        expect(home).toMatch(/^[A-Z]:\\/);
      } else {
        expect(home).toMatch(/^\//);
      }
    });

    it('should provide platform-specific temp directory', () => {
      const temp = tmpdir();
      
      expect(temp).toBeTruthy();
      expect(temp.length).toBeGreaterThan(0);
    });

    it('should identify Windows platform', () => {
      const isWindows = platform() === 'win32';
      
      if (isWindows) {
        expect(type()).toBe('Windows_NT');
      }
    });

    it('should identify Unix-like platforms', () => {
      const isUnix = ['linux', 'darwin', 'freebsd', 'openbsd'].includes(platform());
      
      if (isUnix) {
        expect(['Linux', 'Darwin']).toContain(type());
      }
    });
  });

  describe('Environment Variables', () => {
    it('should access platform-specific environment variables', () => {
      const currentPlatform = platform();
      
      if (currentPlatform === 'win32') {
        // Windows-specific
        expect(process.env.USERPROFILE).toBeTruthy();
        expect(process.env.APPDATA).toBeTruthy();
        expect(process.env.LOCALAPPDATA).toBeTruthy();
      } else {
        // Unix-like
        expect(process.env.HOME).toBeTruthy();
        expect(process.env.USER).toBeTruthy();
      }
    });

    it('should handle PATH environment variable', () => {
      const pathVar = process.env.PATH || process.env.Path;
      
      expect(pathVar).toBeTruthy();
      
      const currentPlatform = platform();
      const separator = currentPlatform === 'win32' ? ';' : ':';
      
      expect(pathVar).toContain(separator);
    });

    it('should set and retrieve custom environment variables', () => {
      const testKey = 'AUGMENT_TEST_VAR';
      const testValue = 'test-value-123';
      
      process.env[testKey] = testValue;
      expect(process.env[testKey]).toBe(testValue);
      
      delete process.env[testKey];
      expect(process.env[testKey]).toBeUndefined();
    });

    it('should handle environment variable case sensitivity', () => {
      const currentPlatform = platform();
      
      if (currentPlatform === 'win32') {
        // Windows is case-insensitive for env vars
        expect(process.env.PATH).toBe(process.env.Path);
      } else {
        // Unix-like systems are case-sensitive
        process.env.TEST_VAR = 'value1';
        process.env.test_var = 'value2';
        
        expect(process.env.TEST_VAR).not.toBe(process.env.test_var);
        
        delete process.env.TEST_VAR;
        delete process.env.test_var;
      }
    });
  });

  describe('File Permissions', () => {
    it('should handle file permissions on Unix-like systems', async () => {
      const currentPlatform = platform();
      
      if (currentPlatform !== 'win32') {
        const testFile = join(env.tempDir, 'test-permissions.txt');
        await writeFile(testFile, 'test content');
        
        // Make file executable
        await chmod(testFile, 0o755);
        
        // Verify file is accessible
        await access(testFile, constants.R_OK | constants.W_OK | constants.X_OK);
        
        // Make file read-only
        await chmod(testFile, 0o444);
        
        // Should be readable but not writable
        await access(testFile, constants.R_OK);
        await expect(access(testFile, constants.W_OK)).rejects.toThrow();
      }
    });

    it('should handle Windows file attributes', async () => {
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        const testFile = join(env.tempDir, 'test-windows.txt');
        await writeFile(testFile, 'test content');

        // Windows doesn't use Unix permissions
        // But we can still check read/write access
        await access(testFile, constants.R_OK | constants.W_OK);
      }
    });

    it('should detect executable files per platform', async () => {
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        // Windows: .exe, .bat, .cmd files are executable
        const exeFile = join(env.tempDir, 'test.exe');
        await writeFile(exeFile, 'fake exe');

        expect(exeFile.endsWith('.exe')).toBe(true);
      } else {
        // Unix: executable permission bit
        const scriptFile = join(env.tempDir, 'test.sh');
        await writeFile(scriptFile, '#!/bin/bash\necho test');
        await chmod(scriptFile, 0o755);

        // File should be executable
        await access(scriptFile, constants.X_OK);
      }
    });
  });

  describe('Shell Command Execution', () => {
    it('should execute platform-specific commands', () => {
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        // Windows: use cmd.exe
        const result = execSync('echo test', { encoding: 'utf-8' });
        expect(result.trim()).toBe('test');
      } else {
        // Unix: use sh/bash
        const result = execSync('echo test', { encoding: 'utf-8' });
        expect(result.trim()).toBe('test');
      }
    });

    it('should handle platform-specific directory listing', () => {
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        // Windows: dir command
        const result = execSync(`dir "${env.tempDir}"`, { encoding: 'utf-8' });
        expect(result).toBeTruthy();
      } else {
        // Unix: ls command
        const result = execSync(`ls -la "${env.tempDir}"`, { encoding: 'utf-8' });
        expect(result).toBeTruthy();
      }
    });

    it('should handle command exit codes', () => {
      const currentPlatform = platform();

      try {
        if (currentPlatform === 'win32') {
          execSync('exit 1', { stdio: 'ignore' });
        } else {
          execSync('exit 1', { stdio: 'ignore' });
        }
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.status).toBe(1);
      }
    });

    it('should handle command not found errors', () => {
      expect(() => {
        execSync('nonexistent-command-xyz', { stdio: 'ignore' });
      }).toThrow();
    });
  });

  describe('Fallback Strategies', () => {
    it('should provide fallback for missing commands', () => {
      const currentPlatform = platform();

      // Try to use a command that might not exist
      let result: string;
      try {
        result = execSync('git --version', { encoding: 'utf-8' });
      } catch {
        // Fallback: indicate git is not available
        result = 'git not available';
      }

      expect(result).toBeTruthy();
    });

    it('should handle platform-specific config directories', () => {
      const currentPlatform = platform();
      let configDir: string;

      if (currentPlatform === 'win32') {
        configDir = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
      } else if (currentPlatform === 'darwin') {
        configDir = join(homedir(), 'Library', 'Application Support');
      } else {
        configDir = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
      }

      expect(configDir).toBeTruthy();
      expect(configDir.length).toBeGreaterThan(0);
    });

    it('should provide fallback for temp directory', () => {
      const temp = tmpdir() || (platform() === 'win32' ? 'C:\\Temp' : '/tmp');

      expect(temp).toBeTruthy();
    });

    it('should handle missing environment variables gracefully', () => {
      const nonExistent = process.env.NONEXISTENT_VAR_XYZ || 'default-value';

      expect(nonExistent).toBe('default-value');
    });
  });

  describe('Line Endings', () => {
    it('should handle platform-specific line endings', async () => {
      const currentPlatform = platform();
      const expectedLineEnding = currentPlatform === 'win32' ? '\r\n' : '\n';

      const testFile = join(env.tempDir, 'line-endings.txt');
      const content = `line1${expectedLineEnding}line2${expectedLineEnding}line3`;

      await writeFile(testFile, content);

      // Content should contain platform-appropriate line endings
      expect(content).toContain(expectedLineEnding);
    });

    it('should normalize line endings across platforms', () => {
      const mixedContent = 'line1\r\nline2\nline3\rline4';
      const normalized = mixedContent.replace(/\r\n|\r|\n/g, '\n');

      expect(normalized).toBe('line1\nline2\nline3\nline4');
    });
  });

  describe('Process Management', () => {
    it('should detect current process ID', () => {
      const pid = process.pid;

      expect(pid).toBeGreaterThan(0);
      expect(typeof pid).toBe('number');
    });

    it('should access process arguments', () => {
      const args = process.argv;

      expect(Array.isArray(args)).toBe(true);
      expect(args.length).toBeGreaterThan(0);
    });

    it('should handle process working directory', () => {
      const cwd = process.cwd();

      expect(cwd).toBeTruthy();
      expect(cwd.length).toBeGreaterThan(0);
    });

    it('should handle process exit codes', () => {
      const exitCode = process.exitCode || 0;

      expect(typeof exitCode).toBe('number');
    });
  });

  describe('Module System Platform Compatibility', () => {
    it('should create platform-appropriate module paths', async () => {
      const project = await env.createProject();
      const modulePath = join(project.augmentDir, 'modules', 'test-module');

      // Path should use platform separator
      const currentPlatform = platform();
      if (currentPlatform === 'win32') {
        expect(modulePath).toContain('\\');
      } else {
        expect(modulePath).toContain('/');
      }
    });

    it('should handle module installation across platforms', async () => {
      const module = await env.createModule({
        name: 'test-module',
        type: 'coding-standards'
      });

      expect(module.path).toBeTruthy();
      expect(module.metadata).toBeTruthy();
    });

    it('should support platform-specific module features', async () => {
      const currentPlatform = platform();

      // All platforms should support basic module operations
      const module = await env.createModule({
        name: 'platform-test',
        type: 'workflows'
      });

      expect(module.fullName).toContain('platform-test');
    });
  });
});

