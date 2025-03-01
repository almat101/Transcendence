from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password
from django.core.validators import EmailValidator
from django.db import models
from .models import UserProfile, Friends
import re

class BaseUserSerializer(serializers.ModelSerializer):
    """Base serializer for user data with common fields and validations"""

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'avatar', 'bio', 'created_at', 'has_oauth']
        read_only_fields = ['created_at']

    def validate_username(self, value):
        """
        Validate username format:
        - 3-20 characters
        - Only letters, numbers, underscores
        - Case insensitive uniqueness
        """
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', value):
            raise serializers.ValidationError(
                "Username must be 3-20 characters and contain only letters, numbers, and underscores"
            )

        # Case insensitive username check
        if UserProfile.objects.filter(username__iexact=value).exclude(id=getattr(self.instance, 'id', None)).exists():
            raise serializers.ValidationError("This username is already taken")
        return value


class UserCreateSerializer(BaseUserSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + ['password', 'confirm_password']
        extra_kwargs = {
            'email': {'required': True},
            'avatar': {'read_only': True},
            'bio': {'read_only': True}
        }

    def validate_email(self, value):
        """
        Validate email:
        - Format validation using Django's EmailValidator
        - Case insensitive uniqueness check
        """
        validator = EmailValidator()
        validator(value)

        if UserProfile.objects.filter(email__iexact=value).exclude(id=getattr(self.instance, 'id', None)).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value.lower()

    def validate_password(self, value):
        """Validate password using Django's password validators"""
        validate_password(value)
        return value

    def validate(self, data):
        """
        Additional validation:
        - Password confirmation check
        """
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        """Create new user with hashed password"""
        validated_data.pop('confirm_password')
        # Explicitly hash the password
        validated_data['password'] = make_password(validated_data['password'])
        user = UserProfile.objects.create(**validated_data)
        return user


class AvatarUpdateSerializer(serializers.ModelSerializer):
    """Serializer for avatar updates only"""
    class Meta:
        model = UserProfile
        fields = ['avatar']

    def validate_avatar(self, value):
        user = self.context.get('request').user
        if user.has_oauth:
            raise serializers.ValidationError(
                "OAuth users cannot update their avatar"
            )

        if value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Image size cannot exceed 5MB")
        return value

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for profile info updates (username, email, bio)"""
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'bio']

    def validate_username(self, value):
        """
        Validate username format:
        - 3-20 characters
        - Only letters, numbers, underscores
        - Case insensitive uniqueness
        """
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', value):
            raise serializers.ValidationError(
                "Username must be 3-20 characters and contain only letters, numbers, and underscores"
            )

        # Case insensitive username check
        if UserProfile.objects.filter(username__iexact=value).exclude(id=getattr(self.instance, 'id', None)).exists():
            raise serializers.ValidationError("This username is already taken")
        return value

    def validate_bio(self, value):
        """
        Validate bio:
        - Max length of 300 characters
        """
        if len(value) > 300:
            raise serializers.ValidationError("Bio cannot exceed 300 characters")
        return value

    def validate_email(self, value):
        """
        Validate email:
        - Format validation using Django's EmailValidator
        - Case insensitive uniqueness check
        """
        validator = EmailValidator()
        validator(value)

        if UserProfile.objects.filter(email__iexact=value).exclude(id=getattr(self.instance, 'id', None)).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value.lower()

    def validate(self, data):
        user = self.context.get('request').user

        if user.has_oauth:
            # Check if any field other than bio actually changed
            changed_fields = [
                field for field in ['username', 'email']
                if field in data and data[field] != getattr(user, field)
            ]

            if changed_fields:
                raise serializers.ValidationError(
                    "OAuth users can only update their bio"
                )

            # Remove unchanged fields to prevent unnecessary updates
            data = {'bio': data.get('bio')} if 'bio' in data else {}

        return data

    def update(self, instance, validated_data):
        if instance.has_oauth:
            # Only update bio for OAuth users
            if 'bio' in validated_data:
                instance.bio = validated_data['bio']
                instance.save(update_fields=['bio'])
            return instance

        return super().update(instance, validated_data)

class PasswordUpdateSerializer(serializers.Serializer):
    """Serializer for password updates"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        user = self.context.get('request').user
        if user.has_oauth:
            raise serializers.ValidationError(
                "OAuth users cannot update their password"
            )

        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match"}
            )
        validate_password(data['new_password'])
        return data

class FriendSerializer(serializers.ModelSerializer):
    user = BaseUserSerializer(read_only=True)
    friend = BaseUserSerializer(read_only=True)
    class Meta:
        model = Friends
        fields = ['id', 'user', 'friend', 'status', 'friends_since']
        read_only_fields = ['friends_since']

    def validate(self, data):
        user = self.context.get('user')
        friend = self.context.get('friend')

        if user == friend:
            raise serializers.ValidationError("You cannot add yourself as a friend")

        existing_relationship = Friends.objects.filter(
            models.Q(user=user, friend=friend) |
            models.Q(user=friend, friend=user)
        ).first()

        if existing_relationship:
            if existing_relationship.status == 'blocked':
                raise serializers.ValidationError("Cannot perform this action")
            if existing_relationship.status == 'pending':
                raise serializers.ValidationError("Friend request already exists")
            if existing_relationship.status == 'accepted':
                raise serializers.ValidationError("Already friends")

        return data
