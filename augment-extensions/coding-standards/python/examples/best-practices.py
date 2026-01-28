"""
Python Best Practices Examples

This module demonstrates Python coding best practices including:
- Naming conventions (PEP 8)
- Type hints (PEP 484, 585, 604)
- Error handling
- Async patterns
- Code organization
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Protocol

# Configure logging
logger = logging.getLogger(__name__)


# ============================================================================
# NAMING CONVENTIONS (PEP 8)
# ============================================================================

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"

# Classes: PascalCase
class UserAccount:
    """Represents a user account"""
    pass

class HTTPClient:
    """HTTP client for API requests"""
    pass

# Functions and variables: snake_case
def calculate_total_price(items: list[dict[str, Any]]) -> float:
    """Calculate total price from list of items"""
    return sum(item.get("price", 0.0) for item in items)

# Private attributes: _leading_underscore
class BankAccount:
    def __init__(self, account_number: str, balance: float) -> None:
        self.account_number = account_number
        self._balance = balance  # Private attribute
    
    def get_balance(self) -> float:
        """Public method to access private balance"""
        return self._balance


# ============================================================================
# TYPE HINTS (PEP 484, 585, 604)
# ============================================================================

# Modern collection types (Python 3.10+, PEP 585)
def process_user_data(
    users: list[dict[str, Any]]
) -> dict[str, list[str]]:
    """Process user data and return grouped by role"""
    result: dict[str, list[str]] = {}
    for user in users:
        role = user.get("role", "unknown")
        if role not in result:
            result[role] = []
        result[role].append(user["name"])
    return result

# Union types with | operator (Python 3.10+, PEP 604)
def find_user(user_id: int) -> dict[str, Any] | None:
    """Find user by ID, returns None if not found"""
    # Simulated database lookup
    return None

# Optional parameters with default values
def create_user(
    username: str,
    email: str,
    age: int | None = None,
    is_active: bool = True
) -> dict[str, Any]:
    """Create a new user with optional age"""
    return {
        "username": username,
        "email": email,
        "age": age,
        "is_active": is_active
    }

# Callable type hints
def apply_operation(
    value: int,
    operation: Callable[[int], int]
) -> int:
    """Apply an operation function to a value"""
    return operation(value)

# Protocol for structural subtyping
class Drawable(Protocol):
    """Protocol for objects that can be drawn"""
    def draw(self) -> None:
        """Draw the object"""
        ...

def render(obj: Drawable) -> None:
    """Render any drawable object"""
    obj.draw()


# ============================================================================
# DATACLASSES
# ============================================================================

@dataclass
class User:
    """User model using dataclass"""
    username: str
    email: str
    age: int | None = None
    is_active: bool = True
    
    def __post_init__(self) -> None:
        """Validate data after initialization"""
        if not self.email or "@" not in self.email:
            raise ValueError(f"Invalid email: {self.email}")
        if self.age is not None and self.age < 0:
            raise ValueError(f"Age cannot be negative: {self.age}")

@dataclass(frozen=True)
class Point:
    """Immutable point using frozen dataclass"""
    x: float
    y: float
    
    def distance_from_origin(self) -> float:
        """Calculate distance from origin"""
        return (self.x ** 2 + self.y ** 2) ** 0.5


# ============================================================================
# ENUMS
# ============================================================================

class UserRole(Enum):
    """User role enumeration"""
    ADMIN = "admin"
    MODERATOR = "moderator"
    USER = "user"
    GUEST = "guest"


# ============================================================================
# ERROR HANDLING
# ============================================================================

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class UserNotFoundError(Exception):
    """Custom exception for user not found"""
    pass

def validate_email(email: str) -> None:
    """Validate email format, raises ValidationError if invalid"""
    if not email or "@" not in email:
        raise ValidationError(f"Invalid email format: {email}")

def get_user_by_id(user_id: int) -> dict[str, Any]:
    """Get user by ID with proper error handling"""
    try:
        # Simulated database call
        user = find_user(user_id)
        if user is None:
            raise UserNotFoundError(f"User {user_id} not found")
        return user
    except UserNotFoundError:
        logger.error(f"User {user_id} not found")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error fetching user {user_id}")
        raise RuntimeError(f"Failed to fetch user: {e}") from e

# Context manager for resource management
@contextmanager
def open_database_connection(db_path: str) -> Iterator[Any]:
    """Context manager for database connection"""
    connection = None
    try:
        # Simulated connection
        connection = f"Connection to {db_path}"
        logger.info(f"Opened database connection: {db_path}")
        yield connection
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise
    finally:
        if connection:
            logger.info(f"Closed database connection: {db_path}")

# Using context manager
def query_database(db_path: str, query: str) -> list[dict[str, Any]]:
    """Query database using context manager"""
    with open_database_connection(db_path) as conn:
        # Execute query
        logger.info(f"Executing query: {query}")
        return []


# ============================================================================
# ASYNC PATTERNS
# ============================================================================

async def fetch_user_async(user_id: int) -> dict[str, Any] | None:
    """Async function to fetch user data"""
    await asyncio.sleep(0.1)  # Simulate network delay
    return {"id": user_id, "name": f"User {user_id}"}

async def fetch_multiple_users(user_ids: list[int]) -> list[dict[str, Any]]:
    """Fetch multiple users concurrently"""
    tasks = [fetch_user_async(user_id) for user_id in user_ids]
    results = await asyncio.gather(*tasks)
    return [user for user in results if user is not None]

async def process_with_timeout(user_id: int, timeout: float = 5.0) -> dict[str, Any] | None:
    """Process with timeout"""
    try:
        return await asyncio.wait_for(
            fetch_user_async(user_id),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        logger.warning(f"Timeout fetching user {user_id}")
        return None


# ============================================================================
# CODE ORGANIZATION
# ============================================================================

class UserService:
    """Service class for user operations"""

    def __init__(self, db_path: str) -> None:
        self._db_path = db_path
        self._cache: dict[int, dict[str, Any]] = {}

    def get_user(self, user_id: int) -> dict[str, Any] | None:
        """Get user from cache or database"""
        if user_id in self._cache:
            return self._cache[user_id]

        user = find_user(user_id)
        if user:
            self._cache[user_id] = user
        return user

    def create_user(self, username: str, email: str) -> dict[str, Any]:
        """Create a new user"""
        validate_email(email)
        user = {
            "id": len(self._cache) + 1,
            "username": username,
            "email": email
        }
        self._cache[user["id"]] = user
        return user

    def clear_cache(self) -> None:
        """Clear the user cache"""
        self._cache.clear()


# ============================================================================
# BEST PRACTICES EXAMPLES
# ============================================================================

# Use list comprehensions instead of loops
def get_active_users(users: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Get all active users using list comprehension"""
    return [user for user in users if user.get("is_active", False)]

# Use dict comprehensions
def create_user_lookup(users: list[dict[str, Any]]) -> dict[int, str]:
    """Create user ID to name lookup using dict comprehension"""
    return {user["id"]: user["name"] for user in users if "id" in user}

# Use enumerate instead of range(len())
def print_users_with_index(users: list[str]) -> None:
    """Print users with index using enumerate"""
    for index, user in enumerate(users, start=1):
        print(f"{index}. {user}")

# Use zip for parallel iteration
def combine_data(names: list[str], ages: list[int]) -> list[dict[str, Any]]:
    """Combine parallel lists using zip"""
    return [{"name": name, "age": age} for name, age in zip(names, ages)]

# Use pathlib instead of os.path
def read_config_file(config_name: str) -> str:
    """Read config file using pathlib"""
    config_path = Path(__file__).parent / "config" / f"{config_name}.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")
    return config_path.read_text()

# Use f-strings for formatting
def format_user_info(user: dict[str, Any]) -> str:
    """Format user info using f-strings"""
    name = user.get("name", "Unknown")
    age = user.get("age", "N/A")
    return f"User: {name}, Age: {age}"

# Use walrus operator for assignment in expressions (Python 3.8+)
def process_data(data: list[str]) -> list[str]:
    """Process data using walrus operator"""
    results = []
    for item in data:
        if (processed := item.strip().upper()):
            results.append(processed)
    return results

# Use match-case for pattern matching (Python 3.10+)
def handle_response(status_code: int) -> str:
    """Handle HTTP response using match-case"""
    match status_code:
        case 200:
            return "Success"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return f"Unknown status: {status_code}"


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main() -> None:
    """Main function demonstrating best practices"""
    # Create users
    user1 = User(username="alice", email="alice@example.com", age=30)
    user2 = User(username="bob", email="bob@example.com")

    print(f"Created users: {user1}, {user2}")

    # Use service
    service = UserService(db_path="users.db")
    new_user = service.create_user("charlie", "charlie@example.com")
    print(f"Created user via service: {new_user}")

    # Demonstrate async
    async def run_async_example() -> None:
        users = await fetch_multiple_users([1, 2, 3])
        print(f"Fetched users: {users}")

    asyncio.run(run_async_example())


if __name__ == "__main__":
    main()

