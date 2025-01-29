using System;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost") // Allow any localhost port
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
var app = builder.Build();
app.UseCors();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

Dictionary<string, string> lobbyCodesToGameState = new Dictionary<string, string>();

app.UseHttpsRedirection();

app.MapGet("/test", () => "Hello, world!");

app.MapPost("/add-game", ([FromBody] GameData data) =>
{
    lobbyCodesToGameState[data.LobbyCode] = data.GameState;
    return Results.Ok(new { message = "Data received successfully!" });
});


app.Run();

record GameData(string LobbyCode, string GameState);
