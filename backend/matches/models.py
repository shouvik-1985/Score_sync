from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Match(models.Model):
    GAME_CHOICES = [
        ('tennis', 'Tennis'),
        ('badminton', 'Badminton'),
        ('chess', 'Chess'),
    ]

    player1 = models.ForeignKey(User, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='matches_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(User, related_name='matches_won', on_delete=models.CASCADE)
    game_type = models.CharField(max_length=50, choices=GAME_CHOICES)
    score = models.CharField(max_length=50, blank=True)
    played_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player1} vs {self.player2} ({self.game_type})"
