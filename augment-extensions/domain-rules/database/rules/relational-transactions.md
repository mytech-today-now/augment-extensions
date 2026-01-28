# Relational Transactions

## Overview

This document covers transaction management in relational databases, including ACID properties, transaction isolation levels, deadlock prevention, locking strategies, savepoints, and distributed transactions.

---

## ACID Properties

### Atomicity

**Definition**: All operations in a transaction succeed or all fail (all-or-nothing)

**Example: Bank Transfer**
```sql
BEGIN TRANSACTION;

-- Deduct from account A
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- Add to account B
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Both succeed or both fail
COMMIT;
```

**If any operation fails:**
```sql
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- Succeeds
UPDATE accounts SET balance = balance + 100 WHERE id = 999;  -- Fails (account doesn't exist)

ROLLBACK;  -- First update is rolled back
```

### Consistency

**Definition**: Database remains in a valid state before and after transaction

**Example: Constraints Ensure Consistency**
```sql
-- Add constraint
ALTER TABLE accounts ADD CONSTRAINT check_balance CHECK (balance >= 0);

-- This transaction will fail if it violates the constraint
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
COMMIT;  -- Fails if balance would go negative
```

**Example: Referential Integrity**
```sql
-- Foreign key ensures consistency
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id)
);

-- This will fail if user doesn't exist
INSERT INTO orders (user_id) VALUES (999);  -- Error: foreign key violation
```

### Isolation

**Definition**: Concurrent transactions don't interfere with each other

**See "Transaction Isolation Levels" section for details**

### Durability

**Definition**: Committed transactions persist even after system failure

**Implementation:**
- Write-ahead logging (WAL)
- Transaction logs
- Checkpoints
- Replication

**Example:**
```sql
BEGIN TRANSACTION;
INSERT INTO orders (user_id, total) VALUES (1, 100.00);
COMMIT;  -- Data is written to disk and persists even if system crashes
```

---

## Transaction Isolation Levels

### Overview

**Isolation levels** control how transactions interact with each other.

**Trade-off**: Higher isolation = more consistency, less concurrency

**Standard levels** (from least to most isolated):
1. Read Uncommitted
2. Read Committed (default in most databases)
3. Repeatable Read
4. Serializable

### Read Uncommitted

**Allows**: Dirty reads, non-repeatable reads, phantom reads

**Use case**: Rarely used (only when performance is critical and dirty reads are acceptable)

```sql
-- PostgreSQL (not supported, falls back to Read Committed)
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

**Dirty Read Example:**
```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- Not committed yet

-- Transaction 2 (can see uncommitted changes)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 1000 (dirty read)
COMMIT;

-- Transaction 1 rolls back
ROLLBACK;  -- Balance is back to original value
```

### Read Committed

**Prevents**: Dirty reads
**Allows**: Non-repeatable reads, phantom reads

**Default in**: PostgreSQL, Oracle, SQL Server

```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

**Non-Repeatable Read Example:**
```sql
-- Transaction 1
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 500

-- Transaction 2 (commits a change)
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction 1 (reads again, sees different value)
SELECT balance FROM accounts WHERE id = 1;  -- Returns 1000 (non-repeatable read)
COMMIT;
```

### Repeatable Read

**Prevents**: Dirty reads, non-repeatable reads
**Allows**: Phantom reads

**Default in**: MySQL (InnoDB)

```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

**Phantom Read Example:**
```sql
-- Transaction 1
BEGIN;
SELECT COUNT(*) FROM orders WHERE user_id = 1;  -- Returns 5

-- Transaction 2 (inserts a new row)
BEGIN;
INSERT INTO orders (user_id, total) VALUES (1, 100.00);
COMMIT;

-- Transaction 1 (counts again, may see different count)
SELECT COUNT(*) FROM orders WHERE user_id = 1;  -- May return 6 (phantom read)
COMMIT;
```

**Note**: PostgreSQL's Repeatable Read prevents phantom reads (behaves like Serializable for most cases)

### Serializable

**Prevents**: Dirty reads, non-repeatable reads, phantom reads

**Use case**: When absolute consistency is required

```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**Trade-off**: Highest consistency, lowest concurrency (may cause serialization failures)

### Isolation Level Comparison

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|-------|------------|---------------------|--------------|-------------|
| Read Uncommitted | ✅ Possible | ✅ Possible | ✅ Possible | Highest |
| Read Committed | ❌ Prevented | ✅ Possible | ✅ Possible | High |
| Repeatable Read | ❌ Prevented | ❌ Prevented | ✅ Possible* | Medium |
| Serializable | ❌ Prevented | ❌ Prevented | ❌ Prevented | Lowest |

*PostgreSQL's Repeatable Read prevents phantom reads

### Choosing Isolation Level

**Use Read Committed when:**
- ✅ Default for most applications
- ✅ Good balance of consistency and performance
- ✅ Dirty reads are unacceptable
- ✅ Non-repeatable reads are acceptable

**Use Repeatable Read when:**
- ✅ Consistent reads within transaction are required
- ✅ Reporting or analytics queries
- ✅ Batch processing

**Use Serializable when:**
- ✅ Absolute consistency is required
- ✅ Financial transactions
- ✅ Inventory management
- ✅ Low concurrency scenarios

---

## Locking Strategies

### Optimistic Locking

**Principle**: Assume conflicts are rare, check before committing

**Implementation**: Use version column or timestamp

```sql
-- Add version column
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;

-- Read with version
SELECT id, name, price, version FROM products WHERE id = 1;
-- Returns: id=1, name='Widget', price=10.00, version=5

-- Update with version check
UPDATE products
SET price = 12.00, version = version + 1
WHERE id = 1 AND version = 5;

-- Check affected rows
-- If 0 rows affected, another transaction updated the record (conflict)
```

**Application-level example:**
```javascript
// Read product
const product = await db.query('SELECT * FROM products WHERE id = ?', [1]);

// User modifies price
product.price = 12.00;

// Update with version check
const result = await db.query(
  'UPDATE products SET price = ?, version = version + 1 WHERE id = ? AND version = ?',
  [product.price, product.id, product.version]
);

if (result.affectedRows === 0) {
  throw new Error('Product was modified by another user. Please refresh and try again.');
}
```

**Benefits:**
- ✅ Better performance (no locks held)
- ✅ Better scalability
- ✅ No deadlocks

**Drawbacks:**
- ❌ Conflicts must be handled by application
- ❌ Not suitable for high-conflict scenarios

### Pessimistic Locking

**Principle**: Lock rows before modifying to prevent conflicts

**Implementation**: Use SELECT FOR UPDATE

```sql
-- Lock row for update
BEGIN;
SELECT * FROM products WHERE id = 1 FOR UPDATE;

-- Other transactions will wait here
UPDATE products SET price = 12.00 WHERE id = 1;

COMMIT;  -- Lock is released
```

**Lock types:**

```sql
-- Exclusive lock (blocks all other locks)
SELECT * FROM products WHERE id = 1 FOR UPDATE;

-- Shared lock (blocks exclusive locks, allows other shared locks)
SELECT * FROM products WHERE id = 1 FOR SHARE;  -- PostgreSQL
SELECT * FROM products WHERE id = 1 LOCK IN SHARE MODE;  -- MySQL

-- Skip locked rows (don't wait)
SELECT * FROM products WHERE id = 1 FOR UPDATE SKIP LOCKED;  -- PostgreSQL 9.5+

-- Fail immediately if locked
SELECT * FROM products WHERE id = 1 FOR UPDATE NOWAIT;  -- PostgreSQL
```

**Benefits:**
- ✅ Prevents conflicts
- ✅ Simpler application logic
- ✅ Suitable for high-conflict scenarios

**Drawbacks:**
- ❌ Lower performance (locks held during transaction)
- ❌ Potential for deadlocks
- ❌ Reduced concurrency

---

## Deadlock Prevention

### What is a Deadlock?

**Definition**: Two or more transactions waiting for each other to release locks

**Example:**
```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- Locks account 1
-- Waiting to lock account 2...
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Transaction 2 (at the same time)
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;  -- Locks account 2
-- Waiting to lock account 1...
UPDATE accounts SET balance = balance + 50 WHERE id = 1;

-- DEADLOCK! Both transactions are waiting for each other
```

### Deadlock Prevention Strategies

#### 1. Lock Resources in Consistent Order

```sql
-- ❌ BAD: Inconsistent lock order
-- Transaction 1: Lock A, then B
-- Transaction 2: Lock B, then A

-- ✅ GOOD: Consistent lock order (always lock lower ID first)
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = LEAST(1, 2);
UPDATE accounts SET balance = balance + 100 WHERE id = GREATEST(1, 2);
COMMIT;
```

#### 2. Keep Transactions Short

```sql
-- ❌ BAD: Long transaction holding locks
BEGIN;
SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- ... complex business logic ...
-- ... external API call ...
UPDATE products SET price = 12.00 WHERE id = 1;
COMMIT;

-- ✅ GOOD: Short transaction
-- Do business logic first
const newPrice = calculatePrice();

BEGIN;
SELECT * FROM products WHERE id = 1 FOR UPDATE;
UPDATE products SET price = newPrice WHERE id = 1;
COMMIT;
```

#### 3. Use Lower Isolation Levels

```sql
-- ✅ GOOD: Use Read Committed instead of Serializable when possible
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

#### 4. Use Timeouts

```sql
-- PostgreSQL: Set lock timeout
SET lock_timeout = '5s';

-- MySQL: Set lock wait timeout
SET innodb_lock_wait_timeout = 5;
```

### Handling Deadlocks

**Database automatically detects and resolves deadlocks by rolling back one transaction**

```javascript
// Application should retry on deadlock
async function transferMoney(fromId, toId, amount, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.transaction(async (tx) => {
        await tx.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId]);
        await tx.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId]);
      });
      return;  // Success
    } catch (error) {
      if (error.code === 'DEADLOCK' && i < maxRetries - 1) {
        // Wait and retry
        await sleep(Math.random() * 100);
        continue;
      }
      throw error;
    }
  }
}
```

---

## Savepoints

### What are Savepoints?

**Definition**: Markers within a transaction that allow partial rollback

**Use case**: Complex transactions with multiple steps where you want to rollback only part of the transaction

### Using Savepoints

```sql
-- PostgreSQL / MySQL
BEGIN;

INSERT INTO orders (user_id, total) VALUES (1, 100.00);

SAVEPOINT after_order;

INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 10, 2);
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 20, 1);

-- Error occurs
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 999, 1);  -- Product doesn't exist

-- Rollback to savepoint (keeps order, removes order_items)
ROLLBACK TO SAVEPOINT after_order;

-- Continue transaction
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 30, 1);

COMMIT;
```

### Nested Savepoints

```sql
BEGIN;

INSERT INTO users (email) VALUES ('user@example.com');
SAVEPOINT user_created;

INSERT INTO profiles (user_id, name) VALUES (1, 'John');
SAVEPOINT profile_created;

INSERT INTO addresses (user_id, street) VALUES (1, '123 Main St');
SAVEPOINT address_created;

-- Rollback to specific savepoint
ROLLBACK TO SAVEPOINT profile_created;  -- Removes addresses and profiles, keeps user

COMMIT;
```

### Application-Level Example

```javascript
async function createOrderWithItems(userId, items) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
      [userId, 0]
    );
    const orderId = orderResult.rows[0].id;

    await client.query('SAVEPOINT after_order');

    let total = 0;

    // Add items
    for (const item of items) {
      try {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.quantity, item.price]
        );
        total += item.price * item.quantity;
      } catch (error) {
        // Rollback to savepoint and continue with other items
        await client.query('ROLLBACK TO SAVEPOINT after_order');
        console.error(`Failed to add item ${item.productId}:`, error);
      }
    }

    // Update order total
    await client.query('UPDATE orders SET total = $1 WHERE id = $2', [total, orderId]);

    await client.query('COMMIT');
    return orderId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## Two-Phase Commit (2PC)

### What is Two-Phase Commit?

**Definition**: Protocol for coordinating distributed transactions across multiple databases

**Phases:**
1. **Prepare phase**: All participants prepare to commit and vote yes/no
2. **Commit phase**: If all vote yes, coordinator tells all to commit; otherwise, all rollback

### Two-Phase Commit Example

```sql
-- Coordinator
BEGIN;

-- Prepare phase
PREPARE TRANSACTION 'tx_123' ON database1;
PREPARE TRANSACTION 'tx_123' ON database2;

-- All participants voted yes
-- Commit phase
COMMIT PREPARED 'tx_123' ON database1;
COMMIT PREPARED 'tx_123' ON database2;

-- If any participant voted no
-- ROLLBACK PREPARED 'tx_123' ON database1;
-- ROLLBACK PREPARED 'tx_123' ON database2;
```

### Limitations

**Drawbacks:**
- ❌ Blocking protocol (participants wait for coordinator)
- ❌ Single point of failure (coordinator)
- ❌ Performance overhead
- ❌ Not supported by all databases

**Alternatives:**
- ✅ Saga pattern (compensating transactions)
- ✅ Event sourcing
- ✅ Eventual consistency

---

## Distributed Transactions

### Saga Pattern

**Principle**: Break distributed transaction into local transactions with compensating actions

**Example: Order Processing**

```javascript
// Saga: Create order, reserve inventory, charge payment
async function createOrderSaga(userId, items, paymentInfo) {
  const compensations = [];

  try {
    // Step 1: Create order
    const order = await createOrder(userId, items);
    compensations.push(() => cancelOrder(order.id));

    // Step 2: Reserve inventory
    await reserveInventory(items);
    compensations.push(() => releaseInventory(items));

    // Step 3: Charge payment
    await chargePayment(paymentInfo, order.total);
    compensations.push(() => refundPayment(paymentInfo, order.total));

    // All steps succeeded
    return order;
  } catch (error) {
    // Execute compensations in reverse order
    for (const compensate of compensations.reverse()) {
      try {
        await compensate();
      } catch (compensationError) {
        console.error('Compensation failed:', compensationError);
      }
    }
    throw error;
  }
}
```

### Event Sourcing

**Principle**: Store events instead of current state, rebuild state from events

```javascript
// Event sourcing example
const events = [
  { type: 'OrderCreated', orderId: 1, userId: 1, total: 100 },
  { type: 'ItemAdded', orderId: 1, productId: 10, quantity: 2 },
  { type: 'ItemAdded', orderId: 1, productId: 20, quantity: 1 },
  { type: 'PaymentCharged', orderId: 1, amount: 100 },
  { type: 'OrderShipped', orderId: 1, trackingNumber: 'ABC123' }
];

// Rebuild state from events
function rebuildOrderState(events) {
  const state = { items: [], payments: [], shipments: [] };

  for (const event of events) {
    switch (event.type) {
      case 'OrderCreated':
        state.id = event.orderId;
        state.userId = event.userId;
        state.total = event.total;
        break;
      case 'ItemAdded':
        state.items.push({ productId: event.productId, quantity: event.quantity });
        break;
      case 'PaymentCharged':
        state.payments.push({ amount: event.amount });
        break;
      case 'OrderShipped':
        state.shipments.push({ trackingNumber: event.trackingNumber });
        break;
    }
  }

  return state;
}
```

---

## Transaction Best Practices

### DO

✅ Keep transactions as short as possible
✅ Use appropriate isolation level for your use case
✅ Handle deadlocks with retries
✅ Use optimistic locking for low-conflict scenarios
✅ Use pessimistic locking for high-conflict scenarios
✅ Lock resources in consistent order
✅ Use savepoints for complex transactions
✅ Set timeouts to prevent long-running transactions
✅ Monitor transaction performance

### DON'T

❌ Hold locks during external API calls
❌ Use Serializable isolation level unless necessary
❌ Ignore deadlock errors
❌ Use long-running transactions
❌ Mix business logic with database transactions
❌ Forget to commit or rollback transactions
❌ Use distributed transactions unless absolutely necessary

### Transaction Patterns

**Pattern 1: Unit of Work**
```javascript
class UnitOfWork {
  constructor(db) {
    this.db = db;
  }

  async execute(work) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Usage
const uow = new UnitOfWork(pool);
await uow.execute(async (client) => {
  await client.query('INSERT INTO users (email) VALUES ($1)', ['user@example.com']);
  await client.query('INSERT INTO profiles (user_id, name) VALUES ($1, $2)', [1, 'John']);
});
```

**Pattern 2: Repository with Transactions**
```javascript
class OrderRepository {
  constructor(db) {
    this.db = db;
  }

  async createWithItems(userId, items) {
    return this.db.transaction(async (tx) => {
      const order = await tx.query(
        'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
        [userId, 0]
      );

      let total = 0;
      for (const item of items) {
        await tx.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.productId, item.quantity, item.price]
        );
        total += item.price * item.quantity;
      }

      await tx.query('UPDATE orders SET total = $1 WHERE id = $2', [total, order.id]);

      return order;
    });
  }
}
```

---

## Related Documentation

- **relational-databases.md**: Relational database fundamentals
- **relational-schema-design.md**: Schema design and normalization
- **relational-query-optimization.md**: Query optimization
- **performance-optimization.md**: General performance optimization
- **security-standards.md**: Database security


