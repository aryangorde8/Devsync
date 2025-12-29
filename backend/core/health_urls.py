"""
Health check URL patterns.
"""

from django.urls import path
from core.health import (
    health_check,
    health_check_detailed,
    readiness_check,
    liveness_check,
    metrics,
)

urlpatterns = [
    path("", health_check, name="health"),
    path("detailed/", health_check_detailed, name="health-detailed"),
    path("ready/", readiness_check, name="readiness"),
    path("live/", liveness_check, name="liveness"),
    path("metrics/", metrics, name="metrics"),
]
