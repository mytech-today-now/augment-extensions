# HTML/CSS/JavaScript Coding Standards Specification

## Overview

This specification defines the HTML/CSS/JavaScript coding standards module for Augment Extensions, providing comprehensive guidelines for modern web development with vanilla JavaScript, semantic HTML, and maintainable CSS.

## Requirements

### Requirement: Module Structure
The HTML/CSS/JS coding standards module SHALL follow the standard Augment Extensions module structure.

#### Scenario: Create module directory
- GIVEN a need for HTML/CSS/JS coding standards
- WHEN creating the module
- THEN it MUST be located at `augment-extensions/coding-standards/html-css-js/`
- AND it MUST include `module.json`, `README.md`, and `rules/` directory
- AND it MUST include an `examples/` directory with HTML, CSS, and JS examples

### Requirement: HTML Standards
The module SHALL provide semantic HTML and accessibility guidelines.

#### Scenario: Semantic HTML
- GIVEN HTML markup
- WHEN writing HTML
- THEN semantic elements MUST be used (header, nav, main, article, section, aside, footer)
- AND div/span SHOULD only be used when no semantic element is appropriate
- AND heading hierarchy MUST be logical (h1 → h2 → h3, no skipping)
- AND lists MUST use ul/ol/dl appropriately

#### Scenario: HTML accessibility
- GIVEN HTML elements
- WHEN ensuring accessibility
- THEN all images MUST have alt attributes
- AND form inputs MUST have associated labels
- AND ARIA attributes SHOULD be used when semantic HTML is insufficient
- AND lang attribute MUST be set on html element
- AND page MUST have a descriptive title

#### Scenario: HTML structure
- GIVEN an HTML document
- WHEN structuring the document
- THEN DOCTYPE MUST be declared (<!DOCTYPE html>)
- AND meta charset MUST be specified (UTF-8)
- AND meta viewport MUST be set for responsive design
- AND scripts SHOULD be placed before closing body tag or use defer/async

### Requirement: CSS Standards
The module SHALL provide CSS organization, naming, and best practices.

#### Scenario: CSS naming conventions
- GIVEN CSS classes and IDs
- WHEN naming selectors
- THEN kebab-case MUST be used for class names
- AND BEM (Block Element Modifier) SHOULD be used for component-based naming
- AND IDs SHOULD be avoided for styling (use for JS hooks only)
- AND class names SHOULD be descriptive and semantic

#### Scenario: CSS organization
- GIVEN CSS files
- WHEN organizing styles
- THEN CSS SHOULD be organized by component or feature
- AND global styles SHOULD be separated from component styles
- AND CSS custom properties (variables) SHOULD be used for theming
- AND @import SHOULD be avoided (use build tools instead)

#### Scenario: CSS selectors
- GIVEN CSS selectors
- WHEN writing selectors
- THEN specificity SHOULD be kept low
- AND nesting SHOULD be limited (max 3 levels)
- AND universal selector (*) SHOULD be used sparingly
- AND !important SHOULD be avoided except for utilities

#### Scenario: Responsive design
- GIVEN responsive layouts
- WHEN writing CSS
- THEN mobile-first approach SHOULD be used
- AND media queries SHOULD use em or rem units
- AND breakpoints SHOULD be consistent across the project
- AND CSS Grid and Flexbox SHOULD be preferred over floats

### Requirement: CSS Modern Features
The module SHALL provide guidelines for modern CSS features.

#### Scenario: CSS custom properties
- GIVEN theming and reusable values
- WHEN using CSS variables
- THEN custom properties SHOULD be defined at :root for global values
- AND custom properties SHOULD use descriptive names
- AND fallback values SHOULD be provided

#### Scenario: CSS Grid and Flexbox
- GIVEN layout requirements
- WHEN choosing layout methods
- THEN CSS Grid SHOULD be used for 2D layouts
- AND Flexbox SHOULD be used for 1D layouts
- AND fallbacks SHOULD be considered for older browsers

### Requirement: JavaScript Standards
The module SHALL provide modern JavaScript (ES6+) coding standards.

#### Scenario: Variable declarations
- GIVEN JavaScript variables
- WHEN declaring variables
- THEN const MUST be used by default
- AND let SHOULD be used when reassignment is needed
- AND var MUST NOT be used
- AND variables SHOULD be declared at the top of their scope

#### Scenario: Function declarations
- GIVEN JavaScript functions
- WHEN defining functions
- THEN arrow functions SHOULD be used for callbacks and short functions
- AND function declarations SHOULD be used for named functions
- AND default parameters SHOULD be used instead of checking for undefined
- AND rest parameters SHOULD be used instead of arguments object

#### Scenario: Modern JavaScript features
- GIVEN JavaScript code
- WHEN writing modern JavaScript
- THEN template literals SHOULD be used for string interpolation
- AND destructuring SHOULD be used for objects and arrays
- AND spread operator SHOULD be used for copying and merging
- AND optional chaining (?.) SHOULD be used for safe property access
- AND nullish coalescing (??) SHOULD be used for default values

### Requirement: JavaScript Code Organization
The module SHALL provide JavaScript code organization patterns.

#### Scenario: Module organization
- GIVEN JavaScript modules
- WHEN organizing code
- THEN ES6 modules (import/export) MUST be used
- AND one module per file SHOULD be the default
- AND named exports SHOULD be preferred over default exports
- AND circular dependencies MUST be avoided

#### Scenario: Code structure
- GIVEN JavaScript files
- WHEN structuring code
- THEN imports MUST come first
- AND constants SHOULD be defined near the top
- AND functions SHOULD be organized logically
- AND related functions SHOULD be grouped together

### Requirement: DOM Manipulation
The module SHALL provide DOM manipulation best practices.

#### Scenario: DOM queries
- GIVEN DOM element selection
- WHEN querying the DOM
- THEN querySelector/querySelectorAll SHOULD be preferred
- AND DOM queries SHOULD be cached when used multiple times
- AND data attributes SHOULD be used for JS hooks (data-js-*)

#### Scenario: Event handling
- GIVEN event listeners
- WHEN handling events
- THEN addEventListener MUST be used (not inline handlers)
- AND event delegation SHOULD be used for dynamic elements
- AND event listeners SHOULD be removed when no longer needed
- AND passive event listeners SHOULD be used for scroll/touch events

### Requirement: Async JavaScript
The module SHALL provide asynchronous JavaScript patterns.

#### Scenario: Promises and async/await
- GIVEN asynchronous operations
- WHEN handling async code
- THEN async/await SHOULD be preferred over raw promises
- AND promises SHOULD be preferred over callbacks
- AND Promise.all SHOULD be used for parallel operations
- AND errors MUST be handled with try/catch or .catch()

#### Scenario: Fetch API
- GIVEN HTTP requests
- WHEN making API calls
- THEN Fetch API SHOULD be used
- AND response status SHOULD be checked
- AND errors SHOULD be handled appropriately
- AND request/response interceptors SHOULD be implemented when needed

### Requirement: Error Handling
The module SHALL provide JavaScript error handling patterns.

#### Scenario: Error handling
- GIVEN JavaScript code that may error
- WHEN handling errors
- THEN try/catch SHOULD be used for synchronous code
- AND .catch() or try/catch SHOULD be used for async code
- AND errors SHOULD be logged appropriately
- AND user-friendly error messages SHOULD be displayed

### Requirement: Performance Best Practices
The module SHALL provide web performance guidelines.

#### Scenario: JavaScript performance
- GIVEN JavaScript code
- WHEN optimizing performance
- THEN debounce/throttle SHOULD be used for frequent events
- AND requestAnimationFrame SHOULD be used for animations
- AND Web Workers SHOULD be considered for heavy computations
- AND code splitting SHOULD be used for large applications

#### Scenario: CSS performance
- GIVEN CSS styles
- WHEN optimizing performance
- THEN CSS SHOULD be minified for production
- AND critical CSS SHOULD be inlined
- AND unused CSS SHOULD be removed
- AND will-change SHOULD be used sparingly

#### Scenario: HTML performance
- GIVEN HTML documents
- WHEN optimizing performance
- THEN images SHOULD be optimized and use appropriate formats
- AND lazy loading SHOULD be used for images (loading="lazy")
- AND preload/prefetch SHOULD be used for critical resources
- AND scripts SHOULD use defer or async attributes

### Requirement: Code Quality and Tooling
The module SHALL provide guidelines for code quality tools.

#### Scenario: Linting and formatting
- GIVEN HTML/CSS/JS code
- WHEN ensuring code quality
- THEN ESLint SHOULD be used for JavaScript linting
- AND Prettier SHOULD be used for code formatting
- AND Stylelint SHOULD be used for CSS linting
- AND HTMLHint or similar SHOULD be used for HTML validation

### Requirement: Browser Compatibility
The module SHALL provide browser compatibility guidelines.

#### Scenario: Feature detection
- GIVEN modern web features
- WHEN ensuring compatibility
- THEN feature detection SHOULD be used (not browser detection)
- AND polyfills SHOULD be provided for unsupported features
- AND graceful degradation SHOULD be implemented
- AND progressive enhancement SHOULD be the default approach

### Requirement: Module Metadata
The module SHALL include proper metadata in `module.json`.

#### Scenario: Module configuration
- GIVEN the HTML/CSS/JS standards module
- WHEN configuring the module
- THEN `module.json` MUST include name, version, description
- AND version MUST start at "1.0.0"
- AND type MUST be "coding-standards"
- AND language MUST be "html-css-js"
- AND character count MUST be calculated and included

## Module Contents

The module SHALL include the following files:

### Required Files
- `module.json` - Module metadata and configuration
- `README.md` - Module overview and usage instructions
- `rules/html-standards.md` - Semantic HTML and accessibility
- `rules/css-standards.md` - CSS naming, organization, and best practices
- `rules/css-modern-features.md` - CSS Grid, Flexbox, custom properties
- `rules/javascript-standards.md` - Modern JavaScript (ES6+) standards
- `rules/dom-manipulation.md` - DOM queries and event handling
- `rules/async-patterns.md` - Promises, async/await, Fetch API
- `rules/performance.md` - Performance optimization techniques
- `rules/tooling.md` - Linting, formatting, and build tools
- `examples/html-examples.html` - Semantic HTML examples
- `examples/css-examples.css` - CSS best practices examples
- `examples/javascript-examples.js` - Modern JavaScript examples

### Optional Files
- `examples/responsive-layout.html` - Responsive design example
- `examples/async-examples.js` - Async/await examples
- `examples/dom-examples.js` - DOM manipulation examples

## Character Count Target

The module SHOULD target approximately 25,000-35,000 characters to cover HTML, CSS, and JavaScript comprehensively.

