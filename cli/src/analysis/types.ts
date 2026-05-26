/**
 * Code Analysis Types and Interfaces
 */

export type AnalysisType = 'complexity' | 'patterns' | 'security' | 'quality' | 'dependencies';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type OutputFormat = 'text' | 'json' | 'markdown';

export interface AnalysisOptions {
  file?: string;
  dir?: string;
  pattern?: string;
  type: AnalysisType;
  severity: Severity;
  format: OutputFormat;
  fix?: boolean;
}

export interface AnalysisIssue {
  file: string;
  line: number;
  column?: number;
  type: string;
  severity: Severity;
  message: string;
  recommendation?: string;
  code?: string;
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  lines: number;
  functions: number;
  classes: number;
}

export interface FunctionComplexity {
  name: string;
  cyclomatic: number;
  cognitive: number;
  startLine: number;
  endLine: number;
  severity: Severity;
}

export interface FileComplexityAnalysis {
  file: string;
  metrics: ComplexityMetrics;
  functions: FunctionComplexity[];
}

export interface DependencyInfo {
  source: string;
  imported: string;
  type: 'import' | 'require' | 'dynamic';
  specifiers: string[];
  line: number;
}

export interface CircularDependency {
  cycle: string[];
  severity: Severity;
}

export interface DependencyAnalysis {
  file: string;
  dependencies: DependencyInfo[];
  exports: string[];
  circularDependencies: CircularDependency[];
}

export interface SecurityVulnerability {
  file: string;
  line: number;
  column?: number;
  type: string;
  severity: Severity;
  description: string;
  fix?: string;
  cwe?: string;
}

export interface PatternDetection {
  file: string;
  pattern: string;
  type: 'design-pattern' | 'anti-pattern';
  line: number;
  description: string;
}

export interface AnalysisSummary {
  filesAnalyzed: number;
  issuesFound: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  averageComplexity?: number;
  averageMaintainability?: number;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  issues: AnalysisIssue[];
  complexity?: FileComplexityAnalysis[];
  dependencies?: DependencyAnalysis[];
  security?: SecurityVulnerability[];
  patterns?: PatternDetection[];
}

export interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  [key: string]: unknown;
}