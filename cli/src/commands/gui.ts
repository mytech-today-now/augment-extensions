import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {
  discoverSkills, validateSkillMetadata, loadSkillDynamic,
  getSkillContentForInjection, type Skill, SKILL_CATEGORIES
} from '../utils/skill-system';
import type { InteractivePrompt } from '../utils/interactive-prompt';
import { runModuleManager, type GuiOptions } from './gui-module-manager';
export { filterModulesForGui, filterLinkedModulesToRepoModules, filterCollectionsToRepoModules } from './gui-module-manager';

export async function guiCommand(options: GuiOptions = {}, promptApi?: InteractivePrompt): Promise<void> {
  await runModuleManager(options, promptApi, browseSkillsInteractive);
}

/**
 * Discover skills with parser warnings suppressed for a clean GUI display.
 * Legacy stub skills without YAML frontmatter would otherwise spam the menu.
 */
function discoverSkillsQuiet(): Skill[] {
  const originalWarn = console.warn;
  console.warn = () => { /* silenced for GUI */ };
  try {
    return discoverSkills();
  } finally {
    console.warn = originalWarn;
  }
}

export async function browseSkillsInteractive(promptApi: InteractivePrompt): Promise<void> {
  const skills = discoverSkillsQuiet();

  if (skills.length === 0) {
    console.log(chalk.yellow('\nNo skills found in skills/<category>/*.md.'));
    console.log(chalk.gray('Add skill files with valid YAML frontmatter under one of: '
      + SKILL_CATEGORIES.join(', ')));
    return;
  }

  const presentCategories = Array.from(new Set(skills.map(s => s.metadata.category))).sort();
  const categoryChoices = [
    { name: `All categories (${skills.length})`, value: '__all__' },
    ...presentCategories.map(cat => {
      const count = skills.filter(s => s.metadata.category === cat).length;
      return { name: `${cat} (${count})`, value: cat };
    }),
    { name: 'Back', value: '__back__' }
  ];

  const { category } = await promptApi.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Filter skills by category:',
      choices: categoryChoices,
      pageSize: 10,
      prefix: '\u{1F9E0}'
    }
  ]);

  if (category === '__back__') {
    return;
  }

  const filtered = category === '__all__'
    ? skills
    : skills.filter(s => s.metadata.category === category);

  if (filtered.length === 0) {
    console.log(chalk.yellow(`\nNo skills in category: ${category}`));
    return;
  }

  const skillChoices = filtered
    .slice()
    .sort((a, b) => a.metadata.id.localeCompare(b.metadata.id))
    .map(skill => {
      const { id, name, tokenBudget, version } = skill.metadata;
      return {
        name: `${id}  ${chalk.gray(`v${version}`)}  -  ${name} ${chalk.gray(`[${tokenBudget} tok]`)}`,
        value: id
      };
    });
  skillChoices.push({ name: 'Back', value: '__back__' });

  const { skillId } = await promptApi.prompt([
    {
      type: 'list',
      name: 'skillId',
      message: 'Select a skill:',
      choices: skillChoices,
      pageSize: 15
    }
  ]);

  if (skillId === '__back__') {
    return await browseSkillsInteractive(promptApi);
  }

  const skill = filtered.find(s => s.metadata.id === skillId);
  if (!skill) {
    console.log(chalk.red(`Skill not found: ${skillId}`));
    return;
  }

  await skillActionInteractive(skill, promptApi);
}

async function skillActionInteractive(skill: Skill, promptApi: InteractivePrompt): Promise<void> {
  const { id, name } = skill.metadata;
  console.log(chalk.blue(`\n\u{1F9E0} ${name} (${id})`));

  const { action } = await promptApi.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'View details and content', value: 'view' },
        { name: 'Validate metadata', value: 'validate' },
        { name: 'Inject content (print or save to file)', value: 'inject' },
        { name: 'Back to skill list', value: 'back' }
      ]
    }
  ]);

  if (action === 'back') {
    return await browseSkillsInteractive(promptApi);
  }

  if (action === 'view') {
    showSkillDetails(skill);
  } else if (action === 'validate') {
    validateSkillInGui(skill);
  } else if (action === 'inject') {
    await injectSkillInGui(skill, promptApi);
  }

  const { again } = await promptApi.prompt([
    {
      type: 'confirm',
      name: 'again',
      message: 'Perform another action on this skill?',
      default: false
    }
  ]);

  if (again) {
    await skillActionInteractive(skill, promptApi);
  } else {
    await browseSkillsInteractive(promptApi);
  }
}

function showSkillDetails(skill: Skill): void {
  const { metadata, content, filePath } = skill;
  console.log(chalk.gray('\n' + '-'.repeat(60)));
  console.log(`Id:           ${metadata.id}`);
  console.log(`Name:         ${metadata.name}`);
  console.log(`Version:      ${metadata.version}`);
  console.log(`Category:     ${metadata.category}`);
  console.log(`Token Budget: ${metadata.tokenBudget}`);
  console.log(`Priority:     ${metadata.priority || 'medium'}`);
  if (metadata.tags && metadata.tags.length > 0) {
    console.log(`Tags:         ${metadata.tags.join(', ')}`);
  }
  if (metadata.dependencies && metadata.dependencies.length > 0) {
    console.log(`Dependencies: ${metadata.dependencies.join(', ')}`);
  }
  if (metadata.cliCommand) {
    console.log(`CLI Command:  ${metadata.cliCommand}`);
  }
  if (metadata.mcpServer) {
    console.log(`MCP Server:   ${metadata.mcpServer}`);
  }
  console.log(`Path:         ${path.relative(process.cwd(), filePath)}`);
  console.log(chalk.gray('-'.repeat(60)));
  console.log(chalk.cyan('\nContent:\n'));
  console.log(content);
  console.log();
}

function validateSkillInGui(skill: Skill): void {
  const result = validateSkillMetadata(skill.metadata);
  if (result.valid) {
    console.log(chalk.green(`\n\u{2713} Skill ${skill.metadata.id} is valid.`));
  } else {
    console.log(chalk.red(`\n\u{2717} Skill ${skill.metadata.id} has validation errors:`));
    for (const err of result.errors) {
      console.log(chalk.red(`  - ${err}`));
    }
  }
}

async function injectSkillInGui(skill: Skill, promptApi: InteractivePrompt): Promise<void> {
  const loaded = loadSkillDynamic(skill.metadata.id, {
    resolveDependencies: true,
    maxTokens: 50000,
    cache: true
  });

  if (!loaded) {
    console.log(chalk.red(`Failed to load skill: ${skill.metadata.id}`));
    return;
  }

  const injectionContent = getSkillContentForInjection(loaded);
  const depIds = loaded.dependencies.map(d => d.skill.metadata.id);

  console.log(chalk.gray('\n' + '-'.repeat(60)));
  console.log(`Total tokens:  ${loaded.totalTokens}`);
  console.log(`Dependencies:  ${depIds.length === 0 ? '(none)' : depIds.join(', ')}`);
  console.log(chalk.gray('-'.repeat(60)));

  const { destination } = await promptApi.prompt([
    {
      type: 'list',
      name: 'destination',
      message: 'Where do you want to send the injection content?',
      choices: [
        { name: 'Print to terminal', value: 'stdout' },
        { name: 'Save to file', value: 'file' },
        { name: 'Cancel', value: 'cancel' }
      ]
    }
  ]);

  if (destination === 'cancel') {
    return;
  }

  if (destination === 'stdout') {
    console.log(chalk.cyan('\n--- Injection Content ---\n'));
    console.log(injectionContent);
    console.log(chalk.cyan('\n--- End Injection Content ---\n'));
    return;
  }

  const defaultPath = path.join('.augment', 'injections', `${skill.metadata.id}.md`);
  const { outPath } = await promptApi.prompt([
    {
      type: 'input',
      name: 'outPath',
      message: 'Output file path (relative to cwd):',
      default: defaultPath,
      validate: (value: string) => value.trim().length > 0 || 'Path required'
    }
  ]);

  const absPath = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(absPath, injectionContent, 'utf-8');
  console.log(chalk.green(`\n\u{2713} Wrote ${injectionContent.length} chars to ${path.relative(process.cwd(), absPath)}`));
}

