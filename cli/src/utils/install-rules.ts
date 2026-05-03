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

/**
 * ASCII-only-in-code rule content.
 * Restricts AI-generated code to printable ASCII characters.
 */
const ASCII_ONLY_CODE_RULE_CONTENT = `---
type: "always_apply"
---

# ASCII-Only in Generated Code

## Rule

When generating, modifying, or suggesting **code**, use only printable ASCII (U+0020 through U+007E) plus tab, line feed, and carriage return.

## Scope

Applies to:
- Source files in any language
- Identifiers, string literals, regex literals
- Code comments and docstrings
- Fenced code blocks inside Markdown
- Configuration files (JSON, YAML, TOML, INI, .env)
- Shell, PowerShell, and command-line snippets

## Disallowed in Code

- Smart quotes (\u2018 \u2019 \u201C \u201D)
- En-dash (\u2013) and em-dash (\u2014)
- Non-breaking space (U+00A0)
- Accented or non-Latin letters - use ASCII transliterations
- Emoji and pictographic symbols
- Any other character outside U+0000 through U+007F

## Allowed Substitutions

| Instead of | Use |
|---|---|
| \u2014 (em-dash) | - or -- |
| \u2013 (en-dash) | - |
| \u2018 \u2019 (smart single quotes) | ' |
| \u201C \u201D (smart double quotes) | " |
| \u00A0 (NBSP) | regular space |

## Exception

If a non-ASCII character is intrinsic to the data (e.g., test fixtures for Unicode handling, localization payloads), encode it using the language's escape syntax (\\\\uXXXX, \\\\xXX, &#xXXXX;, etc.) rather than embedding the literal character.
`;

/**
 * UTF-8-allowed-in-non-code rule content.
 * Explicitly permits UTF-8 in prose while preserving the ASCII-only-code rule.
 */
const UTF8_NON_CODE_RULE_CONTENT = `---
type: "always_apply"
---

# UTF-8 Allowed in Non-Code Content

## Rule

UTF-8 characters **are permitted** in non-code content. This rule is the explicit complement to the ASCII-only-code rule.

## Where UTF-8 Is Allowed

- Markdown prose outside fenced code blocks
- README narrative sections
- Issue and pull-request descriptions and bodies
- Commit message bodies (commit subject lines should remain ASCII)
- User-facing documentation
- Localized strings stored as data (not as code identifiers)

## Where UTF-8 Is NOT Allowed

The ASCII-only-code rule still governs:
- Code, including fenced code blocks inside Markdown
- File and directory names
- Command examples and shell snippets
- Configuration files

## Interaction with Other Rules

- If the no-em-dash rule is installed, em-dashes remain disallowed everywhere.
- If the no-emoji rule is installed, emoji remain disallowed everywhere.
- This rule grants permission for prose; it does not override stricter rules.
`;

/**
 * No-emoji rule content.
 * Discourages emoji and pictographic symbols in AI output.
 */
const NO_EMOJI_RULE_CONTENT = `---
type: "always_apply"
---

# No Emoji in AI Output

## Rule

**Do not use emoji or pictographic symbols** in any generated content unless the user explicitly requests them.

## Rationale

Emoji render inconsistently across terminals, log aggregators, and accessibility tooling, and they add visual noise without semantic precision.

## Scope

Applies to all AI output, including:
- Code and code comments
- Console and log messages
- Commit messages
- Markdown documentation
- Chat replies to the user

## Disallowed Unicode Ranges (non-exhaustive)

- Emoticons: U+1F600 through U+1F64F
- Misc Symbols and Pictographs: U+1F300 through U+1F5FF
- Transport and Map Symbols: U+1F680 through U+1F6FF
- Supplemental Symbols and Pictographs: U+1F900 through U+1F9FF
- Dingbats: U+2700 through U+27BF
- Misc Symbols (decorative use): U+2600 through U+26FF
- Variation Selectors: U+FE00 through U+FE0F
- Regional Indicator Symbols: U+1F1E6 through U+1F1FF

## Substitutions

| Instead of | Use |
|---|---|
| check mark | [OK] or "done" |
| cross mark | [FAIL] or "error" |
| warning sign | "warning:" |
| rocket | (omit) |
| clipboard | (omit) |

## Exception

When the user explicitly requests emoji (e.g., social-media copy, README badges), comply for that specific request only.
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

/**
 * Shared installer for simple rules that follow the standard pattern:
 *   - File lives in .augment/rules/<filename>
 *   - Skip if existing content is identical
 *   - Skip-with-warning when content differs unless --force
 *
 * Used by the optional rules prompted during `augx init`.
 */
async function installSimpleRule(
  filename: string,
  content: string,
  ruleLabel: string,
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
    const rulePath = path.join(rulesDir, filename);

    const ruleExists = fsSync.existsSync(rulePath);

    if (ruleExists) {
      const existingContent = await fs.readFile(rulePath, 'utf-8');

      if (existingContent.trim() === content.trim()) {
        if (verbose) {
          console.log(chalk.gray(`i ${ruleLabel} rule is up to date`));
        }
        return { success: true, created: false, skipped: true, path: rulePath };
      }

      if (force) {
        if (verbose) {
          console.log(chalk.yellow(`Warning: Replacing existing ${ruleLabel} rule (--force)`));
        }
      } else if (skipIfExists) {
        if (verbose) {
          console.log(chalk.gray(`i ${ruleLabel} rule already exists, skipping...`));
        }
        return { success: true, created: false, skipped: true, path: rulePath };
      } else {
        if (verbose) {
          console.log(chalk.yellow(`Warning: ${ruleLabel} rule exists with different content, skipping...`));
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

    await writeFileSafe(rulePath, content, verbose);

    if (verbose) {
      console.log(chalk.green(`Installed ${ruleLabel} rule`));
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
        console.error(chalk.red(`Failed to install ${ruleLabel} rule:`));
        console.error(chalk.red(`  ${error.message}`));
      }
      return {
        success: false,
        created: false,
        skipped: false,
        error: error.message,
        errorType: error.type
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (verbose) {
      console.error(chalk.red(`Failed to install ${ruleLabel} rule:`), errorMessage);
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
 * Install the ASCII-only-in-code rule to .augment/rules/ascii-only-code.md.
 * Prompted optionally during `augx init`.
 */
export async function installAsciiOnlyCodeRule(
  options: InstallRulesOptions = {}
): Promise<InstallRulesResult> {
  return installSimpleRule(
    'ascii-only-code.md',
    ASCII_ONLY_CODE_RULE_CONTENT,
    'ascii-only-code',
    options
  );
}

/**
 * Install the UTF-8-allowed-in-non-code rule to .augment/rules/utf8-non-code-allowed.md.
 * Prompted optionally during `augx init`.
 */
export async function installUtf8NonCodeRule(
  options: InstallRulesOptions = {}
): Promise<InstallRulesResult> {
  return installSimpleRule(
    'utf8-non-code-allowed.md',
    UTF8_NON_CODE_RULE_CONTENT,
    'utf8-non-code-allowed',
    options
  );
}

/**
 * Install the no-emoji rule to .augment/rules/no-emoji.md.
 * Prompted optionally during `augx init`.
 */
export async function installNoEmojiRule(
  options: InstallRulesOptions = {}
): Promise<InstallRulesResult> {
  return installSimpleRule(
    'no-emoji.md',
    NO_EMOJI_RULE_CONTENT,
    'no-emoji',
    options
  );
}
