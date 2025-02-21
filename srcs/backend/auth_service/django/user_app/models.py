from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# Create your models here.

class UserProfile(AbstractUser):
    # AbstractUser existent fields
    #first_name = models.CharField(max_length=30)
    #last_name = models.CharField(max_length=150)
    #username = models.CharField(max_length=150, unique=True)
    # Online status tracking
    #is_online = models.BooleanField(default=False)
    #last_activity = models.DateTimeField(null=True, blank=True)

    #is_staff = models.BooleanField(default=False)
    #is_superuser = models.BooleanField(default=False)

    email = models.EmailField(unique=True)
    email_is_verified = models.BooleanField(default=False)

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, default='avatars/default_avatar.jpg')
    bio = models.TextField(blank=True, max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)

    has_2fa = models.BooleanField(default=False)
    has_oauth = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    @classmethod
    def search_users(cls, query):
        """Search users by username (case-insensitive partial match)"""
        return cls.objects.filter(
            models.Q(username__icontains=query)
        )[:20]  # Limit to 20 results

    def __str__(self):
        return self.username


class Friends(models.Model):
    FRIENDS_STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('blocked', 'Blocked')
    ]

    user = models.ForeignKey(
        UserProfile,
        related_name='friend_requests_sent',
        on_delete=models.CASCADE
    )
    friend = models.ForeignKey(
        UserProfile,
        related_name='friend_requests_received',
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=20,
        choices=FRIENDS_STATUS,
        default='pending'
    )
    friends_since = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'friend')
        constraints = [
            models.CheckConstraint(
                check=~models.Q(user=models.F('friend')),
                name='no_self_friendship'
            )
        ]
