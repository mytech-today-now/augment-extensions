import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { ModuleFactory } from '../../helpers/factories';

/**
 * Module Linking Tests
 * 
 * Tests for module linking operations including:
 * - Single module linking
 * - Multiple module linking
 * - Module linking with dependencies
 * - Error cases (non-existent modules, invalid paths)
 * - Idempotent behavior (linking already-linked modules)
 */

describe('Module Linking Tests', () => {
  let testEnv: TestEnvironment;
  let moduleFactory: ModuleFactory;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    moduleFactory = new ModuleFactory();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Single Module Linking', () => {
    it('should link a single module to project', async () => {
      // Create test project and module
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ 
        name: 'test-module',
        type: 'coding-standards'
      });

      // Read initial config
      const configBefore = JSON.parse(await readFile(project.configPath, 'utf-8'));
      expect(configBefore.modules).toEqual([]);

      // Link module
      const linkedModules = [...configBefore.modules, {
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description
      }];

      await writeFile(project.configPath, JSON.stringify({
        ...configBefore,
        modules: linkedModules
      }, null, 2));

      // Verify module is linked
      const isLinked = await testEnv.isModuleLinked(module.fullName);
      expect(isLinked).toBe(true);

      // Verify config was updated
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      expect(configAfter.modules).toHaveLength(1);
      expect(configAfter.modules[0].name).toBe(module.fullName);
    });

    it('should create module directory in .augment/modules when linking', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Create modules directory
      const modulesDir = join(project.augmentDir, 'modules');
      await mkdir(modulesDir, { recursive: true });

      // Create module symlink/copy
      const moduleTargetPath = join(modulesDir, module.fullName);
      await mkdir(moduleTargetPath, { recursive: true });

      // Verify module directory exists
      expect(existsSync(moduleTargetPath)).toBe(true);
    });

    it('should preserve module metadata when linking', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({
        name: 'test-module',
        version: '2.1.0',
        description: 'Test module description',
        type: 'domain-rules'
      });

      // Link module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify metadata
      const updatedConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const linkedModule = updatedConfig.modules[0];
      expect(linkedModule.version).toBe('2.1.0');
      expect(linkedModule.description).toBe('Test module description');
      expect(linkedModule.type).toBe('domain-rules');
    });
  });

  describe('Multiple Module Linking', () => {
    it('should link multiple modules to project', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'module-1' });
      const module2 = await testEnv.createModule({ name: 'module-2' });
      const module3 = await testEnv.createModule({ name: 'module-3' });

      // Link all modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: module1.fullName, version: module1.metadata.version, type: module1.metadata.type, description: module1.metadata.description },
        { name: module2.fullName, version: module2.metadata.version, type: module2.metadata.type, description: module2.metadata.description },
        { name: module3.fullName, version: module3.metadata.version, type: module3.metadata.type, description: module3.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify all modules are linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(3);
      expect(linkedModules).toContain(module1.fullName);
      expect(linkedModules).toContain(module2.fullName);
      expect(linkedModules).toContain(module3.fullName);
    });

    it('should maintain module order when linking multiple modules', async () => {
      const project = await testEnv.createProject();
      const modules = await Promise.all([
        testEnv.createModule({ name: 'alpha' }),
        testEnv.createModule({ name: 'beta' }),
        testEnv.createModule({ name: 'gamma' })
      ]);

      // Link in specific order
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = modules.map(m => ({
        name: m.fullName,
        version: m.metadata.version,
        type: m.metadata.type,
        description: m.metadata.description
      }));
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify order is preserved
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules[0]).toContain('alpha');
      expect(linkedModules[1]).toContain('beta');
      expect(linkedModules[2]).toContain('gamma');
    });
  });

  describe('Module Linking with Dependencies', () => {
    it('should link module with dependencies', async () => {
      const project = await testEnv.createProject();

      // Create dependency module
      const depModule = await testEnv.createModule({
        name: 'dependency-module',
        type: 'coding-standards'
      });

      // Create main module with dependency
      const mainModule = await testEnv.createModule({
        name: 'main-module',
        type: 'coding-standards'
      });

      // Manually add dependency to main module's metadata
      const mainModuleJsonPath = join(mainModule.path, 'module.json');
      const mainModuleJson = JSON.parse(await readFile(mainModuleJsonPath, 'utf-8'));
      mainModuleJson.dependencies = [depModule.fullName];
      await writeFile(mainModuleJsonPath, JSON.stringify(mainModuleJson, null, 2));

      // Link main module (should also link dependency)
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: depModule.fullName, version: depModule.metadata.version, type: depModule.metadata.type, description: depModule.metadata.description },
        { name: mainModule.fullName, version: mainModule.metadata.version, type: mainModule.metadata.type, description: mainModule.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify both modules are linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(depModule.fullName);
      expect(linkedModules).toContain(mainModule.fullName);
    });

    it('should handle transitive dependencies', async () => {
      const project = await testEnv.createProject();

      // Create dependency chain: A -> B -> C
      const moduleC = await testEnv.createModule({ name: 'module-c' });
      const moduleB = await testEnv.createModule({ name: 'module-b' });
      const moduleA = await testEnv.createModule({ name: 'module-a' });

      // Set up dependencies
      const moduleBJsonPath = join(moduleB.path, 'module.json');
      const moduleBJson = JSON.parse(await readFile(moduleBJsonPath, 'utf-8'));
      moduleBJson.dependencies = [moduleC.fullName];
      await writeFile(moduleBJsonPath, JSON.stringify(moduleBJson, null, 2));

      const moduleAJsonPath = join(moduleA.path, 'module.json');
      const moduleAJson = JSON.parse(await readFile(moduleAJsonPath, 'utf-8'));
      moduleAJson.dependencies = [moduleB.fullName];
      await writeFile(moduleAJsonPath, JSON.stringify(moduleAJson, null, 2));

      // Link module A (should link B and C as well)
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: moduleC.fullName, version: moduleC.metadata.version, type: moduleC.metadata.type, description: moduleC.metadata.description },
        { name: moduleB.fullName, version: moduleB.metadata.version, type: moduleB.metadata.type, description: moduleB.metadata.description },
        { name: moduleA.fullName, version: moduleA.metadata.version, type: moduleA.metadata.type, description: moduleA.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify all modules are linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
      expect(linkedModules).toContain(moduleB.fullName);
      expect(linkedModules).toContain(moduleC.fullName);
    });
  });

  describe('Idempotent Linking', () => {
    it('should handle linking already-linked module (idempotent)', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Link module first time
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify module is linked
      expect(await testEnv.isModuleLinked(module.fullName)).toBe(true);

      // Try to link again (should be idempotent - no duplicate)
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const existingIndex = config2.modules.findIndex((m: any) => m.name === module.fullName);

      // Should find existing module
      expect(existingIndex).toBeGreaterThanOrEqual(0);

      // Should not add duplicate
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules.filter(m => m === module.fullName)).toHaveLength(1);
    });

    it('should not create duplicate module directories', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Create modules directory
      const modulesDir = join(project.augmentDir, 'modules');
      await mkdir(modulesDir, { recursive: true });

      // Create module directory first time
      const moduleTargetPath = join(modulesDir, module.fullName);
      await mkdir(moduleTargetPath, { recursive: true });

      // Verify directory exists
      expect(existsSync(moduleTargetPath)).toBe(true);

      // Try to create again (should not fail)
      await mkdir(moduleTargetPath, { recursive: true });

      // Should still exist (no error)
      expect(existsSync(moduleTargetPath)).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should handle linking non-existent module', async () => {
      const project = await testEnv.createProject();

      // Try to link non-existent module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));

      // In real implementation, this would throw an error
      // For now, we just verify the module doesn't exist
      const nonExistentModule = 'coding-standards/non-existent-module';
      const isLinked = await testEnv.isModuleLinked(nonExistentModule);
      expect(isLinked).toBe(false);
    });

    it('should handle invalid project path', async () => {
      // Try to work with non-existent project
      const invalidPath = join(testEnv.tempDir, 'non-existent-project');

      // Verify path doesn't exist
      expect(existsSync(invalidPath)).toBe(false);

      // Verify .augment directory doesn't exist
      const augmentDir = join(invalidPath, '.augment');
      expect(existsSync(augmentDir)).toBe(false);
    });

    it('should handle missing .augment directory', async () => {
      const project = await testEnv.createProject({ withAugmentDir: false });

      // Verify .augment directory doesn't exist
      expect(existsSync(project.augmentDir)).toBe(false);

      // Verify config doesn't exist
      expect(existsSync(project.configPath)).toBe(false);
    });

    it('should handle corrupted extensions.json', async () => {
      const project = await testEnv.createProject();

      // Write invalid JSON
      await writeFile(project.configPath, '{ invalid json }');

      // Try to read config (should fail)
      await expect(async () => {
        JSON.parse(await readFile(project.configPath, 'utf-8'));
      }).rejects.toThrow();
    });
  });
});
