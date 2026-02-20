# CLI Tool Project Template

## Context

You are generating Go code for a **CLI tool** project. This includes command-line applications, developer tools, and system utilities.

## Standards

Follow these Go coding standards for CLI tools:

### Universal Rules

1. **Naming Conventions**: Use MixedCaps for exported names, mixedCaps for unexported
2. **Error Handling**: Return errors explicitly, provide helpful error messages
3. **Testing**: Write table-driven tests, test command execution
4. **Code Organization**: Keep packages flat and focused
5. **Documentation**: Add godoc comments and usage examples
6. **Performance**: Minimize startup time, lazy-load dependencies

### CLI Tools Rules

#### Command Parsing
- Use Cobra library for command structure and parsing
- Organize functionality into logical subcommands
- Use typed flags (string, int, bool) with defaults
- Validate arguments and flags before execution
- Provide helpful usage examples in command help

#### Configuration
- Use Viper for configuration management
- Support config files (YAML, JSON, TOML)
- Support environment variables with consistent naming
- Follow precedence: Flags > Env Vars > Config File > Defaults
- Validate configuration on load

#### Cross-Platform
- Use `filepath` package for all path operations
- Use standard exit codes (0 for success, 1-255 for errors)
- Handle OS signals (SIGINT, SIGTERM) gracefully
- Use `os.UserHomeDir()` for home directory
- Test on Windows, macOS, and Linux

## Key Requirements

### Command Structure
```go
var rootCmd = &cobra.Command{
    Use:   "myapp",
    Short: "Brief description",
    Long:  "Detailed description with examples",
}

var subCmd = &cobra.Command{
    Use:   "sub [arg]",
    Short: "Subcommand description",
    Args:  cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        return executeCommand(args[0])
    },
}

func init() {
    rootCmd.AddCommand(subCmd)
}
```

### Flag Definition
```go
var (
    outputFormat string
    verbose      bool
    maxResults   int
)

func init() {
    cmd.Flags().StringVarP(&outputFormat, "output", "o", "table", "Output format")
    cmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "Verbose output")
    cmd.Flags().IntVar(&maxResults, "limit", 10, "Maximum results")
}
```

### Configuration Management
```go
func initConfig() {
    viper.SetConfigName("config")
    viper.AddConfigPath("$HOME/.myapp")
    viper.AddConfigPath(".")
    
    viper.SetEnvPrefix("MYAPP")
    viper.AutomaticEnv()
    
    viper.SetDefault("server.port", 8080)
    
    viper.ReadInConfig()
}
```

### Cross-Platform Paths
```go
func getConfigPath() (string, error) {
    home, err := os.UserHomeDir()
    if err != nil {
        return "", err
    }
    return filepath.Join(home, ".myapp", "config.yaml"), nil
}
```

### Exit Codes
```go
const (
    ExitSuccess      = 0
    ExitError        = 1
    ExitUsageError   = 2
    ExitConfigError  = 3
)

func main() {
    if err := rootCmd.Execute(); err != nil {
        os.Exit(ExitError)
    }
}
```

### Signal Handling
```go
func runWithCancellation(ctx context.Context) error {
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
    
    select {
    case <-sigChan:
        return fmt.Errorf("cancelled by user")
    case <-ctx.Done():
        return ctx.Err()
    }
}
```

## Common Patterns

### Argument Validation
```go
var createCmd = &cobra.Command{
    Args: cobra.ExactArgs(1),
    PreRunE: func(cmd *cobra.Command, args []string) error {
        if len(args[0]) < 3 {
            return fmt.Errorf("name must be at least 3 characters")
        }
        return nil
    },
}
```

### Persistent Flags
```go
func init() {
    // Available to all subcommands
    rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file")
    rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose")
}
```

### Config File Generation
```go
var initConfigCmd = &cobra.Command{
    Use:   "init-config",
    Short: "Generate sample config",
    RunE: func(cmd *cobra.Command, args []string) error {
        viper.SetDefault("key", "value")
        return viper.SafeWriteConfigAs("config.yaml")
    },
}
```

### Platform-Specific Code
```go
// Use build tags for platform-specific files
//go:build unix
package main

// Or runtime checks
func openBrowser(url string) error {
    var cmd *exec.Cmd
    switch runtime.GOOS {
    case "darwin":
        cmd = exec.Command("open", url)
    case "windows":
        cmd = exec.Command("cmd", "/c", "start", url)
    default:
        cmd = exec.Command("xdg-open", url)
    }
    return cmd.Start()
}
```

## Tools

Ensure generated code passes:
- `go build` - Compiles without errors
- `golangci-lint run` - Passes all linters
- `go vet` - No suspicious constructs
- `gofmt -d .` - Properly formatted
- Test on multiple platforms (Windows, macOS, Linux)

## Output Format

Generate complete, production-ready Go code with:
- Package declaration and imports
- Root command and subcommands
- Flag definitions with validation
- Configuration management with Viper
- Cross-platform path handling
- Proper exit codes
- Signal handling for graceful shutdown
- Comprehensive help text and examples
- Godoc comments

## References

- [Cobra Documentation](https://github.com/spf13/cobra)
- [Viper Documentation](https://github.com/spf13/viper)
- [CLI Best Practices](https://clig.dev/)
- [Go filepath package](https://pkg.go.dev/path/filepath)

