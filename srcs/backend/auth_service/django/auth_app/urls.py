from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'), # done
    path('logout/', views.logout_view, name='logout'), # done
    path('refresh/', views.refresh_access_token, name='refresh_access_token'),
    path('validate/', views.validate_token, name='validate_token'),
    path('2fa/setup/', views.setup_2fa, name='setup-2fa'),
    path('2fa/verify-setup/', views.verify_2fa_setup, name='verify-2fa-setup'),
    path('2fa/disable/', views.disable_2fa, name='disable-2fa'),
    path('2fa/verify/', views.verify_2fa_token, name='verify-2fa-token'),
    path('2fa/verify-login/', views.verify_2fa_login, name='verify-2fa-login'),
]
