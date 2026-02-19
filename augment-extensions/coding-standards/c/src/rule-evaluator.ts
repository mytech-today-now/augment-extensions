/**
 * Rule Evaluator for C Coding Standards
 * 
 * Applies active rules to code and generates violation reports.
 * Supports filtering by category, severity, and configuration.
 */

import { Rule, Category, Configuration } from './types';
import { RuleRegistry } from './registry';
import { ConfigurationManager } from './config-manager';

export interface CodeContext {
  filePath: string;
  content: string;
  category?: Category;
  language?: string;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface EvaluationResult {
  filePath: string;
  violations: RuleViolation[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    total: number;
  };
}

export interface EvaluationOptions {
  categories?: Category[];
  severity?: 'ERROR' | 'WARNING' | 'INFO';
  enabledOnly?: boolean;
  maxViolations?: number;
}

export class RuleEvaluator {
  constructor(
    private registry: RuleRegistry,
    private configManager: ConfigurationManager
  ) {}

  /**
   * Evaluate code against active rules
   */
  async evaluate(
    context: CodeContext,
    options: EvaluationOptions = {}
  ): Promise<EvaluationResult> {
    const violations: RuleViolation[] = [];
    
    // Get applicable rules
    const rules = this.getApplicableRules(context, options);
    
    // Apply each rule
    for (const rule of rules) {
      const ruleViolations = await this.applyRule(rule, context);
      violations.push(...ruleViolations);
      
      // Check max violations limit
      if (options.maxViolations && violations.length >= options.maxViolations) {
        break;
      }
    }
    
    // Generate summary
    const summary = this.generateSummary(violations);
    
    return {
      filePath: context.filePath,
      violations,
      summary
    };
  }

  /**
   * Get rules applicable to the given context
   */
  private getApplicableRules(
    context: CodeContext,
    options: EvaluationOptions
  ): Rule[] {
    const config = this.configManager.getConfiguration();
    
    // Start with all rules
    let rules = this.registry.getAllRules();
    
    // Filter by enabled status
    if (options.enabledOnly !== false) {
      rules = rules.filter(rule => rule.enabled);
    }
    
    // Filter by category
    const categories = options.categories || 
                      (context.category ? [context.category] : config.c_standards.categories);
    
    if (categories && categories.length > 0) {
      rules = rules.filter(rule =>
        rule.category.some(cat => categories.includes(cat as Category))
      );
    }
    
    // Filter by severity
    if (options.severity) {
      rules = rules.filter(rule => rule.severity === options.severity);
    }
    
    // Apply configuration overrides
    rules = this.applyConfigurationFilters(rules, config);
    
    return rules;
  }

  /**
   * Apply configuration-based filters to rules
   */
  private applyConfigurationFilters(
    rules: Rule[],
    config: Configuration
  ): Rule[] {
    return rules.filter(rule => {
      // Check if rule is disabled in configuration
      const ruleKey = rule.id.split('-').pop();
      if (ruleKey && config.c_standards.universal_rules) {
        const severity = config.c_standards.universal_rules[ruleKey as keyof typeof config.c_standards.universal_rules];
        if (severity === 'disabled') {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Apply a single rule to code context
   */
  private async applyRule(
    rule: Rule,
    context: CodeContext
  ): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    // Basic pattern matching for demonstration
    // In production, this would use AST analysis or static analysis tools
    const lines = context.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for violations based on rule patterns
      const violation = this.checkLineForViolation(rule, line, lineNumber);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  /**
   * Check a single line for rule violations
   */
  private checkLineForViolation(
    rule: Rule,
    line: string,
    lineNumber: number
  ): RuleViolation | null {
    // This is a simplified implementation
    // In production, use proper AST parsing and static analysis

    // Example: Check for naming convention violations
    if (rule.id.includes('naming')) {
      // Check for camelCase in function names (should be snake_case)
      const funcMatch = line.match(/\b([a-z]+[A-Z][a-zA-Z]*)\s*\(/);
      if (funcMatch) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: `Function name '${funcMatch[1]}' should use snake_case, not camelCase`,
          line: lineNumber,
          suggestion: `Use ${this.toSnakeCase(funcMatch[1])} instead`
        };
      }
    }

    // Example: Check for memory safety violations
    if (rule.id.includes('memory')) {
      // Check for malloc without null check
      if (line.includes('malloc(') && !line.includes('if')) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: 'malloc() call should be followed by null pointer check',
          line: lineNumber,
          suggestion: 'Add: if (ptr == NULL) { /* handle error */ }'
        };
      }
    }

    return null;
  }

  /**
   * Convert camelCase to snake_case
   */
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(violations: RuleViolation[]): EvaluationResult['summary'] {
    const summary = {
      errors: 0,
      warnings: 0,
      info: 0,
      total: violations.length
    };

    for (const violation of violations) {
      if (violation.severity === 'ERROR') {
        summary.errors++;
      } else if (violation.severity === 'WARNING') {
        summary.warnings++;
      } else {
        summary.info++;
      }
    }

    return summary;
  }

  /**
   * Batch evaluate multiple files
   */
  async evaluateBatch(
    contexts: CodeContext[],
    options: EvaluationOptions = {}
  ): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];

    for (const context of contexts) {
      const result = await this.evaluate(context, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate a formatted report
   */
  generateReport(results: EvaluationResult[]): string {
    let report = '# C Coding Standards Evaluation Report\n\n';

    // Overall summary
    const totalViolations = results.reduce((sum, r) => sum + r.summary.total, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.summary.errors, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.summary.warnings, 0);
    const totalInfo = results.reduce((sum, r) => sum + r.summary.info, 0);

    report += `## Summary\n\n`;
    report += `- Files evaluated: ${results.length}\n`;
    report += `- Total violations: ${totalViolations}\n`;
    report += `- Errors: ${totalErrors}\n`;
    report += `- Warnings: ${totalWarnings}\n`;
    report += `- Info: ${totalInfo}\n\n`;

    // Per-file details
    report += `## Details\n\n`;

    for (const result of results) {
      if (result.violations.length === 0) {
        continue;
      }

      report += `### ${result.filePath}\n\n`;
      report += `Violations: ${result.summary.total} (${result.summary.errors} errors, ${result.summary.warnings} warnings, ${result.summary.info} info)\n\n`;

      for (const violation of result.violations) {
        report += `- **[${violation.severity}]** Line ${violation.line}: ${violation.message}\n`;
        if (violation.suggestion) {
          report += `  - Suggestion: ${violation.suggestion}\n`;
        }
      }

      report += '\n';
    }

    return report;
  }
}

