"""
Views for the core app.

This module provides core API views including health checks
and other system-level endpoints.
"""

from typing import Dict, Any

from django.db import connection
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


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
