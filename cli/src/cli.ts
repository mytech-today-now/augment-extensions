#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initCommand } from './commands/init';
import { listCommand } from './commands/list';
import { showCommand, showModuleCommand } from './commands/show';
import { linkCommand } from './commands/link';
import { updateCommand } from './commands/update';
import { searchCommand } from './commands/search';
import { coordSpecsCommand, coordTasksCommand, coordRulesCommand, coordFileCommand } from './commands/coord';
import { syncBeadsCommand, syncOpenSpecCommand, syncAllCommand, syncWatchCommand } from './commands/sync';
import { migrateExistingData } from './utils/migrate';
import { validateCommand } from './commands/validate';
import { catalogCommand, catalogHookCommand } from './commands/catalog';
import { installRulesCommand } from './commands/install-rules';
import { guiCommand } from './commands/gui';
import { unlinkCommand } from './commands/unlink';
import { selfRemoveCommand } from './commands/self-remove';
import {
  skillListCommand,
  skillShowCommand,
  skillValidateCommand,
  skillSearchCommand,
  skillExecCommand,
  skillInjectCommand,
  skillLoadBatchCommand,
  skillCacheClearCommand,
  skillCacheStatsCommand,
  skillCreateMcpCommand
} from './commands/skill';
import {
  mcpListCommand,
  mcpAddCommand,
  mcpRemoveCommand,
  mcpExecCommand,
  mcpWrapCommand,
  mcpDiscoverCommand,
  mcpGenerateCLICommand
} from './commands/mcp';

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('augx')
  .description('CLI tool for managing Augment Code AI extension modules')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize Augment Extensions in current project')
  .option('--from-submodule', 'Initialize from existing submodule')
  .action(initCommand);

program
  .command('gui')
  .description('Launch interactive GUI for module management')
  .action(guiCommand);

program
  .command('list')
  .description('List available or linked extension modules')
  .option('--linked', 'Show only linked modules')
  .option('--json', 'Output as JSON')
  .action(listCommand);

program
  .command('show <module>')
  .description('Display detailed information about a module')
  .option('--json', 'Output as JSON')
  .action(showCommand);

// Enhanced module inspection command
const showModuleCmd = program
  .command('show module <module-name> [file-path]')
  .description('Inspect module structure, content, and files')
  .option('--json', 'Output as JSON')
  .option('--content', 'Display aggregated content from all module files')
  .option('--format <format>', 'Output format: json, markdown, text', 'text')
  .option('--depth <number>', 'Recursion depth for submodules (max 5)', '1')
  .option('--filter <pattern>', 'Filter files by glob pattern (e.g., "*.md")')
  .option('--search <term>', 'Search within module content')
  .option('--page <number>', 'Page number for paginated output', parseInt)
  .option('--page-size <number>', 'Number of items per page (default: 10)', parseInt)
  .option('--secure', 'Redact sensitive data (API keys, secrets, tokens, passwords)')
  .option('--no-cache', 'Disable caching for this inspection')
  .option('--open', 'Open file in VS Code editor')
  .option('--preview', 'Open file in VS Code preview pane')
  .action((moduleName: string, filePath: string | undefined, options: any) => {
    showModuleCommand(moduleName, filePath, options);
  });

showModuleCmd.addHelpText('after', `
Examples:
  $ augx show module php-standards                    # Module overview
  $ augx show module php-standards --content          # Aggregated content
  $ augx show module php-standards rules/psr.md       # Individual file
  $ augx show module php-standards --format json      # JSON output
  $ augx show module php-standards --filter "*.md"    # Filter markdown files
  $ augx show module php-standards --search "PSR-12"  # Search content
  $ augx show module php-standards --content --page 2 # View page 2
`);

program
  .command('link <module>')
  .description('Link an extension module to current project')
  .option('--version <version>', 'Specific version to link')
  .action(linkCommand);

program
  .command('unlink <module>')
  .description('Unlink an extension module or collection from current project')
  .option('--force', 'Force unlink even if other modules depend on it')
  .action(unlinkCommand);

program
  .command('update')
  .description('Update CLI and/or linked modules to latest versions')
  .option('--module <name>', 'Update specific module only')
  .option('--cli', 'Update the CLI itself to the latest version')
  .option('--all', 'Update both CLI and all linked modules')
  .action(updateCommand);

program
  .command('search <keyword>')
  .description('Search for extension modules')
  .option('--type <type>', 'Filter by module type')
  .action(searchCommand);

program
  .command('create <name>')
  .description('Create a new extension module')
  .option('--type <type>', 'Module type (coding-standards, domain-rules, workflows, examples, marketing-standards, writing-standards, themes)')
  .action((name: string, options: any) => {
    console.log(chalk.green(`Creating new module: ${name}`));
    console.log(chalk.gray(`Type: ${options.type || 'coding-standards'}`));
    // Implementation
  });

program
  .command('validate <module>')
  .description('Validate module structure and metadata')
  .option('--verbose', 'Show detailed validation information')
  .action(validateCommand);

program
  .command('pin <module> <version>')
  .description('Pin module to specific version')
  .action((module: string, version: string) => {
    console.log(chalk.cyan(`Pinning ${module} to version ${version}`));
    // Implementation
  });

program
  .command('check-updates')
  .description('Check for available module updates')
  .action(() => {
    console.log(chalk.blue('Checking for updates...'));
    // Implementation
  });

program
  .command('self-remove')
  .description('Completely remove all Augment Extensions from the project')
  .option('--dry-run', 'Preview what would be removed without actually removing')
  .option('--force', 'Skip confirmation prompts')
  .action(selfRemoveCommand);

program
  .command('diff <module>')
  .description('Show differences between current and latest version')
  .action((module: string) => {
    console.log(chalk.magenta(`Showing diff for: ${module}`));
    // Implementation
  });

program
  .command('catalog')
  .description('Update MODULES.md catalog with all available modules')
  .option('--output <path>', 'Output path for catalog file')
  .option('--check', 'Check if catalog is out of date (exit 1 if outdated)')
  .option('--auto', 'Auto-update only if out of date')
  .action(catalogCommand);

program
  .command('catalog-hook')
  .description('Setup git hook for automatic catalog updates')
  .option('--remove', 'Remove catalog auto-update from git hook')
  .option('--type <type>', 'Hook type: pre-commit or post-commit (default: pre-commit)')
  .action(catalogHookCommand);

program
  .command('install-rules')
  .description('Install character count management rule to .augment/rules')
  .option('--quiet', 'Suppress output messages')
  .option('--setup-hooks', 'Setup automatic rule installation hooks')
  .option('--remove-hooks', 'Remove automatic rule installation hooks')
  .option('--git-hook-type <type>', 'Git hook type: post-checkout or post-merge (default: post-checkout)')
  .option('--force', 'Force replace existing rule even if content differs')
  .option('--interactive', 'Prompt for conflict resolution when rule exists with different content')
  .action(installRulesCommand);

// Coordination commands
const coordCommand = program
  .command('coord')
  .description('Query coordination manifest data');

coordCommand
  .command('specs')
  .description('List all active specs')
  .option('--json', 'Output as JSON')
  .action(coordSpecsCommand);

coordCommand
  .command('tasks <spec-id>')
  .description('List tasks for a specific spec')
  .option('--json', 'Output as JSON')
  .action(coordTasksCommand);

coordCommand
  .command('rules <task-id>')
  .description('List rules for a specific task')
  .option('--json', 'Output as JSON')
  .action(coordRulesCommand);

coordCommand
  .command('file <path>')
  .description('Show coordination info for a specific file')
  .option('--json', 'Output as JSON')
  .action(coordFileCommand);

// Sync commands
const syncCommand = program
  .command('sync')
  .description('Sync Beads and OpenSpec with coordination manifest');

syncCommand
  .command('beads')
  .description('Sync Beads tasks to coordination manifest')
  .action(syncBeadsCommand);

syncCommand
  .command('openspec')
  .description('Sync OpenSpec specs to coordination manifest')
  .action(syncOpenSpecCommand);

syncCommand
  .command('all')
  .description('Sync both Beads and OpenSpec')
  .action(syncAllCommand);

syncCommand
  .command('watch')
  .description('Watch for changes and auto-sync')
  .action(syncWatchCommand);

program
  .command('migrate')
  .description('Migrate existing Beads and OpenSpec data to coordination system')
  .action(() => {
    try {
      console.log(chalk.blue('Migrating existing data to coordination system...\n'));
      const result = migrateExistingData();

      console.log(chalk.green.bold('\n✓ Migration complete!'));
      console.log(chalk.gray(`Backup created at: ${result.backup}`));
      console.log(chalk.gray(`\nBeads: ${result.beads.added} added, ${result.beads.updated} updated, ${result.beads.removed} removed`));
      console.log(chalk.gray(`OpenSpec: ${result.openspec.added} added, ${result.openspec.updated} updated, ${result.openspec.removed} removed`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Skill commands
const skillCommand = program.command('skill').description('Manage skills');

skillCommand
  .command('list')
  .description('List all available skills')
  .option('--category <category>', 'Filter by category')
  .option('--json', 'Output as JSON')
  .action(skillListCommand);

skillCommand
  .command('show <skillId>')
  .description('Show skill details')
  .option('--json', 'Output as JSON')
  .action(skillShowCommand);

skillCommand
  .command('validate <skillId>')
  .description('Validate skill file')
  .action(skillValidateCommand);

skillCommand
  .command('search <query>')
  .description('Search skills by tags or keywords')
  .option('--json', 'Output as JSON')
  .action(skillSearchCommand);

skillCommand
  .command('exec <skillId> [args...]')
  .description('Execute a skill\'s CLI command')
  .action(skillExecCommand);

skillCommand
  .command('inject <skillId>')
  .description('Inject skill content into AI context (with dynamic loading)')
  .option('--json', 'Output as JSON')
  .option('--no-deps', 'Do not resolve dependencies')
  .option('--max-tokens <number>', 'Maximum token budget', parseInt)
  .action(skillInjectCommand);

skillCommand
  .command('load <skillIds...>')
  .description('Load multiple skills in batch')
  .option('--json', 'Output as JSON')
  .option('--max-tokens <number>', 'Maximum token budget', parseInt)
  .action(skillLoadBatchCommand);

skillCommand
  .command('cache-clear')
  .description('Clear skill cache')
  .action(skillCacheClearCommand);

skillCommand
  .command('cache-stats')
  .description('Show skill cache statistics')
  .action(skillCacheStatsCommand);

skillCommand
  .command('create-mcp')
  .description('Create a new MCP skill')
  .requiredOption('--name <name>', 'MCP server name')
  .requiredOption('--description <description>', 'Brief description')
  .requiredOption('--category <category>', 'Skill category (retrieval, transformation, analysis, generation, integration, utility)')
  .option('--package <package>', 'npm package or URL')
  .option('--token-budget <number>', 'Token budget estimate', parseInt, 2000)
  .option('--tags <tags>', 'Comma-separated tags', (val) => val.split(',').map(t => t.trim()))
  .action(skillCreateMcpCommand);

// MCP commands
const mcpCommand = program.command('mcp').description('Manage MCP server integrations');

mcpCommand
  .command('list')
  .description('List all configured MCP servers')
  .option('--json', 'Output as JSON')
  .action(mcpListCommand);

mcpCommand
  .command('add <name> <command>')
  .description('Add MCP server configuration')
  .option('--args <args>', 'Command arguments (space-separated)')
  .option('--transport <type>', 'Transport type (stdio or http)', 'stdio')
  .option('--url <url>', 'Server URL (for HTTP transport)')
  .option('--env <json>', 'Environment variables (JSON)')
  .action(mcpAddCommand);

mcpCommand
  .command('remove <name>')
  .description('Remove MCP server configuration')
  .action(mcpRemoveCommand);

mcpCommand
  .command('exec <serverName> <toolName>')
  .description('Execute MCP tool')
  .option('--args <json>', 'Tool arguments (JSON)')
  .option('--json', 'Output as JSON')
  .action(mcpExecCommand);

mcpCommand
  .command('wrap <serverName> <toolName> <skillId>')
  .description('Generate skill wrapper for MCP tool')
  .option('--category <category>', 'Skill category', 'integration')
  .action(mcpWrapCommand);

mcpCommand
  .command('discover <serverName>')
  .description('Discover tools from MCP server')
  .option('--json', 'Output as JSON')
  .action(mcpDiscoverCommand);

mcpCommand
  .command('generate-cli <serverCommand> <outputPath>')
  .description('Generate CLI using mcporter')
  .action(mcpGenerateCLICommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

