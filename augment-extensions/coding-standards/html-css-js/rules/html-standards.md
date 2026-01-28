# HTML Standards

## Overview

This guide provides comprehensive HTML standards focusing on semantic markup, accessibility, and document structure for modern web development.

---

## Semantic HTML

### Use Semantic Elements

**DO** use semantic HTML5 elements:

```html
<!-- ✅ GOOD: Semantic structure -->
<header>
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <section>
      <h2>Section Heading</h2>
      <p>Content...</p>
    </section>
  </article>
  
  <aside>
    <h2>Related Links</h2>
    <ul>...</ul>
  </aside>
</main>

<footer>
  <p>&copy; 2026 Company Name</p>
</footer>
```

**DON'T** use generic divs when semantic elements exist:

```html
<!-- ❌ BAD: Non-semantic structure -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="article">...</div>
</div>
```

### Semantic Element Guidelines

- **`<header>`** - Introductory content or navigation
- **`<nav>`** - Navigation links
- **`<main>`** - Main content (one per page)
- **`<article>`** - Self-contained content
- **`<section>`** - Thematic grouping of content
- **`<aside>`** - Tangentially related content
- **`<footer>`** - Footer content

### Heading Hierarchy

**DO** maintain logical heading hierarchy:

```html
<!-- ✅ GOOD: Logical hierarchy -->
<h1>Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
```

**DON'T** skip heading levels:

```html
<!-- ❌ BAD: Skipped h2 -->
<h1>Page Title</h1>
  <h3>Subsection</h3>
```

### Lists

Use appropriate list elements:

```html
<!-- Unordered list -->
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Ordered list -->
<ol>
  <li>Step 1</li>
  <li>Step 2</li>
</ol>

<!-- Description list -->
<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

---

## Accessibility

### Alt Text for Images

**REQUIRED**: All images must have alt attributes:

```html
<!-- ✅ GOOD: Descriptive alt text -->
<img src="logo.png" alt="Company Logo">
<img src="chart.png" alt="Sales chart showing 20% growth in Q4">

<!-- Decorative images -->
<img src="decoration.png" alt="">
```

### Form Labels

**REQUIRED**: All form inputs must have associated labels:

```html
<!-- ✅ GOOD: Explicit label association -->
<label for="email">Email Address:</label>
<input type="email" id="email" name="email" required>

<!-- Alternative: Implicit association -->
<label>
  Email Address:
  <input type="email" name="email" required>
</label>
```

### ARIA Attributes

Use ARIA when semantic HTML is insufficient:

```html
<!-- Button that looks like a link -->
<button aria-label="Close dialog" class="close-btn">×</button>

<!-- Custom dropdown -->
<div role="combobox" aria-expanded="false" aria-haspopup="listbox">
  <input type="text" aria-autocomplete="list">
</div>

<!-- Live region for dynamic content -->
<div role="status" aria-live="polite" aria-atomic="true">
  Loading...
</div>
```

### Language and Title

**REQUIRED**: Set language and page title:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Descriptive Page Title - Site Name</title>
</head>
```

---

## Document Structure

### Required Meta Tags

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Character encoding (REQUIRED) -->
  <meta charset="UTF-8">
  
  <!-- Viewport for responsive design (REQUIRED) -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Page title (REQUIRED) -->
  <title>Page Title</title>
  
  <!-- Description (RECOMMENDED) -->
  <meta name="description" content="Page description for SEO">
</head>
<body>
  <!-- Content -->

  <!-- Scripts at end of body or with defer/async -->
  <script src="app.js" defer></script>
</body>
</html>
```

### Script Loading

**RECOMMENDED**: Place scripts before closing `</body>` tag or use `defer`/`async`:

```html
<!-- Option 1: Scripts at end of body -->
<body>
  <!-- Content -->
  <script src="app.js"></script>
</body>

<!-- Option 2: Scripts in head with defer -->
<head>
  <script src="app.js" defer></script>
</head>

<!-- Option 3: Async for independent scripts -->
<head>
  <script src="analytics.js" async></script>
</head>
```

**Differences**:
- **`defer`**: Downloads in parallel, executes after DOM is ready, maintains order
- **`async`**: Downloads in parallel, executes immediately when ready, no order guarantee

---

## Best Practices

### Use Divs and Spans Sparingly

**DO** use semantic elements first:

```html
<!-- ✅ GOOD -->
<article>
  <h2>Title</h2>
  <p>Content</p>
</article>

<!-- ❌ BAD -->
<div class="article">
  <div class="title">Title</div>
  <div class="content">Content</div>
</div>
```

**WHEN TO USE**:
- **`<div>`**: Generic container when no semantic element fits
- **`<span>`**: Inline styling or scripting hooks

### Data Attributes for JavaScript

Use `data-*` attributes for JavaScript hooks:

```html
<!-- ✅ GOOD: Separation of concerns -->
<button class="btn btn-primary" data-js-submit>Submit</button>

<script>
  const submitBtn = document.querySelector('[data-js-submit]');
</script>
```

### Validation

**REQUIRED**: HTML must be valid:

- Use [W3C Validator](https://validator.w3.org/)
- Use HTMLHint or similar linting tools
- Close all tags properly
- Use lowercase for element and attribute names

---

## Common Patterns

### Navigation

```html
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Forms

```html
<form action="/submit" method="post">
  <fieldset>
    <legend>Personal Information</legend>

    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </fieldset>

  <button type="submit">Submit</button>
</form>
```

### Tables

```html
<table>
  <caption>Sales Data Q4 2026</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>October</td>
      <td>$50,000</td>
    </tr>
  </tbody>
</table>
```

---

## Summary

**Key Principles**:
1. Use semantic HTML elements
2. Maintain logical heading hierarchy
3. Ensure accessibility (alt text, labels, ARIA)
4. Include required meta tags
5. Use data attributes for JavaScript hooks
6. Validate HTML markup


