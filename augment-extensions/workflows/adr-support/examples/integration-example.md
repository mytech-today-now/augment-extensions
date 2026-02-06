# ADR Integration Example

This example demonstrates how Architecture Decision Records (ADRs) integrate with OpenSpec and Beads through the coordination manifest.

## Overview

This example shows a complete workflow where:
- An architectural decision is made (ADR)
- Specifications are created (OpenSpec)
- Implementation tasks are tracked (Beads)
- Everything is coordinated through the manifest

**Scenario:** Implementing API rate limiting

---

## Step 1: Create the ADR

**File:** `adr/0055-implement-api-rate-limiting.md`

```markdown
# ADR-0055: Implement API Rate Limiting

**Status:** Approved

**Date:** 2026-02-05

**Deciders:** Tech Lead, API Team, Security Team

**Technical Story:** Related to OpenSpec spec: api/rate-limiting

---

## Context

Our public API is experiencing abuse:
- Single client making 10,000+ requests/minute
- API costs increased 300% in last month
- Legitimate users experiencing degraded performance
- No current rate limiting mechanism

### Forces

- Need to protect API from abuse
- Must not impact legitimate users
- Should be configurable per client
- Need monitoring and alerting
- Must handle distributed system (3 API servers)

---

## Decision

We will implement token bucket rate limiting using Redis.

### Rationale

1. **Token Bucket Algorithm**: Allows bursts while enforcing average rate
2. **Redis**: Centralized state across distributed API servers
3. **Configurable**: Per-client limits via database configuration
4. **Industry Standard**: Well-understood pattern with good libraries

---

## Consequences

### Positive

- Protects API from abuse
- Fair resource allocation
- Configurable per client tier (free/pro/enterprise)
- Real-time monitoring possible
- Graceful degradation

### Negative

- Additional Redis dependency
- Slight latency increase (2-5ms per request)
- Need to handle Redis failures
- Client education required

### Neutral

- Need to implement client tier management
- Monitoring dashboard required
- Documentation updates needed

---

## Related Decisions

- Related to: [ADR-0012](0012-use-redis-for-caching.md)
- Related to: [ADR-0033](0033-api-authentication.md)

---

## Notes

### Implementation Notes

- Use `express-rate-limit` with Redis store
- Default limits: 100 req/min (free), 1000 req/min (pro), 10000 req/min (enterprise)
- Return 429 status with Retry-After header
- Implement sliding window counter for accuracy

### References

- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [RFC 6585 - HTTP 429 Status Code](https://tools.ietf.org/html/rfc6585)
```

---

## Step 2: Create OpenSpec Specification

**File:** `openspec/specs/api/rate-limiting.md`

```markdown
# API Rate Limiting Specification

**Status:** Active

**Version:** 1.0.0

**Related ADR:** [ADR-0055: Implement API Rate Limiting](../../../adr/0055-implement-api-rate-limiting.md)

---

## Overview

This specification defines the rate limiting behavior for all public API endpoints.

## Rate Limit Tiers

### Free Tier
- **Limit:** 100 requests per minute
- **Burst:** 120 requests
- **Window:** Sliding 60 seconds

### Pro Tier
- **Limit:** 1,000 requests per minute
- **Burst:** 1,200 requests
- **Window:** Sliding 60 seconds

### Enterprise Tier
- **Limit:** 10,000 requests per minute
- **Burst:** 12,000 requests
- **Window:** Sliding 60 seconds

## HTTP Headers

### Request Headers
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets

### Response Headers (429 Too Many Requests)
- `Retry-After`: Seconds until rate limit resets
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: 0
- `X-RateLimit-Reset`: Unix timestamp when window resets

## Error Response Format

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry after 45 seconds.",
    "details": {
      "limit": 100,
      "window": "60s",
      "retryAfter": 45
    }
  }
}
```

## Implementation Requirements

1. **Redis Storage**: Use Redis for distributed rate limit state
2. **Token Bucket**: Implement token bucket algorithm
3. **Graceful Degradation**: If Redis unavailable, allow requests (fail open)
4. **Monitoring**: Track rate limit hits per client
5. **Configuration**: Store client tiers in database

## Affected Endpoints

- All `/api/v1/*` endpoints
- Excludes: `/api/v1/health`, `/api/v1/status`

---

## See Also

- [ADR-0055: Implement API Rate Limiting](../../../adr/0055-implement-api-rate-limiting.md)
- [API Authentication Spec](./authentication.md)
```

---

## Step 3: Create Beads Tasks

Create implementation tasks:

```bash
# Create epic
bd create "Implement API rate limiting" \
  --type epic \
  --priority 1 \
  --labels "adr-0055,api,security"

# Create subtasks
bd create "Set up Redis rate limit store" \
  --parent bd-rl00 \
  --priority 1 \
  --labels "adr-0055,infrastructure"

bd create "Implement rate limit middleware" \
  --parent bd-rl00 \
  --priority 1 \
  --labels "adr-0055,implementation"

bd create "Add client tier management" \
  --parent bd-rl00 \
  --priority 1 \
  --labels "adr-0055,implementation"

bd create "Create monitoring dashboard" \
  --parent bd-rl00 \
  --priority 2 \
  --labels "adr-0055,monitoring"

bd create "Update API documentation" \
  --parent bd-rl00 \
  --priority 2 \
  --labels "adr-0055,documentation"

bd create "Write integration tests" \
  --parent bd-rl00 \
  --priority 1 \
  --labels "adr-0055,testing"

# Link epic to ADR
bd comment bd-rl00 "Implementing ADR-0055: API Rate Limiting (adr/0055-implement-api-rate-limiting.md)"
```

---

## Step 4: Update Coordination Manifest

**File:** `.augment/coordination.json`

```json
{
  "adrs": {
    "adr-0055": {
      "file": "adr/0055-implement-api-rate-limiting.md",
      "title": "Implement API Rate Limiting",
      "status": "approved",
      "date": "2026-02-05",
      "deciders": ["Tech Lead", "API Team", "Security Team"],
      "relatedSpecs": ["api/rate-limiting"],
      "relatedTasks": ["bd-rl00", "bd-rl01", "bd-rl02", "bd-rl03", "bd-rl04", "bd-rl05", "bd-rl06"],
      "implementationProgress": "in_progress",
      "tags": ["api", "security", "redis", "rate-limiting"]
    }
  },
  "specs": {
    "api/rate-limiting": {
      "file": "openspec/specs/api/rate-limiting.md",
      "status": "active",
      "version": "1.0.0",
      "relatedADRs": ["adr-0055"],
      "relatedTasks": ["bd-rl00", "bd-rl01", "bd-rl02", "bd-rl03"],
      "affectedFiles": [
        "src/middleware/rateLimiter.ts",
        "src/config/rateLimits.ts",
        "src/services/redis.ts",
        "src/models/ClientTier.ts"
      ]
    }
  },
  "tasks": {
    "bd-rl00": {
      "title": "Implement API rate limiting",
      "status": "in_progress",
      "type": "epic",
      "relatedADRs": ["adr-0055"],
      "relatedSpecs": ["api/rate-limiting"],
      "subtasks": ["bd-rl01", "bd-rl02", "bd-rl03", "bd-rl04", "bd-rl05", "bd-rl06"]
    },
    "bd-rl01": {
      "title": "Set up Redis rate limit store",
      "status": "closed",
      "relatedADRs": ["adr-0055"],
      "relatedSpecs": ["api/rate-limiting"],
      "affectedFiles": ["src/services/redis.ts", "src/config/redis.ts"]
    },
    "bd-rl02": {
      "title": "Implement rate limit middleware",
      "status": "in_progress",
      "relatedADRs": ["adr-0055"],
      "relatedSpecs": ["api/rate-limiting"],
      "affectedFiles": ["src/middleware/rateLimiter.ts"],
      "blockedBy": ["bd-rl01"]
    },
    "bd-rl03": {
      "title": "Add client tier management",
      "status": "in_progress",
      "relatedADRs": ["adr-0055"],
      "relatedSpecs": ["api/rate-limiting"],
      "affectedFiles": ["src/models/ClientTier.ts", "src/controllers/clientTier.ts"]
    },
    "bd-rl04": {
      "title": "Create monitoring dashboard",
      "status": "open",
      "relatedADRs": ["adr-0055"],
      "affectedFiles": ["src/dashboards/rateLimiting.ts"]
    },
    "bd-rl05": {
      "title": "Update API documentation",
      "status": "open",
      "relatedADRs": ["adr-0055"],
      "relatedSpecs": ["api/rate-limiting"],
      "affectedFiles": ["docs/api/rate-limiting.md"]
    },
    "bd-rl06": {
      "title": "Write integration tests",
      "status": "open",
      "relatedADRs": ["adr-0055"],
      "relatedSpecs": ["api/rate-limiting"],
      "affectedFiles": ["tests/integration/rateLimiting.test.ts"],
      "blockedBy": ["bd-rl02"]
    }
  },
  "files": {
    "src/middleware/rateLimiter.ts": {
      "relatedSpecs": ["api/rate-limiting"],
      "relatedADRs": ["adr-0055"],
      "relatedTasks": ["bd-rl02"]
    },
    "src/config/rateLimits.ts": {
      "relatedSpecs": ["api/rate-limiting"],
      "relatedADRs": ["adr-0055"],
      "relatedTasks": ["bd-rl02"]
    },
    "src/services/redis.ts": {
      "relatedSpecs": ["api/rate-limiting"],
      "relatedADRs": ["adr-0055", "adr-0012"],
      "relatedTasks": ["bd-rl01"]
    },
    "src/models/ClientTier.ts": {
      "relatedSpecs": ["api/rate-limiting"],
      "relatedADRs": ["adr-0055"],
      "relatedTasks": ["bd-rl03"]
    }
  }
}
```

---

## Step 5: Implementation Workflow

### Phase 1: Infrastructure Setup (bd-rl01)

**Task:** Set up Redis rate limit store

**Files Created:**
- `src/services/redis.ts`
- `src/config/redis.ts`

**Update Coordination Manifest:**
```bash
# Mark task as complete
bd close bd-rl01 "Redis rate limit store configured with connection pooling"

# Manifest automatically updated:
# - bd-rl01.status = "closed"
# - bd-rl02 becomes unblocked
```

### Phase 2: Middleware Implementation (bd-rl02)

**Task:** Implement rate limit middleware

**Files Created:**
- `src/middleware/rateLimiter.ts`
- `src/config/rateLimits.ts`

**Update Coordination Manifest:**
```bash
# Update task status
bd status bd-rl02 in_progress

# Add implementation comment
bd comment bd-rl02 "Implemented token bucket algorithm with Redis backend. Added graceful degradation for Redis failures."

# Mark complete
bd close bd-rl02 "Rate limit middleware implemented and tested"
```

### Phase 3: Client Tier Management (bd-rl03)

**Task:** Add client tier management

**Files Created:**
- `src/models/ClientTier.ts`
- `src/controllers/clientTier.ts`
- `src/routes/clientTier.ts`

**Update Coordination Manifest:**
```bash
bd close bd-rl03 "Client tier CRUD operations implemented with database migrations"
```

### Phase 4: Monitoring (bd-rl04)

**Task:** Create monitoring dashboard

**Files Created:**
- `src/dashboards/rateLimiting.ts`

**Update Coordination Manifest:**
```bash
bd close bd-rl04 "Grafana dashboard created showing rate limit hits, client distribution, and Redis performance"
```

### Phase 5: Documentation (bd-rl05)

**Task:** Update API documentation

**Files Updated:**
- `docs/api/rate-limiting.md`
- `docs/api/errors.md`
- `README.md`

**Update Coordination Manifest:**
```bash
bd close bd-rl05 "API documentation updated with rate limit headers, error codes, and client tier information"
```

### Phase 6: Testing (bd-rl06)

**Task:** Write integration tests

**Files Created:**
- `tests/integration/rateLimiting.test.ts`

**Update Coordination Manifest:**
```bash
bd close bd-rl06 "Integration tests written covering all tiers, burst handling, and Redis failure scenarios. 24 tests passing."
```

---

## Step 6: Update ADR Status

Once all tasks are complete, update the ADR status:

**File:** `adr/0055-implement-api-rate-limiting.md`

```diff
- **Status:** Approved
+ **Status:** Implemented

+ **Implemented Date:** 2026-02-20
```

Add implementation notes:

```markdown
---

## Implementation

**Date:** 2026-02-20

**Implementation Tasks:** bd-rl00 (epic with 6 subtasks)

**Actual Implementation:**
- Redis rate limit store with connection pooling
- Token bucket algorithm with sliding window
- Graceful degradation (fail open) for Redis failures
- Client tier management with database migrations
- Grafana monitoring dashboard
- Comprehensive integration tests (24 tests)

**Deviations from Plan:**
- Added graceful degradation (not in original plan)
- Used sliding window instead of fixed window for better accuracy
- Added Grafana dashboard instead of custom dashboard

**Lessons Learned:**
- Redis connection pooling critical for performance
- Graceful degradation essential for reliability
- Client education more important than anticipated
- Monitoring dashboard invaluable for debugging
```

**Update Coordination Manifest:**
```json
{
  "adrs": {
    "adr-0055": {
      "status": "implemented",
      "implementedDate": "2026-02-20",
      "implementationProgress": "complete"
    }
  }
}
```

---

## Integration Benefits

### Traceability

1. **ADR → Spec**: Decision rationale linked to technical specification
2. **Spec → Tasks**: Specification broken down into actionable tasks
3. **Tasks → Files**: Implementation tracked at file level
4. **Files → ADR**: Code linked back to architectural decision

### Coordination

- **Single Source of Truth**: Coordination manifest ties everything together
- **Status Tracking**: Real-time view of implementation progress
- **Impact Analysis**: Easily see what's affected by a decision
- **Historical Context**: Understand why code exists

### Workflow

```
Decision Made → ADR Created → Spec Written → Tasks Created → Implementation → ADR Updated
     ↓              ↓              ↓              ↓                ↓              ↓
  Context      Rationale      Requirements    Breakdown        Code         Validation
```

---

## Coordination Manifest Queries

### Find all tasks for an ADR

```bash
# Using jq
cat .augment/coordination.json | jq '.tasks | to_entries[] | select(.value.relatedADRs[]? == "adr-0055")'
```

### Find all specs related to an ADR

```bash
cat .augment/coordination.json | jq '.specs | to_entries[] | select(.value.relatedADRs[]? == "adr-0055")'
```

### Find all files affected by an ADR

```bash
cat .augment/coordination.json | jq '.files | to_entries[] | select(.value.relatedADRs[]? == "adr-0055")'
```

### Check implementation progress

```bash
cat .augment/coordination.json | jq '.adrs["adr-0055"].implementationProgress'
```

---

## See Also

- [Complete Lifecycle Example](./complete-lifecycle-example.md)
- [Superseding Example](./superseding-example.md)
- [OpenSpec Integration Rules](../rules/openspec-integration.md)
- [Beads Integration Rules](../rules/beads-integration.md)
- [Coordination System](../../../../.augment-guidelines/system-integration/coordination-system.md)


