# WordPress Plugin Development Module

## Overview

This module provides comprehensive guidelines for WordPress plugin development, optimized for AI-assisted development workflows in VS Code using Augment Code AI, OpenSpec, and Beads task management.

## Key Benefits

- **Plugin Structure Detection**: Automatically detect WordPress plugin projects and apply appropriate guidelines
- **Architecture Patterns**: 7 proven plugin architecture patterns from simple procedural to enterprise-level
- **Security First**: Built-in security best practices (nonces, sanitization, escaping, capability checks)
- **Performance Optimized**: Caching strategies, query optimization, and performance guidelines
- **WordPress.org Ready**: Submission preparation and compliance guidelines
- **AI-Assisted Development**: Optimized for AI code generation with clear patterns and examples

## Installation

### With CLI (Future)
```bash
augx link domain-rules/wordpress-plugin
```

### Manual Installation
Copy the contents of this module to your project's `.augment/` directory or reference it from the Augment Extensions repository.

## Directory Structure

```
augment-extensions/domain-rules/wordpress-plugin/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/                               # Detailed guidelines
│   ├── plugin-structure.md              # Plugin detection and structure
│   ├── plugin-architecture.md           # Architecture patterns
│   ├── activation-hooks.md              # Activation/deactivation/uninstall
│   ├── admin-interface.md               # Settings pages, meta boxes
│   ├── frontend-functionality.md        # CPT, taxonomies, shortcodes, widgets
│   ├── gutenberg-blocks.md              # Block development
│   ├── rest-api.md                      # REST API endpoints
│   ├── ajax-handlers.md                 # AJAX implementation
│   ├── database-management.md           # Custom tables, queries
│   ├── cron-jobs.md                     # Scheduled tasks
│   ├── security-best-practices.md       # Security guidelines
│   ├── performance-optimization.md      # Performance best practices
│   ├── internationalization.md          # i18n/l10n
│   ├── asset-management.md              # Scripts and styles
│   ├── woocommerce-integration.md       # WooCommerce extensions
│   ├── testing-patterns.md              # PHPUnit, integration tests
│   ├── documentation-standards.md       # PHPDoc, readme.txt
│   └── wordpress-org-submission.md      # Submission process
└── examples/                            # Complete code examples
    ├── simple-procedural-plugin.md
    ├── object-oriented-plugin.md
    ├── mvc-plugin.md
    ├── singleton-plugin.md
    ├── custom-post-type-plugin.md
    ├── gutenberg-block-plugin.md
    ├── rest-api-plugin.md
    ├── settings-page-plugin.md
    ├── ajax-plugin.md
    ├── woocommerce-extension.md
    └── complete-plugin-example.md
```

## Core Workflows

### 1. Plugin Scaffolding
Create new WordPress plugins with proper structure, headers, and boilerplate code.

### 2. Feature Development
Add functionality: custom post types, Gutenberg blocks, REST endpoints, admin interfaces.

### 3. Security Hardening
Implement security best practices: nonces, sanitization, escaping, capability checks.

### 4. Performance Optimization
Apply caching, query optimization, and performance best practices.

### 5. WordPress.org Submission
Prepare plugins for WordPress.org directory submission.

## Usage

### For AI Agents

When working on WordPress plugin development:

1. **Detect Plugin Context**: Check for plugin header in PHP files
2. **Apply Architecture Pattern**: Choose appropriate pattern based on plugin complexity
3. **Follow Security Rules**: Always sanitize input, escape output, verify nonces
4. **Optimize Performance**: Use transients, object caching, query optimization
5. **Document Code**: PHPDoc blocks, inline comments, readme.txt

### Example AI Prompts

**Create Custom Post Type:**
```
Create a WordPress plugin for a Portfolio custom post type with:
- Custom taxonomy (Portfolio Categories)
- Meta box for project URL
- Archive and single templates
- Shortcode to display portfolio items
```

**Add Gutenberg Block:**
```
Add a Gutenberg block to display testimonials with:
- Author name and image
- Quote text
- Block controls for styling
```

## Character Count

**Total**: ~278,593 characters

## Contents

- **17 Rule Files**: Comprehensive guidelines for all aspects of plugin development
- **11 Example Files**: Complete, working plugin examples
- **Security Focus**: Critical security rules and patterns
- **Performance Focus**: Optimization strategies and caching patterns
- **WordPress.org Ready**: Submission guidelines and checklist

## Related Modules

- `workflows/wordpress-plugin` - Plugin development workflows
- `domain-rules/wordpress` - General WordPress development (themes, core)

## Version

**1.0.0** - Initial release

## License

MIT

