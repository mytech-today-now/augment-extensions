# CSS Modern Features

## Overview

This guide covers modern CSS features that should be used in contemporary web development, including CSS custom properties (variables), CSS Grid, and Flexbox. These features provide powerful layout capabilities and maintainable styling patterns.

---

## CSS Custom Properties (Variables)

### Purpose

CSS custom properties allow you to define reusable values that can be referenced throughout your stylesheets, making it easier to maintain consistent design systems and enable dynamic theming.

### Defining Custom Properties

**Use `:root` for global variables**:

```css
:root {
  /* Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-lg: 18px;
  --line-height-base: 1.5;
  
  /* Borders */
  --border-radius: 4px;
  --border-width: 1px;
  --border-color: #dee2e6;
}
```

### Using Custom Properties

**Reference with `var()` function**:

```css
.button {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  font-family: var(--font-family-base);
}

.button--secondary {
  background-color: var(--secondary-color);
}
```

### Fallback Values

**Provide fallbacks for unsupported browsers**:

```css
.component {
  /* Fallback for browsers that don't support custom properties */
  color: #007bff;
  /* Modern browsers will use this */
  color: var(--primary-color, #007bff);
}
```

### Computed Values

**Use `calc()` with custom properties**:

```css
:root {
  --spacing-unit: 8px;
}

.container {
  padding: calc(var(--spacing-unit) * 2); /* 16px */
  margin: calc(var(--spacing-unit) * 3); /* 24px */
}
```

### Component-Scoped Variables

**Define variables within component scope**:

```css
.card {
  --card-padding: 16px;
  --card-bg: #ffffff;
  --card-border: 1px solid var(--border-color);
  
  padding: var(--card-padding);
  background: var(--card-bg);
  border: var(--card-border);
}

.card--compact {
  --card-padding: 8px;
}
```

---

## CSS Grid

### Purpose

CSS Grid is a two-dimensional layout system that excels at creating complex layouts with rows and columns. Use Grid for page-level layouts and components that require precise control over both dimensions.

### Basic Grid Container

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: var(--spacing-md);
}
```

### Grid Template Areas

**Use named grid areas for semantic layouts**:

```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 250px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: var(--spacing-md);
  min-height: 100vh;
}

.header {
  grid-area: header;
}

.sidebar {
  grid-area: sidebar;
}

.main {
  grid-area: main;
}

.footer {
  grid-area: footer;
}
```

### Responsive Grid

**Use auto-fit and minmax for responsive grids**:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}
```

### Grid Item Placement

```css
.grid-item {
  /* Span multiple columns */
  grid-column: span 2;
  
  /* Span multiple rows */
  grid-row: span 3;
  
  /* Explicit placement */
  grid-column: 1 / 3;
  grid-row: 2 / 4;
}
```

### Common Grid Patterns

**Equal columns**:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
```

**Sidebar layout**:
```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}
```

**Holy Grail layout**:
```css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "left content right"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

---

## Flexbox

### Purpose

Flexbox is a one-dimensional layout system that excels at distributing space and aligning items along a single axis (row or column). Use Flexbox for component-level layouts and simple alignment tasks.

### Basic Flex Container

```css
.flex-container {
  display: flex;
  flex-direction: row; /* row | column | row-reverse | column-reverse */
  justify-content: space-between; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  align-items: center; /* flex-start | flex-end | center | baseline | stretch */
  gap: var(--spacing-md);
}
```

### Flex Items

```css
.flex-item {
  flex: 1; /* Shorthand for flex-grow, flex-shrink, flex-basis */
  
  /* Or explicitly */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
}

.flex-item--fixed {
  flex: 0 0 200px; /* Don't grow, don't shrink, fixed 200px */
}
```

### Common Flexbox Patterns

**Horizontal centering**:
```css
.center-horizontal {
  display: flex;
  justify-content: center;
}
```

**Vertical centering**:
```css
.center-vertical {
  display: flex;
  align-items: center;
}
```

**Center both axes**:
```css
.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**Space between items**:
```css
.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Equal-width columns**:
```css
.equal-columns {
  display: flex;
  gap: var(--spacing-md);
}

.equal-columns > * {
  flex: 1;
}
```

**Responsive flex wrap**:
```css
.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.flex-wrap > * {
  flex: 1 1 300px; /* Grow, shrink, min-width 300px */
}
```

---

## Grid vs Flexbox: When to Use Each

### Use CSS Grid When:

✅ Creating two-dimensional layouts (rows AND columns)
✅ Building page-level layouts
✅ You need precise control over both axes
✅ Creating complex, asymmetric layouts
✅ Using named grid areas for semantic structure

**Example use cases**:
- Page layouts (header, sidebar, main, footer)
- Card grids with varying sizes
- Magazine-style layouts
- Dashboard layouts

### Use Flexbox When:

✅ Creating one-dimensional layouts (row OR column)
✅ Building component-level layouts
✅ Aligning items along a single axis
✅ Distributing space between items
✅ Simple responsive patterns

**Example use cases**:
- Navigation bars
- Button groups
- Form layouts
- Card content alignment
- Centering elements

---

## Browser Compatibility

### CSS Custom Properties

- **Supported**: All modern browsers (Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+)
- **Not supported**: IE 11 and below
- **Fallback strategy**: Provide static values before custom property declarations

```css
.component {
  color: #007bff; /* Fallback for IE */
  color: var(--primary-color); /* Modern browsers */
}
```

### CSS Grid

- **Supported**: All modern browsers (Chrome 57+, Firefox 52+, Safari 10.1+, Edge 16+)
- **Partial support**: IE 10-11 (with `-ms-` prefix and limited features)
- **Fallback strategy**: Use `@supports` for progressive enhancement

```css
.layout {
  /* Fallback for older browsers */
  display: block;
}

@supports (display: grid) {
  .layout {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Flexbox

- **Supported**: All modern browsers (Chrome 29+, Firefox 28+, Safari 9+, Edge 12+)
- **Partial support**: IE 10-11 (with bugs and `-ms-` prefix)
- **Fallback strategy**: Generally safe to use with vendor prefixes

---

## Best Practices

### DO

✅ Use CSS custom properties for design tokens (colors, spacing, typography)
✅ Use Grid for two-dimensional layouts
✅ Use Flexbox for one-dimensional layouts
✅ Provide fallbacks for older browsers when necessary
✅ Use `gap` property instead of margins for spacing in Grid/Flexbox
✅ Use semantic grid area names for clarity
✅ Combine Grid and Flexbox (Grid for layout, Flexbox for components)

### DON'T

❌ Don't use Grid when Flexbox is simpler and sufficient
❌ Don't use Flexbox for complex two-dimensional layouts
❌ Don't use custom properties for values that never change
❌ Don't forget fallbacks for critical layouts in older browsers
❌ Don't use floats or positioning for layouts (use Grid/Flexbox instead)
❌ Don't use tables for layout purposes

---

## Examples

See `examples/css-examples.css` for comprehensive examples of:
- CSS custom properties with theming
- CSS Grid layouts (page layout, card grid, dashboard)
- Flexbox patterns (navigation, forms, cards)
- Responsive designs combining Grid and Flexbox

---

## Resources

- [MDN: CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [MDN: CSS Flexible Box Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [CSS Tricks: A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS Tricks: A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Can I Use: CSS Grid](https://caniuse.com/css-grid)
- [Can I Use: Flexbox](https://caniuse.com/flexbox)
- [Can I Use: CSS Variables](https://caniuse.com/css-variables)

