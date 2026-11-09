import { describe, it, expect } from '@jest/globals';
import { spawnSync } from 'child_process';

describe('CommonJS runtime compatibility', () => {
  it('loads the CLI Chalk styles synchronously through CommonJS', () => {
    const script = `
      const chalk = require('chalk');
      const styles = ['blue', 'bold', 'cyan', 'gray', 'green', 'magenta', 'red', 'white', 'yellow'];
      for (const style of styles) {
        if (typeof chalk[style] !== 'function') throw new Error('Missing Chalk style: ' + style);
      }
      for (const style of ['bold.blue', 'bold.cyan', 'bold.green', 'bold.white', 'green.bold', 'red.bold', 'yellow.bold']) {
        const value = style.split('.').reduce((current, part) => current[part], chalk);
        if (typeof value !== 'function') throw new Error('Missing Chalk chain: ' + style);
      }
      if (!chalk.red('error').includes('error')) throw new Error('Chalk output was not preserved');
    `;
    const result = spawnSync(process.execPath, ['-e', script], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });
});
