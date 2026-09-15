import { afterEach, describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  createZipArchiveFromDirectory,
  createZipArchiveFromEntries,
  extractZipArchiveSafely,
} from '@cli/utils/zip-archive';

describe('zip archive utilities', () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    while (tempRoots.length > 0) {
      const root = tempRoots.pop();
      if (root && existsSync(root)) {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it('round-trips an ai-prompts archive safely', async () => {
    const root = mkdtempSync(join(tmpdir(), 'augx-zip-'));
    tempRoots.push(root);

    const promptsDir = join(root, 'ai-prompts');
    mkdirSync(join(promptsDir, 'notes'), { recursive: true });
    writeFileSync(join(promptsDir, 'notes', 'prompt.md'), '# Prompt\nHello world\n', 'utf-8');

    const archivePath = join(root, 'ai-prompts.zip');
    const archive = createZipArchiveFromDirectory(promptsDir, archivePath, {
      rootFolder: 'ai-prompts',
    });

    rmSync(promptsDir, { recursive: true, force: true });

    const result = await extractZipArchiveSafely(archive.path, root, { force: true });

    expect(result.extracted).toBe(1);
    expect(readFileSync(join(root, 'ai-prompts', 'notes', 'prompt.md'), 'utf-8')).toContain('Hello world');
  });

  it('rejects traversal attempts when building an archive', () => {
    const root = mkdtempSync(join(tmpdir(), 'augx-zip-'));
    tempRoots.push(root);

    expect(() =>
      createZipArchiveFromEntries(
        [
          {
            relativePath: '../evil.txt',
            data: Buffer.from('evil'),
          },
        ],
        join(root, 'evil.zip')
      )
    ).toThrow('Unsafe archive path');
  });

  it('rejects extraction through a symlink ancestor', async () => {
    const root = mkdtempSync(join(tmpdir(), 'augx-zip-'));
    tempRoots.push(root);

    const sourceDir = join(root, 'source');
    const promptsDir = join(sourceDir, 'ai-prompts');
    mkdirSync(promptsDir, { recursive: true });
    writeFileSync(join(promptsDir, 'prompt.md'), '# Prompt\nHello world\n', 'utf-8');

    const archivePath = join(root, 'archive.zip');
    createZipArchiveFromDirectory(promptsDir, archivePath, { rootFolder: 'ai-prompts' });

    const destinationRoot = join(root, 'destination');
    const linkedTarget = join(root, 'linked-target');
    const symlinkPath = join(destinationRoot, 'ai-prompts');

    mkdirSync(destinationRoot, { recursive: true });
    mkdirSync(linkedTarget, { recursive: true });
    symlinkSync(linkedTarget, symlinkPath, 'junction');

    await expect(extractZipArchiveSafely(archivePath, destinationRoot, { force: true })).rejects.toThrow(
      'symbolic link'
    );
  });
});
