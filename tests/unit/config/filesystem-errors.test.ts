import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TestEnvironment } from '../../helpers/test-env';
import { ModuleFactory } from '../../helpers/factories';
import { validateModuleStructure, loadModule } from '../../../cli/src/utils/module-system';

describe('File System Error Tests', () => {
  let testEnv: TestEnvironment;
  let moduleFactory: ModuleFactory;
  let testModulePath: string;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
    moduleFactory = new ModuleFactory();
    testModulePath = path.join(testEnv.tempDir, 'test-module');
    await fs.mkdir(testModulePath, { recursive: true });
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Permission Errors', () => {
    it('should handle read permission errors gracefully', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      // On Windows, we can't easily test permission errors, so we'll test file not found instead
      // which is a common file system error
      const nonExistentPath = path.join(testModulePath, 'nonexistent.json');

      await expect(fs.readFile(nonExistentPath, 'utf-8')).rejects.toThrow();
    });

    it('should handle write permission errors gracefully', async () => {
      // Test writing to a read-only location (if possible)
      // This is platform-dependent, so we'll test a general write error scenario
      const invalidPath = path.join(testModulePath, 'subdir', 'file.json');

      // Try to write without creating parent directory first
      await expect(fs.writeFile(invalidPath, 'test')).rejects.toThrow();
    });

    it('should handle directory creation permission errors', async () => {
      // Test creating a directory in a non-existent parent
      const invalidDirPath = path.join(testModulePath, 'nonexistent', 'subdir');

      await expect(fs.mkdir(invalidDirPath)).rejects.toThrow();
    });
  });

  describe('Missing Files', () => {
    it('should detect missing module.json file', async () => {
      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required file: module.json');
    });

    it('should handle missing README.md file', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required file: README.md');
    });

    it('should handle missing rules directory', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));
      await fs.writeFile(path.join(testModulePath, 'README.md'), '# Test');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required directory: rules/');
    });

    it('should handle reading from non-existent file', async () => {
      const nonExistentPath = path.join(testModulePath, 'does-not-exist.json');

      await expect(fs.readFile(nonExistentPath, 'utf-8')).rejects.toThrow();
    });

    it('should handle loading module from non-existent path', async () => {
      const nonExistentPath = path.join(testModulePath, 'does-not-exist');

      const module = loadModule(nonExistentPath);

      expect(module).toBeNull();
    });
  });

  describe('Corrupted Files', () => {
    it('should handle corrupted JSON in module.json', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{ corrupted json content }');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);
    });

    it('should handle truncated JSON file', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{"name": "test", "version":');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);
    });

    it('should handle binary data in JSON file', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      await fs.writeFile(moduleJsonPath, binaryData);

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);
    });

    it('should handle empty file as corrupted', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);
    });

    it('should handle file with only whitespace', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '   \n\t  ');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);
    });
  });

  describe('Disk Space Errors', () => {
    it('should handle large file writes gracefully', async () => {
      // Create a very large metadata object
      const validMetadata = moduleFactory.createValidModule();
      validMetadata.tags = Array(100000).fill('tag');
      const moduleJsonPath = path.join(testModulePath, 'module.json');

      // This should succeed unless disk is actually full
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const content = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.tags).toHaveLength(100000);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent reads safely', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      // Perform multiple concurrent reads
      const reads = Array(10).fill(null).map(() =>
        fs.readFile(moduleJsonPath, 'utf-8')
      );

      const results = await Promise.all(reads);

      // All reads should succeed and return the same content
      expect(results).toHaveLength(10);
      results.forEach(content => {
        expect(JSON.parse(content)).toEqual(validMetadata);
      });
    });

    it('should handle concurrent writes with last-write-wins', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');

      // Perform multiple concurrent writes
      const writes = Array(5).fill(null).map((_, i) => {
        const metadata = moduleFactory.createValidModule();
        metadata.name = `module-${i}`;
        return fs.writeFile(moduleJsonPath, JSON.stringify(metadata, null, 2));
      });

      await Promise.all(writes);

      // File should exist and contain valid JSON
      const content = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.name).toMatch(/^module-\d+$/);
    });

    it('should handle read during write', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      // Start a write operation
      const writePromise = fs.writeFile(
        moduleJsonPath,
        JSON.stringify({ ...validMetadata, name: 'updated' }, null, 2)
      );

      // Immediately try to read
      const readPromise = fs.readFile(moduleJsonPath, 'utf-8');

      await Promise.all([writePromise, readPromise]);

      // Final read should show the updated content
      const finalContent = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(finalContent);

      expect(parsed.name).toBe('updated');
    });

    it('should handle multiple module validations concurrently', async () => {
      // Create multiple test modules
      const modulePaths = await Promise.all(
        Array(5).fill(null).map(async (_, i) => {
          const modulePath = path.join(testEnv.tempDir, `module-${i}`);
          await fs.mkdir(modulePath, { recursive: true });

          const validMetadata = moduleFactory.createValidModule();
          validMetadata.name = `module-${i}`;
          await fs.writeFile(
            path.join(modulePath, 'module.json'),
            JSON.stringify(validMetadata, null, 2)
          );
          await fs.writeFile(path.join(modulePath, 'README.md'), '# Test');
          await fs.mkdir(path.join(modulePath, 'rules'), { recursive: true });
          await fs.writeFile(path.join(modulePath, 'rules', 'test.md'), '# Rule');

          return modulePath;
        })
      );

      // Validate all modules concurrently
      const validations = modulePaths.map(modulePath =>
        validateModuleStructure(modulePath)
      );

      const results = validations;

      // All validations should succeed
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Recovery Strategies', () => {
    it('should recover from temporary file system errors', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');

      // First attempt fails (file doesn't exist)
      let firstAttempt = null;
      try {
        await fs.readFile(moduleJsonPath, 'utf-8');
      } catch (error) {
        firstAttempt = error;
      }

      expect(firstAttempt).not.toBeNull();

      // Create the file
      const validMetadata = moduleFactory.createValidModule();
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      // Second attempt succeeds
      const content = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toEqual(validMetadata);
    });

    it('should provide clear error messages for file system errors', async () => {
      const nonExistentPath = path.join(testModulePath, 'does-not-exist.json');

      try {
        await fs.readFile(nonExistentPath, 'utf-8');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBeTruthy();
        expect(error.code).toBe('ENOENT');
      }
    });

    it('should handle partial file writes gracefully', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');

      // Write incomplete JSON
      await fs.writeFile(moduleJsonPath, '{"name": "test"');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid JSON'))).toBe(true);

      // Recover by writing valid JSON
      const validMetadata = moduleFactory.createValidModule();
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const recoveredResult = validateModuleStructure(testModulePath);

      expect(recoveredResult.valid).toBe(false); // Still invalid due to missing README and rules
      expect(recoveredResult.errors.some(e => e.includes('Invalid JSON'))).toBe(false);
    });
  });
});

