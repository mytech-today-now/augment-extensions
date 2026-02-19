/**
 * AI Prompt Generator for C Coding Standards
 * 
 * Generates context-aware prompts for AI code generation by combining
 * templates with active rules and examples.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { TemplateEngine, TemplateContext } from './template-engine';
import { RuleRegistry } from './registry';
import { ConfigurationManager } from './config-manager';
import { Category, Rule, Configuration } from './types';

export interface PromptContext {
  filePath?: string;
  fileType?: string;
  category?: Category;
  functionName?: string;
  codeContext?: string;
}

export interface GeneratedPrompt {
  prompt: string;
  category: Category;
  activeRules: Rule[];
  templateUsed: string;
}

export class PromptGenerator {
  private templateEngine: TemplateEngine;
  private templateCache: Map<Category, string> = new Map();
  private promptCache: Map<string, GeneratedPrompt> = new Map();
  private cacheEnabled: boolean = true;

  constructor(
    private ruleRegistry: RuleRegistry,
    private configManager: ConfigurationManager,
    private templatesPath: string
  ) {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate a prompt for the given context
   */
  async generatePrompt(context: PromptContext): Promise<GeneratedPrompt> {
    // Detect category from context
    const category = this.detectCategory(context);

    // Check cache
    const cacheKey = this.getCacheKey(context, category);
    if (this.cacheEnabled && this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!;
    }

    // Load template for category
    const template = await this.loadTemplate(category);

    // Get active rules for category
    const activeRules = this.getActiveRulesForCategory(category);

    // Build template context
    const templateContext = this.buildTemplateContext(
      category,
      activeRules,
      context
    );

    // Render prompt
    const prompt = this.templateEngine.render(template, templateContext);

    const result: GeneratedPrompt = {
      prompt,
      category,
      activeRules,
      templateUsed: `${category}.txt`
    };

    // Cache result
    if (this.cacheEnabled) {
      this.promptCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Detect category from context
   */
  private detectCategory(context: PromptContext): Category {
    // If category explicitly provided, use it
    if (context.category) {
      return context.category;
    }

    // Detect from file path
    if (context.filePath) {
      const filePath = context.filePath.toLowerCase();
      
      if (filePath.includes('kernel') || filePath.includes('module')) {
        return 'kernel';
      }
      if (filePath.includes('driver')) {
        return 'drivers';
      }
      if (filePath.includes('embedded') || filePath.includes('firmware')) {
        return 'embedded';
      }
      if (filePath.includes('rtos') || filePath.includes('realtime')) {
        return 'realtime';
      }
      if (filePath.includes('network') || filePath.includes('socket')) {
        return 'networking';
      }
      if (filePath.includes('legacy') || filePath.includes('compat')) {
        return 'legacy';
      }
    }

    // Detect from code context
    if (context.codeContext) {
      const code = context.codeContext.toLowerCase();
      
      if (code.includes('module_init') || code.includes('module_exit')) {
        return 'kernel';
      }
      if (code.includes('volatile') && code.includes('isr')) {
        return 'embedded';
      }
      if (code.includes('socket') || code.includes('htons')) {
        return 'networking';
      }
      if (code.includes('rtos') || code.includes('freertos')) {
        return 'realtime';
      }
    }

    // Default to systems programming
    return 'systems';
  }

  /**
   * Load template for category
   */
  private async loadTemplate(category: Category): Promise<string> {
    // Check cache
    if (this.templateCache.has(category)) {
      return this.templateCache.get(category)!;
    }

    // Load from file
    const templatePath = path.join(this.templatesPath, 'prompts', `${category}.txt`);
    const template = await fs.readFile(templatePath, 'utf-8');

    // Validate template
    const validation = this.templateEngine.validate(template);
    if (!validation.valid) {
      throw new Error(`Invalid template for ${category}: ${validation.errors.join(', ')}`);
    }

    // Cache template
    this.templateCache.set(category, template);

    return template;
  }

  /**
   * Get active rules for category
   */
  private getActiveRulesForCategory(category: Category): Rule[] {
    const config = this.configManager.getConfiguration();

    // Get all rules for this category
    const categoryRules = this.ruleRegistry.getRulesByCategory(category);

    // Get universal rules
    const universalRules = this.ruleRegistry.getRulesByCategory('universal');

    // Combine and filter for active rules
    const allRules = [...categoryRules, ...universalRules];

    // Filter by enabled status
    return allRules.filter(rule => rule.enabled);
  }

  /**
   * Build template context from rules and context
   */
  private buildTemplateContext(
    category: Category,
    rules: Rule[],
    context: PromptContext
  ): TemplateContext {
    const config = this.configManager.getConfiguration();

    // Build context object
    const templateContext: TemplateContext = {
      category,
      c_standard: config?.c_standards.c_standard || 'c11',
      rules: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        severity: rule.severity
      })),
      examples: this.extractExamples(rules)
    };

    // Add file context if available
    if (context.filePath) {
      templateContext.file_path = context.filePath;
    }

    if (context.functionName) {
      templateContext.function_name = context.functionName;
    }

    return templateContext;
  }

  /**
   * Extract examples from rules
   */
  private extractExamples(rules: Rule[]): Array<{ title: string; code: string }> {
    const examples: Array<{ title: string; code: string }> = [];

    for (const rule of rules) {
      // Add good examples
      for (const example of rule.examples.good) {
        examples.push({
          title: `${rule.name} - Good Example`,
          code: example.code
        });
      }
    }

    // Limit to top 5 examples to keep prompt size reasonable
    return examples.slice(0, 5);
  }

  /**
   * Generate cache key
   */
  private getCacheKey(context: PromptContext, category: Category): string {
    const parts = [
      category,
      context.filePath || '',
      context.functionName || '',
      context.fileType || ''
    ];
    return parts.join(':');
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.promptCache.clear();
  }

  /**
   * Enable or disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * Preload all templates
   */
  async preloadTemplates(): Promise<void> {
    const categories: Category[] = [
      'systems',
      'embedded',
      'kernel',
      'drivers',
      'realtime',
      'networking',
      'legacy'
    ];

    for (const category of categories) {
      await this.loadTemplate(category);
    }
  }

  /**
   * Get statistics about cached prompts
   */
  getCacheStats(): { size: number; categories: Record<Category, number> } {
    const stats: { size: number; categories: Record<Category, number> } = {
      size: this.promptCache.size,
      categories: {} as Record<Category, number>
    };

    for (const [, prompt] of this.promptCache) {
      const category = prompt.category;
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    }

    return stats;
  }
}
