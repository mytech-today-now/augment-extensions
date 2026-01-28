# Python Documentation Standards

Comprehensive guide to writing clear, consistent Python documentation using docstrings.

## Docstring Basics

### PEP 257 Conventions

All public modules, classes, functions, and methods should have docstrings.

```python
# Module docstring
"""Module for user authentication.

This module provides functions and classes for authenticating users,
managing sessions, and handling permissions.
"""

# Function docstring
def authenticate_user(username: str, password: str) -> bool:
    """Authenticate user with username and password.

    Args:
        username: User's username
        password: User's password

    Returns:
        True if authentication successful, False otherwise
    """
    pass

# Class docstring
class UserManager:
    """Manage user accounts and authentication.

    This class provides methods for creating, updating, and deleting
    user accounts, as well as authenticating users.

    Attributes:
        db_connection: Database connection for user data
        cache: Cache for frequently accessed user data
    """
    pass
```

### One-Line vs Multi-Line Docstrings

```python
# One-line docstring - For simple, obvious functions
def get_user_id(username: str) -> int:
    """Return user ID for given username."""
    pass

# Multi-line docstring - For complex functions
def create_user(
    username: str,
    email: str,
    password: str,
    role: str = "user",
) -> User:
    """Create a new user account.

    Creates a new user with the given credentials and role.
    Validates email format and password strength before creation.

    Args:
        username: Unique username for the user
        email: User's email address
        password: User's password (will be hashed)
        role: User role (default: "user")

    Returns:
        Created User object

    Raises:
        ValidationError: If email or password is invalid
        DuplicateUserError: If username already exists
    """
    pass
```

## Google Style Docstrings

Google style is clean, readable, and widely used.

### Function Documentation

```python
def fetch_user_data(
    user_id: int,
    include_posts: bool = False,
    max_posts: int = 10,
) -> dict:
    """Fetch user data from database.

    Retrieves user information including profile data and optionally
    recent posts. Uses caching to improve performance.

    Args:
        user_id: Unique identifier for the user
        include_posts: Whether to include user's posts (default: False)
        max_posts: Maximum number of posts to include (default: 10)

    Returns:
        Dictionary containing user data with keys:
            - id: User ID
            - username: User's username
            - email: User's email
            - posts: List of posts (if include_posts=True)

    Raises:
        UserNotFoundError: If user with given ID doesn't exist
        DatabaseError: If database query fails

    Example:
        >>> user = fetch_user_data(123, include_posts=True)
        >>> print(user['username'])
        'john_doe'
    """
    pass
```

### Class Documentation

```python
class DatabaseConnection:
    """Manage database connections with connection pooling.

    This class provides a connection pool for database operations,
    automatically handling connection lifecycle and retries.

    Attributes:
        host: Database host address
        port: Database port number
        database: Database name
        pool_size: Maximum number of connections in pool

    Example:
        >>> db = DatabaseConnection("localhost", 5432, "mydb")
        >>> with db.get_connection() as conn:
        ...     result = conn.execute("SELECT * FROM users")
    """

    def __init__(
        self,
        host: str,
        port: int,
        database: str,
        pool_size: int = 10,
    ):


### Method Documentation

```python
class UserRepository:
    """Repository for user data operations."""

    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email address.

        Args:
            email: Email address to search for

        Returns:
            User object if found, None otherwise

        Example:
            >>> repo = UserRepository()
            >>> user = repo.find_by_email("user@example.com")
        """
        pass

    def create(
        self,
        username: str,
        email: str,
        password: str,
    ) -> User:
        """Create a new user.

        Args:
            username: Unique username
            email: User's email address
            password: User's password (will be hashed)

        Returns:
            Created User object

        Raises:
            ValidationError: If input validation fails
            DuplicateUserError: If username or email already exists
        """
        pass

    def update(self, user_id: int, **kwargs) -> User:
        """Update user attributes.

        Args:
            user_id: ID of user to update
            **kwargs: Attributes to update (username, email, etc.)

        Returns:
            Updated User object

        Raises:
            UserNotFoundError: If user doesn't exist
            ValidationError: If update data is invalid

        Note:
            Only provided attributes will be updated. Password updates
            require separate method for security reasons.
        """
        pass
```

### Property Documentation

```python
class User:
    """User account model."""

    @property
    def full_name(self) -> str:
        """Return user's full name.

        Returns:
            Full name as "first_name last_name"
        """
        return f"{self.first_name} {self.last_name}"

    @property
    def is_active(self) -> bool:
        """Check if user account is active.

        Returns:
            True if account is active and not suspended
        """
        return self.status == "active" and not self.suspended
```

## NumPy Style Docstrings

NumPy style uses more structured formatting, popular in scientific computing.

### Function Documentation

```python
def calculate_statistics(
    data: np.ndarray,
    axis: Optional[int] = None,
    ddof: int = 0,
) -> dict:
    """Calculate statistical measures for data.

    Computes mean, median, standard deviation, and variance
    for the given data array.

    Parameters
    ----------
    data : np.ndarray
        Input data array
    axis : int, optional
        Axis along which to compute statistics (default: None)
        If None, compute over flattened array
    ddof : int, optional
        Delta degrees of freedom for variance calculation (default: 0)

    Returns
    -------
    dict
        Dictionary containing:
        - mean : float
            Arithmetic mean
        - median : float
            Median value
        - std : float
            Standard deviation
        - var : float
            Variance

    Raises
    ------
    ValueError
        If data array is empty
    TypeError
        If data is not a numpy array

    See Also
    --------
    numpy.mean : Compute arithmetic mean
    numpy.std : Compute standard deviation

    Notes
    -----
    Uses Welford's online algorithm for numerical stability.

    Examples
    --------
    >>> data = np.array([1, 2, 3, 4, 5])
    >>> stats = calculate_statistics(data)
    >>> print(stats['mean'])
    3.0

    >>> data_2d = np.array([[1, 2], [3, 4]])
    >>> stats = calculate_statistics(data_2d, axis=0)
    >>> print(stats['mean'])
    [2. 3.]
    """
    pass
```

### Class Documentation

```python
class LinearRegression:
    """Linear regression model using least squares.

    Fits a linear model with coefficients w = (w1, ..., wp)
    to minimize the residual sum of squares between observed
    targets and predicted targets.

    Parameters
    ----------
    fit_intercept : bool, optional
        Whether to calculate intercept (default: True)
    normalize : bool, optional
        Whether to normalize features (default: False)
    copy_X : bool, optional
        Whether to copy X (default: True)

    Attributes
    ----------
    coef_ : np.ndarray of shape (n_features,)
        Estimated coefficients for the linear regression
    intercept_ : float
        Independent term in linear model
    rank_ : int
        Rank of matrix X
    singular_ : np.ndarray of shape (min(X, y),)
        Singular values of X

    Examples
    --------
    >>> X = np.array([[1, 1], [1, 2], [2, 2], [2, 3]])
    >>> y = np.dot(X, np.array([1, 2])) + 3
    >>> reg = LinearRegression().fit(X, y)
    >>> reg.score(X, y)
    1.0
    >>> reg.coef_
    array([1., 2.])
    >>> reg.intercept_
    3.0

    Notes
    -----
    From the implementation point of view, this is just plain Ordinary
    Least Squares (scipy.linalg.lstsq) wrapped as a predictor object.
    """

    def __init__(
        self,
        fit_intercept: bool = True,
        normalize: bool = False,
        copy_X: bool = True,
    ):
        """Initialize linear regression model.

        Parameters
        ----------
        fit_intercept : bool, optional
            Whether to calculate intercept (default: True)
        normalize : bool, optional
            Whether to normalize features (default: False)
        copy_X : bool, optional
            Whether to copy X (default: True)
        """
        pass
```

## Special Sections

### Args/Parameters Section

```python
def complex_function(
    required_arg: str,
    optional_arg: int = 10,
    *args: str,
    **kwargs: Any,
) -> dict:
    """Function with various argument types.

    Args:
        required_arg: A required string argument
        optional_arg: An optional integer (default: 10)
        *args: Variable positional arguments
        **kwargs: Variable keyword arguments. Supported keys:
            - timeout (float): Request timeout in seconds
            - retries (int): Number of retry attempts
            - debug (bool): Enable debug logging

    Returns:
        Dictionary with processed results
    """
    pass
```

### Returns Section

```python
# Simple return
def get_user(user_id: int) -> User:
    """Get user by ID.

    Args:
        user_id: User ID

    Returns:
        User object
    """
    pass

# Multiple return values (tuple)
def get_user_stats(user_id: int) -> tuple[int, int, float]:
    """Get user statistics.

    Args:
        user_id: User ID

    Returns:
        Tuple containing:
            - post_count: Number of posts
            - follower_count: Number of followers
            - engagement_rate: Engagement rate (0.0 to 1.0)
    """
    pass

# Complex return type
def fetch_data(url: str) -> dict[str, Any]:
    """Fetch data from URL.

    Args:
        url: URL to fetch from

    Returns:
        Dictionary containing:
            - status: HTTP status code
            - headers: Response headers
            - body: Response body
            - timestamp: Request timestamp
    """
    pass
```

### Raises Section

```python
def create_user(username: str, email: str) -> User:
    """Create a new user account.

    Args:
        username: Unique username
        email: User's email address

    Returns:
        Created User object

    Raises:
        ValidationError: If username or email is invalid
        DuplicateUserError: If username or email already exists
        DatabaseError: If database operation fails

    Example:
        >>> user = create_user("john", "john@example.com")
        >>> print(user.username)
        'john'
    """
    pass
```

### Examples Section

```python
def calculate_discount(
    price: float,
    discount_percent: float,
) -> float:
    """Calculate discounted price.

    Args:
        price: Original price
        discount_percent: Discount percentage (0-100)

    Returns:
        Discounted price

    Examples:
        >>> calculate_discount(100.0, 10.0)
        90.0

        >>> calculate_discount(50.0, 25.0)
        37.5

        >>> calculate_discount(100.0, 0.0)
        100.0
    """
    pass
```

### Notes and Warnings

```python
def process_large_file(file_path: str) -> None:
    """Process large file in chunks.

    Args:
        file_path: Path to file to process

    Note:
        This function processes files in chunks to avoid
        loading entire file into memory. Suitable for
        files larger than available RAM.

    Warning:
        File must be in UTF-8 encoding. Other encodings
        may cause decoding errors.

    See Also:
        process_small_file: For files < 100MB
        stream_file: For streaming processing
    """
    pass
```


## Type Hints Integration

Type hints and docstrings work together for complete documentation.

### With Type Hints

```python
from typing import Optional, List, Dict, Any

def fetch_users(
    role: str,
    active_only: bool = True,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """Fetch users by role.

    Type hints provide type information, docstring provides
    semantic information and constraints.

    Args:
        role: User role to filter by (e.g., "admin", "user", "guest")
        active_only: Only return active users (default: True)
        limit: Maximum number of users to return (default: None for all)

    Returns:
        List of user dictionaries, each containing:
            - id: User ID
            - username: Username
            - email: Email address
            - role: User role

    Note:
        Type hints show List[Dict[str, Any]], but docstring
        specifies the exact structure of each dictionary.
    """
    pass
```

### Generic Types

```python
from typing import TypeVar, Generic, List

T = TypeVar('T')

class Repository(Generic[T]):
    """Generic repository for data access.

    Type Parameters:
        T: Type of entity managed by this repository

    Example:
        >>> user_repo = Repository[User]()
        >>> users = user_repo.find_all()
    """

    def find_by_id(self, id: int) -> Optional[T]:
        """Find entity by ID.

        Args:
            id: Entity ID

        Returns:
            Entity if found, None otherwise
        """
        pass

    def find_all(self) -> List[T]:
        """Find all entities.

        Returns:
            List of all entities
        """
        pass
```

## Module Documentation

### Module Docstring

```python
"""User authentication and authorization module.

This module provides functionality for:
- User authentication (login, logout, session management)
- Password hashing and verification
- Permission checking and role-based access control
- Token generation and validation

Classes:
    Authenticator: Main authentication handler
    PasswordHasher: Password hashing utilities
    PermissionChecker: Permission validation

Functions:
    hash_password: Hash a password using bcrypt
    verify_password: Verify password against hash
    generate_token: Generate authentication token

Constants:
    TOKEN_EXPIRY: Default token expiration time (seconds)
    MAX_LOGIN_ATTEMPTS: Maximum failed login attempts

Example:
    >>> from auth import Authenticator
    >>> auth = Authenticator()
    >>> user = auth.login("username", "password")
    >>> if auth.has_permission(user, "admin"):
    ...     print("User is admin")

Note:
    This module requires bcrypt and PyJWT packages.
    Install with: pip install bcrypt PyJWT
"""

import bcrypt
import jwt
from typing import Optional

TOKEN_EXPIRY = 3600  # 1 hour
MAX_LOGIN_ATTEMPTS = 5
```

### Package Documentation

```python
# __init__.py
"""Authentication package.

This package provides comprehensive authentication and authorization
functionality for web applications.

Submodules:
    auth: Core authentication logic
    permissions: Permission and role management
    tokens: Token generation and validation
    models: Data models for users and sessions

Usage:
    >>> from auth import Authenticator
    >>> from auth.permissions import PermissionChecker
    >>>
    >>> auth = Authenticator()
    >>> user = auth.login("username", "password")
"""

from .auth import Authenticator
from .permissions import PermissionChecker
from .tokens import TokenGenerator

__all__ = [
    "Authenticator",
    "PermissionChecker",
    "TokenGenerator",
]

__version__ = "1.0.0"
```

## Best Practices

### DO

✅ **Write docstrings for all public APIs** - Modules, classes, functions, methods

✅ **Use consistent style** - Choose Google or NumPy style and stick to it

✅ **Document parameters and return values** - Explain what they are and constraints

✅ **Document exceptions** - List all exceptions that can be raised

✅ **Provide examples** - Show how to use the function/class

✅ **Keep docstrings up to date** - Update when code changes

✅ **Use type hints** - Complement docstrings with type information

✅ **Document edge cases** - Explain behavior for special inputs

✅ **Use imperative mood** - "Return user" not "Returns user"

✅ **Be concise but complete** - Provide necessary information without verbosity

### DON'T

❌ **Don't duplicate type information** - Type hints handle types, docstrings handle semantics

```python
# Bad - Duplicates type information
def get_user(user_id: int) -> User:
    """Get user by ID.

    Args:
        user_id (int): User ID as integer

    Returns:
        User: User object
    """
    pass

# Good - Type hints provide type info, docstring provides semantic info
def get_user(user_id: int) -> User:
    """Get user by ID.

    Args:
        user_id: Unique identifier for the user

    Returns:
        User object with all profile data loaded
    """
    pass
```

❌ **Don't write obvious docstrings** - Add value, don't state the obvious

```python
# Bad - States the obvious
def add(a: int, b: int) -> int:
    """Add two numbers.

    Args:
        a: First number
        b: Second number

    Returns:
        Sum of a and b
    """
    return a + b

# Good - Simple function, simple docstring
def add(a: int, b: int) -> int:
    """Return sum of two numbers."""
    return a + b
```

❌ **Don't let docstrings get stale** - Update when code changes

❌ **Don't mix docstring styles** - Be consistent across codebase

❌ **Don't document private methods extensively** - Brief docstrings are fine

```python
# Good - Brief docstring for private method
def _validate_email(self, email: str) -> bool:
    """Check if email format is valid."""
    return "@" in email and "." in email.split("@")[1]
```

## Tools and Validation

### Docstring Linters

```bash
# pydocstyle - Check docstring conventions
pip install pydocstyle
pydocstyle mymodule.py

# darglint - Check docstring matches function signature
pip install darglint
darglint mymodule.py

# interrogate - Check docstring coverage
pip install interrogate
interrogate -v mymodule.py
```

### Generating Documentation

```bash
# Sphinx - Generate HTML documentation
pip install sphinx
sphinx-quickstart
sphinx-build -b html docs/ docs/_build/

# pdoc - Simple documentation generator
pip install pdoc
pdoc --html mymodule
```

## Summary

**Key Takeaways:**

1. **Write docstrings for all public APIs** - Modules, classes, functions
2. **Choose a consistent style** - Google or NumPy style
3. **Document parameters, returns, and exceptions** - Be complete
4. **Provide examples** - Show usage patterns
5. **Use type hints** - Complement docstrings with type information
6. **Keep docstrings updated** - Maintain accuracy
7. **Be concise but informative** - Add value, avoid verbosity
8. **Use imperative mood** - "Return" not "Returns"
9. **Document edge cases and constraints** - Explain special behavior
10. **Validate with tools** - Use pydocstyle, darglint, interrogate


