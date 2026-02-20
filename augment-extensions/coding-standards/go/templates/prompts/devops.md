# DevOps Tooling Go Application AI Template

## Context

You are building a DevOps automation tool in Go for deployment, infrastructure management, and CI/CD integration.

## Key Requirements

### CLI Framework
- Use Cobra for command-line interface with subcommands
- Implement proper flag parsing and validation
- Provide clear help text and usage examples
- Support configuration via environment variables and config files

### Automation Principles
- Implement idempotent operations (safe to retry)
- Provide detailed progress feedback for long-running operations
- Support dry-run mode for all destructive operations
- Implement rollback capability for failed deployments
- Log all operations with appropriate detail levels

### CI/CD Integration
- Return appropriate exit codes for pipeline integration
- Support environment-based configuration
- Generate machine-readable output (JSON, JUnit XML)
- Publish artifacts with checksums and metadata
- Implement health checks for deployment verification

### Infrastructure as Code
- Use declarative configuration (YAML/JSON)
- Implement state management for tracking resources
- Resolve resource dependencies correctly
- Detect configuration drift
- Support plan and apply workflow

## Code Structure

```go
type DeploymentConfig struct {
    Name        string
    Environment string
    Version     string
}

type DeploymentOptions struct {
    DryRun  bool
    Verbose bool
    Timeout time.Duration
}

func Deploy(ctx context.Context, config *DeploymentConfig, opts *DeploymentOptions) error {
    // Deployment logic with progress feedback
}
```

## Example Patterns

### Cobra CLI
```go
var rootCmd = &cobra.Command{
    Use:   "devops-tool",
    Short: "A DevOps automation tool",
}

var deployCmd = &cobra.Command{
    Use:   "deploy [environment]",
    Short: "Deploy application",
    Args:  cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        return deployToEnvironment(args[0])
    },
}

func init() {
    deployCmd.Flags().StringP("version", "v", "latest", "Version to deploy")
    deployCmd.Flags().BoolP("dry-run", "d", false, "Perform dry run")
    rootCmd.AddCommand(deployCmd)
}
```

### Idempotent Operations
```go
func EnsureDeployment(ctx context.Context, config *DeploymentConfig) error {
    existing, err := getDeployment(ctx, config.Name)
    if err != nil && !isNotFoundError(err) {
        return err
    }
    
    if existing != nil {
        if deploymentMatches(existing, config) {
            log.Printf("Deployment already up to date")
            return nil
        }
        return updateDeployment(ctx, config)
    }
    
    return createDeployment(ctx, config)
}
```

### Dry-Run Mode
```go
func Deploy(ctx context.Context, config *DeploymentConfig, opts *DeploymentOptions) error {
    steps := []DeploymentStep{
        {Name: "Validate", Fn: validateConfig},
        {Name: "Build", Fn: buildImage},
        {Name: "Deploy", Fn: updateDeployment},
    }
    
    for _, step := range steps {
        if opts.DryRun {
            log.Printf("[DRY RUN] Would execute: %s", step.Name)
            continue
        }
        
        if err := step.Fn(ctx, config); err != nil {
            return err
        }
    }
    
    return nil
}
```

## Best Practices

1. **User Experience**: Provide clear, actionable error messages
2. **Safety**: Always confirm destructive operations
3. **Observability**: Log all operations with timestamps
4. **Resilience**: Implement retries with exponential backoff
5. **Documentation**: Include examples in help text

## Common Pitfalls to Avoid

- ❌ Not implementing dry-run mode
- ❌ Missing rollback capability
- ❌ Unclear error messages
- ❌ Not validating configuration before execution
- ❌ Hardcoding configuration values

## References

- [Cobra CLI Framework](https://github.com/spf13/cobra)
- [The Twelve-Factor App](https://12factor.net/)
- [Infrastructure as Code Principles](https://www.hashicorp.com/resources/what-is-infrastructure-as-code)

