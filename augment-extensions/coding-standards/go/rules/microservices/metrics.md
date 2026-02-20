# Go Microservices - Metrics and Monitoring

## Overview

Metrics enable monitoring and observability of microservices. This document defines best practices for implementing Prometheus metrics in Go microservices.

## Core Principles

1. **RED Method**: Track Rate, Errors, Duration for all services
2. **Metric Types**: Use appropriate metric types (Counter, Gauge, Histogram, Summary)
3. **Labels**: Add relevant labels for filtering and aggregation
4. **Naming**: Follow Prometheus naming conventions
5. **Performance**: Minimize overhead in hot paths

## Rules

### GOL.3.2.4.1: Implement RED Metrics

**Rule**: Track Rate, Errors, and Duration for all service endpoints.

**Severity**: WARNING

**Rationale**: RED metrics provide essential service health indicators.

**✅ Good**:
```go
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    // Rate: Total requests
    requestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "service_requests_total",
            Help: "Total number of requests",
        },
        []string{"method", "endpoint", "status"},
    )
    
    // Errors: Failed requests
    requestsErrors = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "service_requests_errors_total",
            Help: "Total number of failed requests",
        },
        []string{"method", "endpoint", "error_type"},
    )
    
    // Duration: Request latency
    requestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "service_request_duration_seconds",
            Help:    "Request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )
)

func instrumentHandler(method, endpoint string, handler func() error) error {
    start := time.Now()
    
    err := handler()
    
    duration := time.Since(start).Seconds()
    requestDuration.WithLabelValues(method, endpoint).Observe(duration)
    
    status := "success"
    if err != nil {
        status = "error"
        requestsErrors.WithLabelValues(method, endpoint, err.Error()).Inc()
    }
    
    requestsTotal.WithLabelValues(method, endpoint, status).Inc()
    
    return err
}
```

### GOL.3.2.4.2: Use Appropriate Metric Types

**Rule**: Choose the correct Prometheus metric type for each use case.

**Severity**: ERROR

**Rationale**: Wrong metric types lead to incorrect aggregations and alerts.

**Metric Types**:
- **Counter**: Monotonically increasing values (requests, errors)
- **Gauge**: Values that can go up or down (active connections, queue size)
- **Histogram**: Distribution of values (request duration, response size)
- **Summary**: Similar to histogram but calculates quantiles client-side

**✅ Good**:
```go
var (
    // Counter: Monotonically increasing
    httpRequestsTotal = promauto.NewCounter(prometheus.CounterOpts{
        Name: "http_requests_total",
        Help: "Total HTTP requests",
    })
    
    // Gauge: Can increase or decrease
    activeConnections = promauto.NewGauge(prometheus.GaugeOpts{
        Name: "active_connections",
        Help: "Number of active connections",
    })
    
    // Histogram: Distribution of values
    requestSize = promauto.NewHistogram(prometheus.HistogramOpts{
        Name:    "http_request_size_bytes",
        Help:    "HTTP request size in bytes",
        Buckets: prometheus.ExponentialBuckets(100, 10, 8),
    })
)

func handleRequest(w http.ResponseWriter, r *http.Request) {
    httpRequestsTotal.Inc()
    activeConnections.Inc()
    defer activeConnections.Dec()
    
    requestSize.Observe(float64(r.ContentLength))
    
    // Handle request...
}
```

### GOL.3.2.4.3: Instrument gRPC Services

**Rule**: Add Prometheus metrics to all gRPC methods.

**Severity**: WARNING

**✅ Good**:
```go
var (
    grpcRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "grpc_requests_total",
            Help: "Total gRPC requests",
        },
        []string{"method", "status"},
    )
    
    grpcRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "grpc_request_duration_seconds",
            Help:    "gRPC request duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method"},
    )
)

func metricsUnaryInterceptor() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        start := time.Now()
        
        resp, err := handler(ctx, req)
        
        duration := time.Since(start).Seconds()
        grpcRequestDuration.WithLabelValues(info.FullMethod).Observe(duration)
        
        status := "success"
        if err != nil {
            status = "error"
        }
        grpcRequestsTotal.WithLabelValues(info.FullMethod, status).Inc()
        
        return resp, err
    }
}
```

### GOL.3.2.4.4: Expose Metrics Endpoint

**Rule**: Expose Prometheus metrics on `/metrics` endpoint.

**Severity**: ERROR

**Rationale**: Enables Prometheus to scrape metrics.

**✅ Good**:
```go
import (
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func setupRoutes() http.Handler {
    r := chi.NewRouter()
    
    // Metrics endpoint
    r.Handle("/metrics", promhttp.Handler())
    
    // Application routes
    r.Get("/api/users", handleUsers)
    
    return r
}
```

### GOL.3.2.4.5: Add Business Metrics

**Rule**: Track business-specific metrics beyond technical metrics.

**Severity**: INFO

**✅ Good**:
```go
var (
    ordersCreated = promauto.NewCounter(prometheus.CounterOpts{
        Name: "orders_created_total",
        Help: "Total orders created",
    })
    
    orderValue = promauto.NewHistogram(prometheus.HistogramOpts{
        Name:    "order_value_dollars",
        Help:    "Order value in dollars",
        Buckets: prometheus.LinearBuckets(0, 50, 20),
    })
    
    userRegistrations = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "user_registrations_total",
            Help: "Total user registrations",
        },
        []string{"source"},
    )
)

func (s *OrderService) CreateOrder(ctx context.Context, order *Order) error {
    // Create order...
    
    // Track business metrics
    ordersCreated.Inc()
    orderValue.Observe(order.Total)
    
    return nil
}

func (s *UserService) RegisterUser(ctx context.Context, user *User, source string) error {
    // Register user...
    
    userRegistrations.WithLabelValues(source).Inc()
    
    return nil
}
```

### GOL.3.2.4.6: Use Metric Labels Wisely

**Rule**: Use labels for dimensions, but avoid high cardinality.

**Severity**: WARNING

**Rationale**: High cardinality labels cause memory issues in Prometheus.

**✅ Good**:
```go
// Low cardinality labels
requestsTotal.WithLabelValues("GET", "/api/users", "200").Inc()
requestsTotal.WithLabelValues("POST", "/api/orders", "201").Inc()
```

**❌ Bad**:
```go
// High cardinality - user_id creates millions of time series
requestsTotal.WithLabelValues("GET", "/api/users", userID).Inc()
```

## References

- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [RED Method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/)
- [Prometheus Go Client](https://github.com/prometheus/client_golang)

