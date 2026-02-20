# REST API Design Rules

## Overview

Best practices for designing RESTful APIs in Go including resource modeling, HTTP methods, status codes, and response formats.

## Rules

### 1. Use Proper HTTP Methods

**Rule**: Use appropriate HTTP methods for different operations.

**Good Example**:
```go
func SetupRoutes(r *mux.Router) {
    // Collection operations
    r.HandleFunc("/api/v1/users", CreateUser).Methods("POST")
    r.HandleFunc("/api/v1/users", ListUsers).Methods("GET")
    
    // Resource operations
    r.HandleFunc("/api/v1/users/{id}", GetUser).Methods("GET")
    r.HandleFunc("/api/v1/users/{id}", UpdateUser).Methods("PUT")
    r.HandleFunc("/api/v1/users/{id}", PatchUser).Methods("PATCH")
    r.HandleFunc("/api/v1/users/{id}", DeleteUser).Methods("DELETE")
}
```

### 2. Return Appropriate Status Codes

**Rule**: Use correct HTTP status codes for different scenarios.

**Good Example**:
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
    
    if err := db.CreateUser(&user); err != nil {
        if isDuplicateError(err) {
            writeError(w, http.StatusConflict, "User already exists")
            return
        }
        writeError(w, http.StatusInternalServerError, "Failed to create user")
        return
    }
    
    writeJSON(w, http.StatusCreated, user)
}
```

### 3. Implement Consistent Error Responses

**Rule**: Return structured error responses with consistent format.

**Good Example**:
```go
type ErrorResponse struct {
    Error   string            `json:"error"`
    Message string            `json:"message"`
    Code    string            `json:"code,omitempty"`
    Details map[string]string `json:"details,omitempty"`
}

func writeError(w http.ResponseWriter, status int, message string) {
    response := ErrorResponse{
        Error:   http.StatusText(status),
        Message: message,
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(response)
}
```

### 4. Support Pagination for Collections

**Rule**: Implement pagination for list endpoints.

**Good Example**:
```go
type PaginationParams struct {
    Page     int `json:"page"`
    PageSize int `json:"page_size"`
}

type PaginatedResponse struct {
    Data       interface{} `json:"data"`
    Page       int         `json:"page"`
    PageSize   int         `json:"page_size"`
    TotalItems int         `json:"total_items"`
    TotalPages int         `json:"total_pages"`
}

func ListUsers(w http.ResponseWriter, r *http.Request) {
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    if page < 1 {
        page = 1
    }
    
    pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }
    
    users, total, err := db.ListUsers(page, pageSize)
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to list users")
        return
    }
    
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

### 5. Implement Filtering and Sorting

**Rule**: Support filtering and sorting query parameters.

**Good Example**:
```go
type QueryParams struct {
    Filters map[string]string
    SortBy  string
    Order   string
}

func ParseQueryParams(r *http.Request) *QueryParams {
    params := &QueryParams{
        Filters: make(map[string]string),
        SortBy:  r.URL.Query().Get("sort_by"),
        Order:   r.URL.Query().Get("order"),
    }
    
    // Parse filter parameters
    for key, values := range r.URL.Query() {
        if strings.HasPrefix(key, "filter_") {
            filterKey := strings.TrimPrefix(key, "filter_")
            params.Filters[filterKey] = values[0]
        }
    }
    
    if params.Order != "asc" && params.Order != "desc" {
        params.Order = "asc"
    }
    
    return params
}

func ListUsersWithFilters(w http.ResponseWriter, r *http.Request) {
    params := ParseQueryParams(r)
    
    users, err := db.QueryUsers(params)
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to query users")
        return
    }
    
    writeJSON(w, http.StatusOK, users)
}
```

## References

- [REST API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)

