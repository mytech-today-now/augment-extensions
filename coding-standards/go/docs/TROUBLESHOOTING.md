# Troubleshooting Guide

## Common Issues

### Configuration Issues

#### Configuration File Not Found

**Problem:** Module doesn't load configuration

**Solution:**
1. Ensure file is at `.augment/go-config.json`
2. Check file permissions (must be readable)
3. Verify JSON syntax is valid

```bash
# Validate JSON syntax
cat .augment/go-config.json | jq .
```

#### Invalid Category Name

**Problem:** Category not recognized

**Solution:**
Valid categories are:
- `web`
- `microservices`
- `cli`
- `cloud`
- `distributed`
- `devops`
- `api`

Check spelling and case sensitivity.

---

### Rule Application Issues

#### Rules Not Being Applied

**Problem:** AI not following Go standards

**Solution:**
1. Verify `rules.enabled` is `true` in configuration
2. Check category selection matches your project type
3. Ensure rule files exist in `rules/` directory
4. Verify module is loaded in Augment Extensions

#### Conflicting Rules

**Problem:** Multiple categories have conflicting guidance

**Solution:**
1. Universal rules always apply first
2. Category-specific rules override when conflicts occur
3. Later categories in the list take precedence
4. Consider using fewer, more specific categories

---

### Static Analysis Issues

#### golangci-lint Not Running

**Problem:** Linter not executing

**Solution:**
```bash
# Install golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Verify installation
golangci-lint --version

# Run manually
golangci-lint run
```

#### go vet Errors

**Problem:** `go vet` reports issues

**Solution:**
```bash
# Run go vet to see specific issues
go vet ./...

# Common fixes:
# - Remove unused variables
# - Fix Printf format strings
# - Address suspicious constructs
```

---

### Example Validation Issues

#### Examples Don't Compile

**Problem:** Example code fails to build

**Solution:**
```bash
# Check Go version (requires 1.18+)
go version

# Update dependencies
go mod tidy

# Build specific example
go build examples/web/http-server.go
```

#### Formatting Issues

**Problem:** Code not properly formatted

**Solution:**
```bash
# Format all Go files
gofmt -w .

# Or use goimports (includes import management)
goimports -w .
```

---

### Integration Issues

#### Module Not Appearing in Augment

**Problem:** Module not visible in Augment Extensions

**Solution:**
1. Verify `module.json` exists and is valid
2. Check module is in `augment-extensions/coding-standards/go/`
3. Restart Augment Code AI
4. Check Augment Extensions catalog

#### AI Not Using Templates

**Problem:** Generated code doesn't follow templates

**Solution:**
1. Verify templates exist in `templates/` directory
2. Check template format matches specification
3. Ensure category is selected in configuration
4. Try regenerating with explicit category mention

---

### Performance Issues

#### Slow Rule Loading

**Problem:** Module takes long to load

**Solution:**
1. Reduce number of selected categories
2. Disable unused static analysis tools
3. Check for large rule files (should be < 5KB each)

---

### Testing Issues

#### Unit Tests Failing

**Problem:** Module tests don't pass

**Solution:**
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test tests/unit/module-structure.test.ts

# Check test dependencies
npm install
```

#### Integration Tests Failing

**Problem:** Integration tests fail

**Solution:**
1. Verify all required files exist
2. Check file permissions
3. Ensure module structure matches specification
4. Review test output for specific failures

---

## Getting Help

### Check Documentation

1. [README.md](../README.md) - Module overview
2. [CONFIGURATION.md](./CONFIGURATION.md) - Configuration guide
3. [CATEGORIES.md](./CATEGORIES.md) - Category details

### Validate Your Setup

```bash
# Run validation script
./tests/validate-examples.sh

# Or on Windows
.\tests\validate-examples.ps1
```

### Debug Mode

Enable verbose logging:

```json
{
  "debug": true,
  "logging": {
    "level": "debug"
  }
}
```

### Report Issues

If problems persist:
1. Check existing issues in repository
2. Gather error messages and logs
3. Include configuration file
4. Describe expected vs actual behavior
5. Submit issue with details

---

## Best Practices

### Avoid Common Mistakes

1. **Don't mix too many categories** - Use 2-3 maximum
2. **Don't disable universal rules** - They're essential
3. **Don't skip static analysis** - Catches issues early
4. **Don't ignore warnings** - They indicate potential problems

### Recommended Workflow

1. Start with single category
2. Add universal rules
3. Enable static analysis
4. Test with examples
5. Gradually add more categories if needed

---

## Quick Fixes

### Reset Configuration

```bash
# Remove configuration
rm .augment/go-config.json

# Use default configuration
cp augment-extensions/coding-standards/go/config/examples/web-service.json .augment/go-config.json
```

### Reinstall Module

```bash
# Remove and reinstall
rm -rf augment-extensions/coding-standards/go
git checkout augment-extensions/coding-standards/go
```

### Clear Cache

```bash
# Clear Augment cache (if applicable)
rm -rf .augment/cache
```

