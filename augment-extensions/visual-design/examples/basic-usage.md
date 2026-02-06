# Basic Usage Example

## Overview

This example demonstrates the fundamental workflow for using the Visual Design module with Augment AI.

## Scenario

**Goal**: Generate a modern landing page design using Google Material 3 Expressive style.

**Requirements**:
- Clean, modern aesthetic
- Accessible color contrast
- Responsive layout
- Mobile-first approach

## Step-by-Step Workflow

### Step 1: Query the Module

```bash
augx show visual-design
```

This loads the core design elements, principles, and vendor styles into the AI context.

### Step 2: Select Vendor Style

The module uses default priority: **google → microsoft → amazon**

For this example, we'll use Google Modern (Material 3 Expressive):

```typescript
import { defaultStyleSelector } from './style-selector';
import { GOOGLE_MODERN } from './domains/web-page-styles/google-modern';

// Get the default vendor style (Google)
const vendorStyle = defaultStyleSelector.selectVendorStyle();
// Returns: GOOGLE_MODERN

// Or explicitly request Google
const googleStyle = defaultStyleSelector.selectVendorStyle('google');
```

### Step 3: Apply Design Elements

#### Color Palette

```css
:root {
  /* Primary Colors (Material 3 Dynamic Color) */
  --color-primary: #6750A4;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #EADDFF;
  --color-on-primary-container: #21005D;

  /* Secondary Colors */
  --color-secondary: #625B71;
  --color-on-secondary: #FFFFFF;

  /* Neutral Colors */
  --color-surface: #FFFBFE;
  --color-on-surface: #1C1B1F;
  --color-outline: #79747E;

  /* Semantic Colors */
  --color-error: #B3261E;
  --color-success: #4CAF50;
}
```

#### Typography

```css
/* Google Sans for headings, Roboto for body */
@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500&display=swap');

:root {
  --font-heading: 'Google Sans', sans-serif;
  --font-body: 'Roboto', sans-serif;

  /* Type Scale */
  --font-size-h1: 3.5rem;    /* 56px */
  --font-size-h2: 2.75rem;   /* 44px */
  --font-size-h3: 2rem;      /* 32px */
  --font-size-body: 1rem;    /* 16px */
  --font-size-caption: 0.875rem; /* 14px */

  /* Line Heights */
  --line-height-heading: 1.2;
  --line-height-body: 1.5;
}
```

#### Layout (Responsive Grid)

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Responsive breakpoints */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 20px;
  }
}
```

### Step 4: Apply Design Principles

#### Hierarchy

```html
<header>
  <h1>Welcome to Our Product</h1>
  <p class="subtitle">The best solution for your needs</p>
</header>

<section>
  <h2>Features</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <h3>Fast</h3>
      <p>Lightning-fast performance</p>
    </div>
  </div>
</section>
```

#### Contrast (WCAG AA: 4.5:1 for text)

```css
/* Ensure sufficient contrast */
.text-on-primary {
  color: #FFFFFF; /* White on #6750A4 = 7.2:1 ✓ */
}

.text-on-surface {
  color: #1C1B1F; /* Dark on #FFFBFE = 15.8:1 ✓ */
}
```

### Step 5: Generate Output

**HTML Structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Landing Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="hero">
    <div class="container">
      <h1>Transform Your Workflow</h1>
      <p class="subtitle">Powerful tools for modern teams</p>
      <button class="cta-button">Get Started</button>
    </div>
  </header>

  <main>
    <section class="features">
      <div class="container">
        <h2>Why Choose Us</h2>
        <div class="grid">
          <div class="feature-card">
            <h3>Fast</h3>
            <p>Lightning-fast performance</p>
          </div>
          <!-- More feature cards -->
        </div>
      </div>
    </section>
  </main>
</body>
</html>
```

## Result

A modern, accessible landing page following Google Material 3 Expressive design principles with:
- ✅ Dynamic color theming
- ✅ Proper typography hierarchy
- ✅ Responsive grid layout
- ✅ WCAG AA contrast ratios
- ✅ Mobile-first approach
- ✅ Consistent spacing (8px grid)

## Next Steps

- Explore other vendor styles (Microsoft Fluent 2, Amazon Cloudscape)
- Try different domains (Web-app, Mobile, Print)
- Customize color palettes
- Add motion and elevation

