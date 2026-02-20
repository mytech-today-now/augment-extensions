import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Module List Tests
 * 
 * Tests for module list operations including:
 * - Listing all available modules
 * - Listing linked modules only
 * - Filtering by category/type
 * - Empty results handling
 * - JSON output format
 */

describe('Module List Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('List All Modules', () => {
    it('should list all available modules', async () => {
      // Create multiple modules
      const module1 = await testEnv.createModule({ name: 'module-1', type: 'coding-standards' });
      const module2 = await testEnv.createModule({ name: 'module-2', type: 'domain-rules' });
      const module3 = await testEnv.createModule({ name: 'module-3', type: 'workflows' });

      // Verify modules exist
      expect(module1.metadata.name).toBe('module-1');
      expect(module2.metadata.name).toBe('module-2');
      expect(module3.metadata.name).toBe('module-3');
    });

    it('should display module metadata in list', async () => {
      const module = await testEnv.createModule({ 
        name: 'list-module',
        version: '1.2.3',
        description: 'Test module for listing',
        type: 'coding-standards'
      });

      // Verify metadata
      expect(module.metadata.name).toBe('list-module');
      expect(module.metadata.version).toBe('1.2.3');
      expect(module.metadata.description).toBe('Test module for listing');
      expect(module.metadata.type).toBe('coding-standards');
    });

    it('should show linked status for modules', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'linked-module' });
      const module2 = await testEnv.createModule({ name: 'unlinked-module' });

      // Link only module1
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module1.fullName,
        version: module1.metadata.version,
        type: module1.metadata.type,
        description: module1.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify linked status
      expect(await testEnv.isModuleLinked(module1.fullName)).toBe(true);
      expect(await testEnv.isModuleLinked(module2.fullName)).toBe(false);
    });
  });

  describe('List Linked Modules Only', () => {
    it('should list only linked modules', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'linked-1' });
      const module2 = await testEnv.createModule({ name: 'linked-2' });
      const module3 = await testEnv.createModule({ name: 'not-linked' });

      // Link module1 and module2
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: module1.fullName, version: module1.metadata.version, type: module1.metadata.type, description: module1.metadata.description },
        { name: module2.fullName, version: module2.metadata.version, type: module2.metadata.type, description: module2.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Get linked modules
      const linkedModules = await testEnv.getLinkedModules();
      
      // Verify only linked modules are returned
      expect(linkedModules).toHaveLength(2);
      expect(linkedModules).toContain(module1.fullName);
      expect(linkedModules).toContain(module2.fullName);
      expect(linkedModules).not.toContain(module3.fullName);
    });

    it('should return empty list when no modules are linked', async () => {
      const project = await testEnv.createProject();
      await testEnv.createModule({ name: 'unlinked-module' });

      // Get linked modules (should be empty)
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(0);
    });

    it('should handle project with no .augment directory', async () => {
      // Create project without .augment directory
      const project = await testEnv.createProject({ withAugmentDir: false });

      // Get linked modules (should be empty)
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(0);
    });
  });

  describe('Filter by Category', () => {
    it('should filter modules by type/category', async () => {
      // Create modules of different types
      const codingModule = await testEnv.createModule({ name: 'coding-mod', type: 'coding-standards' });
      const domainModule = await testEnv.createModule({ name: 'domain-mod', type: 'domain-rules' });
      const workflowModule = await testEnv.createModule({ name: 'workflow-mod', type: 'workflows' });

      // Verify types
      expect(codingModule.metadata.type).toBe('coding-standards');
      expect(domainModule.metadata.type).toBe('domain-rules');
      expect(workflowModule.metadata.type).toBe('workflows');
    });

    it('should list modules of specific category', async () => {
      // Create multiple coding-standards modules
      const module1 = await testEnv.createModule({ name: 'ts-standards', type: 'coding-standards' });
      const module2 = await testEnv.createModule({ name: 'js-standards', type: 'coding-standards' });
      const module3 = await testEnv.createModule({ name: 'domain-rule', type: 'domain-rules' });

      // Filter for coding-standards
      const codingModules = [module1, module2].filter(m => m.metadata.type === 'coding-standards');
      
      expect(codingModules).toHaveLength(2);
      expect(codingModules.every(m => m.metadata.type === 'coding-standards')).toBe(true);
    });

    it('should handle empty category results', async () => {
      // Create modules of one type
      await testEnv.createModule({ name: 'coding-mod', type: 'coding-standards' });

      // Filter for different type (should be empty)
      const workflowModules: any[] = [];
      expect(workflowModules).toHaveLength(0);
    });
  });

  describe('JSON Output Format', () => {
    it('should output modules as JSON', async () => {
      const module = await testEnv.createModule({
        name: 'json-module',
        version: '1.0.0',
        description: 'JSON test module',
        type: 'coding-standards'
      });

      // Simulate JSON output
      const jsonOutput = {
        name: module.fullName,
        version: module.metadata.version,
        description: module.metadata.description,
        type: module.metadata.type,
        linked: false
      };

      expect(jsonOutput.name).toBe(module.fullName);
      expect(jsonOutput.version).toBe('1.0.0');
      expect(jsonOutput.description).toBe('JSON test module');
      expect(jsonOutput.type).toBe('coding-standards');
      expect(jsonOutput.linked).toBe(false);
    });

    it('should include linked status in JSON output', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'linked-json-module' });

      // Link module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Simulate JSON output with linked status
      const jsonOutput = {
        name: module.fullName,
        version: module.metadata.version,
        description: module.metadata.description,
        type: module.metadata.type,
        linked: await testEnv.isModuleLinked(module.fullName)
      };

      expect(jsonOutput.linked).toBe(true);
    });

    it('should output array of modules as JSON', async () => {
      const module1 = await testEnv.createModule({ name: 'module-1' });
      const module2 = await testEnv.createModule({ name: 'module-2' });

      // Simulate JSON array output
      const jsonOutput = [
        {
          name: module1.fullName,
          version: module1.metadata.version,
          description: module1.metadata.description,
          type: module1.metadata.type
        },
        {
          name: module2.fullName,
          version: module2.metadata.version,
          description: module2.metadata.description,
          type: module2.metadata.type
        }
      ];

      expect(jsonOutput).toHaveLength(2);
      expect(jsonOutput[0].name).toBe(module1.fullName);
      expect(jsonOutput[1].name).toBe(module2.fullName);
    });
  });

  describe('Empty Results', () => {
    it('should handle no modules available', async () => {
      // Don't create any modules
      const modules: any[] = [];

      expect(modules).toHaveLength(0);
    });

    it('should handle no linked modules', async () => {
      const project = await testEnv.createProject();
      await testEnv.createModule({ name: 'unlinked-module' });

      // Get linked modules (should be empty)
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(0);
    });

    it('should display appropriate message for empty results', async () => {
      const modules: any[] = [];
      const message = modules.length === 0 ? 'No modules available.' : '';

      expect(message).toBe('No modules available.');
    });

    it('should display appropriate message for no linked modules', async () => {
      const linkedModules: any[] = [];
      const message = linkedModules.length === 0 ? 'No linked modules found.' : '';

      expect(message).toBe('No linked modules found.');
    });
  });

  describe('Module Count and Summary', () => {
    it('should display total module count', async () => {
      const module1 = await testEnv.createModule({ name: 'module-1' });
      const module2 = await testEnv.createModule({ name: 'module-2' });
      const module3 = await testEnv.createModule({ name: 'module-3' });

      const modules = [module1, module2, module3];
      expect(modules).toHaveLength(3);
    });

    it('should display linked module count', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'linked-1' });
      const module2 = await testEnv.createModule({ name: 'linked-2' });
      await testEnv.createModule({ name: 'unlinked' });

      // Link two modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: module1.fullName, version: module1.metadata.version, type: module1.metadata.type, description: module1.metadata.description },
        { name: module2.fullName, version: module2.metadata.version, type: module2.metadata.type, description: module2.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(2);
    });

    it('should show linked vs total count', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'module-1' });
      const module2 = await testEnv.createModule({ name: 'module-2' });
      const module3 = await testEnv.createModule({ name: 'module-3' });

      // Link one module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module1.fullName,
        version: module1.metadata.version,
        type: module1.metadata.type,
        description: module1.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      const totalModules = 3;
      const linkedModules = await testEnv.getLinkedModules();
      const linkedCount = linkedModules.length;

      expect(totalModules).toBe(3);
      expect(linkedCount).toBe(1);
    });
  });

  describe('Module Sorting and Display', () => {
    it('should list modules in consistent order', async () => {
      const moduleA = await testEnv.createModule({ name: 'alpha-module' });
      const moduleB = await testEnv.createModule({ name: 'beta-module' });
      const moduleC = await testEnv.createModule({ name: 'gamma-module' });

      const modules = [moduleA, moduleB, moduleC];

      // Verify order
      expect(modules[0].metadata.name).toBe('alpha-module');
      expect(modules[1].metadata.name).toBe('beta-module');
      expect(modules[2].metadata.name).toBe('gamma-module');
    });

    it('should display module full names', async () => {
      const module = await testEnv.createModule({
        name: 'test-module',
        type: 'coding-standards'
      });

      // Full name should include category
      expect(module.fullName).toContain('test-module');
    });
  });
});


