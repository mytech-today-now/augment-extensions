/**
 * AI Summary Generation Utilities
 * 
 * Generates concise summaries of modules for AI context
 */

import { Module } from './module-system';
import * as fs from 'fs';
import * as path from 'path';

export interface ModuleSummary {
  name: string;
  version: string;
  type: string;
  description: string;
  keyRules: string[];
  exampleCount: number;
  characterCount: number;
  tags: string[];
  summary: string;
}

/**
 * Generate a concise summary of a module
 */
export function generateModuleSummary(module: Module): ModuleSummary {
  const keyRules = module.rules?.slice(0, 10) || [];
  const exampleCount = module.examples?.length || 0;
  const characterCount = module.metadata.augment?.characterCount || 0;
  const tags = module.metadata.tags || [];

  const summary = `${module.fullName} (v${module.metadata.version}) provides ${module.metadata.type} guidelines. ` +
    `Includes ${keyRules.length} key rules and ${exampleCount} examples. ` +
    `Total content: ~${characterCount} characters.`;

  return {
    name: module.fullName,
    version: module.metadata.version,
    type: module.metadata.type,
    description: module.metadata.description,
    keyRules,
    exampleCount,
    characterCount,
    tags,
    summary
  };
}

/**
 * Generate a detailed AI-friendly summary
 */
export function generateDetailedSummary(module: Module, includeContent: boolean = false): string {
  const summary = generateModuleSummary(module);

  let output = `# ${summary.name}\n\n`;
  output += `**Version**: ${summary.version}\n`;
  output += `**Type**: ${summary.type}\n`;
  output += `**Description**: ${summary.description}\n\n`;

  output += `## Quick Summary\n${summary.summary}\n\n`;

  if (summary.tags.length > 0) {
    output += `## Tags\n${summary.tags.map(tag => `- ${tag}`).join('\n')}\n\n`;
  }

  if (summary.keyRules.length > 0) {
    output += `## Key Rules\n`;
    summary.keyRules.forEach((rule, i) => {
      output += `${i + 1}. ${rule}\n`;
    });
    output += '\n';
  }

  if (summary.exampleCount > 0) {
    output += `## Examples\n`;
    output += `This module includes ${summary.exampleCount} example(s).\n\n`;
  }

  output += `## Metrics\n`;
  output += `- Character Count: ${summary.characterCount.toLocaleString()}\n`;
  output += `- Rules: ${summary.keyRules.length}\n`;
  output += `- Examples: ${summary.exampleCount}\n\n`;

  if (includeContent && module.path) {
    output += `## Content Preview\n`;
    output += generateContentPreview(module);
  }

  return output;
}

/**
 * Generate a content preview from module files
 */
function generateContentPreview(module: Module): string {
  let preview = '';

  // Try to read README
  const readmePath = path.join(module.path, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n').slice(0, 20);
    preview += '### README.md (first 20 lines)\n```markdown\n';
    preview += lines.join('\n');
    preview += '\n```\n\n';
  }

  // Try to read first rule file
  if (module.rules && module.rules.length > 0) {
    const firstRule = module.rules[0];
    const rulePath = path.join(module.path, 'rules', firstRule);
    if (fs.existsSync(rulePath)) {
      const content = fs.readFileSync(rulePath, 'utf-8');
      const lines = content.split('\n').slice(0, 15);
      preview += `### ${firstRule} (first 15 lines)\n\`\`\`markdown\n`;
      preview += lines.join('\n');
      preview += '\n```\n\n';
    }
  }

  return preview || 'No content preview available.\n';
}

/**
 * Generate a JSON summary for programmatic use
 */
export function generateJSONSummary(module: Module): string {
  const summary = generateModuleSummary(module);
  return JSON.stringify(summary, null, 2);
}

/**
 * Generate a compact one-line summary
 */
export function generateCompactSummary(module: Module): string {
  const summary = generateModuleSummary(module);
  return `${summary.name} v${summary.version}: ${summary.description} (${summary.keyRules.length} rules, ${summary.exampleCount} examples)`;
}

/**
 * Generate AI context string for injection
 */
export function generateAIContext(module: Module): string {
  const summary = generateModuleSummary(module);

  let context = `Module: ${summary.name}\n`;
  context += `Type: ${summary.type}\n`;
  context += `Description: ${summary.description}\n\n`;

  context += `Key Standards:\n`;
  summary.keyRules.forEach((rule, i) => {
    context += `${i + 1}. ${rule}\n`;
  });

  context += `\nWhen generating code, follow these ${summary.type} standards from ${summary.name}.\n`;

  return context;
}

/**
 * Generate a summary with optimization suggestions
 */
export function generateSummaryWithSuggestions(module: Module): string {
  const summary = generateDetailedSummary(module, false);

  let suggestions = '\n## AI Usage Suggestions\n\n';
  suggestions += `### For Code Generation\n`;
  suggestions += `Use this module when generating ${module.metadata.type} code to ensure compliance with standards.\n\n`;

  suggestions += `### For Code Review\n`;
  suggestions += `Reference these rules when reviewing code for ${module.metadata.type} best practices.\n\n`;

  suggestions += `### For Refactoring\n`;
  suggestions += `Apply these standards when refactoring existing code to improve quality and maintainability.\n\n`;

  return summary + suggestions;
}

