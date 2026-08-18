namespace DinoGame.Models;

public class ScoreSubmission
{
    public string PlayerName { get; set; } = "Anonimo";
    public int Score { get; set; }
}

public class HighScoreEntry
{
    public string PlayerName { get; set; } = "Anonimo";
    public int Score { get; set; }
    public DateTime AchievedAt { get; set; }
}
