# Modern TypeScript Tooling

Comprehensive guide to modern TypeScript tooling including ESLint flat config, Biome, tsup, and Vitest with MSW.

## Table of Contents
- [ESLint Flat Config](#eslint-flat-config)
- [Biome Setup](#biome-setup)
- [tsup Configuration](#tsup-configuration)
- [Vitest + MSW Setup](#vitest--msw-setup)
- [Tool Comparison](#tool-comparison)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## ESLint Flat Config

### Overview

ESLint 9+ introduces a new "flat config" format that replaces `.eslintrc.*` files with `eslint.config.js`.

### Benefits

- **Simpler configuration** - Single file, no cascading
- **Better TypeScript support** - Native ESM support
- **Improved performance** - Faster config resolution
- **Type-safe** - Can use TypeScript for config

### Basic Setup

```bash
# Install ESLint 9+
npm install -D eslint@^9.0.0

# Install TypeScript plugin
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Install additional plugins
npm install -D eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks
```

### eslint.config.js

```javascript
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Ignore patterns
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/coverage/**'
    ]
  },

  // Base JavaScript config
  js.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'import': importPlugin,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports'
      }],

      // Import rules
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },

  // Test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
];
```

### TypeScript Config (eslint.config.ts)

```typescript
import type { Linter } from 'eslint';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const config: Linter.FlatConfig[] = [
  {
    ignores: ['**/dist/**', '**/build/**', '**/.next/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
];

export default config;
```

### Running ESLint

```bash
# Lint files
npx eslint .

# Lint and fix
npx eslint . --fix

# Lint specific files
npx eslint src/**/*.ts
```

---

## Biome Setup

### Overview

Biome is a fast, all-in-one toolchain that replaces ESLint + Prettier with a single tool written in Rust.

### Benefits

- **10-100x faster** than ESLint + Prettier
- **Single tool** - Linting + formatting in one
- **Zero config** - Works out of the box
- **Better error messages** - Clear, actionable diagnostics
- **Import sorting** - Built-in import organization

### Installation

```bash
# Install Biome
npm install -D @biomejs/biome

# Initialize configuration
npx @biomejs/biome init
```

### biome.json Configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn",
        "noArrayIndexKey": "warn"
      },
      "style": {
        "useConst": "error",
        "useTemplate": "warn",
        "noNonNullAssertion": "warn"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  },
  "json": {
    "formatter": {
      "enabled": true,
      "indentWidth": 2
    }
  },
  "files": {
    "ignore": [
      "node_modules",
      "dist",
      "build",
      ".next",
      "coverage",
      "*.config.js"
    ],
    "include": [
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.js",
      "src/**/*.jsx"
    ]
  }
}
```

### Running Biome

```bash
# Check (lint + format check)
npx @biomejs/biome check .

# Check and fix
npx @biomejs/biome check --apply .

# Format only
npx @biomejs/biome format --write .

# Lint only
npx @biomejs/biome lint .

# CI mode (no fixes)
npx @biomejs/biome ci .
```

### package.json Scripts

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "ci": "biome ci ."
  }
}
```

### VS Code Integration

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

---

## tsup Configuration

### Overview

tsup is a zero-config TypeScript bundler powered by esbuild, perfect for building libraries.

### Benefits

- **Zero config** - Works out of the box
- **Fast** - Powered by esbuild
- **Multiple formats** - ESM, CJS, IIFE
- **Type declarations** - Automatic .d.ts generation
- **Tree-shaking** - Dead code elimination

### Installation

```bash
npm install -D tsup
```

### Basic Configuration

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true
});
```

### Advanced Configuration

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    utils: 'src/utils/index.ts'
  },

  // Output formats
  format: ['cjs', 'esm'],

  // Type declarations
  dts: {
    resolve: true,
    entry: './src/index.ts'
  },

  // Code splitting
  splitting: true,

  // Source maps
  sourcemap: true,

  // Clean output directory
  clean: true,

  // Minification
  minify: process.env.NODE_ENV === 'production',

  // Tree-shaking
  treeshake: true,

  // External dependencies
  external: ['react', 'react-dom'],

  // Target environment
  target: 'es2020',

  // Platform
  platform: 'node',

  // Bundle
  bundle: true,

  // Watch mode
  watch: process.env.NODE_ENV === 'development',

  // Shims
  shims: true,

  // Banner
  banner: {
    js: '#!/usr/bin/env node'
  },

  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production'
  },

  // esbuild options
  esbuildOptions(options) {
    options.footer = {
      js: '// Built with tsup'
    };
  }
});
```

### Library package.json

```json
{
  "name": "@mylib/core",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs",
      "types": "./dist/utils.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build"
  }
}
```

---

## Vitest + MSW Setup

### Overview

Vitest is a blazing-fast unit test framework powered by Vite. MSW (Mock Service Worker) provides API mocking for tests.

### Benefits

**Vitest:**
- **Fast** - Powered by Vite
- **Compatible** - Jest-compatible API
- **TypeScript** - First-class TypeScript support
- **Watch mode** - Instant feedback
- **Coverage** - Built-in coverage with v8

**MSW:**
- **Realistic** - Intercepts actual HTTP requests
- **Reusable** - Same mocks for tests and development
- **Type-safe** - Full TypeScript support
- **Framework-agnostic** - Works with any test framework

### Installation

```bash
# Install Vitest
npm install -D vitest @vitest/ui

# Install MSW
npm install -D msw

# Install testing utilities
npm install -D @testing-library/react @testing-library/jest-dom
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./test/setup.ts'],

    // Globals
    globals: true,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },

    // Include/exclude
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],

    // Reporters
    reporters: ['verbose'],

    // Watch
    watch: false,

    // Threads
    threads: true,

    // Timeout
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Test Setup (test/setup.ts)

```typescript
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
```

### MSW Handlers (test/mocks/handlers.ts)

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET request
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]);
  }),

  // POST request
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json(
      { id: 3, ...newUser },
      { status: 201 }
    );
  }),

  // Error response
  http.get('/api/error', () => {
    return HttpResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  // Delayed response
  http.get('/api/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({ data: 'slow response' });
  })
];
```

### MSW Server (test/mocks/server.ts)

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Example Test

```typescript
// src/api/users.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { UserList } from './UserList';

describe('UserList', () => {
  it('renders users from API', async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    // Override handler for this test
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { message: 'Failed to fetch' },
          { status: 500 }
        );
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
    });
  });

  it('handles empty response', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json([]);
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
});
```

### Running Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run tests with UI
npm test -- --ui

# Run specific test file
npm test -- src/api/users.test.ts
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=junit --reporter=default"
  }
}
```

---

## Tool Comparison

### ESLint vs Biome

| Feature | ESLint | Biome |
|---------|--------|-------|
| **Speed** | Moderate | 10-100x faster |
| **Configuration** | Complex | Simple |
| **Formatting** | Requires Prettier | Built-in |
| **Import sorting** | Plugin required | Built-in |
| **Ecosystem** | Mature, many plugins | Growing |
| **TypeScript** | Good support | Excellent support |
| **Migration** | N/A | Easy from ESLint |

**When to use ESLint:**
- Need specific plugins not available in Biome
- Large existing codebase with custom rules
- Team familiar with ESLint ecosystem

**When to use Biome:**
- New projects
- Performance is critical
- Want simpler tooling
- Prefer all-in-one solution

### Jest vs Vitest

| Feature | Jest | Vitest |
|---------|------|--------|
| **Speed** | Moderate | Very fast |
| **Configuration** | Moderate | Minimal |
| **TypeScript** | Requires ts-jest | Native support |
| **ESM** | Limited | Full support |
| **Watch mode** | Good | Excellent |
| **Coverage** | Built-in | Built-in (v8) |
| **API** | Mature | Jest-compatible |

**When to use Jest:**
- Existing Jest tests
- Need specific Jest plugins
- Team familiar with Jest

**When to use Vitest:**
- New projects
- Using Vite
- Want faster tests
- Need better ESM support

### Webpack vs tsup

| Feature | Webpack | tsup |
|---------|---------|------|
| **Speed** | Moderate | Very fast |
| **Configuration** | Complex | Minimal |
| **Use case** | Applications | Libraries |
| **Bundle size** | Larger | Smaller |
| **Tree-shaking** | Good | Excellent |
| **Learning curve** | Steep | Gentle |

**When to use Webpack:**
- Building applications
- Need advanced features (code splitting, lazy loading)
- Complex build requirements

**When to use tsup:**
- Building libraries
- Want simple configuration
- Need fast builds
- Publishing to npm

---

## Migration Guide

### From ESLint Legacy to Flat Config

1. **Remove old config files**
```bash
rm .eslintrc.js .eslintrc.json .eslintignore
```

2. **Create eslint.config.js**
```javascript
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    // ... your rules
  }
];
```

3. **Update package.json**
```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

### From ESLint + Prettier to Biome

1. **Install Biome**
```bash
npm install -D @biomejs/biome
npm uninstall eslint prettier
```

2. **Initialize Biome**
```bash
npx @biomejs/biome init
```

3. **Migrate configuration**
```bash
npx @biomejs/biome migrate eslint --write
```

4. **Update scripts**
```json
{
  "scripts": {
    "lint": "biome check .",
    "format": "biome format --write ."
  }
}
```

### From Jest to Vitest

1. **Install Vitest**
```bash
npm install -D vitest @vitest/ui
npm uninstall jest @types/jest ts-jest
```

2. **Create vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
```

3. **Update test files**
```typescript
// Before (Jest)
import { describe, it, expect } from '@jest/globals';

// After (Vitest)
import { describe, it, expect } from 'vitest';
```

4. **Update package.json**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Best Practices

### 1. Use Flat Config for ESLint

```javascript
// ✅ Good: Flat config
export default [
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error'
    }
  }
];

// ❌ Bad: Legacy config
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

### 2. Enable Biome in VS Code

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

### 3. Configure tsup for Libraries

```typescript
// ✅ Good: Multiple formats
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
});

// ❌ Bad: Single format
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm']
});
```

### 4. Use MSW for API Mocking

```typescript
// ✅ Good: MSW handlers
export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }]);
  })
];

// ❌ Bad: Manual mocking
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ id: 1, name: 'John' }])
  })
);
```

### 5. Enable Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

### 6. Use Type-Safe Configs

```typescript
// ✅ Good: Type-safe config
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  // ... config
];

export default config;

// ❌ Bad: Untyped config
export default [
  // ... config
];
```

---

## Common Pitfalls

### ❌ Mixing ESLint Formats

```javascript
// Don't mix flat config with legacy config
export default [
  {
    extends: ['eslint:recommended'] // ❌ extends doesn't work in flat config
  }
];
```

### ❌ Forgetting to Clean Build Output

```typescript
// Always clean before building
export default defineConfig({
  clean: true // ✅ Clean dist/ before build
});
```

### ❌ Not Resetting MSW Handlers

```typescript
// Always reset handlers after each test
afterEach(() => {
  server.resetHandlers(); // ✅ Reset to default handlers
});
```

---

## References

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Biome Documentation](https://biomejs.dev)
- [tsup Documentation](https://tsup.egoist.dev)
- [Vitest Documentation](https://vitest.dev)
- [MSW Documentation](https://mswjs.io)





