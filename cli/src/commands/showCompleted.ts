import chalk from 'chalk';
import {
  getAllCompletedTasks,
  filterTasksByDateRange,
  BeadsTask
} from '../utils/beadsCompletedChecker';

interface ShowCompletedOptions {
  since?: string;
  until?: string;
  json?: boolean;
  limit?: number;
}

/**
 * Format task status with color-coded indicators
 */
function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'closed':
      return chalk.green('✓ closed');
    case 'in-progress':
      return chalk.yellow('⚙ in-progress');
    case 'open':
      return chalk.blue('○ open');
    case 'blocked':
      return chalk.red('✖ blocked');
    default:
      return chalk.gray(`• ${status}`);
  }
}

/**
 * Format task in bd-style output
 */
function formatTaskBdStyle(task: BeadsTask): string {
  const lines: string[] = [];

  // Header line with ID and title
  lines.push(chalk.bold.cyan(`${task.id}`) + chalk.gray('  ') + chalk.white(task.title));

  // Status and priority
  const statusLine = [
    formatStatus(task.status),
    task.priority !== undefined ? chalk.gray(`P${task.priority}`) : null,
    task.issue_type ? chalk.gray(`[${task.issue_type}]`) : null
  ].filter(Boolean).join(' ');
  lines.push('  ' + statusLine);

  // Description (if present)
  if (task.description) {
    lines.push('  ' + chalk.gray(task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '')));
  }

  // Dates
  if (task.closed_at) {
    lines.push('  ' + chalk.gray(`Closed: ${new Date(task.closed_at).toLocaleString()}`));
  }

  // Close reason
  if (task.close_reason) {
    lines.push('  ' + chalk.green(`Reason: ${task.close_reason.substring(0, 80)}${task.close_reason.length > 80 ? '...' : ''}`));
  }

  // Labels
  if (task.labels && task.labels.length > 0) {
    lines.push('  ' + chalk.magenta(`Labels: ${task.labels.join(', ')}`));
  }

  return lines.join('\n');
}

/**
 * Show completed command handler
 */
export function showCompletedCommand(options: ShowCompletedOptions): void {
  const completedPath = 'scripts/completed.jsonl';

  // Get all completed tasks
  let tasks = getAllCompletedTasks(completedPath);

  if (tasks.length === 0) {
    console.log(chalk.yellow('No completed tasks found.'));
    console.log(chalk.gray('\nCompleted tasks are stored in: scripts/completed.jsonl'));
    return;
  }

  // Filter by date range if specified
  if (options.since || options.until) {
    tasks = filterTasksByDateRange(tasks, options.since, options.until);

    if (tasks.length === 0) {
      console.log(chalk.yellow('No completed tasks found in the specified date range.'));
      return;
    }
  }

  // Apply limit if specified
  if (options.limit && options.limit > 0) {
    tasks = tasks.slice(0, options.limit);
  }

  // JSON output
  if (options.json) {
    console.log(JSON.stringify(tasks, null, 2));
    return;
  }

  // BD-style formatted output
  console.log(chalk.bold.white(`\nCompleted Tasks (${tasks.length})`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  for (const task of tasks) {
    console.log(formatTaskBdStyle(task));
    console.log();
  }

  // Footer
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.gray(`Total: ${tasks.length} completed task${tasks.length !== 1 ? 's' : ''}`));

  if (options.since || options.until) {
    const rangeInfo = [];
    if (options.since) rangeInfo.push(`since ${options.since}`);
    if (options.until) rangeInfo.push(`until ${options.until}`);
    console.log(chalk.gray(`Filtered: ${rangeInfo.join(' ')}`));
  }

  console.log();
}

