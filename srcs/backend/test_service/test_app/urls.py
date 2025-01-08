from django.urls import path
from .views import get_users, post_user, user_detail
from rest_framework import permissions

urlpatterns = [
    path('api/users/', get_users, name='get_users'),
    path('api/users/post/', post_user, name='post_user'),
    path('api/users/<int:pk>/', user_detail, name='user_detail'),
]
