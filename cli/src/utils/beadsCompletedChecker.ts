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
export function getCompletedTask(taskId: string, completedPath: string = 'scripts/completed.jsonl'): BeadsTask | null {
  if (!fs.existsSync(completedPath)) {
    return null;
  }

  const content = fs.readFileSync(completedPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  // Find the last occurrence of the task (most recent update)
  let foundTask: BeadsTask | null = null;

  for (const line of lines) {
    try {
      const task = JSON.parse(line) as BeadsTask;
      if (task.id === taskId) {
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
export function getAllCompletedTasks(completedPath: string = 'scripts/completed.jsonl'): BeadsTask[] {
  if (!fs.existsSync(completedPath)) {
    return [];
  }

  const content = fs.readFileSync(completedPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  const tasksMap = new Map<string, BeadsTask>();

  for (const line of lines) {
    try {
      const task = JSON.parse(line) as BeadsTask;
      // Keep the latest version of each task
      tasksMap.set(task.id, task);
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
  tasks: BeadsTask[],
  since?: string,
  until?: string
): BeadsTask[] {
  return tasks.filter(task => {
    const closedAt = task.closed_at || task.updated_at;
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

