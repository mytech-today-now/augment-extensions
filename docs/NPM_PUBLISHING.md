# NPM Publishing Guide

Guide for publishing the `augx` CLI to npm.

## Prerequisites

1. **npm account**: Create account at https://www.npmjs.com/signup
2. **npm login**: Run `npm login` to authenticate
3. **Organization access**: Request access to `@mytechtoday` organization (or use your own)

## Package Information

- **Package name**: `@mytechtoday/augment-extensions`
- **Current version**: 0.1.0
- **Scope**: `@mytechtoday` (scoped package)
- **Access**: Public
- **Binary**: `augx` command

## Pre-Publishing Checklist

### 1. Build the CLI

```bash
npm run build
```

This compiles TypeScript to JavaScript in `cli/dist/`.

### 2. Test Locally

```bash
# Link package locally
npm link

# Test commands
augx list
augx search typescript
augx show typescript-standards

# Unlink when done
npm unlink -g @mytechtoday/augment-extensions
```

### 3. Verify Package Contents

```bash
# See what will be published
npm pack --dry-run

# Check files included
npm pack
tar -tzf mytechtoday-augment-extensions-0.1.0.tgz
rm mytechtoday-augment-extensions-0.1.0.tgz
```

### 4. Update Version

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

## Publishing Steps

### First-Time Publishing

```bash
# 1. Login to npm
npm login

# 2. Build the package
npm run build

# 3. Publish (first time)
npm publish --access public
```

### Subsequent Releases

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Build
npm run build

# 3. Publish
npm publish
```

## Post-Publishing

### 1. Verify Publication

```bash
# Check on npm
npm view @mytechtoday/augment-extensions

# Install globally to test
npm install -g @mytechtoday/augment-extensions

# Test
augx --version
augx list
```

### 2. Update Documentation

Update README.md with installation instructions:

```markdown
## Installation

\`\`\`bash
npm install -g @mytechtoday/augment-extensions
\`\`\`

## Usage

\`\`\`bash
augx list
augx search <keyword>
augx show <module>
augx link <module>
\`\`\`
```

### 3. Create GitHub Release

```bash
# Tag the release
git tag v0.1.0
git push origin v0.1.0

# Create release on GitHub
# Go to: https://github.com/mytech-today-now/augment/releases/new
```

## Troubleshooting

### Error: Package name already exists

- Change package name in `package.json`
- Or request access to existing package

### Error: Not logged in

```bash
npm login
```

### Error: No permission to publish

- Check organization membership
- Verify `publishConfig.access` is set to `public`

### Build errors

```bash
# Clean and rebuild
rm -rf cli/dist
npm run build
```

## Automation (Future)

### GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes

## Current Status

✅ Package configured for publishing
✅ Build scripts ready
✅ Binary (`augx`) configured
✅ Files list defined
✅ Public access configured

**Ready to publish!**

## Quick Publish Command

```bash
npm run build && npm publish --access public
```

