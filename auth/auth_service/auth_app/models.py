from django.db import model
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['id']

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.pk:
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
        }

    def to_json_full(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_staff': self.is_staff,
            'is_active': self.is_active,
            'date_joined': self.date_joined,
        }

    def to_json_public(self):
        return {
            'id': self.id,
            'username': self.username,
        }

