# C Coding Standards - API Documentation

## Table of Contents

1. [ConfigurationManager](#configurationmanager)
2. [RuleRegistry](#ruleregistry)
3. [PromptGenerator](#promptgenerator)
4. [RuleEvaluator](#ruleevaluator)
5. [TemplateEngine](#templateengine)
6. [ConflictDetector](#conflictdetector)
7. [RuleOverrideSystem](#ruleoverridesystem)

---

## ConfigurationManager

Manages configuration loading, validation, and hot-reload functionality.

### Constructor

```typescript
constructor(projectRoot: string)
```

**Parameters:**
- `projectRoot` - Root directory of the project

### Methods

#### load()

Loads configuration from `.augment/c-standards.json` or `.augment/c-standards.yaml`.

```typescript
async load(): Promise<Configuration>
```

**Returns:** Promise resolving to the loaded configuration

**Throws:** Error if configuration is invalid or cannot be parsed

**Example:**
```typescript
const configManager = new ConfigurationManager('/project/root');
const config = await configManager.load();
```

#### validateConfiguration()

Validates a configuration object against the schema.

```typescript
validateConfiguration(config: Configuration): ValidationResult
```

**Parameters:**
- `config` - Configuration object to validate

**Returns:** Validation result with `valid` boolean and `errors`/`warnings` arrays

**Example:**
```typescript
const result = configManager.validateConfiguration(config);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

#### getConfiguration()

Returns the currently loaded configuration.

```typescript
getConfiguration(): Configuration
```

**Returns:** Current configuration

**Throws:** Error if configuration not loaded

#### isRuleEnabled()

Checks if a specific rule is enabled.

```typescript
isRuleEnabled(ruleId: string): boolean
```

**Parameters:**
- `ruleId` - ID of the rule to check

**Returns:** `true` if rule is enabled, `false` otherwise

#### getRuleSeverity()

Gets the severity level of a rule.

```typescript
getRuleSeverity(ruleId: string): 'ERROR' | 'WARNING'
```

**Parameters:**
- `ruleId` - ID of the rule

**Returns:** Severity level ('ERROR' or 'WARNING')

#### reload()

Reloads configuration from disk and notifies watchers.

```typescript
async reload(): Promise<void>
```

**Example:**
```typescript
await configManager.reload();
```

#### watch()

Registers a callback to be notified when configuration changes.

```typescript
watch(callback: (config: Configuration) => void): void
```

**Parameters:**
- `callback` - Function to call when configuration changes

**Example:**
```typescript
configManager.watch((config) => {
  console.log('Configuration updated:', config);
});
```

#### dispose()

Cleans up resources and file watchers.

```typescript
dispose(): void
```

---

## RuleRegistry

Manages rule loading, indexing, and querying.

### Constructor

```typescript
constructor(rulesPath: string)
```

**Parameters:**
- `rulesPath` - Path to the rules directory

### Methods

#### loadRules()

Loads all rules from the rules directory.

```typescript
async loadRules(): Promise<void>
```

**Example:**
```typescript
const registry = new RuleRegistry('/path/to/rules');
await registry.loadRules();
```

#### getRule()

Retrieves a rule by its ID.

```typescript
getRule(ruleId: string): Rule | undefined
```

**Parameters:**
- `ruleId` - ID of the rule to retrieve

**Returns:** Rule object or `undefined` if not found

**Example:**
```typescript
const rule = registry.getRule('universal-naming');
if (rule) {
  console.log('Rule:', rule.name);
}
```

#### getRulesByCategory()

Gets all rules for a specific category.

```typescript
getRulesByCategory(category: string): Rule[]
```

**Parameters:**
- `category` - Category name (e.g., 'systems', 'embedded', 'kernel')

**Returns:** Array of rules in the category

**Example:**
```typescript
const embeddedRules = registry.getRulesByCategory('embedded');
console.log(`Found ${embeddedRules.length} embedded rules`);
```

#### getRulesBySeverity()

Gets all rules with a specific severity level.

```typescript
getRulesBySeverity(severity: 'ERROR' | 'WARNING'): Rule[]
```

**Parameters:**
- `severity` - Severity level to filter by

**Returns:** Array of rules with the specified severity

#### getActiveRules()

Gets all currently enabled rules.

```typescript
getActiveRules(): Rule[]
```

**Returns:** Array of enabled rules

#### queryRules()

Queries rules with multiple filters.

```typescript
queryRules(filters: {
  category?: string;
  severity?: 'ERROR' | 'WARNING';
  enabled?: boolean;
  search?: string;
}): Rule[]
```

**Parameters:**
- `filters` - Object containing filter criteria

**Returns:** Array of rules matching all filters

**Example:**
```typescript
const results = registry.queryRules({
  category: 'embedded',
  severity: 'ERROR',
  enabled: true
});
```

#### setRuleEnabled()

Enables or disables a rule.

```typescript
setRuleEnabled(ruleId: string, enabled: boolean): void
```

**Parameters:**
- `ruleId` - ID of the rule
- `enabled` - Whether to enable or disable the rule

#### clearCache()

Clears all cached query results.

```typescript
clearCache(): void
```

#### getAllRules()

Gets all loaded rules.

```typescript
getAllRules(): Rule[]
```

**Returns:** Array of all rules

---

## PromptGenerator

Generates AI prompts with context-aware rule information.

### Constructor

```typescript
constructor(registry: RuleRegistry, configManager: ConfigurationManager)
```

**Parameters:**
- `registry` - RuleRegistry instance
- `configManager` - ConfigurationManager instance

### Methods

#### generatePrompt()

Generates an AI prompt for code analysis.

```typescript
async generatePrompt(context: {
  filePath: string;
  codeContext: string;
  category?: string;
  template?: string;
}): Promise<string>
```

**Parameters:**
- `context.filePath` - Path to the file being analyzed
- `context.codeContext` - Code snippet for context
- `context.category` - Optional category override
- `context.template` - Optional custom template

**Returns:** Promise resolving to the generated prompt

**Example:**
```typescript
const generator = new PromptGenerator(registry, configManager);
const prompt = await generator.generatePrompt({
  filePath: '/project/embedded/sensor.c',
  codeContext: 'volatile uint32_t* reg;'
});
```

#### detectCategory()

Detects the category from a file path.

```typescript
detectCategory(filePath: string): string[]
```

**Parameters:**
- `filePath` - Path to analyze

**Returns:** Array of detected categories

**Example:**
```typescript
const categories = generator.detectCategory('/project/kernel/scheduler.c');
// Returns: ['kernel']
```

---

## RuleEvaluator

Evaluates code against rules and reports violations.

### Constructor

```typescript
constructor(registry: RuleRegistry, configManager: ConfigurationManager)
```

### Methods

#### evaluate()

Evaluates code against specified rules.

```typescript
async evaluate(code: string, options: {
  filePath: string;
  rules: string[];
  minSeverity?: 'ERROR' | 'WARNING';
}): Promise<Violation[]>
```

**Parameters:**
- `code` - Code to evaluate
- `options.filePath` - Path to the file
- `options.rules` - Array of rule IDs to apply
- `options.minSeverity` - Optional minimum severity filter

**Returns:** Promise resolving to array of violations

**Example:**
```typescript
const evaluator = new RuleEvaluator(registry, configManager);
const violations = await evaluator.evaluate(code, {
  filePath: '/project/src/main.c',
  rules: ['universal-naming', 'universal-memory-safety']
});
```

#### applyRule()

Applies a single rule to code.

```typescript
async applyRule(code: string, rule: Rule): Promise<Violation[]>
```

#### evaluateBatch()

Evaluates multiple files in batch.

```typescript
async evaluateBatch(files: Array<{
  path: string;
  content: string;
}>, options: {
  rules: string[];
}): Promise<Array<{
  filePath: string;
  violations: Violation[];
}>>
```

#### generateReport()

Generates a formatted report of violations.

```typescript
generateReport(violations: Violation[], options: {
  format: 'text' | 'json';
  includeSummary?: boolean;
}): string
```

**Example:**
```typescript
const report = evaluator.generateReport(violations, {
  format: 'json',
  includeSummary: true
});
```

---

## TemplateEngine

Renders templates with variable substitution and conditionals.

### Methods

#### render()

Renders a template with context data.

```typescript
render(template: string, context: Record<string, any>): string
```

**Example:**
```typescript
const engine = new TemplateEngine();
const result = engine.render('Hello {name}!', { name: 'World' });
// Returns: "Hello World!"
```

#### validate()

Validates template syntax.

```typescript
validate(template: string): { valid: boolean; errors: string[] }
```

#### parse()

Parses template into AST.

```typescript
parse(template: string): TemplateAST
```

#### registerHelper()

Registers a custom helper function.

```typescript
registerHelper(name: string, fn: Function): void
```

**Example:**
```typescript
engine.registerHelper('uppercase', (value: string) => value.toUpperCase());
```

---

## ConflictDetector

Detects and analyzes rule conflicts.

### Constructor

```typescript
constructor(registry: RuleRegistry)
```

### Methods

#### detectConflicts()

Detects all rule conflicts.

```typescript
async detectConflicts(): Promise<Conflict[]>
```

#### detectConflictsForRules()

Detects conflicts for specific rules.

```typescript
async detectConflictsForRules(ruleIds: string[]): Promise<Conflict[]>
```

#### suggestResolution()

Suggests resolutions for a conflict.

```typescript
suggestResolution(conflict: Conflict): Resolution[]
```

#### analyzeConflictSeverity()

Analyzes the severity of a conflict.

```typescript
analyzeConflictSeverity(conflict: Conflict): 'HIGH' | 'MEDIUM' | 'LOW'
```

---

## RuleOverrideSystem

Manages rule overrides and customizations.

### Constructor

```typescript
constructor(registry: RuleRegistry, configManager: ConfigurationManager)
```

### Methods

#### applyOverride()

Applies an override to a rule.

```typescript
applyOverride(ruleId: string, override: {
  severity?: 'ERROR' | 'WARNING';
  enabled?: boolean;
}): void
```

**Example:**
```typescript
const overrideSystem = new RuleOverrideSystem(registry, configManager);
overrideSystem.applyOverride('universal-naming', {
  severity: 'WARNING'
});
```

#### removeOverride()

Removes an override and restores original values.

```typescript
removeOverride(ruleId: string): void
```

#### getAllOverrides()

Gets all active overrides.

```typescript
getAllOverrides(): Record<string, Override>
```

#### exportOverrides()

Exports overrides to JSON or YAML.

```typescript
exportOverrides(format: 'json' | 'yaml'): string
```

#### importOverrides()

Imports overrides from JSON or YAML.

```typescript
importOverrides(data: string, format: 'json' | 'yaml'): void
```


