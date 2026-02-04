import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { installCharacterCountRule } from '../utils/install-rules';
import { extractCommandHelp } from '../utils/extractCommandHelp';

interface InitOptions {
  fromSubmodule?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.bold.blue('\n🚀 Initializing Augment Extensions\n'));

  try {
    // Check if already initialized
    const augmentDir = path.join(process.cwd(), '.augment');
    const extensionsConfig = path.join(augmentDir, 'extensions.json');

    if (fs.existsSync(extensionsConfig)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Augment Extensions already initialized. Overwrite?',
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }
    }

    // Create .augment directory if it doesn't exist
    if (!fs.existsSync(augmentDir)) {
      fs.mkdirSync(augmentDir, { recursive: true });
      console.log(chalk.green('✓ Created .augment directory'));
    }

    // Create extensions.json
    const config = {
      version: '0.1.0',
      modules: [],
      settings: {
        autoUpdate: false,
        checkUpdatesOnInit: true
      }
    };

    fs.writeFileSync(extensionsConfig, JSON.stringify(config, null, 2));
    console.log(chalk.green('✓ Created extensions.json'));

    // Update or create AGENTS.md
    const agentsPath = path.join(process.cwd(), 'AGENTS.md');
    const agentsContent = `
# Augment Extensions Integration

This project uses Augment Extensions for additional AI coding guidelines.

## For AI Agents

Use the \`augx\` CLI to discover and apply extension modules:

\`\`\`bash
# List linked modules
augx list --linked

# Show module details
augx show <module-name>

# Search for modules
augx search <keyword>
\`\`\`

## Linked Modules

Check \`.augment/extensions.json\` for currently linked modules.
`;

    if (fs.existsSync(agentsPath)) {
      const existing = fs.readFileSync(agentsPath, 'utf-8');
      if (!existing.includes('Augment Extensions')) {
        fs.appendFileSync(agentsPath, '\n' + agentsContent);
        console.log(chalk.green('✓ Updated AGENTS.md'));
      }
    } else {
      fs.writeFileSync(agentsPath, agentsContent.trim());
      console.log(chalk.green('✓ Created AGENTS.md'));
    }

    // Create .gitignore entry if needed
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignore.includes('.augment/extensions.json')) {
        fs.appendFileSync(gitignorePath, '\n# Augment Extensions\n.augment/extensions.json\n');
        console.log(chalk.green('✓ Updated .gitignore'));
      }
    }

    // Install character count management rule
    console.log(chalk.blue('\n📏 Installing character count management rule...\n'));
    const ruleResult = await installCharacterCountRule({
      targetDir: process.cwd(),
      skipIfExists: true,
      verbose: true
    });

    if (!ruleResult.success) {
      console.log(chalk.yellow(`⚠ Warning: Could not install character count rule: ${ruleResult.error}`));
      console.log(chalk.gray('You can manually copy the rule from .augment/rules/character-count-management.md'));
    }

    // Extract command help for workflow tools
    console.log(chalk.blue('\n📖 Extracting command help for workflow tools...\n'));
    try {
      const helpOutputPath = '.augment/COMMAND_HELP.md';
      await extractCommandHelp(process.cwd(), helpOutputPath);
      console.log(chalk.green('✓ Command help reference generated'));
    } catch (error: any) {
      console.log(chalk.yellow(`⚠ Warning: Could not extract command help: ${error.message}`));
      console.log(chalk.gray('You can manually run: augx extract-help'));
    }

    // Initialize .beads directory and completed.jsonl
    const beadsDir = path.join(process.cwd(), '.beads');
    const beadsIssuesPath = path.join(beadsDir, 'issues.jsonl');
    const beadsConfigPath = path.join(beadsDir, 'config.json');

    // Check if Beads should be initialized (either .beads exists or issues.jsonl exists)
    const shouldInitBeads = fs.existsSync(beadsDir) || fs.existsSync(beadsIssuesPath);

    if (shouldInitBeads) {
      console.log(chalk.blue('\n📋 Initializing Beads integration...\n'));

      // Create .beads directory if it doesn't exist
      if (!fs.existsSync(beadsDir)) {
        fs.mkdirSync(beadsDir, { recursive: true });
        console.log(chalk.green('✓ Created .beads directory'));
      }

      // Create issues.jsonl if it doesn't exist
      if (!fs.existsSync(beadsIssuesPath)) {
        fs.writeFileSync(beadsIssuesPath, '', 'utf-8');
        console.log(chalk.green('✓ Created .beads/issues.jsonl'));
      }

      // Create config.json if it doesn't exist
      if (!fs.existsSync(beadsConfigPath)) {
        const beadsConfig = {
          version: '1.0.0',
          project: path.basename(process.cwd()),
          created: new Date().toISOString()
        };
        fs.writeFileSync(beadsConfigPath, JSON.stringify(beadsConfig, null, 2), 'utf-8');
        console.log(chalk.green('✓ Created .beads/config.json'));
      }

      // Create scripts directory if it doesn't exist
      const scriptsDir = path.join(process.cwd(), 'scripts');
      if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
        console.log(chalk.green('✓ Created scripts directory'));
      }

      // Create completed.jsonl if it doesn't exist
      const completedPath = path.join(scriptsDir, 'completed.jsonl');
      if (!fs.existsSync(completedPath)) {
        fs.writeFileSync(completedPath, '', 'utf-8');
        console.log(chalk.green('✓ Created scripts/completed.jsonl'));
      }
    }

    console.log(chalk.bold.green('\n✨ Augment Extensions initialized successfully!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Link modules: augx link coding-standards/typescript'));
    console.log(chalk.gray('  2. View modules: augx list'));
    console.log(chalk.gray('  3. Show details: augx show <module-name>\n'));

  } catch (error) {
    console.error(chalk.red('Error during initialization:'), error);
    process.exit(1);
  }
}

