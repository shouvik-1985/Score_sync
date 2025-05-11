from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Challenge, TennisMatch
from .serializers import ChallengeSerializer
from django.contrib.auth import get_user_model
from games.models import Game
from django.utils import timezone
from django.db.models import Q
from games.serializers import MatchSerializer
from games.models import Match

User = get_user_model()
class ChallengeListView(generics.ListAPIView):
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Challenge.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-scheduled_time')

class SentChallengeListView(generics.ListAPIView):
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Challenge.objects.filter(sender=self.request.user).order_by('-created_at')


class ChallengeCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        sender = request.user
        receiver_id = request.data.get('receiver_id')
        game_id = request.data.get('game_id')
        scheduled_time = request.data.get('scheduled_time')

        if not receiver_id or not game_id or not scheduled_time:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(pk=receiver_id)
            game = Game.objects.get(pk=game_id)
        except (User.DoesNotExist, Game.DoesNotExist):
            return Response({"error": "Invalid receiver or game ID."}, status=status.HTTP_400_BAD_REQUEST)

        challenge = Challenge.objects.create(
            sender=sender,
            receiver=receiver,
            game=game,
            scheduled_time=scheduled_time
        )

        serializer = ChallengeSerializer(challenge, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChallengeRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id):
        action = request.data.get('action')
        try:
            challenge = Challenge.objects.get(pk=challenge_id)
        except Challenge.DoesNotExist:
            return Response({"error": "Challenge not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if challenge.receiver != request.user:
            return Response({"error": "Only the receiver can respond to the challenge."}, status=status.HTTP_403_FORBIDDEN)
        
        if action == "accept":
            challenge.status = "accepted"
            challenge.save()
        elif action == "decline":
            challenge.status = "declined"
            challenge.save()
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
        
        challenge.save()
        serializer = ChallengeSerializer(challenge, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

# views.py
class TennisMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id):
        try:
            challenge = Challenge.objects.get(pk=challenge_id)
        except Challenge.DoesNotExist:
            return Response({"error": "Challenge not valid for match."}, status=404)

        # Get the related Match object
        match = getattr(challenge, "match", None)
        if not match:
            match = Match.objects.filter(challenge=challenge).first()
            if not match:
                return Response({"error": "Match not found for challenge."}, status=404)

        # Compute set scores from TennisSet
        player1_sets = sum(1 for s in match.sets.all() if s.player1_games > s.player2_games)
        player2_sets = sum(1 for s in match.sets.all() if s.player2_games > s.player1_games)

        winner_id = request.data.get("winner_id")
        try:
            winner = User.objects.get(pk=winner_id)
        except User.DoesNotExist:
            return Response({"error": "Winner not found."}, status=404)

        if winner not in [challenge.sender, challenge.receiver]:
            return Response({"error": "Winner must be one of the participants."}, status=400)

        # Update match and challenge
        match.player1_score = player1_sets
        match.player2_score = player2_sets
        match.winner = winner
        match.status = "completed"
        match.ended_at = timezone.now()
        match.save()

        challenge.status = "completed"
        challenge.save()

        from .serializers import TennisMatchSerializer
        serializer = TennisMatchSerializer(match)
        return Response(serializer.data, status=200)


    
class ChallengeRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id):
        action = request.data.get('action')

        try:
            challenge = Challenge.objects.get(pk=challenge_id, receiver=request.user)
        except Challenge.DoesNotExist:
            return Response({"error": "Challenge not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "accept":
            challenge.status = "accepted"
            challenge.save()

            # 🎾 If the game is Tennis, create a TennisMatch
            if challenge.game.name.lower() == "tennis":
                TennisMatch.objects.get_or_create(challenge=challenge)

        elif action == "decline":
            challenge.status = "declined"
            challenge.save()
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ChallengeSerializer(challenge)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CompletedChallengesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        matches = Match.objects.filter(
            status="completed"
        ).filter(Q(player1=request.user) | Q(player2=request.user)).order_by('-ended_at')

        serializer = MatchSerializer(matches, many=True, context={"request": request})
        return Response(serializer.data)