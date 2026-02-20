# Go Testing Rules

## Overview

This document defines universal testing best practices for Go projects. These rules apply to all Go code regardless of project category.

## Core Principles

1. **Table-Driven Tests**: Use table-driven tests for comprehensive coverage
2. **Subtests**: Organize tests with `t.Run()` for clarity and isolation
3. **Benchmarks**: Write benchmarks to measure and track performance
4. **Test Helpers**: Use `t.Helper()` to improve error reporting
5. **Test Coverage**: Aim for >80% code coverage with meaningful tests

## Rules

### GOL.2.4.1: Table-Driven Test Pattern

**Rule**: Use table-driven tests to test multiple scenarios with the same logic.

**Rationale**: Reduces code duplication, improves readability, and makes it easy to add new test cases.

**Example**:
```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 2, 3, 5},
        {"negative numbers", -2, -3, -5},
        {"mixed signs", -2, 3, 1},
        {"zero values", 0, 0, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### GOL.2.4.2: Subtest Usage with t.Run()

**Rule**: Use `t.Run()` to create subtests for better organization and parallel execution.

**Rationale**: Subtests provide clear test names, allow running specific tests, and enable parallel execution.

**Example**:
```go
func TestUserValidation(t *testing.T) {
    t.Run("valid email", func(t *testing.T) {
        t.Parallel()
        user := User{Email: "test@example.com"}
        if err := user.Validate(); err != nil {
            t.Errorf("expected valid email, got error: %v", err)
        }
    })

    t.Run("invalid email", func(t *testing.T) {
        t.Parallel()
        user := User{Email: "invalid"}
        if err := user.Validate(); err == nil {
            t.Error("expected error for invalid email")
        }
    })
}
```

### GOL.2.4.3: Benchmark Writing

**Rule**: Write benchmarks for performance-critical code using the `testing.B` type.

**Rationale**: Benchmarks help identify performance regressions and optimization opportunities.

**Example**:
```go
func BenchmarkStringConcatenation(b *testing.B) {
    for i := 0; i < b.N; i++ {
        _ = "hello" + "world"
    }
}

func BenchmarkStringBuilder(b *testing.B) {
    for i := 0; i < b.N; i++ {
        var sb strings.Builder
        sb.WriteString("hello")
        sb.WriteString("world")
        _ = sb.String()
    }
}
```

### GOL.2.4.4: Test Helper Functions with t.Helper()

**Rule**: Mark test helper functions with `t.Helper()` to improve error reporting.

**Rationale**: `t.Helper()` ensures error messages point to the calling test, not the helper function.

**Example**:
```go
func assertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
}

func assertEqual(t *testing.T, got, want interface{}) {
    t.Helper()
    if got != want {
        t.Errorf("got %v; want %v", got, want)
    }
}

func TestUserCreation(t *testing.T) {
    user, err := NewUser("test@example.com")
    assertNoError(t, err)
    assertEqual(t, user.Email, "test@example.com")
}
```

### GOL.2.4.5: Test Organization and Best Practices

**Rule**: Follow Go testing conventions for file naming, test naming, and test organization.

**Best Practices**:
- Test files end with `_test.go`
- Test functions start with `Test` prefix
- Benchmark functions start with `Benchmark` prefix
- Example functions start with `Example` prefix
- Use `testdata/` directory for test fixtures
- Use `testing.Short()` to skip long-running tests
- Clean up resources with `t.Cleanup()`

**Example**:
```go
func TestDatabaseOperations(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping database test in short mode")
    }

    db := setupTestDB(t)
    t.Cleanup(func() {
        db.Close()
    })

    // Test logic here
}
```

## References

- [Go Testing Package](https://pkg.go.dev/testing)
- [Table Driven Tests](https://github.com/golang/go/wiki/TableDrivenTests)
- [Go Testing Best Practices](https://go.dev/doc/effective_go#testing)

