import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

interface LinkOptions {
  version?: string;
}

export async function linkCommand(moduleName: string, options: LinkOptions): Promise<void> {
  try {
    console.log(chalk.blue(`Linking module: ${moduleName}`));

    // Load extensions config
    const configPath = path.join(process.cwd(), '.augment', 'extensions.json');
    
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Augment Extensions not initialized. Run: augx init'));
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Check if module exists
    const modulesDir = path.join(__dirname, '../../../modules');
    const modulePath = path.join(modulesDir, moduleName);
    const moduleJsonPath = path.join(modulePath, 'module.json');

    if (!fs.existsSync(moduleJsonPath)) {
      console.error(chalk.red(`Module not found: ${moduleName}`));
      process.exit(1);
    }

    const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));

    // Check if already linked
    const existingIndex = config.modules.findIndex((m: any) => m.name === moduleName);
    
    if (existingIndex >= 0) {
      console.log(chalk.yellow(`Module already linked: ${moduleName}`));
      console.log(chalk.gray('Use "augx update" to update to latest version'));
      return;
    }

    // Add to config
    config.modules.push({
      name: moduleName,
      version: options.version || moduleData.version,
      type: moduleData.type,
      description: moduleData.description
    });

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.green(`✓ Linked ${moduleName} (v${options.version || moduleData.version})`));
    console.log(chalk.gray(`\nUse "augx show ${moduleName}" to view module details`));

  } catch (error) {
    console.error(chalk.red('Error linking module:'), error);
    process.exit(1);
  }
}

