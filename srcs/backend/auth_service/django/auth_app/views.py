from rest_framework import status # type: ignore
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from django.contrib.auth import authenticate, logout
from django.core.mail import send_mail
import logging
from .serializers import CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
import base64
import pyotp
import qrcode
import io

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

    user = authenticate(request, username=username_or_email, password=password)
    if user is None:
        return Response({
            'error': 'Invalid credentials',
            #'attempts_remaining': 5 - (account_failed_attempts + 1)
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if 2FA is enabled for this user
    if user.has_2fa:
        # Store user ID in session to continue authentication after 2FA verification
        request.session['2fa_user_id'] = user.id
        return Response({
            'requires_2fa': True,
            'user_id': user.id
        }, status=status.HTTP_200_OK)

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
        samesite='Lax',  # Prevents CSRF attacks
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

        # Log user out
        logout(request)

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
            ).delete_cookie(
                key='refresh_token'
            )

        User = get_user_model()

        if not User.objects.filter(id=refresh.payload['user_id']).exists():
            response = Response(
            {'error': 'User does not exist'},
            status=status.HTTP_401_UNAUTHORIZED
            )
            response.delete_cookie('refresh_token')
            return response

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


#2fa

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    """Initialize 2FA setup by generating a secret and QR code"""
    # Check if user already has 2FA enabled
    if request.user.has_2fa:
        return Response({'error': '2FA is already enabled'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate a new secret key
    secret = pyotp.random_base32()

    # Create a QR code for the secret
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(request.user.email, issuer_name="Transcendence")

    # Generate QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Convert image to base64 for frontend display
    buffer = io.BytesIO()
    img.save(buffer)
    img_str = base64.b64encode(buffer.getvalue()).decode()

    # Store secret temporarily in session
    request.session['temp_2fa_secret'] = secret

    return Response({
        'secret': secret,
        'qr_code': f'data:image/png;base64,{img_str}'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa_setup(request):
    """Verify the setup token and enable 2FA for the user"""
    token = request.data.get('token')

    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Get the temporary secret from session
    secret = request.session.get('temp_2fa_secret')
    if not secret:
        return Response({'error': 'No 2FA setup in progress'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify the token
    totp = pyotp.TOTP(secret)
    if not totp.verify(token, valid_window=1):
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    # Token is valid, save the secret and enable 2FA
    user = request.user
    user.twofa_secret = secret
    user.has_2fa = True
    user.save()

    # Clean up session
    del request.session['temp_2fa_secret']

    return Response({'message': '2FA has been successfully enabled'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    """Disable 2FA for the user"""
    token = request.data.get('token')

    if not request.user.has_2fa:
        return Response({'error': '2FA is not enabled'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify token before disabling
    if token:
        totp = pyotp.TOTP(request.user.twofa_secret)
        if not totp.verify(token, valid_window=1):
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # If no token provided, require password verification instead
        password = request.data.get('password')
        if not password or not request.user.check_password(password):
            return Response({'error': 'Password verification failed'}, status=status.HTTP_400_BAD_REQUEST)

    # Disable 2FA
    user = request.user
    user.has_2fa = False
    user.twofa_secret = None
    user.save()

    return Response({'message': '2FA has been disabled'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa_token(request):
    """Verify a 2FA token outside of login (for validating actions)"""
    token = request.data.get('token')

    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.has_2fa:
        return Response({'error': '2FA is not enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

    totp = pyotp.TOTP(request.user.twofa_secret)
    if not totp.verify(token, valid_window=1):
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'valid': True})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa_login(request):
    """Verify 2FA code during login process"""
    token = request.data.get('token')
    user_id = request.session.get('2fa_user_id')

    if not token or not user_id:
        return Response({'error': 'Token and session are required'}, status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(token, valid_window=1):
        return Response({'error': 'Invalid 2FA token'}, status=status.HTTP_400_BAD_REQUEST)

    # Clear the session
    del request.session['2fa_user_id']

    # Generate tokens
    refresh = CustomTokenObtainPairSerializer.get_token(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response = Response({
        'access': access_token,
    }, status=status.HTTP_200_OK)

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        max_age=7 * 24 * 60 * 60,
    )
    return response
