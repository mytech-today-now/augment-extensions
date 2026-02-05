# Software Architecture Principles

## Overview

This document covers fundamental architectural principles that guide the design of robust, maintainable, and scalable software systems.

---

## Knowledge

### Modularity

**Definition**
- Decomposition of system into discrete, independent modules
- Each module encapsulates specific functionality
- Modules interact through well-defined interfaces
- Enables parallel development and independent deployment

**Benefits**
- Easier to understand (smaller, focused units)
- Easier to test (isolated testing)
- Easier to maintain (localized changes)
- Enables reuse (modules as building blocks)

**Characteristics of Good Modules**
- Single, well-defined purpose
- Clear interface (contract)
- Information hiding (encapsulation)
- Minimal dependencies

### Separation of Concerns

**Definition**
- Distinct features should be managed by distinct components
- Each component addresses a specific concern
- Reduces overlap and interdependencies
- Examples: presentation vs. business logic vs. data access

**Common Separations**

**Horizontal Separation (Layering)**
- Presentation Layer (UI)
- Business Logic Layer (domain)
- Data Access Layer (persistence)
- Infrastructure Layer (cross-cutting)

**Vertical Separation (Features)**
- User Management
- Product Catalog
- Order Processing
- Payment Processing

**Cross-Cutting Concerns**
- Logging
- Security
- Caching
- Error handling

### Loose Coupling

**Definition**
- Minimize dependencies between components
- Components can change independently
- Reduces ripple effects of changes
- Enables flexibility and adaptability

**Coupling Types (Low to High)**

1. **No Coupling**: Components are independent
2. **Data Coupling**: Share data through parameters
3. **Stamp Coupling**: Share composite data structures
4. **Control Coupling**: One component controls another's flow
5. **Common Coupling**: Share global data
6. **Content Coupling**: One component modifies another's internals

**Achieving Loose Coupling**
- Dependency injection
- Interface-based programming
- Event-driven architecture
- Message queues
- API contracts

### High Cohesion

**Definition**
- Degree to which elements within a module belong together
- Related functionality grouped together
- Unrelated functionality separated
- Complements loose coupling

**Cohesion Types (Low to High)**

1. **Coincidental**: Random grouping (worst)
2. **Logical**: Similar operations grouped
3. **Temporal**: Operations performed at same time
4. **Procedural**: Operations in sequence
5. **Communicational**: Operate on same data
6. **Sequential**: Output of one is input to another
7. **Functional**: All elements contribute to single task (best)

**Achieving High Cohesion**
- Single Responsibility Principle
- Domain-Driven Design
- Feature-based organization
- Clear module boundaries

---

## Skills

### Applying Modularity

**Module Identification Process**

1. **Identify Responsibilities**: List system capabilities
2. **Group Related Responsibilities**: Cluster by domain/function
3. **Define Module Boundaries**: Establish clear interfaces
4. **Minimize Dependencies**: Reduce inter-module coupling
5. **Validate**: Ensure each module has single, clear purpose

**Module Design Checklist**

✅ Does module have single, well-defined purpose?  
✅ Can module be understood independently?  
✅ Can module be tested in isolation?  
✅ Does module hide implementation details?  
✅ Are module dependencies minimal and explicit?

### Implementing Separation of Concerns

**Layered Architecture Example**

```
┌─────────────────────────────────┐
│   Presentation Layer            │  ← UI, Controllers, Views
├─────────────────────────────────┤
│   Business Logic Layer          │  ← Domain Models, Services
├─────────────────────────────────┤
│   Data Access Layer             │  ← Repositories, ORM
├─────────────────────────────────┤
│   Infrastructure Layer          │  ← Logging, Config, Security
└─────────────────────────────────┘
```

**Layer Responsibilities**

**Presentation**: User interaction, input validation, display  
**Business Logic**: Business rules, workflows, domain logic  
**Data Access**: CRUD operations, queries, persistence  
**Infrastructure**: Cross-cutting concerns, utilities

**Layer Rules**

✅ Upper layers depend on lower layers  
✅ Lower layers don't know about upper layers  
✅ Each layer has clear responsibility  
❌ Skip layers (presentation → data access directly)  
❌ Circular dependencies between layers

### Reducing Coupling

**Dependency Injection Pattern**

```typescript
// ❌ Tight Coupling
class OrderService {
  private paymentGateway = new StripePaymentGateway();
  
  processOrder(order: Order) {
    this.paymentGateway.charge(order.total);
  }
}

// ✅ Loose Coupling
interface PaymentGateway {
  charge(amount: number): Promise<void>;
}

class OrderService {
  constructor(private paymentGateway: PaymentGateway) {}
  
  processOrder(order: Order) {
    this.paymentGateway.charge(order.total);
  }
}
```

**Event-Driven Decoupling**

```typescript
// ❌ Direct Coupling
class OrderService {
  constructor(
    private inventoryService: InventoryService,
    private emailService: EmailService
  ) {}
  
  createOrder(order: Order) {
    // ... create order
    this.inventoryService.decrementStock(order.items);
    this.emailService.sendConfirmation(order);
  }
}

// ✅ Event-Driven Decoupling
class OrderService {
  constructor(private eventBus: EventBus) {}

  createOrder(order: Order) {
    // ... create order
    this.eventBus.publish('order.created', order);
  }
}
```

### Increasing Cohesion

**Functional Cohesion Example**

```typescript
// ❌ Low Cohesion (Coincidental)
class Utilities {
  formatDate(date: Date): string { }
  sendEmail(to: string, body: string): void { }
  calculateTax(amount: number): number { }
  validatePassword(password: string): boolean { }
}

// ✅ High Cohesion (Functional)
class DateFormatter {
  format(date: Date): string { }
  parse(dateString: string): Date { }
  isValid(dateString: string): boolean { }
}

class EmailService {
  send(to: string, subject: string, body: string): void { }
  sendBulk(recipients: string[], subject: string, body: string): void { }
  validateEmail(email: string): boolean { }
}

class TaxCalculator {
  calculate(amount: number, region: string): number { }
  getRate(region: string): number { }
  applyExemptions(amount: number, exemptions: string[]): number { }
}
```

**Domain-Driven Cohesion**

```typescript
// ✅ High Cohesion - Order Aggregate
class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = 'pending';

  addItem(product: Product, quantity: number): void {
    // Related to order management
  }

  removeItem(productId: string): void {
    // Related to order management
  }

  calculateTotal(): number {
    // Related to order management
  }

  submit(): void {
    // Related to order lifecycle
  }

  cancel(): void {
    // Related to order lifecycle
  }
}
```

---

## Examples

### Example 1: E-Commerce System Architecture

**Modularity Applied**

```
Modules:
├── User Management
│   ├── Authentication
│   ├── Authorization
│   └── Profile Management
├── Product Catalog
│   ├── Product Search
│   ├── Category Management
│   └── Inventory Tracking
├── Shopping Cart
│   ├── Cart Operations
│   └── Session Management
└── Order Processing
    ├── Order Creation
    ├── Payment Processing
    └── Order Fulfillment
```

**Separation of Concerns**

```
Presentation Layer:
- Web UI (React)
- Mobile App (React Native)
- Admin Dashboard

Business Logic Layer:
- Order Service
- Product Service
- User Service
- Payment Service

Data Access Layer:
- Order Repository
- Product Repository
- User Repository

Infrastructure:
- Logging (Winston)
- Caching (Redis)
- Authentication (JWT)
```

**Loose Coupling via Interfaces**

```typescript
// Payment abstraction
interface PaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<void>;
}

// Multiple implementations
class StripeGateway implements PaymentGateway { }
class PayPalGateway implements PaymentGateway { }
class MockGateway implements PaymentGateway { } // for testing
```

**High Cohesion in Services**

```typescript
// ✅ Cohesive - All methods relate to order processing
class OrderService {
  createOrder(cart: Cart, user: User): Order { }
  cancelOrder(orderId: string): void { }
  getOrderStatus(orderId: string): OrderStatus { }
  getOrderHistory(userId: string): Order[] { }
}

// ✅ Cohesive - All methods relate to product catalog
class ProductService {
  searchProducts(query: string): Product[] { }
  getProductDetails(productId: string): Product { }
  updateInventory(productId: string, quantity: number): void { }
}
```

### Example 2: Banking Application

**Modularity with Bounded Contexts (DDD)**

```
Bounded Contexts:
├── Account Management
│   ├── Account Creation
│   ├── Account Closure
│   └── Balance Inquiry
├── Transaction Processing
│   ├── Deposits
│   ├── Withdrawals
│   └── Transfers
├── Loan Management
│   ├── Loan Application
│   ├── Loan Approval
│   └── Payment Scheduling
└── Customer Service
    ├── Customer Profile
    ├── Communication History
    └── Support Tickets
```

**Loose Coupling via Events**

```typescript
// Account service publishes events
class AccountService {
  createAccount(customer: Customer): Account {
    const account = new Account(customer);
    // ... save account
    this.eventBus.publish('account.created', {
      accountId: account.id,
      customerId: customer.id
    });
    return account;
  }
}

// Other services subscribe to events
class NotificationService {
  @Subscribe('account.created')
  onAccountCreated(event: AccountCreatedEvent): void {
    this.sendWelcomeEmail(event.customerId);
  }
}

class AuditService {
  @Subscribe('account.created')
  onAccountCreated(event: AccountCreatedEvent): void {
    this.logAccountCreation(event);
  }
}
```

---

## Understanding

### Why Modularity Matters

**Cognitive Load Reduction**
- Humans can only hold 7±2 items in working memory
- Modules reduce complexity by hiding details
- Easier to reason about smaller, focused units

**Parallel Development**
- Teams can work on different modules independently
- Reduces coordination overhead
- Faster development cycles

**Technology Diversity**
- Different modules can use different technologies
- Choose best tool for each job
- Easier to adopt new technologies incrementally

### The Coupling-Cohesion Balance

**Ideal State**
- Low coupling between modules
- High cohesion within modules
- Modules are independent but internally focused

**Trade-offs**
- Too much decoupling: excessive indirection, complexity
- Too much coupling: rigid, hard to change
- Balance depends on context and requirements

**Metrics**
- Coupling: count of dependencies between modules
- Cohesion: LCOM (Lack of Cohesion of Methods)
- Tools: SonarQube, NDepend, Structure101

### Principles in Practice

**Microservices Architecture**
- Modularity: Each service is independent module
- Separation: Services separated by business capability
- Loose Coupling: Services communicate via APIs/events
- High Cohesion: Each service has single responsibility

**Monolithic Architecture**
- Modularity: Packages/namespaces as modules
- Separation: Layers separate concerns
- Loose Coupling: Dependency injection, interfaces
- High Cohesion: Classes grouped by feature

**Serverless Architecture**
- Modularity: Functions as modules
- Separation: Functions separated by trigger/purpose
- Loose Coupling: Event-driven, stateless
- High Cohesion: Each function does one thing

---

## Best Practices

### Modularity

✅ **Define Clear Boundaries**: Explicit module interfaces
✅ **Minimize Public API**: Expose only what's necessary
✅ **Version Interfaces**: Support backward compatibility
✅ **Document Dependencies**: Make dependencies explicit
❌ **God Modules**: Avoid modules that do everything
❌ **Circular Dependencies**: Prevent module cycles

### Separation of Concerns

✅ **Layer Isolation**: Each layer has distinct responsibility
✅ **Cross-Cutting Concerns**: Use AOP or middleware
✅ **Feature Slicing**: Organize by business capability
❌ **Layer Skipping**: Don't bypass layers
❌ **Leaky Abstractions**: Don't expose implementation details

### Coupling and Cohesion

✅ **Depend on Abstractions**: Use interfaces, not implementations
✅ **Event-Driven**: Decouple via events when appropriate
✅ **Single Responsibility**: One reason to change
✅ **Feature Envy**: Keep related data and behavior together
❌ **Tight Coupling**: Avoid direct dependencies
❌ **Low Cohesion**: Don't mix unrelated functionality

---

## Common Pitfalls

### Over-Modularization

**Problem**: Too many small modules
**Impact**: Excessive complexity, hard to navigate
**Solution**: Balance granularity with understandability

### Under-Modularization

**Problem**: Too few large modules
**Impact**: Hard to maintain, test, and understand
**Solution**: Apply Single Responsibility Principle

### Premature Abstraction

**Problem**: Creating abstractions before understanding needs
**Impact**: Wrong abstractions, unnecessary complexity
**Solution**: Wait for patterns to emerge (Rule of Three)

### Leaky Abstractions

**Problem**: Implementation details leak through interfaces
**Impact**: Tight coupling, hard to change implementations
**Solution**: Design interfaces based on client needs, not implementation

---

## References

- **Clean Architecture** (Robert C. Martin) - Separation of concerns, dependency rule
- **Domain-Driven Design** (Eric Evans) - Bounded contexts, modularity
- **Software Architecture in Practice** (Bass, Clements, Kazman) - Quality attributes
- **Structured Design** (Stevens, Myers, Constantine) - Coupling and cohesion

---

## Related Topics

- [Fundamentals](./fundamentals.md) - Core architectural elements
- [Definitions and Terminology](./definitions-terminology.md) - Key concepts
- [Design Principles](./design-principles.md) - SOLID, DRY, KISS
- [Microservices Architecture](./microservices.md) - Modularity in practice
- [Layered Architecture](./layered.md) - Separation of concerns pattern


