import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ModuleFactory, CollectionFactory, ProjectFactory } from '@tests/helpers/factories';
import { createTestEnvironment, type TestEnvironment } from '@tests/helpers/test-env';

describe('Test Factories', () => {
  describe('ModuleFactory', () => {
    it('should create module with default values', () => {
      const module = ModuleFactory.create();
      
      expect(module.name).toBe('test-module');
      expect(module.version).toBe('1.0.0');
      expect(module.type).toBe('coding-standards');
      expect(module.description).toBeDefined();
    });

    it('should create module with custom values', () => {
      const module = ModuleFactory.create({
        name: 'custom-module',
        version: '2.0.0',
        type: 'domain-rules'
      });
      
      expect(module.name).toBe('custom-module');
      expect(module.version).toBe('2.0.0');
      expect(module.type).toBe('domain-rules');
    });

    it('should create multiple modules', () => {
      const modules = ModuleFactory.createMany(3);
      
      expect(modules).toHaveLength(3);
      expect(modules[0].name).toBe('test-module-0');
      expect(modules[1].name).toBe('test-module-1');
      expect(modules[2].name).toBe('test-module-2');
    });

    it('should create multiple modules with overrides', () => {
      const modules = ModuleFactory.createMany(2, { type: 'workflows' });
      
      expect(modules).toHaveLength(2);
      expect(modules[0].type).toBe('workflows');
      expect(modules[1].type).toBe('workflows');
    });

    it('should create invalid module missing required field', () => {
      const invalid = ModuleFactory.createInvalid('name');
      
      expect(invalid.name).toBeUndefined();
      expect(invalid.version).toBeDefined();
    });

    it('should create module by type', () => {
      const module = ModuleFactory.createByType('examples');
      
      expect(module.type).toBe('examples');
    });

    it('should create high priority module', () => {
      const module = ModuleFactory.createHighPriority();
      
      expect(module.augment?.priority).toBe('high');
      expect(module.augment?.characterCount).toBeGreaterThan(5000);
    });

    it('should create large module', () => {
      const module = ModuleFactory.createLarge();
      
      expect(module.augment?.characterCount).toBeGreaterThanOrEqual(50000);
    });
  });

  describe('CollectionFactory', () => {
    it('should create collection with default values', () => {
      const collection = CollectionFactory.create();
      
      expect(collection.name).toBe('test-collection');
      expect(collection.version).toBe('1.0.0');
      expect(collection.type).toBe('collection');
      expect(collection.modules).toEqual([]);
    });

    it('should create collection with custom values', () => {
      const collection = CollectionFactory.create({
        name: 'custom-collection',
        version: '2.0.0'
      });
      
      expect(collection.name).toBe('custom-collection');
      expect(collection.version).toBe('2.0.0');
    });

    it('should create collection with modules', () => {
      const collection = CollectionFactory.withModules([
        'coding-standards/typescript',
        'domain-rules/api'
      ]);
      
      expect(collection.modules).toHaveLength(2);
      expect(collection.modules[0].id).toBe('coding-standards/typescript');
      expect(collection.modules[1].id).toBe('domain-rules/api');
    });

    it('should create multiple collections', () => {
      const collections = CollectionFactory.createMany(3);
      
      expect(collections).toHaveLength(3);
      expect(collections[0].name).toBe('test-collection-0');
      expect(collections[1].name).toBe('test-collection-1');
      expect(collections[2].name).toBe('test-collection-2');
    });

    it('should create invalid collection missing required field', () => {
      const invalid = CollectionFactory.createInvalid('name');
      
      expect(invalid.name).toBeUndefined();
      expect(invalid.version).toBeDefined();
    });
  });

  describe('ProjectFactory', () => {
    let testEnv: TestEnvironment;

    beforeEach(async () => {
      testEnv = await createTestEnvironment();
    });

    afterEach(async () => {
      await testEnv.cleanup();
    });

    it('should create project', async () => {
      const project = await ProjectFactory.create(testEnv);
      
      expect(project.path).toBeDefined();
      expect(project.augmentDir).toBeDefined();
      expect(project.configPath).toBeDefined();
    });

    it('should create project with custom options', async () => {
      const project = await ProjectFactory.create(testEnv, {
        name: 'my-project',
        version: '2.0.0'
      });
      
      expect(project.path).toContain('my-project');
    });

    it('should create project with linked modules', async () => {
      const project = await ProjectFactory.withLinkedModules(testEnv, [
        'coding-standards/typescript',
        'domain-rules/api'
      ]);
      
      expect(project.path).toBeDefined();
    });

    it('should create multiple projects', async () => {
      const projects = await ProjectFactory.createMany(testEnv, 3);
      
      expect(projects).toHaveLength(3);
      expect(projects[0].path).toContain('project-0');
      expect(projects[1].path).toContain('project-1');
      expect(projects[2].path).toContain('project-2');
    });
  });
});

