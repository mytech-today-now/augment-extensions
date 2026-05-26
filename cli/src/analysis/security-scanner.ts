/**
 * Security Scanner Module
 */

import { parseFile, traverseAST } from './ast-parser';
import { ASTNode, SecurityVulnerability, Severity } from './types';

interface SecurityRule {
  id: string;
  name: string;
  severity: Severity;
  cwe?: string;
  check: (node: ASTNode, context: SecurityContext) => SecurityVulnerability | null;
}

interface SecurityContext {
  filePath: string;
  sourceCode: string;
}

export function scanFile(filePath: string): SecurityVulnerability[] {
  const { ast, sourceCode } = parseFile(filePath);
  const vulnerabilities: SecurityVulnerability[] = [];
  const context: SecurityContext = { filePath, sourceCode };

  traverseAST(ast, {
    enter: (node) => {
      for (const rule of getSecurityRules()) {
        const vulnerability = rule.check(node, context);
        if (vulnerability) {
          vulnerabilities.push(vulnerability);
        }
      }
    }
  });

  return vulnerabilities;
}

function getSecurityRules(): SecurityRule[] {
  return [
    sqlInjectionRule,
    xssRule,
    commandInjectionRule,
    pathTraversalRule,
    insecureRandomRule,
    hardcodedSecretsRule,
    unsafeEvalRule,
    weakCryptoRule
  ];
}

const sqlInjectionRule: SecurityRule = {
  id: 'sql-injection',
  name: 'SQL Injection',
  severity: 'high',
  cwe: 'CWE-89',
  check: (node, context) => {
    if (node.type !== 'CallExpression') {
      return null;
    }

    const callee = node.callee;
    const firstArg = getArrayItem(node.arguments, 0);

    if (isMemberExpression(callee) && ['query', 'execute', 'exec'].includes(getPropertyName(callee) ?? '')) {
      if (isAstNode(firstArg) && (firstArg.type === 'TemplateLiteral' || firstArg.type === 'BinaryExpression')) {
        return issue(context.filePath, node, 'sql-injection', 'high', 'Potential SQL injection vulnerability detected', 'Use parameterized queries or prepared statements', 'CWE-89');
      }
    }

    return null;
  }
};

const xssRule: SecurityRule = {
  id: 'xss',
  name: 'Cross-Site Scripting',
  severity: 'high',
  cwe: 'CWE-79',
  check: (node, context) => {
    if (node.type !== 'MemberExpression') {
      return null;
    }

    if (getPropertyName(node) === 'innerHTML') {
      return issue(context.filePath, node, 'xss', 'high', 'Potential XSS vulnerability: innerHTML usage', 'Use textContent or sanitize input before setting innerHTML', 'CWE-79');
    }

    return null;
  }
};

const commandInjectionRule: SecurityRule = {
  id: 'command-injection',
  name: 'Command Injection',
  severity: 'critical',
  cwe: 'CWE-78',
  check: (node, context) => {
    if (node.type !== 'CallExpression') {
      return null;
    }

    const callee = node.callee;
    const firstArg = getArrayItem(node.arguments, 0);
    if (isIdentifier(callee) && ['exec', 'spawn', 'execSync', 'spawnSync'].includes(getName(callee) ?? '')) {
      if (isAstNode(firstArg) && firstArg.type === 'TemplateLiteral') {
        return issue(context.filePath, node, 'command-injection', 'critical', 'Potential command injection vulnerability', 'Validate and sanitize all user input, use array form for spawn', 'CWE-78');
      }
    }

    return null;
  }
};

const pathTraversalRule: SecurityRule = {
  id: 'path-traversal',
  name: 'Path Traversal',
  severity: 'high',
  cwe: 'CWE-22',
  check: () => null
};

const insecureRandomRule: SecurityRule = {
  id: 'insecure-random',
  name: 'Insecure Random Number Generation',
  severity: 'medium',
  cwe: 'CWE-338',
  check: (node, context) => {
    if (node.type !== 'CallExpression') {
      return null;
    }

    const callee = node.callee;
    if (isMemberExpression(callee) && getObjectName(callee) === 'Math' && getPropertyName(callee) === 'random') {
      return issue(context.filePath, node, 'insecure-random', 'medium', 'Math.random() is not cryptographically secure', 'Use crypto.randomBytes() or crypto.getRandomValues() for security-sensitive operations', 'CWE-338');
    }

    return null;
  }
};

const hardcodedSecretsRule: SecurityRule = {
  id: 'hardcoded-secrets',
  name: 'Hardcoded Secrets',
  severity: 'critical',
  cwe: 'CWE-798',
  check: (node, context) => {
    if (node.type !== 'VariableDeclarator') {
      return null;
    }

    const id = node.id;
    const init = node.init;
    const name = isIdentifier(id) ? (getName(id) ?? '').toLowerCase() : '';
    const suspiciousNames = ['password', 'secret', 'apikey', 'api_key', 'token', 'private_key'];

    if (suspiciousNames.some((item) => name.includes(item)) && isLiteralString(init)) {
      return issue(context.filePath, node, 'hardcoded-secrets', 'critical', 'Potential hardcoded secret detected', 'Use environment variables or secure secret management', 'CWE-798');
    }

    return null;
  }
};

const unsafeEvalRule: SecurityRule = {
  id: 'unsafe-eval',
  name: 'Unsafe eval() Usage',
  severity: 'critical',
  cwe: 'CWE-95',
  check: (node, context) => {
    if (node.type !== 'CallExpression') {
      return null;
    }

    if (isIdentifier(node.callee) && getName(node.callee) === 'eval') {
      return issue(context.filePath, node, 'unsafe-eval', 'critical', 'Use of eval() is dangerous and should be avoided', 'Refactor code to avoid eval(), use safer alternatives', 'CWE-95');
    }

    return null;
  }
};

const weakCryptoRule: SecurityRule = {
  id: 'weak-crypto',
  name: 'Weak Cryptographic Algorithm',
  severity: 'high',
  cwe: 'CWE-327',
  check: (node, context) => {
    if (node.type !== 'CallExpression') {
      return null;
    }

    const callee = node.callee;
    const firstArg = getArrayItem(node.arguments, 0);
    if (isMemberExpression(callee) && getPropertyName(callee) === 'createHash' && isLiteralString(firstArg)) {
      const algorithm = String(firstArg.value).toLowerCase();
      if (algorithm === 'md5' || algorithm === 'sha1') {
        return issue(context.filePath, node, 'weak-crypto', 'high', `Weak cryptographic algorithm detected: ${algorithm}`, 'Use SHA-256 or stronger algorithms', 'CWE-327');
      }
    }

    return null;
  }
};

function issue(
  file: string,
  node: ASTNode,
  type: string,
  severity: Severity,
  description: string,
  fix?: string,
  cwe?: string
): SecurityVulnerability {
  return {
    file,
    line: node.loc?.start.line ?? 0,
    column: node.loc?.start.column,
    type,
    severity,
    description,
    fix,
    cwe
  };
}

function getArrayItem(value: unknown, index: number): unknown {
  return Array.isArray(value) ? value[index] : undefined;
}

function getName(node: ASTNode): string | undefined {
  return typeof node.name === 'string' ? node.name : undefined;
}

function getObjectName(node: ASTNode): string | undefined {
  return isAstNode(node.object) ? getName(node.object) : undefined;
}

function getPropertyName(node: ASTNode): string | undefined {
  return isAstNode(node.property) ? getName(node.property) : undefined;
}

function isIdentifier(node: unknown): node is ASTNode {
  return isAstNode(node) && node.type === 'Identifier';
}

function isMemberExpression(node: unknown): node is ASTNode {
  return isAstNode(node) && node.type === 'MemberExpression';
}

function isLiteralString(node: unknown): node is ASTNode & { value: string } {
  return isAstNode(node) && node.type === 'Literal' && typeof node.value === 'string';
}

function isAstNode(value: unknown): value is ASTNode {
  return typeof value === 'object' && value !== null && typeof (value as ASTNode).type === 'string';
}