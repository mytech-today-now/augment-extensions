# Go Code Organization Rules

## Overview

This document defines universal code organization best practices for Go projects. These rules apply to all Go code regardless of project category.

## Core Principles

1. **Flat Package Structure**: Avoid deep nesting; prefer flat, focused packages
2. **Internal Packages**: Use `internal/` for private implementation details
3. **Import Grouping**: Group imports logically (stdlib, external, internal)
4. **File Organization**: Organize code by responsibility, not by type
5. **Dependency Management**: Use `go.mod` for explicit dependency versioning

## Rules

### GOL.2.5.1: Package Structure (Flat, Avoid Deep Nesting)

**Rule**: Keep package structure flat and focused. Avoid deep directory hierarchies.

**Rationale**: Flat structures are easier to navigate, understand, and maintain. Deep nesting often indicates poor separation of concerns.

**Good Example**:
```
myproject/
├── cmd/
│   └── myapp/
│       └── main.go
├── internal/
│   ├── auth/
│   ├── database/
│   └── handler/
├── pkg/
│   └── api/
├── go.mod
└── go.sum
```

**Bad Example**:
```
myproject/
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── company/
│                   └── project/  # Too deep!
```

**Guidelines**:
- Keep packages at 2-3 levels deep maximum
- Each package should have a single, clear responsibility
- Use `cmd/` for application entry points
- Use `internal/` for private packages
- Use `pkg/` for public, reusable packages (optional)

### GOL.2.5.2: Internal Package Usage

**Rule**: Use `internal/` directory to prevent external imports of private packages.

**Rationale**: The Go compiler enforces that `internal/` packages can only be imported by code in the parent tree, providing true encapsulation.

**Example**:
```
myproject/
├── internal/
│   ├── auth/          # Only importable by myproject
│   │   └── jwt.go
│   └── database/      # Only importable by myproject
│       └── postgres.go
├── pkg/
│   └── api/           # Publicly importable
│       └── client.go
└── cmd/
    └── server/
        └── main.go
```

**Usage**:
```go
// In cmd/server/main.go
import (
    "myproject/internal/auth"      // OK: same parent tree
    "myproject/internal/database"  // OK: same parent tree
    "myproject/pkg/api"            // OK: public package
)

// In external project
import (
    "myproject/internal/auth"  // ERROR: cannot import internal package
    "myproject/pkg/api"        // OK: public package
)
```

### GOL.2.5.3: Import Grouping (stdlib, external, internal)

**Rule**: Group imports into three sections: standard library, external packages, and internal packages.

**Rationale**: Consistent import grouping improves readability and makes dependencies clear.

**Example**:
```go
package main

import (
    // Standard library
    "context"
    "fmt"
    "net/http"
    "time"

    // External packages
    "github.com/gorilla/mux"
    "github.com/sirupsen/logrus"
    "go.uber.org/zap"

    // Internal packages
    "myproject/internal/auth"
    "myproject/internal/database"
    "myproject/pkg/api"
)
```

**Tool**: Use `goimports` to automatically format and group imports:
```bash
goimports -w .
```

### GOL.2.5.4: File Organization Patterns

**Rule**: Organize files by responsibility, not by type. Keep related code together.

**Rationale**: Grouping by responsibility makes it easier to find and modify related code.

**Good Example** (by responsibility):
```
user/
├── user.go          # User type and core logic
├── repository.go    # Database operations
├── service.go       # Business logic
├── handler.go       # HTTP handlers
└── user_test.go     # Tests
```

**Bad Example** (by type):
```
models/
├── user.go
├── product.go
repositories/
├── user_repository.go
├── product_repository.go
services/
├── user_service.go
├── product_service.go
```

**Guidelines**:
- Keep related types and functions in the same package
- Use `_test.go` suffix for test files
- Use `doc.go` for package-level documentation
- Limit file size to ~500 lines; split if larger

### GOL.2.5.5: Go.mod Dependency Management

**Rule**: Use `go.mod` for explicit dependency versioning and management.

**Rationale**: `go.mod` provides reproducible builds, semantic versioning, and dependency isolation.

**Example go.mod**:
```go
module github.com/mycompany/myproject

go 1.21

require (
    github.com/gorilla/mux v1.8.0
    github.com/sirupsen/logrus v1.9.3
    go.uber.org/zap v1.26.0
)

require (
    // Indirect dependencies
    go.uber.org/multierr v1.11.0 // indirect
    golang.org/x/sys v0.15.0 // indirect
)
```

**Best Practices**:
- Run `go mod tidy` regularly to clean up unused dependencies
- Use `go mod vendor` for vendoring if needed
- Pin major versions explicitly
- Use `replace` directive for local development only
- Document why `replace` directives exist

**Commands**:
```bash
go mod init github.com/mycompany/myproject  # Initialize module
go mod tidy                                  # Clean up dependencies
go mod download                              # Download dependencies
go mod verify                                # Verify dependencies
go mod vendor                                # Vendor dependencies
```

## Package Naming Conventions

**Rule**: Use short, lowercase, single-word package names.

**Examples**:
- Good: `http`, `auth`, `user`, `database`
- Bad: `httpServer`, `AuthenticationService`, `user_management`

**Rationale**: Package names are used in every import and type reference. Short names reduce verbosity.

## References

- [Go Project Layout](https://github.com/golang-standards/project-layout)
- [Effective Go - Package Names](https://go.dev/doc/effective_go#package-names)
- [Go Modules Reference](https://go.dev/ref/mod)
- [Internal Packages](https://go.dev/doc/go1.4#internalpackages)

