import { spawn, spawnSync } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

export const DECISION_OPERATIONS = ['setup', 'doctor', 'decide', 'run', 'resume', 'evaluate', 'examples', 'inventory', 'remove'] as const;
export type DecisionOperation = typeof DECISION_OPERATIONS[number];
export interface DecisionOptions {
  project: string;
  host?: 'codex' | 'claude-code';
  dryRun?: boolean;
  portable?: boolean;
  automatic?: boolean;
  disableAutomatic?: boolean;
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

/** CLI and GUI share this process boundary without importing the optional SDK. */
export async function runDecisionOperation(operation: DecisionOperation, options: DecisionOptions): Promise<number> {
  if (!DECISION_OPERATIONS.includes(operation)) throw new Error('Unknown decision operation');
  const script = join(__dirname, '../../../augment-extensions/workflows/decision-layer/runtime/cli.cjs');
  if (!fs.existsSync(script)) throw new Error('Decision runtime assets are unavailable. Install an Augx package containing workflows/decision-layer.');
  return new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [script, operation, JSON.stringify(options)], {
      stdio: ['inherit', 'pipe', 'pipe', 'ipc'], windowsHide: true, shell: false
    });
    child.stdout?.setEncoding('utf8'); child.stderr?.setEncoding('utf8');
    // Complete lines also redact a credential split across output chunks.
    const connectOutput = (stream: NodeJS.ReadableStream | null, output: NodeJS.WritableStream) => {
      let pending = '';
      let oversized = false;
      stream?.on('data', chunk => {
        const parts = (pending + String(chunk)).split('\n');
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
    const flushOut = connectOutput(child.stdout, process.stdout);
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
