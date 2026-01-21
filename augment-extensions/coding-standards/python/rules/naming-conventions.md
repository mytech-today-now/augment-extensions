# Python Naming Conventions

Follow PEP 8 naming conventions strictly.

## Module Names

- Use lowercase with underscores: `my_module.py`
- Keep names short and descriptive
- Avoid single-letter names except for common abbreviations

```python
# Good
user_authentication.py
data_processor.py
api_client.py

# Bad
UserAuthentication.py
dataProcessor.py
ua.py
```

## Class Names

- Use CapWords (PascalCase)
- Use nouns or noun phrases
- Avoid abbreviations unless widely known

```python
# Good
class UserAccount:
    pass

class HTTPClient:
    pass

class DataProcessor:
    pass

# Bad
class user_account:
    pass

class Http_Client:
    pass

class DP:
    pass
```

## Function and Method Names

- Use lowercase with underscores (snake_case)
- Use verbs or verb phrases
- Be descriptive and clear

```python
# Good
def calculate_total_price():
    pass

def get_user_by_id(user_id: int):
    pass

def is_valid_email(email: str) -> bool:
    pass

# Bad
def CalcPrice():
    pass

def getUserById(userId):
    pass

def valid(e):
    pass
```

## Variable Names

- Use lowercase with underscores
- Be descriptive
- Avoid single letters except in loops or comprehensions

```python
# Good
user_count = 10
total_price = 99.99
is_authenticated = True

# Bad
userCount = 10
tp = 99.99
x = True
```

## Constants

- Use UPPERCASE with underscores
- Define at module level

```python
# Good
MAX_CONNECTIONS = 100
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"

# Bad
maxConnections = 100
default_timeout = 30
apiBaseUrl = "https://api.example.com"
```

## Private Members

- Use single leading underscore for internal use
- Use double leading underscore for name mangling (rare)

```python
class MyClass:
    def __init__(self):
        self._internal_value = 0  # Internal use
        self.__private_value = 0  # Name mangling (rare)
    
    def _internal_method(self):
        """Internal method, not part of public API"""
        pass
    
    def public_method(self):
        """Public API method"""
        pass
```

## Special Methods

- Use double underscores on both sides (dunder methods)
- Only for Python special methods

```python
class MyClass:
    def __init__(self):
        pass
    
    def __str__(self):
        return "MyClass instance"
    
    def __repr__(self):
        return "MyClass()"
```

## Type Variable Names

- Use CapWords for type variables
- Use descriptive names or single capital letters

```python
from typing import TypeVar

T = TypeVar('T')
UserType = TypeVar('UserType')
KeyType = TypeVar('KeyType')
ValueType = TypeVar('ValueType')
```

## Best Practices

1. **Consistency**: Follow the same naming pattern throughout the codebase
2. **Clarity**: Prefer clarity over brevity
3. **Context**: Use context to avoid redundant names
4. **Avoid**: Hungarian notation, type prefixes
5. **Use**: Meaningful names that convey intent

