# Distributed Caching Rules

## Overview

Best practices for implementing distributed caching in Go applications using Redis, Memcached, and other caching solutions.

## Rules

### 1. Use Cache-Aside Pattern

**Rule**: Implement cache-aside (lazy loading) pattern for most use cases.

**Good Example**:
```go
func GetUser(ctx context.Context, cache *redis.Client, db *sql.DB, userID string) (*User, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("user:%s", userID)
    cached, err := cache.Get(ctx, cacheKey).Result()
    if err == nil {
        var user User
        if err := json.Unmarshal([]byte(cached), &user); err == nil {
            return &user, nil
        }
    }
    
    // Cache miss - load from database
    user, err := loadUserFromDB(ctx, db, userID)
    if err != nil {
        return nil, err
    }
    
    // Store in cache
    data, _ := json.Marshal(user)
    cache.Set(ctx, cacheKey, data, 1*time.Hour)
    
    return user, nil
}
```

### 2. Set Appropriate TTLs

**Rule**: Always set TTL on cached items to prevent stale data.

**Good Example**:
```go
const (
    UserCacheTTL     = 1 * time.Hour
    SessionCacheTTL  = 15 * time.Minute
    ConfigCacheTTL   = 5 * time.Minute
)

func CacheUser(ctx context.Context, cache *redis.Client, user *User) error {
    data, err := json.Marshal(user)
    if err != nil {
        return err
    }
    
    key := fmt.Sprintf("user:%s", user.ID)
    return cache.Set(ctx, key, data, UserCacheTTL).Err()
}
```

### 3. Handle Cache Failures Gracefully

**Rule**: Application should continue working if cache is unavailable.

**Good Example**:
```go
func GetUserWithFallback(ctx context.Context, cache *redis.Client, db *sql.DB, userID string) (*User, error) {
    // Try cache
    if cache != nil {
        if user, err := getUserFromCache(ctx, cache, userID); err == nil {
            return user, nil
        }
        // Log cache error but continue
        log.Printf("Cache error: %v, falling back to database", err)
    }
    
    // Fallback to database
    return loadUserFromDB(ctx, db, userID)
}
```

### 4. Implement Cache Invalidation Strategy

**Rule**: Invalidate cache entries when data changes.

**Good Example**:
```go
func UpdateUser(ctx context.Context, cache *redis.Client, db *sql.DB, user *User) error {
    // Update database
    if err := updateUserInDB(ctx, db, user); err != nil {
        return err
    }
    
    // Invalidate cache
    cacheKey := fmt.Sprintf("user:%s", user.ID)
    if err := cache.Del(ctx, cacheKey).Err(); err != nil {
        log.Printf("Failed to invalidate cache: %v", err)
        // Don't fail the operation if cache invalidation fails
    }
    
    return nil
}
```

### 5. Use Pipelining for Batch Operations

**Rule**: Use pipelining to reduce network round trips for multiple cache operations.

**Good Example**:
```go
func GetMultipleUsers(ctx context.Context, cache *redis.Client, userIDs []string) (map[string]*User, error) {
    pipe := cache.Pipeline()
    
    cmds := make(map[string]*redis.StringCmd)
    for _, userID := range userIDs {
        key := fmt.Sprintf("user:%s", userID)
        cmds[userID] = pipe.Get(ctx, key)
    }
    
    if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
        return nil, err
    }
    
    users := make(map[string]*User)
    for userID, cmd := range cmds {
        val, err := cmd.Result()
        if err == redis.Nil {
            continue
        }
        if err != nil {
            return nil, err
        }
        
        var user User
        if err := json.Unmarshal([]byte(val), &user); err == nil {
            users[userID] = &user
        }
    }
    
    return users, nil
}
```

## References

- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Caching Strategies](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/Strategies.html)

