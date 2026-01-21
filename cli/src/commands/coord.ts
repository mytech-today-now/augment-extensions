/**
 * Coordination CLI Commands
 * 
 * Commands for querying coordination data:
 * - augx coord specs
 * - augx coord tasks <spec-id>
 * - augx coord rules <task-id>
 * - augx coord file <path>
 */

import chalk from 'chalk';
import {
  getActiveSpecs,
  getTasksForSpec,
  getRulesForTask,
  getSpecForFile,
  getTasksForFile
} from '../utils/coordination-queries';

interface CoordOptions {
  json?: boolean;
}

/**
 * List all active specs
 */
export function coordSpecsCommand(options: CoordOptions): void {
  try {
    const specs = getActiveSpecs();
    
    if (options.json) {
      console.log(JSON.stringify(specs, null, 2));
      return;
    }
    
    console.log(chalk.bold.cyan('\n📋 Active Specs\n'));
    
    if (specs.length === 0) {
      console.log(chalk.gray('No active specs found.'));
      return;
    }
    
    for (const spec of specs) {
      console.log(chalk.bold(spec.id));
      console.log(chalk.gray(`  Path: ${spec.path}`));
      console.log(chalk.gray(`  Status: ${spec.status}`));
      console.log(chalk.gray(`  Related Tasks: ${spec.relatedTasks.length}`));
      console.log(chalk.gray(`  Related Rules: ${spec.relatedRules.join(', ')}`));
      console.log();
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * List tasks for a specific spec
 */
export function coordTasksCommand(specId: string, options: CoordOptions): void {
  try {
    const tasks = getTasksForSpec(specId);
    
    if (options.json) {
      console.log(JSON.stringify(tasks, null, 2));
      return;
    }
    
    console.log(chalk.bold.cyan(`\n📝 Tasks for Spec: ${specId}\n`));
    
    if (tasks.length === 0) {
      console.log(chalk.gray('No tasks found for this spec.'));
      return;
    }
    
    for (const task of tasks) {
      const statusColor = task.status === 'closed' ? chalk.green : 
                         task.status === 'open' ? chalk.yellow : 
                         chalk.blue;
      
      console.log(chalk.bold(`${task.id}: ${task.title}`));
      console.log(chalk.gray(`  Status: ${statusColor(task.status)}`));
      console.log(chalk.gray(`  Related Rules: ${task.relatedRules.join(', ')}`));
      console.log(chalk.gray(`  Output Files: ${task.outputFiles.length}`));
      console.log();
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * List rules for a specific task
 */
export function coordRulesCommand(taskId: string, options: CoordOptions): void {
  try {
    const rules = getRulesForTask(taskId);
    
    if (options.json) {
      console.log(JSON.stringify(rules, null, 2));
      return;
    }
    
    console.log(chalk.bold.cyan(`\n📖 Rules for Task: ${taskId}\n`));
    
    if (rules.length === 0) {
      console.log(chalk.gray('No rules found for this task.'));
      return;
    }
    
    for (const rule of rules) {
      console.log(chalk.bold(rule.name));
      console.log(chalk.gray(`  Path: ${rule.path}`));
      console.log(chalk.gray(`  Priority: ${rule.priority}`));
      console.log(chalk.gray(`  File Patterns: ${rule.appliesTo.filePatterns.join(', ')}`));
      console.log();
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Show coordination info for a specific file
 */
export function coordFileCommand(filePath: string, options: CoordOptions): void {
  try {
    const specs = getSpecForFile(filePath);
    const tasks = getTasksForFile(filePath);
    
    if (options.json) {
      console.log(JSON.stringify({ specs, tasks }, null, 2));
      return;
    }
    
    console.log(chalk.bold.cyan(`\n📄 Coordination Info for: ${filePath}\n`));
    
    // Show governing specs
    console.log(chalk.bold('Governed by Specs:'));
    if (specs.length === 0) {
      console.log(chalk.gray('  None'));
    } else {
      for (const spec of specs) {
        console.log(chalk.gray(`  - ${spec.id} (${spec.status})`));
      }
    }
    console.log();
    
    // Show related tasks
    console.log(chalk.bold('Related Tasks:'));
    if (tasks.length === 0) {
      console.log(chalk.gray('  None'));
    } else {
      for (const task of tasks) {
        const relationColor = task.relationship === 'created' ? chalk.green : chalk.yellow;
        console.log(chalk.gray(`  - ${task.id}: ${task.title} (${relationColor(task.relationship)})`));
      }
    }
    console.log();
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

