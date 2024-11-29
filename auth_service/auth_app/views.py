from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from django.http import JsonResponse
from django.contrib.auth import authenticate
import json


# Create your views here.
def login_view(request):

    if request.method == 'POST':
        # Assume JSON input with 'username' and 'password'
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
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


def logout_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    token = RefreshToken(refresh_token)
    token.blacklist()
    return JsonResponse({"message": "Logged out"})


#Centralized User Info API. The Auth Service exposes a
# user info API that other services can call to
# fetch user details dynamically.

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
