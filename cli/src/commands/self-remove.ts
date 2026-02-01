import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';

interface SelfRemoveOptions {
  dryRun?: boolean;
  force?: boolean;
}

export async function selfRemoveCommand(options: SelfRemoveOptions = {}): Promise<void> {
  try {
    console.log(chalk.red('\n⚠️  Augment Extensions Self-Removal\n'));

    const augmentDir = path.join(process.cwd(), '.augment');
    const extensionsConfigPath = path.join(augmentDir, 'extensions.json');

    if (!fs.existsSync(extensionsConfigPath)) {
      console.log(chalk.yellow('Augment Extensions not found in this project.'));
      return;
    }

    // Load current config to show what will be removed
    const config = JSON.parse(fs.readFileSync(extensionsConfigPath, 'utf-8'));
    const linkedModules = config.modules || [];

    if (options.dryRun) {
      console.log(chalk.blue('Dry-run mode: The following would be removed:\n'));
      console.log(chalk.gray('  - All linked modules from extensions.json:'));
      linkedModules.forEach((module: any) => {
        console.log(chalk.gray(`    • ${module.name} (v${module.version})`));
      });
      console.log(chalk.gray('  - VS Code extensions.json entries (if any)'));
      console.log(chalk.blue(`\nTotal: ${linkedModules.length} module(s)`));
      console.log(chalk.gray('\nNote: .augment/ directory and extensions.json file will be preserved'));
      return;
    }

    // Display what will be removed
    console.log(chalk.yellow('The following will be removed:\n'));
    console.log(chalk.gray(`  - All linked modules (${linkedModules.length} modules):`));
    linkedModules.forEach((module: any) => {
      console.log(chalk.gray(`    • ${module.name} (v${module.version})`));
    });
    console.log(chalk.gray(`  - VS Code extensions.json entries (if any)`));
    console.log(chalk.cyan('\nNote: .augment/ directory and extensions.json file will be preserved'));

    // Confirmation prompt
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: chalk.red('Are you sure you want to unlink all modules?'),
          default: false
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Cancelled.'));
        return;
      }

      // Double confirmation only if there are many modules
      if (linkedModules.length > 5) {
        const { doubleConfirm } = await inquirer.prompt([
          {
            type: 'input',
            name: 'doubleConfirm',
            message: 'Type "REMOVE" to confirm:',
            validate: (input: string) => input === 'REMOVE' || 'You must type "REMOVE" to confirm'
          }
        ]);

        if (doubleConfirm !== 'REMOVE') {
          console.log(chalk.yellow('Cancelled.'));
          return;
        }
      }
    }

    // Perform removal
    console.log(chalk.blue('\nRemoving linked modules...\n'));

    // Clear modules array in extensions.json
    const originalModules = [...config.modules];
    config.modules = [];

    fs.writeFileSync(extensionsConfigPath, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✓ Removed ${originalModules.length} linked module(s) from extensions.json`));

    // Clean up VS Code extensions.json
    const vscodeDir = path.join(process.cwd(), '.vscode');
    const vscodeExtensionsJsonPath = path.join(vscodeDir, 'extensions.json');

    if (fs.existsSync(vscodeExtensionsJsonPath)) {
      try {
        const extensionsJson = JSON.parse(fs.readFileSync(vscodeExtensionsJsonPath, 'utf-8'));

        // Remove Augment-related recommendations
        if (extensionsJson.recommendations) {
          const originalLength = extensionsJson.recommendations.length;
          extensionsJson.recommendations = extensionsJson.recommendations.filter(
            (ext: string) => !ext.includes('augment')
          );

          if (extensionsJson.recommendations.length < originalLength) {
            fs.writeFileSync(vscodeExtensionsJsonPath, JSON.stringify(extensionsJson, null, 2));
            console.log(chalk.green('✓ Cleaned VS Code extensions.json'));
          }
        }
      } catch (error) {
        console.log(chalk.yellow('⚠ Could not clean VS Code extensions.json'));
      }
    }

    // Log removal
    const logPath = path.join(process.cwd(), '.augment-removal.log');
    const logContent = {
      timestamp: new Date().toISOString(),
      modulesRemoved: originalModules.length,
      modules: originalModules,
      success: true
    };
    fs.writeFileSync(logPath, JSON.stringify(logContent, null, 2));

    console.log(chalk.green('\n✓ All linked modules successfully removed!'));
    console.log(chalk.gray(`\nRemoval log saved to: ${logPath}`));
    console.log(chalk.cyan('\nNote: .augment/ directory and extensions.json preserved'));
    console.log(chalk.blue('\nTo link modules again:'));
    console.log(chalk.gray('  augx link <module-name>'));

  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

