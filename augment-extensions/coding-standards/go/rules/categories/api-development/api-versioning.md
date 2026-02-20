# API Versioning Rules

## Overview

Best practices for versioning REST APIs in Go including URL versioning, header versioning, and backward compatibility.

## Rules

### 1. Use URL Path Versioning

**Rule**: Include API version in the URL path for clarity.

**Good Example**:
```go
func SetupVersionedRoutes(r *mux.Router) {
    // Version 1
    v1 := r.PathPrefix("/api/v1").Subrouter()
    v1.HandleFunc("/users", v1.ListUsers).Methods("GET")
    v1.HandleFunc("/users/{id}", v1.GetUser).Methods("GET")
    
    // Version 2
    v2 := r.PathPrefix("/api/v2").Subrouter()
    v2.HandleFunc("/users", v2.ListUsers).Methods("GET")
    v2.HandleFunc("/users/{id}", v2.GetUser).Methods("GET")
}
```

### 2. Maintain Backward Compatibility

**Rule**: Keep old API versions functional while introducing new versions.

**Good Example**:
```go
// V1 User structure
type UserV1 struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

// V2 User structure with additional fields
type UserV2 struct {
    ID        string    `json:"id"`
    FirstName string    `json:"first_name"`
    LastName  string    `json:"last_name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

// Convert internal model to V1
func toUserV1(user *User) *UserV1 {
    return &UserV1{
        ID:    user.ID,
        Name:  user.FirstName + " " + user.LastName,
        Email: user.Email,
    }
}

// Convert internal model to V2
func toUserV2(user *User) *UserV2 {
    return &UserV2{
        ID:        user.ID,
        FirstName: user.FirstName,
        LastName:  user.LastName,
        Email:     user.Email,
        CreatedAt: user.CreatedAt,
    }
}
```

### 3. Document Version Deprecation

**Rule**: Clearly communicate version deprecation timelines.

**Good Example**:
```go
func DeprecationMiddleware(version string, sunsetDate time.Time) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Deprecation", "true")
            w.Header().Set("Sunset", sunsetDate.Format(time.RFC1123))
            w.Header().Set("Link", fmt.Sprintf("</api/%s>; rel=\"successor-version\"", version))
            
            next.ServeHTTP(w, r)
        })
    }
}

// Apply to deprecated version
v1Router.Use(DeprecationMiddleware("v2", time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC)))
```

### 4. Support Content Negotiation

**Rule**: Allow clients to specify version via Accept header as alternative.

**Good Example**:
```go
func VersionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        version := "v1" // default
        
        // Check Accept header
        accept := r.Header.Get("Accept")
        if strings.Contains(accept, "application/vnd.api.v2+json") {
            version = "v2"
        } else if strings.Contains(accept, "application/vnd.api.v1+json") {
            version = "v1"
        }
        
        // Store version in context
        ctx := context.WithValue(r.Context(), "api_version", version)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 5. Version Breaking Changes Only

**Rule**: Only increment version for breaking changes, not additions.

**Good Example**:
```go
// V1 - Original
type CreateUserRequestV1 struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

// V1.1 - Added optional field (backward compatible, no version bump)
type CreateUserRequestV1 struct {
    Name     string  `json:"name"`
    Email    string  `json:"email"`
    Phone    *string `json:"phone,omitempty"` // Optional, backward compatible
}

// V2 - Breaking change (required field changed)
type CreateUserRequestV2 struct {
    FirstName string `json:"first_name"` // Breaking: split name field
    LastName  string `json:"last_name"`  // Breaking: split name field
    Email     string `json:"email"`
}
```

## References

- [API Versioning Best Practices](https://www.freecodecamp.org/news/how-to-version-a-rest-api/)
- [Semantic Versioning](https://semver.org/)

