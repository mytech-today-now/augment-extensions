# Go Microservices - Distributed Tracing

## Overview

Distributed tracing enables tracking requests across multiple microservices. This document defines best practices for implementing distributed tracing using OpenTelemetry in Go.

## Core Principles

1. **Context Propagation**: Pass trace context across service boundaries
2. **Span Creation**: Create spans for significant operations
3. **Attribute Enrichment**: Add relevant attributes to spans
4. **Error Recording**: Record errors and exceptions in spans
5. **Sampling**: Use appropriate sampling strategies

## Rules

### GOL.3.2.3.1: Initialize OpenTelemetry Tracer

**Rule**: Initialize OpenTelemetry tracer provider on application startup.

**Severity**: ERROR

**Rationale**: Enables distributed tracing across all services.

**✅ Good**:
```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

func initTracer(serviceName, jaegerEndpoint string) (*sdktrace.TracerProvider, error) {
    // Create Jaeger exporter
    exporter, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(jaegerEndpoint)))
    if err != nil {
        return nil, err
    }
    
    // Create resource with service name
    res, err := resource.New(
        context.Background(),
        resource.WithAttributes(
            semconv.ServiceNameKey.String(serviceName),
        ),
    )
    if err != nil {
        return nil, err
    }
    
    // Create tracer provider
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(res),
        sdktrace.WithSampler(sdktrace.AlwaysSample()),
    )
    
    // Set global tracer provider
    otel.SetTracerProvider(tp)
    
    return tp, nil
}

func main() {
    tp, err := initTracer("user-service", "http://jaeger:14268/api/traces")
    if err != nil {
        log.Fatal(err)
    }
    defer func() {
        if err := tp.Shutdown(context.Background()); err != nil {
            log.Printf("Error shutting down tracer provider: %v", err)
        }
    }()
    
    // Start server...
}
```

### GOL.3.2.3.2: Create Spans for Operations

**Rule**: Create spans for significant operations (HTTP requests, database queries, external calls).

**Severity**: WARNING

**✅ Good**:
```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
)

func (s *UserService) GetUser(ctx context.Context, id int64) (*User, error) {
    tracer := otel.Tracer("user-service")
    
    // Create span
    ctx, span := tracer.Start(ctx, "GetUser")
    defer span.End()
    
    // Add attributes
    span.SetAttributes(
        attribute.Int64("user.id", id),
    )
    
    // Perform operation
    user, err := s.repo.GetUser(ctx, id)
    if err != nil {
        // Record error
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return nil, err
    }
    
    // Add result attributes
    span.SetAttributes(
        attribute.String("user.name", user.Name),
        attribute.String("user.email", user.Email),
    )
    
    return user, nil
}
```

### GOL.3.2.3.3: Propagate Context in HTTP Requests

**Rule**: Propagate trace context in HTTP headers for cross-service calls.

**Severity**: ERROR

**Rationale**: Enables end-to-end tracing across service boundaries.

**✅ Good - HTTP Client**:
```go
import (
    "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func NewHTTPClient() *http.Client {
    return &http.Client{
        Transport: otelhttp.NewTransport(http.DefaultTransport),
        Timeout:   30 * time.Second,
    }
}

func (c *Client) CallExternalService(ctx context.Context, url string) (*Response, error) {
    tracer := otel.Tracer("user-service")
    ctx, span := tracer.Start(ctx, "CallExternalService")
    defer span.End()
    
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        span.RecordError(err)
        return nil, err
    }
    
    // Context is automatically propagated via otelhttp.Transport
    resp, err := c.httpClient.Do(req)
    if err != nil {
        span.RecordError(err)
        return nil, err
    }
    defer resp.Body.Close()
    
    // Process response...
    return processResponse(resp)
}
```

**✅ Good - HTTP Server**:
```go
func setupRoutes() http.Handler {
    r := chi.NewRouter()
    
    // Add OpenTelemetry middleware
    r.Use(otelhttp.NewMiddleware("user-service"))
    
    r.Get("/users/{id}", handleGetUser)
    
    return r
}
```

### GOL.3.2.3.4: Instrument gRPC with Tracing

**Rule**: Use OpenTelemetry interceptors for gRPC tracing.

**Severity**: WARNING

**✅ Good**:
```go
import (
    "go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

// Server
func NewGRPCServer() *grpc.Server {
    return grpc.NewServer(
        grpc.UnaryInterceptor(otelgrpc.UnaryServerInterceptor()),
        grpc.StreamInterceptor(otelgrpc.StreamServerInterceptor()),
    )
}

// Client
func NewGRPCClient(addr string) (*grpc.ClientConn, error) {
    return grpc.Dial(addr,
        grpc.WithInsecure(),
        grpc.WithUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
        grpc.WithStreamInterceptor(otelgrpc.StreamClientInterceptor()),
    )
}
```

### GOL.3.2.3.5: Add Custom Span Attributes

**Rule**: Add relevant business context as span attributes.

**Severity**: INFO

**✅ Good**:
```go
func (s *OrderService) CreateOrder(ctx context.Context, order *Order) error {
    tracer := otel.Tracer("order-service")
    ctx, span := tracer.Start(ctx, "CreateOrder")
    defer span.End()
    
    // Add business context
    span.SetAttributes(
        attribute.String("order.id", order.ID),
        attribute.String("customer.id", order.CustomerID),
        attribute.Float64("order.total", order.Total),
        attribute.Int("order.item_count", len(order.Items)),
    )
    
    // Process order...
    if err := s.processOrder(ctx, order); err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, "failed to process order")
        return err
    }
    
    span.SetStatus(codes.Ok, "order created successfully")
    return nil
}
```

## References

- [OpenTelemetry Go](https://opentelemetry.io/docs/instrumentation/go/)
- [Jaeger Tracing](https://www.jaegertracing.io/)
- [OpenTelemetry Best Practices](https://opentelemetry.io/docs/concepts/signals/traces/)

