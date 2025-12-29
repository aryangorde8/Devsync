"""
Views for the core app.

This module provides core API views including health checks,
metrics endpoints, and other system-level endpoints.
"""

from typing import Dict, Any

from django.db import connection
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .metrics import get_metrics_text


class HealthCheckView(APIView):
    """
    API view for health check endpoint.

    Used by load balancers and monitoring systems to verify
    the application is running correctly.
    """

    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request) -> Response:
        """
        Return health status of the application.

        Args:
            request: The HTTP request object.

        Returns:
            Response: JSON response with health status.
        """
        health_status: Dict[str, Any] = {
            "status": "healthy",
            "version": "1.0.0",
            "services": {
                "database": self._check_database(),
            },
        }

        # Determine overall status
        all_healthy = all(
            service["status"] == "healthy"
            for service in health_status["services"].values()
        )

        if not all_healthy:
            health_status["status"] = "degraded"
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(health_status, status=status.HTTP_200_OK)

    def _check_database(self) -> Dict[str, str]:
        """
        Check database connectivity.

        Returns:
            Dict[str, str]: Database health status.
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return {"status": "healthy"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}


class ReadinessCheckView(APIView):
    """
    Kubernetes readiness probe endpoint.
    
    Checks if the application is ready to receive traffic.
    """
    
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request: Request) -> Response:
        """Check if app is ready to serve requests."""
        checks = {
            "database": self._check_database(),
            "cache": self._check_cache(),
        }
        
        all_ready = all(c["ready"] for c in checks.values())
        
        response_data = {
            "ready": all_ready,
            "checks": checks,
        }
        
        if all_ready:
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(response_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    def _check_database(self) -> Dict[str, Any]:
        """Check database is accessible."""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return {"ready": True}
        except Exception as e:
            return {"ready": False, "error": str(e)}
    
    def _check_cache(self) -> Dict[str, Any]:
        """Check cache is accessible."""
        try:
            from django.core.cache import cache
            cache.set("health_check", "ok", 10)
            if cache.get("health_check") == "ok":
                return {"ready": True}
            return {"ready": False, "error": "Cache read/write failed"}
        except Exception as e:
            return {"ready": False, "error": str(e)}


class MetricsView(APIView):
    """
    Prometheus metrics endpoint.
    
    Exposes application metrics in Prometheus text format.
    """
    
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request: Request) -> HttpResponse:
        """Return Prometheus-formatted metrics."""
        metrics_output = get_metrics_text()
        return HttpResponse(
            metrics_output,
            content_type="text/plain; version=0.0.4; charset=utf-8"
        )
