# Inspect Command Documentation

## Overview

The `augx inspect` command provides advanced module inspection capabilities with support for plugins, custom handlers, and hooks.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Plugin System](#plugin-system)
- [Custom Handlers](#custom-handlers)
- [Hook System](#hook-system)
- [Command Reference](#command-reference)
- [Troubleshooting](#troubleshooting)

---

## Installation

The inspect command is part of the `augx` CLI. No additional installation is required.

```bash
npm install -g augx
```

---

## Basic Usage

### Inspect a Module

```bash
augx show module <module-name>
```

**Example:**

```bash
augx show module typescript-standards
```

### Inspect with Options

```bash
augx show module <module-name> --format json --content
```

**Example:**

```bash
augx show module php-standards --format json --content
```

---

## Configuration

### Configuration File

Create `.augment/augment.json` in your project root:

```json
{
  "version": "1.0.0",
  "plugins": {
    "enabled": true,
    "directory": ".augment/plugins",
    "autoLoad": true
  },
  "inspection": {
    "defaultFormat": "text",
    "cache": true,
    "cacheTTL": 3600,
    "maxDepth": 5
  },
  "modules": {
    "searchPaths": ["augment-extensions"],
    "autoDiscover": true
  },
  "hooks": {
    "enabled": true,
    "timeout": 5000
  }
}
```

### Configuration Options

#### `plugins`

- **`enabled`** (boolean): Enable/disable plugin system
- **`directory`** (string): Plugin directory path
- **`autoLoad`** (boolean): Auto-load plugins on startup

#### `inspection`

- **`defaultFormat`** (string): Default output format (`text`, `json`, `markdown`)
- **`cache`** (boolean): Enable inspection caching
- **`cacheTTL`** (number): Cache time-to-live in seconds
- **`maxDepth`** (number): Maximum recursion depth (1-10)

#### `modules`

- **`searchPaths`** (array): Module search paths
- **`autoDiscover`** (boolean): Auto-discover modules

#### `hooks`

- **`enabled`** (boolean): Enable/disable hooks
- **`timeout`** (number): Hook timeout in milliseconds

### Generate Default Configuration

```bash
augx config generate
```

---

## Plugin System

### Creating a Plugin

Create a plugin file in `.augment/plugins/`:

```typescript
// .augment/plugins/my-plugin.ts
export default {
  id: 'my-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'A custom plugin for module inspection',
  
  async initialize() {
    console.log('Plugin initialized');
  },
  
  async cleanup() {
    console.log('Plugin cleaned up');
  }
};
```

### Plugin Interface

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  initialize(): Promise<void> | void;
  cleanup?(): Promise<void> | void;
}
```

### Loading Plugins

Plugins are automatically loaded from the configured plugin directory when `autoLoad` is enabled.

**Manual Loading:**

```typescript
import { pluginLoader } from 'augx/utils/plugin-system';

await pluginLoader.loadPluginsFromDirectory('.augment/plugins');
```

---

## Custom Handlers

### Creating a Custom Handler

```typescript
import { BaseInspectionHandler, HandlerResult } from 'augx/utils/inspection-handlers';

export class MyCustomHandler extends BaseInspectionHandler {
  id = 'my-custom-handler';
  supportedTypes = ['my-module-type'];
  priority = 10;

  async handle(module, options): Promise<HandlerResult> {
    // Custom inspection logic
    return {
      success: true,
      data: {
        module: module.fullName,
        customData: 'my custom data'
      },
      metadata: {
        handlerId: this.id,
        moduleType: module.metadata.type
      }
    };
  }
}
```

### Registering a Handler

```typescript
import { pluginLoader } from 'augx/utils/plugin-system';
import { MyCustomHandler } from './my-custom-handler';

const handler = new MyCustomHandler();
pluginLoader.registerHandler(handler);
```

### Handler Priority

Handlers with higher priority values are executed first. Default priority is `0`.

---

## Hook System

### Hook Types

- **`pre-inspection`**: Runs before module inspection
- **`post-inspection`**: Runs after module inspection
- **`pre-load`**: Runs before plugin/module loading
- **`post-load`**: Runs after plugin/module loading

### Creating a Hook

```typescript
import { BaseHook, HookContext } from 'augx/utils/hook-system';

export class MyPreInspectionHook extends BaseHook {
  id = 'my-pre-inspection-hook';
  type = 'pre-inspection';
  priority = 10;

  async execute(context: HookContext): Promise<void> {
    console.log('Pre-inspection hook executed');
    console.log('Module:', context.module);
    console.log('Options:', context.options);
  }
}
```

### Registering a Hook

```typescript
import { pluginLoader } from 'augx/utils/plugin-system';
import { MyPreInspectionHook } from './my-hook';

const hook = new MyPreInspectionHook();
pluginLoader.registerHook(hook);
```

### Hook Context

```typescript
interface HookContext {
  module?: any;
  options?: any;
  data?: Record<string, any>;
  error?: Error;
}
```

---

## Command Reference

### `augx show module`

Inspect module structure, content, and files.

**Syntax:**

```bash
augx show module <module-name> [file-path] [options]
```

**Options:**

- `--json`: Output as JSON
- `--content`: Display aggregated content from all module files
- `--format <format>`: Output format (`json`, `markdown`, `text`)
- `--depth <number>`: Recursion depth for submodules (max 5)
- `--filter <pattern>`: Filter files by glob pattern
- `--search <term>`: Search within module content
- `--page <number>`: Page number for paginated output
- `--page-size <number>`: Number of items per page
- `--no-cache`: Disable caching
- `--secure`: Redact sensitive data

**Examples:**

```bash
# Basic inspection
augx show module typescript-standards

# JSON output
augx show module php-standards --json

# View specific file
augx show module react-patterns rules/hooks.md

# Search within module
augx show module openspec --search "workflow"

# Filter files
augx show module beads --filter "*.md"
```

---

## Troubleshooting

### Module Not Found

**Problem:** `Module not found: <module-name>`

**Solution:**
1. Check module name spelling
2. Run `augx list` to see available modules
3. Verify module exists in `augment-extensions/` directory

### Configuration Errors

**Problem:** Invalid configuration file

**Solution:**
1. Validate JSON syntax
2. Check configuration schema
3. Regenerate default config: `augx config generate`

### Plugin Loading Errors

**Problem:** Plugin fails to load

**Solution:**
1. Check plugin file syntax
2. Verify plugin implements required interface
3. Check plugin directory path in configuration
4. Review plugin initialization code

### Hook Execution Timeout

**Problem:** Hook execution times out

**Solution:**
1. Increase `hooks.timeout` in configuration
2. Optimize hook execution code
3. Disable problematic hooks

### Performance Issues

**Problem:** Slow module inspection

**Solution:**
1. Enable caching: `"cache": true`
2. Reduce `maxDepth` value
3. Use `--filter` to limit files
4. Disable unnecessary plugins/hooks

---

## Advanced Usage

### Programmatic API

```typescript
import { pluginLoader } from 'augx/utils/plugin-system';
import { configManager } from 'augx/utils/config-system';

// Load configuration
const config = configManager.load();

// Register custom handler
const handler = new MyCustomHandler();
pluginLoader.registerHandler(handler);

// Execute hooks
await pluginLoader.executeHooks('pre-inspection', {
  module: myModule,
  options: {}
});
```

### Custom Configuration Path

```typescript
import { ConfigManager } from 'augx/utils/config-system';

const configManager = new ConfigManager('.custom/path/augment.json');
const config = configManager.load();
```

---

## See Also

- [Plugin System API](./PLUGIN_SYSTEM.md)
- [Hook System API](./HOOK_SYSTEM.md)
- [Configuration Reference](./CONFIGURATION.md)
- [Module System](./MODULE_SYSTEM.md)

