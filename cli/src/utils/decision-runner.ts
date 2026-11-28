import { spawn, spawnSync } from 'child_process';
import { delimiter, join } from 'path';
import * as fs from 'fs';
import { spawnCommandSync } from './process';

export const DECISION_OPERATIONS = ['setup', 'doctor', 'decide', 'run', 'resume', 'evaluate', 'examples', 'inventory', 'remove'] as const;
export type DecisionOperation = typeof DECISION_OPERATIONS[number];
export interface DecisionOptions {
  project: string;
  host?: 'codex' | 'claude-code' | 'none';
  dryRun?: boolean;
  portable?: boolean;
  automatic?: boolean;
  disableAutomatic?: boolean;
  dataClasses?: string;
  /** In-memory consent for a single live decide operation. Never persisted. */
  providerDataConsent?: boolean;
  input?: string;
  id?: string;
  offline?: boolean;
  live?: boolean;
  requests?: string;
  approve?: string;
}

export function redactDecisionText(value: string): string {
  const key = process.env.TYPESAFE_API_KEY;
  return (key ? value.split(key).join('[REDACTED]') : value)
    .replace(/(\b(?:api[_-]?key|authorization|password|secret|token)["']?\s*[:=]\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?:Bearer|Basic)\s+[^\s,"'}]+|[^\s,"'}]+)/gi,
      (_match: string, prefix: string, secret: string) => {
        const quote = secret.startsWith('"') ? '"' : secret.startsWith("'") ? "'" : '';
        return `${prefix}${quote}[REDACTED]${quote}`;
      });
}

export type DecisionHostState = 'AVAILABLE' | 'MISSING' | 'BROKEN';
export interface DecisionHostAvailability {
  host: 'codex' | 'claude-code';
  state: DecisionHostState;
  diagnostic: string;
  nextStep?: string;
}

function hostExecutable(name: string): string | undefined {
  const names = process.platform === 'win32' ? [`${name}.exe`, `${name}.cmd`, `${name}.bat`, `${name}.ps1`] : [name];
  const searchPath = process.env.PATH || process.env.Path || '';
  for (const directory of searchPath.split(delimiter)) {
    for (const candidate of names) {
      const file = join(directory || '.', candidate);
      try { if (fs.statSync(file).isFile()) return file; } catch { /* Continue searching PATH. */ }
    }
  }
  return undefined;
}

function hostCheckEnvironment(): NodeJS.ProcessEnv {
  const safe: NodeJS.ProcessEnv = {};
  for (const key of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA']) {
    if (process.env[key]) safe[key] = process.env[key];
  }
  return safe;
}

/** Check supported host launchers without passing credentials or exposing host output. */
export function detectDecisionHostAvailability(): DecisionHostAvailability[] {
  return ([['codex', 'Codex'], ['claude', 'Claude Code']] as const).map(([command, label]) => {
    const host = command === 'codex' ? 'codex' : 'claude-code';
    const executable = hostExecutable(command);
    if (!executable) return { host, state: 'MISSING', diagnostic: `No ${label} executable was found on PATH.`, nextStep: `Install ${label} using its official instructions, ensure its executable is on PATH, then rerun augx init.` };
    let response: ReturnType<typeof spawnCommandSync>;
    try {
      response = spawnCommandSync(executable, ['--version'], {
        encoding: 'utf8', timeout: 5000, maxBuffer: 65536, windowsHide: true, shell: false,
        env: hostCheckEnvironment()
      });
    } catch {
      return { host, state: 'BROKEN', diagnostic: `${label} executable was found but failed its bounded startup check.`, nextStep: `Repair ${label} manually and rerun augx init. Augx will not modify its global installation.` };
    }
    const hostOutput = `${String(response.stdout || '')}\n${String(response.stderr || '')}`;
    if (!response.error && response.status === 0) return { host, state: 'AVAILABLE', diagnostic: `${label} executable responded to --version.` };
    if (command === 'codex' && /Missing optional dependency\s+['"]?@openai\/codex-linux-x64/i.test(hostOutput)) {
      return { host, state: 'BROKEN', diagnostic: 'Codex startup failed because the @openai/codex-linux-x64 optional dependency is missing.', nextStep: 'Reinstall the Codex CLI with the package manager and profile that installed it, then rerun augx init. Augx will not change the global CLI.' };
    }
    const reason = (response.error as NodeJS.ErrnoException | undefined)?.code === 'ETIMEDOUT' ? 'did not finish its bounded startup check' : 'failed its startup check';
    return { host, state: 'BROKEN', diagnostic: `${label} executable was found but ${reason}.`, nextStep: `Run ${command} --version locally, repair ${label}, then rerun augx init. Augx will not modify global host software.` };
  });
}

export interface DecisionOperationRunResult {
  code: number;
  result?: unknown;
}

/** Capture structured results for setup and doctor while preserving their normal CLI output. */
export async function runDecisionOperationResult(operation: 'setup' | 'doctor', options: DecisionOptions): Promise<DecisionOperationRunResult> {
  let output = '';
  let overflow = false;
  const code = await runDecisionOperation(operation, options, chunk => {
    if (output.length + chunk.length > 1048576) overflow = true;
    else if (!overflow) output += chunk;
  });
  if (overflow) return { code };
  try { return { code, result: JSON.parse(output.trim()) as unknown }; }
  catch { return { code }; }
}

/** CLI and GUI share this process boundary without importing the optional SDK. */
export async function runDecisionOperation(operation: DecisionOperation, options: DecisionOptions, onStdoutChunk?: (chunk: string) => void): Promise<number> {
  if (!DECISION_OPERATIONS.includes(operation)) throw new Error('Unknown decision operation');
  const script = join(__dirname, '../../../augment-extensions/workflows/decision-layer/runtime/cli.cjs');
  if (!fs.existsSync(script)) throw new Error('Decision runtime assets are unavailable. Install an Augx package containing workflows/decision-layer.');
  return new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [script, operation, JSON.stringify(options)], {
      stdio: ['inherit', 'pipe', 'pipe', 'ipc'], windowsHide: true, shell: false
    });
    child.stdout?.setEncoding('utf8'); child.stderr?.setEncoding('utf8');
    // Complete lines also redact a credential split across output chunks.
    const connectOutput = (stream: NodeJS.ReadableStream | null, output: NodeJS.WritableStream, observe?: (chunk: string) => void) => {
      let pending = '';
      let oversized = false;
      stream?.on('data', chunk => {
        const chunkText = String(chunk);
        observe?.(chunkText);
        const parts = (pending + chunkText).split('\n');
        pending = parts.pop() || '';
        for (const line of parts) {
          if (!oversized) output.write(line.length <= 1048576 ? redactDecisionText(line) + '\n' : '[Output line exceeds display limit]\n');
          oversized = false;
        }
        if (pending.length > 1048576) {
          if (!oversized) output.write('[Output line exceeds display limit]\n');
          oversized = true; pending = '';
        }
      });
      return () => { if (pending && !oversized) output.write(redactDecisionText(pending)); };
    };
    const flushOut = connectOutput(child.stdout, process.stdout, onStdoutChunk);
    const flushErr = connectOutput(child.stderr, process.stderr);
    let cancellationTimer: NodeJS.Timeout | undefined;
    let cancelled = false;
    const stop = () => {
      cancelled = true;
      if (child.connected) child.send({ type: 'cancel' }, () => {});
      if (!cancellationTimer) cancellationTimer = setTimeout(() => {
        if (process.platform === 'win32' && child.pid) spawnSync(join(process.env.SystemRoot || 'C:\\Windows', 'System32/taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, timeout: 5000, stdio: 'ignore' });
        else child.kill('SIGTERM');
      }, 5000);
    };
    const cleanup = () => {
      if (cancellationTimer) clearTimeout(cancellationTimer);
      process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);
    };
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
    child.once('error', error => { cleanup(); reject(new Error(redactDecisionText(error.message))); });
    child.once('close', code => { cleanup(); flushOut(); flushErr(); resolve(cancelled ? 130 : code ?? 1); });
  });
}
