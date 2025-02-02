import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

export const connection = new HubConnectionBuilder()
  .withUrl("http://localhost:5150/gamehub")
  .withAutomaticReconnect()
  .build();

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
      console.log("Connection started:", connection.connectionId);
    } catch (error) {
      console.error("Error starting connection:", error);
    }
  }

  // Handle disconnection
  connection.onclose(async () => {
    console.warn("Disconnected from server!");
    alert("Connection lost! Trying to reconnect...");
    await reconnect();
  });
}

// Function to attempt reconnecting
async function reconnect() {
  try {
    await startConnection();
    console.log("Reconnected to SignalR!");
  } catch (error) {
    console.error("Reconnection attempt failed:", error);
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
  return new Promise(async (resolve, reject) => {
    if (connection.state === HubConnectionState.Connected) {
      const connectionID = connection.connectionId;

      const handleResponse = (response) => {
        connection.off("JoinGameResponse", handleResponse);
        if (response.success) {
          console.log(response);
          resolve(response);
        } else {
          reject(response);
        }
      };

      connection.on("JoinGameResponse", handleResponse);
      await connection.invoke("JoinGame", connectionID, code);
    } else {
      console.error("SignalR not connected");
      reject({
        success: false,
        message: "Not connected to SignalR",
        isGameFull: false,
        isInvalidCode: false,
      });
    }
  });
};

export function onJoinGameResponse(response) {
  console.log(response);
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

export const sendMove = async (playerTurn, code, board) => {
  return new Promise(async (resolve, reject) => {
    if (connection.state === HubConnectionState.Connected) {
      // The current SignalR client connection ID
      const connectionId = connection.connectionId;

      // Handler for the server's response
      const handleMoveResponse = (response) => {
        // Unsubscribe from the event once we receive a response
        connection.off("ReceiveMessage", handleMoveResponse);

        if (response.success) {
          resolve(response);
        } else {
          reject(response);
        }
      };

      connection.on("ReceiveMessage", handleMoveResponse);

      await connection.invoke("SendMove", playerTurn, connectionId, code, board);
    } else {
      console.error("SignalR not connected");
      reject({
        success: false,
        message: "Not connected to SignalR",
      });
    }
  });
};
