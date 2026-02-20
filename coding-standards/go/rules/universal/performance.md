# Go Performance Rules

## Overview

This document defines universal performance optimization best practices for Go projects. These rules apply to all Go code regardless of project category.

## Core Principles

1. **Allocation Minimization**: Reduce heap allocations in hot paths
2. **Object Reuse**: Use `sync.Pool` for frequently allocated objects
3. **Profiling**: Use pprof to identify bottlenecks before optimizing
4. **Benchmarking**: Write benchmarks to measure performance improvements
5. **Escape Analysis**: Understand and leverage escape analysis

## Rules

### GOL.2.7.1: Allocation Minimization Techniques

**Rule**: Minimize heap allocations in performance-critical code paths.

**Rationale**: Heap allocations are expensive and increase GC pressure. Stack allocations are much faster.

**Techniques**:

**1. Preallocate Slices**:
```go
// Bad: Multiple allocations as slice grows
func processItems(n int) []Item {
    var items []Item
    for i := 0; i < n; i++ {
        items = append(items, Item{ID: i})
    }
    return items
}

// Good: Single allocation with known capacity
func processItems(n int) []Item {
    items := make([]Item, 0, n)
    for i := 0; i < n; i++ {
        items = append(items, Item{ID: i})
    }
    return items
}
```

**2. Reuse Buffers**:
```go
// Bad: New buffer for each call
func formatMessage(msg string) string {
    var buf bytes.Buffer
    buf.WriteString("[INFO] ")
    buf.WriteString(msg)
    return buf.String()
}

// Good: Reuse buffer with Reset()
var bufPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func formatMessage(msg string) string {
    buf := bufPool.Get().(*bytes.Buffer)
    defer bufPool.Put(buf)
    buf.Reset()
    buf.WriteString("[INFO] ")
    buf.WriteString(msg)
    return buf.String()
}
```

**3. Avoid String Concatenation in Loops**:
```go
// Bad: Creates new string on each iteration
func joinStrings(items []string) string {
    result := ""
    for _, item := range items {
        result += item + ","
    }
    return result
}

// Good: Use strings.Builder
func joinStrings(items []string) string {
    var sb strings.Builder
    sb.Grow(len(items) * 10) // Preallocate approximate size
    for i, item := range items {
        if i > 0 {
            sb.WriteString(",")
        }
        sb.WriteString(item)
    }
    return sb.String()
}
```

### GOL.2.7.2: sync.Pool for Object Reuse

**Rule**: Use `sync.Pool` to reuse frequently allocated objects and reduce GC pressure.

**Rationale**: `sync.Pool` provides a cache of reusable objects, reducing allocation overhead.

**Example**:
```go
// Define a pool for buffers
var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

// Use the pool
func processData(data []byte) (string, error) {
    // Get buffer from pool
    buf := bufferPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()           // Clear buffer
        bufferPool.Put(buf)   // Return to pool
    }()

    // Use buffer
    buf.Write(data)
    return buf.String(), nil
}
```

**Best Practices**:
- Always call `Reset()` before returning objects to the pool
- Use `defer` to ensure objects are returned even on error
- Don't store references to pooled objects after returning them
- Pool objects should be safe to reuse after `Reset()`

### GOL.2.7.3: Profiling with pprof

**Rule**: Use pprof to profile CPU, memory, and goroutine usage before optimizing.

**Rationale**: Profile-guided optimization is more effective than guessing. Measure first, optimize second.

**CPU Profiling**:
```go
import (
    "os"
    "runtime/pprof"
)

func main() {
    // Start CPU profiling
    f, err := os.Create("cpu.prof")
    if err != nil {
        log.Fatal(err)
    }
    defer f.Close()

    if err := pprof.StartCPUProfile(f); err != nil {
        log.Fatal(err)
    }
    defer pprof.StopCPUProfile()

    // Run your code
    doWork()
}
```

**Memory Profiling**:
```go
import (
    "os"
    "runtime"
    "runtime/pprof"
)

func main() {
    // Run your code
    doWork()

    // Write memory profile
    f, err := os.Create("mem.prof")
    if err != nil {
        log.Fatal(err)
    }
    defer f.Close()

    runtime.GC() // Get up-to-date statistics
    if err := pprof.WriteHeapProfile(f); err != nil {
        log.Fatal(err)
    }
}
```

**Analyzing Profiles**:
```bash
# CPU profile
go tool pprof cpu.prof
# Commands: top, list, web

# Memory profile
go tool pprof mem.prof
# Commands: top, list, web

# HTTP server profiling (import _ "net/http/pprof")
go tool pprof http://localhost:6060/debug/pprof/profile
go tool pprof http://localhost:6060/debug/pprof/heap
```

### GOL.2.7.4: Benchmark Writing and Interpretation

**Rule**: Write benchmarks to measure performance and track regressions.

**Rationale**: Benchmarks provide objective measurements and catch performance regressions.

**Example**:
```go
func BenchmarkStringConcatenation(b *testing.B) {
    for i := 0; i < b.N; i++ {
        _ = "hello" + " " + "world"
    }
}

func BenchmarkStringBuilder(b *testing.B) {
    for i := 0; i < b.N; i++ {
        var sb strings.Builder
        sb.WriteString("hello")
        sb.WriteString(" ")
        sb.WriteString("world")
        _ = sb.String()
    }
}

// Benchmark with setup
func BenchmarkMapLookup(b *testing.B) {
    m := make(map[string]int)
    for i := 0; i < 1000; i++ {
        m[fmt.Sprintf("key%d", i)] = i
    }

    b.ResetTimer() // Don't count setup time

    for i := 0; i < b.N; i++ {
        _ = m["key500"]
    }
}
```

**Running Benchmarks**:
```bash
# Run all benchmarks
go test -bench=.

# Run specific benchmark
go test -bench=BenchmarkStringBuilder

# With memory statistics
go test -bench=. -benchmem

# Compare benchmarks
go test -bench=. -benchmem > old.txt
# Make changes
go test -bench=. -benchmem > new.txt
benchstat old.txt new.txt
```

### GOL.2.7.5: Escape Analysis and Optimization

**Rule**: Understand escape analysis to keep allocations on the stack when possible.

**Rationale**: Stack allocations are much faster than heap allocations and don't require GC.

**Check Escape Analysis**:
```bash
go build -gcflags='-m' main.go
```

**Example**:
```go
// Escapes to heap (returned pointer)
func createUser() *User {
    u := User{Name: "Alice"}
    return &u  // Escapes: returned to caller
}

// Stays on stack (value returned)
func createUser() User {
    return User{Name: "Alice"}
}

// Escapes to heap (stored in interface)
func processUser(u *User) {
    var i interface{} = u  // Escapes: stored in interface
    fmt.Println(i)
}

// Stays on stack (no escape)
func processUser(u *User) {
    fmt.Println(u.Name)  // No escape: direct field access
}
```

**Optimization Tips**:
- Return values instead of pointers when possible
- Avoid storing pointers in interfaces in hot paths
- Use value receivers for small structs
- Preallocate slices with known capacity
- Avoid closures that capture large variables

## Performance Checklist

- [ ] Profile before optimizing (CPU, memory, goroutines)
- [ ] Write benchmarks for critical paths
- [ ] Preallocate slices with known capacity
- [ ] Use `sync.Pool` for frequently allocated objects
- [ ] Use `strings.Builder` for string concatenation
- [ ] Check escape analysis for hot paths
- [ ] Minimize allocations in loops
- [ ] Reuse buffers and objects
- [ ] Use `benchstat` to compare performance changes

## References

- [Go Performance Tips](https://github.com/dgryski/go-perfbook)
- [Profiling Go Programs](https://go.dev/blog/pprof)
- [Escape Analysis](https://www.ardanlabs.com/blog/2017/05/language-mechanics-on-escape-analysis.html)

