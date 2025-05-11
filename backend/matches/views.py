from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from .models import Match, User

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_stats(request, user_id):
    user = get_object_or_404(User, id=user_id)
    total = Match.objects.filter(Q(player1=user) | Q(player2=user)).count()
    wins = Match.objects.filter(winner=user).count()
    losses = total - wins
    return Response({
        "games_played": total,
        "wins": wins,
        "losses": losses
    })

@api_view(['GET'])
def user_rank(request, user_id):
    users = User.objects.all()
    user_wins = []

    for user in users:
        wins = Match.objects.filter(winner=user).count()
        user_wins.append((user.id, wins))

    # Sort descending by win count
    sorted_users = sorted(user_wins, key=lambda x: x[1], reverse=True)
    rank = next((i + 1 for i, (uid, _) in enumerate(sorted_users) if uid == int(user_id)), None)

    return Response({'rank': rank})