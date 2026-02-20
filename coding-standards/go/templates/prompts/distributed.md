# Distributed Systems Go Application AI Template

## Context

You are building a distributed system in Go with consensus, event sourcing, and distributed caching capabilities.

## Key Requirements

### Consensus and Coordination
- Use HashiCorp Raft or etcd/raft for consensus
- Implement proper FSM (Finite State Machine) with deterministic apply logic
- Handle leader election and follower states correctly
- Implement read consistency levels (strong vs eventual)
- Handle network partitions gracefully with retries

### Event Sourcing
- Design immutable events with all necessary information
- Implement event store interface for persistence
- Use aggregate root pattern for consistency boundaries
- Build projections for read models (CQRS pattern)
- Support event versioning for schema evolution

### Distributed Caching
- Implement cache-aside (lazy loading) pattern
- Set appropriate TTLs on all cached items
- Handle cache failures gracefully with fallback to database
- Implement cache invalidation on data changes
- Use pipelining for batch operations

## Code Structure

```go
// Event sourcing
type Event struct {
    ID          string
    AggregateID string
    Type        string
    Data        json.RawMessage
    Timestamp   time.Time
    Version     int
}

type EventStore interface {
    Save(ctx context.Context, events []Event) error
    Load(ctx context.Context, aggregateID string) ([]Event, error)
}

// Caching
type CacheManager struct {
    client *redis.Client
}

func (cm *CacheManager) Get(ctx context.Context, key string) (string, error)
func (cm *CacheManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error
```

## Example Patterns

### Consensus with Raft
```go
func NewRaftNode(nodeID, raftDir, raftBind string) (*raft.Raft, error) {
    config := raft.DefaultConfig()
    config.LocalID = raft.ServerID(nodeID)
    
    store, _ := raftboltdb.NewBoltStore(filepath.Join(raftDir, "raft.db"))
    snapshots, _ := raft.NewFileSnapshotStore(raftDir, 2, os.Stderr)
    transport, _ := raft.NewTCPTransport(raftBind, nil, 3, 10*time.Second, os.Stderr)
    
    return raft.NewRaft(config, fsm, store, store, snapshots, transport)
}
```

### Event Sourcing
```go
func (u *User) ChangeEmail(newEmail string) error {
    event := Event{
        ID:          uuid.New().String(),
        AggregateID: u.ID,
        Type:        "UserEmailChanged",
        Data:        json.Marshal(map[string]string{"new_email": newEmail}),
        Timestamp:   time.Now(),
        Version:     u.Version + 1,
    }
    
    u.changes = append(u.changes, event)
    return u.ApplyEvent(event)
}
```

### Distributed Caching
```go
func GetUserWithCache(ctx context.Context, cache *redis.Client, db *sql.DB, userID string) (*User, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("user:%s", userID)
    if cached, err := cache.Get(ctx, cacheKey).Result(); err == nil {
        var user User
        json.Unmarshal([]byte(cached), &user)
        return &user, nil
    }
    
    // Cache miss - load from database
    user, _ := loadUserFromDB(ctx, db, userID)
    
    // Store in cache
    data, _ := json.Marshal(user)
    cache.Set(ctx, cacheKey, data, 1*time.Hour)
    
    return user, nil
}
```

## Best Practices

1. **Idempotency**: All operations should be idempotent
2. **Timeouts**: Set appropriate timeouts for all distributed operations
3. **Retries**: Implement exponential backoff for retries
4. **Monitoring**: Add metrics for consensus state, cache hit rates, event processing
5. **Testing**: Test network partition scenarios

## Common Pitfalls to Avoid

- ❌ Not handling leader election failures
- ❌ Mutable events in event sourcing
- ❌ Not setting TTLs on cached items
- ❌ Blocking operations in FSM apply
- ❌ Not implementing proper snapshot/restore

## References

- [HashiCorp Raft](https://github.com/hashicorp/raft)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

