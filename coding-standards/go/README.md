# Go Coding Standards - Augment Extension

Professional Go coding standards extension for Augment Code AI, providing comprehensive guidelines and best practices for Go development across multiple project categories.

## Overview

This extension provides AI-driven guidance for writing idiomatic, production-grade Go code. It covers universal best practices and category-specific patterns for:

- **Web Services** - HTTP servers, middleware, routing, graceful shutdown
- **Microservices** - gRPC, service discovery, distributed tracing, health checks
- **CLI Tools** - Command-line applications with cobra, viper, flag handling
- **Cloud-Native Applications** - Kubernetes operators, cloud SDKs, 12-factor apps
- **Distributed Systems** - Event sourcing, message queues, consensus algorithms
- **DevOps Tooling** - Infrastructure automation, CI/CD, monitoring
- **API Development** - RESTful APIs, GraphQL, authentication, rate limiting

## Installation

```bash
# Link the Go coding standards module
augx link coding-standards/go

# Verify installation
augx show go-standards
```

## Quick Start

### 1. Configure Your Project

Create `.augment/config.json` in your project:

```json
{
  "modules": {
    "coding-standards/go": {
      "categories": ["web", "api"],
      "rules": {
        "enabled": true,
        "severity": "error"
      }
    }
  }
}
```

### 2. Select Your Category

Choose one or more categories that match your project type:

- **web** - For HTTP servers and web services
- **microservices** - For gRPC services and microservice architectures
- **cli** - For command-line tools and utilities
- **cloud** - For cloud-native applications and Kubernetes operators
- **distributed** - For distributed systems and event-driven architectures
- **devops** - For infrastructure automation and DevOps tooling
- **api** - For API development (REST, GraphQL)

### 3. Use with Augment AI

The extension automatically provides context-aware guidance when you:
- Write new Go code
- Refactor existing code
- Review code for best practices
- Generate documentation

## Categories

### Web Services
Guidelines for HTTP server development, middleware patterns, request/response handling, routing (net/http, gorilla/mux, chi), graceful shutdown, and TLS configuration.

### Microservices
Rules for service discovery, health checks, circuit breakers, distributed tracing (OpenTelemetry), metrics (Prometheus), gRPC communication, and service mesh integration.

### CLI Tools
Best practices for command-line parsing (cobra, urfave/cli), flag handling, configuration management (viper), output formatting, exit codes, and cross-platform compatibility.

### Cloud-Native Applications
Techniques for containerization (Docker), Kubernetes operators, cloud provider SDKs (AWS, GCP, Azure), 12-factor app principles, and environment-based configuration.

### Distributed Systems
Focus on consensus algorithms, event sourcing, CQRS patterns, message queues (NATS, Kafka, RabbitMQ), distributed locks, and eventual consistency.

### DevOps Tooling
Strategies for infrastructure automation, CI/CD pipelines, configuration management, monitoring agents, log aggregation, and GitOps workflows.

### API Development
Approaches for RESTful API design, GraphQL servers, API versioning, authentication/authorization (JWT, OAuth2), rate limiting, and OpenAPI/Swagger documentation.

## Universal Rules

All Go projects benefit from these cross-cutting guidelines:

- **Naming Conventions** - MixedCaps for exported, mixedCaps for unexported
- **Code Formatting** - gofmt, goimports for consistent formatting
- **Error Handling** - Explicit error returns, errors.Is/As, error wrapping
- **Package Organization** - Flat structure, clear responsibilities
- **Documentation** - godoc comments with complete sentences
- **Interface Design** - Small, focused interfaces
- **Dependency Management** - go.mod, semantic versioning
- **Testing** - Table-driven tests, benchmarks, test coverage
- **Concurrency** - Proper goroutine management, channel usage, context propagation
- **Static Analysis** - golangci-lint, staticcheck, go vet, gosec

## Configuration

See `config/schema.json` for the complete configuration schema and `config/examples/` for example configurations.

## Examples

The `examples/` directory contains compilable code examples for each category demonstrating best practices.

## References

- [Effective Go](https://golang.org/doc/effective_go.html)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)
- [Google Go Style Guide](https://google.github.io/styleguide/go/)

## License

MIT License - See LICENSE file for details

## Version

1.0.0

