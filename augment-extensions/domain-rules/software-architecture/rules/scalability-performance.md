# Scalability and Performance

## Overview

This document covers scalability and performance principles, patterns, and techniques for building systems that can handle growth and deliver fast response times.

---

## Knowledge

### Scalability Fundamentals

#### Horizontal Scaling (Scale Out)

**Definition**
- Add more servers/instances to handle increased load
- Distribute load across multiple machines
- Preferred for cloud-native applications
- Enables elastic scaling

**Characteristics**
- Linear cost scaling (add servers as needed)
- Improved fault tolerance (redundancy)
- Requires stateless services
- Load balancing required

**Benefits**
- No theoretical limit to scaling
- Better fault tolerance
- Cost-effective (commodity hardware)
- Supports auto-scaling

**Challenges**
- Distributed system complexity
- Data consistency issues
- Network latency
- Load balancing overhead

#### Vertical Scaling (Scale Up)

**Definition**
- Add more resources (CPU, RAM, disk) to existing servers
- Increase capacity of individual machines
- Simpler than horizontal scaling
- Has physical limits

**Characteristics**
- Easier to implement (no code changes)
- Maintains data locality
- Limited by hardware constraints
- Single point of failure

**Benefits**
- Simpler architecture
- No distributed system complexity
- Better for stateful applications
- Lower network overhead

**Challenges**
- Physical limits (max CPU, RAM)
- Expensive (high-end hardware)
- Downtime during upgrades
- Single point of failure

### Performance Fundamentals

#### Latency

**Definition**
- Time delay between request and response
- Measured in milliseconds (ms)
- Critical for user experience
- Affected by network, processing, I/O

**Latency Numbers Every Programmer Should Know**
```
L1 cache reference:              0.5 ns
Branch mispredict:               5 ns
L2 cache reference:              7 ns
Mutex lock/unlock:              25 ns
Main memory reference:         100 ns
Compress 1KB with Snappy:    3,000 ns
Send 1KB over 1 Gbps:       10,000 ns
Read 4KB from SSD:         150,000 ns (0.15 ms)
Read 1MB sequentially:   1,000,000 ns (1 ms)
Disk seek:              10,000,000 ns (10 ms)
Read 1MB from network:  10,000,000 ns (10 ms)
Round trip in datacenter:  500,000 ns (0.5 ms)
```

**Reducing Latency**
- Caching (reduce database queries)
- CDN (reduce network distance)
- Database indexing (faster queries)
- Asynchronous processing (non-blocking)
- Connection pooling (reuse connections)

#### Throughput

**Definition**
- Number of operations per unit time
- Measured in requests/second, transactions/second
- Indicates system capacity
- Can be increased by parallelism

**Improving Throughput**
- Horizontal scaling (more servers)
- Parallel processing (multi-threading)
- Batch processing (group operations)
- Asynchronous processing (queues)
- Resource optimization (efficient algorithms)

### Caching Strategies

#### Cache-Aside (Lazy Loading)

**Definition**
- Application checks cache first
- On miss, load from database and populate cache
- Application manages cache
- Most common pattern

**Flow**
1. Check cache for data
2. If found (cache hit), return data
3. If not found (cache miss), load from database
4. Store in cache for future requests
5. Return data

**Benefits**
- Only cache what's needed
- Cache failures don't break application
- Simple to implement

**Challenges**
- Cache miss penalty (extra latency)
- Stale data possible
- Cache warming needed

#### Read-Through Cache

**Definition**
- Cache sits between application and database
- Cache handles loading from database
- Transparent to application
- Cache manages itself

**Benefits**
- Simpler application code
- Consistent caching logic
- Automatic cache population

**Challenges**
- Requires cache infrastructure
- Cache miss penalty
- Less control over caching

#### Write-Through Cache

**Definition**
- Writes go through cache to database
- Cache and database updated synchronously
- Ensures cache consistency
- Higher write latency

**Benefits**
- Cache always consistent
- No stale data
- Simple consistency model

**Challenges**
- Higher write latency
- Unnecessary caching of rarely-read data
- Write amplification

#### Write-Behind Cache (Write-Back)

**Definition**
- Writes go to cache first
- Database updated asynchronously
- Lower write latency
- Risk of data loss

**Benefits**
- Fast writes
- Batch database updates
- Reduced database load

**Challenges**
- Data loss risk (cache failure)
- Complex consistency
- Eventual consistency

### Load Balancing

**Definition**
- Distribute traffic across multiple servers
- Improve availability and scalability
- Prevent server overload
- Enable horizontal scaling

**Load Balancing Algorithms**

**Round Robin**
- Distribute requests sequentially
- Simple and fair
- Doesn't consider server load

**Least Connections**
- Send to server with fewest active connections
- Better for long-lived connections
- Requires connection tracking

**Least Response Time**
- Send to server with fastest response
- Adapts to server performance
- Requires health monitoring

**IP Hash**
- Hash client IP to determine server
- Session affinity (sticky sessions)
- Uneven distribution possible

**Weighted Round Robin**
- Assign weights to servers
- More requests to powerful servers
- Handles heterogeneous servers

**Load Balancing Layers**

**Layer 4 (Transport Layer)**
- Based on IP and port
- Fast (no application inspection)
- Limited routing logic

**Layer 7 (Application Layer)**
- Based on HTTP headers, URL, cookies
- Flexible routing (path-based, host-based)
- Slower (application inspection)

### Database Scaling

#### Database Replication

**Master-Slave Replication**
- One master (writes), multiple slaves (reads)
- Scales read operations
- Eventual consistency
- Failover to slave on master failure

**Master-Master Replication**
- Multiple masters (writes and reads)
- Higher write availability
- Conflict resolution needed
- More complex

**Benefits**
- Improved read performance
- High availability
- Geographic distribution
- Backup and disaster recovery

**Challenges**
- Replication lag (eventual consistency)
- Conflict resolution (multi-master)
- Increased complexity
- Storage duplication

#### Database Sharding

**Definition**
- Partition data across multiple databases
- Each shard holds subset of data
- Horizontal partitioning
- Scales both reads and writes

**Sharding Strategies**

**Range-Based Sharding**
- Partition by value range (e.g., A-M, N-Z)
- Simple to implement
- Risk of uneven distribution (hotspots)

**Hash-Based Sharding**
- Hash key to determine shard
- Even distribution
- Difficult to add/remove shards

**Geographic Sharding**
- Partition by location
- Reduced latency (data locality)
- Regulatory compliance (data residency)

**Benefits**
- Scales reads and writes
- Improved performance (smaller datasets)
- Fault isolation (shard failure)

**Challenges**
- Complex queries (cross-shard joins)
- Rebalancing (adding/removing shards)
- Distributed transactions
- Application complexity

#### Database Indexing

**Definition**
- Data structure to speed up queries
- Trade-off: faster reads, slower writes
- Essential for query performance
- Requires careful design

**Index Types**

**B-Tree Index**
- Balanced tree structure
- Good for range queries
- Default in most databases
- Supports equality and range

**Hash Index**
- Hash table structure
- Fast equality lookups
- No range queries
- Memory-intensive

**Full-Text Index**
- Optimized for text search
- Supports natural language queries
- Larger storage overhead

**Composite Index**
- Index on multiple columns
- Order matters (leftmost prefix)
- Reduces index count

**Best Practices**
- Index foreign keys
- Index columns in WHERE, JOIN, ORDER BY
- Avoid over-indexing (write penalty)
- Monitor index usage
- Regular index maintenance

### Asynchronous Processing

**Definition**
- Decouple request from processing
- Non-blocking operations
- Improves responsiveness
- Enables background processing

**Message Queues**
- Producer sends messages to queue
- Consumer processes messages asynchronously
- Decouples components
- Enables retry and error handling

**Benefits**
- Improved responsiveness (fast response)
- Better resource utilization
- Fault tolerance (retry failed jobs)
- Load leveling (smooth traffic spikes)

**Use Cases**
- Email sending
- Image processing
- Report generation
- Data synchronization
- Batch operations

**Popular Message Queues**
- RabbitMQ
- Apache Kafka
- Amazon SQS
- Redis (pub/sub)
- Google Cloud Pub/Sub

### Content Delivery Network (CDN)

**Definition**
- Distributed network of servers
- Cache static content close to users
- Reduces latency and bandwidth
- Improves availability

**How CDN Works**
1. User requests content
2. CDN edge server checks cache
3. If cached (hit), return content
4. If not cached (miss), fetch from origin
5. Cache content at edge
6. Return content to user

**Benefits**
- Reduced latency (geographic proximity)
- Reduced bandwidth costs
- Improved availability (distributed)
- DDoS protection (distributed traffic)

**What to Cache**
- Static assets (images, CSS, JavaScript)
- Videos and media files
- API responses (with appropriate TTL)
- HTML pages (with cache invalidation)

**CDN Providers**
- Cloudflare
- Amazon CloudFront
- Akamai
- Fastly
- Google Cloud CDN

---

## Skills

### Implementing Caching

**In-Memory Cache with Redis**
```typescript
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage with cache-aside pattern
class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private cache: CacheService
  ) {}

  async getProduct(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    // Try cache first
    const cached = await this.cache.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - load from database
    const product = await this.productRepository.findById(id);

    if (product) {
      // Cache for 1 hour
      await this.cache.set(cacheKey, product, 3600);
    }

    return product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.update(id, data);

    // Invalidate cache
    await this.cache.delete(`product:${id}`);

    // Invalidate related caches
    await this.cache.invalidatePattern(`products:category:${product.categoryId}:*`);

    return product;
  }
}
```

### Implementing Load Balancing

**Application-Level Load Balancing**
```typescript
interface Server {
  url: string;
  weight: number;
  activeConnections: number;
  healthy: boolean;
}

class LoadBalancer {
  private servers: Server[];
  private currentIndex = 0;

  constructor(servers: Array<{ url: string; weight?: number }>) {
    this.servers = servers.map(s => ({
      url: s.url,
      weight: s.weight || 1,
      activeConnections: 0,
      healthy: true
    }));

    // Start health checks
    this.startHealthChecks();
  }

  // Round-robin algorithm
  getNextServerRoundRobin(): Server | null {
    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;

    return server;
  }

  // Least connections algorithm
  getNextServerLeastConnections(): Server | null {
    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    return healthyServers.reduce((min, server) =>
      server.activeConnections < min.activeConnections ? server : min
    );
  }

  // Weighted round-robin algorithm
  getNextServerWeighted(): Server | null {
    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    // Create weighted list
    const weighted: Server[] = [];
    for (const server of healthyServers) {
      for (let i = 0; i < server.weight; i++) {
        weighted.push(server);
      }
    }

    const server = weighted[this.currentIndex % weighted.length];
    this.currentIndex++;

    return server;
  }

  async executeRequest<T>(
    request: (url: string) => Promise<T>,
    algorithm: 'round-robin' | 'least-connections' | 'weighted' = 'round-robin'
  ): Promise<T> {
    let server: Server | null;

    switch (algorithm) {
      case 'least-connections':
        server = this.getNextServerLeastConnections();
        break;
      case 'weighted':
        server = this.getNextServerWeighted();
        break;
      default:
        server = this.getNextServerRoundRobin();
    }

    if (!server) {
      throw new Error('No healthy servers available');
    }

    server.activeConnections++;

    try {
      const result = await request(server.url);
      return result;
    } finally {
      server.activeConnections--;
    }
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      for (const server of this.servers) {
        try {
          const response = await fetch(`${server.url}/health`, {
            method: 'GET',
            timeout: 5000
          });

          server.healthy = response.ok;
        } catch (error) {
          server.healthy = false;
        }
      }
    }, 10000); // Check every 10 seconds
  }
}

// Usage
const loadBalancer = new LoadBalancer([
  { url: 'http://server1.example.com', weight: 2 },
  { url: 'http://server2.example.com', weight: 1 },
  { url: 'http://server3.example.com', weight: 1 }
]);

const result = await loadBalancer.executeRequest(
  async (url) => {
    const response = await fetch(`${url}/api/data`);
    return response.json();
  },
  'weighted'
);
```

### Implementing Database Connection Pooling

**Connection Pool**
```typescript
import { Pool, PoolClient } from 'pg';

class DatabasePool {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,

      // Pool configuration
      min: 2,                    // Minimum connections
      max: 10,                   // Maximum connections
      idleTimeoutMillis: 30000,  // Close idle connections after 30s
      connectionTimeoutMillis: 2000, // Wait 2s for connection

      // Connection validation
      allowExitOnIdle: true
    });

    // Monitor pool events
    this.pool.on('connect', () => {
      console.log('New client connected to pool');
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected pool error', err);
    });
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release(); // Return connection to pool
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Usage
const db = new DatabasePool();

// Simple query
const users = await db.query<User>(
  'SELECT * FROM users WHERE active = $1',
  [true]
);

// Transaction
await db.transaction(async (client) => {
  await client.query(
    'INSERT INTO orders (user_id, total) VALUES ($1, $2)',
    [userId, total]
  );

  await client.query(
    'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
    [quantity, productId]
  );
});
```

### Implementing Asynchronous Processing

**Message Queue with Bull (Redis-based)**
```typescript
import Queue from 'bull';

// Define job data types
interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

interface ImageProcessingJob {
  imageUrl: string;
  operations: Array<'resize' | 'compress' | 'watermark'>;
}

class QueueService {
  private emailQueue: Queue.Queue<EmailJob>;
  private imageQueue: Queue.Queue<ImageProcessingJob>;

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    };

    // Create queues
    this.emailQueue = new Queue<EmailJob>('email', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    this.imageQueue = new Queue<ImageProcessingJob>('image-processing', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 2,
        timeout: 60000 // 1 minute timeout
      }
    });

    // Set up processors
    this.setupProcessors();
  }

  private setupProcessors(): void {
    // Email processor
    this.emailQueue.process(5, async (job) => {
      console.log(`Processing email job ${job.id}`);

      const { to, subject, body } = job.data;

      // Simulate email sending
      await this.sendEmail(to, subject, body);

      // Update progress
      await job.progress(100);

      return { sent: true, timestamp: new Date() };
    });

    // Image processing processor
    this.imageQueue.process(3, async (job) => {
      console.log(`Processing image job ${job.id}`);

      const { imageUrl, operations } = job.data;

      let processedUrl = imageUrl;

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        processedUrl = await this.processImage(processedUrl, operation);

        // Update progress
        await job.progress(((i + 1) / operations.length) * 100);
      }

      return { processedUrl };
    });

    // Error handling
    this.emailQueue.on('failed', (job, err) => {
      console.error(`Email job ${job.id} failed:`, err);
    });

    this.imageQueue.on('failed', (job, err) => {
      console.error(`Image job ${job.id} failed:`, err);
    });
  }

  async addEmailJob(data: EmailJob, priority?: number): Promise<string> {
    const job = await this.emailQueue.add(data, {
      priority: priority || 0
    });

    return job.id.toString();
  }

  async addImageProcessingJob(
    data: ImageProcessingJob,
    delay?: number
  ): Promise<string> {
    const job = await this.imageQueue.add(data, {
      delay: delay || 0
    });

    return job.id.toString();
  }

  async getJobStatus(
    queueName: 'email' | 'image-processing',
    jobId: string
  ): Promise<any> {
    const queue = queueName === 'email' ? this.emailQueue : this.imageQueue;
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason
    };
  }

  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Implement actual email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async processImage(url: string, operation: string): Promise<string> {
    // Implement actual image processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `${url}-${operation}`;
  }
}

// Usage
const queueService = new QueueService();

// Add email job
const emailJobId = await queueService.addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Welcome to our service!'
}, 1); // High priority

// Add image processing job with delay
const imageJobId = await queueService.addImageProcessingJob({
  imageUrl: 'https://example.com/image.jpg',
  operations: ['resize', 'compress', 'watermark']
}, 5000); // Process after 5 seconds

// Check job status
const status = await queueService.getJobStatus('email', emailJobId);
console.log('Job status:', status);
```

---

## Examples

### Database Query Optimization

**N+1 Query Problem**
```typescript
// Bad: N+1 queries
async function getOrdersWithCustomers(): Promise<OrderWithCustomer[]> {
  const orders = await db.query<Order>('SELECT * FROM orders');

  const ordersWithCustomers = [];
  for (const order of orders) {
    // N additional queries!
    const customer = await db.query<Customer>(
      'SELECT * FROM customers WHERE id = $1',
      [order.customerId]
    );

    ordersWithCustomers.push({
      ...order,
      customer: customer[0]
    });
  }

  return ordersWithCustomers;
}

// Good: Single query with JOIN
async function getOrdersWithCustomers(): Promise<OrderWithCustomer[]> {
  const rows = await db.query(`
    SELECT
      o.id as order_id,
      o.total,
      o.created_at,
      c.id as customer_id,
      c.name as customer_name,
      c.email as customer_email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
  `);

  return rows.map(row => ({
    id: row.order_id,
    total: row.total,
    createdAt: row.created_at,
    customer: {
      id: row.customer_id,
      name: row.customer_name,
      email: row.customer_email
    }
  }));
}

// Better: Use DataLoader for batching
import DataLoader from 'dataloader';

const customerLoader = new DataLoader(async (customerIds: string[]) => {
  const customers = await db.query<Customer>(
    'SELECT * FROM customers WHERE id = ANY($1)',
    [customerIds]
  );

  // Return in same order as requested
  const customerMap = new Map(customers.map(c => [c.id, c]));
  return customerIds.map(id => customerMap.get(id) || null);
});

async function getOrdersWithCustomers(): Promise<OrderWithCustomer[]> {
  const orders = await db.query<Order>('SELECT * FROM orders');

  // Batch load all customers in single query
  const ordersWithCustomers = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      customer: await customerLoader.load(order.customerId)
    }))
  );

  return ordersWithCustomers;
}
```

**Database Indexing**
```sql
-- Bad: No index on frequently queried column
SELECT * FROM orders WHERE customer_id = '123';
-- Full table scan!

-- Good: Add index
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- Composite index for multiple columns
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Partial index for specific conditions
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- Covering index (includes all needed columns)
CREATE INDEX idx_orders_covering ON orders(customer_id, status, total, created_at);
```

### Caching Strategies

**Multi-Level Caching**
```typescript
class MultiLevelCache {
  constructor(
    private l1Cache: Map<string, any>, // In-memory (fast, small)
    private l2Cache: CacheService       // Redis (slower, larger)
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache (in-memory)
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // Try L2 cache (Redis)
    const value = await this.l2Cache.get<T>(key);

    if (value) {
      // Populate L1 cache
      this.l1Cache.set(key, value);
    }

    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in both caches
    this.l1Cache.set(key, value);
    await this.l2Cache.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    this.l1Cache.delete(key);
    await this.l2Cache.delete(key);
  }
}
```

**Cache Stampede Prevention**
```typescript
class CacheWithStampedePrevention {
  private locks = new Map<string, Promise<any>>();

  constructor(private cache: CacheService) {}

  async get<T>(
    key: string,
    loader: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Try cache first
    const cached = await this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    // Check if another request is already loading this key
    if (this.locks.has(key)) {
      return this.locks.get(key);
    }

    // Create lock (promise) for this key
    const loadPromise = (async () => {
      try {
        const value = await loader();
        await this.cache.set(key, value, ttl);
        return value;
      } finally {
        this.locks.delete(key);
      }
    })();

    this.locks.set(key, loadPromise);

    return loadPromise;
  }
}

// Usage
const cache = new CacheWithStampedePrevention(cacheService);

// Multiple concurrent requests for same key will only trigger one database query
const [result1, result2, result3] = await Promise.all([
  cache.get('user:123', () => db.getUserById('123')),
  cache.get('user:123', () => db.getUserById('123')),
  cache.get('user:123', () => db.getUserById('123'))
]);
// Only one database query executed!
```

### Performance Monitoring

**Response Time Tracking**
```typescript
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  async measure<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.recordMetric(operation, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(`${operation}:error`, duration);
      throw error;
    }
  }

  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    this.metrics.get(operation)!.push(duration);

    // Keep only last 1000 measurements
    const measurements = this.metrics.get(operation)!;
    if (measurements.length > 1000) {
      measurements.shift();
    }
  }

  getStats(operation: string): PerformanceStats | null {
    const measurements = this.metrics.get(operation);

    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);

    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  getAllStats(): Map<string, PerformanceStats> {
    const stats = new Map<string, PerformanceStats>();

    for (const operation of this.metrics.keys()) {
      const operationStats = this.getStats(operation);
      if (operationStats) {
        stats.set(operation, operationStats);
      }
    }

    return stats;
  }
}

interface PerformanceStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

// Usage
const monitor = new PerformanceMonitor();

const user = await monitor.measure('db:getUser', async () => {
  return userRepository.findById(userId);
});

// Get statistics
const stats = monitor.getStats('db:getUser');
console.log('Database query performance:', stats);
// { count: 1000, min: 5, max: 250, avg: 25, p50: 20, p95: 50, p99: 100 }
```

---

## Understanding

### Scalability Patterns

**CQRS (Command Query Responsibility Segregation)**
- Separate read and write models
- Optimize each independently
- Scale reads and writes separately
- Eventual consistency between models

**Event Sourcing**
- Store events instead of current state
- Rebuild state from events
- Complete audit trail
- Enables time travel and replay

**Saga Pattern**
- Manage distributed transactions
- Compensating transactions for rollback
- Eventual consistency
- Complex but scalable

### Performance Testing

**Load Testing**
- Test system under expected load
- Identify performance bottlenecks
- Validate scalability
- Tools: Apache JMeter, k6, Gatling

**Stress Testing**
- Test system beyond normal capacity
- Find breaking point
- Identify failure modes
- Plan for peak loads

**Spike Testing**
- Sudden increase in load
- Test auto-scaling
- Identify resource limits
- Plan for traffic spikes

**Endurance Testing**
- Sustained load over time
- Identify memory leaks
- Test resource cleanup
- Validate long-term stability

### Best Practices

1. **Measure Before Optimizing**
   - Profile to find bottlenecks
   - Don't guess, measure
   - Focus on biggest impact
   - Avoid premature optimization

2. **Cache Strategically**
   - Cache expensive operations
   - Set appropriate TTLs
   - Implement cache invalidation
   - Monitor cache hit rates

3. **Design for Horizontal Scaling**
   - Stateless services
   - Externalize session state
   - Use load balancers
   - Enable auto-scaling

4. **Optimize Database Access**
   - Use indexes wisely
   - Avoid N+1 queries
   - Use connection pooling
   - Consider read replicas

5. **Implement Asynchronous Processing**
   - Decouple long-running tasks
   - Use message queues
   - Implement retry logic
   - Monitor queue depth

6. **Monitor and Alert**
   - Track key metrics (latency, throughput, errors)
   - Set up alerts for anomalies
   - Use distributed tracing
   - Implement health checks

### Common Pitfalls

1. **Premature Optimization**
   - Optimizing before measuring
   - Adding complexity without benefit
   - Focus on correctness first

2. **Over-Caching**
   - Caching everything
   - Stale data issues
   - Memory pressure
   - Cache invalidation complexity

3. **Ignoring Database Performance**
   - Missing indexes
   - N+1 queries
   - Large result sets
   - Inefficient queries

4. **Synchronous Processing**
   - Blocking on long operations
   - Poor user experience
   - Resource waste
   - Limited scalability

5. **Single Point of Failure**
   - No redundancy
   - No failover
   - Downtime risk
   - Scalability limit

6. **Insufficient Monitoring**
   - No visibility into performance
   - Can't identify bottlenecks
   - Reactive instead of proactive
   - Difficult troubleshooting

---

## References

- **Designing Data-Intensive Applications**: Martin Kleppmann
- **High Performance Browser Networking**: Ilya Grigorik
- **Site Reliability Engineering**: Google
- **The Art of Scalability**: Martin L. Abbott, Michael T. Fisher
- **Database Internals**: Alex Petrov
- **Redis in Action**: Josiah L. Carlson
- **CAP Theorem**: Eric Brewer
- **Latency Numbers**: Jeff Dean (Google)

