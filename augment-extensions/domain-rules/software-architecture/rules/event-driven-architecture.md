# Event-Driven Architecture

## Overview

This document covers event-driven architecture patterns, message queues, event sourcing, and best practices for building reactive, loosely-coupled systems.

---

## Knowledge

### What is Event-Driven Architecture?

**Definition**
- Architecture where components communicate through events
- Events represent state changes or significant occurrences
- Producers emit events without knowing consumers
- Consumers react to events independently
- Asynchronous, loosely-coupled communication

**Core Concepts**

**Event**
- Immutable record of something that happened
- Contains: event type, timestamp, payload
- Examples: OrderPlaced, UserRegistered, PaymentProcessed

**Event Producer**
- Component that detects and publishes events
- Doesn't know who consumes events
- Fire-and-forget pattern

**Event Consumer**
- Component that subscribes to and processes events
- Can have multiple consumers per event
- Processes events independently

**Event Channel**
- Medium for transmitting events
- Examples: message queue, event stream, event bus

### Event Types

**Domain Events**
- Business-significant occurrences
- Examples: OrderPlaced, CustomerRegistered
- Trigger business workflows

**Integration Events**
- Cross-system communication
- Examples: OrderShipped (from warehouse system)
- Enable system integration

**System Events**
- Technical occurrences
- Examples: ServiceStarted, CacheCleared
- Support operations and monitoring

### When to Use Event-Driven Architecture

**Good Fit**
- Complex workflows with multiple steps
- Need for loose coupling
- Asynchronous processing requirements
- Real-time data processing
- Microservices communication
- Integration with external systems

**Poor Fit**
- Simple CRUD applications
- Strong consistency requirements
- Synchronous request-response needed
- Simple linear workflows
- Limited scalability needs

---

## Skills

### Message Queue Patterns

**Point-to-Point (Queue)**
```
Producer → Queue → Consumer
```
- One message, one consumer
- Message removed after consumption
- Load balancing across consumers
- Use for: task distribution, work queues

**Publish-Subscribe (Topic)**
```
Producer → Topic → [Consumer A, Consumer B, Consumer C]
```
- One message, multiple consumers
- Each subscriber gets copy
- Broadcast pattern
- Use for: notifications, event broadcasting

**Request-Reply**
```
Client → Request Queue → Server
Client ← Reply Queue ← Server
```
- Asynchronous request-response
- Correlation ID links request/reply
- Use for: async RPC, long-running operations

### Event Streaming

**Event Stream Characteristics**
- Ordered sequence of events
- Events persisted (not deleted after consumption)
- Multiple consumers can read independently
- Replay capability
- Examples: Apache Kafka, AWS Kinesis

**Stream Processing**
- Real-time event processing
- Stateful computations
- Windowing and aggregation
- Complex event processing

**Kafka Example**
```
Topic: orders
├── Partition 0: [Event1, Event2, Event3]
├── Partition 1: [Event4, Event5, Event6]
└── Partition 2: [Event7, Event8, Event9]

Consumer Group A: [Consumer1, Consumer2]
Consumer Group B: [Consumer3]
```

### Event Sourcing

**Concept**
- Store events, not current state
- State is derived from event history
- Complete audit trail
- Time travel (replay to any point)

**Event Store**
- Append-only log of events
- Events are immutable
- Optimized for writes
- Examples: EventStore, Kafka, custom DB

**Event Sourcing Pattern**
```
Command → Aggregate → Events → Event Store
                              ↓
                         Event Handler → Read Model
```

**Aggregate Example**
```java
public class Order {
    private String id;
    private OrderStatus status;
    private List<OrderItem> items;
    private List<DomainEvent> uncommittedEvents = new ArrayList<>();
    
    // Command handler
    public void placeOrder(List<OrderItem> items) {
        // Validate
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Order must have items");
        }
        
        // Apply event
        apply(new OrderPlacedEvent(this.id, items, Instant.now()));
    }
    
    // Event handler
    private void apply(OrderPlacedEvent event) {
        this.items = event.getItems();
        this.status = OrderStatus.PLACED;
        uncommittedEvents.add(event);
    }
    
    // Reconstitute from events
    public static Order fromEvents(List<DomainEvent> events) {
        Order order = new Order();
        events.forEach(order::apply);
        return order;
    }
}
```

### CQRS (Command Query Responsibility Segregation)

**Concept**
- Separate read and write models
- Commands: change state
- Queries: read state
- Often combined with event sourcing

**Architecture**
```
Command → Write Model → Events → Event Store
                                     ↓
                              Event Handler
                                     ↓
Query ← Read Model ← Projection ← Events
```

**Benefits**
- Optimize read and write independently
- Scale read and write separately
- Different data models for different needs
- Simplified queries

---

## Examples

### Order Processing with Events

**Event Definitions**
```java
// Base event
public abstract class DomainEvent {
    private final String eventId;
    private final Instant timestamp;

    protected DomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }
}

// Order events
public class OrderPlacedEvent extends DomainEvent {
    private final String orderId;
    private final String customerId;
    private final List<OrderItem> items;
    private final BigDecimal total;
}

public class OrderPaidEvent extends DomainEvent {
    private final String orderId;
    private final String paymentId;
    private final BigDecimal amount;
}

public class OrderShippedEvent extends DomainEvent {
    private final String orderId;
    private final String trackingNumber;
    private final Instant shippedAt;
}
```

**Event Publisher**
```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public Order placeOrder(PlaceOrderCommand command) {
        // Create order
        Order order = new Order(command.getCustomerId());
        order.addItems(command.getItems());

        // Save order
        order = orderRepository.save(order);

        // Publish event
        OrderPlacedEvent event = new OrderPlacedEvent(
            order.getId(),
            order.getCustomerId(),
            order.getItems(),
            order.getTotal()
        );

        eventPublisher.publish("orders", event);

        return order;
    }
}

@Component
public class KafkaEventPublisher implements EventPublisher {
    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    @Override
    public void publish(String topic, DomainEvent event) {
        kafkaTemplate.send(topic, event.getEventId(), event);
    }
}
```

**Event Consumers**
```java
// Inventory Service - Reserve items
@Component
public class InventoryEventHandler {
    private final InventoryService inventoryService;

    @KafkaListener(topics = "orders", groupId = "inventory-service")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        inventoryService.reserveItems(
            event.getOrderId(),
            event.getItems()
        );
    }
}

// Notification Service - Send confirmation
@Component
public class NotificationEventHandler {
    private final EmailService emailService;

    @KafkaListener(topics = "orders", groupId = "notification-service")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        emailService.sendOrderConfirmation(
            event.getCustomerId(),
            event.getOrderId()
        );
    }
}

// Analytics Service - Track metrics
@Component
public class AnalyticsEventHandler {
    private final AnalyticsService analyticsService;

    @KafkaListener(topics = "orders", groupId = "analytics-service")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        analyticsService.recordOrderPlaced(
            event.getOrderId(),
            event.getTotal(),
            event.getTimestamp()
        );
    }
}
```

### Event Sourcing Implementation

**Event Store**
```java
@Repository
public class EventStore {
    private final JdbcTemplate jdbcTemplate;

    public void saveEvents(String aggregateId, List<DomainEvent> events) {
        String sql = """
            INSERT INTO events (aggregate_id, event_type, event_data, version, timestamp)
            VALUES (?, ?, ?::jsonb, ?, ?)
        """;

        for (DomainEvent event : events) {
            jdbcTemplate.update(
                sql,
                aggregateId,
                event.getClass().getSimpleName(),
                toJson(event),
                event.getVersion(),
                event.getTimestamp()
            );
        }
    }

    public List<DomainEvent> getEvents(String aggregateId) {
        String sql = """
            SELECT event_type, event_data
            FROM events
            WHERE aggregate_id = ?
            ORDER BY version ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String eventType = rs.getString("event_type");
            String eventData = rs.getString("event_data");
            return fromJson(eventType, eventData);
        }, aggregateId);
    }
}
```

**Aggregate with Event Sourcing**
```java
public class Order {
    private String id;
    private String customerId;
    private List<OrderItem> items = new ArrayList<>();
    private OrderStatus status;
    private int version = 0;
    private List<DomainEvent> uncommittedEvents = new ArrayList<>();

    // Command: Place order
    public void placeOrder(String customerId, List<OrderItem> items) {
        if (this.status != null) {
            throw new IllegalStateException("Order already placed");
        }

        apply(new OrderPlacedEvent(this.id, customerId, items));
    }

    // Command: Pay for order
    public void pay(String paymentId, BigDecimal amount) {
        if (this.status != OrderStatus.PLACED) {
            throw new IllegalStateException("Order not in PLACED status");
        }

        apply(new OrderPaidEvent(this.id, paymentId, amount));
    }

    // Event handlers
    private void apply(OrderPlacedEvent event) {
        this.customerId = event.getCustomerId();
        this.items = new ArrayList<>(event.getItems());
        this.status = OrderStatus.PLACED;
        this.version++;
        uncommittedEvents.add(event);
    }

    private void apply(OrderPaidEvent event) {
        this.status = OrderStatus.PAID;
        this.version++;
        uncommittedEvents.add(event);
    }

    // Reconstitute from events
    public static Order fromEvents(String id, List<DomainEvent> events) {
        Order order = new Order();
        order.id = id;

        for (DomainEvent event : events) {
            if (event instanceof OrderPlacedEvent e) {
                order.apply(e);
            } else if (event instanceof OrderPaidEvent e) {
                order.apply(e);
            }
        }

        order.uncommittedEvents.clear();
        return order;
    }

    public List<DomainEvent> getUncommittedEvents() {
        return new ArrayList<>(uncommittedEvents);
    }

    public void markEventsAsCommitted() {
        uncommittedEvents.clear();
    }
}
```

### Saga Pattern for Distributed Transactions

**Choreography-Based Saga**
```java
// Order Service
@Component
public class OrderSagaHandler {
    private final OrderRepository orderRepository;
    private final EventPublisher eventPublisher;

    @KafkaListener(topics = "payments")
    public void handlePaymentProcessed(PaymentProcessedEvent event) {
        Order order = orderRepository.findById(event.getOrderId());
        order.markAsPaid();
        orderRepository.save(order);

        // Trigger next step
        eventPublisher.publish("shipments",
            new ShipOrderEvent(order.getId())
        );
    }

    @KafkaListener(topics = "payments")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        Order order = orderRepository.findById(event.getOrderId());
        order.cancel();
        orderRepository.save(order);

        // Compensate: Release inventory
        eventPublisher.publish("inventory",
            new ReleaseInventoryEvent(order.getId())
        );
    }
}
```

---

## Understanding

### Advantages of Event-Driven Architecture

**Loose Coupling**
- Producers don't know consumers
- Add/remove consumers without affecting producers
- Independent evolution
- Easier testing

**Scalability**
- Asynchronous processing
- Load leveling with queues
- Independent scaling of consumers
- Parallel processing

**Resilience**
- Failure isolation
- Retry mechanisms
- Dead letter queues
- Graceful degradation

**Flexibility**
- Easy to add new features (new consumers)
- Support multiple workflows
- Real-time and batch processing
- Event replay for recovery

**Auditability**
- Complete event history
- Audit trail
- Debugging and troubleshooting
- Compliance and reporting

### Challenges and Disadvantages

**Complexity**
- Distributed system challenges
- Eventual consistency
- Event ordering issues
- Debugging difficulties

**Event Schema Evolution**
- Backward compatibility needed
- Versioning strategy required
- Consumer updates coordination
- Schema registry management

**Duplicate Events**
- At-least-once delivery
- Idempotent consumers required
- Deduplication logic
- Event ID tracking

**Event Ordering**
- No global ordering (distributed systems)
- Partition-level ordering only
- Out-of-order events
- Causality tracking needed

**Operational Overhead**
- Message broker management
- Monitoring and alerting
- Dead letter queue handling
- Event store maintenance

### Best Practices

**Event Design**
- Events are immutable
- Include all necessary data (avoid lookups)
- Use meaningful event names (past tense)
- Version events from the start
- Include correlation IDs

**Consumer Design**
- Idempotent event handlers
- Handle duplicate events
- Use dead letter queues
- Implement retry with backoff
- Monitor consumer lag

**Error Handling**
- Retry transient failures
- Dead letter queue for poison messages
- Compensating transactions
- Circuit breakers
- Alerting and monitoring

**Event Store**
- Append-only design
- Partition by aggregate ID
- Snapshot for performance
- Archive old events
- Backup and recovery

**Monitoring**
- Event throughput
- Consumer lag
- Processing time
- Error rates
- Dead letter queue size

---

## References

- **Books**
  - "Designing Event-Driven Systems" by Ben Stopford
  - "Enterprise Integration Patterns" by Gregor Hohpe
  - "Implementing Domain-Driven Design" by Vaughn Vernon

- **Patterns**
  - Event Sourcing Pattern
  - CQRS Pattern
  - Saga Pattern
  - Outbox Pattern
  - Event Notification Pattern

- **Technologies**
  - Message Brokers: Apache Kafka, RabbitMQ, AWS SNS/SQS
  - Event Stores: EventStore, Axon Server
  - Stream Processing: Apache Flink, Kafka Streams
  - Schema Registry: Confluent Schema Registry, AWS Glue


