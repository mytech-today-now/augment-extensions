# API Versioning

Strategies for versioning APIs to maintain backward compatibility.

## Versioning Strategies

### URL Versioning (Recommended for REST)

Include version in the URL path.

```
# Good - Version in URL
GET /api/v1/users
GET /api/v2/users

# Advantages:
- Clear and explicit
- Easy to route
- Easy to cache
- Easy to test different versions

# Disadvantages:
- URL changes between versions
- Can lead to code duplication
```

### Header Versioning

Use custom header for version.

```
# Request
GET /api/users
Accept-Version: v1

# Or using Accept header
GET /api/users
Accept: application/vnd.myapi.v1+json

# Advantages:
- Clean URLs
- Follows REST principles

# Disadvantages:
- Less visible
- Harder to test in browser
- Caching complexity
```

### Query Parameter Versioning

Include version as query parameter.

```
# Request
GET /api/users?version=1

# Advantages:
- Simple to implement
- Easy to test

# Disadvantages:
- Pollutes query parameters
- Less clean than URL versioning
```

## Semantic Versioning

Use semantic versioning for API versions.

```
# Format: MAJOR.MINOR.PATCH

v1.0.0 - Initial release
v1.1.0 - Added new endpoints (backward compatible)
v1.1.1 - Bug fixes (backward compatible)
v2.0.0 - Breaking changes (not backward compatible)

# In URLs, typically use only MAJOR version
/api/v1/users  (represents v1.x.x)
/api/v2/users  (represents v2.x.x)
```

## Breaking vs Non-Breaking Changes

### Non-Breaking Changes (Safe)

```
✅ Adding new endpoints
✅ Adding new optional fields to requests
✅ Adding new fields to responses
✅ Adding new query parameters (optional)
✅ Making required fields optional
✅ Relaxing validation rules
✅ Adding new enum values (if clients handle unknown values)

# Example: Adding optional field
# v1.0.0
POST /api/v1/users
{
  "name": "John",
  "email": "john@example.com"
}

# v1.1.0 (backward compatible)
POST /api/v1/users
{
  "name": "John",
  "email": "john@example.com",
  "phone": "555-1234"  # New optional field
}
```

### Breaking Changes (Require New Version)

```
❌ Removing endpoints
❌ Removing fields from responses
❌ Removing query parameters
❌ Renaming fields
❌ Changing field types
❌ Making optional fields required
❌ Changing URL structure
❌ Changing authentication method
❌ Stricter validation rules

# Example: Breaking change requires v2
# v1
GET /api/v1/users/123
{
  "id": "123",
  "name": "John Doe"
}

# v2 (breaking: renamed field)
GET /api/v2/users/123
{
  "id": "123",
  "fullName": "John Doe"  # Renamed from 'name'
}
```

## Deprecation Strategy

Gracefully deprecate old versions.

```
# 1. Announce deprecation
GET /api/v1/users
Response Headers:
  Deprecation: true
  Sunset: Sat, 31 Dec 2024 23:59:59 GMT
  Link: </api/v2/users>; rel="successor-version"

# 2. Response body warning
{
  "data": [...],
  "warnings": [
    {
      "code": "DEPRECATED_VERSION",
      "message": "API v1 is deprecated. Please migrate to v2 by Dec 31, 2024.",
      "link": "https://docs.example.com/migration-guide"
    }
  ]
}

# 3. Deprecation timeline
Month 0:  Announce v2, v1 still supported
Month 3:  Add deprecation warnings to v1
Month 6:  v1 in maintenance mode (bug fixes only)
Month 12: v1 sunset (no longer available)
```

## Version Migration

Provide migration paths.

```
# Good - Support both versions during transition
# v1 endpoint (deprecated)
GET /api/v1/users/123
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com"
}

# v2 endpoint (current)
GET /api/v2/users/123
{
  "id": "123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "profile": {
    "avatar": "https://..."
  }
}

# Provide migration guide
# docs/migration/v1-to-v2.md
- 'name' field split into 'firstName' and 'lastName'
- Added 'profile' object with nested fields
- All dates now in ISO 8601 format
```

## GraphQL Versioning

GraphQL uses schema evolution instead of versioning.

```graphql
# Good - Deprecate fields, don't remove
type User {
  id: ID!
  name: String! @deprecated(reason: "Use firstName and lastName instead")
  firstName: String!
  lastName: String!
}

# Good - Add new fields
type User {
  id: ID!
  email: String!
  phone: String  # New optional field
}

# Bad - Breaking change (don't do this)
type User {
  id: ID!
  # Removed 'name' field without deprecation period
  firstName: String!
  lastName: String!
}
```

## Best Practices

1. **Use URL versioning** - For REST APIs (most explicit)
2. **Version only on breaking changes** - Use semantic versioning
3. **Support multiple versions** - During transition period
4. **Deprecate gracefully** - Give clients time to migrate
5. **Document changes** - Maintain changelog
6. **Provide migration guides** - Help clients upgrade
7. **Use sunset headers** - Communicate deprecation timeline
8. **Test all versions** - Ensure backward compatibility
9. **Monitor usage** - Track version adoption
10. **Plan deprecation** - Have clear timeline
11. **Avoid micro-versions** - Don't version every change
12. **Use feature flags** - For gradual rollouts
13. **Keep v1 simple** - Don't over-engineer first version
14. **Version documentation** - Docs for each version
15. **Automate testing** - Test all supported versions

## Version Support Policy

```
# Example policy
- Current version (v3): Full support
- Previous version (v2): Maintenance mode (12 months)
- Older versions (v1): Deprecated (6 months notice before sunset)

# Timeline example
2024-01-01: v3 released, v2 enters maintenance, v1 deprecated
2024-07-01: v1 sunset (removed)
2025-01-01: v4 released, v3 enters maintenance, v2 deprecated
2025-07-01: v2 sunset (removed)
```

