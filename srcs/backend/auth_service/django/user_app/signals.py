from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.utils import timezone

@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    user.is_online = True
    user.last_activity = timezone.now()
    user.save(update_fields=['is_online', 'last_activity'])

@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    user.is_online = False
    user.save(update_fields=['is_online'])
