# Cloud Configuration Management Rules

## Overview

Best practices for managing configuration in cloud-native Go applications including environment variables, config maps, secrets, and external configuration services.

## Rules

### 1. Use Environment Variables for Configuration

**Rule**: Use environment variables for runtime configuration with sensible defaults.

**Rationale**: Environment variables are the standard way to configure cloud-native applications across different platforms.

**Good Example**:
```go
import "github.com/kelseyhightower/envconfig"

type Config struct {
    Port          int    `envconfig:"PORT" default:"8080"`
    DatabaseURL   string `envconfig:"DATABASE_URL" required:"true"`
    LogLevel      string `envconfig:"LOG_LEVEL" default:"info"`
    EnableMetrics bool   `envconfig:"ENABLE_METRICS" default:"true"`
}

func LoadConfig() (*Config, error) {
    var cfg Config
    if err := envconfig.Process("", &cfg); err != nil {
        return nil, fmt.Errorf("failed to load config: %w", err)
    }
    return &cfg, nil
}
```

### 2. Never Hardcode Secrets

**Rule**: Load secrets from environment variables or secret management systems, never hardcode them.

**Good Example**:
```go
type DatabaseConfig struct {
    Host     string `envconfig:"DB_HOST" required:"true"`
    Port     int    `envconfig:"DB_PORT" default:"5432"`
    User     string `envconfig:"DB_USER" required:"true"`
    Password string `envconfig:"DB_PASSWORD" required:"true"` // From secret
    Database string `envconfig:"DB_NAME" required:"true"`
}

func ConnectDatabase(cfg *DatabaseConfig) (*sql.DB, error) {
    dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=require",
        cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Database)
    
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }
    
    return db, nil
}
```

### 3. Support Multiple Configuration Sources

**Rule**: Support loading configuration from multiple sources with proper precedence.

**Good Example**:
```go
import "github.com/spf13/viper"

func LoadConfigWithViper() (*Config, error) {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath("/etc/myapp/")
    viper.AddConfigPath("$HOME/.myapp")
    viper.AddConfigPath(".")
    
    // Environment variables take precedence
    viper.AutomaticEnv()
    viper.SetEnvPrefix("MYAPP")
    
    if err := viper.ReadInConfig(); err != nil {
        if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
            return nil, fmt.Errorf("failed to read config: %w", err)
        }
        // Config file not found; using env vars and defaults
    }
    
    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("failed to unmarshal config: %w", err)
    }
    
    return &cfg, nil
}
```

### 4. Validate Configuration on Startup

**Rule**: Validate all required configuration values on application startup.

**Good Example**:
```go
func (c *Config) Validate() error {
    if c.Port < 1 || c.Port > 65535 {
        return fmt.Errorf("invalid port: %d", c.Port)
    }
    
    if c.DatabaseURL == "" {
        return fmt.Errorf("DATABASE_URL is required")
    }
    
    validLogLevels := map[string]bool{
        "debug": true, "info": true, "warn": true, "error": true,
    }
    if !validLogLevels[c.LogLevel] {
        return fmt.Errorf("invalid log level: %s", c.LogLevel)
    }
    
    return nil
}

func main() {
    cfg, err := LoadConfig()
    if err != nil {
        log.Fatalf("Failed to load config: %v", err)
    }
    
    if err := cfg.Validate(); err != nil {
        log.Fatalf("Invalid configuration: %v", err)
    }
    
    // Start application
}
```

### 5. Support Hot Reloading for Non-Critical Config

**Rule**: Implement hot reloading for configuration that can be changed without restart.

**Good Example**:
```go
type ConfigManager struct {
    mu     sync.RWMutex
    config *Config
}

func (cm *ConfigManager) Get() *Config {
    cm.mu.RLock()
    defer cm.mu.RUnlock()
    return cm.config
}

func (cm *ConfigManager) Reload() error {
    newConfig, err := LoadConfig()
    if err != nil {
        return fmt.Errorf("failed to reload config: %w", err)
    }
    
    if err := newConfig.Validate(); err != nil {
        return fmt.Errorf("invalid config: %w", err)
    }
    
    cm.mu.Lock()
    cm.config = newConfig
    cm.mu.Unlock()
    
    log.Println("Configuration reloaded successfully")
    return nil
}

func (cm *ConfigManager) WatchForChanges(ctx context.Context) {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            if err := cm.Reload(); err != nil {
                log.Printf("Failed to reload config: %v", err)
            }
        }
    }
}
```

## References

- [The Twelve-Factor App - Config](https://12factor.net/config)
- [Viper Configuration Library](https://github.com/spf13/viper)
- [Envconfig](https://github.com/kelseyhightower/envconfig)

