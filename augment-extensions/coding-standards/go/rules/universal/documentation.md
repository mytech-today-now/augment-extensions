# Go Documentation Rules

## Overview

This document defines universal documentation best practices for Go projects. These rules apply to all Go code regardless of project category.

## Core Principles

1. **Package Comments**: Every package must have a package comment
2. **Function Comments**: Document all exported functions and methods
3. **Example Tests**: Use Example tests for executable documentation
4. **Godoc Compatibility**: Write comments that render well in godoc
5. **README Requirements**: Maintain comprehensive README.md files

## Rules

### GOL.2.6.1: Package Comment Requirements

**Rule**: Every package must have a package comment that describes its purpose.

**Rationale**: Package comments appear in godoc and help users understand the package's role.

**Format**:
- Start with "Package [name]" for single-file packages
- Use `doc.go` for multi-file packages
- Write complete sentences
- Explain what the package does, not how it works

**Example (doc.go)**:
```go
// Package auth provides authentication and authorization functionality
// for the application. It supports JWT tokens, OAuth2, and API keys.
//
// Basic usage:
//
//     authenticator := auth.NewAuthenticator(config)
//     token, err := authenticator.GenerateToken(user)
//     if err != nil {
//         log.Fatal(err)
//     }
//
// The package also provides middleware for HTTP handlers:
//
//     http.Handle("/api", auth.RequireAuth(handler))
//
package auth
```

**Example (single file)**:
```go
// Package mathutil provides mathematical utility functions
// for common operations not found in the standard library.
package mathutil
```

### GOL.2.6.2: Function/Method Comment Format

**Rule**: Document all exported functions and methods with comments that start with the function name.

**Rationale**: Godoc extracts these comments to generate documentation. Starting with the function name makes it clear what's being documented.

**Format**:
- Start with the function/method name
- Write complete sentences
- Explain what the function does, parameters, and return values
- Document error conditions
- Use blank lines to separate paragraphs

**Example**:
```go
// NewClient creates a new HTTP client with the given configuration.
// It returns an error if the configuration is invalid or if the
// client cannot be initialized.
//
// The client automatically handles retries, timeouts, and connection
// pooling based on the provided configuration.
func NewClient(config *Config) (*Client, error) {
    // Implementation
}

// Get retrieves a resource by ID from the server.
// It returns ErrNotFound if the resource doesn't exist,
// or ErrUnauthorized if authentication fails.
func (c *Client) Get(ctx context.Context, id string) (*Resource, error) {
    // Implementation
}
```

**Bad Example**:
```go
// Creates a new client  // Missing function name
func NewClient(config *Config) (*Client, error) {
    // Implementation
}

// get resource  // Not a complete sentence, missing details
func (c *Client) Get(ctx context.Context, id string) (*Resource, error) {
    // Implementation
}
```

### GOL.2.6.3: Example Test Functions for Godoc

**Rule**: Use Example test functions to provide executable documentation.

**Rationale**: Example tests appear in godoc and are verified by `go test`, ensuring documentation stays accurate.

**Format**:
- Function name: `Example`, `Example<FunctionName>`, or `Example<Type>_<Method>`
- Use `// Output:` comment to specify expected output
- Examples are executed as tests

**Example**:
```go
package mathutil_test

import (
    "fmt"
    "myproject/mathutil"
)

// Example demonstrates basic usage of the package.
func Example() {
    result := mathutil.Add(2, 3)
    fmt.Println(result)
    // Output: 5
}

// ExampleAdd demonstrates the Add function with negative numbers.
func ExampleAdd() {
    result := mathutil.Add(-2, 3)
    fmt.Println(result)
    // Output: 1
}

// ExampleCalculator_Multiply demonstrates the Multiply method.
func ExampleCalculator_Multiply() {
    calc := mathutil.NewCalculator()
    result := calc.Multiply(4, 5)
    fmt.Println(result)
    // Output: 20
}
```

### GOL.2.6.4: Godoc Compatibility Requirements

**Rule**: Write comments that render well in godoc and follow godoc conventions.

**Rationale**: Godoc is the standard documentation tool for Go. Following its conventions ensures documentation is accessible and well-formatted.

**Guidelines**:
- Use blank lines to separate paragraphs
- Indent code blocks with a single tab or 4 spaces
- Use `//` for single-line comments, not `/* */`
- Link to other symbols with just their name (godoc auto-links)
- Use headings sparingly (godoc doesn't support markdown)

**Example**:
```go
// Server represents an HTTP server with graceful shutdown support.
//
// The server automatically handles:
//
//     - Request logging
//     - Panic recovery
//     - Graceful shutdown
//
// Create a new server with NewServer and start it with Start:
//
//     server := NewServer(config)
//     if err := server.Start(); err != nil {
//         log.Fatal(err)
//     }
//
// The server can be stopped gracefully with Stop, which waits for
// active connections to complete before shutting down.
type Server struct {
    // Implementation
}
```

### GOL.2.6.5: README.md Requirements

**Rule**: Every Go module must have a comprehensive README.md file.

**Rationale**: README.md is the first thing users see. It should provide all essential information for getting started.

**Required Sections**:
1. **Title and Description**: What the project does
2. **Installation**: How to install/import the package
3. **Quick Start**: Basic usage example
4. **Documentation**: Link to godoc or detailed docs
5. **Examples**: Common use cases
6. **Contributing**: How to contribute (if applicable)
7. **License**: License information

**Example README.md**:
```markdown
# MyProject

A high-performance HTTP client for Go with automatic retries and circuit breaking.

## Installation

```bash
go get github.com/mycompany/myproject
```

## Quick Start

```go
package main

import (
    "context"
    "github.com/mycompany/myproject"
)

func main() {
    client := myproject.NewClient(&myproject.Config{
        Timeout: 30 * time.Second,
        Retries: 3,
    })

    resp, err := client.Get(context.Background(), "https://api.example.com")
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
}
```

## Documentation

Full documentation is available at [pkg.go.dev](https://pkg.go.dev/github.com/mycompany/myproject).

## License

MIT License - see LICENSE file for details.
```

## Additional Best Practices

**Type Documentation**:
```go
// User represents an authenticated user in the system.
// It contains both public profile information and internal metadata.
type User struct {
    ID    string // Unique identifier
    Email string // User's email address
}
```

**Constant Documentation**:
```go
// HTTP status codes for API responses.
const (
    StatusOK      = 200 // Request succeeded
    StatusCreated = 201 // Resource created
    StatusError   = 500 // Internal server error
)
```

## References

- [Godoc: Documenting Go Code](https://go.dev/blog/godoc)
- [Effective Go - Commentary](https://go.dev/doc/effective_go#commentary)
- [Go Doc Comments](https://go.dev/doc/comment)

