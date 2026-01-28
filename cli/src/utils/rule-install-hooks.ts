import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Create a Git hook for automatic rule installation
 * This ensures the character count rule is installed when cloning/pulling
 */
export function createRuleInstallGitHook(
  hookType: 'post-checkout' | 'post-merge' = 'post-checkout',
  gitDir: string = '.git'
): void {
  const hookPath = path.join(gitDir, 'hooks', hookType);
  
  // Check if hook already exists
  let existingContent = '';
  if (fs.existsSync(hookPath)) {
    existingContent = fs.readFileSync(hookPath, 'utf-8');
    
    // Check if rule installation is already in the hook
    if (existingContent.includes('augx install-rules')) {
      console.log(chalk.gray(`Rule installation already configured in ${hookType} hook`));
      return;
    }
  }
  
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
    fs.writeFileSync(hookPath, updatedContent, { mode: 0o755 });
    console.log(chalk.green(`✓ Updated ${hookType} hook with rule installation`));
  } else {
    const newHookContent = `#!/bin/sh
# Auto-install character count management rule
${ruleInstallHookContent}`;
    fs.writeFileSync(hookPath, newHookContent, { mode: 0o755 });
    console.log(chalk.green(`✓ Created ${hookType} hook with rule installation`));
  }
}

/**
 * Remove rule installation from Git hook
 */
export function removeRuleInstallGitHook(
  hookType: 'post-checkout' | 'post-merge' = 'post-checkout',
  gitDir: string = '.git'
): void {
  const hookPath = path.join(gitDir, 'hooks', hookType);
  
  if (!fs.existsSync(hookPath)) {
    console.log(chalk.gray(`No ${hookType} hook found`));
    return;
  }
  
  const content = fs.readFileSync(hookPath, 'utf-8');
  
  // Remove rule installation section
  const updatedContent = content
    .replace(/# Auto-install character count management rule[\s\S]*?fi\n/g, '')
    .trim();
  
  if (updatedContent.length === 0 || updatedContent === '#!/bin/sh') {
    // Hook is now empty, remove it
    fs.unlinkSync(hookPath);
    console.log(chalk.green(`✓ Removed ${hookType} hook`));
  } else {
    fs.writeFileSync(hookPath, updatedContent, { mode: 0o755 });
    console.log(chalk.green(`✓ Removed rule installation from ${hookType} hook`));
  }
}

/**
 * Create NPM post-install hook for rule installation
 * This ensures the rule is installed when running npm install
 */
export function createNpmPostInstallHook(packageJsonPath: string = 'package.json'): void {
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow('⚠ No package.json found, skipping NPM hook setup'));
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
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
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(chalk.green('✓ Added rule installation to package.json postinstall'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to update package.json:'), error);
  }
}

/**
 * Remove NPM post-install hook for rule installation
 */
export function removeNpmPostInstallHook(packageJsonPath: string = 'package.json'): void {
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.gray('No package.json found'));
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
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
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(chalk.green('✓ Removed rule installation from package.json postinstall'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to update package.json:'), error);
  }
}

