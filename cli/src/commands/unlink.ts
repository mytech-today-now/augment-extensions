import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { findModule, discoverCollections } from '../utils/module-system';

interface UnlinkOptions {
  force?: boolean;
}

export async function unlinkCommand(moduleName: string, options: UnlinkOptions = {}): Promise<void> {
  try {
    console.log(chalk.blue(`Unlinking module: ${moduleName}`));

    // Load extensions config
    const configPath = path.join(process.cwd(), '.augment', 'extensions.json');
    
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Augment Extensions not initialized. Run: augx init'));
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Check if it's a collection
    const collections = discoverCollections();
    const collection = collections.find(c => c.fullName === moduleName || c.metadata.name === moduleName);

    if (collection) {
      await unlinkCollection(collection, config, configPath, options);
      return;
    }

    // Check if module is linked
    const moduleIndex = config.modules.findIndex((m: any) => m.name === moduleName);
    
    if (moduleIndex === -1) {
      console.log(chalk.yellow(`Module not linked: ${moduleName}`));
      return;
    }

    // Check for dependencies
    const dependentModules = config.modules.filter((m: any) => 
      m.dependencies && m.dependencies.includes(moduleName)
    );

    if (dependentModules.length > 0 && !options.force) {
      console.error(chalk.red(`\nCannot unlink ${moduleName}. The following modules depend on it:\n`));
      dependentModules.forEach((m: any) => {
        console.error(chalk.red(`  - ${m.name}`));
      });
      console.error(chalk.yellow('\nUse --force to unlink anyway (may break dependent modules)'));
      process.exit(1);
    }

    // Remove from config
    config.modules.splice(moduleIndex, 1);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.green(`✓ Successfully unlinked: ${moduleName}`));

    if (dependentModules.length > 0) {
      console.log(chalk.yellow('\n⚠ Warning: The following modules may be affected:'));
      dependentModules.forEach((m: any) => {
        console.log(chalk.yellow(`  - ${m.name}`));
      });
    }

  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function unlinkCollection(
  collection: any,
  config: any,
  configPath: string,
  options: UnlinkOptions
): Promise<void> {
  console.log(chalk.blue(`\nUnlinking collection: ${collection.metadata.displayName}\n`));
  console.log(chalk.gray(`This will unlink ${collection.metadata.modules.length} module(s):\n`));

  for (const module of collection.metadata.modules) {
    console.log(chalk.gray(`  - ${module.id}`));
  }

  // Unlink all modules in the collection
  let unlinkedCount = 0;
  for (const module of collection.metadata.modules) {
    const moduleIndex = config.modules.findIndex((m: any) => m.name === module.id);
    
    if (moduleIndex >= 0) {
      config.modules.splice(moduleIndex, 1);
      unlinkedCount++;
      console.log(chalk.green(`  ✓ Unlinked: ${module.id}`));
    } else {
      console.log(chalk.gray(`  - Skipped (not linked): ${module.id}`));
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green(`\n✓ Successfully unlinked collection (${unlinkedCount} modules removed)`));
}

