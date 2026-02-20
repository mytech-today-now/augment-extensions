# REST API Development Go Application AI Template

## Context

You are building a RESTful API in Go with proper versioning, rate limiting, pagination, and error handling.

## Key Requirements

### REST API Design
- Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Return correct HTTP status codes for different scenarios
- Implement consistent error response format
- Support pagination for collection endpoints
- Implement filtering and sorting query parameters

### API Versioning
- Use URL path versioning (/api/v1, /api/v2)
- Maintain backward compatibility for old versions
- Document version deprecation with headers
- Support content negotiation as alternative
- Only version breaking changes, not additions

### Rate Limiting
- Implement token bucket algorithm for smooth limiting
- Return rate limit headers (X-RateLimit-*)
- Apply different limits for different endpoints
- Support API key-based rate limiting with tiers
- Use Redis for distributed rate limiting

### Error Handling
- Return structured error responses with details
- Include error codes for programmatic handling
- Provide helpful error messages
- Log errors with appropriate context

## Code Structure

```go
type API struct {
    router      *mux.Router
    rateLimiter *RateLimiter
}

type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
    Code    string `json:"code,omitempty"`
}

type PaginatedResponse struct {
    Data       interface{} `json:"data"`
    Page       int         `json:"page"`
    PageSize   int         `json:"page_size"`
    TotalItems int         `json:"total_items"`
}
```

## Example Patterns

### REST Endpoints
```go
func SetupRoutes(r *mux.Router) {
    v1 := r.PathPrefix("/api/v1").Subrouter()
    v1.HandleFunc("/users", CreateUser).Methods("POST")
    v1.HandleFunc("/users", ListUsers).Methods("GET")
    v1.HandleFunc("/users/{id}", GetUser).Methods("GET")
    v1.HandleFunc("/users/{id}", UpdateUser).Methods("PUT")
    v1.HandleFunc("/users/{id}", DeleteUser).Methods("DELETE")
}
```

### Error Handling
```go
func CreateUser(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        writeError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    
    if err := validateUser(&user); err != nil {
        writeError(w, http.StatusUnprocessableEntity, err.Error())
        return
    }
    
    writeJSON(w, http.StatusCreated, user)
}
```

### Pagination
```go
func ListUsers(w http.ResponseWriter, r *http.Request) {
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    if page < 1 {
        page = 1
    }
    
    pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }
    
    users, total, _ := db.ListUsers(page, pageSize)
    
    response := PaginatedResponse{
        Data:       users,
        Page:       page,
        PageSize:   pageSize,
        TotalItems: total,
        TotalPages: (total + pageSize - 1) / pageSize,
    }
    
    writeJSON(w, http.StatusOK, response)
}
```

### Rate Limiting
```go
func RateLimitMiddleware(limiter *RateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            key := getClientKey(r)
            l := limiter.GetLimiter(key)
            
            if !l.Allow() {
                w.Header().Set("X-RateLimit-Limit", "100")
                w.Header().Set("X-RateLimit-Remaining", "0")
                w.Header().Set("Retry-After", "60")
                writeError(w, http.StatusTooManyRequests, "Rate limit exceeded")
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}
```

## Best Practices

1. **Consistency**: Use consistent naming and response formats
2. **Documentation**: Provide OpenAPI/Swagger documentation
3. **Security**: Implement authentication and authorization
4. **Validation**: Validate all inputs thoroughly
5. **Testing**: Write integration tests for all endpoints

## Common Pitfalls to Avoid

- ❌ Not returning appropriate status codes
- ❌ Missing pagination on collection endpoints
- ❌ Inconsistent error response format
- ❌ Not implementing rate limiting
- ❌ Breaking changes without version increment

## References

- [REST API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [API Versioning](https://www.freecodecamp.org/news/how-to-version-a-rest-api/)

