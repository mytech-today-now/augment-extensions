/**
 * Rule Override System for C Coding Standards
 * 
 * Implements rule override mechanism for category-specific exceptions.
 * Supports configuration-based overrides and validates override consistency.
 */

import { Rule, Category, Configuration, RuleSeverity } from './types';
import { RuleRegistry } from './registry';
import { ConfigurationManager } from './config-manager';

export interface RuleOverride {
  ruleId: string;
  category: Category;
  action: 'disable' | 'enable' | 'change_severity';
  newSeverity?: 'ERROR' | 'WARNING' | 'INFO';
  reason: string;
  appliedBy?: 'user' | 'category' | 'system';
}

export interface OverrideValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OverrideReport {
  overrides: RuleOverride[];
  applied: number;
  failed: number;
  warnings: string[];
}

export class RuleOverrideSystem {
  private overrides: Map<string, RuleOverride[]> = new Map();
  
  constructor(
    private registry: RuleRegistry,
    private configManager: ConfigurationManager
  ) {
    this.loadConfigurationOverrides();
  }

  /**
   * Load overrides from configuration
   */
  private loadConfigurationOverrides(): void {
    const config = this.configManager.getConfiguration();
    
    // Load universal rule overrides
    if (config.c_standards.universal_rules) {
      for (const [ruleKey, severity] of Object.entries(config.c_standards.universal_rules)) {
        const ruleId = `universal-${ruleKey}`;
        
        if (severity === 'disabled') {
          this.addOverride({
            ruleId,
            category: 'universal' as Category,
            action: 'disable',
            reason: 'Disabled in configuration',
            appliedBy: 'user'
          });
        } else if (severity === 'warning') {
          this.addOverride({
            ruleId,
            category: 'universal' as Category,
            action: 'change_severity',
            newSeverity: 'WARNING',
            reason: 'Changed to warning in configuration',
            appliedBy: 'user'
          });
        }
      }
    }
    
    // Load category-specific overrides
    if (config.c_standards.category_overrides) {
      for (const [category, overrides] of Object.entries(config.c_standards.category_overrides)) {
        this.loadCategoryOverrides(category as Category, overrides);
      }
    }
  }

  /**
   * Load category-specific overrides
   */
  private loadCategoryOverrides(category: Category, overrides: any): void {
    // Example: embedded category disables dynamic allocation
    if (category === 'embedded' && overrides.allow_dynamic_allocation === false) {
      this.addOverride({
        ruleId: 'universal-memory_safety',
        category,
        action: 'change_severity',
        newSeverity: 'ERROR',
        reason: 'Embedded systems forbid dynamic allocation',
        appliedBy: 'category'
      });
    }
    
    // Example: systems category requires POSIX compliance
    if (category === 'systems' && overrides.require_posix_compliance === true) {
      this.addOverride({
        ruleId: 'systems-posix',
        category,
        action: 'enable',
        reason: 'POSIX compliance required for systems programming',
        appliedBy: 'category'
      });
    }
    
    // Example: realtime category enforces determinism
    if (category === 'realtime' && overrides.enforce_determinism === true) {
      this.addOverride({
        ruleId: 'realtime-determinism',
        category,
        action: 'change_severity',
        newSeverity: 'ERROR',
        reason: 'Determinism is critical for real-time systems',
        appliedBy: 'category'
      });
    }
  }

  /**
   * Add a rule override
   */
  addOverride(override: RuleOverride): void {
    const key = `${override.ruleId}:${override.category}`;
    
    if (!this.overrides.has(key)) {
      this.overrides.set(key, []);
    }
    
    this.overrides.get(key)!.push(override);
  }

  /**
   * Get overrides for a specific rule and category
   */
  getOverrides(ruleId: string, category: Category): RuleOverride[] {
    const key = `${ruleId}:${category}`;
    return this.overrides.get(key) || [];
  }

  /**
   * Apply overrides to a rule
   */
  applyOverrides(rule: Rule, category: Category): Rule {
    const overrides = this.getOverrides(rule.id, category);

    if (overrides.length === 0) {
      return rule;
    }

    // Create a copy of the rule
    const modifiedRule = { ...rule };

    // Apply each override in order
    for (const override of overrides) {
      switch (override.action) {
        case 'disable':
          modifiedRule.enabled = false;
          break;

        case 'enable':
          modifiedRule.enabled = true;
          break;

        case 'change_severity':
          if (override.newSeverity) {
            modifiedRule.severity = override.newSeverity;
          }
          break;
      }
    }

    return modifiedRule;
  }

  /**
   * Validate override consistency
   */
  validateOverrides(): OverrideValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for conflicting overrides
    for (const [key, overrideList] of this.overrides) {
      if (overrideList.length > 1) {
        // Multiple overrides for the same rule/category
        const hasConflict = this.checkOverrideConflict(overrideList);

        if (hasConflict) {
          errors.push(`Conflicting overrides for ${key}: ${overrideList.map(o => o.action).join(', ')}`);
        } else {
          warnings.push(`Multiple overrides for ${key} (will be applied in order)`);
        }
      }
    }

    // Check if overridden rules exist
    for (const [key, overrideList] of this.overrides) {
      const ruleId = key.split(':')[0];
      const rule = this.registry.getRule(ruleId);

      if (!rule) {
        warnings.push(`Override for non-existent rule: ${ruleId}`);
      }
    }

    // Check for circular dependencies
    const circular = this.detectCircularOverrides();
    if (circular.length > 0) {
      errors.push(`Circular override dependencies detected: ${circular.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if override list has conflicts
   */
  private checkOverrideConflict(overrides: RuleOverride[]): boolean {
    // Check for enable/disable conflicts
    const hasEnable = overrides.some(o => o.action === 'enable');
    const hasDisable = overrides.some(o => o.action === 'disable');

    if (hasEnable && hasDisable) {
      return true;
    }

    // Check for severity conflicts
    const severityChanges = overrides
      .filter(o => o.action === 'change_severity')
      .map(o => o.newSeverity);

    const uniqueSeverities = new Set(severityChanges);
    if (uniqueSeverities.size > 1) {
      return true;
    }

    return false;
  }

  /**
   * Detect circular override dependencies
   */
  private detectCircularOverrides(): string[] {
    // Simplified implementation
    // In production, use proper graph cycle detection
    const circular: string[] = [];

    // Check if any override creates a circular dependency
    // This is a placeholder for demonstration

    return circular;
  }

  /**
   * Apply all overrides to rules for a category
   */
  applyAllOverrides(rules: Rule[], category: Category): Rule[] {
    return rules.map(rule => this.applyOverrides(rule, category));
  }

  /**
   * Get all overrides
   */
  getAllOverrides(): RuleOverride[] {
    const allOverrides: RuleOverride[] = [];

    for (const overrideList of this.overrides.values()) {
      allOverrides.push(...overrideList);
    }

    return allOverrides;
  }

  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    this.overrides.clear();
  }

  /**
   * Remove overrides for a specific rule
   */
  removeOverrides(ruleId: string, category?: Category): void {
    if (category) {
      const key = `${ruleId}:${category}`;
      this.overrides.delete(key);
    } else {
      // Remove all overrides for this rule across all categories
      const keysToDelete: string[] = [];

      for (const key of this.overrides.keys()) {
        if (key.startsWith(`${ruleId}:`)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.overrides.delete(key);
      }
    }
  }

  /**
   * Generate override report
   */
  generateReport(): OverrideReport {
    const allOverrides = this.getAllOverrides();
    const validation = this.validateOverrides();

    return {
      overrides: allOverrides,
      applied: allOverrides.filter(o => o.appliedBy !== undefined).length,
      failed: validation.errors.length,
      warnings: validation.warnings
    };
  }

  /**
   * Generate formatted override report
   */
  generateFormattedReport(): string {
    const report = this.generateReport();
    let output = '# Rule Override Report\n\n';

    output += `## Summary\n\n`;
    output += `- Total overrides: ${report.overrides.length}\n`;
    output += `- Applied: ${report.applied}\n`;
    output += `- Failed: ${report.failed}\n`;
    output += `- Warnings: ${report.warnings.length}\n\n`;

    if (report.warnings.length > 0) {
      output += `## Warnings\n\n`;
      for (const warning of report.warnings) {
        output += `- ${warning}\n`;
      }
      output += '\n';
    }

    if (report.overrides.length === 0) {
      output += 'No overrides configured.\n';
      return output;
    }

    output += `## Overrides by Category\n\n`;

    // Group by category
    const byCategory = new Map<Category, RuleOverride[]>();

    for (const override of report.overrides) {
      if (!byCategory.has(override.category)) {
        byCategory.set(override.category, []);
      }
      byCategory.get(override.category)!.push(override);
    }

    for (const [category, overrides] of byCategory) {
      output += `### ${category}\n\n`;

      for (const override of overrides) {
        output += `- **${override.ruleId}**: ${override.action}`;

        if (override.newSeverity) {
          output += ` (${override.newSeverity})`;
        }

        output += `\n  - Reason: ${override.reason}\n`;

        if (override.appliedBy) {
          output += `  - Applied by: ${override.appliedBy}\n`;
        }
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Export overrides to configuration format
   */
  exportToConfig(): any {
    const config: any = {
      universal_rules: {},
      category_overrides: {}
    };

    for (const override of this.getAllOverrides()) {
      if (override.category === 'universal') {
        const ruleKey = override.ruleId.replace('universal-', '');

        if (override.action === 'disable') {
          config.universal_rules[ruleKey] = 'disabled';
        } else if (override.action === 'change_severity' && override.newSeverity === 'WARNING') {
          config.universal_rules[ruleKey] = 'warning';
        } else {
          config.universal_rules[ruleKey] = 'enabled';
        }
      } else {
        if (!config.category_overrides[override.category]) {
          config.category_overrides[override.category] = {};
        }

        // Map override to configuration property
        // This is simplified; in production, use proper mapping
        config.category_overrides[override.category][override.ruleId] = {
          action: override.action,
          severity: override.newSeverity,
          reason: override.reason
        };
      }
    }

    return config;
  }
}

