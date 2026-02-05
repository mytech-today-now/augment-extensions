# Quality Attributes

## Overview

This document covers non-functional requirements (quality attributes) that define how a system performs its functions. Quality attributes are critical architectural drivers that shape system design and implementation.

---

## Knowledge

### Performance

**Definition**
- System's responsiveness and throughput under specific workload
- Measured in response time, latency, throughput, resource utilization
- Critical for user experience and system efficiency
- Often involves trade-offs with other attributes

**Key Metrics**
- **Response Time**: Time to respond to a request
- **Latency**: Delay before transfer begins
- **Throughput**: Requests processed per unit time
- **Resource Utilization**: CPU, memory, network, disk usage

**Performance Tactics**
- Caching (in-memory, distributed, CDN)
- Load balancing (horizontal scaling)
- Asynchronous processing (queues, workers)
- Database optimization (indexing, query optimization)
- Code optimization (algorithms, data structures)
- Resource pooling (connection pools, thread pools)

**Performance Patterns**
- Cache-Aside Pattern
- Read-Through/Write-Through Cache
- Circuit Breaker (prevent cascading failures)
- Bulkhead (isolate resources)
- CQRS (separate read/write paths)

### Reliability

**Definition**
- System's ability to function correctly over time
- Measured in uptime, MTBF (Mean Time Between Failures), MTTR (Mean Time To Recovery)
- Includes fault tolerance and error handling
- Critical for mission-critical systems

**Key Metrics**
- **Availability**: Percentage of time system is operational (e.g., 99.9% = "three nines")
- **MTBF**: Average time between failures
- **MTTR**: Average time to recover from failure
- **Error Rate**: Percentage of failed requests

**Reliability Tactics**
- Redundancy (active-active, active-passive)
- Health checks and monitoring
- Graceful degradation
- Retry mechanisms (exponential backoff)
- Timeouts and circuit breakers
- Data replication and backup

**Reliability Patterns**
- Retry Pattern
- Circuit Breaker Pattern
- Bulkhead Pattern
- Health Endpoint Monitoring
- Compensating Transaction

### Maintainability

**Definition**
- Ease with which system can be modified, extended, and debugged
- Measured in time to fix bugs, add features, or refactor
- Includes code quality, documentation, and testability
- Critical for long-term system evolution

**Key Aspects**
- **Modularity**: Well-defined, independent modules
- **Readability**: Clear, self-documenting code
- **Testability**: Easy to write and run tests
- **Documentation**: Comprehensive, up-to-date docs
- **Debuggability**: Easy to diagnose and fix issues

**Maintainability Tactics**
- Clear separation of concerns
- Consistent coding standards
- Comprehensive testing (unit, integration, e2e)
- Automated builds and deployments
- Version control and code reviews
- Refactoring and technical debt management

**Maintainability Patterns**
- Dependency Injection
- Repository Pattern
- Factory Pattern
- Strategy Pattern
- Observer Pattern

### Scalability

**Definition**
- System's ability to handle increased load
- Measured in concurrent users, requests per second, data volume
- Includes horizontal (add servers) and vertical (add resources) scaling
- Critical for growing systems

**Scaling Dimensions**
- **Horizontal Scaling**: Add more servers/instances
- **Vertical Scaling**: Add more resources (CPU, RAM) to existing servers
- **Data Scaling**: Partition data across multiple databases
- **Functional Scaling**: Decompose into microservices

**Scalability Tactics**
- Stateless services (enable horizontal scaling)
- Database sharding and partitioning
- Caching layers (reduce database load)
- Asynchronous processing (decouple components)
- Load balancing (distribute traffic)
- Auto-scaling (dynamic resource allocation)

**Scalability Patterns**
- Sharding Pattern
- CQRS (Command Query Responsibility Segregation)
- Event Sourcing
- Saga Pattern (distributed transactions)
- Strangler Fig (incremental migration)

### Security

**Definition**
- System's ability to protect data and resist attacks
- Measured in vulnerabilities, incidents, compliance
- Includes authentication, authorization, encryption, auditing
- Critical for all systems handling sensitive data

**Security Principles**
- **Confidentiality**: Protect data from unauthorized access
- **Integrity**: Ensure data is not tampered with
- **Availability**: Ensure authorized access when needed
- **Non-repudiation**: Prove actions occurred
- **Authentication**: Verify identity
- **Authorization**: Control access to resources

**Security Tactics**
- Authentication (OAuth, JWT, SAML)
- Authorization (RBAC, ABAC)
- Encryption (at rest, in transit)
- Input validation and sanitization
- Security headers (CORS, CSP, HSTS)
- Rate limiting and throttling
- Audit logging

**Security Patterns**
- Zero Trust Architecture
- Defense in Depth
- Least Privilege
- Secure by Default
- Fail Securely

### Usability

**Definition**
- Ease with which users can accomplish tasks
- Measured in task completion time, error rate, user satisfaction
- Includes UI/UX design, accessibility, learnability
- Critical for user-facing systems

**Usability Aspects**
- **Learnability**: How quickly users learn the system
- **Efficiency**: How quickly users perform tasks
- **Memorability**: How easily users remember how to use it
- **Error Prevention**: How well system prevents errors
- **Satisfaction**: How pleasant the experience is

**Usability Tactics**
- Consistent UI patterns
- Clear feedback and error messages
- Progressive disclosure (show complexity gradually)
- Accessibility (WCAG compliance)
- Responsive design (mobile, tablet, desktop)
- User testing and feedback

### Testability

**Definition**
- Ease with which system can be tested
- Measured in test coverage, test execution time, test maintainability
- Includes unit, integration, and end-to-end testing
- Critical for quality assurance

**Testability Tactics**
- Dependency injection (mock dependencies)
- Interface-based design (test doubles)
- Separation of concerns (isolated testing)
- Test automation (CI/CD pipelines)
- Test data management
- Observability (logging, metrics, tracing)

### Interoperability

**Definition**
- System's ability to work with other systems
- Measured in integration points, data exchange formats, API compatibility
- Includes standards compliance and protocol support
- Critical for enterprise systems

**Interoperability Tactics**
- Standard protocols (HTTP, gRPC, AMQP)
- Standard data formats (JSON, XML, Protocol Buffers)
- API versioning and backward compatibility
- Service contracts and schemas
- Integration patterns (ESB, API Gateway)

### Portability

**Definition**
- Ease with which system can be moved to different environments
- Measured in deployment time, configuration complexity
- Includes platform independence and containerization
- Critical for cloud-native systems

**Portability Tactics**
- Containerization (Docker, Kubernetes)
- Infrastructure as Code (Terraform, CloudFormation)
- Environment-specific configuration
- Platform abstraction layers
- Cloud-agnostic design

---

## Skills

### Specifying Quality Attributes

**Quality Attribute Scenarios**

A quality attribute scenario consists of:
1. **Source**: Entity generating the stimulus
2. **Stimulus**: Condition affecting the system
3. **Environment**: System state when stimulus occurs
4. **Artifact**: Part of system affected
5. **Response**: Activity resulting from stimulus
6. **Response Measure**: Measurable outcome

**Example: Performance Scenario**
- **Source**: User
- **Stimulus**: Initiates transaction
- **Environment**: Normal operation
- **Artifact**: System
- **Response**: Process transaction
- **Response Measure**: Within 2 seconds for 95% of requests

**Example: Availability Scenario**
- **Source**: Internal fault
- **Stimulus**: Server crashes
- **Environment**: Normal operation
- **Artifact**: System
- **Response**: Failover to backup server
- **Response Measure**: Within 30 seconds, no data loss

### Measuring Quality Attributes

**Performance Metrics**
- Response time percentiles (p50, p95, p99)
- Throughput (requests/second)
- Resource utilization (CPU, memory, network)
- Apdex score (Application Performance Index)

**Reliability Metrics**
- Uptime percentage (99.9%, 99.99%, 99.999%)
- MTBF (Mean Time Between Failures)
- MTTR (Mean Time To Recovery)
- Error rate (errors per 1000 requests)

**Maintainability Metrics**
- Code coverage (unit, integration tests)
- Cyclomatic complexity
- Technical debt ratio
- Time to fix bugs

**Security Metrics**
- Vulnerability count (critical, high, medium, low)
- Time to patch vulnerabilities
- Failed authentication attempts
- Security incidents

### Trade-offs Between Quality Attributes

**Common Trade-offs**

**Performance vs. Security**
- Encryption adds latency
- Authentication/authorization adds overhead
- Balance: Use efficient algorithms, cache auth tokens

**Performance vs. Maintainability**
- Optimized code may be harder to read
- Caching adds complexity
- Balance: Optimize only bottlenecks, document optimizations

**Scalability vs. Consistency**
- Distributed systems face CAP theorem constraints
- Eventual consistency improves scalability
- Balance: Choose consistency model based on requirements

**Flexibility vs. Performance**
- Abstraction layers add overhead
- Dynamic dispatch slower than static
- Balance: Abstract only where needed, measure impact

**Security vs. Usability**
- Strong authentication may frustrate users
- Strict validation may reject valid input
- Balance: Risk-based authentication, clear error messages

---

## Examples

### Performance Optimization

**Caching Strategy**
```typescript
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

class UserService {
  constructor(
    private userRepository: UserRepository,
    private cache: CacheService
  ) {}

  async getUser(id: string): Promise<User> {
    // Try cache first
    const cached = await this.cache.get<User>(`user:${id}`);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch from database
    const user = await this.userRepository.findById(id);
    if (user) {
      // Cache for 5 minutes
      await this.cache.set(`user:${id}`, user, 300);
    }

    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.update(id, data);

    // Invalidate cache
    await this.cache.delete(`user:${id}`);

    return user;
  }
}
```

**Database Query Optimization**
```typescript
// Bad: N+1 query problem
async function getOrdersWithItems(userId: string): Promise<Order[]> {
  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);

  for (const order of orders) {
    // N additional queries!
    order.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  }

  return orders;
}

// Good: Single query with JOIN
async function getOrdersWithItems(userId: string): Promise<Order[]> {
  const rows = await db.query(`
    SELECT
      o.*,
      oi.id as item_id,
      oi.product_id,
      oi.quantity,
      oi.price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
  `, [userId]);

  // Group items by order
  const ordersMap = new Map<string, Order>();
  for (const row of rows) {
    if (!ordersMap.has(row.id)) {
      ordersMap.set(row.id, {
        id: row.id,
        userId: row.user_id,
        items: []
      });
    }

    if (row.item_id) {
      ordersMap.get(row.id)!.items.push({
        id: row.item_id,
        productId: row.product_id,
        quantity: row.quantity,
        price: row.price
      });
    }
  }

  return Array.from(ordersMap.values());
}
```

### Reliability Patterns

**Circuit Breaker**
```typescript
enum CircuitState {
  CLOSED,  // Normal operation
  OPEN,    // Failing, reject requests
  HALF_OPEN // Testing if service recovered
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;

  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private successThreshold: number = 2
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime &&
      Date.now() - this.lastFailureTime.getTime() >= this.timeout;
  }
}

// Usage
const breaker = new CircuitBreaker();
const paymentService = {
  async processPayment(amount: number): Promise<PaymentResult> {
    return breaker.execute(async () => {
      // Call external payment API
      const response = await fetch('https://api.payment.com/charge', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
      return response.json();
    });
  }
};
```

**Retry with Exponential Backoff**
```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt);
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError!;
}

// Usage
const data = await retryWithBackoff(
  () => fetch('https://api.example.com/data').then(r => r.json()),
  3,
  1000
);
```

### Security Implementation

**Authentication and Authorization**
```typescript
interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthService {
  authenticate(email: string, password: string): Promise<string>; // Returns JWT
  verifyToken(token: string): Promise<User>;
}

// Role-Based Access Control (RBAC)
function requireRole(...roles: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const user = (this as any).currentUser as User;

      if (!user) {
        throw new Error('Unauthorized');
      }

      const hasRole = roles.some(role => user.roles.includes(role));
      if (!hasRole) {
        throw new Error('Forbidden');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

class OrderController {
  constructor(private currentUser: User) {}

  @requireRole('admin', 'manager')
  async deleteOrder(orderId: string): Promise<void> {
    // Only admins and managers can delete orders
  }

  @requireRole('user')
  async viewOrder(orderId: string): Promise<Order> {
    // Any authenticated user can view orders
  }
}
```

**Input Validation and Sanitization**
```typescript
import { z } from 'zod';

// Define schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120).optional()
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

class UserController {
  async createUser(input: unknown): Promise<User> {
    // Validate and sanitize input
    const validatedInput = CreateUserSchema.parse(input);

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedInput.password, 10);

    // Create user
    return this.userRepository.create({
      ...validatedInput,
      password: hashedPassword
    });
  }
}
```

### Maintainability Practices

**Dependency Injection for Testability**
```typescript
// Bad: Hard to test
class OrderService {
  async createOrder(data: OrderData): Promise<Order> {
    const db = new Database(); // Hard-coded dependency
    const emailService = new EmailService(); // Hard-coded dependency

    const order = await db.insert('orders', data);
    await emailService.sendOrderConfirmation(order);

    return order;
  }
}

// Good: Easy to test
interface OrderRepository {
  create(data: OrderData): Promise<Order>;
}

interface EmailService {
  sendOrderConfirmation(order: Order): Promise<void>;
}

class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private emailService: EmailService
  ) {}

  async createOrder(data: OrderData): Promise<Order> {
    const order = await this.orderRepository.create(data);
    await this.emailService.sendOrderConfirmation(order);
    return order;
  }
}

// Test with mocks
describe('OrderService', () => {
  it('should send confirmation email after creating order', async () => {
    const mockRepository: OrderRepository = {
      create: jest.fn().mockResolvedValue({ id: '123', ...orderData })
    };

    const mockEmailService: EmailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined)
    };

    const service = new OrderService(mockRepository, mockEmailService);
    await service.createOrder(orderData);

    expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ id: '123' })
    );
  });
});
```

---

## Understanding

### Quality Attribute Workshops

**Steps to Identify Quality Attributes**

1. **Stakeholder Identification**
   - Business stakeholders
   - End users
   - Developers and operators
   - Security and compliance teams

2. **Scenario Elicitation**
   - Brainstorm quality attribute scenarios
   - Prioritize scenarios by importance
   - Define measurable response measures

3. **Architecture Analysis**
   - Identify architectural tactics for each scenario
   - Analyze trade-offs
   - Document decisions and rationale

4. **Validation**
   - Prototype critical scenarios
   - Performance testing
   - Security audits
   - Usability testing

### Architectural Tactics for Quality Attributes

**Performance Tactics**
- Resource management (pooling, caching)
- Concurrency (parallelism, async processing)
- Resource arbitration (scheduling, load balancing)

**Availability Tactics**
- Fault detection (ping/echo, heartbeat, monitoring)
- Fault recovery (retry, failover, rollback)
- Fault prevention (removal from service, transactions)

**Modifiability Tactics**
- Reduce coupling (encapsulation, intermediaries)
- Increase cohesion (split modules, abstract common services)
- Defer binding (configuration files, plugins, discovery)

**Security Tactics**
- Resist attacks (authentication, authorization, encryption)
- Detect attacks (intrusion detection, audit trails)
- Recover from attacks (backup, restore, incident response)

### Best Practices

1. **Define Quality Attributes Early**
   - Include in requirements gathering
   - Prioritize based on business value
   - Make them measurable and testable

2. **Use Quality Attribute Scenarios**
   - Concrete, testable scenarios
   - Include source, stimulus, response, measure
   - Prioritize and track throughout development

3. **Monitor and Measure**
   - Implement observability (logging, metrics, tracing)
   - Set up alerts for quality attribute violations
   - Regular performance and security testing

4. **Document Trade-offs**
   - Explicitly document quality attribute trade-offs
   - Explain architectural decisions
   - Revisit decisions as requirements change

5. **Automate Testing**
   - Performance testing in CI/CD
   - Security scanning (SAST, DAST)
   - Accessibility testing
   - Load testing

6. **Continuous Improvement**
   - Regular architecture reviews
   - Refactor to improve quality attributes
   - Learn from incidents and outages
   - Update quality attribute scenarios

### Common Pitfalls

1. **Ignoring Quality Attributes**
   - Focusing only on functional requirements
   - Discovering quality issues late in development
   - Costly rework and refactoring

2. **Premature Optimization**
   - Optimizing before measuring
   - Adding complexity without justification
   - Sacrificing maintainability for performance

3. **One-Size-Fits-All**
   - Applying same quality attributes to all systems
   - Not considering context and requirements
   - Over-engineering simple systems

4. **Lack of Measurement**
   - No metrics or monitoring
   - Subjective quality assessments
   - Unable to validate improvements

5. **Ignoring Trade-offs**
   - Trying to maximize all quality attributes
   - Not prioritizing based on business value
   - Creating conflicting requirements

---

## References

- **ISO/IEC 25010**: Systems and software Quality Requirements and Evaluation (SQuaRE)
- **Software Architecture in Practice**: Len Bass, Paul Clements, Rick Kazman
- **Designing Data-Intensive Applications**: Martin Kleppmann
- **Site Reliability Engineering**: Google
- **OWASP Top 10**: Open Web Application Security Project
- **WCAG**: Web Content Accessibility Guidelines

