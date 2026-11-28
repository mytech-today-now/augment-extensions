import * as fs from 'fs';
import chalk from 'chalk';
import {
  contextHostStatus,
  disableSupportedContextHosts,
  setupSupportedContextHosts,
} from '../lib/context-hosts';
import {
  formatHostHookOutput,
  type ContextRefreshHost,
  type ContextHookInput,
} from '../lib/context-refresh';
import { resolveExtensionsProjectRoot } from '../utils/extensions-config';

export interface ContextHostOptions {
  host?: string;
}

function projectRoot(): string {
  return resolveExtensionsProjectRoot(process.cwd());
}

export function contextSetupCommand(options: ContextHostOptions = {}): void {
  try {
    const results = setupSupportedContextHosts(projectRoot(), options.host ?? 'all');
    console.log(JSON.stringify({ action: 'setup', results }, null, 2));
  } catch (error) {
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}

export function contextDisableCommand(options: ContextHostOptions = {}): void {
  try {
    const results = disableSupportedContextHosts(projectRoot(), options.host ?? 'all');
    console.log(JSON.stringify({ action: 'disable', results }, null, 2));
  } catch (error) {
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}

export function contextStatusCommand(options: ContextHostOptions = {}): void {
  const targetHost = options.host ?? 'all';
  const hosts = targetHost === 'all' ? ['codex', 'claude-code'] : [targetHost];
  console.log(JSON.stringify({
    action: 'status',
    results: hosts.map((host) => contextHostStatus(projectRoot(), host)),
  }, null, 2));
}

export function contextRefreshCommand(options: ContextHostOptions = {}): void {
  const host = options.host;
  if (host !== 'codex' && host !== 'claude-code') {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: 'Augx automatic rule refresh failed: supported hosts are codex and claude-code.',
      },
    }));
    process.exitCode = 1;
    return;
  }

  let input: ContextHookInput;
  try {
    const raw = fs.readFileSync(0, 'utf8');
    input = raw.trim() ? JSON.parse(raw) as ContextHookInput : {};
  } catch {
    process.stdout.write('Augx automatic rule refresh could not parse host hook input. No cached rule content was used.\n');
    return;
  }

  try {
    const output = formatHostHookOutput(host as ContextRefreshHost, input);
    process.stdout.write(`${JSON.stringify(output)}\n`);
  } catch (error) {
    const eventName = typeof input.hook_event_name === 'string' ? input.hook_event_name : 'UserPromptSubmit';
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: eventName,
        additionalContext: `Augx automatic rule refresh failed safely: ${message}. No cached rule content was used.`,
      },
    })}\n`);
  }
}
