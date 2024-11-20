from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(User):
	avatar = models.ImageField(upload_to='avatar', default='avatar/default.png')
	bio = models.TextField(max_length=500, blank=True)
	timestamp = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.user.username
