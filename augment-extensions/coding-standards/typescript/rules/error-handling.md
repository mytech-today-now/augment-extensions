# TypeScript Error Handling Strategies

Comprehensive guide to error handling in TypeScript applications covering traditional approaches and modern functional patterns.

## Table of Contents
- [Traditional Try/Catch](#traditional-trycatch)
- [Result Types](#result-types)
- [Neverthrow Pattern](#neverthrow-pattern)
- [Effect-TS Introduction](#effect-ts-introduction)
- [Error Boundary Patterns](#error-boundary-patterns)
- [Best Practices](#best-practices)

---

## Traditional Try/Catch

The standard JavaScript/TypeScript error handling approach.

### Basic Try/Catch

```typescript
// Basic error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error; // Re-throw or handle
  }
}
```

### Custom Error Classes

```typescript
// Custom error hierarchy
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public readonly fields: string[]) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// Usage
async function getUser(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
}

async function createUser(data: CreateUserDto): Promise<User> {
  const errors: string[] = [];
  
  if (!data.email) errors.push('email');
  if (!data.name) errors.push('name');
  
  if (errors.length > 0) {
    throw new ValidationError('Missing required fields', errors);
  }
  
  return await userRepository.save(data);
}
```

### Error Handling Middleware (Express)

```typescript
// error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { fields: error.fields })
      }
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}

// Usage in Express app
app.use(errorHandler);
```

### Async Error Handling

```typescript
// Wrapper for async route handlers
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.id); // Errors automatically caught
  res.json(user);
}));
```

### Pros and Cons of Try/Catch

**Pros:**
- ✅ Familiar to most developers
- ✅ Built into JavaScript/TypeScript
- ✅ Works with async/await
- ✅ Stack traces included

**Cons:**
- ❌ Errors not visible in type signatures
- ❌ Easy to forget error handling
- ❌ Can't enforce error handling at compile time
- ❌ Difficult to compose error-prone operations

---

## Result Types

Explicit error handling using discriminated unions.

### Basic Result Type

```typescript
// result.ts
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Helper functions
function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Usage
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err('Division by zero');
  }
  return ok(a / b);
}

// Pattern matching
const result = divide(10, 2);
if (result.success) {
  console.log('Result:', result.value); // TypeScript knows value exists
} else {
  console.error('Error:', result.error); // TypeScript knows error exists
}
```

### Advanced Result Type

```typescript
// result.ts
export class Result<T, E = Error> {
  private constructor(
    private readonly _success: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static err<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }

  isOk(): this is Result<T, never> {
    return this._success;
  }

  isErr(): this is Result<never, E> {
    return !this._success;
  }

  unwrap(): T {
    if (!this._success) {
      throw new Error('Called unwrap on an Err value');
    }
    return this._value!;
  }

  unwrapOr(defaultValue: T): T {
    return this._success ? this._value! : defaultValue;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._success
      ? Result.ok(fn(this._value!))
      : Result.err(this._error!);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this._success
      ? Result.ok(this._value!)
      : Result.err(fn(this._error!));
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._success ? fn(this._value!) : Result.err(this._error!);
  }

  match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
    return this._success ? onOk(this._value!) : onErr(this._error!);
  }
}

// Usage examples
function parseNumber(input: string): Result<number, string> {
  const num = Number(input);
  return isNaN(num)
    ? Result.err('Invalid number')
    : Result.ok(num);
}

function divide(a: number, b: number): Result<number, string> {
  return b === 0
    ? Result.err('Division by zero')
    : Result.ok(a / b);
}

// Chaining operations
const result = parseNumber('10')
  .andThen(num => divide(num, 2))
  .map(result => result * 2);

result.match(
  value => console.log('Success:', value),
  error => console.error('Error:', error)
);
```

---

## Neverthrow Pattern

Neverthrow is a popular library for Result types in TypeScript.

### Installation

```bash
npm install neverthrow
```

### Basic Usage

```typescript
import { ok, err, Result } from 'neverthrow';

// Define error types
type DivisionError = 'DIVISION_BY_ZERO';
type ParseError = 'INVALID_NUMBER';

function parseNumber(input: string): Result<number, ParseError> {
  const num = Number(input);
  return isNaN(num) ? err('INVALID_NUMBER') : ok(num);
}

function divide(a: number, b: number): Result<number, DivisionError> {
  return b === 0 ? err('DIVISION_BY_ZERO') : ok(a / b);
}

// Chaining with andThen
const result = parseNumber('10')
  .andThen(num => divide(num, 2));

if (result.isOk()) {
  console.log('Result:', result.value);
} else {
  console.error('Error:', result.error);
}
```

### Async Operations with ResultAsync

```typescript
import { okAsync, errAsync, ResultAsync } from 'neverthrow';

type UserNotFoundError = { type: 'USER_NOT_FOUND'; id: string };
type DatabaseError = { type: 'DATABASE_ERROR'; message: string };

async function fetchUser(id: string): ResultAsync<User, UserNotFoundError | DatabaseError> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (response.status === 404) {
      return errAsync({ type: 'USER_NOT_FOUND', id });
    }

    if (!response.ok) {
      return errAsync({
        type: 'DATABASE_ERROR',
        message: `HTTP ${response.status}`
      });
    }

    const user = await response.json();
    return okAsync(user);
  } catch (error) {
    return errAsync({
      type: 'DATABASE_ERROR',
      message: error.message
    });
  }
}

// Usage
const userResult = await fetchUser('123');

userResult.match(
  user => console.log('User:', user),
  error => {
    if (error.type === 'USER_NOT_FOUND') {
      console.error('User not found:', error.id);
    } else {
      console.error('Database error:', error.message);
    }
  }
);
```

### Combining Multiple Results

```typescript
import { Result, combine } from 'neverthrow';

type ValidationError = { field: string; message: string };

function validateEmail(email: string): Result<string, ValidationError> {
  return email.includes('@')
    ? ok(email)
    : err({ field: 'email', message: 'Invalid email format' });
}

function validateAge(age: number): Result<number, ValidationError> {
  return age >= 18
    ? ok(age)
    : err({ field: 'age', message: 'Must be 18 or older' });
}

function validateName(name: string): Result<string, ValidationError> {
  return name.length >= 2
    ? ok(name)
    : err({ field: 'name', message: 'Name too short' });
}

// Combine all validations
function validateUser(data: {
  email: string;
  age: number;
  name: string;
}): Result<{ email: string; age: number; name: string }, ValidationError[]> {
  const results = [
    validateEmail(data.email),
    validateAge(data.age),
    validateName(data.name)
  ];

  return combine(results).map(([email, age, name]) => ({
    email,
    age,
    name
  }));
}

// Usage
const result = validateUser({
  email: 'invalid-email',
  age: 16,
  name: 'J'
});

if (result.isErr()) {
  console.error('Validation errors:', result.error);
  // [
  //   { field: 'email', message: 'Invalid email format' },
  //   { field: 'age', message: 'Must be 18 or older' },
  //   { field: 'name', message: 'Name too short' }
  // ]
}
```

### Service Layer with Neverthrow

```typescript
import { Result, ok, err, ResultAsync } from 'neverthrow';

type UserError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'ALREADY_EXISTS'; email: string }
  | { type: 'VALIDATION_ERROR'; errors: ValidationError[] }
  | { type: 'DATABASE_ERROR'; message: string };

class UserService {
  constructor(
    private repository: UserRepository,
    private emailService: EmailService
  ) {}

  async createUser(
    data: CreateUserDto
  ): ResultAsync<User, UserError> {
    // Validate input
    const validationResult = this.validateUserData(data);
    if (validationResult.isErr()) {
      return errAsync({
        type: 'VALIDATION_ERROR',
        errors: validationResult.error
      });
    }

    // Check if user exists
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser.isOk() && existingUser.value !== null) {
      return errAsync({
        type: 'ALREADY_EXISTS',
        email: data.email
      });
    }

    // Create user
    const user = User.create(data);
    const saveResult = await this.repository.save(user);

    if (saveResult.isErr()) {
      return errAsync({
        type: 'DATABASE_ERROR',
        message: saveResult.error
      });
    }

    // Send welcome email (don't fail if email fails)
    await this.emailService.sendWelcome(user.email);

    return okAsync(user);
  }

  async getUser(id: string): ResultAsync<User, UserError> {
    const result = await this.repository.findById(id);

    return result.andThen(user =>
      user === null
        ? err({ type: 'NOT_FOUND', id })
        : ok(user)
    );
  }

  private validateUserData(
    data: CreateUserDto
  ): Result<void, ValidationError[]> {
    const errors: ValidationError[] = [];

    if (!data.email || !data.email.includes('@')) {
      errors.push({ field: 'email', message: 'Invalid email' });
    }

    if (!data.name || data.name.length < 2) {
      errors.push({ field: 'name', message: 'Name too short' });
    }

    return errors.length > 0 ? err(errors) : ok(undefined);
  }
}
```

### Controller with Neverthrow

```typescript
import { Request, Response } from 'express';

class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.userService.createUser(req.body);

    result.match(
      user => res.status(201).json(user),
      error => {
        switch (error.type) {
          case 'VALIDATION_ERROR':
            res.status(400).json({ errors: error.errors });
            break;
          case 'ALREADY_EXISTS':
            res.status(409).json({ message: `Email ${error.email} already exists` });
            break;
          case 'DATABASE_ERROR':
            res.status(500).json({ message: 'Internal server error' });
            break;
        }
      }
    );
  }

  async get(req: Request, res: Response): Promise<void> {
    const result = await this.userService.getUser(req.params.id);

    result.match(
      user => res.json(user),
      error => {
        if (error.type === 'NOT_FOUND') {
          res.status(404).json({ message: `User ${error.id} not found` });
        } else {
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    );
  }
}
```

---

## Effect-TS Introduction

Effect-TS is a powerful library for functional error handling and effect management.

### Installation

```bash
npm install effect
```

### Basic Effect Usage

```typescript
import { Effect } from 'effect';

// Define error types
class DivisionByZeroError {
  readonly _tag = 'DivisionByZeroError';
}

class InvalidInputError {
  readonly _tag = 'InvalidInputError';
  constructor(readonly input: string) {}
}

// Create effects
const divide = (a: number, b: number): Effect.Effect<number, DivisionByZeroError> =>
  b === 0
    ? Effect.fail(new DivisionByZeroError())
    : Effect.succeed(a / b);

const parseNumber = (input: string): Effect.Effect<number, InvalidInputError> => {
  const num = Number(input);
  return isNaN(num)
    ? Effect.fail(new InvalidInputError(input))
    : Effect.succeed(num);
};

// Compose effects
const program = Effect.gen(function* (_) {
  const a = yield* _(parseNumber('10'));
  const b = yield* _(parseNumber('2'));
  const result = yield* _(divide(a, b));
  return result;
});

// Run effect
Effect.runPromise(program)
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

### Effect with Dependencies

```typescript
import { Effect, Context } from 'effect';

// Define service interfaces
class Database extends Context.Tag('Database')<
  Database,
  {
    query: (sql: string) => Effect.Effect<any[], DatabaseError>;
  }
>() {}

class Logger extends Context.Tag('Logger')<
  Logger,
  {
    log: (message: string) => Effect.Effect<void>;
  }
>() {}

// Define errors
class DatabaseError {
  readonly _tag = 'DatabaseError';
  constructor(readonly message: string) {}
}

class UserNotFoundError {
  readonly _tag = 'UserNotFoundError';
  constructor(readonly id: string) {}
}

// Use services in effects
const getUser = (id: string): Effect.Effect<
  User,
  DatabaseError | UserNotFoundError,
  Database | Logger
> =>
  Effect.gen(function* (_) {
    const db = yield* _(Database);
    const logger = yield* _(Logger);

    yield* _(logger.log(`Fetching user ${id}`));

    const rows = yield* _(db.query(`SELECT * FROM users WHERE id = '${id}'`));

    if (rows.length === 0) {
      return yield* _(Effect.fail(new UserNotFoundError(id)));
    }

    return rows[0] as User;
  });

// Provide implementations
const DatabaseLive = Database.of({
  query: (sql: string) =>
    Effect.tryPromise({
      try: () => database.query(sql),
      catch: (error) => new DatabaseError(String(error))
    })
});

const LoggerLive = Logger.of({
  log: (message: string) =>
    Effect.sync(() => console.log(message))
});

// Run with dependencies
const program = getUser('123').pipe(
  Effect.provide(DatabaseLive),
  Effect.provide(LoggerLive)
);

Effect.runPromise(program);
```

---

## Error Boundary Patterns

Error boundaries catch errors in React component trees.

### React Error Boundary

```typescript
// error-boundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // Log to error tracking service
        logErrorToService(error, errorInfo);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Advanced Error Boundary with Reset

```typescript
// resettable-error-boundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ResettableErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ResettableErrorBoundary
      fallback={(error, reset) => (
        <div>
          <h1>Error: {error.message}</h1>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
      onReset={() => {
        // Clear any error state
        window.location.reload();
      }}
    >
      <MyComponent />
    </ResettableErrorBoundary>
  );
}
```

### Error Boundary with React Query

```typescript
// query-error-boundary.tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function QueryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <h1>Error loading data</h1>
              <p>{error.message}</p>
              <button onClick={resetErrorBoundary}>Retry</button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

// Usage
function App() {
  return (
    <QueryErrorBoundary>
      <UserProfile userId="123" />
    </QueryErrorBoundary>
  );
}
```

### Multiple Error Boundaries

```typescript
// app.tsx
function App() {
  return (
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <Header />

      <ErrorBoundary fallback={<SidebarErrorFallback />}>
        <Sidebar />
      </ErrorBoundary>

      <main>
        <ErrorBoundary fallback={<ContentErrorFallback />}>
          <Content />
        </ErrorBoundary>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}
```

### Error Boundary Best Practices

```typescript
// ✅ Good - Granular error boundaries
function Dashboard() {
  return (
    <div>
      <ErrorBoundary fallback={<WidgetError />}>
        <UserWidget />
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError />}>
        <StatsWidget />
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError />}>
        <ChartWidget />
      </ErrorBoundary>
    </div>
  );
}

// ❌ Bad - Single error boundary for entire app
function App() {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

---

## Best Practices

### DO ✅

**Use custom error classes**
```typescript
// ✅ Good - Custom error hierarchy
class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message: string, public fields: string[]) {
    super(message, 'VALIDATION_ERROR');
  }
}

// ❌ Bad - Generic errors
throw new Error('Something went wrong');
```

**Make errors explicit in types (Result pattern)**
```typescript
// ✅ Good - Error in type signature
function divide(a: number, b: number): Result<number, DivisionError> {
  return b === 0 ? err('DIVISION_BY_ZERO') : ok(a / b);
}

// ❌ Bad - Hidden error
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero'); // Not visible in type
  return a / b;
}
```

**Handle errors at appropriate level**
```typescript
// ✅ Good - Handle at controller level
class UserController {
  async create(req: Request, res: Response) {
    const result = await this.userService.createUser(req.body);

    result.match(
      user => res.status(201).json(user),
      error => res.status(400).json({ error: error.message })
    );
  }
}

// ❌ Bad - Swallow errors
class UserService {
  async createUser(data: CreateUserDto) {
    try {
      return await this.repository.save(data);
    } catch (error) {
      console.log(error); // Just logging, not handling
      return null; // Hiding the error
    }
  }
}
```

**Provide context in errors**
```typescript
// ✅ Good - Detailed error context
class UserNotFoundError extends AppError {
  constructor(
    public readonly userId: string,
    public readonly searchedBy: 'id' | 'email'
  ) {
    super(
      `User not found: ${searchedBy}=${userId}`,
      'USER_NOT_FOUND'
    );
  }
}

// ❌ Bad - Generic error
throw new Error('User not found');
```

**Use error boundaries in React**
```typescript
// ✅ Good - Error boundary for each major section
function App() {
  return (
    <>
      <ErrorBoundary fallback={<HeaderError />}>
        <Header />
      </ErrorBoundary>

      <ErrorBoundary fallback={<ContentError />}>
        <Content />
      </ErrorBoundary>
    </>
  );
}

// ❌ Bad - No error boundaries
function App() {
  return (
    <>
      <Header />
      <Content />
    </>
  );
}
```

### DON'T ❌

**Don't swallow errors**
```typescript
// ❌ Bad - Swallowing errors
try {
  await riskyOperation();
} catch (error) {
  // Silent failure
}

// ✅ Good - Handle or re-throw
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  throw error; // Re-throw if can't handle
}
```

**Don't use errors for control flow**
```typescript
// ❌ Bad - Using exceptions for control flow
function findUser(id: string): User {
  try {
    return database.query(`SELECT * FROM users WHERE id = ${id}`)[0];
  } catch {
    return null; // Using exception for "not found"
  }
}

// ✅ Good - Return null or Result type
function findUser(id: string): User | null {
  const users = database.query(`SELECT * FROM users WHERE id = ${id}`);
  return users[0] || null;
}

// ✅ Better - Use Result type
function findUser(id: string): Result<User, UserNotFoundError> {
  const users = database.query(`SELECT * FROM users WHERE id = ${id}`);
  return users[0] ? ok(users[0]) : err(new UserNotFoundError(id));
}
```

**Don't catch errors you can't handle**
```typescript
// ❌ Bad - Catching everything
try {
  await complexOperation();
} catch (error) {
  console.log('Error:', error); // Can't actually handle it
}

// ✅ Good - Only catch what you can handle
try {
  await complexOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    return { errors: error.fields };
  }
  throw error; // Re-throw unknown errors
}
```

**Don't lose error context**
```typescript
// ❌ Bad - Losing original error
try {
  await fetchData();
} catch (error) {
  throw new Error('Failed to fetch'); // Lost original error
}

// ✅ Good - Preserve error context
try {
  await fetchData();
} catch (error) {
  throw new Error(`Failed to fetch: ${error.message}`, { cause: error });
}
```

---

## Summary

**Key Takeaways:**

1. **Choose the right approach** - Try/catch for simple cases, Result types for explicit error handling
2. **Make errors explicit** - Use Result types or custom error classes
3. **Use custom error classes** - Create error hierarchies for different error types
4. **Handle errors at appropriate level** - Don't swallow errors, handle where you can
5. **Provide error context** - Include relevant information in error messages
6. **Use error boundaries in React** - Prevent entire app crashes
7. **Consider Neverthrow** - For functional error handling with Result types
8. **Consider Effect-TS** - For advanced effect management and dependency injection
9. **Don't use errors for control flow** - Use return values or Result types
10. **Log errors appropriately** - Include context and stack traces

**Error Handling Checklist:**

- [ ] Custom error classes defined
- [ ] Errors include context (IDs, parameters, etc.)
- [ ] Error handling at appropriate level
- [ ] No swallowed errors
- [ ] Error boundaries in React components
- [ ] Errors logged with sufficient detail
- [ ] Type signatures reflect possible errors (Result types)
- [ ] Error messages are user-friendly
- [ ] Stack traces preserved
- [ ] Error tracking service integrated

**When to Use Each Approach:**

| Approach | Use When |
|----------|----------|
| Try/Catch | Simple error handling, async/await, familiar to team |
| Result Types | Want explicit errors in types, functional style, composable operations |
| Neverthrow | Need Result types with good TypeScript support |
| Effect-TS | Complex effect management, dependency injection, advanced functional programming |
| Error Boundaries | React applications, prevent UI crashes |

---

## References

- [Neverthrow Documentation](https://github.com/supermacro/neverthrow)
- [Effect-TS Documentation](https://effect.website/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TypeScript Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Functional Error Handling](https://fsharpforfunandprofit.com/posts/recipe-part2/)


