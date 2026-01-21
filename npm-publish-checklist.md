# npm Publishing Checklist

Quick checklist for publishing Augment Extensions to npm.

## ✅ Pre-Publishing Checklist

### One-Time Setup
- [ ] Create npm account at https://www.npmjs.com/signup
- [ ] Login to npm: `npm login`
- [ ] Verify login: `npm whoami`
- [ ] Create npm organization "augment-extensions" (or use personal scope)
- [ ] Update `package.json` repository URL with your GitHub username

### Before Each Publish
- [ ] All code changes committed to git
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Version number updated: `npm version patch|minor|major`
- [ ] CHANGELOG.md updated (if exists)
- [ ] README.md is current
- [ ] Module character counts are accurate

## 📦 Publishing Steps

### 1. Prepare
```bash
# Ensure clean working directory
git status

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Test Locally (Optional but Recommended)
```bash
# Create test package
npm pack

# Install locally
npm install -g ./augment-extensions-cli-0.1.0.tgz

# Test CLI
augx --version
augx list

# Uninstall test
npm uninstall -g @augment-extensions/cli
```

### 3. Dry Run
```bash
# See what will be published
npm publish --dry-run
```

### 4. Publish
```bash
# Actually publish to npm
npm publish
```

### 5. Verify
```bash
# Check npm website
# https://www.npmjs.com/package/@augment-extensions/cli

# Install and test
npm install -g @augment-extensions/cli
augx --version
```

### 6. Tag and Push
```bash
# Push version tag to GitHub
git push
git push --tags
```

## 🔄 Updating Versions

### Patch (0.1.0 → 0.1.1) - Bug fixes
```bash
npm version patch
git push && git push --tags
npm publish
```

### Minor (0.1.0 → 0.2.0) - New features
```bash
npm version minor
git push && git push --tags
npm publish
```

### Major (0.1.0 → 1.0.0) - Breaking changes
```bash
npm version major
git push && git push --tags
npm publish
```

## 🚨 Common Issues

### "You do not have permission to publish"
**Solution**: 
- Run `npm whoami` to verify login
- Check organization exists or use personal scope
- Verify `publishConfig.access: "public"` in package.json

### "Package name already exists"
**Solution**:
- Change package name in `package.json`
- Use scoped package: `@YOUR-USERNAME/augment-extensions`

### "No README data found"
**Solution**:
- Ensure `README.md` exists in root
- Check it's not in `.npmignore`

### Build fails
**Solution**:
```bash
rm -rf dist/ node_augment-extensions/
npm install
npm run build
```

## 📋 What Gets Published

### ✅ Included
- `dist/` - Compiled JavaScript
- `augment-extensions/` - Extension modules
- `README.md`
- `LICENSE`
- `AGENTS.md`
- `modules.md`

### ❌ Excluded (via .npmignore)
- `.augment/` - Project-specific
- `.beads/` - Project-specific
- `openspec/` - Project-specific
- `tests/` - Test files
- `cli/src/` - TypeScript source
- Development files

## 🎯 Quick Commands

```bash
# First time publish
npm login
npm run build
npm publish --dry-run
npm publish

# Update and republish
npm version patch
git push && git push --tags
npm publish

# Test installation
npm install -g @augment-extensions/cli
augx --version
```

## 📝 Post-Publish

- [ ] Verify package on npm website
- [ ] Test global installation
- [ ] Create GitHub release
- [ ] Update documentation
- [ ] Announce on social media
- [ ] Monitor for issues

---

**See publishing.md for detailed instructions.**

