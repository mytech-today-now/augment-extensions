# CI/CD Integration Rules

## Overview

Best practices for integrating Go applications with CI/CD pipelines including GitHub Actions, GitLab CI, and Jenkins.

## Rules

### 1. Provide Exit Codes for CI/CD

**Rule**: Return appropriate exit codes for CI/CD pipeline integration.

**Good Example**:
```go
func main() {
    if err := run(); err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        
        // Return specific exit codes
        switch err.(type) {
        case *ValidationError:
            os.Exit(2) // Configuration error
        case *DeploymentError:
            os.Exit(3) // Deployment error
        default:
            os.Exit(1) // General error
        }
    }
    
    os.Exit(0) // Success
}
```

### 2. Support Environment-Based Configuration

**Rule**: Configure behavior through environment variables for CI/CD compatibility.

**Good Example**:
```go
type CIConfig struct {
    CI            bool   `envconfig:"CI" default:"false"`
    Branch        string `envconfig:"CI_COMMIT_BRANCH"`
    CommitSHA     string `envconfig:"CI_COMMIT_SHA"`
    PipelineID    string `envconfig:"CI_PIPELINE_ID"`
    BuildNumber   string `envconfig:"BUILD_NUMBER"`
    ArtifactPath  string `envconfig:"ARTIFACT_PATH" default:"./artifacts"`
}

func LoadCIConfig() (*CIConfig, error) {
    var cfg CIConfig
    if err := envconfig.Process("", &cfg); err != nil {
        return nil, err
    }
    return &cfg, nil
}
```

### 3. Generate Machine-Readable Output

**Rule**: Support JSON output for CI/CD pipeline consumption.

**Good Example**:
```go
type TestResult struct {
    Status   string        `json:"status"`
    Duration time.Duration `json:"duration"`
    Tests    []TestCase    `json:"tests"`
    Coverage float64       `json:"coverage"`
}

func RunTests(outputFormat string) error {
    result := executeTests()
    
    switch outputFormat {
    case "json":
        return json.NewEncoder(os.Stdout).Encode(result)
    case "junit":
        return writeJUnitXML(result)
    default:
        return writeHumanReadable(result)
    }
}
```

### 4. Implement Artifact Publishing

**Rule**: Publish build artifacts with proper versioning and metadata.

**Good Example**:
```go
type Artifact struct {
    Name     string            `json:"name"`
    Version  string            `json:"version"`
    Path     string            `json:"path"`
    Checksum string            `json:"checksum"`
    Metadata map[string]string `json:"metadata"`
}

func PublishArtifact(ctx context.Context, artifact *Artifact) error {
    // Calculate checksum
    checksum, err := calculateSHA256(artifact.Path)
    if err != nil {
        return err
    }
    artifact.Checksum = checksum
    
    // Add build metadata
    artifact.Metadata = map[string]string{
        "build_time":   time.Now().Format(time.RFC3339),
        "commit_sha":   os.Getenv("CI_COMMIT_SHA"),
        "pipeline_id":  os.Getenv("CI_PIPELINE_ID"),
    }
    
    // Upload to artifact repository
    return uploadArtifact(ctx, artifact)
}
```

### 5. Implement Health Checks for Deployment Verification

**Rule**: Provide health check endpoints for deployment verification in CI/CD.

**Good Example**:
```go
func WaitForDeployment(ctx context.Context, url string, timeout time.Duration) error {
    deadline := time.Now().Add(timeout)
    
    for time.Now().Before(deadline) {
        resp, err := http.Get(url + "/health")
        if err == nil && resp.StatusCode == http.StatusOK {
            log.Println("Deployment healthy")
            return nil
        }
        
        log.Printf("Waiting for deployment... (status: %v)", err)
        time.Sleep(5 * time.Second)
    }
    
    return fmt.Errorf("deployment did not become healthy within %v", timeout)
}
```

## References

- [GitHub Actions](https://docs.github.com/en/actions)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)

