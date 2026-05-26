/**
 * AST Parser helpers for TypeScript/JavaScript source.
 */

import * as fs from 'fs';
import { ASTNode } from './types';

const { parse } = require('@typescript-eslint/typescript-estree') as {
  parse: (sourceCode: string, options: Record<string, unknown>) => unknown;
};

export interface ParseOptions {
  jsx?: boolean;
  sourceType?: 'script' | 'module';
  loc?: boolean;
  range?: boolean;
  tokens?: boolean;
  comment?: boolean;
}

export interface ParseResult {
  ast: ASTNode;
  filePath: string;
  sourceCode: string;
}

export function parseFile(filePath: string, options: ParseOptions = {}): ParseResult {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  return {
    ast: parseCode(sourceCode, options),
    filePath,
    sourceCode
  };
}

export function parseCode(sourceCode: string, options: ParseOptions = {}): ASTNode {
  try {
    return parse(sourceCode, {
      jsx: options.jsx ?? true,
      sourceType: options.sourceType ?? 'module',
      loc: options.loc ?? true,
      range: options.range ?? true,
      tokens: options.tokens ?? false,
      comment: options.comment ?? false,
      errorOnUnknownASTType: false,
      errorOnTypeScriptSyntacticAndSemanticIssues: false
    }) as unknown as ASTNode;
  } catch (error) {
    throw new Error(`Failed to parse source: ${String(error)}`);
  }
}

export function traverseAST(
  node: ASTNode | null | undefined,
  visitor: {
    enter?: (node: ASTNode, parent?: ASTNode) => void;
    leave?: (node: ASTNode, parent?: ASTNode) => void;
  },
  parent?: ASTNode
): void {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') {
    return;
  }

  visitor.enter?.(node, parent);

  for (const child of Object.values(node)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        if (isAstNode(item)) {
          traverseAST(item, visitor, node);
        }
      }
      continue;
    }

    if (isAstNode(child)) {
      traverseAST(child, visitor, node);
    }
  }

  visitor.leave?.(node, parent);
}

export function findNodesByType(ast: ASTNode, nodeType: string): ASTNode[] {
  const nodes: ASTNode[] = [];

  traverseAST(ast, {
    enter: (node) => {
      if (node.type === nodeType) {
        nodes.push(node);
      }
    }
  });

  return nodes;
}

export function getFunctionDeclarations(ast: ASTNode): ASTNode[] {
  return findNodesByType(ast, 'FunctionDeclaration');
}

export function getClassDeclarations(ast: ASTNode): ASTNode[] {
  return findNodesByType(ast, 'ClassDeclaration');
}

function isAstNode(value: unknown): value is ASTNode {
  return typeof value === 'object' && value !== null && typeof (value as ASTNode).type === 'string';
}