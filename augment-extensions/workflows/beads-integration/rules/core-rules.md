# Core Rules for Beads Task Generation

## Overview

This document defines the universal guidelines that apply to all Beads task generation. These core rules ensure consistency, quality, and effectiveness across all tasks created by AI agents.

## 1. Task Structure Requirements

### 1.1 Required Sections

Every Beads task MUST include:

1. **Title**: Clear, concise, action-oriented (verb + object)
2. **Description**: Comprehensive explanation of what needs to be done
3. **Prerequisites**: What must be completed or available before starting
4. **Steps**: Detailed, ordered list of actions to complete the task
5. **Verification**: Clear criteria for determining task completion
6. **Success Metrics**: Measurable outcomes that define success

### 1.2 Description Format

```markdown
## Description

[Comprehensive explanation of the task]

## Prerequisites

- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Steps

1. Step 1 with details
2. Step 2 with details
3. Step 3 with details

## Verification

- [ ] Verification criterion 1
- [ ] Verification criterion 2

## Success Metrics

- Metric 1: [measurable outcome]
- Metric 2: [measurable outcome]
```

### 1.3 Title Guidelines

**DO**:
- ✅ Use action verbs: "Implement", "Create", "Update", "Fix", "Refactor"
- ✅ Be specific: "Create user authentication module" not "Work on auth"
- ✅ Keep concise: 50-80 characters maximum

**DON'T**:
- ❌ Use vague language: "Handle stuff", "Do things"
- ❌ Be overly verbose: "Create a comprehensive and detailed user authentication module with all necessary features"
- ❌ Use passive voice: "Authentication should be implemented"

## 2. Quality Standards

### 2.1 Clarity

Tasks MUST be:
- **Unambiguous**: No room for multiple interpretations
- **Specific**: Concrete actions, not abstract concepts
- **Actionable**: Clear what to do, not just what to achieve

### 2.2 Completeness

Tasks MUST include:
- **All necessary information**: No missing context
- **All required resources**: Links, references, examples
- **All edge cases**: Known exceptions and special scenarios

### 2.3 Actionability

Tasks MUST be:
- **Immediately executable**: No additional research required
- **Self-contained**: All information needed is present
- **Properly scoped**: Not too large, not too small

## 3. Versioning and Logging

### 3.1 Task Versioning

- Use semantic versioning for task updates: MAJOR.MINOR.PATCH
- Document changes in task comments
- Track task evolution over time

### 3.2 Logging Requirements

Every task update MUST log:
- **What changed**: Specific modifications made
- **Why it changed**: Reason for the update
- **Who changed it**: Author of the update
- **When it changed**: Timestamp of the update

## 4. Dependency Management

### 4.1 Explicit Dependencies

Tasks MUST declare:
- **Blocking dependencies**: Tasks that must complete first
- **Blocked tasks**: Tasks that depend on this task
- **Related tasks**: Tasks in the same feature/epic

### 4.2 Dependency Format

```json
{
  "dependencies": [
    {
      "issue_id": "bd-child",
      "depends_on_id": "bd-parent",
      "type": "blocks"
    }
  ]
}
```

## 5. Error Handling Standards

### 5.1 Error Scenarios

Tasks MUST document:
- **Known failure modes**: What can go wrong
- **Error handling**: How to handle failures
- **Rollback procedures**: How to undo changes if needed

### 5.2 Error Documentation Format

```markdown
## Error Handling

### Scenario 1: [Error description]
- **Cause**: [What causes this error]
- **Detection**: [How to detect this error]
- **Resolution**: [How to fix this error]
- **Prevention**: [How to prevent this error]
```

## 6. Examples

### Example 1: Well-Structured Task

**Title**: Implement user authentication module

**Description**: Create a user authentication module with email/password login, JWT token generation, and session management.

**Prerequisites**:
- [ ] Database schema for users table created
- [ ] JWT library installed
- [ ] Environment variables configured

**Steps**:
1. Create User model with email and password fields
2. Implement password hashing using bcrypt
3. Create login endpoint that validates credentials
4. Generate JWT token on successful login
5. Implement token verification middleware
6. Add session management with refresh tokens

**Verification**:
- [ ] User can register with email and password
- [ ] User can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] JWT token is generated and valid
- [ ] Protected routes require valid token

**Success Metrics**:
- All authentication tests pass (100% coverage)
- Login response time < 200ms
- Token expiration works correctly

### Example 2: Task with Dependencies

**Title**: Create user profile page

**Description**: Build user profile page displaying user information and allowing profile updates.

**Prerequisites**:
- [ ] User authentication module completed (bd-auth)
- [ ] User model includes profile fields
- [ ] Frontend routing configured

**Dependencies**:
- Blocks: bd-auth (user authentication module)
- Related: bd-settings (user settings page)

**Steps**:
1. Create profile component with user data display
2. Add form for editing profile information
3. Implement profile update API endpoint
4. Add validation for profile fields
5. Connect frontend to backend API

**Verification**:
- [ ] Profile page displays user information
- [ ] User can edit and save profile changes
- [ ] Validation prevents invalid data
- [ ] Changes persist after page reload

**Success Metrics**:
- Profile update success rate > 99%
- Form validation catches all invalid inputs
- UI responsive on mobile and desktop

## Summary

These core rules ensure that all Beads tasks are:
- **Structured**: Follow consistent format
- **Complete**: Include all necessary information
- **Clear**: Unambiguous and actionable
- **Traceable**: Versioned and logged
- **Connected**: Properly linked with dependencies
- **Robust**: Handle errors gracefully

