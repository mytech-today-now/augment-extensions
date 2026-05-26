import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

export interface AugmentConfig {
  version: string;
  plugins?: {
    enabled?: boolean;
    directory?: string;
    autoLoad?: boolean;
  };
  inspection?: {
    defaultFormat?: 'text' | 'json' | 'markdown';
    cache?: boolean;
    cacheTTL?: number;
    maxDepth?: number;
    pageSize?: number;
    secureMode?: boolean;
    syntaxHighlighting?: boolean;
  };
  modules?: {
    searchPaths?: string[];
    autoDiscover?: boolean;
    linkedModulesFile?: string;
  };
  hooks?: {
    enabled?: boolean;
    timeout?: number;
  };
  vscode?: {
    enableFileLinks?: boolean;
    openInPreview?: boolean;
    webviewEnabled?: boolean;
  };
  ai?: {
    enablePromptGeneration?: boolean;
    enableSummaries?: boolean;
    defaultPromptTemplate?: 'code-review' | 'module-summary' | 'optimization' | 'refactoring';
  };
}

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: AugmentConfig | null = null;
  private configPath: string | null = null;
  private lastModified = 0;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  loadConfig(customPath?: string): AugmentConfig {
    const configPath = customPath || this.findConfigFile();
    if (!configPath) {
      return this.loadDefaultConfig();
    }

    const stats = fs.statSync(configPath);
    const modified = stats.mtimeMs;
    if (this.config && this.configPath === configPath && this.lastModified === modified) {
      return this.config;
    }

    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as AugmentConfig;
      if (!this.validateConfig(userConfig)) {
        console.warn('Invalid configuration file. Using defaults.');
        return this.loadDefaultConfig();
      }

      const defaultConfig = this.loadDefaultConfig();
      this.config = this.mergeConfigs(defaultConfig, userConfig);
      this.configPath = configPath;
      this.lastModified = modified;
      return this.config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      return this.loadDefaultConfig();
    }
  }

  getConfig(): AugmentConfig {
    if (!this.config) {
      return this.loadConfig();
    }
    return this.config;
  }

  reloadConfig(): AugmentConfig {
    this.config = null;
    this.lastModified = 0;
    return this.loadConfig();
  }

  get<K extends keyof AugmentConfig>(key: K): AugmentConfig[K] {
    return this.getConfig()[key];
  }

  private findConfigFile(): string | null {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const searchPaths = [
      path.join(process.cwd(), '.augment', 'augment.json'),
      path.join(process.cwd(), 'augment.json'),
      path.join(home, '.augment', 'augment.json')
    ];

    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        return searchPath;
      }
    }

    return null;
  }

  private loadDefaultConfig(): AugmentConfig {
    const defaultConfigPath = path.join(__dirname, '..', '..', 'config', 'augment-default.json');

    try {
      return JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8')) as AugmentConfig;
    } catch {
      return {
        version: '1.0.0',
        plugins: { enabled: true, directory: '.augment/plugins', autoLoad: true },
        inspection: {
          defaultFormat: 'text',
          cache: true,
          cacheTTL: 3600,
          maxDepth: 5,
          pageSize: 10,
          secureMode: false,
          syntaxHighlighting: true
        },
        modules: {
          searchPaths: ['augment-extensions'],
          autoDiscover: true,
          linkedModulesFile: '.augment/extensions.json'
        },
        hooks: { enabled: true, timeout: 5000 },
        vscode: { enableFileLinks: true, openInPreview: false, webviewEnabled: true },
        ai: {
          enablePromptGeneration: true,
          enableSummaries: true,
          defaultPromptTemplate: 'module-summary'
        }
      };
    }
  }

  private validateConfig(config: AugmentConfig): boolean {
    try {
      const schemaPath = path.join(__dirname, '..', '..', 'config', 'augment-schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(config);

      if (!valid) {
        console.error('Configuration validation errors:', validate.errors);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating configuration:', error);
      return false;
    }
  }

  private mergeConfigs(defaultConfig: AugmentConfig, userConfig: AugmentConfig): AugmentConfig {
    return {
      version: userConfig.version || defaultConfig.version,
      plugins: { ...defaultConfig.plugins, ...userConfig.plugins },
      inspection: { ...defaultConfig.inspection, ...userConfig.inspection },
      modules: {
        ...defaultConfig.modules,
        ...userConfig.modules,
        searchPaths: userConfig.modules?.searchPaths || defaultConfig.modules?.searchPaths
      },
      hooks: { ...defaultConfig.hooks, ...userConfig.hooks },
      vscode: { ...defaultConfig.vscode, ...userConfig.vscode },
      ai: { ...defaultConfig.ai, ...userConfig.ai }
    };
  }
}

export const configLoader = ConfigLoader.getInstance();