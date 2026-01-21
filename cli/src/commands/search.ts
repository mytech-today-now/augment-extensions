import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

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
  const modules: Module[] = [];
  const modulesDir = path.join(__dirname, '../../../augment-extensions');

  if (!fs.existsSync(modulesDir)) {
    return modules;
  }

  const lowerKeyword = keyword.toLowerCase();

  const categories = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const category of categories) {
    // Skip if type filter doesn't match
    if (typeFilter && category !== typeFilter) {
      continue;
    }

    const categoryPath = path.join(modulesDir, category);
    const moduleNames = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of moduleNames) {
      const modulePath = path.join(categoryPath, moduleName);
      const moduleJsonPath = path.join(modulePath, 'module.json');

      if (fs.existsSync(moduleJsonPath)) {
        const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
        const fullName = `${category}/${moduleName}`;

        // Search in name, description, and display name
        const searchableText = [
          fullName,
          moduleData.displayName || '',
          moduleData.description || '',
          category,
          moduleName
        ].join(' ').toLowerCase();

        if (searchableText.includes(lowerKeyword)) {
          modules.push({
            name: fullName,
            version: moduleData.version,
            description: moduleData.description,
            type: moduleData.type,
            displayName: moduleData.displayName || fullName
          });
        }
      }
    }
  }

  return modules;
}

