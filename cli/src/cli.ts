#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { linkCommand } from './commands/link';
import { updateCommand } from './commands/update';
import { searchCommand } from './commands/search';
import { coordSpecsCommand, coordTasksCommand, coordRulesCommand, coordFileCommand } from './commands/coord';
import { syncBeadsCommand, syncOpenSpecCommand, syncAllCommand, syncWatchCommand } from './commands/sync';
import { migrateExistingData } from './utils/migrate';

const program = new Command();

program
  .name('augx')
  .description('CLI tool for managing Augment Code AI extension modules')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Augment Extensions in current project')
  .option('--from-submodule', 'Initialize from existing submodule')
  .action(initCommand);

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

program
  .command('link <module>')
  .description('Link an extension module to current project')
  .option('--version <version>', 'Specific version to link')
  .action(linkCommand);

program
  .command('unlink <module>')
  .description('Unlink an extension module from current project')
  .action((module: string) => {
    console.log(chalk.yellow(`Unlinking module: ${module}`));
    // Implementation
  });

program
  .command('update')
  .description('Update all linked modules to latest versions')
  .option('--module <name>', 'Update specific module only')
  .action(updateCommand);

program
  .command('search <keyword>')
  .description('Search for extension modules')
  .option('--type <type>', 'Filter by module type')
  .action(searchCommand);

program
  .command('create <name>')
  .description('Create a new extension module')
  .option('--type <type>', 'Module type (coding-standards, domain-rules, examples)')
  .action((name: string, options: any) => {
    console.log(chalk.green(`Creating new module: ${name}`));
    console.log(chalk.gray(`Type: ${options.type || 'coding-standards'}`));
    // Implementation
  });

program
  .command('validate <module>')
  .description('Validate module structure and metadata')
  .action((module: string) => {
    console.log(chalk.blue(`Validating module: ${module}`));
    // Implementation
  });

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
  .command('diff <module>')
  .description('Show differences between current and latest version')
  .action((module: string) => {
    console.log(chalk.magenta(`Showing diff for: ${module}`));
    // Implementation
  });

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

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

