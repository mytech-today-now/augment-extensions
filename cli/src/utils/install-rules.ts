import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Character count management rule content
 * This is embedded to avoid hardcoded paths and ensure cross-platform compatibility
 */
const CHARACTER_COUNT_RULE_CONTENT = `---
type: "always_apply"
---

# Character Count Management for .augment/ Directory

## Target Range

**Total character count of all files in \`.augment/\` directory: 48,599 - 49,299 characters**

## Extension System

**For content exceeding the character limit, use Augment Extensions:**

This repository provides an extension module system that allows unlimited content storage outside the \`.augment/\` folder. See [AGENTS.md](../../AGENTS.md) for details on how to use extension modules.

## Verification Command

\`\`\`powershell
Get-ChildItem -Path ".augment" -Recurse -File | Get-Content -Raw | Measure-Object -Character | Select-Object -ExpandProperty Characters
\`\`\`

## Character Reduction Priority (When Over Target)

### 1. Condense Examples (First Priority)
- Make examples more concise
- Keep 1-2 examples per concept maximum

### 2. Remove Examples (Second Priority)
- Remove least critical examples

### 3. Reduce Redundancy (Third Priority)
- Remove duplicate content
- Consolidate similar sections

### 4. Streamline Content (Fourth Priority)
- Use more concise language
- Combine related bullet points

## Content Preservation Rules

### NEVER Remove
- Core requirements and constraints
- Critical validation rules

### Always Preserve
- Specific, actionable guidance
- Technical accuracy and precision

## Validation Process

Before committing changes to \`.augment/\` files:
1. Run character count verification command
2. Verify total is within 48,599 - 49,299 range
3. If outside range, apply reduction/addition priorities
`;

/**
 * Em-dash prevention rule content.
 * Instructs AI agents never to use the em-dash character (U+2014) in any output.
 */
const NO_EM_DASH_RULE_CONTENT = `---
type: "always_apply"
---

# No Em-Dash in AI Output

## Rule

**Never use the em-dash character (\u2014) in any generated text, code, comments, or documentation.**

Use a regular hyphen-minus (-) or double-hyphen (--) instead.

## Rationale

Em-dashes cause copy-paste and encoding issues in terminals, config files, and cross-platform tooling. Plain ASCII punctuation is always safe and unambiguous.

## Examples

| Instead of | Use |
|---|---|
| \`foo \u2014 bar\` | \`foo - bar\` or \`foo -- bar\` |
| \`critical \u2014 warn immediately\` | \`critical - warn immediately\` |

## Scope

This rule applies to **all** AI-generated output in this project:
- Code comments
- Markdown documentation
- Console/log messages
- Commit messages
- Any other text
`;

export interface InstallRulesOptions {
  targetDir?: string;
  skipIfExists?: boolean;
  verbose?: boolean;
  force?: boolean;
  interactive?: boolean;
}

export interface InstallRulesResult {
  success: boolean;
  created: boolean;
  skipped: boolean;
  updated?: boolean;
  error?: string;
  errorType?: 'PERMISSION_DENIED' | 'DISK_FULL' | 'CONFLICT' | 'UNKNOWN';
  path?: string;
}

/**
 * Error types for better error handling
 */
export class InstallRulesError extends Error {
  constructor(
    message: string,
    public type: 'PERMISSION_DENIED' | 'DISK_FULL' | 'CONFLICT' | 'UNKNOWN',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'InstallRulesError';
  }
}

/**
 * Check if directory exists and is writable
 */
async function checkDirectoryWritable(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath, fsSync.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create directory with proper error handling
 */
async function createDirectorySafe(dirPath: string, verbose: boolean = false): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    if (verbose) {
      console.log(chalk.green(`✓ Created directory: ${dirPath}`));
    }
  } catch (error: any) {
    // Check for specific error types
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw new InstallRulesError(
        `Permission denied: Cannot create directory ${dirPath}`,
        'PERMISSION_DENIED',
        error
      );
    } else if (error.code === 'ENOSPC') {
      throw new InstallRulesError(
        `Disk full: Cannot create directory ${dirPath}`,
        'DISK_FULL',
        error
      );
    } else {
      throw new InstallRulesError(
        `Failed to create directory ${dirPath}: ${error.message}`,
        'UNKNOWN',
        error
      );
    }
  }
}

/**
 * Write file with proper error handling and rollback support
 */
async function writeFileSafe(
  filePath: string,
  content: string,
  verbose: boolean = false
): Promise<void> {
  const backupPath = `${filePath}.backup`;
  let backupCreated = false;

  try {
    // Create backup if file exists
    if (fsSync.existsSync(filePath)) {
      await fs.copyFile(filePath, backupPath);
      backupCreated = true;
      if (verbose) {
        console.log(chalk.gray(`Created backup: ${backupPath}`));
      }
    }

    // Write the file
    await fs.writeFile(filePath, content, 'utf-8');

    // Remove backup on success
    if (backupCreated) {
      await fs.unlink(backupPath);
    }

    if (verbose) {
      console.log(chalk.green(`✓ Wrote file: ${filePath}`));
    }
  } catch (error: any) {
    // Rollback on error
    if (backupCreated) {
      try {
        await fs.copyFile(backupPath, filePath);
        await fs.unlink(backupPath);
        if (verbose) {
          console.log(chalk.yellow('Rolled back changes from backup'));
        }
      } catch (rollbackError) {
        console.error(chalk.red('Failed to rollback changes'), rollbackError);
      }
    }

    // Throw appropriate error
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw new InstallRulesError(
        `Permission denied: Cannot write to ${filePath}`,
        'PERMISSION_DENIED',
        error
      );
    } else if (error.code === 'ENOSPC') {
      throw new InstallRulesError(
        `Disk full: Cannot write to ${filePath}`,
        'DISK_FULL',
        error
      );
    } else {
      throw new InstallRulesError(
        `Failed to write file ${filePath}: ${error.message}`,
        'UNKNOWN',
        error
      );
    }
  }
}

/**
 * Prompt user for conflict resolution
 */
async function promptConflictResolution(
  existingContent: string,
  newContent: string,
  verbose: boolean
): Promise<'keep' | 'replace' | 'skip'> {
  // For now, return 'skip' - in future, could use inquirer for interactive prompts
  if (verbose) {
    console.log(chalk.yellow('\n⚠ Conflict detected:'));
    console.log(chalk.gray('  Existing rule has different content'));
    console.log(chalk.gray('  Use --force to replace, or manually update the file'));
  }
  return 'skip';
}

/**
 * Install character count management rule to .augment/rules directory
 *
 * @param options - Installation options
 * @returns Installation result
 */
export async function installCharacterCountRule(
  options: InstallRulesOptions = {}
): Promise<InstallRulesResult> {
  const {
    targetDir = process.cwd(),
    skipIfExists = true,
    verbose = false,
    force = false,
    interactive = false
  } = options;

  try {
    // Ensure paths use platform-appropriate separators (cross-platform)
    const augmentDir = path.join(targetDir, '.augment');
    const rulesDir = path.join(augmentDir, 'rules');
    const rulePath = path.join(rulesDir, 'character-count-management.md');

    // Check if rule already exists
    const ruleExists = fsSync.existsSync(rulePath);

    if (ruleExists) {
      // Read existing content
      const existingContent = await fs.readFile(rulePath, 'utf-8');

      // Check if content is identical
      if (existingContent.trim() === CHARACTER_COUNT_RULE_CONTENT.trim()) {
        if (verbose) {
          console.log(chalk.gray('ℹ Character count rule is up to date'));
        }
        return {
          success: true,
          created: false,
          skipped: true,
          path: rulePath
        };
      }

      // Content is different - handle conflict
      if (force) {
        // Force replace
        if (verbose) {
          console.log(chalk.yellow('⚠ Replacing existing rule (--force)'));
        }
      } else if (skipIfExists) {
        // Skip if exists
        if (verbose) {
          console.log(chalk.gray('ℹ Character count rule already exists, skipping...'));
        }
        return {
          success: true,
          created: false,
          skipped: true,
          path: rulePath
        };
      } else if (interactive) {
        // Prompt user for resolution
        const resolution = await promptConflictResolution(
          existingContent,
          CHARACTER_COUNT_RULE_CONTENT,
          verbose
        );

        if (resolution === 'skip') {
          return {
            success: true,
            created: false,
            skipped: true,
            path: rulePath
          };
        } else if (resolution === 'keep') {
          return {
            success: true,
            created: false,
            skipped: true,
            path: rulePath
          };
        }
        // 'replace' falls through to write
      } else {
        // Default: skip with warning
        if (verbose) {
          console.log(chalk.yellow('⚠ Character count rule exists with different content, skipping...'));
          console.log(chalk.gray('  Use --force to replace'));
        }
        return {
          success: true,
          created: false,
          skipped: true,
          path: rulePath
        };
      }
    }

    // Create .augment directory if it doesn't exist
    if (!fsSync.existsSync(augmentDir)) {
      await createDirectorySafe(augmentDir, verbose);
    } else {
      // Check if directory is writable
      const isWritable = await checkDirectoryWritable(augmentDir);
      if (!isWritable) {
        throw new InstallRulesError(
          `Permission denied: .augment directory is not writable`,
          'PERMISSION_DENIED'
        );
      }
    }

    // Create rules directory if it doesn't exist
    if (!fsSync.existsSync(rulesDir)) {
      await createDirectorySafe(rulesDir, verbose);
    } else {
      // Check if directory is writable
      const isWritable = await checkDirectoryWritable(rulesDir);
      if (!isWritable) {
        throw new InstallRulesError(
          `Permission denied: .augment/rules directory is not writable`,
          'PERMISSION_DENIED'
        );
      }
    }

    // Write the rule file with rollback support
    await writeFileSafe(rulePath, CHARACTER_COUNT_RULE_CONTENT, verbose);

    if (verbose) {
      console.log(chalk.green('✓ Installed character count management rule'));
    }

    return {
      success: true,
      created: !ruleExists,
      updated: ruleExists,
      skipped: false,
      path: rulePath
    };

  } catch (error) {
    // Handle InstallRulesError with specific error types
    if (error instanceof InstallRulesError) {
      if (verbose) {
        console.error(chalk.red('✗ Failed to install character count rule:'));
        console.error(chalk.red(`  ${error.message}`));

        // Provide helpful suggestions based on error type
        if (error.type === 'PERMISSION_DENIED') {
          console.error(chalk.yellow('\n  Suggestions:'));
          console.error(chalk.yellow('  - Check file/directory permissions'));
          console.error(chalk.yellow('  - Run with appropriate privileges (sudo on Unix)'));
          console.error(chalk.yellow('  - Ensure .augment directory is not read-only'));
        } else if (error.type === 'DISK_FULL') {
          console.error(chalk.yellow('\n  Suggestions:'));
          console.error(chalk.yellow('  - Free up disk space'));
          console.error(chalk.yellow('  - Check disk quota'));
        }
      }

      return {
        success: false,
        created: false,
        skipped: false,
        error: error.message,
        errorType: error.type
      };
    }

    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (verbose) {
      console.error(chalk.red('✗ Failed to install character count rule:'), errorMessage);
    }

    return {
      success: false,
      created: false,
      skipped: false,
      error: errorMessage,
      errorType: 'UNKNOWN'
    };
  }
}

/**
 * Install the no-em-dash rule to .augment/rules directory.
 * Mirrors the shape of installCharacterCountRule.
 */
export async function installEmDashRule(
  options: InstallRulesOptions = {}
): Promise<InstallRulesResult> {
  const {
    targetDir = process.cwd(),
    skipIfExists = true,
    verbose = false,
    force = false
  } = options;

  try {
    const augmentDir = path.join(targetDir, '.augment');
    const rulesDir = path.join(augmentDir, 'rules');
    const rulePath = path.join(rulesDir, 'no-em-dash.md');

    const ruleExists = fsSync.existsSync(rulePath);

    if (ruleExists) {
      const existingContent = await fs.readFile(rulePath, 'utf-8');

      if (existingContent.trim() === NO_EM_DASH_RULE_CONTENT.trim()) {
        if (verbose) {
          console.log(chalk.gray('i No-em-dash rule is up to date'));
        }
        return { success: true, created: false, skipped: true, path: rulePath };
      }

      if (force) {
        if (verbose) {
          console.log(chalk.yellow('Warning: Replacing existing no-em-dash rule (--force)'));
        }
      } else if (skipIfExists) {
        if (verbose) {
          console.log(chalk.gray('i No-em-dash rule already exists, skipping...'));
        }
        return { success: true, created: false, skipped: true, path: rulePath };
      } else {
        if (verbose) {
          console.log(chalk.yellow('Warning: No-em-dash rule exists with different content, skipping...'));
          console.log(chalk.gray('  Use --force to replace'));
        }
        return { success: true, created: false, skipped: true, path: rulePath };
      }
    }

    if (!fsSync.existsSync(augmentDir)) {
      await createDirectorySafe(augmentDir, verbose);
    }

    if (!fsSync.existsSync(rulesDir)) {
      await createDirectorySafe(rulesDir, verbose);
    }

    await writeFileSafe(rulePath, NO_EM_DASH_RULE_CONTENT, verbose);

    if (verbose) {
      console.log(chalk.green('Installed no-em-dash rule'));
    }

    return {
      success: true,
      created: !ruleExists,
      updated: ruleExists,
      skipped: false,
      path: rulePath
    };

  } catch (error) {
    if (error instanceof InstallRulesError) {
      if (verbose) {
        console.error(chalk.red('Failed to install no-em-dash rule:'));
        console.error(chalk.red(`  ${(error as InstallRulesError).message}`));
      }
      return {
        success: false,
        created: false,
        skipped: false,
        error: (error as InstallRulesError).message,
        errorType: (error as InstallRulesError).type
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (verbose) {
      console.error(chalk.red('Failed to install no-em-dash rule:'), errorMessage);
    }
    return {
      success: false,
      created: false,
      skipped: false,
      error: errorMessage,
      errorType: 'UNKNOWN'
    };
  }
}
