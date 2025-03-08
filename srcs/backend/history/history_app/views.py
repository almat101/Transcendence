import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import MatchSerializer
from .models import Match_local

from .serializers import MatchSerializerTournament
from .models import Match_tournament

logger = logging.getLogger(__name__)

#1vs1 views
@api_view(['POST'])
def create_match(request):
    serializer = MatchSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error saving match: {e}")
            return Response({"detail": "Service Unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    logger.warning(f"Validation errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_match(request):
    try:
        match_local = Match_local.objects.all()
        serializer = MatchSerializer(match_local, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error retrieving matches: {e}")
        return Response({"detail": "Service Unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
def get_match_by_player(request, player1_id):
    try:
        match_local = Match_local.objects.filter(player1_id=player1_id)
        serializer = MatchSerializer(match_local, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error retrieving matches: {e}")
        return Response({"detail": "Service Unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


#tournament views

@api_view(['POST'])
def create_match_tournament(request):
    serializer = MatchSerializerTournament(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error saving match: {e}")
            return Response({"detail": "Service Unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    logger.warning(f"Validation errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_match_tournament(request):
    try:
        match_local = Match_tournament.objects.all()
        serializer = MatchSerializerTournament(match_local, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error retrieving matches: {e}")
        return Response({"detail": "Service Unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
def get_match_tournament_by_player(request, player1_id):
    try:
        match_tournament = Match_tournament.objects.filter(player1_id=player1_id)
        serializer = MatchSerializerTournament(match_tournament, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error retrieving matches: {e}")
        return Response({"detail": "Service Unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
