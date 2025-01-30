using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class GameHub : Hub
{
    private Dictionary<string, string> games = new Dictionary<string, string>();
    private string initialBoard = @"
    bRbNbBbQbKbBbNbRb
    PbPbPbPbPbPbPbP
    0000000000000000
    0000000000000000
    0000000000000000
    0000000000000000
    wPwPwPwPwPwPwPwP
    wRwNwBwQwKwBwNwR";
    public async Task SendMessage(string user, string message)
    {
        Console.WriteLine($"{user}, {message}");
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}


