import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../../package.json'), 'utf-8').replace(/^\uFEFF/, '')
);

export const augxVersion = packageJson.version as string;
