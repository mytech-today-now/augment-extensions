# State-Based MCP Guidelines

## Overview

**State-based MCP** focuses on persisting conversation and task state across sessions. This enables multi-turn interactions, workflow continuity, and stateful agent behavior.

**Key Challenge**: Maintaining consistent, reliable state across distributed systems with concurrency, serialization, and persistence concerns.

---

## 1. State Tracking

### State Machines

Define explicit state transitions:

```python
from enum import Enum
from typing import Optional

class ConversationState(Enum):
    INITIALIZED = "initialized"
    GATHERING_INFO = "gathering_info"
    PROCESSING = "processing"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    COMPLETED = "completed"
    ERROR = "error"

class StateMachine:
    def __init__(self, initial_state: ConversationState):
        self.current_state = initial_state
        self.transitions = {
            ConversationState.INITIALIZED: [ConversationState.GATHERING_INFO],
            ConversationState.GATHERING_INFO: [ConversationState.PROCESSING, ConversationState.ERROR],
            ConversationState.PROCESSING: [ConversationState.AWAITING_CONFIRMATION, ConversationState.ERROR],
            ConversationState.AWAITING_CONFIRMATION: [ConversationState.COMPLETED, ConversationState.GATHERING_INFO],
            ConversationState.COMPLETED: [],
            ConversationState.ERROR: [ConversationState.INITIALIZED]
        }
    
    def transition(self, new_state: ConversationState) -> bool:
        """Attempt state transition"""
        if new_state in self.transitions[self.current_state]:
            self.current_state = new_state
            return True
        return False
```

**Best Practices**:
- Define all valid states explicitly
- Document state transition rules
- Validate transitions before applying
- Log all state changes

### State Schema

Use typed schemas (Pydantic, TypedDict):

```python
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime

class AgentState(BaseModel):
    schema_version: str = "1.0"
    session_id: str
    user_id: str
    conversation_state: ConversationState
    conversation_history: List[Message] = []
    context: Dict[str, any] = {}
    metadata: Dict[str, any] = {}
    created_at: datetime
    updated_at: datetime
    etag: Optional[str] = None
    
    class Config:
        validate_assignment = True  # Validate on mutation
    
    @validator('conversation_history')
    def validate_history(cls, v):
        if len(v) > 1000:
            raise ValueError("Conversation history too long")
        return v
```

**Best Practices**:
- Use Pydantic for runtime validation
- Version schemas explicitly
- Validate on both load and mutation
- Set reasonable limits (e.g., max history length)

### State Validation

Validate state on load and mutation:

```python
def validate_state(state: AgentState) -> bool:
    """Validate state integrity"""
    # Schema validation (handled by Pydantic)
    
    # Business logic validation
    if state.conversation_state == ConversationState.COMPLETED:
        if not state.context.get('result'):
            raise ValueError("Completed state must have result")
    
    # Consistency checks
    if len(state.conversation_history) > 0:
        if state.conversation_history[-1].timestamp > state.updated_at:
            raise ValueError("Message timestamp after state update")
    
    return True
```

### State History

Maintain audit trail of state changes:

```python
class StateHistory(BaseModel):
    state_id: str
    session_id: str
    previous_state: Optional[ConversationState]
    new_state: ConversationState
    changed_fields: List[str]
    changed_by: str
    timestamp: datetime
    reason: Optional[str]

def log_state_change(old_state: AgentState, new_state: AgentState, changed_by: str):
    """Log state change to audit trail"""
    changed_fields = []
    for field in new_state.__fields__:
        if getattr(old_state, field) != getattr(new_state, field):
            changed_fields.append(field)
    
    history = StateHistory(
        state_id=generate_id(),
        session_id=new_state.session_id,
        previous_state=old_state.conversation_state,
        new_state=new_state.conversation_state,
        changed_fields=changed_fields,
        changed_by=changed_by,
        timestamp=datetime.utcnow()
    )
    
    save_to_audit_log(history)
```

---

## 2. Serialization and Persistence

### Format

Use JSON with schema version field:

```python
def serialize_state(state: AgentState) -> str:
    """Serialize state to JSON"""
    return state.json(indent=2)

def deserialize_state(json_str: str) -> AgentState:
    """Deserialize state from JSON"""
    try:
        state = AgentState.parse_raw(json_str)
        validate_state(state)
        return state
    except Exception as e:
        logger.error(f"Failed to deserialize state: {e}")
        raise
```

**Best Practices**:
- Always include schema version
- Use ISO 8601 for timestamps
- Serialize enums as strings
- Handle timezone-aware datetimes

### Compression

Apply compression for large states:

```python
import gzip
import json

def compress_state(state: AgentState) -> bytes:
    """Compress state using gzip"""
    json_str = state.json()
    return gzip.compress(json_str.encode('utf-8'))

def decompress_state(compressed: bytes) -> AgentState:
    """Decompress state"""
    json_str = gzip.decompress(compressed).decode('utf-8')
    return AgentState.parse_raw(json_str)
```

**When to compress**:
- State > 10KB
- Long conversation histories
- Large context dictionaries
- Network transfer

### Encryption

Encrypt sensitive state data at rest:

```python
from cryptography.fernet import Fernet

class EncryptedStateManager:
    def __init__(self, encryption_key: bytes):
        self.cipher = Fernet(encryption_key)
    
    def encrypt_state(self, state: AgentState) -> bytes:
        """Encrypt state"""
        json_str = state.json()
        return self.cipher.encrypt(json_str.encode('utf-8'))
    
    def decrypt_state(self, encrypted: bytes) -> AgentState:
        """Decrypt state"""
        json_str = self.cipher.decrypt(encrypted).decode('utf-8')
        return AgentState.parse_raw(json_str)
```

**What to encrypt**:
- User PII
- API keys/credentials
- Sensitive conversation content
- Business-critical data

### Versioning

Support schema migration across versions:

```python
def migrate_state(state_dict: dict) -> AgentState:
    """Migrate state from old schema to new"""
    version = state_dict.get('schema_version', '0.1')
    
    if version == '0.1':
        # Migrate 0.1 -> 1.0
        state_dict['schema_version'] = '1.0'
        state_dict['metadata'] = {}  # Add new field
        # ... other migrations
    
    return AgentState(**state_dict)
```

---

## 3. Concurrency Safety

### Optimistic Locking

Use ETags or version numbers:

```python
import hashlib

def generate_etag(state: AgentState) -> str:
    """Generate ETag for state"""
    content = state.json()
    return hashlib.sha256(content.encode()).hexdigest()[:16]

class StateManager:
    def save_state(self, state: AgentState) -> bool:
        """Save state with optimistic locking"""
        # Load current state
        current = self.load_state(state.session_id)
        
        # Check ETag
        if current and current.etag != state.etag:
            raise ConcurrencyError(
                f"State was modified by another process. "
                f"Expected ETag: {state.etag}, Actual: {current.etag}"
            )
        
        # Update ETag
        state.etag = generate_etag(state)
        state.updated_at = datetime.utcnow()
        
        # Save
        self.db.save(state.session_id, state.json())
        return True
```

### Pessimistic Locking

Acquire locks for critical sections:

```python
import redis
from contextlib import contextmanager

class LockManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    @contextmanager
    def acquire_lock(self, session_id: str, timeout: int = 10):
        """Acquire distributed lock"""
        lock_key = f"lock:session:{session_id}"
        lock_acquired = False
        
        try:
            # Try to acquire lock
            lock_acquired = self.redis.set(lock_key, "1", nx=True, ex=timeout)
            if not lock_acquired:
                raise LockError(f"Could not acquire lock for {session_id}")
            
            yield
        finally:
            # Release lock
            if lock_acquired:
                self.redis.delete(lock_key)

# Usage
with lock_manager.acquire_lock(session_id):
    state = load_state(session_id)
    state.context['key'] = 'value'
    save_state(state)
```

### Conflict Resolution

Define merge strategies for conflicts:

```python
def resolve_conflict(local_state: AgentState, remote_state: AgentState) -> AgentState:
    """Resolve state conflict"""
    # Strategy 1: Last-write-wins
    if remote_state.updated_at > local_state.updated_at:
        return remote_state
    
    # Strategy 2: Merge conversation histories
    merged = local_state.copy()
    merged.conversation_history = merge_histories(
        local_state.conversation_history,
        remote_state.conversation_history
    )
    
    # Strategy 3: Prefer remote for specific fields
    merged.conversation_state = remote_state.conversation_state
    
    return merged
```

### Idempotency

Ensure state operations are idempotent:

```python
def add_message_idempotent(state: AgentState, message: Message, message_id: str):
    """Add message idempotently"""
    # Check if message already exists
    existing_ids = {msg.metadata.get('id') for msg in state.conversation_history}
    
    if message_id not in existing_ids:
        message.metadata['id'] = message_id
        state.conversation_history.append(message)
    
    return state
```

---

## 4. Integration Patterns

### LangGraph

State as graph nodes with typed edges:

```python
from langgraph.graph import StateGraph, END

# Define state
class GraphState(TypedDict):
    messages: List[Message]
    context: Dict[str, any]
    next_action: str

# Create graph
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("gather_info", gather_info_node)
workflow.add_node("process", process_node)

# Add edges
workflow.add_edge("gather_info", "process")
workflow.add_conditional_edges("process", should_continue, {
    "continue": "gather_info",
    "end": END
})
```

### CrewAI

Agent state with task context:

```python
from crewai import Agent, Task, Crew

class StatefulAgent(Agent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = AgentState(
            session_id=generate_id(),
            user_id=kwargs.get('user_id'),
            conversation_state=ConversationState.INITIALIZED,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    def execute_task(self, task: Task):
        # Load state
        self.state = load_state(self.state.session_id)
        
        # Execute task
        result = super().execute_task(task)
        
        # Update state
        self.state.context['last_task'] = task.description
        self.state.updated_at = datetime.utcnow()
        save_state(self.state)
        
        return result
```

### AutoGen

Conversation state with message history:

```python
from autogen import ConversableAgent

class StatefulConversableAgent(ConversableAgent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_id = kwargs.get('session_id', generate_id())
        self.state = load_or_create_state(self.session_id)
    
    def receive(self, message, sender):
        # Add to state
        self.state.conversation_history.append(Message(
            role=sender.name,
            content=message,
            timestamp=datetime.utcnow()
        ))
        save_state(self.state)
        
        # Process message
        return super().receive(message, sender)
```

---

## Best Practices

✅ **DO**:
- Always validate state schema on deserialization
- Log state deltas, not full snapshots (unless checkpointing)
- Implement graceful rollback on corruption
- Use Redis/Memcached for hot-path state
- Persist to PostgreSQL/MongoDB for durability
- Test state serialization round-trips
- Use optimistic locking for most cases
- Version state schemas explicitly

❌ **DON'T**:
- Store unencrypted PII in state
- Skip validation on state load
- Ignore concurrency conflicts
- Store unbounded data (e.g., unlimited history)
- Use pessimistic locking unless necessary
- Change schema without migration path
- Log full state on every change (use deltas)

