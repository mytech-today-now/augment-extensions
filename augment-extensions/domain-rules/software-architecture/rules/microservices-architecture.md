# Microservices Architecture

## Overview

This document covers microservices architecture patterns, service discovery, API gateways, and best practices for building distributed systems.

---

## Knowledge

### What is Microservices Architecture?

**Definition**
- Collection of small, autonomous services
- Each service runs in its own process
- Communicates via lightweight protocols (HTTP, messaging)
- Independently deployable and scalable
- Organized around business capabilities

**Core Principles**
- Single Responsibility: Each service does one thing well
- Autonomy: Services are independent
- Decentralization: Distributed governance and data
- Resilience: Failure isolation
- Observable: Comprehensive monitoring

**Characteristics**
- Polyglot persistence (different databases per service)
- Technology diversity (different tech stacks)
- Decentralized data management
- Infrastructure automation
- Design for failure

### When to Use Microservices

**Good Fit**
- Large, complex domains
- Multiple teams (> 15 developers)
- Need for independent scaling
- Frequent deployments
- Technology diversity requirements
- High availability requirements

**Poor Fit**
- Small applications
- Simple domains
- Small teams (< 5 developers)
- Limited DevOps maturity
- Tight latency requirements
- Strong consistency needs

---

## Skills

### Service Decomposition

**Decomposition Strategies**

1. **By Business Capability**
   - User Management Service
   - Order Service
   - Payment Service
   - Inventory Service
   - Notification Service

2. **By Subdomain (DDD)**
   - Core Domain: Order Processing
   - Supporting: User Authentication
   - Generic: Email Notifications

3. **By Use Case**
   - Place Order Service
   - Track Shipment Service
   - Process Return Service

**Service Boundaries**
- Bounded contexts from Domain-Driven Design
- High cohesion within service
- Low coupling between services
- Independent data ownership

**Service Size Guidelines**
- Team can maintain 5-10 services
- Service can be rewritten in 2 weeks
- Single business capability
- 100-1000 lines of code (guideline, not rule)

### API Gateway Pattern

**Purpose**
- Single entry point for clients
- Request routing to services
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- Protocol translation

**Implementation**
```
Client → API Gateway → [Service A, Service B, Service C]
```

**Features**
- Reverse proxy
- Load balancing
- Caching
- Request aggregation
- Circuit breaking

**Popular Tools**
- Kong
- AWS API Gateway
- Azure API Management
- Nginx
- Traefik

### Service Discovery

**Purpose**
- Dynamic service location
- Health checking
- Load balancing
- Failover

**Client-Side Discovery**
```
Client → Service Registry → Service Instance
```
- Client queries registry
- Client selects instance
- Client makes request
- Examples: Netflix Eureka, Consul

**Server-Side Discovery**
```
Client → Load Balancer → Service Registry → Service Instance
```
- Load balancer queries registry
- Load balancer routes request
- Examples: AWS ELB, Kubernetes Service

**Service Registry**
- Maintains service locations
- Health checks
- Dynamic updates
- Examples: Consul, etcd, ZooKeeper

### Inter-Service Communication

**Synchronous Communication**

**REST APIs**
```http
GET /api/orders/123
POST /api/orders
PUT /api/orders/123
DELETE /api/orders/123
```

**gRPC**
```protobuf
service OrderService {
  rpc GetOrder(OrderRequest) returns (OrderResponse);
  rpc CreateOrder(CreateOrderRequest) returns (OrderResponse);
}
```

**Asynchronous Communication**

**Message Queues**
- Point-to-point communication
- Guaranteed delivery
- Examples: RabbitMQ, AWS SQS

**Event Streaming**
- Pub/sub pattern
- Event sourcing
- Examples: Apache Kafka, AWS Kinesis

**Message Patterns**
- Command: Request action
- Event: Notify of occurrence
- Query: Request data

### Data Management

**Database per Service**
- Each service owns its data
- No direct database access between services
- Data duplication acceptable
- Eventual consistency

**Data Consistency Patterns**

**Saga Pattern**
- Distributed transaction alternative
- Sequence of local transactions
- Compensating transactions for rollback

**Event Sourcing**
- Store events, not state
- Rebuild state from events
- Complete audit trail

**CQRS (Command Query Responsibility Segregation)**
- Separate read and write models
- Optimize each independently
- Event-driven synchronization

---

## Examples

### E-Commerce Microservices Architecture

**Service Inventory**
```
┌─────────────────┐
│   API Gateway   │
└────────┬────────┘
         │
    ┌────┴────┬────────┬─────────┬──────────┐
    │         │        │         │          │
┌───▼───┐ ┌──▼──┐ ┌───▼────┐ ┌──▼─────┐ ┌─▼────────┐
│ User  │ │Order│ │Product │ │Payment │ │Inventory │
│Service│ │Svc  │ │Service │ │Service │ │ Service  │
└───┬───┘ └──┬──┘ └───┬────┘ └──┬─────┘ └─┬────────┘
    │        │        │         │          │
┌───▼────────▼────────▼─────────▼──────────▼───┐
│            Message Bus (Kafka)                │
└───────────────────────────────────────────────┘
```

**Order Service Example**
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final EventPublisher eventPublisher;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
        @RequestBody CreateOrderRequest request
    ) {
        // Create order
        Order order = orderService.createOrder(request);

        // Publish event
        eventPublisher.publish(new OrderCreatedEvent(
            order.getId(),
            order.getCustomerId(),
            order.getItems(),
            order.getTotal()
        ));

        return ResponseEntity.ok(
            OrderResponse.from(order)
        );
    }
}

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductServiceClient productClient;
    private final InventoryServiceClient inventoryClient;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // Validate products via Product Service
        List<Product> products = productClient.getProducts(
            request.getProductIds()
        );

        // Check inventory via Inventory Service
        boolean available = inventoryClient.checkAvailability(
            request.getProductIds(),
            request.getQuantities()
        );

        if (!available) {
            throw new InsufficientInventoryException();
        }

        // Create order
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setItems(createOrderItems(products, request));
        order.setTotal(calculateTotal(order.getItems()));
        order.setStatus(OrderStatus.PENDING);

        return orderRepository.save(order);
    }
}
```

**Service Client with Circuit Breaker**
```java
@Component
public class ProductServiceClient {
    private final RestTemplate restTemplate;
    private final CircuitBreaker circuitBreaker;

    public List<Product> getProducts(List<String> productIds) {
        return circuitBreaker.executeSupplier(() -> {
            String url = "http://product-service/api/products";
            return restTemplate.postForObject(
                url,
                productIds,
                ProductListResponse.class
            ).getProducts();
        });
    }
}
```

**Event Handler Example**
```java
@Component
public class OrderEventHandler {
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    @KafkaListener(topics = "order-created")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Reserve inventory
        inventoryService.reserveItems(
            event.getOrderId(),
            event.getItems()
        );

        // Send notification
        notificationService.sendOrderConfirmation(
            event.getCustomerId(),
            event.getOrderId()
        );
    }
}
```

### API Gateway Configuration

**Kong Gateway Example**
```yaml
services:
  - name: order-service
    url: http://order-service:8080
    routes:
      - name: orders
        paths:
          - /api/orders
        methods:
          - GET
          - POST
          - PUT
          - DELETE
    plugins:
      - name: rate-limiting
        config:
          minute: 100
      - name: jwt
      - name: cors

  - name: product-service
    url: http://product-service:8080
    routes:
      - name: products
        paths:
          - /api/products
```

---

## Understanding

### Advantages of Microservices

**Independent Deployment**
- Deploy services independently
- Faster release cycles
- Reduced deployment risk
- Parallel development

**Independent Scaling**
- Scale services based on demand
- Resource optimization
- Cost efficiency
- Performance tuning per service

**Technology Diversity**
- Choose best tool for each service
- Experiment with new technologies
- Gradual technology migration
- Polyglot programming

**Fault Isolation**
- Service failures don't cascade
- Graceful degradation
- Higher availability
- Resilience patterns

**Team Autonomy**
- Teams own services end-to-end
- Faster decision making
- Clear ownership
- Reduced coordination

### Challenges and Disadvantages

**Distributed System Complexity**
- Network latency
- Partial failures
- Distributed transactions
- Data consistency

**Operational Overhead**
- More services to deploy
- More infrastructure to manage
- Complex monitoring
- Debugging difficulties

**Data Management**
- No ACID transactions across services
- Eventual consistency
- Data duplication
- Complex queries

**Testing Complexity**
- Integration testing harder
- End-to-end testing complex
- Test environment management
- Contract testing needed

**Network Overhead**
- Inter-service communication cost
- Serialization/deserialization
- Higher latency
- Bandwidth consumption

### Best Practices

**Design Principles**
- Design for failure (circuit breakers, retries, timeouts)
- Decentralize everything (data, governance, decisions)
- Automate everything (deployment, testing, monitoring)
- Isolate failures (bulkheads, rate limiting)
- Keep services small and focused

**Communication**
- Use asynchronous messaging when possible
- Implement circuit breakers
- Set timeouts on all calls
- Use idempotent operations
- Version APIs

**Data Management**
- Database per service
- Use sagas for distributed transactions
- Implement event sourcing for audit trails
- Use CQRS for read/write optimization
- Accept eventual consistency

**Observability**
- Distributed tracing (Jaeger, Zipkin)
- Centralized logging (ELK, Splunk)
- Metrics and monitoring (Prometheus, Grafana)
- Health checks
- Service mesh (Istio, Linkerd)

**Security**
- API Gateway for authentication
- Service-to-service authentication (mTLS)
- Secrets management (Vault, AWS Secrets Manager)
- Network segmentation
- Rate limiting and throttling

---

## References

- **Books**
  - "Building Microservices" by Sam Newman
  - "Microservices Patterns" by Chris Richardson
  - "Release It!" by Michael Nygard

- **Patterns**
  - API Gateway Pattern
  - Service Discovery Pattern
  - Circuit Breaker Pattern
  - Saga Pattern
  - CQRS Pattern
  - Event Sourcing Pattern

- **Tools**
  - Service Mesh: Istio, Linkerd, Consul Connect
  - API Gateway: Kong, AWS API Gateway, Traefik
  - Service Discovery: Consul, etcd, Eureka
  - Messaging: Kafka, RabbitMQ, AWS SQS/SNS
  - Monitoring: Prometheus, Grafana, Datadog


