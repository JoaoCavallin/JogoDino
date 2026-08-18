using DinoGame.Models;

namespace DinoGame.Services;

/// <summary>
/// Guarda os recordes em memória. Para persistência real,
/// troque a lista por Entity Framework + banco de dados (SQLite, SQL Server, etc).
/// </summary>
public class ScoreStore
{
    private readonly List<HighScoreEntry> _scores = new();
    private readonly object _lock = new();

    public HighScoreEntry AddScore(ScoreSubmission submission)
    {
        var entry = new HighScoreEntry
        {
            PlayerName = string.IsNullOrWhiteSpace(submission.PlayerName) ? "Anonimo" : submission.PlayerName,
            Score = submission.Score,
            AchievedAt = DateTime.UtcNow
        };

        lock (_lock)
        {
            _scores.Add(entry);
        }

        return entry;
    }

    public List<HighScoreEntry> GetTopScores(int count = 10)
    {
        lock (_lock)
        {
            return _scores
                .OrderByDescending(s => s.Score)
                .Take(count)
                .ToList();
        }
    }
}
