import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { guiCommand } from '../cli/src/commands/gui';
import { discoverModules, discoverCollections, moduleMatchesSearch, validateModuleStructure, validateModuleCategory, calculateModuleCharacterCount, type Module } from '../cli/src/utils/module-system';
import { validateModuleDocumentation } from '../cli/src/utils/documentation-validator';
import { getGuiModuleAssets } from '../cli/src/commands/gui-module-manager';
import * as decisionBridge from '../cli/src/utils/decision-runner';
import { generateModulesCatalog } from '../cli/src/utils/modules-catalog';
import { type InteractivePrompt } from '../cli/src/utils/interactive-prompt';
import { formatModuleChoice, fuzzySearch } from '../cli/src/utils/gui-helpers';
import { DEFAULT_GUI_CONFIG } from '../cli/src/types/gui';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return { ...actual, writeFileSync: vi.fn(actual.writeFileSync) };
});
const writeFile = require('fs').writeFileSync as typeof fs.writeFileSync;

const repository = process.cwd();
const cli = path.join(repository, 'cli/dist/cli.js');
let root: string;
let log: ReturnType<typeof vi.spyOn>;
let errors: ReturnType<typeof vi.spyOn>;
const configPath = () => path.join(root, '.augment/extensions.json');
const read = () => JSON.parse(fs.readFileSync(configPath(), 'utf8'));
function seed(modules: unknown[] = []) {
  fs.writeFileSync(configPath(), JSON.stringify({ version: 'legacy', modules, custom: { preserve: true } }));
}
function scripted(answers: Record<string, unknown>[], inspect?: (questions: any[]) => void): InteractivePrompt {
  return { prompt: vi.fn(async (questions: any) => {
    inspect?.(questions);
    if (!answers.length) throw new Error('Unexpected extra prompt');
    return answers.shift();
  }) as InteractivePrompt['prompt'] };
}
beforeEach(() => {
  vi.mocked(fs.writeFileSync).mockImplementation(writeFile);
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'augx GUI unicodé '));
  fs.mkdirSync(path.join(root, '.augment'));
  fs.mkdirSync(path.join(root, '.git'));
  seed();
  process.chdir(root);
  log = vi.spyOn(console, 'log').mockImplementation(() => {});
  errors = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.chdir(repository);
  vi.restoreAllMocks();
  process.exitCode = 0;
  fs.rmSync(root, { recursive: true, force: true });
});

describe('real terminal manager integration', () => {
  it('ships valid cross-platform guidance with accurate metadata and accessible usage', () => {
    const module = discoverModules().find(m => m.fullName === 'workflows/cross-platform')!;
    expect(validateModuleStructure(module.path).errors).toEqual([]);
    expect(validateModuleCategory(module).errors).toEqual([]);
    expect(validateModuleDocumentation(module).errors).toEqual([]);
    expect(module.metadata.augment?.characterCount).toBe(calculateModuleCharacterCount(module.path));
    expect(getGuiModuleAssets(module)).toEqual(expect.arrayContaining(['README.md', 'rules/export-guide.md', 'examples/end-to-end-session.md']));
    expect(moduleMatchesSearch(module, 'CROSS-PLATFORM')).toBe(true);
  });

  it('reports a simulated filesystem write denial through the real lifecycle without changing bytes or exiting', async () => {
    const original = fs.readFileSync(configPath(), 'utf8');
    vi.mocked(fs.writeFileSync).mockImplementation(((file: any, ...args: any[]) => {
      if (path.resolve(String(file)) === path.resolve(configPath())) throw Object.assign(new Error('Permission denied'), { code: 'EACCES' });
      return (writeFile as any)(file, ...args);
    }) as any);
    await guiCommand({}, scripted([
      { action: 'link-modules' }, { selectedModules: ['coding-standards/java'] }, { confirm: true }, { action: 'exit' }
    ]));
    expect(fs.readFileSync(configPath(), 'utf8')).toBe(original);
    expect(errors.mock.calls.flat().join()).toContain('Permission denied');
    expect(log.mock.calls.flat().join()).toContain('0 succeeded, 1 failed');
    expect(log.mock.calls.flat().join()).toContain('Goodbye');
  });
  it('rejects a nonexistent explicit project scope without creating it', async () => {
    const directory = path.join(root, 'missing');
    await guiCommand({ project: directory }, scripted([]));
    expect(fs.existsSync(directory)).toBe(false);
    expect(errors.mock.calls.flat().join()).toContain('Project scope must be an existing directory');
  });
  it('bounds pagination for a small terminal while retaining every available canonical choice', async () => {
    const rows = Object.getOwnPropertyDescriptor(process.stdout, 'rows');
    const columns = Object.getOwnPropertyDescriptor(process.stdout, 'columns');
    Object.defineProperty(process.stdout, 'rows', { value: 12, configurable: true });
    Object.defineProperty(process.stdout, 'columns', { value: 40, configurable: true });
    let checked = false;
    try {
      await guiCommand({}, scripted([{ action: 'link-modules' }, { selectedModules: [] }, { action: 'exit' }], questions => {
        const checkbox = questions.find(q => q.name === 'selectedModules');
        if (checkbox) {
          expect(checkbox.pageSize).toBe(4);
          expect(checkbox.choices.length).toBeGreaterThan(40);
          expect(checkbox.choices.every((c: any) => c.name.includes(c.value))).toBe(true);
          checked = true;
        }
      }));
      expect(checked).toBe(true);
    } finally {
      if (rows) Object.defineProperty(process.stdout, 'rows', rows); else delete (process.stdout as any).rows;
      if (columns) Object.defineProperty(process.stdout, 'columns', columns); else delete (process.stdout as any).columns;
    }
  });

  it('links an existing valid collection through lifecycle services without changing pinned members', async () => {
    const collection = discoverCollections().find(c => c.fullName === 'collections/html-css-js')!;
    const member = collection.metadata.modules[0];
    seed([{ name: member.id, version: '0.5.0', pinnedAt: 'preserved' }]);
    await guiCommand({}, scripted([
      { action: 'link-collection' }, { selectedCollection: collection.fullName }, { confirm: true }, { action: 'exit' }
    ]));
    expect(read().modules[0]).toEqual({ name: member.id, version: '0.5.0', pinnedAt: 'preserved' });
    expect(read().modules.map((m: any) => m.name)).toEqual(collection.metadata.modules.map(m => m.id));
    expect(errors).not.toHaveBeenCalled();
  });

  it('keeps a cancelled prompt from changing configuration', async () => {
    const original = fs.readFileSync(configPath(), 'utf8');
    const error = new Error('cancelled'); error.name = 'ExitPromptError';
    await guiCommand({}, { prompt: vi.fn().mockRejectedValue(error) });
    expect(fs.readFileSync(configPath(), 'utf8')).toBe(original);
    expect(errors).not.toHaveBeenCalled();
  });
  it('includes every discovered module in the generated catalog, including legacy manifest categories', () => {
    const catalog = generateModulesCatalog();
    expect(discoverModules().filter(m => !catalog.includes(`\`${m.fullName}\``)).map(m => m.fullName)).toEqual([]);
  });
  it.each([
    ['JAVA', 'coding-standards/java'], ['java-standards', 'coding-standards/java'],
    ['coding-standards/java', 'coding-standards/java'], [' Spring Boot ', 'coding-standards/spring'],
    ['spring-standards', 'coding-standards/spring'], ['Jev', 'workflows/decision-layer'],
    ['TypeSafe', 'workflows/decision-layer'], ['decision-layer', 'workflows/decision-layer'],
    ['agent-engineering', 'workflows/agent-engineering'], ['harness', 'workflows/agent-engineering'],
    ['loops', 'workflows/agent-engineering'], ['graphs', 'workflows/agent-engineering']
  ])('finds %s through real GUI search metadata', async (searchTerm, id) => {
    await guiCommand({}, scripted([
      { action: 'search' }, { searchTerm }, { linkNow: false }, { viewDetails: false }, { action: 'exit' }
    ]));
    expect(log.mock.calls.flat().join('\n')).toContain(id);
    expect(errors).not.toHaveBeenCalled();
  });

  it.each(['coding-standards/java', 'coding-standards/spring', 'workflows/decision-layer', 'workflows/agent-engineering'])(
    'shows canonical details and reads the README for %s without starting software', async id => {
      const execute = vi.spyOn(decisionBridge, 'runDecisionOperation');
      const module = discoverModules().find(m => m.fullName === id)!;
      await guiCommand({}, scripted([
        { action: 'browse-modules' }, { moduleId: id }, { asset: 'README.md' }, { asset: 'back' }, { action: 'exit' }
      ]));
      const output = log.mock.calls.flat().join('\n');
      expect(output).toContain(`Manifest name: ${module.metadata.name}`);
      expect(output).toContain(`Available version: ${module.metadata.version}`);
      expect(output).toContain(fs.readFileSync(path.join(module.path, 'README.md'), 'utf8'));
      expect(execute).not.toHaveBeenCalled();
      expect(fs.existsSync(path.join(root, '.augx-decision'))).toBe(false);
      expect(errors).not.toHaveBeenCalled();
    }
  );

  it('exposes actual agent contracts, templates, loops, graphs and validation guidance as static assets', () => {
    const agent = discoverModules().find(m => m.fullName === 'workflows/agent-engineering')!;
    expect(getGuiModuleAssets(agent)).toEqual(expect.arrayContaining([
      'schemas/contracts.schema.json', 'templates/agent.json', 'templates/state.json',
      'examples/loop.cjs', 'examples/graphs.cjs', 'scripts/validate.cjs'
    ]));
  });

  it('handles missing optional metadata, duplicate display names and empty metadata searches', () => {
    const modules = ['future/one', 'future/two'].map(fullName => ({ fullName,
      metadata: { name: fullName, displayName: 'Same title' } } as Module));
    expect(modules.filter(m => moduleMatchesSearch(m, 'FUTURE/TWO')).map(m => m.fullName)).toEqual(['future/two']);
    expect(modules.filter(m => moduleMatchesSearch(m, '   '))).toHaveLength(2);
    expect(modules.filter(m => moduleMatchesSearch(m, 'unrelated'))).toEqual([]);
  });

  it('cancels empty search and declined mutations without writing configuration', async () => {
    seed([{ name: 'coding-standards/java', version: '0.1.0', pinnedAt: 'retained' }]);
    const original = fs.readFileSync(configPath(), 'utf8');
    await guiCommand({}, scripted([
      { action: 'search' }, { searchTerm: '  ' },
      { action: 'link-modules' }, { selectedModules: [] }, { confirm: false }, { action: 'exit' }
    ]));
    expect(fs.readFileSync(configPath(), 'utf8')).toBe(original);
    expect(errors).not.toHaveBeenCalled();
  });

  it('rejects out-of-results IDs without mutation and returns to the menu', async () => {
    const original = fs.readFileSync(configPath(), 'utf8');
    await guiCommand({}, scripted([
      { action: 'search' }, { searchTerm: 'Java Coding Standards' }, { linkNow: true },
      { selectedModules: ['../outside'] }, { action: 'exit' }
    ]));
    expect(fs.readFileSync(configPath(), 'utf8')).toBe(original);
    expect(errors.mock.calls.flat().join()).toContain('Invalid module selection');
    expect(log.mock.calls.flat().join()).toContain('Goodbye');
  });

  it('unlinks and refreshes through the real lifecycle while retaining pinned siblings', async () => {
    seed([{ name: 'coding-standards/java', version: '1.0.0' }, { name: 'coding-standards/spring', version: '0.1.0' }]);
    await guiCommand({}, scripted([
      { action: 'search' }, { searchTerm: 'Java Coding Standards' }, { linkNow: true },
      { selectedModules: [] }, { confirm: true }, { action: 'exit' }
    ]));
    expect(read().modules).toEqual([{ name: 'coding-standards/spring', version: '0.1.0' }]);
  });

  it('reports partial failure while preserving dependency-protected links and completing independent changes', async () => {
    seed([{ name: 'coding-standards/python', version: '0.1.0', dependencies: ['coding-standards/java'] },
      { name: 'coding-standards/java', version: '0.1.0' }]);
    await guiCommand({}, scripted([
      { action: 'link-modules' }, { selectedModules: ['coding-standards/python', 'coding-standards/spring'] },
      { confirm: true }, { action: 'exit' }
    ]));
    expect(read().modules.map((m: any) => m.name)).toEqual(['coding-standards/python', 'coding-standards/java', 'coding-standards/spring']);
    expect(log.mock.calls.flat().join()).toContain('1 succeeded, 1 failed');
    expect(log.mock.calls.flat().join()).toContain('Goodbye');
  });

  it('uses ancestor project scope from paths with spaces and Unicode', async () => {
    const nested = path.join(root, 'nested child'); fs.mkdirSync(nested); process.chdir(nested);
    await guiCommand({}, scripted([
      { action: 'link-modules' }, { selectedModules: ['coding-standards/java'] }, { confirm: true }, { action: 'exit' }
    ]));
    expect(read().modules[0].name).toBe('coding-standards/java');
    expect(fs.existsSync(path.join(nested, '.augment'))).toBe(false);
    expect(log.mock.calls.flat().join()).toContain(`Project: ${root}`);
  });

  it('fails closed on malformed config without overwriting bytes', async () => {
    fs.writeFileSync(configPath(), '{bad-json');
    const prompt = scripted([]);
    await guiCommand({}, prompt);
    expect(fs.readFileSync(configPath(), 'utf8')).toBe('{bad-json');
    expect(prompt.prompt).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('diagnoses malformed configuration without quoting private file contents', async () => {
    fs.writeFileSync(configPath(), 'private-config-sentinel');
    const prompt = scripted([]);
    await guiCommand({}, prompt);
    const diagnostic = errors.mock.calls.flat().join('\n');
    expect(diagnostic).toContain('invalid JSON in .augment/extensions.json');
    expect(diagnostic).not.toContain('private-config');
    expect(fs.readFileSync(configPath(), 'utf8')).toBe('private-config-sentinel');
    expect(prompt.prompt).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('returns from malformed decision input to the menu without displaying its contents or dispatching', async () => {
    const original = fs.readFileSync(configPath(), 'utf8');
    const input = path.join(root, 'private input.json');
    fs.writeFileSync(input, 'private-input-sentinel');
    const execute = vi.spyOn(decisionBridge, 'runDecisionOperation');
    await guiCommand({}, scripted([
      { action: 'decision' }, { operation: 'run' }, { input },
      { mode: 'offline' }, { id: 'invalid-input' }, { action: 'exit' }
    ]));
    const diagnostic = errors.mock.calls.flat().join('\n');
    expect(diagnostic).toContain('Input file contains invalid JSON');
    expect(diagnostic).not.toContain('private-in');
    expect(log.mock.calls.flat().join('\n')).toContain('Goodbye!');
    expect(execute).not.toHaveBeenCalled();
    expect(fs.readFileSync(configPath(), 'utf8')).toBe(original);
    expect(fs.readFileSync(input, 'utf8')).toBe('private-input-sentinel');
    expect(fs.existsSync(path.join(root, '.augx-decision'))).toBe(false);
  });

  it('allows static browsing without initialization and blocks linking with actionable diagnostics', async () => {
    fs.unlinkSync(configPath());
    await guiCommand({}, scripted([
      { action: 'browse-modules' }, { moduleId: 'coding-standards/java' }, { asset: 'back' },
      { action: 'link-modules' }, { action: 'exit' }
    ]));
    expect(fs.existsSync(configPath())).toBe(false);
    expect(errors.mock.calls.flat().join()).toContain('augx init');
    expect(log.mock.calls.flat().join()).toContain('Manifest name: java-standards');
  });

  it('rejects forged and missing asset choices without executing content', async () => {
    await guiCommand({}, scripted([
      { action: 'browse-modules' }, { moduleId: 'workflows/agent-engineering' }, { asset: '../../outside' }, { action: 'exit' }
    ]));
    expect(errors.mock.calls.flat().join()).toContain('Asset is unavailable');
    expect(fs.existsSync(path.join(root, '.augx-decision'))).toBe(false);
  });

  it('links filtered results without unlinking unrelated pinned or unavailable modules', async () => {
    const existing = [
      { name: 'coding-standards/python', version: '0.7.0', pinnedAt: 'retained', custom: 42 },
      { name: 'external/missing', version: '9.0.0' }
    ];
    seed(existing);
    await guiCommand({}, scripted([
      { action: 'search' }, { searchTerm: 'Java Coding Standards' }, { linkNow: true },
      { selectedModules: ['coding-standards/java'] }, { confirm: true }, { action: 'exit' }
    ]));
    expect(read().modules).toEqual([...existing, expect.objectContaining({ name: 'coding-standards/java' })]);
    expect(read().custom).toEqual({ preserve: true });
    expect(fs.existsSync(path.join(root, '.augx-decision'))).toBe(false);
  });

  it('refreshes choices after mutation and permits repeated unchanged selections', async () => {
    let checkboxes = 0;
    const prompt = scripted([
      { action: 'link-modules' }, { selectedModules: ['coding-standards/java'] }, { confirm: true },
      { action: 'link-modules' }, { selectedModules: ['coding-standards/java'] }, { action: 'exit' }
    ], questions => {
      const checkbox = questions.find(q => q.name === 'selectedModules');
      if (checkbox && ++checkboxes === 2) {
        expect(checkbox.choices.find((c: any) => c.value === 'coding-standards/java').checked).toBe(true);
      }
    });
    await guiCommand({}, prompt);
    expect(checkboxes).toBe(2);
    expect(read().modules).toHaveLength(1);
  });

  it('finds the provider alias from source tags in the built CLI', () => {
    expect(execFileSync(process.execPath, [cli, 'search', 'JeV'], { cwd: root, encoding: 'utf8' }))
      .toContain('workflows/decision-layer');
  });

  it('retains actual tags through GUI helper transformation and tag-only search', () => {
    const module = discoverModules().find(m => m.fullName === 'workflows/decision-layer')!;
    const choice = formatModuleChoice(module);
    expect(fuzzySearch('jev', [choice], {
      ...DEFAULT_GUI_CONFIG.searchOptions, searchFields: ['tags'], minMatchScore: 0.1
    }).map(r => r.module.value)).toEqual(['workflows/decision-layer']);
  });
});
