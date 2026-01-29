# HTML/CSS/JS Frontend Collection

Complete frontend development collection bundling HTML, CSS, and JavaScript standards.

## Overview

This collection provides a comprehensive set of coding standards for modern web development by bundling three independent modules:

- **HTML Standards** (`coding-standards/html`)
- **CSS Standards** (`coding-standards/css`)
- **JavaScript Standards** (`coding-standards/js`)

## Key Benefits

- **Complete Frontend Coverage**: All three core web technologies in one collection
- **Modular**: Each module can be used independently if needed
- **Backward Compatible**: Replaces the monolithic `html-css-js-standards` module
- **Comprehensive**: Covers semantic HTML, modern CSS, and ES6+ JavaScript

## Installation

### Using the Collection

```bash
augx link collections/html-css-js
```

This will automatically link all three modules.

### Using Individual Modules

You can also link modules individually:

```bash
augx link coding-standards/html
augx link coding-standards/css
augx link coding-standards/js
```

## Included Modules

### HTML Standards (32,477 characters)

- Semantic HTML5 elements
- Accessibility guidelines (WCAG 2.1)
- Modern HTML features

### CSS Standards (30,556 characters)

- Modern CSS features (Grid, Flexbox, Custom Properties)
- Responsive design patterns
- Preprocessor best practices (Sass, Less)

### JavaScript Standards (101,818 characters)

- ES6+ features and syntax
- Async patterns (Promises, async/await)
- DOM manipulation best practices
- Performance optimization
- Development tooling

## Total Character Count

~164,851 characters (across all three modules)

## Version

1.0.0

## Backward Compatibility

This collection replaces the monolithic `coding-standards/html-css-js` module. If you were using the old module, you can migrate to this collection seamlessly:

```bash
augx unlink coding-standards/html-css-js
augx link collections/html-css-js
```

## Migration Notes

The collection maintains 100% backward compatibility with the original `html-css-js-standards` module. All rules, examples, and guidelines are preserved in the individual modules.

