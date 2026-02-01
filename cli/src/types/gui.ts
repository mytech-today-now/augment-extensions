/**
 * GUI Configuration Types
 */

export interface GuiConfig {
  spacing: 'compact' | 'medium' | 'spacious';
  showDescriptions: boolean;
  showCharacterCounts: boolean;
  groupByCategory: boolean;
  sortBy: 'name' | 'type' | 'priority' | 'characterCount';
  sortOrder: 'asc' | 'desc';
  searchOptions: SearchOptions;
  displayOptions: ModuleDisplayOptions;
}

export interface SearchOptions {
  fuzzyMatch: boolean;
  searchFields: ('name' | 'description' | 'tags')[];
  caseSensitive: boolean;
  minMatchScore: number; // 0-1 for fuzzy matching
}

export interface ModuleDisplayOptions {
  showLinkedBadge: boolean;
  showPriorityBadge: boolean;
  showCategoryIcon: boolean;
  highlightMatches: boolean;
}

export interface FilterOptions {
  categories: string[];
  types: string[];
  priorities: ('high' | 'medium' | 'low')[];
  linkedOnly: boolean;
}

/**
 * Default GUI Configuration
 */
export const DEFAULT_GUI_CONFIG: GuiConfig = {
  spacing: 'medium',
  showDescriptions: true,
  showCharacterCounts: true,
  groupByCategory: true,
  sortBy: 'name',
  sortOrder: 'asc',
  searchOptions: {
    fuzzyMatch: true,
    searchFields: ['name', 'description', 'tags'],
    caseSensitive: false,
    minMatchScore: 0.3
  },
  displayOptions: {
    showLinkedBadge: true,
    showPriorityBadge: true,
    showCategoryIcon: true,
    highlightMatches: true
  }
};

/**
 * Module Choice for GUI
 */
export interface ModuleChoice {
  name: string;
  value: string;
  checked?: boolean;
  description?: string;
  type?: string;
  priority?: string;
  characterCount?: number;
  linked?: boolean;
}

/**
 * Search Result
 */
export interface SearchResult {
  module: ModuleChoice;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: 'name' | 'description' | 'tags';
  indices: [number, number][];
  value: string;
}

