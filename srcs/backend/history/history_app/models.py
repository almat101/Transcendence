from django.db import models

# Create your models here.

#* Create a models for 1vs1 match
#* add both names (in the future the ID)
#* the date of the game
#* the winner of the match
#* later add if is a tournament or normal 1vs1 mode

class Match_local(models.Model):
    player1_id = models.BigIntegerField()
    player1_name = models.CharField(max_length=100)
    player2_name = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    winner = models.CharField(max_length=100)
    is_tournament = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player1_id} vs {self.player2_name} on {self.date} - Score: {self.player1_score}-{self.player2_score} - Winner: {self.winner} - Is Tournament {self.is_tournament}"



class Match_tournament(models.Model):
    player1_id = models.BigIntegerField()
    total_players = models.IntegerField(default=0)
    user_final_position = models.IntegerField(default=0)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tournament with {self.total_players} players on {self.date} - User final position {self.user_final_position}"
