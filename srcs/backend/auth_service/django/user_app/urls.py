"""URLs Configuration for User App

This module defines the URL patterns for the user management application.

URL Patterns:
  /signup/ (signup_view):
    Handles user registration

  /password-reset/ (reset_password):
    Handles password reset functionality

  /getuserinfo/ (user_info):
    Retrieves information about the current user

  /updateavatar/ (update_avatar):
    Updates user's profile avatar

  /updateuser/ (update_user):
    Updates user profile information

  /deleteuser/ (delete_user):
    Deletes user account

  /search/ (search_users):
    Searches for users in the system

  /friends/send/ (send_friend_request):
    Sends a friend request to another user

  /friends/respond/ (respond_to_friend_request):
    Responds to pending friend requests

  /friends/list-friends/ (list_friends):
    Lists all friends of the current user

  /friends/requests/ (list_friend_requests):
    Lists all pending friend requests
"""

from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup_view, name='signup'), # done
    path('password-reset/', views.reset_password, name='reset_password'), # done
    path('getuserinfo/', views.user_info, name='user_info'),
    path('updateavatar/', views.update_avatar, name='update-avatar'),
    path('updateuser/', views.update_user, name='update_user'),
    path('deleteuser/', views.delete_user, name='delete_user'),
    path('search/', views.search_users, name='search'),

    path('friends/send/', views.send_friend_request, name='send_friend_request'),
    path('friends/respond/', views.respond_to_friend_request, name='respond_to_friend_request'),
  #  path('friends/block', views.block_user, name='block_user'),
    path('friends/list-friends/', views.list_friends, name='list_friends'),
    path('friends/requests/', views.list_friend_requests, name='list_friend_requests'),
  #  path('friends/list_blocked_users', views.list_blocked_users, name='list_blocked_users'),
]
