from django.utils import timezone
from django.db import connections, OperationalError
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status # type: ignore
from datetime import timedelta

class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Update last_activity for authenticated users
        if request.user.is_authenticated:
            current_time = timezone.now()
            # Only update once per minute to reduce database writes
            update_threshold = current_time - timedelta(minutes=10)

            if not request.user.last_activity or request.user.last_activity < update_threshold:
                request.user.last_activity = current_time
                request.user.is_online = True
                request.user.save(update_fields=['last_activity', 'is_online'])

        return response


class DatabaseConnectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.db_available = True

    def __call__(self, request):
        # Check if database connection is available
        self.db_available = self._check_db_connection()

        if not self.db_available:
            return JsonResponse({
                'error': 'Database is currently unavailable. Please try again later.',
            }, status=503)

        # Continue processing the request
        return self.get_response(request)

    def _check_db_connection(self):
        """Check if database connection is working"""
        try:
            # Try a simple query
            connections['default'].cursor().execute('SELECT 1')
            return True
        except OperationalError:
            return False
