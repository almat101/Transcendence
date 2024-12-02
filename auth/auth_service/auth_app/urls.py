from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', views.refresh_token, name='token_refresh'),
    path('api/v1/getuserinfo', views.user_info_view, name='user_info')
]
