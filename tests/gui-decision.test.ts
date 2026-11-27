import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { decisionWorkflowInteractive, validateGuiDecisionOptions } from '../cli/src/commands/gui-decision';
import { runDecisionOperation, redactDecisionText, type DecisionOperation, type DecisionOptions } from '../cli/src/utils/decision-runner';
import type { InteractivePrompt } from '../cli/src/utils/interactive-prompt';

const moduleRoot = path.resolve('augment-extensions/workflows/decision-layer');
let root: string;
let oldKey: string | undefined;
let output: string;
let failure: string;
function prompt(answers: Record<string, unknown>[]): InteractivePrompt {
  return { prompt: vi.fn(async () => {
    if (!answers.length) throw new Error('Unexpected prompt');
    return answers.shift();
  }) as InteractivePrompt['prompt'] };
}
const offline = (operation: string) => [
  { operation }, ...(['decide', 'run', 'evaluate', 'inventory'].includes(operation) ? [{ input: `${operation}.json` }] : []),
  ...(['decide', 'run', 'resume', 'evaluate', 'examples'].includes(operation)
    ? [{ mode: 'offline' }, { id: 'gui-test' }, ...(operation === 'resume' ? [{ approve: '' }] : []), { confirm: true }] : [])
];
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'augx decision GUI unicodé '));
  fs.mkdirSync(path.join(root, '.augx-decision'));
  for (const [input, target] of [['config.json', '.augx-decision/config.json'], ['source.txt', 'source.txt'],
    ['decision.json', 'decide.json'], ['task.json', 'run.json'], ['labeled-cases.json', 'evaluate.json'], ['call-inventory.json', 'inventory.json']]) {
    fs.copyFileSync(path.join(moduleRoot, 'examples', input), path.join(root, target));
  }
  oldKey = process.env.TYPESAFE_API_KEY; delete process.env.TYPESAFE_API_KEY;
  output = ''; failure = '';
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: any) => { output += String(chunk); return true; }) as any);
  vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: any) => { failure += String(chunk); return true; }) as any);
});
afterEach(() => {
  if (oldKey === undefined) delete process.env.TYPESAFE_API_KEY; else process.env.TYPESAFE_API_KEY = oldKey;
  vi.restoreAllMocks();
  fs.rmSync(root, { recursive: true, force: true });
});

describe('decision operation prompt contract', () => {
  it('reports an installation failure after its successful plan without claiming installed success', async () => {
    const execute = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(2);
    await decisionWorkflowInteractive(prompt([{ operation: 'setup' }, { host: 'codex' }, { runtime: 'auto' }, { confirm: true }]), root, execute);
    expect(execute).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('setup failed (exit 2)'));
    expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('finished (exit 0)'));
  });
  it.each(['decide', 'run', 'resume', 'evaluate', 'examples', 'inventory', 'doctor'])(
    'dispatches validated scope and relevant inputs for %s', async operation => {
      const execute = vi.fn(async () => 0);
      await decisionWorkflowInteractive(prompt(offline(operation)), root, execute);
      expect(execute).toHaveBeenCalledExactlyOnceWith(operation, expect.objectContaining({ project: root }));
      const options = execute.mock.calls[0][1] as DecisionOptions;
      if (['decide', 'run', 'evaluate', 'inventory'].includes(operation)) expect(options.input).toBe(path.join(root, `${operation}.json`));
      if (['doctor', 'inventory'].includes(operation)) expect(options.offline).toBeUndefined();
      else expect(options).toMatchObject({ offline: true, id: 'gui-test' });
      expect(options.live).toBeUndefined();
      expect(options.requests).toBeUndefined();
      expect(options.host).toBeUndefined();
    }
  );

  it('previews the concrete setup before explicitly installing the selected host/runtime', async () => {
    const execute = vi.fn(async () => 0);
    await decisionWorkflowInteractive(prompt([{ operation: 'setup' }, { host: 'claude-code' }, { runtime: 'portable' }, { confirm: true }]), root, execute);
    expect(execute.mock.calls).toEqual([
      ['setup', { project: root, host: 'claude-code', portable: true, dryRun: true }],
      ['setup', { project: root, host: 'claude-code', portable: true }]
    ]);
  });

  it.each([['setup-plan', true, 0], ['setup', false, 0], ['setup', true, 2]] as const)(
    'does not install from %s when confirmation=%s and plan exit=%s', async (operation, confirm, code) => {
      const execute = vi.fn(async () => code);
      await decisionWorkflowInteractive(prompt([{ operation }, { host: 'codex' }, { runtime: 'auto' }, { confirm }]), root, execute);
      expect(execute).toHaveBeenCalledExactlyOnceWith('setup', { project: root, host: 'codex', dryRun: true });
    }
  );

  it('passes the exact reviewed digest without changing run state or consumed budgets', async () => {
    const execute = vi.fn(async () => 0);
    const approve = 'a'.repeat(64);
    await decisionWorkflowInteractive(prompt([{ operation: 'resume' }, { mode: 'offline' }, { id: 'original' }, { approve }, { confirm: true }]), root, execute);
    expect(execute).toHaveBeenCalledExactlyOnceWith('resume', { project: root, offline: true, id: 'original', approve });
    expect(fs.existsSync(path.join(root, '.augx-decision/runs'))).toBe(false);
  });

  it('requires a positive live budget and explicit execution confirmation', async () => {
    const execute = vi.fn(async () => 0);
    await decisionWorkflowInteractive(prompt([{ operation: 'examples' }, { mode: 'live' }, { id: 'live-probe' }, { requests: '2' }, { confirm: true }]), root, execute);
    expect(execute).toHaveBeenCalledExactlyOnceWith('examples', { project: root, live: true, id: 'live-probe', requests: '2' });
  });

  it.each(['0', '-1', '1.5', 'Infinity', ''])('rejects invalid live request budget %s before dispatch', async requests => {
    const execute = vi.fn(async () => 0);
    await expect(decisionWorkflowInteractive(prompt([{ operation: 'examples' }, { mode: 'live' }, { id: 'probe' }, { requests }]), root, execute)).rejects.toThrow('request budget');
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    ['examples', { id: 'x', offline: true, live: true }],
    ['examples', { id: '../outside', offline: true }],
    ['examples', { id: 'x', offline: true, requests: '1' }],
    ['resume', { id: 'x', offline: true, approve: 'wrong' }],
    ['setup', { host: 'unsupported' }], ['run', { offline: true, id: 'x' }]
  ])('rejects invalid %s option combinations', (operation, options) => {
    expect(() => validateGuiDecisionOptions(operation as DecisionOperation, { project: root, ...options } as DecisionOptions)).toThrow();
  });

  it('rejects malformed JSON before dispatch without displaying input contents', async () => {
    fs.writeFileSync(path.join(root, 'run.json'), '{invalid');
    const execute = vi.fn(async () => 0);
    await expect(decisionWorkflowInteractive(prompt(offline('run')), root, execute)).rejects.toThrow();
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    [{ operation: 'back' }], [{ operation: 'examples' }, { mode: 'cancel' }],
    [{ operation: 'examples' }, { mode: 'offline' }, { id: 'probe' }, { confirm: false }],
    [{ operation: 'remove' }, { confirm: false }]
  ])('cancels without dispatch', async (...answers: any[]) => {
    const execute = vi.fn(async () => 0);
    await decisionWorkflowInteractive(prompt(answers), root, execute);
    expect(execute).not.toHaveBeenCalled();
  });

  it('keeps removal distinct from unlinking', async () => {
    const execute = vi.fn(async () => 0);
    await decisionWorkflowInteractive(prompt([{ operation: 'remove' }, { confirm: true }]), root, execute);
    expect(execute).toHaveBeenCalledExactlyOnceWith('remove', { project: root });
  });
});

describe('actual isolated decision bridge', () => {
  it('produces explicitly offline fixture output through the real prompt and process boundary', async () => {
    await decisionWorkflowInteractive(prompt(offline('examples')), root);
    const result = JSON.parse(output);
    expect(result.provenance).toBe('offline');
    expect(result.results).toHaveLength(11);
    expect(output).toContain('offline-fixture');
    expect(fs.existsSync(path.join(root, '.augx-decision/software'))).toBe(false);
    expect(failure).toBe('');
  }, 15000);

  it('returns a runtime failure without terminating the parent and cleans signal listeners', async () => {
    const int = process.listenerCount('SIGINT'), term = process.listenerCount('SIGTERM');
    const policy = JSON.parse(fs.readFileSync(path.join(root, '.augx-decision/config.json'), 'utf8'));
    policy.allowProviderData = true;
    fs.writeFileSync(path.join(root, '.augx-decision/config.json'), JSON.stringify(policy));
    expect(await runDecisionOperation('examples', { project: root, live: true, id: 'no-key', requests: '1' })).toBe(2);
    expect(failure).toMatch(/credential|TYPESAFE_API_KEY|sdk|SDK/i);
    expect(process.listenerCount('SIGINT')).toBe(int);
    expect(process.listenerCount('SIGTERM')).toBe(term);
    expect(process.exitCode || 0).toBe(0);
  }, 15000);

  it('rejects stale approval in the runtime while retaining original saved state', async () => {
    const taskFile = path.join(root, 'run.json');
    const task = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
    task.goal = 'Ambiguous local briefing request with missing requirements';
    fs.writeFileSync(taskFile, JSON.stringify(task));
    expect(await runDecisionOperation('run', { project: root, input: taskFile, offline: true, id: 'original' })).toBe(1);
    const file = path.join(root, '.augx-decision/runs/original/state.json');
    const original = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(original.status).toBe('review');
    expect(await runDecisionOperation('resume', { project: root, offline: true, id: 'original', approve: 'a'.repeat(64) })).toBe(2);
    const after = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(after.attempts).toBe(original.attempts);
    expect(after.requests).toBe(original.requests);
    expect(failure).toMatch(/approval|review/i);
  }, 15000);

  it('redacts configured credentials and common secret assignments', () => {
    process.env.TYPESAFE_API_KEY = 'local-sentinel-credential';
    expect(redactDecisionText('Failure local-sentinel-credential password=sentinel-value')).toBe('Failure [REDACTED] password=[REDACTED]');
  });
});
