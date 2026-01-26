# REST API Plugin Examples

## Overview

Complete REST API plugin examples demonstrating WordPress REST API development with custom endpoints (GET, POST, PUT, DELETE), authentication, validation, error handling, and JavaScript client examples.

## Key Benefits

- **Complete CRUD Operations**: Full implementation of GET, POST, PUT, DELETE endpoints
- **Authentication**: Multiple authentication methods (nonce, API key, JWT)
- **Validation**: Request parameter validation and sanitization
- **Error Handling**: Proper error responses with WP_Error
- **JavaScript Clients**: Fetch API and wp.apiFetch examples
- **Security**: Permission callbacks and nonce verification
- **Pagination**: Collection endpoints with pagination support

## Installation

These are reference examples. Copy the code into your WordPress plugin project.

## Directory Structure

```
augment-extensions/examples/rest-api-plugin/
├── module.json                    # Module metadata
├── README.md                      # This file
└── examples/
    ├── task-manager-api.md        # Complete task management REST API
    ├── user-profile-api.md        # User profile API with authentication
    └── product-catalog-api.md     # Product catalog with filtering
```

## Examples Included

### 1. Task Manager API
Complete REST API plugin with:
- GET /tasks - List all tasks (with pagination)
- GET /tasks/{id} - Get single task
- POST /tasks - Create new task
- PUT /tasks/{id} - Update task
- DELETE /tasks/{id} - Delete task
- Authentication and permissions
- JavaScript client examples

### 2. User Profile API
User profile management demonstrating:
- Custom user meta endpoints
- Avatar upload
- Profile validation
- Privacy controls
- Current user authentication

### 3. Product Catalog API
Product catalog with:
- Advanced filtering
- Search functionality
- Category endpoints
- Custom taxonomies
- Batch operations

## Character Count

~0 characters (will be updated after creation)

## Contents

- Complete plugin files (PHP, JS)
- REST API endpoint registration
- Permission callbacks
- Validation schemas
- Error handling
- JavaScript client code
- Authentication examples
- Pagination implementation
- Response formatting

## Usage

```bash
# Copy example to your project
cp -r examples/task-manager-api/ /path/to/wp-content/plugins/

# Activate plugin in WordPress admin

# Test endpoints
curl https://example.com/wp-json/task-manager/v1/tasks
```

## Related Modules

- `domain-rules/wordpress-plugin` - WordPress plugin development guidelines
- `workflows/wordpress-plugin` - WordPress plugin development workflow
- `coding-standards/php` - PHP coding standards

## Version History

- **1.0.0** (2026-01-26): Initial release with three complete examples

