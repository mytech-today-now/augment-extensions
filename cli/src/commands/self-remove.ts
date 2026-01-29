import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface SelfRemoveOptions {
  dryRun?: boolean;
  force?: boolean;
}

export async function selfRemoveCommand(options: SelfRemoveOptions = {}): Promise<void> {
  try {
    console.log(chalk.red('\n⚠️  Augment Extensions Self-Removal\n'));

    const augmentDir = path.join(process.cwd(), '.augment');
    
    if (!fs.existsSync(augmentDir)) {
      console.log(chalk.yellow('Augment Extensions not found in this project.'));
      return;
    }

    // Collect files to be removed
    const filesToRemove = collectFilesToRemove(augmentDir);

    if (options.dryRun) {
      console.log(chalk.blue('Dry-run mode: The following files would be removed:\n'));
      filesToRemove.forEach(file => {
        console.log(chalk.gray(`  - ${file}`));
      });
      console.log(chalk.blue(`\nTotal: ${filesToRemove.length} file(s)`));
      return;
    }

    // Display what will be removed
    console.log(chalk.yellow('The following will be removed:\n'));
    console.log(chalk.gray(`  - .augment/ directory (${filesToRemove.length} files)`));
    console.log(chalk.gray(`  - VS Code extensions.json entries (if any)`));
    console.log(chalk.gray(`  - augx CLI tool (if installed globally)`));

    // Confirmation prompt
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: chalk.red('Are you sure you want to remove all Augment Extensions?'),
          default: false
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Cancelled.'));
        return;
      }

      // Double confirmation
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

    // Calculate checksums before removal
    console.log(chalk.blue('\nCalculating checksums...'));
    const checksums = calculateChecksums(filesToRemove);

    // Perform removal
    console.log(chalk.blue('Removing Augment Extensions...\n'));

    // Remove .augment directory
    if (fs.existsSync(augmentDir)) {
      fs.rmSync(augmentDir, { recursive: true, force: true });
      console.log(chalk.green('✓ Removed .augment/ directory'));
    }

    // Clean up VS Code extensions.json
    const vscodeDir = path.join(process.cwd(), '.vscode');
    const extensionsJsonPath = path.join(vscodeDir, 'extensions.json');
    
    if (fs.existsSync(extensionsJsonPath)) {
      try {
        const extensionsJson = JSON.parse(fs.readFileSync(extensionsJsonPath, 'utf-8'));
        
        // Remove Augment-related recommendations
        if (extensionsJson.recommendations) {
          const originalLength = extensionsJson.recommendations.length;
          extensionsJson.recommendations = extensionsJson.recommendations.filter(
            (ext: string) => !ext.includes('augment')
          );
          
          if (extensionsJson.recommendations.length < originalLength) {
            fs.writeFileSync(extensionsJsonPath, JSON.stringify(extensionsJson, null, 2));
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
      filesRemoved: filesToRemove.length,
      checksums,
      success: true
    };
    fs.writeFileSync(logPath, JSON.stringify(logContent, null, 2));

    console.log(chalk.green('\n✓ Augment Extensions successfully removed!'));
    console.log(chalk.gray(`\nRemoval log saved to: ${logPath}`));
    console.log(chalk.blue('\nTo reinstall Augment Extensions:'));
    console.log(chalk.gray('  npm install -g @mytechtoday/augment-extensions'));
    console.log(chalk.gray('  augx init'));

  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

function collectFilesToRemove(augmentDir: string): string[] {
  const files: string[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(augmentDir)) {
    walkDir(augmentDir);
  }

  return files;
}

function calculateChecksums(files: string[]): Record<string, string> {
  const checksums: Record<string, string> = {};

  for (const file of files) {
    try {
      const content = fs.readFileSync(file);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      checksums[file] = hash;
    } catch (error) {
      // Skip files that can't be read
    }
  }

  return checksums;
}

