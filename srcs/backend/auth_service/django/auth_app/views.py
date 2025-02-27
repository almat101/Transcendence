from rest_framework import status # type: ignore
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.core.mail import send_mail
import logging
from .serializers import CustomTokenObtainPairSerializer


# Setup logging
logger = logging.getLogger(__name__)

class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'  # Limit to 5 attempts per minute

# Authentication

@api_view(['POST'])
@permission_classes([AllowAny])
#@throttle_classes([LoginRateThrottle])
def login_view(request):
    data = request.data
    username_or_email = data.get('username_or_email')
    password = data.get('password')
    #ip_address = request.META.get("REMOTE_ADDR")

    if username_or_email is None or password is None:
        #logger.warning(f'Login attempt with missing credentials from IP: {ip_address}')
        return Response({'error': 'Please provide both username/email and password'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Check for IP-based lockout
    #ip_cache_key = f'login_attempts_ip_{ip_address}'
    #ip_failed_attempts = cache.get(ip_cache_key, 0)

    '''if ip_failed_attempts >= 10:  # Lock IP after 10 failed attempts
        logger.warning(f'IP address locked due to multiple failed attempts: {ip_address}')
        return Response({
            'error': 'Too many login attempts from this IP',
            'locked_until': cache.ttl(ip_cache_key)
        }, status=status.HTTP_403_FORBIDDEN)'''


    # Check for account lockout
    #account_cache_key = f'login_attempts_{username_or_email}'
    #account_failed_attempts = cache.get(account_cache_key, 0)

    '''if account_failed_attempts >= 5:  # Lock after 5 failed attempts
        logger.warning(f'Account locked due to multiple failed attempts: {username_or_email}')
        return Response({
            'error': 'Account temporarily locked',
            'details': 'Too many failed login attempts. Please try again later or reset your password.',
            'locked_until': cache.ttl(account_cache_key)
        }, status=status.HTTP_403_FORBIDDEN)'''

    user = authenticate(request, username=username_or_email, password=password)
    if user is None:
        # Increment both IP and account failed attempts
        #cache.set(ip_cache_key, ip_failed_attempts + 1, timeout=600)  # IP lock for 10 minutes
        #cache.set(account_cache_key, account_failed_attempts + 1, timeout=300)  # Account lock for 5 minutes
        return Response({
            'error': 'Invalid credentials',
            #'attempts_remaining': 5 - (account_failed_attempts + 1)
        }, status=status.HTTP_400_BAD_REQUEST)

     # Reset failed attempts on successful login
    #cache.delete(account_cache_key)
    #cache.delete(ip_cache_key)

    # Log successful login
    #logger.info(f'Successful login for user: {username_or_email} from IP: {ip_address}')

    refresh = CustomTokenObtainPairSerializer.get_token(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response = Response({
        'access': access_token,
        #'avatar': user.avatar.url
    }, status=status.HTTP_200_OK)

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True,  # Ensures the cookie is only sent over HTTPS
        samesite='None',  # Prevents CSRF attacks
        max_age=7 * 24 * 60 * 60,  # Match the refresh token lifetime (7 days in your settings)
    )
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key='refresh_token',
        )
        return response

    except TokenError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_access_token(request):
    refresh_token = request.COOKIES.get('refresh_token')

    if not refresh_token:
        return Response(
            {'error': 'Refresh token missing'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        # Verify and generate new tokens
        refresh = RefreshToken(refresh_token)

        # Check if token is blacklisted
        if refresh.check_blacklist():
            return Response(
                {'error': 'Refresh token is blacklisted'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        #check if user is valid
        user = authenticate(request, username=refresh['username'], password=refresh['password'])
        if user is None:
            return Response(
                {'error': 'Invalid user'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate new access token
        access_token = str(refresh.access_token)

        response = Response({
            'access': access_token,
        }, status=status.HTTP_200_OK)

        return response

    except TokenError:
        return Response(
            {'error': 'Invalid or expired refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'error': 'Token refresh failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def validate_token(request):
    return Response({'valid': True}, status=status.HTTP_200_OK)

