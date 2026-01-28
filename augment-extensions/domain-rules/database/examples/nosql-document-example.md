# NoSQL Document Store Example: Blog Application

## Overview

This example demonstrates a complete blog application using MongoDB as a document store. It covers schema design decisions (embedding vs referencing), aggregation pipelines, indexing strategies, and common query patterns.

---

## Application Requirements

**Features:**
- Users can create accounts
- Users can write blog posts
- Users can comment on posts
- Users can like posts and comments
- Posts can have tags
- Users can follow other users

**Query Patterns:**
- Find all posts by a user
- Find recent posts with author info
- Find posts by tag
- Find comments for a post
- Find user's feed (posts from followed users)
- Count likes on posts
- Find popular posts (most likes/comments)

---

## Schema Design

### Collections

**users** - User accounts
**posts** - Blog posts
**comments** - Comments on posts
**tags** - Post tags

### Design Decisions

#### Decision 1: User Profile (Embedding)

**Embed profile data in user document:**

```javascript
// ✅ GOOD: Embed profile (one-to-one, always accessed together)
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "alice_dev",
  "email": "alice@example.com",
  "password_hash": "$2b$10$...",
  "profile": {
    "full_name": "Alice Johnson",
    "bio": "Full-stack developer passionate about web technologies",
    "avatar_url": "https://cdn.example.com/avatars/alice.jpg",
    "location": "San Francisco, CA",
    "website": "https://alice.dev"
  },
  "stats": {
    "post_count": 42,
    "follower_count": 156,
    "following_count": 89
  },
  "created_at": ISODate("2024-01-15T10:00:00Z"),
  "updated_at": ISODate("2024-01-20T14:30:00Z")
}
```

**Why embed?**
- ✅ Profile is always accessed with user data
- ✅ One-to-one relationship
- ✅ Profile data doesn't change frequently
- ✅ Single query to get complete user info

#### Decision 2: Blog Posts (Separate Collection)

**Store posts in separate collection with user reference:**

```javascript
// ✅ GOOD: Separate collection (one-to-many, accessed independently)
{
  "_id": ObjectId("507f191e810c19729de860ea"),
  "author_id": ObjectId("507f1f77bcf86cd799439011"),
  "title": "Getting Started with MongoDB",
  "slug": "getting-started-with-mongodb",
  "content": "MongoDB is a document database that provides...",
  "excerpt": "Learn the basics of MongoDB document modeling...",
  "status": "published",  // draft, published, archived
  "tags": ["mongodb", "database", "nosql"],  // Embedded array (one-to-few)
  "metadata": {
    "read_time_minutes": 5,
    "word_count": 1200,
    "featured_image": "https://cdn.example.com/images/mongodb-intro.jpg"
  },
  "stats": {
    "view_count": 1523,
    "like_count": 87,
    "comment_count": 12
  },
  "published_at": ISODate("2024-01-18T09:00:00Z"),
  "created_at": ISODate("2024-01-15T14:00:00Z"),
  "updated_at": ISODate("2024-01-18T09:00:00Z")
}
```

**Why separate collection?**
- ✅ One-to-many relationship (user has many posts)
- ✅ Posts are accessed independently
- ✅ Posts can be queried without user data
- ✅ Avoids unbounded array growth in user document

**Why embed tags?**
- ✅ One-to-few relationship (< 20 tags per post)
- ✅ Tags are always displayed with post
- ✅ Simple array, no complex queries needed

#### Decision 3: Comments (Separate Collection with Hybrid Approach)

**Store comments separately but embed author display info:**

```javascript
// ✅ GOOD: Hybrid approach (reference + embedded display data)
{
  "_id": ObjectId("507f191e810c19729de860eb"),
  "post_id": ObjectId("507f191e810c19729de860ea"),
  "author_id": ObjectId("507f1f77bcf86cd799439011"),
  "author_display": {  // Embedded for fast display
    "username": "alice_dev",
    "avatar_url": "https://cdn.example.com/avatars/alice.jpg"
  },
  "content": "Great article! Very helpful for beginners.",
  "parent_comment_id": null,  // For nested replies
  "stats": {
    "like_count": 5
  },
  "created_at": ISODate("2024-01-18T10:30:00Z"),
  "updated_at": ISODate("2024-01-18T10:30:00Z")
}
```

**Why separate collection?**
- ✅ One-to-many relationship (post has many comments)
- ✅ Unbounded growth (posts can have hundreds of comments)
- ✅ Comments can be paginated
- ✅ Avoids 16MB document size limit

**Why embed author display data?**
- ✅ Fast display without JOIN
- ✅ Display data rarely changes
- ✅ Small data footprint
- ✅ Can update if needed (eventual consistency acceptable)

#### Decision 4: Likes (Embedded Array with Limit)

**Embed recent likes, reference for full list:**

```javascript
// In posts collection
{
  "_id": ObjectId("507f191e810c19729de860ea"),
  "title": "Getting Started with MongoDB",
  // ... other fields ...
  "stats": {
    "like_count": 87  // Total count
  },
  "recent_likes": [  // Last 10 likes for quick display
    {
      "user_id": ObjectId("507f1f77bcf86cd799439012"),
      "username": "bob_smith",
      "liked_at": ISODate("2024-01-20T15:00:00Z")
    },
    // ... up to 10 recent likes
  ]
}

// Separate likes collection for full history
{
  "_id": ObjectId("507f191e810c19729de860ec"),
  "post_id": ObjectId("507f191e810c19729de860ea"),
  "user_id": ObjectId("507f1f77bcf86cd799439012"),
  "created_at": ISODate("2024-01-20T15:00:00Z")
}
```

**Why hybrid approach?**
- ✅ Fast display of recent likes (embedded)
- ✅ Full history available (separate collection)
- ✅ Bounded array size (max 10 items)
- ✅ Efficient counting (stats.like_count)

---

## Indexing Strategy

### users Collection

```javascript
// Unique index on email (for login)
db.users.createIndex({ "email": 1 }, { unique: true })

// Unique index on username (for profile URLs)
db.users.createIndex({ "username": 1 }, { unique: true })

// Index on created_at (for sorting new users)
db.users.createIndex({ "created_at": -1 })
```

### posts Collection

```javascript
// Compound index for user's posts (sorted by date)
db.posts.createIndex({ "author_id": 1, "published_at": -1 })

// Index on slug (for URL lookups)
db.posts.createIndex({ "slug": 1 }, { unique: true })

// Index on tags (for tag-based queries)
db.posts.createIndex({ "tags": 1 })

// Index on status and published_at (for published posts feed)
db.posts.createIndex({ "status": 1, "published_at": -1 })

// Text index for full-text search
db.posts.createIndex({
  "title": "text",
  "content": "text",
  "excerpt": "text"
})
```

### comments Collection

```javascript
// Compound index for post's comments (sorted by date)
db.comments.createIndex({ "post_id": 1, "created_at": 1 })

// Index on author_id (for user's comments)
db.comments.createIndex({ "author_id": 1, "created_at": -1 })

// Index on parent_comment_id (for nested replies)
db.comments.createIndex({ "parent_comment_id": 1 })
```

### likes Collection

```javascript
// Compound unique index (prevent duplicate likes)
db.likes.createIndex({ "post_id": 1, "user_id": 1 }, { unique: true })

// Index on user_id (for user's liked posts)
db.likes.createIndex({ "user_id": 1, "created_at": -1 })
```

---

## Common Queries

### Query 1: Find All Posts by User

```javascript
// Simple query using author_id index
db.posts.find({
  author_id: ObjectId("507f1f77bcf86cd799439011"),
  status: "published"
})
.sort({ published_at: -1 })
.limit(20)

// With author info (using aggregation)
db.posts.aggregate([
  {
    $match: {
      author_id: ObjectId("507f1f77bcf86cd799439011"),
      status: "published"
    }
  },
  { $sort: { published_at: -1 } },
  { $limit: 20 },
  {
    $lookup: {
      from: "users",
      localField: "author_id",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" },
  {
    $project: {
      title: 1,
      slug: 1,
      excerpt: 1,
      tags: 1,
      stats: 1,
      published_at: 1,
      "author.username": 1,
      "author.profile.full_name": 1,
      "author.profile.avatar_url": 1
    }
  }
])
```

### Query 2: Find Recent Posts with Author Info

```javascript
db.posts.aggregate([
  { $match: { status: "published" } },
  { $sort: { published_at: -1 } },
  { $limit: 20 },
  {
    $lookup: {
      from: "users",
      localField: "author_id",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" },
  {
    $project: {
      title: 1,
      slug: 1,
      excerpt: 1,
      tags: 1,
      stats: 1,
      published_at: 1,
      "author.username": 1,
      "author.profile.full_name": 1,
      "author.profile.avatar_url": 1
    }
  }
])
```

### Query 3: Find Posts by Tag

```javascript
// Using tags index
db.posts.find({
  tags: "mongodb",
  status: "published"
})
.sort({ published_at: -1 })
.limit(20)
```

### Query 4: Find Comments for Post

```javascript
// Using post_id index
db.comments.find({
  post_id: ObjectId("507f191e810c19729de860ea")
})
.sort({ created_at: 1 })
.limit(50)

// With nested replies
db.comments.aggregate([
  {
    $match: {
      post_id: ObjectId("507f191e810c19729de860ea"),
      parent_comment_id: null  // Top-level comments only
    }
  },
  { $sort: { created_at: 1 } },
  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "parent_comment_id",
      as: "replies"
    }
  },
  {
    $project: {
      content: 1,
      author_display: 1,
      stats: 1,
      created_at: 1,
      replies: {
        $slice: ["$replies", 5]  // Limit replies to 5
      }
    }
  }
])
```

### Query 5: User's Feed (Posts from Followed Users)

```javascript
// Assuming follows collection: { follower_id, following_id }

// Step 1: Get followed user IDs
const followedUsers = db.follows.find({
  follower_id: ObjectId("507f1f77bcf86cd799439011")
}).map(f => f.following_id)

// Step 2: Get posts from followed users
db.posts.find({
  author_id: { $in: followedUsers },
  status: "published"
})
.sort({ published_at: -1 })
.limit(50)

// Combined aggregation
db.follows.aggregate([
  {
    $match: {
      follower_id: ObjectId("507f1f77bcf86cd799439011")
    }
  },
  {
    $lookup: {
      from: "posts",
      localField: "following_id",
      foreignField: "author_id",
      as: "posts"
    }
  },
  { $unwind: "$posts" },
  { $match: { "posts.status": "published" } },
  { $replaceRoot: { newRoot: "$posts" } },
  { $sort: { published_at: -1 } },
  { $limit: 50 }
])
```

### Query 6: Popular Posts (Most Likes/Comments)

```javascript
// Most liked posts in last 7 days
db.posts.find({
  status: "published",
  published_at: {
    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
})
.sort({ "stats.like_count": -1 })
.limit(10)

// Most commented posts
db.posts.find({
  status: "published"
})
.sort({ "stats.comment_count": -1 })
.limit(10)

// Combined score (likes + comments)
db.posts.aggregate([
  { $match: { status: "published" } },
  {
    $addFields: {
      popularity_score: {
        $add: ["$stats.like_count", { $multiply: ["$stats.comment_count", 2] }]
      }
    }
  },
  { $sort: { popularity_score: -1 } },
  { $limit: 10 }
])
```

### Query 7: Full-Text Search

```javascript
// Search posts by text
db.posts.find({
  $text: { $search: "mongodb database tutorial" },
  status: "published"
})
.sort({ score: { $meta: "textScore" } })
.limit(20)

// With text score
db.posts.find({
  $text: { $search: "mongodb database tutorial" },
  status: "published"
},
{
  score: { $meta: "textScore" }
})
.sort({ score: { $meta: "textScore" } })
.limit(20)
```

---

## Aggregation Pipeline Examples

### Example 1: User Statistics

```javascript
// Calculate user statistics
db.posts.aggregate([
  {
    $match: {
      author_id: ObjectId("507f1f77bcf86cd799439011"),
      status: "published"
    }
  },
  {
    $group: {
      _id: "$author_id",
      total_posts: { $sum: 1 },
      total_views: { $sum: "$stats.view_count" },
      total_likes: { $sum: "$stats.like_count" },
      total_comments: { $sum: "$stats.comment_count" },
      avg_likes_per_post: { $avg: "$stats.like_count" },
      most_popular_post: { $max: "$stats.view_count" }
    }
  }
])
```

### Example 2: Tag Popularity

```javascript
// Find most popular tags
db.posts.aggregate([
  { $match: { status: "published" } },
  { $unwind: "$tags" },
  {
    $group: {
      _id: "$tags",
      post_count: { $sum: 1 },
      total_likes: { $sum: "$stats.like_count" }
    }
  },
  { $sort: { post_count: -1 } },
  { $limit: 20 }
])
```

### Example 3: Monthly Post Count

```javascript
// Posts per month
db.posts.aggregate([
  { $match: { status: "published" } },
  {
    $group: {
      _id: {
        year: { $year: "$published_at" },
        month: { $month: "$published_at" }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } }
])
```

### Example 4: Top Authors by Engagement

```javascript
// Find authors with highest engagement
db.posts.aggregate([
  { $match: { status: "published" } },
  {
    $group: {
      _id: "$author_id",
      post_count: { $sum: 1 },
      total_likes: { $sum: "$stats.like_count" },
      total_comments: { $sum: "$stats.comment_count" },
      total_views: { $sum: "$stats.view_count" }
    }
  },
  {
    $addFields: {
      engagement_score: {
        $add: [
          "$total_likes",
          { $multiply: ["$total_comments", 2] },
          { $divide: ["$total_views", 10] }
        ]
      }
    }
  },
  { $sort: { engagement_score: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "author"
    }
  },
  { $unwind: "$author" },
  {
    $project: {
      "author.username": 1,
      "author.profile.full_name": 1,
      post_count: 1,
      total_likes: 1,
      total_comments: 1,
      total_views: 1,
      engagement_score: 1
    }
  }
])
```

---

## Update Operations

### Update Post Stats (Increment Like Count)

```javascript
// Increment like count
db.posts.updateOne(
  { _id: ObjectId("507f191e810c19729de860ea") },
  {
    $inc: { "stats.like_count": 1 },
    $set: { updated_at: new Date() }
  }
)

// Add to recent_likes array (keep last 10)
db.posts.updateOne(
  { _id: ObjectId("507f191e810c19729de860ea") },
  {
    $push: {
      recent_likes: {
        $each: [{
          user_id: ObjectId("507f1f77bcf86cd799439012"),
          username: "bob_smith",
          liked_at: new Date()
        }],
        $position: 0,
        $slice: 10
      }
    },
    $inc: { "stats.like_count": 1 }
  }
)
```

### Update Comment Count

```javascript
// Increment comment count when comment is added
db.posts.updateOne(
  { _id: ObjectId("507f191e810c19729de860ea") },
  {
    $inc: { "stats.comment_count": 1 },
    $set: { updated_at: new Date() }
  }
)
```

### Update User Stats

```javascript
// Increment post count when post is published
db.users.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  {
    $inc: { "stats.post_count": 1 },
    $set: { updated_at: new Date() }
  }
)
```

### Update Author Display Info (Eventual Consistency)

```javascript
// When user changes username/avatar, update all comments
db.comments.updateMany(
  { author_id: ObjectId("507f1f77bcf86cd799439011") },
  {
    $set: {
      "author_display.username": "alice_developer",
      "author_display.avatar_url": "https://cdn.example.com/avatars/alice-new.jpg"
    }
  }
)
```

---

## Schema Validation

### users Collection Validation

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password_hash", "created_at"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 30,
          pattern: "^[a-zA-Z0-9_]+$",
          description: "Username must be 3-30 alphanumeric characters"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address"
        },
        password_hash: {
          bsonType: "string",
          description: "Hashed password"
        },
        profile: {
          bsonType: "object",
          properties: {
            full_name: { bsonType: "string" },
            bio: { bsonType: "string", maxLength: 500 },
            avatar_url: { bsonType: "string" },
            location: { bsonType: "string" },
            website: { bsonType: "string" }
          }
        },
        stats: {
          bsonType: "object",
          properties: {
            post_count: { bsonType: "int", minimum: 0 },
            follower_count: { bsonType: "int", minimum: 0 },
            following_count: { bsonType: "int", minimum: 0 }
          }
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
})
```

### posts Collection Validation

```javascript
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["author_id", "title", "slug", "content", "status", "created_at"],
      properties: {
        author_id: { bsonType: "objectId" },
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$"
        },
        content: { bsonType: "string" },
        excerpt: { bsonType: "string", maxLength: 500 },
        status: {
          enum: ["draft", "published", "archived"]
        },
        tags: {
          bsonType: "array",
          maxItems: 20,
          items: { bsonType: "string" }
        },
        stats: {
          bsonType: "object",
          properties: {
            view_count: { bsonType: "int", minimum: 0 },
            like_count: { bsonType: "int", minimum: 0 },
            comment_count: { bsonType: "int", minimum: 0 }
          }
        },
        published_at: { bsonType: "date" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
})
```

---

## Performance Considerations

### Query Optimization

**Use projection to limit returned fields:**
```javascript
// ❌ BAD: Returns entire document
db.posts.find({ status: "published" })

// ✅ GOOD: Returns only needed fields
db.posts.find(
  { status: "published" },
  { title: 1, slug: 1, excerpt: 1, published_at: 1 }
)
```

**Use covered queries (index-only):**
```javascript
// Create index
db.posts.createIndex({ status: 1, published_at: -1, title: 1 })

// Query uses only indexed fields
db.posts.find(
  { status: "published" },
  { _id: 0, title: 1, published_at: 1 }
).sort({ published_at: -1 })
```

**Use explain() to analyze queries:**
```javascript
db.posts.find({ status: "published" }).explain("executionStats")
```

### Denormalization Trade-offs

**Embedded author display data:**
- ✅ **Pro**: Fast reads (no JOIN)
- ❌ **Con**: Must update when author changes username/avatar
- ✅ **Acceptable**: Display data changes infrequently

**Embedded stats:**
- ✅ **Pro**: Fast display of counts
- ❌ **Con**: Must update on every like/comment
- ✅ **Acceptable**: Atomic updates with $inc

### Sharding Strategy

**Shard key for posts collection:**
```javascript
// Shard by author_id (good for user-specific queries)
sh.shardCollection("blog.posts", { author_id: 1, _id: 1 })

// OR shard by published_at (good for time-based queries)
sh.shardCollection("blog.posts", { published_at: -1, _id: 1 })
```

---

## Summary

**Key Design Decisions:**
- ✅ **Embed**: Profile data (one-to-one), tags (one-to-few), recent likes (bounded)
- ✅ **Reference**: Posts (one-to-many), comments (unbounded), full likes history
- ✅ **Hybrid**: Author display data (reference + embedded for performance)

**Indexing Strategy:**
- ✅ Unique indexes on email, username, slug
- ✅ Compound indexes for common query patterns
- ✅ Text indexes for full-text search

**Performance Tips:**
- ✅ Use projection to limit returned fields
- ✅ Use aggregation pipelines for complex queries
- ✅ Denormalize for read performance (accept eventual consistency)
- ✅ Use $inc for atomic counter updates
- ✅ Monitor query performance with explain()

**Trade-offs:**
- **Embedding**: Faster reads, harder updates, bounded size
- **Referencing**: Flexible queries, slower reads (JOINs), unbounded growth
- **Hybrid**: Best of both worlds, complexity in maintaining consistency


