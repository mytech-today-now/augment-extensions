# Python Code Organization

Best practices for organizing Python modules, packages, and projects.

## Module Structure

```python
"""Module docstring describing the module's purpose.

This module provides utilities for user authentication.
"""

# Standard library imports
import os
import sys
from pathlib import Path
from typing import List, Dict, Optional

# Third-party imports
import requests
from flask import Flask, request

# Local imports
from .models import User
from .utils import validate_email
from ..config import settings

# Constants
MAX_LOGIN_ATTEMPTS = 3
DEFAULT_TIMEOUT = 30

# Module-level variables
_cache: Dict[str, User] = {}

# Classes
class AuthenticationManager:
    """Manages user authentication."""
    pass

# Functions
def authenticate_user(username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password."""
    pass

# Main execution
if __name__ == "__main__":
    main()
```

## Package Structure

```
myproject/
├── README.md
├── pyproject.toml
├── setup.py
├── requirements.txt
├── .gitignore
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   └── test_users.py
└── myproject/
    ├── __init__.py
    ├── __main__.py
    ├── config.py
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   └── product.py
    ├── services/
    │   ├── __init__.py
    │   ├── auth.py
    │   └── email.py
    └── utils/
        ├── __init__.py
        ├── validation.py
        └── formatting.py
```

## Import Organization

```python
# 1. Standard library imports (alphabetical)
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# 2. Third-party imports (alphabetical)
import numpy as np
import pandas as pd
import requests
from flask import Flask, request, jsonify

# 3. Local application imports (alphabetical)
from .config import settings
from .models import User, Product
from .services import AuthService, EmailService
from .utils import validate_email, format_date
```

## __init__.py Files

```python
# myproject/__init__.py
"""MyProject - A Python application."""

__version__ = "1.0.0"
__author__ = "Your Name"

# Public API
from .models import User, Product
from .services import AuthService, EmailService

__all__ = [
    "User",
    "Product",
    "AuthService",
    "EmailService",
]
```

## Configuration Management

```python
# config.py
from pathlib import Path
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    # App settings
    app_name: str = "MyApp"
    debug: bool = False
    
    # Database settings
    database_url: str
    database_pool_size: int = 10
    
    # API settings
    api_key: Optional[str] = None
    api_timeout: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Global settings instance
settings = Settings()
```

## Dependency Injection

```python
# Good - Dependency injection
class UserService:
    def __init__(self, db_connection, email_service):
        self.db = db_connection
        self.email = email_service
    
    def create_user(self, user_data):
        user = self.db.create(user_data)
        self.email.send_welcome(user.email)
        return user

# Usage
db = DatabaseConnection(settings.database_url)
email = EmailService(settings.smtp_config)
user_service = UserService(db, email)

# Bad - Hard-coded dependencies
class UserService:
    def __init__(self):
        self.db = DatabaseConnection("postgresql://...")
        self.email = EmailService(smtp_config)
```

## Layered Architecture

```
myproject/
├── api/              # API layer (Flask/FastAPI routes)
│   ├── __init__.py
│   ├── users.py
│   └── products.py
├── services/         # Business logic layer
│   ├── __init__.py
│   ├── user_service.py
│   └── product_service.py
├── repositories/     # Data access layer
│   ├── __init__.py
│   ├── user_repository.py
│   └── product_repository.py
├── models/           # Domain models
│   ├── __init__.py
│   ├── user.py
│   └── product.py
└── utils/            # Utilities
    ├── __init__.py
    └── validators.py
```

## Best Practices

1. **One class per file** - For large classes
2. **Group related functions** - In modules
3. **Use __all__** - To define public API
4. **Avoid circular imports** - Restructure if needed
5. **Use absolute imports** - For clarity
6. **Keep modules focused** - Single responsibility
7. **Use packages** - For large projects
8. **Document structure** - In README.md
9. **Follow conventions** - tests/, docs/, src/
10. **Use pyproject.toml** - For modern projects

