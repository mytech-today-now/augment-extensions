# Stock Trading System Architecture Example

## Overview

This document provides a comprehensive example of a stock trading system built with event-driven architecture, focusing on low latency, high throughput, and real-time processing.

---

## System Context

### Business Requirements

**Functional Requirements**
- Real-time market data streaming
- Order placement and execution
- Portfolio management and tracking
- Risk management and compliance
- Trade settlement and clearing
- Market analysis and alerts
- Audit trail and regulatory reporting

**Non-Functional Requirements**
- **Latency**: < 10ms order processing
- **Throughput**: 100,000+ orders/second
- **Availability**: 99.99% during trading hours
- **Data Integrity**: Zero data loss, exactly-once processing
- **Compliance**: SEC, FINRA regulations
- **Audit**: Complete trade history

### System Constraints

- Trading hours: 9:30 AM - 4:00 PM EST
- Market data updates: 1000+ updates/second per symbol
- Order types: Market, Limit, Stop, Stop-Limit
- Asset classes: Stocks, Options, Futures
- Regulatory reporting: T+1 settlement

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Trading Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Market Data Feed → Event Stream → Trading Engine            │
│         ↓                              ↓                      │
│  Price Updates      Order Events → Execution Engine          │
│         ↓                              ↓                      │
│  Analytics          Risk Check → Portfolio Service           │
│         ↓                              ↓                      │
│  Alerts             Settlement → Clearing Service            │
│                                        ↓                      │
│                     Audit Log → Compliance Service           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Event Flow

```
1. Market Data Events
   MarketDataReceived → PriceUpdated → AnalyticsCalculated → AlertTriggered

2. Order Lifecycle Events
   OrderPlaced → OrderValidated → RiskChecked → OrderExecuted → TradeSettled

3. Portfolio Events
   TradeExecuted → PositionUpdated → PortfolioRebalanced → ReportGenerated
```

---

## Service Architecture

### Core Services

**1. Market Data Service**
- Ingest real-time market data from exchanges
- Normalize data from multiple sources
- Publish price updates to event stream
- Handle 1M+ events/second

**2. Order Management Service**
- Receive and validate orders
- Publish order events
- Track order lifecycle
- Handle order modifications and cancellations

**3. Trading Engine**
- Match orders with market conditions
- Execute trades
- Publish execution events
- Sub-millisecond latency

**4. Risk Management Service**
- Real-time risk calculations
- Position limits enforcement
- Margin requirements
- Circuit breaker triggers

**5. Portfolio Service**
- Track positions and P&L
- Calculate portfolio metrics
- Handle corporate actions
- Generate performance reports

**6. Settlement Service**
- Trade confirmation
- Clearing and settlement (T+1)
- Cash management
- Reconciliation

**7. Compliance Service**
- Regulatory reporting
- Audit trail
- Trade surveillance
- Best execution analysis

---

## Technology Stack

### Event Streaming
- **Message Broker**: Apache Kafka (high throughput, low latency)
- **Stream Processing**: Apache Flink (real-time analytics)
- **Event Store**: Apache Kafka + Kafka Streams
- **Schema Registry**: Confluent Schema Registry (Avro)

### Data Storage
- **Time-Series DB**: InfluxDB (market data, metrics)
- **Relational DB**: PostgreSQL (orders, accounts, positions)
- **In-Memory Cache**: Redis (real-time prices, session data)
- **Event Store**: Kafka (event sourcing)
- **Analytics**: ClickHouse (OLAP queries)

### Services
- **Language**: Java (low latency), Go (high concurrency)
- **Framework**: Spring Boot, Micronaut
- **API**: gRPC (internal), REST (external)

### Infrastructure
- **Container Orchestration**: Kubernetes
- **Service Mesh**: Istio
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger
- **Logging**: ELK Stack

---

## Implementation Details

### 1. Event Schema Design

**Market Data Event**

```java
// Avro schema for market data events
public class MarketDataEvent {
    private String symbol;
    private String exchange;
    private BigDecimal bidPrice;
    private BigDecimal askPrice;
    private long bidSize;
    private long askSize;
    private BigDecimal lastPrice;
    private long volume;
    private long timestamp; // Nanosecond precision
    private String eventId;
}

// Avro schema for order events
public class OrderEvent {
    private String orderId;
    private String accountId;
    private String symbol;
    private OrderType orderType; // MARKET, LIMIT, STOP, STOP_LIMIT
    private OrderSide side; // BUY, SELL
    private long quantity;
    private BigDecimal price;
    private BigDecimal stopPrice;
    private OrderStatus status; // PENDING, VALIDATED, EXECUTED, REJECTED, CANCELLED
    private long timestamp;
    private String eventId;
}

// Trade execution event
public class TradeExecutedEvent {
    private String tradeId;
    private String orderId;
    private String symbol;
    private OrderSide side;
    private long quantity;
    private BigDecimal executionPrice;
    private BigDecimal commission;
    private long executionTime;
    private String venue;
    private String eventId;
}
```

### 2. Market Data Service Implementation

**Real-Time Price Streaming**

```java
// Market data ingestion service
@Service
public class MarketDataService {
    private final KafkaTemplate<String, MarketDataEvent> kafkaTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    @Autowired
    public MarketDataService(
        KafkaTemplate<String, MarketDataEvent> kafkaTemplate,
        RedisTemplate<String, String> redisTemplate
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.redisTemplate = redisTemplate;
    }

    // Ingest market data from exchange feed
    public void processMarketData(ExchangeFeed feed) {
        MarketDataEvent event = MarketDataEvent.builder()
            .symbol(feed.getSymbol())
            .exchange(feed.getExchange())
            .bidPrice(feed.getBidPrice())
            .askPrice(feed.getAskPrice())
            .bidSize(feed.getBidSize())
            .askSize(feed.getAskSize())
            .lastPrice(feed.getLastPrice())
            .volume(feed.getVolume())
            .timestamp(System.nanoTime())
            .eventId(UUID.randomUUID().toString())
            .build();

        // Publish to Kafka topic (partitioned by symbol)
        kafkaTemplate.send("market-data", event.getSymbol(), event);

        // Update Redis cache for real-time queries
        String key = "price:" + event.getSymbol();
        redisTemplate.opsForValue().set(key,
            objectMapper.writeValueAsString(event),
            Duration.ofSeconds(60)
        );
    }
}

// Kafka consumer for market data analytics
@Component
public class MarketDataAnalytics {

    @KafkaListener(topics = "market-data", groupId = "analytics-group")
    public void processMarketData(MarketDataEvent event) {
        // Calculate technical indicators
        calculateMovingAverage(event);
        calculateRSI(event);
        detectPriceAlerts(event);
    }

    private void calculateMovingAverage(MarketDataEvent event) {
        // Use Kafka Streams for windowed aggregations
        // Calculate SMA, EMA over 5min, 15min, 1hr windows
    }

    private void detectPriceAlerts(MarketDataEvent event) {
        // Check if price crosses user-defined thresholds
        // Publish alert events
    }
}
```

### 3. Order Management with Event Sourcing

**Order Service**

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final EventPublisher eventPublisher;
    private final RiskService riskService;

    @Transactional
    public Order placeOrder(PlaceOrderRequest request) {
        // Create order entity
        Order order = Order.builder()
            .orderId(UUID.randomUUID().toString())
            .accountId(request.getAccountId())
            .symbol(request.getSymbol())
            .orderType(request.getOrderType())
            .side(request.getSide())
            .quantity(request.getQuantity())
            .price(request.getPrice())
            .status(OrderStatus.PENDING)
            .createdAt(Instant.now())
            .build();

        // Persist order
        orderRepository.save(order);

        // Publish OrderPlaced event
        OrderEvent event = OrderEvent.fromOrder(order);
        eventPublisher.publish("order-events", event);

        return order;
    }
}

// Event-driven order processing pipeline
@Component
public class OrderProcessor {

    @KafkaListener(topics = "order-events", groupId = "order-processor")
    public void processOrderEvent(OrderEvent event) {
        switch (event.getStatus()) {
            case PENDING:
                validateOrder(event);
                break;
            case VALIDATED:
                checkRisk(event);
                break;
            case RISK_APPROVED:
                executeOrder(event);
                break;
            case EXECUTED:
                settleOrder(event);
                break;
        }
    }

    private void validateOrder(OrderEvent event) {
        // Validate order parameters
        // Check account exists and is active
        // Verify symbol is tradable

        if (isValid(event)) {
            event.setStatus(OrderStatus.VALIDATED);
            eventPublisher.publish("order-events", event);
        } else {
            event.setStatus(OrderStatus.REJECTED);
            event.setRejectionReason("Invalid order parameters");
            eventPublisher.publish("order-events", event);
        }
    }

    private void checkRisk(OrderEvent event) {
        // Check buying power
        // Verify position limits
        // Check concentration risk

        RiskCheckResult result = riskService.checkOrder(event);

        if (result.isApproved()) {
            event.setStatus(OrderStatus.RISK_APPROVED);
            eventPublisher.publish("order-events", event);
        } else {
            event.setStatus(OrderStatus.REJECTED);
            event.setRejectionReason(result.getReason());
            eventPublisher.publish("order-events", event);
        }
    }
}
```

### 4. Trading Engine with Low Latency

**High-Performance Order Execution**

```java
// Trading engine using Disruptor for ultra-low latency
public class TradingEngine {
    private final Disruptor<OrderCommand> disruptor;
    private final RingBuffer<OrderCommand> ringBuffer;

    public TradingEngine() {
        // Disruptor pattern for lock-free concurrency
        ThreadFactory threadFactory = new ThreadFactory() {
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r);
                t.setPriority(Thread.MAX_PRIORITY);
                return t;
            }
        };

        disruptor = new Disruptor<>(
            OrderCommand::new,
            1024 * 1024, // Ring buffer size (power of 2)
            threadFactory,
            ProducerType.MULTI,
            new YieldingWaitStrategy() // Low latency wait strategy
        );

        disruptor.handleEventsWith(new OrderExecutionHandler());
        disruptor.start();

        ringBuffer = disruptor.getRingBuffer();
    }

    public void submitOrder(OrderEvent order) {
        long sequence = ringBuffer.next();
        try {
            OrderCommand command = ringBuffer.get(sequence);
            command.setOrder(order);
        } finally {
            ringBuffer.publish(sequence);
        }
    }

    // Event handler for order execution
    private class OrderExecutionHandler implements EventHandler<OrderCommand> {
        @Override
        public void onEvent(OrderCommand command, long sequence, boolean endOfBatch) {
            OrderEvent order = command.getOrder();

            // Execute order matching logic
            TradeExecutedEvent trade = executeOrder(order);

            // Publish trade execution event
            if (trade != null) {
                eventPublisher.publish("trade-events", trade);
            }
        }

        private TradeExecutedEvent executeOrder(OrderEvent order) {
            // Match order with market data
            // For market orders: execute at current market price
            // For limit orders: check if price is met

            MarketDataEvent marketData = getLatestMarketData(order.getSymbol());

            BigDecimal executionPrice = calculateExecutionPrice(order, marketData);

            return TradeExecutedEvent.builder()
                .tradeId(UUID.randomUUID().toString())
                .orderId(order.getOrderId())
                .symbol(order.getSymbol())
                .side(order.getSide())
                .quantity(order.getQuantity())
                .executionPrice(executionPrice)
                .commission(calculateCommission(order))
                .executionTime(System.nanoTime())
                .venue("NASDAQ")
                .eventId(UUID.randomUUID().toString())
                .build();
        }
    }
}

```

### 5. Portfolio Service with Event Sourcing

**Position Tracking**

```java
@Service
public class PortfolioService {
    private final PositionRepository positionRepository;

    @KafkaListener(topics = "trade-events", groupId = "portfolio-group")
    public void handleTradeExecuted(TradeExecutedEvent event) {
        // Update position using event sourcing
        Position position = positionRepository.findByAccountAndSymbol(
            event.getAccountId(),
            event.getSymbol()
        ).orElse(new Position(event.getAccountId(), event.getSymbol()));

        // Apply trade to position
        if (event.getSide() == OrderSide.BUY) {
            position.addShares(event.getQuantity(), event.getExecutionPrice());
        } else {
            position.removeShares(event.getQuantity(), event.getExecutionPrice());
        }

        // Calculate realized P&L
        BigDecimal realizedPnL = position.calculateRealizedPnL(event);

        // Persist updated position
        positionRepository.save(position);

        // Publish position updated event
        PositionUpdatedEvent positionEvent = PositionUpdatedEvent.builder()
            .accountId(event.getAccountId())
            .symbol(event.getSymbol())
            .quantity(position.getQuantity())
            .averagePrice(position.getAveragePrice())
            .marketValue(position.getMarketValue())
            .unrealizedPnL(position.getUnrealizedPnL())
            .realizedPnL(realizedPnL)
            .timestamp(Instant.now())
            .build();

        eventPublisher.publish("position-events", positionEvent);
    }
}
```

---

## Event Streaming Configuration

### Kafka Topic Configuration

```yaml
# Kafka topics for trading system
topics:
  market-data:
    partitions: 100  # Partition by symbol for parallelism
    replication-factor: 3
    retention-ms: 86400000  # 24 hours
    compression-type: lz4

  order-events:
    partitions: 50
    replication-factor: 3
    retention-ms: 2592000000  # 30 days (audit trail)
    compression-type: snappy

  trade-events:
    partitions: 50
    replication-factor: 3
    retention-ms: 31536000000  # 1 year (regulatory)
    compression-type: snappy

  position-events:
    partitions: 20
    replication-factor: 3
    retention-ms: 31536000000  # 1 year

  risk-events:
    partitions: 10
    replication-factor: 3
    retention-ms: 2592000000  # 30 days
```

### Kafka Producer Configuration

```java
@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();

        // Broker configuration
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka:9092");

        // Serialization
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaAvroSerializer.class);
        config.put("schema.registry.url", "http://schema-registry:8081");

        // Performance tuning for low latency
        config.put(ProducerConfig.ACKS_CONFIG, "1"); // Leader acknowledgment only
        config.put(ProducerConfig.LINGER_MS_CONFIG, 0); // No batching delay
        config.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        config.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432); // 32MB
        config.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");

        // Idempotence for exactly-once semantics
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        return new DefaultKafkaProducerFactory<>(config);
    }
}
```

---

## Monitoring and Observability

### Key Metrics

**Latency Metrics**
```java
@Component
public class TradingMetrics {
    private final MeterRegistry meterRegistry;

    public void recordOrderLatency(long startTime) {
        long latency = System.nanoTime() - startTime;
        meterRegistry.timer("order.processing.latency")
            .record(latency, TimeUnit.NANOSECONDS);
    }

    public void recordExecutionLatency(long startTime) {
        long latency = System.nanoTime() - startTime;
        meterRegistry.timer("order.execution.latency")
            .record(latency, TimeUnit.NANOSECONDS);
    }
}
```

**Prometheus Metrics**
- `order_processing_latency_seconds` - P50, P95, P99 latency
- `order_throughput_total` - Orders processed per second
- `trade_execution_latency_seconds` - Execution latency
- `market_data_lag_seconds` - Market data freshness
- `kafka_consumer_lag` - Event processing lag
- `risk_check_duration_seconds` - Risk check performance

---

## Scalability and Performance

### Performance Optimizations

**1. Partitioning Strategy**
- Partition market data by symbol (100 partitions)
- Partition orders by account ID (50 partitions)
- Enables parallel processing

**2. In-Memory Caching**
```java
// Redis cache for hot market data
@Cacheable(value = "market-data", key = "#symbol")
public MarketDataEvent getLatestPrice(String symbol) {
    return marketDataRepository.findLatestBySymbol(symbol);
}
```

**3. Database Optimization**
- Use time-series database (InfluxDB) for market data
- Partition PostgreSQL tables by date
- Read replicas for reporting queries
- Connection pooling (HikariCP)

**4. Network Optimization**
- Co-locate services in same availability zone
- Use gRPC for inter-service communication
- Enable TCP_NODELAY for low latency

### Scalability Metrics

**Before Optimization**
- Order processing latency: 50ms (P99)
- Throughput: 10,000 orders/second
- Market data lag: 500ms

**After Optimization**
- Order processing latency: 8ms (P99)
- Throughput: 100,000 orders/second
- Market data lag: 50ms

---

## Compliance and Audit

### Regulatory Requirements

**SEC Rule 606 - Order Routing**
- Track order routing decisions
- Report execution quality
- Store for 3 years

**FINRA Rule 4511 - Books and Records**
- Maintain complete audit trail
- Immutable event log (Kafka)
- Retention: 6 years

**Implementation**

```java
@Service
public class AuditService {

    @KafkaListener(topics = {"order-events", "trade-events"}, groupId = "audit-group")
    public void auditEvent(Object event) {
        // Store all events in immutable audit log
        AuditRecord record = AuditRecord.builder()
            .eventType(event.getClass().getSimpleName())
            .eventData(objectMapper.writeValueAsString(event))
            .timestamp(Instant.now())
            .userId(SecurityContextHolder.getContext().getAuthentication().getName())
            .build();

        auditRepository.save(record);
    }

    // Generate regulatory reports
    public Report generateRule606Report(LocalDate startDate, LocalDate endDate) {
        // Query audit log for order routing data
        // Aggregate execution quality metrics
        // Generate report in required format
    }
}
```

---

## Key Takeaways

### Architecture Decisions

1. **Event-Driven Architecture**: Enables loose coupling, scalability, and real-time processing
2. **Kafka for Event Streaming**: High throughput, low latency, durable event log
3. **Event Sourcing**: Complete audit trail, regulatory compliance
4. **LMAX Disruptor**: Ultra-low latency order execution (< 10ms)
5. **Redis Caching**: Fast access to real-time market data
6. **Time-Series Database**: Efficient storage and querying of market data

### Trade-offs

**Benefits**
- ✅ Low latency (< 10ms order processing)
- ✅ High throughput (100K+ orders/second)
- ✅ Complete audit trail (regulatory compliance)
- ✅ Scalable (horizontal scaling of consumers)
- ✅ Fault tolerant (Kafka replication)
- ✅ Real-time analytics (Kafka Streams)

**Challenges**
- ❌ Eventual consistency (not suitable for all use cases)
- ❌ Complex debugging (distributed event flows)
- ❌ Event schema evolution (requires careful planning)
- ❌ Operational complexity (Kafka cluster management)
- ❌ Higher infrastructure costs

### Lessons Learned

1. **Partition by symbol**: Enables parallel processing of market data
2. **Use Avro schemas**: Ensures backward compatibility
3. **Monitor consumer lag**: Critical for detecting processing delays
4. **Implement circuit breakers**: Prevents cascade failures
5. **Use exactly-once semantics**: Ensures data integrity
6. **Optimize for P99 latency**: Not just average latency

---

## References

- **Event-Driven Architecture**: Martin Fowler's Event Sourcing pattern
- **LMAX Disruptor**: High-performance inter-thread messaging
- **Apache Kafka**: Distributed event streaming platform
- **SEC Regulations**: Rule 606, Rule 613 (CAT)
- **FINRA Rules**: Rule 4511 (Books and Records)

---

**Total Lines**: 650+
