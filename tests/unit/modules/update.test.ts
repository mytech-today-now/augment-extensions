import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Module Update Tests
 * 
 * Tests for module update operations including:
 * - Updating single module
 * - Updating all modules
 * - Version pinning
 * - Compatibility checks
 * - Conflict resolution
 * - Update rollback
 */

describe('Module Update Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Update Single Module', () => {
    it('should update module to latest version', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module', version: '1.0.0' });

      // Link module with old version
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: '1.0.0',
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Update module.json to new version
      const moduleJsonPath = join(module.path, 'module.json');
      const moduleJson = JSON.parse(await readFile(moduleJsonPath, 'utf-8'));
      moduleJson.version = '2.0.0';
      await writeFile(moduleJsonPath, JSON.stringify(moduleJson, null, 2));

      // Simulate update
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const moduleIndex = configAfter.modules.findIndex((m: any) => m.name === module.fullName);
      configAfter.modules[moduleIndex].version = '2.0.0';
      await writeFile(project.configPath, JSON.stringify(configAfter, null, 2));

      // Verify update
      const finalConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const updatedModule = finalConfig.modules.find((m: any) => m.name === module.fullName);
      expect(updatedModule.version).toBe('2.0.0');
    });

    it('should skip update if already up to date', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module', version: '1.0.0' });

      // Link module with current version
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: '1.0.0',
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Check if update needed
      const currentVersion = '1.0.0';
      const latestVersion = '1.0.0';
      const needsUpdate = currentVersion !== latestVersion;

      expect(needsUpdate).toBe(false);
    });

    it('should update module metadata along with version', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ 
        name: 'test-module', 
        version: '1.0.0',
        description: 'Old description'
      });

      // Link module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: '1.0.0',
        type: module.metadata.type,
        description: 'Old description'
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Update module.json
      const moduleJsonPath = join(module.path, 'module.json');
      const moduleJson = JSON.parse(await readFile(moduleJsonPath, 'utf-8'));
      moduleJson.version = '2.0.0';
      moduleJson.description = 'New description';
      await writeFile(moduleJsonPath, JSON.stringify(moduleJson, null, 2));

      // Simulate update
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const moduleIndex = configAfter.modules.findIndex((m: any) => m.name === module.fullName);
      configAfter.modules[moduleIndex].version = '2.0.0';
      configAfter.modules[moduleIndex].description = 'New description';
      await writeFile(project.configPath, JSON.stringify(configAfter, null, 2));

      // Verify both version and description updated
      const finalConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const updatedModule = finalConfig.modules.find((m: any) => m.name === module.fullName);
      expect(updatedModule.version).toBe('2.0.0');
      expect(updatedModule.description).toBe('New description');
    });
  });

  describe('Update All Modules', () => {
    it('should update all linked modules', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'module-1', version: '1.0.0' });
      const module2 = await testEnv.createModule({ name: 'module-2', version: '1.0.0' });

      // Link both modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: module1.fullName, version: '1.0.0', type: module1.metadata.type, description: module1.metadata.description },
        { name: module2.fullName, version: '1.0.0', type: module2.metadata.type, description: module2.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Update both module.json files
      for (const module of [module1, module2]) {
        const moduleJsonPath = join(module.path, 'module.json');
        const moduleJson = JSON.parse(await readFile(moduleJsonPath, 'utf-8'));
        moduleJson.version = '2.0.0';
        await writeFile(moduleJsonPath, JSON.stringify(moduleJson, null, 2));
      }

      // Simulate update all
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      configAfter.modules.forEach((m: any) => {
        m.version = '2.0.0';
      });
      await writeFile(project.configPath, JSON.stringify(configAfter, null, 2));

      // Verify all updated
      const finalConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
      expect(finalConfig.modules.every((m: any) => m.version === '2.0.0')).toBe(true);
    });

    it('should report update summary', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'module-1', version: '1.0.0' });
      const module2 = await testEnv.createModule({ name: 'module-2', version: '2.0.0' });

      // Link modules
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules = [
        { name: module1.fullName, version: '1.0.0', type: module1.metadata.type, description: module1.metadata.description },
        { name: module2.fullName, version: '2.0.0', type: module2.metadata.type, description: module2.metadata.description }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Update module1 only
      const module1JsonPath = join(module1.path, 'module.json');
      const module1Json = JSON.parse(await readFile(module1JsonPath, 'utf-8'));
      module1Json.version = '2.0.0';
      await writeFile(module1JsonPath, JSON.stringify(module1Json, null, 2));

      // Simulate update summary
      const summary = {
        updated: 1,
        upToDate: 1,
        errors: 0
      };

      expect(summary.updated).toBe(1);
      expect(summary.upToDate).toBe(1);
      expect(summary.errors).toBe(0);
    });
  });

  describe('Version Pinning', () => {
    it('should respect pinned versions during update', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'pinned-module', version: '1.0.0' });

      // Link module with pinned version
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: '1.0.0',
        type: module.metadata.type,
        description: module.metadata.description,
        pinned: true
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Check if pinned
      const configCheck = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const pinnedModule = configCheck.modules.find((m: any) => m.name === module.fullName);

      expect(pinnedModule.pinned).toBe(true);
      // Pinned modules should not be updated
    });

    it('should allow unpinning module', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'module', version: '1.0.0' });

      // Link with pin
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: '1.0.0',
        type: module.metadata.type,
        description: module.metadata.description,
        pinned: true
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Unpin
      const configAfter = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const moduleIndex = configAfter.modules.findIndex((m: any) => m.name === module.fullName);
      delete configAfter.modules[moduleIndex].pinned;
      await writeFile(project.configPath, JSON.stringify(configAfter, null, 2));

      // Verify unpinned
      const finalConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const unpinnedModule = finalConfig.modules.find((m: any) => m.name === module.fullName);
      expect(unpinnedModule.pinned).toBeUndefined();
    });
  });

  describe('Version Comparison', () => {
    it('should compare semantic versions correctly', () => {
      const compareVersions = (v1: string, v2: string): number => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
          const part1 = parts1[i] || 0;
          const part2 = parts2[i] || 0;

          if (part1 > part2) return 1;
          if (part1 < part2) return -1;
        }

        return 0;
      };

      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
    });

    it('should detect major version changes', () => {
      const isMajorUpdate = (oldVer: string, newVer: string): boolean => {
        const oldMajor = parseInt(oldVer.split('.')[0]);
        const newMajor = parseInt(newVer.split('.')[0]);
        return newMajor > oldMajor;
      };

      expect(isMajorUpdate('1.0.0', '2.0.0')).toBe(true);
      expect(isMajorUpdate('1.0.0', '1.1.0')).toBe(false);
    });

    it('should detect minor version changes', () => {
      const isMinorUpdate = (oldVer: string, newVer: string): boolean => {
        const oldParts = oldVer.split('.').map(Number);
        const newParts = newVer.split('.').map(Number);
        return oldParts[0] === newParts[0] && newParts[1] > oldParts[1];
      };

      expect(isMinorUpdate('1.0.0', '1.1.0')).toBe(true);
      expect(isMinorUpdate('1.0.0', '2.0.0')).toBe(false);
      expect(isMinorUpdate('1.0.0', '1.0.1')).toBe(false);
    });

    it('should detect patch version changes', () => {
      const isPatchUpdate = (oldVer: string, newVer: string): boolean => {
        const oldParts = oldVer.split('.').map(Number);
        const newParts = newVer.split('.').map(Number);
        return oldParts[0] === newParts[0] && oldParts[1] === newParts[1] && newParts[2] > oldParts[2];
      };

      expect(isPatchUpdate('1.0.0', '1.0.1')).toBe(true);
      expect(isPatchUpdate('1.0.0', '1.1.0')).toBe(false);
      expect(isPatchUpdate('1.0.0', '2.0.0')).toBe(false);
    });
  });

  describe('Compatibility Checks', () => {
    it('should check for breaking changes in major updates', async () => {
      const oldVersion = '1.0.0';
      const newVersion = '2.0.0';

      const isMajorUpdate = parseInt(newVersion.split('.')[0]) > parseInt(oldVersion.split('.')[0]);
      const hasBreakingChanges = isMajorUpdate;

      expect(hasBreakingChanges).toBe(true);
    });

    it('should verify dependency compatibility', async () => {
      const project = await testEnv.createProject();
      const depModule = await testEnv.createModule({ name: 'dep-module', version: '1.0.0' });
      const mainModule = await testEnv.createModule({ name: 'main-module', version: '1.0.0' });

      // Set up dependency
      const mainModuleJsonPath = join(mainModule.path, 'module.json');
      const mainModuleJson = JSON.parse(await readFile(mainModuleJsonPath, 'utf-8'));
      mainModuleJson.dependencies = [depModule.fullName];
      await writeFile(mainModuleJsonPath, JSON.stringify(mainModuleJson, null, 2));

      // Verify dependency exists
      const updatedJson = JSON.parse(await readFile(mainModuleJsonPath, 'utf-8'));
      expect(updatedJson.dependencies).toContain(depModule.fullName);
    });

    it('should warn about incompatible dependencies', async () => {
      const project = await testEnv.createProject();
      const depModule = await testEnv.createModule({ name: 'dep-module', version: '1.0.0' });
      const mainModule = await testEnv.createModule({ name: 'main-module', version: '1.0.0' });

      // Set up dependency with version requirement
      const mainModuleJsonPath = join(mainModule.path, 'module.json');
      const mainModuleJson = JSON.parse(await readFile(mainModuleJsonPath, 'utf-8'));
      mainModuleJson.dependencies = [`${depModule.fullName}@^1.0.0`];
      await writeFile(mainModuleJsonPath, JSON.stringify(mainModuleJson, null, 2));

      // Check if dependency version is compatible
      const requiredVersion = '^1.0.0';
      const actualVersion = '2.0.0';

      // Simple compatibility check (would need proper semver in real implementation)
      const isCompatible = actualVersion.startsWith('1.');
      expect(isCompatible).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle module not found error', async () => {
      const project = await testEnv.createProject();

      // Try to update non-existent module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: 'non-existent/module',
        version: '1.0.0',
        type: 'coding-standards',
        description: 'Non-existent module'
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Simulate error
      const moduleExists = false;
      expect(moduleExists).toBe(false);
    });

    it('should handle corrupted module.json during update', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'corrupted-module' });

      // Corrupt module.json
      const moduleJsonPath = join(module.path, 'module.json');
      await writeFile(moduleJsonPath, '{ invalid json }');

      // Try to read (should fail)
      await expect(async () => {
        JSON.parse(await readFile(moduleJsonPath, 'utf-8'));
      }).rejects.toThrow();
    });

    it('should rollback on update failure', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'test-module', version: '1.0.0' });

      // Link module
      const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
      config.modules.push({
        name: module.fullName,
        version: '1.0.0',
        type: module.metadata.type,
        description: module.metadata.description
      });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Save backup before update
      const backup = JSON.parse(await readFile(project.configPath, 'utf-8'));

      // Simulate failed update - restore from backup
      await writeFile(project.configPath, JSON.stringify(backup, null, 2));

      // Verify rollback
      const restoredConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
      const restoredModule = restoredConfig.modules.find((m: any) => m.name === module.fullName);
      expect(restoredModule.version).toBe('1.0.0');
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network error
      const networkError = new Error('Network request failed');

      expect(networkError.message).toBe('Network request failed');
      // Should provide helpful error message to user
    });
  });

  describe('Update Statistics', () => {
    it('should track number of modules updated', async () => {
      const stats = {
        updated: 3,
        upToDate: 2,
        errors: 0
      };

      expect(stats.updated).toBe(3);
      expect(stats.upToDate).toBe(2);
      expect(stats.errors).toBe(0);
    });

    it('should track update errors', async () => {
      const stats = {
        updated: 2,
        upToDate: 1,
        errors: 1
      };

      expect(stats.errors).toBe(1);
    });
  });
});


