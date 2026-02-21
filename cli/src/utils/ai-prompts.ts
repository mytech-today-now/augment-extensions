/**
 * AI Prompt Generation Utilities
 * 
 * Generates AI-ready prompts from module inspection results
 */

import { Module } from './module-system';

export interface PromptTemplate {
  name: string;
  description: string;
  generate: (module: Module, context?: any) => string;
}

/**
 * Generate a code review prompt from module standards
 */
export function generateCodeReviewPrompt(module: Module, codeSnippet?: string): string {
  const prompt = `# Code Review Request

## Standards Module
**Module**: ${module.fullName}
**Version**: ${module.metadata.version}
**Type**: ${module.metadata.type}

## Standards to Apply
${module.metadata.description}

## Rules
${module.rules?.map((rule, i) => `${i + 1}. ${rule}`).join('\n') || 'No specific rules defined'}

## Task
Please review the following code against these standards:

${codeSnippet ? `\`\`\`\n${codeSnippet}\n\`\`\`` : '[Paste your code here]'}

## Expected Output
1. Compliance assessment
2. Violations found (if any)
3. Specific recommendations
4. Code examples for fixes
`;

  return prompt;
}

/**
 * Generate a module summary prompt for AI context
 */
export function generateModuleSummaryPrompt(module: Module): string {
  const prompt = `# Module Summary for AI Context

**Module**: ${module.fullName}
**Version**: ${module.metadata.version}
**Type**: ${module.metadata.type}
**Description**: ${module.metadata.description}

## Purpose
This module provides ${module.metadata.type} guidelines for ${module.fullName}.

## Key Rules
${module.rules?.slice(0, 10).map((rule, i) => `${i + 1}. ${rule}`).join('\n') || 'No rules defined'}

## Examples Available
${module.examples?.slice(0, 5).map((ex, i) => `${i + 1}. ${ex}`).join('\n') || 'No examples available'}

## Character Count
Approximately ${module.metadata.augment?.characterCount || 'unknown'} characters

## Usage
When working on ${module.metadata.type} tasks, reference this module for:
- Coding standards and conventions
- Best practices and patterns
- Example implementations
- Common pitfalls to avoid
`;

  return prompt;
}

/**
 * Generate an optimization suggestion prompt
 */
export function generateOptimizationPrompt(module: Module, targetFile?: string): string {
  const prompt = `# Code Optimization Request

## Context
**Standards Module**: ${module.fullName}
**Target**: ${targetFile || 'Current codebase'}

## Optimization Goals
Based on ${module.fullName} standards, suggest optimizations for:

1. **Performance**
   - Identify bottlenecks
   - Suggest algorithmic improvements
   - Recommend caching strategies

2. **Code Quality**
   - Reduce complexity
   - Improve readability
   - Enhance maintainability

3. **Best Practices**
   - Apply ${module.metadata.type} patterns
   - Follow naming conventions
   - Implement proper error handling

4. **Security**
   - Identify vulnerabilities
   - Suggest secure alternatives
   - Implement input validation

## Standards Reference
${module.rules?.slice(0, 5).map((rule, i) => `${i + 1}. ${rule}`).join('\n') || 'See module for full standards'}

## Expected Output
For each optimization:
- Current issue
- Recommended solution
- Code example
- Impact assessment (high/medium/low)
`;

  return prompt;
}

/**
 * Generate a refactoring recommendation prompt
 */
export function generateRefactoringPrompt(module: Module, complexity?: any): string {
  const prompt = `# Refactoring Recommendations

## Module Standards
**Module**: ${module.fullName}
**Type**: ${module.metadata.type}

## Refactoring Goals
Refactor code to align with ${module.fullName} standards:

### 1. Structure Improvements
- Organize code according to ${module.metadata.type} patterns
- Separate concerns appropriately
- Improve modularity

### 2. Naming Conventions
- Apply consistent naming from standards
- Improve variable/function names
- Use descriptive identifiers

### 3. Code Simplification
- Reduce cyclomatic complexity
- Extract reusable functions
- Eliminate code duplication

### 4. Documentation
- Add inline comments
- Document public APIs
- Include usage examples

## Standards to Follow
${module.rules?.map((rule, i) => `${i + 1}. ${rule}`).join('\n') || 'See module for full standards'}

## Output Format
For each refactoring:
1. Current code pattern
2. Recommended pattern
3. Step-by-step migration guide
4. Benefits of change
`;

  return prompt;
}

/**
 * Get all available prompt templates
 */
export function getPromptTemplates(): PromptTemplate[] {
  return [
    {
      name: 'code-review',
      description: 'Generate code review prompt with module standards',
      generate: (module, context) => generateCodeReviewPrompt(module, context?.code)
    },
    {
      name: 'module-summary',
      description: 'Generate module summary for AI context',
      generate: (module) => generateModuleSummaryPrompt(module)
    },
    {
      name: 'optimization',
      description: 'Generate optimization suggestions prompt',
      generate: (module, context) => generateOptimizationPrompt(module, context?.file)
    },
    {
      name: 'refactoring',
      description: 'Generate refactoring recommendations prompt',
      generate: (module, context) => generateRefactoringPrompt(module, context?.complexity)
    }
  ];
}

