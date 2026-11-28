import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ContextRefreshHost } from './context-refresh';

type HostEvent = 'UserPromptSubmit' | 'SessionStart';

interface ManagedHandler {
  event: HostEvent;
  matcher?: string;
  handler: Record<string, unknown>;
  sha256: string;
}

interface HostReceipt {
  path: string;
  createdFile: boolean;
  createdHooksObject: boolean;
  handlers: ManagedHandler[];
}

interface ContextHookReceipt {
  schemaVersion: 1;
  projectRoot: string;
  hosts: Partial<Record<ContextRefreshHost, HostReceipt>>;
}

export interface ContextHostStatus {
  host: string;
  supported: boolean;
  configured: boolean;
  registrationIntact?: boolean;
  settingsPath?: string;
  trustStep?: string;
  message?: string;
}

const RECEIPT_PATH = path.join('.augment', 'context-refresh', 'receipt.json');
const SESSION_START_MATCHER = 'compact|resume';
const REFRESH_STATUS_MESSAGE = 'Refreshing linked Augx module rules';
const HOST_SETTINGS: Record<ContextRefreshHost, string> = {
  codex: path.join('.codex', 'hooks.json'),
  'claude-code': path.join('.claude', 'settings.json'),
};

function hash(value: unknown): string {
  const stable = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(stable);
    if (input && typeof input === 'object') {
      return Object.fromEntries(Object.entries(input as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stable(child)]));
    }
    return input;
  };
  return crypto.createHash('sha256').update(JSON.stringify(stable(value)), 'utf8').digest('hex');
}

function inside(projectRoot: string, relativePath: string): string {
  const absolute = path.resolve(projectRoot, relativePath);
  const relative = path.relative(path.resolve(projectRoot), absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Host settings path escaped the project root.');
  return absolute;
}

function atomicWrite(filePath: string, content: string, mode?: number): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const existingMode = fs.existsSync(filePath) ? fs.statSync(filePath).mode : undefined;
  const temporary = `${filePath}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporary, content, { flag: 'wx', mode: mode ?? existingMode ?? 0o600 });
    fs.renameSync(temporary, filePath);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function atomicJson(filePath: string, value: unknown, mode?: number): void {
  atomicWrite(filePath, `${JSON.stringify(value, null, 2)}\n`, mode);
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readJsonObject(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) return {};
  let value: unknown;
  try {
    value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    throw new Error(`Invalid JSON in ${path.relative(process.cwd(), filePath)}. Host settings were preserved.`);
  }
  if (!isObject(value)) throw new Error(`Invalid host settings object in ${path.relative(process.cwd(), filePath)}.`);
  return value;
}

function readReceipt(projectRoot: string): ContextHookReceipt {
  const filePath = inside(projectRoot, RECEIPT_PATH);
  if (!fs.existsSync(filePath)) return { schemaVersion: 1, projectRoot: path.resolve(projectRoot), hosts: {} };
  const receipt = readJsonObject(filePath) as unknown as ContextHookReceipt;
  if (receipt.schemaVersion !== 1 || receipt.projectRoot !== path.resolve(projectRoot) || !isObject(receipt.hosts)) {
    throw new Error('The Augx context hook ownership receipt is invalid for this project. Host settings were preserved.');
  }
  for (const host of ['codex', 'claude-code'] as const) {
    const item = receipt.hosts[host];
    if (!item) continue;
    if (item.path !== HOST_SETTINGS[host] || typeof item.createdFile !== 'boolean' ||
        typeof item.createdHooksObject !== 'boolean' || !Array.isArray(item.handlers)) {
      throw new Error('The Augx context hook ownership receipt contains an unsupported host path.');
    }
    for (const handler of item.handlers) {
      if (!['UserPromptSubmit', 'SessionStart'].includes(handler.event) ||
          (handler.matcher !== undefined && typeof handler.matcher !== 'string') ||
          !/^[a-f0-9]{64}$/.test(handler.sha256) || !isObject(handler.handler)) {
        throw new Error('The Augx context hook ownership receipt contains an invalid handler.');
      }
    }
  }
  return receipt;
}

function writeReceipt(projectRoot: string, receipt: ContextHookReceipt): void {
  const filePath = inside(projectRoot, RECEIPT_PATH);
  if (Object.keys(receipt.hosts).length === 0) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return;
  }
  atomicJson(filePath, receipt, 0o600);
}

function shellQuote(value: string): string {
  if (process.platform === 'win32') return `"${value.replace(/"/g, '\\"')}"`;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function cliEntrypoint(): string {
  return path.resolve(__dirname, '..', 'cli.js');
}

function expectedHandlers(host: ContextRefreshHost): ManagedHandler[] {
  const entrypoint = cliEntrypoint();
  const command = host === 'codex'
    ? `${shellQuote(process.execPath)} ${shellQuote(entrypoint)} context refresh --host ${host}`
    : process.execPath;
  const common = {
    type: 'command',
    command,
    statusMessage: REFRESH_STATUS_MESSAGE,
    timeout: 20,
  };
  const promptHandler = host === 'claude-code'
    ? { ...common, command: process.execPath, args: [entrypoint, 'context', 'refresh', '--host', host] }
    : { ...common, additionalContextLimit: 0 };
  const startHandler = host === 'claude-code'
    ? { ...common, command: process.execPath, args: [entrypoint, 'context', 'refresh', '--host', host] }
    : { ...common, additionalContextLimit: 0 };
  const handlers: ManagedHandler[] = [
    { event: 'UserPromptSubmit', handler: promptHandler, sha256: hash(promptHandler) },
    { event: 'SessionStart', matcher: SESSION_START_MATCHER, handler: startHandler, sha256: hash(startHandler) },
  ];
  return handlers;
}

function groupsFor(settings: Record<string, any>, event: HostEvent, create: boolean): any[] {
  if (settings.hooks === undefined && create) settings.hooks = {};
  if (settings.hooks === undefined) return [];
  if (!isObject(settings.hooks)) throw new Error('Invalid host hooks configuration. Augx preserved it.');
  if (settings.hooks[event] === undefined && create) settings.hooks[event] = [];
  if (settings.hooks[event] === undefined) return [];
  if (!Array.isArray(settings.hooks[event]) || settings.hooks[event].some((group: unknown) => !isObject(group))) {
    throw new Error(`Invalid ${event} hook configuration. Augx preserved it.`);
  }
  return settings.hooks[event];
}

function matcherMatches(group: Record<string, any>, matcher: string | undefined): boolean {
  return matcher === undefined ? group.matcher === undefined : group.matcher === matcher;
}

function allHandlers(settings: Record<string, any>, event: HostEvent): Array<{ group: any; index: number; handler: any }> {
  const output: Array<{ group: any; index: number; handler: any }> = [];
  for (const group of groupsFor(settings, event, false)) {
    if (group.hooks === undefined) continue;
    if (!Array.isArray(group.hooks) || group.hooks.some((handler: unknown) => !isObject(handler))) {
      throw new Error(`Invalid ${event} hook handler list. Augx preserved it.`);
    }
    group.hooks.forEach((handler: any, index: number) => output.push({ group, index, handler }));
  }
  return output;
}

function hasRefreshMarker(handler: Record<string, any>, host: ContextRefreshHost): boolean {
  if (handler.statusMessage === REFRESH_STATUS_MESSAGE) return true;
  const command = String(handler.command ?? '');
  return command.includes('context refresh --host') && command.includes(host);
}

function removeOwnedHandler(settings: Record<string, any>, item: ManagedHandler, host: ContextRefreshHost): boolean {
  const entries = allHandlers(settings, item.event);
  const matches = entries.filter(({ handler }) => hash(handler) === item.sha256);
  if (matches.length > 1) throw new Error(`Multiple copies of an Augx-owned ${item.event} hook were found. Host settings were preserved.`);
  if (matches.length === 0) {
    if (entries.some(({ handler }) => hasRefreshMarker(handler, host))) {
      throw new Error(`An Augx ${item.event} hook was edited. Host settings were preserved.`);
    }
    return false;
  }
  const match = matches[0];
  match.group.hooks.splice(match.index, 1);
  const isEmptyGroup = match.group.hooks.length === 0 &&
    Object.keys(match.group).every((key) => key === 'hooks' || key === 'matcher');
  if (isEmptyGroup) {
    const groups = groupsFor(settings, item.event, false);
    const index = groups.indexOf(match.group);
    if (index >= 0) groups.splice(index, 1);
  }
  if (Array.isArray(settings.hooks[item.event]) && settings.hooks[item.event].length === 0) delete settings.hooks[item.event];
  return true;
}

function addHandler(settings: Record<string, any>, item: ManagedHandler, host: ContextRefreshHost): void {
  const entries = allHandlers(settings, item.event);
  if (entries.some(({ handler }) => hasRefreshMarker(handler, host))) {
    throw new Error(`An unowned or edited Augx ${item.event} hook already exists. Host settings were preserved.`);
  }
  const groups = groupsFor(settings, item.event, true);
  let group = groups.find((candidate: Record<string, any>) => matcherMatches(candidate, item.matcher));
  if (!group) {
    group = item.matcher === undefined ? { hooks: [] } : { matcher: item.matcher, hooks: [] };
    groups.push(group);
  }
  if (group.hooks === undefined) group.hooks = [];
  if (!Array.isArray(group.hooks)) throw new Error(`Invalid ${item.event} hook group. Host settings were preserved.`);
  group.hooks.push(item.handler);
}

function mergeExpectedHandlers(
  settings: Record<string, any>,
  host: ContextRefreshHost,
  previous: ManagedHandler[]
): ManagedHandler[] {
  const expected = expectedHandlers(host);
  for (const old of previous) removeOwnedHandler(settings, old, host);
  for (const item of expected) addHandler(settings, item, host);
  return expected;
}

export function setupContextHost(projectRoot: string, host: ContextRefreshHost): ContextHostStatus {
  if (host !== 'codex' && host !== 'claude-code') throw new Error('Automatic context refresh supports only codex and claude-code.');
  const root = path.resolve(projectRoot);
  const receipt = readReceipt(root);
  const settingsPath = inside(root, HOST_SETTINGS[host]);
  const existedBefore = fs.existsSync(settingsPath);
  const settings = readJsonObject(settingsPath);
  const priorHost = receipt.hosts[host];
  if (priorHost && priorHost.path !== HOST_SETTINGS[host]) throw new Error('The recorded host settings path is unsupported.');

  const createdHooksObject = priorHost?.createdHooksObject ?? !isObject(settings.hooks);
  const previous = priorHost?.handlers ?? [];
  const finalHandlers = mergeExpectedHandlers(settings, host, previous);
  const newHandlers = expectedHandlers(host);
  const interimHandlers = [...new Map([...previous, ...newHandlers].map((item) => [item.sha256, item])).values()];
  receipt.hosts[host] = {
    path: HOST_SETTINGS[host],
    createdFile: priorHost?.createdFile ?? !existedBefore,
    createdHooksObject,
    handlers: interimHandlers,
  };
  writeReceipt(root, receipt);

  atomicJson(settingsPath, settings, fs.existsSync(settingsPath) ? fs.statSync(settingsPath).mode : 0o600);
  receipt.hosts[host] = {
    path: HOST_SETTINGS[host],
    createdFile: priorHost?.createdFile ?? !existedBefore,
    createdHooksObject,
    handlers: finalHandlers,
  };
  writeReceipt(root, receipt);

  return {
    host,
    supported: true,
    configured: true,
    registrationIntact: true,
    settingsPath: HOST_SETTINGS[host],
    trustStep: host === 'codex'
      ? 'Trust the project .codex configuration and review the hook before use.'
      : 'Trust the project settings when Claude Code asks to review them.',
  };
}

export function disableContextHost(projectRoot: string, host: ContextRefreshHost): ContextHostStatus {
  if (host !== 'codex' && host !== 'claude-code') throw new Error('Automatic context refresh supports only codex and claude-code.');
  const root = path.resolve(projectRoot);
  const receipt = readReceipt(root);
  const priorHost = receipt.hosts[host];
  if (!priorHost) {
    return { host, supported: true, configured: false, registrationIntact: false, settingsPath: HOST_SETTINGS[host] };
  }
  const settingsPath = inside(root, priorHost.path);
  const settings = readJsonObject(settingsPath);
  const preserved: ManagedHandler[] = [];
  for (const item of priorHost.handlers) {
    try {
      removeOwnedHandler(settings, item, host);
    } catch {
      preserved.push(item);
    }
  }
  if (priorHost.createdHooksObject && isObject(settings.hooks) && Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }
  if (fs.existsSync(settingsPath)) {
    if (priorHost.createdFile && Object.keys(settings).length === 0) fs.unlinkSync(settingsPath);
    else atomicJson(settingsPath, settings, fs.statSync(settingsPath).mode);
  }
  if (preserved.length > 0) receipt.hosts[host] = { ...priorHost, handlers: preserved };
  else delete receipt.hosts[host];
  writeReceipt(root, receipt);
  return {
    host,
    supported: true,
    configured: preserved.length > 0,
    registrationIntact: false,
    settingsPath: priorHost.path,
    message: preserved.length > 0
      ? `Preserved ${preserved.length} edited Augx hook handler(s).`
      : 'Removed unchanged Augx hook handlers and retained unrelated settings.',
  };
}

export function contextHostStatus(projectRoot: string, host: string): ContextHostStatus {
  if (host !== 'codex' && host !== 'claude-code') {
    return {
      host,
      supported: false,
      configured: false,
      message: 'Live automatic refresh is supported only for codex and claude-code. Cursor, Windsurf, and Copilot currently support static export or mirror only.',
    };
  }
  const root = path.resolve(projectRoot);
  const settingsPath = inside(root, HOST_SETTINGS[host]);
  const expected = expectedHandlers(host);
  try {
    const settings = readJsonObject(settingsPath);
    const intact = expected.every((item) => allHandlers(settings, item.event).some(({ handler }) => hash(handler) === item.sha256));
    return {
      host,
      supported: true,
      configured: intact,
      registrationIntact: intact,
      settingsPath: HOST_SETTINGS[host],
      trustStep: host === 'codex'
        ? 'The project .codex configuration must be trusted and its hook reviewed.'
        : 'The project settings may require trust review in Claude Code.',
    };
  } catch (error) {
    return {
      host,
      supported: true,
      configured: false,
      registrationIntact: false,
      settingsPath: HOST_SETTINGS[host],
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export function setupSupportedContextHosts(projectRoot: string, host: string): ContextHostStatus[] {
  const hosts: ContextRefreshHost[] = host === 'all' ? ['codex', 'claude-code'] : [host as ContextRefreshHost];
  if (hosts.some((item) => item !== 'codex' && item !== 'claude-code')) {
    throw new Error('Automatic context refresh supports only codex, claude-code, or all.');
  }
  return hosts.map((item) => setupContextHost(projectRoot, item));
}

export function disableSupportedContextHosts(projectRoot: string, host: string): ContextHostStatus[] {
  const hosts: ContextRefreshHost[] = host === 'all' ? ['codex', 'claude-code'] : [host as ContextRefreshHost];
  if (hosts.some((item) => item !== 'codex' && item !== 'claude-code')) {
    throw new Error('Automatic context refresh supports only codex, claude-code, or all.');
  }
  return hosts.map((item) => disableContextHost(projectRoot, item));
}
