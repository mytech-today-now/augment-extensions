# Infrastructure as Code Rules

## Overview

Best practices for implementing Infrastructure as Code (IaC) tools in Go including Terraform providers, Pulumi programs, and custom IaC solutions.

## Rules

### 1. Implement Declarative Configuration

**Rule**: Use declarative configuration for infrastructure definitions.

**Good Example**:
```go
type InfrastructureConfig struct {
    Resources []Resource `yaml:"resources"`
    Variables map[string]string `yaml:"variables"`
}

type Resource struct {
    Type       string                 `yaml:"type"`
    Name       string                 `yaml:"name"`
    Properties map[string]interface{} `yaml:"properties"`
    DependsOn  []string               `yaml:"depends_on,omitempty"`
}

func LoadConfig(path string) (*InfrastructureConfig, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    
    var config InfrastructureConfig
    if err := yaml.Unmarshal(data, &config); err != nil {
        return nil, err
    }
    
    return &config, nil
}
```

### 2. Implement State Management

**Rule**: Track infrastructure state to enable updates and drift detection.

**Good Example**:
```go
type StateManager struct {
    backend StateBackend
}

type State struct {
    Version   int                    `json:"version"`
    Resources map[string]ResourceState `json:"resources"`
    Outputs   map[string]string      `json:"outputs"`
    UpdatedAt time.Time              `json:"updated_at"`
}

func (sm *StateManager) SaveState(ctx context.Context, state *State) error {
    state.UpdatedAt = time.Now()
    state.Version++
    
    data, err := json.Marshal(state)
    if err != nil {
        return err
    }
    
    return sm.backend.Write(ctx, data)
}

func (sm *StateManager) LoadState(ctx context.Context) (*State, error) {
    data, err := sm.backend.Read(ctx)
    if err != nil {
        return nil, err
    }
    
    var state State
    if err := json.Unmarshal(data, &state); err != nil {
        return nil, err
    }
    
    return &state, nil
}
```

### 3. Implement Dependency Resolution

**Rule**: Resolve resource dependencies and apply in correct order.

**Good Example**:
```go
func ResolveDependencies(resources []Resource) ([]Resource, error) {
    graph := make(map[string][]string)
    
    for _, res := range resources {
        graph[res.Name] = res.DependsOn
    }
    
    sorted, err := topologicalSort(graph)
    if err != nil {
        return nil, err
    }
    
    result := make([]Resource, 0, len(resources))
    for _, name := range sorted {
        for _, res := range resources {
            if res.Name == name {
                result = append(result, res)
                break
            }
        }
    }
    
    return result, nil
}
```

### 4. Implement Drift Detection

**Rule**: Detect configuration drift between desired and actual state.

**Good Example**:
```go
type DriftDetector struct {
    provider ResourceProvider
}

type DriftResult struct {
    Resource string
    Expected interface{}
    Actual   interface{}
    Drifted  bool
}

func (dd *DriftDetector) DetectDrift(ctx context.Context, state *State) ([]DriftResult, error) {
    var results []DriftResult
    
    for name, expected := range state.Resources {
        actual, err := dd.provider.GetResource(ctx, name)
        if err != nil {
            return nil, err
        }
        
        drifted := !reflect.DeepEqual(expected, actual)
        
        results = append(results, DriftResult{
            Resource: name,
            Expected: expected,
            Actual:   actual,
            Drifted:  drifted,
        })
    }
    
    return results, nil
}
```

### 5. Support Plan and Apply Workflow

**Rule**: Implement plan phase to preview changes before applying.

**Good Example**:
```go
type Plan struct {
    ToCreate []Resource
    ToUpdate []Resource
    ToDelete []Resource
}

func GeneratePlan(ctx context.Context, config *InfrastructureConfig, state *State) (*Plan, error) {
    plan := &Plan{}
    
    // Determine resources to create, update, or delete
    for _, res := range config.Resources {
        if existing, ok := state.Resources[res.Name]; ok {
            if !resourceMatches(res, existing) {
                plan.ToUpdate = append(plan.ToUpdate, res)
            }
        } else {
            plan.ToCreate = append(plan.ToCreate, res)
        }
    }
    
    for name := range state.Resources {
        found := false
        for _, res := range config.Resources {
            if res.Name == name {
                found = true
                break
            }
        }
        if !found {
            plan.ToDelete = append(plan.ToDelete, Resource{Name: name})
        }
    }
    
    return plan, nil
}

func ApplyPlan(ctx context.Context, plan *Plan, provider ResourceProvider) error {
    // Delete resources
    for _, res := range plan.ToDelete {
        if err := provider.DeleteResource(ctx, res.Name); err != nil {
            return err
        }
    }
    
    // Create resources
    for _, res := range plan.ToCreate {
        if err := provider.CreateResource(ctx, &res); err != nil {
            return err
        }
    }
    
    // Update resources
    for _, res := range plan.ToUpdate {
        if err := provider.UpdateResource(ctx, &res); err != nil {
            return err
        }
    }
    
    return nil
}
```

## References

- [Terraform](https://www.terraform.io/)
- [Pulumi](https://www.pulumi.com/)
- [Infrastructure as Code Principles](https://www.hashicorp.com/resources/what-is-infrastructure-as-code)

