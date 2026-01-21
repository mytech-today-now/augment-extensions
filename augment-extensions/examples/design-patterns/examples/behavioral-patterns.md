# Behavioral Design Patterns

Patterns for communication between objects.

## Observer Pattern

Define one-to-many dependency between objects.

### Implementation

```typescript
interface Observer {
  update(data: any): void;
}

interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

class NewsAgency implements Subject {
  private observers: Observer[] = [];
  private news: string = '';

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this.news);
    }
  }

  setNews(news: string): void {
    this.news = news;
    this.notify();
  }
}

class NewsChannel implements Observer {
  constructor(private name: string) {}

  update(news: string): void {
    console.log(`${this.name} received news: ${news}`);
  }
}

// Usage
const agency = new NewsAgency();
const cnn = new NewsChannel('CNN');
const bbc = new NewsChannel('BBC');

agency.attach(cnn);
agency.attach(bbc);

agency.setNews('Breaking: New design pattern discovered!');
// CNN received news: Breaking: New design pattern discovered!
// BBC received news: Breaking: New design pattern discovered!
```

### Use Cases

- Event handling systems
- Model-View-Controller (MVC)
- Pub/Sub messaging
- Real-time notifications

---

## Strategy Pattern

Define family of algorithms, encapsulate each one, make them interchangeable.

### Implementation

```typescript
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private cvv: string
  ) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Credit Card ${this.cardNumber}`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
  }
}

class CryptoPayment implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Crypto wallet ${this.walletAddress}`);
  }
}

class ShoppingCart {
  private items: string[] = [];
  private paymentStrategy?: PaymentStrategy;

  addItem(item: string): void {
    this.items.push(item);
  }

  setPaymentStrategy(strategy: PaymentStrategy): void {
    this.paymentStrategy = strategy;
  }

  checkout(amount: number): void {
    if (!this.paymentStrategy) {
      throw new Error('Payment strategy not set');
    }
    this.paymentStrategy.pay(amount);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem('Laptop');
cart.addItem('Mouse');

// Pay with credit card
cart.setPaymentStrategy(new CreditCardPayment('1234-5678', '123'));
cart.checkout(1500);

// Pay with PayPal
cart.setPaymentStrategy(new PayPalPayment('user@example.com'));
cart.checkout(1500);
```

### Use Cases

- Payment processing
- Sorting algorithms
- Compression algorithms
- Validation strategies

---

## Command Pattern

Encapsulate request as an object.

### Implementation

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class Light {
  turnOn(): void {
    console.log('Light is ON');
  }

  turnOff(): void {
    console.log('Light is OFF');
  }
}

class LightOnCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOn();
  }

  undo(): void {
    this.light.turnOff();
  }
}

class LightOffCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOff();
  }

  undo(): void {
    this.light.turnOn();
  }
}

class RemoteControl {
  private history: Command[] = [];

  executeCommand(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  undo(): void {
    const command = this.history.pop();
    if (command) {
      command.undo();
    }
  }
}

// Usage
const light = new Light();
const remote = new RemoteControl();

const lightOn = new LightOnCommand(light);
const lightOff = new LightOffCommand(light);

remote.executeCommand(lightOn);  // Light is ON
remote.executeCommand(lightOff); // Light is OFF
remote.undo();                   // Light is ON (undo last command)
```

### Use Cases

- Undo/Redo functionality
- Transaction systems
- Job queues
- Macro recording

---

## State Pattern

Allow object to alter behavior when internal state changes.

### Implementation

```typescript
interface State {
  insertCoin(): void;
  ejectCoin(): void;
  dispense(): void;
}

class VendingMachine {
  private noCoinState: State;
  private hasCoinState: State;
  private soldState: State;
  private currentState: State;

  constructor() {
    this.noCoinState = new NoCoinState(this);
    this.hasCoinState = new HasCoinState(this);
    this.soldState = new SoldState(this);
    this.currentState = this.noCoinState;
  }

  setState(state: State): void {
    this.currentState = state;
  }

  getNoCoinState(): State {
    return this.noCoinState;
  }

  getHasCoinState(): State {
    return this.hasCoinState;
  }

  getSoldState(): State {
    return this.soldState;
  }

  insertCoin(): void {
    this.currentState.insertCoin();
  }

  ejectCoin(): void {
    this.currentState.ejectCoin();
  }

  dispense(): void {
    this.currentState.dispense();
  }
}

class NoCoinState implements State {
  constructor(private machine: VendingMachine) {}

  insertCoin(): void {
    console.log('Coin inserted');
    this.machine.setState(this.machine.getHasCoinState());
  }

  ejectCoin(): void {
    console.log('No coin to eject');
  }

  dispense(): void {
    console.log('Insert coin first');
  }
}

class HasCoinState implements State {
  constructor(private machine: VendingMachine) {}

  insertCoin(): void {
    console.log('Coin already inserted');
  }

  ejectCoin(): void {
    console.log('Coin ejected');
    this.machine.setState(this.machine.getNoCoinState());
  }

  dispense(): void {
    console.log('Dispensing product');
    this.machine.setState(this.machine.getSoldState());
  }
}

class SoldState implements State {
  constructor(private machine: VendingMachine) {}

  insertCoin(): void {
    console.log('Please wait, dispensing product');
  }

  ejectCoin(): void {
    console.log('Cannot eject, already dispensing');
  }

  dispense(): void {
    console.log('Product dispensed');
    this.machine.setState(this.machine.getNoCoinState());
  }
}

// Usage
const machine = new VendingMachine();
machine.insertCoin(); // Coin inserted
machine.dispense();   // Dispensing product
machine.dispense();   // Product dispensed
```

### Use Cases

- Workflow engines
- Game character states
- Connection states (connected, disconnected, etc.)
- Order processing states

### Best Practices

1. **Observer**: Use for event-driven systems
2. **Strategy**: Use when you need to switch algorithms at runtime
3. **Command**: Use for undo/redo and transaction systems
4. **State**: Use when object behavior changes based on state

