from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# Create your models here.

class UserProfile(AbstractUser):
    email = models.EmailField(unique=True)
    #username = models.CharField(max_length=150, unique=True)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png', blank=True, null=True)
    bio = models.TextField(blank=True, max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Online status tracking
    #is_online = models.BooleanField(default=False)
    #last_activity = models.DateTimeField(null=True, blank=True)

    #is_staff = models.BooleanField(default=False)
    #is_superuser = models.BooleanField(default=False)

    #friends = models.ManyToManyField('self', through='Friends', symmetrical=False)

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
        related_name='friend_initiated',
        on_delete=models.CASCADE
    )
    friend = models.ForeignKey(
        UserProfile,
        related_name='friend_received',
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

    def __str__(self):
        return f"{self.user.username} - {self.friend.username} ({self.status})"
