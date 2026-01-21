# Python Type Hints

Use type hints extensively for better code quality and IDE support.

## Basic Type Hints

```python
from typing import List, Dict, Set, Tuple, Optional, Union

# Function parameters and return types
def greet(name: str) -> str:
    return f"Hello, {name}"

def add_numbers(a: int, b: int) -> int:
    return a + b

def get_user_age(user_id: int) -> Optional[int]:
    """Returns age or None if user not found"""
    pass
```

## Collection Types

```python
from typing import List, Dict, Set, Tuple

# Lists
def process_items(items: List[str]) -> List[int]:
    return [len(item) for item in items]

# Dictionaries
def get_user_data() -> Dict[str, str]:
    return {"name": "John", "email": "john@example.com"}

# Sets
def get_unique_ids() -> Set[int]:
    return {1, 2, 3, 4, 5}

# Tuples
def get_coordinates() -> Tuple[float, float]:
    return (10.5, 20.3)
```

## Optional and Union Types

```python
from typing import Optional, Union

# Optional (value or None)
def find_user(user_id: int) -> Optional[User]:
    """Returns User or None if not found"""
    pass

# Union (multiple possible types)
def process_value(value: Union[int, str]) -> str:
    return str(value)

# Multiple optional parameters
def create_user(
    name: str,
    email: str,
    age: Optional[int] = None,
    phone: Optional[str] = None
) -> User:
    pass
```

## Generic Types

```python
from typing import TypeVar, Generic, List

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: List[T] = []
    
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
from typing import Callable

# Function that takes a callback
def process_data(
    data: List[int],
    callback: Callable[[int], str]
) -> List[str]:
    return [callback(item) for item in data]

# Function that returns a function
def create_multiplier(factor: int) -> Callable[[int], int]:
    def multiply(x: int) -> int:
        return x * factor
    return multiply
```

## Class Type Hints

```python
from typing import ClassVar, List
from dataclasses import dataclass

class User:
    # Class variable
    user_count: ClassVar[int] = 0
    
    def __init__(self, name: str, age: int) -> None:
        self.name: str = name
        self.age: int = age
        User.user_count += 1
    
    def get_info(self) -> Dict[str, Union[str, int]]:
        return {"name": self.name, "age": self.age}

# Using dataclasses
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
from typing import List, Dict, Tuple

# Simple aliases
UserId = int
UserName = str
Coordinates = Tuple[float, float]

# Complex aliases
UserData = Dict[str, Union[str, int, List[str]]]
Matrix = List[List[float]]

def get_user(user_id: UserId) -> UserName:
    pass

def process_matrix(matrix: Matrix) -> Matrix:
    pass
```

## Best Practices

1. **Always use type hints** for function parameters and return values
2. **Use Optional** instead of Union[X, None]
3. **Use specific types** instead of Any when possible
4. **Use TypeVar** for generic functions and classes
5. **Use Protocol** for duck typing
6. **Run mypy** or pyright for type checking
7. **Use dataclasses** for simple data containers
8. **Document complex types** with comments

