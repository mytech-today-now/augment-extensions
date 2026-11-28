import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawnCommandSync } from '../process';
import { detectDecisionHostAvailability } from '../decision-runner';

jest.mock('../process', () => ({ spawnCommandSync: jest.fn() }));

const mockSpawnSync = spawnCommandSync as jest.MockedFunction<typeof spawnCommandSync>;

describe('decision host CLI checks', () => {
  let directory: string;
  let oldPath: string | undefined;
  let oldKey: string | undefined;
  let codexName: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-host-check-'));
    oldPath = process.env.PATH;
    oldKey = process.env.TYPESAFE_API_KEY;
    codexName = process.platform === 'win32' ? 'codex.exe' : 'codex';
    process.env.PATH = directory;
    process.env.TYPESAFE_API_KEY = 'host-check-secret';
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (oldPath === undefined) delete process.env.PATH;
    else process.env.PATH = oldPath;
    if (oldKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = oldKey;
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it('distinguishes absent launchers from a broken installed launcher', () => {
    fs.writeFileSync(path.join(directory, codexName), '#!/bin/sh\nexit 1\n', { mode: 0o700 });
    mockSpawnSync.mockReturnValue({
      pid: 1, output: [], stdout: '', stderr: 'Error: Missing optional dependency @openai/codex-linux-x64',
      status: 1, signal: null, error: undefined
    });

    const [codex, claude] = detectDecisionHostAvailability();

    expect(codex).toMatchObject({ state: 'BROKEN', host: 'codex' });
    expect(codex.diagnostic).toContain('@openai/codex-linux-x64');
    expect(claude).toMatchObject({ state: 'MISSING', host: 'claude-code' });
    expect(claude.diagnostic).toContain('No Claude Code executable');
  });

  it('uses bounded argument-array checks without passing environment credentials or exposing host output', () => {
    fs.writeFileSync(path.join(directory, codexName), 'fake host executable');
    mockSpawnSync.mockReturnValue({
      pid: 1, output: [], stdout: 'codex 1.2.3', stderr: '', status: 0, signal: null, error: undefined
    });

    const [codex, claude] = detectDecisionHostAvailability();

    expect(codex.state).toBe('AVAILABLE');
    expect(claude.state).toBe('MISSING');
    expect(mockSpawnSync).toHaveBeenCalledTimes(1);
    const [executable, args, options] = mockSpawnSync.mock.calls[0];
    expect(executable).toBe(path.join(directory, codexName));
    expect(args).toEqual(['--version']);
    expect(options).toMatchObject({ timeout: 5000, maxBuffer: 65536, shell: false });
    expect(options?.env?.TYPESAFE_API_KEY).toBeUndefined();
    expect(JSON.stringify([codex, claude])).not.toContain('host-check-secret');
  });

  it('recognizes healthy Codex and Claude Code launchers independently', () => {
    const claudeName = process.platform === 'win32' ? 'claude.exe' : 'claude';
    fs.writeFileSync(path.join(directory, codexName), 'fake Codex executable');
    fs.writeFileSync(path.join(directory, claudeName), 'fake Claude executable');
    mockSpawnSync.mockReturnValue({
      pid: 1, output: [], stdout: 'host 1.2.3', stderr: '', status: 0, signal: null, error: undefined
    });

    expect(detectDecisionHostAvailability()).toMatchObject([
      { host: 'codex', state: 'AVAILABLE' },
      { host: 'claude-code', state: 'AVAILABLE' }
    ]);
    expect(mockSpawnSync).toHaveBeenCalledTimes(2);
  });

  it('classifies a Claude Code timeout as a broken installed executable', () => {
    const claudeName = process.platform === 'win32' ? 'claude.exe' : 'claude';
    fs.writeFileSync(path.join(directory, claudeName), 'fake Claude executable');
    mockSpawnSync.mockReturnValue({
      pid: 1, output: [], stdout: '', stderr: '', status: null, signal: 'SIGTERM',
      error: Object.assign(new Error('timeout details may contain local data'), { code: 'ETIMEDOUT' })
    });

    const [, claude] = detectDecisionHostAvailability();

    expect(claude).toMatchObject({ host: 'claude-code', state: 'BROKEN' });
    expect(claude.diagnostic).toContain('did not finish its bounded startup check');
    expect(JSON.stringify(claude)).not.toContain('timeout details');
  });
});
