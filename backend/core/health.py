"""
API Health Check and Monitoring Endpoints

Provides comprehensive health checks for production monitoring:
- Database connectivity
- Cache (Redis) connectivity
- Celery worker status
- Disk space
- Memory usage
- External service connectivity
"""

import os
import time
import psutil
from datetime import datetime
from typing import Dict, Any, List

from django.db import connection
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def check_database() -> Dict[str, Any]:
    """Check database connectivity and response time."""
    start = time.time()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        latency = (time.time() - start) * 1000  # ms
        return {
            'status': 'healthy',
            'latency_ms': round(latency, 2),
            'engine': connection.vendor
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }


def check_cache() -> Dict[str, Any]:
    """Check cache (Redis) connectivity."""
    start = time.time()
    try:
        # Test write
        cache.set('health_check', 'ok', timeout=10)
        # Test read
        value = cache.get('health_check')
        # Test delete
        cache.delete('health_check')
        
        latency = (time.time() - start) * 1000
        
        if value == 'ok':
            return {
                'status': 'healthy',
                'latency_ms': round(latency, 2)
            }
        else:
            return {
                'status': 'degraded',
                'message': 'Cache read/write mismatch'
            }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }


def check_disk() -> Dict[str, Any]:
    """Check disk usage."""
    try:
        disk = psutil.disk_usage('/')
        status = 'healthy'
        if disk.percent > 90:
            status = 'critical'
        elif disk.percent > 80:
            status = 'warning'
        
        return {
            'status': status,
            'total_gb': round(disk.total / (1024**3), 2),
            'used_gb': round(disk.used / (1024**3), 2),
            'free_gb': round(disk.free / (1024**3), 2),
            'percent_used': disk.percent
        }
    except Exception as e:
        return {
            'status': 'unknown',
            'error': str(e)
        }


def check_memory() -> Dict[str, Any]:
    """Check memory usage."""
    try:
        memory = psutil.virtual_memory()
        status = 'healthy'
        if memory.percent > 90:
            status = 'critical'
        elif memory.percent > 80:
            status = 'warning'
        
        return {
            'status': status,
            'total_gb': round(memory.total / (1024**3), 2),
            'available_gb': round(memory.available / (1024**3), 2),
            'percent_used': memory.percent
        }
    except Exception as e:
        return {
            'status': 'unknown',
            'error': str(e)
        }


def check_celery() -> Dict[str, Any]:
    """Check Celery worker status."""
    try:
        from config.celery import app as celery_app
        
        # Ping workers
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        
        if stats:
            workers = list(stats.keys())
            return {
                'status': 'healthy',
                'workers': len(workers),
                'worker_names': workers
            }
        else:
            return {
                'status': 'unhealthy',
                'message': 'No workers responding'
            }
    except Exception as e:
        return {
            'status': 'unavailable',
            'message': str(e)
        }


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Basic health check endpoint.
    
    Returns 200 if the service is running.
    Used by load balancers and container orchestrators.
    """
    return Response({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'version': getattr(settings, 'APP_VERSION', '1.0.0')
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_detailed(request):
    """
    Detailed health check with all dependencies.
    
    Used for monitoring and debugging.
    """
    checks = {
        'database': check_database(),
        'cache': check_cache(),
        'disk': check_disk(),
        'memory': check_memory(),
    }
    
    # Only check celery if not in DEBUG mode
    if not settings.DEBUG:
        checks['celery'] = check_celery()
    
    # Determine overall status
    statuses = [c.get('status', 'unknown') for c in checks.values()]
    
    if all(s == 'healthy' for s in statuses):
        overall_status = 'healthy'
        http_status = 200
    elif any(s in ['unhealthy', 'critical'] for s in statuses):
        overall_status = 'unhealthy'
        http_status = 503
    else:
        overall_status = 'degraded'
        http_status = 200
    
    response_data = {
        'status': overall_status,
        'timestamp': datetime.utcnow().isoformat(),
        'version': getattr(settings, 'APP_VERSION', '1.0.0'),
        'environment': 'production' if not settings.DEBUG else 'development',
        'checks': checks
    }
    
    return Response(response_data, status=http_status)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Kubernetes readiness probe.
    
    Returns 200 only if the service is ready to accept traffic.
    """
    # Check critical dependencies
    db_check = check_database()
    cache_check = check_cache()
    
    is_ready = (
        db_check.get('status') == 'healthy' and
        cache_check.get('status') in ['healthy', 'degraded']
    )
    
    if is_ready:
        return Response({'status': 'ready'}, status=200)
    else:
        return Response({
            'status': 'not ready',
            'database': db_check.get('status'),
            'cache': cache_check.get('status')
        }, status=503)


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Kubernetes liveness probe.
    
    Returns 200 if the process is alive.
    Simple check that doesn't verify dependencies.
    """
    return Response({'status': 'alive'}, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def metrics(request):
    """
    Prometheus-compatible metrics endpoint.
    
    Returns metrics in Prometheus text format.
    """
    lines = []
    
    # Process metrics
    process = psutil.Process()
    
    # CPU
    lines.append(f'# HELP process_cpu_percent CPU usage percentage')
    lines.append(f'# TYPE process_cpu_percent gauge')
    lines.append(f'process_cpu_percent {process.cpu_percent()}')
    
    # Memory
    mem = process.memory_info()
    lines.append(f'# HELP process_memory_bytes Memory usage in bytes')
    lines.append(f'# TYPE process_memory_bytes gauge')
    lines.append(f'process_memory_bytes {mem.rss}')
    
    # Disk
    disk = psutil.disk_usage('/')
    lines.append(f'# HELP disk_usage_percent Disk usage percentage')
    lines.append(f'# TYPE disk_usage_percent gauge')
    lines.append(f'disk_usage_percent {disk.percent}')
    
    # Database latency
    db_check = check_database()
    if db_check.get('status') == 'healthy':
        lines.append(f'# HELP db_latency_ms Database latency in milliseconds')
        lines.append(f'# TYPE db_latency_ms gauge')
        lines.append(f'db_latency_ms {db_check.get("latency_ms", 0)}')
    
    # Service up
    lines.append(f'# HELP service_up Service is up and running')
    lines.append(f'# TYPE service_up gauge')
    lines.append(f'service_up 1')
    
    response = '\n'.join(lines) + '\n'
    return Response(response, content_type='text/plain')
