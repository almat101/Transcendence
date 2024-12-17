from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('api/v1/token/refresh/', views.refresh_token, name='token_refresh'),
    path('api/v1/getuserinfo', views.user_info_view, name='user_info'),
    path('api/v1/updateuser', views.update_user, name='update_user'),
    path('api/v1/password/reset/', views.reset_password, name='reset_password'),
    path('api/v1/password/reset/confirm/', views.reset_password_confirm, name='reset_password_confirm'),
    path('api/v1/deleteuser', views.delete_user, name='delete_user'),
    path('api/v1/getallusers', views.get_all_users, name='get_all_users'),
    path('api/v1/friends/send', views.send_friend_request, name='send_friend_request'),
    path('api/v1/friends/respond', views.respond_to_friend_request, name='respond_to_friend_request'),
    path('api/v1/friends/block', views.block_user, name='block_user'),
    path('api/v1/friends/list-friends', views.list_friends, name='list_friends'),
    path('api/v1/friends/list_friend_requests', views.list_friend_requests, name='list_friend_requests'),
    path('api/v1/friends/list_blocked_users', views.list_blocked_users, name='list_blocked_users'),
]
