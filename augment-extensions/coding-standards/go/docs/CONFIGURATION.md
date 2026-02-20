# Configuration Guide

## Overview

The Go Coding Standards module supports flexible configuration to match your project's needs. You can select specific categories, enable/disable rules, and configure static analysis tools.

## Configuration File

Create a `.augment/go-config.json` file in your project root:

```json
{
  "categories": ["web", "api"],
  "rules": {
    "enabled": true,
    "severity": "error"
  },
  "staticAnalysis": {
    "golangci-lint": true,
    "staticcheck": true,
    "govet": true,
    "gosec": true
  }
}
```

## Configuration Options

### Categories

Select one or more project categories:

- **`web`** - Web services and HTTP servers
- **`microservices`** - gRPC services and microservices
- **`cli`** - Command-line tools and utilities
- **`cloud`** - Cloud-native applications (Kubernetes, etc.)
- **distributed`** - Distributed systems and event-driven architectures
- **`devops`** - DevOps tooling and automation
- **`api`** - REST and GraphQL API development

**Example:**
```json
{
  "categories": ["web", "api"]
}
```

### Rules Configuration

Control rule enforcement:

```json
{
  "rules": {
    "enabled": true,
    "severity": "error"
  }
}
```

**Options:**
- `enabled` (boolean): Enable/disable all rules
- `severity` (string): Default severity level (`error`, `warning`, `info`)

### Static Analysis Tools

Configure which tools to use:

```json
{
  "staticAnalysis": {
    "golangci-lint": true,
    "staticcheck": true,
    "govet": true,
    "gosec": true
  }
}
```

## Category-Specific Configuration

### Web Services

```json
{
  "categories": ["web"],
  "web": {
    "framework": "standard-library",
    "middleware": ["logging", "recovery", "cors"],
    "gracefulShutdown": true
  }
}
```

### Microservices

```json
{
  "categories": ["microservices"],
  "microservices": {
    "protocol": "grpc",
    "serviceDiscovery": "consul",
    "tracing": "jaeger",
    "metrics": "prometheus"
  }
}
```

### CLI Tools

```json
{
  "categories": ["cli"],
  "cli": {
    "framework": "cobra",
    "configuration": "viper",
    "crossPlatform": true
  }
}
```

## Environment-Specific Configuration

### Development

```json
{
  "categories": ["web"],
  "rules": {
    "severity": "warning"
  },
  "staticAnalysis": {
    "golangci-lint": true
  }
}
```

### Production

```json
{
  "categories": ["web", "api"],
  "rules": {
    "severity": "error"
  },
  "staticAnalysis": {
    "golangci-lint": true,
    "staticcheck": true,
    "govet": true,
    "gosec": true
  }
}
```

## Configuration Schema

See `config/schema.json` for the complete JSON Schema definition.

## Configuration Examples

See `config/examples/` for complete configuration examples:

- `web-service.json` - Web service configuration
- `microservice.json` - Microservice configuration
- `cli-tool.json` - CLI tool configuration
- `multi-category.json` - Multiple categories

## Validation

Validate your configuration:

```bash
# Using JSON Schema validator
ajv validate -s config/schema.json -d .augment/go-config.json
```

## Troubleshooting

### Configuration Not Loading

1. Check file location: `.augment/go-config.json`
2. Validate JSON syntax
3. Verify category names match exactly
4. Check file permissions

### Rules Not Applying

1. Ensure `rules.enabled` is `true`
2. Check category selection
3. Verify rule files exist in `rules/` directory
4. Check severity level

## Next Steps

- See [CATEGORIES.md](./CATEGORIES.md) for category details
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- See [README.md](../README.md) for module overview

