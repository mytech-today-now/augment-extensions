# Module Inspection Commands

## Overview

The Augment CLI provides comprehensive module inspection commands to explore module structure, content, and files. These commands support multiple output formats, advanced filtering, and VS Code integration.

## Command Reference

### `augx show module <module-name> [file-path] [options]`

Inspect module structure, content, and files.

#### Arguments

- `<module-name>` (required) - Name of the module to inspect (e.g., `php-standards`, `coding-standards/typescript`)
- `[file-path]` (optional) - Path to specific file within module (e.g., `rules/psr-standards.md`)

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--json` | boolean | false | Output as JSON |
| `--content` | boolean | false | Display aggregated content from all module files |
| `--format <format>` | string | text | Output format: `json`, `markdown`, `text` |
| `--depth <number>` | number | 1 | Recursion depth for submodules (max 5) |
| `--filter <pattern>` | string | - | Filter files by glob pattern (e.g., `*.md`) |
| `--search <term>` | string | - | Search within module content |
| `--page <number>` | number | - | Page number for paginated output |
| `--page-size <number>` | number | 10 | Number of items per page |
| `--secure` | boolean | false | Redact sensitive data (API keys, passwords, tokens) |
| `--no-cache` | boolean | false | Bypass cache and force fresh read |
| `--open` | boolean | false | Open file in VS Code editor |
| `--preview` | boolean | false | Open file in VS Code preview pane |

## Usage Examples

### Basic Module Overview

Display module metadata and file listing:

```bash
augx show module php-standards
```

Output:
```
📦 coding-standards/php-standards

Version: 1.0.0
Type: coding-standards
Description: PHP coding standards with PSR compliance

Files (15):
  rules/
    ├── psr-standards.md (12.5 KB)
    ├── naming-conventions.md (8.3 KB)
    └── ...
  examples/
    └── web-application-example.php (15.2 KB)

Total Size: 156.8 KB
Character Count: ~45,000
```

### View Aggregated Content

Display all markdown files in the module:

```bash
augx show module php-standards --content
```

### View Specific File

Display individual file with line numbers:

```bash
augx show module php-standards rules/psr-standards.md
```

### JSON Output

Get machine-readable JSON output:

```bash
augx show module php-standards --json
```

Output:
```json
{
  "module": "coding-standards/php-standards",
  "metadata": {
    "version": "1.0.0",
    "type": "coding-standards",
    "description": "PHP coding standards with PSR compliance"
  },
  "files": [
    {
      "path": "rules/psr-standards.md",
      "size": 12800,
      "modified": "2026-01-28T20:00:00.000Z",
      "type": "rule"
    }
  ]
}
```

### Markdown Output

Export module content as Markdown:

```bash
augx show module php-standards --content --format markdown > php-standards.md
```

### Plain Text Output

Get ASCII-only output without colors:

```bash
augx show module php-standards --content --format text
```

### Filter Files

Show only specific file types:

```bash
augx show module php-standards --content --filter "*.md"
augx show module php-standards --content --filter "rules/*.md"
augx show module php-standards --content --filter "examples/*.php"
```

### Search Content

Search for specific terms within module:

```bash
augx show module php-standards --search "PSR-12"
augx show module php-standards --search "namespace"
```

### Pagination

Paginate large output:

```bash
augx show module php-standards --content --page 1 --page-size 5
augx show module php-standards --content --page 2 --page-size 5
```

### Secure Mode

Redact sensitive data from output:

```bash
augx show module my-config --secure
```

Redacts:
- `API_KEY=...`
- `SECRET=...`
- `TOKEN=...`
- `PASSWORD=...`

### Depth Control

Control recursion depth for nested modules:

```bash
augx show module parent-module --depth 1  # Only immediate children
augx show module parent-module --depth 3  # Up to 3 levels deep
```

### VS Code Integration

Open file directly in VS Code:

```bash
augx show module php-standards rules/psr-standards.md --open
```

Open in preview pane:

```bash
augx show module php-standards rules/psr-standards.md --preview
```

### Cache Control

Bypass cache for fresh data:

```bash
augx show module php-standards --no-cache
```

## Troubleshooting

### Module Not Found

**Error**: `Module not found: xyz`

**Solution**:
1. Check module name spelling
2. Use `augx list` to see all available modules
3. Ensure module exists in `augment-extensions/` directory

### File Not Found

**Error**: `File not found: rules/xyz.md`

**Solution**:
1. Check file path spelling
2. Use relative path from module root
3. Use `augx show module <name>` to see all files

### Invalid Format

**Error**: `Invalid format: xyz`

**Solution**:
Use one of the supported formats: `json`, `markdown`, `text`

### Performance Issues

**Symptoms**: Slow command execution

**Solutions**:
1. Use `--filter` to limit files
2. Use `--page-size` to limit output
3. Check cache is enabled (don't use `--no-cache` unnecessarily)
4. For large files, streaming is automatic (>1MB)

### Sensitive Data Exposure

**Symptoms**: API keys or passwords visible in output

**Solution**:
Always use `--secure` flag when inspecting configuration or credential files:

```bash
augx show module my-config --secure
```

## Advanced Usage

### Combining Options

```bash
# Search with pagination and JSON output
augx show module php-standards --search "PSR" --page 1 --page-size 10 --json

# Filter and export to Markdown
augx show module php-standards --filter "rules/*.md" --format markdown > rules.md

# Secure content view with specific format
augx show module my-config --content --secure --format text
```

### Scripting

Use in shell scripts:

```bash
#!/bin/bash
# Export all modules to Markdown
for module in $(augx list --json | jq -r '.[].name'); do
  augx show module "$module" --content --format markdown > "docs/${module}.md"
done
```

### CI/CD Integration

```yaml
# .github/workflows/docs.yml
- name: Generate module documentation
  run: |
    augx show module php-standards --format markdown > docs/php-standards.md
    augx show module typescript-standards --format markdown > docs/typescript-standards.md
```

## See Also

- [`augx list`](./list.md) - List all available modules
- [`augx search`](./search.md) - Search across all modules
- [`augx link`](./link.md) - Link modules to current project

