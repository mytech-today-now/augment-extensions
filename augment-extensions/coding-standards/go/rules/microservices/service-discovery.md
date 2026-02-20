# Go Microservices - Service Discovery

## Overview

Service discovery enables microservices to find and communicate with each other dynamically. This document defines best practices for implementing service discovery in Go microservices.

## Core Principles

1. **Dynamic Registration**: Services register themselves on startup
2. **Health Checks**: Implement health endpoints for service monitoring
3. **Load Balancing**: Use client-side or server-side load balancing
4. **Failure Handling**: Handle service unavailability gracefully
5. **Configuration**: Use environment variables for service discovery endpoints

## Rules

### GOL.3.2.2.1: Implement Service Registration

**Rule**: Register service with discovery system (Consul, etcd, Kubernetes) on startup.

**Severity**: ERROR

**Rationale**: Enables dynamic service discovery and load balancing.

**✅ Good - Consul Registration**:
```go
import (
    "github.com/hashicorp/consul/api"
)

type ServiceRegistry struct {
    client     *api.Client
    serviceID  string
    serviceName string
    port       int
}

func NewServiceRegistry(consulAddr, serviceName string, port int) (*ServiceRegistry, error) {
    config := api.DefaultConfig()
    config.Address = consulAddr
    
    client, err := api.NewClient(config)
    if err != nil {
        return nil, err
    }
    
    return &ServiceRegistry{
        client:      client,
        serviceID:   fmt.Sprintf("%s-%s", serviceName, uuid.New().String()),
        serviceName: serviceName,
        port:        port,
    }, nil
}

func (r *ServiceRegistry) Register(ctx context.Context) error {
    registration := &api.AgentServiceRegistration{
        ID:      r.serviceID,
        Name:    r.serviceName,
        Port:    r.port,
        Address: getLocalIP(),
        Check: &api.AgentServiceCheck{
            HTTP:                           fmt.Sprintf("http://%s:%d/health", getLocalIP(), r.port),
            Interval:                       "10s",
            Timeout:                        "3s",
            DeregisterCriticalServiceAfter: "30s",
        },
    }
    
    return r.client.Agent().ServiceRegister(registration)
}

func (r *ServiceRegistry) Deregister() error {
    return r.client.Agent().ServiceDeregister(r.serviceID)
}
```

### GOL.3.2.2.2: Implement Health Check Endpoints

**Rule**: Provide `/health` and `/ready` endpoints for service health monitoring.

**Severity**: ERROR

**Rationale**: Enables load balancers and orchestrators to route traffic appropriately.

**✅ Good**:
```go
type HealthChecker struct {
    db    *sql.DB
    cache *redis.Client
}

// Health returns basic liveness status
func (h *HealthChecker) Health(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
    })
}

// Ready returns readiness status (checks dependencies)
func (h *HealthChecker) Ready(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()
    
    // Check database
    if err := h.db.PingContext(ctx); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "not_ready",
            "reason": "database_unavailable",
        })
        return
    }
    
    // Check cache
    if err := h.cache.Ping(ctx).Err(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "not_ready",
            "reason": "cache_unavailable",
        })
        return
    }
    
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "ready",
    })
}
```

### GOL.3.2.2.3: Implement Service Discovery Client

**Rule**: Use service discovery to find and connect to other services.

**Severity**: WARNING

**✅ Good - Consul Service Discovery**:
```go
type ServiceDiscovery struct {
    client *api.Client
}

func NewServiceDiscovery(consulAddr string) (*ServiceDiscovery, error) {
    config := api.DefaultConfig()
    config.Address = consulAddr
    
    client, err := api.NewClient(config)
    if err != nil {
        return nil, err
    }
    
    return &ServiceDiscovery{client: client}, nil
}

func (sd *ServiceDiscovery) GetServiceAddress(serviceName string) (string, error) {
    services, _, err := sd.client.Health().Service(serviceName, "", true, nil)
    if err != nil {
        return "", err
    }
    
    if len(services) == 0 {
        return "", fmt.Errorf("no healthy instances of %s found", serviceName)
    }
    
    // Simple round-robin (use random for better distribution)
    service := services[rand.Intn(len(services))]
    
    return fmt.Sprintf("%s:%d", service.Service.Address, service.Service.Port), nil
}

// Usage
func (c *Client) CallUserService(ctx context.Context, userID int64) (*User, error) {
    addr, err := c.discovery.GetServiceAddress("user-service")
    if err != nil {
        return nil, err
    }
    
    conn, err := grpc.Dial(addr, grpc.WithInsecure())
    if err != nil {
        return nil, err
    }
    defer conn.Close()
    
    client := userv1.NewUserServiceClient(conn)
    resp, err := client.GetUser(ctx, &userv1.GetUserRequest{Id: userID})
    if err != nil {
        return nil, err
    }
    
    return &User{
        ID:   resp.User.Id,
        Name: resp.User.Name,
    }, nil
}
```

### GOL.3.2.2.4: Implement Graceful Deregistration

**Rule**: Deregister service from discovery system during shutdown.

**Severity**: ERROR

**Rationale**: Prevents routing traffic to terminated services.

**✅ Good**:
```go
func main() {
    registry, err := NewServiceRegistry("localhost:8500", "user-service", 8080)
    if err != nil {
        log.Fatal(err)
    }
    
    // Register service
    if err := registry.Register(context.Background()); err != nil {
        log.Fatal(err)
    }
    
    // Start server
    srv := startServer()
    
    // Wait for shutdown signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    log.Println("Shutting down...")
    
    // Deregister from service discovery
    if err := registry.Deregister(); err != nil {
        log.Printf("Failed to deregister: %v", err)
    }
    
    // Shutdown server
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal(err)
    }
}
```

## References

- [Consul Service Discovery](https://www.consul.io/docs/discovery/services)
- [etcd Service Discovery](https://etcd.io/docs/latest/dev-guide/grpc_naming/)
- [Kubernetes Service Discovery](https://kubernetes.io/docs/concepts/services-networking/service/)

