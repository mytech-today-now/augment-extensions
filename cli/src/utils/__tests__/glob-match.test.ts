import { matchesGlob } from '../glob-match';

describe('matchesGlob', () => {
  it('matches recursive rule file patterns', () => {
    expect(matchesGlob('coding-standards/typescript/rules/types.md', '**/rules/*.md')).toBe(true);
    expect(matchesGlob('coding-standards/typescript/examples/sample.ts', '**/rules/*.md')).toBe(false);
  });

  it('respects the dot option for hidden project files', () => {
    expect(matchesGlob('.augment/coordination.json', '**/*')).toBe(false);
    expect(matchesGlob('.augment/coordination.json', '**/*', { dot: true })).toBe(true);
  });
});
