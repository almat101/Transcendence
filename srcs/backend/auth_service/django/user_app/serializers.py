import re
from rest_framework import serializers
from .models import UserProfile, Friends
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    # Ensure password is write-only and not returned in responses
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True}
        }

    def validate_username(self, value):
        # Username validation: letters, numbers, underscores, 3-20 chars
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', value):
            raise serializers.ValidationError(
                "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
            )
        return value

    def validate_email(self, value):
        # Email format validation
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError(
                "Please enter a valid email address"
            )
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        # Check for unique email and username
        if UserProfile.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists"})

        if UserProfile.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken"})

        return data


class FriendsSerializer(serializers.ModelSerializer):
    friend = UserSerializer(read_only=True)

    class Meta:
        model = Friends
        fields = ['friend', 'status', 'friends_since']

