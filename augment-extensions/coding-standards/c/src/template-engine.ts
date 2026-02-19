/**
 * Template Engine for C Coding Standards
 * 
 * Provides template parsing with variable substitution and conditional sections.
 * Supports {variable} syntax and {#if}/{#each} directives.
 */

export interface TemplateContext {
  [key: string]: any;
}

export interface TemplateDirective {
  type: 'if' | 'each' | 'variable';
  condition?: string;
  variable?: string;
  content?: string;
}

export class TemplateEngine {
  /**
   * Render a template with the given context
   */
  render(template: string, context: TemplateContext): string {
    let result = template;

    // Process conditional blocks first ({#if condition}...{/if})
    result = this.processConditionals(result, context);

    // Process each blocks ({#each items}...{/each})
    result = this.processEach(result, context);

    // Process variable substitutions ({variable})
    result = this.processVariables(result, context);

    return result;
  }

  /**
   * Process conditional blocks
   */
  private processConditionals(template: string, context: TemplateContext): string {
    const ifRegex = /\{#if\s+([^}]+)\}([\s\S]*?)\{\/if\}/g;
    
    return template.replace(ifRegex, (match, condition, content) => {
      if (this.evaluateCondition(condition.trim(), context)) {
        return content;
      }
      return '';
    });
  }

  /**
   * Process each blocks
   */
  private processEach(template: string, context: TemplateContext): string {
    const eachRegex = /\{#each\s+([^}]+)\}([\s\S]*?)\{\/each\}/g;
    
    return template.replace(eachRegex, (match, variable, content) => {
      const varName = variable.trim();
      const items = this.resolveVariable(varName, context);

      if (!Array.isArray(items)) {
        return '';
      }

      return items.map((item, index) => {
        const itemContext = {
          ...context,
          [varName.split('.').pop() || 'item']: item,
          '@index': index,
          '@first': index === 0,
          '@last': index === items.length - 1
        };
        return this.processVariables(content, itemContext);
      }).join('');
    });
  }

  /**
   * Process variable substitutions
   */
  private processVariables(template: string, context: TemplateContext): string {
    const varRegex = /\{([^#\/][^}]*)\}/g;
    
    return template.replace(varRegex, (match, variable) => {
      const varName = variable.trim();
      const value = this.resolveVariable(varName, context);
      
      if (value === undefined || value === null) {
        return '';
      }
      
      return String(value);
    });
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    // Handle negation
    if (condition.startsWith('!')) {
      return !this.evaluateCondition(condition.substring(1).trim(), context);
    }

    // Handle equality checks
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map(s => s.trim());
      const leftValue = this.resolveVariable(left, context);
      const rightValue = right.startsWith('"') || right.startsWith("'")
        ? right.slice(1, -1)
        : this.resolveVariable(right, context);
      return leftValue == rightValue;
    }

    // Handle inequality checks
    if (condition.includes('!=')) {
      const [left, right] = condition.split('!=').map(s => s.trim());
      const leftValue = this.resolveVariable(left, context);
      const rightValue = right.startsWith('"') || right.startsWith("'")
        ? right.slice(1, -1)
        : this.resolveVariable(right, context);
      return leftValue != rightValue;
    }

    // Simple truthiness check
    const value = this.resolveVariable(condition, context);
    return Boolean(value);
  }

  /**
   * Resolve a variable from context (supports dot notation)
   */
  private resolveVariable(path: string, context: TemplateContext): any {
    const parts = path.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Validate template syntax
   */
  validate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for balanced {#if}/{/if} blocks
    const ifMatches = template.match(/\{#if\s+[^}]+\}/g) || [];
    const ifEndMatches = template.match(/\{\/if\}/g) || [];
    if (ifMatches.length !== ifEndMatches.length) {
      errors.push(`Unbalanced {#if}/{/if} blocks: ${ifMatches.length} opening, ${ifEndMatches.length} closing`);
    }

    // Check for balanced {#each}/{/each} blocks
    const eachMatches = template.match(/\{#each\s+[^}]+\}/g) || [];
    const eachEndMatches = template.match(/\{\/each\}/g) || [];
    if (eachMatches.length !== eachEndMatches.length) {
      errors.push(`Unbalanced {#each}/{/each} blocks: ${eachMatches.length} opening, ${eachEndMatches.length} closing`);
    }

    // Check for invalid directive syntax
    const invalidDirectives = template.match(/\{#[^iefl][^}]*\}/g);
    if (invalidDirectives) {
      errors.push(`Invalid directives found: ${invalidDirectives.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Extract variables used in template
   */
  extractVariables(template: string): string[] {
    const variables = new Set<string>();

    // Extract from variable substitutions
    const varMatches = template.matchAll(/\{([^#\/][^}]*)\}/g);
    for (const match of varMatches) {
      const varName = match[1].trim().split('.')[0];
      if (varName && !varName.startsWith('@')) {
        variables.add(varName);
      }
    }

    // Extract from conditionals
    const ifMatches = template.matchAll(/\{#if\s+([^}]+)\}/g);
    for (const match of ifMatches) {
      const condition = match[1].trim();
      const varName = condition.split(/[!=\s]/)[0].trim();
      if (varName && !varName.startsWith('!')) {
        variables.add(varName);
      }
    }

    // Extract from each blocks
    const eachMatches = template.matchAll(/\{#each\s+([^}]+)\}/g);
    for (const match of eachMatches) {
      const varName = match[1].trim().split('.')[0];
      if (varName) {
        variables.add(varName);
      }
    }

    return Array.from(variables);
  }
}

