# Monolithic Architecture

## Overview

This document covers monolithic architecture patterns, best practices, and when to use this architectural style for software systems.

---

## Knowledge

### What is Monolithic Architecture?

**Definition**
- Single, unified codebase and deployment unit
- All components run in the same process
- Shared memory space and resources
- Single database (typically)

**Characteristics**
- Tightly coupled components
- Shared data model
- Single deployment artifact (JAR, WAR, executable)
- Vertical scaling (scale entire application)

**Types of Monoliths**
1. **Modular Monolith**: Well-organized internal modules with clear boundaries
2. **Big Ball of Mud**: Poorly structured, tangled dependencies
3. **Layered Monolith**: Organized in horizontal layers (presentation, business, data)

### When to Use Monolithic Architecture

**Good Fit**
- Small to medium-sized applications
- Simple business domains
- Small development teams (< 10 developers)
- Rapid prototyping and MVPs
- Limited scalability requirements
- Tight deadlines with limited resources

**Poor Fit**
- Large, complex domains
- Need for independent scaling of components
- Multiple teams working independently
- Frequent deployments of different features
- Technology diversity requirements

---

## Skills

### Designing a Modular Monolith

**Module Organization**
1. **Domain-Driven Modules**: Organize by business capabilities
   - User Management
   - Order Processing
   - Inventory Management
   - Billing

2. **Layer-Based Modules**: Organize by technical concerns
   - Presentation Layer
   - Application Layer
   - Domain Layer
   - Infrastructure Layer

**Module Boundaries**
- Define clear interfaces between modules
- Avoid circular dependencies
- Use dependency injection for loose coupling
- Encapsulate module internals

**Package Structure Example**
```
com.example.app/
├── user/
│   ├── UserController.java
│   ├── UserService.java
│   ├── UserRepository.java
│   └── User.java
├── order/
│   ├── OrderController.java
│   ├── OrderService.java
│   ├── OrderRepository.java
│   └── Order.java
└── shared/
    ├── config/
    ├── utils/
    └── exceptions/
```

### Managing Dependencies

**Dependency Rules**
- Higher layers depend on lower layers
- Domain layer has no external dependencies
- Use interfaces to invert dependencies
- Avoid tight coupling to frameworks

**Dependency Injection**
```java
// Good: Constructor injection with interfaces
public class OrderService {
    private final OrderRepository repository;
    private final EmailService emailService;
    
    public OrderService(OrderRepository repository, 
                       EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }
}

// Bad: Direct instantiation
public class OrderService {
    private OrderRepository repository = new OrderRepositoryImpl();
    private EmailService emailService = new EmailServiceImpl();
}
```

### Database Management

**Single Database Approach**
- Shared schema across all modules
- Use database transactions for consistency
- Careful schema evolution
- Consider schema namespaces for modules

**Data Access Patterns**
- Repository pattern for data access
- ORM for object-relational mapping
- Database migrations (Flyway, Liquibase)
- Connection pooling

---

## Examples

### E-Commerce Monolith Structure

**Application Structure**
```
ecommerce-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/ecommerce/
│   │   │       ├── catalog/
│   │   │       │   ├── Product.java
│   │   │       │   ├── ProductService.java
│   │   │       │   └── ProductController.java
│   │   │       ├── cart/
│   │   │       │   ├── Cart.java
│   │   │       │   ├── CartService.java
│   │   │       │   └── CartController.java
│   │   │       ├── order/
│   │   │       │   ├── Order.java
│   │   │       │   ├── OrderService.java
│   │   │       │   └── OrderController.java
│   │   │       └── payment/
│   │   │           ├── Payment.java
│   │   │           ├── PaymentService.java
│   │   │           └── PaymentController.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/
│   └── test/
└── pom.xml
```

**Service Layer Example**
```java
@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final PaymentService paymentService;
    private final EmailService emailService;

    public Order createOrder(CreateOrderRequest request) {
        // Validate products
        List<Product> products = productService.validateProducts(
            request.getProductIds()
        );

        // Calculate total
        BigDecimal total = calculateTotal(products);

        // Create order
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setProducts(products);
        order.setTotal(total);
        order.setStatus(OrderStatus.PENDING);

        // Save order
        order = orderRepository.save(order);

        // Process payment
        Payment payment = paymentService.processPayment(
            order.getId(),
            total
        );

        if (payment.isSuccessful()) {
            order.setStatus(OrderStatus.CONFIRMED);
            emailService.sendOrderConfirmation(order);
        } else {
            order.setStatus(OrderStatus.FAILED);
        }

        return orderRepository.save(order);
    }
}
```

---

## Understanding

### Advantages of Monolithic Architecture

**Development Simplicity**
- Single codebase to understand
- Easier debugging (single process)
- Simpler IDE setup
- Straightforward testing

**Deployment Simplicity**
- Single deployment unit
- No distributed system complexity
- Easier rollback
- Simpler infrastructure

**Performance**
- In-process communication (no network overhead)
- Shared memory access
- ACID transactions
- Lower latency

**Development Velocity (Initially)**
- Faster initial development
- No service boundaries to negotiate
- Shared code reuse
- Simpler refactoring

### Disadvantages and Challenges

**Scalability Limitations**
- Must scale entire application
- Cannot scale components independently
- Resource inefficiency
- Vertical scaling limits

**Deployment Risks**
- Single point of failure
- All-or-nothing deployments
- Longer deployment times
- Higher risk of breaking changes

**Technology Lock-in**
- Single technology stack
- Difficult to adopt new technologies
- Framework upgrades affect entire app
- Limited experimentation

**Team Coordination**
- Code conflicts increase with team size
- Merge conflicts
- Coordination overhead
- Slower release cycles

**Maintenance Challenges**
- Growing complexity over time
- Tight coupling increases
- Technical debt accumulation
- Difficult to understand (large codebases)

### Best Practices

**Keep It Modular**
- Enforce module boundaries
- Use package-private visibility
- Avoid circular dependencies
- Regular architecture reviews

**Maintain Clean Architecture**
- Separate concerns (layers)
- Dependency inversion
- Domain-driven design
- SOLID principles

**Automated Testing**
- Unit tests for business logic
- Integration tests for workflows
- End-to-end tests for critical paths
- Test coverage monitoring

**Continuous Integration/Deployment**
- Automated builds
- Automated testing
- Feature flags for gradual rollouts
- Blue-green deployments

**Monitoring and Observability**
- Application performance monitoring
- Error tracking
- Logging (structured logs)
- Health checks

### Migration Strategies

**When to Consider Migration**
- Team size exceeds 10-15 developers
- Deployment frequency bottleneck
- Scaling requirements differ by component
- Technology diversity needed

**Strangler Fig Pattern**
1. Identify bounded context to extract
2. Build new microservice alongside monolith
3. Route new traffic to microservice
4. Migrate existing data gradually
5. Decommission monolith code

**Branch by Abstraction**
1. Create abstraction layer
2. Implement new service behind abstraction
3. Gradually migrate callers
4. Remove old implementation
5. Remove abstraction

---

## References

- **Books**
  - "Monolith to Microservices" by Sam Newman
  - "Building Evolutionary Architectures" by Neal Ford
  - "Clean Architecture" by Robert C. Martin

- **Patterns**
  - Modular Monolith Pattern
  - Layered Architecture Pattern
  - Strangler Fig Pattern

- **Standards**
  - ISO/IEC 42010 (Architecture Description)
  - Twelve-Factor App Methodology


