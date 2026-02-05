# Design Principles

## Overview

This document covers fundamental design principles that guide the creation of clean, maintainable, and extensible code. These principles complement architectural principles by focusing on code-level design decisions.

---

## Knowledge

### SOLID Principles

#### Single Responsibility Principle (SRP)

**Definition**
- A class should have one, and only one, reason to change
- Each class should have a single, well-defined responsibility
- Separates concerns at the class level
- Reduces coupling and increases cohesion

**Benefits**
- Easier to understand and maintain
- Easier to test (focused unit tests)
- Reduces risk of breaking changes
- Enables better code organization

**Violations**
- God classes (do everything)
- Classes with multiple unrelated responsibilities
- Classes that change for multiple reasons

#### Open/Closed Principle (OCP)

**Definition**
- Software entities should be open for extension but closed for modification
- Add new functionality without changing existing code
- Use abstraction and polymorphism
- Protects existing code from breaking changes

**Benefits**
- Reduces regression risk
- Enables plugin architectures
- Supports versioning and backward compatibility
- Encourages abstraction

**Implementation Strategies**
- Inheritance and polymorphism
- Strategy pattern
- Decorator pattern
- Dependency injection

#### Liskov Substitution Principle (LSP)

**Definition**
- Subtypes must be substitutable for their base types
- Derived classes must honor the contract of base classes
- Behavioral compatibility, not just structural
- Preserves correctness when using polymorphism

**Benefits**
- Ensures reliable polymorphism
- Prevents unexpected behavior
- Maintains type safety
- Enables design by contract

**Violations**
- Strengthening preconditions in subtypes
- Weakening postconditions in subtypes
- Throwing new exceptions not in base contract
- Changing expected behavior

#### Interface Segregation Principle (ISP)

**Definition**
- Clients should not be forced to depend on interfaces they don't use
- Many specific interfaces are better than one general interface
- Prevents fat interfaces
- Reduces coupling between clients and implementations

**Benefits**
- Reduces unnecessary dependencies
- Improves code clarity
- Enables independent evolution
- Supports role-based design

**Implementation**
- Split large interfaces into smaller, focused ones
- Use role interfaces
- Apply composition over inheritance
- Design for specific client needs

#### Dependency Inversion Principle (DIP)

**Definition**
- High-level modules should not depend on low-level modules; both should depend on abstractions
- Abstractions should not depend on details; details should depend on abstractions
- Inverts traditional dependency flow
- Enables flexibility and testability

**Benefits**
- Decouples high-level and low-level code
- Enables dependency injection
- Improves testability (mock dependencies)
- Supports plugin architectures

**Implementation**
- Define interfaces for dependencies
- Inject dependencies through constructors or setters
- Use dependency injection containers
- Program to interfaces, not implementations

### DRY Principle (Don't Repeat Yourself)

**Definition**
- Every piece of knowledge should have a single, unambiguous representation
- Avoid code duplication
- Extract common functionality
- Applies to code, data, and documentation

**Benefits**
- Reduces maintenance burden
- Ensures consistency
- Simplifies changes (single point of modification)
- Reduces bugs from inconsistent copies

**Application**
- Extract methods/functions
- Create reusable libraries
- Use inheritance or composition
- Apply templates and code generation

**Caution**
- Don't over-abstract (premature abstraction)
- Consider context (similar code may have different reasons to change)
- Balance DRY with readability

### KISS Principle (Keep It Simple, Stupid)

**Definition**
- Simplicity should be a key goal in design
- Avoid unnecessary complexity
- Choose the simplest solution that works
- Complexity should be justified by requirements

**Benefits**
- Easier to understand and maintain
- Fewer bugs (less code, less complexity)
- Faster development
- Better performance (simpler code often runs faster)

**Guidelines**
- Avoid over-engineering
- Use clear, descriptive names
- Prefer composition over complex inheritance
- Avoid premature optimization
- Write code for humans first

**Violations**
- Unnecessary design patterns
- Over-abstraction
- Complex algorithms when simple ones suffice
- Feature creep

---

## Skills

### Applying SOLID Principles

**When to Apply SRP**
- During class design
- When a class has multiple reasons to change
- When refactoring large classes
- When writing new features

**When to Apply OCP**
- Designing plugin systems
- Creating extensible frameworks
- When anticipating future changes
- Building versioned APIs

**When to Apply LSP**
- Designing inheritance hierarchies
- Creating polymorphic interfaces
- Refactoring type systems
- Implementing design patterns

**When to Apply ISP**
- Designing public APIs
- Creating service interfaces
- Refactoring fat interfaces
- Building modular systems

**When to Apply DIP**
- Designing layered architectures
- Setting up dependency injection
- Creating testable code
- Building plugin architectures

### Balancing DRY and KISS

**Finding the Balance**
- Don't abstract too early (wait for third occurrence)
- Consider the cost of abstraction vs. duplication
- Evaluate readability impact
- Assess maintenance implications

**Red Flags**
- Abstractions with only one implementation
- Complex abstractions for simple problems
- Premature optimization
- Over-engineered solutions

---

## Examples

### SOLID Principles in TypeScript

#### Single Responsibility Principle

**Violation:**
```typescript
class UserManager {
  createUser(data: UserData): User { /* ... */ }
  deleteUser(id: string): void { /* ... */ }
  sendWelcomeEmail(user: User): void { /* ... */ }
  generateUserReport(user: User): Report { /* ... */ }
  logUserActivity(user: User, action: string): void { /* ... */ }
}
```

**Correct:**
```typescript
class UserRepository {
  create(data: UserData): User { /* ... */ }
  delete(id: string): void { /* ... */ }
  findById(id: string): User | null { /* ... */ }
}

class EmailService {
  sendWelcomeEmail(user: User): void { /* ... */ }
}

class ReportGenerator {
  generateUserReport(user: User): Report { /* ... */ }
}

class ActivityLogger {
  logUserActivity(user: User, action: string): void { /* ... */ }
}
```

#### Open/Closed Principle

**Violation:**
```typescript
class PaymentProcessor {
  processPayment(type: string, amount: number): void {
    if (type === 'credit-card') {
      // Process credit card
    } else if (type === 'paypal') {
      // Process PayPal
    } else if (type === 'bitcoin') {
      // Process Bitcoin
    }
    // Adding new payment method requires modifying this class
  }
}
```

**Correct:**
```typescript
interface PaymentMethod {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardPayment implements PaymentMethod {
  process(amount: number): Promise<PaymentResult> {
    // Process credit card
  }
}

class PayPalPayment implements PaymentMethod {
  process(amount: number): Promise<PaymentResult> {
    // Process PayPal
  }
}

class PaymentProcessor {
  constructor(private paymentMethod: PaymentMethod) {}

  processPayment(amount: number): Promise<PaymentResult> {
    return this.paymentMethod.process(amount);
  }
}
```

#### Liskov Substitution Principle

**Violation:**
```typescript
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  setWidth(width: number): void {
    this.width = width;
    this.height = width; // Violates LSP - unexpected behavior
  }

  setHeight(height: number): void {
    this.width = height;
    this.height = height; // Violates LSP - unexpected behavior
  }
}
```

**Correct:**
```typescript
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square implements Shape {
  constructor(private size: number) {}

  setSize(size: number): void {
    this.size = size;
  }

  getArea(): number {
    return this.size * this.size;
  }
}
```

#### Interface Segregation Principle

**Violation:**
```typescript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  charge(): void; // Not all workers need this
}

class HumanWorker implements Worker {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  charge(): void {
    throw new Error('Humans cannot be charged'); // Forced to implement
  }
}

class RobotWorker implements Worker {
  work(): void { /* ... */ }
  eat(): void {
    throw new Error('Robots do not eat'); // Forced to implement
  }
  sleep(): void {
    throw new Error('Robots do not sleep'); // Forced to implement
  }
  charge(): void { /* ... */ }
}
```

**Correct:**
```typescript
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

interface Chargeable {
  charge(): void;
}

class HumanWorker implements Workable, Eatable, Sleepable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
}

class RobotWorker implements Workable, Chargeable {
  work(): void { /* ... */ }
  charge(): void { /* ... */ }
}
```

#### Dependency Inversion Principle

**Violation:**
```typescript
class MySQLDatabase {
  connect(): void { /* ... */ }
  query(sql: string): any[] { /* ... */ }
}

class UserService {
  private db: MySQLDatabase; // Depends on concrete implementation

  constructor() {
    this.db = new MySQLDatabase(); // Tight coupling
  }

  getUser(id: string): User {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`)[0];
  }
}
```

**Correct:**
```typescript
interface Database {
  connect(): void;
  query(sql: string): any[];
}

class MySQLDatabase implements Database {
  connect(): void { /* ... */ }
  query(sql: string): any[] { /* ... */ }
}

class PostgreSQLDatabase implements Database {
  connect(): void { /* ... */ }
  query(sql: string): any[] { /* ... */ }
}

class UserService {
  constructor(private db: Database) {} // Depends on abstraction

  getUser(id: string): User {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`)[0];
  }
}

// Usage
const mysqlDb = new MySQLDatabase();
const userService = new UserService(mysqlDb); // Inject dependency
```

### DRY Principle

**Violation:**
```typescript
function calculateOrderTotal(order: Order): number {
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  const tax = total * 0.08;
  const shipping = total > 100 ? 0 : 10;
  return total + tax + shipping;
}

function calculateInvoiceTotal(invoice: Invoice): number {
  let total = 0;
  for (const item of invoice.items) {
    total += item.price * item.quantity;
  }
  const tax = total * 0.08;
  const shipping = total > 100 ? 0 : 10;
  return total + tax + shipping;
}
```

**Correct:**
```typescript
interface LineItem {
  price: number;
  quantity: number;
}

function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateTax(subtotal: number, rate: number = 0.08): number {
  return subtotal * rate;
}

function calculateShipping(subtotal: number, freeThreshold: number = 100): number {
  return subtotal > freeThreshold ? 0 : 10;
}

function calculateTotal(items: LineItem[]): number {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  return subtotal + tax + shipping;
}

// Usage
const orderTotal = calculateTotal(order.items);
const invoiceTotal = calculateTotal(invoice.items);
```

### KISS Principle

**Violation (Over-engineered):**
```typescript
interface Strategy {
  execute(value: number): number;
}

class AdditionStrategy implements Strategy {
  execute(value: number): number {
    return value + 1;
  }
}

class SubtractionStrategy implements Strategy {
  execute(value: number): number {
    return value - 1;
  }
}

class StrategyFactory {
  createStrategy(type: string): Strategy {
    switch (type) {
      case 'add': return new AdditionStrategy();
      case 'subtract': return new SubtractionStrategy();
      default: throw new Error('Unknown strategy');
    }
  }
}

class Counter {
  constructor(
    private value: number,
    private strategyFactory: StrategyFactory
  ) {}

  increment(): void {
    const strategy = this.strategyFactory.createStrategy('add');
    this.value = strategy.execute(this.value);
  }

  decrement(): void {
    const strategy = this.strategyFactory.createStrategy('subtract');
    this.value = strategy.execute(this.value);
  }
}
```

**Correct (Simple):**
```typescript
class Counter {
  constructor(private value: number = 0) {}

  increment(): void {
    this.value++;
  }

  decrement(): void {
    this.value--;
  }

  getValue(): number {
    return this.value;
  }
}
```

---

## Understanding

### When to Apply Each Principle

**SOLID Principles**
- Use during initial design and refactoring
- Apply when code becomes hard to maintain
- Essential for large, long-lived systems
- Critical for team collaboration

**DRY Principle**
- Apply after identifying true duplication
- Wait for third occurrence (Rule of Three)
- Consider context and reasons for change
- Balance with readability

**KISS Principle**
- Apply always, especially at start
- Question every abstraction
- Prefer simple solutions
- Add complexity only when justified

### Common Pitfalls

**Over-applying SOLID**
- Too many small classes (class explosion)
- Over-abstraction (unnecessary interfaces)
- Premature optimization
- Reduced readability

**Over-applying DRY**
- Premature abstraction
- Coupling unrelated code
- Complex abstractions for simple duplication
- Reduced clarity

**Ignoring KISS**
- Over-engineering simple problems
- Unnecessary design patterns
- Complex frameworks for simple tasks
- Feature creep

### Best Practices

1. **Start Simple**: Begin with KISS, add complexity as needed
2. **Refactor Incrementally**: Apply SOLID during refactoring, not upfront
3. **Rule of Three**: Wait for third duplication before applying DRY
4. **Context Matters**: Consider team size, project lifetime, requirements
5. **Balance**: Trade-offs between principles are normal
6. **Readability First**: Code is read more than written
7. **Test-Driven**: Principles emerge naturally with TDD
8. **Review Regularly**: Principles guide code reviews

### Measuring Success

**Good Signs**
- Easy to add new features
- Easy to test
- Easy to understand
- Few bugs from changes
- Fast development velocity

**Warning Signs**
- Frequent breaking changes
- Difficult to test
- Hard to understand
- Many bugs from changes
- Slow development velocity

---

## References

- **SOLID Principles**: Robert C. Martin (Uncle Bob)
- **Design Patterns**: Gang of Four (GoF)
- **Clean Code**: Robert C. Martin
- **Refactoring**: Martin Fowler
- **The Pragmatic Programmer**: Andrew Hunt, David Thomas

