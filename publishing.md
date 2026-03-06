# Publishing Guide

This guide explains how to publish the Augment Extensions CLI to **npm** and **GitHub Packages**.

## Quick Start: Automated Publishing (Recommended)

The package automatically publishes to both registries when you push a git tag:

```bash
# After committing your changes
git tag -a v2.5.0 -m "Release v2.5.0"
git push origin main
git push origin v2.5.0
```

The GitHub Actions workflow (`.github/workflows/publish.yml`) will automatically:
1. Build the package
2. Publish to npm registry
3. Publish to GitHub Packages registry

### Required Secrets

Ensure `NPM_TOKEN` is set in your repository secrets:
- Go to: Repository Settings → Secrets and variables → Actions
- Add secret: `NPM_TOKEN` (your npm authentication token)
- `GITHUB_TOKEN` is automatically provided by GitHub Actions

---

## Publishing to GitHub Packages

### Installation from GitHub Packages

Users can install from GitHub Packages by creating `.npmrc` in their project:

```
@mytech-today-now:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install:

```bash
npm install @mytech-today-now/augment-extensions
```

### Manual Publishing to GitHub Packages

If you need to publish manually:

```bash
npm run build
npm publish --registry=https://npm.pkg.github.com
```

Make sure you have a `.npmrc` file with your GitHub token (see Manual Setup below).

---

## Manual Publishing to npm

### Prerequisites

1. **npm account**: Create one at https://www.npmjs.com/signup
2. **npm CLI**: Installed with Node.js
3. **Git repository**: Code should be committed and pushed to GitHub
4. **Build tools**: TypeScript compiler installed

### One-Time Setup

#### 1. Create npm Account (if you don't have one)

```bash
npm adduser
# Or login if you already have an account
npm login
```

Enter your:
- Username
- Password
- Email (this will be public)
- One-time password (if 2FA is enabled)

#### 2. Verify Login

```bash
npm whoami
```

This should display your npm username.

#### 3. Setup Authentication for Both Registries

Copy the example configuration:

```bash
cp .npmrc.example .npmrc
```

Edit `.npmrc` and replace the tokens:

```
registry=https://registry.npmjs.org/
@mytech-today-now:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN_HERE
//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN_HERE
```

**⚠️ Never commit `.npmrc` to git!** It's already in `.gitignore`.

**Getting tokens:**
- **npm Token**: Create at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
- **GitHub Token**: Create a Personal Access Token (classic) with `write:packages` scope at https://github.com/settings/tokens

Or use your personal scope:
```json
"name": "@YOUR-USERNAME/augment-extensions"
```

## Publishing Steps

### Step 1: Prepare the Code

```bash
# Make sure all changes are committed
git status

# Commit any pending changes
git add .
git commit -m "Prepare for npm publish"
git push
```

### Step 2: Build the Project

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Verify dist/ folder was created
ls dist/
```

### Step 3: Test the Package Locally (Optional)

```bash
# Create a tarball to see what will be published
npm pack

# This creates a .tgz file - inspect it
tar -tzf augment-extensions-cli-0.1.0.tgz

# Test install locally
npm install -g ./augment-extensions-cli-0.1.0.tgz

# Test the CLI
augx --version

# Uninstall test version
npm uninstall -g @augment-extensions/cli
```

### Step 4: Run Tests (if available)

```bash
npm test
```

### Step 5: Publish to npm

```bash
# Dry run to see what will be published (recommended first time)
npm publish --dry-run

# Actually publish
npm publish
```

If you get an error about the package name being taken, you'll need to:
1. Change the package name in `package.json`
2. Or use your personal scope: `@YOUR-USERNAME/augment-extensions`

### Step 6: Verify Publication

```bash
# Check on npm website
# https://www.npmjs.com/package/@augment-extensions/cli

# Or install it globally to test
npm install -g @augment-extensions/cli

# Test it works
augx --version
augx list
```

## Updating/Publishing New Versions

### 1. Update Version Number

Use npm's version command (automatically creates git tag):

```bash
# Patch version (0.1.0 -> 0.1.1) - bug fixes
npm version patch

# Minor version (0.1.0 -> 0.2.0) - new features
npm version minor

# Major version (0.1.0 -> 1.0.0) - breaking changes
npm version major
```

This will:
- Update `package.json` version
- Create a git commit
- Create a git tag

### 2. Push Changes

```bash
git push
git push --tags
```

### 3. Publish

```bash
npm publish
```

## Troubleshooting

### "You do not have permission to publish"

- Make sure you're logged in: `npm whoami`
- Make sure the organization exists or use your personal scope
- Check `publishConfig.access` is set to `"public"` in package.json

### "Package name already exists"

- Change the package name in `package.json`
- Use a scoped package: `@YOUR-USERNAME/package-name`

### "No README data found"

- Make sure `README.md` exists in the root directory
- It will be automatically included in the npm package

### Build fails

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## Best Practices

1. **Always test before publishing**: Use `npm publish --dry-run`
2. **Use semantic versioning**: Follow semver.org guidelines
3. **Update CHANGELOG**: Document changes between versions
4. **Tag releases**: Use git tags for version tracking
5. **Test installation**: Install globally and test CLI works
6. **Keep augment-extensions/ updated**: Ensure all extension modules are current

## Files Included in npm Package

The following files are included (see `package.json` "files" field):
- `dist/` - Compiled JavaScript
- `augment-extensions/` - Extension modules
- `README.md` - Documentation
- `LICENSE` - License file
- `AGENTS.md` - AI agent integration
- `modules.md` - Module catalog

Files excluded (see `.npmignore`):
- `.augment/` - Project-specific rules
- `.beads/` - Task tracking
- `openspec/` - Specifications
- `tests/` - Test files
- `cli/src/` - TypeScript source (only compiled dist/ is included)

## Post-Publication

After publishing:

1. **Announce**: Share on social media, forums, etc.
2. **Monitor**: Watch for issues on GitHub
3. **Update docs**: Keep README.md current
4. **Add badges**: Add npm version badge to README
5. **Create releases**: Use GitHub releases for major versions

## npm Badge for README

Add this to your README.md:

```markdown
[![npm version](https://badge.fury.io/js/%40augment-extensions%2Fcli.svg)](https://www.npmjs.com/package/@augment-extensions/cli)
[![npm downloads](https://img.shields.io/npm/dm/@augment-extensions/cli.svg)](https://www.npmjs.com/package/@augment-extensions/cli)
```

