import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import * as fs from 'fs';
import { spawn, spawnSync } from 'child_process';
import { redactDecisionText, runDecisionOperation } from '../cli/src/utils/decision-runner';

vi.mock('child_process', () => ({ spawn: vi.fn(), spawnSync: vi.fn() }));
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return { ...actual, existsSync: vi.fn(actual.existsSync) };
});
let child: any;
let oldKey: string | undefined;
let int: number, term: number;
beforeEach(async () => {
  vi.mocked(fs.existsSync).mockImplementation((await vi.importActual<typeof import('fs')>('fs')).existsSync);
  child = Object.assign(new EventEmitter(), {
    stdout: new PassThrough(), stderr: new PassThrough(), connected: true, pid: 987654,
    send: vi.fn(), kill: vi.fn()
  });
  vi.mocked(spawn).mockReturnValue(child);
  oldKey = process.env.TYPESAFE_API_KEY;
  int = process.listenerCount('SIGINT'); term = process.listenerCount('SIGTERM');
});
afterEach(() => {
  if (oldKey === undefined) delete process.env.TYPESAFE_API_KEY; else process.env.TYPESAFE_API_KEY = oldKey;
  vi.restoreAllMocks(); vi.useRealTimers();
  expect(process.listenerCount('SIGINT')).toBe(int);
  expect(process.listenerCount('SIGTERM')).toBe(term);
});

describe('shared child process boundary', () => {
  it('redacts authorization schemes, short secrets and quoted credential values', () => {
    delete process.env.TYPESAFE_API_KEY;
    expect(redactDecisionText('Authorization: Bearer private-token\npassword=short\n{"secret":"two private words"}\ntoken=abc'))
      .toBe('Authorization: [REDACTED]\npassword=[REDACTED]\n{"secret":"[REDACTED]"}\ntoken=[REDACTED]');
  });

  it('uses structured arguments without a shell and preserves paths with spaces and Unicode', async () => {
    const options = { project: 'C:/project unicodé with spaces', offline: true, id: 'example' };
    const result = runDecisionOperation('examples', options);
    expect(spawn).toHaveBeenCalledWith(process.execPath,
      [expect.stringContaining('runtime'), 'examples', JSON.stringify(options)],
      expect.objectContaining({ shell: false, windowsHide: true }));
    child.emit('close', 2); expect(await result).toBe(2);
  });

  it('redacts credentials split across output chunks and preserves Unicode', async () => {
    process.env.TYPESAFE_API_KEY = 'split-sentinel-key';
    let output = '';
    vi.spyOn(process.stdout, 'write').mockImplementation(((part: any) => { output += String(part); return true; }) as any);
    const result = runDecisionOperation('doctor', { project: process.cwd() });
    child.stdout.write('failure split-senti'); child.stdout.write('nel-key unicodé\n');
    child.emit('close', 0); await result;
    expect(output).toBe('failure [REDACTED] unicodé\n');
  });

  it('removes listeners when spawning fails and leaves later operations usable', async () => {
    const result = runDecisionOperation('doctor', { project: process.cwd() });
    child.emit('error', new Error('spawn unavailable'));
    await expect(result).rejects.toThrow('spawn unavailable');
    child.emit('close', -1);
    const next = runDecisionOperation('doctor', { project: process.cwd() });
    child.emit('close', 0); expect(await next).toBe(0);
  });

  it('forwards cancellation, bounds cleanup and returns cancellation without leaking listeners', async () => {
    vi.useFakeTimers();
    const before = new Set(process.listeners('SIGINT'));
    const result = runDecisionOperation('run', { project: process.cwd(), offline: true, id: 'owned' });
    const cancel = process.listeners('SIGINT').find(listener => !before.has(listener))!;
    cancel();
    expect(child.send).toHaveBeenCalledWith({ type: 'cancel' }, expect.any(Function));
    await vi.advanceTimersByTimeAsync(5000);
    if (process.platform === 'win32') expect(spawnSync).toHaveBeenCalledWith(expect.stringContaining('taskkill.exe'), ['/PID', '987654', '/T', '/F'], expect.objectContaining({ windowsHide: true }));
    else expect(child.kill).toHaveBeenCalledWith('SIGTERM');
    child.emit('close', 0); expect(await result).toBe(130);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reports missing optional runtime assets without starting a child', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(spawn).mockClear();
    await expect(runDecisionOperation('doctor', { project: process.cwd() })).rejects.toThrow('assets are unavailable');
    expect(spawn).not.toHaveBeenCalled();
  });
});
