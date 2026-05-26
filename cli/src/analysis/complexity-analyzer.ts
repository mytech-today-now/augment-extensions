/**
 * Complexity Analyzer Module
 */

import { parseFile, traverseAST } from './ast-parser';
import { ASTNode, ComplexityMetrics, FileComplexityAnalysis, FunctionComplexity, Severity } from './types';

export function calculateCyclomaticComplexity(node: ASTNode): number {
  let complexity = 1;

  traverseAST(node, {
    enter: (childNode) => {
      switch (childNode.type) {
        case 'IfStatement':
        case 'ConditionalExpression':
        case 'SwitchCase':
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
        case 'WhileStatement':
        case 'DoWhileStatement':
        case 'CatchClause':
          complexity += 1;
          break;
        case 'LogicalExpression': {
          const operator = getStringProperty(childNode, 'operator');
          if (operator === '&&' || operator === '||') {
            complexity += 1;
          }
          break;
        }
      }
    }
  });

  return complexity;
}

export function calculateCognitiveComplexity(node: ASTNode): number {
  const visited = new Set<ASTNode>();

  const traverse = (currentNode: ASTNode, level: number): number => {
    if (visited.has(currentNode)) {
      return 0;
    }

    visited.add(currentNode);

    let complexity = 0;
    let nextLevel = level;

    switch (currentNode.type) {
      case 'IfStatement':
      case 'ConditionalExpression':
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'CatchClause':
        complexity += 1 + level;
        nextLevel = level + 1;
        break;
      case 'SwitchCase':
        complexity += 1 + level;
        break;
      case 'LogicalExpression': {
        const operator = getStringProperty(currentNode, 'operator');
        if (operator === '&&' || operator === '||') {
          complexity += 1;
        }
        break;
      }
      case 'BreakStatement':
      case 'ContinueStatement':
        if (currentNode.label) {
          complexity += 1;
        }
        break;
    }

    for (const child of Object.values(currentNode)) {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (isAstNode(item)) {
            complexity += traverse(item, nextLevel);
          }
        }
        continue;
      }

      if (isAstNode(child)) {
        complexity += traverse(child, nextLevel);
      }
    }

    return complexity;
  };

  return traverse(node, 0);
}

export function analyzeFunctionComplexity(node: ASTNode, functionName: string): FunctionComplexity {
  const cyclomatic = calculateCyclomaticComplexity(node);
  const cognitive = calculateCognitiveComplexity(node);

  return {
    name: functionName,
    cyclomatic,
    cognitive,
    startLine: node.loc?.start.line ?? 0,
    endLine: node.loc?.end.line ?? 0,
    severity: getComplexitySeverity(cyclomatic, cognitive)
  };
}

export function analyzeFileComplexity(filePath: string): FileComplexityAnalysis {
  const { ast } = parseFile(filePath);
  const functions: FunctionComplexity[] = [];
  let functionCount = 0;
  let classCount = 0;

  traverseAST(ast, {
    enter: (node) => {
      if (isFunctionNode(node.type)) {
        functionCount += 1;
        functions.push(analyzeFunctionComplexity(node, getFunctionName(node)));
      }

      if (node.type === 'ClassDeclaration') {
        classCount += 1;
      }
    }
  });

  const metrics: ComplexityMetrics = {
    cyclomatic: functions.reduce((sum, func) => sum + func.cyclomatic, 0),
    cognitive: functions.reduce((sum, func) => sum + func.cognitive, 0),
    lines: ast.loc?.end.line ?? 0,
    functions: functionCount,
    classes: classCount
  };

  return {
    file: filePath,
    metrics,
    functions
  };
}

function getComplexitySeverity(cyclomatic: number, cognitive: number): Severity {
  if (cyclomatic > 20 || cognitive > 25) {
    return 'high';
  }

  if (cyclomatic > 10 || cognitive > 15) {
    return 'medium';
  }

  return 'low';
}

function isFunctionNode(type: string): boolean {
  return type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression';
}

function getFunctionName(node: ASTNode): string {
  const id = node.id;
  if (typeof id === 'object' && id !== null && typeof (id as Record<string, unknown>).name === 'string') {
    return String((id as Record<string, unknown>).name);
  }

  return node.type === 'ArrowFunctionExpression' ? 'arrow' : 'anonymous';
}

function getStringProperty(node: ASTNode, key: string): string | undefined {
  const value = node[key];
  return typeof value === 'string' ? value : undefined;
}

function isAstNode(value: unknown): value is ASTNode {
  return typeof value === 'object' && value !== null && typeof (value as ASTNode).type === 'string';
}