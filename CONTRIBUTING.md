# Contributing to Augment Extensions

Thank you for your interest in contributing! This document provides guidelines for creating and sharing extension modules.

## Ways to Contribute

1. **Create new modules** - Add domain-specific rules, coding standards, or examples
2. **Improve existing modules** - Fix typos, add examples, clarify rules
3. **Enhance CLI** - Improve the `augx` tool functionality
4. **Documentation** - Improve guides and references
5. **Bug reports** - Report issues with modules or CLI

## Creating a New Module

### 1. Choose Module Type

- **coding-standards** - Language/framework specific standards
- **domain-rules** - Domain-specific guidelines (web, API, security, etc.)
- **examples** - Code examples and patterns

### 2. Create Module Structure

```bash
modules/<type>/<name>/
├── module.json          # Required: Metadata
├── README.md            # Required: Module documentation
├── rules/               # Optional: Rule files
│   └── *.md
└── examples/            # Optional: Code examples
    └── *.*
```

### 3. Module Metadata (module.json)

```json
{
  "name": "your-module-name",
  "version": "1.0.0",
  "description": "Brief description",
  "type": "coding-standards",
  "language": "typescript",
  "author": "Your Name",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "dependencies": {},
  "files": [
    "rules/rule1.md",
    "examples/example1.ts"
  ],
  "augment": {
    "minVersion": "1.0.0",
    "characterCount": 15000,
    "priority": "high",
    "autoLoad": false
  }
}
```

### 4. Write Clear Rules

- Use Markdown format
- Include code examples
- Provide ✅ Good and ❌ Bad examples
- Be specific and actionable
- Avoid ambiguity

### 5. Calculate Character Count

```bash
# Count characters in all rule files
find modules/your-module -name "*.md" -exec wc -m {} + | tail -1
```

Update `characterCount` in `module.json`.

## Module Guidelines

### Naming Conventions

- **Module names**: lowercase-with-hyphens
- **File names**: lowercase-with-hyphens.md
- **Directory names**: lowercase-with-hyphens

### Content Guidelines

1. **Clarity**: Rules should be clear and unambiguous
2. **Examples**: Include code examples for every rule
3. **Consistency**: Follow existing module patterns
4. **Completeness**: Cover the topic thoroughly
5. **Maintainability**: Keep modules focused and modular

### Character Count Limits

- **Small modules**: < 10,000 characters
- **Medium modules**: 10,000 - 25,000 characters
- **Large modules**: 25,000 - 50,000 characters
- **Split if**: > 50,000 characters

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes to structure or rules
- **MINOR** (1.0.0 → 1.1.0): New rules or examples added
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, typos, clarifications

## Submission Process

### 1. Fork Repository

```bash
git clone https://github.com/your-username/augment-extensions.git
cd augment-extensions
```

### 2. Create Branch

```bash
git checkout -b add-module-<name>
```

### 3. Add Module

```bash
# Create module directory
mkdir -p modules/coding-standards/your-module

# Add files
# - module.json
# - README.md
# - rules/*.md
# - examples/*
```

### 4. Validate Module

```bash
# Install CLI
cd cli
npm install
npm link

# Validate your module
augx validate coding-standards/your-module
```

### 5. Update Catalog

Add your module to `MODULES.md`:

```markdown
### Your Module Name
- **Module**: `coding-standards/your-module`
- **Version**: 1.0.0
- **Character Count**: ~15,000
- **Description**: Brief description
```

### 6. Commit and Push

```bash
git add modules/coding-standards/your-module
git add MODULES.md
git commit -m "Add your-module coding standards"
git push origin add-module-<name>
```

### 7. Create Pull Request

- Describe the module purpose
- List key rules included
- Mention character count
- Link to any related issues

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on improving the modules
- Help others learn and grow

## Questions?

- Open an issue for questions
- Join discussions in pull requests
- Check existing modules for examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

