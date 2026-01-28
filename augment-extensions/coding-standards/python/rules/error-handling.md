# Python Error Handling

Comprehensive exception handling patterns for robust Python code, including custom exceptions, context managers, and contextlib utilities.

## Basic Exception Handling

### Specific Exceptions

Always catch specific exceptions rather than using bare `except:` clauses.

```python
# Good - Specific exception
try:
    result = int(user_input)
except ValueError as e:
    logger.error(f"Invalid input: {e}")
    result = 0

# Bad - Bare except
try:
    result = int(user_input)
except:  # Don't do this - catches SystemExit, KeyboardInterrupt, etc.
    result = 0

# Bad - Too broad
try:
    result = int(user_input)
except Exception:  # Still too broad for most cases
    result = 0
```

### Multiple Exceptions

```python
# Handle different exceptions differently
try:
    with open(file_path) as f:
        data = json.load(f)
except FileNotFoundError:
    logger.warning(f"File not found: {file_path}")
    data = {}
except json.JSONDecodeError as e:
    logger.error(f"Invalid JSON in {file_path}: {e}")
    data = {}
except PermissionError:
    logger.error(f"Permission denied: {file_path}")
    raise  # Re-raise if we can't handle it

# Handle multiple exceptions the same way
try:
    result = perform_operation()
except (ValueError, TypeError, KeyError) as e:
    logger.error(f"Operation failed: {e}")
    result = None
```

## Try-Except-Else-Finally

### The Complete Pattern

```python
try:
    # Code that might raise exceptions
    result = risky_operation()
except ValueError as e:
    # Handle specific exception
    logger.error(f"Value error: {e}")
    result = None
except TypeError as e:
    # Handle another specific exception
    logger.error(f"Type error: {e}")
    result = None
else:
    # Runs only if no exception was raised
    logger.info("Operation succeeded")
    process_result(result)
finally:
    # Always runs, even if exception occurred or return was called
    cleanup_resources()
```

### Using Else Clause

The `else` clause runs only if no exception was raised in the `try` block.

```python
# Good - Separates success logic from try block
try:
    data = load_data(file_path)
except FileNotFoundError:
    logger.error(f"File not found: {file_path}")
    return None
else:
    # Only runs if load_data succeeded
    validate_data(data)
    return process_data(data)

# Less clear - success logic mixed with risky code
try:
    data = load_data(file_path)
    validate_data(data)  # This is also in the try block
    return process_data(data)
except FileNotFoundError:
    logger.error(f"File not found: {file_path}")
    return None
```

### Using Finally for Cleanup

```python
# Manual cleanup with finally
file = None
try:
    file = open(file_path)
    data = file.read()
except FileNotFoundError:
    logger.error("File not found")
    data = None
finally:
    if file is not None:
        file.close()

# Better - Use context manager instead (see below)
try:
    with open(file_path) as file:
        data = file.read()
except FileNotFoundError:
    logger.error("File not found")
    data = None
```

## Context Managers

Context managers provide automatic resource management using the `with` statement. They ensure cleanup code runs even if exceptions occur.

### Built-in Context Managers

```python
# File handling - Automatic close
with open(file_path) as f:
    data = f.read()
# File is automatically closed here, even if exception occurred

# Multiple context managers (Python 3.1+)
with open(input_file) as f_in, open(output_file, 'w') as f_out:
    data = f_in.read()
    f_out.write(process(data))

# Parenthesized context managers (Python 3.10+)
with (
    open(input_file) as f_in,
    open(output_file, 'w') as f_out,
    open(log_file, 'a') as f_log,
):
    data = f_in.read()
    f_out.write(process(data))
    f_log.write(f"Processed {input_file}\n")

# Threading locks
import threading

lock = threading.Lock()
with lock:
    # Critical section - lock is automatically released
    shared_resource.modify()
```

### Custom Context Managers - Class-Based

```python
from typing import Optional

class DatabaseConnection:
    """Context manager for database connections."""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn: Optional[Connection] = None

    def __enter__(self) -> Connection:
        """Establish connection when entering context."""
        self.conn = connect(self.db_url)
        logger.info(f"Connected to {self.db_url}")
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        """Close connection when exiting context.

        Args:
            exc_type: Exception type if exception occurred, None otherwise
            exc_val: Exception value if exception occurred, None otherwise
            exc_tb: Exception traceback if exception occurred, None otherwise

        Returns:
            False to propagate exceptions, True to suppress them
        """
        if self.conn is not None:
            self.conn.close()
            logger.info(f"Closed connection to {self.db_url}")

        # Log exception if one occurred
        if exc_type is not None:
            logger.error(f"Exception in database context: {exc_val}")

        # Return False to propagate exception, True to suppress it
        return False

# Usage
with DatabaseConnection("postgresql://localhost/mydb") as conn:
    conn.execute("SELECT * FROM users")
```

### Custom Context Managers - contextlib.contextmanager

The `@contextmanager` decorator provides a simpler way to create context managers using generators.

```python
from contextlib import contextmanager
from typing import Generator, Optional
import time

@contextmanager
def database_connection(db_url: str) -> Generator[Connection, None, None]:
    """Context manager for database connections.

    Args:
        db_url: Database connection URL

    Yields:
        Active database connection

    Example:
        with database_connection("postgresql://...") as conn:
            conn.execute("SELECT * FROM users")
    """
    conn = connect(db_url)
    try:
        logger.info(f"Connected to {db_url}")
        yield conn
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise
    finally:
        conn.close()
        logger.info(f"Closed connection to {db_url}")

@contextmanager
def timer(name: str) -> Generator[None, None, None]:
    """Context manager to time code execution.

    Args:
        name: Name of the timed operation

    Example:
        with timer("data processing"):
            process_large_dataset()
    """
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        logger.info(f"{name} took {elapsed:.2f} seconds")

@contextmanager
def temporary_directory() -> Generator[Path, None, None]:
    """Context manager for temporary directory.

    Yields:
        Path to temporary directory

    Example:
        with temporary_directory() as tmpdir:
            (tmpdir / "file.txt").write_text("data")
        # Directory is automatically deleted here
    """
    import tempfile
    import shutil

    tmpdir = Path(tempfile.mkdtemp())
    try:
        yield tmpdir
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
```

### contextlib Utilities

```python
from contextlib import (
    contextmanager,
    suppress,
    redirect_stdout,
    redirect_stderr,
    ExitStack,
    nullcontext,
)
import io

# suppress - Ignore specific exceptions
from contextlib import suppress

# Instead of try-except
try:
    os.remove(file_path)
except FileNotFoundError:
    pass

# Use suppress
with suppress(FileNotFoundError):
    os.remove(file_path)

# Suppress multiple exceptions
with suppress(FileNotFoundError, PermissionError):
    os.remove(file_path)

# redirect_stdout/redirect_stderr - Redirect output
output = io.StringIO()
with redirect_stdout(output):
    print("This goes to output variable")
    print("Not to console")

captured = output.getvalue()  # "This goes to output variable\nNot to console\n"

# ExitStack - Manage dynamic number of context managers
from contextlib import ExitStack

def process_files(file_paths: list[str]) -> None:
    """Process multiple files with dynamic context managers."""
    with ExitStack() as stack:
        # Open all files and register them with the stack
        files = [stack.enter_context(open(path)) for path in file_paths]

        # Process all files
        for f in files:
            process_file(f)

        # All files automatically closed when exiting

# ExitStack with callbacks
with ExitStack() as stack:
    # Register cleanup callbacks
    stack.callback(cleanup_temp_files)
    stack.callback(logger.info, "Processing complete")

    # Do work
    process_data()

    # Callbacks run in LIFO order when exiting

# nullcontext - Conditional context manager (Python 3.7+)
from contextlib import nullcontext

def process_data(use_lock: bool = False) -> None:
    """Process data with optional locking."""
    lock = threading.Lock() if use_lock else nullcontext()

    with lock:
        # This works whether lock is a real Lock or nullcontext
        modify_shared_resource()
```

### Async Context Managers

```python
from contextlib import asynccontextmanager
from typing import AsyncGenerator

class AsyncDatabaseConnection:
    """Async context manager for database connections."""

    async def __aenter__(self) -> AsyncConnection:
        self.conn = await async_connect(self.db_url)
        return self.conn

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> bool:
        await self.conn.close()
        return False

# Using @asynccontextmanager decorator
@asynccontextmanager
async def async_database_connection(
    db_url: str
) -> AsyncGenerator[AsyncConnection, None]:
    """Async context manager for database connections."""
    conn = await async_connect(db_url)
    try:
        yield conn
    finally:
        await conn.close()

# Usage
async def fetch_users():
    async with async_database_connection("postgresql://...") as conn:
        return await conn.fetch("SELECT * FROM users")
```

## Custom Exceptions

Create custom exceptions for domain-specific errors. This makes error handling more precise and code more maintainable.

### Basic Custom Exceptions

```python
# Simple custom exception
class ValidationError(Exception):
    """Raised when validation fails."""
    pass

# Custom exception with additional attributes
class AuthenticationError(Exception):
    """Raised when authentication fails."""

    def __init__(self, user_id: int, message: str = "Authentication failed"):
        self.user_id = user_id
        self.message = message
        super().__init__(self.message)

    def __str__(self) -> str:
        return f"AuthenticationError(user_id={self.user_id}): {self.message}"

# Custom exception with multiple attributes
class DatabaseError(Exception):
    """Raised when database operation fails."""

    def __init__(
        self,
        message: str,
        query: str,
        error_code: Optional[int] = None,
    ):
        self.message = message
        self.query = query
        self.error_code = error_code
        super().__init__(self.message)

# Usage
def validate_email(email: str) -> None:
    """Validate email format.

    Args:
        email: Email address to validate

    Raises:
        ValidationError: If email format is invalid
    """
    if '@' not in email:
        raise ValidationError(f"Invalid email format: {email}")

    if not email.endswith(('.com', '.org', '.net')):
        raise ValidationError(f"Invalid email domain: {email}")

def authenticate_user(user_id: int, password: str) -> User:
    """Authenticate user with password.

    Args:
        user_id: User ID
        password: User password

    Returns:
        Authenticated user object

    Raises:
        AuthenticationError: If authentication fails
    """
    if not verify_password(user_id, password):
        raise AuthenticationError(user_id, "Invalid password")
    return get_user(user_id)
```

### Exception Hierarchies

Create exception hierarchies for related errors.

```python
# Base exception for application
class AppError(Exception):
    """Base exception for all application errors."""
    pass

# Database errors
class DatabaseError(AppError):
    """Base exception for database-related errors."""
    pass

class ConnectionError(DatabaseError):
    """Database connection errors."""
    pass

class QueryError(DatabaseError):
    """Database query errors."""

    def __init__(self, message: str, query: str):
        self.query = query
        super().__init__(f"{message}: {query}")

class TransactionError(DatabaseError):
    """Database transaction errors."""
    pass

# API errors
class APIError(AppError):
    """Base exception for API-related errors."""

    def __init__(self, message: str, status_code: int):
        self.status_code = status_code
        super().__init__(f"[{status_code}] {message}")

class NotFoundError(APIError):
    """Resource not found."""

    def __init__(self, resource: str, resource_id: str):
        self.resource = resource
        self.resource_id = resource_id
        super().__init__(
            f"{resource} not found: {resource_id}",
            status_code=404,
        )

class UnauthorizedError(APIError):
    """Unauthorized access."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)

# Usage - Catch specific or broad exceptions
try:
    user = get_user(user_id)
except NotFoundError as e:
    # Handle specific error
    logger.warning(f"User not found: {e.resource_id}")
except APIError as e:
    # Handle any API error
    logger.error(f"API error: {e}")
except AppError as e:
    # Handle any application error
    logger.error(f"Application error: {e}")
```

### Rich Exception Information

```python
from typing import Any, Optional
from dataclasses import dataclass

@dataclass
class ErrorContext:
    """Context information for errors."""
    operation: str
    user_id: Optional[int] = None
    request_id: Optional[str] = None
    metadata: dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class OperationError(Exception):
    """Exception with rich context information."""

    def __init__(self, message: str, context: ErrorContext):
        self.message = message
        self.context = context
        super().__init__(self.message)

    def __str__(self) -> str:
        ctx = self.context
        parts = [f"OperationError: {self.message}"]
        parts.append(f"  Operation: {ctx.operation}")
        if ctx.user_id:
            parts.append(f"  User ID: {ctx.user_id}")
        if ctx.request_id:
            parts.append(f"  Request ID: {ctx.request_id}")
        if ctx.metadata:
            parts.append(f"  Metadata: {ctx.metadata}")
        return "\n".join(parts)

# Usage
def process_payment(user_id: int, amount: float, request_id: str) -> None:
    """Process payment with rich error context."""
    context = ErrorContext(
        operation="process_payment",
        user_id=user_id,
        request_id=request_id,
        metadata={"amount": amount},
    )

    try:
        charge_card(user_id, amount)
    except CardDeclinedError as e:
        raise OperationError("Payment declined", context) from e
    except InsufficientFundsError as e:
        raise OperationError("Insufficient funds", context) from e
```

## Exception Chaining

Exception chaining preserves the original exception context, making debugging easier.

### Using 'from' for Chaining

```python
# Good - Preserve original exception with 'from'
try:
    result = process_data(data)
except ValueError as e:
    raise ProcessingError("Failed to process data") from e
# Traceback will show both ProcessingError and original ValueError

# Good - Explicit chaining with context
try:
    user_data = json.loads(raw_data)
except json.JSONDecodeError as e:
    raise ValidationError(
        f"Invalid JSON in user data: {e.msg}"
    ) from e

# Rare - Suppress original exception with 'from None'
try:
    result = process_data(data)
except ValueError:
    # Only use 'from None' when original exception is not relevant
    raise ProcessingError("Failed to process data") from None
```

### Implicit Chaining

```python
# Implicit chaining - exception raised during exception handling
try:
    result = process_data(data)
except ValueError as e:
    # If log_error raises an exception, both will be in traceback
    log_error(e)
    raise ProcessingError("Failed to process data")
```

### Accessing Exception Chain

```python
try:
    try:
        risky_operation()
    except ValueError as e:
        raise ProcessingError("Processing failed") from e
except ProcessingError as e:
    # Access the original exception
    original = e.__cause__  # The exception after 'from'
    context = e.__context__  # The exception being handled when this was raised

    logger.error(f"Processing error: {e}")
    logger.error(f"Original error: {original}")
```

## Logging Exceptions

Proper exception logging is crucial for debugging and monitoring.

### Basic Exception Logging

```python
import logging

logger = logging.getLogger(__name__)

# Log exception with full traceback
try:
    result = risky_operation()
except Exception as e:
    logger.exception("Operation failed")  # Includes full traceback
    raise  # Re-raise after logging

# Log without traceback
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")  # No traceback
    result = default_value

# Log with different levels
try:
    result = optional_operation()
except FileNotFoundError:
    logger.warning("Optional file not found, using defaults")
    result = default_value
except PermissionError as e:
    logger.error(f"Permission denied: {e}")
    raise
```

### Structured Logging

```python
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Log with structured data
try:
    process_user_data(user_id, data)
except ValidationError as e:
    logger.error(
        "Validation failed",
        extra={
            "user_id": user_id,
            "error_type": type(e).__name__,
            "error_message": str(e),
        },
    )
    raise

# Log with exception info without traceback
try:
    result = risky_operation()
except ValueError as e:
    logger.error(
        "Operation failed: %s",
        e,
        exc_info=False,  # Don't include traceback
    )
```

### Custom Exception Logging

```python
class LoggingException(Exception):
    """Exception that logs itself when raised."""

    def __init__(self, message: str, level: int = logging.ERROR):
        self.message = message
        self.level = level
        super().__init__(self.message)

        # Log when exception is created
        logger = logging.getLogger(self.__class__.__module__)
        logger.log(self.level, f"{self.__class__.__name__}: {message}")

# Usage
def process_data(data: dict[str, Any]) -> None:
    if not data:
        raise LoggingException("Empty data received", level=logging.WARNING)
```

## Best Practices

### DO

✅ **Catch specific exceptions** - Never use bare `except:` or catch `Exception` unless absolutely necessary

✅ **Use context managers** - Prefer `with` statement for resource management

✅ **Log exceptions properly** - Use `logger.exception()` to include tracebacks

✅ **Create custom exceptions** - For domain-specific errors with clear names

✅ **Use exception chaining** - Preserve error context with `from`

✅ **Document exceptions** - List raised exceptions in docstrings

✅ **Fail fast** - Don't catch exceptions you can't handle

✅ **Clean up resources** - Use `finally` or context managers

✅ **Use contextlib utilities** - `suppress`, `ExitStack`, etc. for cleaner code

✅ **Create exception hierarchies** - For related errors

### DON'T

❌ **Don't use bare except** - Catches SystemExit, KeyboardInterrupt, etc.

```python
# Bad
try:
    do_something()
except:  # Catches everything, including KeyboardInterrupt
    pass

# Good
try:
    do_something()
except (ValueError, TypeError) as e:
    logger.error(f"Expected error: {e}")
```

❌ **Don't silence exceptions** - Always log or handle them

```python
# Bad
try:
    critical_operation()
except Exception:
    pass  # Silent failure

# Good
try:
    critical_operation()
except Exception as e:
    logger.exception("Critical operation failed")
    raise
```

❌ **Don't use exceptions for flow control** - Use appropriate methods

```python
# Bad - Using exception for flow control
try:
    value = my_dict[key]
except KeyError:
    value = default

# Good - Use dict.get()
value = my_dict.get(key, default)

# Bad - Using exception for flow control
try:
    index = my_list.index(item)
except ValueError:
    index = -1

# Good - Use 'in' operator
index = my_list.index(item) if item in my_list else -1
```

❌ **Don't catch Exception without re-raising** - Unless you can truly handle it

```python
# Bad
try:
    critical_operation()
except Exception:
    print("Error occurred")  # Swallows the exception

# Good
try:
    critical_operation()
except Exception as e:
    logger.exception("Critical operation failed")
    raise  # Re-raise after logging
```

❌ **Don't lose exception context** - Use exception chaining

```python
# Bad - Loses original exception
try:
    process_data(data)
except ValueError:
    raise ProcessingError("Failed")  # Original error is lost

# Good - Preserves original exception
try:
    process_data(data)
except ValueError as e:
    raise ProcessingError("Failed") from e
```

## Advanced Patterns

### Exception Groups (Python 3.11+)

```python
# Raise multiple exceptions at once
raise ExceptionGroup("Multiple errors occurred", [
    ValueError("Invalid value"),
    TypeError("Invalid type"),
])

# Catch exception groups
try:
    raise ExceptionGroup("errors", [ValueError("bad"), TypeError("wrong")])
except* ValueError as eg:
    # Handle all ValueError instances
    for e in eg.exceptions:
        logger.error(f"Value error: {e}")
except* TypeError as eg:
    # Handle all TypeError instances
    for e in eg.exceptions:
        logger.error(f"Type error: {e}")
```

### Retry Logic with Exceptions

```python
from typing import TypeVar, Callable
import time

T = TypeVar('T')

def retry(
    func: Callable[..., T],
    max_attempts: int = 3,
    delay: float = 1.0,
    exceptions: tuple[type[Exception], ...] = (Exception,),
) -> T:
    """Retry function on exception.

    Args:
        func: Function to retry
        max_attempts: Maximum number of attempts
        delay: Delay between attempts in seconds
        exceptions: Tuple of exceptions to catch

    Returns:
        Result of successful function call

    Raises:
        Last exception if all attempts fail
    """
    last_exception = None

    for attempt in range(max_attempts):
        try:
            return func()
        except exceptions as e:
            last_exception = e
            logger.warning(
                f"Attempt {attempt + 1}/{max_attempts} failed: {e}"
            )
            if attempt < max_attempts - 1:
                time.sleep(delay)

    # All attempts failed
    raise last_exception

# Usage
result = retry(
    lambda: fetch_data_from_api(),
    max_attempts=3,
    delay=2.0,
    exceptions=(ConnectionError, TimeoutError),
)
```

### Validation with Multiple Errors

```python
from typing import List

class ValidationErrors(Exception):
    """Exception containing multiple validation errors."""

    def __init__(self, errors: List[str]):
        self.errors = errors
        super().__init__(f"{len(errors)} validation errors")

    def __str__(self) -> str:
        return "\n".join([
            f"Validation failed with {len(self.errors)} errors:",
            *[f"  - {error}" for error in self.errors],
        ])

def validate_user(user_data: dict) -> None:
    """Validate user data, collecting all errors.

    Args:
        user_data: User data to validate

    Raises:
        ValidationErrors: If validation fails
    """
    errors = []

    if not user_data.get("email"):
        errors.append("Email is required")
    elif "@" not in user_data["email"]:
        errors.append("Email must contain @")

    if not user_data.get("username"):
        errors.append("Username is required")
    elif len(user_data["username"]) < 3:
        errors.append("Username must be at least 3 characters")

    if not user_data.get("age"):
        errors.append("Age is required")
    elif user_data["age"] < 18:
        errors.append("User must be at least 18 years old")

    if errors:
        raise ValidationErrors(errors)

# Usage
try:
    validate_user({"email": "invalid", "username": "ab"})
except ValidationErrors as e:
    logger.error(str(e))
    # Validation failed with 3 errors:
    #   - Email must contain @
    #   - Username must be at least 3 characters
    #   - Age is required
```

## Summary

**Key Takeaways:**

1. **Always catch specific exceptions** - Never use bare `except:`
2. **Use context managers** - For automatic resource cleanup
3. **Create custom exceptions** - With clear hierarchies for domain errors
4. **Use contextlib utilities** - `@contextmanager`, `suppress`, `ExitStack`
5. **Chain exceptions** - Preserve error context with `from`
6. **Log exceptions properly** - Use `logger.exception()` for tracebacks
7. **Document exceptions** - In docstrings with `Raises:` section
8. **Don't use exceptions for flow control** - Use appropriate methods instead
9. **Fail fast** - Don't catch exceptions you can't handle
10. **Clean up resources** - Use `finally` or context managers

