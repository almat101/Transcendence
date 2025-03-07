import os
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from .serializers import (
    UserCreateSerializer,
    UserUpdateSerializer,
    BaseUserSerializer,
    PasswordUpdateSerializer,
    AvatarUpdateSerializer,
    FriendSerializer
)
from .models import UserProfile, Friends
from django.db import models

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = UserCreateSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()  # No need to hash password, serializer handles it

        '''
        create otp code and send email

        token = RefreshToken.for_user(user)
        email = EmailMessage('Verify your email', 'Your OTP code is: ' + token, to=[user.email])
        email.send()
        '''

        return Response({
            'message': 'User created successfully',
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    """Update user password (not allowed for OAuth users)"""
    if request.user.has_oauth:
        return Response({
            'error': 'OAuth users cannot update their password'
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = PasswordUpdateSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'old_password': ['Wrong password.']
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user_id = request.query_params.get('user_id')
    try:
        if user_id:
            user = get_object_or_404(UserProfile, id=user_id)
        else:
            user = request.user

        serializer = BaseUserSerializer(user, context={'request': request})
        data = serializer.data
        data['is_self'] = user.id == request.user.id

        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch user info: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    serializer = AvatarUpdateSerializer(
        request.user,
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        try:
            avatar_file = request.FILES['avatar']

            # Get file extension
            file_ext = os.path.splitext(avatar_file.name)[1]

            # Create new filename with username to avoid conflicts
            avatar_file.name = f"avatar_{request.user.username}{file_ext}"

            # Delete old avatar if it exists and isn't the default
            if request.user.avatar and 'default_avatar' not in request.user.avatar.name:
                if os.path.isfile(request.user.avatar.path):
                    os.remove(request.user.avatar.path)

            # Save using the serializer
            serializer.save()

            # Return the complete URL
            avatar_url = f"/media/avatars/{os.path.basename(request.user.avatar.name)}"

            return Response({
                'message': 'Avatar updated successfully',
                'avatar': avatar_url
            })

        except Exception as e:
            return Response({
                'error': f'Failed to update avatar: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user(request):
    serializer = UserUpdateSerializer(
        request.user,
        data=request.data,
        partial=True,
        context={'request': request}
    )

    if serializer.is_valid():
        user = serializer.save()
        message = 'Bio updated successfully' if user.has_oauth else 'Profile updated successfully'

        return Response({
            'message': message,
            'user': UserUpdateSerializer(user).data
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    """Delete user account with password confirmation"""
    user = request.user

    if not user.has_oauth:
        password = request.data.get('password')
        if not password:
            return Response({
                'error': 'Password is required for account deletion'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({
                'error': 'Invalid password'
            }, status=status.HTTP_400_BAD_REQUEST)

    try:
        #username = user.username
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        user.delete()

        #logger.info(f"User account deleted: {username}")
        response = Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key='refresh_token',
        )
        return response

    except Exception as e:
        #logger.error(f"Error deleting user account: {str(e)}")
        return Response({
            'error': 'Failed to delete account'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search users by username or email"""
    query = request.query_params.get('q', '').strip()

    if len(query) < 2:
        return Response({
            'error': 'Search query must be at least 2 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        users = UserProfile.search_users(query, request.user)
        serializer = BaseUserSerializer(users, many=True)

        # Add friendship status to response
        result = []
        for user_data in serializer.data:
            matching_user = next(
                (u for u in users if u.id == user_data['id']),
                None
            )

            if matching_user:
                status = matching_user.friendship_status

                # Create an entry matching FriendSerializer format
                result.append({
                    'id': user_data['id'],
                    'username': user_data['username'],
                    'avatar': user_data['avatar'],
                    'status': status,
                    'is_online': user_data['is_online'],
                })

        return Response(result)

    except Exception as e:
        return Response({
            'error': f'Search failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#FRIENDS VIEWS

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    friend_id = request.data.get('id')
    if not friend_id:
        return Response({
            'error': 'User ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    friend = get_object_or_404(UserProfile, id=friend_id)

    # Prevent self-friending
    if friend == request.user:
        return Response({
            'error': 'You cannot send a friend request to yourself'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check for existing relationship
    existing = Friends.objects.filter(
        (models.Q(user=request.user, friend=friend) |
         models.Q(user=friend, friend=request.user)),
        status__in=['pending', 'accepted']
    ).first()

    if existing:
        status_msg = 'pending' if existing.status == 'pending' else 'already friends'
        return Response({
            'error': f'A friend request is already {status_msg}'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create the friend request
    friend_request = Friends.objects.create(
        user=request.user,
        friend=friend,
        status='pending'
    )

    # Serialize for response
    serializer = FriendSerializer(friend_request, context={'request': request})

    return Response({
        'message': 'Friend request sent successfully',
        'request': serializer.data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_friend_request(request):
    """Accept or reject a friend request"""
    friend_id = request.data.get('id')
    action = request.data.get('action')  # 'accept' or 'reject'

    if not friend_id or not action:
        return Response(
            {'error': 'Friend ID and action are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if action not in ['accept', 'reject']:
        return Response(
            {'error': 'Invalid action'},
            status=status.HTTP_400_BAD_REQUEST
        )

    friend = get_object_or_404(UserProfile, id=friend_id)

    friend_request = Friends.objects.filter(
        user=friend,
        friend=request.user,
        status='pending'
    ).first()

    if not friend_request:
        return Response(
            {'error': 'No pending friend request found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if action == 'accept':
        friend_request.status = 'accepted'
        friend_request.save()

       #request.user.friends.add(friend)

        return Response(
            {'message': 'Friend request accepted'},
            status=status.HTTP_200_OK
        )

    # If rejected, just delete the friends
    friend_request.delete()
    return Response(
        {'message': 'Friend request rejected'},
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    serializer = FriendSerializer(
        Friends.objects.filter(
            (models.Q(user=request.user) | models.Q(friend=request.user)) &
            models.Q(status='accepted')
        ),
        many=True,
        context={'request': request}
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friend_requests(request):
    friend_requests = Friends.objects.filter(
        friend=request.user,
        status='pending'
    )

    serializer = FriendSerializer(friend_requests, many=True, context={'request': request})
    return Response(serializer.data)
