from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from django.http import JsonResponse
from django.contrib.auth import authenticate
import json
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .serializers import CustomTokenObtainPairSerializer


# Create your views here.

def signup_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not email or not username or not password:
            return JsonResponse({'error': 'All fields are required'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already taken'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered'}, status=400)

        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password)
        )

        return JsonResponse({'message': 'User created successfully'}, status=201)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


def login_view(request):
    if request.method == 'POST':
        # Assume JSON input with 'username' and 'password'
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            refresh = CustomTokenObtainPairSerializer.get_token(user)
            response = JsonResponse({
                "access": str(refresh.access_token),
            })
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="Strict"
            )
            return response
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


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


def user_info_view(request):
    # Assume user_id is passed as a query parameter
    user_id = request.GET.get('user_id')
    try:
        user = User.objects.get(id=user_id)  # Fetch user from the database
        return JsonResponse({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar.url
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
