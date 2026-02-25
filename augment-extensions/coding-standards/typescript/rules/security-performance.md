# Security and Performance Best Practices

Comprehensive guide to security and performance optimization in TypeScript applications.

## Table of Contents
- [Security Headers in Next.js](#security-headers-in-nextjs)
- [Type-Safe Runtime Validation](#type-safe-runtime-validation)
- [Memoization Patterns](#memoization-patterns)
- [Bundle Analysis](#bundle-analysis)
- [Tree-Shaking Optimization](#tree-shaking-optimization)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)

---

## Security Headers in Next.js

### Overview

Security headers protect your application from common web vulnerabilities like XSS, clickjacking, and MIME sniffing.

### Configuration

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'"
    ].join('; ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

### Content Security Policy (CSP)

```typescript
// lib/csp.ts
export const generateCSP = () => {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`
  ].join('; ');

  return { csp, nonce };
};

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCSP } from './lib/csp';

export function middleware(request: NextRequest) {
  const { csp, nonce } = generateCSP();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Nonce', nonce);

  return response;
}
```

### Environment Variables Security

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public variables (exposed to client)
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),

  // Private variables (server-only)
  DATABASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(32),
  JWT_SECRET: z.string().min(32),

  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000)
});

export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
```

### Sanitizing User Input

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
}

// Usage in component
function UserContent({ content }: { content: string }) {
  const clean = sanitizeHTML(content);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

---

## Type-Safe Runtime Validation

### Using Zod

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(18).max(120).optional(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date()
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;

// Validate data
function validateUser(data: unknown): User {
  return userSchema.parse(data); // Throws on invalid data
}

// Safe validation
function safeValidateUser(data: unknown): User | null {
  const result = userSchema.safeParse(data);
  return result.success ? result.data : null;
}
```

### API Route Validation

```typescript
// app/api/users/route.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Create user with validated data
    const user = await createUser(validatedData);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Form Validation with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.coerce.number().min(18, 'Must be 18 or older')
});

type FormData = z.infer<typeof formSchema>;

function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data: FormData) => {
    // Data is type-safe and validated
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('age')} type="number" />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Memoization Patterns

### React.memo

```typescript
import { memo } from 'react';

interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onDelete: (id: number) => void;
}

// Memoize component to prevent unnecessary re-renders
export const UserCard = memo(function UserCard({ user, onDelete }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onDelete(user.id)}>Delete</button>
    </div>
  );
});

// Custom comparison function
export const UserCardWithCustomCompare = memo(
  UserCard,
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id &&
           prevProps.user.name === nextProps.user.name;
  }
);
```

### useMemo

```typescript
import { useMemo } from 'react';

function ExpensiveComponent({ items }: { items: Item[] }) {
  // Memoize expensive computation
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Memoize filtered data
  const activeItems = useMemo(() => {
    return sortedItems.filter((item) => item.active);
  }, [sortedItems]);

  return (
    <ul>
      {activeItems.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### useCallback

```typescript
import { useCallback, useState } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

  // Memoize callback to prevent child re-renders
  const handleDelete = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleAdd = useCallback((item: Item) => {
    setItems((prev) => [...prev, item]);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ItemList items={items} onDelete={handleDelete} onAdd={handleAdd} />
    </div>
  );
}
```

### Memoization with Lodash

```typescript
import memoize from 'lodash/memoize';

// Memoize expensive function
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// Memoize with custom resolver
const getUserById = memoize(
  async (id: number) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  (id) => `user-${id}` // Custom cache key
);

// Clear cache
getUserById.cache.clear();
```

---

## Bundle Analysis

### Next.js Bundle Analyzer

```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer
```

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
});
```

```bash
# Analyze bundle
ANALYZE=true npm run build
```

### Webpack Bundle Analyzer

```bash
npm install -D webpack-bundle-analyzer
```

```typescript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

### Analyzing Bundle Size

```typescript
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "BUNDLE_ANALYZE=server next build",
    "analyze:browser": "BUNDLE_ANALYZE=browser next build"
  }
}
```

---

## Tree-Shaking Optimization

### ES Modules

```typescript
// ✅ Good: Named exports (tree-shakeable)
export const add = (a: number, b: number) => a + b;
export const subtract = (a: number, b: number) => a - b;
export const multiply = (a: number, b: number) => a * b;

// Import only what you need
import { add, subtract } from './math';

// ❌ Bad: Default export (not tree-shakeable)
export default {
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  multiply: (a: number, b: number) => a * b
};
```

### Side-Effect Free Code

```typescript
// package.json
{
  "sideEffects": false // Enables aggressive tree-shaking
}

// Or specify files with side effects
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts"
  ]
}
```

### Dynamic Imports

```typescript
// Code splitting with dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// Conditional loading
async function loadAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    const analytics = await import('./analytics');
    analytics.init();
  }
}
```

### Barrel File Optimization

```typescript
// ❌ Bad: Barrel file imports everything
// utils/index.ts
export * from './string';
export * from './number';
export * from './date';

// ✅ Good: Direct imports
import { capitalize } from './utils/string';
import { formatNumber } from './utils/number';

// Or use named re-exports
// utils/index.ts
export { capitalize, lowercase } from './string';
export { formatNumber, parseNumber } from './number';
```

### Lodash Tree-Shaking

```typescript
// ❌ Bad: Imports entire lodash
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Good: Import specific function
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ✅ Better: Use lodash-es (ES modules)
import { debounce } from 'lodash-es';
debounce(fn, 300);
```

### Next.js Optimization

```typescript
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', 'lodash']
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2
          }
        }
      };
    }
    return config;
  }
};
```

---

## Performance Monitoring

### Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Tracking

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
}

// Usage
measurePerformance('Data processing', () => {
  processLargeDataset(data);
});
```

### React Profiler

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  });
};

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

---

## Best Practices

### 1. Always Validate External Data

```typescript
// ✅ Good: Validate API responses
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return userSchema.parse(data); // Validate with Zod
}

// ❌ Bad: Trust external data
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // No validation
}
```

### 2. Use Security Headers

```typescript
// ✅ Good: Comprehensive security headers
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' }
];
```

### 3. Memoize Expensive Computations

```typescript
// ✅ Good: Memoize expensive operations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// ❌ Bad: Recompute on every render
const sortedData = data.sort((a, b) => a.value - b.value);
```

### 4. Use Dynamic Imports for Code Splitting

```typescript
// ✅ Good: Dynamic import
const Chart = lazy(() => import('./Chart'));

// ❌ Bad: Static import for large component
import Chart from './Chart';
```

### 5. Optimize Bundle Size

```typescript
// ✅ Good: Import specific functions
import { debounce } from 'lodash-es';

// ❌ Bad: Import entire library
import _ from 'lodash';
```

### 6. Monitor Performance

```typescript
// ✅ Good: Track performance metrics
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  // Send to analytics
}
```

---

## Common Pitfalls

### ❌ Trusting User Input

```typescript
// Never trust user input
function renderHTML(userInput: string) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />; // ❌ XSS vulnerability
}

// Always sanitize
function renderHTML(userInput: string) {
  const clean = DOMPurify.sanitize(userInput);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />; // ✅ Safe
}
```

### ❌ Over-Memoization

```typescript
// Don't memoize everything
const value = useMemo(() => x + y, [x, y]); // ❌ Unnecessary for simple operations

// Only memoize expensive computations
const value = x + y; // ✅ Simple operation
```

### ❌ Ignoring Bundle Size

```typescript
// Check bundle size regularly
npm run analyze

// Use bundle size limits
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/*.js",
      "maxSize": "100 kB"
    }
  ]
}
```

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Zod Documentation](https://zod.dev)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)




