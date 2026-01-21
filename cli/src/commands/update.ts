import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

interface UpdateOptions {
  module?: string;
}

interface LinkedModule {
  name: string;
  version: string;
  type: string;
  description: string;
}

export async function updateCommand(options: UpdateOptions): Promise<void> {
  try {
    console.log(chalk.blue('\n🔄 Updating modules...\n'));

    // Load extensions config
    const configPath = path.join(process.cwd(), '.augment', 'extensions.json');

    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Augment Extensions not initialized. Run: augx init'));
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!config.modules || config.modules.length === 0) {
      console.log(chalk.yellow('No modules linked. Use "augx link <module>" to link modules.'));
      return;
    }

    const modulesToUpdate = options.module
      ? config.modules.filter((m: LinkedModule) => m.name === options.module)
      : config.modules;

    if (modulesToUpdate.length === 0) {
      console.error(chalk.red(`Module not found: ${options.module}`));
      process.exit(1);
    }

    let updatedCount = 0;
    let upToDateCount = 0;
    let errorCount = 0;

    for (const linkedModule of modulesToUpdate) {
      const result = await updateModule(linkedModule, config);

      if (result === 'updated') {
        updatedCount++;
      } else if (result === 'up-to-date') {
        upToDateCount++;
      } else {
        errorCount++;
      }
    }

    // Save updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.bold.green('\n✨ Update complete!\n'));
    console.log(chalk.gray(`Updated: ${updatedCount}`));
    console.log(chalk.gray(`Up to date: ${upToDateCount}`));
    if (errorCount > 0) {
      console.log(chalk.red(`Errors: ${errorCount}`));
    }
    console.log();

  } catch (error) {
    console.error(chalk.red('Error updating modules:'), error);
    process.exit(1);
  }
}

async function updateModule(linkedModule: LinkedModule, config: any): Promise<'updated' | 'up-to-date' | 'error'> {
  try {
    const modulesDir = path.join(__dirname, '../../../modules');
    const modulePath = path.join(modulesDir, linkedModule.name);
    const moduleJsonPath = path.join(modulePath, 'module.json');

    if (!fs.existsSync(moduleJsonPath)) {
      console.log(chalk.red(`✗ ${linkedModule.name}: Module not found`));
      return 'error';
    }

    const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
    const latestVersion = moduleData.version;
    const currentVersion = linkedModule.version;

    if (latestVersion === currentVersion) {
      console.log(chalk.gray(`○ ${linkedModule.name}: Already up to date (v${currentVersion})`));
      return 'up-to-date';
    }

    // Check if it's a newer version
    if (compareVersions(latestVersion, currentVersion) > 0) {
      // Update in config
      const moduleIndex = config.modules.findIndex((m: LinkedModule) => m.name === linkedModule.name);
      if (moduleIndex >= 0) {
        config.modules[moduleIndex].version = latestVersion;
        config.modules[moduleIndex].description = moduleData.description;
      }

      console.log(chalk.green(`✓ ${linkedModule.name}: Updated ${currentVersion} → ${latestVersion}`));
      return 'updated';
    } else {
      console.log(chalk.yellow(`⚠ ${linkedModule.name}: Current version (${currentVersion}) is newer than available (${latestVersion})`));
      return 'up-to-date';
    }

  } catch (error) {
    console.log(chalk.red(`✗ ${linkedModule.name}: Error updating - ${error}`));
    return 'error';
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

