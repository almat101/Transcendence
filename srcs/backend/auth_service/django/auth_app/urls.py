from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login_view, name='login'), # done
    path('logout', views.logout_view, name='logout'), # done
    path('token-refresh', views.refresh_access_token, name='refresh_access_token'),
]
