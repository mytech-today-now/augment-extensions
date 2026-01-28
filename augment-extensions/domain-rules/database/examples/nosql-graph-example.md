# NoSQL Graph Database Example: Social Network

## Overview

This example demonstrates a complete social network application using Neo4j as a graph database. It covers node and relationship modeling, Cypher queries for friend recommendations, mutual friends, shortest path, and graph traversal patterns.

---

## Application Requirements

**Features:**
- Users can create profiles
- Users can follow other users
- Users can create posts
- Users can like posts
- Users can comment on posts
- Users can join groups
- Users can tag other users in posts

**Query Patterns:**
- Find friends (mutual follows)
- Find followers and following
- Recommend users to follow (friends of friends)
- Find mutual friends
- Calculate shortest path between users
- Find popular users (most followers)
- Find posts from friends
- Find common interests (shared groups)

---

## Graph Model

### Nodes

**User:**
```cypher
(:User {
  id: "user123",
  username: "alice_dev",
  email: "alice@example.com",
  full_name: "Alice Johnson",
  bio: "Full-stack developer",
  avatar_url: "https://cdn.example.com/avatars/alice.jpg",
  location: "San Francisco, CA",
  created_at: datetime("2024-01-15T10:00:00Z")
})
```

**Post:**
```cypher
(:Post {
  id: "post456",
  content: "Just learned about graph databases!",
  created_at: datetime("2024-01-20T14:30:00Z")
})
```

**Group:**
```cypher
(:Group {
  id: "group789",
  name: "Graph Database Enthusiasts",
  description: "A community for graph database lovers",
  created_at: datetime("2024-01-10T09:00:00Z")
})
```

**Tag:**
```cypher
(:Tag {
  name: "graphdb",
  created_at: datetime("2024-01-01T00:00:00Z")
})
```

### Relationships

**FOLLOWS:**
```cypher
(alice:User)-[:FOLLOWS {since: date("2024-01-15")}]->(bob:User)
```

**POSTED:**
```cypher
(alice:User)-[:POSTED {at: datetime("2024-01-20T14:30:00Z")}]->(post:Post)
```

**LIKES:**
```cypher
(alice:User)-[:LIKES {at: datetime("2024-01-20T15:00:00Z")}]->(post:Post)
```

**COMMENTED:**
```cypher
(alice:User)-[:COMMENTED {
  content: "Great post!",
  at: datetime("2024-01-20T15:30:00Z")
}]->(post:Post)
```

**MEMBER_OF:**
```cypher
(alice:User)-[:MEMBER_OF {
  joined_at: date("2024-01-12"),
  role: "member"
}]->(group:Group)
```

**TAGGED:**
```cypher
(post:Post)-[:TAGGED]->(tag:Tag)
```

**MENTIONS:**
```cypher
(post:Post)-[:MENTIONS]->(user:User)
```

---

## Sample Data Creation

### Create Users

```cypher
// Create multiple users
CREATE (alice:User {
  id: "user001",
  username: "alice_dev",
  email: "alice@example.com",
  full_name: "Alice Johnson",
  bio: "Full-stack developer passionate about graphs",
  location: "San Francisco, CA",
  created_at: datetime()
})

CREATE (bob:User {
  id: "user002",
  username: "bob_smith",
  email: "bob@example.com",
  full_name: "Bob Smith",
  bio: "Data scientist and graph enthusiast",
  location: "New York, NY",
  created_at: datetime()
})

CREATE (charlie:User {
  id: "user003",
  username: "charlie_brown",
  email: "charlie@example.com",
  full_name: "Charlie Brown",
  bio: "Software engineer learning Neo4j",
  location: "Austin, TX",
  created_at: datetime()
})

CREATE (diana:User {
  id: "user004",
  username: "diana_prince",
  email: "diana@example.com",
  full_name: "Diana Prince",
  bio: "Graph database consultant",
  location: "Seattle, WA",
  created_at: datetime()
})

CREATE (eve:User {
  id: "user005",
  username: "eve_adams",
  email: "eve@example.com",
  full_name: "Eve Adams",
  bio: "Backend developer",
  location: "Boston, MA",
  created_at: datetime()
})
```

### Create Relationships

```cypher
// Create follow relationships
MATCH (alice:User {username: "alice_dev"}), (bob:User {username: "bob_smith"})
CREATE (alice)-[:FOLLOWS {since: date("2024-01-15")}]->(bob)

MATCH (alice:User {username: "alice_dev"}), (charlie:User {username: "charlie_brown"})
CREATE (alice)-[:FOLLOWS {since: date("2024-01-16")}]->(charlie)

MATCH (bob:User {username: "bob_smith"}), (alice:User {username: "alice_dev"})
CREATE (bob)-[:FOLLOWS {since: date("2024-01-17")}]->(alice)

MATCH (bob:User {username: "bob_smith"}), (diana:User {username: "diana_prince"})
CREATE (bob)-[:FOLLOWS {since: date("2024-01-18")}]->(diana)

MATCH (charlie:User {username: "charlie_brown"}), (diana:User {username: "diana_prince"})
CREATE (charlie)-[:FOLLOWS {since: date("2024-01-19")}]->(diana)

MATCH (diana:User {username: "diana_prince"}), (eve:User {username: "eve_adams"})
CREATE (diana)-[:FOLLOWS {since: date("2024-01-20")}]->(eve)

MATCH (eve:User {username: "eve_adams"}), (alice:User {username: "alice_dev"})
CREATE (eve)-[:FOLLOWS {since: date("2024-01-21")}]->(alice)
```

### Create Posts and Interactions

```cypher
// Create posts
MATCH (alice:User {username: "alice_dev"})
CREATE (alice)-[:POSTED {at: datetime()}]->(post1:Post {
  id: "post001",
  content: "Just learned about graph databases! Mind = blown 🤯",
  created_at: datetime()
})

MATCH (bob:User {username: "bob_smith"})
CREATE (bob)-[:POSTED {at: datetime()}]->(post2:Post {
  id: "post002",
  content: "Neo4j is amazing for social network queries",
  created_at: datetime()
})

// Create likes
MATCH (bob:User {username: "bob_smith"}), (post1:Post {id: "post001"})
CREATE (bob)-[:LIKES {at: datetime()}]->(post1)

MATCH (charlie:User {username: "charlie_brown"}), (post1:Post {id: "post001"})
CREATE (charlie)-[:LIKES {at: datetime()}]->(post1)

// Create comments
MATCH (bob:User {username: "bob_smith"}), (post1:Post {id: "post001"})
CREATE (bob)-[:COMMENTED {
  content: "Welcome to the graph world!",
  at: datetime()
}]->(post1)
```

### Create Groups

```cypher
// Create groups
CREATE (group1:Group {
  id: "group001",
  name: "Graph Database Enthusiasts",
  description: "A community for graph database lovers",
  created_at: datetime()
})

CREATE (group2:Group {
  id: "group002",
  name: "Neo4j Developers",
  description: "Neo4j development best practices",
  created_at: datetime()
})

// Add members to groups
MATCH (alice:User {username: "alice_dev"}), (group1:Group {id: "group001"})
CREATE (alice)-[:MEMBER_OF {joined_at: date(), role: "member"}]->(group1)

MATCH (bob:User {username: "bob_smith"}), (group1:Group {id: "group001"})
CREATE (bob)-[:MEMBER_OF {joined_at: date(), role: "admin"}]->(group1)

MATCH (charlie:User {username: "charlie_brown"}), (group1:Group {id: "group001"})
CREATE (charlie)-[:MEMBER_OF {joined_at: date(), role: "member"}]->(group1)

MATCH (alice:User {username: "alice_dev"}), (group2:Group {id: "group002"})
CREATE (alice)-[:MEMBER_OF {joined_at: date(), role: "member"}]->(group2)

MATCH (diana:User {username: "diana_prince"}), (group2:Group {id: "group002"})
CREATE (diana)-[:MEMBER_OF {joined_at: date(), role: "admin"}]->(group2)
```

---

## Common Queries

### Query 1: Find Followers and Following

```cypher
// Find who Alice follows
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(following:User)
RETURN following.username, following.full_name

// Find Alice's followers
MATCH (follower:User)-[:FOLLOWS]->(alice:User {username: "alice_dev"})
RETURN follower.username, follower.full_name

// Count followers and following
MATCH (alice:User {username: "alice_dev"})
OPTIONAL MATCH (alice)-[:FOLLOWS]->(following)
OPTIONAL MATCH (follower)-[:FOLLOWS]->(alice)
RETURN
  alice.username,
  count(DISTINCT following) AS following_count,
  count(DISTINCT follower) AS follower_count
```

### Query 2: Find Friends (Mutual Follows)

```cypher
// Find Alice's friends (users who follow each other)
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(alice)
RETURN friend.username, friend.full_name

// Find all mutual follow relationships
MATCH (a:User)-[:FOLLOWS]->(b:User)-[:FOLLOWS]->(a)
WHERE id(a) < id(b)  // Avoid duplicates
RETURN a.username, b.username
```

### Query 3: Recommend Users to Follow (Friends of Friends)

```cypher
// Recommend users to Alice (friends of friends not already following)
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(recommendation:User)
WHERE NOT (alice)-[:FOLLOWS]->(recommendation)  // Not already following
  AND recommendation <> alice  // Not self
RETURN
  recommendation.username,
  recommendation.full_name,
  count(DISTINCT friend) AS mutual_friends
ORDER BY mutual_friends DESC
LIMIT 10
```

### Query 4: Find Mutual Friends

```cypher
// Find mutual friends between Alice and Bob
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(mutual:User)<-[:FOLLOWS]-(bob:User {username: "bob_smith"})
RETURN mutual.username, mutual.full_name

// Count mutual friends
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(mutual:User)<-[:FOLLOWS]-(bob:User {username: "bob_smith"})
RETURN count(mutual) AS mutual_friend_count
```

### Query 5: Shortest Path Between Users

```cypher
// Find shortest path between Alice and Eve
MATCH path = shortestPath(
  (alice:User {username: "alice_dev"})-[:FOLLOWS*]-(eve:User {username: "eve_adams"})
)
RETURN path, length(path) AS distance

// Find shortest path with direction (following only)
MATCH path = shortestPath(
  (alice:User {username: "alice_dev"})-[:FOLLOWS*]->(eve:User {username: "eve_adams"})
)
RETURN path, length(path) AS hops

// Find all shortest paths
MATCH path = allShortestPaths(
  (alice:User {username: "alice_dev"})-[:FOLLOWS*]-(eve:User {username: "eve_adams"})
)
RETURN path
```

### Query 6: Find Popular Users (Most Followers)

```cypher
// Find users with most followers
MATCH (user:User)<-[:FOLLOWS]-(follower:User)
RETURN
  user.username,
  user.full_name,
  count(follower) AS follower_count
ORDER BY follower_count DESC
LIMIT 10

// Find influential users (followers of followers)
MATCH (user:User)<-[:FOLLOWS]-(follower:User)<-[:FOLLOWS]-(fof:User)
RETURN
  user.username,
  count(DISTINCT fof) AS second_degree_followers
ORDER BY second_degree_followers DESC
LIMIT 10
```

### Query 7: Find Posts from Friends

```cypher
// Find recent posts from users Alice follows
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend:User)-[:POSTED]->(post:Post)
RETURN
  friend.username,
  post.content,
  post.created_at
ORDER BY post.created_at DESC
LIMIT 20

// Include likes and comments count
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend:User)-[:POSTED]->(post:Post)
OPTIONAL MATCH (post)<-[:LIKES]-(liker:User)
OPTIONAL MATCH (post)<-[:COMMENTED]-(commenter:User)
RETURN
  friend.username,
  post.content,
  post.created_at,
  count(DISTINCT liker) AS like_count,
  count(DISTINCT commenter) AS comment_count
ORDER BY post.created_at DESC
LIMIT 20
```

### Query 8: Find Common Interests (Shared Groups)

```cypher
// Find groups that both Alice and Bob are members of
MATCH (alice:User {username: "alice_dev"})-[:MEMBER_OF]->(group:Group)<-[:MEMBER_OF]-(bob:User {username: "bob_smith"})
RETURN group.name, group.description

// Find users with most shared groups with Alice
MATCH (alice:User {username: "alice_dev"})-[:MEMBER_OF]->(group:Group)<-[:MEMBER_OF]-(other:User)
WHERE other <> alice
RETURN
  other.username,
  other.full_name,
  count(group) AS shared_groups
ORDER BY shared_groups DESC
LIMIT 10
```

### Query 9: Find Users by Degree of Separation

```cypher
// Find all users within 2 degrees of Alice
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS*1..2]->(user:User)
RETURN DISTINCT user.username, user.full_name

// Find users at exactly 2 degrees of separation
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS*2]->(user:User)
WHERE NOT (alice)-[:FOLLOWS]->(user)  // Not direct connection
  AND user <> alice
RETURN DISTINCT user.username, user.full_name
```

### Query 10: Find Most Liked Posts

```cypher
// Find posts with most likes
MATCH (post:Post)<-[:LIKES]-(liker:User)
OPTIONAL MATCH (author:User)-[:POSTED]->(post)
RETURN
  author.username,
  post.content,
  count(liker) AS like_count
ORDER BY like_count DESC
LIMIT 10

// Find posts liked by Alice's friends
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend:User)-[:LIKES]->(post:Post)
OPTIONAL MATCH (author:User)-[:POSTED]->(post)
RETURN
  author.username,
  post.content,
  count(DISTINCT friend) AS friends_who_liked
ORDER BY friends_who_liked DESC
LIMIT 10
```

---

## Advanced Patterns

### Pattern 1: Friend Recommendations with Scoring

```cypher
// Recommend users with multiple scoring factors
MATCH (alice:User {username: "alice_dev"})

// Friends of friends
OPTIONAL MATCH (alice)-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof:User)
WHERE NOT (alice)-[:FOLLOWS]->(fof) AND fof <> alice

// Shared groups
OPTIONAL MATCH (alice)-[:MEMBER_OF]->(group:Group)<-[:MEMBER_OF]-(groupmate:User)
WHERE NOT (alice)-[:FOLLOWS]->(groupmate) AND groupmate <> alice

// Combine recommendations
WITH alice,
     collect(DISTINCT fof) + collect(DISTINCT groupmate) AS recommendations

UNWIND recommendations AS rec

// Calculate score
MATCH (alice)-[:FOLLOWS]->(friend)-[:FOLLOWS]->(rec)
WITH rec, count(DISTINCT friend) AS mutual_friend_score

MATCH (alice)-[:MEMBER_OF]->(group:Group)<-[:MEMBER_OF]-(rec)
WITH rec, mutual_friend_score, count(group) AS shared_group_score

RETURN
  rec.username,
  rec.full_name,
  mutual_friend_score,
  shared_group_score,
  (mutual_friend_score * 2 + shared_group_score) AS total_score
ORDER BY total_score DESC
LIMIT 10
```

### Pattern 2: Activity Feed with Relevance

```cypher
// Generate personalized activity feed for Alice
MATCH (alice:User {username: "alice_dev"})

// Posts from friends
MATCH (alice)-[:FOLLOWS]->(friend:User)-[:POSTED]->(post:Post)

// Calculate relevance score
OPTIONAL MATCH (post)<-[:LIKES]-(liker:User)
OPTIONAL MATCH (post)<-[:COMMENTED]-(commenter:User)
OPTIONAL MATCH (alice)-[:FOLLOWS]->(friend_who_liked:User)-[:LIKES]->(post)

WITH post, friend,
     count(DISTINCT liker) AS like_count,
     count(DISTINCT commenter) AS comment_count,
     count(DISTINCT friend_who_liked) AS friends_who_liked

// Calculate recency score (newer = higher)
WITH post, friend, like_count, comment_count, friends_who_liked,
     duration.between(post.created_at, datetime()).hours AS hours_old

RETURN
  friend.username,
  post.content,
  post.created_at,
  like_count,
  comment_count,
  friends_who_liked,
  (like_count + comment_count * 2 + friends_who_liked * 3 - hours_old / 24.0) AS relevance_score
ORDER BY relevance_score DESC
LIMIT 20
```

### Pattern 3: Community Detection (Find Clusters)

```cypher
// Find tightly connected groups of users
MATCH (u1:User)-[:FOLLOWS]->(u2:User)-[:FOLLOWS]->(u3:User)-[:FOLLOWS]->(u1)
WHERE id(u1) < id(u2) AND id(u2) < id(u3)
RETURN u1.username, u2.username, u3.username

// Find users who are bridges between communities
MATCH (a:User)-[:FOLLOWS]->(bridge:User)-[:FOLLOWS]->(b:User)
WHERE NOT (a)-[:FOLLOWS]->(b)
WITH bridge, count(DISTINCT a) AS in_degree, count(DISTINCT b) AS out_degree
WHERE in_degree > 3 AND out_degree > 3
RETURN bridge.username, in_degree, out_degree
ORDER BY (in_degree + out_degree) DESC
```

### Pattern 4: Influence Propagation

```cypher
// Find how far Alice's posts can reach (viral potential)
MATCH (alice:User {username: "alice_dev"})-[:POSTED]->(post:Post)
MATCH (alice)<-[:FOLLOWS*1..3]-(reacher:User)
RETURN
  post.content,
  count(DISTINCT reacher) AS potential_reach
ORDER BY potential_reach DESC

// Find influencers (users whose posts reach many people)
MATCH (user:User)-[:POSTED]->(post:Post)
MATCH (user)<-[:FOLLOWS*1..2]-(reacher:User)
WITH user, count(DISTINCT reacher) AS reach
RETURN
  user.username,
  user.full_name,
  reach
ORDER BY reach DESC
LIMIT 10
```

---

## Indexing and Constraints

### Create Indexes

```cypher
// Create unique constraint on username (creates index automatically)
CREATE CONSTRAINT user_username_unique FOR (u:User) REQUIRE u.username IS UNIQUE

// Create unique constraint on email
CREATE CONSTRAINT user_email_unique FOR (u:User) REQUIRE u.email IS UNIQUE

// Create index on user ID
CREATE INDEX user_id FOR (u:User) ON (u.id)

// Create index on post created_at
CREATE INDEX post_created_at FOR (p:Post) ON (p.created_at)

// Create index on group name
CREATE INDEX group_name FOR (g:Group) ON (g.name)

// Create composite index
CREATE INDEX user_location_created FOR (u:User) ON (u.location, u.created_at)

// Create full-text index
CREATE FULLTEXT INDEX user_search FOR (u:User) ON EACH [u.username, u.full_name, u.bio]
CREATE FULLTEXT INDEX post_search FOR (p:Post) ON EACH [p.content]
```

### Create Constraints

```cypher
// Ensure user has required properties
CREATE CONSTRAINT user_username_exists FOR (u:User) REQUIRE u.username IS NOT NULL
CREATE CONSTRAINT user_email_exists FOR (u:User) REQUIRE u.email IS NOT NULL

// Ensure post has required properties
CREATE CONSTRAINT post_content_exists FOR (p:Post) REQUIRE p.content IS NOT NULL

// Node key constraint (combination of unique and existence)
CREATE CONSTRAINT user_key FOR (u:User) REQUIRE (u.id) IS NODE KEY
```

---

## Performance Optimization

### Query Optimization Tips

**Use PROFILE to analyze queries:**
```cypher
PROFILE
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof)
WHERE NOT (alice)-[:FOLLOWS]->(fof) AND fof <> alice
RETURN fof.username, count(*) AS mutual_friends
ORDER BY mutual_friends DESC
LIMIT 10
```

**Use EXPLAIN to see query plan:**
```cypher
EXPLAIN
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS]->(friend)
RETURN friend.username
```

**Limit traversal depth:**
```cypher
// ❌ BAD: Unbounded traversal
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS*]->(user)
RETURN user

// ✅ GOOD: Limited depth
MATCH (alice:User {username: "alice_dev"})-[:FOLLOWS*1..3]->(user)
RETURN user
```

**Use LIMIT early:**
```cypher
// ❌ BAD: Process all results then limit
MATCH (user:User)<-[:FOLLOWS]-(follower)
WITH user, count(follower) AS follower_count
ORDER BY follower_count DESC
LIMIT 10
RETURN user.username, follower_count

// ✅ GOOD: Limit early
MATCH (user:User)<-[:FOLLOWS]-(follower)
WITH user, count(follower) AS follower_count
ORDER BY follower_count DESC
LIMIT 10
RETURN user.username, follower_count
```

**Use indexes:**
```cypher
// ❌ BAD: No index, full scan
MATCH (u:User)
WHERE u.email = "alice@example.com"
RETURN u

// ✅ GOOD: Create index first
CREATE CONSTRAINT user_email_unique FOR (u:User) REQUIRE u.email IS UNIQUE

MATCH (u:User {email: "alice@example.com"})
RETURN u
```

---

## Graph Algorithms (Neo4j GDS)

### PageRank (Find Influential Users)

```cypher
// Create in-memory graph projection
CALL gds.graph.project(
  'social-network',
  'User',
  'FOLLOWS'
)

// Run PageRank
CALL gds.pageRank.stream('social-network')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).username AS username, score
ORDER BY score DESC
LIMIT 10

// Write results back to database
CALL gds.pageRank.write('social-network', {
  writeProperty: 'pagerank'
})
```

### Community Detection (Louvain)

```cypher
// Find communities
CALL gds.louvain.stream('social-network')
YIELD nodeId, communityId
RETURN
  communityId,
  collect(gds.util.asNode(nodeId).username) AS members
ORDER BY size(members) DESC
```

### Betweenness Centrality (Find Bridges)

```cypher
// Find users who connect different parts of the network
CALL gds.betweenness.stream('social-network')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).username AS username, score
ORDER BY score DESC
LIMIT 10
```

### Shortest Path (Dijkstra)

```cypher
// Find shortest path with weighted relationships
MATCH (alice:User {username: "alice_dev"}), (eve:User {username: "eve_adams"})
CALL gds.shortestPath.dijkstra.stream('social-network', {
  sourceNode: id(alice),
  targetNode: id(eve)
})
YIELD path, totalCost
RETURN path, totalCost
```

---

## Best Practices

### DO

✅ **Use meaningful relationship types** (FOLLOWS, LIKES, not RELATED_TO)
✅ **Create indexes on frequently queried properties** (username, email)
✅ **Limit traversal depth** to avoid performance issues
✅ **Use LIMIT** to restrict result sets
✅ **Profile queries** to identify bottlenecks
✅ **Use graph algorithms** for complex analysis (PageRank, community detection)
✅ **Implement constraints** for data integrity
✅ **Use parameters** to prevent Cypher injection

### DON'T

❌ **Don't create unbounded relationships** (limit followers, posts, etc.)
❌ **Don't store large binary data in nodes** (use external storage)
❌ **Don't traverse without depth limits** (can cause infinite loops)
❌ **Don't ignore indexes** (critical for performance)
❌ **Don't create too many relationship types** (keep it simple)
❌ **Don't use graphs for simple key-value lookups** (use key-value store instead)

---

## Summary

**Graph databases excel at:**
- Social network queries (friends, followers, recommendations)
- Relationship traversal (shortest path, degrees of separation)
- Pattern matching (mutual friends, common interests)
- Influence analysis (PageRank, centrality)
- Community detection (clusters, bridges)

**Key patterns demonstrated:**
- **Friend recommendations**: Friends of friends not already following
- **Mutual friends**: Users who follow each other
- **Shortest path**: Degrees of separation between users
- **Influence**: PageRank, follower count, reach
- **Activity feed**: Personalized content with relevance scoring

**Performance tips:**
- Create indexes on queried properties (username, email)
- Limit traversal depth (1..3 hops)
- Use LIMIT for large result sets
- Profile queries to identify bottlenecks
- Use graph algorithms for complex analysis (GDS library)

**Trade-offs:**
- **Embedding**: Fast reads, harder updates, bounded size
- **Referencing**: Flexible queries, slower reads (traversals), unbounded growth
- **Denormalization**: Store computed values (follower_count) for fast access


