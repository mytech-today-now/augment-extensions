# Go Microservices - gRPC Patterns

## Overview

gRPC is a high-performance RPC framework ideal for microservices communication. This document defines best practices for implementing gRPC services in Go.

## Core Principles

1. **Protocol Buffers**: Use proto3 for service definitions
2. **Error Handling**: Use gRPC status codes and error details
3. **Streaming**: Leverage streaming for large datasets and real-time updates
4. **Interceptors**: Use interceptors for cross-cutting concerns
5. **Context Propagation**: Pass context for timeouts and cancellation

## Rules

### GOL.3.2.1.1: Define Services with Protocol Buffers

**Rule**: Define all gRPC services using Protocol Buffers (proto3).

**Severity**: ERROR

**Rationale**: Protocol Buffers provide type safety, versioning, and cross-language compatibility.

**✅ Good - user.proto**:
```protobuf
syntax = "proto3";

package user.v1;

option go_package = "github.com/example/user/v1;userv1";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
  
  // Streaming example
  rpc StreamUsers(StreamUsersRequest) returns (stream User);
}

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  int64 created_at = 4;
}

message GetUserRequest {
  int64 id = 1;
}

message GetUserResponse {
  User user = 1;
}
```

### GOL.3.2.1.2: Implement Proper Error Handling

**Rule**: Use gRPC status codes and structured error details.

**Severity**: ERROR

**Rationale**: Proper error handling enables clients to handle failures appropriately.

**✅ Good**:
```go
import (
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func (s *UserService) GetUser(ctx context.Context, req *userv1.GetUserRequest) (*userv1.GetUserResponse, error) {
    if req.Id <= 0 {
        return nil, status.Error(codes.InvalidArgument, "user ID must be positive")
    }
    
    user, err := s.repo.GetUser(ctx, req.Id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            return nil, status.Error(codes.NotFound, "user not found")
        }
        return nil, status.Error(codes.Internal, "failed to get user")
    }
    
    return &userv1.GetUserResponse{
        User: &userv1.User{
            Id:        user.ID,
            Name:      user.Name,
            Email:     user.Email,
            CreatedAt: user.CreatedAt.Unix(),
        },
    }, nil
}
```

**gRPC Status Code Mapping**:
- `codes.OK` - Success
- `codes.InvalidArgument` - Invalid input
- `codes.NotFound` - Resource not found
- `codes.AlreadyExists` - Resource already exists
- `codes.PermissionDenied` - Authorization failure
- `codes.Unauthenticated` - Authentication required
- `codes.Internal` - Server error
- `codes.Unavailable` - Service unavailable
- `codes.DeadlineExceeded` - Timeout

### GOL.3.2.1.3: Use Interceptors for Cross-Cutting Concerns

**Rule**: Implement unary and stream interceptors for logging, auth, metrics.

**Severity**: WARNING

**Rationale**: Interceptors provide a clean way to add middleware-like functionality.

**✅ Good**:
```go
// Unary interceptor for logging
func loggingUnaryInterceptor(logger *slog.Logger) grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        start := time.Now()
        
        resp, err := handler(ctx, req)
        
        logger.Info("gRPC call",
            "method", info.FullMethod,
            "duration_ms", time.Since(start).Milliseconds(),
            "error", err,
        )
        
        return resp, err
    }
}

// Stream interceptor for logging
func loggingStreamInterceptor(logger *slog.Logger) grpc.StreamServerInterceptor {
    return func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
        start := time.Now()
        
        err := handler(srv, ss)
        
        logger.Info("gRPC stream",
            "method", info.FullMethod,
            "duration_ms", time.Since(start).Milliseconds(),
            "error", err,
        )
        
        return err
    }
}

// Server setup with interceptors
func NewServer(logger *slog.Logger) *grpc.Server {
    return grpc.NewServer(
        grpc.ChainUnaryInterceptor(
            loggingUnaryInterceptor(logger),
            authUnaryInterceptor(),
            metricsUnaryInterceptor(),
        ),
        grpc.ChainStreamInterceptor(
            loggingStreamInterceptor(logger),
            authStreamInterceptor(),
        ),
    )
}
```

### GOL.3.2.1.4: Implement Server-Side Streaming

**Rule**: Use server-side streaming for large result sets and real-time updates.

**Severity**: INFO

**✅ Good**:
```go
func (s *UserService) StreamUsers(req *userv1.StreamUsersRequest, stream userv1.UserService_StreamUsersServer) error {
    ctx := stream.Context()
    
    // Check for cancellation
    if err := ctx.Err(); err != nil {
        return status.Error(codes.Canceled, "stream canceled")
    }
    
    // Stream users in batches
    offset := 0
    limit := 100
    
    for {
        users, err := s.repo.ListUsers(ctx, offset, limit)
        if err != nil {
            return status.Error(codes.Internal, "failed to list users")
        }
        
        if len(users) == 0 {
            break
        }
        
        for _, user := range users {
            if err := stream.Send(&userv1.User{
                Id:        user.ID,
                Name:      user.Name,
                Email:     user.Email,
                CreatedAt: user.CreatedAt.Unix(),
            }); err != nil {
                return status.Error(codes.Internal, "failed to send user")
            }
        }
        
        offset += len(users)
        
        if len(users) < limit {
            break
        }
    }
    
    return nil
}
```

### GOL.3.2.1.5: Set Appropriate Timeouts

**Rule**: Always set timeouts for gRPC calls using context.

**Severity**: ERROR

**Rationale**: Prevents hanging requests and resource exhaustion.

**✅ Good - Client**:
```go
func (c *UserClient) GetUser(ctx context.Context, id int64) (*User, error) {
    // Set timeout for this specific call
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    resp, err := c.client.GetUser(ctx, &userv1.GetUserRequest{
        Id: id,
    })
    if err != nil {
        return nil, err
    }
    
    return &User{
        ID:    resp.User.Id,
        Name:  resp.User.Name,
        Email: resp.User.Email,
    }, nil
}
```

## References

- [gRPC Go Quick Start](https://grpc.io/docs/languages/go/quickstart/)
- [gRPC Best Practices](https://grpc.io/docs/guides/performance/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)

