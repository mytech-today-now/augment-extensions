# Software Architecture Design Module

Comprehensive software architecture design patterns, principles, and best practices for building scalable, maintainable, and secure systems.

## Overview

This module provides AI agents with comprehensive guidance on software architecture design, covering:

- **Architecture Fundamentals** - Core elements, components, connectors, and configurations
- **Architecture Patterns** - Monolithic, microservices, event-driven, serverless, and layered architectures
- **Quality Attributes** - Performance, security, scalability, reliability, and maintainability
- **Best Practices** - Tools, methodologies, modeling, and documentation
- **Specialized Architectures** - Industry-specific patterns for IoT, AI, blockchain, and edge computing

## Installation

### With CLI (Future)

```bash
augx link domain-rules/software-architecture
```

### Without CLI (Current)

Copy the contents of this module to your project's `.augment/` folder or reference the module files directly.

## Module Structure

```
augment-extensions/domain-rules/software-architecture/
├── module.json                          # Module metadata and configuration
├── README.md                            # This file
├── rules/                               # Architecture guidelines
│   ├── fundamentals.md                  # Core architectural elements
│   ├── principles.md                    # Design principles
│   ├── monolithic.md                    # Monolithic architecture
│   ├── microservices.md                 # Microservices patterns
│   ├── event-driven.md                  # Event-driven architecture
│   ├── serverless.md                    # Serverless patterns
│   ├── layered.md                       # Layered architecture
│   ├── quality-attributes.md            # Non-functional requirements
│   ├── security.md                      # Security architecture
│   ├── scalability.md                   # Scalability patterns
│   ├── tools-methodologies.md           # TOGAF, DDD, CI/CD
│   ├── modeling-documentation.md        # 4+1 views, UML, C4
│   ├── industry-architectures.md        # IoT, AI, blockchain
│   └── skills-development.md            # Architect skills
└── examples/                            # Architecture examples
    ├── ecommerce-microservices.md       # E-commerce platform
    ├── iot-eventdriven.md               # IoT sensor network
    ├── trading-eventdriven.md           # Stock trading system
    └── serverless-imageprocessing.md    # Image processing pipeline
```

## Sub-Modules

This module is organized into five sub-modules for selective loading:

### 1. Fundamentals
Core architectural concepts and principles.
- `fundamentals.md` - Components, connectors, configurations (ISO/IEC 42010)
- `principles.md` - Modularity, separation of concerns, coupling, cohesion

### 2. Patterns
Common architectural patterns and styles.
- `monolithic.md` - Monolithic architecture patterns
- `microservices.md` - Service discovery, API gateways, distributed systems
- `event-driven.md` - Pub/sub, CQRS, event sourcing
- `serverless.md` - FaaS, stateless functions, cloud-native
- `layered.md` - MVC, pipe-and-filter, n-tier

### 3. Quality
Non-functional requirements and quality attributes.
- `quality-attributes.md` - Performance, reliability, maintainability
- `security.md` - Threat modeling, zero-trust, RBAC (OWASP)
- `scalability.md` - Horizontal/vertical scaling, caching, load balancing

### 4. Practices
Tools, methodologies, and documentation.
- `tools-methodologies.md` - TOGAF, DDD, CI/CD frameworks
- `modeling-documentation.md` - 4+1 views, UML, C4 model, auto-generation

### 5. Specialized
Industry-specific and specialized patterns.
- `industry-architectures.md` - IoT, AI/ML, blockchain, edge computing
- `skills-development.md` - Technical and soft skills for architects

## Usage

### For AI Agents

When working on architecture-related tasks:

1. **Query the module**: `augx show software-architecture`
2. **Load specific sub-module**: `augx show software-architecture/fundamentals`
3. **Apply guidelines**: Follow the patterns and principles in the rule files
4. **Reference examples**: Use example architectures as templates

### Common Use Cases

- **Designing new systems**: Start with fundamentals and principles
- **Choosing architecture pattern**: Review patterns sub-module
- **Security review**: Consult security.md and quality-attributes.md
- **Scaling existing system**: Review scalability.md and microservices.md
- **Documentation**: Use modeling-documentation.md for architecture diagrams

## Key Features

✅ **Comprehensive Coverage** - All major architecture patterns and styles  
✅ **Industry Standards** - Based on ISO/IEC 42010, TOGAF, OWASP  
✅ **Practical Examples** - Real-world architecture examples  
✅ **Quality Focus** - Emphasis on non-functional requirements  
✅ **Modular Design** - Sub-modules for selective loading  
✅ **Best Practices** - Proven patterns and anti-patterns  

## Character Count

**Total**: 508,000 characters (25 files including rules, examples, and documentation)

## Version

**Current Version**: 1.0.0

## Contents

- **16 Rule Files** covering all aspects of software architecture
- **4 Example Files** demonstrating real-world architectures
- **5 Sub-Modules** for organized, selective loading
- **Standards-Based** - ISO/IEC 42010, TOGAF, OWASP, DDD

## References

- ISO/IEC 42010 - Systems and software engineering — Architecture description
- TOGAF - The Open Group Architecture Framework
- OWASP - Open Web Application Security Project
- Domain-Driven Design (DDD) - Eric Evans
- C4 Model - Simon Brown
- 4+1 Architectural View Model - Philippe Kruchten

## License

Part of Augment Extensions repository.

