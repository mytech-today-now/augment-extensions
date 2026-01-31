# Task Generation Guidelines

## Overview

This document provides comprehensive guidelines for AI-driven task generation. It defines the task template structure, required sections, quality checklist, and minimum detail requirements to ensure tasks are never bare-minimum skeletons.

## 1. Comprehensive Task Template Structure

### 1.1 Complete Task Template

```markdown
# Task: [Title]

## Description

[Comprehensive explanation of what needs to be done, why it's needed, and what the expected outcome is]

## Context

[Background information, related features, and how this task fits into the larger project]

## Prerequisites

- [ ] Prerequisite 1 with specific details
- [ ] Prerequisite 2 with specific details
- [ ] Prerequisite 3 with specific details

## Inputs

- **Input 1**: [Description and format]
- **Input 2**: [Description and format]

## Outputs

- **Output 1**: [Description and format]
- **Output 2**: [Description and format]

## Steps

1. **Step 1**: [Detailed description]
   - Sub-step 1.1
   - Sub-step 1.2
   
2. **Step 2**: [Detailed description]
   - Sub-step 2.1
   - Sub-step 2.2

3. **Step 3**: [Detailed description]
   - Sub-step 3.1
   - Sub-step 3.2

## Dependencies

### Blocks (must complete before this task)
- `bd-xyz`: [Task title and reason for dependency]

### Blocked By (tasks that depend on this)
- `bd-abc`: [Task title and reason for dependency]

### Related
- `bd-def`: [Task title and relationship]

## Edge Cases

### Case 1: [Scenario description]
- **Condition**: [When this occurs]
- **Handling**: [How to handle it]
- **Expected Outcome**: [What should happen]

### Case 2: [Scenario description]
- **Condition**: [When this occurs]
- **Handling**: [How to handle it]
- **Expected Outcome**: [What should happen]

## Error Handling

### Error 1: [Error description]
- **Cause**: [What causes this error]
- **Detection**: [How to detect it]
- **Resolution**: [How to fix it]
- **Prevention**: [How to prevent it]

## Verification

- [ ] Verification criterion 1 with specific test
- [ ] Verification criterion 2 with specific test
- [ ] Verification criterion 3 with specific test

## Success Metrics

- **Metric 1**: [Measurable outcome with target value]
- **Metric 2**: [Measurable outcome with target value]
- **Metric 3**: [Measurable outcome with target value]

## Testing

### Unit Tests
- Test 1: [Description]
- Test 2: [Description]

### Integration Tests
- Test 1: [Description]
- Test 2: [Description]

## Documentation

- [ ] Code comments added
- [ ] API documentation updated
- [ ] User guide updated (if applicable)
- [ ] README updated (if applicable)

## Rollback Plan

1. Step 1 to rollback changes
2. Step 2 to rollback changes
3. Verification that rollback was successful

## Estimated Effort

- **Time**: [Estimated hours/days]
- **Complexity**: [Low/Medium/High]
- **Risk**: [Low/Medium/High]

## Resources

- [Link to relevant documentation]
- [Link to related code]
- [Link to design documents]
```

## 2. Required Sections

### 2.1 Mandatory Sections

Every task MUST include:

1. **Title**: Action-oriented, specific
2. **Description**: Comprehensive explanation
3. **Prerequisites**: What must be ready first
4. **Steps**: Detailed, ordered actions
5. **Verification**: Clear completion criteria
6. **Success Metrics**: Measurable outcomes

### 2.2 Highly Recommended Sections

Tasks SHOULD include:

1. **Context**: Background and project fit
2. **Inputs/Outputs**: Data flow
3. **Dependencies**: Task relationships
4. **Edge Cases**: Special scenarios
5. **Error Handling**: Failure modes
6. **Testing**: Test requirements
7. **Documentation**: Doc updates needed

### 2.3 Optional Sections

Tasks MAY include:

1. **Rollback Plan**: How to undo changes
2. **Estimated Effort**: Time and complexity
3. **Resources**: Links and references

## 3. Quality Checklist

### 3.1 Before Creating a Task

- [ ] Is the task title clear and action-oriented?
- [ ] Does the description explain WHAT, WHY, and EXPECTED OUTCOME?
- [ ] Are all prerequisites explicitly listed?
- [ ] Are steps detailed enough to execute without additional research?
- [ ] Are verification criteria specific and testable?
- [ ] Are success metrics measurable?
- [ ] Are dependencies properly declared?
- [ ] Are edge cases documented?
- [ ] Is error handling addressed?

### 3.2 After Creating a Task

- [ ] Can someone unfamiliar with the project understand the task?
- [ ] Is all necessary information present?
- [ ] Are there no ambiguous terms or vague instructions?
- [ ] Is the task properly scoped (not too large, not too small)?
- [ ] Are all links and references valid?

## 4. Minimum Detail Requirements

### 4.1 NO Bare-Minimum Skeletons

**NEVER create tasks like this**:

```markdown
# Task: Implement feature X

## Description
Implement feature X

## Steps
1. Do the thing
2. Test it
3. Done
```

This is UNACCEPTABLE. It provides no value and wastes time.

### 4.2 Minimum Acceptable Detail

**ALWAYS create tasks like this**:

```markdown
# Task: Implement user search functionality

## Description
Implement a search feature that allows users to search for other users by name, email, or username. The search should support partial matching, be case-insensitive, and return results in real-time as the user types.

## Prerequisites
- [ ] User database schema includes searchable fields (name, email, username)
- [ ] Search API endpoint design approved
- [ ] Frontend search component design completed

## Steps
1. **Create search API endpoint**
   - Add GET /api/users/search route
   - Implement query parameter parsing (q=search_term)
   - Add pagination support (page, limit)
   
2. **Implement search logic**
   - Use database LIKE query for partial matching
   - Make search case-insensitive (LOWER function)
   - Search across name, email, and username fields
   - Order results by relevance (exact matches first)
   
3. **Add real-time search to frontend**
   - Create SearchInput component with debouncing (300ms)
   - Implement API call on input change
   - Display results in dropdown
   - Handle loading and error states

## Verification
- [ ] Search returns correct results for exact matches
- [ ] Search returns correct results for partial matches
- [ ] Search is case-insensitive
- [ ] Results update in real-time with debouncing
- [ ] Pagination works correctly
- [ ] Empty search returns no results
- [ ] Invalid queries handled gracefully

## Success Metrics
- Search response time < 200ms for queries
- Search accuracy > 95% for partial matches
- Zero errors in production for 7 days
```

## 5. Task Generation Examples

### 5.1 Basic Task Example

See section 4.2 above for a basic task example.

### 5.2 Intermediate Task Example

```markdown
# Task: Implement caching layer for API responses

## Description
Add a Redis-based caching layer to improve API response times for frequently accessed endpoints. Cache should support TTL, cache invalidation, and cache warming.

## Context
Current API response times are 500-800ms for user profile requests. Target is < 100ms. Caching will reduce database load and improve user experience.

## Prerequisites
- [ ] Redis server installed and configured
- [ ] Redis client library added to project
- [ ] Cache configuration schema defined
- [ ] Monitoring tools configured for cache metrics

## Inputs
- API request (endpoint, parameters)
- Cache configuration (TTL, invalidation rules)

## Outputs
- Cached response (if available)
- Fresh response from database (if cache miss)
- Cache metrics (hit rate, miss rate)

## Steps
1. **Install and configure Redis client**
   - Add redis npm package
   - Create Redis connection manager
   - Configure connection pooling
   - Add error handling for connection failures

2. **Implement cache middleware**
   - Create cache middleware function
   - Check cache before database query
   - Return cached response if available
   - Store fresh response in cache if miss
   - Add cache headers to response

3. **Implement cache invalidation**
   - Invalidate cache on data updates
   - Support pattern-based invalidation
   - Add manual invalidation endpoint
   - Log invalidation events

4. **Add cache warming**
   - Identify frequently accessed data
   - Pre-populate cache on server start
   - Schedule periodic cache refresh
   - Monitor cache warming effectiveness

## Dependencies
### Blocks
- `bd-redis-setup`: Redis server must be configured

### Related
- `bd-monitoring`: Cache metrics should be monitored

## Edge Cases
### Case 1: Redis connection failure
- **Condition**: Redis server unavailable
- **Handling**: Fall back to database, log error
- **Expected Outcome**: API continues to work, slower response times

### Case 2: Cache stampede
- **Condition**: Many requests for expired cache key
- **Handling**: Use cache locking to prevent multiple DB queries
- **Expected Outcome**: Only one DB query executed

## Error Handling
### Error 1: Redis connection timeout
- **Cause**: Network issues or Redis overload
- **Detection**: Connection timeout exception
- **Resolution**: Retry with exponential backoff, fall back to DB
- **Prevention**: Monitor Redis health, scale if needed

## Verification
- [ ] Cache hit rate > 80% for user profiles
- [ ] Response time < 100ms for cached requests
- [ ] Cache invalidation works on data updates
- [ ] System handles Redis failures gracefully
- [ ] Cache warming completes successfully on startup

## Success Metrics
- **Response Time**: < 100ms for cached requests (target: 50ms)
- **Cache Hit Rate**: > 80% (target: 90%)
- **Database Load**: Reduced by 70%

## Testing
### Unit Tests
- Cache middleware returns cached data
- Cache middleware stores fresh data
- Cache invalidation removes correct keys
- Error handling works for Redis failures

### Integration Tests
- End-to-end caching for user profiles
- Cache invalidation on profile updates
- Cache warming on server start
- Fallback to database on Redis failure

## Documentation
- [ ] Cache configuration documented
- [ ] Cache invalidation patterns documented
- [ ] Monitoring dashboard created
- [ ] Runbook for cache issues created

## Rollback Plan
1. Disable cache middleware via feature flag
2. Verify API works without cache
3. Monitor response times and database load
4. Investigate and fix cache issues
5. Re-enable cache when ready

## Estimated Effort
- **Time**: 8-12 hours
- **Complexity**: Medium
- **Risk**: Medium (Redis dependency)

## Resources
- [Redis documentation](https://redis.io/docs/)
- [Cache invalidation patterns](https://example.com/cache-patterns)
- [Monitoring dashboard](https://example.com/monitoring)
```

### 5.3 Advanced Task Example

```markdown
# Task: Implement distributed transaction coordinator for microservices

## Description
Build a distributed transaction coordinator using the Saga pattern to ensure data consistency across multiple microservices (User, Order, Payment, Inventory). The coordinator should handle both successful transactions and compensating transactions for failures.

## Context
Current system has data inconsistency issues when orders fail after payment is processed. Need a robust distributed transaction mechanism to ensure all-or-nothing semantics across services.

## Prerequisites
- [ ] All microservices expose transaction APIs (commit, rollback)
- [ ] Message queue (RabbitMQ/Kafka) configured
- [ ] Transaction state database schema created
- [ ] Monitoring and alerting configured
- [ ] Circuit breaker pattern implemented in all services

## Inputs
- **Transaction Request**: Order details, user ID, payment info
- **Service Endpoints**: URLs for all participating services
- **Compensation Logic**: Rollback procedures for each service

## Outputs
- **Transaction Result**: Success or failure with details
- **Transaction Log**: Complete audit trail
- **Compensation Events**: Rollback actions if needed

## Steps
1. **Design Saga orchestration**
   - Define transaction steps (create order → reserve inventory → process payment → confirm order)
   - Define compensation steps (cancel order → release inventory → refund payment)
   - Create state machine for transaction flow
   - Document failure scenarios and recovery paths

2. **Implement transaction coordinator**
   - Create Coordinator service with state management
   - Implement step execution with retry logic
   - Add timeout handling for each step
   - Store transaction state in database
   - Implement idempotency for all operations

3. **Implement compensation logic**
   - Create compensation handlers for each step
   - Implement reverse order execution
   - Add compensation retry logic
   - Log all compensation actions
   - Handle partial compensation failures

4. **Add monitoring and observability**
   - Instrument all transaction steps
   - Add distributed tracing (OpenTelemetry)
   - Create dashboards for transaction metrics
   - Set up alerts for failures
   - Log all state transitions

5. **Implement recovery mechanisms**
   - Add crash recovery for coordinator
   - Implement transaction replay from logs
   - Handle orphaned transactions
   - Add manual intervention endpoints
   - Create admin UI for transaction management

## Dependencies
### Blocks
- `bd-msg-queue`: Message queue must be configured
- `bd-circuit-breaker`: Circuit breakers must be implemented
- `bd-tracing`: Distributed tracing must be set up

### Blocked By
- `bd-order-api`: Order service transaction API
- `bd-payment-api`: Payment service transaction API
- `bd-inventory-api`: Inventory service transaction API

### Related
- `bd-monitoring`: Transaction metrics monitoring
- `bd-alerting`: Failure alerting system

## Edge Cases
### Case 1: Service timeout during transaction
- **Condition**: Service doesn't respond within timeout
- **Handling**: Mark step as failed, initiate compensation
- **Expected Outcome**: Transaction rolled back, user notified

### Case 2: Compensation failure
- **Condition**: Compensation step fails (e.g., refund fails)
- **Handling**: Retry with exponential backoff, alert on-call
- **Expected Outcome**: Manual intervention triggered

### Case 3: Coordinator crash mid-transaction
- **Condition**: Coordinator crashes during execution
- **Handling**: Recover from transaction log on restart
- **Expected Outcome**: Transaction resumed or compensated

### Case 4: Network partition
- **Condition**: Network split between services
- **Handling**: Use timeouts and circuit breakers
- **Expected Outcome**: Transaction fails safely, no partial commits

## Error Handling
### Error 1: Service unavailable
- **Cause**: Service down or unreachable
- **Detection**: Connection timeout or 503 response
- **Resolution**: Retry with backoff, then compensate
- **Prevention**: Health checks, circuit breakers

### Error 2: Duplicate transaction
- **Cause**: Client retry or network issue
- **Detection**: Transaction ID already exists
- **Resolution**: Return existing transaction result
- **Prevention**: Idempotency keys

### Error 3: Inconsistent state
- **Cause**: Compensation partially failed
- **Detection**: State machine in invalid state
- **Resolution**: Manual intervention via admin UI
- **Prevention**: Atomic state updates, transaction logs

## Verification
- [ ] Successful transaction commits all services
- [ ] Failed transaction compensates all completed steps
- [ ] Duplicate requests are idempotent
- [ ] Coordinator recovers from crashes
- [ ] Timeouts trigger compensation
- [ ] Circuit breakers prevent cascading failures
- [ ] All transactions logged completely
- [ ] Monitoring shows all transaction states
- [ ] Alerts fire for failures

## Success Metrics
- **Transaction Success Rate**: > 99.9%
- **Compensation Success Rate**: > 99.5%
- **Transaction Latency**: < 2 seconds (p95)
- **Recovery Time**: < 30 seconds after coordinator crash
- **Data Consistency**: 100% (no orphaned transactions)

## Testing
### Unit Tests
- State machine transitions correctly
- Compensation logic executes in reverse order
- Idempotency prevents duplicate execution
- Timeout handling works correctly
- Retry logic with exponential backoff

### Integration Tests
- End-to-end successful transaction
- End-to-end failed transaction with compensation
- Coordinator crash recovery
- Service timeout handling
- Network partition handling
- Duplicate request handling

### Chaos Tests
- Random service failures
- Network delays and partitions
- Coordinator crashes at various points
- Database failures
- Message queue failures

## Documentation
- [ ] Saga pattern architecture documented
- [ ] State machine diagram created
- [ ] API documentation for coordinator
- [ ] Runbook for common failures
- [ ] Admin UI user guide
- [ ] Monitoring dashboard guide

## Rollback Plan
1. Disable new transaction creation via feature flag
2. Allow in-flight transactions to complete
3. Monitor for orphaned transactions
4. Manually resolve any inconsistencies
5. Revert to previous transaction mechanism
6. Investigate and fix issues
7. Re-enable when ready

## Estimated Effort
- **Time**: 40-60 hours (2-3 weeks)
- **Complexity**: High
- **Risk**: High (distributed systems complexity)

## Resources
- [Saga pattern documentation](https://microservices.io/patterns/data/saga.html)
- [Distributed transactions guide](https://example.com/distributed-tx)
- [OpenTelemetry tracing](https://opentelemetry.io/)
- [Circuit breaker pattern](https://example.com/circuit-breaker)
- [Transaction coordinator design doc](https://example.com/design-doc)
```

## 6. Anti-Patterns (What NOT to Do)

### 6.1 Vague Descriptions

❌ **BAD**: "Fix the bug"
✅ **GOOD**: "Fix null pointer exception in user profile page when user has no avatar"

### 6.2 Missing Context

❌ **BAD**: "Update the API"
✅ **GOOD**: "Update user API to include profile picture URL in response payload"

### 6.3 No Verification

❌ **BAD**: Steps listed, no verification
✅ **GOOD**: Clear, testable verification criteria for each requirement

### 6.4 Unclear Dependencies

❌ **BAD**: "Depends on other stuff"
✅ **GOOD**: "Blocks: bd-auth (user authentication must be complete before profile features)"

### 6.5 No Error Handling

❌ **BAD**: Happy path only
✅ **GOOD**: Document known failure modes and how to handle them

## Summary

Task generation is NOT about creating quick skeletons. It's about creating comprehensive, actionable, and complete task descriptions that enable efficient execution without additional research or clarification.

**Remember**: Time spent creating a detailed task saves 10x the time during execution.

