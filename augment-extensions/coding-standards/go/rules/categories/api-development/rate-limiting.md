# Rate Limiting Rules

## Overview

Best practices for implementing rate limiting in Go REST APIs to prevent abuse and ensure fair resource usage.

## Rules

### 1. Implement Token Bucket Algorithm

**Rule**: Use token bucket algorithm for smooth rate limiting.

**Good Example**:
```go
import "golang.org/x/time/rate"

type RateLimiter struct {
    limiters map[string]*rate.Limiter
    mu       sync.RWMutex
    rate     rate.Limit
    burst    int
}

func NewRateLimiter(r rate.Limit, b int) *RateLimiter {
    return &RateLimiter{
        limiters: make(map[string]*rate.Limiter),
        rate:     r,
        burst:    b,
    }
}

func (rl *RateLimiter) GetLimiter(key string) *rate.Limiter {
    rl.mu.Lock()
    defer rl.mu.Unlock()
    
    limiter, exists := rl.limiters[key]
    if !exists {
        limiter = rate.NewLimiter(rl.rate, rl.burst)
        rl.limiters[key] = limiter
    }
    
    return limiter
}
```

### 2. Return Rate Limit Headers

**Rule**: Include rate limit information in response headers.

**Good Example**:
```go
func RateLimitMiddleware(limiter *RateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            key := getClientKey(r) // IP or API key
            
            l := limiter.GetLimiter(key)
            
            if !l.Allow() {
                w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", limiter.burst))
                w.Header().Set("X-RateLimit-Remaining", "0")
                w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Minute).Unix()))
                w.Header().Set("Retry-After", "60")
                
                writeError(w, http.StatusTooManyRequests, "Rate limit exceeded")
                return
            }
            
            // Add rate limit headers
            w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", limiter.burst))
            w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", l.Tokens()))
            
            next.ServeHTTP(w, r)
        })
    }
}
```

### 3. Implement Different Limits for Different Endpoints

**Rule**: Apply different rate limits based on endpoint sensitivity.

**Good Example**:
```go
type EndpointLimits struct {
    limiters map[string]*RateLimiter
}

func NewEndpointLimits() *EndpointLimits {
    return &EndpointLimits{
        limiters: map[string]*RateLimiter{
            "/api/v1/auth/login":    NewRateLimiter(rate.Limit(5), 10),   // 5 req/sec
            "/api/v1/users":         NewRateLimiter(rate.Limit(100), 200), // 100 req/sec
            "/api/v1/search":        NewRateLimiter(rate.Limit(10), 20),   // 10 req/sec
        },
    }
}

func (el *EndpointLimits) GetLimiter(path string) *RateLimiter {
    if limiter, ok := el.limiters[path]; ok {
        return limiter
    }
    // Default limiter
    return NewRateLimiter(rate.Limit(50), 100)
}
```

### 4. Support API Key-Based Rate Limiting

**Rule**: Implement per-API-key rate limiting for authenticated requests.

**Good Example**:
```go
type APIKeyLimiter struct {
    limiters map[string]*rate.Limiter
    mu       sync.RWMutex
    tiers    map[string]RateLimitTier
}

type RateLimitTier struct {
    Rate  rate.Limit
    Burst int
}

func NewAPIKeyLimiter() *APIKeyLimiter {
    return &APIKeyLimiter{
        limiters: make(map[string]*rate.Limiter),
        tiers: map[string]RateLimitTier{
            "free":       {Rate: rate.Limit(10), Burst: 20},
            "basic":      {Rate: rate.Limit(100), Burst: 200},
            "premium":    {Rate: rate.Limit(1000), Burst: 2000},
            "enterprise": {Rate: rate.Limit(10000), Burst: 20000},
        },
    }
}

func (akl *APIKeyLimiter) GetLimiter(apiKey string, tier string) *rate.Limiter {
    akl.mu.Lock()
    defer akl.mu.Unlock()
    
    key := fmt.Sprintf("%s:%s", tier, apiKey)
    
    limiter, exists := akl.limiters[key]
    if !exists {
        tierConfig := akl.tiers[tier]
        limiter = rate.NewLimiter(tierConfig.Rate, tierConfig.Burst)
        akl.limiters[key] = limiter
    }
    
    return limiter
}
```

### 5. Implement Distributed Rate Limiting

**Rule**: Use Redis for rate limiting across multiple servers.

**Good Example**:
```go
type RedisRateLimiter struct {
    client *redis.Client
    limit  int
    window time.Duration
}

func NewRedisRateLimiter(client *redis.Client, limit int, window time.Duration) *RedisRateLimiter {
    return &RedisRateLimiter{
        client: client,
        limit:  limit,
        window: window,
    }
}

func (rrl *RedisRateLimiter) Allow(ctx context.Context, key string) (bool, error) {
    now := time.Now().Unix()
    windowStart := now - int64(rrl.window.Seconds())
    
    pipe := rrl.client.Pipeline()
    
    // Remove old entries
    pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))
    
    // Count current requests
    countCmd := pipe.ZCard(ctx, key)
    
    // Add current request
    pipe.ZAdd(ctx, key, &redis.Z{
        Score:  float64(now),
        Member: fmt.Sprintf("%d", now),
    })
    
    // Set expiration
    pipe.Expire(ctx, key, rrl.window)
    
    _, err := pipe.Exec(ctx)
    if err != nil {
        return false, err
    }
    
    count := countCmd.Val()
    return count < int64(rrl.limit), nil
}
```

## References

- [Rate Limiting Algorithms](https://en.wikipedia.org/wiki/Rate_limiting)
- [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate)

