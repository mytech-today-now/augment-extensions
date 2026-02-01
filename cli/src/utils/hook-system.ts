/**
 * Hook System for Augment Extensions
 * Provides pre/post inspection hooks with error handling
 */

import { Hook, HookType, HookContext } from './plugin-system';

/**
 * Hook execution result
 */
export interface HookExecutionResult {
  success: boolean;
  hookId: string;
  error?: Error;
  executionTime: number;
}

/**
 * Base hook class
 */
export abstract class BaseHook implements Hook {
  abstract id: string;
  abstract type: HookType;
  priority: number = 0;

  /**
   * Execute the hook
   */
  abstract execute(context: HookContext): Promise<void> | void;
}

/**
 * Pre-inspection hook - runs before module inspection
 */
export class PreInspectionHook extends BaseHook {
  id = 'pre-inspection-default';
  type: HookType = 'pre-inspection';
  priority = 0;

  async execute(context: HookContext): Promise<void> {
    // Default pre-inspection logic
    if (context.module) {
      console.log(`Starting inspection of module: ${context.module.fullName || context.module.name}`);
    }
  }
}

/**
 * Post-inspection hook - runs after module inspection
 */
export class PostInspectionHook extends BaseHook {
  id = 'post-inspection-default';
  type: HookType = 'post-inspection';
  priority = 0;

  async execute(context: HookContext): Promise<void> {
    // Default post-inspection logic
    if (context.module) {
      console.log(`Completed inspection of module: ${context.module.fullName || context.module.name}`);
    }

    if (context.error) {
      console.error(`Inspection failed with error: ${context.error.message}`);
    }
  }
}

/**
 * Pre-load hook - runs before plugin/module loading
 */
export class PreLoadHook extends BaseHook {
  id = 'pre-load-default';
  type: HookType = 'pre-load';
  priority = 0;

  async execute(context: HookContext): Promise<void> {
    // Default pre-load logic
    console.log('Loading plugins and modules...');
  }
}

/**
 * Post-load hook - runs after plugin/module loading
 */
export class PostLoadHook extends BaseHook {
  id = 'post-load-default';
  type: HookType = 'post-load';
  priority = 0;

  async execute(context: HookContext): Promise<void> {
    // Default post-load logic
    console.log('Plugins and modules loaded successfully');
  }
}

/**
 * Hook manager for executing hooks with error handling
 */
export class HookManager {
  /**
   * Execute a single hook with error handling
   */
  async executeHook(hook: Hook, context: HookContext): Promise<HookExecutionResult> {
    const startTime = Date.now();

    try {
      await hook.execute(context);

      return {
        success: true,
        hookId: hook.id,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        success: false,
        hookId: hook.id,
        error: err,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute multiple hooks in sequence
   */
  async executeHooks(hooks: Hook[], context: HookContext): Promise<HookExecutionResult[]> {
    const results: HookExecutionResult[] = [];

    for (const hook of hooks) {
      const result = await this.executeHook(hook, context);
      results.push(result);

      // If a hook fails, store the error in context but continue
      if (!result.success && result.error) {
        context.error = result.error;
      }
    }

    return results;
  }

  /**
   * Execute hooks with timeout
   */
  async executeHooksWithTimeout(
    hooks: Hook[],
    context: HookContext,
    timeout: number = 5000
  ): Promise<HookExecutionResult[]> {
    const timeoutPromise = new Promise<HookExecutionResult[]>((_, reject) => {
      setTimeout(() => reject(new Error(`Hook execution timed out after ${timeout}ms`)), timeout);
    });

    const executionPromise = this.executeHooks(hooks, context);

    try {
      return await Promise.race([executionPromise, timeoutPromise]);
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Global hook manager instance
 */
export const hookManager = new HookManager();

