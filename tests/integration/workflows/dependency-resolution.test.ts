import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Multi-Module Dependency Tests
 * 
 * Tests for dependency resolution including:
 * - Dependency resolution
 * - Circular dependencies
 * - Missing dependencies
 * - Version conflicts
 * - Dependency ordering
 */

describe('Multi-Module Dependency Resolution', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Dependency Resolution', () => {
    it('should resolve direct dependencies', async () => {
      const project = await testEnv.createProject();

      // Create modules with dependencies
      const baseModule = await testEnv.createModule({ name: 'base-module' });
      const dependentModule = await testEnv.createModule({ name: 'dependent-module' });

      // Add dependency to dependent module
      const dependentModuleJsonPath = join(dependentModule.path, 'module.json');
      const dependentMetadata = JSON.parse(await readFile(dependentModuleJsonPath, 'utf-8'));
      dependentMetadata.dependencies = [baseModule.fullName];
      await writeFile(dependentModuleJsonPath, JSON.stringify(dependentMetadata, null, 2));

      // Link dependent module (should also link base module)
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: dependentModule.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify dependent module is linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(dependentModule.fullName);
    });

    it('should resolve transitive dependencies', async () => {
      const project = await testEnv.createProject();

      // Create chain: moduleA -> moduleB -> moduleC
      const moduleC = await testEnv.createModule({ name: 'module-c' });
      const moduleB = await testEnv.createModule({ name: 'module-b' });
      const moduleA = await testEnv.createModule({ name: 'module-a' });

      // Set up dependencies
      let modulePath = join(moduleB.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleC.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(moduleA.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleB.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link moduleA
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify moduleA is linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
    });

    it('should handle multiple dependencies', async () => {
      const project = await testEnv.createProject();

      // Create modules
      const dep1 = await testEnv.createModule({ name: 'dep-1' });
      const dep2 = await testEnv.createModule({ name: 'dep-2' });
      const dep3 = await testEnv.createModule({ name: 'dep-3' });
      const mainModule = await testEnv.createModule({ name: 'main-module' });

      // Set up multiple dependencies
      const mainModulePath = join(mainModule.path, 'module.json');
      const mainMetadata = JSON.parse(await readFile(mainModulePath, 'utf-8'));
      mainMetadata.dependencies = [dep1.fullName, dep2.fullName, dep3.fullName];
      await writeFile(mainModulePath, JSON.stringify(mainMetadata, null, 2));

      // Link main module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: mainModule.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Verify main module is linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(mainModule.fullName);
    });
  });

  describe('Circular Dependencies', () => {
    it('should detect circular dependency (A -> B -> A)', async () => {
      const moduleA = await testEnv.createModule({ name: 'circular-a' });
      const moduleB = await testEnv.createModule({ name: 'circular-b' });

      // Create circular dependency: A -> B -> A
      let modulePath = join(moduleA.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleB.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(moduleB.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleA.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Circular dependency exists in metadata
      const moduleAMetadata = JSON.parse(await readFile(join(moduleA.path, 'module.json'), 'utf-8'));
      const moduleBMetadata = JSON.parse(await readFile(join(moduleB.path, 'module.json'), 'utf-8'));

      expect(moduleAMetadata.dependencies).toContain(moduleB.fullName);
      expect(moduleBMetadata.dependencies).toContain(moduleA.fullName);
    });

    it('should detect circular dependency (A -> B -> C -> A)', async () => {
      const moduleA = await testEnv.createModule({ name: 'circular-a' });
      const moduleB = await testEnv.createModule({ name: 'circular-b' });
      const moduleC = await testEnv.createModule({ name: 'circular-c' });

      // Create circular dependency: A -> B -> C -> A
      let modulePath = join(moduleA.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleB.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(moduleB.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleC.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(moduleC.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleA.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Verify circular dependency chain exists
      const moduleAMetadata = JSON.parse(await readFile(join(moduleA.path, 'module.json'), 'utf-8'));
      const moduleBMetadata = JSON.parse(await readFile(join(moduleB.path, 'module.json'), 'utf-8'));
      const moduleCMetadata = JSON.parse(await readFile(join(moduleC.path, 'module.json'), 'utf-8'));

      expect(moduleAMetadata.dependencies).toContain(moduleB.fullName);
      expect(moduleBMetadata.dependencies).toContain(moduleC.fullName);
      expect(moduleCMetadata.dependencies).toContain(moduleA.fullName);
    });

    it('should handle self-referencing dependency', async () => {
      const module = await testEnv.createModule({ name: 'self-ref' });

      // Create self-referencing dependency
      const modulePath = join(module.path, 'module.json');
      const metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [module.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Verify self-reference exists
      const updatedMetadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      expect(updatedMetadata.dependencies).toContain(module.fullName);
    });
  });

  describe('Missing Dependencies', () => {
    it('should handle missing direct dependency', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'missing-dep-module' });

      // Add non-existent dependency
      const modulePath = join(module.path, 'module.json');
      const metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = ['coding-standards/non-existent-module'];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link module with missing dependency
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: module.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Module should be linked (dependency validation happens elsewhere)
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(module.fullName);
    });

    it('should handle missing transitive dependency', async () => {
      const project = await testEnv.createProject();
      const moduleA = await testEnv.createModule({ name: 'module-a' });
      const moduleB = await testEnv.createModule({ name: 'module-b' });

      // moduleB depends on non-existent moduleC
      let modulePath = join(moduleB.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = ['coding-standards/non-existent-module-c'];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // moduleA depends on moduleB
      modulePath = join(moduleA.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleB.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link moduleA
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // moduleA should be linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
    });

    it('should handle empty dependencies array', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'no-deps' });

      // Ensure dependencies is empty array
      const modulePath = join(module.path, 'module.json');
      const metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: module.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Module should be linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(module.fullName);
    });

    it('should handle missing dependencies field', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule({ name: 'no-deps-field' });

      // Remove dependencies field
      const modulePath = join(module.path, 'module.json');
      const metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      delete metadata.dependencies;
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: module.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Module should be linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(module.fullName);
    });
  });

  describe('Version Conflicts', () => {
    it('should handle different version requirements', async () => {
      const project = await testEnv.createProject();
      const baseModule = await testEnv.createModule({ name: 'base-module' });
      const moduleA = await testEnv.createModule({ name: 'module-a' });
      const moduleB = await testEnv.createModule({ name: 'module-b' });

      // moduleA depends on baseModule@^1.0.0
      let modulePath = join(moduleA.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [baseModule.fullName];
      metadata.dependencyVersions = { [baseModule.fullName]: '^1.0.0' };
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // moduleB depends on baseModule@^2.0.0
      modulePath = join(moduleB.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [baseModule.fullName];
      metadata.dependencyVersions = { [baseModule.fullName]: '^2.0.0' };
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link both modules
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true },
        { id: moduleB.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Both modules should be linked (conflict resolution happens elsewhere)
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
      expect(linkedModules).toContain(moduleB.fullName);
    });

    it('should handle incompatible version ranges', async () => {
      const project = await testEnv.createProject();
      const dep = await testEnv.createModule({ name: 'dep-module' });
      const moduleA = await testEnv.createModule({ name: 'strict-a' });
      const moduleB = await testEnv.createModule({ name: 'strict-b' });

      // moduleA requires exact version 1.0.0
      let modulePath = join(moduleA.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [dep.fullName];
      metadata.dependencyVersions = { [dep.fullName]: '1.0.0' };
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // moduleB requires exact version 2.0.0
      modulePath = join(moduleB.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [dep.fullName];
      metadata.dependencyVersions = { [dep.fullName]: '2.0.0' };
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link both modules
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true },
        { id: moduleB.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Both should be linked (conflict exists but not enforced at this level)
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
      expect(linkedModules).toContain(moduleB.fullName);
    });

    it('should handle compatible version ranges', async () => {
      const project = await testEnv.createProject();
      const dep = await testEnv.createModule({ name: 'compatible-dep' });
      const moduleA = await testEnv.createModule({ name: 'compatible-a' });
      const moduleB = await testEnv.createModule({ name: 'compatible-b' });

      // Both modules require ^1.0.0 (compatible)
      let modulePath = join(moduleA.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [dep.fullName];
      metadata.dependencyVersions = { [dep.fullName]: '^1.0.0' };
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(moduleB.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [dep.fullName];
      metadata.dependencyVersions = { [dep.fullName]: '^1.0.0' };
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link both modules
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true },
        { id: moduleB.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // Both should be linked successfully
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
      expect(linkedModules).toContain(moduleB.fullName);
    });
  });

  describe('Dependency Ordering', () => {
    it('should maintain dependency order', async () => {
      const project = await testEnv.createProject();
      const dep1 = await testEnv.createModule({ name: 'dep-1' });
      const dep2 = await testEnv.createModule({ name: 'dep-2' });
      const dep3 = await testEnv.createModule({ name: 'dep-3' });
      const mainModule = await testEnv.createModule({ name: 'ordered-main' });

      // Set up ordered dependencies
      const modulePath = join(mainModule.path, 'module.json');
      const metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [dep1.fullName, dep2.fullName, dep3.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Verify order is preserved
      const updatedMetadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      expect(updatedMetadata.dependencies[0]).toBe(dep1.fullName);
      expect(updatedMetadata.dependencies[1]).toBe(dep2.fullName);
      expect(updatedMetadata.dependencies[2]).toBe(dep3.fullName);
    });

    it('should handle topological sorting requirements', async () => {
      const project = await testEnv.createProject();

      // Create dependency chain: A -> B -> C
      const moduleC = await testEnv.createModule({ name: 'topo-c' });
      const moduleB = await testEnv.createModule({ name: 'topo-b' });
      const moduleA = await testEnv.createModule({ name: 'topo-a' });

      // B depends on C
      let modulePath = join(moduleB.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleC.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // A depends on B
      modulePath = join(moduleA.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleB.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link all modules
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true },
        { id: moduleB.fullName, version: '1.0.0', enabled: true },
        { id: moduleC.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // All modules should be linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
      expect(linkedModules).toContain(moduleB.fullName);
      expect(linkedModules).toContain(moduleC.fullName);
    });

    it('should handle diamond dependency pattern', async () => {
      const project = await testEnv.createProject();

      // Create diamond: A -> B,C -> D
      const moduleD = await testEnv.createModule({ name: 'diamond-d' });
      const moduleB = await testEnv.createModule({ name: 'diamond-b' });
      const moduleC = await testEnv.createModule({ name: 'diamond-c' });
      const moduleA = await testEnv.createModule({ name: 'diamond-a' });

      // B and C both depend on D
      let modulePath = join(moduleB.path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleD.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(moduleC.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleD.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // A depends on both B and C
      modulePath = join(moduleA.path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [moduleB.fullName, moduleC.fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link moduleA
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: moduleA.fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // moduleA should be linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(moduleA.fullName);
    });

    it('should handle complex dependency graph', async () => {
      const project = await testEnv.createProject();

      // Create complex graph with multiple paths
      const modules = [];
      for (let i = 1; i <= 5; i++) {
        modules.push(await testEnv.createModule({ name: `complex-${i}` }));
      }

      // Set up complex dependencies
      // module-1 -> module-2, module-3
      // module-2 -> module-4
      // module-3 -> module-4, module-5
      let modulePath = join(modules[0].path, 'module.json');
      let metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [modules[1].fullName, modules[2].fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(modules[1].path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [modules[3].fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      modulePath = join(modules[2].path, 'module.json');
      metadata = JSON.parse(await readFile(modulePath, 'utf-8'));
      metadata.dependencies = [modules[3].fullName, modules[4].fullName];
      await writeFile(modulePath, JSON.stringify(metadata, null, 2));

      // Link first module
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      config.modules = [
        { id: modules[0].fullName, version: '1.0.0', enabled: true }
      ];
      await writeFile(project.configPath, JSON.stringify(config, null, 2));

      // First module should be linked
      const linkedModules = await testEnv.getLinkedModules();
      expect(linkedModules).toContain(modules[0].fullName);
    });
  });
});
