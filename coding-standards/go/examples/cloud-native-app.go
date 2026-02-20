// Package main demonstrates a cloud-native Go application with Kubernetes integration,
// configuration management, health checks, and graceful shutdown.
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/kelseyhightower/envconfig"
	_ "github.com/lib/pq"
)

// Config holds application configuration loaded from environment variables
type Config struct {
	Port        int    `envconfig:"PORT" default:"8080"`
	DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`
	LogLevel    string `envconfig:"LOG_LEVEL" default:"info"`
}

// HealthChecker manages health check functions
type HealthChecker struct {
	checks map[string]func(context.Context) error
}

// NewHealthChecker creates a new health checker
func NewHealthChecker() *HealthChecker {
	return &HealthChecker{
		checks: make(map[string]func(context.Context) error),
	}
}

// AddCheck adds a named health check function
func (hc *HealthChecker) AddCheck(name string, check func(context.Context) error) {
	hc.checks[name] = check
}

// Check runs all health checks and returns results
func (hc *HealthChecker) Check(ctx context.Context) (map[string]string, error) {
	results := make(map[string]string)
	var hasError bool

	for name, check := range hc.checks {
		checkCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		defer cancel()

		if err := check(checkCtx); err != nil {
			results[name] = fmt.Sprintf("FAIL: %v", err)
			hasError = true
		} else {
			results[name] = "OK"
		}
	}

	if hasError {
		return results, fmt.Errorf("health check failed")
	}

	return results, nil
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status     string            `json:"status"`
	Timestamp  time.Time         `json:"timestamp"`
	Components map[string]string `json:"components,omitempty"`
}

// Application holds the application state
type Application struct {
	config  *Config
	db      *sql.DB
	server  *http.Server
	checker *HealthChecker
}

// NewApplication creates a new application instance
func NewApplication(cfg *Config) (*Application, error) {
	// Connect to database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	app := &Application{
		config:  cfg,
		db:      db,
		checker: NewHealthChecker(),
	}

	// Add health checks
	app.checker.AddCheck("database", func(ctx context.Context) error {
		return db.PingContext(ctx)
	})

	return app, nil
}

// healthHandler handles liveness probe requests
func (app *Application) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

// readinessHandler handles readiness probe requests
func (app *Application) readinessHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	components, err := app.checker.Check(ctx)

	response := HealthResponse{
		Timestamp:  time.Now(),
		Components: components,
	}

	if err != nil {
		response.Status = "unhealthy"
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		response.Status = "healthy"
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Start starts the HTTP server
func (app *Application) Start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", app.healthHandler)
	mux.HandleFunc("/ready", app.readinessHandler)

	app.server = &http.Server{
		Addr:         fmt.Sprintf(":%d", app.config.Port),
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting server on port %d", app.config.Port)
	return app.server.ListenAndServe()
}

// Shutdown gracefully shuts down the application
func (app *Application) Shutdown(ctx context.Context) error {
	log.Println("Shutting down gracefully...")

	// Shutdown HTTP server
	if err := app.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	// Close database connection
	if err := app.db.Close(); err != nil {
		return fmt.Errorf("database close failed: %w", err)
	}

	log.Println("Shutdown complete")
	return nil
}

func main() {
	// Load configuration
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Create application
	app, err := NewApplication(&cfg)
	if err != nil {
		log.Fatalf("Failed to create application: %v", err)
	}

	// Start server in goroutine
	go func() {
		if err := app.Start(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := app.Shutdown(ctx); err != nil {
		log.Fatalf("Shutdown failed: %v", err)
	}
}

