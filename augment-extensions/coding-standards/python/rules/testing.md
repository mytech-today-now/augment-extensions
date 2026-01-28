# Python Testing with pytest

Use pytest as the primary testing framework for Python projects.

## Test Organization

### Directory Structure

```
project/
├── src/
│   └── mypackage/
│       ├── __init__.py
│       └── module.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_module.py
    └── integration/
        └── test_integration.py
```

### Test File Naming

- Test files: `test_*.py` or `*_test.py`
- Test functions: `test_*`
- Test classes: `Test*`

```python
# Good
test_user_authentication.py
test_data_processor.py

# Bad
user_tests.py
authentication.py
```

## Test Structure

### Arrange-Act-Assert Pattern

```python
def test_user_creation():
    # Arrange
    username = "testuser"
    email = "test@example.com"
    
    # Act
    user = User(username=username, email=email)
    
    # Assert
    assert user.username == username
    assert user.email == email
    assert user.is_active is True
```

### Test Function Naming

Use descriptive names that explain what is being tested:

```python
# Good
def test_user_login_with_valid_credentials():
    pass

def test_user_login_with_invalid_password_raises_error():
    pass

def test_empty_cart_total_is_zero():
    pass

# Bad
def test_login():
    pass

def test_user():
    pass

def test_1():
    pass
```

## pytest Fixtures

### Basic Fixtures

```python
import pytest

@pytest.fixture
def sample_user():
    """Provides a sample user for testing"""
    return User(username="testuser", email="test@example.com")

def test_user_profile(sample_user):
    assert sample_user.username == "testuser"
    assert sample_user.email == "test@example.com"
```

### Fixture Scopes

```python
@pytest.fixture(scope="function")  # Default: new instance per test
def user():
    return User()

@pytest.fixture(scope="class")  # Shared across test class
def database():
    db = Database()
    yield db
    db.close()

@pytest.fixture(scope="module")  # Shared across module
def api_client():
    return APIClient()

@pytest.fixture(scope="session")  # Shared across entire test session
def config():
    return load_config()
```

### Fixture Cleanup with yield

```python
@pytest.fixture
def temp_file():
    """Creates a temporary file and cleans up after test"""
    file_path = "temp_test_file.txt"
    with open(file_path, "w") as f:
        f.write("test data")
    
    yield file_path
    
    # Cleanup
    if os.path.exists(file_path):
        os.remove(file_path)
```

## Parametrized Tests

### Basic Parametrization

```python
import pytest

@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
    (4, 8),
])
def test_double(input, expected):
    assert double(input) == expected
```

### Multiple Parameters

```python
@pytest.mark.parametrize("username,email,is_valid", [
    ("user1", "user1@example.com", True),
    ("user2", "invalid-email", False),
    ("", "user3@example.com", False),
    ("user4", "", False),
])
def test_user_validation(username, email, is_valid):
    user = User(username=username, email=email)
    assert user.is_valid() == is_valid
```

### Parametrize with IDs

```python
@pytest.mark.parametrize("value,expected", [
    (0, "zero"),
    (1, "one"),
    (2, "two"),
], ids=["zero", "one", "two"])
def test_number_to_word(value, expected):
    assert number_to_word(value) == expected
```

## Mocking with pytest-mock

### Basic Mocking

```python
def test_api_call(mocker):
    # Mock external API call
    mock_response = mocker.Mock()
    mock_response.json.return_value = {"status": "success"}
    mock_response.status_code = 200
    
    mocker.patch("requests.get", return_value=mock_response)
    
    result = fetch_data("https://api.example.com/data")
    assert result["status"] == "success"

### Mock Object Methods

```python
def test_user_save(mocker):
    # Mock database save method
    mock_db = mocker.Mock()
    user = User(username="testuser", db=mock_db)

    user.save()

    # Verify method was called
    mock_db.save.assert_called_once()
    mock_db.save.assert_called_with(user)
```

### Patch Functions

```python
def test_send_email(mocker):
    # Patch the send_email function
    mock_send = mocker.patch("myapp.email.send_email")

    notify_user("user@example.com", "Welcome!")

    mock_send.assert_called_once_with(
        to="user@example.com",
        subject="Welcome!",
        body=mocker.ANY
    )
```

## Exception Testing

### Testing Exceptions

```python
import pytest

def test_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        result = 10 / 0

def test_invalid_email_raises_validation_error():
    with pytest.raises(ValidationError) as exc_info:
        validate_email("invalid-email")

    assert "Invalid email format" in str(exc_info.value)

def test_user_not_found_raises_custom_error():
    with pytest.raises(UserNotFoundError, match=r"User .* not found"):
        get_user(999)
```

## Test Markers

### Built-in Markers

```python
import pytest

@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.version_info < (3, 10), reason="Requires Python 3.10+")
def test_python_310_feature():
    pass

@pytest.mark.xfail(reason="Known bug, fix in progress")
def test_known_issue():
    pass
```

### Custom Markers

```python
# pytest.ini or pyproject.toml
# [tool.pytest.ini_options]
# markers =
#     slow: marks tests as slow
#     integration: marks tests as integration tests

@pytest.mark.slow
def test_large_dataset_processing():
    pass

@pytest.mark.integration
def test_database_connection():
    pass

# Run only slow tests: pytest -m slow
# Skip slow tests: pytest -m "not slow"
```

## Test Coverage

### Running with Coverage

```bash
# Install pytest-cov
pip install pytest-cov

# Run tests with coverage
pytest --cov=mypackage tests/

# Generate HTML coverage report
pytest --cov=mypackage --cov-report=html tests/

# Fail if coverage below threshold
pytest --cov=mypackage --cov-fail-under=80 tests/
```

### Coverage Configuration

```ini
# .coveragerc or pyproject.toml
[tool.coverage.run]
source = ["src"]
omit = [
    "*/tests/*",
    "*/migrations/*",
    "*/__pycache__/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
]
```

## Best Practices

### DO

✅ Write tests for all public APIs
✅ Use descriptive test names
✅ Follow Arrange-Act-Assert pattern
✅ Use fixtures for common setup
✅ Mock external dependencies
✅ Test edge cases and error conditions
✅ Keep tests independent and isolated
✅ Aim for high test coverage (80%+)

### DON'T

❌ Test implementation details
❌ Write tests that depend on execution order
❌ Use sleep() for timing issues (use proper mocking)
❌ Test third-party library code
❌ Write overly complex tests
❌ Ignore failing tests
❌ Skip writing tests for "simple" code

## Example Test Suite

```python
import pytest
from myapp.models import User
from myapp.exceptions import ValidationError

class TestUser:
    """Test suite for User model"""

    @pytest.fixture
    def valid_user_data(self):
        return {
            "username": "testuser",
            "email": "test@example.com",
            "age": 25
        }

    def test_user_creation_with_valid_data(self, valid_user_data):
        user = User(**valid_user_data)
        assert user.username == valid_user_data["username"]
        assert user.email == valid_user_data["email"]
        assert user.age == valid_user_data["age"]

    @pytest.mark.parametrize("invalid_email", [
        "invalid",
        "@example.com",
        "user@",
        "",
    ])
    def test_user_creation_with_invalid_email_raises_error(self, invalid_email):
        with pytest.raises(ValidationError):
            User(username="test", email=invalid_email, age=25)

    def test_user_full_name_property(self):
        user = User(
            username="jdoe",
            email="jdoe@example.com",
            first_name="John",
            last_name="Doe"
        )
        assert user.full_name == "John Doe"

    def test_user_save_calls_database(self, mocker):
        mock_db = mocker.Mock()
        user = User(username="test", email="test@example.com", db=mock_db)

        user.save()

        mock_db.save.assert_called_once_with(user)
```
```

