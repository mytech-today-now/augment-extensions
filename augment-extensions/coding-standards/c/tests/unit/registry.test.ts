/**
 * Unit Tests for RuleRegistry
 * Tests rule loading, indexing, querying, and caching
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RuleRegistry } from '../../src/registry';
import { Rule } from '../../src/types';

describe('RuleRegistry', () => {
  let tempDir: string;
  let rulesPath: string;
  let registry: RuleRegistry;

  beforeEach(async () => {
    // Create temporary directory for test rules
    tempDir = path.join(__dirname, '../fixtures/temp-rules');
    rulesPath = path.join(tempDir, 'rules');
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(rulesPath, 'categories'), { recursive: true });
    
    // Create sample rule files
    await createSampleRules();
    
    registry = new RuleRegistry(rulesPath);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createSampleRules() {
    // Universal naming rule
    const namingRule = `# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: ERROR

## Description
Use snake_case for functions and variables, UPPER_CASE for macros and constants.

## Rationale
Consistent naming improves code readability and maintainability.

## Examples

### Bad Example
\`\`\`c
int myFunction() { return 0; }
\`\`\`

### Good Example
\`\`\`c
int my_function() { return 0; }
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'universal/naming.md'), namingRule);

    // Systems programming rule
    const systemsRule = `# Rule: POSIX Compliance

## Metadata
- **ID**: systems-posix
- **Category**: systems
- **Severity**: WARNING

## Description
Follow POSIX standards for system programming.

## Rationale
POSIX compliance ensures portability across Unix-like systems.

## Examples

### Bad Example
\`\`\`c
// Non-portable code
\`\`\`

### Good Example
\`\`\`c
// POSIX-compliant code
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'categories/systems.md'), systemsRule);

    // Embedded systems rule
    const embeddedRule = `# Rule: Volatile Hardware Access

## Metadata
- **ID**: embedded-volatile
- **Category**: embedded
- **Severity**: ERROR

## Description
Use volatile keyword for hardware register access.

## Rationale
Prevents compiler optimizations that could break hardware interactions.
`;

    await fs.writeFile(path.join(rulesPath, 'categories/embedded.md'), embeddedRule);
  }

  describe('loadRules()', () => {
    it('should load all rules from directories', async () => {
      await registry.loadRules();
      
      const allRules = registry.getAllRules();
      expect(allRules.length).toBeGreaterThan(0);
    });

    it('should parse rule metadata correctly', async () => {
      await registry.loadRules();
      
      const namingRule = registry.getRule('universal-naming');
      expect(namingRule).toBeDefined();
      expect(namingRule?.name).toBe('Naming Conventions');
      expect(namingRule?.severity).toBe('ERROR');
      expect(namingRule?.category).toContain('universal');
    });

    it('should handle missing directories gracefully', async () => {
      const emptyRegistry = new RuleRegistry('/nonexistent/path');
      await expect(emptyRegistry.loadRules()).resolves.not.toThrow();
    });
  });

  describe('getRule()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should retrieve rule by ID', () => {
      const rule = registry.getRule('universal-naming');
      expect(rule).toBeDefined();
      expect(rule?.id).toBe('universal-naming');
    });

    it('should return undefined for non-existent rule', () => {
      const rule = registry.getRule('nonexistent-rule');
      expect(rule).toBeUndefined();
    });
  });

  describe('getRulesByCategory()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should return all rules for a category', () => {
      const universalRules = registry.getRulesByCategory('universal');
      expect(universalRules.length).toBeGreaterThan(0);
      expect(universalRules.every(r => r.category.includes('universal'))).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const rules = registry.getRulesByCategory('nonexistent');
      expect(rules).toEqual([]);
    });

    it('should use cache for repeated queries', () => {
      const rules1 = registry.getRulesByCategory('universal');
      const rules2 = registry.getRulesByCategory('universal');
      expect(rules1).toBe(rules2); // Same reference due to caching
    });
  });

  describe('getRulesBySeverity()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should return all ERROR severity rules', () => {
      const errorRules = registry.getRulesBySeverity('ERROR');
      expect(errorRules.length).toBeGreaterThan(0);
      expect(errorRules.every(r => r.severity === 'ERROR')).toBe(true);
    });

    it('should return all WARNING severity rules', () => {
      const warningRules = registry.getRulesBySeverity('WARNING');
      expect(warningRules.every(r => r.severity === 'WARNING')).toBe(true);
    });

    it('should use cache for repeated queries', () => {
      const rules1 = registry.getRulesBySeverity('ERROR');
      const rules2 = registry.getRulesBySeverity('ERROR');
      expect(rules1).toBe(rules2);
    });
  });

  describe('getActiveRules()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should return only enabled rules', () => {
      const activeRules = registry.getActiveRules();
      expect(activeRules.every(r => r.enabled !== false)).toBe(true);
    });

    it('should exclude disabled rules', () => {
      registry.setRuleEnabled('universal-naming', false);
      const activeRules = registry.getActiveRules();
      expect(activeRules.find(r => r.id === 'universal-naming')).toBeUndefined();
    });
  });

  describe('queryRules()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should filter by category and severity', () => {
      const results = registry.queryRules({
        category: 'universal',
        severity: 'ERROR'
      });

      expect(results.every(r => r.category.includes('universal'))).toBe(true);
      expect(results.every(r => r.severity === 'ERROR')).toBe(true);
    });

    it('should filter by enabled status', () => {
      registry.setRuleEnabled('universal-naming', false);

      const enabledRules = registry.queryRules({ enabled: true });
      expect(enabledRules.find(r => r.id === 'universal-naming')).toBeUndefined();

      const disabledRules = registry.queryRules({ enabled: false });
      expect(disabledRules.find(r => r.id === 'universal-naming')).toBeDefined();
    });

    it('should search by text in name or description', () => {
      const results = registry.queryRules({ search: 'naming' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r =>
        r.name.toLowerCase().includes('naming') ||
        r.description.toLowerCase().includes('naming')
      )).toBe(true);
    });
  });

  describe('setRuleEnabled()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should enable a rule', () => {
      registry.setRuleEnabled('universal-naming', true);
      const rule = registry.getRule('universal-naming');
      expect(rule?.enabled).toBe(true);
    });

    it('should disable a rule', () => {
      registry.setRuleEnabled('universal-naming', false);
      const rule = registry.getRule('universal-naming');
      expect(rule?.enabled).toBe(false);
    });

    it('should clear cache when rule status changes', () => {
      const activeRules1 = registry.getActiveRules();
      registry.setRuleEnabled('universal-naming', false);
      const activeRules2 = registry.getActiveRules();

      expect(activeRules1).not.toBe(activeRules2); // Cache cleared
    });
  });

  describe('clearCache()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should clear all cached queries', () => {
      const rules1 = registry.getRulesByCategory('universal');
      registry.clearCache();
      const rules2 = registry.getRulesByCategory('universal');

      expect(rules1).not.toBe(rules2); // Different references after cache clear
    });
  });

  describe('getAllRules()', () => {
    beforeEach(async () => {
      await registry.loadRules();
    });

    it('should return all loaded rules', () => {
      const allRules = registry.getAllRules();
      expect(allRules.length).toBeGreaterThan(0);
    });

    it('should include both universal and category-specific rules', () => {
      const allRules = registry.getAllRules();
      const hasUniversal = allRules.some(r => r.category.includes('universal'));
      const hasCategory = allRules.some(r => !r.category.includes('universal'));

      expect(hasUniversal).toBe(true);
      expect(hasCategory).toBe(true);
    });
  });
});

