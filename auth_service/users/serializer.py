from .models import UserProfile
from rest_framework import serializers

class CreateUserSerializer(serializers.ModelSerializer):
	def create(self, validated_data):
		user = UserProfile.objects.create_user(**validated_data)
		return user

	class Meta:
		model = UserProfile
		fields = ('id', 'username', 'password')
		extra_kwargs = {
			'password': {'write_only': True}
		}
