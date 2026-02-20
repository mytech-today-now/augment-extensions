# DevOps Automation Rules

## Overview

Best practices for building DevOps automation tools in Go including CLI tools, deployment automation, and infrastructure management.

## Rules

### 1. Use Cobra for CLI Applications

**Rule**: Use Cobra framework for building command-line tools with subcommands.

**Good Example**:
```go
import "github.com/spf13/cobra"

var rootCmd = &cobra.Command{
    Use:   "devops-tool",
    Short: "A DevOps automation tool",
    Long:  `A comprehensive DevOps automation tool for deployment and infrastructure management.`,
}

var deployCmd = &cobra.Command{
    Use:   "deploy [environment]",
    Short: "Deploy application to environment",
    Args:  cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        environment := args[0]
        return deployToEnvironment(environment)
    },
}

func init() {
    deployCmd.Flags().StringP("version", "v", "latest", "Version to deploy")
    deployCmd.Flags().BoolP("dry-run", "d", false, "Perform dry run")
    rootCmd.AddCommand(deployCmd)
}
```

### 2. Implement Idempotent Operations

**Rule**: All automation operations should be idempotent and safe to retry.

**Good Example**:
```go
func EnsureDeployment(ctx context.Context, config *DeploymentConfig) error {
    // Check if deployment already exists
    existing, err := getDeployment(ctx, config.Name)
    if err != nil && !isNotFoundError(err) {
        return err
    }
    
    if existing != nil {
        // Update existing deployment
        if deploymentMatches(existing, config) {
            log.Printf("Deployment %s already up to date", config.Name)
            return nil
        }
        return updateDeployment(ctx, config)
    }
    
    // Create new deployment
    return createDeployment(ctx, config)
}
```

### 3. Provide Detailed Progress Feedback

**Rule**: Show progress for long-running operations with clear status updates.

**Good Example**:
```go
import "github.com/schollz/progressbar/v3"

func DeployWithProgress(ctx context.Context, steps []DeploymentStep) error {
    bar := progressbar.NewOptions(len(steps),
        progressbar.OptionSetDescription("Deploying..."),
        progressbar.OptionShowCount(),
        progressbar.OptionSetWidth(40),
    )
    
    for i, step := range steps {
        bar.Describe(step.Description)
        
        if err := step.Execute(ctx); err != nil {
            return fmt.Errorf("step %d failed: %w", i+1, err)
        }
        
        bar.Add(1)
    }
    
    return nil
}
```

### 4. Support Dry-Run Mode

**Rule**: Implement dry-run mode for all destructive operations.

**Good Example**:
```go
type DeploymentOptions struct {
    DryRun  bool
    Verbose bool
}

func Deploy(ctx context.Context, config *DeploymentConfig, opts *DeploymentOptions) error {
    steps := []DeploymentStep{
        {Name: "Validate config", Fn: validateConfig},
        {Name: "Build image", Fn: buildImage},
        {Name: "Push image", Fn: pushImage},
        {Name: "Update deployment", Fn: updateDeployment},
    }
    
    for _, step := range steps {
        if opts.Verbose {
            log.Printf("Executing: %s", step.Name)
        }
        
        if opts.DryRun {
            log.Printf("[DRY RUN] Would execute: %s", step.Name)
            continue
        }
        
        if err := step.Fn(ctx, config); err != nil {
            return fmt.Errorf("%s failed: %w", step.Name, err)
        }
    }
    
    return nil
}
```

### 5. Implement Rollback Capability

**Rule**: Provide rollback functionality for failed deployments.

**Good Example**:
```go
type DeploymentHistory struct {
    Deployments []DeploymentRecord
}

type DeploymentRecord struct {
    Version   string
    Timestamp time.Time
    Config    *DeploymentConfig
}

func DeployWithRollback(ctx context.Context, config *DeploymentConfig) error {
    // Save current state
    currentState, err := captureCurrentState(ctx)
    if err != nil {
        return err
    }
    
    // Attempt deployment
    if err := deploy(ctx, config); err != nil {
        log.Printf("Deployment failed: %v, rolling back...", err)
        
        if rollbackErr := rollback(ctx, currentState); rollbackErr != nil {
            return fmt.Errorf("deployment failed and rollback failed: %v, %v", err, rollbackErr)
        }
        
        return fmt.Errorf("deployment failed (rolled back): %w", err)
    }
    
    // Save successful deployment to history
    saveDeploymentHistory(ctx, config)
    
    return nil
}
```

## References

- [Cobra CLI Framework](https://github.com/spf13/cobra)
- [The Twelve-Factor App](https://12factor.net/)

