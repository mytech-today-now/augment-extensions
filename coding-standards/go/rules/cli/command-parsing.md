# Go CLI Tools - Command Parsing

## Overview

Command parsing is fundamental to CLI tools. This document defines best practices for implementing command-line interfaces using Cobra in Go.

## Core Principles

1. **User Experience**: Provide clear help text and examples
2. **Subcommands**: Organize functionality into logical subcommands
3. **Flags**: Use flags for options and arguments for required inputs
4. **Validation**: Validate inputs early and provide helpful error messages
5. **Consistency**: Follow Unix conventions for CLI design

## Rules

### GOL.3.3.1.1: Use Cobra for Command Parsing

**Rule**: Use Cobra library for building CLI applications with subcommands.

**Severity**: WARNING

**Rationale**: Cobra provides robust command parsing, help generation, and follows CLI best practices.

**✅ Good**:
```go
import (
    "github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
    Use:   "myapp",
    Short: "A brief description of your application",
    Long: `A longer description that spans multiple lines and likely contains
examples and usage of using your application.`,
}

var versionCmd = &cobra.Command{
    Use:   "version",
    Short: "Print the version number",
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("myapp v1.0.0")
    },
}

func init() {
    rootCmd.AddCommand(versionCmd)
}

func Execute() error {
    return rootCmd.Execute()
}

func main() {
    if err := Execute(); err != nil {
        os.Exit(1)
    }
}
```

### GOL.3.3.1.2: Organize Commands with Subcommands

**Rule**: Use subcommands to organize related functionality.

**Severity**: INFO

**Rationale**: Subcommands provide clear organization and discoverability.

**✅ Good**:
```go
var userCmd = &cobra.Command{
    Use:   "user",
    Short: "Manage users",
}

var userListCmd = &cobra.Command{
    Use:   "list",
    Short: "List all users",
    Run: func(cmd *cobra.Command, args []string) {
        // List users
    },
}

var userCreateCmd = &cobra.Command{
    Use:   "create [name]",
    Short: "Create a new user",
    Args:  cobra.ExactArgs(1),
    Run: func(cmd *cobra.Command, args []string) {
        name := args[0]
        // Create user
    },
}

func init() {
    userCmd.AddCommand(userListCmd)
    userCmd.AddCommand(userCreateCmd)
    rootCmd.AddCommand(userCmd)
}

// Usage:
// myapp user list
// myapp user create john
```

### GOL.3.3.1.3: Define Flags with Appropriate Types

**Rule**: Use typed flags (string, int, bool) and provide default values.

**Severity**: ERROR

**Rationale**: Type safety prevents runtime errors and improves user experience.

**✅ Good**:
```go
var (
    outputFormat string
    verbose      bool
    maxResults   int
)

var listCmd = &cobra.Command{
    Use:   "list",
    Short: "List resources",
    Run: func(cmd *cobra.Command, args []string) {
        if verbose {
            fmt.Println("Verbose mode enabled")
        }
        fmt.Printf("Output format: %s, Max results: %d\n", outputFormat, maxResults)
    },
}

func init() {
    // String flag with default
    listCmd.Flags().StringVarP(&outputFormat, "output", "o", "table", "Output format (table, json, yaml)")
    
    // Boolean flag
    listCmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "Enable verbose output")
    
    // Integer flag with default
    listCmd.Flags().IntVarP(&maxResults, "limit", "l", 10, "Maximum number of results")
    
    // Required flag
    listCmd.MarkFlagRequired("output")
}
```

### GOL.3.3.1.4: Validate Arguments and Flags

**Rule**: Validate command arguments and flags before execution.

**Severity**: ERROR

**Rationale**: Early validation provides clear error messages and prevents invalid operations.

**✅ Good**:
```go
var createCmd = &cobra.Command{
    Use:   "create [name]",
    Short: "Create a resource",
    Args:  cobra.ExactArgs(1),
    PreRunE: func(cmd *cobra.Command, args []string) error {
        // Validate name
        name := args[0]
        if len(name) < 3 {
            return fmt.Errorf("name must be at least 3 characters")
        }
        
        // Validate flag
        if outputFormat != "json" && outputFormat != "yaml" {
            return fmt.Errorf("invalid output format: %s", outputFormat)
        }
        
        return nil
    },
    RunE: func(cmd *cobra.Command, args []string) error {
        name := args[0]
        return createResource(name)
    },
}

// Cobra built-in validators
var exactOneArg = &cobra.Command{
    Args: cobra.ExactArgs(1),
}

var minTwoArgs = &cobra.Command{
    Args: cobra.MinimumNArgs(2),
}

var maxThreeArgs = &cobra.Command{
    Args: cobra.MaximumNArgs(3),
}

var rangeArgs = &cobra.Command{
    Args: cobra.RangeArgs(1, 3),
}
```

### GOL.3.3.1.5: Provide Helpful Usage Examples

**Rule**: Include usage examples in command help text.

**Severity**: WARNING

**Rationale**: Examples improve discoverability and reduce user confusion.

**✅ Good**:
```go
var deployCmd = &cobra.Command{
    Use:   "deploy [app-name]",
    Short: "Deploy an application",
    Long: `Deploy an application to the specified environment.
    
The deploy command builds and deploys your application to the target environment.
It supports multiple deployment strategies and configuration options.`,
    Example: `  # Deploy to production
  myapp deploy myapp --env production
  
  # Deploy with custom config
  myapp deploy myapp --env staging --config custom.yaml
  
  # Deploy with verbose output
  myapp deploy myapp --env dev -v`,
    Args: cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        appName := args[0]
        return deployApp(appName)
    },
}
```

### GOL.3.3.1.6: Use Persistent Flags for Global Options

**Rule**: Use persistent flags for options that apply to all subcommands.

**Severity**: INFO

**✅ Good**:
```go
var (
    configFile string
    verbose    bool
)

func init() {
    // Persistent flags available to all subcommands
    rootCmd.PersistentFlags().StringVar(&configFile, "config", "", "config file (default is $HOME/.myapp.yaml)")
    rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
    
    // Local flags only for this command
    rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

// Usage:
// myapp --verbose user list    # verbose applies to all commands
// myapp user list --verbose    # also works
```

## References

- [Cobra Documentation](https://github.com/spf13/cobra)
- [CLI Best Practices](https://clig.dev/)
- [POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html)

