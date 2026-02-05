# E-Commerce Platform Architecture Example

## Overview

This document provides a comprehensive example of an e-commerce platform built with microservices architecture, focusing on high availability, scalability, and resilience.

---

## System Context

### Business Requirements

**Functional Requirements**
- Product catalog with search and filtering
- Shopping cart and checkout
- Order processing and tracking
- Payment processing
- User authentication and profiles
- Inventory management
- Shipping and fulfillment
- Customer reviews and ratings

**Non-Functional Requirements**
- **Availability**: 99.99% uptime (52 minutes downtime/year)
- **Scalability**: Handle 10,000 concurrent users, 1M products
- **Performance**: Page load < 2s, API response < 200ms
- **Security**: PCI DSS compliance for payments
- **Reliability**: Zero data loss, eventual consistency acceptable

### Scale Metrics
- 1 million registered users
- 100,000 daily active users
- 10,000 orders per day
- 1 million products in catalog
- Peak traffic: Black Friday (10x normal load)

---

## Architecture Overview

### Microservices Decomposition

**Service Boundaries (Domain-Driven Design)**

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Kong)                       │
│              Authentication, Rate Limiting, Routing          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│ User Service   │   │ Product Service │   │ Order Service  │
│ (Auth, Profile)│   │ (Catalog, Search│   │ (Checkout,     │
│                │   │  Inventory)     │   │  Fulfillment)  │
└────────────────┘   └─────────────────┘   └────────────────┘
        │                     │                     │
        │            ┌────────▼────────┐            │
        │            │ Search Service  │            │
        │            │ (Elasticsearch) │            │
        │            └─────────────────┘            │
        │                                           │
┌───────▼────────┐   ┌─────────────────┐   ┌───────▼────────┐
│ Payment Service│   │ Review Service  │   │ Shipping Svc   │
│ (Stripe, PayPal│   │ (Ratings, UGC)  │   │ (Tracking,     │
│  PCI Compliant)│   │                 │   │  Carriers)     │
└────────────────┘   └─────────────────┘   └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Event Bus (Kafka) │
                    │  (Event Sourcing)  │
                    └────────────────────┘
```

### Service Responsibilities

**1. User Service**
- User registration and authentication (JWT)
- Profile management
- Address book
- Preferences and settings
- OAuth integration (Google, Facebook)

**2. Product Service**
- Product catalog CRUD
- Category management
- Product attributes and variants
- Inventory tracking
- Price management

**3. Search Service**
- Full-text search (Elasticsearch)
- Faceted search and filtering
- Search suggestions and autocomplete
- Personalized search results
- Search analytics

**4. Order Service**
- Shopping cart management
- Order creation and processing
- Order history and tracking
- Order status updates
- Saga orchestration for distributed transactions

**5. Payment Service**
- Payment processing (Stripe, PayPal)
- PCI DSS compliance
- Payment method management
- Refund processing
- Fraud detection integration

**6. Review Service**
- Product reviews and ratings
- Review moderation
- Helpful votes
- Review analytics

**7. Shipping Service**
- Shipping rate calculation
- Carrier integration (FedEx, UPS, USPS)
- Shipment tracking
- Delivery notifications

---

## Technology Stack

### Services
- **Language**: Node.js (TypeScript) for most services
- **Framework**: Express.js, NestJS
- **API**: REST + GraphQL (BFF pattern)

### Data Storage
- **User Service**: PostgreSQL (relational, ACID)
- **Product Service**: PostgreSQL + Redis (caching)
- **Search Service**: Elasticsearch
- **Order Service**: PostgreSQL + Event Store
- **Review Service**: MongoDB (document-based)
- **Session Store**: Redis

### Infrastructure
- **Container Orchestration**: Kubernetes (EKS)
- **Service Mesh**: Istio (traffic management, security)
- **API Gateway**: Kong
- **Message Broker**: Apache Kafka
- **Cache**: Redis Cluster
- **CDN**: CloudFront
- **Load Balancer**: AWS ALB

### Observability
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger (distributed tracing)
- **Alerting**: PagerDuty

### CI/CD
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions + ArgoCD
- **Container Registry**: ECR
- **Infrastructure as Code**: Terraform

---

## Implementation Details

### 1. Product Service Implementation

**Service Structure**

```typescript
// src/product-service/domain/product.entity.ts
export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  inventory: number;
  images: string[];
  attributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// src/product-service/application/product.service.ts
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly cache: CacheService,
    private readonly eventBus: EventBus
  ) {}

  async getProduct(productId: string): Promise<Product> {
    // Check cache first
    const cached = await this.cache.get(`product:${productId}`);
    if (cached) return cached;

    // Fetch from database
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Cache for 1 hour
    await this.cache.set(`product:${productId}`, product, 3600);
    return product;
  }

  async updateInventory(productId: string, quantity: number): Promise<void> {
    await this.productRepo.updateInventory(productId, quantity);

    // Invalidate cache
    await this.cache.delete(`product:${productId}`);

    // Publish event
    await this.eventBus.publish('product.inventory.updated', {
      productId,
      quantity,
      timestamp: new Date()
    });
  }
}

// src/product-service/infrastructure/product.controller.ts
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async getProduct(@Param('id') id: string): Promise<Product> {
    return await this.productService.getProduct(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return await this.productService.createProduct(dto);
  }
}
```

### 2. Order Service with Saga Pattern

**Distributed Transaction Handling**

```typescript
// src/order-service/sagas/order-saga.ts
export class OrderSaga {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const sagaId = uuidv4();

    try {
      // Step 1: Create order (pending)
      const order = await this.orderRepo.create({
        ...orderData,
        status: 'PENDING',
        sagaId
      });

      // Step 2: Reserve inventory
      await this.eventBus.publish('inventory.reserve', {
        sagaId,
        orderId: order.id,
        items: order.items
      });

      // Step 3: Process payment
      await this.eventBus.publish('payment.process', {
        sagaId,
        orderId: order.id,
        amount: order.total,
        paymentMethod: orderData.paymentMethod
      });

      // Step 4: Create shipment
      await this.eventBus.publish('shipment.create', {
        sagaId,
        orderId: order.id,
        address: orderData.shippingAddress
      });

      return order;
    } catch (error) {
      // Compensating transactions
      await this.compensate(sagaId);
      throw error;
    }
  }

  private async compensate(sagaId: string): Promise<void> {
    // Rollback in reverse order
    await this.eventBus.publish('shipment.cancel', { sagaId });
    await this.eventBus.publish('payment.refund', { sagaId });
    await this.eventBus.publish('inventory.release', { sagaId });
    await this.orderRepo.updateStatus(sagaId, 'CANCELLED');
  }

  // Event handlers
  @EventHandler('payment.completed')
  async onPaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    await this.orderRepo.updateStatus(event.orderId, 'PAID');
  }

  @EventHandler('payment.failed')
  async onPaymentFailed(event: PaymentFailedEvent): Promise<void> {
    await this.compensate(event.sagaId);
  }
}
```

### 3. API Gateway Configuration

**Kong Gateway Setup**

```yaml
# kong.yml
_format_version: "2.1"

services:
  - name: product-service
    url: http://product-service:3000
    routes:
      - name: products-route
        paths:
          - /api/products
        methods:
          - GET
          - POST
          - PUT
          - DELETE
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: cors
        config:
          origins:
            - https://example.com
      - name: jwt
        config:
          secret_is_base64: false

  - name: order-service
    url: http://order-service:3000
    routes:
      - name: orders-route
        paths:
          - /api/orders
    plugins:
      - name: rate-limiting
        config:
          minute: 50
      - name: jwt
        config:
          secret_is_base64: false
      - name: request-transformer
        config:
          add:
            headers:
              - X-User-Id:$(jwt.claims.sub)
```



### 4. High Availability Setup

**Kubernetes Deployment**

```yaml
# k8s/product-service-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  labels:
    app: product-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
      - name: product-service
        image: product-service:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: product-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: product-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 5. Monitoring and Observability

**Prometheus Metrics**

```typescript
// src/common/metrics/metrics.service.ts
import { Counter, Histogram, Registry } from 'prom-client';

export class MetricsService {
  private readonly registry: Registry;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestTotal: Counter;
  private readonly orderTotal: Counter;

  constructor() {
    this.registry = new Registry();

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.orderTotal = new Counter({
      name: 'orders_total',
      help: 'Total number of orders',
      labelNames: ['status']
    });

    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.httpRequestTotal);
    this.registry.registerMetric(this.orderTotal);
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordOrder(status: string): void {
    this.orderTotal.inc({ status });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

**Distributed Tracing**

```typescript
// src/common/tracing/tracing.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as opentracing from 'opentracing';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly tracer: opentracing.Tracer) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const parentSpanContext = this.tracer.extract(
      opentracing.FORMAT_HTTP_HEADERS,
      request.headers
    );

    const span = this.tracer.startSpan(
      `${request.method} ${request.route.path}`,
      { childOf: parentSpanContext }
    );

    span.setTag('http.method', request.method);
    span.setTag('http.url', request.url);
    span.setTag('service.name', 'product-service');

    return next.handle().pipe(
      tap({
        next: () => {
          span.setTag('http.status_code', 200);
          span.finish();
        },
        error: (error) => {
          span.setTag('http.status_code', error.status || 500);
          span.setTag('error', true);
          span.log({ event: 'error', message: error.message });
          span.finish();
        }
      })
    );
  }
}
```

---

## Scalability Patterns

### 1. Database Sharding (Product Service)

**Shard by Product Category**

```typescript
// src/product-service/infrastructure/sharding.service.ts
export class ShardingService {
  private readonly shards = [
    { id: 'shard-1', categories: ['electronics', 'computers'] },
    { id: 'shard-2', categories: ['clothing', 'shoes'] },
    { id: 'shard-3', categories: ['home', 'garden'] }
  ];

  getShardForCategory(category: string): string {
    const shard = this.shards.find(s => s.categories.includes(category));
    return shard?.id || 'shard-1'; // Default shard
  }

  async getProduct(productId: string, category: string): Promise<Product> {
    const shardId = this.getShardForCategory(category);
    const connection = await this.getConnection(shardId);
    return await connection.query('SELECT * FROM products WHERE id = ?', [productId]);
  }
}
```

### 2. Caching Strategy

**Multi-Level Caching**

```typescript
// src/common/cache/cache.service.ts
export class CacheService {
  constructor(
    private readonly redis: Redis,
    private readonly cdn: CloudFront
  ) {}

  async get(key: string): Promise<any> {
    // Level 1: Application cache (in-memory)
    const memCached = this.memCache.get(key);
    if (memCached) return memCached;

    // Level 2: Redis cache
    const redisCached = await this.redis.get(key);
    if (redisCached) {
      this.memCache.set(key, redisCached, 60); // 1 minute
      return JSON.parse(redisCached);
    }

    return null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    // Set in both caches
    this.memCache.set(key, value, Math.min(ttl, 60));
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    // Invalidate in Redis
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    // Invalidate in CDN
    await this.cdn.createInvalidation({
      DistributionId: process.env.CDN_DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: { Quantity: 1, Items: [`/${pattern}*`] },
        CallerReference: Date.now().toString()
      }
    });
  }
}
```


### 3. Circuit Breaker Pattern

**Resilience Against Service Failures**

```typescript
// src/common/resilience/circuit-breaker.ts
import CircuitBreaker from 'opossum';

export class ResilientHttpClient {
  private breakers: Map<string, CircuitBreaker> = new Map();

  async call(serviceName: string, fn: () => Promise<any>): Promise<any> {
    let breaker = this.breakers.get(serviceName);

    if (!breaker) {
      breaker = new CircuitBreaker(fn, {
        timeout: 3000, // 3 seconds
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30 seconds
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10
      });

      breaker.on('open', () => {
        console.error(`Circuit breaker opened for ${serviceName}`);
      });

      breaker.on('halfOpen', () => {
        console.log(`Circuit breaker half-open for ${serviceName}`);
      });

      this.breakers.set(serviceName, breaker);
    }

    return await breaker.fire();
  }
}

// Usage in Order Service
export class OrderService {
  constructor(private readonly httpClient: ResilientHttpClient) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    // Call payment service with circuit breaker
    const payment = await this.httpClient.call(
      'payment-service',
      () => this.paymentClient.processPayment(orderData.payment)
    );

    return await this.orderRepo.create({ ...orderData, paymentId: payment.id });
  }
}
```

---

## Security Implementation

### 1. Authentication & Authorization

**JWT-Based Authentication**

```typescript
// src/user-service/auth/auth.service.ts
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export class AuthService {
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await this.tokenRepo.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const isValid = await this.tokenRepo.validateRefreshToken(payload.sub, refreshToken);

    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.userRepo.findById(payload.sub);
    return jwt.sign(
      { sub: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }
}
```

### 2. PCI DSS Compliance (Payment Service)

**Secure Payment Processing**

```typescript
// src/payment-service/payment.service.ts
export class PaymentService {
  constructor(
    private readonly stripe: Stripe,
    private readonly encryptionService: EncryptionService,
    private readonly auditLog: AuditLogService
  ) {}

  async processPayment(paymentData: PaymentDto): Promise<Payment> {
    // Never store raw card data
    // Use Stripe tokenization
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: paymentData.amount * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentData.stripeToken,
      confirm: true,
      metadata: {
        orderId: paymentData.orderId,
        customerId: paymentData.customerId
      }
    });

    // Store only encrypted, tokenized reference
    const payment = await this.paymentRepo.create({
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      status: paymentIntent.status,
      stripePaymentIntentId: paymentIntent.id,
      last4: paymentData.last4, // Only last 4 digits
      cardBrand: paymentData.cardBrand
    });

    // Audit log for compliance
    await this.auditLog.log({
      action: 'PAYMENT_PROCESSED',
      userId: paymentData.customerId,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      timestamp: new Date(),
      ipAddress: paymentData.ipAddress
    });

    return payment;
  }
}
```

---

## Deployment Strategy

### 1. Blue-Green Deployment

**Zero-Downtime Deployments**

```yaml
# k8s/blue-green-deployment.yml
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product-service
    version: blue  # Switch to 'green' for deployment
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-service
      version: blue
  template:
    metadata:
      labels:
        app: product-service
        version: blue
    spec:
      containers:
      - name: product-service
        image: product-service:1.0.0
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-service
      version: green
  template:
    metadata:
      labels:
        app: product-service
        version: green
    spec:
      containers:
      - name: product-service
        image: product-service:1.1.0  # New version
```

### 2. CI/CD Pipeline

**GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy Product Service

on:
  push:
    branches: [main]
    paths:
      - 'services/product-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: ./services/product-service
          push: true
          tags: |
            ${{ secrets.ECR_REGISTRY }}/product-service:${{ github.sha }}
            ${{ secrets.ECR_REGISTRY }}/product-service:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: |
          kubectl set image deployment/product-service-green \
            product-service=${{ secrets.ECR_REGISTRY }}/product-service:${{ github.sha }}
          kubectl rollout status deployment/product-service-green
          kubectl patch service product-service -p '{"spec":{"selector":{"version":"green"}}}'
```

---

## Key Takeaways

### Architecture Decisions

1. **Microservices over Monolith**: Enables independent scaling and deployment
2. **Event-Driven Communication**: Decouples services, improves resilience
3. **API Gateway**: Single entry point, centralized security and routing
4. **Saga Pattern**: Manages distributed transactions without 2PC
5. **Circuit Breaker**: Prevents cascade failures
6. **Multi-Level Caching**: Reduces database load, improves performance
7. **Database per Service**: Data ownership, independent scaling

### Trade-offs

**Benefits**
- ✅ Independent scaling of services
- ✅ Technology diversity
- ✅ Fault isolation
- ✅ Faster deployments
- ✅ Team autonomy

**Challenges**
- ❌ Increased operational complexity
- ❌ Distributed transaction management
- ❌ Network latency
- ❌ Data consistency challenges
- ❌ Testing complexity

### Performance Metrics

- **Availability**: 99.99% (4 nines)
- **API Response Time**: P95 < 200ms
- **Order Processing**: 10,000 orders/day
- **Concurrent Users**: 10,000
- **Database Queries**: < 50ms (P95)
- **Cache Hit Rate**: > 80%

---

## References

- [Microservices Architecture](../rules/microservices-architecture.md)
- [Scalability Patterns](../rules/scalability.md)
- [Security Architecture](../rules/security.md)
- [Event-Driven Architecture](../rules/event-driven-architecture.md)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

