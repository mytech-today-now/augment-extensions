# Go Web Services - Routing Patterns

## Overview

Routing is fundamental to web services, mapping HTTP requests to handlers. This document defines best practices for implementing routing in Go web services.

## Core Principles

1. **RESTful Design**: Follow REST principles for resource-based APIs
2. **URL Parameters**: Use path parameters for resource identifiers
3. **Query Parameters**: Use query strings for filtering and pagination
4. **Method Routing**: Route based on HTTP methods (GET, POST, PUT, DELETE)
5. **Versioning**: Support API versioning through URLs or headers

## Rules

### GOL.3.1.3.1: Use Established Routing Libraries

**Rule**: Use proven routing libraries like `gorilla/mux`, `chi`, or `echo` for complex routing needs.

**Severity**: WARNING

**Rationale**: Standard library `http.ServeMux` is limited; established libraries provide better features.

**✅ Good - Using chi**:
```go
import "github.com/go-chi/chi/v5"

func setupRoutes() http.Handler {
    r := chi.NewRouter()
    
    // Middleware
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    
    // Routes
    r.Get("/health", handleHealth)
    
    r.Route("/api/v1", func(r chi.Router) {
        r.Use(authMiddleware)
        
        r.Route("/users", func(r chi.Router) {
            r.Get("/", listUsers)           // GET /api/v1/users
            r.Post("/", createUser)          // POST /api/v1/users
            r.Get("/{id}", getUser)          // GET /api/v1/users/123
            r.Put("/{id}", updateUser)       // PUT /api/v1/users/123
            r.Delete("/{id}", deleteUser)    // DELETE /api/v1/users/123
        })
    })
    
    return r
}
```

**✅ Good - Using gorilla/mux**:
```go
import "github.com/gorilla/mux"

func setupRoutes() http.Handler {
    r := mux.NewRouter()
    
    // API v1 routes
    api := r.PathPrefix("/api/v1").Subrouter()
    api.Use(authMiddleware)
    
    // User routes
    api.HandleFunc("/users", listUsers).Methods("GET")
    api.HandleFunc("/users", createUser).Methods("POST")
    api.HandleFunc("/users/{id}", getUser).Methods("GET")
    api.HandleFunc("/users/{id}", updateUser).Methods("PUT")
    api.HandleFunc("/users/{id}", deleteUser).Methods("DELETE")
    
    return r
}
```

### GOL.3.1.3.2: Follow RESTful Resource Naming

**Rule**: Use plural nouns for resources and standard HTTP methods for operations.

**Severity**: WARNING

**Rationale**: Consistent RESTful design improves API usability and predictability.

**RESTful Patterns**:
- `GET /users` - List all users
- `GET /users/{id}` - Get specific user
- `POST /users` - Create new user
- `PUT /users/{id}` - Update entire user
- `PATCH /users/{id}` - Partial update user
- `DELETE /users/{id}` - Delete user

**✅ Good**:
```go
r.Route("/api/v1/users", func(r chi.Router) {
    r.Get("/", listUsers)              // List users
    r.Post("/", createUser)            // Create user
    r.Get("/{id}", getUser)            // Get user by ID
    r.Put("/{id}", updateUser)         // Update user
    r.Delete("/{id}", deleteUser)      // Delete user
    
    // Nested resources
    r.Get("/{id}/posts", getUserPosts) // Get user's posts
})
```

**❌ Bad**:
```go
// Non-RESTful, verb-based URLs
r.Get("/getUser", getUser)
r.Post("/createUser", createUser)
r.Post("/deleteUser", deleteUser)
```

### GOL.3.1.3.3: Extract URL Parameters Safely

**Rule**: Always validate URL parameters before use.

**Severity**: ERROR

**Rationale**: Invalid parameters can cause panics or security vulnerabilities.

**✅ Good**:
```go
func getUser(w http.ResponseWriter, r *http.Request) {
    // Extract parameter
    idStr := chi.URLParam(r, "id")
    if idStr == "" {
        http.Error(w, "Missing user ID", http.StatusBadRequest)
        return
    }
    
    // Validate and convert
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }
    
    // Use validated parameter
    user, err := getUserByID(r.Context(), id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            http.Error(w, "User not found", http.StatusNotFound)
            return
        }
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(user)
}
```

### GOL.3.1.3.4: Implement API Versioning

**Rule**: Version APIs using URL path prefixes (e.g., `/api/v1`, `/api/v2`).

**Severity**: WARNING

**Rationale**: Versioning enables backward compatibility and gradual migration.

**✅ Good**:
```go
func setupRoutes() http.Handler {
    r := chi.NewRouter()
    
    // Version 1 API
    r.Route("/api/v1", func(r chi.Router) {
        r.Get("/users", listUsersV1)
        r.Get("/users/{id}", getUserV1)
    })
    
    // Version 2 API with breaking changes
    r.Route("/api/v2", func(r chi.Router) {
        r.Get("/users", listUsersV2)
        r.Get("/users/{id}", getUserV2)
    })
    
    return r
}
```

### GOL.3.1.3.5: Use Query Parameters for Filtering

**Rule**: Use query parameters for filtering, sorting, and pagination.

**Severity**: INFO

**✅ Good**:
```go
func listUsers(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    // Parse query parameters
    query := r.URL.Query()
    
    // Pagination
    page, _ := strconv.Atoi(query.Get("page"))
    if page < 1 {
        page = 1
    }
    
    limit, _ := strconv.Atoi(query.Get("limit"))
    if limit < 1 || limit > 100 {
        limit = 20
    }
    
    // Filtering
    role := query.Get("role")
    status := query.Get("status")
    
    // Sorting
    sortBy := query.Get("sort")
    if sortBy == "" {
        sortBy = "created_at"
    }
    
    // Build filter
    filter := UserFilter{
        Page:   page,
        Limit:  limit,
        Role:   role,
        Status: status,
        SortBy: sortBy,
    }
    
    users, total, err := listUsersWithFilter(ctx, filter)
    if err != nil {
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return
    }
    
    // Return paginated response
    response := PaginatedResponse{
        Data:  users,
        Total: total,
        Page:  page,
        Limit: limit,
    }
    
    json.NewEncoder(w).Encode(response)
}
```

## References

- [RESTful API Design](https://restfulapi.net/)
- [chi router](https://github.com/go-chi/chi)
- [gorilla/mux](https://github.com/gorilla/mux)

