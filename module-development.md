# Module Development Guide

Complete guide for creating and maintaining Augment Extensions modules.

## Overview

Augment Extensions provides a modular system for extending Augment Code AI beyond the ~49,400 character limit of the `.augment/` folder. This guide covers everything you need to know about developing modules.

## Quick Start

### Creating a New Module

1. **Choose a category**: `coding-standards`, `domain-rules`, `workflows`, or `examples`
2. **Create directory structure**:
   ```bash
   mkdir -p augment-extensions/[category]/[module-name]/rules
   mkdir -p augment-extensions/[category]/[module-name]/examples  # optional
   ```
3. **Create required files**: `module.json`, `README.md`, and rule files
4. **Calculate character count** and update `module.json`
5. **Update `modules.md`** catalog
6. **Test discoverability**: `augx search [keyword]`

## Module Structure

Every module MUST follow this structure:

```
augment-extensions/[category]/[module-name]/
├── module.json           # Metadata (required)
├── README.md             # Overview (required)
├── rules/                # Detailed guidelines (required for most)
│   ├── workflow.md
│   ├── best-practices.md
│   └── ...
└── examples/             # Code examples (optional)
    └── ...
```

## Required Files

### module.json

Complete metadata file with all required fields:

```json
{
  "name": "module-name",
  "version": "1.0.0",
  "displayName": "Human Readable Name",
  "description": "Brief description of the module",
  "type": "coding-standards",
  "author": "Augment Extensions",
  "license": "MIT",
  "augment": {
    "characterCount": 30000,
    "priority": "medium",
    "category": "coding-standards"
  },
  "installation": {
    "required": false,
    "dependencies": []
  },
  "tags": [
    "typescript",
    "coding-standards",
    "best-practices"
  ]
}
```

**Required fields**:
- `name` - Unique identifier (kebab-case)
- `version` - Semantic version (MAJOR.MINOR.PATCH)
- `displayName` - Human-readable name
- `description` - Brief description
- `type` - Module category
- `augment.characterCount` - Total character count
- `augment.priority` - Loading priority (high, medium, low)
- `augment.category` - Module category
- `tags` - Searchable keywords

### README.md

Module overview with standard sections:

```markdown
# [Module Display Name]

Brief description of what this module provides.

## Overview

Detailed explanation of the module's purpose and scope.

## Key Benefits

- Benefit 1
- Benefit 2
- Benefit 3

## Installation

\`\`\`bash
augx link [category]/[module-name]
\`\`\`

## Contents

### Rules (or Examples)

- **file1.md** - Description
- **file2.md** - Description

## Character Count

~[count] characters

## Version

[version]
```

### Rule Files

Each rule file should contain:

1. **Clear title and purpose**
2. **Step-by-step instructions**
3. **Code examples** (where applicable)
4. **Best practices**
5. **Common pitfalls**
6. **Use cases**

## Module Categories

### coding-standards

Language or framework-specific coding standards.

**Examples**: `typescript`, `python`, `react`

**Typical contents**:
- Naming conventions
- Type safety guidelines
- Error handling patterns
- Code organization
- Best practices

### domain-rules

Domain-specific guidelines (web, API, security, etc.).

**Examples**: `api-design`, `security`, `web-development`

**Typical contents**:
- Best practices
- Common patterns
- Anti-patterns
- Security considerations
- Industry standards

### workflows

Process and methodology integration.

**Examples**: `openspec`, `beads`

**Typical contents**:
- Complete workflow guides
- File format specifications
- Manual setup instructions
- CLI command references
- Integration examples

### examples

Extensive code examples and patterns.

**Examples**: `design-patterns`, `testing-strategies`

**Typical contents**:
- Code examples
- Pattern implementations
- Use case demonstrations
- Real-world scenarios

## Character Count Management

### Calculating Character Count

Use PowerShell to calculate total character count:

```powershell
Get-ChildItem -Path "augment-extensions/[category]/[module-name]" -Recurse -File | Get-Content -Raw | Measure-Object -Character | Select-Object -ExpandProperty Characters
```

Update `module.json` with the result:

```json
{
  "augment": {
    "characterCount": 30505
  }
}
```

### Character Count Guidelines

- **Small modules**: < 10,000 characters
- **Medium modules**: 10,000 - 25,000 characters
- **Large modules**: 25,000 - 50,000 characters
- **Split if exceeds**: > 50,000 characters

## Versioning

Follow [Semantic Versioning](https://semver.org/):

### Version Format

`MAJOR.MINOR.PATCH` (e.g., 1.2.3)

### When to Increment

**MAJOR** (1.0.0 → 2.0.0):
- Breaking changes to module structure
- Removing or renaming files
- Breaking rule changes
- Incompatible API changes

**MINOR** (1.0.0 → 1.1.0):
- Adding new rule files
- Adding new examples
- Expanding existing rules (backward compatible)
- New features

**PATCH** (1.0.0 → 1.0.1):
- Fixing typos
- Clarifying existing rules
- Updating links
- Bug fixes

### Version Update Process

```bash
# 1. Make changes to module files
# 2. Recalculate character count
# 3. Update module.json version and characterCount
# 4. Update modules.md catalog
# 5. Commit with version in message
git commit -m "feat(module-name): description (v1.1.0)"
```

## Module Catalog

After creating or updating a module, update `modules.md`:

```markdown
### [Module Display Name]
- **Module**: `[category]/[module-name]`
- **Version**: [version]
- **Character Count**: ~[count]
- **Description**: [description]
- **Contents**:
  - [content 1]
  - [content 2]

**Usage**:
\`\`\`bash
augx link [category]/[module-name]
\`\`\`
```

## Best Practices

### DO ✅

- Keep modules focused on a single topic
- Provide comprehensive examples
- Include both "with CLI" and "without CLI" instructions (for workflows)
- Use clear, actionable language
- Update character counts after changes
- Follow semantic versioning strictly
- Update modules.md catalog
- Test module discoverability with `augx search`
- Include use cases and real-world examples
- Document common pitfalls

### DON'T ❌

- Mix multiple unrelated topics in one module
- Exceed 50,000 characters without splitting
- Forget to update module.json metadata
- Create modules specific to one project
- Include project-specific paths or URLs
- Duplicate content across modules
- Use abbreviations without explanation
- Skip version updates
- Forget to test CLI commands

## Testing Your Module

### 1. Build the CLI

```bash
npm run build
```

### 2. Test Discoverability

```bash
# Search for your module
node cli/dist/cli.js search [keyword]

# Show module details
node cli/dist/cli.js show [module-name]

# List all modules
node cli/dist/cli.js list
```

### 3. Verify Package Contents

```bash
# Check what will be published
npm pack --dry-run
```

### 4. Validate JSON

```bash
# Validate module.json
cat augment-extensions/[category]/[module-name]/module.json | jq .
```

## Common Tasks

### Create a Coding Standards Module

```bash
# 1. Create directory structure
mkdir -p augment-extensions/coding-standards/python/rules

# 2. Create module.json
# 3. Create README.md
# 4. Create rule files:
#    - naming-conventions.md
#    - type-hints.md
#    - error-handling.md
#    - best-practices.md
#    - code-organization.md

# 5. Calculate character count
Get-ChildItem -Path "augment-extensions/coding-standards/python" -Recurse -File | Get-Content -Raw | Measure-Object -Character | Select-Object -ExpandProperty Characters

# 6. Update module.json with character count
# 7. Update modules.md
# 8. Test discoverability
node cli/dist/cli.js search python
```

### Create a Domain Rules Module

```bash
# 1. Create directory structure
mkdir -p augment-extensions/domain-rules/api-design/rules

# 2. Create module.json
# 3. Create README.md
# 4. Create rule files:
#    - rest-api.md
#    - graphql-api.md
#    - versioning.md
#    - error-handling.md
#    - authentication.md
#    - documentation.md

# 5. Calculate character count and update module.json
# 6. Update modules.md
# 7. Test discoverability
```

### Create an Examples Module

```bash
# 1. Create directory structure
mkdir -p augment-extensions/examples/design-patterns/examples

# 2. Create module.json
# 3. Create README.md
# 4. Create example files:
#    - creational-patterns.md
#    - structural-patterns.md
#    - behavioral-patterns.md

# 5. Calculate character count and update module.json
# 6. Update modules.md
# 7. Test discoverability
```

## Troubleshooting

### Module Not Discoverable

**Problem**: `augx search` doesn't find your module

**Solutions**:
1. Check `tags` array in `module.json`
2. Rebuild CLI: `npm run build`
3. Verify module.json is valid JSON: `cat module.json | jq .`
4. Check module is in correct directory structure

### Character Count Mismatch

**Problem**: Character count doesn't match actual content

**Solutions**:
1. Recalculate using PowerShell command
2. Include ALL files in the module directory
3. Update `module.json` with new count
4. Verify no hidden files are excluded

### Version Conflicts

**Problem**: Version number conflicts or unclear versioning

**Solutions**:
1. Follow semantic versioning strictly
2. Check existing version in `module.json`
3. Update modules.md with new version
4. Use git tags for releases: `git tag v1.0.0`

## Resources

- **Semantic Versioning**: https://semver.org/
- **JSON Schema**: https://json-schema.org/
- **Markdown Guide**: https://www.markdownguide.org/

## Getting Help

- Check existing modules for examples
- Review `.augment/rules/module-development.md` for AI agent guidelines
- See `CONTRIBUTING.md` for contribution guidelines
- Open an issue on GitHub for questions

---

**Ready to create your first module?** Follow the Quick Start section above and refer to existing modules as examples!

