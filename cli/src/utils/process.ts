import {
  type ChildProcess,
  type SpawnOptions,
  type SpawnSyncOptions,
  type SpawnSyncReturns,
  spawn as nodeSpawn
} from 'child_process';

type CrossSpawn = typeof nodeSpawn & {
  sync: typeof import('child_process').spawnSync;
};

// cross-spawn resolves Windows .cmd/.bat launchers and safely passes argv while
// keeping native executable launches shell-free.
const crossSpawn = require('cross-spawn') as CrossSpawn;

export interface CapturedCommandResult {
  stdout: string;
  stderr: string;
  status: number | null;
  signal: NodeJS.Signals | null;
}

export type CaptureCommandOptions = Omit<SpawnOptions, 'stdio'> & {
  timeout?: number;
};

export function spawnCommand(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): ChildProcess {
  return crossSpawn(command, args, { windowsHide: true, ...options });
}

export function spawnCommandSync(
  command: string,
  args: string[] = [],
  options: SpawnSyncOptions = {}
): SpawnSyncReturns<string | Buffer> {
  return crossSpawn.sync(command, args, { windowsHide: true, ...options });
}

export function captureCommand(
  command: string,
  args: string[] = [],
  options: CaptureCommandOptions = {}
): Promise<CapturedCommandResult> {
  const { timeout = 5000, ...spawnOptions } = options;

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timeoutId: NodeJS.Timeout | undefined;

    const child = spawnCommand(command, args, {
      ...spawnOptions,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const cleanup = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const rejectOnce = (error: Error): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk: string) => { stdout += chunk; });
    child.stderr?.on('data', (chunk: string) => { stderr += chunk; });
    child.once('error', rejectOnce);
    child.once('close', (status, signal) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ stdout, stderr, status, signal });
    });

    timeoutId = setTimeout(() => {
      child.kill();
      rejectOnce(new Error(`Command timed out after ${timeout}ms: ${command}`));
    }, timeout);
  });
}
