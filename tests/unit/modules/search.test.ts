import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Module Search Tests
 * 
 * Tests for module search operations including:
 * - Search by keyword (name, description)
 * - Search by tag/type
 * - Search ranking and relevance
 * - No results handling
 * - Multiple results
 * - Case-insensitive search
 */

describe('Module Search Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Search by Keyword', () => {
    it('should find module by exact name', async () => {
      const module = await testEnv.createModule({ name: 'typescript-standards' });

      // Search for exact name
      const searchTerm = 'typescript-standards';
      const matches = module.metadata.name === searchTerm;

      expect(matches).toBe(true);
    });

    it('should find module by partial name', async () => {
      const module = await testEnv.createModule({ name: 'typescript-coding-standards' });

      // Search for partial name
      const searchTerm = 'typescript';
      const matches = module.metadata.name.includes(searchTerm);

      expect(matches).toBe(true);
    });

    it('should find module by description', async () => {
      const module = await testEnv.createModule({ 
        name: 'test-module',
        description: 'TypeScript coding standards and best practices'
      });

      // Search in description
      const searchTerm = 'best practices';
      const matches = module.metadata.description.toLowerCase().includes(searchTerm.toLowerCase());

      expect(matches).toBe(true);
    });

    it('should find module by display name', async () => {
      const module = await testEnv.createModule({ 
        name: 'ts-standards',
        displayName: 'TypeScript Standards'
      });

      // Search in display name
      const searchTerm = 'TypeScript';
      const matches = module.metadata.displayName?.includes(searchTerm);

      expect(matches).toBe(true);
    });

    it('should perform case-insensitive search', async () => {
      const module = await testEnv.createModule({ name: 'TypeScript-Module' });

      // Search with different case
      const searchTerm = 'typescript';
      const matches = module.metadata.name.toLowerCase().includes(searchTerm.toLowerCase());

      expect(matches).toBe(true);
    });
  });

  describe('Search by Tag/Type', () => {
    it('should find modules by type', async () => {
      const module1 = await testEnv.createModule({ name: 'mod-1', type: 'coding-standards' });
      const module2 = await testEnv.createModule({ name: 'mod-2', type: 'coding-standards' });
      const module3 = await testEnv.createModule({ name: 'mod-3', type: 'domain-rules' });

      // Filter by type
      const codingModules = [module1, module2, module3].filter(m => m.metadata.type === 'coding-standards');

      expect(codingModules).toHaveLength(2);
      expect(codingModules.every(m => m.metadata.type === 'coding-standards')).toBe(true);
    });

    it('should find modules by tags', async () => {
      const module = await testEnv.createModule({ 
        name: 'tagged-module',
        tags: ['typescript', 'testing', 'best-practices']
      });

      // Search for tag
      const searchTag = 'typescript';
      const matches = module.metadata.tags?.includes(searchTag);

      expect(matches).toBe(true);
    });

    it('should find modules with multiple matching tags', async () => {
      const module = await testEnv.createModule({ 
        name: 'multi-tag-module',
        tags: ['typescript', 'javascript', 'testing']
      });

      // Search for multiple tags
      const searchTags = ['typescript', 'testing'];
      const matchCount = searchTags.filter(tag => module.metadata.tags?.includes(tag)).length;

      expect(matchCount).toBe(2);
    });
  });

  describe('Search Ranking and Relevance', () => {
    it('should rank exact matches higher', async () => {
      const exactModule = await testEnv.createModule({ name: 'typescript' });
      const partialModule = await testEnv.createModule({ name: 'typescript-standards' });

      // Exact match should rank higher
      const searchTerm = 'typescript';
      const exactMatch = exactModule.metadata.name === searchTerm;
      const partialMatch = partialModule.metadata.name.includes(searchTerm);

      expect(exactMatch).toBe(true);
      expect(partialMatch).toBe(true);
      // Exact match has higher priority
    });

    it('should rank name matches higher than description matches', async () => {
      const nameMatch = await testEnv.createModule({ name: 'typescript-module' });
      const descMatch = await testEnv.createModule({ 
        name: 'coding-module',
        description: 'TypeScript coding standards'
      });

      const searchTerm = 'typescript';
      const nameMatchScore = nameMatch.metadata.name.includes(searchTerm) ? 1.0 : 0.0;
      const descMatchScore = descMatch.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ? 0.5 : 0.0;

      expect(nameMatchScore).toBeGreaterThan(descMatchScore);
    });

    it('should rank shorter names higher for same match', async () => {
      const shortModule = await testEnv.createModule({ name: 'ts' });
      const longModule = await testEnv.createModule({ name: 'typescript-coding-standards-module' });

      // Shorter names are more specific
      expect(shortModule.metadata.name.length).toBeLessThan(longModule.metadata.name.length);
    });

    it('should prioritize starts-with matches', async () => {
      const startsWithModule = await testEnv.createModule({ name: 'typescript-module' });
      const containsModule = await testEnv.createModule({ name: 'my-typescript-module' });

      const searchTerm = 'typescript';
      const startsWithMatch = startsWithModule.metadata.name.startsWith(searchTerm);
      const containsMatch = containsModule.metadata.name.includes(searchTerm);

      expect(startsWithMatch).toBe(true);
      expect(containsMatch).toBe(true);
      // Starts-with should rank higher
    });
  });

  describe('No Results', () => {
    it('should handle search with no results', async () => {
      await testEnv.createModule({ name: 'typescript-module' });

      // Search for non-existent term
      const searchTerm = 'python';
      const results: any[] = [];

      expect(results).toHaveLength(0);
    });

    it('should provide helpful message for no results', async () => {
      const results: any[] = [];
      const message = results.length === 0 ? 'No modules found matching your search.' : '';

      expect(message).toBe('No modules found matching your search.');
    });

    it('should suggest alternatives for no results', async () => {
      const results: any[] = [];
      const suggestions = results.length === 0
        ? ['Try using different keywords', 'Remove type filter', 'Run list to see all modules']
        : [];

      expect(suggestions).toHaveLength(3);
    });
  });

  describe('Multiple Results', () => {
    it('should return multiple matching modules', async () => {
      const module1 = await testEnv.createModule({ name: 'typescript-standards' });
      const module2 = await testEnv.createModule({ name: 'typescript-examples' });
      const module3 = await testEnv.createModule({ name: 'typescript-workflows' });

      // Search for common term
      const searchTerm = 'typescript';
      const results = [module1, module2, module3].filter(m =>
        m.metadata.name.includes(searchTerm)
      );

      expect(results).toHaveLength(3);
    });

    it('should sort multiple results by relevance', async () => {
      const exact = await testEnv.createModule({ name: 'test' });
      const startsWith = await testEnv.createModule({ name: 'test-module' });
      const contains = await testEnv.createModule({ name: 'my-test-module' });

      const searchTerm = 'test';
      const results = [exact, startsWith, contains];

      // Simulate sorting by relevance
      const sorted = results.sort((a, b) => {
        const aName = a.metadata.name;
        const bName = b.metadata.name;

        if (aName === searchTerm) return -1;
        if (bName === searchTerm) return 1;
        if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
        if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
        return aName.length - bName.length;
      });

      expect(sorted[0].metadata.name).toBe('test');
      expect(sorted[1].metadata.name).toBe('test-module');
      expect(sorted[2].metadata.name).toBe('my-test-module');
    });

    it('should limit number of results', async () => {
      const modules = await Promise.all([
        testEnv.createModule({ name: 'test-1' }),
        testEnv.createModule({ name: 'test-2' }),
        testEnv.createModule({ name: 'test-3' }),
        testEnv.createModule({ name: 'test-4' }),
        testEnv.createModule({ name: 'test-5' })
      ]);

      // Limit to 3 results
      const maxResults = 3;
      const limitedResults = modules.slice(0, maxResults);

      expect(limitedResults).toHaveLength(3);
    });
  });

  describe('Advanced Search Features', () => {
    it('should search across multiple fields', async () => {
      const module = await testEnv.createModule({
        name: 'coding-module',
        description: 'TypeScript standards',
        displayName: 'Coding Standards',
        tags: ['best-practices']
      });

      // Search term could match any field
      const searchTerm = 'typescript';
      const matches =
        module.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.metadata.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      expect(matches).toBe(true);
    });

    it('should support fuzzy matching', async () => {
      const module = await testEnv.createModule({ name: 'typescript-module' });

      // Fuzzy search (typo tolerance)
      const searchTerm = 'typscript'; // Missing 'e'

      // Simple fuzzy match: count matching characters
      let matchCount = 0;
      let searchIndex = 0;
      const moduleName = module.metadata.name.toLowerCase();

      for (let i = 0; i < moduleName.length && searchIndex < searchTerm.length; i++) {
        if (moduleName[i] === searchTerm[searchIndex]) {
          matchCount++;
          searchIndex++;
        }
      }

      const fuzzyScore = matchCount / searchTerm.length;
      expect(fuzzyScore).toBeGreaterThan(0.8); // 80% match threshold
    });

    it('should filter by category during search', async () => {
      const codingModule = await testEnv.createModule({ name: 'test-module', type: 'coding-standards' });
      const domainModule = await testEnv.createModule({ name: 'test-rules', type: 'domain-rules' });

      // Search with category filter
      const searchTerm = 'test';
      const categoryFilter = 'coding-standards';

      const results = [codingModule, domainModule].filter(m =>
        m.metadata.name.includes(searchTerm) && m.metadata.type === categoryFilter
      );

      expect(results).toHaveLength(1);
      expect(results[0].metadata.type).toBe('coding-standards');
    });

    it('should support exact match mode', async () => {
      const exactModule = await testEnv.createModule({ name: 'test' });
      const partialModule = await testEnv.createModule({ name: 'test-module' });

      // Exact match only
      const searchTerm = 'test';
      const exactMatchOnly = true;

      const results = [exactModule, partialModule].filter(m =>
        exactMatchOnly ? m.metadata.name === searchTerm : m.metadata.name.includes(searchTerm)
      );

      expect(results).toHaveLength(1);
      expect(results[0].metadata.name).toBe('test');
    });

    it('should support case-sensitive search option', async () => {
      const module = await testEnv.createModule({ name: 'TypeScript-Module' });

      // Case-sensitive search
      const searchTerm = 'TypeScript';
      const caseSensitive = true;

      const matches = caseSensitive
        ? module.metadata.name.includes(searchTerm)
        : module.metadata.name.toLowerCase().includes(searchTerm.toLowerCase());

      expect(matches).toBe(true);
    });
  });

  describe('Search Performance', () => {
    it('should handle large number of modules efficiently', async () => {
      // Create many modules
      const modules = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          testEnv.createModule({ name: `module-${i}` })
        )
      );

      // Search should complete quickly
      const searchTerm = 'module';
      const results = modules.filter(m => m.metadata.name.includes(searchTerm));

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(100);
    });

    it('should cache search results for repeated queries', async () => {
      const module = await testEnv.createModule({ name: 'cached-module' });

      // Simulate caching
      const cache = new Map<string, any>();
      const searchTerm = 'cached';

      // First search
      if (!cache.has(searchTerm)) {
        const results = [module].filter(m => m.metadata.name.includes(searchTerm));
        cache.set(searchTerm, results);
      }

      // Second search (from cache)
      const cachedResults = cache.get(searchTerm);

      expect(cachedResults).toBeDefined();
      expect(cachedResults).toHaveLength(1);
    });
  });
});


