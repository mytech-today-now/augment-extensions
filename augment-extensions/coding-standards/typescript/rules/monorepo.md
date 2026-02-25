# Monorepo Patterns and Configuration

Comprehensive guide to TypeScript monorepo setup, configuration, and best practices using modern tools like Turborepo and Nx.

## Table of Contents
- [Why Monorepos?](#why-monorepos)
- [Turborepo Configuration](#turborepo-configuration)
- [Nx Workspace Setup](#nx-workspace-setup)
- [Shared TypeScript Configuration](#shared-typescript-configuration)
- [Package Dependencies](#package-dependencies)
- [Build Orchestration](#build-orchestration)
- [Testing in Monorepos](#testing-in-monorepos)
- [Best Practices](#best-practices)

---

## Why Monorepos?

### Benefits

**Code Sharing**
- Share TypeScript types across packages
- Reuse utilities and components
- Atomic changes across multiple packages
- Single source of truth for shared code

**Developer Experience**
- Single `git clone` for entire codebase
- Unified tooling and configuration
- Easier refactoring across boundaries
- Consistent dependency versions

**Build Optimization**
- Incremental builds (only changed packages)
- Parallel task execution
- Shared build cache
- Faster CI/CD pipelines

### When to Use Monorepos

✅ **Good fit:**
- Multiple related packages/apps
- Shared component libraries
- Microservices with shared types
- Full-stack applications (frontend + backend)

❌ **Not ideal:**
- Single application with no shared code
- Completely independent projects
- Teams with different tech stacks

---

## Turborepo Configuration

### Installation

```bash
# Create new Turborepo
npx create-turbo@latest

# Or add to existing monorepo
npm install turbo --save-dev
```

### Basic Structure

```
my-monorepo/
├── apps/
│   ├── web/              # Next.js app
│   ├── api/              # Express API
│   └── admin/            # Admin dashboard
├── packages/
│   ├── ui/               # Shared UI components
│   ├── config/           # Shared configs
│   ├── tsconfig/         # Shared TypeScript configs
│   └── types/            # Shared TypeScript types
├── turbo.json            # Turborepo configuration
├── package.json          # Root package.json
└── pnpm-workspace.yaml   # Workspace configuration
```

### turbo.json Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### Key Concepts

**Pipeline Tasks**
- `dependsOn: ["^build"]` - Run dependencies' build first
- `outputs` - Files to cache
- `cache: false` - Disable caching for dev/test tasks
- `persistent: true` - Keep task running (dev servers)

**Task Execution**

```bash
# Run build in all packages
turbo run build

# Run build in specific package
turbo run build --filter=@myapp/web

# Run with dependencies
turbo run build --filter=@myapp/web...

# Parallel execution
turbo run lint test type-check --parallel
```

---

## Nx Workspace Setup

### Installation

```bash
# Create new Nx workspace
npx create-nx-workspace@latest

# Add Nx to existing monorepo
npm install -D nx @nx/workspace
```

### Workspace Structure

```
my-nx-workspace/
├── apps/
│   ├── web/
│   └── api/
├── libs/
│   ├── shared/
│   │   ├── ui/
│   │   ├── data-access/
│   │   └── utils/
│   └── feature/
│       ├── auth/
│       └── dashboard/
├── nx.json
├── workspace.json
└── tsconfig.base.json
```

### nx.json Configuration

```json
{
  "extends": "nx/presets/npm.json",
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json"
    ],
    "sharedGlobals": []
  }
}
```

### Project Configuration

```json
// apps/web/project.json
{
  "name": "web",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/web/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/web"
      }
    },
    "serve": {
      "executor": "@nx/next:server",
      "options": {
        "buildTarget": "web:build",
        "dev": true
      }
    }
  },
  "tags": ["type:app", "scope:web"]
}
```

### Nx Commands

```bash
# Run target for specific project
nx build web

# Run target for all affected projects
nx affected:build

# Show dependency graph
nx graph

# Run tasks in parallel
nx run-many --target=build --all --parallel=3
```

---

## Shared TypeScript Configuration

### Base Configuration

```json
// packages/tsconfig/base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist", ".turbo"]
}
```

### React Configuration

```json
// packages/tsconfig/react.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ESNext"]
  }
}
```

### Next.js Configuration

```json
// packages/tsconfig/nextjs.json
{
  "extends": "./react.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "noEmit": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Node.js Configuration

```json
// packages/tsconfig/node.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### Library Configuration

```json
// packages/tsconfig/library.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### Usage in Packages

```json
// apps/web/tsconfig.json
{
  "extends": "@myapp/tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@myapp/ui": ["../../packages/ui/src"],
      "@myapp/types": ["../../packages/types/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Package Dependencies

### Internal Dependencies

**Using Workspace Protocol (pnpm)**

```json
// apps/web/package.json
{
  "name": "@myapp/web",
  "dependencies": {
    "@myapp/ui": "workspace:*",
    "@myapp/types": "workspace:*",
    "@myapp/utils": "workspace:*"
  }
}
```

**Using File Protocol (npm/yarn)**

```json
{
  "dependencies": {
    "@myapp/ui": "file:../../packages/ui",
    "@myapp/types": "file:../../packages/types"
  }
}
```

### Dependency Management

**Root package.json**

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "typescript": "^5.6.0",
    "turbo": "^2.0.0",
    "@types/node": "^20.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check"
  }
}
```

### Version Synchronization

**Using syncpack**

```bash
# Install syncpack
npm install -D syncpack

# Check for version mismatches
npx syncpack list-mismatches

# Fix version mismatches
npx syncpack fix-mismatches
```

**syncpack.config.js**

```javascript
module.exports = {
  source: ['package.json', 'apps/*/package.json', 'packages/*/package.json'],
  versionGroups: [
    {
      label: 'Use workspace protocol for internal packages',
      packages: ['**'],
      dependencies: ['@myapp/**'],
      dependencyTypes: ['prod', 'dev'],
      pinVersion: 'workspace:*'
    }
  ]
};
```

---

## Build Orchestration

### Turborepo Build Pipeline

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "env": ["NODE_ENV"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Nx Task Pipeline

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "outputs": ["{projectRoot}/dist"],
      "cache": true
    }
  }
}
```

### Parallel Execution

```bash
# Turborepo - automatic parallelization
turbo run build

# Nx - explicit parallelization
nx run-many --target=build --all --parallel=5

# Run only affected projects
nx affected:build --base=main
```

---

## Testing in Monorepos

### Shared Test Configuration

```typescript
// packages/config/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.spec.ts', '**/*.test.ts', '**/dist/**']
    }
  }
});
```

### Package-Specific Tests

```typescript
// apps/web/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@myapp/config/vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts']
    }
  })
);
```

### Running Tests

```bash
# Run all tests
turbo run test

# Run tests for affected packages
nx affected:test

# Run tests with coverage
turbo run test -- --coverage
```

---

## Best Practices

### 1. Use Consistent Naming

```
✅ Good:
@myapp/ui
@myapp/types
@myapp/utils

❌ Bad:
ui-components
shared-types
common-utils
```

### 2. Organize by Type and Scope

```
packages/
├── ui/              # Shared UI components
├── types/           # Shared TypeScript types
├── utils/           # Shared utilities
└── config/          # Shared configurations

apps/
├── web/             # Customer-facing web app
├── admin/           # Admin dashboard
└── api/             # Backend API
```

### 3. Use Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@myapp/ui": ["../../packages/ui/src"],
      "@myapp/types": ["../../packages/types/src"],
      "@myapp/utils": ["../../packages/utils/src"]
    }
  }
}
```

### 4. Leverage Caching

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],
      "cache": true
    }
  }
}
```

### 5. Use Changesets for Versioning

```bash
# Install changesets
npm install -D @changesets/cli

# Initialize
npx changeset init

# Create changeset
npx changeset

# Version packages
npx changeset version

# Publish
npx changeset publish
```

---

## Common Pitfalls

### ❌ Circular Dependencies

```typescript
// packages/ui/src/Button.tsx
import { formatDate } from '@myapp/utils';

// packages/utils/src/format.ts
import { Button } from '@myapp/ui'; // ❌ Circular dependency!
```

**Solution:** Extract shared code to a separate package.

### ❌ Missing Build Dependencies

```json
// ❌ Bad: Missing dependency
{
  "pipeline": {
    "test": {
      "outputs": ["coverage/**"]
    }
  }
}

// ✅ Good: Explicit dependency
{
  "pipeline": {
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### ❌ Inconsistent TypeScript Versions

```bash
# Check for version mismatches
npx syncpack list-mismatches

# Fix mismatches
npx syncpack fix-mismatches
```

---

## Migration Guide

### From Single Package to Monorepo

1. **Create monorepo structure**
```bash
mkdir -p apps/web packages/ui packages/types
```

2. **Move existing code**
```bash
mv src apps/web/src
mv package.json apps/web/package.json
```

3. **Create root package.json**
```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

4. **Install Turborepo**
```bash
npm install -D turbo
```

5. **Create turbo.json**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Nx Documentation](https://nx.dev)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Changesets](https://github.com/changesets/changesets)
- [syncpack](https://github.com/JamieMason/syncpack)


