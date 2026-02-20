# Go Web Services - HTTP Handlers

## Overview

HTTP handlers are the core of web services in Go. This document defines best practices for implementing HTTP handlers that are robust, maintainable, and idiomatic.

## Core Principles

1. **Context Usage**: Always use `context.Context` for request-scoped values and cancellation
2. **Error Handling**: Return errors explicitly, use `http.Error` for client errors
3. **Status Codes**: Use appropriate HTTP status codes (2xx, 4xx, 5xx)
4. **Request Validation**: Validate all inputs before processing
5. **Response Formatting**: Use consistent response formats (JSON, XML, etc.)

## Rules

### GOL.3.1.1: Use Standard Handler Interfaces

**Rule**: Implement handlers using `http.Handler` or `http.HandlerFunc` interfaces.

**Severity**: ERROR

**Rationale**: Standard interfaces ensure compatibility with middleware and routing libraries.

**✅ Good**:
```go
// Using http.HandlerFunc
func handleUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    userID := r.URL.Query().Get("id")
    
    user, err := getUserByID(ctx, userID)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    
    json.NewEncoder(w).Encode(user)
}

// Using http.Handler
type UserHandler struct {
    db *sql.DB
}

func (h *UserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Handler implementation
}
```

**❌ Bad**:
```go
// Non-standard signature
func handleUser(userID string) (User, error) {
    // Cannot be used directly with http.ServeMux
}
```

### GOL.3.1.2: Always Use Context for Request-Scoped Values

**Rule**: Use `r.Context()` for request-scoped values, timeouts, and cancellation.

**Severity**: ERROR

**Rationale**: Context enables proper timeout handling, cancellation propagation, and request tracing.

**✅ Good**:
```go
func handleCreateUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    // Add timeout to context
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    // Pass context to database operations
    if err := createUser(ctx, &user); err != nil {
        if errors.Is(err, context.DeadlineExceeded) {
            http.Error(w, "Request timeout", http.StatusRequestTimeout)
            return
        }
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
```

**❌ Bad**:
```go
func handleCreateUser(w http.ResponseWriter, r *http.Request) {
    // Not using context - no timeout or cancellation support
    var user User
    json.NewDecoder(r.Body).Decode(&user)
    createUser(&user) // No context passed
    json.NewEncoder(w).Encode(user)
}
```

### GOL.3.1.3: Use Appropriate HTTP Status Codes

**Rule**: Return correct HTTP status codes for different scenarios.

**Severity**: WARNING

**Rationale**: Proper status codes enable clients to handle responses correctly.

**Status Code Guidelines**:
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST creating a resource
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid client input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server-side errors
- `503 Service Unavailable`: Temporary unavailability

**✅ Good**:
```go
func handleUpdateUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    userID := chi.URLParam(r, "id")
    
    var updates UserUpdate
    if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    
    user, err := updateUser(ctx, userID, updates)
    if err != nil {
        switch {
        case errors.Is(err, ErrUserNotFound):
            http.Error(w, "User not found", http.StatusNotFound)
        case errors.Is(err, ErrValidation):
            http.Error(w, err.Error(), http.StatusUnprocessableEntity)
        default:
            http.Error(w, "Internal error", http.StatusInternalServerError)
        }
        return
    }
    
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(user)
}
```

## References

- [Effective Go - Web Servers](https://golang.org/doc/effective_go#web_server)
- [Go net/http package](https://pkg.go.dev/net/http)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

