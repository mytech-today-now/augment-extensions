# HTML/CSS/JavaScript Coding Standards

> **⚠️ DEPRECATED**: This monolithic module has been split into three independent modules for better flexibility. Please use the new collection instead:
>
> ```bash
> augx link collections/html-css-js
> ```
>
> Or link individual modules:
> - `augx link coding-standards/html`
> - `augx link coding-standards/css`
> - `augx link coding-standards/js`

Comprehensive coding standards for modern web development with semantic HTML, modern CSS features, and ES6+ JavaScript.

## Overview

This module provides detailed guidelines for writing clean, maintainable, and accessible HTML/CSS/JavaScript code. It covers semantic HTML structure, modern CSS features (Grid, Flexbox, custom properties), ES6+ JavaScript patterns, DOM manipulation, async programming, performance optimization, and tooling.

## Key Features

- **Semantic HTML**: Proper use of HTML5 semantic elements
- **Accessibility**: WCAG compliance and ARIA best practices
- **Modern CSS**: CSS Grid, Flexbox, custom properties
- **ES6+ JavaScript**: Modern syntax and patterns
- **Performance**: Optimization techniques for web applications
- **Tooling**: ESLint, Prettier, Stylelint configuration

## Installation

### With CLI (Future)

```bash
augx link coding-standards/html-css-js
```

### Manual Installation

Copy the contents of this module to your project's `.augment/` folder or reference directly from this repository.

## Directory Structure

```
html-css-js/
├── module.json              # Module metadata
├── README.md                # This file
├── rules/                   # Detailed guidelines
│   ├── html-standards.md
│   ├── css-standards.md
│   ├── css-modern-features.md
│   ├── javascript-standards.md
│   ├── dom-manipulation.md
│   ├── async-patterns.md
│   ├── performance.md
│   └── tooling.md
└── examples/                # Code examples
    ├── html-examples.html
    ├── css-examples.css
    ├── javascript-examples.js
    ├── responsive-layout.html (optional)
    ├── async-examples.js (optional)
    └── dom-examples.js (optional)
```

## Core Guidelines

### HTML Standards

- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`)
- Ensure accessibility with proper alt text, labels, and ARIA attributes
- Maintain proper document structure with DOCTYPE, meta tags, and viewport settings
- Use meaningful heading hierarchy (h1-h6)

### CSS Standards

- Use kebab-case for class names
- Follow BEM methodology for component naming
- Organize CSS in a component-based structure
- Use mobile-first responsive design
- Leverage modern CSS features (Grid, Flexbox, custom properties)

### JavaScript Standards

- Use `const` and `let` instead of `var`
- Prefer arrow functions for callbacks
- Use template literals for string interpolation
- Leverage destructuring, spread operator, and optional chaining
- Organize code with ES6 modules

### Performance

- Optimize images and use lazy loading
- Minimize and bundle CSS/JS
- Use code splitting for large applications
- Implement debounce/throttle for event handlers
- Leverage browser caching and preloading

## Usage Examples

### Semantic HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
</head>
<body>
  <header>
    <nav><!-- Navigation --></nav>
  </header>
  <main>
    <article><!-- Main content --></article>
  </main>
  <footer><!-- Footer --></footer>
</body>
</html>
```

### Modern CSS with Custom Properties

```css
:root {
  --primary-color: #007bff;
  --spacing-unit: 8px;
}

.component {
  color: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
  display: grid;
  gap: var(--spacing-unit);
}
```

### ES6+ JavaScript

```javascript
// Modern JavaScript patterns
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Destructuring and spread
const { name, age, ...rest } = user;
const updatedUser = { ...user, active: true };
```

## Character Count

**Total**: ~165,097 characters

## Contents

### Rules (8 files)

1. **html-standards.md** - Semantic HTML and accessibility
2. **css-standards.md** - CSS naming, organization, and responsive design
3. **css-modern-features.md** - Grid, Flexbox, custom properties
4. **javascript-standards.md** - ES6+ syntax and patterns
5. **dom-manipulation.md** - DOM queries and event handling
6. **async-patterns.md** - Promises, async/await, Fetch API
7. **performance.md** - Optimization techniques
8. **tooling.md** - ESLint, Prettier, Stylelint

### Examples (6 files)

**Core Examples**:
- **html-examples.html** - Comprehensive HTML examples with semantic structure and accessibility
- **css-examples.css** - Modern CSS examples with Grid, Flexbox, BEM, and responsive design
- **javascript-examples.js** - ES6+ JavaScript examples with modern syntax and patterns

**Advanced Examples**:
- **responsive-layout.html** - Complete responsive layout with mobile-first design, media queries, and dark mode
- **async-examples.js** - Async/await patterns, Fetch API, Promise handling, and error handling
- **dom-examples.js** - DOM manipulation, event delegation, element creation, and performance best practices

## Version History

- **1.0.0** - Initial release

## License

Part of Augment Extensions - see repository root for license information.

