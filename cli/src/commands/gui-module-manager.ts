import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { discoverModules, discoverCollections, moduleMatchesSearch, resolveContainedPath, listModuleFiles, type Module, type Collection } from '../utils/module-system';
import { loadExtensionsConfig, resolveExtensionsProjectRoot } from '../utils/extensions-config';
import { getInteractivePrompt, type InteractivePrompt } from '../utils/interactive-prompt';
import { redactDecisionText } from '../utils/decision-runner';
import { linkModule } from './link';
import { unlinkModule } from './unlink';
import { decisionWorkflowInteractive } from './gui-decision';
import { augxVersion } from '../utils/version';

export interface GuiOptions { project?: string; json?: boolean }
const pageSize = () => Math.max(3, Math.min(15, (process.stdout.rows || 24) - 8));
const cancelled = (error: unknown) => error instanceof Error && ['ExitPromptError', 'AbortPromptError'].includes(error.name);

export function filterModulesForGui(modules: Module[]): Module[] {
  return modules.filter(module => module.metadata.type !== 'writing-standards');
}
export function filterLinkedModulesToRepoModules(linkedModules: string[], modules: Module[]): string[] {
  const ids = new Set(modules.map(m => m.fullName));
  return linkedModules.filter(id => ids.has(id));
}
export function filterCollectionsToRepoModules(collections: Collection[], modules: Module[]): Collection[] {
  const ids = new Set(modules.map(m => m.fullName));
  return collections.filter(c => Array.isArray(c?.metadata?.modules) && c.metadata.modules.length > 0 &&
    c.metadata.modules.every(m => m && ids.has(m.id)));
}

function linkedIds(project: string): string[] {
  const loaded = loadExtensionsConfig(project);
  if (!loaded.exists) throw new Error('Augment Extensions not initialized in this scope. Run: augx init');
  if (!loaded.valid) throw new Error(`Invalid extensions configuration: ${loaded.error}. Repair the file before managing modules.`);
  if (loaded.config.modules.some(m => !m || typeof m.name !== 'string' || !m.name)) throw new Error('Invalid linked module record. Repair extensions.json before managing modules.');
  return loaded.config.modules.map(m => m.name);
}

export async function runModuleManager(
  options: GuiOptions, promptApi: InteractivePrompt | undefined,
  browseSkills: (promptApi: InteractivePrompt) => Promise<void>
): Promise<void> {
  const requestedProject = path.resolve(options.project || process.cwd());
  let project = resolveExtensionsProjectRoot(requestedProject);
  console.log(chalk.blue('\nAugment Extensions Module Manager'));
  console.log(`Augx CLI version: ${augxVersion}`);
  console.log('Choose Keyboard Help for the supported controls.');
  const prompt = promptApi || await getInteractivePrompt();
  if (!prompt) {
    console.log(chalk.yellow('Interactive prompts are unavailable in this terminal. Re-run `augx gui` from an interactive TTY.'));
    return;
  }
  try {
    if (options.project && (!fs.existsSync(requestedProject) || !fs.statSync(requestedProject).isDirectory())) throw new Error('Project scope must be an existing directory');
    for (;;) {
      console.log(`\nProject: ${project}`);
      const loaded = loadExtensionsConfig(project);
      if (!loaded.valid) throw new Error(`Invalid extensions configuration: ${loaded.error}. Repair extensions.json before reopening the manager.`);
      const configured = loaded.exists ? linkedIds(project) : [];
      if (!loaded.exists) console.log('Project is not initialized. Browsing and decision diagnostics are available; run augx init in this scope before linking.');
      const modules = filterModulesForGui(discoverModules());
      const linked = filterLinkedModulesToRepoModules(configured, modules);
      const discoveredCollections = discoverCollections();
      const collections = filterCollectionsToRepoModules(discoveredCollections, modules);
      if (configured.length > linked.length) console.log(`Skipping ${configured.length - linked.length} unavailable linked module(s); their configuration is preserved.`);
      if (discoveredCollections.length > collections.length) console.log(`Skipping ${discoveredCollections.length - collections.length} collection(s) referencing unavailable modules.`);
      const { action } = await prompt.prompt([{ type: 'list', name: 'action', message: 'What would you like to do?', pageSize: pageSize(), choices: [
        { name: 'Link / Unlink Modules', value: 'link-modules' },
        { name: 'Link Collection', value: 'link-collection' },
        { name: 'Search Modules', value: 'search' },
        { name: 'Browse Module Details and Usage', value: 'browse-modules' },
        { name: 'Jev / TypeSafe Decision Workflow', value: 'decision' },
        { name: 'Browse Skills', value: 'browse-skills' },
        { name: 'Change Project Scope', value: 'project' },
        { name: 'Keyboard Help', value: 'help' }, { name: 'Exit', value: 'exit' }
      ] }]);
      if (action === 'exit') { console.log('Goodbye!'); return; }
      try {
        if (action === 'help') {
          console.log('Keyboard Shortcuts: Up/Down to navigate, Space to toggle checkboxes, Enter to confirm.');
          console.log('Checkboxes: a toggles all, i inverts selection. Use Back or Cancel choices to return. Ctrl+C exits the menu.');
        } else if (action === 'link-modules') await manageModulesInteractive(modules, project, prompt);
        else if (action === 'search') await searchModulesInteractive(modules, project, prompt);
        else if (action === 'link-collection') await linkCollectionInteractive(collections, project, prompt);
        else if (action === 'browse-modules') await browseModulesInteractive(modules, project, prompt);
        else if (action === 'decision') await decisionWorkflowInteractive(prompt, project);
        else if (action === 'browse-skills') await browseSkills(prompt);
        else if (action === 'project') {
          const { directory } = await prompt.prompt([{ type: 'input', name: 'directory', message: 'Project directory (relative to current scope or absolute; blank cancels):' }]);
          if (typeof directory === 'string' && directory.trim()) {
            const candidate = fs.realpathSync(path.resolve(project, directory.trim()));
            if (!fs.statSync(candidate).isDirectory()) throw new Error('Project must be an existing directory');
            project = resolveExtensionsProjectRoot(candidate);
          }
        } else throw new Error('Unknown menu action');
      } catch (error) {
        if (cancelled(error)) { console.log('Cancelled.'); return; }
        console.error(redactDecisionText(`Action failed: ${error instanceof Error ? error.message : String(error)}. State will be reloaded; inspect diagnostics before retrying.`));
      }
    }
  } catch (error) {
    if (cancelled(error)) { console.log('Cancelled.'); return; }
    console.error(redactDecisionText(`Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exitCode = 1;
  }
}

function label(module: Module, linked: string[]): string {
  return `${linked.includes(module.fullName) ? '[linked] ' : ''}${module.metadata.displayName || module.metadata.name || module.fullName} (${module.fullName}) available v${module.metadata.version}`;
}

export async function manageModulesInteractive(modules: Module[], project: string, prompt: InteractivePrompt): Promise<void> {
  if (!modules.length) { console.log('No modules available in this repository.'); return; }
  const linked = linkedIds(project);
  const managed = new Set(modules.map(m => m.fullName));
  console.log(`Project: ${project}\nOnly these ${managed.size} displayed modules can change. Uncheck a linked module to unlink it.`);
  console.log('Space toggles a checkbox; a toggles all; i inverts. Review or cancel on the next screen.');
  const { selectedModules } = await prompt.prompt([{ type: 'checkbox', name: 'selectedModules', message: 'Select desired links (↑↓, Space, Enter):', prefix: '📦', pageSize: pageSize(), loop: false,
    choices: modules.map(m => ({ name: label(m, linked), value: m.fullName, checked: linked.includes(m.fullName) })) }]);
  if (selectedModules == null) { console.log('Cancelled.'); return; }
  if (!Array.isArray(selectedModules) || selectedModules.some(id => typeof id !== 'string' || !managed.has(id))) throw new Error('Invalid module selection; no changes made');
  const selected = new Set<string>(selectedModules);
  const removals = linked.filter(id => managed.has(id) && !selected.has(id));
  const additions = [...selected].filter(id => !linked.includes(id));
  if (!removals.length && !additions.length) { console.log('No changes made.'); return; }
  console.log(`Project: ${project}\nLink: ${additions.join(', ') || '(none)'}\nUnlink guidance: ${removals.join(', ') || '(none)'}`);
  const { confirm } = await prompt.prompt([{ type: 'confirm', name: 'confirm', message: 'Apply these changes? Static guidance only; no software is installed or removed.', default: false }]);
  if (confirm !== true) { console.log('Cancelled.'); return; }
  await applyChanges(removals.map(id => ({ id, remove: true })), additions.map(id => ({ id })), project);
}

async function applyChanges(removals: { id: string; remove: boolean }[], additions: { id: string; version?: string }[], project: string): Promise<void> {
  let succeeded = 0, failed = 0;
  for (const change of [...removals, ...additions]) {
    try {
      linkedIds(project);
      if ('remove' in change) await unlinkModule(change.id, {}, project);
      else await linkModule(change.id, change.version ? { version: change.version } : {}, project);
      succeeded++;
    } catch (error) {
      failed++;
      console.error(redactDecisionText(`${change.id}: ${error instanceof Error ? error.message : String(error)}. Configuration or mirrors may have partially changed; inspect before retrying.`));
    }
  }
  console.log(`Module operations: ${succeeded} succeeded, ${failed} failed. Reloading linked state.`);
}

async function linkCollectionInteractive(collections: Collection[], project: string, prompt: InteractivePrompt): Promise<void> {
  if (!collections.length) { console.log('No collections available.'); return; }
  const { selectedCollection } = await prompt.prompt([{ type: 'list', name: 'selectedCollection', message: 'Select a collection to link:', pageSize: pageSize(), choices: [
    ...collections.map(c => ({ name: `${c.metadata.displayName} (${c.fullName})`, value: c.fullName })), { name: 'Back', value: 'back' }
  ] }]);
  if (selectedCollection === 'back') return;
  const collection = collections.find(c => c.fullName === selectedCollection);
  if (!collection) throw new Error('Collection not found');
  const linked = linkedIds(project);
  const additions = collection.metadata.modules.filter(m => !linked.includes(m.id));
  console.log(`Project: ${project}\nCollection: ${collection.fullName}\n${additions.map(m => `${m.id} (${m.version})`).join('\n') || 'All collection modules are already linked; pinned versions are preserved.'}`);
  if (!additions.length) return;
  const { confirm } = await prompt.prompt([{ type: 'confirm', name: 'confirm', message: 'Link these collection modules?', default: false }]);
  if (confirm === true) await applyChanges([], additions, project); else console.log('Cancelled.');
}

async function searchModulesInteractive(modules: Module[], project: string, prompt: InteractivePrompt): Promise<void> {
  const { searchTerm } = await prompt.prompt([{ type: 'input', name: 'searchTerm', prefix: '🔍', message: 'Search ID, manifest/display name, description or tags (blank cancels):' }]);
  if (typeof searchTerm !== 'string' || !searchTerm.trim()) { console.log('Cancelled.'); return; }
  const results = modules.filter(m => moduleMatchesSearch(m, searchTerm));
  if (!results.length) { console.log(`No modules found matching "${searchTerm.trim()}"`); return; }
  const loaded = loadExtensionsConfig(project);
  const linked = loaded.config.modules.map(m => m.name);
  console.log(`Found ${results.length} module(s):`);
  for (const module of results) console.log(`${label(module, linked)}\n  ${module.metadata.description}`);
  const { linkNow } = await prompt.prompt([{ type: 'confirm', name: 'linkNow', message: 'Manage links for these results?', default: false }]);
  if (linkNow === true) await manageModulesInteractive(results, project, prompt);
  else {
    const { viewDetails } = await prompt.prompt([{ type: 'confirm', name: 'viewDetails', message: 'View details and usage for these results?', default: false }]);
    if (viewDetails === true) await browseModulesInteractive(results, project, prompt);
  }
}

/** Existing enumeration and realpath containment keep displayed assets static and scoped. */
export function getGuiModuleAssets(module: Module): string[] {
  return listModuleFiles(module.path).filter(file => {
    const relative = file.relativePath.replace(/\\/g, '/');
    return (relative === 'README.md' || /^(rules|examples|templates|schemas|scripts)\//.test(relative) || relative === 'runtime/contracts.d.ts') &&
      !relative.split('/').some(part => part.startsWith('.') || part === 'node_modules') && Boolean(resolveContainedPath(module.path, file.path));
  }).map(file => file.relativePath.replace(/\\/g, '/')).sort();
}

async function browseModulesInteractive(modules: Module[], project: string, prompt: InteractivePrompt): Promise<void> {
  if (!modules.length) { console.log('No modules available.'); return; }
  const linkedNames = loadExtensionsConfig(project).config.modules.map(record => record.name);
  const { moduleId } = await prompt.prompt([{ type: 'list', name: 'moduleId', message: 'Select module details:', pageSize: pageSize(), choices: [
    ...modules.map(m => ({ name: label(m, linkedNames), value: m.fullName })),
    { name: 'Back', value: 'back' }
  ] }]);
  if (moduleId === 'back') return;
  const module = modules.find(m => m.fullName === moduleId);
  if (!module) throw new Error('Module not found in available results');
  for (;;) {
    const linked = loadExtensionsConfig(project).config.modules.find(m => m.name === module.fullName);
    const meta = module.metadata;
    console.log(`\n${meta.displayName}\nID: ${module.fullName}\nManifest name: ${meta.name}\nAvailable version: ${meta.version}\nLinked version: ${linked ? linked.version : '(not linked)'}\nPurpose: ${meta.description}\nType: ${meta.type}\nCategory: ${meta.augment?.category || '(unspecified)'}\nPriority: ${meta.augment?.priority || '(unspecified)'}\nCharacters: ${meta.augment?.characterCount ?? '(unknown)'}\nTags: ${(meta.tags || []).join(', ') || '(none)'}\nProject: ${project}`);
    console.log(`Usage: augx show ${module.fullName} README.md\nLinking manages static guidance. Read the canonical README for supported examples and validation.`);
    const assets = getGuiModuleAssets(module);
    const { asset } = await prompt.prompt([{ type: 'list', name: 'asset', message: 'Read canonical content (never executes it):', pageSize: pageSize(), choices: [
      ...assets.map(value => ({ name: value, value })),
      { name: linked ? 'Unlink this guidance' : 'Link this guidance', value: 'manage' },
      ...(module.fullName === 'workflows/decision-layer' ? [{ name: 'Open Jev / TypeSafe operations', value: 'decision' }] : []),
      { name: 'Back', value: 'back' }
    ] }]);
    if (asset === 'back') return;
    if (asset === 'manage') { await manageModulesInteractive([module], project, prompt); continue; }
    if (asset === 'decision' && module.fullName === 'workflows/decision-layer') { await decisionWorkflowInteractive(prompt, project); continue; }
    if (!assets.includes(asset)) throw new Error('Asset is unavailable in this module');
    const contained = resolveContainedPath(module.path, asset);
    if (!contained || !fs.statSync(contained).isFile()) throw new Error('Asset is missing or outside the module');
    if (fs.statSync(contained).size > 1048576) throw new Error('Asset exceeds 1 MiB; open the canonical file in a text viewer');
    console.log(redactDecisionText(fs.readFileSync(contained, 'utf8')));
  }
}
