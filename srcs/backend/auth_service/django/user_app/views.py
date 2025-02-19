from rest_framework import status # type: ignore
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError # type: ignore
from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import (
    UserCreateSerializer,
    UserUpdateSerializer,
    BaseUserSerializer,
    PasswordUpdateSerializer,
    AvatarUpdateSerializer,
    FriendSerializer
)
from .models import UserProfile, Friends
import logging

logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = UserCreateSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()  # No need to hash password, serializer handles it
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
        return Response({'message': 'Password updated successfully'})

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

        return Response(data)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch user info: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    if request.user.has_oauth:
        return Response({
            'error': 'OAuth users cannot update their avatar'
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = AvatarUpdateSerializer(
        request.user,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Avatar updated successfully',
            'avatar': serializer.data['avatar']
        })
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
        })

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
        username = user.username
        user.delete()
        logger.info(f"User account deleted: {username}")
        return Response({
            'message': 'Account deleted successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error deleting user account: {str(e)}")
        return Response({
            'error': 'Failed to delete account'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

'''
def get_all_users(request):
    users = UserProfile.objects.all()
    user_list = []
    for user in users:
        user_list.append({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar.url
        })
    return Response({'users': user_list})

#FRIENDS VIEWS

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    friend = get_object_or_404(UserProfile, username=request.data.get('username'))

    # Check if friend has blocked user
    if friend.has_blocked(request.user):
        return Response(
            {'error': 'Cannot send friend request'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = FriendSerializer(
        data={'status': 'pending'},
        context={'request': request, 'friend': friend}
    )

    if serializer.is_valid():
        friend_request = Friends.objects.create(
            user=request.user,
            friend=friend,
            status='pending'
        )
        return Response(
            FriendSerializer(friend_request).data,
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_status(request):
    username = request.query_params.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    friend = get_object_or_404(UserProfile, username=username)

    relationship = Friends.objects.filter(
        models.Q(user=request.user, friend=friend) |
        models.Q(user=friend, friend=request.user)
    ).first()

    if not relationship:
        return Response({'status': 'none'})

    return Response({
        'status': relationship.status,
        'initiator': relationship.user.username
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_friend_request(request):
    """Accept or reject a friend request"""
    friend_username = request.data.get('username')
    action = request.data.get('action')  # 'accept' or 'reject'

    friend = get_object_or_404(UserProfile, username=friend_username)

    friends = Friends.objects.filter(
        user=friend,
        friend=request.user,
        status='pending'
    ).first()

    if not friends:
        return Response(
            {'error': 'No pending friend request found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if action == 'accept':
        friends.status = 'accepted'
        friends.save()

        # Create reciprocal friends
        Friends.objects.create(
            user=request.user,
            friend=friend,
            status='accepted'
        )

       #request.user.friends.add(friend)

        return Response(
            {'message': 'Friend request accepted'},
            status=status.HTTP_200_OK
        )

    # If rejected, just delete the friends
    friends.delete()
    return Response(
        {'message': 'Friend request rejected'},
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request):
    """Block a user"""
    friend_username = request.data.get('username')
    friend = get_object_or_404(UserProfile, username=friend_username)

    # Prevent self-blocking
    if friend == request.user:
        return Response(
            {'error': 'You cannot block yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if friends already exists
    existing_friends = Friends.objects.filter(
        user=request.user,
        friend=friend
    ).first()

    if not existing_friends:
        return Response(
            {'error': 'No friends found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Block the user
    existing_friends.status = 'blocked'
    existing_friends.save()

    return Response(
        {'message': 'User blocked'},
        status=status.HTTP_200_OK
    )



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    friends = Friends.objects.filter(
        user=request.user,
        status='accepted'
    )

    serializer = FriendSerializer(
        friends,
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

    serializer = FriendsSerializer(friend_requests, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_blocked_users(request):
    blocked_users = Friends.objects.filter(
        user=request.user,
        status='blocked'
    )

    serializer = FriendsSerializer(blocked_users, many=True)
    return Response(serializer.data)


'''
