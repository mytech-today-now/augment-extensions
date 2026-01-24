import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

interface ShowOptions {
  json?: boolean;
}

export async function showCommand(moduleName: string, options: ShowOptions): Promise<void> {
  try {
    const moduleInfo = await getModuleInfo(moduleName);

    if (!moduleInfo) {
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
      console.log(JSON.stringify(moduleInfo, null, 2));
      return;
    }

    console.log(chalk.bold.blue(`\n📦 ${moduleInfo.name}\n`));
    console.log(chalk.gray(`Version: ${moduleInfo.version}`));
    console.log(chalk.gray(`Type: ${moduleInfo.type}`));
    console.log(chalk.gray(`Description: ${moduleInfo.description}\n`));

    if (moduleInfo.rules && moduleInfo.rules.length > 0) {
      console.log(chalk.bold('Rules:'));
      moduleInfo.rules.forEach((rule: string) => {
        console.log(chalk.cyan(`  • ${rule}`));
      });
      console.log();
    }

    if (moduleInfo.examples && moduleInfo.examples.length > 0) {
      console.log(chalk.bold('Examples:'));
      moduleInfo.examples.forEach((example: string) => {
        console.log(chalk.green(`  • ${example}`));
      });
      console.log();
    }

    console.log(chalk.gray(`Character count: ~${moduleInfo.characterCount || 'unknown'}`));
    console.log();

  } catch (error) {
    console.error(chalk.red('Error showing module:'), error);
    process.exit(1);
  }
}

async function getModuleInfo(moduleName: string): Promise<any> {
  const modulesDir = path.join(__dirname, '../../../augment-extensions');
  const modulePath = path.join(modulesDir, moduleName);
  const moduleJsonPath = path.join(modulePath, 'module.json');

  if (!fs.existsSync(moduleJsonPath)) {
    return null;
  }

  const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));

  // Get rules
  const rulesDir = path.join(modulePath, 'rules');
  const rules = fs.existsSync(rulesDir)
    ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'))
    : [];

  // Get examples
  const examplesDir = path.join(modulePath, 'examples');
  const examples = fs.existsSync(examplesDir)
    ? fs.readdirSync(examplesDir)
    : [];

  return {
    ...moduleData,
    name: moduleName,
    rules,
    examples,
    characterCount: moduleData.augment?.characterCount
  };
}

async function getSimilarModules(searchTerm: string): Promise<string[]> {
  const modulesDir = path.join(__dirname, '../../../augment-extensions');
  const allModules: string[] = [];

  // Recursively find all modules
  function findModules(dir: string, prefix: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        const moduleJsonPath = path.join(fullPath, 'module.json');

        if (fs.existsSync(moduleJsonPath)) {
          const modulePath = prefix ? `${prefix}/${entry.name}` : entry.name;
          allModules.push(modulePath);
        } else {
          // Recurse into subdirectories
          const newPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
          findModules(fullPath, newPrefix);
        }
      }
    }
  }

  if (fs.existsSync(modulesDir)) {
    findModules(modulesDir);
  }

  // Find similar modules (contains search term or search term contains module name)
  const searchLower = searchTerm.toLowerCase();
  return allModules.filter(module => {
    const moduleLower = module.toLowerCase();
    return moduleLower.includes(searchLower) || searchLower.includes(moduleLower);
  }).slice(0, 5); // Limit to 5 suggestions
}

