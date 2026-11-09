import { parseCode, traverseAST } from '../ast-parser';
import { ASTNode } from '../types';

describe('AST parser', () => {
  it('parses TypeScript with JSX into an ESTree Program', () => {
    const source = [
      'interface Props { name: string }',
      'export const Greeting = ({ name }: Props) => <div>{name}</div>;',
      ''
    ].join('\n');

    const ast = parseCode(source);
    const types: string[] = [];
    traverseAST(ast, { enter: (node) => types.push(node.type) });

    expect(ast.type).toBe('Program');
    expect(ast.loc?.start.line).toBe(1);
    expect(ast.range).toEqual([0, source.length]);
    expect(types).toContain('TSInterfaceDeclaration');
    expect(types).toContain('ArrowFunctionExpression');
    expect(types).toContain('JSXElement');
  });

  it('omits locations and ranges when requested', () => {
    const ast = parseCode('const value: string = "ok";', { loc: false, range: false });
    const nodes: ASTNode[] = [];
    traverseAST(ast, { enter: (node) => nodes.push(node) });

    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every((node) => node.loc === undefined && node.range === undefined)).toBe(true);
  });

  it('wraps syntax errors with the parser context', () => {
    expect(() => parseCode('const = ;')).toThrow('Failed to parse source:');
  });
});
