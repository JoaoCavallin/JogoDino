using DinoGame.Models;
using DinoGame.Services;
using Microsoft.AspNetCore.Mvc;

namespace DinoGame.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoreController : ControllerBase
{
    private readonly ScoreStore _store;

    public ScoreController(ScoreStore store)
    {
        _store = store;
    }

    // GET /api/score/top
    [HttpGet("top")]
    public ActionResult<List<HighScoreEntry>> GetTop()
    {
        return Ok(_store.GetTopScores());
    }

    // POST /api/score
    [HttpPost]
    public ActionResult<HighScoreEntry> Post([FromBody] ScoreSubmission submission)
    {
        if (submission.Score < 0)
            return BadRequest("Pontuação inválida.");

        var entry = _store.AddScore(submission);
        return Ok(entry);
    }
}
