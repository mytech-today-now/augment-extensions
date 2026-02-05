# Software Architecture Definitions and Terminology

## Overview

This document defines key architectural concepts and terminology based on ISO/IEC 42010 standard, establishing a common vocabulary for architectural discussions.

---

## Knowledge

### Architecture vs. Design

**Software Architecture**
- High-level structure of software system
- Fundamental organization of components and relationships
- Strategic decisions with long-term impact
- Difficult and costly to change
- Examples: microservices vs. monolithic, event-driven vs. request-response

**Software Design**
- Detailed specification of components
- Implementation-level decisions
- Tactical decisions with localized impact
- Easier to change and refactor
- Examples: class design, algorithm selection, data structures

**Key Differences**

| Aspect | Architecture | Design |
|--------|-------------|--------|
| **Scope** | System-wide | Component-level |
| **Abstraction** | High-level | Low-level |
| **Impact** | Strategic, long-term | Tactical, short-term |
| **Change Cost** | High | Low to moderate |
| **Stakeholders** | Business + technical | Primarily technical |
| **Decisions** | What and why | How |

### Architectural Views (ISO/IEC 42010)

**Architecture View**
- Representation of system from perspective of related concerns
- Uses specific viewpoint conventions
- Addresses stakeholder concerns
- Multiple views provide complete picture

**Common Viewpoints**

**Logical View**
- Functional requirements
- Object-oriented decomposition
- Class diagrams, sequence diagrams
- Stakeholders: developers, architects

**Process View**
- Runtime behavior
- Concurrency, synchronization
- Activity diagrams, state machines
- Stakeholders: system engineers, performance analysts

**Development View**
- Code organization
- Module structure, dependencies
- Package diagrams, component diagrams
- Stakeholders: developers, build engineers

**Physical View**
- Deployment topology
- Hardware, network configuration
- Deployment diagrams
- Stakeholders: system engineers, operators

**Scenarios (Use Case View)**
- System behavior from user perspective
- Use cases, user stories
- Validates other views
- Stakeholders: end users, business analysts

### Quality Attributes

**Definition**
- Non-functional requirements
- System properties beyond functionality
- Measurable characteristics
- Drive architectural decisions

**Categories**

**Runtime Quality Attributes**
- Performance (throughput, latency, response time)
- Scalability (horizontal, vertical)
- Availability (uptime, fault tolerance)
- Reliability (MTBF, MTTR)
- Security (confidentiality, integrity, availability)

**Design-Time Quality Attributes**
- Maintainability (ease of modification)
- Testability (ease of testing)
- Modularity (separation of concerns)
- Reusability (component reuse)
- Portability (platform independence)

**Business Quality Attributes**
- Cost (development, operational)
- Time to market
- Lifetime (expected system lifespan)
- Targeted market (user base)

---

## Skills

### Distinguishing Architecture from Design

**Architectural Decisions (Strategic)**
```
✅ Choosing microservices vs. monolithic
✅ Selecting database type (SQL vs. NoSQL)
✅ Defining service boundaries
✅ Choosing communication patterns (sync vs. async)
✅ Selecting deployment model (cloud vs. on-premise)
```

**Design Decisions (Tactical)**
```
✅ Implementing specific algorithm
✅ Choosing data structure (list vs. set)
✅ Designing class hierarchy
✅ Selecting design pattern (factory, observer)
✅ Naming conventions and code style
```

### Creating Architectural Views

**4+1 View Model Process**

1. **Identify Stakeholders**: Determine who needs what information
2. **Select Viewpoints**: Choose relevant views (logical, process, development, physical)
3. **Create Views**: Document using appropriate notation (UML, C4)
4. **Validate with Scenarios**: Ensure views address use cases
5. **Maintain Consistency**: Keep views synchronized

**View Selection Criteria**
- Stakeholder concerns
- System complexity
- Project phase (design, implementation, deployment)
- Regulatory requirements

### Defining Quality Attributes

**SMART Quality Attributes**

**Specific**: Clearly defined, unambiguous  
**Measurable**: Quantifiable metrics  
**Achievable**: Realistic given constraints  
**Relevant**: Aligned with business goals  
**Time-bound**: Defined timeframe

**Examples**

❌ **Vague**: "System should be fast"  
✅ **SMART**: "API response time < 200ms for 95th percentile under 1000 req/s"

❌ **Vague**: "System should be secure"  
✅ **SMART**: "Zero critical vulnerabilities in OWASP Top 10, penetration test annually"

❌ **Vague**: "System should be available"  
✅ **SMART**: "99.9% uptime (< 8.76 hours downtime/year), measured monthly"

---

## Examples

### Example 1: E-Commerce Platform Views

**Logical View**
```
Components:
- Product Catalog
- Shopping Cart
- Order Management
- Payment Processing
- User Authentication

Relationships:
- Cart depends on Catalog
- Order depends on Cart and Payment
- All depend on Authentication
```

**Process View**
```
Processes:
- Web Server (stateless, multiple instances)
- Background Job Processor (order fulfillment)
- Cache Server (Redis)
- Database (master-slave replication)

Concurrency:
- Load balancer distributes requests
- Job queue for async processing
```

**Development View**
```
Modules:
- frontend/ (React SPA)
- backend/
  - api/ (REST endpoints)
  - services/ (business logic)
  - models/ (data models)
- shared/ (common utilities)

Dependencies:
- Frontend → Backend API
- Services → Models
- All → Shared
```

**Physical View**
```
Deployment:
- CDN (static assets)
- Load Balancer (AWS ALB)
- Application Servers (EC2 Auto Scaling Group)
- Database (RDS Multi-AZ)
- Cache (ElastiCache)
- Object Storage (S3)
```

### Example 2: Quality Attribute Specifications

**Performance**
```
Attribute: Response Time
Metric: 95th percentile API response time
Target: < 200ms
Measurement: Application Performance Monitoring (APM)
Validation: Load testing with 1000 concurrent users
```

**Scalability**
```
Attribute: Horizontal Scalability
Metric: Requests per second (RPS)
Target: Support 10,000 RPS with linear scaling
Measurement: Load testing, auto-scaling metrics
Validation: Stress testing with gradual load increase
```

**Availability**
```
Attribute: System Uptime
Metric: Percentage uptime
Target: 99.9% (three nines)
Measurement: Uptime monitoring, incident tracking
Validation: Monthly uptime reports, SLA compliance
```

**Security**
```
Attribute: Authentication Security
Metric: Zero unauthorized access incidents
Target: No breaches, OWASP Top 10 compliance
Measurement: Security audits, penetration testing
Validation: Quarterly security assessments
```

---

## Understanding

### Why Distinguish Architecture from Design?

**Communication Clarity**
- Different stakeholders care about different levels
- Business stakeholders: architecture (strategic)
- Developers: design (tactical)
- Clear separation prevents confusion

**Decision Impact**
- Architectural decisions are expensive to change
- Design decisions are easier to refactor
- Understanding impact guides decision-making process

**Skill Specialization**
- Architects focus on system-wide concerns
- Designers focus on component implementation
- Both roles require different expertise

### The Value of Multiple Views

**No Single View is Sufficient**
- Each view addresses specific concerns
- Complete understanding requires multiple perspectives
- Views must be consistent and synchronized

**View Selection Trade-offs**
- More views = more documentation overhead
- Fewer views = incomplete understanding
- Balance: create views that add value

**View Maintenance**
- Views must evolve with system
- Outdated views are worse than no views
- Automation helps (code → diagrams)

### Quality Attributes Drive Architecture

**Architecture is About Trade-offs**
- Cannot optimize all quality attributes simultaneously
- Performance vs. maintainability
- Security vs. usability
- Cost vs. scalability

**Quality Attribute Scenarios**
- Concrete scenarios make attributes testable
- Example: "System handles 1000 concurrent users with < 200ms response time"
- Scenarios validate architectural decisions

**Measurability is Critical**
- "Fast" is not measurable
- "< 200ms for 95th percentile" is measurable
- Metrics enable validation and improvement

---

## Best Practices

### Architectural Documentation

✅ **Use Standard Notations**: UML, C4 model, ArchiMate
✅ **Keep Views Synchronized**: Ensure consistency across views
✅ **Automate Where Possible**: Generate diagrams from code
✅ **Version Control**: Track architectural changes
✅ **Review Regularly**: Update as system evolves
❌ **Over-Document**: Avoid excessive detail
❌ **Stale Documentation**: Outdated docs are harmful

### Quality Attribute Definition

✅ **Quantify Attributes**: Use measurable metrics
✅ **Prioritize Attributes**: Not all are equally important
✅ **Validate Early**: Test attributes in prototypes
✅ **Monitor Continuously**: Track metrics in production
❌ **Vague Requirements**: "Fast", "secure", "scalable"
❌ **Ignore Trade-offs**: Acknowledge conflicts

### Stakeholder Communication

✅ **Tailor Views**: Different views for different stakeholders
✅ **Use Scenarios**: Concrete examples aid understanding
✅ **Visualize**: Diagrams over text
✅ **Iterate**: Refine based on feedback
❌ **Technical Jargon**: Avoid with non-technical stakeholders
❌ **One-Size-Fits-All**: Different audiences need different information

---

## Common Pitfalls

### Architecture vs. Design Confusion

**Problem**: Treating all decisions as architectural
**Impact**: Over-engineering, analysis paralysis
**Solution**: Apply decision impact test (strategic vs. tactical)

**Problem**: Ignoring architectural decisions
**Impact**: Technical debt, costly refactoring
**Solution**: Identify and document architectural decisions (ADRs)

### View Inconsistencies

**Problem**: Views contradict each other
**Impact**: Confusion, implementation errors
**Solution**: Regular consistency checks, automated validation

**Problem**: Views become outdated
**Impact**: Documentation doesn't match reality
**Solution**: Continuous documentation, code-to-diagram tools

### Quality Attribute Neglect

**Problem**: Focus only on functional requirements
**Impact**: System doesn't meet performance, security, scalability needs
**Solution**: Define quality attributes early, validate continuously

**Problem**: Unmeasurable quality attributes
**Impact**: Cannot validate if requirements are met
**Solution**: Use SMART criteria for all quality attributes

---

## References

- **ISO/IEC 42010:2011** - Systems and software engineering — Architecture description
- **Software Architecture in Practice** (Bass, Clements, Kazman) - Quality attributes
- **Documenting Software Architectures** (Clements et al.) - Views and viewpoints
- **The 4+1 View Model** (Philippe Kruchten) - Architectural views

---

## Related Topics

- [Fundamentals](./fundamentals.md) - Core architectural elements
- [Principles](./principles.md) - Architectural principles
- [Quality Attributes](./quality-attributes.md) - Detailed quality attribute guidance
- [Modeling and Documentation](./modeling-documentation.md) - Documentation techniques


