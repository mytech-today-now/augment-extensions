# API Error Handling

Best practices for handling and communicating errors in APIs.

## Error Response Structure

Use consistent error response format.

```json
// Good - Comprehensive error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for one or more fields",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "REQUIRED_FIELD"
      },
      {
        "field": "age",
        "message": "Age must be at least 18",
        "code": "MIN_VALUE",
        "value": 15,
        "constraint": 18
      }
    ],
    "timestamp": "2024-01-21T10:00:00Z",
    "path": "/api/v1/users",
    "requestId": "req_abc123"
  }
}

// Good - Simple error
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "timestamp": "2024-01-21T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

## HTTP Status Codes

Use appropriate status codes for different error types.

```
# Client Errors (4xx)
400 Bad Request          - Malformed request syntax
401 Unauthorized         - Authentication required or failed
403 Forbidden            - Authenticated but not authorized
404 Not Found            - Resource doesn't exist
405 Method Not Allowed   - HTTP method not supported
409 Conflict             - Resource conflict (e.g., duplicate)
410 Gone                 - Resource permanently deleted
422 Unprocessable Entity - Validation errors
429 Too Many Requests    - Rate limit exceeded

# Server Errors (5xx)
500 Internal Server Error - Unexpected server error
502 Bad Gateway          - Invalid response from upstream
503 Service Unavailable  - Server temporarily unavailable
504 Gateway Timeout      - Upstream server timeout
```

## Error Codes

Define machine-readable error codes.

```typescript
// Good - Enum of error codes
enum ErrorCode {
  // Validation errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  
  // Authentication errors (401)
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Authorization errors (403)
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_FORBIDDEN = 'RESOURCE_FORBIDDEN',
  
  // Not found errors (404)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ENDPOINT_NOT_FOUND = 'ENDPOINT_NOT_FOUND',
  
  // Conflict errors (409)
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

## Validation Errors

Provide detailed validation error information.

```json
// Good - Field-level validation errors
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address",
        "code": "INVALID_FORMAT",
        "value": "not-an-email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "code": "MIN_LENGTH",
        "value": "***",
        "constraint": 8
      },
      {
        "field": "age",
        "message": "Age must be between 18 and 120",
        "code": "OUT_OF_RANGE",
        "value": 150,
        "min": 18,
        "max": 120
      }
    ]
  }
}
```

## Authentication Errors

Handle authentication failures clearly.

```json
// 401 Unauthorized - Invalid credentials
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "timestamp": "2024-01-21T10:00:00Z"
  }
}

// 401 Unauthorized - Token expired
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired",
    "expiredAt": "2024-01-21T09:00:00Z",
    "hint": "Use refresh token to obtain a new access token"
  }
}

// 401 Unauthorized - Invalid token
{
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invalid or malformed access token"
  }
}
```

## Authorization Errors

Communicate permission issues.

```json
// 403 Forbidden - Insufficient permissions
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to perform this action",
    "requiredPermission": "write:users",
    "userPermissions": ["read:users"]
  }
}

// 403 Forbidden - Resource forbidden
{
  "error": {
    "code": "RESOURCE_FORBIDDEN",
    "message": "You don't have access to this resource"
  }
}
```

## Not Found Errors

Distinguish between different types of "not found".

```json
// 404 Not Found - Resource
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "resourceType": "User",
    "resourceId": "123"
  }
}

// 404 Not Found - Endpoint
{
  "error": {
    "code": "ENDPOINT_NOT_FOUND",
    "message": "The requested endpoint does not exist",
    "path": "/api/v1/invalid-endpoint"
  }
}
```

## Rate Limiting Errors

Provide retry information.

```json
// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "limit": 1000,
    "remaining": 0,
    "resetAt": "2024-01-21T11:00:00Z",
    "retryAfter": 3600
  }
}
```

## Server Errors

Handle internal errors gracefully.

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "requestId": "req_abc123",
    "timestamp": "2024-01-21T10:00:00Z"
  }
}

// Don't expose internal details in production
// Bad - Exposing stack trace
{
  "error": {
    "message": "Database connection failed",
    "stack": "Error: connect ECONNREFUSED...",  // ❌ Don't expose
    "query": "SELECT * FROM users WHERE..."     // ❌ Don't expose
  }
}
```

## Best Practices

1. **Use consistent format** - Same structure for all errors
2. **Use proper status codes** - Match HTTP semantics
3. **Provide error codes** - Machine-readable codes
4. **Include helpful messages** - Human-readable descriptions
5. **Field-level errors** - For validation failures
6. **Include request ID** - For debugging and support
7. **Include timestamp** - When error occurred
8. **Don't expose internals** - Hide stack traces in production
9. **Log errors** - Server-side logging for debugging
10. **Document errors** - List possible error codes
11. **Localize messages** - Support multiple languages
12. **Provide hints** - Suggest how to fix the error
13. **Rate limit info** - Include retry information
14. **Validate early** - Fail fast on invalid input
15. **Monitor errors** - Track error rates and types

