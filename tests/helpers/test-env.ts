import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { ModuleMetadata } from '@cli/utils/module-system';

/**
 * Options for creating a test project
 */
export interface ProjectOptions {
  name?: string;
  version?: string;
  withAugmentDir?: boolean;
}

/**
 * Options for creating a test module
 */
export interface ModuleOptions {
  name?: string;
  version?: string;
  type?: 'coding-standards' | 'domain-rules' | 'workflows' | 'examples';
  description?: string;
  withRules?: boolean;
  withExamples?: boolean;
}

/**
 * Options for creating a test collection
 */
export interface CollectionOptions {
  name?: string;
  version?: string;
  modules?: string[];
}

/**
 * Test project structure
 */
export interface TestProject {
  path: string;
  augmentDir: string;
  configPath: string;
}

/**
 * Test module structure
 */
export interface TestModule {
  path: string;
  metadata: ModuleMetadata;
  fullName: string;
}

/**
 * Test collection structure
 */
export interface TestCollection {
  path: string;
  name: string;
  modules: string[];
}

/**
 * Test environment interface
 */
export interface TestEnvironment {
  tempDir: string;
  createProject(options?: ProjectOptions): Promise<TestProject>;
  createModule(options?: ModuleOptions): Promise<TestModule>;
  createCollection(options?: CollectionOptions): Promise<TestCollection>;
  isModuleLinked(moduleName: string): Promise<boolean>;
  getLinkedModules(): Promise<string[]>;
  cleanup(): Promise<void>;
}

/**
 * Create a test environment with isolated temporary directory
 */
export async function createTestEnvironment(): Promise<TestEnvironment> {
  const tempDir = await mkdtemp(join(tmpdir(), 'augment-test-'));
  const cleanupTasks: (() => Promise<void>)[] = [];

  return {
    tempDir,

    async createProject(options: ProjectOptions = {}): Promise<TestProject> {
      const projectPath = join(tempDir, options.name || 'test-project');
      const augmentDir = join(projectPath, '.augment');
      const configPath = join(augmentDir, 'extensions.json');

      // Create project directory
      await mkdir(projectPath, { recursive: true });

      // Create .augment directory if requested
      if (options.withAugmentDir !== false) {
        await mkdir(augmentDir, { recursive: true });

        // Create extensions.json
        const config = {
          version: options.version || '1.0.0',
          modules: []
        };
        await writeFile(configPath, JSON.stringify(config, null, 2));
      }

      // Track for cleanup
      cleanupTasks.push(async () => {
        await rm(projectPath, { recursive: true, force: true });
      });

      return {
        path: projectPath,
        augmentDir,
        configPath
      };
    },

    async createModule(options: ModuleOptions = {}): Promise<TestModule> {
      const moduleName = options.name || 'test-module';
      const moduleType = options.type || 'coding-standards';
      const modulePath = join(tempDir, 'modules', moduleType, moduleName);

      // Create module directory
      await mkdir(modulePath, { recursive: true });

      // Create module.json
      const metadata: ModuleMetadata = {
        name: moduleName,
        version: options.version || '1.0.0',
        displayName: moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: options.description || `Test module: ${moduleName}`,
        type: moduleType,
        tags: ['test'],
        augment: {
          characterCount: 1000,
          priority: 'medium',
          category: moduleType
        }
      };

      await writeFile(
        join(modulePath, 'module.json'),
        JSON.stringify(metadata, null, 2)
      );

      // Create README.md
      await writeFile(
        join(modulePath, 'README.md'),
        `# ${metadata.displayName}\n\n${metadata.description}`
      );

      // Create rules directory if requested
      if (options.withRules) {
        const rulesDir = join(modulePath, 'rules');
        await mkdir(rulesDir, { recursive: true });
      }

      // Create examples directory if requested
      if (options.withExamples) {
        const examplesDir = join(modulePath, 'examples');
        await mkdir(examplesDir, { recursive: true });
      }

      return {
        path: modulePath,
        metadata,
        fullName: `${moduleType}/${moduleName}`
      };
    },

    async createCollection(options: CollectionOptions = {}): Promise<TestCollection> {
      const collectionName = options.name || 'test-collection';
      const collectionPath = join(tempDir, 'collections', collectionName);

      // Create collection directory
      await mkdir(collectionPath, { recursive: true });

      // Create collection.json
      const collection = {
        name: collectionName,
        version: options.version || '1.0.0',
        displayName: collectionName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Test collection: ${collectionName}`,
        type: 'collection',
        modules: (options.modules || []).map(m => ({
          id: m,
          version: '^1.0.0',
          required: true
        }))
      };

      await writeFile(
        join(collectionPath, 'collection.json'),
        JSON.stringify(collection, null, 2)
      );

      return {
        path: collectionPath,
        name: collectionName,
        modules: options.modules || []
      };
    },

    async isModuleLinked(moduleName: string): Promise<boolean> {
      // Implementation would check extensions.json in a project
      return false;
    },

    async getLinkedModules(): Promise<string[]> {
      // Implementation would read extensions.json
      return [];
    },

    async cleanup(): Promise<void> {
      // Run all cleanup tasks
      await Promise.all(cleanupTasks.map(task => task()));
      
      // Remove temp directory
      await rm(tempDir, { recursive: true, force: true });
    }
  };
}

