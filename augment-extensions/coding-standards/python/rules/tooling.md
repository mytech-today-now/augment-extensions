# Python Development Tooling

Essential tools for Python development: Black, mypy, and Ruff.

## Black - Code Formatter

Black is an opinionated code formatter that enforces consistent style.

### Installation

```bash
pip install black
```

### Configuration

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py310']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

### Usage

```bash
# Format a file
black myfile.py

# Format a directory
black src/

# Check without modifying
black --check src/

# Show diff
black --diff src/
```

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3.10
```

## mypy - Static Type Checker

mypy performs static type checking based on type hints.

### Installation

```bash
pip install mypy
```

### Configuration

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_unimported = false
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
check_untyped_defs = true
strict_equality = true

# Per-module options
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

### Usage

```bash
# Check a file
mypy myfile.py

# Check a package
mypy src/

# Check with specific config
mypy --config-file mypy.ini src/

# Show error codes
mypy --show-error-codes src/
```

### Common Type Checking Patterns

```python
# Ignore specific line
result = some_function()  # type: ignore

# Ignore specific error
result = some_function()  # type: ignore[arg-type]

# Assert type for mypy
from typing import cast
value = cast(str, some_value)

# Reveal type (for debugging)
reveal_type(my_variable)  # mypy will show the inferred type
```

## Ruff - Fast Python Linter

Ruff is an extremely fast Python linter written in Rust, replacing Flake8, isort, and more.

### Installation

```bash
pip install ruff
```

### Configuration

```toml
# pyproject.toml
[tool.ruff]
# Same as Black
line-length = 88
indent-width = 4

# Python version
target-version = "py310"

# Exclude directories
exclude = [
    ".bzr",
    ".direnv",
    ".eggs",
    ".git",
    ".git-rewrite",
    ".hg",
    ".mypy_cache",
    ".nox",
    ".pants.d",
    ".pytype",
    ".ruff_cache",
    ".svn",
    ".tox",
    ".venv",
    "__pypackages__",
    "_build",
    "buck-out",
    "build",
    "dist",
    "node_modules",
    "venv",
]

[tool.ruff.lint]
# Enable rules
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
]

# Ignore specific rules
ignore = [
    "E501",  # line too long (handled by Black)
    "B008",  # do not perform function calls in argument defaults
]

# Allow fix for all enabled rules
fixable = ["ALL"]
unfixable = []

# Allow unused variables when underscore-prefixed
dummy-variable-rgx = "^(_+|(_+[a-zA-Z0-9_]*[a-zA-Z0-9]+?))$"

[tool.ruff.format]
# Use Black-compatible formatting
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"

[tool.ruff.lint.per-file-ignores]
# Ignore imports in __init__.py
"__init__.py" = ["F401"]
# Ignore unused arguments in tests
"tests/**/*.py" = ["ARG"]
```

### Usage

```bash
# Lint files
ruff check .

# Lint and auto-fix
ruff check --fix .

# Format code (alternative to Black)
ruff format .

# Check specific rules
ruff check --select E,F .

# Show rule explanations
ruff rule E501
```

### Common Ruff Rules

```python
# E501: Line too long
# Handled by Black, usually ignored

# F401: Imported but unused
import os  # ruff: noqa: F401

# F841: Local variable assigned but never used
result = calculate()  # ruff: noqa: F841

# B006: Mutable default argument
def process(items=[]):  # Bad
    pass

def process(items=None):  # Good
    if items is None:
        items = []

# C4: Unnecessary comprehension
# Bad
list([x for x in items])
# Good
list(items)

# UP: Use modern Python syntax
# Bad (Python 3.9-)
from typing import List
def process(items: List[str]) -> None:
    pass

# Good (Python 3.10+)
def process(items: list[str]) -> None:
    pass
```

## Integrated Workflow

### pyproject.toml Complete Example

```toml
[tool.black]
line-length = 88
target-version = ['py310']

[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
check_untyped_defs = true
strict_equality = true

[tool.ruff]
line-length = 88
target-version = "py310"

[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "C4", "UP", "ARG", "SIM"]
ignore = ["E501"]
fixable = ["ALL"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--strict-config",
    "--cov=src",
    "--cov-report=term-missing",
]
```

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3.10

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

### Makefile for Common Tasks

```makefile
.PHONY: format lint type-check test all

format:
	black src/ tests/
	ruff check --fix src/ tests/

lint:
	ruff check src/ tests/

type-check:
	mypy src/

test:
	pytest tests/ --cov=src --cov-report=term-missing

all: format lint type-check test
```

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -e ".[dev]"

      - name: Format check
        run: black --check src/ tests/

      - name: Lint
        run: ruff check src/ tests/

      - name: Type check
        run: mypy src/

      - name: Test
        run: pytest tests/ --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### DO

✅ Use Black for consistent formatting
✅ Enable strict mypy settings for new projects
✅ Use Ruff for fast linting and auto-fixes
✅ Configure tools in pyproject.toml
✅ Set up pre-commit hooks
✅ Run tools in CI/CD pipeline
✅ Fix warnings incrementally in existing projects

### DON'T

❌ Disable type checking without good reason
❌ Ignore linter warnings without understanding them
❌ Use `# type: ignore` excessively
❌ Skip formatting checks in CI
❌ Mix different formatting styles
❌ Commit code without running formatters/linters

## Editor Integration

### VS Code

```json
// .vscode/settings.json
{
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.linting.mypyEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### PyCharm

- Settings → Tools → Black → Enable "On save"
- Settings → Tools → External Tools → Add Ruff
- Settings → Editor → Inspections → Enable mypy

