/*
Defines the API endpoints for my chess application
*/

using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Npgsql;
// using var connection = new NpgsqlConnection();

public class GameHub : Hub
{
    private static readonly ConcurrentDictionary<string, GameState> CodeToGameState = new ConcurrentDictionary<string, GameState>();
    private static readonly ConcurrentDictionary<string, string> UserConnections = new ConcurrentDictionary<string, string>();
    private const string ConnectionString = "Host=localhost;Port=5432;Database=multiplayerchess;Username=root;Password=root;";
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

    public async Task SendMove(string connectionId, string playerTurn, string code, string board)
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
        await Clients.Client(connectionId).SendAsync("SendMoveResponse", response);

        // Notify the opponent (if connected) about the move.
        if (!string.IsNullOrEmpty(targetConnection))
        {
            await Clients.Client(targetConnection).SendAsync("MoveMade", response);
        }
    }


    public async Task CheckUserExists(string connectionID, string email)
    {
        Console.WriteLine("checking user exists");

        // Connect to DB
        using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        // Query for a row that matches this email
        using var cmd = new NpgsqlCommand("SELECT username FROM users WHERE email = @email LIMIT 1", conn);
        cmd.Parameters.AddWithValue("email", email);

        var result = await cmd.ExecuteScalarAsync();

        // Build a response object
        var response = new
        {
            success = (result != null),
            message = (result != null)
                ? result
                : "No user registered with that email."
        };

        // Send it back to the caller
        await Clients.Client(connectionID).SendAsync("CheckUserExistsResponse", response);
    }


    public async Task AddUser(string connectionID, string email, string username)
    {
        // Kind of relies on the fact that the user cannot create a new user name for themselves
        // Hopes and prayers!

        using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand(
            "INSERT INTO users (email, username) VALUES (@email, @username)",
            conn
        );
        cmd.Parameters.AddWithValue("email", email);
        cmd.Parameters.AddWithValue("username", username);
        await cmd.ExecuteNonQueryAsync();

        await Clients.Client(connectionID).SendAsync("AddUserResponse", new
        {
            Success = true,
            Message = "User added successfully."
        });
    }





    public async Task CreateGame(string connectionId, string code, string username)
    {
        Console.WriteLine($"Creating Game {connectionId}, {code}, {username}");

        // If there are 5 or more games, wipe all existing games. (What a funny idea)
        if (CodeToGameState.Count >= 5)
        {
            Console.WriteLine("Too many games. Clearing all existing games...");
            CodeToGameState.Clear();
        }

        // Create a new game with the creator's connection as the white player.
        var gameState = new GameState(whiteConnectionId: connectionId, blackConnectionId: null, boardState: InitialBoard, whiteUsername: username);
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
        string whiteUsername = joiningGame.WhiteUsername;
        Console.WriteLine("Joining game " + joiningGame);
        var successResponse = new GameResponse
        {
            Success = true,
            Message = "You have successfully joined the game.",
            BlackUsername = "Guest (Black)",
            WhiteUsername = whiteUsername
        };

        await Clients.Client(connectionId).SendAsync("JoinGameResponse", successResponse);
        await Clients.Client(whiteConnectionId).SendAsync("BlackJoined", successResponse);
    }

    public async Task DisconnectGame(string connectionId, string gameCode)
    {
        if (CodeToGameState.TryGetValue(gameCode, out var disconnectedGame))
        {
            string whiteConnectionId = disconnectedGame.WhiteConnectionID;
            string blackConnectionId = disconnectedGame.BlackConnectionID;

            string opponentConnectionID = connectionId == whiteConnectionId ? blackConnectionId : whiteConnectionId;

            CodeToGameState.TryRemove(gameCode, out var disconnectedGameState);
            var successResponse = new GameResponse
            {
                Success = true,
                Message = "Your opponent has resigned"
            };
            await Clients.Client(opponentConnectionID).SendAsync("OpponentDisconnected", successResponse);
        }
    }

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
    public string WhiteUsername { get; set; }
    public string BoardState { get; set; }

    public GameState(string? whiteConnectionId, string? blackConnectionId, string whiteUsername, string boardState)
    {
        WhiteConnectionID = whiteConnectionId;
        BlackConnectionID = blackConnectionId;
        WhiteUsername = whiteUsername;
        BoardState = boardState;
    }
}

public class GameResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string BlackUsername { get; set; } = string.Empty;
    public string WhiteUsername { get; set; } = string.Empty;
    public bool IsGameFull { get; set; }
    public bool IsInvalidCode { get; set; }

}