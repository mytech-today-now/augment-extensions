# Asset Management

## Overview

Programmatic asset handling for marketing materials including colors, logos, fonts, and media files. Ensures consistency, accessibility, and efficient organization of brand assets.

---

## File Organization

### Directory Structure

```
assets/
├── brand/
│   ├── logos/
│   │   ├── primary/
│   │   ├── secondary/
│   │   └── variations/
│   ├── colors/
│   │   └── palettes.json
│   └── fonts/
│       ├── web/
│       └── print/
├── media/
│   ├── images/
│   │   ├── hero/
│   │   ├── thumbnails/
│   │   └── icons/
│   ├── videos/
│   └── audio/
└── templates/
    ├── email/
    ├── social/
    └── print/
```

### Naming Conventions

**Logos:**
- `{brand}-logo-{variant}-{size}.{ext}`
- Example: `acme-logo-primary-1200x600.svg`

**Images:**
- `{category}-{description}-{dimensions}.{ext}`
- Example: `hero-homepage-banner-1920x1080.jpg`

**Colors:**
- Use semantic names in code
- Example: `brand-primary`, `accent-blue`, `neutral-gray-100`

**Fonts:**
- `{family}-{weight}-{style}.{ext}`
- Example: `roboto-700-italic.woff2`

---

## Color Management

### Color Palette JSON Schema

```json
{
  "brand": {
    "primary": {
      "hex": "#0066CC",
      "rgb": "0, 102, 204",
      "cmyk": "100, 50, 0, 20",
      "pantone": "PMS 300 C",
      "usage": "Primary brand color for CTAs and headers"
    },
    "secondary": {
      "hex": "#FF6600",
      "rgb": "255, 102, 0",
      "cmyk": "0, 60, 100, 0",
      "pantone": "PMS 1655 C",
      "usage": "Accent color for highlights"
    }
  },
  "neutral": {
    "gray-100": "#F5F5F5",
    "gray-500": "#9E9E9E",
    "gray-900": "#212121"
  },
  "semantic": {
    "success": "#4CAF50",
    "warning": "#FFC107",
    "error": "#F44336",
    "info": "#2196F3"
  }
}
```

### Accessibility Requirements

- **Contrast Ratio:** Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- **Color Blindness:** Don't rely on color alone for information
- **Testing:** Use tools like WebAIM Contrast Checker

---

## Logo Management

### Logo Variants

**Required Variants:**
1. **Primary:** Full color, standard usage
2. **Secondary:** Simplified version for small sizes
3. **Monochrome:** Black, white, single-color versions
4. **Reversed:** For dark backgrounds

### Logo Formats

**Digital:**
- SVG (vector, preferred for web)
- PNG (transparent background, multiple sizes)
- WebP (optimized for web)

**Print:**
- EPS or AI (vector)
- High-res PNG/TIFF (300 DPI minimum)

### Logo Usage Rules

```yaml
logo_usage:
  minimum_size:
    digital: "120px width"
    print: "1 inch width"
  clear_space:
    rule: "Minimum clear space = height of logo"
  backgrounds:
    light: "Use primary logo"
    dark: "Use reversed logo"
    busy: "Use logo with background plate"
  prohibited:
    - "Stretching or distorting"
    - "Changing colors"
    - "Adding effects (shadows, gradients)"
    - "Placing on low-contrast backgrounds"
```

---

## Font Management

### Web Fonts

**Loading Strategy:**
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/roboto-400.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font face declaration -->
<style>
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto-400.woff2') format('woff2'),
       url('/fonts/roboto-400.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>
```

**Performance:**
- Use `font-display: swap` to prevent FOIT (Flash of Invisible Text)
- Subset fonts to include only needed characters
- Use WOFF2 format (best compression)

### Font Pairing

```json
{
  "typography": {
    "headings": {
      "family": "Montserrat",
      "weights": [600, 700],
      "usage": "H1-H6, display text"
    },
    "body": {
      "family": "Open Sans",
      "weights": [400, 600],
      "usage": "Paragraphs, UI text"
    }
  }
}
```

---

## Media Asset Management

### Image Optimization

**Formats:**
- **JPEG:** Photos, complex images (use 80-85% quality)
- **PNG:** Graphics with transparency, simple images
- **WebP:** Modern format, 25-35% smaller than JPEG
- **SVG:** Icons, logos, simple graphics

**Responsive Images:**
```html
<picture>
  <source srcset="hero-1920.webp" type="image/webp" media="(min-width: 1200px)">
  <source srcset="hero-1200.webp" type="image/webp" media="(min-width: 768px)">
  <source srcset="hero-768.webp" type="image/webp">
  <img src="hero-1200.jpg" alt="Hero banner" loading="lazy">
</picture>
```

**Image Sizes:**
```json
{
  "image_sizes": {
    "thumbnail": "150x150",
    "small": "300x300",
    "medium": "768x768",
    "large": "1200x1200",
    "hero": "1920x1080",
    "og_image": "1200x630"
  }
}
```

### Video Assets

**Formats:**
- **MP4 (H.264):** Universal compatibility
- **WebM:** Smaller file size, modern browsers
- **Poster Image:** Always provide fallback image

**Optimization:**
```json
{
  "video_settings": {
    "resolution": "1080p maximum",
    "bitrate": "5000 kbps for 1080p",
    "codec": "H.264 (MP4) or VP9 (WebM)",
    "audio": "AAC 128 kbps",
    "compression": "Two-pass encoding"
  }
}
```

---

## Asset Inventory System

### Metadata Schema

```json
{
  "asset_id": "img-hero-homepage-001",
  "type": "image",
  "category": "hero",
  "file": {
    "name": "hero-homepage-banner-1920x1080.jpg",
    "path": "/assets/media/images/hero/",
    "size": "245KB",
    "dimensions": "1920x1080",
    "format": "JPEG"
  },
  "metadata": {
    "title": "Homepage Hero Banner",
    "description": "Main hero image for homepage",
    "alt_text": "Team collaborating on project",
    "keywords": ["teamwork", "collaboration", "office"],
    "created_date": "2026-01-15",
    "created_by": "design-team",
    "license": "proprietary",
    "usage_rights": "internal-only"
  },
  "versions": [
    {
      "size": "1920x1080",
      "file": "hero-homepage-banner-1920x1080.jpg"
    },
    {
      "size": "1200x675",
      "file": "hero-homepage-banner-1200x675.jpg"
    },
    {
      "size": "768x432",
      "file": "hero-homepage-banner-768x432.jpg"
    }
  ],
  "usage": [
    {
      "location": "homepage",
      "url": "https://example.com",
      "date_added": "2026-01-20"
    }
  ]
}
```

---

## Version Control for Assets

### Git LFS (Large File Storage)

**Setup:**
```bash
# Install Git LFS
git lfs install

# Track asset types
git lfs track "*.psd"
git lfs track "*.ai"
git lfs track "*.mp4"
git lfs track "*.mov"

# Commit .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS for design assets"
```

### Asset Versioning

**Naming Convention:**
```
{asset-name}-v{major}.{minor}.{ext}
```

**Examples:**
- `logo-primary-v1.0.svg` → Initial version
- `logo-primary-v1.1.svg` → Minor update
- `logo-primary-v2.0.svg` → Major redesign

---

## CDN and Delivery

### CDN Configuration

```json
{
  "cdn": {
    "provider": "Cloudflare / CloudFront",
    "base_url": "https://cdn.example.com",
    "cache_control": {
      "images": "public, max-age=31536000, immutable",
      "fonts": "public, max-age=31536000, immutable",
      "videos": "public, max-age=86400"
    },
    "compression": {
      "gzip": true,
      "brotli": true
    }
  }
}
```

### Asset URLs

**Structure:**
```
https://cdn.example.com/{type}/{category}/{filename}
```

**Examples:**
- `https://cdn.example.com/images/hero/homepage-banner.jpg`
- `https://cdn.example.com/fonts/roboto-400.woff2`
- `https://cdn.example.com/logos/primary/logo.svg`

---

## Best Practices

### DO

✅ Use semantic naming for colors and assets
✅ Provide multiple formats (SVG, PNG, WebP)
✅ Optimize images before uploading (compress, resize)
✅ Use version control for all assets
✅ Document asset usage and licensing
✅ Implement lazy loading for images
✅ Use CDN for asset delivery
✅ Maintain asset inventory with metadata

### DON'T

❌ Hardcode color values in multiple places
❌ Use generic names like "image1.jpg"
❌ Upload unoptimized, full-resolution images
❌ Mix asset types in same directory
❌ Forget to provide alt text for images
❌ Use copyrighted assets without permission
❌ Serve assets from origin server without CDN

---

## Tools and Resources

### Asset Management Tools

- **DAM Systems:** Bynder, Brandfolder, Cloudinary
- **Image Optimization:** TinyPNG, ImageOptim, Squoosh
- **Color Tools:** Coolors, Adobe Color, Paletton
- **Font Tools:** Google Fonts, Adobe Fonts, Font Squirrel

### Validation Tools

- **Contrast Checker:** WebAIM, Contrast Ratio
- **Image Analysis:** PageSpeed Insights, GTmetrix
- **Accessibility:** WAVE, axe DevTools

---

## Related Rules

- **brand-consistency.md** - Brand voice and visual identity
- **legal-compliance.md** - Copyright and licensing
- **universal-marketing.md** - Cross-cutting standards

