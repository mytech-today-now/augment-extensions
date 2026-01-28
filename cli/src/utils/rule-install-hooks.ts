import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Set file permissions (cross-platform)
 * On Unix: sets executable permissions
 * On Windows: no-op (Windows doesn't use Unix permissions)
 */
async function setExecutablePermissions(filePath: string): Promise<void> {
  // Only set permissions on Unix-like systems
  if (process.platform !== 'win32') {
    try {
      await fs.chmod(filePath, 0o755);
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not set executable permissions on ${filePath}`));
    }
  }
}

/**
 * Create a Git hook for automatic rule installation
 * This ensures the character count rule is installed when cloning/pulling
 */
export async function createRuleInstallGitHook(
  hookType: 'post-checkout' | 'post-merge' = 'post-checkout',
  gitDir: string = '.git'
): Promise<void> {
  try {
    // Ensure .git/hooks directory exists
    const hooksDir = path.join(gitDir, 'hooks');
    if (!fsSync.existsSync(hooksDir)) {
      await fs.mkdir(hooksDir, { recursive: true });
    }

    const hookPath = path.join(hooksDir, hookType);

    // Check if hook already exists
    let existingContent = '';
    if (fsSync.existsSync(hookPath)) {
      existingContent = await fs.readFile(hookPath, 'utf-8');

      // Check if rule installation is already in the hook
      if (existingContent.includes('augx install-rules')) {
        console.log(chalk.gray(`Rule installation already configured in ${hookType} hook`));
        return;
      }
    }

    // Cross-platform hook content
    // Use sh for Unix, but also works on Git Bash on Windows
    const ruleInstallHookContent = `
# Auto-install character count management rule
if [ -d .augment ]; then
  echo "Installing character count management rule..."
  augx install-rules --quiet
fi
`;

    // If hook exists, append to it; otherwise create new
    if (existingContent) {
      const updatedContent = existingContent.trimEnd() + '\n' + ruleInstallHookContent;
      await fs.writeFile(hookPath, updatedContent, 'utf-8');
      await setExecutablePermissions(hookPath);
      console.log(chalk.green(`✓ Updated ${hookType} hook with rule installation`));
    } else {
      const newHookContent = `#!/bin/sh
# Auto-install character count management rule
${ruleInstallHookContent}`;
      await fs.writeFile(hookPath, newHookContent, 'utf-8');
      await setExecutablePermissions(hookPath);
      console.log(chalk.green(`✓ Created ${hookType} hook with rule installation`));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`✗ Failed to create Git hook: ${errorMessage}`));
    throw error;
  }
}

/**
 * Remove rule installation from Git hook
 */
export async function removeRuleInstallGitHook(
  hookType: 'post-checkout' | 'post-merge' = 'post-checkout',
  gitDir: string = '.git'
): Promise<void> {
  try {
    const hookPath = path.join(gitDir, 'hooks', hookType);

    if (!fsSync.existsSync(hookPath)) {
      console.log(chalk.gray(`No ${hookType} hook found`));
      return;
    }

    const content = await fs.readFile(hookPath, 'utf-8');

    // Remove rule installation section
    const updatedContent = content
      .replace(/# Auto-install character count management rule[\s\S]*?fi\n/g, '')
      .trim();

    if (updatedContent.length === 0 || updatedContent === '#!/bin/sh') {
      // Hook is now empty, remove it
      await fs.unlink(hookPath);
      console.log(chalk.green(`✓ Removed ${hookType} hook`));
    } else {
      await fs.writeFile(hookPath, updatedContent, 'utf-8');
      await setExecutablePermissions(hookPath);
      console.log(chalk.green(`✓ Removed rule installation from ${hookType} hook`));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`✗ Failed to remove Git hook: ${errorMessage}`));
    throw error;
  }
}

/**
 * Create NPM post-install hook for rule installation
 * This ensures the rule is installed when running npm install
 */
export async function createNpmPostInstallHook(packageJsonPath: string = 'package.json'): Promise<void> {
  if (!fsSync.existsSync(packageJsonPath)) {
    console.log(chalk.yellow('⚠ No package.json found, skipping NPM hook setup'));
    return;
  }

  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    // Check if postinstall script already exists
    if (packageJson.scripts && packageJson.scripts.postinstall) {
      if (packageJson.scripts.postinstall.includes('augx install-rules')) {
        console.log(chalk.gray('Rule installation already configured in package.json postinstall'));
        return;
      }

      // Append to existing postinstall
      packageJson.scripts.postinstall += ' && augx install-rules --quiet';
    } else {
      // Create new postinstall script
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      packageJson.scripts.postinstall = 'augx install-rules --quiet';
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(chalk.green('✓ Added rule installation to package.json postinstall'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`✗ Failed to update package.json: ${errorMessage}`));
    throw error;
  }
}

/**
 * Remove NPM post-install hook for rule installation
 */
export async function removeNpmPostInstallHook(packageJsonPath: string = 'package.json'): Promise<void> {
  if (!fsSync.existsSync(packageJsonPath)) {
    console.log(chalk.gray('No package.json found'));
    return;
  }

  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    if (!packageJson.scripts || !packageJson.scripts.postinstall) {
      console.log(chalk.gray('No postinstall script found in package.json'));
      return;
    }

    // Remove augx install-rules from postinstall
    const updatedPostinstall = packageJson.scripts.postinstall
      .replace(/\s*&&\s*augx install-rules --quiet/g, '')
      .replace(/augx install-rules --quiet\s*&&\s*/g, '')
      .replace(/augx install-rules --quiet/g, '')
      .trim();

    if (updatedPostinstall.length === 0) {
      delete packageJson.scripts.postinstall;
      if (Object.keys(packageJson.scripts).length === 0) {
        delete packageJson.scripts;
      }
    } else {
      packageJson.scripts.postinstall = updatedPostinstall;
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(chalk.green('✓ Removed rule installation from package.json postinstall'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`✗ Failed to update package.json: ${errorMessage}`));
    throw error;
  }
}

