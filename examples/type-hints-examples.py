"""
Python Type Hints Examples

This module demonstrates modern Python type hints including:
- Function annotations
- Generic types
- Union and Optional types
- TypedDict and Protocol
- Advanced typing patterns
"""

from __future__ import annotations

from typing import (
    Any, Callable, Protocol, TypeVar, Generic,
    TypedDict, Literal, Final
)
from collections.abc import Iterator, Sequence
from dataclasses import dataclass


# ============================================================================
# BASIC TYPE HINTS
# ============================================================================

def greet(name: str) -> str:
    """Simple function with type hints"""
    return f"Hello, {name}!"


def add_numbers(a: int, b: int) -> int:
    """Function with multiple parameters"""
    return a + b


def find_user(user_id: int) -> dict[str, Any] | None:
    """Function returning optional value using union operator (Python 3.10+)"""
    if user_id > 0:
        return {"id": user_id, "name": f"User {user_id}"}
    return None


# ============================================================================
# MODERN COLLECTION TYPES (Python 3.10+, PEP 585)
# ============================================================================

def process_items(items: list[str]) -> list[int]:
    """Use list[T] instead of List[T]"""
    return [len(item) for item in items]


def get_user_data(user_id: int) -> dict[str, str | int]:
    """Dictionary with mixed value types"""
    return {
        "id": user_id,
        "name": "Alice",
        "age": 30
    }


def get_coordinates() -> tuple[float, float]:
    """Fixed-size tuple"""
    return (10.5, 20.3)


def get_user_roles() -> set[str]:
    """Set type hint"""
    return {"admin", "user", "moderator"}


# ============================================================================
# UNION TYPES (Python 3.10+, PEP 604)
# ============================================================================

def process_value(value: int | str | float) -> str:
    """Union type using | operator"""
    return str(value)


def get_config(key: str) -> str | int | bool | None:
    """Multiple union types"""
    configs = {
        "debug": True,
        "port": 8080,
        "host": "localhost"
    }
    return configs.get(key)


# ============================================================================
# CALLABLE TYPE HINTS
# ============================================================================

def apply_operation(value: int, operation: Callable[[int], int]) -> int:
    """Function accepting another function as parameter"""
    return operation(value)


def create_multiplier(factor: int) -> Callable[[int], int]:
    """Function returning a function"""
    def multiply(x: int) -> int:
        return x * factor
    return multiply


# Example usage
def double(x: int) -> int:
    return x * 2


result = apply_operation(5, double)  # Returns 10


# ============================================================================
# GENERIC TYPES
# ============================================================================

T = TypeVar('T')


def get_first_item(items: list[T]) -> T | None:
    """Generic function working with any type"""
    return items[0] if items else None


def reverse_list(items: list[T]) -> list[T]:
    """Generic function preserving type"""
    return list(reversed(items))


class Stack(Generic[T]):
    """Generic class for stack data structure"""
    
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        """Add item to stack"""
        self._items.append(item)
    
    def pop(self) -> T | None:
        """Remove and return top item"""
        return self._items.pop() if self._items else None
    
    def peek(self) -> T | None:
        """View top item without removing"""
        return self._items[-1] if self._items else None


# Usage
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)

str_stack: Stack[str] = Stack()
str_stack.push("hello")
str_stack.push("world")


# ============================================================================
# TYPEDDICT
# ============================================================================

class UserDict(TypedDict):
    """Typed dictionary for user data"""
    id: int
    username: str
    email: str
    is_active: bool


class UserDictOptional(TypedDict, total=False):
    """TypedDict with optional fields"""
    id: int
    username: str
    email: str
    age: int  # Optional field


def create_user(username: str, email: str) -> UserDict:
    """Function returning TypedDict"""
    return {
        "id": 1,
        "username": username,
        "email": email,
        "is_active": True
    }


# ============================================================================
# PROTOCOL (Structural Subtyping)
# ============================================================================

class Drawable(Protocol):
    """Protocol for objects that can be drawn"""

    def draw(self) -> None:
        """Draw the object"""
        ...


class Circle:
    """Circle class implementing Drawable protocol"""

    def __init__(self, radius: float) -> None:
        self.radius = radius

    def draw(self) -> None:
        """Draw circle"""
        print(f"Drawing circle with radius {self.radius}")


class Rectangle:
    """Rectangle class implementing Drawable protocol"""

    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def draw(self) -> None:
        """Draw rectangle"""
        print(f"Drawing rectangle {self.width}x{self.height}")


def render(obj: Drawable) -> None:
    """Render any drawable object"""
    obj.draw()


# Usage - both Circle and Rectangle work with render()
circle = Circle(5.0)
rectangle = Rectangle(10.0, 20.0)
render(circle)
render(rectangle)


# ============================================================================
# LITERAL TYPES
# ============================================================================

def set_log_level(level: Literal["DEBUG", "INFO", "WARNING", "ERROR"]) -> None:
    """Function accepting only specific string values"""
    print(f"Log level set to {level}")


# Valid calls
set_log_level("DEBUG")
set_log_level("ERROR")
# Invalid: set_log_level("INVALID")  # Type checker will flag this


# ============================================================================
# FINAL TYPES
# ============================================================================

MAX_CONNECTIONS: Final[int] = 100
API_VERSION: Final[str] = "v1.0.0"

# These cannot be reassigned
# MAX_CONNECTIONS = 200  # Type checker will flag this


# ============================================================================
# DATACLASSES WITH TYPE HINTS
# ============================================================================

@dataclass
class User:
    """User model using dataclass"""
    id: int
    username: str
    email: str
    age: int | None = None
    is_active: bool = True

    def get_display_name(self) -> str:
        """Get user display name"""
        return f"{self.username} ({self.email})"


@dataclass
class Product:
    """Product model with validation"""
    name: str
    price: float
    quantity: int = 0

    def __post_init__(self) -> None:
        """Validate data after initialization"""
        if self.price < 0:
            raise ValueError("Price cannot be negative")
        if self.quantity < 0:
            raise ValueError("Quantity cannot be negative")


# ============================================================================
# ADVANCED PATTERNS
# ============================================================================

def process_data(
    data: Sequence[int],
    transform: Callable[[int], int] | None = None
) -> Iterator[int]:
    """Generator function with type hints"""
    for item in data:
        if transform:
            yield transform(item)
        else:
            yield item


# Multiple type variables
K = TypeVar('K')
V = TypeVar('V')


def swap_dict(d: dict[K, V]) -> dict[V, K]:
    """Swap keys and values in dictionary"""
    return {v: k for k, v in d.items()}


# Bounded type variable
Number = TypeVar('Number', int, float)


def add_numbers_generic(a: Number, b: Number) -> Number:
    """Generic function constrained to int or float"""
    return a + b  # type: ignore


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    # Test basic functions
    print(greet("Alice"))
    print(add_numbers(5, 3))

    # Test generic stack
    stack: Stack[str] = Stack()
    stack.push("first")
    stack.push("second")
    print(f"Popped: {stack.pop()}")

    # Test TypedDict
    user = create_user("bob", "bob@example.com")
    print(f"Created user: {user}")

    # Test dataclass
    user_obj = User(id=1, username="charlie", email="charlie@example.com", age=25)
    print(f"User: {user_obj.get_display_name()}")

    # Test Protocol
    shapes: list[Drawable] = [Circle(5.0), Rectangle(10.0, 20.0)]
    for shape in shapes:
        render(shape)

