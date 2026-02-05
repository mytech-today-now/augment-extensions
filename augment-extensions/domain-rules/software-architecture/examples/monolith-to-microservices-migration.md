# Monolith to Microservices Migration Example

## Overview

This document provides a comprehensive example of migrating a monolithic e-commerce application to microservices architecture using the Strangler Fig Pattern.

---

## Initial State: Monolithic Application

### System Context

**Current Architecture**
- Single Java Spring Boot application
- 500,000 lines of code
- 50 developers across 5 teams
- Shared PostgreSQL database
- Deployment takes 2 hours
- Downtime required for deployments

**Pain Points**
- Long deployment cycles (weekly releases)
- Difficult to scale individual components
- Technology lock-in (Java only)
- Team coordination overhead
- Database bottlenecks
- Tight coupling between modules
- Difficult to onboard new developers

**Business Drivers for Migration**
- Need for faster time-to-market
- Independent team autonomy
- Technology diversity (Node.js, Python for ML)
- Better scalability
- Improved fault isolation

---

## Target State: Microservices Architecture

### Service Decomposition

**Identified Bounded Contexts (Domain-Driven Design)**

```
Monolith (500K LOC)
├── User Management (50K LOC) → User Service
├── Product Catalog (100K LOC) → Product Service + Search Service
├── Shopping Cart (30K LOC) → Cart Service
├── Order Processing (150K LOC) → Order Service + Fulfillment Service
├── Payment (40K LOC) → Payment Service
├── Inventory (60K LOC) → Inventory Service
├── Shipping (50K LOC) → Shipping Service
└── Notifications (20K LOC) → Notification Service
```

**Service Prioritization**

1. **Priority 1: Product Catalog** (Low risk, high value)
   - Read-heavy, low coupling
   - Can be extracted with minimal impact
   - Immediate performance benefits

2. **Priority 2: User Management** (Foundation)
   - Authentication needed by all services
   - Well-defined boundaries
   - Critical for security

3. **Priority 3: Order Processing** (High value)
   - Complex business logic
   - High transaction volume
   - Needs independent scaling

4. **Priority 4: Payment** (Compliance)
   - PCI DSS compliance requirements
   - Needs isolation for security
   - Third-party integrations

5. **Priority 5: Remaining Services**
   - Cart, Inventory, Shipping, Notifications

---

## Migration Strategy: Strangler Fig Pattern

### Phase 1: Assessment and Planning (Month 1-2)

**1. Dependency Analysis**

```bash
# Use tools to analyze dependencies
mvn dependency:tree
jdepend -file src/
```

**Dependency Graph**
```
User Management
  ↓
Order Processing → Payment
  ↓              ↓
Inventory    Shipping
  ↓
Product Catalog
```

**2. Data Analysis**

```sql
-- Identify shared tables
SELECT table_name, COUNT(DISTINCT module) as module_count
FROM table_usage
GROUP BY table_name
HAVING COUNT(DISTINCT module) > 1;

-- Results:
-- users: 8 modules (high coupling!)
-- products: 5 modules
-- orders: 4 modules
```

**3. Team Structure**

```
Before:
- 5 teams, each working on multiple modules
- Shared codebase, merge conflicts

After:
- 8 teams, each owning 1-2 services
- Independent repositories
- Clear ownership
```

### Phase 2: Infrastructure Setup (Month 3)

**1. API Gateway**

```yaml
# kong.yml
services:
  - name: legacy-monolith
    url: http://monolith:8080
    routes:
      - name: default-route
        paths:
          - /
        strip_path: false

  - name: product-service

---

## Phase 3: Extract First Service - Product Catalog (Month 4-5)

### Step 1: Create New Microservice

**Product Service (Node.js/TypeScript)**

```typescript
// product-service/src/domain/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  inventory: number;
  images: string[];
}

// product-service/src/application/product.service.ts
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly cache: CacheService,
    private readonly eventBus: EventBus
  ) {}

  async getProduct(productId: string): Promise<Product> {
    // Check cache first (new optimization)
    const cached = await this.cache.get(`product:${productId}`);
    if (cached) return cached;

    // Fetch from new database
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Cache for 1 hour
    await this.cache.set(`product:${productId}`, product, 3600);
    return product;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.productRepo.update(productId, updates);

    // Invalidate cache
    await this.cache.delete(`product:${productId}`);

    // Publish event for other services
    await this.eventBus.publish('product.updated', {
      productId,
      updates,
      timestamp: new Date()
    });

    return product;
  }
}
```

### Step 2: Create Facade in Monolith

**Strangler Fig Facade Pattern**

```java
// monolith/src/main/java/com/ecommerce/product/ProductFacade.java
@Service
public class ProductFacade {
    private final LegacyProductService legacyService;
    private final ProductServiceClient newServiceClient;
    private final FeatureFlagService featureFlags;
    private final MetricsService metrics;

    public Product getProduct(String productId) {
        boolean useNewService = featureFlags.isEnabled("new-product-service", productId);

        long startTime = System.currentTimeMillis();
        try {
            Product product;
            if (useNewService) {
                product = newServiceClient.getProduct(productId);
                metrics.recordServiceCall("product-service-new", System.currentTimeMillis() - startTime);
            } else {
                product = legacyService.getProduct(productId);
                metrics.recordServiceCall("product-service-legacy", System.currentTimeMillis() - startTime);
            }
            return product;
        } catch (Exception e) {
            // Fallback to legacy on error
            if (useNewService) {
                logger.error("New service failed, falling back to legacy", e);
                return legacyService.getProduct(productId);
            }
            throw e;
        }
    }
}

// Feature flag configuration
@Configuration
public class FeatureFlagConfig {
    @Bean
    public FeatureFlagService featureFlagService() {
        return new FeatureFlagService()
            .addFlag("new-product-service", new PercentageRollout(0)); // Start at 0%
    }
}
```

### Step 3: Data Migration Strategy

**Dual-Write Pattern**

```java
// monolith/src/main/java/com/ecommerce/product/ProductService.java
@Service
public class ProductService {
    private final ProductRepository legacyRepo;
    private final ProductServiceClient newServiceClient;
    private final EventPublisher eventPublisher;

    @Transactional
    public Product updateProduct(String productId, ProductUpdate update) {
        // 1. Write to legacy database (source of truth during migration)
        Product product = legacyRepo.update(productId, update);

        // 2. Async write to new service
        CompletableFuture.runAsync(() -> {
            try {
                newServiceClient.updateProduct(productId, update);
            } catch (Exception e) {
                logger.error("Failed to sync to new service", e);
                // Publish event for retry
                eventPublisher.publish("product.sync.failed", productId);
            }
        });

        return product;
    }
}
```

**Data Synchronization Job**

```java
// monolith/src/main/java/com/ecommerce/migration/DataSyncJob.java
@Component
public class ProductDataSyncJob {

    @Scheduled(cron = "0 0 2 * * *") // Run at 2 AM daily
    public void syncProducts() {
        logger.info("Starting product data sync");

        int batchSize = 1000;
        int offset = 0;
        int synced = 0;

        while (true) {
            List<Product> products = legacyRepo.findAll(offset, batchSize);
            if (products.isEmpty()) break;

            for (Product product : products) {
                try {
                    newServiceClient.upsertProduct(product);
                    synced++;
                } catch (Exception e) {
                    logger.error("Failed to sync product: " + product.getId(), e);
                }
            }

            offset += batchSize;
            logger.info("Synced {} products", synced);
        }

        logger.info("Product data sync completed. Total synced: {}", synced);
    }
}
```

### Step 4: Gradual Traffic Migration

**Week-by-Week Rollout**

```java
// Week 1: 5% traffic
featureFlagService.updateFlag("new-product-service", new PercentageRollout(5));

// Week 2: Monitor metrics, increase to 25%
featureFlagService.updateFlag("new-product-service", new PercentageRollout(25));

// Week 3: 50% traffic
featureFlagService.updateFlag("new-product-service", new PercentageRollout(50));

// Week 4: 100% traffic
featureFlagService.updateFlag("new-product-service", new PercentageRollout(100));
```

**Monitoring Dashboard**

```typescript
// Grafana dashboard queries
// Error rate comparison
sum(rate(http_requests_total{service="product-service-new",status=~"5.."}[5m])) /
sum(rate(http_requests_total{service="product-service-new"}[5m]))

vs

sum(rate(http_requests_total{service="product-service-legacy",status=~"5.."}[5m])) /
sum(rate(http_requests_total{service="product-service-legacy"}[5m]))

// Latency comparison (P95)
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket{service="product-service-new"}[5m])) by (le)
)

vs

histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket{service="product-service-legacy"}[5m])) by (le)
)
```

### Step 5: Database Cutover

**Switch to New Database as Source of Truth**

```java
// Phase 1: Dual-write (legacy primary)
// Legacy DB ← Write
// New DB ← Async write

// Phase 2: Dual-write (new primary)
// New DB ← Write
// Legacy DB ← Async write (for rollback safety)

// Phase 3: New only
// New DB ← Write
// Legacy DB ← Read-only (archived)

@Service
public class ProductService {

    @Transactional
    public Product updateProduct(String productId, ProductUpdate update) {
        // Phase 2: New database is primary
        Product product = newServiceClient.updateProduct(productId, update);

        // Async write to legacy for safety
        CompletableFuture.runAsync(() -> {
            try {
                legacyRepo.update(productId, update);
            } catch (Exception e) {
                logger.warn("Failed to sync to legacy DB", e);
            }
        });

        return product;
    }
}
```

---

## Phase 4: Extract Remaining Services (Month 6-12)

### Service Extraction Order

**Month 6: User Service**
- Authentication and authorization
- JWT token generation
- User profile management
- OAuth integration

**Month 7-8: Order Service**
- Order creation and processing
- Saga pattern for distributed transactions
- Event sourcing for order history

**Month 9: Payment Service**
- PCI DSS compliance isolation
- Stripe/PayPal integration
- Fraud detection

**Month 10: Inventory Service**
- Stock management
- Reservation system
- Warehouse integration

**Month 11: Shipping Service**
- Carrier integration
- Tracking updates
- Delivery notifications

**Month 12: Cart & Notification Services**
- Shopping cart (Redis-based)
- Email/SMS notifications

---

## Challenges and Solutions

### Challenge 1: Data Consistency

**Problem**: Distributed transactions across services

**Solution**: Saga Pattern

```typescript
// order-service/src/sagas/order-saga.ts
export class OrderSaga {
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const sagaId = uuidv4();

    try {
      // Step 1: Reserve inventory
      await this.inventoryService.reserve(sagaId, orderData.items);

      // Step 2: Process payment
      await this.paymentService.charge(sagaId, orderData.payment);

      // Step 3: Create shipment
      await this.shippingService.createShipment(sagaId, orderData.address);

      // Step 4: Create order
      return await this.orderRepo.create(orderData);
    } catch (error) {
      // Compensating transactions
      await this.compensate(sagaId);
      throw error;
    }
  }

  private async compensate(sagaId: string): Promise<void> {
    await this.shippingService.cancelShipment(sagaId);
    await this.paymentService.refund(sagaId);
    await this.inventoryService.release(sagaId);
  }
}
```

### Challenge 2: Service Communication

**Problem**: Synchronous HTTP calls create tight coupling

**Solution**: Event-Driven Architecture

```typescript
// Event publisher
export class ProductService {
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.productRepo.update(productId, updates);

    // Publish event instead of calling services directly
    await this.eventBus.publish('product.updated', {
      productId,
      updates,
      timestamp: new Date()
    });

    return product;
  }
}

// Event consumer (Inventory Service)
export class InventoryEventHandler {
  @EventHandler('product.updated')
  async onProductUpdated(event: ProductUpdatedEvent): Promise<void> {
    // Update inventory cache
    await this.cache.invalidate(`inventory:${event.productId}`);
  }
}
```

### Challenge 3: Testing

**Problem**: Integration testing across services

**Solution**: Contract Testing

```typescript
// product-service/tests/contracts/product.contract.test.ts
import { Pact } from '@pact-foundation/pact';

describe('Product Service Contract', () => {
  const provider = new Pact({
    consumer: 'order-service',
    provider: 'product-service'
  });

  it('should get product by ID', async () => {
    await provider
      .given('product exists')
      .uponReceiving('a request for product')
      .withRequest({
        method: 'GET',
        path: '/api/products/123'
      })
      .willRespondWith({
        status: 200,
        body: {
          id: '123',
          name: 'Test Product',
          price: 99.99
        }
      });

    const client = new ProductServiceClient(provider.mockService.baseUrl);
    const product = await client.getProduct('123');

    expect(product.id).toBe('123');
  });
});
```

---

## Results and Metrics

### Before Migration (Monolith)

- **Deployment Frequency**: Weekly
- **Deployment Time**: 2 hours
- **Lead Time**: 2-4 weeks
- **MTTR**: 4 hours
- **Team Velocity**: 50 story points/sprint
- **Scalability**: Vertical only
- **Technology**: Java only

### After Migration (Microservices)

- **Deployment Frequency**: Multiple times per day
- **Deployment Time**: 10 minutes per service
- **Lead Time**: 2-5 days
- **MTTR**: 30 minutes
- **Team Velocity**: 80 story points/sprint
- **Scalability**: Horizontal, per-service
- **Technology**: Java, Node.js, Python, Go

### Performance Improvements

- **API Response Time**: 40% faster (caching, optimized services)
- **Database Load**: 60% reduction (service-specific databases)
- **Availability**: 99.9% → 99.95%
- **Cost**: 30% reduction (right-sized services)

---

## Key Takeaways

### Success Factors

1. **Incremental Migration**: Strangler Fig Pattern allowed gradual, low-risk migration
2. **Feature Flags**: Enabled safe rollout and quick rollback
3. **Dual-Write**: Ensured data consistency during migration
4. **Monitoring**: Comprehensive observability caught issues early
5. **Team Ownership**: Clear service ownership improved velocity
6. **Event-Driven**: Reduced coupling between services

### Lessons Learned

1. **Start Small**: Begin with low-risk, high-value service (Product Catalog)
2. **Data is Hard**: Spend time on data migration strategy
3. **Observability First**: Set up monitoring before migration
4. **Team Training**: Invest in microservices training
5. **Don't Rush**: Take time to do it right
6. **Keep Monolith Running**: Maintain monolith until fully migrated

### Common Pitfalls to Avoid

- ❌ **Big Bang Migration**: Migrate incrementally instead
- ❌ **Distributed Monolith**: Ensure proper service boundaries
- ❌ **Ignoring Data**: Plan data migration carefully
- ❌ **No Rollback Plan**: Always have a way to roll back
- ❌ **Premature Optimization**: Don't over-engineer early services
- ❌ **Skipping Tests**: Maintain test coverage throughout

---

## Timeline Summary

| Phase | Duration | Activities | Outcome |
|-------|----------|------------|---------|
| Assessment | Month 1-2 | Dependency analysis, team planning | Migration roadmap |
| Infrastructure | Month 3 | API Gateway, service mesh, monitoring | Foundation ready |
| Product Service | Month 4-5 | Extract, migrate data, rollout | First service live |
| User Service | Month 6 | Authentication, OAuth | Auth decoupled |
| Order Service | Month 7-8 | Saga pattern, event sourcing | Core business logic extracted |
| Payment Service | Month 9 | PCI compliance, isolation | Security improved |
| Remaining Services | Month 10-12 | Inventory, Shipping, Cart, Notifications | Migration complete |

---

## References

- [Microservices Architecture](../rules/microservices-architecture.md)
- [Event-Driven Architecture](../rules/event-driven-architecture.md)
- [Challenges and Solutions](../rules/challenges-solutions.md)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Building Microservices by Sam Newman](https://www.oreilly.com/library/view/building-microservices/9781491950340/)
          - /api/products
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 100
```

**2. Service Mesh (Istio)**

```yaml
# istio-config.yml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: product-service
spec:
  hosts:
  - product-service
  http:
  - match:
    - headers:
        x-use-new-service:
          exact: "true"
    route:
    - destination:
        host: product-service-v2
      weight: 100
  - route:
    - destination:
        host: product-service-v1
      weight: 100
```

**3. Observability Stack**

```yaml
# prometheus-config.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'monolith'
    static_configs:
      - targets: ['monolith:8080']

  - job_name: 'product-service'
    static_configs:
      - targets: ['product-service:3000']
```


