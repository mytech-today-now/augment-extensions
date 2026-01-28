# Tooling and Code Quality

## Overview

This guide provides recommendations for linting, formatting, and browser compatibility tools to maintain code quality in HTML, CSS, and JavaScript projects.

---

## JavaScript Linting

### ESLint

**RECOMMENDED**: Use ESLint for JavaScript linting:

```bash
# Install ESLint
npm install --save-dev eslint

# Initialize configuration
npx eslint --init
```

**Configuration** (`.eslintrc.json`):

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "warn",
    "no-console": "warn",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

**Usage**:

```bash
# Lint files
npx eslint src/**/*.js

# Auto-fix issues
npx eslint src/**/*.js --fix
```

### Recommended ESLint Rules

```json
{
  "rules": {
    // Variables
    "no-var": "error",
    "prefer-const": "error",
    "no-unused-vars": "error",
    
    // Best Practices
    "eqeqeq": ["error", "always"],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-with": "error",
    
    // ES6+
    "prefer-arrow-callback": "warn",
    "prefer-template": "warn",
    "prefer-destructuring": "warn",
    "object-shorthand": "warn",
    
    // Style
    "curly": ["error", "all"],
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "never"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

---

## Code Formatting

### Prettier

**RECOMMENDED**: Use Prettier for consistent code formatting:

```bash
# Install Prettier
npm install --save-dev prettier

# Create configuration
echo {} > .prettierrc.json
```

**Configuration** (`.prettierrc.json`):

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Usage**:

```bash
# Format files
npx prettier --write "src/**/*.{js,css,html}"

# Check formatting
npx prettier --check "src/**/*.{js,css,html}"
```

### Prettier + ESLint Integration

**RECOMMENDED**: Integrate Prettier with ESLint:

```bash
# Install integration packages
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

**ESLint Configuration**:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

---

## CSS Linting

### Stylelint

**RECOMMENDED**: Use Stylelint for CSS linting:

```bash
# Install Stylelint
npm install --save-dev stylelint stylelint-config-standard
```

**Configuration** (`.stylelintrc.json`):

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "max-nesting-depth": 3,
    "no-descending-specificity": true,
    "declaration-no-important": true,
    "color-hex-length": "short",
    "color-named": "never",
    "font-family-name-quotes": "always-where-recommended",
    "function-url-quotes": "always",
    "number-leading-zero": "always",
    "unit-allowed-list": ["px", "em", "rem", "%", "vh", "vw", "s", "ms", "deg"]
  }
}
```

**Usage**:

```bash
# Lint CSS files
npx stylelint "src/**/*.css"

# Auto-fix issues
npx stylelint "src/**/*.css" --fix
```

---

## HTML Validation

### HTMLHint

**RECOMMENDED**: Use HTMLHint for HTML validation:

```bash
# Install HTMLHint
npm install --save-dev htmlhint
```

**Configuration** (`.htmlhintrc`):

```json
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true,
  "title-require": true,
  "alt-require": true,
  "doctype-html5": true,
  "id-class-value": "dash",
  "style-disabled": true,
  "inline-style-disabled": true,
  "inline-script-disabled": true,
  "space-tab-mixed-disabled": "space",
  "attr-unsafe-chars": true
}
```

**Usage**:

```bash
# Validate HTML files
npx htmlhint "src/**/*.html"
```

---

## Browser Compatibility

### Feature Detection

**RECOMMENDED**: Use feature detection instead of browser detection:

```javascript
// ✅ GOOD: Feature detection
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(callback);
  observer.observe(element);
} else {
  // Fallback or polyfill
  loadPolyfill();
}

// Check for CSS support
if (CSS.supports('display', 'grid')) {
  element.classList.add('grid-layout');
} else {
  element.classList.add('flexbox-layout');
}

// ❌ BAD: Browser detection
if (navigator.userAgent.includes('Chrome')) {
  // Unreliable and fragile
}
```

### Polyfills

**RECOMMENDED**: Provide polyfills for unsupported features:

```javascript
// ✅ GOOD: Conditional polyfill loading
async function loadPolyfills() {
  const polyfills = [];

  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }

  if (!('Promise' in window)) {
    polyfills.push(import('promise-polyfill'));
  }

  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }

  await Promise.all(polyfills);
}

// Load polyfills before app initialization
loadPolyfills().then(() => {
  initializeApp();
});
```

**Popular Polyfill Services**:
- [Polyfill.io](https://polyfill.io/) - Automatic polyfills based on user agent
- [core-js](https://github.com/zloirock/core-js) - Comprehensive polyfills

### Graceful Degradation

**RECOMMENDED**: Implement graceful degradation:

```javascript
// ✅ GOOD: Graceful degradation
function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    // Modern approach
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
        }
      });
    });

    images.forEach(img => observer.observe(img));
  } else {
    // Fallback: Load all images immediately
    images.forEach(img => loadImage(img));
  }
}
```

### Progressive Enhancement

**RECOMMENDED**: Build with progressive enhancement:

```html
<!-- ✅ GOOD: Progressive enhancement -->
<!-- Base HTML works without JavaScript -->
<form action="/submit" method="post">
  <input type="text" name="query" required>
  <button type="submit">Search</button>
</form>

<script>
  // Enhance with JavaScript
  const form = document.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const results = await searchAPI(formData.get('query'));
    displayResults(results);
  });
</script>
```

### Autoprefixer

**RECOMMENDED**: Use Autoprefixer for vendor prefixes:

```bash
# Install Autoprefixer
npm install --save-dev autoprefixer postcss postcss-cli
```

**PostCSS Configuration** (`postcss.config.js`):

```javascript
module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'not dead'
      ]
    })
  ]
};
```

**Usage**:

```bash
# Process CSS with Autoprefixer
npx postcss src/styles.css -o dist/styles.css
```

**Input**:

```css
.element {
  display: flex;
  user-select: none;
}
```

**Output**:

```css
.element {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

---

## Build Tools Integration

### Package.json Scripts

**RECOMMENDED**: Add scripts for common tasks:

```json
{
  "scripts": {
    "lint": "npm run lint:js && npm run lint:css && npm run lint:html",
    "lint:js": "eslint 'src/**/*.js'",
    "lint:css": "stylelint 'src/**/*.css'",
    "lint:html": "htmlhint 'src/**/*.html'",
    "format": "prettier --write 'src/**/*.{js,css,html}'",
    "format:check": "prettier --check 'src/**/*.{js,css,html}'",
    "fix": "npm run lint:js -- --fix && npm run lint:css -- --fix",
    "validate": "npm run lint && npm run format:check"
  }
}
```

### Pre-commit Hooks

**RECOMMENDED**: Use Husky and lint-staged for pre-commit hooks:

```bash
# Install Husky and lint-staged
npm install --save-dev husky lint-staged
npx husky install
```

**Package.json Configuration**:

```json
{
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.css": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.html": [
      "htmlhint",
      "prettier --write"
    ]
  }
}
```

**Husky Hook** (`.husky/pre-commit`):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

---

## Editor Integration

### VS Code

**RECOMMENDED**: Configure VS Code for automatic linting and formatting:

**Extensions**:
- ESLint
- Prettier - Code formatter
- Stylelint
- HTMLHint

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "stylelint.validate": [
    "css",
    "scss"
  ]
}
```

---

## Summary

**Key Tools**:

1. **ESLint** - JavaScript linting
2. **Prettier** - Code formatting
3. **Stylelint** - CSS linting
4. **HTMLHint** - HTML validation
5. **Autoprefixer** - Vendor prefixes
6. **Husky + lint-staged** - Pre-commit hooks

**Best Practices**:

1. Use **feature detection** over browser detection
2. Provide **polyfills** for unsupported features
3. Implement **graceful degradation**
4. Build with **progressive enhancement**
5. Use **Autoprefixer** for vendor prefixes
6. Set up **pre-commit hooks** for code quality
7. Configure **editor integration** for automatic fixes
8. Run **validation** in CI/CD pipeline

**Workflow**:

1. Write code
2. Editor auto-formats on save (Prettier)
3. Editor shows linting errors (ESLint, Stylelint)
4. Pre-commit hook validates and fixes code
5. CI/CD runs full validation



