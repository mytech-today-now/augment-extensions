import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { findModule } from '../utils/module-system';

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
    const module = findModule(moduleName);

    if (!module) {
      console.error(chalk.red(`Module not found: ${moduleName}`));
      process.exit(1);
    }

    // Check if already linked
    const existingIndex = config.modules.findIndex((m: any) => m.name === moduleName);
    
    if (existingIndex >= 0) {
      console.log(chalk.yellow(`Module already linked: ${moduleName}`));
      console.log(chalk.gray('Use "augx update" to update to latest version'));
      return;
    }

    // Add to config
    config.modules.push({
      name: module.fullName,
      version: options.version || module.metadata.version,
      type: module.metadata.type,
      description: module.metadata.description
    });

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.green(`✓ Linked ${module.fullName} (v${options.version || module.metadata.version})`));
    console.log(chalk.gray(`\nUse "augx show ${module.fullName}" to view module details`));

  } catch (error) {
    console.error(chalk.red('Error linking module:'), error);
    process.exit(1);
  }
}

