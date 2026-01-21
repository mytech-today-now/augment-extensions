# API Documentation

Best practices for documenting APIs effectively.

## OpenAPI/Swagger (Recommended)

Use OpenAPI specification for REST APIs.

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: API for managing users
  contact:
    email: api@example.com
  license:
    name: MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

paths:
  /users:
    get:
      summary: List users
      description: Retrieve a paginated list of users
      tags:
        - Users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Create user
      description: Create a new user
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '422':
          $ref: '#/components/responses/ValidationError'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: "123"
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john@example.com"
        createdAt:
          type: string
          format: date-time
    
    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
    
    UserList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        meta:
          $ref: '#/components/schemas/PaginationMeta'
  
  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    ValidationError:
      description: Validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ValidationError'
  
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

## GraphQL Documentation

Use schema descriptions and tools like GraphQL Playground.

```graphql
"""
Represents a user in the system
"""
type User {
  """
  Unique identifier for the user
  """
  id: ID!
  
  """
  User's full name
  """
  name: String!
  
  """
  User's email address (must be unique)
  """
  email: String!
  
  """
  User's role in the system
  """
  role: UserRole!
  
  """
  Timestamp when the user was created
  """
  createdAt: DateTime!
}

"""
Available user roles
"""
enum UserRole {
  """
  Administrator with full access
  """
  ADMIN
  
  """
  Regular user with limited access
  """
  USER
}

type Query {
  """
  Retrieve a single user by ID
  
  Returns null if user not found
  """
  user(
    """
    The unique identifier of the user
    """
    id: ID!
  ): User
  
  """
  List all users with optional filtering
  
  Supports pagination using cursor-based approach
  """
  users(
    """
    Filter by user role
    """
    role: UserRole
    
    """
    Number of users to return (max 100)
    """
    first: Int = 20
    
    """
    Cursor for pagination
    """
    after: String
  ): UserConnection!
}
```

## README Documentation

Provide comprehensive README for API.

```markdown
# User API

REST API for managing users.

## Base URL

```
Production: https://api.example.com/v1
Staging: https://staging-api.example.com/v1
```

## Authentication

All endpoints require authentication using JWT tokens.

```bash
# Login to get token
curl -X POST https://api.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}'

# Use token in requests
curl https://api.example.com/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Endpoints

### List Users

```
GET /users
```

Query Parameters:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `role` (string) - Filter by role (admin, user)

Response:
```json
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (422) - Invalid input
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found

## Rate Limiting

- 1000 requests per hour per API key
- Rate limit info in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Versioning

API is versioned in the URL: `/v1/`, `/v2/`, etc.

Current version: v1

## SDKs

- JavaScript: `npm install @example/api-client`
- Python: `pip install example-api-client`

## Support

- Documentation: https://docs.example.com
- Email: api@example.com
- GitHub: https://github.com/example/api
```

## Code Examples

Provide examples in multiple languages.

```markdown
## Examples

### JavaScript

```javascript
const response = await fetch('https://api.example.com/v1/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const users = await response.json();
```

### Python

```python
import requests

response = requests.get(
    'https://api.example.com/v1/users',
    headers={'Authorization': f'Bearer {token}'}
)
users = response.json()
```

### cURL

```bash
curl https://api.example.com/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```
```

## Best Practices

1. **Use OpenAPI** - For REST APIs
2. **Use schema descriptions** - For GraphQL
3. **Provide examples** - In multiple languages
4. **Document errors** - List all error codes
5. **Include authentication** - How to authenticate
6. **Show rate limits** - Document limits
7. **Version documentation** - Docs for each version
8. **Interactive docs** - Swagger UI, GraphQL Playground
9. **Keep updated** - Sync with code
10. **Provide SDKs** - Client libraries
11. **Include changelog** - Document changes
12. **Add tutorials** - Getting started guides
13. **Show use cases** - Common scenarios
14. **Document webhooks** - If applicable
15. **Provide support** - Contact information

