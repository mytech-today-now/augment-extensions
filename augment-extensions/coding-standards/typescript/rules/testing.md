# TypeScript Testing Strategies

Comprehensive guide to testing TypeScript applications covering unit, integration, and end-to-end testing patterns.

## Table of Contents
- [Testing Pyramid](#testing-pyramid)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Snapshot vs Assertion Testing](#snapshot-vs-assertion-testing)
- [Property-Based Testing](#property-based-testing)
- [Test Organization Patterns](#test-organization-patterns)
- [MSW for API Mocking](#msw-for-api-mocking)
- [Best Practices](#best-practices)

---

## Testing Pyramid

The testing pyramid guides test distribution:

```
        /\
       /E2E\      ← Few (5-10%)
      /------\
     /  INT   \   ← Some (20-30%)
    /----------\
   /   UNIT     \ ← Many (60-75%)
  /--------------\
```

**Principles:**
- **Unit tests**: Fast, isolated, many
- **Integration tests**: Medium speed, test component interactions
- **E2E tests**: Slow, expensive, critical user flows only

---

## Unit Testing

### Basic Unit Test Structure

```typescript
// user-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user-service';
import type { UserRepository } from './user-repository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: UserRepository;

  beforeEach(() => {
    // Setup fresh mocks for each test
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn()
    };
    userService = new UserService(mockRepository);
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      mockRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUser('1');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUser('999')).rejects.toThrow('User not found');
    });
  });
});
```

### Testing Async Code

```typescript
// async-operations.test.ts
import { describe, it, expect } from 'vitest';
import { fetchUserData, retryOperation } from './async-operations';

describe('Async Operations', () => {
  it('should handle async/await', async () => {
    const data = await fetchUserData('123');
    expect(data).toBeDefined();
  });

  it('should handle promise rejection', async () => {
    await expect(fetchUserData('invalid')).rejects.toThrow('Invalid user ID');
  });

  it('should retry failed operations', async () => {
    let attempts = 0;
    const operation = vi.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Temporary failure');
      return 'success';
    });

    const result = await retryOperation(operation, { maxRetries: 3 });
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
```

### Testing React Components

```typescript
// button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

### Testing Database Integration

```typescript
// user-repository.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserRepository } from './user-repository';
import { createTestDatabase, cleanupDatabase } from '../test-utils/db';

describe('UserRepository Integration', () => {
  let repository: UserRepository;
  let db: Database;

  beforeEach(async () => {
    db = await createTestDatabase();
    repository = new UserRepository(db);
  });

  afterEach(async () => {
    await cleanupDatabase(db);
  });

  it('should save and retrieve user', async () => {
    const user = { name: 'John Doe', email: 'john@example.com' };

    const saved = await repository.save(user);
    expect(saved.id).toBeDefined();

    const retrieved = await repository.findById(saved.id);
    expect(retrieved).toEqual(saved);
  });

  it('should update existing user', async () => {
    const user = await repository.save({ name: 'John', email: 'john@example.com' });

    const updated = await repository.save({ ...user, name: 'Jane' });
    expect(updated.name).toBe('Jane');
    expect(updated.id).toBe(user.id);
  });
});
```

---

## End-to-End Testing

### Playwright E2E Tests

```typescript
// login.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});
```

### Cypress E2E Tests

```typescript
// checkout.cy.ts
describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('should complete purchase', () => {
    // Add item to cart
    cy.get('[data-testid="product-1"]').click();
    cy.get('[data-testid="add-to-cart"]').click();

    // Go to checkout
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="checkout-button"]').click();

    // Fill shipping info
    cy.get('input[name="address"]').type('123 Main St');
    cy.get('input[name="city"]').type('New York');
    cy.get('input[name="zip"]').type('10001');

    // Submit order
    cy.get('button[type="submit"]').click();

    // Verify success
    cy.url().should('include', '/order-confirmation');
    cy.contains('Order placed successfully').should('be.visible');
  });
});
```

---

## Snapshot vs Assertion Testing

### Snapshot Testing

**Use for:**
- Component rendering output
- API response structures
- Configuration objects
- Error messages

```typescript
// component-snapshot.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { UserCard } from './user-card';

describe('UserCard Snapshots', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <UserCard
        name="John Doe"
        email="john@example.com"
        role="admin"
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match inline snapshot', () => {
    const config = {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3
    };
    expect(config).toMatchInlineSnapshot(`
      {
        "apiUrl": "https://api.example.com",
        "retries": 3,
        "timeout": 5000,
      }
    `);
  });
});
```

### Assertion Testing

**Use for:**
- Business logic
- Calculations
- State changes
- Specific behaviors

```typescript
// assertion-testing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount, validateEmail } from './utils';

describe('Assertion Testing', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscount(100, 0.1)).toBe(10);
    expect(calculateDiscount(50, 0.2)).toBe(10);
    expect(calculateDiscount(0, 0.5)).toBe(0);
  });

  it('should validate email format', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});
```

**When to use each:**

| Snapshot Testing | Assertion Testing |
|-----------------|-------------------|
| UI component output | Business logic |
| Large data structures | Specific values |
| Regression detection | Behavior verification |
| Quick to write | More explicit |
| Can be brittle | More maintainable |

---

## Property-Based Testing

Property-based testing generates random inputs to test invariants.

### Using fast-check

```typescript
// property-based.test.ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sortArray, reverseString, addNumbers } from './utils';

describe('Property-Based Testing', () => {
  it('sorting should be idempotent', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted1 = sortArray(arr);
        const sorted2 = sortArray(sorted1);
        expect(sorted1).toEqual(sorted2);
      })
    );
  });

  it('reversing twice should return original', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const reversed = reverseString(reverseString(str));
        expect(reversed).toBe(str);
      })
    );
  });

  it('addition should be commutative', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        expect(addNumbers(a, b)).toBe(addNumbers(b, a));
      })
    );
  });

  it('array length should be preserved after mapping', () => {
    fc.assert(
      fc.property(fc.array(fc.anything()), (arr) => {
        const mapped = arr.map(x => x);
        expect(mapped.length).toBe(arr.length);
      })
    );
  });
});
```

### Custom Generators

```typescript
// custom-generators.test.ts
import fc from 'fast-check';

// Custom user generator
const userArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  age: fc.integer({ min: 18, max: 120 }),
  role: fc.constantFrom('admin', 'user', 'guest')
});

describe('User Validation', () => {
  it('should validate all generated users', () => {
    fc.assert(
      fc.property(userArbitrary, (user) => {
        expect(user.age).toBeGreaterThanOrEqual(18);
        expect(user.email).toContain('@');
        expect(['admin', 'user', 'guest']).toContain(user.role);
      })
    );
  });
});
```

---

## Test Organization Patterns

### File Structure

```
src/
├── components/
│   ├── button/
│   │   ├── button.tsx
│   │   ├── button.test.tsx          # Unit tests
│   │   └── button.stories.tsx       # Storybook
│   └── user-profile/
│       ├── user-profile.tsx
│       ├── user-profile.test.tsx
│       └── user-profile.integration.test.tsx
├── services/
│   ├── user-service.ts
│   └── user-service.test.ts
└── __tests__/
    ├── integration/                  # Integration tests
    │   └── api.integration.test.ts
    └── e2e/                          # E2E tests
        └── checkout.e2e.test.ts
```

### Test Naming Conventions

```typescript
// ✅ Good - Descriptive test names
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when found', () => {});
    it('should throw UserNotFoundError when user does not exist', () => {});
    it('should cache user data after first fetch', () => {});
  });

  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw ValidationError when email is invalid', () => {});
    it('should hash password before saving', () => {});
  });
});

// ❌ Bad - Vague test names
describe('UserService', () => {
  it('works', () => {});
  it('test1', () => {});
  it('should handle errors', () => {});
});
```

### Test Helpers and Utilities

```typescript
// test-utils/factories.ts
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides
});

export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: '456',
  name: 'Test Product',
  price: 99.99,
  stock: 10,
  ...overrides
});

// test-utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
    options
  );
};
```

---

## MSW for API Mocking

Mock Service Worker (MSW) intercepts network requests for testing.

### Setup

```typescript
// test-utils/msw-setup.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET request
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com'
    });
  }),

  // POST request
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: '123', ...body },
      { status: 201 }
    );
  }),

  // Error response
  http.get('/api/users/error', () => {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }),

  // Delayed response
  http.get('/api/slow', async () => {
    await delay(1000);
    return HttpResponse.json({ data: 'slow response' });
  })
];

export const server = setupServer(...handlers);
```

### Test Setup

```typescript
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './test-utils/msw-setup';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Using MSW in Tests

```typescript
// api-client.test.ts
import { describe, it, expect } from 'vitest';
import { server } from './test-utils/msw-setup';
import { http, HttpResponse } from 'msw';
import { fetchUser, createUser } from './api-client';

describe('API Client', () => {
  it('should fetch user successfully', async () => {
    const user = await fetchUser('123');

    expect(user).toEqual({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  it('should handle 404 errors', async () => {
    server.use(
      http.get('/api/users/:id', () => {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      })
    );

    await expect(fetchUser('999')).rejects.toThrow('Not found');
  });

  it('should create user', async () => {
    const newUser = { name: 'Jane Doe', email: 'jane@example.com' };
    const created = await createUser(newUser);

    expect(created).toMatchObject(newUser);
    expect(created.id).toBeDefined();
  });

  it('should handle network errors', async () => {
    server.use(
      http.get('/api/users/:id', () => {
        return HttpResponse.error();
      })
    );

    await expect(fetchUser('123')).rejects.toThrow('Network error');
  });
});
```

### Advanced MSW Patterns

```typescript
// Dynamic responses based on request
http.get('/api/search', ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return HttpResponse.json({ results: [] });
  }

  return HttpResponse.json({
    results: mockSearchResults.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase())
    )
  });
});

// Stateful mocking
let users: User[] = [];

http.post('/api/users', async ({ request }) => {
  const user = await request.json();
  const newUser = { id: String(users.length + 1), ...user };
  users.push(newUser);
  return HttpResponse.json(newUser, { status: 201 });
});

http.get('/api/users', () => {
  return HttpResponse.json(users);
});

// Request validation
http.post('/api/users', async ({ request }) => {
  const body = await request.json();

  if (!body.email || !body.name) {
    return HttpResponse.json(
      { error: 'Email and name are required' },
      { status: 400 }
    );
  }

  return HttpResponse.json({ id: '123', ...body }, { status: 201 });
});
```

---

## Best Practices

### DO ✅

**Write tests first (TDD)**
```typescript
// 1. Write failing test
it('should calculate total price', () => {
  expect(calculateTotal([10, 20, 30])).toBe(60);
});

// 2. Implement minimal code to pass
function calculateTotal(prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}

// 3. Refactor
```

**Use AAA pattern (Arrange, Act, Assert)**
```typescript
it('should add item to cart', () => {
  // Arrange
  const cart = new ShoppingCart();
  const item = { id: '1', name: 'Product', price: 10 };

  // Act
  cart.addItem(item);

  // Assert
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBe(10);
});
```

**Test behavior, not implementation**
```typescript
// ✅ Good - Tests behavior
it('should display user name after login', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(screen.getByText('Welcome, John')).toBeInTheDocument();
});

// ❌ Bad - Tests implementation
it('should call setState with user data', () => {
  const setState = vi.fn();
  // Testing internal implementation details
});
```

**Keep tests independent**
```typescript
// ✅ Good - Each test is independent
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});

// ❌ Bad - Tests depend on each other
describe('UserService', () => {
  let user: User;

  it('should create user', () => {
    user = service.create({ name: 'John' });
  });

  it('should update user', () => {
    service.update(user.id, { name: 'Jane' }); // Depends on previous test
  });
});
```

**Use descriptive test names**
```typescript
// ✅ Good
it('should throw ValidationError when email is missing', () => {});
it('should return cached data on second request', () => {});
it('should retry failed requests up to 3 times', () => {});

// ❌ Bad
it('test email', () => {});
it('caching works', () => {});
it('retries', () => {});
```

### DON'T ❌

**Don't test external libraries**
```typescript
// ❌ Bad - Testing React itself
it('useState should update state', () => {
  // Don't test React's functionality
});

// ✅ Good - Test your code
it('should update count when button is clicked', () => {
  // Test your component's behavior
});
```

**Don't use real external services**
```typescript
// ❌ Bad - Real API call
it('should fetch user', async () => {
  const user = await fetch('https://api.example.com/users/1');
  // Slow, unreliable, requires network
});

// ✅ Good - Mocked API
it('should fetch user', async () => {
  server.use(
    http.get('/api/users/1', () => HttpResponse.json(mockUser))
  );
  const user = await fetchUser('1');
});
```

**Don't test too many things at once**
```typescript
// ❌ Bad - Testing multiple behaviors
it('should handle user lifecycle', async () => {
  const user = await createUser({ name: 'John' });
  await updateUser(user.id, { name: 'Jane' });
  await deleteUser(user.id);
  // Too much in one test
});

// ✅ Good - Separate tests
it('should create user', async () => { /* ... */ });
it('should update user', async () => { /* ... */ });
it('should delete user', async () => { /* ... */ });
```

---

## Summary

**Key Takeaways:**

1. **Follow the testing pyramid** - Many unit tests, some integration tests, few E2E tests
2. **Use MSW for API mocking** - Intercept network requests at the network level
3. **Write descriptive test names** - Tests should document behavior
4. **Keep tests independent** - Each test should run in isolation
5. **Test behavior, not implementation** - Focus on what, not how
6. **Use property-based testing** - For testing invariants and edge cases
7. **Organize tests logically** - Co-locate tests with source code
8. **Use snapshots sparingly** - Prefer explicit assertions for critical logic
9. **Mock external dependencies** - Keep tests fast and reliable
10. **Practice TDD** - Write tests first, then implement

**Testing Checklist:**

- [ ] Unit tests for all business logic
- [ ] Integration tests for component interactions
- [ ] E2E tests for critical user flows
- [ ] API mocking with MSW
- [ ] Test coverage > 80%
- [ ] All tests pass in CI/CD
- [ ] Tests run in < 10 seconds (unit tests)
- [ ] No flaky tests
- [ ] Tests are maintainable and readable

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Playwright](https://playwright.dev/)
- [fast-check](https://fast-check.dev/)
- [Kent C. Dodds - Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)


---

## Integration Testing

### Testing Component Integration

```typescript
// user-profile.integration.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './user-profile';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com'
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile Integration', () => {
  it('should fetch and display user data', async () => {
    render(<UserProfile userId="123" />);

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

