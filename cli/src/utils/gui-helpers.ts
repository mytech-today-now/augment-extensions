/**
 * GUI Helper Functions
 */

import * as fs from 'fs';
import * as path from 'path';
import { GuiConfig, DEFAULT_GUI_CONFIG, SearchResult, SearchMatch, ModuleChoice, FilterOptions } from '../types/gui';
import { Module } from './module-system';

/**
 * Load GUI configuration from VS Code settings or use defaults
 */
export function loadGuiConfig(): GuiConfig {
  // In a real implementation, this would read from VS Code settings
  // For now, return default config
  return { ...DEFAULT_GUI_CONFIG };
}

/**
 * Format module for display in GUI
 */
export function formatModuleChoice(module: Module, linkedModules: string[] = []): ModuleChoice {
  return {
    name: `${module.metadata.displayName} (${module.fullName})`,
    value: module.fullName,
    description: module.metadata.description,
    type: module.metadata.type,
    priority: module.metadata.augment?.priority,
    characterCount: module.metadata.augment?.characterCount,
    linked: linkedModules.includes(module.fullName),
    checked: linkedModules.includes(module.fullName)
  };
}

/**
 * Fuzzy search implementation using simple string matching
 * For production, consider using Fuse.js or similar library
 */
export function fuzzySearch(
  query: string,
  modules: ModuleChoice[],
  options: GuiConfig['searchOptions']
): SearchResult[] {
  if (!query || query.trim() === '') {
    return modules.map(m => ({ module: m, score: 1, matches: [] }));
  }

  const normalizedQuery = options.caseSensitive ? query : query.toLowerCase();
  const results: SearchResult[] = [];

  for (const module of modules) {
    let totalScore = 0;
    const matches: SearchMatch[] = [];

    // Search in name
    if (options.searchFields.includes('name')) {
      const nameValue = module.name || '';
      const normalizedName = options.caseSensitive ? nameValue : nameValue.toLowerCase();
      const nameScore = calculateMatchScore(normalizedQuery, normalizedName);
      
      if (nameScore > 0) {
        totalScore += nameScore * 0.5; // Name weight: 0.5
        matches.push({
          field: 'name',
          indices: findMatchIndices(normalizedQuery, normalizedName),
          value: nameValue
        });
      }
    }

    // Search in description
    if (options.searchFields.includes('description') && module.description) {
      const descValue = module.description;
      const normalizedDesc = options.caseSensitive ? descValue : descValue.toLowerCase();
      const descScore = calculateMatchScore(normalizedQuery, normalizedDesc);
      
      if (descScore > 0) {
        totalScore += descScore * 0.3; // Description weight: 0.3
        matches.push({
          field: 'description',
          indices: findMatchIndices(normalizedQuery, normalizedDesc),
          value: descValue
        });
      }
    }

    // Search in type (treated as tags)
    if (options.searchFields.includes('tags') && module.type) {
      const typeValue = module.type;
      const normalizedType = options.caseSensitive ? typeValue : typeValue.toLowerCase();
      const typeScore = calculateMatchScore(normalizedQuery, normalizedType);
      
      if (typeScore > 0) {
        totalScore += typeScore * 0.2; // Tags weight: 0.2
        matches.push({
          field: 'tags',
          indices: findMatchIndices(normalizedQuery, normalizedType),
          value: typeValue
        });
      }
    }

    if (totalScore >= options.minMatchScore) {
      results.push({ module, score: totalScore, matches });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Calculate match score between query and text
 */
function calculateMatchScore(query: string, text: string): number {
  if (text.includes(query)) {
    // Exact substring match
    return 1.0;
  }

  // Simple fuzzy matching: count matching characters in order
  let queryIndex = 0;
  let matchCount = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      matchCount++;
      queryIndex++;
    }
  }

  return matchCount / query.length;
}

/**
 * Find indices of matches in text
 */
function findMatchIndices(query: string, text: string): [number, number][] {
  const indices: [number, number][] = [];
  const index = text.indexOf(query);
  
  if (index !== -1) {
    indices.push([index, index + query.length]);
  }

  return indices;
}

/**
 * Filter modules based on filter options
 */
export function filterModules(modules: ModuleChoice[], filters: FilterOptions): ModuleChoice[] {
  return modules.filter(module => {
    // Filter by categories
    if (filters.categories.length > 0) {
      const moduleCategory = module.type || '';
      if (!filters.categories.includes(moduleCategory)) {
        return false;
      }
    }

    // Filter by types (same as categories for now)
    if (filters.types.length > 0) {
      const moduleType = module.type || '';
      if (!filters.types.includes(moduleType)) {
        return false;
      }
    }

    // Filter by priorities
    if (filters.priorities.length > 0) {
      const modulePriority = module.priority || 'medium';
      if (!filters.priorities.includes(modulePriority as any)) {
        return false;
      }
    }

    // Filter by linked status
    if (filters.linkedOnly && !module.linked) {
      return false;
    }

    return true;
  });
}

