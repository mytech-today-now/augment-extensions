# WordPress Plugin Development Workflow Module

## Overview

This module provides complete workflows for WordPress plugin development, optimized for AI-assisted development using Augment Code AI, OpenSpec, and Beads task management.

## Key Benefits

- **Scaffolding Workflow**: Automated plugin structure creation with proper headers and boilerplate
- **Development Workflow**: Feature development cycle with testing and validation
- **Testing Workflow**: PHPUnit setup, integration tests, and WordPress test suite
- **Submission Workflow**: WordPress.org submission preparation and process
- **AI-Optimized**: Structured workflows with clear prompts and task breakdowns
- **Beads Integration**: Task templates for plugin development phases

## Installation

### With CLI (Future)
```bash
augx link workflows/wordpress-plugin
```

### Manual Installation
Copy the contents of this module to your project's `.augment/` directory or reference it from the Augment Extensions repository.

## Directory Structure

```
augment-extensions/workflows/wordpress-plugin/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/                               # Workflow documentation
│   ├── scaffolding-workflow.md          # Plugin creation workflow
│   ├── development-workflow.md          # Feature development cycle
│   ├── testing-workflow.md              # Testing setup and execution
│   ├── submission-workflow.md           # WordPress.org submission
│   └── best-practices.md                # Workflow best practices
└── examples/                            # Workflow examples
    ├── plugin-creation-workflow.md      # Complete plugin creation example
    ├── feature-addition-workflow.md     # Adding features to existing plugin
    ├── security-audit-workflow.md       # Security audit process
    └── wordpress-org-submission-workflow.md  # Real submission example
```

## Core Workflows

### 1. Scaffolding Workflow

**Purpose**: Create new WordPress plugin from scratch

**Steps**:
1. Define plugin requirements (OpenSpec)
2. Create Beads tasks for implementation
3. Generate plugin structure
4. Add plugin header and metadata
5. Create initial files (main plugin file, readme.txt)
6. Set up version control

**AI Prompt Template**:
```
Create a WordPress plugin called [Plugin Name] that [description].

Requirements:
- Plugin slug: [slug]
- Text domain: [text-domain]
- Minimum WordPress version: 6.0
- PHP version: 7.4+

Features:
- [Feature 1]
- [Feature 2]

Use [architecture pattern] architecture.
```

### 2. Development Workflow

**Purpose**: Add features to existing plugin

**Steps**:
1. Create OpenSpec spec for feature
2. Break down into Beads tasks
3. Implement feature with security checks
4. Add tests
5. Update documentation
6. Test in WordPress environment

**AI Prompt Template**:
```
Add [feature name] to the [plugin name] plugin.

Feature requirements:
- [Requirement 1]
- [Requirement 2]

Security requirements:
- Nonce verification
- Capability checks
- Input sanitization
- Output escaping

Follow the [architecture pattern] pattern used in the plugin.
```

### 3. Testing Workflow

**Purpose**: Set up and run plugin tests

**Steps**:
1. Install WordPress test suite
2. Configure PHPUnit
3. Write unit tests
4. Write integration tests
5. Run tests locally
6. Set up CI/CD (optional)

**AI Prompt Template**:
```
Set up PHPUnit testing for [plugin name].

Test coverage needed:
- [Feature 1] unit tests
- [Feature 2] integration tests
- Security validation tests

Use WordPress test suite and mock WordPress functions.
```

### 4. Submission Workflow

**Purpose**: Prepare plugin for WordPress.org submission

**Steps**:
1. Security audit
2. Code standards check (WPCS)
3. Create/update readme.txt
4. Add screenshots
5. Test in clean WordPress install
6. Submit to WordPress.org
7. Respond to review feedback

**AI Prompt Template**:
```
Prepare [plugin name] for WordPress.org submission.

Checklist:
- Security audit (nonces, sanitization, escaping)
- WPCS compliance
- readme.txt with proper format
- Screenshots (if applicable)
- Tested up to WordPress [version]

Generate submission-ready package.
```

## Beads Task Breakdown Patterns

### Plugin Creation Tasks

```bash
bd create "Create plugin structure" -p 1
bd create "Add plugin header and metadata" -p 1
bd create "Create main plugin file" -p 1
bd create "Create readme.txt" -p 1
bd create "Set up activation/deactivation hooks" -p 1
```

### Feature Addition Tasks

```bash
bd create "Create OpenSpec spec for [feature]" -p 1
bd create "Implement [feature] core logic" -p 1
bd create "Add security checks (nonces, caps)" -p 1
bd create "Add tests for [feature]" -p 1
bd create "Update documentation" -p 2
```

## Usage

### For AI Agents

When working on WordPress plugin development:

1. **Start with scaffolding workflow** for new plugins
2. **Use development workflow** for adding features
3. **Apply testing workflow** before releases
4. **Follow submission workflow** for WordPress.org

### Integration with OpenSpec

Create specs in `openspec/specs/plugin-features/[feature-name].md` with:
- Feature requirements
- Security requirements
- Performance considerations
- Testing requirements

### Integration with Beads

Track all plugin development tasks in Beads with labels:
- `wordpress`
- `plugin`
- `[feature-name]`
- `security` (for security-related tasks)
- `testing` (for test tasks)

## Character Count

**Total**: ~60,944 characters

## Contents

- **3 Workflow Files**: Complete workflows for plugin development lifecycle
  - `development-workflow.md` - Feature development cycle with security-first approach
  - `testing-workflow.md` - PHPUnit setup, TDD workflow, and CI/CD integration
  - `submission-workflow.md` - WordPress.org submission process and review response
- **Beads Integration**: Task templates and breakdown patterns
- **OpenSpec Integration**: Spec templates for plugin features
- **AI Prompt Templates**: Ready-to-use prompts for each workflow phase

## Dependencies

- `domain-rules/wordpress-plugin` - WordPress plugin development rules

## Version

**1.1.0** - Added development, testing, and submission workflows

## License

MIT

