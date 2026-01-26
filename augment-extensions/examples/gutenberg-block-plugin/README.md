# Gutenberg Block Plugin Examples

## Overview

Complete Gutenberg block plugin examples demonstrating modern WordPress block development with block.json, React components, InspectorControls, RichText, MediaUpload, and proper build process.

## Key Benefits

- **Modern Block Development**: Uses block.json and @wordpress/scripts
- **React Components**: Edit and Save components with hooks
- **Inspector Controls**: Settings panels with color pickers, range controls
- **Media Upload**: Image selection and management
- **Build Process**: Webpack configuration and npm scripts
- **Complete Examples**: Full working plugins ready to use

## Installation

These are reference examples. Copy the code into your WordPress plugin project.

## Directory Structure

```
augment-extensions/examples/gutenberg-block-plugin/
├── module.json                    # Module metadata
├── README.md                      # This file
└── examples/
    ├── testimonial-block.md       # Complete testimonial block plugin
    ├── call-to-action-block.md    # CTA block with button
    └── pricing-table-block.md     # Pricing table with nested blocks
```

## Examples Included

### 1. Testimonial Block
Complete Gutenberg block with:
- RichText for content and author
- MediaUpload for author image
- RangeControl for rating
- ColorPicker for colors
- AlignmentToolbar
- Full build process

### 2. Call to Action Block
CTA block demonstrating:
- Button component
- Link controls
- Background image
- Gradient backgrounds
- Responsive settings

### 3. Pricing Table Block
Advanced block with:
- InnerBlocks for nested content
- Multiple pricing tiers
- Feature lists
- Custom block variations
- Block patterns

## Character Count

~45,000 characters

## Contents

- Complete plugin files (PHP, JS, CSS)
- Block.json configurations
- React Edit components
- Save components
- Build configurations
- Package.json with dependencies
- Webpack and Babel setup
- SCSS styles
- Translation setup

## Usage

```bash
# Copy example to your project
cp -r examples/testimonial-block/ /path/to/wp-content/plugins/

# Install dependencies
cd /path/to/wp-content/plugins/testimonial-block
npm install

# Build
npm run build

# Development mode
npm start
```

## Related Modules

- `domain-rules/wordpress-plugin` - WordPress plugin development guidelines
- `workflows/wordpress-plugin` - WordPress plugin development workflow
- `coding-standards/react` - React coding standards

## Version History

- **1.0.0** (2026-01-26): Initial release with three complete examples

