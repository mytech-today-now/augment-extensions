import * as fs from 'fs';
import {
  detectDecisionHostAvailability,
  runDecisionOperation,
  runDecisionOperationResult,
  type DecisionHostAvailability
} from '../decision-runner';
import { parseJevRequestCeiling, runJevInitOnboarding } from '../init-jev';
import type { InteractivePrompt } from '../interactive-prompt';

jest.mock('fs');
jest.mock('../decision-runner', () => ({
  detectDecisionHostAvailability: jest.fn(),
  runDecisionOperation: jest.fn(),
  runDecisionOperationResult: jest.fn()
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockDetectHosts = detectDecisionHostAvailability as jest.MockedFunction<typeof detectDecisionHostAvailability>;
const mockRunOperation = runDecisionOperation as jest.MockedFunction<typeof runDecisionOperation>;
const mockRunResult = runDecisionOperationResult as jest.MockedFunction<typeof runDecisionOperationResult>;

function scriptedPrompt(values: Record<string, unknown[]>): InteractivePrompt & { calls: jest.Mock } {
  const queues = Object.fromEntries(Object.entries(values).map(([key, items]) => [key, [...items]]));
  const calls = jest.fn(async (questions: readonly unknown[]) => {
    const question = (questions[0] || {}) as { name?: string };
    const name = question.name || '';
    const value = queues[name]?.shift();
    return { [name]: typeof value === 'function' ? await (value as () => unknown)() : value };
  });
  return { prompt: calls as InteractivePrompt['prompt'], calls };
}

const availableCodex: DecisionHostAvailability = {
  host: 'codex', state: 'AVAILABLE', diagnostic: 'Codex executable responded to --version.'
};
const brokenCodex: DecisionHostAvailability = {
  host: 'codex', state: 'BROKEN',
  diagnostic: 'Codex startup failed because the @openai/codex-linux-x64 optional dependency is missing.',
  nextStep: 'Reinstall Codex manually, then rerun augx init.'
};
const missingClaude: DecisionHostAvailability = {
  host: 'claude-code', state: 'MISSING', diagnostic: 'No Claude Code executable was found on PATH.',
  nextStep: 'Install Claude Code using its official instructions, then rerun augx init.'
};
const baseDoctor = {
  softwareInstalled: false, configurationValid: false, model: 'jev-1.14.0', requestLimit: 5,
  automatic: { enabled: false, registrationIntact: false, requestsUsed: 0 },
  mcpHealth: { state: 'NOT CONFIGURED' }
};
const automaticDoctor = {
  softwareInstalled: true, configurationValid: true, model: 'jev-1.14.0', requestLimit: 5,
  automatic: { enabled: true, registrationIntact: true, requestsUsed: 0 },
  mcpHealth: { state: 'HEALTHY' }
};

describe('Jev initialization onboarding', () => {
  let logSpy: jest.SpyInstance;
  let oldKey: string | undefined;
  let doctorCalls: number;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    oldKey = process.env.TYPESAFE_API_KEY;
    delete process.env.TYPESAFE_API_KEY;
    doctorCalls = 0;
    mockDetectHosts.mockReturnValue([availableCodex, missingClaude]);
    mockRunOperation.mockResolvedValue(0);
    mockRunResult.mockImplementation(async (operation, options) => {
      if (operation === 'doctor') {
        doctorCalls += 1;
        return { code: 0, result: doctorCalls === 1 ? baseDoctor : { ...baseDoctor, softwareInstalled: true, configurationValid: true } };
      }
      if (options.dryRun) return { code: 0, result: { dryRun: true } };
      return { code: 0, result: { softwareInstalled: true, configurationValid: true, credentialsAvailable: Boolean(process.env.TYPESAFE_API_KEY?.trim()), automatic: { enabled: options.automatic === true, registrationIntact: options.automatic === true } } };
    });
    mockFs.mkdtempSync.mockReturnValue('/tmp/augx-init-jev-fixture');
    mockFs.writeFileSync.mockImplementation();
    mockFs.rmSync.mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    if (oldKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = oldKey;
  });

  it.each([
    ['', 'Enter a whole number'],
    ['0', 'positive integer'],
    ['-1', 'digits only'],
    ['1.5', 'digits only'],
    ['six', 'digits only'],
    ['6', 'cannot exceed']
  ])('rejects request ceiling %j', (raw, expected) => {
    expect(parseJevRequestCeiling(raw, 5).error).toContain(expected);
  });

  it('accepts positive in-policy ceilings and rejects totals that refund or exhaust existing usage', () => {
    expect(parseJevRequestCeiling('1', 5)).toEqual({ value: 1 });
    expect(parseJevRequestCeiling('5', 5)).toEqual({ value: 5 });
    expect(parseJevRequestCeiling('2', 5, 2).error).toContain('Existing usage is retained');
    expect(parseJevRequestCeiling('3', 5, 2)).toEqual({ value: 3 });
  });

  it('skips setup when the user leaves Jev unconfigured', async () => {
    const prompt = scriptedPrompt({ choice: ['skip'] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockRunResult).not.toHaveBeenCalled();
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Ordinary-chat model selection: NOT VERIFIED'));
  });

  it('prints non-interactive instructions without probing hosts or enabling provider access', async () => {
    await runJevInitOnboarding(null, '/project');
    expect(mockDetectHosts).not.toHaveBeenCalled();
    expect(mockRunResult).not.toHaveBeenCalled();
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Rerun augx init in an interactive terminal'));
  });

  it('does not infer consent from non-interactive mode even when credentials exist', async () => {
    process.env.TYPESAFE_API_KEY = 'test-only-secret';
    await runJevInitOnboarding(null, '/project');
    expect(mockDetectHosts).not.toHaveBeenCalled();
    expect(mockRunResult).not.toHaveBeenCalled();
    expect(mockRunOperation).not.toHaveBeenCalled();
    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain('TYPESAFE_API_KEY availability: AVAILABLE');
    expect(output).not.toContain('test-only-secret');
  });

  it('installs offline runtime without a host registration or provider call', async () => {
    const prompt = scriptedPrompt({ choice: ['offline'], confirmed: [true] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockRunResult).toHaveBeenCalledWith('setup', expect.objectContaining({ project: '/project', host: 'none', automatic: false, dryRun: true }));
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Offline runtime setup: VERIFIED'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Project registration integrity: NOT CONFIGURED'));
  });

  it('does not setup automatic chat when data consent is denied', async () => {
    process.env.TYPESAFE_API_KEY = 'test-only-secret';
    const prompt = scriptedPrompt({ choice: ['automatic'], host: ['codex'], requests: ['3'], scope: ['public'], confirmed: [false] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockDetectHosts).toHaveBeenCalledTimes(1);
    expect(mockRunResult).toHaveBeenCalledTimes(1);
    expect(mockRunResult).toHaveBeenCalledWith('doctor', { project: '/project' });
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(logSpy.mock.calls.flat().join('\n')).not.toContain('test-only-secret');
  });

  it('keeps automatic and one-time budgets separate and stores only selected data classes', async () => {
    process.env.TYPESAFE_API_KEY = 'test-only-secret';
    mockRunResult
      .mockResolvedValueOnce({ code: 0, result: baseDoctor })
      .mockResolvedValueOnce({ code: 0, result: { dryRun: true } })
      .mockResolvedValueOnce({ code: 0, result: { softwareInstalled: true, configurationValid: true, credentialsAvailable: true, automatic: { enabled: true, registrationIntact: true } } })
      .mockResolvedValueOnce({ code: 0, result: automaticDoctor });
    const prompt = scriptedPrompt({
      choice: ['automatic-live'], host: ['codex'], requests: ['3', '2'], scope: ['public,internal'], confirmed: [true, true, true]
    });
    await runJevInitOnboarding(prompt, '/project');

    expect(mockRunResult).toHaveBeenNthCalledWith(2, 'setup', expect.objectContaining({ automatic: true, requests: '3', dataClasses: 'public,internal', dryRun: true }));
    expect(mockRunResult).toHaveBeenNthCalledWith(3, 'setup', expect.objectContaining({ automatic: true, requests: '3', dataClasses: 'public,internal' }));
    expect(mockRunOperation).toHaveBeenCalledWith('decide', expect.objectContaining({ live: true, requests: '2', providerDataConsent: true }));
    expect(mockRunOperation.mock.calls[0][1].input).toContain('synthetic-probe.json');
    expect(mockFs.rmSync).toHaveBeenCalledWith('/tmp/augx-init-jev-fixture', { recursive: true, force: true });
    expect(logSpy.mock.calls.flat().join('\n')).toContain('Live provider response: VERIFIED');
    expect(logSpy.mock.calls.flat().join('\n')).not.toContain('test-only-secret');
  });

  it('does not invoke a provider when the final default-no probe confirmation is declined', async () => {
    process.env.TYPESAFE_API_KEY = 'test-only-secret';
    mockRunResult
      .mockResolvedValueOnce({ code: 0, result: baseDoctor })
      .mockResolvedValueOnce({ code: 0, result: { dryRun: true } })
      .mockResolvedValueOnce({ code: 0, result: { softwareInstalled: true, configurationValid: true, credentialsAvailable: true } })
      .mockResolvedValueOnce({ code: 0, result: { ...baseDoctor, softwareInstalled: true, configurationValid: true } });
    const prompt = scriptedPrompt({ choice: ['live'], requests: ['1'], confirmed: [true, false] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(mockFs.mkdtempSync).not.toHaveBeenCalled();
    expect(logSpy.mock.calls.flat().join('\n')).toContain('The final live-probe confirmation was declined');
  });

  it('does not probe when the post-setup doctor cannot verify the runtime or policy', async () => {
    process.env.TYPESAFE_API_KEY = 'test-only-secret';
    mockRunResult
      .mockResolvedValueOnce({ code: 0, result: baseDoctor })
      .mockResolvedValueOnce({ code: 0, result: { dryRun: true } })
      .mockResolvedValueOnce({ code: 0, result: { softwareInstalled: true, configurationValid: true, credentialsAvailable: true } })
      .mockResolvedValueOnce({ code: 0, result: { ...baseDoctor, softwareInstalled: false, configurationValid: false } });
    const prompt = scriptedPrompt({ choice: ['live'], requests: ['1'], confirmed: [true] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(mockFs.mkdtempSync).not.toHaveBeenCalled();
    expect(logSpy.mock.calls.flat().join('\n')).toContain('No provider request was made');
    expect(logSpy.mock.calls.flat().join('\n')).toContain('Live provider response: NOT VERIFIED');
  });

  it('does not setup automatic chat when credentials are missing and allows offline continuation', async () => {
    mockDetectHosts.mockReturnValue([availableCodex, missingClaude]);
    const prompt = scriptedPrompt({ choice: ['automatic'], host: ['codex'], recovery: ['offline'], confirmed: [true] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockRunResult).toHaveBeenCalledWith('setup', expect.objectContaining({ host: 'none', automatic: false, dryRun: true }));
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(logSpy.mock.calls.flat().join('\n')).toContain('TYPESAFE_API_KEY availability: MISSING');
  });

  it('offers repair guidance when all host CLIs are absent or broken and does not run installers', async () => {
    mockDetectHosts.mockReturnValue([brokenCodex, missingClaude]);
    const prompt = scriptedPrompt({ choice: ['automatic'], recovery: ['repair'] });
    await runJevInitOnboarding(prompt, '/project');
    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain('@openai/codex-linux-x64');
    expect(output).toContain('No Claude Code executable was found on PATH');
    expect(mockRunResult).not.toHaveBeenCalled();
    expect(mockRunOperation).not.toHaveBeenCalled();
  });

  it('leaves provider access disabled when setup confirmation is declined', async () => {
    const prompt = scriptedPrompt({ choice: ['offline'], confirmed: [false] });
    await runJevInitOnboarding(prompt, '/project');
    expect(mockRunResult).toHaveBeenCalledTimes(2);
    expect(mockRunOperation).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Base Augx initialization will continue'));
  });

  it('reports registration and local MCP health separately from ordinary-chat selection', async () => {
    process.env.TYPESAFE_API_KEY = 'test-only-secret';
    mockRunResult
      .mockResolvedValueOnce({ code: 0, result: baseDoctor })
      .mockResolvedValueOnce({ code: 0, result: { dryRun: true } })
      .mockResolvedValueOnce({ code: 0, result: { softwareInstalled: true, configurationValid: true, credentialsAvailable: true, automatic: { enabled: true, registrationIntact: true } } })
      .mockResolvedValueOnce({ code: 0, result: automaticDoctor });
    const prompt = scriptedPrompt({ choice: ['automatic'], host: ['codex'], requests: ['2'], scope: ['public'], confirmed: [true, true] });
    await runJevInitOnboarding(prompt, '/project');
    const output = logSpy.mock.calls.flat().join('\n');
    expect(output).toContain('Project registration integrity: VERIFIED');
    expect(output).toContain('Host MCP server health (local): HEALTHY');
    expect(output).toContain('Ordinary-chat model selection: NOT VERIFIED');
    expect(output).not.toContain('test-only-secret');
  });
});
