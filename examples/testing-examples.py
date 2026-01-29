"""
Python Testing Examples with pytest

This module demonstrates pytest testing patterns including:
- Test structure and organization
- Fixtures and setup/teardown
- Parametrized tests
- Mocking and patching
- Arrange-Act-Assert pattern
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from typing import Any


# ============================================================================
# BASIC TEST STRUCTURE (Arrange-Act-Assert)
# ============================================================================

def add_numbers(a: int, b: int) -> int:
    """Simple function to test"""
    return a + b


def test_add_numbers():
    """Basic test using Arrange-Act-Assert pattern"""
    # Arrange - Set up test data
    num1 = 5
    num2 = 3
    
    # Act - Execute the function
    result = add_numbers(num1, num2)
    
    # Assert - Verify the result
    assert result == 8


def test_add_negative_numbers():
    """Test with negative numbers"""
    # Arrange
    num1 = -5
    num2 = -3
    
    # Act
    result = add_numbers(num1, num2)
    
    # Assert
    assert result == -8


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def sample_user() -> dict[str, Any]:
    """Fixture providing sample user data"""
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "is_active": True
    }


@pytest.fixture
def sample_users() -> list[dict[str, Any]]:
    """Fixture providing multiple users"""
    return [
        {"id": 1, "username": "alice", "email": "alice@example.com"},
        {"id": 2, "username": "bob", "email": "bob@example.com"},
        {"id": 3, "username": "charlie", "email": "charlie@example.com"}
    ]


def test_user_fixture(sample_user):
    """Test using fixture"""
    assert sample_user["username"] == "testuser"
    assert sample_user["is_active"] is True


def test_users_fixture(sample_users):
    """Test using list fixture"""
    assert len(sample_users) == 3
    assert sample_users[0]["username"] == "alice"


# ============================================================================
# PARAMETRIZED TESTS
# ============================================================================

@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (10, -5, 5),
    (100, 200, 300)
])
def test_add_numbers_parametrized(a: int, b: int, expected: int):
    """Parametrized test with multiple inputs"""
    result = add_numbers(a, b)
    assert result == expected


@pytest.mark.parametrize("email,is_valid", [
    ("test@example.com", True),
    ("invalid.email", False),
    ("", False),
    ("user@domain.co.uk", True),
    ("@example.com", False)
])
def test_email_validation(email: str, is_valid: bool):
    """Parametrized test for email validation"""
    def validate_email(email: str) -> bool:
        return "@" in email and len(email) > 3
    
    result = validate_email(email)
    assert result == is_valid


# ============================================================================
# MOCKING AND PATCHING
# ============================================================================

class UserService:
    """Example service class for testing"""
    
    def get_user(self, user_id: int) -> dict[str, Any] | None:
        """Get user from database (simulated)"""
        # In real code, this would query a database
        raise NotImplementedError("Database not connected")
    
    def create_user(self, username: str, email: str) -> dict[str, Any]:
        """Create new user"""
        user = self.get_user(1)  # Check if user exists
        return {"id": 2, "username": username, "email": email}


def test_user_service_with_mock():
    """Test using mock object"""
    # Arrange
    service = UserService()
    service.get_user = Mock(return_value={"id": 1, "username": "existing"})
    
    # Act
    result = service.create_user("newuser", "new@example.com")
    
    # Assert
    assert result["username"] == "newuser"
    service.get_user.assert_called_once_with(1)


@patch('builtins.print')
def test_with_patch(mock_print):
    """Test using patch decorator"""
    # Arrange & Act
    print("Hello, World!")
    
    # Assert
    mock_print.assert_called_once_with("Hello, World!")

