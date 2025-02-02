using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Collections.Concurrent;
public class GameHub : Hub
{
    public static ConcurrentDictionary<string, GameState> codeToGameState = new ConcurrentDictionary<string, GameState>();
    public static ConcurrentDictionary<string, string> userConnections = new ConcurrentDictionary<string, string>();
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

    public async Task SendMove(string playerTurn, string connectionId, string code, string board)
    {
        // Attempt to retrieve the game state using the provided code
        bool foundGameState = codeToGameState.TryGetValue(code, out GameState? currentGameState);

        if (!foundGameState || currentGameState == null)
        {
            var invalidResponse = new GameResponse
            {
                Success = false,
                Message = "Invalid game code.",
                IsInvalidCode = true
            };

            // Notify the sender of failure
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", invalidResponse);
            return;
        }
        else
        {
            // Identify which connection to send the move to
            string sendMoveTo = playerTurn == "white"
                ? currentGameState.BlackConnectionID
                : currentGameState.WhiteConnectionID;

            // Create a response object
            var response = new GameResponse
            {
                Success = true,
                Message = board
            };

            // Update the board state in the current game
            currentGameState.BoardState = board;

            // Notify the player that their move was successful
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", response);

            // Notify the opponent that the board state changed
            await Clients.Client(sendMoveTo).SendAsync("MoveMade", response);
        }
    }


    public async Task CreateGame(string connectionId, string code)
    {
        Console.WriteLine($"Creating Game {connectionId}, {code}");
        GameState gameState = new GameState(connectionId, null, initialBoard);
        codeToGameState[code] = gameState;
    }

    public async Task JoinGame(string connectionId, string code)
    {
        if (!codeToGameState.TryGetValue(code, out GameState? joiningGame))
        {
            Console.WriteLine("INVALID GAME CODE");
            // Return error for invalid game code
            var response = new GameResponse
            {
                Success = false,
                Message = "Invalid game code.",
                IsInvalidCode = true
            };
            await Clients.Client(connectionId).SendAsync("GameResponse", response);
            return;
        }

        if (!string.IsNullOrEmpty(joiningGame.BlackConnectionID))
        {
            Console.WriteLine("GAME IS ALREADY FULL");
            // Return error for game being full
            var response = new GameResponse
            {
                Success = false,
                Message = "This game is already full.",
                IsGameFull = true
            };
            await Clients.Client(connectionId).SendAsync("GameResponse", response);
            return;
        }

        // Join the game successfully
        joiningGame.BlackConnectionID = connectionId;
        string whiteConnectionID = joiningGame.WhiteConnectionID;
        Console.WriteLine(whiteConnectionID);
        var successResponse = new GameResponse
        {
            Success = true,
            Message = "You have successfully joined the game."
        };

        await Clients.Client(connectionId).SendAsync("GameResponse", successResponse);
        await Clients.Client(whiteConnectionID).SendAsync("ReceiveMessage", successResponse);
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


public class GameResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public bool IsGameFull { get; set; }
    public bool IsInvalidCode { get; set; }
}
