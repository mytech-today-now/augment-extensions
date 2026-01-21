# Python Best Practices

General Python best practices for clean, maintainable code.

## Code Style

Follow PEP 8 strictly. Use tools like `black`, `flake8`, and `isort`.

```python
# Good - PEP 8 compliant
def calculate_total_price(items: List[Item], tax_rate: float = 0.1) -> float:
    """Calculate total price including tax."""
    subtotal = sum(item.price for item in items)
    return subtotal * (1 + tax_rate)

# Bad - Not PEP 8 compliant
def calculateTotalPrice(items,tax_rate=0.1):
    subtotal=sum([item.price for item in items])
    return subtotal*(1+tax_rate)
```

## List Comprehensions

Use comprehensions for simple transformations, loops for complex logic.

```python
# Good - Simple transformation
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# Good - Dictionary comprehension
user_ages = {user.name: user.age for user in users}

# Bad - Too complex
result = [
    process_item(item, config)
    for item in items
    if item.is_valid() and item.status == 'active'
    for config in get_configs(item)
    if config.enabled
]

# Better - Use regular loop for complex logic
result = []
for item in items:
    if item.is_valid() and item.status == 'active':
        for config in get_configs(item):
            if config.enabled:
                result.append(process_item(item, config))
```

## Function Design

Keep functions small, focused, and testable.

```python
# Good - Single responsibility
def validate_email(email: str) -> bool:
    """Validate email format."""
    return '@' in email and '.' in email.split('@')[1]

def send_email(to: str, subject: str, body: str) -> None:
    """Send email to recipient."""
    if not validate_email(to):
        raise ValueError(f"Invalid email: {to}")
    # Send email logic

# Bad - Multiple responsibilities
def send_email(to: str, subject: str, body: str) -> None:
    # Validation
    if '@' not in to or '.' not in to.split('@')[1]:
        raise ValueError(f"Invalid email: {to}")
    # Database logging
    db.log_email(to, subject)
    # Sending
    smtp.send(to, subject, body)
    # Analytics
    analytics.track('email_sent', to)
```

## Use Dataclasses

For simple data containers, use dataclasses instead of regular classes.

```python
from dataclasses import dataclass, field
from typing import List

# Good - Dataclass
@dataclass
class User:
    name: str
    email: str
    age: int
    tags: List[str] = field(default_factory=list)
    
    def is_adult(self) -> bool:
        return self.age >= 18

# Bad - Manual implementation
class User:
    def __init__(self, name, email, age, tags=None):
        self.name = name
        self.email = email
        self.age = age
        self.tags = tags if tags is not None else []
    
    def __repr__(self):
        return f"User(name={self.name}, email={self.email}, age={self.age})"
```

## Use Enums

For fixed sets of values, use Enums.

```python
from enum import Enum, auto

# Good - Enum
class Status(Enum):
    PENDING = auto()
    APPROVED = auto()
    REJECTED = auto()

def process_request(status: Status) -> None:
    if status == Status.APPROVED:
        approve()
    elif status == Status.REJECTED:
        reject()

# Bad - String constants
STATUS_PENDING = "pending"
STATUS_APPROVED = "approved"
STATUS_REJECTED = "rejected"
```

## Use Pathlib

For file paths, use `pathlib` instead of string manipulation.

```python
from pathlib import Path

# Good - Pathlib
config_dir = Path.home() / '.config' / 'myapp'
config_file = config_dir / 'config.json'

if config_file.exists():
    data = config_file.read_text()

# Bad - String manipulation
import os
config_dir = os.path.join(os.path.expanduser('~'), '.config', 'myapp')
config_file = os.path.join(config_dir, 'config.json')

if os.path.exists(config_file):
    with open(config_file) as f:
        data = f.read()
```

## Use F-Strings

For string formatting, use f-strings (Python 3.6+).

```python
# Good - F-strings
name = "Alice"
age = 30
message = f"Hello, {name}! You are {age} years old."
formatted = f"Price: ${price:.2f}"

# Bad - Old-style formatting
message = "Hello, %s! You are %d years old." % (name, age)
message = "Hello, {}! You are {} years old.".format(name, age)
```

## Use Generators

For large datasets, use generators to save memory.

```python
# Good - Generator
def read_large_file(file_path: Path):
    with file_path.open() as f:
        for line in f:
            yield line.strip()

# Usage
for line in read_large_file(Path('large_file.txt')):
    process(line)

# Bad - Load everything into memory
def read_large_file(file_path: Path):
    with file_path.open() as f:
        return [line.strip() for line in f]
```

## Use Default Dict and Counter

```python
from collections import defaultdict, Counter

# Good - defaultdict
word_count = defaultdict(int)
for word in words:
    word_count[word] += 1

# Good - Counter (even better)
word_count = Counter(words)

# Bad - Manual checking
word_count = {}
for word in words:
    if word in word_count:
        word_count[word] += 1
    else:
        word_count[word] = 1
```

## Best Practices Summary

1. **Follow PEP 8** - Use automated formatters
2. **Use type hints** - Everywhere
3. **Keep functions small** - Single responsibility
4. **Use dataclasses** - For data containers
5. **Use Enums** - For fixed sets of values
6. **Use pathlib** - For file paths
7. **Use f-strings** - For string formatting
8. **Use generators** - For large datasets
9. **Use comprehensions** - For simple transformations
10. **Write tests** - Always

