type MatchOptions = {
  dot?: boolean;
};

const minimatch = require('minimatch') as (
  input: string,
  pattern: string,
  options?: MatchOptions
) => boolean;

export function matchesGlob(input: string, pattern: string, options?: MatchOptions): boolean {
  return minimatch(input, pattern, options);
}
