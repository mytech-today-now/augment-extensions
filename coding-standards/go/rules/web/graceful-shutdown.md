# Go Web Services - Graceful Shutdown

## Overview

Graceful shutdown ensures that a web service stops accepting new requests while completing in-flight requests before terminating. This document defines best practices for implementing graceful shutdown in Go web services.

## Core Principles

1. **Signal Handling**: Listen for OS signals (SIGINT, SIGTERM)
2. **Connection Draining**: Complete in-flight requests before shutdown
3. **Timeout Management**: Set reasonable shutdown timeouts
4. **Resource Cleanup**: Close database connections, file handles, etc.
5. **Health Check Updates**: Mark service as unhealthy during shutdown

## Rules

### GOL.3.1.4.1: Implement Signal-Based Shutdown

**Rule**: Always implement graceful shutdown using OS signal handling.

**Severity**: ERROR

**Rationale**: Prevents data loss and ensures clean termination in production environments.

**✅ Good**:
```go
func main() {
    // Create server
    srv := &http.Server{
        Addr:    ":8080",
        Handler: setupRoutes(),
    }
    
    // Start server in goroutine
    go func() {
        log.Println("Server starting on :8080")
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server failed: %v", err)
        }
    }()
    
    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    log.Println("Server shutting down...")
    
    // Create shutdown context with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    // Attempt graceful shutdown
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }
    
    log.Println("Server exited")
}
```

**❌ Bad**:
```go
func main() {
    // No graceful shutdown - server terminates immediately on Ctrl+C
    http.ListenAndServe(":8080", setupRoutes())
}
```

### GOL.3.1.4.2: Set Appropriate Shutdown Timeout

**Rule**: Configure shutdown timeout based on expected request duration.

**Severity**: WARNING

**Rationale**: Too short causes request failures; too long delays deployment.

**✅ Good**:
```go
const (
    shutdownTimeout = 30 * time.Second  // For typical web services
    // shutdownTimeout = 5 * time.Minute  // For long-running operations
)

func gracefulShutdown(srv *http.Server) error {
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    log.Println("Shutdown signal received")
    
    ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
    defer cancel()
    
    return srv.Shutdown(ctx)
}
```

### GOL.3.1.4.3: Clean Up Resources During Shutdown

**Rule**: Close all resources (database connections, file handles) during shutdown.

**Severity**: ERROR

**Rationale**: Prevents resource leaks and ensures data consistency.

**✅ Good**:
```go
type Server struct {
    http   *http.Server
    db     *sql.DB
    cache  *redis.Client
    logger *slog.Logger
}

func (s *Server) Shutdown(ctx context.Context) error {
    s.logger.Info("Starting graceful shutdown")
    
    // Stop accepting new requests
    if err := s.http.Shutdown(ctx); err != nil {
        s.logger.Error("HTTP server shutdown error", "error", err)
        return err
    }
    
    // Close database connections
    if err := s.db.Close(); err != nil {
        s.logger.Error("Database close error", "error", err)
    }
    
    // Close cache connections
    if err := s.cache.Close(); err != nil {
        s.logger.Error("Cache close error", "error", err)
    }
    
    s.logger.Info("Shutdown complete")
    return nil
}

func main() {
    srv := NewServer()
    
    // Start server
    go func() {
        if err := srv.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()
    
    // Wait for signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    // Graceful shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal(err)
    }
}
```

### GOL.3.1.4.4: Update Health Checks During Shutdown

**Rule**: Mark service as unhealthy when shutdown begins.

**Severity**: WARNING

**Rationale**: Prevents load balancers from sending new requests during shutdown.

**✅ Good**:
```go
type HealthChecker struct {
    mu       sync.RWMutex
    healthy  bool
    shutdown bool
}

func (h *HealthChecker) SetHealthy(healthy bool) {
    h.mu.Lock()
    defer h.mu.Unlock()
    h.healthy = healthy
}

func (h *HealthChecker) SetShutdown() {
    h.mu.Lock()
    defer h.mu.Unlock()
    h.shutdown = true
}

func (h *HealthChecker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    h.mu.RLock()
    defer h.mu.RUnlock()
    
    if h.shutdown {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "shutting_down",
        })
        return
    }
    
    if !h.healthy {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "unhealthy",
        })
        return
    }
    
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
    })
}

func main() {
    health := &HealthChecker{healthy: true}
    
    http.Handle("/health", health)
    http.Handle("/api/", apiHandler)
    
    srv := &http.Server{Addr: ":8080"}
    
    go srv.ListenAndServe()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    // Mark as shutting down
    health.SetShutdown()
    
    // Wait for load balancer to detect unhealthy status
    time.Sleep(5 * time.Second)
    
    // Proceed with shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    srv.Shutdown(ctx)
}
```

## References

- [Go HTTP Server Shutdown](https://pkg.go.dev/net/http#Server.Shutdown)
- [Graceful Shutdown Patterns](https://medium.com/honestbee-tw-engineer/gracefully-shutdown-in-go-http-server-5f5e6b83da5a)

