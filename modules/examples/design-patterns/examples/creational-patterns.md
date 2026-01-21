# Creational Design Patterns

Patterns for object creation mechanisms.

## Singleton Pattern

Ensure a class has only one instance and provide a global access point.

### Implementation

```typescript
class Database {
  private static instance: Database;
  private connection: any;

  private constructor() {
    // Private constructor prevents direct instantiation
    this.connection = this.connect();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private connect() {
    console.log('Connecting to database...');
    return { connected: true };
  }

  public query(sql: string) {
    console.log(`Executing: ${sql}`);
    return this.connection;
  }
}

// Usage
const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true - same instance
```

### Use Cases

- Database connections
- Configuration managers
- Logging services
- Cache managers

### Pitfalls

- Difficult to test (global state)
- Can hide dependencies
- Thread safety issues (in multi-threaded environments)

---

## Factory Pattern

Create objects without specifying exact class.

### Implementation

```typescript
interface Animal {
  speak(): string;
}

class Dog implements Animal {
  speak(): string {
    return 'Woof!';
  }
}

class Cat implements Animal {
  speak(): string {
    return 'Meow!';
  }
}

class AnimalFactory {
  static createAnimal(type: 'dog' | 'cat'): Animal {
    switch (type) {
      case 'dog':
        return new Dog();
      case 'cat':
        return new Cat();
      default:
        throw new Error(`Unknown animal type: ${type}`);
    }
  }
}

// Usage
const dog = AnimalFactory.createAnimal('dog');
console.log(dog.speak()); // "Woof!"

const cat = AnimalFactory.createAnimal('cat');
console.log(cat.speak()); // "Meow!"
```

### Use Cases

- Creating UI components based on configuration
- Database connection factories (MySQL, PostgreSQL, etc.)
- Document parsers (JSON, XML, CSV)
- Payment processors (Stripe, PayPal, etc.)

---

## Builder Pattern

Construct complex objects step by step.

### Implementation

```typescript
class User {
  constructor(
    public name: string,
    public email: string,
    public age?: number,
    public address?: string,
    public phone?: string
  ) {}
}

class UserBuilder {
  private name: string = '';
  private email: string = '';
  private age?: number;
  private address?: string;
  private phone?: string;

  setName(name: string): UserBuilder {
    this.name = name;
    return this;
  }

  setEmail(email: string): UserBuilder {
    this.email = email;
    return this;
  }

  setAge(age: number): UserBuilder {
    this.age = age;
    return this;
  }

  setAddress(address: string): UserBuilder {
    this.address = address;
    return this;
  }

  setPhone(phone: string): UserBuilder {
    this.phone = phone;
    return this;
  }

  build(): User {
    if (!this.name || !this.email) {
      throw new Error('Name and email are required');
    }
    return new User(this.name, this.email, this.age, this.address, this.phone);
  }
}

// Usage
const user = new UserBuilder()
  .setName('John Doe')
  .setEmail('john@example.com')
  .setAge(30)
  .setAddress('123 Main St')
  .build();
```

### Use Cases

- Building complex configuration objects
- Creating HTTP requests
- Constructing SQL queries
- Building UI components with many options

---

## Prototype Pattern

Create new objects by cloning existing ones.

### Implementation

```typescript
interface Cloneable<T> {
  clone(): T;
}

class Shape implements Cloneable<Shape> {
  constructor(
    public x: number,
    public y: number,
    public color: string
  ) {}

  clone(): Shape {
    return new Shape(this.x, this.y, this.color);
  }
}

class Circle extends Shape {
  constructor(
    x: number,
    y: number,
    color: string,
    public radius: number
  ) {
    super(x, y, color);
  }

  clone(): Circle {
    return new Circle(this.x, this.y, this.color, this.radius);
  }
}

// Usage
const originalCircle = new Circle(10, 20, 'red', 5);
const clonedCircle = originalCircle.clone();

clonedCircle.x = 30;
clonedCircle.color = 'blue';

console.log(originalCircle); // Circle { x: 10, y: 20, color: 'red', radius: 5 }
console.log(clonedCircle);   // Circle { x: 30, y: 20, color: 'blue', radius: 5 }
```

### Use Cases

- Cloning game objects
- Creating template objects
- Avoiding expensive initialization
- Creating variations of objects

### Best Practices

1. **Singleton**: Use sparingly, prefer dependency injection
2. **Factory**: Use when object creation logic is complex
3. **Builder**: Use for objects with many optional parameters
4. **Prototype**: Use when cloning is cheaper than creating new

