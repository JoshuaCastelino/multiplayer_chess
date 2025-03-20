/*
Defines the API endpoints for my chess application
*/

using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Npgsql;
// using var connection = new NpgsqlConnection();

public class GameHub : Hub
{    
   private readonly string ConnectionString;

    public GameHub()
    {
        // If you’re reading from environment variables, do so here
        var host = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
        var user = Environment.GetEnvironmentVariable("DB_USER") ?? "root";
        var pass = Environment.GetEnvironmentVariable("DB_PASS") ?? "root";
        var database = Environment.GetEnvironmentVariable("DB_NAME") ?? "multiplayerchess";

        ConnectionString = $"Host={host};Database={database};Username={user};Password={pass};";
    }
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

    public async Task JoinGame(string connectionId, string code, string blackUsername)
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

        joiningGame.BlackUsername = blackUsername;
        var successResponse = new GameResponse
        {
            Success = true,
            Message = "You have successfully joined the game.",
            BlackUsername = blackUsername,
            WhiteUsername = whiteUsername
        };

        await Clients.Client(connectionId).SendAsync("JoinGameResponse", successResponse);
        await Clients.Client(whiteConnectionId).SendAsync("BlackJoined", successResponse);
    }

    public async Task KingCheckmated(string gameCode, string winningPlayerColor)
    {
        if (CodeToGameState.TryGetValue(gameCode, out var game))
        {
            string winner = winningPlayerColor.Equals("white", StringComparison.OrdinalIgnoreCase)
                ? game.WhiteUsername
                : game.BlackUsername ?? "Guest (Black)";
            
            await RecordGameResult(game.WhiteUsername, game.BlackUsername ?? "Guest (Black)", winner);

            CodeToGameState.TryRemove(gameCode, out _);
        }
    }

    private async Task RecordGameResult(string whiteUsername, string blackUsername, string winner)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        using var cmd = new NpgsqlCommand(
            "INSERT INTO versus (white, black, winner) VALUES (@white, @black, @winner)",
            conn);
        cmd.Parameters.AddWithValue("white", whiteUsername);
        cmd.Parameters.AddWithValue("black", blackUsername);
        cmd.Parameters.AddWithValue("winner", winner);
        await cmd.ExecuteNonQueryAsync();
    }

    // Retrieves the versus history (score) between two players.
    // The response sends back the number of wins each player has recorded in games against one another.
    public async Task GetHistory(string connectionId, string whiteUsername, string blackUsername)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        await conn.OpenAsync();

        string query = @"
            SELECT 
                COUNT(*) FILTER (WHERE winner = @white) AS whiteWins,
                COUNT(*) FILTER (WHERE winner = @black) AS blackWins
            FROM versus 
            WHERE (white = @white AND black = @black)
            OR (white = @black AND black = @white);";

        using var cmd = new NpgsqlCommand(query, conn);
        cmd.Parameters.AddWithValue("white", whiteUsername);
        cmd.Parameters.AddWithValue("black", blackUsername);

        using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync(); // Always returns a row due to aggregate functions
        int whiteWins = reader.GetInt32(reader.GetOrdinal("whiteWins"));
        int blackWins = reader.GetInt32(reader.GetOrdinal("blackWins"));

        var response = new
        {
            success = true,
            whiteWins,
            blackWins
        };

        await Clients.Client(connectionId).SendAsync("GetHistoryResponse", response);
    }


    public async Task DisconnectGame(string connectionId, string gameCode)
    {
        if (CodeToGameState.TryGetValue(gameCode, out var game))
        {
            string whiteConnectionId = game.WhiteConnectionID;
            string blackConnectionId = game.BlackConnectionID;
            string winner;

            // Determine which player resigned.
            if (connectionId == whiteConnectionId)
            {
                winner = game.BlackUsername;
            }
            else
            {
                winner = game.WhiteUsername;
            }

            // Record the result in the versus table.
            await RecordGameResult(game.WhiteUsername, game.BlackUsername, winner);

            // Notify the opponent that the game ended.
            string opponentConnectionId = connectionId == whiteConnectionId ? blackConnectionId : whiteConnectionId;
            var successResponse = new GameResponse
            {
                Success = true,
                Message = "Your opponent has resigned"
            };
            await Clients.Client(opponentConnectionId).SendAsync("OpponentDisconnected", successResponse);
            CodeToGameState.TryRemove(gameCode, out _);
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
    public string? BlackUsername { get; set; }
    public string BoardState { get; set; }

    public GameState(string? whiteConnectionId, string? blackConnectionId, string whiteUsername, string boardState)
    {
        WhiteConnectionID = whiteConnectionId;
        BlackConnectionID = blackConnectionId;
        WhiteUsername = whiteUsername;
        BoardState = boardState;
        BlackUsername = null; // Initially null
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