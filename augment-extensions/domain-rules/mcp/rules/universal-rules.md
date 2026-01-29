# Universal MCP Rules

## Overview

These rules apply to **all MCP types** (token, state, vector, hybrid, graph, compressed). They represent cross-cutting concerns that every MCP implementation must address.

---

## 1. Context Optimization

### Compression
- **Apply before limits**: Compress context before hitting token/memory limits
- **Lossy vs lossless**: Choose based on fidelity requirements
- **Incremental**: Compress incrementally, not all at once
- **Metrics**: Track compression ratio and fidelity loss

### Prioritization
- **Relevance scoring**: Rank context by semantic relevance to current query
- **Recency bias**: Weight recent context higher (exponential decay)
- **Importance tagging**: Mark critical context for preservation
- **Dynamic ranking**: Re-rank on each request based on query

### Deduplication
- **Exact matching**: Remove identical content across sources
- **Semantic dedup**: Detect and merge semantically similar content
- **Cross-source**: Deduplicate across token/vector/state memories
- **Preserve provenance**: Track original sources after dedup

### Budgeting
- **Allocation**: Define budget for system/user/retrieved/output tokens
- **Monitoring**: Track actual vs budgeted usage
- **Dynamic adjustment**: Reallocate based on request type
- **Overflow handling**: Define fallback when budget exceeded

---

## 2. Error Handling

### Overflow
- **Graceful degradation**: Drop lowest-priority context first
- **User notification**: Inform user when context truncated
- **Fallback strategies**: Define default behavior (summarize, chunk, fail)
- **Recovery**: Attempt to recover on next request

### Corruption
- **Validation**: Validate context schema on load
- **Checksums**: Use checksums/hashes for integrity
- **Rollback**: Revert to last known good state
- **Logging**: Log corruption events with full context

### Fallbacks
- **Default context**: Define minimal viable context
- **Retry logic**: Retry with exponential backoff
- **Circuit breakers**: Disable failing context sources
- **Degraded mode**: Continue with reduced functionality

### Logging
- **Structured logs**: Use JSON with context metadata
- **Correlation IDs**: Track requests across services
- **Error context**: Include full error context in logs
- **Sampling**: Sample high-volume logs to reduce noise

---

## 3. Security and Privacy

### PII Prevention
- **Detection**: Use NER/regex to detect PII (SSN, email, phone, etc.)
- **Redaction**: Replace PII with placeholders or hashes
- **Audit**: Log PII detection events
- **Compliance**: Follow GDPR, CCPA, HIPAA requirements

### Access Controls
- **Context-level permissions**: Enforce read/write permissions per context
- **Isolation**: Isolate context between users/tenants
- **Encryption**: Encrypt sensitive context at rest and in transit
- **Audit trails**: Log all context access and modifications

### Sanitization
- **Input validation**: Validate and sanitize user inputs
- **Injection prevention**: Prevent prompt injection attacks
- **Output filtering**: Filter sensitive data from outputs
- **Escaping**: Escape special characters in context

### Audit Trails
- **Who**: Track user/agent accessing context
- **What**: Log operations (read, write, delete)
- **When**: Timestamp all operations
- **Why**: Include request context/purpose

---

## 4. Monitoring and Observability

### Token Usage
- **Per-request**: Track tokens consumed per request
- **Per-session**: Aggregate tokens across session
- **Per-user**: Monitor user-level token consumption
- **Cost tracking**: Calculate cost based on token usage

### Retrieval Metrics
- **Recall@K**: Measure retrieval recall at K results
- **Precision**: Measure retrieval precision
- **Latency**: Track p50, p95, p99 retrieval latency
- **Cache hit rate**: Monitor cache effectiveness

### Hallucination Detection
- **Factual consistency**: Check outputs against retrieved context
- **Source attribution**: Verify claims have source citations
- **Confidence scores**: Track model confidence on outputs
- **Human feedback**: Collect user feedback on accuracy

### Drift Detection
- **Context quality**: Monitor context relevance over time
- **Embedding drift**: Detect embedding model drift
- **Schema changes**: Track context schema evolution
- **Performance degradation**: Alert on metric degradation

---

## 5. Testing and Validation

### Synthetic Testing
- **Replay scenarios**: Save and replay known contexts
- **Golden datasets**: Maintain test datasets with expected outputs
- **Regression tests**: Validate against previous versions
- **Coverage**: Ensure test coverage of all context paths

### Adversarial Testing
- **Malformed context**: Test with invalid/corrupted context
- **Oversized context**: Test with context exceeding limits
- **Injection attacks**: Test prompt injection scenarios
- **Edge cases**: Test boundary conditions

### Performance Testing
- **Load testing**: Test under high request volume
- **Stress testing**: Test at maximum capacity
- **Latency testing**: Measure response times
- **Scalability testing**: Test horizontal scaling

### Regression Testing
- **Baseline metrics**: Establish performance baselines
- **Change validation**: Test after code/config changes
- **A/B testing**: Compare new vs old implementations
- **Rollback criteria**: Define when to rollback changes

---

## 6. Documentation Standards

### Type Hints
- **Full annotations**: Type all context structures
- **Generic types**: Use TypedDict, Pydantic, dataclasses
- **Optional fields**: Mark optional fields explicitly
- **Version compatibility**: Document type changes across versions

### Docstrings
- **Context schemas**: Document expected context structure
- **Transformations**: Explain context transformations
- **Side effects**: Document state mutations
- **Examples**: Provide input/output examples

### Examples
- **Before/after**: Show context before and after transformations
- **Edge cases**: Document edge case handling
- **Error scenarios**: Show error handling examples
- **Integration**: Provide end-to-end examples

### Versioning
- **Schema versions**: Version context schemas
- **Migration guides**: Document schema migrations
- **Deprecation**: Mark deprecated fields/patterns
- **Changelog**: Maintain detailed changelog

---

## Best Practices Summary

✅ **DO**:
- Compress context before hitting limits
- Validate context on load and mutation
- Log all errors with full context
- Monitor token usage and retrieval metrics
- Test with adversarial inputs
- Document context schemas with types

❌ **DON'T**:
- Store PII in context without redaction
- Ignore context overflow errors
- Skip validation on deserialization
- Log sensitive data in plaintext
- Deploy without performance testing
- Change schemas without versioning

