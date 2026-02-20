# Go Web Services - Middleware Patterns

## Overview

Middleware provides a powerful way to add cross-cutting concerns to HTTP handlers. This document defines best practices for implementing and using middleware in Go web services.

## Core Principles

1. **Composability**: Middleware should be composable and chainable
2. **Single Responsibility**: Each middleware should do one thing well
3. **Context Propagation**: Use context to pass values between middleware
4. **Error Handling**: Handle errors gracefully and consistently
5. **Performance**: Minimize overhead in hot paths

## Rules

### GOL.3.1.2.1: Use Standard Middleware Pattern

**Rule**: Implement middleware using the standard `func(http.Handler) http.Handler` pattern.

**Severity**: ERROR

**Rationale**: Standard pattern ensures compatibility with all routing libraries and middleware chains.

**✅ Good**:
```go
// Standard middleware signature
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Call next handler
        next.ServeHTTP(w, r)
        
        // Log after handler completes
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// Usage
http.Handle("/api/", loggingMiddleware(apiHandler))
```

**❌ Bad**:
```go
// Non-standard signature - not composable
func loggingMiddleware(w http.ResponseWriter, r *http.Request, handler http.Handler) {
    start := time.Now()
    handler.ServeHTTP(w, r)
    log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
}
```

### GOL.3.1.2.2: Authentication Middleware

**Rule**: Implement authentication middleware that validates credentials and adds user context.

**Severity**: ERROR

**Rationale**: Centralized authentication ensures consistent security across all protected endpoints.

**✅ Good**:
```go
type contextKey string

const userContextKey contextKey = "user"

func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token == "" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        // Validate token
        user, err := validateToken(r.Context(), token)
        if err != nil {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        
        // Add user to context
        ctx := context.WithValue(r.Context(), userContextKey, user)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Helper to extract user from context
func getUserFromContext(ctx context.Context) (*User, bool) {
    user, ok := ctx.Value(userContextKey).(*User)
    return user, ok
}
```

### GOL.3.1.2.3: Request Logging Middleware

**Rule**: Log all requests with method, path, status code, duration, and request ID.

**Severity**: WARNING

**Rationale**: Comprehensive logging enables debugging, monitoring, and audit trails.

**✅ Good**:
```go
type responseWriter struct {
    http.ResponseWriter
    statusCode int
    written    int64
}

func (rw *responseWriter) WriteHeader(code int) {
    rw.statusCode = code
    rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
    n, err := rw.ResponseWriter.Write(b)
    rw.written += int64(n)
    return n, err
}

func requestLoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            requestID := uuid.New().String()
            
            // Add request ID to context
            ctx := context.WithValue(r.Context(), "request_id", requestID)
            
            // Wrap response writer to capture status code
            rw := &responseWriter{
                ResponseWriter: w,
                statusCode:     http.StatusOK,
            }
            
            // Call next handler
            next.ServeHTTP(rw, r.WithContext(ctx))
            
            // Log request details
            logger.Info("request completed",
                "request_id", requestID,
                "method", r.Method,
                "path", r.URL.Path,
                "status", rw.statusCode,
                "duration_ms", time.Since(start).Milliseconds(),
                "bytes_written", rw.written,
                "remote_addr", r.RemoteAddr,
            )
        })
    }
}
```

### GOL.3.1.2.4: Panic Recovery Middleware

**Rule**: Always include panic recovery middleware to prevent server crashes.

**Severity**: ERROR

**Rationale**: Unhandled panics crash the entire server; recovery middleware ensures graceful error handling.

**✅ Good**:
```go
func recoveryMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            defer func() {
                if err := recover(); err != nil {
                    // Log panic with stack trace
                    logger.Error("panic recovered",
                        "error", err,
                        "path", r.URL.Path,
                        "stack", string(debug.Stack()),
                    )
                    
                    // Return 500 to client
                    http.Error(w, "Internal Server Error", http.StatusInternalServerError)
                }
            }()
            
            next.ServeHTTP(w, r)
        })
    }
}
```

### GOL.3.1.2.5: Metrics Middleware

**Rule**: Instrument HTTP handlers with Prometheus metrics for monitoring.

**Severity**: WARNING

**✅ Good**:
```go
var (
    httpRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "path", "status"},
    )
    
    httpRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "path"},
    )
)

func metricsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
        
        next.ServeHTTP(rw, r)
        
        duration := time.Since(start).Seconds()
        httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, strconv.Itoa(rw.statusCode)).Inc()
        httpRequestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration)
    })
}
```

## References

- [Go Middleware Patterns](https://www.alexedwards.net/blog/making-and-using-middleware)
- [Effective Go - Web Servers](https://golang.org/doc/effective_go#web_server)

