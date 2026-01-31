# Effectiveness Standards for Beads Tasks

## Overview

This document defines effectiveness rules ensuring high-quality task content. These standards ensure tasks are atomic, complete, clear, testable, and maintainable.

## 1. Atomicity Principles

### 1.1 Single-Purpose Tasks

Each task MUST focus on ONE specific objective.

**✅ GOOD - Atomic Task**:
```
Title: Implement user login endpoint
Description: Create POST /api/auth/login endpoint with email/password validation and JWT token generation
```

**❌ BAD - Non-Atomic Task**:
```
Title: Implement authentication system
Description: Create login, registration, password reset, email verification, and session management
```

### 1.2 Decomposition Guidelines

If a task description requires "and" more than twice, it should be split:

**Split this**:
- "Create user model AND add validation AND implement CRUD endpoints AND write tests"

**Into these**:
1. "Create user model with validation"
2. "Implement user CRUD endpoints"
3. "Write tests for user endpoints"

### 1.3 Scope Boundaries

Tasks should be completable in:
- **Small tasks**: 1-4 hours
- **Medium tasks**: 4-8 hours
- **Large tasks**: 8-16 hours (max)

If a task exceeds 16 hours, it MUST be decomposed.

## 2. Completeness Requirements

### 2.1 All Necessary Information

Tasks MUST include:
- **What**: Clear description of deliverable
- **Why**: Context and purpose
- **How**: Detailed steps
- **When**: Prerequisites and dependencies
- **Where**: Affected files/components
- **Who**: Required skills/expertise

### 2.2 No Missing Context

**✅ GOOD - Complete Context**:
```markdown
## Description
Implement rate limiting middleware to prevent API abuse. Current system allows unlimited requests, causing server overload during traffic spikes. Rate limit should be 100 requests per minute per IP address.

## Context
Recent DDoS attack caused 3-hour outage. Rate limiting will prevent similar incidents and protect server resources.
```

**❌ BAD - Missing Context**:
```markdown
## Description
Add rate limiting
```

### 2.3 Resource Completeness

Tasks MUST include:
- Links to relevant documentation
- References to related code
- Examples or templates
- Configuration requirements

## 3. Clarity Standards

### 3.1 Unambiguous Instructions

Every step MUST be clear and specific.

**✅ GOOD - Clear Instructions**:
```markdown
1. Create `src/middleware/rateLimit.ts` file
2. Import `express-rate-limit` package
3. Configure rate limiter with 100 requests per minute
4. Apply middleware to all `/api/*` routes
```

**❌ BAD - Ambiguous Instructions**:
```markdown
1. Add rate limiting
2. Configure it
3. Use it
```

### 3.2 Terminology Consistency

Use consistent terminology throughout:
- **User** vs **Customer** vs **Account** - Pick ONE
- **Endpoint** vs **Route** vs **API** - Pick ONE
- **Database** vs **DB** vs **Data Store** - Pick ONE

### 3.3 Avoid Jargon

Explain technical terms or provide links:

**✅ GOOD**:
```markdown
Implement JWT (JSON Web Token) authentication. See: https://jwt.io/introduction
```

**❌ BAD**:
```markdown
Implement JWT auth
```

## 4. Testability Criteria

### 4.1 Clear Success Metrics

Every task MUST have measurable success criteria.

**✅ GOOD - Measurable**:
```markdown
## Success Metrics
- Rate limiter blocks requests after 100 per minute
- Response time < 50ms for rate limit check
- 429 status code returned when limit exceeded
- Rate limit resets after 1 minute
```

**❌ BAD - Not Measurable**:
```markdown
## Success Metrics
- Rate limiting works
- Performance is good
```

### 4.2 Verification Checklist

Tasks MUST include specific, testable verification criteria.

**✅ GOOD - Testable Verification**:
```markdown
## Verification
- [ ] Send 100 requests in 1 minute - all succeed
- [ ] Send 101st request - receives 429 status
- [ ] Wait 1 minute - rate limit resets
- [ ] Different IPs have independent limits
```

**❌ BAD - Not Testable**:
```markdown
## Verification
- [ ] Rate limiting works
- [ ] System is protected
```

### 4.3 Test Coverage Requirements

Tasks MUST specify required tests:
- **Unit tests**: For individual functions/methods
- **Integration tests**: For component interactions
- **End-to-end tests**: For complete workflows

## 5. Maintainability Guidelines

### 5.1 Documentation Requirements

Tasks MUST specify documentation updates:
- **Code comments**: Inline documentation
- **API docs**: Endpoint documentation
- **README**: User-facing documentation
- **Runbooks**: Operational procedures

### 5.2 Versioning Requirements

Tasks MUST include:
- **Version number**: Semantic versioning
- **Changelog entry**: What changed and why
- **Migration guide**: If breaking changes

### 5.3 Future-Proofing

Tasks SHOULD consider:
- **Extensibility**: Can this be extended later?
- **Backwards compatibility**: Will this break existing code?
- **Deprecation path**: If replacing existing functionality

## 6. Effectiveness Checklist

### 6.1 Before Creating a Task

- [ ] **Atomic**: Does this task have a single, clear purpose?
- [ ] **Complete**: Is all necessary information included?
- [ ] **Clear**: Are instructions unambiguous and specific?
- [ ] **Testable**: Are success criteria measurable?
- [ ] **Maintainable**: Are documentation requirements specified?

### 6.2 After Creating a Task

- [ ] Can someone unfamiliar execute this task without questions?
- [ ] Are all edge cases documented?
- [ ] Are all error scenarios handled?
- [ ] Is the scope appropriate (not too large, not too small)?
- [ ] Are dependencies explicitly declared?

## 7. Measurement Criteria

### 7.1 Task Quality Metrics

**High-Quality Task**:
- Completeness score: 100% (all sections present)
- Clarity score: > 90% (minimal ambiguity)
- Testability score: 100% (all criteria measurable)
- Execution time: Within estimated range

**Low-Quality Task**:
- Completeness score: < 70% (missing sections)
- Clarity score: < 60% (ambiguous instructions)
- Testability score: < 70% (vague criteria)
- Execution time: 2x+ estimated time

### 7.2 Effectiveness Indicators

**Effective Task**:
- ✅ Executed without clarification questions
- ✅ Completed within estimated time
- ✅ All verification criteria met
- ✅ No rework required

**Ineffective Task**:
- ❌ Multiple clarification questions needed
- ❌ Significantly over/under estimated time
- ❌ Verification criteria unclear or incomplete
- ❌ Rework required due to missing requirements

## Summary

Effectiveness standards ensure tasks are:
- **Atomic**: Single-purpose, appropriately scoped
- **Complete**: All information present, no missing context
- **Clear**: Unambiguous, specific, consistent terminology
- **Testable**: Measurable success criteria, specific verification
- **Maintainable**: Documentation requirements, versioning, future-proofing

**Remember**: An effective task is one that can be executed successfully without additional clarification or research.

