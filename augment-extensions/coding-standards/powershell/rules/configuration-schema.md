# PowerShell Module Configuration Schema

## Overview

The PowerShell coding standards module can be configured using a `.augment/powershell-config.json` file in your project root. This allows you to customize which categories and rules apply to your specific project.

---

## Configuration File Location

**Path**: `.augment/powershell-config.json`

**Required**: No (module uses defaults if not present)

---

## Schema

### Complete Schema

```json
{
  "powershell_categories": ["automation", "modules"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  },
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  },
  "code_style": {
    "indentation": 4,
    "brace_style": "Allman"
  }
}
```

### Field Descriptions

#### `powershell_categories`

**Type**: `array` of `string`

**Description**: Project categories to apply. Determines which category-specific rules are loaded.

**Valid Values**:
- `"automation"` - Task automation and scheduled tasks
- `"modules"` - PowerShell modules and advanced functions
- `"dsc"` - Desired State Configuration
- `"cloud"` - Cloud orchestration (Azure, AWS)
- `"admin"` - Administrative tools (AD, Exchange, SQL)
- `"cross-platform"` - Cross-platform PowerShell scripts
- `"legacy"` - Legacy Windows PowerShell to PowerShell Core migration

**Default**: `[]` (universal rules only)

**Example**:
```json
{
  "powershell_categories": ["automation", "modules", "cloud"]
}
```

#### `powershell_version`

**Type**: `string`

**Description**: Minimum PowerShell version for the project

**Default**: `"7.4"`

**Example**:
```json
{
  "powershell_version": "7.4"
}
```

#### `strict_mode`

**Type**: `boolean`

**Description**: Enforce `Set-StrictMode -Version Latest` in all scripts

**Default**: `true`

**Example**:
```json
{
  "strict_mode": true
}
```

#### `static_analysis`

**Type**: `object`

**Description**: Static analysis tool configuration

**Properties**:
- `tool` (string): Static analysis tool to use
  - Valid values: `"PSScriptAnalyzer"`
  - Default: `"PSScriptAnalyzer"`
- `severity` (string): Minimum severity level to report
  - Valid values: `"Error"`, `"Warning"`, `"Information"`
  - Default: `"Warning"`

**Example**:
```json
{
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  }
}
```

#### `testing`

**Type**: `object`

**Description**: Testing framework configuration

**Properties**:
- `framework` (string): Testing framework to use
  - Valid values: `"Pester"`
  - Default: `"Pester"`
- `version` (string): Framework version
  - Default: `"5.x"`

**Example**:
```json
{
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  }
}
```

#### `code_style`

**Type**: `object`

**Description**: Code style preferences

**Properties**:
- `indentation` (integer): Number of spaces for indentation
  - Default: `4`
- `brace_style` (string): Brace placement style
  - Valid values: `"Allman"`, `"K&R"`
  - Default: `"Allman"`

**Example**:
```json
{
  "code_style": {
    "indentation": 4,
    "brace_style": "Allman"
  }
}
```

---

## Configuration Examples

### Example 1: Automation Project

```json
{
  "powershell_categories": ["automation"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  },
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  }
}
```

### Example 2: Module Development Project

```json
{
  "powershell_categories": ["modules"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Error"
  },
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  },
  "code_style": {
    "indentation": 4,
    "brace_style": "Allman"
  }
}
```

### Example 3: Cloud Orchestration Project

```json
{
  "powershell_categories": ["cloud", "automation"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  }
}
```

### Example 4: Cross-Platform Project

```json
{
  "powershell_categories": ["cross-platform", "modules"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  },
  "code_style": {
    "indentation": 4,
    "brace_style": "K&R"
  }
}
```

### Example 5: Legacy Migration Project

```json
{
  "powershell_categories": ["legacy", "cross-platform"],
  "powershell_version": "7.4",
  "strict_mode": false,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Information"
  }
}
```

---

## Validation Rules

### Required Fields

None - all fields are optional with sensible defaults

### Validation Constraints

1. **powershell_categories**: Must be an array of valid category strings
2. **powershell_version**: Must be a valid version string (e.g., "7.4", "5.1")
3. **strict_mode**: Must be boolean
4. **static_analysis.tool**: Must be "PSScriptAnalyzer"
5. **static_analysis.severity**: Must be "Error", "Warning", or "Information"
6. **testing.framework**: Must be "Pester"
7. **code_style.indentation**: Must be a positive integer
8. **code_style.brace_style**: Must be "Allman" or "K&R"

### Invalid Configuration Examples

❌ **Invalid category**:
```json
{
  "powershell_categories": ["invalid-category"]
}
```

❌ **Invalid severity**:
```json
{
  "static_analysis": {
    "severity": "Critical"
  }
}
```

❌ **Invalid brace style**:
```json
{
  "code_style": {
    "brace_style": "1TBS"
  }
}
```

---

## Default Configuration

If no configuration file is present, the module uses these defaults:

```json
{
  "powershell_categories": [],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  },
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  },
  "code_style": {
    "indentation": 4,
    "brace_style": "Allman"
  }
}
```

**Note**: With empty `powershell_categories`, only universal rules are applied.

---

## Usage

### Creating Configuration File

1. Create `.augment/powershell-config.json` in your project root
2. Add desired configuration options
3. Save the file
4. The module will automatically load the configuration

### Updating Configuration

1. Edit `.augment/powershell-config.json`
2. Save changes
3. Reload the module or restart your editor

### Removing Configuration

Delete `.augment/powershell-config.json` to revert to defaults.

---

## Best Practices

1. **Start minimal**: Begin with universal rules only, add categories as needed
2. **Version control**: Commit `.augment/powershell-config.json` to version control
3. **Team alignment**: Ensure all team members use the same configuration
4. **Strict mode**: Keep `strict_mode: true` for new projects
5. **Static analysis**: Use "Warning" severity for most projects, "Error" for critical code
6. **Testing**: Always configure Pester for testable code

---

## Troubleshooting

### Configuration Not Loading

- Verify file is at `.augment/powershell-config.json`
- Check JSON syntax is valid
- Ensure file encoding is UTF-8

### Invalid Category Error

- Check category names match exactly (case-sensitive)
- Refer to valid values list above

### Rules Not Applying

- Verify `powershell_categories` array is not empty
- Check file patterns match your PowerShell files
- Ensure module is properly linked

