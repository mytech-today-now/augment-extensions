# Consensus and Distributed Coordination Rules

## Overview

Best practices for implementing consensus algorithms and distributed coordination in Go applications using Raft, etcd, and other consensus protocols.

## Rules

### 1. Use Proven Consensus Libraries

**Rule**: Use established consensus libraries like etcd/raft or HashiCorp Raft instead of implementing your own.

**Good Example**:
```go
import (
    "github.com/hashicorp/raft"
    raftboltdb "github.com/hashicorp/raft-boltdb"
)

func NewRaftNode(nodeID, raftDir, raftBind string) (*raft.Raft, error) {
    config := raft.DefaultConfig()
    config.LocalID = raft.ServerID(nodeID)
    
    store, err := raftboltdb.NewBoltStore(filepath.Join(raftDir, "raft.db"))
    if err != nil {
        return nil, fmt.Errorf("failed to create bolt store: %w", err)
    }
    
    snapshots, err := raft.NewFileSnapshotStore(raftDir, 2, os.Stderr)
    if err != nil {
        return nil, fmt.Errorf("failed to create snapshot store: %w", err)
    }
    
    transport, err := raft.NewTCPTransport(raftBind, nil, 3, 10*time.Second, os.Stderr)
    if err != nil {
        return nil, fmt.Errorf("failed to create transport: %w", err)
    }
    
    r, err := raft.NewRaft(config, (*fsm)(s), store, store, snapshots, transport)
    if err != nil {
        return nil, fmt.Errorf("failed to create raft: %w", err)
    }
    
    return r, nil
}
```

### 2. Implement Finite State Machine Correctly

**Rule**: Implement FSM with deterministic apply logic and proper snapshot/restore.

**Good Example**:
```go
type FSM struct {
    mu   sync.RWMutex
    data map[string]string
}

func (f *FSM) Apply(log *raft.Log) interface{} {
    f.mu.Lock()
    defer f.mu.Unlock()
    
    var cmd Command
    if err := json.Unmarshal(log.Data, &cmd); err != nil {
        return err
    }
    
    switch cmd.Op {
    case "set":
        f.data[cmd.Key] = cmd.Value
    case "delete":
        delete(f.data, cmd.Key)
    }
    
    return nil
}

func (f *FSM) Snapshot() (raft.FSMSnapshot, error) {
    f.mu.RLock()
    defer f.mu.RUnlock()
    
    data := make(map[string]string)
    for k, v := range f.data {
        data[k] = v
    }
    
    return &fsmSnapshot{data: data}, nil
}

func (f *FSM) Restore(rc io.ReadCloser) error {
    f.mu.Lock()
    defer f.mu.Unlock()
    
    decoder := json.NewDecoder(rc)
    return decoder.Decode(&f.data)
}
```

### 3. Handle Leader Election Properly

**Rule**: Always check if node is leader before accepting writes.

**Good Example**:
```go
func (s *Store) Set(key, value string) error {
    if s.raft.State() != raft.Leader {
        return fmt.Errorf("not leader")
    }
    
    cmd := Command{
        Op:    "set",
        Key:   key,
        Value: value,
    }
    
    data, err := json.Marshal(cmd)
    if err != nil {
        return err
    }
    
    future := s.raft.Apply(data, 10*time.Second)
    return future.Error()
}
```

### 4. Implement Read Consistency Levels

**Rule**: Provide different read consistency levels (strong, eventual).

**Good Example**:
```go
func (s *Store) Get(key string, consistent bool) (string, error) {
    if consistent {
        // Strong consistency: verify leadership
        if err := s.raft.VerifyLeader().Error(); err != nil {
            return "", err
        }
    }
    
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    value, ok := s.data[key]
    if !ok {
        return "", fmt.Errorf("key not found")
    }
    
    return value, nil
}
```

### 5. Handle Network Partitions Gracefully

**Rule**: Implement proper timeout and retry logic for network partitions.

**Good Example**:
```go
func (s *Store) SetWithRetry(key, value string, maxRetries int) error {
    var lastErr error
    
    for i := 0; i < maxRetries; i++ {
        err := s.Set(key, value)
        if err == nil {
            return nil
        }
        
        lastErr = err
        
        if err.Error() == "not leader" {
            // Wait for leader election
            time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
            continue
        }
        
        return err
    }
    
    return fmt.Errorf("failed after %d retries: %w", maxRetries, lastErr)
}
```

## References

- [HashiCorp Raft](https://github.com/hashicorp/raft)
- [etcd Raft Library](https://github.com/etcd-io/etcd/tree/main/raft)
- [Raft Consensus Algorithm](https://raft.github.io/)

