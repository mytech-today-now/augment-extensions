import { expect } from 'vitest';
import type { ModuleMetadata } from '@cli/utils/module-system';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Custom matcher to check if an object is a valid module
 */
export function toBeValidModule(received: any) {
  const requiredFields = ['name', 'version', 'displayName', 'description', 'type'];
  const missingFields = requiredFields.filter(field => !(field in received));

  if (missingFields.length > 0) {
    return {
      pass: false,
      message: () => `Expected object to be a valid module, but missing required fields: ${missingFields.join(', ')}`
    };
  }

  const validTypes = ['coding-standards', 'domain-rules', 'workflows', 'examples', 'marketing-standards', 'writing-standards', 'themes'];
  if (!validTypes.includes(received.type)) {
    return {
      pass: false,
      message: () => `Expected module type to be one of [${validTypes.join(', ')}], but got: ${received.type}`
    };
  }

  return {
    pass: true,
    message: () => 'Expected object not to be a valid module'
  };
}

/**
 * Custom matcher to check if a project has a linked module
 */
export async function toHaveLinkedModule(projectPath: string, moduleName: string) {
  const configPath = join(projectPath, '.augment', 'extensions.json');

  if (!existsSync(configPath)) {
    return {
      pass: false,
      message: () => `Expected project at ${projectPath} to have .augment/extensions.json, but it doesn't exist`
    };
  }

  try {
    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const hasModule = config.modules?.some((m: any) => 
      m.name === moduleName || m.name.endsWith(`/${moduleName}`)
    );

    if (hasModule) {
      return {
        pass: true,
        message: () => `Expected project not to have module ${moduleName} linked`
      };
    } else {
      return {
        pass: false,
        message: () => `Expected project to have module ${moduleName} linked, but it's not in the modules list`
      };
    }
  } catch (error) {
    return {
      pass: false,
      message: () => `Failed to read or parse extensions.json: ${error instanceof Error ? error.message : error}`
    };
  }
}

/**
 * Custom matcher to check if a collection has a specific module
 */
export async function toHaveCollection(collectionPath: string, moduleName: string) {
  const collectionJsonPath = join(collectionPath, 'collection.json');

  if (!existsSync(collectionJsonPath)) {
    return {
      pass: false,
      message: () => `Expected collection at ${collectionPath} to have collection.json, but it doesn't exist`
    };
  }

  try {
    const collectionContent = await readFile(collectionJsonPath, 'utf-8');
    const collection = JSON.parse(collectionContent);

    const hasModule = collection.modules?.some((m: any) => 
      m.id === moduleName || m.id.endsWith(`/${moduleName}`)
    );

    if (hasModule) {
      return {
        pass: true,
        message: () => `Expected collection not to have module ${moduleName}`
      };
    } else {
      return {
        pass: false,
        message: () => `Expected collection to have module ${moduleName}, but it's not in the modules list`
      };
    }
  } catch (error) {
    return {
      pass: false,
      message: () => `Failed to read or parse collection.json: ${error instanceof Error ? error.message : error}`
    };
  }
}

/**
 * Extend Vitest matchers
 */
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidModule(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidModule(): any;
  }
}

/**
 * Register custom matchers
 */
export function registerMatchers() {
  expect.extend({
    toBeValidModule
  });
}

