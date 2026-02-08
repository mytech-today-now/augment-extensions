import { FountainElement, ElementType } from './parser';
import { RenderResult } from './renderer';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'page-length' | 'classification' | 'heuristic' | 'html-quality';
  message: string;
  details?: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    infos: number;
  };
}

/**
 * Validate page length against expected range
 */
export function validatePageLength(
  estimatedPages: number,
  expectedPages: number,
  tolerance: number = 0.1
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const minPages = expectedPages * (1 - tolerance);
  const maxPages = expectedPages * (1 + tolerance);
  
  if (estimatedPages < minPages) {
    issues.push({
      severity: 'warning',
      category: 'page-length',
      message: `Page count too low: ${estimatedPages} pages (expected ${expectedPages} ±${tolerance * 100}%)`,
      details: `Expected range: ${minPages.toFixed(1)} - ${maxPages.toFixed(1)} pages`
    });
  } else if (estimatedPages > maxPages) {
    issues.push({
      severity: 'warning',
      category: 'page-length',
      message: `Page count too high: ${estimatedPages} pages (expected ${expectedPages} ±${tolerance * 100}%)`,
      details: `Expected range: ${minPages.toFixed(1)} - ${maxPages.toFixed(1)} pages`
    });
  } else {
    issues.push({
      severity: 'info',
      category: 'page-length',
      message: `Page count within expected range: ${estimatedPages} pages`,
      details: `Expected: ${expectedPages} pages ±${tolerance * 100}%`
    });
  }
  
  return issues;
}

/**
 * Validate element classification
 */
export function validateClassification(elements: FountainElement[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const prevElement = i > 0 ? elements[i - 1] : null;
    const nextElement = i < elements.length - 1 ? elements[i + 1] : null;
    
    // Dialogue should follow character
    if (element.type === 'dialogue' && prevElement?.type !== 'character' && prevElement?.type !== 'parenthetical') {
      issues.push({
        severity: 'error',
        category: 'classification',
        message: `Dialogue without character name at line ${element.lineNumber}`,
        details: `Dialogue: "${element.text.substring(0, 50)}..."`
      });
    }
    
    // Character should be followed by dialogue or parenthetical
    if (element.type === 'character' && nextElement && nextElement.type !== 'dialogue' && nextElement.type !== 'parenthetical') {
      issues.push({
        severity: 'warning',
        category: 'classification',
        message: `Character name not followed by dialogue at line ${element.lineNumber}`,
        details: `Character: "${element.text}"`
      });
    }
    
    // Check for potential misclassified character lists
    if (element.type === 'dialogue' && element.text.match(/^[-•*]\s/)) {
      issues.push({
        severity: 'error',
        category: 'classification',
        message: `Bullet list misclassified as dialogue at line ${element.lineNumber}`,
        details: `Text: "${element.text.substring(0, 50)}..."`
      });
    }
  }
  
  return issues;
}

/**
 * Validate heuristics (common screenplay patterns)
 */
export function validateHeuristics(elements: FountainElement[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  const elementCounts: Record<ElementType, number> = {} as any;
  for (const element of elements) {
    elementCounts[element.type] = (elementCounts[element.type] || 0) + 1;
  }
  
  // Check for reasonable element distribution
  const totalElements = elements.length;
  const actionCount = elementCounts['action'] || 0;
  const dialogueCount = elementCounts['dialogue'] || 0;
  
  if (totalElements > 0) {
    const actionRatio = actionCount / totalElements;
    const dialogueRatio = dialogueCount / totalElements;
    
    if (actionRatio < 0.1) {
      issues.push({
        severity: 'warning',
        category: 'heuristic',
        message: `Very low action ratio: ${(actionRatio * 100).toFixed(1)}%`,
        details: 'Screenplays typically have significant action description'
      });
    }
    
    if (dialogueRatio > 0.8) {
      issues.push({
        severity: 'warning',
        category: 'heuristic',
        message: `Very high dialogue ratio: ${(dialogueRatio * 100).toFixed(1)}%`,
        details: 'Screenplays should balance dialogue with action'
      });
    }
  }
  
  // Check for scene headings
  if (!elementCounts['scene-heading']) {
    issues.push({
      severity: 'warning',
      category: 'heuristic',
      message: 'No scene headings found',
      details: 'Screenplays should have scene headings (INT./EXT.)'
    });
  }
  
  return issues;
}

/**
 * Validate HTML quality
 */
export function validateHTMLQuality(html: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for markdown syntax leakage
  if (html.match(/\*\*[^<>]+\*\*/)) {
    issues.push({
      severity: 'error',
      category: 'html-quality',
      message: 'Markdown bold syntax (**) found in HTML output',
      details: 'Markdown should be preprocessed before rendering'
    });
  }
  
  if (html.match(/\*[^<>*]+\*/)) {
    issues.push({
      severity: 'error',
      category: 'html-quality',
      message: 'Markdown italic syntax (*) found in HTML output',
      details: 'Markdown should be preprocessed before rendering'
    });
  }

  if (html.match(/##\s+[^<>]+/)) {
    issues.push({
      severity: 'error',
      category: 'html-quality',
      message: 'Markdown heading syntax (##) found in HTML output',
      details: 'Markdown should be preprocessed before rendering'
    });
  }

  // Check for well-formed HTML
  if (html.includes('<!DOCTYPE html>')) {
    if (!html.includes('</html>')) {
      issues.push({
        severity: 'error',
        category: 'html-quality',
        message: 'HTML document not properly closed',
        details: 'Missing </html> tag'
      });
    }

    if (!html.includes('</body>')) {
      issues.push({
        severity: 'error',
        category: 'html-quality',
        message: 'HTML body not properly closed',
        details: 'Missing </body> tag'
      });
    }
  }

  return issues;
}

/**
 * Generate comprehensive validation report
 */
export function generateValidationReport(
  elements: FountainElement[],
  renderResult: RenderResult,
  expectedPages?: number
): ValidationReport {
  const issues: ValidationIssue[] = [];

  // Validate page length if expected pages provided
  if (expectedPages !== undefined) {
    issues.push(...validatePageLength(renderResult.estimatedPages, expectedPages));
  }

  // Validate element classification
  issues.push(...validateClassification(elements));

  // Validate heuristics
  issues.push(...validateHeuristics(elements));

  // Validate HTML quality
  issues.push(...validateHTMLQuality(renderResult.html));

  // Calculate summary
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos = issues.filter(i => i.severity === 'info').length;

  return {
    valid: errors === 0,
    issues,
    summary: {
      totalIssues: issues.length,
      errors,
      warnings,
      infos
    }
  };
}

