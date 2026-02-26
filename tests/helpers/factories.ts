import type { ModuleMetadata } from '@cli/utils/module-system';
import type { ITestEnvironment, TestProject, TestModule, TestCollection } from './test-env';

// Re-export TestEnvironment class for tests
export { TestEnvironment } from './test-env';

/**
 * Factory for creating test modules
 */
export class ModuleFactory {
  /**
   * Create a module with default or custom properties
   */
  static create(overrides?: Partial<ModuleMetadata>): ModuleMetadata {
    return {
      name: 'test-module',
      version: '1.0.0',
      displayName: 'Test Module',
      description: 'A test module for testing purposes',
      type: 'coding-standards',
      tags: ['test', 'example'],
      augment: {
        characterCount: 5000,
        priority: 'medium',
        category: 'coding-standards'
      },
      ...overrides
    };
  }

  /**
   * Create multiple modules
   */
  static createMany(count: number, overrides?: Partial<ModuleMetadata>): ModuleMetadata[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        name: `test-module-${i}`,
        displayName: `Test Module ${i}`,
        ...overrides
      })
    );
  }

  /**
   * Create an invalid module (missing required field)
   */
  static createInvalid(invalidField: keyof ModuleMetadata): Partial<ModuleMetadata> {
    const module = this.create();
    const invalid = { ...module };
    delete (invalid as any)[invalidField];
    return invalid;
  }

  /**
   * Create a module with specific type
   */
  static createByType(type: ModuleMetadata['type']): ModuleMetadata {
    return this.create({ type });
  }

  /**
   * Create a high-priority module
   */
  static createHighPriority(): ModuleMetadata {
    return this.create({
      augment: {
        characterCount: 10000,
        priority: 'high',
        category: 'coding-standards'
      }
    });
  }

  /**
   * Create a module with large character count
   */
  static createLarge(): ModuleMetadata {
    return this.create({
      augment: {
        characterCount: 50000,
        priority: 'high',
        category: 'coding-standards'
      }
    });
  }

  /**
   * Create a valid module (alias for create)
   * @deprecated Use create() instead
   */
  static createValidModule(overrides?: Partial<ModuleMetadata>): ModuleMetadata {
    return this.create(overrides);
  }
}

/**
 * Factory for creating test collections
 */
export class CollectionFactory {
  /**
   * Create a collection with default or custom properties
   */
  static create(overrides?: Partial<any>): any {
    return {
      name: 'test-collection',
      version: '1.0.0',
      displayName: 'Test Collection',
      description: 'A test collection for testing purposes',
      type: 'collection',
      modules: [],
      ...overrides
    };
  }

  /**
   * Create a collection with specific modules
   */
  static withModules(moduleNames: string[]): any {
    return this.create({
      modules: moduleNames.map(name => ({
        id: name,
        version: '^1.0.0',
        required: true
      }))
    });
  }

  /**
   * Create multiple collections
   */
  static createMany(count: number, overrides?: Partial<any>): any[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        name: `test-collection-${i}`,
        displayName: `Test Collection ${i}`,
        ...overrides
      })
    );
  }

  /**
   * Create an invalid collection (missing required field)
   */
  static createInvalid(invalidField: string): Partial<any> {
    const collection = this.create();
    const invalid = { ...collection };
    delete (invalid as any)[invalidField];
    return invalid;
  }
}

/**
 * Factory for creating test projects
 */
export class ProjectFactory {
  /**
   * Create a test project
   */
  static async create(
    testEnv: ITestEnvironment,
    options?: { name?: string; version?: string }
  ): Promise<TestProject> {
    return await testEnv.createProject(options);
  }

  /**
   * Create a project with linked modules
   */
  static async withLinkedModules(
    testEnv: ITestEnvironment,
    moduleNames: string[]
  ): Promise<TestProject> {
    const project = await testEnv.createProject();

    // Link the modules
    for (const moduleName of moduleNames) {
      await testEnv.linkModule(project.path, moduleName);
    }

    return project;
  }

  /**
   * Create multiple projects
   */
  static async createMany(
    testEnv: ITestEnvironment,
    count: number
  ): Promise<TestProject[]> {
    const projects: TestProject[] = [];
    for (let i = 0; i < count; i++) {
      projects.push(await testEnv.createProject({ name: `project-${i}` }));
    }
    return projects;
  }
}

