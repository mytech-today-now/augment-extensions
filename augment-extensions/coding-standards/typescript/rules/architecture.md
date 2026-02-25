# TypeScript Architecture Patterns

Comprehensive guide to architectural patterns for organizing TypeScript applications.

## Table of Contents
- [Folder Organization](#folder-organization)
- [Dependency Inversion](#dependency-inversion)
- [Domain-Driven Design Basics](#domain-driven-design-basics)
- [Layered Architecture](#layered-architecture)
- [Clean Architecture](#clean-architecture)
- [Hexagonal Architecture](#hexagonal-architecture)
- [Best Practices](#best-practices)

---

## Folder Organization

### Folder-by-Convention (Traditional)

Organize by technical role (controllers, services, models).

```
src/
├── controllers/
│   ├── user-controller.ts
│   ├── product-controller.ts
│   └── order-controller.ts
├── services/
│   ├── user-service.ts
│   ├── product-service.ts
│   └── order-service.ts
├── models/
│   ├── user.ts
│   ├── product.ts
│   └── order.ts
├── repositories/
│   ├── user-repository.ts
│   ├── product-repository.ts
│   └── order-repository.ts
└── utils/
    └── helpers.ts
```

**Pros:**
- Familiar structure
- Easy to understand for small projects
- Clear separation of technical concerns

**Cons:**
- Related code is scattered
- Hard to find all code for a feature
- Difficult to scale
- Tight coupling between layers

### Folder-by-Feature (Recommended)

Organize by business domain/feature.

```
src/
├── users/
│   ├── user.entity.ts
│   ├── user.repository.ts
│   ├── user.service.ts
│   ├── user.controller.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── __tests__/
│   │   ├── user.service.test.ts
│   │   └── user.controller.test.ts
│   └── index.ts
├── products/
│   ├── product.entity.ts
│   ├── product.repository.ts
│   ├── product.service.ts
│   ├── product.controller.ts
│   └── index.ts
├── orders/
│   ├── order.entity.ts
│   ├── order.repository.ts
│   ├── order.service.ts
│   ├── order.controller.ts
│   └── index.ts
└── shared/
    ├── database/
    ├── utils/
    └── types/
```

**Pros:**
- All related code in one place
- Easy to find feature code
- Better encapsulation
- Easier to scale
- Can delete entire feature folder

**Cons:**
- Less familiar initially
- Shared code needs careful management

### Hybrid Approach

Combine both approaches for best results.

```
src/
├── features/                    # Feature modules
│   ├── users/
│   │   ├── domain/             # Business logic
│   │   │   ├── user.entity.ts
│   │   │   └── user.service.ts
│   │   ├── infrastructure/     # External concerns
│   │   │   └── user.repository.ts
│   │   ├── presentation/       # API/UI layer
│   │   │   └── user.controller.ts
│   │   └── index.ts
│   ├── products/
│   └── orders/
├── shared/                      # Shared across features
│   ├── domain/
│   │   ├── base-entity.ts
│   │   └── value-objects/
│   ├── infrastructure/
│   │   ├── database/
│   │   └── cache/
│   └── utils/
└── core/                        # Core application
    ├── config/
    ├── middleware/
    └── types/
```

---

## Dependency Inversion

The Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules. Both should depend on abstractions.

### Without Dependency Inversion (Bad)

```typescript
// ❌ Bad - Direct dependency on concrete implementation
class UserService {
  private repository = new MySQLUserRepository(); // Tight coupling

  async getUser(id: string): Promise<User> {
    return this.repository.findById(id);
  }
}
```

### With Dependency Inversion (Good)

```typescript
// ✅ Good - Depend on abstraction
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

class UserService {
  constructor(private repository: UserRepository) {} // Inject dependency

  async getUser(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}

// Implementations
class MySQLUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // MySQL implementation
  }
  // ... other methods
}

class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // MongoDB implementation
  }
  // ... other methods
}

// Usage - Easy to swap implementations
const service = new UserService(new MySQLUserRepository());
// or
const service = new UserService(new MongoUserRepository());
```

### Dependency Injection Container

```typescript
// container.ts
import { Container } from 'inversify';
import 'reflect-metadata';

const container = new Container();

// Bind interfaces to implementations
container.bind<UserRepository>('UserRepository').to(MySQLUserRepository);
container.bind<UserService>('UserService').to(UserService);

export { container };

// user.service.ts
import { injectable, inject } from 'inversify';

@injectable()
class UserService {
  constructor(
    @inject('UserRepository') private repository: UserRepository
  ) {}
}
```

---

## Domain-Driven Design Basics

DDD focuses on modeling the business domain.

### Entities

Objects with identity that persist over time.

```typescript
// user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    private _email: string,
    private _name: string,
    private _createdAt: Date = new Date()
  ) {}

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }
    this._email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

### Value Objects

Objects without identity, defined by their attributes.

```typescript
// email.value-object.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email.toLowerCase());
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// money.value-object.ts
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string): Money {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new Error('Invalid currency');
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
```

### Aggregates

Cluster of entities and value objects with a root entity.

```typescript
// order.aggregate.ts
export class Order {
  private _items: OrderItem[] = [];
  private _status: OrderStatus = 'pending';

  constructor(
    public readonly id: string,
    private _customerId: string
  ) {}

  addItem(product: Product, quantity: number): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot modify confirmed order');
    }

    const item = new OrderItem(product, quantity);
    this._items.push(item);
  }

  removeItem(productId: string): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot modify confirmed order');
    }

    this._items = this._items.filter(item => item.productId !== productId);
  }

  confirm(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot confirm empty order');
    }
    this._status = 'confirmed';
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.total),
      Money.create(0, 'USD')
    );
  }

  get items(): readonly OrderItem[] {
    return [...this._items]; // Return copy to prevent external modification
  }
}

class OrderItem {
  constructor(
    private _product: Product,
    private _quantity: number
  ) {}

  get productId(): string {
    return this._product.id;
  }

  get total(): Money {
    return this._product.price.multiply(this._quantity);
  }
}
```

### Repositories (DDD Pattern)

```typescript
// user.repository.interface.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// user.repository.impl.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: this.toPersistence(user),
      update: this.toPersistence(user)
    });
  }

  private toDomain(data: any): User {
    return new User(data.id, data.email, data.name, data.createdAt);
  }

  private toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}
```

### Domain Services

Business logic that doesn't belong to a single entity.

```typescript
// transfer-money.service.ts
export class TransferMoneyService {
  constructor(
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository
  ) {}

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: Money
  ): Promise<void> {
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('Account not found');
    }

    // Business logic
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    // Persist changes
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    // Record transaction
    const transaction = new Transaction(fromAccountId, toAccountId, amount);
    await this.transactionRepository.save(transaction);
  }
}
```

---

## Layered Architecture

Organize code into horizontal layers.

```
┌─────────────────────────────────┐
│   Presentation Layer            │  ← Controllers, Views, DTOs
├─────────────────────────────────┤
│   Application Layer             │  ← Use Cases, Application Services
├─────────────────────────────────┤
│   Domain Layer                  │  ← Entities, Value Objects, Domain Services
├─────────────────────────────────┤
│   Infrastructure Layer          │  ← Repositories, External Services, DB
└─────────────────────────────────┘
```

### Implementation

```typescript
// Presentation Layer
// user.controller.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = CreateUserDto.from(req.body);
    const user = await this.createUserUseCase.execute(dto);
    res.status(201).json(user);
  }
}

// Application Layer
// create-user.use-case.ts
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const email = Email.create(dto.email);
    const user = User.create(dto.name, email);

    await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(user);

    return user;
  }
}

// Domain Layer
// user.entity.ts
export class User {
  private constructor(
    public readonly id: string,
    private _name: string,
    private _email: Email
  ) {}

  static create(name: string, email: Email): User {
    return new User(generateId(), name, email);
  }

  updateName(newName: string): void {
    if (newName.length < 2) {
      throw new Error('Name too short');
    }
    this._name = newName;
  }
}

// Infrastructure Layer
// prisma-user.repository.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email.toString()
      }
    });
  }
}
```

---

## Clean Architecture

Uncle Bob's Clean Architecture emphasizes independence from frameworks, UI, and databases.

```
┌───────────────────────────────────────┐
│         Frameworks & Drivers          │  ← Web, DB, External APIs
│  ┌─────────────────────────────────┐  │
│  │    Interface Adapters           │  │  ← Controllers, Presenters, Gateways
│  │  ┌───────────────────────────┐  │  │
│  │  │   Application Business    │  │  │  ← Use Cases
│  │  │      ┌─────────────────┐  │  │  │
│  │  │      │   Enterprise    │  │  │  │  ← Entities
│  │  │      │   Business      │  │  │  │
│  │  │      │   Rules         │  │  │  │
│  │  │      └─────────────────┘  │  │  │
│  │  └───────────────────────────┘  │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘

Dependencies point inward →
```

### Implementation

```typescript
// Entities (Core)
// entities/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {}
}

// Use Cases (Application Business Rules)
// use-cases/create-user.ts
export interface CreateUserInput {
  email: string;
  name: string;
}

export interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
}

export interface UserGateway {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export class CreateUserUseCase {
  constructor(private userGateway: UserGateway) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const existing = await this.userGateway.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const user = new User(generateId(), input.email, input.name);
    await this.userGateway.save(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}

// Interface Adapters
// adapters/user-controller.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    const input: CreateUserInput = {
      email: req.body.email,
      name: req.body.name
    };

    const output = await this.createUserUseCase.execute(input);
    res.status(201).json(output);
  }
}

// Frameworks & Drivers
// infrastructure/prisma-user-gateway.ts
export class PrismaUserGateway implements UserGateway {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: { id: user.id, email: user.email, name: user.name }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { email } });
    return data ? new User(data.id, data.email, data.name) : null;
  }
}
```

---

## Hexagonal Architecture

Also known as Ports and Adapters. The domain is at the center, isolated from external concerns.

```
         ┌─────────────────────┐
         │   HTTP Adapter      │
         │   (Controller)      │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │      Port           │
         │   (Interface)       │
         └──────────┬──────────┘
                    │
    ┌───────────────▼───────────────┐
    │                               │
    │      Domain (Core)            │
    │   Business Logic              │
    │                               │
    └───────────────┬───────────────┘
                    │
         ┌──────────▼──────────┐
         │      Port           │
         │   (Interface)       │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │  Database Adapter   │
         │   (Repository)      │
         └─────────────────────┘
```

### Implementation

```typescript
// Domain (Core)
// domain/user.ts
export class User {
  constructor(
    public readonly id: string,
    private _email: string,
    private _name: string
  ) {}

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email');
    }
    this._email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }
}

// domain/user.service.ts
export class UserService {
  constructor(
    private userRepository: UserRepositoryPort,
    private emailService: EmailServicePort
  ) {}

  async createUser(email: string, name: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const user = new User(generateId(), email, name);
    await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(user.email);

    return user;
  }
}

// Ports (Interfaces)
// ports/user-repository.port.ts
export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// ports/email-service.port.ts
export interface EmailServicePort {
  sendWelcomeEmail(email: string): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
}

// Adapters (Implementations)
// adapters/prisma-user.repository.ts
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? new User(data.id, data.email, data.name) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { email } });
    return data ? new User(data.id, data.email, data.name) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email, name: user.name },
      update: { email: user.email, name: user.name }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

// adapters/sendgrid-email.service.ts
export class SendGridEmailService implements EmailServicePort {
  constructor(private apiKey: string) {}

  async sendWelcomeEmail(email: string): Promise<void> {
    // SendGrid implementation
    await sendEmail({
      to: email,
      subject: 'Welcome!',
      body: 'Welcome to our platform'
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    // SendGrid implementation
  }
}

// adapters/http/user.controller.ts
export class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response): Promise<void> {
    const { email, name } = req.body;
    const user = await this.userService.createUser(email, name);
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  }
}

// Dependency Injection Setup
// di-container.ts
const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY);
const userService = new UserService(userRepository, emailService);
const userController = new UserController(userService);

export { userController };
```

### Benefits of Hexagonal Architecture

1. **Testability**: Easy to test domain logic in isolation
2. **Flexibility**: Swap adapters without changing domain
3. **Independence**: Domain doesn't depend on frameworks
4. **Maintainability**: Clear separation of concerns

```typescript
// Easy to test with mocks
describe('UserService', () => {
  it('should create user', async () => {
    const mockRepository: UserRepositoryPort = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      delete: vi.fn()
    };

    const mockEmailService: EmailServicePort = {
      sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
      sendPasswordReset: vi.fn()
    };

    const service = new UserService(mockRepository, mockEmailService);
    const user = await service.createUser('test@example.com', 'Test User');

    expect(user.email).toBe('test@example.com');
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
  });
});
```

---

## Best Practices

### DO ✅

**Use folder-by-feature for scalability**
```typescript
// ✅ Good - Related code together
src/
├── users/
│   ├── user.entity.ts
│   ├── user.service.ts
│   ├── user.controller.ts
│   └── user.repository.ts
└── products/
    ├── product.entity.ts
    ├── product.service.ts
    └── product.controller.ts
```

**Apply dependency inversion**
```typescript
// ✅ Good - Depend on abstractions
class UserService {
  constructor(private repository: UserRepository) {} // Interface
}

// ❌ Bad - Depend on concrete implementation
class UserService {
  private repository = new MySQLUserRepository(); // Concrete class
}
```

**Keep domain logic pure**
```typescript
// ✅ Good - Pure domain logic
class Order {
  calculateTotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.price),
      Money.zero()
    );
  }
}

// ❌ Bad - Domain depends on infrastructure
class Order {
  async calculateTotal(): Promise<Money> {
    const prices = await database.query('SELECT price FROM items'); // DB dependency
    return prices.reduce((sum, p) => sum + p, 0);
  }
}
```

**Use value objects for domain concepts**
```typescript
// ✅ Good - Value object
class Email {
  private constructor(private value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) throw new Error('Invalid email');
    return new Email(email);
  }
}

// ❌ Bad - Primitive obsession
function createUser(email: string) { // Just a string
  // No validation, no encapsulation
}
```

**Separate use cases from domain logic**
```typescript
// ✅ Good - Use case orchestrates
class CreateUserUseCase {
  async execute(dto: CreateUserDto): Promise<User> {
    const user = User.create(dto.name, dto.email);
    await this.repository.save(user);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}

// ❌ Bad - Domain entity does too much
class User {
  async create(name: string, email: string) {
    // Validation
    // Database save
    // Send email
    // Too many responsibilities
  }
}
```

### DON'T ❌

**Don't let domain depend on infrastructure**
```typescript
// ❌ Bad
class User {
  async save() {
    await prisma.user.create({ data: this }); // Domain depends on Prisma
  }
}

// ✅ Good
class User {
  // Pure domain logic only
}

class UserRepository {
  async save(user: User) {
    await prisma.user.create({ data: this.toPersistence(user) });
  }
}
```

**Don't mix layers**
```typescript
// ❌ Bad - Controller has business logic
class UserController {
  async create(req: Request, res: Response) {
    const user = new User(req.body.name, req.body.email);
    if (await this.repository.findByEmail(user.email)) {
      throw new Error('Email exists'); // Business logic in controller
    }
    await this.repository.save(user);
    res.json(user);
  }
}

// ✅ Good - Business logic in service
class UserService {
  async createUser(name: string, email: string): Promise<User> {
    if (await this.repository.findByEmail(email)) {
      throw new Error('Email exists'); // Business logic in service
    }
    const user = new User(name, email);
    await this.repository.save(user);
    return user;
  }
}
```

**Don't create anemic domain models**
```typescript
// ❌ Bad - Anemic model (just data, no behavior)
class User {
  id: string;
  email: string;
  name: string;
}

class UserService {
  updateEmail(user: User, newEmail: string) {
    // All logic in service
    if (!this.isValidEmail(newEmail)) throw new Error('Invalid');
    user.email = newEmail;
  }
}

// ✅ Good - Rich domain model
class User {
  constructor(
    public readonly id: string,
    private _email: string,
    private _name: string
  ) {}

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) throw new Error('Invalid');
    this._email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

---

## Summary

**Key Takeaways:**

1. **Folder-by-feature** - Organize code by business domain, not technical role
2. **Dependency inversion** - Depend on abstractions, not concrete implementations
3. **Domain-driven design** - Model the business domain with entities, value objects, and aggregates
4. **Layered architecture** - Separate presentation, application, domain, and infrastructure
5. **Clean architecture** - Keep business rules independent of frameworks and UI
6. **Hexagonal architecture** - Isolate domain with ports and adapters
7. **Rich domain models** - Put business logic in domain entities, not services
8. **Use cases** - Orchestrate domain logic and infrastructure
9. **Testability** - Architecture should make testing easy
10. **Flexibility** - Easy to swap implementations and adapt to change

**Architecture Checklist:**

- [ ] Code organized by feature/domain
- [ ] Dependencies point inward (toward domain)
- [ ] Domain logic is pure (no infrastructure dependencies)
- [ ] Interfaces define contracts between layers
- [ ] Use cases orchestrate application logic
- [ ] Value objects encapsulate domain concepts
- [ ] Repositories abstract data access
- [ ] Easy to test in isolation
- [ ] Easy to swap implementations
- [ ] Clear separation of concerns

---

## References

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)


