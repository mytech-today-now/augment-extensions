# Software Architecture Fundamentals

## Overview

This document covers the core architectural elements that form the foundation of software system architecture design, based on ISO/IEC 42010 standard.

---

## Knowledge

### Core Architectural Elements

**Components**
- Self-contained units of functionality
- Encapsulate specific responsibilities
- Have well-defined interfaces
- Examples: services, modules, classes, libraries

**Connectors**
- Mechanisms for component interaction
- Define communication protocols
- Examples: APIs, message queues, RPC, event buses

**Configurations**
- Arrangement of components and connectors
- Define system topology
- Specify deployment architecture
- Examples: deployment diagrams, network topology

### ISO/IEC 42010 Standard

**Architecture Description**
- Work product documenting architecture
- Addresses stakeholder concerns
- Uses multiple architectural views
- Maintained throughout system lifecycle

**Stakeholders**
- Individuals/organizations with interests in the system
- Examples: developers, operators, users, business owners
- Each has unique concerns and requirements

**Concerns**
- Interests pertaining to system development, operation, or use
- Examples: performance, security, maintainability, cost
- Drive architectural decisions

**Viewpoints**
- Conventions for constructing, interpreting views
- Define notation, modeling techniques
- Examples: logical view, process view, deployment view

**Views**
- Representation of system from perspective of concerns
- Address specific stakeholder concerns
- Multiple views form complete architecture description

---

## Skills

### Identifying Components

**Decomposition Strategies**
1. **Functional Decomposition**: Break down by business capabilities
2. **Domain-Driven Design**: Identify bounded contexts
3. **Layering**: Separate by technical concerns (presentation, business, data)

**Component Characteristics**
- High cohesion (related functionality together)
- Low coupling (minimal dependencies)
- Clear responsibilities
- Well-defined interfaces

### Designing Connectors

**Synchronous Communication**
- Request-response patterns
- REST APIs, gRPC
- Use when: immediate response needed, simple workflows

**Asynchronous Communication**
- Message queues, event streams
- Pub/sub patterns
- Use when: decoupling needed, eventual consistency acceptable

**Connector Selection Criteria**
- Performance requirements
- Reliability needs
- Coupling tolerance
- Technology constraints

### Defining Configurations

**Deployment Patterns**
- Single server (monolithic deployment)
- Multi-tier (web, app, database servers)
- Distributed (microservices, serverless)
- Hybrid (combination of patterns)

**Configuration Documentation**
- Deployment diagrams
- Network topology
- Infrastructure as Code (IaC)
- Container orchestration manifests

---

## Examples

### Example 1: E-Commerce System Components

**Components:**
```
- Product Catalog Service
  - Manages product information
  - Provides search and filtering
  - Interface: REST API

- Shopping Cart Service
  - Manages user cart state
  - Calculates totals
  - Interface: REST API + Event Publisher

- Order Processing Service
  - Handles order placement
  - Coordinates payment and fulfillment
  - Interface: Event Consumer + REST API

- Payment Gateway Connector
  - Integrates with payment providers
  - Interface: Adapter pattern
```

**Connectors:**
```
- REST API (synchronous)
  - User → Product Catalog
  - User → Shopping Cart
  
- Event Bus (asynchronous)
  - Shopping Cart → Order Processing
  - Order Processing → Inventory
  - Order Processing → Notification
```

**Configuration:**
```
- Web Tier: Load balancer + API Gateway
- Application Tier: Containerized services (Kubernetes)
- Data Tier: Distributed databases (per service)
- Message Tier: Kafka event bus
```

### Example 2: Banking Application Architecture

**Components:**
```
- Account Management
  - CRUD operations for accounts
  - Balance inquiries
  - Transaction history

- Transaction Processor
  - Validates transactions
  - Ensures ACID properties
  - Maintains audit trail

- Authentication Service
  - User authentication
  - Session management
  - Multi-factor authentication
```

**Connectors:**
```
- Secure REST API (HTTPS + OAuth2)
- Database connections (connection pooling)
- Message queue for async notifications
```

**Configuration:**
```
- High-availability deployment (active-active)
- Database replication (master-slave)
- Encrypted communication channels
- Firewall and DMZ configuration
```

---

## Understanding

### Why Components Matter

**Modularity Benefits**
- Independent development and deployment
- Easier testing and maintenance
- Technology diversity (polyglot architecture)
- Team autonomy and scalability

**Component Granularity**
- Too fine-grained: excessive communication overhead
- Too coarse-grained: reduced flexibility, harder to maintain
- Right-sizing: balance between cohesion and coupling

### Connector Trade-offs

**Synchronous vs. Asynchronous**

Synchronous:
- ✅ Simpler to reason about
- ✅ Immediate feedback
- ❌ Tight coupling
- ❌ Cascading failures

Asynchronous:
- ✅ Loose coupling
- ✅ Better fault tolerance
- ❌ Eventual consistency
- ❌ Harder to debug

**Direct vs. Indirect Communication**

Direct (point-to-point):
- ✅ Lower latency
- ✅ Simpler infrastructure
- ❌ Tight coupling
- ❌ Harder to scale

Indirect (message broker):
- ✅ Decoupling
- ✅ Better scalability
- ❌ Additional infrastructure
- ❌ Potential bottleneck

### Configuration Implications

**Deployment Complexity**
- More components = more deployment complexity
- Requires orchestration (Kubernetes, Docker Swarm)
- Infrastructure as Code essential
- Monitoring and observability critical

**Operational Considerations**
- Service discovery mechanisms
- Load balancing strategies
- Health checks and auto-recovery
- Logging and distributed tracing

**Cost Implications**
- Infrastructure costs (compute, storage, network)
- Operational overhead (monitoring, maintenance)
- Development complexity (distributed systems)
- Trade-off: flexibility vs. simplicity

---

## Best Practices

### Component Design

✅ **Single Responsibility**: Each component has one clear purpose
✅ **Interface Segregation**: Provide focused, client-specific interfaces
✅ **Dependency Inversion**: Depend on abstractions, not concretions
✅ **Encapsulation**: Hide implementation details
❌ **God Components**: Avoid components that do everything
❌ **Circular Dependencies**: Prevent component cycles

### Connector Design

✅ **Protocol Versioning**: Support multiple API versions
✅ **Error Handling**: Graceful degradation and retries
✅ **Timeouts**: Prevent indefinite blocking
✅ **Circuit Breakers**: Protect against cascading failures
❌ **Chatty Communication**: Minimize round trips
❌ **Tight Coupling**: Avoid shared databases between services

### Configuration Management

✅ **Infrastructure as Code**: Version control infrastructure
✅ **Environment Parity**: Dev/staging/prod consistency
✅ **Secrets Management**: Secure credential storage
✅ **Configuration Externalization**: Separate config from code
❌ **Hardcoded Values**: Avoid embedded configuration
❌ **Manual Deployment**: Automate deployment processes

---

## References

- **ISO/IEC 42010:2011** - Systems and software engineering — Architecture description
- **Software Architecture in Practice** (Bass, Clements, Kazman)
- **Designing Data-Intensive Applications** (Martin Kleppmann)
- **Building Microservices** (Sam Newman)

---

## Related Topics

- [Principles](./principles.md) - Architectural principles and design guidelines
- [Definitions and Terminology](./definitions-terminology.md) - Key architectural concepts
- [Microservices Architecture](./microservices.md) - Microservices patterns
- [Quality Attributes](./quality-attributes.md) - Non-functional requirements


