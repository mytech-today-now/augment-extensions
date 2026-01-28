import * as fs from 'fs';
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

export interface InstallRulesOptions {
  targetDir?: string;
  skipIfExists?: boolean;
  verbose?: boolean;
}

export interface InstallRulesResult {
  success: boolean;
  created: boolean;
  skipped: boolean;
  error?: string;
  path?: string;
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
    verbose = false
  } = options;

  try {
    // Ensure paths use platform-appropriate separators
    const augmentDir = path.join(targetDir, '.augment');
    const rulesDir = path.join(augmentDir, 'rules');
    const rulePath = path.join(rulesDir, 'character-count-management.md');

    // Check if rule already exists
    if (fs.existsSync(rulePath)) {
      if (skipIfExists) {
        if (verbose) {
          console.log(chalk.gray('ℹ Character count rule already exists, skipping...'));
        }
        return {
          success: true,
          created: false,
          skipped: true,
          path: rulePath
        };
      }

      // Check if content is different
      const existingContent = fs.readFileSync(rulePath, 'utf-8');
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

      // Content is different - could prompt user, but for now we skip
      if (verbose) {
        console.log(chalk.yellow('⚠ Character count rule exists with different content, skipping...'));
      }
      return {
        success: true,
        created: false,
        skipped: true,
        path: rulePath
      };
    }

    // Create .augment directory if it doesn't exist
    if (!fs.existsSync(augmentDir)) {
      fs.mkdirSync(augmentDir, { recursive: true });
      if (verbose) {
        console.log(chalk.green('✓ Created .augment directory'));
      }
    }

    // Create rules directory if it doesn't exist
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
      if (verbose) {
        console.log(chalk.green('✓ Created .augment/rules directory'));
      }
    }

    // Write the rule file
    fs.writeFileSync(rulePath, CHARACTER_COUNT_RULE_CONTENT, 'utf-8');

    if (verbose) {
      console.log(chalk.green('✓ Installed character count management rule'));
    }

    return {
      success: true,
      created: true,
      skipped: false,
      path: rulePath
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (verbose) {
      console.error(chalk.red('✗ Failed to install character count rule:'), errorMessage);
    }

    return {
      success: false,
      created: false,
      skipped: false,
      error: errorMessage
    };
  }
}

