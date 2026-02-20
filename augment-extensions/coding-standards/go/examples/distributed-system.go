// Package main demonstrates a distributed system in Go with consensus,
// event sourcing, and distributed caching patterns.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

// Event represents an immutable event in the system
type Event struct {
	ID          string            `json:"id"`
	AggregateID string            `json:"aggregate_id"`
	Type        string            `json:"type"`
	Data        json.RawMessage   `json:"data"`
	Metadata    map[string]string `json:"metadata"`
	Timestamp   time.Time         `json:"timestamp"`
	Version     int               `json:"version"`
}

// EventStore interface for event persistence
type EventStore interface {
	Save(ctx context.Context, events []Event) error
	Load(ctx context.Context, aggregateID string) ([]Event, error)
}

// CacheManager handles distributed caching operations
type CacheManager struct {
	client *redis.Client
}

// NewCacheManager creates a new cache manager
func NewCacheManager(addr string) *CacheManager {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
	})

	return &CacheManager{client: client}
}

// Get retrieves a value from cache
func (cm *CacheManager) Get(ctx context.Context, key string) (string, error) {
	return cm.client.Get(ctx, key).Result()
}

// Set stores a value in cache with TTL
func (cm *CacheManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return cm.client.Set(ctx, key, value, ttl).Err()
}

// Delete removes a value from cache
func (cm *CacheManager) Delete(ctx context.Context, key string) error {
	return cm.client.Del(ctx, key).Err()
}

// GetMultiple retrieves multiple values using pipelining
func (cm *CacheManager) GetMultiple(ctx context.Context, keys []string) (map[string]string, error) {
	pipe := cm.client.Pipeline()

	cmds := make(map[string]*redis.StringCmd)
	for _, key := range keys {
		cmds[key] = pipe.Get(ctx, key)
	}

	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return nil, err
	}

	results := make(map[string]string)
	for key, cmd := range cmds {
		val, err := cmd.Result()
		if err == redis.Nil {
			continue
		}
		if err != nil {
			return nil, err
		}
		results[key] = val
	}

	return results, nil
}

// User aggregate root
type User struct {
	ID      string
	Email   string
	Name    string
	Version int
	changes []Event
}

// NewUser creates a new user
func NewUser(id, email, name string) *User {
	return &User{
		ID:      id,
		Email:   email,
		Name:    name,
		Version: 0,
		changes: []Event{},
	}
}

// ApplyEvent applies an event to the user aggregate
func (u *User) ApplyEvent(event Event) error {
	switch event.Type {
	case "UserCreated":
		var data struct {
			Email string `json:"email"`
			Name  string `json:"name"`
		}
		if err := json.Unmarshal(event.Data, &data); err != nil {
			return err
		}
		u.Email = data.Email
		u.Name = data.Name

	case "UserEmailChanged":
		var data struct {
			NewEmail string `json:"new_email"`
		}
		if err := json.Unmarshal(event.Data, &data); err != nil {
			return err
		}
		u.Email = data.NewEmail
	}

	u.Version = event.Version
	return nil
}

// ChangeEmail changes the user's email
func (u *User) ChangeEmail(newEmail string) error {
	if newEmail == u.Email {
		return fmt.Errorf("email unchanged")
	}

	data, err := json.Marshal(map[string]string{
		"old_email": u.Email,
		"new_email": newEmail,
	})
	if err != nil {
		return err
	}

	event := Event{
		ID:          uuid.New().String(),
		AggregateID: u.ID,
		Type:        "UserEmailChanged",
		Data:        data,
		Timestamp:   time.Now(),
		Version:     u.Version + 1,
	}

	u.changes = append(u.changes, event)
	return u.ApplyEvent(event)
}

// GetUncommittedChanges returns uncommitted events
func (u *User) GetUncommittedChanges() []Event {
	return u.changes
}

// MarkChangesAsCommitted clears uncommitted changes
func (u *User) MarkChangesAsCommitted() {
	u.changes = nil
}

// DistributedService demonstrates distributed system patterns
type DistributedService struct {
	cache      *CacheManager
	eventStore EventStore
}

// NewDistributedService creates a new distributed service
func NewDistributedService(cache *CacheManager, eventStore EventStore) *DistributedService {
	return &DistributedService{
		cache:      cache,
		eventStore: eventStore,
	}
}

// GetUserWithCache retrieves user with cache-aside pattern
func (ds *DistributedService) GetUserWithCache(ctx context.Context, userID string) (*User, error) {
	// Try cache first
	cacheKey := fmt.Sprintf("user:%s", userID)
	cached, err := ds.cache.Get(ctx, cacheKey)
	if err == nil {
		var user User
		if err := json.Unmarshal([]byte(cached), &user); err == nil {
			log.Printf("Cache hit for user %s", userID)
			return &user, nil
		}
	}

	// Cache miss - load from event store
	log.Printf("Cache miss for user %s, loading from event store", userID)
	events, err := ds.eventStore.Load(ctx, userID)
	if err != nil {
		return nil, err
	}

	user := &User{ID: userID}
	for _, event := range events {
		if err := user.ApplyEvent(event); err != nil {
			return nil, err
		}
	}

	// Store in cache
	data, _ := json.Marshal(user)
	ds.cache.Set(ctx, cacheKey, data, 1*time.Hour)

	return user, nil
}

func main() {
	ctx := context.Background()

	// Initialize cache manager
	cache := NewCacheManager("localhost:6379")

	log.Println("Distributed system example started")

	// Example: Cache operations
	if err := cache.Set(ctx, "example:key", "example value", 5*time.Minute); err != nil {
		log.Printf("Failed to set cache: %v", err)
	}

	val, err := cache.Get(ctx, "example:key")
	if err != nil {
		log.Printf("Failed to get cache: %v", err)
	} else {
		log.Printf("Cache value: %s", val)
	}

	log.Println("Distributed system example completed")
}

