# Vendor Style Comparison

## Overview

This example compares the three major vendor design systems: Google Material 3 Expressive, Microsoft Fluent 2, and Amazon Cloudscape.

## Quick Comparison Table

| Aspect | Google Material 3 | Microsoft Fluent 2 | Amazon Cloudscape |
|--------|-------------------|-------------------|-------------------|
| **Primary Use** | Consumer apps, web | Enterprise, Windows | AWS dashboards, enterprise |
| **Color System** | Dynamic color theming | Adaptive tokens | Neutral with blue accents |
| **Typography** | Google Sans, Roboto | Segoe UI Variable | Amazon Ember |
| **Layout** | 12-column grid | Responsive grid | Component-heavy |
| **Motion** | Springy, expressive | Subtle, professional | Minimal, functional |
| **Elevation** | Subtle shadows | Layered depth | Flat with borders |
| **Best For** | Modern web apps | Windows apps, enterprise | Data dashboards, AWS tools |

## 1. Google Material 3 Expressive

### Characteristics

```typescript
import { GOOGLE_MODERN } from './domains/web-page-styles/google-modern';

// Key features:
// - Dynamic color theming with tonal palettes
// - Rounded corners (8px, 12px, 16px)
// - Springy motion (cubic-bezier(0.2, 0, 0, 1))
// - Subtle elevation shadows
// - Accessibility-first (WCAG AA)
```

### When to Use

- **Consumer-facing applications**: Mobile apps, web apps
- **Modern, expressive designs**: Colorful, dynamic interfaces
- **Google ecosystem**: Android, Chrome, Google Workspace
- **Accessibility priority**: WCAG AA/AAA compliance

### Example: Landing Page Hero

```css
.hero {
  background: linear-gradient(135deg, #6750A4 0%, #EADDFF 100%);
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hero h1 {
  font-family: 'Google Sans', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #FFFFFF;
}

.cta-button {
  background: #6750A4;
  color: #FFFFFF;
  border-radius: 20px;
  padding: 12px 24px;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.cta-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(103, 80, 164, 0.3);
}
```

## 2. Microsoft Fluent 2

### Characteristics

```typescript
import { MICROSOFT_FLUENT } from './domains/web-page-styles/microsoft-fluent';

// Key features:
// - Adaptive color tokens (light/dark mode)
// - Acrylic/Mica materials (transparency, blur)
// - Segoe UI Variable (variable font)
// - Layered elevation (depth)
// - Cross-platform consistency
```

### When to Use

- **Enterprise applications**: Business tools, productivity apps
- **Windows ecosystem**: Windows 11, Microsoft 365
- **Professional interfaces**: Clean, corporate aesthetics
- **Cross-platform apps**: Windows, web, mobile

### Example: Dashboard Card

```css
.dashboard-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(30px); /* Acrylic material */
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dashboard-card h2 {
  font-family: 'Segoe UI Variable', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #242424;
}

.dashboard-card:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-out;
}
```

## 3. Amazon Cloudscape

### Characteristics

```typescript
import { AMAZON_CLOUDSCAPE } from './domains/web-page-styles/amazon-cloudscape';

// Key features:
// - Neutral color palette (grays, blues)
// - Amazon Ember typography
// - Component-heavy patterns
// - Data-dense layouts
// - Enterprise dashboard focus
```

### When to Use

- **AWS dashboards**: Cloud management interfaces
- **Data-heavy applications**: Tables, charts, analytics
- **Enterprise tools**: B2B SaaS, admin panels
- **Amazon ecosystem**: AWS, Amazon services

### Example: Data Table

```css
.data-table {
  background: #FFFFFF;
  border: 1px solid #D5DBDB;
  border-radius: 4px;
  overflow: hidden;
}

.data-table th {
  font-family: 'Amazon Ember', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #16191F;
  background: #FAFAFA;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 2px solid #D5DBDB;
}

.data-table td {
  font-family: 'Amazon Ember', sans-serif;
  font-size: 0.875rem;
  color: #16191F;
  padding: 12px 16px;
  border-bottom: 1px solid #EAEDED;
}

.data-table tr:hover {
  background: #F9F9F9;
}
```

## Side-by-Side Comparison

### Button Styles

**Google Material 3**:
```css
.button-google {
  background: #6750A4;
  color: #FFFFFF;
  border-radius: 20px;
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Microsoft Fluent 2**:
```css
.button-microsoft {
  background: #0078D4;
  color: #FFFFFF;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 600;
  border: 1px solid transparent;
}
```

**Amazon Cloudscape**:
```css
.button-amazon {
  background: #0972D3;
  color: #FFFFFF;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 700;
  border: none;
}
```

## Choosing the Right Vendor

### Decision Tree

1. **Building for AWS/enterprise dashboards?** → Amazon Cloudscape
2. **Building for Windows/Microsoft ecosystem?** → Microsoft Fluent 2
3. **Building consumer apps or modern web?** → Google Material 3

### Hybrid Approach

You can mix vendor styles for different parts of your application:

```typescript
import { createStyleSelector } from './style-selector';

// Use Google for public-facing pages
const publicSelector = createStyleSelector(['google']);

// Use Amazon for admin dashboard
const adminSelector = createStyleSelector(['amazon']);

// Use Microsoft for Windows desktop app
const desktopSelector = createStyleSelector(['microsoft']);
```

## Next Steps

- Explore detailed vendor documentation
- Try each vendor style with your use case
- Customize vendor styles with your brand colors
- Test accessibility across all vendors

