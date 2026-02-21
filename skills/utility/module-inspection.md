---
id: module-inspection
name: Module Inspection
version: 1.0.0
category: utility
tags: [modules, inspection, metadata, content, cli]
tokenBudget: 3500
priority: high
dependencies: []
cliCommand: augx-show-module
---

# Module Inspection

## Purpose

Inspect Augment Extension modules to explore structure, metadata, content, and files. Supports multiple output formats, filtering, search, and VS Code integration.

## Usage

1. **Specify module**: Provide module name (e.g., `php-standards`, `coding-standards/typescript`)
2. **Choose operation**: List files, view content, search, or inspect metadata
3. **Apply filters**: Filter by file type, search terms, or pagination
4. **Select format**: JSON, Markdown, or text output

**Operations**:
- Metadata inspection: Module version, type, description, dependencies
- File listing: All files with sizes, types, and modification dates
- Content aggregation: View all markdown files in module
- Search: Find specific terms within module content
- Filtering: Show only specific file types or patterns

## Examples

### Example 1: View Module Metadata

```bash
augx show module php-standards
```

**Result**:
```
Module: coding-standards/php-standards
Version: 1.0.0
Type: coding-standards
Description: PHP coding standards with PSR compliance

Files:
  rules/psr-standards.md (12.5 KB)
  rules/security.md (8.3 KB)
  examples/controller.php (4.2 KB)

Total Size: 156.8 KB
Character Count: ~45,000
```

### Example 2: View Aggregated Content

```bash
augx show module php-standards --content
```

**Result**: Displays all markdown files with syntax highlighting and line numbers.

### Example 3: Search Module Content

```bash
augx show module php-standards --search "PSR-12"
```

**Result**: Shows all occurrences of "PSR-12" with context.

### Example 4: JSON Output for Scripting

```bash
augx show module php-standards --json
```

**Result**:
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

### Example 5: Filter by File Type

```bash
augx show module php-standards --content --filter "rules/*.md"
```

**Result**: Shows only markdown files in the rules/ directory.

### Example 6: Secure Mode (Redact Sensitive Data)

```bash
augx show module my-config --secure
```

**Result**: Redacts API keys, secrets, tokens, and passwords from output.

## CLI

### Command Syntax

```bash
augx show module <module-name> [file-path] [options]
```

### Arguments

- `<module-name>` (required) - Module to inspect
- `[file-path]` (optional) - Specific file within module

### Options

- `--content` - Show aggregated content
- `--json` - JSON output format
- `--format <format>` - Output format: json, markdown, text
- `--filter <pattern>` - Filter files by glob pattern
- `--search <term>` - Search for term in content
- `--page <number>` - Page number for pagination
- `--page-size <size>` - Items per page (default: 10)
- `--secure` - Redact sensitive data
- `--depth <number>` - Recursion depth for nested modules
- `--no-cache` - Disable caching
- `--open` - Open file in VS Code
- `--preview` - Open in VS Code preview pane

### Examples

```bash
# Basic inspection
augx show module typescript-standards

# View all content
augx show module typescript-standards --content

# Search within module
augx show module typescript-standards --search "interface"

# JSON output for scripting
augx show module typescript-standards --json > output.json

# Filter and export
augx show module typescript-standards --filter "rules/*.md" --format markdown > rules.md

# Secure mode for configs
augx show module my-config --secure

# Open in VS Code
augx show module typescript-standards rules/interfaces.md --open
```

## Notes

**Features**:
- **Fast**: Caching with TTL and file change detection
- **Flexible**: Multiple output formats (JSON, Markdown, text)
- **Secure**: Redacts sensitive data in secure mode
- **VS Code Integration**: Direct file opening
- **Pagination**: Handle large modules efficiently

**Performance**:
- Cache hit time: < 1ms
- Cache miss time: 5-10ms
- Small module processing: < 10ms
- Large module processing: < 50ms

**Use Cases**:
- AI agents exploring module structure
- Generating documentation from modules
- Searching for specific patterns or rules
- Exporting module content for analysis
- CI/CD integration for module validation

