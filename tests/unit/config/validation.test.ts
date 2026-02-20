import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TestEnvironment } from '../../helpers/test-env';
import { ModuleFactory } from '../../helpers/factories';
import { validateModuleMetadata, validateModuleStructure } from '../../../cli/src/utils/module-system';

describe('Configuration Validation Tests', () => {
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

  describe('module.json Schema Validation', () => {
    it('should validate correct module.json', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const result = validateModuleMetadata(validMetadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject module.json with missing required field: name', async () => {
      const invalidMetadata = moduleFactory.createValidModule();
      delete (invalidMetadata as any).name;

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: name');
    });

    it('should reject module.json with missing required field: version', async () => {
      const invalidMetadata = moduleFactory.createValidModule();
      delete (invalidMetadata as any).version;

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: version');
    });

    it('should reject module.json with missing required field: displayName', async () => {
      const invalidMetadata = moduleFactory.createValidModule();
      delete (invalidMetadata as any).displayName;

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: displayName');
    });

    it('should reject module.json with missing required field: description', async () => {
      const invalidMetadata = moduleFactory.createValidModule();
      delete (invalidMetadata as any).description;

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: description');
    });

    it('should reject module.json with missing required field: type', async () => {
      const invalidMetadata = moduleFactory.createValidModule();
      delete (invalidMetadata as any).type;

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: type');
    });

    it('should reject module.json with invalid type', async () => {
      const invalidMetadata = moduleFactory.createValidModule();
      (invalidMetadata as any).type = 'invalid-type';

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid type'))).toBe(true);
    });

    it('should accept valid module types', async () => {
      const validTypes = ['coding-standards', 'domain-rules', 'workflows', 'examples', 'marketing-standards', 'writing-standards', 'themes'];

      for (const type of validTypes) {
        const metadata = moduleFactory.createValidModule();
        (metadata as any).type = type;

        const result = validateModuleMetadata(metadata);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should validate version format', async () => {
      const metadata = moduleFactory.createValidModule();
      metadata.version = 'invalid-version';

      const result = validateModuleMetadata(metadata);

      expect(result.warnings.some(w => w.includes('version'))).toBe(true);
    });

    it('should accept valid version formats', async () => {
      const validVersions = ['1.0.0', '2.1.3', '0.0.1', '10.20.30'];

      for (const version of validVersions) {
        const metadata = moduleFactory.createValidModule();
        metadata.version = version;

        const result = validateModuleMetadata(metadata);

        expect(result.valid).toBe(true);
      }
    });

    it('should validate optional fields when present', async () => {
      const metadata = moduleFactory.createValidModule();
      metadata.tags = ['test', 'validation'];
      metadata.dependencies = ['module-a', 'module-b'];

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid tags format', async () => {
      const metadata = moduleFactory.createValidModule();
      (metadata as any).tags = 'not-an-array';

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags'))).toBe(true);
    });

    it('should reject invalid dependencies format', async () => {
      const metadata = moduleFactory.createValidModule();
      (metadata as any).dependencies = 'not-an-array';

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('dependencies'))).toBe(true);
    });
  });

  describe('Configuration Parsing', () => {
    it('should parse valid JSON configuration', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const content = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toEqual(validMetadata);
    });

    it('should handle invalid JSON gracefully', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{ invalid json }');

      await expect(async () => {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
      }).rejects.toThrow();
    });

    it('should handle empty JSON file', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '');

      await expect(async () => {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
      }).rejects.toThrow();
    });

    it('should handle JSON with trailing commas', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{"name": "test",}');

      await expect(async () => {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
      }).rejects.toThrow();
    });

    it('should handle JSON with comments', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{"name": "test" /* comment */}');

      await expect(async () => {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
      }).rejects.toThrow();
    });

    it('should parse JSON with unicode characters', async () => {
      const validMetadata = moduleFactory.createValidModule();
      validMetadata.description = 'Test with unicode: 你好 🎉';
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const content = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.description).toBe('Test with unicode: 你好 🎉');
    });

    it('should handle large JSON files', async () => {
      const validMetadata = moduleFactory.createValidModule();
      validMetadata.tags = Array(1000).fill('tag');
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const content = await fs.readFile(moduleJsonPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.tags).toHaveLength(1000);
    });
  });

  describe('Invalid JSON Handling', () => {
    it('should provide clear error for missing closing brace', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{"name": "test"');

      try {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('JSON');
      }
    });

    it('should provide clear error for missing quotes', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{name: "test"}');

      try {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('JSON');
      }
    });

    it('should provide clear error for single quotes', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, "{'name': 'test'}");

      try {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('JSON');
      }
    });

    it('should handle malformed escape sequences', async () => {
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, '{"name": "test\\x"}');

      try {
        const content = await fs.readFile(moduleJsonPath, 'utf-8');
        JSON.parse(content);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('JSON');
      }
    });
  });

  describe('Missing Required Fields', () => {
    it('should detect all missing required fields at once', async () => {
      const invalidMetadata = {};

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: name');
      expect(result.errors).toContain('Missing required field: version');
      expect(result.errors).toContain('Missing required field: displayName');
      expect(result.errors).toContain('Missing required field: description');
      expect(result.errors).toContain('Missing required field: type');
    });

    it('should detect missing fields even with null values', async () => {
      const invalidMetadata = {
        name: null,
        version: null,
        displayName: null,
        description: null,
        type: null
      };

      const result = validateModuleMetadata(invalidMetadata);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Module Structure Validation', () => {
    it('should validate complete module structure', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));
      await fs.writeFile(path.join(testModulePath, 'README.md'), '# Test Module');
      await fs.mkdir(path.join(testModulePath, 'rules'), { recursive: true });
      await fs.writeFile(path.join(testModulePath, 'rules', 'test.md'), '# Test Rule');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing module.json', async () => {
      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required file: module.json');
    });

    it('should detect missing README.md', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required file: README.md');
    });

    it('should detect missing rules directory', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));
      await fs.writeFile(path.join(testModulePath, 'README.md'), '# Test Module');

      const result = validateModuleStructure(testModulePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required directory: rules/');
    });

    it('should warn about empty rules directory', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));
      await fs.writeFile(path.join(testModulePath, 'README.md'), '# Test Module');
      await fs.mkdir(path.join(testModulePath, 'rules'), { recursive: true });

      const result = validateModuleStructure(testModulePath);

      expect(result.warnings.some(w => w.includes('rules/'))).toBe(true);
    });

    it('should warn about missing examples directory', async () => {
      const validMetadata = moduleFactory.createValidModule();
      const moduleJsonPath = path.join(testModulePath, 'module.json');
      await fs.writeFile(moduleJsonPath, JSON.stringify(validMetadata, null, 2));
      await fs.writeFile(path.join(testModulePath, 'README.md'), '# Test Module');
      await fs.mkdir(path.join(testModulePath, 'rules'), { recursive: true });
      await fs.writeFile(path.join(testModulePath, 'rules', 'test.md'), '# Test Rule');

      const result = validateModuleStructure(testModulePath);

      expect(result.warnings).toContain('Optional directory missing: examples/');
    });
  });
});
