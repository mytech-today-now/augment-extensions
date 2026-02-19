/**
 * Unit Tests for TemplateEngine
 * Tests template parsing, variable substitution, and conditional rendering
 */

import { TemplateEngine } from '../../src/template-engine';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  describe('render()', () => {
    it('should render template with simple variables', () => {
      const template = 'Hello {name}, welcome to {place}!';
      const context = { name: 'John', place: 'C Programming' };
      
      const result = engine.render(template, context);
      
      expect(result).toBe('Hello John, welcome to C Programming!');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {name}, your age is {age}';
      const context = { name: 'John' };
      
      const result = engine.render(template, context);
      
      expect(result).toBe('Hello John, your age is {age}');
    });

    it('should render nested object properties', () => {
      const template = 'User: {user.name}, Email: {user.email}';
      const context = { 
        user: { 
          name: 'John Doe', 
          email: 'john@example.com' 
        } 
      };
      
      const result = engine.render(template, context);
      
      expect(result).toBe('User: John Doe, Email: john@example.com');
    });

    it('should handle array values', () => {
      const template = 'Categories: {categories}';
      const context = { categories: ['systems', 'embedded', 'kernel'] };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('systems');
      expect(result).toContain('embedded');
      expect(result).toContain('kernel');
    });

    it('should escape special characters', () => {
      const template = 'Code: {code}';
      const context = { code: 'int main() { return 0; }' };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('int main()');
    });
  });

  describe('renderConditional()', () => {
    it('should render if block when condition is true', () => {
      const template = `
{#if enabled}
This feature is enabled
{/if}
`;
      const context = { enabled: true };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('This feature is enabled');
    });

    it('should not render if block when condition is false', () => {
      const template = `
{#if enabled}
This feature is enabled
{/if}
`;
      const context = { enabled: false };
      
      const result = engine.render(template, context);
      
      expect(result).not.toContain('This feature is enabled');
    });

    it('should render else block when condition is false', () => {
      const template = `
{#if enabled}
Enabled
{#else}
Disabled
{/if}
`;
      const context = { enabled: false };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('Disabled');
      expect(result).not.toContain('Enabled');
    });

    it('should handle nested conditionals', () => {
      const template = `
{#if outer}
  Outer is true
  {#if inner}
    Inner is also true
  {/if}
{/if}
`;
      const context = { outer: true, inner: true };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('Outer is true');
      expect(result).toContain('Inner is also true');
    });
  });

  describe('renderLoop()', () => {
    it('should render loop for array items', () => {
      const template = `
{#each items}
- {name}
{/each}
`;
      const context = { 
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' },
          { name: 'Item 3' }
        ]
      };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
      expect(result).toContain('Item 3');
    });

    it('should provide index in loops', () => {
      const template = `
{#each items}
{index}. {name}
{/each}
`;
      const context = { 
        items: [
          { name: 'First' },
          { name: 'Second' }
        ]
      };
      
      const result = engine.render(template, context);
      
      expect(result).toContain('0. First');
      expect(result).toContain('1. Second');
    });

    it('should handle empty arrays', () => {
      const template = `
{#each items}
- {name}
{/each}
No items found
`;
      const context = { items: [] };

      const result = engine.render(template, context);

      expect(result).toContain('No items found');
    });
  });

  describe('validate()', () => {
    it('should validate correct template syntax', () => {
      const template = 'Hello {name}!';

      const result = engine.validate(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unclosed variables', () => {
      const template = 'Hello {name!';

      const result = engine.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect unclosed conditionals', () => {
      const template = '{#if condition}Content';

      const result = engine.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed conditional block');
    });

    it('should detect unclosed loops', () => {
      const template = '{#each items}Item';

      const result = engine.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed loop block');
    });

    it('should detect mismatched blocks', () => {
      const template = '{#if condition}{/each}';

      const result = engine.validate(template);

      expect(result.valid).toBe(false);
    });
  });

  describe('parse()', () => {
    it('should parse template into AST', () => {
      const template = 'Hello {name}!';

      const ast = engine.parse(template);

      expect(ast).toBeDefined();
      expect(ast.nodes).toBeDefined();
      expect(ast.nodes.length).toBeGreaterThan(0);
    });

    it('should identify variable nodes', () => {
      const template = '{name}';

      const ast = engine.parse(template);

      expect(ast.nodes.some(n => n.type === 'variable')).toBe(true);
    });

    it('should identify conditional nodes', () => {
      const template = '{#if condition}text{/if}';

      const ast = engine.parse(template);

      expect(ast.nodes.some(n => n.type === 'conditional')).toBe(true);
    });

    it('should identify loop nodes', () => {
      const template = '{#each items}item{/each}';

      const ast = engine.parse(template);

      expect(ast.nodes.some(n => n.type === 'loop')).toBe(true);
    });
  });

  describe('registerHelper()', () => {
    it('should register custom helper function', () => {
      engine.registerHelper('uppercase', (value: string) => value.toUpperCase());

      const template = '{uppercase(name)}';
      const context = { name: 'john' };

      const result = engine.render(template, context);

      expect(result).toBe('JOHN');
    });

    it('should support multiple helpers', () => {
      engine.registerHelper('uppercase', (value: string) => value.toUpperCase());
      engine.registerHelper('lowercase', (value: string) => value.toLowerCase());

      const template = '{uppercase(first)} {lowercase(last)}';
      const context = { first: 'john', last: 'DOE' };

      const result = engine.render(template, context);

      expect(result).toBe('JOHN doe');
    });
  });

  describe('caching', () => {
    it('should cache parsed templates', () => {
      const template = 'Hello {name}!';

      const ast1 = engine.parse(template);
      const ast2 = engine.parse(template);

      expect(ast1).toBe(ast2); // Same reference due to caching
    });

    it('should clear cache', () => {
      const template = 'Hello {name}!';

      const ast1 = engine.parse(template);
      engine.clearCache();
      const ast2 = engine.parse(template);

      expect(ast1).not.toBe(ast2); // Different references after cache clear
    });
  });
});

