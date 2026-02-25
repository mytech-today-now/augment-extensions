# Modern TypeScript Features (5.0-5.6+)

Comprehensive guide to modern TypeScript features introduced in versions 5.0 through 5.6+.

## Table of Contents
- [Const Type Parameters (5.0)](#const-type-parameters-50)
- [Inferred Type Predicates (5.5)](#inferred-type-predicates-55)
- [Satisfies Operator (4.9/5.0)](#satisfies-operator-4950)
- [Variance Annotations (4.7)](#variance-annotations-47)
- [Declaration Merging Patterns](#declaration-merging-patterns)
- [Template Literal Types](#template-literal-types)
- [Const Assertions](#const-assertions)

---

## Const Type Parameters (5.0)

TypeScript 5.0 introduced `const` type parameters, which infer the most specific type possible.

### Basic Usage

```typescript
// ❌ Before: Generic type loses literal types
function makeArray<T>(items: T[]): T[] {
  return items;
}

const numbers = makeArray([1, 2, 3]); // Type: number[]

// ✅ After: Const type parameter preserves literal types
function makeArrayConst<const T>(items: T[]): T[] {
  return items;
}

const numbersConst = makeArrayConst([1, 2, 3]); // Type: [1, 2, 3]
```

### Practical Example: Configuration Objects

```typescript
// ✅ Preserve exact configuration shape
function defineConfig<const T extends Record<string, unknown>>(config: T): T {
  return config;
}

const appConfig = defineConfig({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  features: {
    darkMode: true,
    analytics: false
  }
} as const);

// Type is preserved exactly:
// {
//   readonly apiUrl: "https://api.example.com";
//   readonly timeout: 5000;
//   readonly retries: 3;
//   readonly features: {
//     readonly darkMode: true;
//     readonly analytics: false;
//   };
// }

// This enables autocomplete and type safety
appConfig.apiUrl; // ✅ Type: "https://api.example.com"
appConfig.timeout; // ✅ Type: 5000
```

### Route Definitions

```typescript
// ✅ Type-safe route definitions
function defineRoutes<const T extends readonly Route[]>(routes: T): T {
  return routes;
}

interface Route {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: string;
}

const routes = defineRoutes([
  { path: '/users', method: 'GET', handler: 'getUsers' },
  { path: '/users/:id', method: 'GET', handler: 'getUser' },
  { path: '/users', method: 'POST', handler: 'createUser' },
] as const);

// Type: readonly [
//   { readonly path: "/users"; readonly method: "GET"; readonly handler: "getUsers"; },
//   { readonly path: "/users/:id"; readonly method: "GET"; readonly handler: "getUser"; },
//   { readonly path: "/users"; readonly method: "POST"; readonly handler: "createUser"; }
// ]

type RoutePaths = typeof routes[number]['path'];
// Type: "/users" | "/users/:id"
```

---

## Inferred Type Predicates (5.5)

TypeScript 5.5 can automatically infer type predicates from function implementations.

### Before vs After

```typescript
// ❌ Before: Manual type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// ✅ After: Inferred type predicate (TS 5.5+)
function isString(value: unknown) {
  return typeof value === 'string';
}
// TypeScript infers: value is string

// Works with arrays too
function filterStrings(items: unknown[]) {
  return items.filter(isString);
}
// Return type: string[]
```

### Complex Type Guards

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// ✅ Inferred type predicate
function isAdmin(user: User) {
  return 'role' in user && user.role === 'admin';
}
// TypeScript infers: user is Admin

function processUser(user: User) {
  if (isAdmin(user)) {
    // ✅ TypeScript knows user is Admin here
    console.log(user.permissions);
  }
}
```

### Array Filtering

```typescript
interface Product {
  id: number;
  name: string;
  price: number | null;
}

const products: Product[] = [
  { id: 1, name: 'Widget', price: 10 },
  { id: 2, name: 'Gadget', price: null },
  { id: 3, name: 'Doohickey', price: 15 },
];

// ✅ Inferred type predicate
function hasPrice(product: Product) {
  return product.price !== null;
}

const productsWithPrices = products.filter(hasPrice);
// Type: Product[] where price is number (not null)
```

---

## Satisfies Operator (4.9/5.0)

The `satisfies` operator validates types without widening them.

### Basic Usage

```typescript
// ❌ Problem: Type annotation widens the type
const config: Record<string, string | number> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

config.apiUrl.toUpperCase(); // ❌ Error: Property 'toUpperCase' does not exist on type 'string | number'

// ✅ Solution: Use satisfies to validate without widening
const configSatisfies = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} satisfies Record<string, string | number>;

configSatisfies.apiUrl.toUpperCase(); // ✅ Works! Type is still "https://api.example.com"
configSatisfies.timeout.toFixed(2); // ✅ Works! Type is still 5000
```

### Color Palette Example

```typescript
type RGB = readonly [red: number, green: number, blue: number];
type Color = string | RGB;

// ✅ Validate structure while preserving exact types
const palette = {
  primary: '#007bff',
  secondary: [128, 128, 128],
  success: '#28a745',
  danger: [255, 0, 0],
  warning: '#ffc107'
} satisfies Record<string, Color>;

// Type is preserved:
palette.primary; // Type: "#007bff"
palette.secondary; // Type: [128, 128, 128]

// But validation ensures correctness:
const invalid = {
  primary: '#007bff',
  secondary: [128, 128] // ❌ Error: Type '[number, number]' is not assignable to type 'Color'
} satisfies Record<string, Color>;
```

### API Response Validation

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ✅ Validate response shape while preserving data type
const userResponse = {
  data: { id: 1, name: 'Alice', email: 'alice@example.com' },
  status: 200,
  message: 'Success'
} satisfies ApiResponse<{ id: number; name: string; email: string }>;

userResponse.data.name; // ✅ Type: string (not widened to unknown)
```

---

## Variance Annotations (4.7)

TypeScript 4.7 introduced explicit variance annotations for better type safety.

### Covariance (`out`)

```typescript
// ✅ Explicitly mark type parameter as covariant (output-only)
interface Producer<out T> {
  produce(): T;
}

// This is safe because T only appears in output positions
const stringProducer: Producer<string> = { produce: () => 'hello' };
const unknownProducer: Producer<unknown> = stringProducer; // ✅ OK
```

### Contravariance (`in`)

```typescript
// ✅ Explicitly mark type parameter as contravariant (input-only)
interface Consumer<in T> {
  consume(value: T): void;
}

// This is safe because T only appears in input positions
const unknownConsumer: Consumer<unknown> = { consume: (value) => console.log(value) };
const stringConsumer: Consumer<string> = unknownConsumer; // ✅ OK
```

### Invariance (default)

```typescript
// Default: Type parameter is invariant (both input and output)
interface Box<T> {
  get(): T;
  set(value: T): void;
}

// ❌ Not safe to assign
const stringBox: Box<string> = { get: () => 'hello', set: (v) => {} };
const unknownBox: Box<unknown> = stringBox; // ❌ Error
```

### Practical Example: Event Emitter

```typescript
// ✅ Use variance annotations for type-safe event emitter
interface EventEmitter<out Events extends Record<string, unknown>> {
  on<K extends keyof Events>(event: K, handler: (data: Events[K]) => void): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
}

interface AppEvents {
  userLogin: { userId: number; timestamp: Date };
  userLogout: { userId: number };
  error: { message: string; code: number };
}

const emitter: EventEmitter<AppEvents> = {
  on: (event, handler) => {},
  emit: (event, data) => {}
};

// ✅ Type-safe event handling
emitter.on('userLogin', (data) => {
  console.log(data.userId); // ✅ Type: number
  console.log(data.timestamp); // ✅ Type: Date
});
```

---

## Declaration Merging Patterns

TypeScript allows merging multiple declarations of the same name.

### Interface Merging

```typescript
// ✅ Extend existing interfaces
interface User {
  id: number;
  name: string;
}

interface User {
  email: string;
  createdAt: Date;
}

// Merged interface:
const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date()
};
```

### Module Augmentation

```typescript
// ✅ Augment third-party modules
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: number;
      email: string;
    };
  }
}

// Now Request has user property
app.get('/profile', (req, res) => {
  if (req.user) {
    res.json({ id: req.user.id, email: req.user.email });
  }
});
```

### Global Augmentation

```typescript
// ✅ Add properties to global objects
declare global {
  interface Window {
    analytics?: {
      track(event: string, properties?: Record<string, unknown>): void;
    };
  }
}

// Now window.analytics is typed
window.analytics?.track('page_view', { path: '/home' });
```

### Namespace Merging

```typescript
// ✅ Merge namespace with class
class Album {
  constructor(public title: string) {}
}

namespace Album {
  export function fromJSON(json: { title: string }): Album {
    return new Album(json.title);
  }

  export function validate(title: string): boolean {
    return title.length > 0 && title.length <= 100;
  }
}

// Use both class and namespace
const album = new Album('Abbey Road');
const albumFromJSON = Album.fromJSON({ title: 'Revolver' });
const isValid = Album.validate('Rubber Soul');
```

---

## Template Literal Types

Advanced string manipulation at the type level.

### Basic Template Literals

```typescript
// ✅ Create string literal types dynamically
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// Type: "onClick" | "onFocus" | "onBlur"

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/api/${Lowercase<HTTPMethod>}`;
// Type: "/api/get" | "/api/post" | "/api/put" | "/api/delete"
```

### CSS-in-JS Type Safety

```typescript
// ✅ Type-safe CSS properties
type CSSUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
type CSSValue<T extends number> = `${T}${CSSUnit}`;

interface Spacing {
  margin: CSSValue<number>;
  padding: CSSValue<number>;
}

const spacing: Spacing = {
  margin: '16px', // ✅ OK
  padding: '2rem', // ✅ OK
};

const invalid: Spacing = {
  margin: '16', // ❌ Error: Type '"16"' is not assignable to type 'CSSValue<number>'
  padding: '2rem',
};
```

### API Route Type Safety

```typescript
// ✅ Type-safe API routes
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type Resource = 'users' | 'posts' | 'comments';
type APIRoute = `/${Resource}` | `/${Resource}/:id`;

type RouteHandler<M extends HTTPMethod, R extends APIRoute> = {
  method: M;
  path: R;
  handler: (req: Request, res: Response) => void;
};

const getUsersRoute: RouteHandler<'GET', '/users'> = {
  method: 'GET',
  path: '/users',
  handler: (req, res) => {}
};

const getUserRoute: RouteHandler<'GET', '/users/:id'> = {
  method: 'GET',
  path: '/users/:id',
  handler: (req, res) => {}
};
```

### Database Query Builder

```typescript
// ✅ Type-safe query builder
type SQLOperator = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
type TableName = 'users' | 'posts' | 'comments';
type Query<Op extends SQLOperator, Table extends TableName> = `${Op} * FROM ${Table}`;

function executeQuery<Op extends SQLOperator, Table extends TableName>(
  query: Query<Op, Table>
): void {
  console.log(query);
}

executeQuery('SELECT * FROM users'); // ✅ OK
executeQuery('SELECT * FROM posts'); // ✅ OK
executeQuery('SELECT * FROM invalid'); // ❌ Error
```

---

## Const Assertions

Use `as const` to create deeply readonly types with literal values.

### Object Const Assertions

```typescript
// ❌ Without const assertion
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};
// Type: { apiUrl: string; timeout: number; retries: number }

// ✅ With const assertion
const configConst = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
} as const;
// Type: {
//   readonly apiUrl: "https://api.example.com";
//   readonly timeout: 5000;
//   readonly retries: 3;
// }
```

### Array Const Assertions

```typescript
// ❌ Without const assertion
const colors = ['red', 'green', 'blue'];
// Type: string[]

// ✅ With const assertion
const colorsConst = ['red', 'green', 'blue'] as const;
// Type: readonly ["red", "green", "blue"]

type Color = typeof colorsConst[number];
// Type: "red" | "green" | "blue"
```

### Enum Alternative

```typescript
// ✅ Use const assertion instead of enum
const Status = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

type StatusValue = typeof Status[keyof typeof Status];
// Type: "pending" | "approved" | "rejected"

function updateStatus(status: StatusValue) {
  console.log(status);
}

updateStatus(Status.PENDING); // ✅ OK
updateStatus('pending'); // ✅ OK
updateStatus('invalid'); // ❌ Error
```

---

## Best Practices

1. **Use const type parameters** when you need to preserve exact literal types
2. **Leverage inferred type predicates** to reduce boilerplate in type guards
3. **Use satisfies** to validate types without widening them
4. **Apply variance annotations** for better type safety in generic interfaces
5. **Use declaration merging** to extend third-party types safely
6. **Leverage template literal types** for type-safe string manipulation
7. **Use const assertions** instead of enums for better type inference
8. **Combine features** for maximum type safety and developer experience

---

## Migration Guide

### From TypeScript 4.x to 5.x

```typescript
// Before (TS 4.x)
function makeArray<T>(items: T[]): T[] {
  return items;
}

// After (TS 5.0+)
function makeArray<const T>(items: T[]): T[] {
  return items;
}

// Before (TS 4.x)
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// After (TS 5.5+)
function isString(value: unknown) {
  return typeof value === 'string';
}
// Type predicate is inferred automatically
```

---

## References

- [TypeScript 5.0 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/)
- [TypeScript 5.5 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/)
- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)



