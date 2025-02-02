using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using System.Collections.Concurrent;

public class GameHub : Hub
{
    // Use readonly static dictionaries for game state and user connections.
    private static readonly ConcurrentDictionary<string, GameState> CodeToGameState = new ConcurrentDictionary<string, GameState>();
    private static readonly ConcurrentDictionary<string, string> UserConnections = new ConcurrentDictionary<string, string>();

    private const string InitialBoard =
        "bRbNbBbQbKbBbNbRb\n" +
        "PbPbPbPbPbPbPbP\n" +
        "0000000000000000\n" +
        "0000000000000000\n" +
        "0000000000000000\n" +
        "0000000000000000\n" +
        "wPwPwPwPwPwPwPwP\n" +
        "wRwNwBwQwKwBwNwR";

    public override Task OnConnectedAsync()
    {
        string connectionId = Context.ConnectionId;
        UserConnections[connectionId] = connectionId;
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        UserConnections.TryRemove(Context.ConnectionId, out _);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task SendMove(string playerTurn, string connectionId, string code, string board)
    {
        Console.WriteLine($"{playerTurn}, {connectionId}, {code}, {board}");

        if (!CodeToGameState.TryGetValue(code, out var currentGameState) || currentGameState is null)
        {
            await SendErrorResponse(connectionId, "Invalid game code.", isInvalidCode: true);
            return;
        }

        // Determine the opponent's connection ID based on the current player's turn.
        string? targetConnection = playerTurn.Equals("white", StringComparison.OrdinalIgnoreCase)
            ? currentGameState.BlackConnectionID
            : currentGameState.WhiteConnectionID;

        // Update the game state.
        currentGameState.BoardState = board;

        // Prepare the response.
        var response = new GameResponse
        {
            Success = true,
            Message = board
        };

        // Notify the sender of success.
        await Clients.Client(connectionId).SendAsync("ReceiveMessage", response);

        // Notify the opponent (if connected) about the move.
        if (!string.IsNullOrEmpty(targetConnection))
        {
            await Clients.Client(targetConnection).SendAsync("MoveMade", response);
        }
    }

    public async Task CreateGame(string connectionId, string code)
    {
        Console.WriteLine($"Creating Game {connectionId}, {code}");

        // If there are 5 or more games, wipe all existing games.
        if (CodeToGameState.Count >= 5)
        {
            Console.WriteLine("Too many games. Clearing all existing games...");
            CodeToGameState.Clear();
        }

        // Create a new game with the creator's connection as the white player.
        var gameState = new GameState(whiteConnectionId: connectionId, blackConnectionId: null, boardState: InitialBoard);
        CodeToGameState[code] = gameState;

        Console.WriteLine($"Game {code} created successfully.");
    }

    public async Task JoinGame(string connectionId, string code)
    {
        if (!CodeToGameState.TryGetValue(code, out var joiningGame))
        {
            await SendErrorResponse(connectionId, "Invalid game code.", isInvalidCode: true);
            return;
        }

        if (!string.IsNullOrEmpty(joiningGame.BlackConnectionID))
        {
            await SendErrorResponse(connectionId, "This game is already full.", isGameFull: true);
            return;
        }

        // Set the joining player's connection as the black player.
        joiningGame.BlackConnectionID = connectionId;
        string whiteConnectionId = joiningGame.WhiteConnectionID ?? string.Empty;

        var successResponse = new GameResponse
        {
            Success = true,
            Message = "You have successfully joined the game."
        };

        await Clients.Client(connectionId).SendAsync("JoinGameResponse", successResponse);
        await Clients.Client(whiteConnectionId).SendAsync("BlackJoined", successResponse);
    }

    /// <summary>
    /// Helper method to send an error response to the client.
    /// </summary>
    private async Task SendErrorResponse(string connectionId, string message, bool isGameFull = false, bool isInvalidCode = false)
    {
        var response = new GameResponse
        {
            Success = false,
            Message = message,
            IsGameFull = isGameFull,
            IsInvalidCode = isInvalidCode
        };

        // For join game errors, we send "JoinGameResponse".
        await Clients.Client(connectionId).SendAsync("JoinGameResponse", response);
    }
}

public record GameState
{
    public string? WhiteConnectionID { get; set; }
    public string? BlackConnectionID { get; set; }
    public string BoardState { get; set; }

    public GameState(string? whiteConnectionId, string? blackConnectionId, string boardState)
    {
        WhiteConnectionID = whiteConnectionId;
        BlackConnectionID = blackConnectionId;
        BoardState = boardState;
    }
}

public class GameResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsGameFull { get; set; }
    public bool IsInvalidCode { get; set; }
}