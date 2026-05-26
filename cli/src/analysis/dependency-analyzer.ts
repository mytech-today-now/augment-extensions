/**
 * Dependency Analyzer Module
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseFile, traverseAST } from './ast-parser';
import { ASTNode, CircularDependency, DependencyAnalysis, DependencyInfo } from './types';

export function extractDependencies(filePath: string): DependencyInfo[] {
  const { ast } = parseFile(filePath);
  const dependencies: DependencyInfo[] = [];

  traverseAST(ast, {
    enter: (node) => {
      if (node.type === 'ImportDeclaration') {
        dependencies.push({
          source: filePath,
          imported: getImportSource(node),
          type: 'import',
          specifiers: getImportSpecifiers(node),
          line: node.loc?.start.line ?? 0
        });
      }

      if (node.type === 'CallExpression' && isRequireCall(node)) {
        dependencies.push({
          source: filePath,
          imported: getLiteralValue(getArrayItem(node.arguments, 0)),
          type: 'require',
          specifiers: [],
          line: node.loc?.start.line ?? 0
        });
      }

      if (node.type === 'ImportExpression') {
        dependencies.push({
          source: filePath,
          imported: getLiteralValue(node.source),
          type: 'dynamic',
          specifiers: [],
          line: node.loc?.start.line ?? 0
        });
      }
    }
  });

  return dependencies.filter((dep) => dep.imported.length > 0);
}

export function extractExports(filePath: string): string[] {
  const { ast } = parseFile(filePath);
  const exports: string[] = [];

  traverseAST(ast, {
    enter: (node) => {
      if (node.type === 'ExportNamedDeclaration') {
        collectDeclarationExports(node, exports);

        const specifiers = Array.isArray(node.specifiers) ? node.specifiers : [];
        for (const specifier of specifiers) {
          if (isAstNode(specifier)) {
            const exported = specifier.exported;
            if (typeof exported === 'object' && exported !== null && typeof (exported as Record<string, unknown>).name === 'string') {
              exports.push(String((exported as Record<string, unknown>).name));
            }
          }
        }
      }

      if (node.type === 'ExportDefaultDeclaration') {
        exports.push('default');
      }
    }
  });

  return Array.from(new Set(exports));
}

export function analyzeDependencies(filePath: string): DependencyAnalysis {
  return {
    file: filePath,
    dependencies: extractDependencies(filePath),
    exports: extractExports(filePath),
    circularDependencies: []
  };
}

export function detectCircularDependencies(files: string[]): CircularDependency[] {
  const dependencyMap = new Map<string, string[]>();

  for (const file of files) {
    try {
      const resolvedDeps = extractDependencies(file)
        .map((dep) => resolveDependencyPath(dep.imported, file))
        .filter((dep): dep is string => Boolean(dep));
      dependencyMap.set(file, resolvedDeps);
    } catch {
      dependencyMap.set(file, []);
    }
  }

  const cycles: CircularDependency[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (node: string, chain: string[]): void => {
    visited.add(node);
    recursionStack.add(node);
    const nextChain = [...chain, node];

    for (const neighbor of dependencyMap.get(node) ?? []) {
      if (!dependencyMap.has(neighbor)) {
        continue;
      }

      if (!visited.has(neighbor)) {
        dfs(neighbor, nextChain);
        continue;
      }

      if (recursionStack.has(neighbor)) {
        const cycleStart = nextChain.indexOf(neighbor);
        const cycle = cycleStart >= 0 ? nextChain.slice(cycleStart) : [neighbor];
        cycles.push({
          cycle: [...cycle, neighbor],
          severity: cycle.length > 3 ? 'high' : 'medium'
        });
      }
    }

    recursionStack.delete(node);
  };

  for (const file of files) {
    if (!visited.has(file)) {
      dfs(file, []);
    }
  }

  const seen = new Set<string>();
  return cycles.filter((cycle) => {
    const key = cycle.cycle.join('->');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function collectDeclarationExports(node: ASTNode, exports: string[]): void {
  const declaration = node.declaration;
  if (!isAstNode(declaration)) {
    return;
  }

  if (declaration.type === 'VariableDeclaration') {
    const declarations = Array.isArray(declaration.declarations) ? declaration.declarations : [];
    for (const item of declarations) {
      if (!isAstNode(item)) {
        continue;
      }

      const id = item.id;
      if (typeof id === 'object' && id !== null && typeof (id as Record<string, unknown>).name === 'string') {
        exports.push(String((id as Record<string, unknown>).name));
      }
    }
  }

  if ((declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') && declaration.id) {
    const id = declaration.id;
    if (typeof id === 'object' && id !== null && typeof (id as Record<string, unknown>).name === 'string') {
      exports.push(String((id as Record<string, unknown>).name));
    }
  }
}

function getImportSource(node: ASTNode): string {
  return getLiteralValue(node.source);
}

function getImportSpecifiers(node: ASTNode): string[] {
  const specifiers = Array.isArray(node.specifiers) ? node.specifiers : [];
  const names: string[] = [];

  for (const specifier of specifiers) {
    if (!isAstNode(specifier)) {
      continue;
    }

    const localName = getNestedName(specifier, 'local');
    const importedName = getNestedName(specifier, 'imported');

    switch (specifier.type) {
      case 'ImportDefaultSpecifier':
        if (localName) {
          names.push(localName);
        }
        break;
      case 'ImportNamespaceSpecifier':
        if (localName) {
          names.push(`* as ${localName}`);
        }
        break;
      case 'ImportSpecifier':
        if (importedName) {
          names.push(importedName);
        }
        break;
    }
  }

  return names;
}

function isRequireCall(node: ASTNode): boolean {
  const callee = node.callee;
  const firstArgument = getArrayItem(node.arguments, 0);
  return isAstNode(callee)
    && callee.type === 'Identifier'
    && getStringProperty(callee, 'name') === 'require'
    && Boolean(firstArgument)
    && isLiteralNode(firstArgument);
}

function resolveDependencyPath(imported: string, sourceFile: string): string | null {
  if (!imported.startsWith('.')) {
    return null;
  }

  const sourceDir = path.dirname(sourceFile);
  const base = path.resolve(sourceDir, imported);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getLiteralValue(node: unknown): string {
  if (!isAstNode(node)) {
    return '';
  }

  const value = node.value;
  return typeof value === 'string' ? value : '';
}

function getNestedName(node: ASTNode, key: string): string | undefined {
  const child = node[key];
  if (typeof child === 'object' && child !== null && typeof (child as Record<string, unknown>).name === 'string') {
    return String((child as Record<string, unknown>).name);
  }
  return undefined;
}

function getStringProperty(node: ASTNode, key: string): string | undefined {
  const value = node[key];
  return typeof value === 'string' ? value : undefined;
}

function getArrayItem(value: unknown, index: number): unknown {
  return Array.isArray(value) ? value[index] : undefined;
}

function isLiteralNode(node: unknown): node is ASTNode {
  return isAstNode(node) && (node.type === 'Literal' || node.type === 'TemplateLiteral');
}

function isAstNode(value: unknown): value is ASTNode {
  return typeof value === 'object' && value !== null && typeof (value as ASTNode).type === 'string';
}