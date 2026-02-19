/**
 * Unit Tests for PromptGenerator
 * Tests AI prompt generation, category detection, and template rendering
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PromptGenerator } from '../../src/prompt-generator';
import { RuleRegistry } from '../../src/registry';
import { ConfigurationManager } from '../../src/config-manager';

describe('PromptGenerator', () => {
  let tempDir: string;
  let rulesPath: string;
  let configPath: string;
  let registry: RuleRegistry;
  let configManager: ConfigurationManager;
  let generator: PromptGenerator;

  beforeEach(async () => {
    // Create temporary directories
    tempDir = path.join(__dirname, '../fixtures/temp-prompt');
    rulesPath = path.join(tempDir, 'rules');
    configPath = tempDir;
    
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(configPath, '.augment'), { recursive: true });
    
    // Create sample rules
    await createSampleRules();
    
    // Create sample template
    await createSampleTemplate();
    
    // Initialize components
    registry = new RuleRegistry(rulesPath);
    await registry.loadRules();
    
    configManager = new ConfigurationManager(configPath);
    await configManager.load();
    
    generator = new PromptGenerator(registry, configManager);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createSampleRules() {
    const namingRule = `# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: ERROR

## Description
Use snake_case for functions and variables.

## Examples

### Good Example
\`\`\`c
int my_function() { return 0; }
\`\`\`
`;

    await fs.writeFile(path.join(rulesPath, 'universal/naming.md'), namingRule);
  }

  async function createSampleTemplate() {
    const template = `# C Coding Standards - {category}

## Active Rules
{rules}

## Guidelines
Follow these standards for {category} programming.
`;

    await fs.writeFile(
      path.join(configPath, '.augment/prompt-template.md'),
      template
    );
  }

  describe('generatePrompt()', () => {
    it('should generate prompt with file context', async () => {
      const prompt = await generator.generatePrompt({
        filePath: '/project/src/network/tcp_server.c',
        codeContext: 'int handle_connection() { return 0; }'
      });
      
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('C Coding Standards');
    });

    it('should include relevant rules in prompt', async () => {
      const prompt = await generator.generatePrompt({
        filePath: '/project/src/main.c',
        codeContext: 'int main() { return 0; }'
      });
      
      expect(prompt).toContain('universal-naming');
    });

    it('should filter rules by category', async () => {
      const prompt = await generator.generatePrompt({
        filePath: '/project/embedded/sensor.c',
        codeContext: 'volatile uint32_t* reg;',
        category: 'embedded'
      });
      
      expect(prompt).toBeDefined();
    });

    it('should use custom template if provided', async () => {
      const customTemplate = '# Custom Template\n{rules}';
      
      const prompt = await generator.generatePrompt({
        filePath: '/project/src/main.c',
        codeContext: 'int main() {}',
        template: customTemplate
      });
      
      expect(prompt).toContain('Custom Template');
    });

    it('should cache generated prompts', async () => {
      const context = {
        filePath: '/project/src/main.c',
        codeContext: 'int main() { return 0; }'
      };
      
      const prompt1 = await generator.generatePrompt(context);
      const prompt2 = await generator.generatePrompt(context);
      
      expect(prompt1).toBe(prompt2); // Same reference due to caching
    });
  });

  describe('detectCategory()', () => {
    it('should detect embedded category from file path', () => {
      const category = generator.detectCategory('/project/embedded/sensor.c');
      expect(category).toContain('embedded');
    });

    it('should detect kernel category from file path', () => {
      const category = generator.detectCategory('/project/kernel/scheduler.c');
      expect(category).toContain('kernel');
    });

    it('should detect networking category from file path', () => {
      const category = generator.detectCategory('/project/network/tcp.c');
      expect(category).toContain('networking');
    });

    it('should detect drivers category from file path', () => {
      const category = generator.detectCategory('/project/drivers/usb.c');
      expect(category).toContain('drivers');
    });

    it('should detect realtime category from file path', () => {
      const category = generator.detectCategory('/project/realtime/scheduler.c');
      expect(category).toContain('realtime');
    });
  });
});

