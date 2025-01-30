import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

export var connection;

export async function startConnection() {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5150/gamehub")
      .withAutomaticReconnect()
      .build();
  }

  if (connection.state === HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log("Connection started");
    } catch (error) {
      console.error("Error starting connection:", error);
    }
  }
}

export const createGame = async (code) => {
  if (connection.state === HubConnectionState.Connected) {
    const connectionID = connection.connectionId;
    await connection.invoke("CreateGame", connectionID, code);
  } else {
    console.error("SignalR not connected");
  }
};

export const joinGame = async (code) => {
  if (connection.state === HubConnectionState.Connected) {
    const connectionID = connection.connectionId;
    await connection.invoke("JoinGame", connectionID, code);
  } else {
    console.error("SignalR not connected");
  }
};


export function onJoinGameResponse(response) {
  console.log(response)
  if (!response) {
    console.error("Received undefined or null response from server.");
    alert("Error: Unexpected server response. Please try again.");
    return;
}
  const success = response.success ?? false;
    const message = response.messageessage ?? "Unknown error.";
    const isGameFull = response.isGameFull ?? false;
    const isInvalidCode = response.isInvalidCode ?? false;

    if (!success) {
        if (isInvalidCode) {
            alert("Error: Invalid game code. Please check and try again.");
        } else if (isGameFull) {
            alert("Error: This game is already full.");
        } else {
            alert("Error: " + message);
        }
    } else {
        console.log(message); // "You have successfully joined the game."
    }
}
