# Health Check and Readiness Rules

## Overview

Best practices for implementing health checks, readiness probes, and liveness probes in cloud-native Go applications.

## Rules

### 1. Implement Separate Health and Readiness Endpoints

**Rule**: Provide separate `/health` (liveness) and `/ready` (readiness) endpoints.

**Rationale**: Liveness checks determine if the app should be restarted; readiness checks determine if it can receive traffic.

**Good Example**:
```go
func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
}

func readinessHandler(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Check database connection
        ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
        defer cancel()
        
        if err := db.PingContext(ctx); err != nil {
            w.WriteHeader(http.StatusServiceUnavailable)
            w.Write([]byte("Database unavailable"))
            return
        }
        
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("Ready"))
    }
}

func main() {
    db, _ := sql.Open("postgres", dsn)
    
    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/ready", readinessHandler(db))
    
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### 2. Keep Health Checks Lightweight

**Rule**: Health checks should be fast (<1s) and not perform expensive operations.

**Good Example**:
```go
type HealthChecker struct {
    checks map[string]HealthCheck
}

type HealthCheck func(context.Context) error

func (hc *HealthChecker) AddCheck(name string, check HealthCheck) {
    hc.checks[name] = check
}

func (hc *HealthChecker) Check(ctx context.Context) (map[string]string, error) {
    results := make(map[string]string)
    var hasError bool
    
    for name, check := range hc.checks {
        checkCtx, cancel := context.WithTimeout(ctx, 1*time.Second)
        defer cancel()
        
        if err := check(checkCtx); err != nil {
            results[name] = fmt.Sprintf("FAIL: %v", err)
            hasError = true
        } else {
            results[name] = "OK"
        }
    }
    
    if hasError {
        return results, fmt.Errorf("health check failed")
    }
    
    return results, nil
}
```

### 3. Include Dependency Checks in Readiness

**Rule**: Readiness probes should verify all critical dependencies are available.

**Good Example**:
```go
func NewReadinessChecker(db *sql.DB, cache *redis.Client) *HealthChecker {
    hc := &HealthChecker{checks: make(map[string]HealthCheck)}
    
    // Database check
    hc.AddCheck("database", func(ctx context.Context) error {
        return db.PingContext(ctx)
    })
    
    // Cache check
    hc.AddCheck("cache", func(ctx context.Context) error {
        return cache.Ping(ctx).Err()
    })
    
    // External API check (optional)
    hc.AddCheck("external_api", func(ctx context.Context) error {
        req, _ := http.NewRequestWithContext(ctx, "GET", "https://api.example.com/health", nil)
        resp, err := http.DefaultClient.Do(req)
        if err != nil {
            return err
        }
        defer resp.Body.Close()
        
        if resp.StatusCode != http.StatusOK {
            return fmt.Errorf("unexpected status: %d", resp.StatusCode)
        }
        return nil
    })
    
    return hc
}
```

### 4. Return Detailed Status Information

**Rule**: Return structured health check responses with component-level details.

**Good Example**:
```go
type HealthResponse struct {
    Status     string            `json:"status"`
    Timestamp  time.Time         `json:"timestamp"`
    Components map[string]string `json:"components"`
}

func healthCheckHandler(checker *HealthChecker) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
        defer cancel()
        
        components, err := checker.Check(ctx)
        
        response := HealthResponse{
            Timestamp:  time.Now(),
            Components: components,
        }
        
        if err != nil {
            response.Status = "unhealthy"
            w.WriteHeader(http.StatusServiceUnavailable)
        } else {
            response.Status = "healthy"
            w.WriteHeader(http.StatusOK)
        }
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    }
}
```

### 5. Implement Graceful Degradation

**Rule**: Allow the application to continue running with degraded functionality when non-critical dependencies fail.

**Good Example**:
```go
type ServiceHealth struct {
    mu              sync.RWMutex
    cacheAvailable  bool
    searchAvailable bool
}

func (sh *ServiceHealth) SetCacheAvailable(available bool) {
    sh.mu.Lock()
    defer sh.mu.Unlock()
    sh.cacheAvailable = available
}

func (sh *ServiceHealth) IsCacheAvailable() bool {
    sh.mu.RLock()
    defer sh.mu.RUnlock()
    return sh.cacheAvailable
}

func (sh *ServiceHealth) MonitorDependencies(ctx context.Context, cache *redis.Client) {
    ticker := time.NewTicker(10 * time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            checkCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
            err := cache.Ping(checkCtx).Err()
            cancel()
            
            sh.SetCacheAvailable(err == nil)
            
            if err != nil {
                log.Printf("Cache unavailable: %v (degraded mode)", err)
            }
        }
    }
}

func getData(sh *ServiceHealth, cache *redis.Client, db *sql.DB, key string) (string, error) {
    // Try cache first if available
    if sh.IsCacheAvailable() {
        val, err := cache.Get(context.Background(), key).Result()
        if err == nil {
            return val, nil
        }
    }
    
    // Fallback to database
    var value string
    err := db.QueryRow("SELECT value FROM data WHERE key = $1", key).Scan(&value)
    return value, err
}
```

## References

- [Kubernetes Liveness and Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Health Check Response Format for HTTP APIs](https://tools.ietf.org/id/draft-inadarei-api-health-check-06.html)

