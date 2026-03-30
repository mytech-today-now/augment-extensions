import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'fs/promises';
import { searchCommand } from '@cli/commands/search';
import { linkCommand } from '@cli/commands/link';
import { TestEnvironment } from '../../helpers/test-env';

describe('Top-level module command regression', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testEnv = new TestEnvironment();
    await testEnv.setup();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    await testEnv.cleanup();
  });

  it('searchCommand includes top-level modules', async () => {
    await searchCommand('visual', {});

    const output = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(output).toContain('visual-design');
  });

  it('linkCommand links a top-level module by exact name', async () => {
    const project = await testEnv.createProject();
    process.chdir(project.path);

    await linkCommand('visual-design', {});

    const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
    expect(config.modules.some((module: { name: string }) => module.name === 'visual-design')).toBe(true);
  });
});