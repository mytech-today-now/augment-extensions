# Structural Design Patterns

Patterns for composing classes and objects.

## Adapter Pattern

Convert interface of a class into another interface clients expect.

### Implementation

```typescript
// Old API
class OldPaymentProcessor {
  processPayment(amount: number): void {
    console.log(`Processing $${amount} via old system`);
  }
}

// New API interface
interface PaymentGateway {
  pay(amount: number, currency: string): void;
}

// Adapter
class PaymentAdapter implements PaymentGateway {
  constructor(private oldProcessor: OldPaymentProcessor) {}

  pay(amount: number, currency: string): void {
    // Convert new API call to old API call
    console.log(`Converting ${currency} payment`);
    this.oldProcessor.processPayment(amount);
  }
}

// Usage
const oldProcessor = new OldPaymentProcessor();
const adapter = new PaymentAdapter(oldProcessor);
adapter.pay(100, 'USD');
```

### Use Cases

- Integrating third-party libraries
- Working with legacy code
- API versioning
- Database adapters

---

## Decorator Pattern

Add new functionality to objects dynamically.

### Implementation

```typescript
interface Coffee {
  cost(): number;
  description(): string;
}

class SimpleCoffee implements Coffee {
  cost(): number {
    return 5;
  }

  description(): string {
    return 'Simple coffee';
  }
}

// Decorator base class
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}

  abstract cost(): number;
  abstract description(): string;
}

class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 1;
  }

  description(): string {
    return this.coffee.description() + ', milk';
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.5;
  }

  description(): string {
    return this.coffee.description() + ', sugar';
  }
}

// Usage
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee: $5"

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee, milk: $6"

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
// "Simple coffee, milk, sugar: $6.5"
```

### Use Cases

- Adding features to objects at runtime
- Middleware in web frameworks
- Stream processing (compression, encryption)
- UI component enhancement

---

## Facade Pattern

Provide simplified interface to complex subsystem.

### Implementation

```typescript
// Complex subsystems
class CPU {
  freeze(): void {
    console.log('CPU: Freezing...');
  }
  jump(position: number): void {
    console.log(`CPU: Jumping to ${position}`);
  }
  execute(): void {
    console.log('CPU: Executing...');
  }
}

class Memory {
  load(position: number, data: string): void {
    console.log(`Memory: Loading ${data} at ${position}`);
  }
}

class HardDrive {
  read(sector: number, size: number): string {
    console.log(`HardDrive: Reading sector ${sector}, size ${size}`);
    return 'boot data';
  }
}

// Facade
class ComputerFacade {
  private cpu: CPU;
  private memory: Memory;
  private hardDrive: HardDrive;

  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start(): void {
    console.log('Computer: Starting...');
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('Computer: Started!');
  }
}

// Usage
const computer = new ComputerFacade();
computer.start(); // Simple interface hides complexity
```

### Use Cases

- Simplifying complex libraries
- API wrappers
- Database access layers
- Service orchestration

---

## Proxy Pattern

Provide placeholder for another object to control access.

### Implementation

```typescript
interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private filename: string) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading image: ${this.filename}`);
  }

  display(): void {
    console.log(`Displaying image: ${this.filename}`);
  }
}

class ImageProxy implements Image {
  private realImage: RealImage | null = null;

  constructor(private filename: string) {}

  display(): void {
    // Lazy loading - only create real image when needed
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// Usage
const image1 = new ImageProxy('photo1.jpg');
const image2 = new ImageProxy('photo2.jpg');

// Images not loaded yet
console.log('Images created');

// Load and display only when needed
image1.display(); // Loads and displays
image1.display(); // Just displays (already loaded)
```

### Types of Proxies

1. **Virtual Proxy**: Lazy initialization (example above)
2. **Protection Proxy**: Access control
3. **Remote Proxy**: Remote object representation
4. **Caching Proxy**: Cache results

### Use Cases

- Lazy loading of resources
- Access control and authentication
- Logging and monitoring
- Caching expensive operations

### Best Practices

1. **Adapter**: Use when interfaces are incompatible
2. **Decorator**: Use to add responsibilities dynamically
3. **Facade**: Use to simplify complex subsystems
4. **Proxy**: Use to control access or add lazy loading

