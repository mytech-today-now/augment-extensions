# Python Coding Standards Specification

## Overview

This specification defines the Python coding standards module for Augment Extensions, providing comprehensive guidelines for Python development following PEP 8 and modern Python best practices.

## Requirements

### Requirement: Module Structure
The Python coding standards module SHALL follow the standard Augment Extensions module structure.

#### Scenario: Create module directory
- GIVEN a need for Python coding standards
- WHEN creating the module
- THEN it MUST be located at `augment-extensions/coding-standards/python/`
- AND it MUST include `module.json`, `README.md`, and `rules/` directory
- AND it MUST include an `examples/` directory with Python code examples

### Requirement: Naming Conventions
The module SHALL provide comprehensive Python naming conventions following PEP 8.

#### Scenario: Variable naming
- GIVEN Python code with variables
- WHEN naming variables
- THEN snake_case MUST be used for variables and functions
- AND UPPER_SNAKE_CASE MUST be used for constants
- AND PascalCase MUST be used for classes
- AND _leading_underscore MUST indicate internal/private members

#### Scenario: Module and package naming
- GIVEN Python modules and packages
- WHEN naming them
- THEN lowercase with underscores MUST be used
- AND names SHOULD be short and descriptive
- AND avoid using hyphens in module names

### Requirement: Type Hints
The module SHALL provide guidelines for Python type hints (PEP 484, 585, 604).

#### Scenario: Function type hints
- GIVEN a Python function
- WHEN defining the function
- THEN parameters SHOULD have type hints
- AND return type SHOULD be specified
- AND Optional, Union, and other typing constructs SHOULD be used appropriately

#### Scenario: Modern type hint syntax
- GIVEN Python 3.10+ code
- WHEN using type hints
- THEN modern syntax (e.g., `list[str]` instead of `List[str]`) SHOULD be preferred
- AND union types using `|` (e.g., `str | None`) SHOULD be preferred over `Optional`

### Requirement: Code Organization
The module SHALL provide guidelines for organizing Python code.

#### Scenario: Import organization
- GIVEN a Python file with imports
- WHEN organizing imports
- THEN standard library imports MUST come first
- AND third-party imports MUST come second
- AND local application imports MUST come third
- AND each group SHOULD be separated by a blank line
- AND imports SHOULD be alphabetically sorted within groups

#### Scenario: Class organization
- GIVEN a Python class
- WHEN organizing class members
- THEN class variables MUST come first
- AND `__init__` MUST come before other methods
- AND public methods MUST come before private methods
- AND related methods SHOULD be grouped together

### Requirement: Error Handling
The module SHALL provide Python-specific error handling patterns.

#### Scenario: Exception handling
- GIVEN code that may raise exceptions
- WHEN handling exceptions
- THEN specific exceptions SHOULD be caught rather than bare `except:`
- AND exceptions SHOULD be re-raised when appropriate
- AND custom exceptions SHOULD inherit from appropriate base classes

#### Scenario: Context managers
- GIVEN resource management needs
- WHEN managing resources
- THEN context managers (`with` statement) SHOULD be used
- AND custom context managers SHOULD be created when appropriate
- AND `contextlib` utilities SHOULD be leveraged

### Requirement: Async Patterns
The module SHALL provide guidelines for asynchronous Python code.

#### Scenario: Async/await usage
- GIVEN asynchronous operations
- WHEN writing async code
- THEN `async def` MUST be used for coroutines
- AND `await` MUST be used for awaitable objects
- AND async context managers SHOULD use `async with`
- AND async iterators SHOULD use `async for`

#### Scenario: Async best practices
- GIVEN async Python code
- WHEN structuring the code
- THEN avoid mixing sync and async code inappropriately
- AND use `asyncio.gather()` for concurrent operations
- AND handle cancellation properly
- AND avoid blocking operations in async functions

### Requirement: Documentation Standards
The module SHALL provide Python documentation standards.

#### Scenario: Docstring format
- GIVEN Python functions, classes, and modules
- WHEN documenting them
- THEN docstrings MUST use triple double-quotes
- AND Google-style or NumPy-style docstrings SHOULD be used consistently
- AND all public APIs MUST have docstrings
- AND docstrings SHOULD include parameter types, return types, and examples

### Requirement: Testing Patterns
The module SHALL provide Python testing best practices.

#### Scenario: Test organization
- GIVEN Python tests
- WHEN organizing tests
- THEN tests SHOULD be in a `tests/` directory
- AND test files SHOULD be named `test_*.py`
- AND test functions SHOULD be named `test_*`
- AND pytest SHOULD be the preferred testing framework

#### Scenario: Test structure
- GIVEN a test function
- WHEN writing the test
- THEN follow Arrange-Act-Assert pattern
- AND use fixtures for setup/teardown
- AND use parametrize for multiple test cases
- AND mock external dependencies appropriately

### Requirement: Code Quality Tools
The module SHALL provide guidelines for Python code quality tools.

#### Scenario: Linting and formatting
- GIVEN Python code
- WHEN ensuring code quality
- THEN Black SHOULD be used for code formatting
- AND Ruff or Flake8 SHOULD be used for linting
- AND mypy SHOULD be used for type checking
- AND isort SHOULD be used for import sorting

### Requirement: Module Metadata
The module SHALL include proper metadata in `module.json`.

#### Scenario: Module configuration
- GIVEN the Python standards module
- WHEN configuring the module
- THEN `module.json` MUST include name, version, description
- AND version MUST start at "1.0.0"
- AND type MUST be "coding-standards"
- AND language MUST be "python"
- AND character count MUST be calculated and included

## Module Contents

The module SHALL include the following files:

### Required Files
- `module.json` - Module metadata and configuration
- `README.md` - Module overview and usage instructions
- `rules/naming-conventions.md` - Python naming conventions (PEP 8)
- `rules/type-hints.md` - Type hints and type checking guidelines
- `rules/code-organization.md` - Import organization, class structure, module layout
- `rules/error-handling.md` - Exception handling and context managers
- `rules/async-patterns.md` - Async/await patterns and best practices
- `rules/documentation.md` - Docstring standards and documentation practices
- `rules/testing.md` - Testing patterns with pytest
- `examples/best-practices.py` - Comprehensive Python code examples

### Optional Files
- `examples/async-examples.py` - Async/await examples
- `examples/type-hints-examples.py` - Type hints examples
- `examples/testing-examples.py` - Testing examples

## Character Count Target

The module SHOULD target approximately 15,000-25,000 characters to match the TypeScript standards module scope.

