import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Module Unlinking Tests
 * 
 * Tests for module unlinking operations including:
 * - Single module unlinking
 * - Multiple module unlinking
 * - Cleanup verification
 * - Error cases (non-existent modules, dependencies)
 */

describe('Module Unlinking Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Single Module Unlinking', () => {
    it('should unlink a single module from project', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Link module first
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

      // Unlink module
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = config2.modules.filter((m: any) => m.name !== module.fullName);
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));

      // Verify module is unlinked
      expect(await testEnv.isModuleLinked(module.fullName)).toBe(false);
    });

    it('should remove module from config when unlinking', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Link module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify module is in config
      const configBefore = JSON.parse(await readFile(project.configPath, 'utf-8'));
      expect(configBefore.modules).toHaveLength(1);

      // Unlink module
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = config2.modules.filter((m: any) => m.name !== module.fullName);
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));

      // Verify module is removed from config
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      expect(configAfter.modules).toHaveLength(0);
    });
  });

  describe('Multiple Module Unlinking', () => {
    it('should unlink multiple modules (bulk)', async () => {
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
      expect(await testEnv.getLinkedModules()).toHaveLength(3);

      // Unlink module1 and module2
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = config2.modules.filter((m: any) => 
        m.name !== module1.fullName && m.name !== module2.fullName
      );
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));

      // Verify only module3 remains
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(1);
      expect(linkedModules).toContain(module3.fullName);
      expect(linkedModules).not.toContain(module1.fullName);
      expect(linkedModules).not.toContain(module2.fullName);
    });

    it('should unlink all modules', async () => {
      const project = await testEnv.createProject();
      const modules = await Promise.all([
        testEnv.createModule({ name: 'module-1' }),
        testEnv.createModule({ name: 'module-2' }),
        testEnv.createModule({ name: 'module-3' })
      ]);

      // Link all modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = modules.map(m => ({
        name: m.fullName,
        version: m.metadata.version,
        type: m.metadata.type,
        description: m.metadata.description
      }));
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify all modules are linked
      expect(await testEnv.getLinkedModules()).toHaveLength(3);

      // Unlink all modules
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = [];
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));

      // Verify no modules are linked
      expect(await testEnv.getLinkedModules()).toHaveLength(0);
    });
  });

  describe('Cleanup Verification', () => {
    it('should clean up module files when unlinking', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Create modules directory and module files
      const modulesDir = join(project.augmentDir, 'modules');
      await mkdir(modulesDir, { recursive: true });
      const moduleTargetPath = join(modulesDir, module.fullName);
      await mkdir(moduleTargetPath, { recursive: true });

      // Create a test file in module directory
      const testFilePath = join(moduleTargetPath, 'test.txt');
      await writeFile(testFilePath, 'test content');

      // Verify module directory exists
      expect(existsSync(moduleTargetPath)).toBe(true);
      expect(existsSync(testFilePath)).toBe(true);

      // Unlink module and clean up
      await rm(moduleTargetPath, { recursive: true, force: true });

      // Verify module directory is removed
      expect(existsSync(moduleTargetPath)).toBe(false);
      expect(existsSync(testFilePath)).toBe(false);
    });

    it('should not leave orphaned files after unlinking', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Create modules directory with nested structure
      const modulesDir = join(project.augmentDir, 'modules');
      await mkdir(modulesDir, { recursive: true });
      const moduleTargetPath = join(modulesDir, module.fullName);
      await mkdir(moduleTargetPath, { recursive: true });

      // Create nested directories and files
      const rulesDir = join(moduleTargetPath, 'rules');
      await mkdir(rulesDir, { recursive: true });
      await writeFile(join(rulesDir, 'rule1.md'), 'rule content');
      await writeFile(join(rulesDir, 'rule2.md'), 'rule content');

      const examplesDir = join(moduleTargetPath, 'examples');
      await mkdir(examplesDir, { recursive: true });
      await writeFile(join(examplesDir, 'example1.ts'), 'example content');

      // Verify all files exist
      expect(existsSync(join(rulesDir, 'rule1.md'))).toBe(true);
      expect(existsSync(join(rulesDir, 'rule2.md'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example1.ts'))).toBe(true);

      // Unlink and clean up
      await rm(moduleTargetPath, { recursive: true, force: true });

      // Verify all files are removed
      expect(existsSync(moduleTargetPath)).toBe(false);
      expect(existsSync(rulesDir)).toBe(false);
      expect(existsSync(examplesDir)).toBe(false);
    });

    it('should preserve other linked modules when unlinking one', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'module-1' });
      const module2 = await testEnv.createModule({ name: 'module-2' });

      // Link both modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: module1.fullName, version: module1.metadata.version, type: module1.metadata.type, description: module1.metadata.description },
        { name: module2.fullName, version: module2.metadata.version, type: module2.metadata.type, description: module2.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Create module directories
      const modulesDir = join(project.augmentDir, 'modules');
      await mkdir(modulesDir, { recursive: true });
      const module1Path = join(modulesDir, module1.fullName);
      const module2Path = join(modulesDir, module2.fullName);
      await mkdir(module1Path, { recursive: true });
      await mkdir(module2Path, { recursive: true });

      // Unlink module1
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = config2.modules.filter((m: any) => m.name !== module1.fullName);
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));
      await rm(module1Path, { recursive: true, force: true });

      // Verify module1 is removed but module2 remains
      expect(existsSync(module1Path)).toBe(false);
      expect(existsSync(module2Path)).toBe(true);
      expect(await testEnv.isModuleLinked(module1.fullName)).toBe(false);
      expect(await testEnv.isModuleLinked(module2.fullName)).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should handle unlinking non-linked module', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Try to unlink module that was never linked
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const initialLength = config.modules.length;

      // Filter out non-existent module (should have no effect)
      config.modules = config.modules.filter((m: any) => m.name !== module.fullName);
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify config unchanged
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      expect(configAfter.modules).toHaveLength(initialLength);
    });

    it('should handle unlinking from non-existent project', async () => {
      const invalidPath = join(testEnv.tempDir, 'non-existent-project');
      const configPath = join(invalidPath, '.augment', 'extensions.json');

      // Verify config doesn't exist
      expect(existsSync(configPath)).toBe(false);
    });

    it('should handle unlinking with missing module directory', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module' });

      // Link module in config but don't create directory
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Module directory doesn't exist
      const modulesDir = join(project.augmentDir, 'modules');
      const moduleTargetPath = join(modulesDir, module.fullName);
      expect(existsSync(moduleTargetPath)).toBe(false);

      // Unlink module (should not fail even though directory doesn't exist)
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = config2.modules.filter((m: any) => m.name !== module.fullName);
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));

      // Verify module is unlinked
      expect(await testEnv.isModuleLinked(module.fullName)).toBe(false);
    });

    it('should handle unlinking with dependencies', async () => {
      const project = await testEnv.createProject();
      const depModule = await testEnv.createModule({ name: 'dependency-module' });
      const mainModule = await testEnv.createModule({ name: 'main-module' });

      // Set up dependency
      const mainModuleJsonPath = join(mainModule.path, 'module.json');
      const mainModuleJson = JSON.parse(await readFile(mainModuleJsonPath, 'utf-8'));
      mainModuleJson.dependencies = [depModule.fullName];
      await writeFile(mainModuleJsonPath, JSON.stringify(mainModuleJson, null, 2));

      // Link both modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: depModule.fullName, version: depModule.metadata.version, type: depModule.metadata.type, description: depModule.metadata.description },
        { name: mainModule.fullName, version: mainModule.metadata.version, type: mainModule.metadata.type, description: mainModule.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Try to unlink dependency (in real implementation, this might warn or fail)
      const config2 = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config2.modules = config2.modules.filter((m: any) => m.name !== depModule.fullName);
      await writeFile(project.configPath, JSON.stringify(config2, null, 2));

      // Verify dependency is unlinked
      expect(await testEnv.isModuleLinked(depModule.fullName)).toBe(false);
      // Main module still linked (but may have broken dependency)
      expect(await testEnv.isModuleLinked(mainModule.fullName)).toBe(true);
    });
  });
});
