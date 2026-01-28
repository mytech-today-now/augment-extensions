import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { findModule, discoverModules } from '../utils/module-system';

interface ShowOptions {
  json?: boolean;
}

export async function showCommand(moduleName: string, options: ShowOptions): Promise<void> {
  try {
    const module = findModule(moduleName);

    if (!module) {
      console.error(chalk.red(`Module not found: ${moduleName}`));

      // Suggest similar modules
      const suggestions = await getSimilarModules(moduleName);
      if (suggestions.length > 0) {
        console.log(chalk.yellow('\nDid you mean one of these?'));
        suggestions.forEach(suggestion => {
          console.log(chalk.cyan(`  • ${suggestion}`));
        });
      }

      console.log(chalk.gray('\nUse "augx list" to see all available modules.'));
      process.exit(1);
    }

    if (options.json) {
      const moduleInfo = {
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description,
        rules: module.rules,
        examples: module.examples,
        characterCount: module.metadata.augment?.characterCount
      };
      console.log(JSON.stringify(moduleInfo, null, 2));
      return;
    }

    console.log(chalk.bold.blue(`\n📦 ${module.fullName}\n`));
    console.log(chalk.gray(`Version: ${module.metadata.version}`));
    console.log(chalk.gray(`Type: ${module.metadata.type}`));
    console.log(chalk.gray(`Description: ${module.metadata.description}\n`));

    if (module.rules && module.rules.length > 0) {
      console.log(chalk.bold('Rules:'));
      module.rules.forEach((rule: string) => {
        console.log(chalk.cyan(`  • ${rule}`));
      });
      console.log();
    }

    if (module.examples && module.examples.length > 0) {
      console.log(chalk.bold('Examples:'));
      module.examples.forEach((example: string) => {
        console.log(chalk.green(`  • ${example}`));
      });
      console.log();
    }

    const charCount = module.metadata.augment?.characterCount;
    console.log(chalk.gray(`Character count: ~${charCount ? charCount.toLocaleString() : 'unknown'}`));
    console.log();

  } catch (error) {
    console.error(chalk.red('Error showing module:'), error);
    process.exit(1);
  }
}

async function getSimilarModules(searchTerm: string): Promise<string[]> {
  const allModules = discoverModules();

  // Find similar modules (contains search term or search term contains module name)
  const searchLower = searchTerm.toLowerCase();
  return allModules
    .filter(module => {
      const moduleLower = module.fullName.toLowerCase();
      return moduleLower.includes(searchLower) || searchLower.includes(moduleLower);
    })
    .map(m => m.fullName)
    .slice(0, 5); // Limit to 5 suggestions
}

