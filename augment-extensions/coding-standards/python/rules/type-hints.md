# Python Type Hints

Use type hints extensively for better code quality and IDE support. Follow PEP 484, PEP 585, and PEP 604 for modern Python 3.10+ syntax.

## Basic Type Hints

```python
# Function parameters and return types
def greet(name: str) -> str:
    return f"Hello, {name}"

def add_numbers(a: int, b: int) -> int:
    return a + b

def get_user_age(user_id: int) -> int | None:
    """Returns age or None if user not found"""
    pass
```

## Modern Collection Types (Python 3.10+, PEP 585)

Use built-in collection types instead of importing from `typing`.

```python
# Lists - Use list[T] instead of List[T]
def process_items(items: list[str]) -> list[int]:
    return [len(item) for item in items]

# Dictionaries - Use dict[K, V] instead of Dict[K, V]
def get_user_data() -> dict[str, str]:
    return {"name": "John", "email": "john@example.com"}

# Sets - Use set[T] instead of Set[T]
def get_unique_ids() -> set[int]:
    return {1, 2, 3, 4, 5}

# Tuples - Use tuple[T, ...] instead of Tuple[T, ...]
def get_coordinates() -> tuple[float, float]:
    return (10.5, 20.3)

# Variable-length tuples
def get_values() -> tuple[int, ...]:
    return (1, 2, 3, 4, 5)
```

## Union Types (Python 3.10+, PEP 604)

Use `X | Y` syntax instead of `Union[X, Y]`.

```python
# Union with None (replaces Optional[T])
def find_user(user_id: int) -> User | None:
    """Returns User or None if not found"""
    pass

# Union of multiple types
def process_value(value: int | str) -> str:
    return str(value)

# Multiple optional parameters
def create_user(
    name: str,
    email: str,
    age: int | None = None,
    phone: str | None = None
) -> User:
    pass

# Complex unions
def parse_config(value: str | int | float | bool) -> dict[str, str | int]:
    pass
```

## Legacy Syntax (Python 3.9 and earlier)

For compatibility with older Python versions, use `typing` module imports.

```python
from typing import Optional, Union, List, Dict, Set, Tuple

# Optional (value or None)
def find_user(user_id: int) -> Optional[User]:
    pass

# Union (multiple possible types)
def process_value(value: Union[int, str]) -> str:
    return str(value)

# Collections
def process_items(items: List[str]) -> List[int]:
    return [len(item) for item in items]
```

## Generic Types

```python
from typing import TypeVar, Generic

T = TypeVar('T')

# Modern syntax (Python 3.10+)
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Usage
int_stack: Stack[int] = Stack()
str_stack: Stack[str] = Stack()
```

## Callable Types

```python
from collections.abc import Callable

# Function that takes a callback (modern syntax)
def process_data(
    data: list[int],
    callback: Callable[[int], str]
) -> list[str]:
    return [callback(item) for item in data]

# Function that returns a function
def create_multiplier(factor: int) -> Callable[[int], int]:
    def multiply(x: int) -> int:
        return x * factor
    return multiply
```

## Class Type Hints

```python
from typing import ClassVar
from dataclasses import dataclass

class User:
    # Class variable
    user_count: ClassVar[int] = 0

    def __init__(self, name: str, age: int) -> None:
        self.name: str = name
        self.age: int = age
        User.user_count += 1

    def get_info(self) -> dict[str, str | int]:
        return {"name": self.name, "age": self.age}

# Using dataclasses (recommended)
@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0
```

## Protocol and Abstract Types

```python
from typing import Protocol
from abc import ABC, abstractmethod

# Protocol (structural subtyping)
class Drawable(Protocol):
    def draw(self) -> None:
        ...

# Abstract base class
class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass
    
    @abstractmethod
    def perimeter(self) -> float:
        pass
```

## Type Aliases

```python
# Modern syntax (Python 3.10+)
# Simple aliases
UserId = int
UserName = str
Coordinates = tuple[float, float]

# Complex aliases
UserData = dict[str, str | int | list[str]]
Matrix = list[list[float]]

def get_user(user_id: UserId) -> UserName:
    pass

def process_matrix(matrix: Matrix) -> Matrix:
    pass

# Type alias with TypeAlias annotation (Python 3.10+)
from typing import TypeAlias

Vector: TypeAlias = list[float]
ConnectionOptions: TypeAlias = dict[str, str | int | bool]
```

## Mypy Type Checking (PEP 484)

Configure mypy for strict type checking.

```ini
# mypy.ini or setup.cfg
[mypy]
python_version = 3.10
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_any_unimported = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
check_untyped_defs = True
strict_equality = True
```

```python
# Run mypy
# $ mypy myproject/

# Ignore specific lines
result = legacy_function()  # type: ignore

# Ignore specific error codes
result = legacy_function()  # type: ignore[no-untyped-call]
```

## Best Practices

1. **Use modern syntax** - Prefer `list[str]` over `List[str]` (Python 3.10+)
2. **Use union operator** - Prefer `str | None` over `Optional[str]` (Python 3.10+)
3. **Always use type hints** - For all function parameters and return values
4. **Use specific types** - Avoid `Any` when possible
5. **Use TypeVar** - For generic functions and classes
6. **Use Protocol** - For duck typing and structural subtyping
7. **Run mypy** - Use mypy or pyright for static type checking
8. **Use dataclasses** - For simple data containers with type hints
9. **Document complex types** - Add comments for complex type annotations
10. **Follow PEP 484, 585, 604** - Stay current with Python typing standards

