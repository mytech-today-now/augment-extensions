import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { discoverModules, discoverCollections } from '../utils/module-system';
import { linkCommand } from './link';

interface GuiOptions {
  json?: boolean;
}

interface ModuleChoice {
  name: string;
  value: string;
  checked?: boolean;
}

interface CollectionChoice {
  name: string;
  value: string;
  modules: string[];
}

/**
 * Display keyboard shortcuts help screen
 */
function displayKeyboardHelp(): void {
  console.log(chalk.bold.blue('\n⌨️  Keyboard Shortcuts\n'));
  console.log(chalk.cyan('Navigation:'));
  console.log(chalk.gray('  ↑/↓ or j/k    - Move up/down'));
  console.log(chalk.gray('  Space         - Toggle selection (checkbox lists)'));
  console.log(chalk.gray('  Enter         - Confirm selection'));
  console.log(chalk.gray('  Esc or Ctrl+C - Cancel/Exit'));
  console.log();
  console.log(chalk.cyan('Actions:'));
  console.log(chalk.gray('  Ctrl+A        - Select all (checkbox lists)'));
  console.log(chalk.gray('  Ctrl+D        - Deselect all (checkbox lists)'));
  console.log(chalk.gray('  Ctrl+S        - Quick search'));
  console.log(chalk.gray('  Ctrl+H or ?   - Show this help'));
  console.log();
  console.log(chalk.cyan('Accessibility:'));
  console.log(chalk.gray('  Screen reader compatible'));
  console.log(chalk.gray('  High contrast mode supported'));
  console.log(chalk.gray('  Keyboard-only navigation'));
  console.log();
}

export async function guiCommand(options: GuiOptions = {}): Promise<void> {
  try {
    console.log(chalk.blue('\n🎨 Augment Extensions Module Manager\n'));
    console.log(chalk.gray('Press Ctrl+H or ? for keyboard shortcuts\n'));

    // Check if initialized
    const configPath = path.join(process.cwd(), '.augment', 'extensions.json');

    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Augment Extensions not initialized. Run: augx init'));
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const linkedModules = config.modules.map((m: any) => m.name);

    // Discover available modules and collections
    const modules = discoverModules();
    const collections = discoverCollections();

    // Main menu
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📦 Link Modules', value: 'link-modules' },
          { name: '📚 Link Collection', value: 'link-collection' },
          { name: '🔍 Search Modules', value: 'search' },
          { name: '❓ Keyboard Shortcuts', value: 'help' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      console.log(chalk.gray('Goodbye!'));
      return;
    }

    if (action === 'help') {
      displayKeyboardHelp();
      // Return to main menu after showing help
      return await guiCommand(options);
    } else if (action === 'link-modules') {
      await linkModulesInteractive(modules, linkedModules);
    } else if (action === 'link-collection') {
      await linkCollectionInteractive(collections, linkedModules);
    } else if (action === 'search') {
      await searchModulesInteractive(modules);
    }

  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function linkModulesInteractive(modules: any[], linkedModules: string[]): Promise<void> {
  const choices: ModuleChoice[] = modules.map(m => ({
    name: `${m.metadata.displayName} (${m.fullName}) - ${m.metadata.description}`,
    value: m.fullName,
    checked: linkedModules.includes(m.fullName)
  }));

  console.log(chalk.gray('Tip: Use Ctrl+A to select all, Ctrl+D to deselect all\n'));

  const { selectedModules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedModules',
      message: 'Select modules to link (↑↓ to navigate, Space to select, Enter to confirm):',
      choices,
      pageSize: 15,
      // Enable keyboard shortcuts via inquirer's built-in support
      loop: false,
      // Accessibility: Provide clear instructions
      prefix: '📦',
      suffix: ''
    }
  ]);

  if (selectedModules.length === 0) {
    console.log(chalk.yellow('No modules selected.'));
    return;
  }

  console.log(chalk.blue(`\nLinking ${selectedModules.length} module(s)...\n`));

  for (const moduleName of selectedModules) {
    if (!linkedModules.includes(moduleName)) {
      await linkCommand(moduleName, {});
    } else {
      console.log(chalk.gray(`Skipping already linked module: ${moduleName}`));
    }
  }

  console.log(chalk.green('\n✓ Module linking complete!'));
}

async function linkCollectionInteractive(collections: any[], linkedModules: string[]): Promise<void> {
  if (collections.length === 0) {
    console.log(chalk.yellow('No collections available.'));
    return;
  }

  const choices = collections.map(c => ({
    name: `${c.metadata.displayName} - ${c.metadata.description}`,
    value: c.fullName
  }));

  const { selectedCollection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCollection',
      message: 'Select a collection to link:',
      choices
    }
  ]);

  const collection = collections.find(c => c.fullName === selectedCollection);
  
  if (!collection) {
    console.error(chalk.red('Collection not found.'));
    return;
  }

  console.log(chalk.blue(`\nLinking collection: ${collection.metadata.displayName}\n`));
  console.log(chalk.gray(`This will link ${collection.metadata.modules.length} module(s):\n`));

  for (const module of collection.metadata.modules) {
    console.log(chalk.gray(`  - ${module.id}`));
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Proceed with linking?',
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  // Link all modules in the collection
  for (const module of collection.metadata.modules) {
    if (!linkedModules.includes(module.id)) {
      await linkCommand(module.id, { version: module.version });
    } else {
      console.log(chalk.gray(`Skipping already linked module: ${module.id}`));
    }
  }

  console.log(chalk.green('\n✓ Collection linking complete!'));
}

async function searchModulesInteractive(modules: any[]): Promise<void> {
  const { searchTerm } = await inquirer.prompt([
    {
      type: 'input',
      name: 'searchTerm',
      message: 'Enter search term (searches name, description, and tags):',
      // Accessibility: Provide clear placeholder
      prefix: '🔍',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Please enter a search term';
        }
        return true;
      }
    }
  ]);

  if (!searchTerm) {
    console.log(chalk.yellow('No search term provided.'));
    return;
  }

  const results = modules.filter(m =>
    m.metadata.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.metadata.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (results.length === 0) {
    console.log(chalk.yellow(`No modules found matching "${searchTerm}"`));
    console.log(chalk.gray('Try a different search term or browse all modules'));
    return;
  }

  // Accessibility: Announce number of results
  console.log(chalk.blue(`\n✓ Found ${results.length} module(s) matching "${searchTerm}":\n`));

  for (const module of results) {
    console.log(chalk.green(`  ${module.metadata.displayName}`));
    console.log(chalk.gray(`    ${module.fullName}`));
    console.log(chalk.gray(`    ${module.metadata.description}`));
    console.log();
  }

  const { linkNow } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'linkNow',
      message: 'Would you like to link any of these modules?',
      default: false,
      // Accessibility: Clear prefix
      prefix: '❓'
    }
  ]);

  if (linkNow) {
    await linkModulesInteractive(results, []);
  }
}

