# CSS Standards

## Overview

This guide provides CSS standards covering naming conventions, organization, selectors, and responsive design for maintainable and scalable stylesheets.

---

## Naming Conventions

### Kebab-Case for Class Names

**REQUIRED**: Use kebab-case for all class names:

```css
/* ✅ GOOD */
.user-profile { }
.nav-menu-item { }
.btn-primary { }

/* ❌ BAD */
.userProfile { }  /* camelCase */
.user_profile { } /* snake_case */
.UserProfile { }  /* PascalCase */
```

### BEM (Block Element Modifier)

**RECOMMENDED**: Use BEM for component-based naming:

```css
/* Block */
.card { }

/* Element (part of block) */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier (variation of block or element) */
.card--featured { }
.card__header--large { }
```

**Example**:

```html
<div class="card card--featured">
  <div class="card__header card__header--large">
    <h2 class="card__title">Title</h2>
  </div>
  <div class="card__body">
    <p>Content</p>
  </div>
</div>
```

### Descriptive and Semantic Names

**DO** use descriptive, semantic class names:

```css
/* ✅ GOOD: Describes purpose */
.primary-navigation { }
.user-avatar { }
.error-message { }

/* ❌ BAD: Describes appearance */
.red-text { }
.big-box { }
.left-column { }
```

### Avoid IDs for Styling

**RECOMMENDED**: Use IDs for JavaScript hooks only, not styling:

```css
/* ✅ GOOD */
.header { }

/* ❌ BAD */
#header { }
```

**REASON**: IDs have high specificity and are harder to override.

---

## CSS Organization

### Component-Based Organization

**RECOMMENDED**: Organize CSS by component or feature:

```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── button.css
│   ├── card.css
│   └── navigation.css
├── layouts/
│   ├── grid.css
│   └── header.css
└── utilities/
    └── spacing.css
```

### Separate Global and Component Styles

```css
/* global.css - Global styles */
:root {
  --color-primary: #007bff;
  --spacing-unit: 8px;
}

* {
  box-sizing: border-box;
}

/* button.css - Component styles */
.btn {
  padding: var(--spacing-unit);
  background: var(--color-primary);
}
```

### CSS Custom Properties (Variables)

**RECOMMENDED**: Use CSS custom properties for theming:

```css
/* ✅ GOOD: Define at :root */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --font-family-base: 'Helvetica Neue', sans-serif;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

.btn {
  background: var(--color-primary);
  padding: var(--spacing-md);
  font-family: var(--font-family-base);
}

/* Provide fallbacks */
.btn {
  background: var(--color-primary, #007bff);
}
```

### Avoid @import

**DON'T** use `@import` in CSS (use build tools instead):

```css
/* ❌ BAD: Blocks rendering */
@import url('typography.css');

/* ✅ GOOD: Use build tools or multiple <link> tags */
```

**REASON**: `@import` blocks parallel downloads and slows page load.

---

## CSS Selectors

### Keep Specificity Low

**DO** keep specificity as low as possible:

```css
/* ✅ GOOD: Low specificity */
.nav-item { }
.nav-item.active { }

/* ❌ BAD: High specificity */
nav ul li a.nav-item { }
#header .nav ul li a { }
```

### Limit Nesting

**RECOMMENDED**: Limit nesting to 3 levels maximum:

```css
/* ✅ GOOD: Shallow nesting */
.card { }
.card__header { }
.card__title { }

/* ❌ BAD: Deep nesting */
.card .card__header .card__title span.text { }
```

### Avoid Universal Selector

**USE SPARINGLY**: Universal selector (`*`) can impact performance:

```css
/* ✅ ACCEPTABLE: Box-sizing reset */
* {
  box-sizing: border-box;
}

/* ❌ BAD: Overly broad */
* {
  margin: 0;
  padding: 0;
}
```

### Avoid !important

**AVOID**: Use `!important` only for utilities:

```css
/* ✅ ACCEPTABLE: Utility class */
.hidden {
  display: none !important;
}

/* ❌ BAD: Regular styling */
.btn {
  background: blue !important;
}
```

---

## Responsive Design

### Mobile-First Approach

**RECOMMENDED**: Start with mobile styles, add complexity for larger screens:

```css
/* ✅ GOOD: Mobile-first */
.container {
  padding: 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
}

/* ❌ BAD: Desktop-first */
.container {
  padding: 32px;
}

@media (max-width: 1024px) {
  .container {
    padding: 24px;
  }
}
```

### Media Query Units

**RECOMMENDED**: Use `em` or `rem` units for media queries:

```css
/* ✅ GOOD: em-based (more accessible) */
@media (min-width: 48em) { /* 768px at 16px base */ }
@media (min-width: 64em) { /* 1024px at 16px base */ }

/* ❌ ACCEPTABLE: px-based (less flexible) */
@media (min-width: 768px) { }
```

### Consistent Breakpoints

**RECOMMENDED**: Define consistent breakpoints:

```css
:root {
  --breakpoint-sm: 36em;   /* 576px */
  --breakpoint-md: 48em;   /* 768px */
  --breakpoint-lg: 64em;   /* 1024px */
  --breakpoint-xl: 80em;   /* 1280px */
}

/* Use in media queries */
@media (min-width: 48em) { /* md */ }
@media (min-width: 64em) { /* lg */ }
```

### CSS Grid and Flexbox

**RECOMMENDED**: Prefer Grid and Flexbox over floats:

```css
/* ✅ GOOD: Flexbox for 1D layouts */
.nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* ✅ GOOD: Grid for 2D layouts */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

/* ❌ BAD: Floats (legacy) */
.column {
  float: left;
  width: 50%;
}
```

---

## Code Quality

### Formatting

**RECOMMENDED**: Use consistent formatting:

```css
/* ✅ GOOD: Consistent formatting */
.selector {
  property: value;
  another-property: value;
}

.another-selector,
.multiple-selector {
  property: value;
}

/* Use Prettier or Stylelint for automatic formatting */
```

### Comments

**RECOMMENDED**: Add comments for complex or non-obvious code:

```css
/* Component: Card
   Usage: Product listings, blog posts
   ========================================== */
.card {
  /* Prevent content overflow */
  overflow: hidden;
}

/* TODO: Refactor to use CSS Grid */
.legacy-layout {
  float: left;
}
```

### Property Order

**RECOMMENDED**: Group related properties:

```css
.element {
  /* Positioning */
  position: relative;
  top: 0;
  left: 0;

  /* Display & Box Model */
  display: flex;
  width: 100%;
  padding: 16px;
  margin: 0;

  /* Typography */
  font-size: 16px;
  line-height: 1.5;

  /* Visual */
  background: white;
  border: 1px solid gray;

  /* Misc */
  cursor: pointer;
}
```

---

## Best Practices

### Reset or Normalize

**RECOMMENDED**: Use a CSS reset or normalize:

```css
/* Option 1: Simple reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Option 2: Use normalize.css or modern-normalize */
```

### Avoid Inline Styles

**DON'T** use inline styles (use classes instead):

```html
<!-- ❌ BAD -->
<div style="color: red; font-size: 16px;">Text</div>

<!-- ✅ GOOD -->
<div class="error-text">Text</div>
```

### Use Shorthand Properties

**RECOMMENDED**: Use shorthand when appropriate:

```css
/* ✅ GOOD: Shorthand */
.element {
  margin: 10px 20px;
  padding: 10px;
  background: white url('bg.png') no-repeat center;
}

/* ❌ VERBOSE: Longhand */
.element {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}
```

### Vendor Prefixes

**RECOMMENDED**: Use autoprefixer instead of manual prefixes:

```css
/* ✅ GOOD: Let autoprefixer handle it */
.element {
  display: flex;
  user-select: none;
}

/* ❌ BAD: Manual prefixes */
.element {
  display: -webkit-flex;
  display: flex;
  -webkit-user-select: none;
  user-select: none;
}
```

---

## Summary

**Key Principles**:
1. Use kebab-case for class names
2. Consider BEM for component naming
3. Keep specificity low
4. Limit nesting to 3 levels
5. Use mobile-first responsive design
6. Prefer Grid/Flexbox over floats
7. Use CSS custom properties for theming
8. Avoid `!important` except for utilities
9. Use Stylelint for code quality



