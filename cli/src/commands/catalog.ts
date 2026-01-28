import chalk from 'chalk';
import * as path from 'path';
import { updateModulesCatalog } from '../utils/modules-catalog';
import {
  createCatalogGitHook,
  removeCatalogGitHook,
  isCatalogOutOfDate,
  autoUpdateCatalog
} from '../utils/catalog-sync';

interface CatalogOptions {
  output?: string;
  check?: boolean;
  auto?: boolean;
}

interface CatalogHookOptions {
  remove?: boolean;
  type?: 'pre-commit' | 'post-commit';
}

export async function catalogCommand(options: CatalogOptions = {}): Promise<void> {
  try {
    const catalogPath = options.output || path.join(process.cwd(), 'MODULES.md');

    // Check if catalog is out of date
    if (options.check) {
      const outOfDate = isCatalogOutOfDate(catalogPath);
      if (outOfDate) {
        console.log(chalk.yellow('⚠ Catalog is out of date'));
        process.exit(1);
      } else {
        console.log(chalk.green('✓ Catalog is up to date'));
        process.exit(0);
      }
    }

    // Auto-update only if out of date
    if (options.auto) {
      const updated = autoUpdateCatalog(catalogPath);
      if (updated) {
        console.log(chalk.green(`✓ Module catalog updated: ${catalogPath}`));
      } else {
        console.log(chalk.gray('Catalog is already up to date'));
      }
      return;
    }

    // Force update
    console.log(chalk.blue(`\n📚 Updating module catalog...\n`));
    updateModulesCatalog(catalogPath);
    console.log(chalk.green(`✓ Module catalog updated: ${catalogPath}`));
    console.log();

  } catch (error) {
    console.error(chalk.red('Error updating catalog:'), error);
    process.exit(1);
  }
}

export async function catalogHookCommand(options: CatalogHookOptions = {}): Promise<void> {
  try {
    const hookType = options.type || 'pre-commit';
    const gitDir = path.join(process.cwd(), '.git');

    if (options.remove) {
      console.log(chalk.blue(`\n🔧 Removing catalog auto-update from ${hookType} hook...\n`));
      removeCatalogGitHook(hookType, gitDir);
      console.log(chalk.green(`✓ Catalog auto-update removed from ${hookType} hook`));
    } else {
      console.log(chalk.blue(`\n🔧 Setting up catalog auto-update in ${hookType} hook...\n`));
      createCatalogGitHook(hookType, gitDir);
      console.log(chalk.green(`✓ Catalog auto-update configured in ${hookType} hook`));
      console.log(chalk.gray(`\nThe catalog will be automatically updated on ${hookType}`));
    }
    console.log();

  } catch (error) {
    console.error(chalk.red('Error configuring git hook:'), error);
    process.exit(1);
  }
}

