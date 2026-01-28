# Hybrid Database Example: E-Learning Platform

## Overview

This example demonstrates a comprehensive hybrid database architecture using multiple database types together:

- **PostgreSQL** - Relational data (users, courses, enrollments)
- **Redis** - Caching and session management
- **MongoDB** - Activity logs and analytics
- **Pinecone** - Semantic search for course content

**Use Case**: E-learning platform with user management, course catalog, real-time analytics, and AI-powered course search.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│                     (Node.js / Express API)                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │   PostgreSQL     │  │    Redis     │  │   MongoDB    │
    │  (Primary Data)  │  │   (Cache)    │  │    (Logs)    │
    └──────────────────┘  └──────────────┘  └──────────────┘
                │                                  │
                │                                  │
                ▼                                  ▼
    ┌──────────────────┐              ┌──────────────────┐
    │    Pinecone      │              │   Analytics      │
    │ (Vector Search)  │              │    Pipeline      │
    └──────────────────┘              └──────────────────┘
```

---

## Data Flow

### 1. User Registration Flow

```
User Registration Request
    │
    ├─> PostgreSQL: Create user record (ACID transaction)
    │
    ├─> Redis: Cache user profile (TTL: 1 hour)
    │
    └─> MongoDB: Log registration event
```

### 2. Course Search Flow

```
Search Query: "machine learning fundamentals"
    │
    ├─> Redis: Check cache for query results
    │   └─> Cache HIT: Return cached results
    │   └─> Cache MISS: Continue to vector search
    │
    ├─> Pinecone: Semantic search for relevant courses
    │   └─> Returns: [course_id_1, course_id_2, ...]
    │
    ├─> PostgreSQL: Fetch course details by IDs
    │
    ├─> Redis: Cache search results (TTL: 15 minutes)
    │
    └─> MongoDB: Log search query and results
```

### 3. Course Enrollment Flow

```
Enrollment Request
    │
    ├─> PostgreSQL: Create enrollment record (transaction)
    │   ├─> Check course capacity
    │   ├─> Insert enrollment
    │   └─> Update course enrollment count
    │
    ├─> Redis: Invalidate user's enrollment cache
    │
    └─> MongoDB: Log enrollment event with metadata
```

---

## Database Schemas

### PostgreSQL Schema (Relational Data)

**Purpose**: Store structured, transactional data with strong consistency

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT NOT NULL REFERENCES users(id),
    category VARCHAR(100),
    difficulty_level VARCHAR(50),
    max_students INT,
    current_enrollment INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_enrollment CHECK (current_enrollment <= max_students)
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;

-- Enrollments table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage INT NOT NULL DEFAULT 0,
    
    UNIQUE(user_id, course_id),
    CONSTRAINT chk_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_completed ON enrollments(completed_at) WHERE completed_at IS NOT NULL;
```

---

### Redis Schema (Caching)

**Purpose**: Cache frequently accessed data, manage sessions, rate limiting

**Key Patterns**:

```javascript
// User profile cache
user:{user_id}                    // Hash: User profile data
user:{user_id}:enrollments        // Set: Enrolled course IDs
user:{user_id}:session            // String: Session token

// Course cache
course:{course_id}                // Hash: Course details
course:{course_id}:students       // Set: Enrolled student IDs
courses:popular                   // Sorted Set: Popular courses (by enrollment)

// Search cache
search:{query_hash}               // String: Cached search results (JSON)

// Rate limiting
ratelimit:{user_id}:{endpoint}    // String: Request count (TTL: 1 minute)

// Session management
session:{session_token}           // Hash: Session data (TTL: 24 hours)
```

**Example Redis Commands**:

```bash
# Cache user profile (TTL: 1 hour)
HSET user:123 id 123 email "john@example.com" full_name "John Doe"
EXPIRE user:123 3600

# Cache user enrollments
SADD user:123:enrollments 1 5 12

# Cache popular courses (sorted by enrollment count)
ZADD courses:popular 150 "course:1" 200 "course:5" 75 "course:12"

# Cache search results (TTL: 15 minutes)
SETEX search:ml_fundamentals 900 '{"results":[1,5,12],"count":3}'

# Rate limiting (max 100 requests per minute)
INCR ratelimit:123:search
EXPIRE ratelimit:123:search 60
```

---

### MongoDB Schema (Activity Logs)

**Purpose**: Store semi-structured event logs and analytics data

**Collections**:

```javascript
// user_activity collection
{
  _id: ObjectId("..."),
  user_id: 123,
  event_type: "course_view",
  event_data: {
    course_id: 5,
    duration_seconds: 45,
    page: "course_overview"
  },
  metadata: {
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0...",
    referrer: "https://example.com/courses"
  },
  timestamp: ISODate("2024-01-20T10:30:00Z")
}

// search_logs collection
{
  _id: ObjectId("..."),
  user_id: 123,
  query: "machine learning fundamentals",
  results_count: 15,
  clicked_result: 5,
  click_position: 2,
  search_duration_ms: 234,
  timestamp: ISODate("2024-01-20T10:30:00Z")
}

// enrollment_events collection
{
  _id: ObjectId("..."),
  user_id: 123,
  course_id: 5,
  event_type: "enrollment_created",
  event_data: {
    payment_method: "credit_card",
    price_paid: 49.99,
    discount_applied: 10.00
  },
  timestamp: ISODate("2024-01-20T10:30:00Z")
}
```

**MongoDB Indexes**:

```javascript
// user_activity collection
db.user_activity.createIndex({ user_id: 1, timestamp: -1 });
db.user_activity.createIndex({ event_type: 1, timestamp: -1 });
db.user_activity.createIndex({ timestamp: -1 });

// search_logs collection
db.search_logs.createIndex({ user_id: 1, timestamp: -1 });
db.search_logs.createIndex({ query: 1, timestamp: -1 });
db.search_logs.createIndex({ timestamp: -1 });

// enrollment_events collection
db.enrollment_events.createIndex({ user_id: 1, timestamp: -1 });
db.enrollment_events.createIndex({ course_id: 1, timestamp: -1 });
db.enrollment_events.createIndex({ event_type: 1, timestamp: -1 });
```

---

### Pinecone Schema (Vector Search)

**Purpose**: Semantic search for course content

**Index Configuration**:

```python
# Pinecone index configuration
{
  "name": "course-search",
  "dimension": 1536,  # OpenAI text-embedding-3-small
  "metric": "cosine",
  "pod_type": "p1.x1"
}
```

**Vector Format**:

```python
# Course vector record
{
  "id": "course_5",
  "values": [0.123, -0.456, ...],  # 1536-dimensional embedding
  "metadata": {
    "course_id": 5,
    "title": "Machine Learning Fundamentals",
    "category": "AI/ML",
    "difficulty": "beginner",
    "instructor_id": 42,
    "price": 49.99,
    "enrollment_count": 200
  }
}
```

---

## Implementation

### Database Connection Manager

**File: `database/connection-manager.js`**

```javascript
const { Pool } = require('pg');
const redis = require('redis');
const { MongoClient } = require('mongodb');
const { PineconeClient } = require('@pinecone-database/pinecone');

class DatabaseManager {
  constructor() {
    this.postgres = null;
    this.redis = null;
    this.mongodb = null;
    this.pinecone = null;
  }

  async connect() {
    // PostgreSQL connection
    this.postgres = new Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Redis connection
    this.redis = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });
    await this.redis.connect();

    // MongoDB connection
    const mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    this.mongodb = mongoClient.db(process.env.MONGODB_DB);

    // Pinecone connection
    this.pinecone = new PineconeClient();
    await this.pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    });

    console.log('All databases connected successfully');
  }

  async disconnect() {
    if (this.postgres) await this.postgres.end();
    if (this.redis) await this.redis.quit();
    if (this.mongodb) await this.mongodb.client.close();
    console.log('All databases disconnected');
  }

  getPostgres() { return this.postgres; }
  getRedis() { return this.redis; }
  getMongoDB() { return this.mongodb; }
  getPinecone() { return this.pinecone; }
}

module.exports = new DatabaseManager();
```

---

### User Service (PostgreSQL + Redis)

**File: `services/user-service.js`**

```javascript
const dbManager = require('../database/connection-manager');

class UserService {
  async createUser(userData) {
    const postgres = dbManager.getPostgres();
    const redis = dbManager.getRedis();
    const mongodb = dbManager.getMongoDB();

    // 1. Create user in PostgreSQL (ACID transaction)
    const result = await postgres.query(
      `INSERT INTO users (email, username, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, full_name, role, created_at`,
      [userData.email, userData.username, userData.passwordHash,
       userData.fullName, userData.role || 'student']
    );

    const user = result.rows[0];

    // 2. Cache user profile in Redis (TTL: 1 hour)
    const cacheKey = `user:${user.id}`;
    await redis.hSet(cacheKey, {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    });
    await redis.expire(cacheKey, 3600);

    // 3. Log registration event in MongoDB
    await mongodb.collection('user_activity').insertOne({
      user_id: user.id,
      event_type: 'user_registered',
      event_data: {
        email: user.email,
        role: user.role
      },
      metadata: {
        ip_address: userData.ipAddress,
        user_agent: userData.userAgent
      },
      timestamp: new Date()
    });

    return user;
  }

  async getUser(userId) {
    const redis = dbManager.getRedis();
    const postgres = dbManager.getPostgres();

    // 1. Try cache first
    const cacheKey = `user:${userId}`;
    const cached = await redis.hGetAll(cacheKey);

    if (cached && Object.keys(cached).length > 0) {
      console.log('Cache HIT for user:', userId);
      return {
        id: parseInt(cached.id),
        email: cached.email,
        username: cached.username,
        full_name: cached.full_name,
        role: cached.role
      };
    }

    // 2. Cache MISS - query PostgreSQL
    console.log('Cache MISS for user:', userId);
    const result = await postgres.query(
      'SELECT id, email, username, full_name, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // 3. Store in cache
    await redis.hSet(cacheKey, {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    });
    await redis.expire(cacheKey, 3600);

    return user;
  }

  async updateUser(userId, updates) {
    const postgres = dbManager.getPostgres();
    const redis = dbManager.getRedis();

    // 1. Update in PostgreSQL
    const result = await postgres.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, username, full_name, role`,
      [updates.fullName, userId]
    );

    const user = result.rows[0];

    // 2. Invalidate cache
    await redis.del(`user:${userId}`);

    return user;
  }
}

module.exports = new UserService();
```

---

### Course Search Service (Pinecone + PostgreSQL + Redis)

**File: `services/course-search-service.js`**

```javascript
const dbManager = require('../database/connection-manager');
const { OpenAI } = require('openai');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class CourseSearchService {
  async searchCourses(query, options = {}) {
    const redis = dbManager.getRedis();
    const pinecone = dbManager.getPinecone();
    const postgres = dbManager.getPostgres();
    const mongodb = dbManager.getMongoDB();

    const { topK = 10, category = null, userId = null } = options;

    // 1. Generate cache key
    const cacheKey = `search:${this.hashQuery(query, options)}`;

    // 2. Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache HIT for search:', query);
      const results = JSON.parse(cached);

      // Log cache hit
      if (userId) {
        await this.logSearch(userId, query, results.length, 'cache_hit');
      }

      return results;
    }

    console.log('Cache MISS for search:', query);

    // 3. Generate query embedding
    const embedding = await this.generateEmbedding(query);

    // 4. Search Pinecone
    const index = pinecone.Index('course-search');
    const filter = category ? { category: { $eq: category } } : {};

    const searchResults = await index.query({
      vector: embedding,
      topK: topK,
      includeMetadata: true,
      filter: filter
    });

    // 5. Extract course IDs
    const courseIds = searchResults.matches.map(match =>
      parseInt(match.metadata.course_id)
    );

    if (courseIds.length === 0) {
      return [];
    }

    // 6. Fetch full course details from PostgreSQL
    const placeholders = courseIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await postgres.query(
      `SELECT id, title, description, category, difficulty_level,
              price, current_enrollment, instructor_id
       FROM courses
       WHERE id IN (${placeholders}) AND is_published = true
       ORDER BY ARRAY_POSITION($${courseIds.length + 1}::int[], id)`,
      [...courseIds, courseIds]
    );

    const courses = result.rows.map((course, index) => ({
      ...course,
      similarity_score: searchResults.matches[index].score
    }));

    // 7. Cache results (TTL: 15 minutes)
    await redis.setEx(cacheKey, 900, JSON.stringify(courses));

    // 8. Log search in MongoDB
    if (userId) {
      await this.logSearch(userId, query, courses.length, 'vector_search');
    }

    return courses;
  }

  async generateEmbedding(text) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return response.data[0].embedding;
  }

  hashQuery(query, options) {
    const str = JSON.stringify({ query, ...options });
    return crypto.createHash('md5').update(str).digest('hex');
  }

  async logSearch(userId, query, resultsCount, searchType) {
    const mongodb = dbManager.getMongoDB();
    await mongodb.collection('search_logs').insertOne({
      user_id: userId,
      query: query,
      results_count: resultsCount,
      search_type: searchType,
      timestamp: new Date()
    });
  }

  async indexCourse(courseId) {
    const postgres = dbManager.getPostgres();
    const pinecone = dbManager.getPinecone();

    // 1. Fetch course from PostgreSQL
    const result = await postgres.query(
      `SELECT id, title, description, category, difficulty_level,
              price, current_enrollment, instructor_id
       FROM courses WHERE id = $1`,
      [courseId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Course ${courseId} not found`);
    }

    const course = result.rows[0];

    // 2. Generate embedding from title + description
    const text = `${course.title}. ${course.description}`;
    const embedding = await this.generateEmbedding(text);

    // 3. Upsert to Pinecone
    const index = pinecone.Index('course-search');
    await index.upsert([{
      id: `course_${course.id}`,
      values: embedding,
      metadata: {
        course_id: course.id,
        title: course.title,
        category: course.category,
        difficulty: course.difficulty_level,
        instructor_id: course.instructor_id,
        price: parseFloat(course.price),
        enrollment_count: course.current_enrollment
      }
    }]);

    console.log(`Indexed course ${courseId} in Pinecone`);
  }
}

module.exports = new CourseSearchService();
```

---

### Enrollment Service (PostgreSQL + Redis + MongoDB)

**File: `services/enrollment-service.js`**

```javascript
const dbManager = require('../database/connection-manager');

class EnrollmentService {
  async enrollUser(userId, courseId, paymentData) {
    const postgres = dbManager.getPostgres();
    const redis = dbManager.getRedis();
    const mongodb = dbManager.getMongoDB();

    // Use PostgreSQL transaction for ACID guarantees
    const client = await postgres.connect();

    try {
      await client.query('BEGIN');

      // 1. Check course capacity
      const courseResult = await client.query(
        `SELECT id, max_students, current_enrollment, price
         FROM courses
         WHERE id = $1 AND is_published = true
         FOR UPDATE`,  // Lock row for update
        [courseId]
      );

      if (courseResult.rows.length === 0) {
        throw new Error('Course not found or not published');
      }

      const course = courseResult.rows[0];

      if (course.current_enrollment >= course.max_students) {
        throw new Error('Course is full');
      }

      // 2. Check if already enrolled
      const existingEnrollment = await client.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (existingEnrollment.rows.length > 0) {
        throw new Error('User already enrolled in this course');
      }

      // 3. Create enrollment
      const enrollmentResult = await client.query(
        `INSERT INTO enrollments (user_id, course_id, progress_percentage)
         VALUES ($1, $2, 0)
         RETURNING id, enrolled_at`,
        [userId, courseId]
      );

      const enrollment = enrollmentResult.rows[0];

      // 4. Update course enrollment count
      await client.query(
        `UPDATE courses
         SET current_enrollment = current_enrollment + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [courseId]
      );

      await client.query('COMMIT');

      // 5. Invalidate caches
      await redis.del(`user:${userId}:enrollments`);
      await redis.del(`course:${courseId}`);
      await redis.del(`course:${courseId}:students`);

      // 6. Log enrollment event in MongoDB
      await mongodb.collection('enrollment_events').insertOne({
        user_id: userId,
        course_id: courseId,
        event_type: 'enrollment_created',
        event_data: {
          payment_method: paymentData.method,
          price_paid: parseFloat(course.price),
          discount_applied: paymentData.discount || 0
        },
        timestamp: new Date()
      });

      return {
        enrollment_id: enrollment.id,
        enrolled_at: enrollment.enrolled_at,
        course_id: courseId,
        user_id: userId
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserEnrollments(userId) {
    const postgres = dbManager.getPostgres();
    const redis = dbManager.getRedis();

    // 1. Check cache
    const cacheKey = `user:${userId}:enrollments`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('Cache HIT for user enrollments:', userId);
      return JSON.parse(cached);
    }

    // 2. Query PostgreSQL
    console.log('Cache MISS for user enrollments:', userId);
    const result = await postgres.query(
      `SELECT e.id, e.course_id, e.enrolled_at, e.progress_percentage,
              c.title, c.description, c.category, c.difficulty_level
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    const enrollments = result.rows;

    // 3. Cache results (TTL: 5 minutes)
    await redis.setEx(cacheKey, 300, JSON.stringify(enrollments));

    return enrollments;
  }
}

module.exports = new EnrollmentService();
```

---

## Consistency Strategies

### 1. Cache Invalidation Strategy

**Pattern**: Write-through with TTL

```javascript
async function updateCourse(courseId, updates) {
  const postgres = dbManager.getPostgres();
  const redis = dbManager.getRedis();

  // 1. Update PostgreSQL (source of truth)
  await postgres.query(
    'UPDATE courses SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [updates.title, courseId]
  );

  // 2. Invalidate all related caches
  await redis.del(`course:${courseId}`);
  await redis.del(`course:${courseId}:students`);

  // 3. Invalidate search cache (pattern delete)
  const keys = await redis.keys('search:*');
  if (keys.length > 0) {
    await redis.del(keys);
  }

  // 4. Re-index in Pinecone
  await courseSearchService.indexCourse(courseId);
}
```

**Key Principles**:
- ✅ PostgreSQL is the source of truth
- ✅ Cache invalidation happens immediately after write
- ✅ TTL provides automatic cleanup for stale data
- ✅ Pattern-based invalidation for search caches

---

### 2. Eventual Consistency for Analytics

**Pattern**: Asynchronous logging to MongoDB

```javascript
async function logActivity(userId, eventType, eventData) {
  const mongodb = dbManager.getMongoDB();

  // Fire-and-forget: Don't wait for MongoDB write
  mongodb.collection('user_activity').insertOne({
    user_id: userId,
    event_type: eventType,
    event_data: eventData,
    timestamp: new Date()
  }).catch(err => {
    console.error('Failed to log activity:', err);
    // Don't fail the main operation if logging fails
  });
}
```

**Key Principles**:
- ✅ Analytics don't block user operations
- ✅ Eventual consistency is acceptable for logs
- ✅ Failures in logging don't affect user experience

---

### 3. Transactional Consistency

**Pattern**: PostgreSQL transactions for critical operations

```javascript
async function transferEnrollment(fromUserId, toUserId, courseId) {
  const client = await postgres.connect();

  try {
    await client.query('BEGIN');

    // 1. Remove enrollment from first user
    await client.query(
      'DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [fromUserId, courseId]
    );

    // 2. Add enrollment to second user
    await client.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
      [toUserId, courseId]
    );

    // 3. Commit transaction (all-or-nothing)
    await client.query('COMMIT');

    // 4. Invalidate caches after successful commit
    await redis.del(`user:${fromUserId}:enrollments`);
    await redis.del(`user:${toUserId}:enrollments`);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Key Principles**:
- ✅ Use transactions for operations requiring ACID guarantees
- ✅ Invalidate caches only after successful commit
- ✅ Always release database connections

---

### 4. Vector Search Consistency

**Pattern**: Async indexing with eventual consistency

```javascript
async function publishCourse(courseId) {
  const postgres = dbManager.getPostgres();

  // 1. Update PostgreSQL immediately
  await postgres.query(
    'UPDATE courses SET is_published = true WHERE id = $1',
    [courseId]
  );

  // 2. Index in Pinecone asynchronously
  // Use job queue (e.g., Bull, BullMQ) for production
  setTimeout(async () => {
    try {
      await courseSearchService.indexCourse(courseId);
      console.log(`Course ${courseId} indexed in Pinecone`);
    } catch (error) {
      console.error(`Failed to index course ${courseId}:`, error);
      // Retry logic here
    }
  }, 0);

  // 3. Invalidate caches
  await redis.del(`course:${courseId}`);
}
```

**Key Principles**:
- ✅ PostgreSQL updated immediately (source of truth)
- ✅ Vector indexing happens asynchronously
- ✅ Short delay in search results is acceptable
- ✅ Use job queues for production reliability

---

## Best Practices

### 1. Database Selection Guidelines

| Data Type | Database | Reason |
|-----------|----------|--------|
| User accounts, enrollments | PostgreSQL | ACID transactions, strong consistency |
| Session data, rate limiting | Redis | Fast access, automatic expiration |
| Activity logs, analytics | MongoDB | Flexible schema, high write throughput |
| Course search | Pinecone | Semantic similarity search |

---

### 2. Caching Strategy

**Cache Hierarchy**:

```
Request
  ↓
Redis Cache (L1) ─── TTL: 5-60 minutes
  ↓ (miss)
PostgreSQL (Source of Truth)
  ↓
Update Redis Cache
  ↓
Return Response
```

**TTL Guidelines**:
- User profiles: 1 hour (changes infrequently)
- Course details: 30 minutes (moderate changes)
- Search results: 15 minutes (needs freshness)
- User enrollments: 5 minutes (changes frequently)
- Session data: 24 hours (explicit expiration)

---

### 3. Error Handling

```javascript
async function robustGetUser(userId) {
  try {
    // Try cache first
    const cached = await redis.get(`user:${userId}`);
    if (cached) return JSON.parse(cached);
  } catch (redisError) {
    console.error('Redis error:', redisError);
    // Continue to PostgreSQL if Redis fails
  }

  try {
    // Fallback to PostgreSQL
    const result = await postgres.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  } catch (pgError) {
    console.error('PostgreSQL error:', pgError);
    throw new Error('Failed to fetch user');
  }
}
```

**Key Principles**:
- ✅ Graceful degradation (cache failure doesn't break app)
- ✅ Always have fallback to source of truth
- ✅ Log errors for monitoring

---

### 4. Monitoring and Observability

**Metrics to Track**:

```javascript
// Cache hit rate
const cacheHitRate = cacheHits / (cacheHits + cacheMisses);

// Database query performance
const avgQueryTime = totalQueryTime / queryCount;

// Vector search latency
const avgSearchLatency = totalSearchTime / searchCount;

// MongoDB write throughput
const logsPerSecond = logCount / timeWindow;
```

**Alerts**:
- Cache hit rate < 80%
- PostgreSQL query time > 100ms
- Redis connection failures
- MongoDB write failures
- Pinecone search latency > 500ms

---

## Summary

### Architecture Benefits

✅ **Performance**: Redis caching reduces database load by 80%+
✅ **Scalability**: Each database scales independently
✅ **Flexibility**: Right tool for each data type
✅ **Reliability**: Graceful degradation when components fail
✅ **Analytics**: MongoDB handles high-volume event logging
✅ **Search Quality**: Pinecone enables semantic search

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| PostgreSQL for core data | ACID transactions, strong consistency for critical data |
| Redis for caching | Sub-millisecond latency, automatic expiration |
| MongoDB for logs | Flexible schema, high write throughput, time-series data |
| Pinecone for search | Managed vector database, semantic similarity |
| Cache-aside pattern | Simple, effective, graceful degradation |
| Async logging | Don't block user operations for analytics |
| TTL-based expiration | Automatic cleanup, eventual consistency |

### Trade-offs

**Complexity vs Performance**:
- ❌ More databases = more operational complexity
- ✅ Each database optimized for its use case
- ✅ Better performance than single-database solution

**Consistency vs Availability**:
- ✅ Strong consistency for transactions (PostgreSQL)
- ✅ Eventual consistency for analytics (MongoDB)
- ✅ Cache invalidation ensures freshness

**Cost vs Scale**:
- ❌ Multiple databases = higher infrastructure cost
- ✅ Each database can scale independently
- ✅ Managed services (Pinecone, Redis Cloud) reduce ops burden

---

## Next Steps

1. **Implement monitoring**: Set up metrics and alerts for all databases
2. **Add job queues**: Use Bull/BullMQ for async tasks (indexing, email)
3. **Optimize queries**: Add indexes based on query patterns
4. **Load testing**: Test system under realistic load
5. **Disaster recovery**: Set up backups and replication for all databases
6. **Security**: Implement encryption at rest and in transit

---

## Related Documentation

- **PostgreSQL**: See `../rules/relational-databases.md`
- **Redis**: See `../rules/nosql-key-value-stores.md`
- **MongoDB**: See `../rules/nosql-document-stores.md`
- **Pinecone**: See `../rules/vector-databases.md`
- **Caching**: See `../rules/performance-optimization.md`
- **Transactions**: See `../rules/relational-transactions.md`


