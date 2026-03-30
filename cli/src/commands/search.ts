import chalk from 'chalk';
import { discoverModules } from '../utils/module-system';

interface SearchOptions {
  type?: string;
}

interface Module {
  name: string;
  version: string;
  description: string;
  type: string;
  displayName: string;
}

export async function searchCommand(keyword: string, options: SearchOptions): Promise<void> {
  try {
    console.log(chalk.blue(`\n🔍 Searching for: "${keyword}"\n`));

    const results = await searchModules(keyword, options.type);

    if (results.length === 0) {
      console.log(chalk.yellow('No modules found matching your search.'));
      console.log(chalk.gray('\nTry:'));
      console.log(chalk.gray('  • Using different keywords'));
      console.log(chalk.gray('  • Removing the --type filter'));
      console.log(chalk.gray('  • Running "augx list" to see all modules\n'));
      return;
    }

    console.log(chalk.bold(`Found ${results.length} module(s):\n`));

    results.forEach((module) => {
      console.log(chalk.bold.cyan(module.displayName));
      console.log(chalk.gray(`  Module: ${module.name}`));
      console.log(chalk.gray(`  Version: ${module.version}`));
      console.log(chalk.gray(`  Type: ${module.type}`));
      console.log(chalk.gray(`  Description: ${module.description}\n`));
    });

    console.log(chalk.gray(`Use "augx show <module>" to view details`));
    console.log(chalk.gray(`Use "augx link <module>" to link a module\n`));

  } catch (error) {
    console.error(chalk.red('Error searching modules:'), error);
    process.exit(1);
  }
}

async function searchModules(keyword: string, typeFilter?: string): Promise<Module[]> {
  const lowerKeyword = keyword.toLowerCase();
  return discoverModules()
    .filter(module => !typeFilter || module.metadata.type === typeFilter)
    .filter(module => {
      const searchableText = [
        module.fullName,
        module.metadata.name,
        module.metadata.displayName || '',
        module.metadata.description || '',
        module.metadata.type
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerKeyword);
    })
    .map(module => ({
      name: module.fullName,
      version: module.metadata.version,
      description: module.metadata.description,
      type: module.metadata.type,
      displayName: module.metadata.displayName || module.fullName
    }));
}

