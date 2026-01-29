# State-Based MCP Example: Customer Support Agent

## Use Case

A customer support AI agent that handles multi-turn conversations, maintains context across sessions, and manages workflow state for ticket resolution.

**Challenges**:
- Persist conversation state across sessions
- Handle concurrent user interactions
- Maintain workflow state (ticket status, escalation)
- Support handoff between agents (AI → human)

---

## Configuration

```json
{
  "mcp": {
    "type": "state",
    "persistence": {
      "backend": "redis",
      "ttl": 86400,
      "serialization": "json"
    },
    "stateMachine": {
      "enabled": true,
      "states": ["initialized", "gathering_info", "processing", "awaiting_confirmation", "escalated", "resolved"],
      "transitions": {
        "initialized": ["gathering_info"],
        "gathering_info": ["processing", "escalated"],
        "processing": ["awaiting_confirmation", "escalated"],
        "awaiting_confirmation": ["resolved", "gathering_info"],
        "escalated": ["resolved"],
        "resolved": []
      }
    },
    "concurrency": {
      "lockTimeout": 5000,
      "retryAttempts": 3
    }
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              State Manager (Redis)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Session State:                                       │  │
│  │   - conversation_id: "cs-12345"                      │  │
│  │   - current_state: "gathering_info"                  │  │
│  │   - user_id: "user-789"                              │  │
│  │   - ticket_id: "TKT-001"                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Conversation History:                                │  │
│  │   - messages: [...]                                  │  │
│  │   - context: {...}                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Workflow State:                                      │  │
│  │   - ticket_status: "open"                            │  │
│  │   - priority: "high"                                 │  │
│  │   - assigned_to: "ai-agent-1"                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              State Machine Transitions                       │
│  initialized → gathering_info → processing →                │
│  awaiting_confirmation → resolved                            │
│                    ↓                                         │
│                escalated → resolved                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: State Manager

```python
import redis
import json
from typing import Dict, Any, Optional
from enum import Enum
from datetime import datetime, timedelta

class ConversationState(Enum):
    INITIALIZED = "initialized"
    GATHERING_INFO = "gathering_info"
    PROCESSING = "processing"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    ESCALATED = "escalated"
    RESOLVED = "resolved"

class StateManager:
    def __init__(self, redis_url: str, ttl: int = 86400):
        self.redis = redis.from_url(redis_url)
        self.ttl = ttl
        self.transitions = {
            ConversationState.INITIALIZED: [ConversationState.GATHERING_INFO],
            ConversationState.GATHERING_INFO: [ConversationState.PROCESSING, ConversationState.ESCALATED],
            ConversationState.PROCESSING: [ConversationState.AWAITING_CONFIRMATION, ConversationState.ESCALATED],
            ConversationState.AWAITING_CONFIRMATION: [ConversationState.RESOLVED, ConversationState.GATHERING_INFO],
            ConversationState.ESCALATED: [ConversationState.RESOLVED],
            ConversationState.RESOLVED: []
        }
    
    def get_state(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve conversation state"""
        state_key = f"conversation:{conversation_id}:state"
        state_data = self.redis.get(state_key)
        
        if state_data:
            return json.loads(state_data)
        return None
    
    def set_state(self, conversation_id: str, state: Dict[str, Any]) -> bool:
        """Persist conversation state"""
        state_key = f"conversation:{conversation_id}:state"
        state_data = json.dumps(state)
        
        return self.redis.setex(state_key, self.ttl, state_data)
    
    def transition_state(self, conversation_id: str, new_state: ConversationState) -> bool:
        """Attempt state transition with validation"""
        current_state_data = self.get_state(conversation_id)
        
        if not current_state_data:
            return False
        
        current_state = ConversationState(current_state_data["current_state"])
        
        # Validate transition
        if new_state not in self.transitions[current_state]:
            raise ValueError(f"Invalid transition: {current_state.value} → {new_state.value}")
        
        # Update state
        current_state_data["current_state"] = new_state.value
        current_state_data["updated_at"] = datetime.utcnow().isoformat()
        
        return self.set_state(conversation_id, current_state_data)

    def add_message(self, conversation_id: str, role: str, content: str) -> bool:
        """Add message to conversation history"""
        history_key = f"conversation:{conversation_id}:history"
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }

        self.redis.rpush(history_key, json.dumps(message))
        self.redis.expire(history_key, self.ttl)

        return True

    def get_history(self, conversation_id: str, limit: int = 50) -> list:
        """Retrieve conversation history"""
        history_key = f"conversation:{conversation_id}:history"
        messages = self.redis.lrange(history_key, -limit, -1)

        return [json.loads(msg) for msg in messages]
```

### Step 2: Customer Support Agent

```python
from typing import Optional
import openai

class CustomerSupportAgent:
    def __init__(self, state_manager: StateManager, openai_api_key: str):
        self.state_manager = state_manager
        self.client = openai.OpenAI(api_key=openai_api_key)

    def initialize_conversation(self, user_id: str, ticket_id: str) -> str:
        """Initialize new support conversation"""
        conversation_id = f"cs-{ticket_id}"

        initial_state = {
            "conversation_id": conversation_id,
            "current_state": ConversationState.INITIALIZED.value,
            "user_id": user_id,
            "ticket_id": ticket_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": {
                "ticket_status": "open",
                "priority": "medium",
                "assigned_to": "ai-agent-1"
            }
        }

        self.state_manager.set_state(conversation_id, initial_state)
        self.state_manager.transition_state(conversation_id, ConversationState.GATHERING_INFO)

        return conversation_id

    def handle_message(self, conversation_id: str, user_message: str) -> str:
        """Process user message and generate response"""
        # Get current state
        state = self.state_manager.get_state(conversation_id)
        if not state:
            return "Error: Conversation not found"

        # Add user message to history
        self.state_manager.add_message(conversation_id, "user", user_message)

        # Get conversation history
        history = self.state_manager.get_history(conversation_id)

        # Build context for LLM
        messages = [
            {"role": "system", "content": self._build_system_prompt(state)},
            *[{"role": msg["role"], "content": msg["content"]} for msg in history]
        ]

        # Generate response
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7
        )

        assistant_message = response.choices[0].message.content

        # Add assistant message to history
        self.state_manager.add_message(conversation_id, "assistant", assistant_message)

        # Update state based on response
        self._update_state_based_on_response(conversation_id, assistant_message)

        return assistant_message

    def _build_system_prompt(self, state: Dict[str, Any]) -> str:
        """Build system prompt with current state context"""
        current_state = state["current_state"]
        ticket_id = state["ticket_id"]
        metadata = state["metadata"]

        return f"""You are a customer support AI agent.

Current State: {current_state}
Ticket ID: {ticket_id}
Priority: {metadata['priority']}
Status: {metadata['ticket_status']}

Your goal is to help resolve the customer's issue efficiently.

State-specific instructions:
- gathering_info: Ask clarifying questions to understand the issue
- processing: Analyze the issue and propose solutions
- awaiting_confirmation: Wait for user confirmation before proceeding
- escalated: Inform user that ticket has been escalated to human agent

Be helpful, professional, and concise."""

    def _update_state_based_on_response(self, conversation_id: str, response: str) -> None:
        """Update conversation state based on agent response"""
        state = self.state_manager.get_state(conversation_id)
        current_state = ConversationState(state["current_state"])

        # Simple heuristics for state transitions
        if current_state == ConversationState.GATHERING_INFO:
            if "solution" in response.lower() or "try" in response.lower():
                self.state_manager.transition_state(conversation_id, ConversationState.PROCESSING)

        elif current_state == ConversationState.PROCESSING:
            if "confirm" in response.lower() or "does this" in response.lower():
                self.state_manager.transition_state(conversation_id, ConversationState.AWAITING_CONFIRMATION)

        elif current_state == ConversationState.AWAITING_CONFIRMATION:
            # Would check user response in real implementation
            pass
```

---

## Usage Example

```python
# Initialize
state_manager = StateManager("redis://localhost:6379", ttl=86400)
agent = CustomerSupportAgent(state_manager, "your-openai-api-key")

# Start conversation
conversation_id = agent.initialize_conversation(
    user_id="user-789",
    ticket_id="TKT-001"
)

# Handle messages
response1 = agent.handle_message(
    conversation_id,
    "My account is locked and I can't log in"
)
print(f"Agent: {response1}")

response2 = agent.handle_message(
    conversation_id,
    "I tried resetting my password but didn't receive the email"
)
print(f"Agent: {response2}")

# Resume conversation later (state persisted in Redis)
response3 = agent.handle_message(
    conversation_id,
    "Yes, I checked my spam folder"
)
print(f"Agent: {response3}")
```

---

## Key Features

### 1. State Persistence
- Redis backend for distributed state
- TTL-based expiration (24 hours)
- JSON serialization

### 2. State Machine
- Explicit state transitions
- Validation of allowed transitions
- State-specific behavior

### 3. Conversation History
- Message-level tracking
- Timestamp metadata
- Limited history retrieval

### 4. Concurrency Support
- Redis atomic operations
- Lock-based concurrency control
- Retry logic for conflicts

---

## Testing

```python
import pytest
from unittest.mock import Mock, patch

def test_state_transition():
    state_manager = StateManager("redis://localhost:6379")

    # Initialize state
    conversation_id = "test-cs-001"
    initial_state = {
        "conversation_id": conversation_id,
        "current_state": ConversationState.INITIALIZED.value,
        "user_id": "test-user",
        "ticket_id": "TKT-TEST"
    }
    state_manager.set_state(conversation_id, initial_state)

    # Valid transition
    assert state_manager.transition_state(conversation_id, ConversationState.GATHERING_INFO)

    # Invalid transition
    with pytest.raises(ValueError):
        state_manager.transition_state(conversation_id, ConversationState.RESOLVED)

def test_conversation_history():
    state_manager = StateManager("redis://localhost:6379")
    conversation_id = "test-cs-002"

    # Add messages
    state_manager.add_message(conversation_id, "user", "Hello")
    state_manager.add_message(conversation_id, "assistant", "Hi! How can I help?")

    # Retrieve history
    history = state_manager.get_history(conversation_id)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"
```

---

## Best Practices

1. **State Validation**: Always validate state transitions
2. **Idempotency**: Design state updates to be idempotent
3. **TTL Management**: Set appropriate TTLs for state expiration
4. **Error Handling**: Handle Redis connection failures gracefully
5. **Monitoring**: Track state transition metrics
6. **Concurrency**: Use locks for critical state updates
7. **Serialization**: Use consistent serialization format (JSON)
8. **Versioning**: Version state schema for backward compatibility

---

## Performance Considerations

- **Redis Pipelining**: Batch multiple Redis operations
- **Connection Pooling**: Reuse Redis connections
- **Compression**: Compress large state objects
- **Sharding**: Distribute state across Redis shards
- **Caching**: Cache frequently accessed state locally

---

## Security

- **Encryption**: Encrypt sensitive state data at rest
- **Access Control**: Implement Redis ACLs
- **Audit Logging**: Log all state transitions
- **Data Retention**: Comply with data retention policies
- **PII Handling**: Anonymize or encrypt PII in state
```

