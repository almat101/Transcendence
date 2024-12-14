from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class UserProfile(AbstractUser):
    email = models.EmailField(unique=True)
    #username = models.CharField(max_length=150, unique=True)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png', blank=True, null=True)
    bio = models.TextField(blank=True, max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    #last_login = models.DateTimeField(auto_now=True)
    #is_active = models.BooleanField(default=True)


    #is_staff = models.BooleanField(default=False)
    #is_superuser = models.BooleanField(default=False)

    def __str__(self):
        return self.username


