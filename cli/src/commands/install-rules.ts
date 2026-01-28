import chalk from 'chalk';
import * as path from 'path';
import { installCharacterCountRule } from '../utils/install-rules';
import {
  createRuleInstallGitHook,
  removeRuleInstallGitHook,
  createNpmPostInstallHook,
  removeNpmPostInstallHook
} from '../utils/rule-install-hooks';

interface InstallRulesOptions {
  quiet?: boolean;
  setupHooks?: boolean;
  removeHooks?: boolean;
  gitHookType?: 'post-checkout' | 'post-merge';
}

/**
 * Install character count management rule
 */
export async function installRulesCommand(options: InstallRulesOptions = {}): Promise<void> {
  const {
    quiet = false,
    setupHooks = false,
    removeHooks = false,
    gitHookType = 'post-checkout'
  } = options;

  try {
    if (removeHooks) {
      // Remove hooks
      if (!quiet) {
        console.log(chalk.blue('\n🔧 Removing rule installation hooks...\n'));
      }

      const gitDir = path.join(process.cwd(), '.git');
      removeRuleInstallGitHook(gitHookType, gitDir);
      removeNpmPostInstallHook(path.join(process.cwd(), 'package.json'));

      if (!quiet) {
        console.log(chalk.green('\n✓ Rule installation hooks removed\n'));
      }
      return;
    }

    if (setupHooks) {
      // Setup hooks
      if (!quiet) {
        console.log(chalk.blue('\n🔧 Setting up rule installation hooks...\n'));
      }

      const gitDir = path.join(process.cwd(), '.git');
      createRuleInstallGitHook(gitHookType, gitDir);
      createNpmPostInstallHook(path.join(process.cwd(), 'package.json'));

      if (!quiet) {
        console.log(chalk.green('\n✓ Rule installation hooks configured\n'));
        console.log(chalk.gray('The character count rule will be automatically installed on:'));
        console.log(chalk.gray(`  - Git ${gitHookType}`));
        console.log(chalk.gray('  - npm install (postinstall)\n'));
      }
      return;
    }

    // Install rule
    if (!quiet) {
      console.log(chalk.blue('\n📏 Installing character count management rule...\n'));
    }

    const result = await installCharacterCountRule({
      targetDir: process.cwd(),
      skipIfExists: true,
      verbose: !quiet
    });

    if (!result.success) {
      if (!quiet) {
        console.error(chalk.red(`\n✗ Failed to install rule: ${result.error}\n`));
      }
      process.exit(1);
    }

    if (!quiet) {
      if (result.created) {
        console.log(chalk.green('\n✓ Character count management rule installed successfully!\n'));
        console.log(chalk.gray(`Location: ${result.path}\n`));
      } else if (result.skipped) {
        console.log(chalk.gray('\nℹ Character count rule already exists\n'));
      }
    }

  } catch (error) {
    if (!quiet) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

