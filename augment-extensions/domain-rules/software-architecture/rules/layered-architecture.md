# Layered Architecture

## Overview

This document covers layered architecture patterns including MVC, N-tier, hexagonal architecture, and pipe-and-filter patterns for organizing software systems.

---

## Knowledge

### What is Layered Architecture?

**Definition**
- Organizes system into horizontal layers
- Each layer has specific responsibility
- Layers communicate through well-defined interfaces
- Higher layers depend on lower layers
- Promotes separation of concerns

**Core Principles**
- Separation of Concerns: Each layer has distinct responsibility
- Dependency Rule: Dependencies point downward
- Abstraction: Layers hide implementation details
- Testability: Layers can be tested independently

**Common Layers**
1. **Presentation Layer**: UI, user interaction
2. **Application Layer**: Use cases, orchestration
3. **Domain Layer**: Business logic, entities
4. **Infrastructure Layer**: Database, external services

### Types of Layered Architectures

**Strict Layering**
- Layer can only access layer directly below
- More rigid, better isolation
- Can lead to pass-through methods

**Relaxed Layering**
- Layer can access any layer below
- More flexible, less boilerplate
- Risk of tight coupling

**Open vs Closed Layers**
- Closed: Must go through layer
- Open: Can skip layer
- Mix of both in practice

### When to Use Layered Architecture

**Good Fit**
- Traditional enterprise applications
- CRUD-heavy applications
- Team familiar with pattern
- Clear separation of concerns needed
- Monolithic applications

**Poor Fit**
- Microservices (too much overhead per service)
- Simple applications (over-engineering)
- High-performance requirements (layer overhead)
- Rapidly changing requirements

---

## Skills

### Classic Three-Tier Architecture

**Presentation Tier**
- User interface
- Input validation
- Display logic
- Examples: Web pages, mobile apps, desktop UI

**Business Logic Tier**
- Business rules
- Workflow orchestration
- Data validation
- Calculations and transformations

**Data Access Tier**
- Database operations
- CRUD operations
- Query optimization
- Connection management

**Architecture Diagram**
```
┌─────────────────────────┐
│   Presentation Tier     │  (Web/Mobile/Desktop)
├─────────────────────────┤
│   Business Logic Tier   │  (Application Server)
├─────────────────────────┤
│   Data Access Tier      │  (Database Server)
└─────────────────────────┘
```

### MVC (Model-View-Controller)

**Components**

**Model**
- Business data and logic
- State management
- Data validation
- Notifies views of changes

**View**
- Presentation logic
- Displays data from model
- User interface
- No business logic

**Controller**
- Handles user input
- Updates model
- Selects view
- Orchestrates flow

**Flow**
```
User → Controller → Model → View → User
```

**Example Structure**
```
app/
├── controllers/
│   ├── UserController.java
│   └── OrderController.java
├── models/
│   ├── User.java
│   └── Order.java
└── views/
    ├── user-list.jsp
    └── order-details.jsp
```

### Clean Architecture (Hexagonal/Onion)

**Layers (Inside-Out)**

**Domain Layer (Core)**
- Entities
- Value objects
- Domain services
- Business rules
- No external dependencies

**Application Layer**
- Use cases
- Application services
- Orchestration
- Depends only on domain

**Infrastructure Layer (Outer)**
- Database implementations
- External services
- Frameworks
- Depends on application/domain

**Presentation Layer (Outer)**
- Controllers
- API endpoints
- UI components
- Depends on application

**Dependency Rule**
- Dependencies point inward
- Inner layers know nothing of outer layers
- Use interfaces for inversion

**Architecture Diagram**
```
┌─────────────────────────────────────┐
│      Presentation & Infrastructure  │
│  ┌───────────────────────────────┐  │
│  │      Application Layer        │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    Domain Layer         │  │  │
│  │  │  (Entities, Rules)      │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Pipe-and-Filter Pattern

**Concept**
- Data flows through series of processing steps
- Each filter transforms data
- Pipes connect filters
- Filters are independent and reusable

**Components**

**Filter**
- Processes data
- Single responsibility
- Stateless (ideally)
- Reusable

**Pipe**
- Connects filters
- Transfers data
- Can buffer data
- Examples: streams, queues

**Use Cases**
- Data processing pipelines
- Compiler stages
- Image processing
- ETL (Extract, Transform, Load)

**Example**
```
Input → [Validate] → [Transform] → [Enrich] → [Store] → Output
```

---

## Examples

### Clean Architecture Implementation

**Domain Layer**
```java
// Entity
public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderItem> items;
    private OrderStatus status;
    private final Money total;

    public Order(OrderId id, CustomerId customerId, List<OrderItem> items) {
        this.id = id;
        this.customerId = customerId;
        this.items = new ArrayList<>(items);
        this.status = OrderStatus.PENDING;
        this.total = calculateTotal(items);
    }

    public void confirm() {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Order must be pending to confirm");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    private Money calculateTotal(List<OrderItem> items) {
        return items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}

// Value Object
public class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        this.amount = amount;
        this.currency = currency;
    }

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Cannot add different currencies");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }
}

// Repository Interface (in domain)
public interface OrderRepository {
    Order findById(OrderId id);
    void save(Order order);
    List<Order> findByCustomerId(CustomerId customerId);
}
```

**Application Layer**
```java
// Use Case
public class PlaceOrderUseCase {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentGateway paymentGateway;

    public PlaceOrderUseCase(
        OrderRepository orderRepository,
        ProductRepository productRepository,
        PaymentGateway paymentGateway
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.paymentGateway = paymentGateway;
    }

    public OrderId execute(PlaceOrderCommand command) {
        // Validate products exist
        List<Product> products = productRepository.findByIds(
            command.getProductIds()
        );

        if (products.size() != command.getProductIds().size()) {
            throw new ProductNotFoundException();
        }

        // Create order
        List<OrderItem> items = createOrderItems(products, command);
        Order order = new Order(
            OrderId.generate(),
            command.getCustomerId(),
            items
        );

        // Process payment
        PaymentResult result = paymentGateway.charge(
            command.getPaymentMethod(),
            order.getTotal()
        );

        if (result.isSuccessful()) {
            order.confirm();
        }

        // Save order
        orderRepository.save(order);

        return order.getId();
    }
}

// Command (Input DTO)
public class PlaceOrderCommand {
    private final CustomerId customerId;
    private final List<ProductId> productIds;
    private final Map<ProductId, Integer> quantities;
    private final PaymentMethod paymentMethod;

    // Constructor, getters...
}
```

**Infrastructure Layer**
```java
// Repository Implementation
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final EntityManager entityManager;

    @Override
    public Order findById(OrderId id) {
        OrderEntity entity = entityManager.find(
            OrderEntity.class,
            id.getValue()
        );
        return entity != null ? entity.toDomain() : null;
    }

    @Override
    public void save(Order order) {
        OrderEntity entity = OrderEntity.fromDomain(order);
        entityManager.merge(entity);
    }
}

// JPA Entity (Infrastructure concern)
@Entity
@Table(name = "orders")
class OrderEntity {
    @Id
    private String id;

    @Column(name = "customer_id")
    private String customerId;

    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderItemEntity> items;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // Mapping methods
    public Order toDomain() {
        return new Order(
            new OrderId(this.id),
            new CustomerId(this.customerId),
            this.items.stream()
                .map(OrderItemEntity::toDomain)
                .collect(Collectors.toList())
        );
    }

    public static OrderEntity fromDomain(Order order) {
        OrderEntity entity = new OrderEntity();
        entity.id = order.getId().getValue();
        entity.customerId = order.getCustomerId().getValue();
        entity.items = order.getItems().stream()
            .map(OrderItemEntity::fromDomain)
            .collect(Collectors.toList());
        entity.status = order.getStatus();
        return entity;
    }
}
```

**Presentation Layer**
```java
// REST Controller
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final PlaceOrderUseCase placeOrderUseCase;
    private final GetOrderUseCase getOrderUseCase;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
        @RequestBody PlaceOrderRequest request
    ) {
        // Map request to command
        PlaceOrderCommand command = new PlaceOrderCommand(
            new CustomerId(request.getCustomerId()),
            request.getProductIds().stream()
                .map(ProductId::new)
                .collect(Collectors.toList()),
            request.getQuantities(),
            request.getPaymentMethod()
        );

        // Execute use case
        OrderId orderId = placeOrderUseCase.execute(command);

        // Map to response
        return ResponseEntity.ok(new OrderResponse(orderId.getValue()));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailsResponse> getOrder(
        @PathVariable String orderId
    ) {
        Order order = getOrderUseCase.execute(new OrderId(orderId));
        return ResponseEntity.ok(OrderDetailsResponse.from(order));
    }
}

// Request DTO
public class PlaceOrderRequest {
    private String customerId;
    private List<String> productIds;
    private Map<String, Integer> quantities;
    private PaymentMethod paymentMethod;

    // Getters, setters...
}
```

### MVC Web Application

**Model**
```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String email;
    private String passwordHash;

    // Business logic
    public boolean authenticate(String password) {
        return BCrypt.checkpw(password, this.passwordHash);
    }

    public void updateEmail(String newEmail) {
        if (!isValidEmail(newEmail)) {
            throw new IllegalArgumentException("Invalid email");
        }
        this.email = newEmail;
    }
}
```

**Controller**
```java
@Controller
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @GetMapping
    public String listUsers(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "user-list";
    }

    @GetMapping("/{id}")
    public String viewUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "user-details";
    }

    @PostMapping
    public String createUser(@ModelAttribute UserForm form,
                           RedirectAttributes redirectAttributes) {
        User user = userService.create(
            form.getUsername(),
            form.getEmail(),
            form.getPassword()
        );

        redirectAttributes.addFlashAttribute(
            "message",
            "User created successfully"
        );

        return "redirect:/users/" + user.getId();
    }
}
```

**View (Thymeleaf)**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>User List</title>
</head>
<body>
    <h1>Users</h1>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="user : ${users}">
                <td th:text="${user.id}"></td>
                <td th:text="${user.username}"></td>
                <td th:text="${user.email}"></td>
                <td>
                    <a th:href="@{/users/{id}(id=${user.id})}">View</a>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
```

### Pipe-and-Filter Data Processing

**Filter Interface**
```java
public interface Filter<I, O> {
    O process(I input);
}
```

**Concrete Filters**
```java
// Validation Filter
public class ValidationFilter implements Filter<RawData, ValidatedData> {
    @Override
    public ValidatedData process(RawData input) {
        if (input.getId() == null || input.getId().isEmpty()) {
            throw new ValidationException("ID is required");
        }

        if (input.getValue() < 0) {
            throw new ValidationException("Value must be positive");
        }

        return new ValidatedData(input.getId(), input.getValue());
    }
}

// Transformation Filter
public class TransformationFilter implements Filter<ValidatedData, TransformedData> {
    @Override
    public TransformedData process(ValidatedData input) {
        // Apply business transformation
        double transformedValue = input.getValue() * 1.1; // 10% markup

        return new TransformedData(
            input.getId(),
            transformedValue,
            LocalDateTime.now()
        );
    }
}

// Enrichment Filter
public class EnrichmentFilter implements Filter<TransformedData, EnrichedData> {
    private final ExternalService externalService;

    @Override
    public EnrichedData process(TransformedData input) {
        // Fetch additional data
        AdditionalInfo info = externalService.getInfo(input.getId());

        return new EnrichedData(
            input.getId(),
            input.getValue(),
            input.getTimestamp(),
            info
        );
    }
}
```

**Pipeline**
```java
public class Pipeline<I, O> {
    private final List<Filter<?, ?>> filters = new ArrayList<>();

    public <T> Pipeline<I, T> addFilter(Filter<O, T> filter) {
        filters.add(filter);
        return (Pipeline<I, T>) this;
    }

    public O execute(I input) {
        Object current = input;

        for (Filter filter : filters) {
            current = ((Filter<Object, Object>) filter).process(current);
        }

        return (O) current;
    }
}

// Usage
Pipeline<RawData, EnrichedData> pipeline = new Pipeline<>()
    .addFilter(new ValidationFilter())
    .addFilter(new TransformationFilter())
    .addFilter(new EnrichmentFilter());

EnrichedData result = pipeline.execute(rawData);
```

---

## Understanding

### Advantages of Layered Architecture

**Separation of Concerns**
- Clear responsibilities
- Easier to understand
- Focused modules
- Reduced complexity

**Testability**
- Test layers independently
- Mock dependencies
- Unit test business logic
- Integration test layers

**Maintainability**
- Changes isolated to layers
- Clear structure
- Easy to locate code
- Reduced coupling

**Reusability**
- Reuse business logic
- Share data access code
- Common infrastructure
- Consistent patterns

**Team Organization**
- Teams can own layers
- Parallel development
- Clear interfaces
- Reduced conflicts

### Challenges and Disadvantages

**Performance Overhead**
- Layer traversal cost
- Data transformation between layers
- Potential for chattiness
- Memory overhead

**Rigidity**
- Can be over-engineered
- Boilerplate code
- Pass-through methods
- Difficult to change layer structure

**Anemic Domain Model**
- Business logic in service layer
- Entities become data holders
- Violates OOP principles
- Reduced encapsulation

**Tight Coupling Risk**
- Layers can become coupled
- Shared data structures
- Leaky abstractions
- Difficult to change

### Best Practices

**Dependency Management**
- Dependencies point downward
- Use interfaces for abstraction
- Dependency injection
- Avoid circular dependencies

**Layer Responsibilities**
- Keep layers focused
- Don't skip layers (strict layering)
- Minimize pass-through methods
- Use DTOs between layers

**Domain-Driven Design**
- Rich domain models
- Business logic in domain layer
- Entities with behavior
- Value objects for immutability

**Testing Strategy**
- Unit test domain layer
- Integration test application layer
- End-to-end test presentation layer
- Mock external dependencies

**Avoid Common Pitfalls**
- Don't put business logic in controllers
- Don't access database from presentation
- Don't expose domain entities to UI
- Don't create god services

---

## References

- **Books**
  - "Clean Architecture" by Robert C. Martin
  - "Domain-Driven Design" by Eric Evans
  - "Patterns of Enterprise Application Architecture" by Martin Fowler
  - "Implementing Domain-Driven Design" by Vaughn Vernon

- **Patterns**
  - MVC (Model-View-Controller)
  - MVP (Model-View-Presenter)
  - MVVM (Model-View-ViewModel)
  - Hexagonal Architecture (Ports and Adapters)
  - Onion Architecture
  - Clean Architecture

- **Principles**
  - Separation of Concerns
  - Dependency Inversion Principle
  - Single Responsibility Principle
  - Interface Segregation Principle


