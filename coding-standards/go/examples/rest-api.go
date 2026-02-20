// Package main demonstrates a REST API in Go with versioning, rate limiting,
// pagination, and proper error handling.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"golang.org/x/time/rate"
)

// User represents a user entity
type User struct {
	ID        string    `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// ErrorResponse represents an API error
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalItems int         `json:"total_items"`
	TotalPages int         `json:"total_pages"`
}

// RateLimiter manages rate limiting
type RateLimiter struct {
	limiters map[string]*rate.Limiter
	rate     rate.Limit
	burst    int
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(r rate.Limit, b int) *RateLimiter {
	return &RateLimiter{
		limiters: make(map[string]*rate.Limiter),
		rate:     r,
		burst:    b,
	}
}

// GetLimiter returns a limiter for the given key
func (rl *RateLimiter) GetLimiter(key string) *rate.Limiter {
	limiter, exists := rl.limiters[key]
	if !exists {
		limiter = rate.NewLimiter(rl.rate, rl.burst)
		rl.limiters[key] = limiter
	}
	return limiter
}

// API represents the REST API server
type API struct {
	router      *mux.Router
	rateLimiter *RateLimiter
	users       map[string]*User // In-memory store for demo
}

// NewAPI creates a new API instance
func NewAPI() *API {
	api := &API{
		router:      mux.NewRouter(),
		rateLimiter: NewRateLimiter(rate.Limit(10), 20),
		users:       make(map[string]*User),
	}

	api.setupRoutes()
	return api
}

// setupRoutes configures API routes
func (api *API) setupRoutes() {
	// Apply middleware
	api.router.Use(api.rateLimitMiddleware)
	api.router.Use(api.loggingMiddleware)

	// V1 routes
	v1 := api.router.PathPrefix("/api/v1").Subrouter()
	v1.HandleFunc("/users", api.listUsersV1).Methods("GET")
	v1.HandleFunc("/users", api.createUserV1).Methods("POST")
	v1.HandleFunc("/users/{id}", api.getUserV1).Methods("GET")
	v1.HandleFunc("/users/{id}", api.updateUserV1).Methods("PUT")
	v1.HandleFunc("/users/{id}", api.deleteUserV1).Methods("DELETE")
}

// rateLimitMiddleware implements rate limiting
func (api *API) rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.RemoteAddr
		limiter := api.rateLimiter.GetLimiter(key)

		if !limiter.Allow() {
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", api.rateLimiter.burst))
			w.Header().Set("X-RateLimit-Remaining", "0")
			w.Header().Set("Retry-After", "60")

			api.writeError(w, http.StatusTooManyRequests, "Rate limit exceeded")
			return
		}

		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", api.rateLimiter.burst))
		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs requests
func (api *API) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("Completed in %v", time.Since(start))
	})
}

// listUsersV1 handles GET /api/v1/users
func (api *API) listUsersV1(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// Convert map to slice
	users := make([]*User, 0, len(api.users))
	for _, user := range api.users {
		users = append(users, user)
	}

	// Simple pagination
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(users) {
		start = len(users)
	}
	if end > len(users) {
		end = len(users)
	}

	response := PaginatedResponse{
		Data:       users[start:end],
		Page:       page,
		PageSize:   pageSize,
		TotalItems: len(users),
		TotalPages: (len(users) + pageSize - 1) / pageSize,
	}

	api.writeJSON(w, http.StatusOK, response)
}

// createUserV1 handles POST /api/v1/users
func (api *API) createUserV1(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		api.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user.ID = fmt.Sprintf("user-%d", len(api.users)+1)
	user.CreatedAt = time.Now()

	api.users[user.ID] = &user

	api.writeJSON(w, http.StatusCreated, user)
}

// getUserV1 handles GET /api/v1/users/{id}
func (api *API) getUserV1(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	user, exists := api.users[id]
	if !exists {
		api.writeError(w, http.StatusNotFound, "User not found")
		return
	}

	api.writeJSON(w, http.StatusOK, user)
}

// updateUserV1 handles PUT /api/v1/users/{id}
func (api *API) updateUserV1(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if _, exists := api.users[id]; !exists {
		api.writeError(w, http.StatusNotFound, "User not found")
		return
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		api.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user.ID = id
	api.users[id] = &user

	api.writeJSON(w, http.StatusOK, user)
}

// deleteUserV1 handles DELETE /api/v1/users/{id}
func (api *API) deleteUserV1(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if _, exists := api.users[id]; !exists {
		api.writeError(w, http.StatusNotFound, "User not found")
		return
	}

	delete(api.users, id)
	w.WriteHeader(http.StatusNoContent)
}

// writeJSON writes a JSON response
func (api *API) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// writeError writes an error response
func (api *API) writeError(w http.ResponseWriter, status int, message string) {
	response := ErrorResponse{
		Error:   http.StatusText(status),
		Message: message,
	}
	api.writeJSON(w, status, response)
}

func main() {
	api := NewAPI()

	server := &http.Server{
		Addr:         ":8080",
		Handler:      api.router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("Starting REST API server on :8080")
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

