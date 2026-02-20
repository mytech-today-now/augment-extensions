# Event Sourcing Rules

## Overview

Best practices for implementing event sourcing patterns in Go applications including event stores, projections, and CQRS.

## Rules

### 1. Design Immutable Events

**Rule**: Events should be immutable and contain all necessary information.

**Good Example**:
```go
type Event struct {
    ID          string    `json:"id"`
    AggregateID string    `json:"aggregate_id"`
    Type        string    `json:"type"`
    Data        json.RawMessage `json:"data"`
    Metadata    map[string]string `json:"metadata"`
    Timestamp   time.Time `json:"timestamp"`
    Version     int       `json:"version"`
}

type UserCreatedEvent struct {
    UserID    string `json:"user_id"`
    Email     string `json:"email"`
    Name      string `json:"name"`
    CreatedAt time.Time `json:"created_at"`
}

func NewUserCreatedEvent(userID, email, name string) (*Event, error) {
    data, err := json.Marshal(UserCreatedEvent{
        UserID:    userID,
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    })
    if err != nil {
        return nil, err
    }
    
    return &Event{
        ID:          uuid.New().String(),
        AggregateID: userID,
        Type:        "UserCreated",
        Data:        data,
        Timestamp:   time.Now(),
        Version:     1,
    }, nil
}
```

### 2. Implement Event Store Interface

**Rule**: Define a clear event store interface for persistence.

**Good Example**:
```go
type EventStore interface {
    Save(ctx context.Context, events []Event) error
    Load(ctx context.Context, aggregateID string) ([]Event, error)
    LoadFrom(ctx context.Context, aggregateID string, version int) ([]Event, error)
    Subscribe(ctx context.Context, eventTypes []string) (<-chan Event, error)
}

type PostgresEventStore struct {
    db *sql.DB
}

func (s *PostgresEventStore) Save(ctx context.Context, events []Event) error {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()
    
    for _, event := range events {
        _, err := tx.ExecContext(ctx,
            `INSERT INTO events (id, aggregate_id, type, data, metadata, timestamp, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            event.ID, event.AggregateID, event.Type, event.Data,
            event.Metadata, event.Timestamp, event.Version,
        )
        if err != nil {
            return err
        }
    }
    
    return tx.Commit()
}
```

### 3. Implement Aggregate Root Pattern

**Rule**: Use aggregate roots to ensure consistency boundaries.

**Good Example**:
```go
type User struct {
    ID      string
    Email   string
    Name    string
    Version int
    changes []Event
}

func (u *User) ApplyEvent(event Event) error {
    switch event.Type {
    case "UserCreated":
        var data UserCreatedEvent
        if err := json.Unmarshal(event.Data, &data); err != nil {
            return err
        }
        u.ID = data.UserID
        u.Email = data.Email
        u.Name = data.Name
        
    case "UserEmailChanged":
        var data UserEmailChangedEvent
        if err := json.Unmarshal(event.Data, &data); err != nil {
            return err
        }
        u.Email = data.NewEmail
    }
    
    u.Version = event.Version
    return nil
}

func (u *User) ChangeEmail(newEmail string) error {
    if newEmail == u.Email {
        return fmt.Errorf("email unchanged")
    }
    
    event, err := NewUserEmailChangedEvent(u.ID, u.Email, newEmail)
    if err != nil {
        return err
    }
    
    u.changes = append(u.changes, *event)
    return u.ApplyEvent(*event)
}

func (u *User) GetUncommittedChanges() []Event {
    return u.changes
}

func (u *User) MarkChangesAsCommitted() {
    u.changes = nil
}
```

### 4. Build Projections for Read Models

**Rule**: Create separate read models (projections) from events.

**Good Example**:
```go
type UserProjection struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
    UpdatedAt time.Time
}

type ProjectionBuilder struct {
    db *sql.DB
}

func (pb *ProjectionBuilder) HandleEvent(ctx context.Context, event Event) error {
    switch event.Type {
    case "UserCreated":
        return pb.handleUserCreated(ctx, event)
    case "UserEmailChanged":
        return pb.handleUserEmailChanged(ctx, event)
    }
    return nil
}

func (pb *ProjectionBuilder) handleUserCreated(ctx context.Context, event Event) error {
    var data UserCreatedEvent
    if err := json.Unmarshal(event.Data, &data); err != nil {
        return err
    }
    
    _, err := pb.db.ExecContext(ctx,
        `INSERT INTO user_projections (id, email, name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        data.UserID, data.Email, data.Name, data.CreatedAt, time.Now(),
    )
    return err
}
```

### 5. Implement Event Versioning

**Rule**: Support event schema evolution with versioning.

**Good Example**:
```go
type EventUpgrader interface {
    Upgrade(event Event) (Event, error)
}

type UserCreatedV1ToV2 struct{}

func (u *UserCreatedV1ToV2) Upgrade(event Event) (Event, error) {
    if event.Version != 1 {
        return event, nil
    }
    
    var v1Data struct {
        UserID string `json:"user_id"`
        Email  string `json:"email"`
    }
    
    if err := json.Unmarshal(event.Data, &v1Data); err != nil {
        return event, err
    }
    
    v2Data := UserCreatedEvent{
        UserID:    v1Data.UserID,
        Email:     v1Data.Email,
        Name:      "Unknown", // Default for missing field
        CreatedAt: event.Timestamp,
    }
    
    data, err := json.Marshal(v2Data)
    if err != nil {
        return event, err
    }
    
    event.Data = data
    event.Version = 2
    
    return event, nil
}
```

## References

- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

