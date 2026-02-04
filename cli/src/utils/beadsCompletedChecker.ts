import * as fs from 'fs';
import * as path from 'path';

export interface BeadsTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: number;
  issue_type?: string;
  owner?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  closed_at?: string;
  close_reason?: string;
  labels?: string[];
  dependencies?: Array<{
    issue_id: string;
    depends_on_id: string;
    type: string;
    created_at?: string;
    created_by?: string;
  }>;
  comments?: Array<{
    id?: number;
    issue_id?: string;
    author?: string;
    text?: string;
    body?: string;
    created_at?: string;
  }>;
}

/**
 * Interface for completed tasks
 * Extends BeadsTask with required fields for completed tasks
 */
export interface CompletedTask extends BeadsTask {
  status: 'closed';
  closed_at: string;
  close_reason?: string;
}

/**
 * Check if a task exists in completed.jsonl
 */
export function isTaskCompleted(taskId: string, completedPath: string = 'scripts/completed.jsonl'): boolean {
  if (!fs.existsSync(completedPath)) {
    return false;
  }

  const content = fs.readFileSync(completedPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  for (const line of lines) {
    try {
      const task = JSON.parse(line) as BeadsTask;
      if (task.id === taskId) {
        return true;
      }
    } catch (error) {
      // Skip invalid JSON lines
      continue;
    }
  }

  return false;
}

/**
 * Get a completed task by ID from completed.jsonl
 */
export function getCompletedTask(taskId: string, completedPath: string = 'scripts/completed.jsonl'): CompletedTask | null {
  if (!fs.existsSync(completedPath)) {
    return null;
  }

  const content = fs.readFileSync(completedPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  // Find the last occurrence of the task (most recent update)
  let foundTask: CompletedTask | null = null;

  for (const line of lines) {
    try {
      const task = JSON.parse(line) as CompletedTask;
      if (task.id === taskId && task.status === 'closed' && task.closed_at) {
        foundTask = task;
      }
    } catch (error) {
      // Skip invalid JSON lines
      continue;
    }
  }

  return foundTask;
}

/**
 * Get all completed tasks from completed.jsonl
 */
export function getAllCompletedTasks(completedPath: string = 'scripts/completed.jsonl'): CompletedTask[] {
  if (!fs.existsSync(completedPath)) {
    return [];
  }

  const content = fs.readFileSync(completedPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  const tasksMap = new Map<string, CompletedTask>();

  for (const line of lines) {
    try {
      const task = JSON.parse(line) as BeadsTask;
      // Only include tasks that are actually completed
      if (task.status === 'closed' && task.closed_at) {
        tasksMap.set(task.id, task as CompletedTask);
      }
    } catch (error) {
      // Skip invalid JSON lines
      console.warn(`Warning: Skipping invalid JSON line in ${completedPath}`);
      continue;
    }
  }

  return Array.from(tasksMap.values());
}

/**
 * Filter completed tasks by date range
 */
export function filterTasksByDateRange(
  tasks: CompletedTask[],
  since?: string,
  until?: string
): CompletedTask[] {
  return tasks.filter(task => {
    const closedAt = task.closed_at;
    if (!closedAt) return false;

    const taskDate = new Date(closedAt);

    if (since) {
      const sinceDate = new Date(since);
      if (taskDate < sinceDate) return false;
    }

    if (until) {
      const untilDate = new Date(until);
      if (taskDate > untilDate) return false;
    }

    return true;
  });
}

/**
 * Validate ISO 8601 timestamp
 */
export function validateISO8601(timestamp: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  if (!iso8601Regex.test(timestamp)) {
    return false;
  }

  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Filter completed tasks by search term (searches title, description, close_reason)
 */
export function filterTasksBySearch(
  tasks: CompletedTask[],
  searchTerm: string
): CompletedTask[] {
  const lowerSearch = searchTerm.toLowerCase();
  return tasks.filter(task => {
    return (
      task.title.toLowerCase().includes(lowerSearch) ||
      (task.description && task.description.toLowerCase().includes(lowerSearch)) ||
      (task.close_reason && task.close_reason.toLowerCase().includes(lowerSearch))
    );
  });
}

/**
 * Filter completed tasks by labels
 */
export function filterTasksByLabels(
  tasks: CompletedTask[],
  labels: string[]
): CompletedTask[] {
  return tasks.filter(task => {
    if (!task.labels || task.labels.length === 0) return false;
    return labels.some(label => task.labels!.includes(label));
  });
}

/**
 * Sort completed tasks
 */
export function sortTasks(
  tasks: CompletedTask[],
  sortBy: 'date' | 'title' | 'priority' = 'date',
  order: 'asc' | 'desc' = 'desc'
): CompletedTask[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        const dateA = new Date(a.closed_at).getTime();
        const dateB = new Date(b.closed_at).getTime();
        comparison = dateA - dateB;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        const priorityA = a.priority ?? 999;
        const priorityB = b.priority ?? 999;
        comparison = priorityA - priorityB;
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

