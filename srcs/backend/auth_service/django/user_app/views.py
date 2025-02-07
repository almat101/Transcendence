from rest_framework import status # type: ignore
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError # type: ignore
from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import UserSerializer, FriendsSerializer
from .models import UserProfile, Friends
import logging

logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        # Create the user with a hashed password
        user = serializer.save(
            password=make_password(serializer.validated_data['password'])
        )

        # Return minimal user info for frontend redirect
        return Response({
            'message': 'User created successfully',
        }, status=status.HTTP_201_CREATED)

    # If validation fails, return error details
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    """Change password with old password verification"""
    try:
        data = request.data
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return Response({
                'error': 'Both old and new passwords are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        # Verify old password
        if not check_password(old_password, user.password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Password updated successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Password change failed: {str(e)}")
        return Response({
            'error': 'Unable to change password'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Get user profile information. If no user_id provided, returns current user's info."""
    user_id = request.query_params.get('user_id')

    try:
        if user_id:
            user = get_object_or_404(UserProfile, id=user_id)
        else:
            user = request.user

         # Construct avatar URL
        avatar_url = (
            request.build_absolute_uri(user.avatar.url)
            if user.avatar and user.avatar.name
            else request.build_absolute_uri(f"{settings.MEDIA_URL}avatars/default_avatar.jpg")
        )

        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': avatar_url,
            'bio': user.bio,
            'is_self': user.id == request.user.id
        })
    except Exception as e:
        return Response({
            'error': f'Failed to fetch user info: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    user = request.user
    avatar = request.data.get('avatar')

    if not avatar:
        return Response({'error': 'Avatar image is required'}, status=status.HTTP_400_BAD_REQUEST)

    user.avatar = avatar
    user.save()

    return Response({'message': 'Avatar updated successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user(request):
    data = request.data
    user_id = data.get('user_id')
    username = data.get('username')
    email = data.get('email')

    if not user_id or not username or not email:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = UserProfile.objects.get(id=user_id)
        user.username = username
        user.email = email
        user.full_clean()  # Validate the model fields
        user.save()
        return Response({'message': 'User updated successfully'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        return Response({'error': e.message_dict}, status=status.HTTP_400_BAD_REQUEST)

'''


@csrf_exempt
@permission_classes([IsAuthenticated])
def delete_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')

        try:
            user = UserProfile.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully'})
        except UserProfile.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

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
    """Send a friend request to another user"""
    friend_username = request.data.get('username')
    friend = get_object_or_404(UserProfile, username=friend_username)

    # Prevent self-friending and duplicate requests
    if friend == request.user:
        return Response(
            {'error': 'You cannot send a friend request to yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if friends already exists
    existing_friends = Friends.objects.filter(
        user=request.user,
        friend=friend
    ).first()

    if existing_friends:
        return Response(
            {'error': 'Friend request already sent or friends exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create friends request
    Friends.objects.create(
        user=request.user,
        friend=friend,
        status='pending'
    )

    return Response(
        {'message': 'Friend request sent'},
        status=status.HTTP_201_CREATED
    )

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
    """List all accepted friends"""
    friends = Friends.objects.filter(
        user=request.user,
        status='accepted'
    )

    serializer = FriendsSerializer(friends, many=True)
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
