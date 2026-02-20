import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, type TestEnvironment } from '../../helpers/test-env';
import { loadModule, discoverModules, discoverCollections, validateModuleMetadata } from '@cli/utils/module-system';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

describe('Module Loading and Discovery', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('HTML Module Loading', () => {
    it('should load HTML module with all metadata', async () => {
      const module = await testEnv.createModule({
        name: 'html-standards',
        type: 'coding-standards',
        description: 'HTML coding standards',
        withRules: true,
        withExamples: true
      });

      const loaded = loadModule(module.path);

      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.name).toBe('html-standards');
      expect(loaded?.metadata.type).toBe('coding-standards');
      expect(loaded?.rules.length).toBeGreaterThan(0);
      expect(loaded?.examples.length).toBeGreaterThan(0);
    });

    it('should load HTML module without optional content', async () => {
      const module = await testEnv.createModule({
        name: 'html-minimal',
        type: 'coding-standards',
        description: 'Minimal HTML module',
        withRules: false,
        withExamples: false
      });

      const loaded = loadModule(module.path);

      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.name).toBe('html-minimal');
      expect(loaded?.rules.length).toBe(0);
      expect(loaded?.examples.length).toBe(0);
    });

    it('should validate HTML module metadata', async () => {
      const metadata = {
        name: 'html-standards',
        version: '1.0.0',
        displayName: 'HTML Standards',
        description: 'HTML coding standards',
        type: 'coding-standards'
      };

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid HTML module metadata', async () => {
      const metadata = {
        name: 'html-standards',
        // Missing required fields
        type: 'coding-standards'
      };

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
    });
  });

  describe('CSS Module Loading', () => {
    it('should load CSS module with all metadata', async () => {
      const module = await testEnv.createModule({
        name: 'css-standards',
        type: 'coding-standards',
        description: 'CSS coding standards',
        withRules: true,
        withExamples: true
      });

      const loaded = loadModule(module.path);

      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.name).toBe('css-standards');
      expect(loaded?.metadata.type).toBe('coding-standards');
    });

    it('should handle CSS module with custom properties', async () => {
      const modulePath = join(testEnv.tempDir, 'css-custom');
      await mkdir(modulePath, { recursive: true });

      const metadata = {
        name: 'css-custom',
        version: '1.0.0',
        displayName: 'CSS Custom',
        description: 'CSS with custom properties',
        type: 'coding-standards',
        augment: {
          characterCount: 30000,
          priority: 'high' as const,
          category: 'styling'
        }
      };

      await writeFile(
        join(modulePath, 'module.json'),
        JSON.stringify(metadata, null, 2)
      );

      const loaded = loadModule(modulePath);

      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.augment?.characterCount).toBe(30000);
      expect(loaded?.metadata.augment?.priority).toBe('high');
      expect(loaded?.metadata.augment?.category).toBe('styling');
    });
  });

  describe('JS Module Loading', () => {
    it('should load JS module with all metadata', async () => {
      const module = await testEnv.createModule({
        name: 'js-standards',
        type: 'coding-standards',
        description: 'JavaScript coding standards',
        withRules: true,
        withExamples: true
      });

      const loaded = loadModule(module.path);

      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.name).toBe('js-standards');
    });

    it('should handle JS module with dependencies', async () => {
      const modulePath = join(testEnv.tempDir, 'js-advanced');
      await mkdir(modulePath, { recursive: true });

      const metadata = {
        name: 'js-advanced',
        version: '1.0.0',
        displayName: 'JS Advanced',
        description: 'Advanced JavaScript patterns',
        type: 'coding-standards',
        dependencies: ['js-standards', 'typescript-standards']
      };

      await writeFile(
        join(modulePath, 'module.json'),
        JSON.stringify(metadata, null, 2)
      );

      const loaded = loadModule(modulePath);

      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.dependencies).toEqual(['js-standards', 'typescript-standards']);
    });
  });

  describe('Collection Loading', () => {
    it('should load html-css-js collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'html-css-js',
        version: '1.0.0',
        modules: ['coding-standards/html', 'coding-standards/css', 'coding-standards/js']
      });

      expect(collection).not.toBeNull();
      expect(collection.name).toBe('html-css-js');
      expect(collection.modules).toHaveLength(3);
    });

    it('should load collection with nested modules', async () => {
      const collection = await testEnv.createCollection({
        name: 'web-stack',
        version: '1.0.0',
        modules: [
          'coding-standards/html',
          'coding-standards/css',
          'coding-standards/js',
          'domain-rules/web-development',
          'workflows/openspec'
        ]
      });

      expect(collection.modules).toHaveLength(5);
    });

    it('should handle empty collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'empty-collection',
        version: '1.0.0',
        modules: []
      });

      expect(collection.modules).toHaveLength(0);
    });
  });

  describe('Module Discovery', () => {
    it('should discover all modules in directory', async () => {
      // Create multiple modules
      await testEnv.createModule({ name: 'module-1', type: 'coding-standards' });
      await testEnv.createModule({ name: 'module-2', type: 'domain-rules' });
      await testEnv.createModule({ name: 'module-3', type: 'workflows' });

      // Note: discoverModules() discovers from the actual augment-extensions directory
      // This test verifies the function works, but won't find our test modules
      const modules = discoverModules();

      expect(Array.isArray(modules)).toBe(true);
      // The actual augment-extensions directory should have modules
      expect(modules.length).toBeGreaterThan(0);
    });

    it('should discover collections', async () => {
      // Note: discoverCollections() discovers from the actual collections directory
      const collections = discoverCollections();

      expect(Array.isArray(collections)).toBe(true);
    });

    it('should filter modules by type', async () => {
      const modules = discoverModules();
      const codingStandards = modules.filter(m => m.metadata.type === 'coding-standards');
      const domainRules = modules.filter(m => m.metadata.type === 'domain-rules');

      expect(codingStandards.length).toBeGreaterThan(0);
      expect(domainRules.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return null for non-existent module', () => {
      const loaded = loadModule(join(testEnv.tempDir, 'non-existent'));

      expect(loaded).toBeNull();
    });

    it('should return null for module without module.json', async () => {
      const modulePath = join(testEnv.tempDir, 'invalid-module');
      await mkdir(modulePath, { recursive: true });

      const loaded = loadModule(modulePath);

      expect(loaded).toBeNull();
    });

    it('should return null for module with corrupted module.json', async () => {
      const modulePath = join(testEnv.tempDir, 'corrupted-module');
      await mkdir(modulePath, { recursive: true });
      await writeFile(join(modulePath, 'module.json'), 'invalid json {{{');

      const loaded = loadModule(modulePath);

      expect(loaded).toBeNull();
    });

    it('should validate and reject invalid module type', () => {
      const metadata = {
        name: 'invalid-type',
        version: '1.0.0',
        displayName: 'Invalid Type',
        description: 'Module with invalid type',
        type: 'invalid-type'
      };

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid type'))).toBe(true);
    });

    it('should validate and reject invalid version format', () => {
      const metadata = {
        name: 'invalid-version',
        version: 'not-a-version',
        displayName: 'Invalid Version',
        description: 'Module with invalid version',
        type: 'coding-standards'
      };

      const result = validateModuleMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid version format'))).toBe(true);
    });
  });
});

