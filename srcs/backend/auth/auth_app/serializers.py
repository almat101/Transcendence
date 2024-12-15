from rest_framework import serializers
from .models import UserProfile, Friends



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
