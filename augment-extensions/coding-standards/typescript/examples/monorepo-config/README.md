# Monorepo Configuration Examples

This directory contains example configuration files for setting up a TypeScript monorepo using Turborepo.

## Files

- **turbo.json** - Turborepo pipeline configuration
- **pnpm-workspace.yaml** - pnpm workspace configuration
- **package.json** - Root package.json with scripts
- **tsconfig.base.json** - Base TypeScript configuration

## Usage

1. Copy these files to your monorepo root
2. Install dependencies: `pnpm install`
3. Create your apps and packages directories
4. Run `turbo run build` to build all packages

## Directory Structure

```
my-monorepo/
├── apps/
│   ├── web/              # Next.js app
│   └── api/              # Express API
├── packages/
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configurations
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

## Commands

- `pnpm build` - Build all packages
- `pnpm dev` - Start all dev servers
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests
- `pnpm type-check` - Type check all packages

## Learn More

See the main monorepo.md guide for detailed documentation.

