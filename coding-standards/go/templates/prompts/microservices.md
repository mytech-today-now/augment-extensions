# Microservice Project Template

## Context

You are generating Go code for a **microservice** project. This includes gRPC services, service discovery, distributed tracing, and metrics.

## Standards

Follow these Go coding standards for microservices:

### Universal Rules

1. **Naming Conventions**: Use MixedCaps for exported names, mixedCaps for unexported
2. **Error Handling**: Return errors explicitly, use `errors.Is/As` for error inspection
3. **Concurrency**: Use goroutines and channels properly, always pass context
4. **Testing**: Write table-driven tests, use mocks for external dependencies
5. **Code Organization**: Keep packages flat and focused
6. **Documentation**: Add godoc comments for all exported functions
7. **Performance**: Minimize allocations, use connection pooling

### Microservices Rules

#### gRPC Services
- Define services using Protocol Buffers (proto3)
- Use gRPC status codes for errors (InvalidArgument, NotFound, Internal, etc.)
- Implement unary and stream interceptors for logging, auth, metrics
- Set appropriate timeouts using context (typically 5 seconds)
- Use server-side streaming for large result sets

#### Service Discovery
- Register service with discovery system (Consul, etcd, Kubernetes) on startup
- Implement `/health` and `/ready` endpoints for health checks
- Deregister service during graceful shutdown
- Use service discovery client to find other services
- Handle service unavailability gracefully

#### Distributed Tracing
- Initialize OpenTelemetry tracer on startup
- Create spans for significant operations
- Propagate trace context across service boundaries
- Add relevant attributes to spans (user_id, order_id, etc.)
- Record errors in spans

#### Metrics
- Implement RED metrics (Rate, Errors, Duration)
- Use appropriate metric types (Counter, Gauge, Histogram)
- Expose metrics on `/metrics` endpoint
- Add business-specific metrics
- Avoid high cardinality labels

## Key Requirements

### gRPC Server Setup
```go
grpcServer := grpc.NewServer(
    grpc.ChainUnaryInterceptor(
        recoveryUnaryInterceptor(logger),
        loggingUnaryInterceptor(logger),
        metricsUnaryInterceptor(),
    ),
)
```

### Service Implementation Pattern
```go
func (s *UserService) GetUser(ctx context.Context, req *userv1.GetUserRequest) (*userv1.GetUserResponse, error) {
    if req.Id <= 0 {
        return nil, status.Error(codes.InvalidArgument, "user ID must be positive")
    }
    
    user, err := s.repo.GetUser(ctx, req.Id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            return nil, status.Error(codes.NotFound, "user not found")
        }
        return nil, status.Error(codes.Internal, "internal error")
    }
    
    return &userv1.GetUserResponse{User: user}, nil
}
```

### Service Registration
```go
func (r *ServiceRegistry) Register(ctx context.Context) error {
    registration := &api.AgentServiceRegistration{
        ID:      r.serviceID,
        Name:    r.serviceName,
        Port:    r.port,
        Address: getLocalIP(),
        Check: &api.AgentServiceCheck{
            HTTP:     fmt.Sprintf("http://%s:%d/health", getLocalIP(), r.port),
            Interval: "10s",
            Timeout:  "3s",
        },
    }
    return r.client.Agent().ServiceRegister(registration)
}
```

### Distributed Tracing
```go
func (s *UserService) GetUser(ctx context.Context, id int64) (*User, error) {
    tracer := otel.Tracer("user-service")
    ctx, span := tracer.Start(ctx, "GetUser")
    defer span.End()
    
    span.SetAttributes(attribute.Int64("user.id", id))
    
    user, err := s.repo.GetUser(ctx, id)
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return nil, err
    }
    
    return user, nil
}
```

### Metrics
```go
var (
    requestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "grpc_requests_total",
            Help: "Total gRPC requests",
        },
        []string{"method", "status"},
    )
    
    requestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "grpc_request_duration_seconds",
            Help:    "gRPC request duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method"},
    )
)
```

## Common Patterns

### Proto3 Service Definition
```protobuf
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
}

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
}
```

### Health Check Endpoints
```go
func (h *HealthChecker) Ready(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()
    
    if err := h.db.PingContext(ctx); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    
    w.WriteHeader(http.StatusOK)
}
```

### Graceful Shutdown
```go
func main() {
    srv := NewServer()
    registry := NewServiceRegistry()
    
    registry.Register(context.Background())
    
    go srv.Start()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    registry.Deregister()
    srv.Stop()
}
```

## Tools

Ensure generated code passes:
- `go build` - Compiles without errors
- `golangci-lint run` - Passes all linters
- `go vet` - No suspicious constructs
- `gofmt -d .` - Properly formatted
- `go test -race` - No race conditions

## Output Format

Generate complete, production-ready Go code with:
- Package declaration and imports
- Protocol Buffer definitions (if applicable)
- gRPC service implementation
- Interceptors for logging, recovery, metrics
- Service registration/discovery
- Distributed tracing instrumentation
- Prometheus metrics
- Graceful shutdown
- Comprehensive godoc comments

## References

- [gRPC Go](https://grpc.io/docs/languages/go/)
- [OpenTelemetry Go](https://opentelemetry.io/docs/instrumentation/go/)
- [Prometheus Go Client](https://github.com/prometheus/client_golang)
- [Consul Service Discovery](https://www.consul.io/)

