# Bead Decomposition Patterns for WordPress Plugin Development

This document provides reusable patterns for breaking down WordPress plugin development tasks into Beads tasks with proper dependencies.

## Table of Contents

1. [Plugin Creation Pattern](#plugin-creation-pattern)
2. [Feature Addition Pattern](#feature-addition-pattern)
3. [Custom Post Type Pattern](#custom-post-type-pattern)
4. [Settings Page Pattern](#settings-page-pattern)
5. [AJAX Feature Pattern](#ajax-feature-pattern)
6. [REST API Endpoint Pattern](#rest-api-endpoint-pattern)
7. [Custom Database Table Pattern](#custom-database-table-pattern)
8. [Security Audit Pattern](#security-audit-pattern)
9. [WordPress.org Submission Pattern](#wordpress-org-submission-pattern)
10. [Bug Fix Pattern](#bug-fix-pattern)

---

## Plugin Creation Pattern

**Use Case**: Creating a new WordPress plugin from scratch

**Epic Structure**:

```bash
# Create epic
bd create "Create [Plugin Name] plugin" -p 0 --type epic --label plugin-creation

# Subtasks
bd create "Create plugin scaffolding" -p 1 --parent [epic-id] --label scaffolding
bd create "Create main plugin file with header" -p 1 --parent [epic-id] --label scaffolding
bd create "Create directory structure" -p 1 --parent [epic-id] --label scaffolding
bd create "Create activation/deactivation hooks" -p 1 --parent [epic-id] --label scaffolding
bd create "Create uninstall.php" -p 1 --parent [epic-id] --label scaffolding

bd create "Implement core functionality" -p 2 --parent [epic-id] --label core
bd create "Create core classes" -p 2 --parent [epic-id] --label core
bd create "Implement admin interface" -p 2 --parent [epic-id] --label admin
bd create "Implement frontend display" -p 2 --parent [epic-id] --label frontend

bd create "Add security measures" -p 3 --parent [epic-id] --label security
bd create "Add nonce verification" -p 3 --parent [epic-id] --label security
bd create "Add capability checks" -p 3 --parent [epic-id] --label security
bd create "Add input sanitization" -p 3 --parent [epic-id] --label security
bd create "Add output escaping" -p 3 --parent [epic-id] --label security

bd create "Create tests" -p 4 --parent [epic-id] --label testing
bd create "Set up PHPUnit" -p 4 --parent [epic-id] --label testing
bd create "Write unit tests" -p 4 --parent [epic-id] --label testing
bd create "Write integration tests" -p 4 --parent [epic-id] --label testing

bd create "Create documentation" -p 5 --parent [epic-id] --label documentation
bd create "Create readme.txt" -p 5 --parent [epic-id] --label documentation
bd create "Add inline documentation" -p 5 --parent [epic-id] --label documentation
```

**Dependencies**:

```bash
# Scaffolding tasks are sequential
bd dep add [main-file-id] [epic-id]
bd dep add [directory-id] [main-file-id]
bd dep add [hooks-id] [directory-id]
bd dep add [uninstall-id] [hooks-id]

# Core depends on scaffolding
bd dep add [core-classes-id] [uninstall-id]
bd dep add [admin-id] [core-classes-id]
bd dep add [frontend-id] [core-classes-id]

# Security depends on core
bd dep add [nonce-id] [admin-id]
bd dep add [nonce-id] [frontend-id]
bd dep add [capability-id] [admin-id]
bd dep add [sanitization-id] [admin-id]
bd dep add [sanitization-id] [frontend-id]
bd dep add [escaping-id] [admin-id]
bd dep add [escaping-id] [frontend-id]

# Testing depends on security
bd dep add [phpunit-id] [escaping-id]
bd dep add [unit-tests-id] [phpunit-id]
bd dep add [integration-tests-id] [phpunit-id]

# Documentation can run in parallel with testing
bd dep add [readme-id] [escaping-id]
bd dep add [inline-docs-id] [escaping-id]
```

**Task Count**: 17 tasks
**Estimated Time**: 2-4 weeks

---

## Feature Addition Pattern

**Use Case**: Adding a new feature to an existing plugin

**Epic Structure**:

```bash
# Create epic
bd create "Add [Feature Name] to [Plugin Name]" -p 0 --type epic --label feature-addition

# Planning
bd create "Create OpenSpec spec for feature" -p 1 --parent [epic-id] --label planning
bd create "Design database schema (if needed)" -p 1 --parent [epic-id] --label planning

# Implementation
bd create "Create feature class" -p 2 --parent [epic-id] --label implementation
bd create "Add database migration (if needed)" -p 2 --parent [epic-id] --label implementation
bd create "Implement core logic" -p 2 --parent [epic-id] --label implementation
bd create "Add admin interface" -p 2 --parent [epic-id] --label implementation
bd create "Add frontend display" -p 2 --parent [epic-id] --label implementation
bd create "Add AJAX handlers (if needed)" -p 2 --parent [epic-id] --label implementation

# Integration
bd create "Integrate with existing code" -p 3 --parent [epic-id] --label integration
bd create "Add hooks and filters" -p 3 --parent [epic-id] --label integration
bd create "Update settings page" -p 3 --parent [epic-id] --label integration

# Security
bd create "Add security measures" -p 4 --parent [epic-id] --label security
bd create "Run security audit" -p 4 --parent [epic-id] --label security

# Testing
bd create "Write unit tests" -p 5 --parent [epic-id] --label testing
bd create "Write integration tests" -p 5 --parent [epic-id] --label testing
bd create "Manual testing" -p 5 --parent [epic-id] --label testing

# Documentation
bd create "Update readme.txt" -p 6 --parent [epic-id] --label documentation
bd create "Add inline documentation" -p 6 --parent [epic-id] --label documentation
```

**Dependencies**:

```bash
# Implementation depends on planning
bd dep add [feature-class-id] [openspec-id]
bd dep add [migration-id] [schema-id]
bd dep add [core-logic-id] [feature-class-id]
bd dep add [admin-id] [core-logic-id]
bd dep add [frontend-id] [core-logic-id]
bd dep add [ajax-id] [core-logic-id]

# Integration depends on implementation
bd dep add [integrate-id] [admin-id]
bd dep add [integrate-id] [frontend-id]
bd dep add [hooks-id] [integrate-id]
bd dep add [settings-id] [integrate-id]

# Security depends on integration
bd dep add [security-measures-id] [settings-id]
bd dep add [security-audit-id] [security-measures-id]

# Testing depends on security
bd dep add [unit-tests-id] [security-audit-id]
bd dep add [integration-tests-id] [security-audit-id]
bd dep add [manual-testing-id] [integration-tests-id]

# Documentation depends on testing
bd dep add [readme-id] [manual-testing-id]
bd dep add [inline-docs-id] [manual-testing-id]
```

**Task Count**: 18 tasks
**Estimated Time**: 1-2 weeks

---

## Custom Post Type Pattern

**Use Case**: Adding a custom post type with taxonomy and meta boxes

**Epic Structure**:

```bash
# Create epic
bd create "Add [Post Type Name] custom post type" -p 0 --type epic --label custom-post-type

# Registration
bd create "Register custom post type" -p 1 --parent [epic-id] --label registration
bd create "Register custom taxonomy" -p 1 --parent [epic-id] --label registration
bd create "Add rewrite rules" -p 1 --parent [epic-id] --label registration

# Admin Interface
bd create "Add custom meta boxes" -p 2 --parent [epic-id] --label admin
bd create "Add custom columns to list view" -p 2 --parent [epic-id] --label admin
bd create "Add quick edit support" -p 2 --parent [epic-id] --label admin
bd create "Add bulk actions" -p 2 --parent [epic-id] --label admin

# Frontend Display
bd create "Create archive template" -p 3 --parent [epic-id] --label frontend
bd create "Create single template" -p 3 --parent [epic-id] --label frontend
bd create "Add shortcode for display" -p 3 --parent [epic-id] --label frontend
bd create "Add widget (optional)" -p 3 --parent [epic-id] --label frontend

# Security
bd create "Add capability checks for meta boxes" -p 4 --parent [epic-id] --label security
bd create "Add nonce verification for meta saves" -p 4 --parent [epic-id] --label security
bd create "Sanitize meta box inputs" -p 4 --parent [epic-id] --label security

# Testing
bd create "Test post type registration" -p 5 --parent [epic-id] --label testing
bd create "Test meta box functionality" -p 5 --parent [epic-id] --label testing
bd create "Test frontend display" -p 5 --parent [epic-id] --label testing
```

**Dependencies**:

```bash
# Taxonomy and rewrite depend on post type
bd dep add [taxonomy-id] [post-type-id]
bd dep add [rewrite-id] [post-type-id]

# Admin features depend on registration
bd dep add [meta-boxes-id] [rewrite-id]
bd dep add [columns-id] [rewrite-id]
bd dep add [quick-edit-id] [columns-id]
bd dep add [bulk-actions-id] [columns-id]

# Frontend depends on registration
bd dep add [archive-id] [rewrite-id]
bd dep add [single-id] [rewrite-id]
bd dep add [shortcode-id] [single-id]
bd dep add [widget-id] [shortcode-id]

# Security depends on admin features
bd dep add [capability-id] [meta-boxes-id]
bd dep add [nonce-id] [meta-boxes-id]
bd dep add [sanitize-id] [meta-boxes-id]

# Testing depends on security
bd dep add [test-registration-id] [sanitize-id]
bd dep add [test-meta-id] [sanitize-id]
bd dep add [test-frontend-id] [widget-id]
```

**Task Count**: 17 tasks
**Estimated Time**: 1 week

---

## Settings Page Pattern

**Use Case**: Adding a settings page with WordPress Settings API

**Epic Structure**:

```bash
# Create epic
bd create "Add [Settings Page Name] settings page" -p 0 --type epic --label settings-page

# Page Setup
bd create "Register settings page" -p 1 --parent [epic-id] --label setup
bd create "Create page template" -p 1 --parent [epic-id] --label setup
bd create "Add menu item" -p 1 --parent [epic-id] --label setup

# Settings API
bd create "Register settings" -p 2 --parent [epic-id] --label settings-api
bd create "Add settings sections" -p 2 --parent [epic-id] --label settings-api
bd create "Add settings fields" -p 2 --parent [epic-id] --label settings-api
bd create "Add sanitization callbacks" -p 2 --parent [epic-id] --label settings-api

# UI Components
bd create "Create field renderers" -p 3 --parent [epic-id] --label ui
bd create "Add tabs (if multiple sections)" -p 3 --parent [epic-id] --label ui
bd create "Add reset to defaults button" -p 3 --parent [epic-id] --label ui
bd create "Add import/export (optional)" -p 3 --parent [epic-id] --label ui

# Security
bd create "Add nonce verification" -p 4 --parent [epic-id] --label security
bd create "Add capability checks" -p 4 --parent [epic-id] --label security
bd create "Sanitize all inputs" -p 4 --parent [epic-id] --label security

# Testing
bd create "Test settings save/load" -p 5 --parent [epic-id] --label testing
bd create "Test sanitization" -p 5 --parent [epic-id] --label testing
bd create "Test reset functionality" -p 5 --parent [epic-id] --label testing
```

**Dependencies**:

```bash
# Page template and menu depend on registration
bd dep add [template-id] [register-id]
bd dep add [menu-id] [register-id]

# Settings API depends on page setup
bd dep add [register-settings-id] [menu-id]
bd dep add [sections-id] [register-settings-id]
bd dep add [fields-id] [sections-id]
bd dep add [sanitization-id] [fields-id]

# UI depends on Settings API
bd dep add [renderers-id] [sanitization-id]
bd dep add [tabs-id] [renderers-id]
bd dep add [reset-id] [renderers-id]
bd dep add [import-export-id] [reset-id]

# Security depends on UI
bd dep add [nonce-id] [import-export-id]
bd dep add [capability-id] [import-export-id]
bd dep add [sanitize-inputs-id] [import-export-id]

# Testing depends on security
bd dep add [test-save-id] [sanitize-inputs-id]
bd dep add [test-sanitization-id] [sanitize-inputs-id]
bd dep add [test-reset-id] [sanitize-inputs-id]
```

**Task Count**: 17 tasks
**Estimated Time**: 3-5 days

---

## AJAX Feature Pattern

**Use Case**: Adding AJAX functionality to a plugin

**Epic Structure**:

```bash
# Create epic
bd create "Add AJAX [Feature Name]" -p 0 --type epic --label ajax-feature

# Backend Setup
bd create "Create AJAX handler function" -p 1 --parent [epic-id] --label backend
bd create "Register AJAX actions" -p 1 --parent [epic-id] --label backend
bd create "Add response formatting" -p 1 --parent [epic-id] --label backend

# Frontend Setup
bd create "Create JavaScript file" -p 2 --parent [epic-id] --label frontend
bd create "Enqueue script with dependencies" -p 2 --parent [epic-id] --label frontend
bd create "Localize script with ajax_url and nonce" -p 2 --parent [epic-id] --label frontend

# Implementation
bd create "Implement AJAX request logic" -p 3 --parent [epic-id] --label implementation
bd create "Add loading state UI" -p 3 --parent [epic-id] --label implementation
bd create "Add success handler" -p 3 --parent [epic-id] --label implementation
bd create "Add error handler" -p 3 --parent [epic-id] --label implementation

# Security
bd create "Add nonce verification in handler" -p 4 --parent [epic-id] --label security
bd create "Add capability checks" -p 4 --parent [epic-id] --label security
bd create "Sanitize inputs" -p 4 --parent [epic-id] --label security
bd create "Escape outputs" -p 4 --parent [epic-id] --label security

# Testing
bd create "Test AJAX request/response" -p 5 --parent [epic-id] --label testing
bd create "Test error handling" -p 5 --parent [epic-id] --label testing
bd create "Test security measures" -p 5 --parent [epic-id] --label testing
```

**Dependencies**:

```bash
# Backend tasks are sequential
bd dep add [register-actions-id] [handler-id]
bd dep add [response-id] [register-actions-id]

# Frontend depends on backend
bd dep add [js-file-id] [response-id]
bd dep add [enqueue-id] [js-file-id]
bd dep add [localize-id] [enqueue-id]

# Implementation depends on frontend setup
bd dep add [request-logic-id] [localize-id]
bd dep add [loading-ui-id] [request-logic-id]
bd dep add [success-handler-id] [request-logic-id]
bd dep add [error-handler-id] [request-logic-id]

# Security depends on implementation
bd dep add [nonce-verify-id] [error-handler-id]
bd dep add [capability-id] [error-handler-id]
bd dep add [sanitize-id] [error-handler-id]
bd dep add [escape-id] [error-handler-id]

# Testing depends on security
bd dep add [test-ajax-id] [escape-id]
bd dep add [test-errors-id] [escape-id]
bd dep add [test-security-id] [escape-id]
```

**Task Count**: 17 tasks
**Estimated Time**: 2-3 days

---

## REST API Endpoint Pattern

**Use Case**: Adding a REST API endpoint to a plugin

**Epic Structure**:

```bash
# Create epic
bd create "Add REST API endpoint for [Resource]" -p 0 --type epic --label rest-api

# Endpoint Setup
bd create "Register REST route" -p 1 --parent [epic-id] --label setup
bd create "Create callback function" -p 1 --parent [epic-id] --label setup
bd create "Add permission callback" -p 1 --parent [epic-id] --label setup

# Request Handling
bd create "Define request parameters" -p 2 --parent [epic-id] --label request
bd create "Add parameter validation" -p 2 --parent [epic-id] --label request
bd create "Add parameter sanitization" -p 2 --parent [epic-id] --label request

# Response Handling
bd create "Implement GET handler" -p 3 --parent [epic-id] --label response
bd create "Implement POST handler" -p 3 --parent [epic-id] --label response
bd create "Implement PUT handler (optional)" -p 3 --parent [epic-id] --label response
bd create "Implement DELETE handler (optional)" -p 3 --parent [epic-id] --label response
bd create "Format response data" -p 3 --parent [epic-id] --label response

# Security
bd create "Add authentication check" -p 4 --parent [epic-id] --label security
bd create "Add authorization check" -p 4 --parent [epic-id] --label security
bd create "Add rate limiting (optional)" -p 4 --parent [epic-id] --label security

# Testing
bd create "Test GET requests" -p 5 --parent [epic-id] --label testing
bd create "Test POST requests" -p 5 --parent [epic-id] --label testing
bd create "Test authentication/authorization" -p 5 --parent [epic-id] --label testing
bd create "Test error responses" -p 5 --parent [epic-id] --label testing

# Documentation
bd create "Document API endpoint" -p 6 --parent [epic-id] --label documentation
bd create "Add usage examples" -p 6 --parent [epic-id] --label documentation
```

**Dependencies**:

```bash
# Setup tasks are sequential
bd dep add [callback-id] [route-id]
bd dep add [permission-id] [callback-id]

# Request handling depends on setup
bd dep add [parameters-id] [permission-id]
bd dep add [validation-id] [parameters-id]
bd dep add [sanitization-id] [validation-id]

# Response handlers depend on request handling
bd dep add [get-handler-id] [sanitization-id]
bd dep add [post-handler-id] [sanitization-id]
bd dep add [put-handler-id] [sanitization-id]
bd dep add [delete-handler-id] [sanitization-id]
bd dep add [format-response-id] [delete-handler-id]

# Security depends on response handling
bd dep add [authentication-id] [format-response-id]
bd dep add [authorization-id] [authentication-id]
bd dep add [rate-limiting-id] [authorization-id]

# Testing depends on security
bd dep add [test-get-id] [rate-limiting-id]
bd dep add [test-post-id] [rate-limiting-id]
bd dep add [test-auth-id] [rate-limiting-id]
bd dep add [test-errors-id] [rate-limiting-id]

# Documentation depends on testing
bd dep add [document-id] [test-errors-id]
bd dep add [examples-id] [document-id]
```

**Task Count**: 20 tasks
**Estimated Time**: 3-5 days

---

## Custom Database Table Pattern

**Use Case**: Adding a custom database table with CRUD operations

**Epic Structure**:

```bash
# Create epic
bd create "Add custom database table for [Data Type]" -p 0 --type epic --label database-table

# Schema Design
bd create "Design table schema" -p 1 --parent [epic-id] --label schema
bd create "Create migration script" -p 1 --parent [epic-id] --label schema
bd create "Add version checking" -p 1 --parent [epic-id] --label schema

# Model Class
bd create "Create model class" -p 2 --parent [epic-id] --label model
bd create "Implement create() method" -p 2 --parent [epic-id] --label model
bd create "Implement get_by_id() method" -p 2 --parent [epic-id] --label model
bd create "Implement get_all() method" -p 2 --parent [epic-id] --label model
bd create "Implement update() method" -p 2 --parent [epic-id] --label model
bd create "Implement delete() method" -p 2 --parent [epic-id] --label model

# Query Optimization
bd create "Add database indexes" -p 3 --parent [epic-id] --label optimization
bd create "Implement pagination" -p 3 --parent [epic-id] --label optimization
bd create "Add caching layer" -p 3 --parent [epic-id] --label optimization

# Security
bd create "Use prepared statements for all queries" -p 4 --parent [epic-id] --label security
bd create "Validate data before insertion" -p 4 --parent [epic-id] --label security
bd create "Sanitize all inputs" -p 4 --parent [epic-id] --label security

# Testing
bd create "Test CRUD operations" -p 5 --parent [epic-id] --label testing
bd create "Test pagination" -p 5 --parent [epic-id] --label testing
bd create "Test data validation" -p 5 --parent [epic-id] --label testing

# Cleanup
bd create "Add uninstall cleanup (optional)" -p 6 --parent [epic-id] --label cleanup
```

**Dependencies**:

```bash
# Schema tasks are sequential
bd dep add [migration-id] [schema-id]
bd dep add [version-id] [migration-id]

# Model class depends on schema
bd dep add [model-class-id] [version-id]
bd dep add [create-method-id] [model-class-id]
bd dep add [get-by-id-id] [model-class-id]
bd dep add [get-all-id] [model-class-id]
bd dep add [update-method-id] [model-class-id]
bd dep add [delete-method-id] [model-class-id]

# Optimization depends on model
bd dep add [indexes-id] [delete-method-id]
bd dep add [pagination-id] [delete-method-id]
bd dep add [caching-id] [pagination-id]

# Security depends on optimization
bd dep add [prepared-statements-id] [caching-id]
bd dep add [validation-id] [prepared-statements-id]
bd dep add [sanitization-id] [validation-id]

# Testing depends on security
bd dep add [test-crud-id] [sanitization-id]
bd dep add [test-pagination-id] [sanitization-id]
bd dep add [test-validation-id] [sanitization-id]

# Cleanup depends on testing
bd dep add [uninstall-id] [test-validation-id]
```

**Task Count**: 19 tasks
**Estimated Time**: 4-6 days

---

## Security Audit Pattern

**Use Case**: Performing a comprehensive security audit

**Epic Structure**:

```bash
# Create epic
bd create "Security audit for [Plugin Name]" -p 0 --type epic --label security-audit

# Automated Scanning
bd create "Run PHPCS with WordPress-VIP-Go" -p 1 --parent [epic-id] --label automated
bd create "Run WPScan (if applicable)" -p 1 --parent [epic-id] --label automated

# Manual Review - CSRF
bd create "Audit forms for nonce verification" -p 2 --parent [epic-id] --label csrf
bd create "Audit AJAX handlers for nonce verification" -p 2 --parent [epic-id] --label csrf

# Manual Review - XSS
bd create "Audit output for escaping" -p 2 --parent [epic-id] --label xss
bd create "Audit admin pages for escaping" -p 2 --parent [epic-id] --label xss

# Manual Review - SQL Injection
bd create "Audit database queries" -p 2 --parent [epic-id] --label sql-injection
bd create "Verify prepared statements usage" -p 2 --parent [epic-id] --label sql-injection

# Manual Review - Authorization
bd create "Audit capability checks" -p 2 --parent [epic-id] --label authorization
bd create "Audit user role handling" -p 2 --parent [epic-id] --label authorization

# Remediation
bd create "Fix critical issues" -p 3 --parent [epic-id] --label remediation
bd create "Fix high-priority issues" -p 3 --parent [epic-id] --label remediation
bd create "Verify fixes" -p 3 --parent [epic-id] --label remediation

# Documentation
bd create "Document security findings" -p 4 --parent [epic-id] --label documentation
bd create "Create security audit report" -p 4 --parent [epic-id] --label documentation
```

**Dependencies**:

```bash
# Manual reviews depend on automated scanning
bd dep add [audit-forms-id] [phpcs-id]
bd dep add [audit-ajax-id] [phpcs-id]
bd dep add [audit-output-id] [phpcs-id]
bd dep add [audit-admin-id] [phpcs-id]
bd dep add [audit-queries-id] [phpcs-id]
bd dep add [verify-prepared-id] [phpcs-id]
bd dep add [audit-capability-id] [phpcs-id]
bd dep add [audit-roles-id] [phpcs-id]

# Remediation depends on all manual reviews
bd dep add [fix-critical-id] [audit-roles-id]
bd dep add [fix-high-id] [fix-critical-id]
bd dep add [verify-fixes-id] [fix-high-id]

# Documentation depends on remediation
bd dep add [document-findings-id] [verify-fixes-id]
bd dep add [audit-report-id] [document-findings-id]
```

**Task Count**: 15 tasks
**Estimated Time**: 2-3 days

---

## WordPress.org Submission Pattern

**Use Case**: Submitting a plugin to WordPress.org

**Epic Structure**:

```bash
# Create epic
bd create "Submit [Plugin Name] to WordPress.org" -p 0 --type epic --label wordpress-org

# Pre-submission
bd create "Run final WPCS check" -p 1 --parent [epic-id] --label pre-submission
bd create "Validate readme.txt format" -p 1 --parent [epic-id] --label pre-submission
bd create "Create plugin banner images" -p 1 --parent [epic-id] --label assets
bd create "Create plugin icon images" -p 1 --parent [epic-id] --label assets
bd create "Take plugin screenshots" -p 1 --parent [epic-id] --label assets
bd create "Optimize all images" -p 1 --parent [epic-id] --label assets
bd create "Create plugin ZIP file" -p 1 --parent [epic-id] --label pre-submission

# Submission
bd create "Create WordPress.org account" -p 2 --parent [epic-id] --label submission
bd create "Submit plugin via form" -p 2 --parent [epic-id] --label submission
bd create "Wait for initial review" -p 2 --parent [epic-id] --label submission
bd create "Respond to review feedback" -p 2 --parent [epic-id] --label submission

# Post-approval
bd create "Set up SVN repository" -p 3 --parent [epic-id] --label post-approval
bd create "Commit files to trunk" -p 3 --parent [epic-id] --label post-approval
bd create "Tag release version" -p 3 --parent [epic-id] --label post-approval
bd create "Upload assets to SVN" -p 3 --parent [epic-id] --label post-approval
bd create "Verify plugin on WordPress.org" -p 3 --parent [epic-id] --label post-approval

# Documentation
bd create "Create submission documentation" -p 4 --parent [epic-id] --label documentation
```

**Dependencies**:

```bash
# Assets can be created in parallel
bd dep add [optimize-images-id] [banner-id]
bd dep add [optimize-images-id] [icon-id]
bd dep add [optimize-images-id] [screenshots-id]

# ZIP depends on WPCS and readme
bd dep add [zip-id] [wpcs-id]
bd dep add [zip-id] [readme-id]

# Submission depends on ZIP and account
bd dep add [submit-id] [zip-id]
bd dep add [submit-id] [account-id]
bd dep add [wait-review-id] [submit-id]
bd dep add [respond-feedback-id] [wait-review-id]

# SVN setup depends on approval
bd dep add [svn-setup-id] [respond-feedback-id]
bd dep add [commit-trunk-id] [svn-setup-id]
bd dep add [tag-release-id] [commit-trunk-id]
bd dep add [upload-assets-id] [tag-release-id]
bd dep add [verify-id] [upload-assets-id]

# Documentation depends on verification
bd dep add [documentation-id] [verify-id]
```

**Task Count**: 17 tasks
**Estimated Time**: 1-2 weeks (including review wait time)

---

## Bug Fix Pattern

**Use Case**: Fixing a bug in an existing plugin

**Epic Structure**:

```bash
# Create epic
bd create "Fix: [Bug Description]" -p 0 --type epic --label bug-fix

# Investigation
bd create "Reproduce bug" -p 1 --parent [epic-id] --label investigation
bd create "Identify root cause" -p 1 --parent [epic-id] --label investigation
bd create "Document expected behavior" -p 1 --parent [epic-id] --label investigation

# Fix Implementation
bd create "Implement fix" -p 2 --parent [epic-id] --label implementation
bd create "Add error handling" -p 2 --parent [epic-id] --label implementation
bd create "Update related code" -p 2 --parent [epic-id] --label implementation

# Testing
bd create "Write regression test" -p 3 --parent [epic-id] --label testing
bd create "Test fix in isolation" -p 3 --parent [epic-id] --label testing
bd create "Test with related features" -p 3 --parent [epic-id] --label testing
bd create "Test edge cases" -p 3 --parent [epic-id] --label testing

# Documentation
bd create "Update changelog" -p 4 --parent [epic-id] --label documentation
bd create "Add inline comments" -p 4 --parent [epic-id] --label documentation
bd create "Update readme if needed" -p 4 --parent [epic-id] --label documentation
```

**Dependencies**:

```bash
# Investigation tasks are sequential
bd dep add [root-cause-id] [reproduce-id]
bd dep add [expected-behavior-id] [root-cause-id]

# Implementation depends on investigation
bd dep add [implement-fix-id] [expected-behavior-id]
bd dep add [error-handling-id] [implement-fix-id]
bd dep add [update-related-id] [implement-fix-id]

# Testing depends on implementation
bd dep add [regression-test-id] [update-related-id]
bd dep add [test-isolation-id] [regression-test-id]
bd dep add [test-related-id] [test-isolation-id]
bd dep add [test-edge-cases-id] [test-related-id]

# Documentation depends on testing
bd dep add [changelog-id] [test-edge-cases-id]
bd dep add [comments-id] [test-edge-cases-id]
bd dep add [readme-id] [test-edge-cases-id]
```

**Task Count**: 13 tasks
**Estimated Time**: 1-3 days

---

## Best Practices for Task Decomposition

### 1. Granularity

- **Too large**: Tasks that take more than 1 day
- **Too small**: Tasks that take less than 30 minutes
- **Just right**: Tasks that take 1-4 hours

### 2. Dependencies

- Use dependencies to enforce order
- Identify tasks that can run in parallel
- Don't over-constrain (allow parallelism where possible)

### 3. Labeling

Use consistent labels:
- `scaffolding` - Initial setup
- `core` - Core functionality
- `admin` - Admin interface
- `frontend` - Frontend display
- `security` - Security measures
- `testing` - Tests
- `documentation` - Documentation
- `implementation` - Feature implementation
- `integration` - Integration with existing code
- `optimization` - Performance optimization

### 4. Priorities

- P0: Blocking/Critical
- P1: High priority
- P2: Medium priority
- P3: Low priority

### 5. Estimation

Include time estimates in task descriptions:
```bash
bd create "Task name (est: 2h)" -p 1 --parent [epic-id]
```

### 6. Progress Tracking

Update task status regularly:
```bash
bd update [task-id] --status in_progress
bd comment [task-id] "Progress update"
bd close [task-id]
```

---

## Usage Examples

### Example 1: Create Contact Form Plugin

```bash
# Use Plugin Creation Pattern
bd create "Create Simple Contact Form plugin" -p 0 --type epic --label plugin-creation

# Follow the pattern, customizing task names
bd create "Create plugin scaffolding for Simple Contact Form" -p 1 --parent bd-xyz
bd create "Create main plugin file simple-contact-form.php" -p 1 --parent bd-xyz
# ... continue with pattern
```

### Example 2: Add Custom Fields Feature

```bash
# Use Feature Addition Pattern
bd create "Add Custom Fields to Simple Contact Form" -p 0 --type epic --label feature-addition

# Follow the pattern
bd create "Create OpenSpec spec for custom fields feature" -p 1 --parent bd-abc
bd create "Design custom fields database schema" -p 1 --parent bd-abc
# ... continue with pattern
```

### Example 3: Fix Email Notification Bug

```bash
# Use Bug Fix Pattern
bd create "Fix: Email notifications not sending" -p 0 --type epic --label bug-fix

# Follow the pattern
bd create "Reproduce email notification bug" -p 1 --parent bd-def
bd create "Identify root cause of email failure" -p 1 --parent bd-def
# ... continue with pattern
```

---

## Related Resources

- [Beads Workflow Documentation](../../beads/README.md)
- [OpenSpec Workflow Documentation](../../openspec/README.md)
- [WordPress Plugin Development Workflow](../rules/development-workflow.md)
- [WordPress Plugin Best Practices](../rules/best-practices.md)

