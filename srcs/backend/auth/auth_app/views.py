from rest_framework import status
from rest_framework.decorators import api_view, csrf_exempt
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from .models import UserProfile, Friends
from .serializers import UserSerializer, FriendsSerializer


# Authentication

@api_view(['POST'])
@csrf_exempt
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

            #these under maybe to autofill the login form
            #'user_id': user.id,
            #'username': user.username,
            #'redirect_to': '/login'  # Frontend can use this to know where to redirect
        }, status=status.HTTP_201_CREATED)

    # If validation fails, return error details
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
def login_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if email is None or password is None:
        return JsonResponse({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = UserProfile.objects.get(email=email)

    if not user:
        return JsonResponse({'error': 'No user with this email'}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(password, user.password):
        return JsonResponse({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)

    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)

    response = JsonResponse({'access': access_token, 'refresh': refresh_token})
    response.set_cookie('refresh_token', refresh_token, httponly=True)
    return response

@csrf_exempt
def logout_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    token = RefreshToken(refresh_token)
    token.blacklist()
    return JsonResponse({"message": "Logged out"})


def refresh_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        refresh_token = data.get('refresh_token')

        if not refresh_token:
            return JsonResponse({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            return JsonResponse({'access': new_access_token})
        except Exception as e:
            return JsonResponse({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


#USER VIEWS

def user_info_view(request):
    # Assume user_id is passed as a query parameter
    user_id = request.GET.get('user_id')
    try:
        user = UserProfile.objects.get(id=user_id)  # Fetch user from the database
        return JsonResponse({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar.url
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
def update_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        username = data.get('username')
        email = data.get('email')

        try:
            user = UserProfile.objects.get(id=user_id)
            user.username = username
            user.email = email
            user.save()
            return JsonResponse({'message': 'User updated successfully'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = UserProfile.objects.get(email=email)
            # Send email with reset link
            return JsonResponse({'message': 'Reset link sent to your email'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@csrf_exempt
def reset_password_confirm(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        new_password = data.get('new_password')

        try:
            user = UserProfile.objects.get(email=email)
            user.password = make_password(new_password)
            user.save()
            return JsonResponse({'message': 'Password reset successfully'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@csrf_exempt
def delete_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')

        try:
            user = UserProfile.objects.get(id=user_id)
            user.delete()
            return JsonResponse({'message': 'User deleted successfully'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

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
    return JsonResponse({'users': user_list})


#FRIENDS VIEWS


@api_view(['POST'])
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
def list_friends(request):
    """List all accepted friends"""
    friends = Friends.objects.filter(
        user=request.user,
        status='accepted'
    )

    serializer = FriendsSerializer(friends, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_friend_requests(request):
    friend_requests = Friends.objects.filter(
        friend=request.user,
        status='pending'
    )

    serializer = FriendsSerializer(friend_requests, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_blocked_users(request):
    blocked_users = Friends.objects.filter(
        user=request.user,
        status='blocked'
    )

    serializer = FriendsSerializer(blocked_users, many=True)
    return Response(serializer.data)


