# RESTful API Design

Best practices for designing RESTful APIs.

## Resource Naming

Use nouns for resources, not verbs.

```
# Good - Nouns
GET    /users
GET    /users/123
POST   /users
PUT    /users/123
DELETE /users/123

GET    /users/123/orders
POST   /users/123/orders

# Bad - Verbs
GET    /getUsers
POST   /createUser
POST   /deleteUser/123
```

## HTTP Methods

Use appropriate HTTP methods for operations.

```
GET    - Retrieve resource(s) (safe, idempotent)
POST   - Create new resource (not idempotent)
PUT    - Update/replace entire resource (idempotent)
PATCH  - Partial update of resource (idempotent)
DELETE - Remove resource (idempotent)
HEAD   - Get headers only (safe, idempotent)
OPTIONS - Get available methods (safe, idempotent)
```

## URL Structure

Keep URLs simple, intuitive, and hierarchical.

```
# Good - Clear hierarchy
GET /api/v1/users/123/orders/456/items

# Good - Query parameters for filtering
GET /api/v1/users?role=admin&status=active

# Good - Pagination
GET /api/v1/users?page=2&limit=20

# Bad - Deep nesting
GET /api/v1/users/123/orders/456/items/789/reviews/012

# Bad - Actions in URL
POST /api/v1/users/123/activate
# Better: PATCH /api/v1/users/123 with {"status": "active"}
```

## HTTP Status Codes

Use appropriate status codes.

```
# Success
200 OK              - Successful GET, PUT, PATCH, DELETE
201 Created         - Successful POST (resource created)
204 No Content      - Successful DELETE (no response body)

# Client Errors
400 Bad Request     - Invalid request data
401 Unauthorized    - Authentication required
403 Forbidden       - Authenticated but not authorized
404 Not Found       - Resource doesn't exist
409 Conflict        - Resource conflict (e.g., duplicate)
422 Unprocessable   - Validation errors
429 Too Many Requests - Rate limit exceeded

# Server Errors
500 Internal Server Error - Server error
502 Bad Gateway          - Upstream server error
503 Service Unavailable  - Server temporarily unavailable
```

## Request/Response Format

Use consistent JSON structure.

```json
// Good - GET /api/v1/users/123
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}

// Good - POST /api/v1/users (request)
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "admin"
}

// Good - POST /api/v1/users (response)
{
  "id": "124",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "admin",
  "createdAt": "2024-01-21T09:00:00Z"
}

// Good - Collection response
{
  "data": [
    { "id": "123", "name": "John Doe" },
    { "id": "124", "name": "Jane Smith" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "links": {
    "self": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=2",
    "last": "/api/v1/users?page=5"
  }
}
```

## Error Responses

Provide consistent, helpful error messages.

```json
// Good - Detailed error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "age",
        "message": "Age must be at least 18"
      }
    ],
    "timestamp": "2024-01-21T10:00:00Z",
    "path": "/api/v1/users"
  }
}

// Good - Simple error
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "timestamp": "2024-01-21T10:00:00Z"
  }
}
```

## Filtering, Sorting, Pagination

Support common query operations.

```
# Filtering
GET /api/v1/users?role=admin&status=active

# Sorting
GET /api/v1/users?sort=name
GET /api/v1/users?sort=-createdAt  # Descending

# Pagination (offset-based)
GET /api/v1/users?page=2&limit=20

# Pagination (cursor-based)
GET /api/v1/users?cursor=abc123&limit=20

# Field selection
GET /api/v1/users?fields=id,name,email

# Search
GET /api/v1/users?q=john
```

## Best Practices

1. **Use nouns** - Resources are nouns, not verbs
2. **Use plural names** - `/users` not `/user`
3. **Use HTTP methods** - Don't put actions in URLs
4. **Use proper status codes** - Be specific and consistent
5. **Version your API** - `/api/v1/users`
6. **Use JSON** - Standard format for requests/responses
7. **Support pagination** - For collections
8. **Provide filtering** - Allow clients to filter data
9. **Use HATEOAS** - Include links in responses (optional)
10. **Document everything** - Use OpenAPI/Swagger
11. **Use ISO 8601** - For dates and times
12. **Use snake_case or camelCase** - Be consistent
13. **Validate input** - Return 422 for validation errors
14. **Rate limit** - Protect your API
15. **Use HTTPS** - Always encrypt traffic

