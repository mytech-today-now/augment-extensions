# API Authentication & Authorization

Best practices for securing APIs with authentication and authorization.

## Authentication Methods

### JWT (JSON Web Tokens) - Recommended

Stateless authentication using signed tokens.

```
# Request
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "secret"
}

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}

# Subsequent requests
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Advantages:
- Stateless (no server-side session storage)
- Scalable
- Works across domains
- Contains user claims

# Disadvantages:
- Cannot revoke before expiration (use short expiry + refresh tokens)
- Larger than session IDs
```

### API Keys

Simple authentication for service-to-service communication.

```
# Request
GET /api/v1/data
X-API-Key: sk_live_abc123def456

# Or in query parameter (less secure)
GET /api/v1/data?api_key=sk_live_abc123def456

# Advantages:
- Simple to implement
- Good for service-to-service auth

# Disadvantages:
- No user context
- Hard to rotate
- Can be leaked in logs/URLs
```

### OAuth 2.0

Delegated authorization for third-party access.

```
# Authorization Code Flow
1. Client redirects to authorization server
   GET /oauth/authorize?
     response_type=code&
     client_id=abc123&
     redirect_uri=https://app.com/callback&
     scope=read:users

2. User approves, redirected back with code
   https://app.com/callback?code=xyz789

3. Exchange code for token
   POST /oauth/token
   {
     "grant_type": "authorization_code",
     "code": "xyz789",
     "client_id": "abc123",
     "client_secret": "secret",
     "redirect_uri": "https://app.com/callback"
   }

4. Response with access token
   {
     "access_token": "...",
     "refresh_token": "...",
     "expires_in": 3600,
     "token_type": "Bearer"
   }

# Use access token
GET /api/v1/users
Authorization: Bearer <access_token>
```

## Token Management

### Access & Refresh Tokens

```
# Access Token (short-lived: 15 minutes - 1 hour)
{
  "sub": "user123",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1640000000,
  "iat": 1639996400
}

# Refresh Token (long-lived: 7-30 days)
- Stored securely (httpOnly cookie or secure storage)
- Used to obtain new access tokens
- Can be revoked

# Refresh flow
POST /api/v1/auth/refresh
{
  "refreshToken": "..."
}

Response:
{
  "accessToken": "...",
  "expiresIn": 3600
}
```

### Token Storage

```
# Good - Secure storage
- Access token: Memory or sessionStorage (web)
- Refresh token: httpOnly cookie (web) or secure storage (mobile)

# Bad - Insecure storage
- localStorage (vulnerable to XSS)
- URL parameters (logged in server logs)
- Unencrypted storage
```

## Authorization

### Role-Based Access Control (RBAC)

```
# User roles
{
  "sub": "user123",
  "role": "admin",
  "permissions": ["read:users", "write:users", "delete:users"]
}

# Endpoint protection
GET /api/v1/users          - Requires: read:users
POST /api/v1/users         - Requires: write:users
DELETE /api/v1/users/123   - Requires: delete:users

# Implementation
if (!user.permissions.includes('write:users')) {
  return 403 Forbidden
}
```

### Attribute-Based Access Control (ABAC)

```
# More granular control
{
  "sub": "user123",
  "department": "engineering",
  "level": "senior"
}

# Rules
- Users can edit their own profile
- Managers can edit profiles in their department
- Admins can edit all profiles

# Implementation
if (resource.userId === user.id) {
  return true; // Own resource
}
if (user.role === 'manager' && resource.department === user.department) {
  return true; // Same department
}
if (user.role === 'admin') {
  return true; // Admin access
}
return false;
```

## Security Best Practices

### HTTPS Only

```
# Always use HTTPS
https://api.example.com/v1/users ✅
http://api.example.com/v1/users  ❌

# Redirect HTTP to HTTPS
# Set HSTS header
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Rate Limiting

```
# Response headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000

# When exceeded
HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

### CORS Configuration

```
# Proper CORS headers
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400

# Don't use wildcard with credentials
Access-Control-Allow-Origin: * ❌ (with credentials)
Access-Control-Allow-Credentials: true
```

## Best Practices

1. **Use HTTPS** - Always encrypt traffic
2. **Use JWT** - For stateless authentication
3. **Short-lived tokens** - Access tokens expire quickly
4. **Refresh tokens** - For obtaining new access tokens
5. **Secure storage** - httpOnly cookies or secure storage
6. **Validate tokens** - Verify signature and expiration
7. **Rate limiting** - Prevent abuse
8. **CORS properly** - Don't use wildcard with credentials
9. **Log auth events** - Track login attempts
10. **Use strong secrets** - For signing tokens
11. **Rotate secrets** - Periodically change signing keys
12. **Implement logout** - Invalidate refresh tokens
13. **Multi-factor auth** - For sensitive operations
14. **Monitor suspicious activity** - Detect brute force
15. **Document auth flow** - Clear documentation for clients

