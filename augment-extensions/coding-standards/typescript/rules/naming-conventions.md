# TypeScript Naming Conventions

## Core Principles

1. **Clarity over brevity** - Names should be self-documenting
2. **Consistency** - Follow established patterns throughout codebase
3. **Avoid abbreviations** - Unless universally understood (e.g., `id`, `url`)

## Variables and Constants

### Variables (camelCase)

```typescript
// ✅ Good
const userProfile = getUserProfile();
const isAuthenticated = checkAuth();
const totalCount = items.length;

// ❌ Bad
const up = getUserProfile();
const auth = checkAuth();
const cnt = items.length;
```

### Constants (UPPER_SNAKE_CASE for true constants)

```typescript
// ✅ Good - True constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT_MS = 5000;

// ✅ Good - Configuration objects (camelCase)
const apiConfig = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

// ❌ Bad - Mixing conventions
const Max_Retry_Attempts = 3;
const api_base_url = 'https://api.example.com';
```

## Functions and Methods

### Functions (camelCase, verb-based)

```typescript
// ✅ Good - Clear action verbs
function fetchUserData(userId: string): Promise<User> { }
function validateEmail(email: string): boolean { }
function transformResponse(data: ApiResponse): User[] { }

// ❌ Bad - Unclear or noun-based
function user(id: string): Promise<User> { }
function email(e: string): boolean { }
function response(d: ApiResponse): User[] { }
```

### Boolean Functions (is/has/can/should prefix)

```typescript
// ✅ Good
function isValidEmail(email: string): boolean { }
function hasPermission(user: User, permission: string): boolean { }
function canEditPost(user: User, post: Post): boolean { }
function shouldRetry(attempt: number): boolean { }

// ❌ Bad
function validEmail(email: string): boolean { }
function permission(user: User, perm: string): boolean { }
function editPost(user: User, post: Post): boolean { }
```

## Classes and Interfaces

### Classes (PascalCase, noun-based)

```typescript
// ✅ Good
class UserRepository { }
class EmailValidator { }
class PaymentProcessor { }
class HttpClient { }

// ❌ Bad
class userRepository { }
class validateEmail { }
class processPayment { }
class httpClient { }
```

### Interfaces (PascalCase, descriptive)

```typescript
// ✅ Good - No 'I' prefix (modern TypeScript convention)
interface User {
  id: string;
  email: string;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// ❌ Bad - Hungarian notation
interface IUser { }
interface IUserRepository { }
```

### Type Aliases (PascalCase)

```typescript
// ✅ Good
type UserId = string;
type UserRole = 'admin' | 'user' | 'guest';
type ApiResponse<T> = {
  data: T;
  error?: string;
};

// ❌ Bad
type userId = string;
type user_role = 'admin' | 'user' | 'guest';
```

## Enums

### Enums (PascalCase for enum, UPPER_SNAKE_CASE for values)

```typescript
// ✅ Good
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

// ❌ Bad
enum userRole {
  admin = 'admin',
  user = 'user'
}
```

## Generics

### Generic Type Parameters

```typescript
// ✅ Good - Descriptive single letter or full word
function map<T, U>(items: T[], fn: (item: T) => U): U[] { }
function createRepository<TEntity>(config: Config): Repository<TEntity> { }

// ✅ Good - Multiple related generics
interface Map<TKey, TValue> {
  get(key: TKey): TValue | undefined;
  set(key: TKey, value: TValue): void;
}

// ❌ Bad - Unclear or inconsistent
function map<A, B>(items: A[], fn: (item: A) => B): B[] { }
```

## Files and Directories

### File Names (kebab-case)

```
// ✅ Good
user-repository.ts
email-validator.ts
payment-processor.ts
api-client.ts

// ❌ Bad
UserRepository.ts
emailValidator.ts
payment_processor.ts
```

### Directory Names (kebab-case)

```
src/
├── user-management/
├── payment-processing/
├── api-clients/
└── shared-utilities/
```

## Private Members

### Private Fields (prefix with underscore)

```typescript
class UserService {
  // ✅ Good
  private _cache: Map<string, User>;
  private _apiClient: HttpClient;
  
  // ❌ Bad (no clear indication of privacy)
  private cache: Map<string, User>;
  private apiClient: HttpClient;
}
```

## Summary

- **Variables/Functions**: camelCase
- **Classes/Interfaces/Types**: PascalCase
- **Constants**: UPPER_SNAKE_CASE (true constants) or camelCase (config objects)
- **Files/Directories**: kebab-case
- **Booleans**: is/has/can/should prefix
- **Generics**: T, U, V or descriptive (TEntity, TKey, TValue)
- **Private**: Prefix with underscore

