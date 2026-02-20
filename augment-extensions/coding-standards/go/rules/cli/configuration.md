# Go CLI Tools - Configuration Management

## Overview

Configuration management enables CLI tools to be customized through config files, environment variables, and command-line flags. This document defines best practices using Viper.

## Core Principles

1. **Precedence**: Flags > Environment Variables > Config File > Defaults
2. **Multiple Formats**: Support YAML, JSON, TOML config files
3. **Environment Variables**: Use consistent naming conventions
4. **Validation**: Validate configuration on load
5. **Documentation**: Document all configuration options

## Rules

### GOL.3.3.2.1: Use Viper for Configuration

**Rule**: Use Viper library for configuration management.

**Severity**: WARNING

**Rationale**: Viper provides unified configuration from multiple sources with proper precedence.

**✅ Good**:
```go
import (
    "github.com/spf13/viper"
)

func initConfig() error {
    // Set config file name and paths
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath(".")
    viper.AddConfigPath("$HOME/.myapp")
    viper.AddConfigPath("/etc/myapp")
    
    // Set defaults
    viper.SetDefault("server.port", 8080)
    viper.SetDefault("server.host", "localhost")
    viper.SetDefault("log.level", "info")
    
    // Read config file
    if err := viper.ReadInConfig(); err != nil {
        if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
            return err
        }
        // Config file not found; using defaults
    }
    
    return nil
}
```

### GOL.3.3.2.2: Support Environment Variables

**Rule**: Support environment variables with consistent naming (uppercase, underscore-separated).

**Severity**: WARNING

**Rationale**: Environment variables enable configuration in containerized environments.

**✅ Good**:
```go
func initConfig() error {
    // Bind environment variables
    viper.SetEnvPrefix("MYAPP")
    viper.AutomaticEnv()
    
    // Replace dots with underscores in env vars
    viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
    
    // Now these work:
    // MYAPP_SERVER_PORT=9000
    // MYAPP_LOG_LEVEL=debug
    
    return viper.ReadInConfig()
}

// Usage:
// export MYAPP_SERVER_PORT=9000
// export MYAPP_LOG_LEVEL=debug
// myapp serve
```

### GOL.3.3.2.3: Implement Configuration Precedence

**Rule**: Follow standard precedence: Flags > Env Vars > Config File > Defaults.

**Severity**: ERROR

**Rationale**: Predictable precedence enables flexible configuration.

**✅ Good**:
```go
var (
    cfgFile string
    port    int
)

func init() {
    cobra.OnInitialize(initConfig)
    
    // Config file flag
    rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.myapp.yaml)")
    
    // Port flag
    rootCmd.PersistentFlags().IntVar(&port, "port", 0, "server port")
    viper.BindPFlag("server.port", rootCmd.PersistentFlags().Lookup("port"))
}

func initConfig() {
    if cfgFile != "" {
        viper.SetConfigFile(cfgFile)
    } else {
        viper.AddConfigPath("$HOME")
        viper.SetConfigName(".myapp")
    }
    
    viper.SetEnvPrefix("MYAPP")
    viper.AutomaticEnv()
    
    // Set defaults
    viper.SetDefault("server.port", 8080)
    
    viper.ReadInConfig()
}

// Precedence:
// 1. --port 9000 (flag)
// 2. MYAPP_SERVER_PORT=9000 (env var)
// 3. server.port: 9000 (config file)
// 4. 8080 (default)
```

### GOL.3.3.2.4: Validate Configuration

**Rule**: Validate configuration after loading and provide clear error messages.

**Severity**: ERROR

**Rationale**: Early validation prevents runtime errors.

**✅ Good**:
```go
type Config struct {
    Server ServerConfig `mapstructure:"server"`
    Log    LogConfig    `mapstructure:"log"`
}

type ServerConfig struct {
    Host string `mapstructure:"host"`
    Port int    `mapstructure:"port"`
}

type LogConfig struct {
    Level  string `mapstructure:"level"`
    Format string `mapstructure:"format"`
}

func loadConfig() (*Config, error) {
    var cfg Config
    
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("failed to unmarshal config: %w", err)
    }
    
    // Validate
    if err := validateConfig(&cfg); err != nil {
        return nil, err
    }
    
    return &cfg, nil
}

func validateConfig(cfg *Config) error {
    if cfg.Server.Port < 1 || cfg.Server.Port > 65535 {
        return fmt.Errorf("invalid port: %d (must be 1-65535)", cfg.Server.Port)
    }
    
    validLevels := map[string]bool{"debug": true, "info": true, "warn": true, "error": true}
    if !validLevels[cfg.Log.Level] {
        return fmt.Errorf("invalid log level: %s", cfg.Log.Level)
    }
    
    return nil
}
```

### GOL.3.3.2.5: Support Multiple Config Formats

**Rule**: Support YAML, JSON, and TOML configuration files.

**Severity**: INFO

**✅ Good**:
```go
func initConfig() error {
    viper.SetConfigName("config")
    
    // Viper automatically detects format by extension
    viper.AddConfigPath(".")
    
    // Supports:
    // config.yaml
    // config.json
    // config.toml
    
    return viper.ReadInConfig()
}
```

**Example config.yaml**:
```yaml
server:
  host: localhost
  port: 8080
  
log:
  level: info
  format: json
  
database:
  host: localhost
  port: 5432
  name: myapp
```

### GOL.3.3.2.6: Provide Config File Generation

**Rule**: Provide command to generate sample configuration file.

**Severity**: INFO

**✅ Good**:
```go
var configInitCmd = &cobra.Command{
    Use:   "init-config",
    Short: "Generate sample configuration file",
    RunE: func(cmd *cobra.Command, args []string) error {
        configPath := viper.ConfigFileUsed()
        if configPath == "" {
            configPath = "$HOME/.myapp.yaml"
        }
        
        // Set default values
        viper.SetDefault("server.host", "localhost")
        viper.SetDefault("server.port", 8080)
        viper.SetDefault("log.level", "info")
        
        // Write config file
        if err := viper.SafeWriteConfigAs(configPath); err != nil {
            return fmt.Errorf("failed to write config: %w", err)
        }
        
        fmt.Printf("Configuration file created: %s\n", configPath)
        return nil
    },
}
```

## References

- [Viper Documentation](https://github.com/spf13/viper)
- [12-Factor App Config](https://12factor.net/config)
- [Configuration Best Practices](https://blog.gopheracademy.com/advent-2014/configuration-with-fangs/)

