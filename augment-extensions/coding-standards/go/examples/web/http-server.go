// Package main demonstrates a production-ready HTTP server with best practices
package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// User represents a user in the system
type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// UserService handles user operations
type UserService struct {
	logger *slog.Logger
	users  map[int64]*User // In-memory store for demo
	nextID int64
}

// NewUserService creates a new user service
func NewUserService(logger *slog.Logger) *UserService {
	return &UserService{
		logger: logger,
		users:  make(map[int64]*User),
		nextID: 1,
	}
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(ctx context.Context, id int64) (*User, error) {
	user, ok := s.users[id]
	if !ok {
		return nil, errors.New("user not found")
	}
	return user, nil
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, name, email string) (*User, error) {
	user := &User{
		ID:        s.nextID,
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
	}
	s.users[s.nextID] = user
	s.nextID++
	return user, nil
}

// Server represents the HTTP server
type Server struct {
	http        *http.Server
	userService *UserService
	logger      *slog.Logger
}

// NewServer creates a new HTTP server
func NewServer(addr string, logger *slog.Logger) *Server {
	userService := NewUserService(logger)
	
	s := &Server{
		userService: userService,
		logger:      logger,
	}
	
	s.http = &http.Server{
		Addr:         addr,
		Handler:      s.routes(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	
	return s
}

// routes sets up the HTTP routes
func (s *Server) routes() http.Handler {
	r := chi.NewRouter()
	
	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	
	// Health check
	r.Get("/health", s.handleHealth)
	
	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/users", func(r chi.Router) {
			r.Get("/{id}", s.handleGetUser)
			r.Post("/", s.handleCreateUser)
		})
	})
	
	return r
}

// handleHealth handles health check requests
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

// handleGetUser handles GET /api/v1/users/{id}
func (s *Server) handleGetUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract and validate ID
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	
	// Get user
	user, err := s.userService.GetUser(ctx, id)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	// Return user
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

// handleCreateUser handles POST /api/v1/users
func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Parse request body
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Validate input
	if req.Name == "" || req.Email == "" {
		http.Error(w, "Name and email are required", http.StatusBadRequest)
		return
	}
	
	// Create user
	user, err := s.userService.CreateUser(ctx, req.Name, req.Email)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}
	
	// Return created user
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
	s.logger.Info("Starting graceful shutdown")
	return s.http.Shutdown(ctx)
}

func main() {
	// Create logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	
	// Create server
	srv := NewServer(":8080", logger)
	
	// Start server in goroutine
	go func() {
		logger.Info("Server starting", "addr", srv.http.Addr)
		if err := srv.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("Server failed", "error", err)
			os.Exit(1)
		}
	}()
	
	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	logger.Info("Shutdown signal received")
	
	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("Shutdown error", "error", err)
		os.Exit(1)
	}
	
	logger.Info("Server stopped")
}

