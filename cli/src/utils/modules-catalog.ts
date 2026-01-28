import * as fs from 'fs';
import * as path from 'path';
import { Module, discoverModules } from './module-system';
import { formatCharacterCount } from './character-count';

/**
 * Module catalog entry interface
 */
export interface ModuleCatalogEntry {
  module: Module;
  displayName: string;
  version: string;
  characterCount: number;
  description: string;
  contents: string[];
}

/**
 * Generate catalog entry for a module
 */
export function generateCatalogEntry(module: Module): ModuleCatalogEntry {
  const displayName = module.metadata.displayName || module.fullName;
  const version = module.metadata.version;
  const characterCount = module.metadata.augment?.characterCount || 0;
  const description = module.metadata.description;

  // Extract contents from rules and examples
  const contents: string[] = [];
  
  // Add rule files
  module.rules.forEach(rule => {
    const ruleName = rule.replace('.md', '').replace(/-/g, ' ');
    contents.push(ruleName.charAt(0).toUpperCase() + ruleName.slice(1));
  });

  return {
    module,
    displayName,
    version,
    characterCount,
    description,
    contents
  };
}

/**
 * Generate markdown for a catalog entry
 */
export function generateCatalogMarkdown(entry: ModuleCatalogEntry): string {
  let markdown = `### ${entry.displayName}\n`;
  markdown += `- **Module**: \`${entry.module.fullName}\`\n`;
  markdown += `- **Version**: ${entry.version}\n`;
  markdown += `- **Character Count**: ~${entry.characterCount.toLocaleString()}\n`;
  markdown += `- **Description**: ${entry.description}\n`;
  
  if (entry.contents.length > 0) {
    markdown += `- **Contents**:\n`;
    entry.contents.forEach(content => {
      markdown += `  - ${content}\n`;
    });
  }
  
  markdown += `\n**Usage**:\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `augx link ${entry.module.fullName}\n`;
  markdown += `\`\`\`\n`;
  
  return markdown;
}

/**
 * Group modules by category
 */
export function groupModulesByCategory(modules: Module[]): Map<string, Module[]> {
  const grouped = new Map<string, Module[]>();

  for (const module of modules) {
    const category = module.metadata.type;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(module);
  }

  // Sort modules within each category by name
  for (const [category, categoryModules] of grouped.entries()) {
    categoryModules.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  return grouped;
}

/**
 * Generate complete MODULES.md content
 */
export function generateModulesCatalog(): string {
  const modules = discoverModules();
  const grouped = groupModulesByCategory(modules);

  let catalog = `# Augment Extensions Module Catalog\n\n`;
  catalog += `This catalog lists all available extension modules for Augment Code AI.\n\n`;
  catalog += `## Quick Start\n\n`;
  catalog += `\`\`\`bash\n`;
  catalog += `# List all modules\n`;
  catalog += `augx list\n\n`;
  catalog += `# Show module details\n`;
  catalog += `augx show <module-name>\n\n`;
  catalog += `# Link a module to your project\n`;
  catalog += `augx link <module-name>\n`;
  catalog += `\`\`\`\n\n`;

  // Category order
  const categoryOrder = ['coding-standards', 'domain-rules', 'workflows', 'examples'];
  const categoryTitles = {
    'coding-standards': 'Coding Standards',
    'domain-rules': 'Domain Rules',
    'workflows': 'Workflows',
    'examples': 'Examples'
  };

  for (const category of categoryOrder) {
    const categoryModules = grouped.get(category);
    if (!categoryModules || categoryModules.length === 0) {
      continue;
    }

    catalog += `## ${categoryTitles[category as keyof typeof categoryTitles]}\n\n`;

    for (const module of categoryModules) {
      const entry = generateCatalogEntry(module);
      catalog += generateCatalogMarkdown(entry);
      catalog += `\n`;
    }
  }

  // Add statistics
  catalog += `## Statistics\n\n`;
  catalog += `- **Total Modules**: ${modules.length}\n`;
  
  for (const category of categoryOrder) {
    const count = grouped.get(category)?.length || 0;
    if (count > 0) {
      catalog += `- **${categoryTitles[category as keyof typeof categoryTitles]}**: ${count}\n`;
    }
  }

  const totalChars = modules.reduce((sum, m) => sum + (m.metadata.augment?.characterCount || 0), 0);
  catalog += `- **Total Character Count**: ~${totalChars.toLocaleString()}\n`;

  return catalog;
}

/**
 * Update MODULES.md file
 */
export function updateModulesCatalog(catalogPath: string = 'MODULES.md'): void {
  const content = generateModulesCatalog();
  fs.writeFileSync(catalogPath, content, 'utf-8');
}

