# Category Guide

## Overview

The Go Coding Standards module supports 7 specialized categories, each with tailored rules and best practices for specific project types.

## Categories

### 1. Web Services (`web`)

**Use Case:** HTTP servers, REST APIs, web applications

**Key Rules:**
- HTTP handler patterns
- Middleware implementation
- Request/response handling
- Graceful shutdown
- Routing best practices

**Example Projects:**
- REST API servers
- Web applications
- HTTP microservices
- API gateways

**Template:** `templates/web-service.md`

**Examples:** `examples/web/`

---

### 2. Microservices (`microservices`)

**Use Case:** gRPC services, service-oriented architectures

**Key Rules:**
- gRPC service implementation
- Service discovery patterns
- Distributed tracing
- Metrics and monitoring
- Inter-service communication

**Example Projects:**
- gRPC services
- Service meshes
- Event-driven microservices
- Backend-for-frontend (BFF)

**Template:** `templates/microservice.md`

**Examples:** `examples/microservices/`

---

### 3. CLI Tools (`cli`)

**Use Case:** Command-line applications, developer tools

**Key Rules:**
- Command parsing (Cobra)
- Configuration management (Viper)
- Cross-platform compatibility
- User-friendly error messages
- Exit codes and signals

**Example Projects:**
- Developer tools
- System utilities
- Build tools
- Deployment scripts

**Template:** `templates/cli-tool.md`

**Examples:** `examples/cli/`

---

### 4. Cloud-Native (`cloud`)

**Use Case:** Kubernetes applications, cloud platforms

**Key Rules:**
- Kubernetes integration
- Health checks and readiness probes
- Configuration from environment
- Graceful shutdown
- 12-factor app principles

**Example Projects:**
- Kubernetes operators
- Cloud-native applications
- Containerized services
- Platform services

**Template:** `templates/cloud-native.md`

**Examples:** `examples/cloud/`

---

### 5. Distributed Systems (`distributed`)

**Use Case:** Event-driven architectures, distributed computing

**Key Rules:**
- Consensus algorithms (Raft)
- Event sourcing and CQRS
- Distributed caching
- Message queues
- Eventual consistency

**Example Projects:**
- Event-driven systems
- Distributed databases
- Message brokers
- Stream processing

**Template:** `templates/distributed.md`

**Examples:** `examples/distributed/`

---

### 6. DevOps Tooling (`devops`)

**Use Case:** Automation tools, infrastructure management

**Key Rules:**
- Deployment automation
- CI/CD integration
- Infrastructure as code
- Idempotent operations
- State management

**Example Projects:**
- Deployment tools
- Infrastructure automation
- CI/CD pipelines
- Configuration management

**Template:** `templates/devops.md`

**Examples:** `examples/devops/`

---

### 7. API Development (`api`)

**Use Case:** REST and GraphQL APIs

**Key Rules:**
- REST API design
- API versioning
- Rate limiting
- Authentication/authorization
- API documentation

**Example Projects:**
- REST APIs
- GraphQL servers
- API gateways
- Backend services

**Template:** `templates/api.md`

**Examples:** `examples/api/`

---

## Selecting Categories

### Single Category

```json
{
  "categories": ["web"]
}
```

### Multiple Categories

```json
{
  "categories": ["web", "api", "microservices"]
}
```

## Category Combinations

### Common Combinations

**Web + API:**
```json
{
  "categories": ["web", "api"]
}
```
Best for: REST API servers, web services

**Microservices + Distributed:**
```json
{
  "categories": ["microservices", "distributed"]
}
```
Best for: Event-driven microservices, distributed systems

**CLI + DevOps:**
```json
{
  "categories": ["cli", "devops"]
}
```
Best for: Deployment tools, automation scripts

## Next Steps

- See [CONFIGURATION.md](./CONFIGURATION.md) for configuration details
- See [README.md](../README.md) for module overview
- See category-specific rules in `rules/[category]/`

