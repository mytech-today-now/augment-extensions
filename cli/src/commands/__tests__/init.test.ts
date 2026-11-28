import * as fs from 'fs';
import * as path from 'path';
import { initCommand } from '../init';
import { getInteractivePrompt, type InteractivePrompt } from '../../utils/interactive-prompt';
import { runJevInitOnboarding } from '../../utils/init-jev';

jest.mock('fs');
jest.mock('../../utils/interactive-prompt');
jest.mock('../../utils/install-rules', () => ({
  installCharacterCountRule: jest.fn().mockResolvedValue({ success: true }),
  installEmDashRule: jest.fn().mockResolvedValue({ success: true }),
  installAsciiOnlyCodeRule: jest.fn().mockResolvedValue({ success: true }),
  installUtf8NonCodeRule: jest.fn().mockResolvedValue({ success: true }),
  installNoEmojiRule: jest.fn().mockResolvedValue({ success: true })
}));
jest.mock('../../utils/extractCommandHelp', () => ({ extractCommandHelp: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../utils/init-jev', () => ({ runJevInitOnboarding: jest.fn().mockResolvedValue(undefined) }));
jest.mock('chalk', () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
    bold: {
      blue: (str: string) => str,
      green: (str: string) => str
    }
  },
  bold: {
    blue: (str: string) => str,
    green: (str: string) => str
  },
  blue: (str: string) => str,
  green: (str: string) => str,
  red: (str: string) => str,
  gray: (str: string) => str,
  yellow: (str: string) => str,
  cyan: (str: string) => str
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockGetInteractivePrompt = getInteractivePrompt as jest.MockedFunction<typeof getInteractivePrompt>;
const mockRunJevInitOnboarding = runJevInitOnboarding as jest.MockedFunction<typeof runJevInitOnboarding>;
const mockPrompt = jest.fn();
const interactivePrompt: InteractivePrompt = {
  prompt: mockPrompt as InteractivePrompt['prompt']
};

describe('Init Command', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
    mockPrompt.mockReset();
    mockGetInteractivePrompt.mockReset();
    mockGetInteractivePrompt.mockResolvedValue(interactivePrompt);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('prompts before overwriting an existing initialization', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockPrompt.mockResolvedValueOnce({ overwrite: false });

    await initCommand({});

    expect(mockPrompt).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'confirm',
          name: 'overwrite',
          message: 'Augment Extensions already initialized. Overwrite?'
        })
      ])
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Initialization cancelled.'));
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it('falls back cleanly when prompt support is unavailable', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockGetInteractivePrompt.mockResolvedValueOnce(null);

    await initCommand({});

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Interactive prompts are unavailable in this terminal')
    );
    expect(mockRunJevInitOnboarding).toHaveBeenCalledWith(null, process.cwd());
    expect(mockPrompt).not.toHaveBeenCalled();
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it('--yes completes base initialization and never turns on Jev provider behavior', async () => {
    mockFs.existsSync.mockReturnValue(false);

    await initCommand({ yes: true });

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(path.join(process.cwd(), '.augment', 'extensions.json'), expect.any(String));
    expect(mockGetInteractivePrompt).not.toHaveBeenCalled();
    expect(mockRunJevInitOnboarding).toHaveBeenCalledWith(null, process.cwd());
    expect(mockPrompt).not.toHaveBeenCalled();
  });

  it('still runs the optional Jev stage when optional rule prompts are disabled', async () => {
    mockFs.existsSync.mockReturnValue(false);

    await initCommand({ optionalRules: false });

    expect(mockGetInteractivePrompt).toHaveBeenCalledTimes(1);
    expect(mockRunJevInitOnboarding).toHaveBeenCalledWith(interactivePrompt, process.cwd());
  });

  it('completes base initialization without a TTY when optional rule prompts are disabled', async () => {
    mockFs.existsSync.mockReturnValue(false);
    mockGetInteractivePrompt.mockResolvedValueOnce(null);

    await initCommand({ optionalRules: false });

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(path.join(process.cwd(), '.augment', 'extensions.json'), expect.any(String));
    expect(mockRunJevInitOnboarding).toHaveBeenCalledWith(null, process.cwd());
  });
});
