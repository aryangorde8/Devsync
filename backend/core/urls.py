"""
URL configuration for the core app.

This module defines the URL patterns for core functionality endpoints.
"""

from django.urls import path

from .views import HealthCheckView

app_name = "core"

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health_check"),
]
