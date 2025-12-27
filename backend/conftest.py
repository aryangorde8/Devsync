"""
Pytest configuration and fixtures for DevSync tests.

This module provides shared fixtures and configuration for all tests.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client() -> APIClient:
    """
    Provide an unauthenticated API client.

    Returns:
        APIClient: DRF test client instance.
    """
    return APIClient()


@pytest.fixture
def user_data() -> dict:
    """
    Provide sample user data for testing.

    Returns:
        dict: User registration data.
    """
    return {
        "email": "testuser@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "first_name": "Test",
        "last_name": "User",
    }


@pytest.fixture
def create_user(db):
    """
    Factory fixture to create users.

    Args:
        db: Database fixture to ensure DB access.

    Returns:
        Callable: Function to create users.
    """
    def _create_user(
        email: str = "testuser@example.com",
        password: str = "SecurePass123!",
        **kwargs
    ) -> User:
        return User.objects.create_user(
            email=email,
            password=password,
            **kwargs
        )
    return _create_user


@pytest.fixture
def authenticated_client(api_client, create_user) -> APIClient:
    """
    Provide an authenticated API client.

    Args:
        api_client: Base API client fixture.
        create_user: User creation fixture.

    Returns:
        APIClient: Authenticated DRF test client.
    """
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def superuser(db) -> User:
    """
    Create a superuser for testing admin functionality.

    Args:
        db: Database fixture to ensure DB access.

    Returns:
        User: Superuser instance.
    """
    return User.objects.create_superuser(
        email="admin@example.com",
        password="AdminPass123!",
    )
