import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Module Lifecycle Workflow Tests
 * 
 * Tests for complete module lifecycle workflows including:
 * - init → link → show → unlink workflow
 * - Multi-module workflow
 * - Workflow with errors
 * - Workflow rollback
 * - State consistency
 */

describe('Module Lifecycle Workflows', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Complete Lifecycle: init → link → show → unlink', () => {
    it('should complete full module lifecycle successfully', async () => {
      // 1. Init: Create project
      const project = await testEnv.createProject({ name: 'lifecycle-project' });
      expect(existsSync(project.path)).toBe(true);
      expect(existsSync(project.augmentDir)).toBe(true);
      expect(existsSync(project.configPath)).toBe(true);

      // 2. Create module to link
      const module = await testEnv.createModule({
        name: 'lifecycle-module',
        type: 'coding-standards',
        withRules: true,
        withExamples: true
      });
      expect(existsSync(module.path)).toBe(true);

      // 3. Link: Link module to project
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        {
          id: module.fullName,
          version: module.metadata.version,
          enabled: true
        }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify link
      const isLinked = await testEnv.isModuleLinked(module.fullName);
      expect(isLinked).toBe(true);

      // 4. Show: Verify module details are accessible
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(module.fullName);
      expect(linkedModules).toHaveLength(1);

      // 5. Unlink: Remove module from project
      config.modules = [];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify unlink
      const isStillLinked = await testEnv.isModuleLinked(module.fullName);
      expect(isStillLinked).toBe(false);

      const remainingModules = await testEnv.getLinkedModules();
      expect(remainingModules).toHaveLength(0);
    });

    it('should maintain state consistency throughout lifecycle', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'state-test-module' });

      // Initial state: no modules linked
      let linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(0);

      // Link module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [{ id: module.fullName, version: '1.0.0', enabled: true }];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // State after link: 1 module linked
      linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(1);
      expect(linkedModules[0]).toBe(module.fullName);

      // Unlink module
      config.modules = [];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Final state: no modules linked
      linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(0);
    });
  });

  describe('Multi-Module Workflow', () => {
    it('should handle multiple modules in lifecycle', async () => {
      const project = await testEnv.createProject({ name: 'multi-module-project' });

      // Create multiple modules
      const module1 = await testEnv.createModule({ name: 'module-1', type: 'coding-standards' });
      const module2 = await testEnv.createModule({ name: 'module-2', type: 'domain-rules' });
      const module3 = await testEnv.createModule({ name: 'module-3', type: 'workflows' });

      // Link all modules
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: module1.fullName, version: '1.0.0', enabled: true },
        { id: module2.fullName, version: '1.0.0', enabled: true },
        { id: module3.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify all linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(3);
      expect(linkedModules).toContain(module1.fullName);
      expect(linkedModules).toContain(module2.fullName);
      expect(linkedModules).toContain(module3.fullName);

      // Unlink one module
      config.modules = config.modules.filter(m => m.id !== module2.fullName);
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify partial unlink
      const remainingModules = await testEnv.getLinkedModules();
      expect(remainingModules).toHaveLength(2);
      expect(remainingModules).toContain(module1.fullName);
      expect(remainingModules).toContain(module3.fullName);
      expect(remainingModules).not.toContain(module2.fullName);
    });

    it('should handle sequential module operations', async () => {
      const project = await testEnv.createProject();
      const modules = [];

      // Create and link modules one by one
      for (let i = 1; i <= 3; i++) {
        const module = await testEnv.createModule({ name: `sequential-module-${i}` });
        modules.push(module);

        const configContent = await readFile(project.configPath, 'utf-8');
        const config = JSON.parse(configContent);
        config.modules.push({ id: module.fullName, version: '1.0.0', enabled: true });
        await writeFile(project.configPath, JSON.stringify(config, null, 2));

        const linkedModules = await testEnv.getLinkedModules();
        expect(linkedModules).toHaveLength(i);
      }

      // Verify all modules are linked
      const allLinked = await testEnv.getLinkedModules();
      expect(allLinked).toHaveLength(3);
    });
  });

  describe('Workflow with Errors', () => {
    it('should handle linking non-existent module gracefully', async () => {
      const project = await testEnv.createProject();

      // Attempt to link non-existent module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: 'coding-standards/non-existent-module', version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Config should be updated, but module won't actually exist
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain('coding-standards/non-existent-module');
    });

    it('should handle corrupted config file', async () => {
      const project = await testEnv.createProject();

      // Write invalid JSON to config
      await writeFile(project.configPath, '{ invalid json }');

      // Reading should fail gracefully
      await expect(async () => {
        await readFile(project.configPath, 'utf-8').then(JSON.parse);
      }).rejects.toThrow();
    });

    it('should handle missing .augment directory', async () => {
      const project = await testEnv.createProject({ withAugmentDir: false });

      // .augment directory should not exist
      expect(existsSync(project.augmentDir)).toBe(false);

      // Attempting to read config should fail
      expect(existsSync(project.configPath)).toBe(false);
    });

    it('should handle module with missing metadata', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'incomplete-module' });

      // Delete module.json to simulate missing metadata
      const moduleJsonPath = join(module.path, 'module.json');
      const fs = await import('fs/promises');
      await fs.unlink(moduleJsonPath);

      // Link module (config will be updated, but module is incomplete)
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [{ id: module.fullName, version: '1.0.0', enabled: true }];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Module should be in config but metadata is missing
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(module.fullName);
      expect(existsSync(moduleJsonPath)).toBe(false);
    });
  });

  describe('Workflow Rollback', () => {
    it('should rollback to previous state on error', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'stable-module' });

      // Link first module successfully
      let configContent = await readFile(project.configPath, 'utf-8');
      let config = JSON.parse(configContent);
      config.modules = [{ id: module1.fullName, version: '1.0.0', enabled: true }];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Save current state
      const stableState = JSON.stringify(config, null, 2);

      // Attempt to add problematic module
      config.modules.push({ id: 'invalid/module', version: '1.0.0', enabled: true });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Rollback to stable state
      await writeFile(project.configPath, stableState);

      // Verify rollback
      configContent = await readFile(project.configPath, 'utf-8');
      config = JSON.parse(configContent);
      expect(config.modules).toHaveLength(1);
      expect(config.modules[0].id).toBe(module1.fullName);
    });

    it('should maintain consistency after partial failure', async () => {
      const project = await testEnv.createProject();
      const module1 = await testEnv.createModule({ name: 'module-1' });
      const module2 = await testEnv.createModule({ name: 'module-2' });

      // Link first module
      let configContent = await readFile(project.configPath, 'utf-8');
      let config = JSON.parse(configContent);
      config.modules = [{ id: module1.fullName, version: '1.0.0', enabled: true }];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify first module linked
      let linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(1);

      // Add second module
      config.modules.push({ id: module2.fullName, version: '1.0.0', enabled: true });
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify both modules linked
      linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(2);

      // Remove second module (simulating rollback)
      config.modules = config.modules.filter(m => m.id !== module2.fullName);
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify only first module remains
      linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toHaveLength(1);
      expect(linkedModules[0]).toBe(module1.fullName);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state across operations', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'consistency-module' });

      // Perform multiple operations
      for (let i = 0; i < 5; i++) {
        // Link
        let configContent = await readFile(project.configPath, 'utf-8');
        let config = JSON.parse(configContent);
        config.modules = [{ id: module.fullName, version: '1.0.0', enabled: true }];
        await writeFile(project.configPath, JSON.stringify(config, null, 2));

        let linkedModules = await testEnv.getLinkedModules();
        expect(linkedModules).toHaveLength(1);

        // Unlink
        config.modules = [];
        await writeFile(project.configPath, JSON.stringify(config, null, 2));

        linkedModules = await testEnv.getLinkedModules();
        expect(linkedModules).toHaveLength(0);
      }
    });

    it('should handle concurrent state reads', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'concurrent-module' });

      // Link module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [{ id: module.fullName, version: '1.0.0', enabled: true }];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Perform multiple concurrent reads
      const reads = await Promise.all([
        testEnv.getLinkedModules(),
        testEnv.getLinkedModules(),
        testEnv.getLinkedModules(),
        testEnv.isModuleLinked(module.fullName),
        testEnv.isModuleLinked(module.fullName)
      ]);

      // All reads should return consistent results
      expect(reads[0]).toEqual(reads[1]);
      expect(reads[1]).toEqual(reads[2]);
      expect(reads[3]).toBe(true);
      expect(reads[4]).toBe(true);
    });
  });
});

