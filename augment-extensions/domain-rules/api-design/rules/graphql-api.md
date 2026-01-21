# GraphQL API Design

Best practices for designing GraphQL APIs.

## Schema Design

Design clear, intuitive schemas.

```graphql
# Good - Clear type definitions
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  createdAt: DateTime!
  orders: [Order!]!
}

type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  total: Float!
  status: OrderStatus!
  createdAt: DateTime!
}

enum UserRole {
  ADMIN
  USER
  GUEST
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

# Good - Input types for mutations
input CreateUserInput {
  name: String!
  email: String!
  role: UserRole = USER
}

input UpdateUserInput {
  name: String
  email: String
  role: UserRole
}
```

## Queries

Design efficient, flexible queries.

```graphql
# Good - Root queries
type Query {
  # Single resource
  user(id: ID!): User
  
  # Collection with filtering
  users(
    role: UserRole
    status: UserStatus
    limit: Int = 20
    offset: Int = 0
  ): UserConnection!
  
  # Search
  searchUsers(query: String!): [User!]!
  
  # Nested resource
  order(id: ID!): Order
  orders(userId: ID, status: OrderStatus): [Order!]!
}

# Good - Connection pattern for pagination
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

## Mutations

Design clear, atomic mutations.

```graphql
# Good - Mutations with input types
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
  
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
  updateOrderStatus(id: ID!, status: OrderStatus!): UpdateOrderPayload!
}

# Good - Payload types with errors
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UserError {
  field: String
  message: String!
  code: ErrorCode!
}

enum ErrorCode {
  VALIDATION_ERROR
  NOT_FOUND
  UNAUTHORIZED
  FORBIDDEN
  INTERNAL_ERROR
}

# Bad - Multiple operations in one mutation
type Mutation {
  updateUserAndOrders(userId: ID!, userData: UpdateUserInput!, orderIds: [ID!]!): User
}
```

## Subscriptions

Design real-time subscriptions.

```graphql
# Good - Subscriptions for real-time updates
type Subscription {
  userCreated: User!
  userUpdated(id: ID!): User!
  orderStatusChanged(userId: ID!): Order!
  
  # With filtering
  orderUpdated(status: OrderStatus): Order!
}

# Usage
subscription {
  orderStatusChanged(userId: "123") {
    id
    status
    updatedAt
  }
}
```

## Field Naming

Use consistent naming conventions.

```graphql
# Good - Consistent naming
type User {
  id: ID!              # Singular
  firstName: String!   # camelCase
  lastName: String!
  emailAddress: String!
  isActive: Boolean!   # Boolean prefix: is, has, can
  hasOrders: Boolean!
  createdAt: DateTime! # Timestamp suffix: At
  updatedAt: DateTime!
}

# Bad - Inconsistent naming
type User {
  user_id: ID!         # snake_case (inconsistent)
  first_name: String!
  active: Boolean!     # Missing 'is' prefix
  created: DateTime!   # Missing 'At' suffix
}
```

## Error Handling

Implement comprehensive error handling.

```graphql
# Good - Errors in payload
type CreateUserPayload {
  user: User
  errors: [UserError!]!
  success: Boolean!
}

# Good - Field-level errors
type UserError {
  field: String        # Which field caused the error
  message: String!     # Human-readable message
  code: ErrorCode!     # Machine-readable code
}

# Usage in resolver
{
  "data": {
    "createUser": {
      "user": null,
      "errors": [
        {
          "field": "email",
          "message": "Email is already taken",
          "code": "VALIDATION_ERROR"
        }
      ],
      "success": false
    }
  }
}
```

## N+1 Problem

Solve N+1 queries with DataLoader.

```typescript
// Good - Use DataLoader
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await db.users.findMany({
    where: { id: { in: userIds } }
  });
  
  return userIds.map(id => users.find(u => u.id === id));
});

// Resolver
const resolvers = {
  Order: {
    user: (order) => userLoader.load(order.userId)
  }
};

// Bad - N+1 query
const resolvers = {
  Order: {
    user: (order) => db.users.findOne({ id: order.userId })
  }
};
```

## Pagination

Implement cursor-based pagination.

```graphql
# Good - Relay-style cursor pagination
type Query {
  users(
    first: Int
    after: String
    last: Int
    before: String
  ): UserConnection!
}

# Usage
query {
  users(first: 10, after: "cursor123") {
    edges {
      node {
        id
        name
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Best Practices

1. **Use nullable fields carefully** - Only make required fields non-null
2. **Design for clients** - Think about client use cases
3. **Use input types** - For mutations
4. **Use payload types** - Include errors in mutation responses
5. **Solve N+1 problem** - Use DataLoader
6. **Implement pagination** - Use cursor-based pagination
7. **Version with fields** - Add new fields, deprecate old ones
8. **Use enums** - For fixed sets of values
9. **Document schema** - Use descriptions
10. **Validate input** - Server-side validation
11. **Implement auth** - Field-level authorization
12. **Monitor performance** - Track query complexity
13. **Use subscriptions** - For real-time updates
14. **Keep mutations atomic** - One operation per mutation
15. **Use consistent naming** - camelCase for fields

