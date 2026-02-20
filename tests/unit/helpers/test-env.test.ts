import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, type TestEnvironment } from '@tests/helpers/test-env';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('Test Environment', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('createTestEnvironment', () => {
    it('should create isolated temp directory', () => {
      expect(testEnv.tempDir).toBeDefined();
      expect(testEnv.tempDir).toContain('augment-test-');
      expect(existsSync(testEnv.tempDir)).toBe(true);
    });

    it('should cleanup temp directory', async () => {
      const tempDir = testEnv.tempDir;
      await testEnv.cleanup();
      expect(existsSync(tempDir)).toBe(false);
    });
  });

  describe('createProject', () => {
    it('should create project with .augment directory', async () => {
      const project = await testEnv.createProject();
      
      expect(existsSync(project.path)).toBe(true);
      expect(existsSync(project.augmentDir)).toBe(true);
      expect(existsSync(project.configPath)).toBe(true);
    });

    it('should create valid extensions.json', async () => {
      const project = await testEnv.createProject({ version: '2.0.0' });
      
      const configContent = await readFile(project.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      expect(config.version).toBe('2.0.0');
      expect(config.modules).toEqual([]);
    });

    it('should create project with custom name', async () => {
      const project = await testEnv.createProject({ name: 'my-project' });
      
      expect(project.path).toContain('my-project');
      expect(existsSync(project.path)).toBe(true);
    });

    it('should create project without .augment directory when requested', async () => {
      const project = await testEnv.createProject({ withAugmentDir: false });
      
      expect(existsSync(project.path)).toBe(true);
      expect(existsSync(project.augmentDir)).toBe(false);
    });
  });

  describe('createModule', () => {
    it('should create module with valid structure', async () => {
      const module = await testEnv.createModule({ name: 'test-module' });
      
      expect(existsSync(module.path)).toBe(true);
      expect(existsSync(join(module.path, 'module.json'))).toBe(true);
      expect(existsSync(join(module.path, 'README.md'))).toBe(true);
    });

    it('should create valid module.json', async () => {
      const module = await testEnv.createModule({
        name: 'my-module',
        version: '2.0.0',
        type: 'domain-rules',
        description: 'Custom description'
      });
      
      expect(module.metadata.name).toBe('my-module');
      expect(module.metadata.version).toBe('2.0.0');
      expect(module.metadata.type).toBe('domain-rules');
      expect(module.metadata.description).toBe('Custom description');
      expect(module.fullName).toBe('domain-rules/my-module');
    });

    it('should create rules directory when requested', async () => {
      const module = await testEnv.createModule({ withRules: true });
      
      expect(existsSync(join(module.path, 'rules'))).toBe(true);
    });

    it('should create examples directory when requested', async () => {
      const module = await testEnv.createModule({ withExamples: true });
      
      expect(existsSync(join(module.path, 'examples'))).toBe(true);
    });
  });

  describe('createCollection', () => {
    it('should create collection with valid structure', async () => {
      const collection = await testEnv.createCollection({ name: 'test-collection' });
      
      expect(existsSync(collection.path)).toBe(true);
      expect(existsSync(join(collection.path, 'collection.json'))).toBe(true);
    });

    it('should create collection with modules', async () => {
      const collection = await testEnv.createCollection({
        name: 'my-collection',
        modules: ['coding-standards/typescript', 'domain-rules/api']
      });
      
      const collectionContent = await readFile(join(collection.path, 'collection.json'), 'utf-8');
      const collectionData = JSON.parse(collectionContent);
      
      expect(collectionData.modules).toHaveLength(2);
      expect(collectionData.modules[0].id).toBe('coding-standards/typescript');
      expect(collectionData.modules[1].id).toBe('domain-rules/api');
    });
  });

  describe('cleanup', () => {
    it('should remove all created resources', async () => {
      const project = await testEnv.createProject();
      const module = await testEnv.createModule();
      const collection = await testEnv.createCollection();
      
      const projectPath = project.path;
      const modulePath = module.path;
      const collectionPath = collection.path;
      
      await testEnv.cleanup();
      
      expect(existsSync(projectPath)).toBe(false);
      expect(existsSync(modulePath)).toBe(false);
      expect(existsSync(collectionPath)).toBe(false);
    });

    it('should not throw on multiple cleanup calls', async () => {
      await testEnv.cleanup();
      await expect(testEnv.cleanup()).resolves.not.toThrow();
    });
  });
});

