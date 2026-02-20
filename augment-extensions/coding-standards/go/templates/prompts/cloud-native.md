# Cloud-Native Go Application AI Template

## Context

You are building a cloud-native Go application designed to run in Kubernetes or other container orchestration platforms.

## Key Requirements

### Kubernetes Integration
- Use `k8s.io/client-go` for Kubernetes API interactions
- Implement informers and listers for efficient resource watching
- Handle API errors using `k8s.io/apimachinery/pkg/api/errors`
- Use controller-runtime for custom controllers
- Implement leader election for high availability

### Configuration Management
- Load configuration from environment variables
- Support multiple configuration sources (env, files, config maps)
- Never hardcode secrets - use environment variables or secret managers
- Validate all configuration on startup
- Support hot reloading for non-critical configuration

### Health Checks
- Implement separate `/health` (liveness) and `/ready` (readiness) endpoints
- Keep health checks lightweight (<1s response time)
- Include dependency checks in readiness probes
- Return detailed status information with component-level details
- Implement graceful degradation for non-critical dependencies

### Graceful Shutdown
- Handle SIGTERM and SIGINT signals
- Implement graceful shutdown with timeout (typically 30s)
- Stop accepting new requests first
- Complete in-flight requests
- Close database connections and other resources
- Log shutdown progress

## Code Structure

```go
type Application struct {
    config  *Config
    db      *sql.DB
    server  *http.Server
    checker *HealthChecker
}

func NewApplication(cfg *Config) (*Application, error) {
    // Initialize dependencies
    // Set up health checks
    // Return configured application
}

func (app *Application) Start() error {
    // Start HTTP server
    // Start background workers
}

func (app *Application) Shutdown(ctx context.Context) error {
    // Graceful shutdown logic
}
```

## Example Patterns

### Environment Configuration
```go
type Config struct {
    Port        int    `envconfig:"PORT" default:"8080"`
    DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`
    LogLevel    string `envconfig:"LOG_LEVEL" default:"info"`
}
```

### Health Check Handler
```go
func (app *Application) readinessHandler(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()
    
    components, err := app.checker.Check(ctx)
    // Return structured JSON response
}
```

### Graceful Shutdown
```go
quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

if err := app.Shutdown(ctx); err != nil {
    log.Fatalf("Shutdown failed: %v", err)
}
```

## Best Practices

1. **12-Factor App Principles**: Follow the twelve-factor app methodology
2. **Stateless Design**: Keep application stateless for horizontal scaling
3. **Observability**: Include structured logging, metrics, and tracing
4. **Resource Limits**: Set appropriate CPU and memory limits
5. **Security**: Run as non-root user, use read-only filesystems where possible

## Common Pitfalls to Avoid

- ❌ Hardcoding configuration values
- ❌ Not implementing health checks
- ❌ Ignoring shutdown signals
- ❌ Blocking operations in health checks
- ❌ Not validating configuration on startup

## References

- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [The Twelve-Factor App](https://12factor.net/)
- [Go Cloud Development Kit](https://gocloud.dev/)

