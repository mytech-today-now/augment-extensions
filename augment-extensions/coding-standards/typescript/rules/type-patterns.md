# Advanced Type Patterns

Comprehensive guide to advanced TypeScript type patterns for building robust, type-safe applications.

## Table of Contents
- [Branded Types](#branded-types)
- [Discriminated Unions](#discriminated-unions)
- [Type-Level Programming](#type-level-programming)
- [Opaque Types](#opaque-types)
- [Recursive Conditional Types](#recursive-conditional-types)
- [Mapped Types](#mapped-types)
- [Utility Type Patterns](#utility-type-patterns)

---

## Branded Types

Branded types (also called nominal types) prevent accidental mixing of structurally identical types.

### Basic Branded Type

```typescript
// ✅ Create branded types using unique symbols
type Brand<K, T> = K & { __brand: T };

type UserId = Brand<number, 'UserId'>;
type ProductId = Brand<number, 'ProductId'>;
type OrderId = Brand<number, 'OrderId'>;

// Helper functions to create branded values
function createUserId(id: number): UserId {
  return id as UserId;
}

function createProductId(id: number): ProductId {
  return id as ProductId;
}

// Usage
const userId = createUserId(123);
const productId = createProductId(456);

function getUserById(id: UserId): User {
  // Implementation
}

getUserById(userId); // ✅ OK
getUserById(productId); // ❌ Error: Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
getUserById(123); // ❌ Error: Argument of type 'number' is not assignable to parameter of type 'UserId'
```

### Email Validation with Branded Types

```typescript
// ✅ Type-safe email addresses
type Email = Brand<string, 'Email'>;

function createEmail(value: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? (value as Email) : null;
}

function sendEmail(to: Email, subject: string, body: string): void {
  console.log(`Sending email to ${to}`);
}

const email = createEmail('user@example.com');
if (email) {
  sendEmail(email, 'Hello', 'World'); // ✅ OK
}

sendEmail('invalid@', 'Hello', 'World'); // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'Email'
```

### URL Validation

```typescript
// ✅ Type-safe URLs
type URL = Brand<string, 'URL'>;

function createURL(value: string): URL | null {
  try {
    new globalThis.URL(value);
    return value as URL;
  } catch {
    return null;
  }
}

function fetchData(url: URL): Promise<Response> {
  return fetch(url);
}

const url = createURL('https://api.example.com/users');
if (url) {
  fetchData(url); // ✅ OK
}

fetchData('not-a-url'); // ❌ Error
```

### Positive Numbers

```typescript
// ✅ Branded type for positive numbers
type PositiveNumber = Brand<number, 'PositiveNumber'>;

function createPositiveNumber(value: number): PositiveNumber | null {
  return value > 0 ? (value as PositiveNumber) : null;
}

function calculateDiscount(price: PositiveNumber, percentage: PositiveNumber): number {
  return price * (percentage / 100);
}

const price = createPositiveNumber(100);
const discount = createPositiveNumber(10);

if (price && discount) {
  calculateDiscount(price, discount); // ✅ OK
}

calculateDiscount(100, 10); // ❌ Error
calculateDiscount(-50, 10); // ❌ Error (caught at runtime by createPositiveNumber)
```

---

## Discriminated Unions

Discriminated unions (tagged unions) enable type-safe handling of different variants.

### Basic Discriminated Union

```typescript
// ✅ Define discriminated union with type field
type Success<T> = {
  type: 'success';
  data: T;
};

type Error = {
  type: 'error';
  error: string;
  code: number;
};

type Loading = {
  type: 'loading';
};

type Result<T> = Success<T> | Error | Loading;

// Type-safe handling
function handleResult<T>(result: Result<T>): void {
  switch (result.type) {
    case 'success':
      console.log(result.data); // ✅ TypeScript knows result is Success<T>
      break;
    case 'error':
      console.log(result.error, result.code); // ✅ TypeScript knows result is Error
      break;
    case 'loading':
      console.log('Loading...'); // ✅ TypeScript knows result is Loading
      break;
  }
}
```

### API Response Pattern

```typescript
// ✅ Type-safe API responses
type ApiSuccess<T> = {
  status: 'success';
  data: T;
  timestamp: Date;
};

type ApiError = {
  status: 'error';
  message: string;
  code: number;
  details?: Record<string, unknown>;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function fetchUser(id: number): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return {
      status: 'success',
      data,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      code: 500
    };
  }
}

// Usage
const result = await fetchUser(123);
if (result.status === 'success') {
  console.log(result.data.name); // ✅ TypeScript knows result is ApiSuccess<User>
} else {
  console.log(result.message); // ✅ TypeScript knows result is ApiError
}
```

### Form State Management

```typescript
// ✅ Type-safe form states
type FormIdle = {
  state: 'idle';
};

type FormSubmitting = {
  state: 'submitting';
  progress: number;
};

type FormSuccess = {
  state: 'success';
  message: string;
  redirectUrl?: string;
};

type FormError = {
  state: 'error';
  errors: Record<string, string[]>;
  canRetry: boolean;
};

type FormState = FormIdle | FormSubmitting | FormSuccess | FormError;

function renderForm(formState: FormState) {
  switch (formState.state) {
    case 'idle':
      return '<form>...</form>';
    case 'submitting':
      return `<div>Submitting... ${formState.progress}%</div>`;
    case 'success':
      return `<div>${formState.message}</div>`;
    case 'error':
      return `<div>Errors: ${Object.keys(formState.errors).length}</div>`;
  }
}
```

### Payment Method Pattern

```typescript
// ✅ Type-safe payment methods
type CreditCard = {
  type: 'credit_card';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

type PayPal = {
  type: 'paypal';
  email: string;
};

type BankTransfer = {
  type: 'bank_transfer';
  accountNumber: string;
  routingNumber: string;
};

type PaymentMethod = CreditCard | PayPal | BankTransfer;

function processPayment(method: PaymentMethod, amount: number): void {
  switch (method.type) {
    case 'credit_card':
      console.log(`Charging ${amount} to card ${method.cardNumber}`);
      break;
    case 'paypal':
      console.log(`Charging ${amount} to PayPal account ${method.email}`);
      break;
    case 'bank_transfer':
      console.log(`Transferring ${amount} from account ${method.accountNumber}`);
      break;
  }
}
```

---

## Type-Level Programming

Perform computations at the type level using TypeScript's type system.

### Type-Level Arithmetic

```typescript
// ✅ Type-level number operations
type Length<T extends readonly unknown[]> = T['length'];

type Increment<N extends number> = [unknown, ...Array<N>]['length'];
type Decrement<N extends number> = Array<N> extends [unknown, ...infer Rest] ? Rest['length'] : 0;

type Five = Increment<4>; // Type: 5
type Three = Decrement<4>; // Type: 3
```

### Type-Level String Manipulation

```typescript
// ✅ Advanced string manipulation
type Split<S extends string, D extends string> =
  S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D>]
    : [S];

type Parts = Split<'hello-world-foo', '-'>; // Type: ["hello", "world", "foo"]

type Join<T extends readonly string[], D extends string> =
  T extends readonly [infer F extends string, ...infer R extends readonly string[]]
    ? R extends readonly []
      ? F
      : `${F}${D}${Join<R, D>}`
    : '';

type Joined = Join<['hello', 'world', 'foo'], '-'>; // Type: "hello-world-foo"
```

### Type-Level Filtering

```typescript
// ✅ Filter types from union
type Filter<T, U> = T extends U ? T : never;

type Numbers = 1 | 2 | 'a' | 'b' | 3;
type OnlyNumbers = Filter<Numbers, number>; // Type: 1 | 2 | 3

type Exclude<T, U> = T extends U ? never : T;
type OnlyStrings = Exclude<Numbers, number>; // Type: "a" | "b"
```

### Deep Readonly

```typescript
// ✅ Recursively make all properties readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
// All nested properties are readonly
```

### Deep Partial

```typescript
// ✅ Recursively make all properties optional
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

type PartialConfig = DeepPartial<Config>;
// All nested properties are optional
```

---

## Opaque Types

Opaque types hide implementation details while providing type safety.

### Basic Opaque Type

```typescript
// ✅ Create opaque type using unique symbol
declare const opaqueSymbol: unique symbol;

type Opaque<K, T> = K & { readonly [opaqueSymbol]: T };

type JWT = Opaque<string, 'JWT'>;
type SessionId = Opaque<string, 'SessionId'>;

function createJWT(payload: object): JWT {
  // Implementation
  return 'encoded.jwt.token' as JWT;
}

function verifyJWT(token: JWT): object {
  // Implementation
  return {};
}

const token = createJWT({ userId: 123 });
verifyJWT(token); // ✅ OK
verifyJWT('random-string'); // ❌ Error
```

### Database ID Pattern

```typescript
// ✅ Type-safe database IDs
type DatabaseId<T extends string> = Opaque<string, T>;

type UserId = DatabaseId<'User'>;
type PostId = DatabaseId<'Post'>;
type CommentId = DatabaseId<'Comment'>;

function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

function getUser(id: UserId): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

function getPost(id: PostId): Promise<Post> {
  return fetch(`/api/posts/${id}`).then(r => r.json());
}

const userId = createUserId('user-123');
const postId = createPostId('post-456');

getUser(userId); // ✅ OK
getUser(postId); // ❌ Error: Argument of type 'PostId' is not assignable to parameter of type 'UserId'
```

---

## Recursive Conditional Types

Build complex type transformations using recursion.

### Deep Flatten

```typescript
// ✅ Recursively flatten nested arrays
type Flatten<T> = T extends readonly (infer U)[]
  ? Flatten<U>
  : T;

type Nested = [1, [2, [3, [4, 5]]]];
type Flat = Flatten<Nested>; // Type: 1 | 2 | 3 | 4 | 5
```

### Deep Pick

```typescript
// ✅ Pick nested properties using dot notation
type DeepPick<T, K extends string> =
  K extends `${infer K1}.${infer K2}`
    ? K1 extends keyof T
      ? { [P in K1]: DeepPick<T[K1], K2> }
      : never
    : K extends keyof T
      ? { [P in K]: T[P] }
      : never;

interface User {
  id: number;
  profile: {
    name: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
  };
}

type UserCity = DeepPick<User, 'profile.address.city'>;
// Type: { profile: { address: { city: string } } }
```

### Path to Property

```typescript
// ✅ Generate all possible paths to properties
type Paths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? `${Prefix}${K & string}`
      : `${Prefix}${K & string}` | Paths<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

type UserPaths = Paths<User>;
// Type: "id" | "profile" | "profile.name" | "profile.address" |
//       "profile.address.street" | "profile.address.city" | "profile.address.country"
```

### JSON Serialization

```typescript
// ✅ Type-safe JSON serialization
type Serializable<T> = T extends string | number | boolean | null
  ? T
  : T extends Date
    ? string
    : T extends Array<infer U>
      ? Array<Serializable<U>>
      : T extends object
        ? { [K in keyof T]: Serializable<T[K]> }
        : never;

interface UserWithDate {
  id: number;
  name: string;
  createdAt: Date;
  metadata: {
    lastLogin: Date;
    preferences: {
      theme: string;
    };
  };
}

type SerializedUser = Serializable<UserWithDate>;
// Type: {
//   id: number;
//   name: string;
//   createdAt: string;  // Date becomes string
//   metadata: {
//     lastLogin: string;  // Date becomes string
//     preferences: {
//       theme: string;
//     };
//   };
// }
```

---

## Mapped Types

Transform existing types into new types.

### Make Properties Optional

```typescript
// ✅ Make specific properties optional
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type UserWithOptionalContact = MakeOptional<User, 'email' | 'phone'>;
// Type: {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
// }
```

### Make Properties Required

```typescript
// ✅ Make specific properties required
type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface PartialUser {
  id?: number;
  name?: string;
  email?: string;
}

type UserWithRequiredId = MakeRequired<PartialUser, 'id'>;
// Type: {
//   id: number;
//   name?: string;
//   email?: string;
// }
```

### Mutable

```typescript
// ✅ Remove readonly modifiers
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}

type MutableUser = Mutable<ReadonlyUser>;
// Type: {
//   id: number;
//   name: string;
// }
```

### Nullable

```typescript
// ✅ Make all properties nullable
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  id: number;
  name: string;
  email: string;
}

type NullableUser = Nullable<User>;
// Type: {
//   id: number | null;
//   name: string | null;
//   email: string | null;
// }
```

---

## Utility Type Patterns

Advanced patterns using TypeScript's built-in utility types.

### Extract Function Parameters

```typescript
// ✅ Extract parameter types from function
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, email: string, age: number): User {
  return { id: 1, name, email, age };
}

type CreateUserParams = Parameters<typeof createUser>;
// Type: [name: string, email: string, age: number]
```

### Extract Return Type

```typescript
// ✅ Extract return type from function
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

type UserReturnType = ReturnType<typeof createUser>;
// Type: User
```

### Awaited Type

```typescript
// ✅ Unwrap Promise types
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

async function fetchUser(): Promise<User> {
  return { id: 1, name: 'Alice', email: 'alice@example.com' };
}

type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
// Type: User
```

### Constructor Parameters

```typescript
// ✅ Extract constructor parameter types
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

class User {
  constructor(public name: string, public email: string) {}
}

type UserConstructorParams = ConstructorParameters<typeof User>;
// Type: [name: string, email: string]
```

---

## Best Practices

1. **Use branded types** for domain-specific primitives (IDs, emails, URLs)
2. **Leverage discriminated unions** for state management and API responses
3. **Apply type-level programming** for complex type transformations
4. **Use opaque types** to hide implementation details
5. **Employ recursive conditional types** for deep type operations
6. **Utilize mapped types** for type transformations
7. **Combine patterns** for maximum type safety
8. **Document complex types** with comments explaining the pattern
9. **Test types** using type assertions and test files
10. **Keep types simple** when possible - complexity should serve a purpose

---

## Examples

See the `examples/` directory for complete working examples:
- `examples/branded-types.ts` - Branded type implementations
- `examples/discriminated-unions.ts` - Union type patterns
- `examples/type-level-programming.ts` - Advanced type computations
- `examples/opaque-types.ts` - Opaque type patterns
- `examples/recursive-types.ts` - Recursive type transformations

---

## References

- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [TypeScript Deep Dive - Advanced Types](https://basarat.gitbook.io/typescript/type-system)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [Branded Types in TypeScript](https://egghead.io/blog/using-branded-types-in-typescript)



