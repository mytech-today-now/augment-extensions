# WordPress Development Module

Comprehensive WordPress development guidelines for AI-assisted development with Augment Code.

## Overview

This module provides complete WordPress development standards, workflows, and best practices optimized for AI-assisted development in VS Code. It covers themes, plugins, Gutenberg blocks, WooCommerce, REST API, security, and performance.

## Key Benefits

- **Project Detection**: Automatically identifies WordPress projects (themes, plugins, full installations)
- **Security-First**: Built-in security guidelines following WordPress best practices
- **Modern WordPress**: Full Site Editing (FSE), block themes, Gutenberg blocks
- **Performance Optimized**: Caching, query optimization, and performance best practices
- **AI-Optimized**: Prompt templates and bead decomposition patterns for common tasks
- **VS Code Integration**: File associations, task suggestions, and context providers

## Installation

### With CLI (Recommended)

```bash
augx link domain-rules/wordpress
```

### Manual Installation

Copy the contents of this module to your project's `.augment/` directory.

## Directory Structure

```
wordpress/
├── module.json           # Module metadata
├── README.md             # This file
├── rules/                # Detailed guidelines
│   ├── project-detection.md
│   ├── directory-structure.md
│   ├── file-patterns.md
│   ├── theme-development.md
│   ├── plugin-development.md
│   ├── gutenberg-blocks.md
│   ├── woocommerce.md
│   ├── rest-api.md
│   ├── security.md
│   ├── coding-standards.md
│   ├── performance.md
│   ├── ai-prompts.md
│   ├── testing.md
│   ├── migration.md
│   ├── vscode-integration.md
│   └── context-providers.md
├── examples/             # Code examples
│   ├── custom-post-type.md
│   ├── secure-form-handler.md
│   ├── gutenberg-block.md
│   └── rest-endpoint.md
└── patterns/             # Bead decomposition patterns
    └── bead-patterns.md
```

## Core Workflows

### Theme Development
- Create new block themes
- Convert classic themes to block themes
- Template hierarchy and customization
- Theme.json configuration
- Asset enqueuing

### Plugin Development
- Custom plugin scaffolding
- Custom post types and taxonomies
- Admin menus and settings pages
- Activation/deactivation hooks
- Security and sanitization

### Gutenberg Blocks
- Block initialization with @wordpress/create-block
- Block.json metadata configuration
- Edit and save components
- Block styles and variations
- Server-side rendering

### WooCommerce
- Template overrides
- Custom product fields
- Checkout customization
- Payment gateway integration
- Email templates

### REST API
- Custom endpoint registration
- Permission callbacks
- Input sanitization and validation
- JSON response formatting
- Authentication

### Security
- Input sanitization (sanitize_text_field, sanitize_email)
- Output escaping (esc_html, esc_attr, esc_url)
- Nonce verification
- Capability checks
- Prepared statements for database queries

### Performance
- Object caching with transients
- Database query optimization
- Lazy loading
- Asset minification
- CDN integration

## Character Count

~0 characters (will be calculated after all files are created)

## Contents

### Rules (16 files)
- Project detection and identification
- Directory structure patterns
- File patterns and conventions
- Theme development workflows
- Plugin development workflows
- Gutenberg block development
- WooCommerce customization
- REST API extensions
- Security hardening
- Coding standards (WPCS)
- Performance optimization
- AI prompt templates
- Testing guidelines
- Migration workflows
- VS Code integration
- Context providers

### Examples (4 files)
- Custom post type implementation
- Secure form handler
- Gutenberg block
- REST API endpoint

### Patterns (1 file)
- Bead decomposition patterns for WordPress tasks

## Usage

Once linked, the module provides:

1. **Automatic Detection**: WordPress projects are automatically detected
2. **Context-Aware Assistance**: AI understands WordPress file structure and conventions
3. **Security Enforcement**: Critical safety rules prevent common vulnerabilities
4. **Workflow Guidance**: Step-by-step workflows for common tasks
5. **Code Examples**: Ready-to-use code snippets following best practices

## Version

1.0.0

## License

MIT

