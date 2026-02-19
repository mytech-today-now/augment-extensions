/**
 * Conflict Detector for C Coding Standards
 * 
 * Detects conflicts between overlapping rules and provides resolution suggestions.
 * Handles contradictory requirements and rule precedence.
 */

import { Rule, Category, Configuration } from './types';
import { RuleRegistry } from './registry';
import { ConfigurationManager } from './config-manager';

export type ConflictType = 'direct' | 'implicit' | 'precedence' | 'scope';
export type ConflictSeverity = 'high' | 'medium' | 'low';

export interface RuleConflict {
  type: ConflictType;
  severity: ConflictSeverity;
  rule1: Rule;
  rule2: Rule;
  description: string;
  reason: string;
  suggestion: string;
}

export interface ConflictResolution {
  conflict: RuleConflict;
  resolution: 'use_rule1' | 'use_rule2' | 'merge' | 'user_decision';
  rationale: string;
  appliedRule?: Rule;
}

export interface ConflictReport {
  conflicts: RuleConflict[];
  resolutions: ConflictResolution[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    resolved: number;
    unresolved: number;
  };
}

export class ConflictDetector {
  constructor(
    private registry: RuleRegistry,
    private configManager: ConfigurationManager
  ) {}

  /**
   * Detect all conflicts in the rule set
   */
  detectConflicts(categories?: Category[]): ConflictReport {
    const config = this.configManager.getConfiguration();
    const activeCategories = categories || config.c_standards.categories;
    
    // Get all active rules for the specified categories
    const rules = this.registry.queryRules({
      categories: activeCategories,
      enabled: true
    });
    
    const conflicts: RuleConflict[] = [];
    
    // Check each pair of rules for conflicts
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const conflict = this.checkRulePair(rules[i], rules[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }
    
    // Generate resolutions
    const resolutions = conflicts.map(conflict => 
      this.resolveConflict(conflict, config)
    );
    
    // Generate summary
    const summary = this.generateSummary(conflicts, resolutions);
    
    return {
      conflicts,
      resolutions,
      summary
    };
  }

  /**
   * Check if two rules conflict
   */
  private checkRulePair(rule1: Rule, rule2: Rule): RuleConflict | null {
    // Check for direct conflicts (contradictory requirements)
    const directConflict = this.checkDirectConflict(rule1, rule2);
    if (directConflict) {
      return directConflict;
    }
    
    // Check for implicit conflicts (incompatible states)
    const implicitConflict = this.checkImplicitConflict(rule1, rule2);
    if (implicitConflict) {
      return implicitConflict;
    }
    
    // Check for precedence conflicts (same scope, different severity)
    const precedenceConflict = this.checkPrecedenceConflict(rule1, rule2);
    if (precedenceConflict) {
      return precedenceConflict;
    }
    
    // Check for scope conflicts (overlapping but different requirements)
    const scopeConflict = this.checkScopeConflict(rule1, rule2);
    if (scopeConflict) {
      return scopeConflict;
    }
    
    return null;
  }

  /**
   * Check for direct conflicts (contradictory requirements)
   */
  private checkDirectConflict(rule1: Rule, rule2: Rule): RuleConflict | null {
    // Example: Universal allows dynamic allocation, embedded forbids it
    if (rule1.id.includes('memory') && rule2.id.includes('memory')) {
      const hasOverlap = rule1.category.some(cat => rule2.category.includes(cat));
      
      if (hasOverlap) {
        // Check if descriptions contain contradictory keywords
        const r1Desc = rule1.description.toLowerCase();
        const r2Desc = rule2.description.toLowerCase();
        
        if ((r1Desc.includes('allow') && r2Desc.includes('forbid')) ||
            (r1Desc.includes('forbid') && r2Desc.includes('allow'))) {
          return {
            type: 'direct',
            severity: 'high',
            rule1,
            rule2,
            description: 'Rules have contradictory requirements',
            reason: `${rule1.name} and ${rule2.name} have opposite requirements for the same feature`,
            suggestion: 'Apply category-specific rule precedence or use configuration override'
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Check for implicit conflicts (incompatible system states)
   */
  private checkImplicitConflict(rule1: Rule, rule2: Rule): RuleConflict | null {
    // Example: Real-time requires determinism, but another rule allows dynamic allocation
    const r1Keywords = this.extractKeywords(rule1);
    const r2Keywords = this.extractKeywords(rule2);

    const incompatiblePairs = [
      ['deterministic', 'dynamic'],
      ['realtime', 'blocking'],
      ['embedded', 'malloc']
    ];

    for (const [kw1, kw2] of incompatiblePairs) {
      if ((r1Keywords.includes(kw1) && r2Keywords.includes(kw2)) ||
          (r1Keywords.includes(kw2) && r2Keywords.includes(kw1))) {
        return {
          type: 'implicit',
          severity: 'medium',
          rule1,
          rule2,
          description: 'Rules create incompatible system states',
          reason: `${rule1.name} requires ${kw1} but ${rule2.name} allows ${kw2}`,
          suggestion: 'Review category-specific requirements and apply appropriate overrides'
        };
      }
    }

    return null;
  }

  /**
   * Check for precedence conflicts (same scope, different severity)
   */
  private checkPrecedenceConflict(rule1: Rule, rule2: Rule): RuleConflict | null {
    // Check if rules have overlapping categories
    const overlap = rule1.category.filter(cat => rule2.category.includes(cat));

    if (overlap.length > 0 && rule1.severity !== rule2.severity) {
      // Check if they address the same topic
      const r1Topic = this.extractTopic(rule1);
      const r2Topic = this.extractTopic(rule2);

      if (r1Topic === r2Topic) {
        return {
          type: 'precedence',
          severity: 'low',
          rule1,
          rule2,
          description: 'Rules have different severity for the same topic',
          reason: `${rule1.name} (${rule1.severity}) and ${rule2.name} (${rule2.severity}) address the same topic`,
          suggestion: 'Use highest severity or apply category-specific precedence'
        };
      }
    }

    return null;
  }

  /**
   * Check for scope conflicts (overlapping but different requirements)
   */
  private checkScopeConflict(rule1: Rule, rule2: Rule): RuleConflict | null {
    // Check if one rule is more specific than the other
    const r1IsUniversal = rule1.category.includes('universal' as Category);
    const r2IsUniversal = rule2.category.includes('universal' as Category);

    if (r1IsUniversal !== r2IsUniversal) {
      // One is universal, one is category-specific
      const overlap = this.checkTopicOverlap(rule1, rule2);

      if (overlap) {
        return {
          type: 'scope',
          severity: 'low',
          rule1,
          rule2,
          description: 'Universal and category-specific rules overlap',
          reason: `${rule1.name} (universal) and ${rule2.name} (category-specific) address similar topics`,
          suggestion: 'Category-specific rule should take precedence'
        };
      }
    }

    return null;
  }

  /**
   * Extract keywords from rule
   */
  private extractKeywords(rule: Rule): string[] {
    const text = `${rule.name} ${rule.description} ${rule.rationale}`.toLowerCase();
    const keywords: string[] = [];

    const patterns = [
      'deterministic', 'dynamic', 'realtime', 'blocking', 'embedded',
      'malloc', 'free', 'volatile', 'static', 'const', 'posix',
      'kernel', 'driver', 'interrupt', 'dma', 'network', 'legacy'
    ];

    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        keywords.push(pattern);
      }
    }

    return keywords;
  }

  /**
   * Extract topic from rule
   */
  private extractTopic(rule: Rule): string {
    // Extract main topic from rule ID or name
    const parts = rule.id.split('-');
    return parts[parts.length - 1] || 'unknown';
  }

  /**
   * Check if two rules have overlapping topics
   */
  private checkTopicOverlap(rule1: Rule, rule2: Rule): boolean {
    const keywords1 = this.extractKeywords(rule1);
    const keywords2 = this.extractKeywords(rule2);

    // Check for keyword overlap
    const overlap = keywords1.filter(kw => keywords2.includes(kw));
    return overlap.length > 2;
  }

  /**
   * Resolve a conflict based on configuration and precedence rules
   */
  private resolveConflict(
    conflict: RuleConflict,
    config: Configuration
  ): ConflictResolution {
    const { rule1, rule2, type } = conflict;

    // Apply precedence rules
    // 1. User Override (from configuration)
    // 2. Category-Specific
    // 3. Universal
    // 4. Default

    // Check if either rule is disabled in configuration
    const r1Enabled = this.isRuleEnabledInConfig(rule1, config);
    const r2Enabled = this.isRuleEnabledInConfig(rule2, config);

    if (!r1Enabled && r2Enabled) {
      return {
        conflict,
        resolution: 'use_rule2',
        rationale: 'Rule 1 is disabled in configuration',
        appliedRule: rule2
      };
    }

    if (r1Enabled && !r2Enabled) {
      return {
        conflict,
        resolution: 'use_rule1',
        rationale: 'Rule 2 is disabled in configuration',
        appliedRule: rule1
      };
    }

    // Category-specific wins over universal
    const r1IsUniversal = rule1.category.includes('universal' as Category);
    const r2IsUniversal = rule2.category.includes('universal' as Category);

    if (!r1IsUniversal && r2IsUniversal) {
      return {
        conflict,
        resolution: 'use_rule1',
        rationale: 'Category-specific rule takes precedence over universal rule',
        appliedRule: rule1
      };
    }

    if (r1IsUniversal && !r2IsUniversal) {
      return {
        conflict,
        resolution: 'use_rule2',
        rationale: 'Category-specific rule takes precedence over universal rule',
        appliedRule: rule2
      };
    }

    // Use highest severity
    const severityOrder = { ERROR: 3, WARNING: 2, INFO: 1 };
    if (severityOrder[rule1.severity] > severityOrder[rule2.severity]) {
      return {
        conflict,
        resolution: 'use_rule1',
        rationale: 'Rule 1 has higher severity',
        appliedRule: rule1
      };
    }

    if (severityOrder[rule2.severity] > severityOrder[rule1.severity]) {
      return {
        conflict,
        resolution: 'use_rule2',
        rationale: 'Rule 2 has higher severity',
        appliedRule: rule2
      };
    }

    // Cannot auto-resolve
    return {
      conflict,
      resolution: 'user_decision',
      rationale: 'Conflict requires manual review and decision'
    };
  }

  /**
   * Check if rule is enabled in configuration
   */
  private isRuleEnabledInConfig(rule: Rule, config: Configuration): boolean {
    const ruleKey = rule.id.split('-').pop();
    if (ruleKey && config.c_standards.universal_rules) {
      const severity = config.c_standards.universal_rules[ruleKey as keyof typeof config.c_standards.universal_rules];
      return severity !== 'disabled';
    }
    return true;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(
    conflicts: RuleConflict[],
    resolutions: ConflictResolution[]
  ): ConflictReport['summary'] {
    const summary = {
      total: conflicts.length,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 0,
      unresolved: 0
    };

    for (const conflict of conflicts) {
      if (conflict.severity === 'high') summary.high++;
      if (conflict.severity === 'medium') summary.medium++;
      if (conflict.severity === 'low') summary.low++;
    }

    for (const resolution of resolutions) {
      if (resolution.resolution === 'user_decision') {
        summary.unresolved++;
      } else {
        summary.resolved++;
      }
    }

    return summary;
  }

  /**
   * Generate a formatted conflict report
   */
  generateReport(report: ConflictReport): string {
    let output = '# Rule Conflict Detection Report\n\n';

    output += `## Summary\n\n`;
    output += `- Total conflicts: ${report.summary.total}\n`;
    output += `- High severity: ${report.summary.high}\n`;
    output += `- Medium severity: ${report.summary.medium}\n`;
    output += `- Low severity: ${report.summary.low}\n`;
    output += `- Auto-resolved: ${report.summary.resolved}\n`;
    output += `- Requires review: ${report.summary.unresolved}\n\n`;

    if (report.conflicts.length === 0) {
      output += 'No conflicts detected.\n';
      return output;
    }

    output += `## Conflicts\n\n`;

    for (let i = 0; i < report.conflicts.length; i++) {
      const conflict = report.conflicts[i];
      const resolution = report.resolutions[i];

      output += `### Conflict ${i + 1}: ${conflict.type.toUpperCase()} (${conflict.severity})\n\n`;
      output += `**Description:** ${conflict.description}\n\n`;
      output += `**Rules:**\n`;
      output += `- ${conflict.rule1.id}: ${conflict.rule1.name}\n`;
      output += `- ${conflict.rule2.id}: ${conflict.rule2.name}\n\n`;
      output += `**Reason:** ${conflict.reason}\n\n`;
      output += `**Suggestion:** ${conflict.suggestion}\n\n`;
      output += `**Resolution:** ${resolution.resolution}\n`;
      output += `**Rationale:** ${resolution.rationale}\n`;

      if (resolution.appliedRule) {
        output += `**Applied Rule:** ${resolution.appliedRule.id}\n`;
      }

      output += '\n';
    }

    return output;
  }
}

