# Performance Optimization

## Overview

This guide provides performance optimization techniques for JavaScript, CSS, and HTML to create fast, responsive web applications.

---

## JavaScript Performance

### Debounce and Throttle

**RECOMMENDED**: Use debounce/throttle for frequent events:

```javascript
// ✅ GOOD: Debounce (wait for pause)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage: Search input
const handleSearch = debounce((query) => {
  searchAPI(query);
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// ✅ GOOD: Throttle (limit frequency)
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage: Scroll event
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', handleScroll);
```

**WHEN TO USE**:
- **Debounce**: Search input, window resize, form validation
- **Throttle**: Scroll events, mouse movement, animation frames

### requestAnimationFrame for Animations

**RECOMMENDED**: Use `requestAnimationFrame` for smooth animations:

```javascript
// ✅ GOOD: requestAnimationFrame
function animate() {
  // Update animation
  element.style.transform = `translateX(${position}px)`;
  position += 1;
  
  if (position < 100) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);

// ❌ BAD: setTimeout/setInterval
setInterval(() => {
  element.style.transform = `translateX(${position}px)`;
  position += 1;
}, 16); // Tries to match 60fps but not synchronized
```

**REASON**: `requestAnimationFrame` synchronizes with browser repaint for smoother animations.

### Web Workers for Heavy Computations

**RECOMMENDED**: Use Web Workers for CPU-intensive tasks:

```javascript
// ✅ GOOD: Web Worker for heavy computation
// worker.js
self.addEventListener('message', (e) => {
  const result = performHeavyCalculation(e.data);
  self.postMessage(result);
});

function performHeavyCalculation(data) {
  // CPU-intensive work
  return processedData;
}

// main.js
const worker = new Worker('worker.js');

worker.addEventListener('message', (e) => {
  displayResults(e.data);
});

worker.postMessage(largeDataset);

// ❌ BAD: Heavy computation on main thread
const result = performHeavyCalculation(largeDataset); // Blocks UI
```

**USE CASES**: Data processing, image manipulation, complex calculations

### Code Splitting

**RECOMMENDED**: Split code for faster initial load:

```javascript
// ✅ GOOD: Dynamic import (code splitting)
button.addEventListener('click', async () => {
  const module = await import('./heavy-feature.js');
  module.initializeFeature();
});

// ✅ GOOD: Lazy load components
async function loadChart() {
  const { Chart } = await import('./chart-library.js');
  return new Chart(data);
}

// ❌ BAD: Load everything upfront
import { Chart } from './chart-library.js'; // Large library loaded immediately
```

---

## CSS Performance

### Minify CSS for Production

**REQUIRED**: Minify CSS for production:

```bash
# Use build tools (PostCSS, cssnano, etc.)
npm run build # Minifies CSS automatically
```

**BENEFITS**: Reduces file size by 20-40%

### Critical CSS

**RECOMMENDED**: Inline critical CSS for above-the-fold content:

```html
<!-- ✅ GOOD: Inline critical CSS -->
<head>
  <style>
    /* Critical CSS for above-the-fold content */
    .header { display: flex; }
    .hero { min-height: 100vh; }
  </style>
  
  <!-- Load full CSS asynchronously -->
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
```

**TOOLS**: Critical, Penthouse, or build tool plugins

### Remove Unused CSS

**RECOMMENDED**: Remove unused CSS:

```bash
# Use PurgeCSS or similar tools
npx purgecss --css styles.css --content index.html --output dist/
```

**BENEFITS**: Can reduce CSS by 50-90% in large projects

### Use will-change Sparingly

**USE SPARINGLY**: `will-change` creates new layers (memory cost):

```css
/* ✅ GOOD: Use for specific animations */
.modal {
  will-change: transform, opacity;
}

.modal.open {
  transform: translateY(0);
  opacity: 1;
}

/* Remove after animation */
.modal.animated {
  will-change: auto;
}

/* ❌ BAD: Overuse */
* {
  will-change: transform; /* Creates layer for everything */
}
```

### Avoid Expensive Properties

**AVOID**: Properties that trigger layout/paint:

```css
/* ❌ EXPENSIVE: Triggers layout */
.element {
  width: 100px;
  height: 100px;
  top: 10px;
  left: 10px;
}

/* ✅ CHEAP: Only triggers composite */
.element {
  transform: translate(10px, 10px);
  opacity: 0.5;
}
```

**CHEAP PROPERTIES** (composite only):
- `transform`
- `opacity`

**EXPENSIVE PROPERTIES** (layout):
- `width`, `height`
- `margin`, `padding`
- `top`, `left`, `right`, `bottom`

---

## HTML Performance

### Optimize Images

**REQUIRED**: Optimize images for web:

```html
<!-- ✅ GOOD: Optimized images -->
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Description"
  loading="lazy"
  width="800"
  height="600"
>

<!-- ✅ GOOD: Modern formats with fallback -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

**BEST PRACTICES**:
- Use WebP/AVIF for better compression
- Provide multiple sizes with `srcset`
- Set explicit `width` and `height` to prevent layout shift
- Compress images (TinyPNG, ImageOptim, etc.)

### Lazy Loading

**RECOMMENDED**: Use lazy loading for images:

```html
<!-- ✅ GOOD: Native lazy loading -->
<img src="image.jpg" alt="Description" loading="lazy">

<!-- ✅ GOOD: Eager load for above-the-fold -->
<img src="hero.jpg" alt="Hero" loading="eager">

<!-- ✅ GOOD: Lazy load iframes -->
<iframe src="video.html" loading="lazy"></iframe>
```

**WHEN TO USE**:
- Images below the fold
- Image galleries
- Long pages with many images

### Preload Critical Resources

**RECOMMENDED**: Preload critical resources:

```html
<head>
  <!-- ✅ GOOD: Preload critical resources -->
  <link rel="preload" href="critical.css" as="style">
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="hero.jpg" as="image">

  <!-- ✅ GOOD: Prefetch for next page -->
  <link rel="prefetch" href="next-page.html">

  <!-- ✅ GOOD: DNS prefetch for external domains -->
  <link rel="dns-prefetch" href="https://api.example.com">
</head>
```

**TYPES**:
- **`preload`**: Load critical resources early
- **`prefetch`**: Load resources for next navigation
- **`dns-prefetch`**: Resolve DNS early for external domains

### Script Loading Strategies

**RECOMMENDED**: Use `defer` or `async` for scripts:

```html
<!-- ✅ GOOD: Defer (maintains order, executes after DOM) -->
<script src="app.js" defer></script>
<script src="utils.js" defer></script>

<!-- ✅ GOOD: Async (independent scripts) -->
<script src="analytics.js" async></script>

<!-- ✅ GOOD: Module scripts (deferred by default) -->
<script type="module" src="app.js"></script>

<!-- ❌ BAD: Blocking script in head -->
<head>
  <script src="app.js"></script> <!-- Blocks rendering -->
</head>
```

**DIFFERENCES**:
- **No attribute**: Blocks HTML parsing
- **`defer`**: Downloads in parallel, executes after DOM, maintains order
- **`async`**: Downloads in parallel, executes immediately, no order guarantee
- **`type="module"`**: Deferred by default

---

## Measurement and Monitoring

### Performance API

**RECOMMENDED**: Measure performance:

```javascript
// ✅ GOOD: Measure operation time
const start = performance.now();
performOperation();
const end = performance.now();
console.log(`Operation took ${end - start}ms`);

// ✅ GOOD: Mark and measure
performance.mark('start-fetch');
await fetchData();
performance.mark('end-fetch');
performance.measure('fetch-duration', 'start-fetch', 'end-fetch');

const measure = performance.getEntriesByName('fetch-duration')[0];
console.log(`Fetch took ${measure.duration}ms`);
```

### Core Web Vitals

**MONITOR**: Track Core Web Vitals:

```javascript
// ✅ GOOD: Measure LCP (Largest Contentful Paint)
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
}).observe({ entryTypes: ['largest-contentful-paint'] });

// ✅ GOOD: Measure FID (First Input Delay)
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    console.log('FID:', entry.processingStart - entry.startTime);
  });
}).observe({ entryTypes: ['first-input'] });

// ✅ GOOD: Measure CLS (Cumulative Layout Shift)
let clsScore = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
    }
  }
  console.log('CLS:', clsScore);
}).observe({ entryTypes: ['layout-shift'] });
```

---

## Best Practices Summary

### JavaScript

1. **Debounce/throttle** frequent events
2. Use **requestAnimationFrame** for animations
3. Use **Web Workers** for heavy computations
4. Implement **code splitting** for large apps
5. **Cache** expensive computations
6. Avoid **memory leaks** (remove event listeners)

### CSS

1. **Minify** CSS for production
2. **Inline critical CSS** for above-the-fold content
3. **Remove unused CSS** with PurgeCSS
4. Use **will-change sparingly**
5. Prefer **transform/opacity** over layout properties
6. Use **CSS containment** for isolated components

### HTML

1. **Optimize images** (WebP/AVIF, compression)
2. Use **lazy loading** for below-the-fold images
3. **Preload critical resources**
4. Use **defer/async** for scripts
5. Set **explicit dimensions** for images/videos
6. Use **responsive images** with srcset

### General

1. **Measure performance** with Performance API
2. **Monitor Core Web Vitals** (LCP, FID, CLS)
3. Use **Lighthouse** for audits
4. Implement **caching strategies**
5. Use **CDN** for static assets
6. Enable **compression** (gzip/brotli)

---

## Tools

**Performance Testing**:
- Lighthouse (Chrome DevTools)
- WebPageTest
- PageSpeed Insights

**Monitoring**:
- Chrome DevTools Performance tab
- Performance API
- Real User Monitoring (RUM)

**Optimization**:
- Webpack Bundle Analyzer
- PurgeCSS
- ImageOptim / TinyPNG
- Critical CSS generators



