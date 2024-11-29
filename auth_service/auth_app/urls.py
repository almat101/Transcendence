from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.register),
    path('login/', views.token),
    path('logout', views.revoke_token),
    path('token/refresh/', views.refresh_token),
]
