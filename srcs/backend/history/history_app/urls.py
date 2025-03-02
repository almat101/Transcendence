from django.urls import path
# from .views import MatchCreateView
from . import views

urlpatterns = [
    #local 1vs1
	path('matches/local/create', views.create_match , name='create_match'),
    path('matches/local/', views.get_match , name='get_match'),
    #tournament
    path('matches/tournament/create', views.create_match_tournament, name='create_match_tournament' ),
    path('matches/tournament/', views.get_match_tournament, name='get_match_tournament' ),
]
