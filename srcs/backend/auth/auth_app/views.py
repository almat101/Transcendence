from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from .models import UserProfile
from .serializers import UserSerializer


# Authentication

@api_view(['POST'])
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
def login_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if email is None or password is None:
        return JsonResponse({'error': 'Please provide both email and password'}, status=400)

    user = UserProfile.objects.get(email=email)

    if not user:
        return JsonResponse({'error': 'No user with this email'}, status=400)

    if not check_password(password, user.password):
        return JsonResponse({'error': 'Invalid password'}, status=400)

    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)

    response = JsonResponse({'access': access_token, 'refresh': refresh_token})
    response.set_cookie('refresh_token', refresh_token, httponly=True)
    return response


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
            return JsonResponse({'error': 'Refresh token is required'}, status=400)

        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            return JsonResponse({'access': new_access_token})
        except Exception as e:
            return JsonResponse({'error': 'Invalid refresh token'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


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
        return JsonResponse({'error': 'User not found'}, status=404)

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
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def reset_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = UserProfile.objects.get(email=email)
            # Send email with reset link
            return JsonResponse({'message': 'Reset link sent to your email'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

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
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')

        try:
            user = UserProfile.objects.get(id=user_id)
            user.delete()
            return JsonResponse({'message': 'User deleted successfully'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

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


