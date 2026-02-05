# Tools and Methodologies

## Overview

This document covers architectural frameworks, methodologies, and tools including TOGAF, Domain-Driven Design (DDD), CI/CD practices, and architecture documentation tools.

---

## Knowledge

### TOGAF (The Open Group Architecture Framework)

**What is TOGAF?**
- Enterprise architecture framework
- Provides methods and tools for developing architectures
- Industry-standard approach
- Version 9.2 is current standard

**TOGAF Architecture Development Method (ADM)**

**ADM Phases**
1. **Preliminary Phase** - Framework and principles
2. **Phase A: Architecture Vision** - Scope and stakeholders
3. **Phase B: Business Architecture** - Business strategy and processes
4. **Phase C: Information Systems Architecture** - Data and application architecture
5. **Phase D: Technology Architecture** - Infrastructure and platforms
6. **Phase E: Opportunities and Solutions** - Implementation planning
7. **Phase F: Migration Planning** - Transition architecture
8. **Phase G: Implementation Governance** - Architecture compliance
9. **Phase H: Architecture Change Management** - Continuous improvement

**TOGAF Deliverables**
- Architecture Vision Document
- Architecture Definition Document
- Architecture Requirements Specification
- Architecture Roadmap
- Transition Architecture
- Architecture Building Blocks (ABBs)

**When to Use TOGAF**
- Large enterprise transformations
- Complex multi-system integrations
- Regulatory compliance requirements
- Long-term strategic planning

### Domain-Driven Design (DDD)

**Core Concepts**

**Ubiquitous Language**
- Shared vocabulary between developers and domain experts
- Used in code, documentation, and conversations
- Reduces translation errors
- Evolves with understanding

**Bounded Contexts**
- Explicit boundaries for models
- Each context has its own ubiquitous language
- Models can differ across contexts
- Clear integration points

**Strategic Design Patterns**
- **Context Mapping** - Relationships between bounded contexts
- **Shared Kernel** - Common code shared between contexts
- **Customer-Supplier** - Upstream/downstream relationships
- **Conformist** - Downstream conforms to upstream
- **Anti-Corruption Layer** - Translation layer between contexts
- **Open Host Service** - Published API for integration
- **Published Language** - Well-documented integration format

**Tactical Design Patterns**
- **Entities** - Objects with identity
- **Value Objects** - Immutable objects without identity
- **Aggregates** - Cluster of entities with consistency boundary
- **Aggregate Root** - Entry point to aggregate
- **Repositories** - Persistence abstraction
- **Domain Services** - Stateless operations
- **Domain Events** - Something that happened in the domain
- **Factories** - Complex object creation

**DDD Layers**
```
┌─────────────────────────────┐
│   Presentation Layer        │ ← UI, API Controllers
├─────────────────────────────┤
│   Application Layer         │ ← Use Cases, Application Services
├─────────────────────────────┤
│   Domain Layer              │ ← Entities, Value Objects, Domain Services
├─────────────────────────────┤
│   Infrastructure Layer      │ ← Repositories, External Services
└─────────────────────────────┘
```

### CI/CD for Architecture

**Continuous Integration**

**Architecture as Code**
- Infrastructure as Code (IaC)
- Terraform, CloudFormation, Pulumi
- Version-controlled infrastructure
- Automated provisioning

**Architecture Decision Records (ADRs)**
- Document significant decisions
- Version-controlled with code
- Template: Context, Decision, Consequences
- Immutable (new ADR to reverse)

**Automated Architecture Validation**
- Dependency rules enforcement
- Architecture fitness functions
- Static analysis tools
- Automated testing of architectural constraints

**Continuous Deployment**

**Deployment Strategies**
- **Blue-Green Deployment** - Two identical environments
- **Canary Deployment** - Gradual rollout to subset
- **Rolling Deployment** - Incremental instance updates
- **Feature Flags** - Runtime feature toggling

**Infrastructure Automation**
- Automated environment provisioning
- Configuration management
- Secrets management
- Monitoring and alerting setup

### Architecture Documentation Tools

**Diagramming Tools**

**C4 Model Tools**
- Structurizr - DSL for C4 diagrams
- PlantUML - Text-based diagrams
- Mermaid - Markdown-embedded diagrams
- Draw.io - Visual diagramming

**UML Tools**
- Enterprise Architect
- Visual Paradigm
- StarUML
- PlantUML

**Architecture as Code**
- Structurizr DSL
- Diagrams (Python library)
- Terraform Graph
- CloudCraft (AWS)

**Documentation Platforms**
- Confluence
- Notion
- GitBook
- MkDocs

### Architecture Governance

**Architecture Review Board (ARB)**
- Regular architecture reviews
- Decision-making authority
- Standards enforcement
- Exception handling

**Architecture Compliance**
- Automated compliance checks
- Manual code reviews
- Architecture fitness functions
- Continuous monitoring

**Architecture Metrics**
- Coupling metrics
- Cohesion metrics
- Complexity metrics
- Technical debt tracking

---

## Skills

### Applying TOGAF

**Skill: Execute ADM Phases**
- Define architecture vision and scope
- Develop baseline and target architectures
- Perform gap analysis
- Create migration roadmap
- Establish governance framework

**Skill: Create Architecture Artifacts**
- Architecture Vision Document
- Architecture Definition Document
- Architecture Requirements Specification
- Transition Architecture
- Architecture Roadmap

**Skill: Stakeholder Management**
- Identify stakeholders and concerns
- Manage stakeholder expectations
- Communicate architecture decisions
- Build consensus

### Implementing DDD

**Skill: Model Bounded Contexts**
- Identify domain boundaries
- Define ubiquitous language per context
- Map context relationships
- Design integration strategies

**Skill: Design Aggregates**
- Identify aggregate boundaries
- Define aggregate roots
- Enforce invariants
- Manage consistency

**Skill: Implement Tactical Patterns**
- Create entities and value objects
- Design repositories
- Implement domain services
- Publish domain events

### Setting Up CI/CD

**Skill: Implement Infrastructure as Code**
- Write Terraform/CloudFormation templates
- Version control infrastructure
- Automate provisioning
- Manage environments

**Skill: Create Architecture Fitness Functions**
- Define architectural constraints
- Implement automated tests
- Enforce dependency rules
- Monitor compliance

**Skill: Implement Deployment Strategies**
- Set up blue-green deployments
- Configure canary releases
- Implement feature flags
- Automate rollbacks

### Creating Architecture Documentation

**Skill: Create C4 Diagrams**
- Context diagrams (system boundaries)
- Container diagrams (high-level technology)
- Component diagrams (internal structure)
- Code diagrams (class/sequence)

**Skill: Write ADRs**
- Document context and problem
- Describe decision and rationale
- List consequences and trade-offs
- Version control with code

**Skill: Generate Diagrams from Code**
- Use Structurizr DSL
- Generate PlantUML from code
- Create Mermaid diagrams
- Automate diagram updates

---

## Examples

### Example 1: TOGAF ADM for E-Commerce Platform

**Phase A: Architecture Vision**

```markdown
# Architecture Vision: E-Commerce Platform Modernization

## Business Goals
- Increase scalability to handle 10x traffic
- Reduce time-to-market for new features
- Improve system reliability (99.99% uptime)

## Scope
- Customer-facing web and mobile applications
- Order management system
- Inventory management
- Payment processing
- Analytics and reporting

## Stakeholders
- CTO (sponsor)
- Engineering teams (implementers)
- Product managers (requirements)
- Operations (support)

## High-Level Architecture
- Microservices architecture
- Event-driven communication
- Cloud-native (AWS)
- API-first design
```

**Phase B: Business Architecture**

```markdown
# Business Architecture

## Business Capabilities
1. Customer Management
   - Registration and authentication
   - Profile management
   - Preferences and settings

2. Product Catalog
   - Product search and discovery
   - Category management
   - Pricing and promotions

3. Order Management
   - Shopping cart
   - Checkout process
   - Order tracking
   - Returns and refunds

4. Inventory Management
   - Stock tracking
   - Warehouse management
   - Supplier integration

5. Payment Processing
   - Payment gateway integration
   - Fraud detection
   - Refund processing
```

**Phase C: Information Systems Architecture**

```markdown
# Application Architecture

## Microservices
- User Service
- Product Service
- Cart Service
- Order Service
- Inventory Service
- Payment Service
- Notification Service

## Data Architecture
- User Database (PostgreSQL)
- Product Catalog (Elasticsearch)
- Order Database (PostgreSQL)
- Inventory Database (PostgreSQL)
- Event Store (Kafka)
- Cache (Redis)
```

### Example 2: DDD Bounded Contexts for Banking System

**Context Map**

```typescript
// Bounded Contexts
// 1. Account Management Context
// 2. Transaction Processing Context
// 3. Fraud Detection Context
// 4. Customer Service Context

// Context Relationships
// Account Management ←→ Transaction Processing (Shared Kernel)
// Transaction Processing → Fraud Detection (Customer-Supplier)
// Fraud Detection → Customer Service (Open Host Service)
```

**Account Management Context**

```typescript
// Ubiquitous Language
// - Account: A customer's bank account
// - Account Holder: Person who owns the account
// - Balance: Current amount in account
// - Transaction: Money movement

// Aggregate: Account
class Account {
  private id: AccountId;
  private accountHolder: AccountHolder;
  private balance: Money;
  private transactions: Transaction[];

  // Aggregate Root enforces invariants
  deposit(amount: Money): void {
    if (amount.isNegative()) {
      throw new Error('Cannot deposit negative amount');
    }
    this.balance = this.balance.add(amount);
    this.recordTransaction(new Deposit(amount));
  }

  withdraw(amount: Money): void {
    if (amount.isNegative()) {
      throw new Error('Cannot withdraw negative amount');
    }
    if (this.balance.isLessThan(amount)) {
      throw new InsufficientFundsError();
    }
    this.balance = this.balance.subtract(amount);
    this.recordTransaction(new Withdrawal(amount));
  }

  private recordTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
    // Publish domain event
    DomainEvents.publish(new TransactionRecorded(this.id, transaction));
  }
}

// Value Object
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount < other.amount;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
  }
}

// Repository Interface (in domain layer)
interface AccountRepository {
  findById(id: AccountId): Promise<Account | null>;
  save(account: Account): Promise<void>;
}

// Domain Service
class TransferService {
  constructor(private accountRepository: AccountRepository) {}

  async transfer(
    fromAccountId: AccountId,
    toAccountId: AccountId,
    amount: Money
  ): Promise<void> {
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('Account not found');
    }

    // Domain logic
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    // Persist changes
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    // Publish domain event
    DomainEvents.publish(new TransferCompleted(fromAccountId, toAccountId, amount));
  }
}
```

### Example 3: CI/CD Architecture Pipeline

**Infrastructure as Code (Terraform)**

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "architecture/terraform.tfstate"
    region = "us-east-1"
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]

  tags = {
    Environment = var.environment
    Project     = "ecommerce"
  }
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"

  cluster_name    = "ecommerce-${var.environment}"
  cluster_version = "1.27"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids

  node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 10
      instance_types = ["t3.medium"]
    }
  }
}

# RDS Database
module "database" {
  source = "./modules/rds"

  identifier     = "ecommerce-${var.environment}"
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.medium"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.database_subnet_ids

  backup_retention_period = 7
  multi_az               = true
}
```

**Architecture Fitness Function**

```typescript
// tests/architecture/dependency-rules.test.ts
import { ArchUnitTS } from 'archunit-ts';

describe('Architecture Rules', () => {
  const arch = new ArchUnitTS('./src');

  it('domain layer should not depend on infrastructure', () => {
    arch
      .classes()
      .that()
      .resideInPackage('domain')
      .should()
      .notDependOnPackage('infrastructure')
      .check();
  });

  it('controllers should only be in presentation layer', () => {
    arch
      .classes()
      .that()
      .haveNameMatching(/.*Controller$/)
      .should()
      .resideInPackage('presentation')
      .check();
  });

  it('repositories should only be accessed through interfaces', () => {
    arch
      .classes()
      .that()
      .implementInterface('Repository')
      .should()
      .resideInPackage('infrastructure')
      .check();
  });

  it('domain events should be immutable', () => {
    arch
      .classes()
      .that()
      .implementInterface('DomainEvent')
      .should()
      .haveAllFieldsReadonly()
      .check();
  });
});
```

**Deployment Pipeline (GitHub Actions)**

```yaml
# .github/workflows/deploy.yml
name: Deploy Architecture

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-architecture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Architecture Tests
        run: npm run test:architecture

      - name: Validate Terraform
        run: |
          cd infrastructure
          terraform init
          terraform validate
          terraform plan

      - name: Check Architecture Diagrams
        run: |
          npm run generate:diagrams
          git diff --exit-code docs/architecture/

  deploy-infrastructure:
    needs: validate-architecture
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy with Terraform
        run: |
          cd infrastructure
          terraform init
          terraform apply -auto-approve

      - name: Update Architecture Documentation
        run: |
          npm run generate:diagrams
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add docs/architecture/
          git commit -m "Update architecture diagrams [skip ci]"
          git push
```

### Example 4: Architecture Decision Record (ADR)

```markdown
# ADR-001: Use Microservices Architecture

## Status
Accepted

## Context
Our monolithic e-commerce application is experiencing:
- Difficulty scaling individual components
- Long deployment cycles (2-3 hours)
- Team coordination bottlenecks
- Technology stack lock-in

We need to improve:
- Independent scalability of services
- Deployment frequency (target: multiple times per day)
- Team autonomy
- Technology flexibility

## Decision
We will adopt a microservices architecture with the following characteristics:

1. **Service Boundaries**: Aligned with business capabilities
   - User Service
   - Product Service
   - Order Service
   - Inventory Service
   - Payment Service

2. **Communication**:
   - Synchronous: REST APIs for queries
   - Asynchronous: Event-driven (Kafka) for commands

3. **Data Management**: Database per service pattern

4. **Deployment**: Containerized (Docker) on Kubernetes

5. **API Gateway**: Single entry point for clients

## Consequences

### Positive
- Independent deployment and scaling
- Technology diversity (choose best tool per service)
- Team autonomy and parallel development
- Fault isolation
- Easier to understand individual services

### Negative
- Increased operational complexity
- Distributed system challenges (network latency, partial failures)
- Data consistency challenges
- Testing complexity
- Need for service discovery and orchestration
- Higher infrastructure costs initially

### Mitigation Strategies
- Invest in observability (logging, monitoring, tracing)
- Implement circuit breakers and retry logic
- Use saga pattern for distributed transactions
- Comprehensive integration testing
- Gradual migration (strangler fig pattern)

## Alternatives Considered

### Modular Monolith
- Pros: Simpler deployment, easier testing
- Cons: Still coupled deployment, scaling limitations
- Rejected: Doesn't address scaling and deployment frequency goals

### Serverless
- Pros: No infrastructure management, auto-scaling
- Cons: Vendor lock-in, cold start latency, cost at scale
- Rejected: Not suitable for our traffic patterns and cost constraints

## References
- "Building Microservices" by Sam Newman
- "Microservices Patterns" by Chris Richardson
- Martin Fowler's Microservices Resource Guide
```

### Example 5: C4 Model with Structurizr DSL

```dsl
workspace "E-Commerce Platform" "Architecture for e-commerce system" {

    model {
        customer = person "Customer" "A user of the e-commerce platform"
        admin = person "Administrator" "Manages products and orders"

        ecommerce = softwareSystem "E-Commerce Platform" "Allows customers to browse and purchase products" {
            webapp = container "Web Application" "Delivers content and UI" "React" {
                tags "Web Browser"
            }

            apiGateway = container "API Gateway" "Routes requests to services" "Kong" {
                tags "API Gateway"
            }

            userService = container "User Service" "Manages user accounts" "Node.js" {
                tags "Microservice"
            }

            productService = container "Product Service" "Manages product catalog" "Node.js" {
                tags "Microservice"
            }

            orderService = container "Order Service" "Processes orders" "Node.js" {
                tags "Microservice"
            }

            userDb = container "User Database" "Stores user data" "PostgreSQL" {
                tags "Database"
            }

            productDb = container "Product Database" "Stores product data" "PostgreSQL" {
                tags "Database"
            }

            orderDb = container "Order Database" "Stores order data" "PostgreSQL" {
                tags "Database"
            }

            eventBus = container "Event Bus" "Asynchronous messaging" "Kafka" {
                tags "Message Bus"
            }
        }

        paymentGateway = softwareSystem "Payment Gateway" "Processes payments" {
            tags "External System"
        }

        # Relationships
        customer -> webapp "Uses"
        admin -> webapp "Manages via"

        webapp -> apiGateway "Makes API calls to" "HTTPS"

        apiGateway -> userService "Routes to"
        apiGateway -> productService "Routes to"
        apiGateway -> orderService "Routes to"

        userService -> userDb "Reads/writes"
        productService -> productDb "Reads/writes"
        orderService -> orderDb "Reads/writes"

        userService -> eventBus "Publishes events to"
        productService -> eventBus "Publishes events to"
        orderService -> eventBus "Publishes/subscribes to"

        orderService -> paymentGateway "Processes payments via" "HTTPS"
    }

    views {
        systemContext ecommerce "SystemContext" {
            include *
            autoLayout
        }

        container ecommerce "Containers" {
            include *
            autoLayout
        }

        component orderService "OrderServiceComponents" {
            include *
            autoLayout
        }

        styles {
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }
            element "Microservice" {
                shape hexagon
                background #1168bd
                color #ffffff
            }
            element "Database" {
                shape cylinder
                background #438dd5
                color #ffffff
            }
            element "External System" {
                background #999999
                color #ffffff
            }
        }
    }
}
```

---

## Understanding

### When to Use TOGAF

**Use TOGAF When:**
- Large enterprise with multiple systems
- Regulatory compliance requirements
- Long-term strategic planning (3-5 years)
- Need for stakeholder alignment
- Complex organizational structure

**Don't Use TOGAF When:**
- Small startup or single product
- Need for rapid iteration
- Simple system architecture
- Limited resources for governance

### When to Apply DDD

**Use DDD When:**
- Complex business domain
- Domain experts available
- Long-lived system
- Core business differentiator
- Frequent domain changes

**Don't Use DDD When:**
- Simple CRUD application
- No domain experts
- Short-lived project
- Generic problem (use off-the-shelf)

### CI/CD Best Practices

**Architecture Automation**
- Version control everything (code, infrastructure, configuration)
- Automate testing at all levels
- Implement architecture fitness functions
- Use feature flags for gradual rollouts
- Monitor and alert on architectural violations

**Documentation Automation**
- Generate diagrams from code
- Keep ADRs with code
- Automate documentation updates
- Use living documentation

### Common Pitfalls

**TOGAF Pitfalls**
- Over-documentation (analysis paralysis)
- Ignoring agile principles
- Treating it as waterfall
- Not adapting to organization

**DDD Pitfalls**
- Applying tactical patterns without strategic design
- Ignoring bounded contexts
- Anemic domain models
- Over-engineering simple domains

**CI/CD Pitfalls**
- Manual steps in pipeline
- Insufficient testing
- No rollback strategy
- Ignoring security in pipeline

---

## References

### TOGAF
- **Official**: The Open Group Architecture Framework (TOGAF) Version 9.2
- **Books**:
  - "TOGAF 9 Foundation Study Guide" by Rachel Harrison
  - "The TOGAF Standard, Version 9.2" by The Open Group

### Domain-Driven Design
- **Books**:
  - "Domain-Driven Design" by Eric Evans (Blue Book)
  - "Implementing Domain-Driven Design" by Vaughn Vernon (Red Book)
  - "Domain-Driven Design Distilled" by Vaughn Vernon
- **Resources**:
  - DDD Community: https://dddcommunity.org/
  - Context Mapping: https://github.com/ddd-crew/context-mapping

### CI/CD
- **Books**:
  - "Continuous Delivery" by Jez Humble and David Farley
  - "The DevOps Handbook" by Gene Kim et al.
- **Tools**:
  - Terraform: https://www.terraform.io/
  - GitHub Actions: https://github.com/features/actions
  - ArchUnit: https://www.archunit.org/

### Architecture Documentation
- **C4 Model**: https://c4model.com/
- **Structurizr**: https://structurizr.com/
- **ADR**: https://adr.github.io/
- **PlantUML**: https://plantuml.com/

### Related Architecture Documents
- [Fundamentals](./fundamentals.md) - Core architectural elements
- [Microservices Architecture](./microservices-architecture.md) - Microservices patterns
- [Quality Attributes](./quality-attributes.md) - Non-functional requirements
- [Security Architecture](./security-architecture.md) - Security patterns


