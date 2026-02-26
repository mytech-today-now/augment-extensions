import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
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
  displayName?: string;
  tags?: string[];
  withRules?: boolean;
  withExamples?: boolean;
  augment?: {
    characterCount?: number;
    priority?: string;
    category?: string;
  };
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
export interface ITestEnvironment {
  tempDir: string;
  createProject(options?: ProjectOptions): Promise<TestProject>;
  createModule(options?: ModuleOptions): Promise<TestModule>;
  createCollection(options?: CollectionOptions): Promise<TestCollection>;
  linkModule(moduleNameOrPath: string, moduleName?: string, metadata?: any): Promise<void>;
  unlinkModule(moduleNameOrPath: string, moduleName?: string): Promise<void>;
  isModuleLinked(moduleName: string, projectPath?: string): Promise<boolean>;
  getLinkedModules(projectPath?: string): Promise<string[]>;
  cleanup(): Promise<void>;
  setup(): Promise<void>;
}

/**
 * Test environment class
 */
export class TestEnvironment implements ITestEnvironment {
  public tempDir: string = '';
  private cleanupTasks: (() => Promise<void>)[] = [];
  private defaultProjectPath: string = '';

  async setup(): Promise<void> {
    this.tempDir = await mkdtemp(join(tmpdir(), 'augment-test-'));
  }

  async createProject(options: ProjectOptions = {}): Promise<TestProject> {
    const projectPath = join(this.tempDir, options.name || 'test-project');
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

    // Set as default project if this is the first one
    if (!this.defaultProjectPath) {
      this.defaultProjectPath = projectPath;
    }

    // Track for cleanup
    this.cleanupTasks.push(async () => {
      await rm(projectPath, { recursive: true, force: true });
    });

    // Set as default project if first one
    if (!this.defaultProjectPath) {
      this.defaultProjectPath = projectPath;
    }

    return {
      path: projectPath,
      augmentDir,
      configPath
    };
  }

  async createModule(options: ModuleOptions = {}): Promise<TestModule> {
    const moduleName = options.name || 'test-module';
    const moduleType = options.type || 'coding-standards';
    const modulePath = join(this.tempDir, 'modules', moduleType, moduleName);

    // Create module directory
    await mkdir(modulePath, { recursive: true });

    // Create module.json
    const metadata: ModuleMetadata = {
      name: moduleName,
      version: options.version || '1.0.0',
      displayName: options.displayName || moduleName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: options.description || `Test module: ${moduleName}`,
      type: moduleType,
      tags: options.tags || ['test'],
      augment: options.augment || {
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

      // Add a sample rule file
      await writeFile(
        join(rulesDir, 'sample-rule.md'),
        `# Sample Rule\n\nThis is a sample rule for testing.`
      );
    }

    // Create examples directory if requested
    if (options.withExamples) {
      const examplesDir = join(modulePath, 'examples');
      await mkdir(examplesDir, { recursive: true });

      // Add a sample example file
      await writeFile(
        join(examplesDir, 'sample-example.ts'),
        `// Sample example\nexport const example = 'test';`
      );
    }

    return {
      path: modulePath,
      metadata,
      fullName: `${moduleType}/${moduleName}`
    };
  }

  async createCollection(options: CollectionOptions = {}): Promise<TestCollection> {
    const collectionName = options.name || 'test-collection';
    const collectionPath = join(this.tempDir, 'collections', collectionName);

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
  }

  async linkModule(moduleNameOrPath: string, moduleName?: string, metadata?: any): Promise<void> {
    // Support both signatures:
    // linkModule(moduleName) - uses default project
    // linkModule(projectPath, moduleName, metadata) - explicit project
    let projectPath: string;
    let actualModuleName: string;
    let actualMetadata: any;

    if (moduleName === undefined) {
      // Single parameter: use default project
      projectPath = this.defaultProjectPath;
      actualModuleName = moduleNameOrPath;
      actualMetadata = undefined;
    } else {
      // Two or three parameters: explicit project
      projectPath = moduleNameOrPath;
      actualModuleName = moduleName;
      actualMetadata = metadata;
    }

    if (!projectPath) {
      throw new Error('No project path available. Create a project first or provide a project path.');
    }

    const configPath = join(projectPath, '.augment', 'extensions.json');

    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (!config.modules) {
      config.modules = [];
    }

    // Check if module is already linked
    const existingIndex = config.modules.findIndex((m: any) =>
      typeof m === 'string' ? m === actualModuleName : m.name === actualModuleName
    );

    if (existingIndex === -1) {
      // Add module - support both string and object format
      if (actualMetadata) {
        config.modules.push({
          name: actualModuleName,
          version: actualMetadata.version || '1.0.0',
          type: actualMetadata.type || 'coding-standards',
          description: actualMetadata.description || ''
        });
      } else {
        config.modules.push(actualModuleName);
      }
      await writeFile(configPath, JSON.stringify(config, null, 2));
    }
  }

  async unlinkModule(moduleNameOrPath: string, moduleName?: string): Promise<void> {
    // Support both signatures:
    // unlinkModule(moduleName) - uses default project
    // unlinkModule(projectPath, moduleName) - explicit project
    let projectPath: string;
    let actualModuleName: string;

    if (moduleName === undefined) {
      // Single parameter: use default project
      projectPath = this.defaultProjectPath;
      actualModuleName = moduleNameOrPath;
    } else {
      // Two parameters: explicit project
      projectPath = moduleNameOrPath;
      actualModuleName = moduleName;
    }

    if (!projectPath) {
      return;
    }

    const configPath = join(projectPath, '.augment', 'extensions.json');

    if (!existsSync(configPath)) {
      return;
    }

    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (config.modules) {
      config.modules = config.modules.filter((m: any) =>
        typeof m === 'string' ? m !== actualModuleName : m.name !== actualModuleName
      );
      await writeFile(configPath, JSON.stringify(config, null, 2));
    }
  }

  async isModuleLinked(moduleName: string, projectPath?: string): Promise<boolean> {
    const targetPath = projectPath || this.defaultProjectPath;
    if (!targetPath) {
      return false;
    }

    const configPath = join(targetPath, '.augment', 'extensions.json');

    if (!existsSync(configPath)) {
      return false;
    }

    try {
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      if (!config.modules) {
        return false;
      }

      return config.modules.some((m: any) =>
        typeof m === 'string' ? m === moduleName : (m.name === moduleName || m.id === moduleName)
      );
    } catch {
      return false;
    }
  }

  async getLinkedModules(projectPath?: string): Promise<string[]> {
    const targetPath = projectPath || this.defaultProjectPath;
    if (!targetPath) {
      return [];
    }

    const configPath = join(targetPath, '.augment', 'extensions.json');

    if (!existsSync(configPath)) {
      return [];
    }

    try {
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      if (!config.modules) {
        return [];
      }

      // Return module names, handling both string and object formats
      // Support both 'name' and 'id' properties for compatibility
      return config.modules.map((m: any) =>
        typeof m === 'string' ? m : (m.name || m.id)
      );
    } catch {
      return [];
    }
  }

  async cleanup(): Promise<void> {
    // Run all cleanup tasks
    await Promise.all(this.cleanupTasks.map(task => task()));

    // Remove temp directory
    if (this.tempDir && existsSync(this.tempDir)) {
      await rm(this.tempDir, { recursive: true, force: true });
    }
  }
}

/**
 * Create a test environment with isolated temporary directory
 * @deprecated Use `new TestEnvironment()` and call `setup()` instead
 */
export async function createTestEnvironment(): Promise<ITestEnvironment> {
  const env = new TestEnvironment();
  await env.setup();
  return env;
}

