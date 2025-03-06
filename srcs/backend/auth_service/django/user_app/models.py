from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# Create your models here.

class UserProfile(AbstractUser):
    # Online status tracking
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(null=True, blank=True)

    email = models.EmailField(unique=True)
    email_is_verified = models.BooleanField(default=False)

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, default='avatars/default_avatar.jpg')
    bio = models.TextField(blank=True, max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)

    has_2fa = models.BooleanField(default=False)
    twofa_secret = models.CharField(max_length=255, blank=True, null=True)
    has_oauth = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    @classmethod
    def search_users(cls, query, current_user):
        """Search users by username with friendship status"""
        base_query = cls.objects.filter(
            models.Q(username__icontains=query),
        ).exclude(id=current_user.id)

        # Annotate friendship status with direction information
        users = base_query.annotate(
            friendship_status=models.Case(
                models.When(
                    models.Q(friend_requests_received__user=current_user, friend_requests_received__status='blocked') |
                    models.Q(friend_requests_sent__friend=current_user, friend_requests_sent__status='blocked'),
                    then=models.Value('blocked')
                ),
                models.When(
                    models.Q(friend_requests_received__user=current_user, friend_requests_received__status='accepted') |
                    models.Q(friend_requests_sent__friend=current_user, friend_requests_sent__status='accepted'),
                    then=models.Value('accepted')
                ),
                models.When(
                    models.Q(friend_requests_sent__friend=current_user, friend_requests_sent__status='pending'),
                    then=models.Value('pending_received')
                ),
                models.When(
                    models.Q(friend_requests_received__user=current_user, friend_requests_received__status='pending'),
                    then=models.Value('pending_sent')
                ),
                default=models.Value('none'),
                output_field=models.CharField(),
            )
        ).exclude(friendship_status='blocked').only('id', 'username', 'avatar', 'bio', 'is_online')[:20]

        return users

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
