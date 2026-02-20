# Go CLI Tools - Cross-Platform Compatibility

## Overview

Cross-platform compatibility ensures CLI tools work correctly on Windows, macOS, and Linux. This document defines best practices for writing portable CLI applications.

## Core Principles

1. **Path Handling**: Use `filepath` package for path operations
2. **Exit Codes**: Use standard exit codes (0 for success, non-zero for errors)
3. **Signal Handling**: Handle OS signals gracefully
4. **Line Endings**: Handle different line ending conventions
5. **File Permissions**: Handle platform-specific file permissions

## Rules

### GOL.3.3.3.1: Use filepath Package for Paths

**Rule**: Always use `filepath` package for file path operations.

**Severity**: ERROR

**Rationale**: `filepath` handles platform-specific path separators and conventions.

**✅ Good**:
```go
import (
    "path/filepath"
)

func getConfigPath() string {
    home, _ := os.UserHomeDir()
    // Automatically uses correct separator (/ or \)
    return filepath.Join(home, ".myapp", "config.yaml")
}

func findFiles(dir string) ([]string, error) {
    pattern := filepath.Join(dir, "*.txt")
    return filepath.Glob(pattern)
}

func cleanPath(path string) string {
    // Normalizes path for current OS
    return filepath.Clean(path)
}
```

**❌ Bad**:
```go
// Hard-coded Unix paths don't work on Windows
configPath := home + "/.myapp/config.yaml"

// String concatenation breaks on Windows
dataPath := dir + "/" + filename
```

### GOL.3.3.3.2: Use Standard Exit Codes

**Rule**: Use standard exit codes: 0 for success, 1-255 for errors.

**Severity**: ERROR

**Rationale**: Standard exit codes enable proper error handling in scripts and CI/CD.

**✅ Good**:
```go
const (
    ExitSuccess       = 0
    ExitError         = 1
    ExitUsageError    = 2
    ExitConfigError   = 3
    ExitNetworkError  = 4
)

func main() {
    if err := rootCmd.Execute(); err != nil {
        switch err.(type) {
        case *UsageError:
            os.Exit(ExitUsageError)
        case *ConfigError:
            os.Exit(ExitConfigError)
        default:
            os.Exit(ExitError)
        }
    }
    os.Exit(ExitSuccess)
}

// In commands
func runCommand() error {
    if err := validateConfig(); err != nil {
        return &ConfigError{err}
    }
    return nil
}
```

### GOL.3.3.3.3: Handle OS Signals Gracefully

**Rule**: Handle SIGINT and SIGTERM for graceful shutdown on all platforms.

**Severity**: WARNING

**Rationale**: Enables clean shutdown and resource cleanup.

**✅ Good**:
```go
import (
    "os/signal"
    "syscall"
)

func runServer(ctx context.Context) error {
    // Create signal channel
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
    
    // Start server
    srv := startServer()
    
    // Wait for signal
    select {
    case <-sigChan:
        fmt.Println("\nShutdown signal received")
        return srv.Shutdown(ctx)
    case <-ctx.Done():
        return ctx.Err()
    }
}

// For long-running operations
func processWithCancellation(ctx context.Context) error {
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, os.Interrupt)
    
    done := make(chan error, 1)
    go func() {
        done <- doWork(ctx)
    }()
    
    select {
    case err := <-done:
        return err
    case <-sigChan:
        fmt.Println("\nOperation cancelled")
        return fmt.Errorf("cancelled by user")
    }
}
```

### GOL.3.3.3.4: Handle Platform-Specific Features

**Rule**: Use build tags or runtime checks for platform-specific code.

**Severity**: WARNING

**✅ Good - Build Tags**:
```go
// file_unix.go
//go:build unix

package main

import "syscall"

func setPlatformSpecific() {
    // Unix-specific code
    syscall.Umask(0077)
}
```

```go
// file_windows.go
//go:build windows

package main

func setPlatformSpecific() {
    // Windows-specific code
}
```

**✅ Good - Runtime Checks**:
```go
import "runtime"

func getEditor() string {
    if runtime.GOOS == "windows" {
        return "notepad.exe"
    }
    return "vi"
}

func openBrowser(url string) error {
    var cmd *exec.Cmd
    
    switch runtime.GOOS {
    case "darwin":
        cmd = exec.Command("open", url)
    case "windows":
        cmd = exec.Command("cmd", "/c", "start", url)
    default: // linux, freebsd, etc.
        cmd = exec.Command("xdg-open", url)
    }
    
    return cmd.Start()
}
```

### GOL.3.3.3.5: Handle File Permissions Correctly

**Rule**: Use appropriate file permissions that work across platforms.

**Severity**: WARNING

**✅ Good**:
```go
import "os"

func createConfigFile(path string) error {
    // 0644 works on Unix, ignored on Windows
    f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        return err
    }
    defer f.Close()
    
    return nil
}

func createExecutable(path string) error {
    // 0755 makes file executable on Unix
    return os.WriteFile(path, []byte("#!/bin/bash\n"), 0755)
}

// For sensitive files (like credentials)
func createSecureFile(path string) error {
    // 0600 = read/write for owner only
    return os.WriteFile(path, []byte("secret"), 0600)
}
```

### GOL.3.3.3.6: Use os.UserHomeDir for Home Directory

**Rule**: Use `os.UserHomeDir()` instead of environment variables.

**Severity**: ERROR

**Rationale**: Works consistently across all platforms.

**✅ Good**:
```go
func getConfigDir() (string, error) {
    home, err := os.UserHomeDir()
    if err != nil {
        return "", err
    }
    return filepath.Join(home, ".myapp"), nil
}
```

**❌ Bad**:
```go
// Doesn't work on Windows
home := os.Getenv("HOME")

// Platform-specific
home := os.Getenv("USERPROFILE") // Windows only
```

### GOL.3.3.3.7: Handle Line Endings

**Rule**: Use `bufio.Scanner` or normalize line endings when reading text files.

**Severity**: INFO

**✅ Good**:
```go
func readLines(path string) ([]string, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close()
    
    var lines []string
    scanner := bufio.NewScanner(f)
    // Scanner handles \n, \r\n, and \r automatically
    for scanner.Scan() {
        lines = append(lines, scanner.Text())
    }
    
    return lines, scanner.Err()
}
```

### GOL.3.3.3.8: Test on Multiple Platforms

**Rule**: Test CLI tools on Windows, macOS, and Linux before release.

**Severity**: WARNING

**✅ Good - GitHub Actions**:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
      - run: go test ./...
```

## References

- [Go filepath package](https://pkg.go.dev/path/filepath)
- [Cross-Platform Go](https://www.digitalocean.com/community/tutorials/building-go-applications-for-different-operating-systems-and-architectures)
- [Exit Status Codes](https://tldp.org/LDP/abs/html/exitcodes.html)

