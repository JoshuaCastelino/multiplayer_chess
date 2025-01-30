using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Collections.Concurrent;
public class GameHub : Hub
{
    private ConcurrentDictionary<string, GameState> codeToGameState = new ConcurrentDictionary<string, GameState>();
    private static ConcurrentDictionary<string, string> userConnections = new ConcurrentDictionary<string, string>();
    private string initialBoard = @"
    bRbNbBbQbKbBbNbRb
    PbPbPbPbPbPbPbP
    0000000000000000
    0000000000000000
    0000000000000000
    0000000000000000
    wPwPwPwPwPwPwPwP
    wRwNwBwQwKwBwNwR";



    public override Task OnConnectedAsync()
    {
        string connectionId = Context.ConnectionId;
        userConnections[connectionId] = connectionId;
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception exception)
    {
        userConnections.TryRemove(Context.ConnectionId, out _);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task CreateGame(string connectionId, string code)
    {
        Console.WriteLine($"Creating Game {connectionId}, {code}");
        GameState gameState = new GameState(connectionId, null, initialBoard);
        codeToGameState[code] = gameState;
        await Clients.Client(connectionId).SendAsync("ReceiveMessage", "Created Lobby", code);
    }

    public async Task JoinGame(string connectionId, string code)
    {
        if (!codeToGameState.TryGetValue(code, out GameState? joiningGame))
        {
            Console.WriteLine("INVALID GAME CODE");
            // Return error for invalid game code
            var response = new JoinGameResponse
            {
                Success = false,
                Message = "Invalid game code.",
                IsInvalidCode = true
            };
            await Clients.Client(connectionId).SendAsync("JoinGameResponse", response);
            return;
        }

        if (!string.IsNullOrEmpty(joiningGame.BlackConnectionID))
        {
            Console.WriteLine("GAME IS ALREADY FULL");
            // Return error for game being full
            var response = new JoinGameResponse
            {
                Success = false,
                Message = "This game is already full.",
                IsGameFull = true
            };
            await Clients.Client(connectionId).SendAsync("JoinGameResponse", response);
            return;
        }

        // Join the game successfully
        joiningGame.BlackConnectionID = connectionId;

        var successResponse = new JoinGameResponse
        {
            Success = true,
            Message = "You have successfully joined the game."
        };

        await Clients.Client(connectionId).SendAsync("JoinGameResponse", successResponse);
    }


}

public record class GameState
{
    public string? WhiteConnectionID { get; set; }
    public string? BlackConnectionID { get; set; }
    public string BoardState { get; set; }

    public GameState(string? whiteConnectionID, string? blackConnectionID, string boardState)
    {
        WhiteConnectionID = whiteConnectionID;
        BlackConnectionID = blackConnectionID;
        BoardState = boardState;
    }
}


public class JoinGameResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public bool IsGameFull { get; set; }
    public bool IsInvalidCode { get; set; }
}
