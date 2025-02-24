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
  #  path('friends/respond', views.respond_to_friend_request, name='respond_to_friend_request'),
  #  path('friends/block', views.block_user, name='block_user'),
    path('friends/list-friends/', views.list_friends, name='list_friends'),
  #  path('friends/list_friend_requests', views.list_friend_requests, name='list_friend_requests'),
  #  path('friends/list_blocked_users', views.list_blocked_users, name='list_blocked_users'),
]
