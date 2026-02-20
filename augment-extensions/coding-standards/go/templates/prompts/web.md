# Web Service Project Template

## Context

You are generating Go code for a **web service** project. This includes HTTP servers, RESTful APIs, web applications, and API gateways.

## Standards

Follow these Go coding standards for web services:

### Universal Rules

1. **Naming Conventions**: Use MixedCaps for exported names, mixedCaps for unexported
2. **Error Handling**: Return errors explicitly, use `errors.Is/As` for error inspection
3. **Concurrency**: Use goroutines and channels properly, always pass context
4. **Testing**: Write table-driven tests, use `httptest` for HTTP testing
5. **Code Organization**: Keep packages flat and focused
6. **Documentation**: Add godoc comments for all exported functions
7. **Performance**: Minimize allocations, use `sync.Pool` for reusable objects

### Web Services Rules

#### HTTP Handlers
- Use standard `http.Handler` and `http.HandlerFunc` interfaces
- Always use `context.Context` from `r.Context()` for request-scoped values
- Return appropriate HTTP status codes (2xx, 4xx, 5xx)
- Validate all inputs before processing
- Use `http.Error` for error responses

#### Middleware
- Implement middleware using `func(http.Handler) http.Handler` pattern
- Chain middleware for logging, authentication, metrics, recovery
- Use context to pass values between middleware layers
- Always include panic recovery middleware
- Instrument with Prometheus metrics

#### Routing
- Use established routing libraries (`chi`, `gorilla/mux`, `echo`)
- Follow RESTful resource naming (plural nouns, standard HTTP methods)
- Extract and validate URL parameters safely
- Implement API versioning (e.g., `/api/v1`, `/api/v2`)
- Use query parameters for filtering, sorting, pagination

#### Graceful Shutdown
- Implement signal-based shutdown (SIGINT, SIGTERM)
- Set appropriate shutdown timeout (typically 30 seconds)
- Clean up resources (database connections, file handles)
- Update health checks to mark service as unhealthy during shutdown

## Key Requirements

### HTTP Server Setup
```go
srv := &http.Server{
    Addr:         ":8080",
    Handler:      routes(),
    ReadTimeout:  15 * time.Second,
    WriteTimeout: 15 * time.Second,
    IdleTimeout:  60 * time.Second,
}
```

### Handler Pattern
```go
func handleResource(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    // Extract parameters
    id := chi.URLParam(r, "id")
    
    // Validate input
    if id == "" {
        http.Error(w, "Missing ID", http.StatusBadRequest)
        return
    }
    
    // Process request
    result, err := processRequest(ctx, id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Return response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}
```

### Middleware Pattern
```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

### Graceful Shutdown
```go
func main() {
    srv := &http.Server{Addr: ":8080", Handler: routes()}
    
    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal(err)
    }
}
```

## Common Patterns

### RESTful API Structure
```
GET    /api/v1/users          - List users
POST   /api/v1/users          - Create user
GET    /api/v1/users/{id}     - Get user
PUT    /api/v1/users/{id}     - Update user
DELETE /api/v1/users/{id}     - Delete user
```

### Error Response Format
```go
type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
    Code    int    `json:"code"`
}
```

### Pagination Response
```go
type PaginatedResponse struct {
    Data  interface{} `json:"data"`
    Total int         `json:"total"`
    Page  int         `json:"page"`
    Limit int         `json:"limit"`
}
```

## Tools

Ensure generated code passes:
- `go build` - Compiles without errors
- `golangci-lint run` - Passes all linters
- `go vet` - No suspicious constructs
- `gofmt -d .` - Properly formatted
- `go test -race` - No race conditions

## Output Format

Generate complete, production-ready Go code with:
- Package declaration and imports
- Struct definitions with JSON tags
- HTTP handlers with proper error handling
- Middleware for cross-cutting concerns
- Graceful shutdown implementation
- Comprehensive godoc comments
- Example usage in comments

## References

- [Effective Go](https://golang.org/doc/effective_go)
- [Go net/http package](https://pkg.go.dev/net/http)
- [chi router](https://github.com/go-chi/chi)
- [Uber Go Style Guide](https://github.com/uber-go/guide)

