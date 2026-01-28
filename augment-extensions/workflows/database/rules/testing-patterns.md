# Database Testing Patterns

## Purpose

Provide comprehensive testing strategies for database schemas, queries, migrations, and data integrity.

---

## Testing Levels

### 1. Unit Tests

**Purpose**: Test individual database components in isolation

**What to Test**:
- Constraints (primary keys, foreign keys, unique, check)
- Default values
- Triggers
- Stored procedures/functions
- Data validation rules

**Example** (PostgreSQL with Jest):
```javascript
describe('Users table constraints', () => {
  test('email must be unique', async () => {
    await db.query('INSERT INTO users (email) VALUES ($1)', ['test@example.com']);
    
    await expect(
      db.query('INSERT INTO users (email) VALUES ($1)', ['test@example.com'])
    ).rejects.toThrow(/unique constraint/);
  });
  
  test('email cannot be null', async () => {
    await expect(
      db.query('INSERT INTO users (name) VALUES ($1)', ['John'])
    ).rejects.toThrow(/not null constraint/);
  });
});
```

### 2. Integration Tests

**Purpose**: Test database interactions with application code

**What to Test**:
- CRUD operations
- Complex queries
- Transactions
- Relationships between tables
- Data consistency across operations

**Example** (Node.js with Jest):
```javascript
describe('Order creation', () => {
  test('creates order with line items in transaction', async () => {
    const order = await createOrder({
      userId: 1,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ]
    });
    
    expect(order.id).toBeDefined();
    expect(order.total).toBe(150.00);
    
    const lineItems = await db.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );
    expect(lineItems.rows).toHaveLength(2);
  });
  
  test('rolls back order if payment fails', async () => {
    await expect(
      createOrder({ userId: 1, items: [], paymentFails: true })
    ).rejects.toThrow();
    
    const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [1]);
    expect(orders.rows).toHaveLength(0);
  });
});
```

### 3. Performance Tests

**Purpose**: Ensure queries and operations meet performance requirements

**What to Test**:
- Query execution time
- Index effectiveness
- Bulk operation performance
- Concurrent access handling

**Example** (Node.js with Jest):
```javascript
describe('Query performance', () => {
  test('user search completes within 100ms', async () => {
    const start = Date.now();
    await db.query(
      'SELECT * FROM users WHERE email LIKE $1 LIMIT 10',
      ['%@example.com']
    );
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  test('bulk insert handles 10k records efficiently', async () => {
    const records = Array.from({ length: 10000 }, (_, i) => ({
      email: `user${i}@example.com`,
      name: `User ${i}`
    }));
    
    const start = Date.now();
    await bulkInsertUsers(records);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
```

### 4. Migration Tests

**Purpose**: Verify migrations execute correctly and can be rolled back

**What to Test**:
- Migration succeeds
- Rollback succeeds
- Data integrity after migration
- Application compatibility during migration

**Example** (Node.js with Jest):
```javascript
describe('Add email_verified column migration', () => {
  beforeEach(async () => {
    await runMigration('down', '20240115_add_email_verified');
  });
  
  test('migration adds column with default value', async () => {
    await runMigration('up', '20240115_add_email_verified');
    
    const result = await db.query(`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    `);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].column_default).toBe('false');
  });
  
  test('rollback removes column', async () => {
    await runMigration('up', '20240115_add_email_verified');
    await runMigration('down', '20240115_add_email_verified');
    
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    `);
    
    expect(result.rows).toHaveLength(0);
  });
});
```

---

## Test Data Management

### Fixtures

**Purpose**: Provide consistent, reusable test data

**Best Practices**:
- Use factories for generating test data
- Keep fixtures minimal (only what's needed for test)
- Use realistic data (avoid "test", "foo", "bar")
- Version fixtures with schema changes

**Example** (JavaScript factory):
```javascript
const userFactory = {
  build: (overrides = {}) => ({
    email: `user${Date.now()}@example.com`,
    name: 'Test User',
    created_at: new Date(),
    ...overrides
  }),
  
  create: async (overrides = {}) => {
    const user = userFactory.build(overrides);
    const result = await db.query(
      'INSERT INTO users (email, name, created_at) VALUES ($1, $2, $3) RETURNING *',
      [user.email, user.name, user.created_at]
    );
    return result.rows[0];
  }
};
```

### Database Seeding

**Purpose**: Populate database with initial data for testing

**Strategies**:
- **Minimal Seed**: Only essential data (users, roles, etc.)
- **Full Seed**: Realistic dataset for manual testing
- **Performance Seed**: Large dataset for performance testing

**Example** (seed script):
```javascript
async function seed() {
  // Create admin user
  await userFactory.create({ email: 'admin@example.com', role: 'admin' });
  
  // Create 100 regular users
  for (let i = 0; i < 100; i++) {
    await userFactory.create();
  }
  
  // Create products
  const products = await Promise.all([
    productFactory.create({ name: 'Product 1', price: 10.00 }),
    productFactory.create({ name: 'Product 2', price: 20.00 })
  ]);
  
  console.log('Database seeded successfully');
}
```

### Test Isolation

**Purpose**: Ensure tests don't interfere with each other

**Strategies**:

**1. Transaction Rollback** (fastest):
```javascript
beforeEach(async () => {
  await db.query('BEGIN');
});

afterEach(async () => {
  await db.query('ROLLBACK');
});
```

**2. Database Truncation**:
```javascript
afterEach(async () => {
  await db.query('TRUNCATE users, orders, order_items CASCADE');
});
```

**3. Database Recreation** (slowest, most thorough):
```javascript
beforeEach(async () => {
  await dropDatabase('test_db');
  await createDatabase('test_db');
  await runMigrations('test_db');
});
```

---

## AI Prompt Templates

### Creating Unit Tests

```
Create unit tests for this database schema:

[paste schema]

Test framework: [Jest/Mocha/pytest/etc.]
Database: [PostgreSQL/MySQL/etc.]

Please create tests for:
- All constraints (primary key, foreign key, unique, not null)
- Default values
- Data validation rules
```

### Creating Integration Tests

```
Create integration tests for this database operation:

[paste code or describe operation]

Schema:
[paste relevant schema]

Test framework: [Jest/Mocha/pytest/etc.]

Please create tests covering:
- Happy path
- Error cases
- Edge cases
- Transaction rollback
```

