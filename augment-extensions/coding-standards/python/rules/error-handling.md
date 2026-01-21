# Python Error Handling

Proper exception handling patterns for robust Python code.

## Basic Exception Handling

```python
# Good - Specific exception
try:
    result = int(user_input)
except ValueError as e:
    print(f"Invalid input: {e}")
    result = 0

# Bad - Bare except
try:
    result = int(user_input)
except:  # Don't do this
    result = 0
```

## Multiple Exceptions

```python
# Handle different exceptions differently
try:
    with open(file_path) as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"File not found: {file_path}")
    data = {}
except json.JSONDecodeError as e:
    print(f"Invalid JSON: {e}")
    data = {}
except PermissionError:
    print(f"Permission denied: {file_path}")
    data = {}

# Handle multiple exceptions the same way
try:
    result = perform_operation()
except (ValueError, TypeError, KeyError) as e:
    print(f"Operation failed: {e}")
    result = None
```

## Finally and Else

```python
# Using finally for cleanup
try:
    file = open(file_path)
    data = file.read()
except FileNotFoundError:
    print("File not found")
    data = None
finally:
    if 'file' in locals():
        file.close()

# Using else for success case
try:
    result = risky_operation()
except ValueError:
    print("Operation failed")
else:
    print("Operation succeeded")
    process_result(result)
finally:
    cleanup()
```

## Context Managers

```python
# Preferred - Automatic cleanup
with open(file_path) as f:
    data = f.read()

# Multiple context managers
with open(input_file) as f_in, open(output_file, 'w') as f_out:
    data = f_in.read()
    f_out.write(process(data))

# Custom context manager
from contextlib import contextmanager

@contextmanager
def database_connection(db_url: str):
    conn = connect(db_url)
    try:
        yield conn
    finally:
        conn.close()

# Usage
with database_connection("postgresql://...") as conn:
    conn.execute("SELECT * FROM users")
```

## Custom Exceptions

```python
# Define custom exceptions
class ValidationError(Exception):
    """Raised when validation fails"""
    pass

class AuthenticationError(Exception):
    """Raised when authentication fails"""
    def __init__(self, user_id: int, message: str = "Authentication failed"):
        self.user_id = user_id
        self.message = message
        super().__init__(self.message)

# Usage
def validate_email(email: str) -> None:
    if '@' not in email:
        raise ValidationError(f"Invalid email: {email}")

def authenticate_user(user_id: int, password: str) -> User:
    if not verify_password(user_id, password):
        raise AuthenticationError(user_id)
    return get_user(user_id)
```

## Exception Chaining

```python
# Preserve original exception
try:
    result = process_data(data)
except ValueError as e:
    raise ProcessingError("Failed to process data") from e

# Suppress original exception (rare)
try:
    result = process_data(data)
except ValueError:
    raise ProcessingError("Failed to process data") from None
```

## Logging Exceptions

```python
import logging

logger = logging.getLogger(__name__)

# Log exception with traceback
try:
    result = risky_operation()
except Exception as e:
    logger.exception("Operation failed")  # Includes traceback
    raise

# Log without traceback
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    result = default_value
```

## Best Practices

1. **Catch specific exceptions** - Never use bare `except:`
2. **Use context managers** - Prefer `with` for resource management
3. **Don't silence exceptions** - Log or handle them properly
4. **Create custom exceptions** - For domain-specific errors
5. **Use exception chaining** - Preserve error context with `from`
6. **Clean up resources** - Use `finally` or context managers
7. **Fail fast** - Don't catch exceptions you can't handle
8. **Document exceptions** - Use docstrings to document raised exceptions

## Anti-Patterns to Avoid

```python
# DON'T: Bare except
try:
    do_something()
except:
    pass

# DON'T: Catch Exception without re-raising
try:
    critical_operation()
except Exception:
    print("Error occurred")

# DON'T: Use exceptions for flow control
try:
    value = my_dict[key]
except KeyError:
    value = default

# DO: Use get() instead
value = my_dict.get(key, default)
```

## Exception Hierarchy

```python
# Create exception hierarchy
class AppError(Exception):
    """Base exception for application"""
    pass

class DatabaseError(AppError):
    """Database-related errors"""
    pass

class ConnectionError(DatabaseError):
    """Database connection errors"""
    pass

class QueryError(DatabaseError):
    """Database query errors"""
    pass
```

