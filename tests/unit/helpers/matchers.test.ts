import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toBeValidModule, toHaveLinkedModule, toHaveCollection } from '@tests/helpers/matchers';
import { ModuleFactory, CollectionFactory } from '@tests/helpers/factories';
import { createTestEnvironment, type TestEnvironment } from '@tests/helpers/test-env';
import { writeFile } from 'fs/promises';
import { join } from 'path';

describe('Custom Matchers', () => {
  describe('toBeValidModule', () => {
    it('should pass for valid module', () => {
      const module = ModuleFactory.create();
      const result = toBeValidModule(module);
      
      expect(result.pass).toBe(true);
    });

    it('should fail for module missing required field', () => {
      const invalid = ModuleFactory.createInvalid('name');
      const result = toBeValidModule(invalid);
      
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('missing required fields');
      expect(result.message()).toContain('name');
    });

    it('should fail for module with invalid type', () => {
      const module = ModuleFactory.create({ type: 'invalid-type' as any });
      const result = toBeValidModule(module);
      
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('Expected module type to be one of');
    });

    it('should work with expect.extend', () => {
      const module = ModuleFactory.create();
      
      expect(module).toBeValidModule();
    });

    it('should fail with expect.extend for invalid module', () => {
      const invalid = ModuleFactory.createInvalid('version');
      
      expect(() => {
        expect(invalid).toBeValidModule();
      }).toThrow();
    });
  });

  describe('toHaveLinkedModule', () => {
    let testEnv: TestEnvironment;

    beforeEach(async () => {
      testEnv = await createTestEnvironment();
    });

    afterEach(async () => {
      await testEnv.cleanup();
    });

    it('should pass when module is linked', async () => {
      const project = await testEnv.createProject();
      
      // Manually add a module to the config
      const configPath = join(project.path, '.augment', 'extensions.json');
      const config = {
        version: '1.0.0',
        modules: [
          { name: 'coding-standards/typescript', version: '1.0.0' }
        ]
      };
      await writeFile(configPath, JSON.stringify(config, null, 2));
      
      const result = await toHaveLinkedModule(project.path, 'coding-standards/typescript');
      expect(result.pass).toBe(true);
    });

    it('should pass when module is linked with short name', async () => {
      const project = await testEnv.createProject();
      
      const configPath = join(project.path, '.augment', 'extensions.json');
      const config = {
        version: '1.0.0',
        modules: [
          { name: 'coding-standards/typescript', version: '1.0.0' }
        ]
      };
      await writeFile(configPath, JSON.stringify(config, null, 2));
      
      const result = await toHaveLinkedModule(project.path, 'typescript');
      expect(result.pass).toBe(true);
    });

    it('should fail when module is not linked', async () => {
      const project = await testEnv.createProject();
      
      const result = await toHaveLinkedModule(project.path, 'nonexistent-module');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('not in the modules list');
    });

    it('should fail when extensions.json does not exist', async () => {
      const project = await testEnv.createProject({ withAugmentDir: false });
      
      const result = await toHaveLinkedModule(project.path, 'any-module');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('doesn\'t exist');
    });
  });

  describe('toHaveCollection', () => {
    let testEnv: TestEnvironment;

    beforeEach(async () => {
      testEnv = await createTestEnvironment();
    });

    afterEach(async () => {
      await testEnv.cleanup();
    });

    it('should pass when collection has module', async () => {
      const collection = await testEnv.createCollection({
        modules: ['coding-standards/typescript', 'domain-rules/api']
      });
      
      const result = await toHaveCollection(collection.path, 'coding-standards/typescript');
      expect(result.pass).toBe(true);
    });

    it('should pass when collection has module with short name', async () => {
      const collection = await testEnv.createCollection({
        modules: ['coding-standards/typescript']
      });
      
      const result = await toHaveCollection(collection.path, 'typescript');
      expect(result.pass).toBe(true);
    });

    it('should fail when collection does not have module', async () => {
      const collection = await testEnv.createCollection({
        modules: ['coding-standards/typescript']
      });
      
      const result = await toHaveCollection(collection.path, 'nonexistent-module');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('not in the modules list');
    });

    it('should fail when collection.json does not exist', async () => {
      const result = await toHaveCollection('/nonexistent/path', 'any-module');
      expect(result.pass).toBe(false);
      expect(result.message()).toContain('doesn\'t exist');
    });
  });
});

