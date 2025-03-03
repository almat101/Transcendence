from django.utils import timezone
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
