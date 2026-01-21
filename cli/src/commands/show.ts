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

