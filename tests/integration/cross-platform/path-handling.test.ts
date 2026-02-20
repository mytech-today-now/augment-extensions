import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, normalize, resolve, sep, isAbsolute, relative } from 'path';
import { platform } from 'os';
import { createTestEnvironment, type TestEnvironment } from '../../helpers/test-env';
import { mkdir, writeFile } from 'fs/promises';

/**
 * Cross-Platform Path Handling Tests
 * 
 * Tests path operations across Windows, Linux, and macOS:
 * - Path normalization
 * - Path separators
 * - Case sensitivity
 * - Absolute vs relative paths
 * - Path joining and resolution
 */
describe('Cross-Platform Path Handling', () => {
  let env: TestEnvironment;

  beforeEach(async () => {
    env = await createTestEnvironment();
  });

  afterEach(async () => {
    await env.cleanup();
  });

  describe('Path Normalization', () => {
    it('should normalize paths with mixed separators', () => {
      const mixedPath = 'foo/bar\\baz/qux';
      const normalized = normalize(mixedPath);
      
      // Should use platform-specific separator
      expect(normalized).toBe(join('foo', 'bar', 'baz', 'qux'));
      expect(normalized.includes('/')).toBe(sep === '/');
      expect(normalized.includes('\\')).toBe(sep === '\\');
    });

    it('should normalize paths with redundant separators', () => {
      const redundantPath = 'foo//bar///baz';
      const normalized = normalize(redundantPath);
      
      expect(normalized).toBe(join('foo', 'bar', 'baz'));
    });

    it('should normalize paths with dot segments', () => {
      const dotPath = 'foo/./bar/../baz';
      const normalized = normalize(dotPath);
      
      expect(normalized).toBe(join('foo', 'baz'));
    });

    it('should handle empty path normalization', () => {
      const normalized = normalize('');
      expect(normalized).toBe('.');
    });

    it('should preserve absolute paths during normalization', async () => {
      const absolutePath = resolve(env.tempDir, 'foo', 'bar');
      const normalized = normalize(absolutePath);
      
      expect(isAbsolute(normalized)).toBe(true);
      expect(normalized).toBe(absolutePath);
    });
  });

  describe('Path Separators', () => {
    it('should use correct platform separator', () => {
      const currentPlatform = platform();
      
      if (currentPlatform === 'win32') {
        expect(sep).toBe('\\');
      } else {
        expect(sep).toBe('/');
      }
    });

    it('should join paths with platform separator', () => {
      const joined = join('foo', 'bar', 'baz');
      
      expect(joined.split(sep)).toEqual(['foo', 'bar', 'baz']);
    });

    it('should handle trailing separators correctly', () => {
      const withTrailing = join('foo', 'bar') + sep;
      const withoutTrailing = join('foo', 'bar');

      // On Windows, normalize preserves trailing separator for non-root paths
      // On Unix, normalize removes trailing separator
      const normalized = normalize(withTrailing);
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        // Windows preserves trailing backslash
        expect(normalized).toBe(withTrailing);
      } else {
        // Unix removes trailing slash
        expect(normalized).toBe(withoutTrailing);
      }
    });

    it('should convert between separator styles', () => {
      const unixStyle = 'foo/bar/baz';
      const windowsStyle = 'foo\\bar\\baz';
      
      // Both should normalize to same result
      expect(normalize(unixStyle)).toBe(normalize(windowsStyle));
    });
  });

  describe('Case Sensitivity', () => {
    it('should handle case sensitivity based on platform', async () => {
      const lowerPath = join(env.tempDir, 'testfile.txt');
      const upperPath = join(env.tempDir, 'TESTFILE.TXT');
      
      await writeFile(lowerPath, 'test content');
      
      // On Windows and macOS, paths are case-insensitive
      // On Linux, paths are case-sensitive
      const currentPlatform = platform();
      const isCaseSensitive = currentPlatform === 'linux';
      
      if (isCaseSensitive) {
        expect(lowerPath).not.toBe(upperPath);
      } else {
        // Paths should be treated as equivalent on case-insensitive systems
        expect(lowerPath.toLowerCase()).toBe(upperPath.toLowerCase());
      }
    });

    it('should normalize case in path components', () => {
      const path1 = join('Foo', 'Bar', 'Baz');
      const path2 = join('foo', 'bar', 'baz');
      
      // Paths preserve case but may be equivalent on case-insensitive systems
      expect(path1).not.toBe(path2); // Exact string comparison
      
      const currentPlatform = platform();
      if (currentPlatform !== 'linux') {
        expect(path1.toLowerCase()).toBe(path2.toLowerCase());
      }
    });
  });

  describe('Absolute vs Relative Paths', () => {
    it('should correctly identify absolute paths', () => {
      const absolutePath = resolve(env.tempDir);
      const relativePath = join('foo', 'bar');
      
      expect(isAbsolute(absolutePath)).toBe(true);
      expect(isAbsolute(relativePath)).toBe(false);
    });

    it('should resolve relative paths to absolute', () => {
      const relativePath = join('foo', 'bar');
      const absolutePath = resolve(env.tempDir, relativePath);

      expect(isAbsolute(absolutePath)).toBe(true);
      expect(absolutePath).toContain(env.tempDir);
    });

    it('should handle platform-specific absolute path formats', () => {
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        // Windows: C:\path\to\file
        const winPath = 'C:\\Users\\test\\file.txt';
        expect(isAbsolute(winPath)).toBe(true);

        // UNC paths: \\server\share\file
        const uncPath = '\\\\server\\share\\file.txt';
        expect(isAbsolute(uncPath)).toBe(true);
      } else {
        // Unix: /path/to/file
        const unixPath = '/home/test/file.txt';
        expect(isAbsolute(unixPath)).toBe(true);
      }
    });

    it('should compute relative paths correctly', () => {
      const from = join(env.tempDir, 'foo', 'bar');
      const to = join(env.tempDir, 'foo', 'baz', 'qux');

      const relativePath = relative(from, to);

      // Should go up one level and down to baz/qux
      expect(relativePath).toBe(join('..', 'baz', 'qux'));
    });
  });

  describe('Path Joining and Resolution', () => {
    it('should join multiple path segments', () => {
      const joined = join('foo', 'bar', 'baz', 'qux.txt');

      expect(joined).toBe(['foo', 'bar', 'baz', 'qux.txt'].join(sep));
    });

    it('should handle empty segments in join', () => {
      const joined = join('foo', '', 'bar', '', 'baz');

      expect(joined).toBe(join('foo', 'bar', 'baz'));
    });

    it('should resolve complex path sequences', () => {
      const resolved = resolve(env.tempDir, 'foo', '..', 'bar', '.', 'baz');

      expect(resolved).toBe(join(env.tempDir, 'bar', 'baz'));
    });

    it('should handle absolute path in join sequence', () => {
      const absolutePath = resolve(env.tempDir);

      // join() concatenates all segments, even if one is absolute
      const joined = join('foo', 'bar', absolutePath, 'baz');
      expect(joined).toContain('foo');
      expect(joined).toContain('bar');
      expect(joined).toContain('baz');

      // resolve() discards previous segments when absolute path is encountered
      const resolved = resolve('foo', 'bar', absolutePath, 'baz');
      expect(resolved).toBe(join(absolutePath, 'baz'));
      expect(resolved).not.toContain('foo');
    });
  });

  describe('Edge Cases', () => {
    it('should handle root directory', () => {
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        const root = 'C:\\';
        expect(isAbsolute(root)).toBe(true);
        expect(normalize(root)).toBe(root);
      } else {
        const root = '/';
        expect(isAbsolute(root)).toBe(true);
        expect(normalize(root)).toBe(root);
      }
    });

    it('should handle very long paths', async () => {
      // Create a deeply nested path
      const segments = Array.from({ length: 50 }, (_, i) => `level${i}`);
      const deepPath = join(env.tempDir, ...segments);

      // Should be able to create and normalize
      await mkdir(deepPath, { recursive: true });
      const normalized = normalize(deepPath);

      expect(isAbsolute(normalized)).toBe(true);
      expect(normalized).toContain('level0');
      expect(normalized).toContain('level49');
    });

    it('should handle special characters in paths', async () => {
      const specialChars = 'test-file_with.special@chars';
      const pathWithSpecial = join(env.tempDir, specialChars);

      await writeFile(pathWithSpecial, 'test');
      const normalized = normalize(pathWithSpecial);

      expect(normalized).toContain(specialChars);
    });

    it('should handle unicode characters in paths', async () => {
      const unicodeName = 'test-文件-файл-αρχείο.txt';
      const unicodePath = join(env.tempDir, unicodeName);

      await writeFile(unicodePath, 'unicode test');
      const normalized = normalize(unicodePath);

      expect(normalized).toContain(unicodeName);
    });

    it('should handle paths with spaces', async () => {
      const pathWithSpaces = join(env.tempDir, 'folder with spaces', 'file with spaces.txt');

      await mkdir(join(env.tempDir, 'folder with spaces'), { recursive: true });
      await writeFile(pathWithSpaces, 'test');

      const normalized = normalize(pathWithSpaces);
      expect(normalized).toContain('folder with spaces');
      expect(normalized).toContain('file with spaces.txt');
    });
  });

  describe('Module System Path Operations', () => {
    it('should create module paths correctly', async () => {
      const project = await env.createProject({ name: 'test-project' });
      const modulePath = join(project.augmentDir, 'modules', 'test-module');

      expect(isAbsolute(modulePath)).toBe(true);
      expect(modulePath).toContain('.augment');
      expect(modulePath).toContain('modules');
    });

    it('should handle collection paths', async () => {
      const project = await env.createProject();
      const collectionPath = join(project.augmentDir, 'collections', 'my-collection.json');

      const normalized = normalize(collectionPath);
      expect(normalized).toContain('collections');
      expect(normalized.endsWith('.json')).toBe(true);
    });

    it('should resolve relative module references', async () => {
      const project = await env.createProject();
      const moduleRef = 'coding-standards/typescript';
      const fullPath = resolve(project.augmentDir, 'modules', moduleRef);

      expect(isAbsolute(fullPath)).toBe(true);
      expect(fullPath).toContain('coding-standards');
      expect(fullPath).toContain('typescript');
    });
  });
});


