const PROD = "https://api.joshuacastelino.com/gamehub";
const DEV = "http://localhost:5150/gamehub";

import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
export let connection = new HubConnectionBuilder().withUrl(DEV).withAutomaticReconnect().build();

const DEFAULT_TIMEOUT = 5000;

export async function startConnection() {
  // Only start if not already connected.
  if (connection.state === HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log("Connection started:", connection.connectionId);
    } catch (error) {
      console.error("Error starting connection:", error);
      throw error;
    }
  }

  if (!connection["onCloseRegistered"]) {
    connection.onclose(async () => {
      console.warn("Disconnected from server!");
      alert("Connection lost! Trying to reconnect...");
      await reconnect();
    });
    // Use a custom flag to prevent duplicate registrations.
    connection["onCloseRegistered"] = true;
  }
}

// Attempt to reconnect.
async function reconnect() {
  try {
    await startConnection();
    console.log("Reconnected to SignalR!");
  } catch (error) {
    console.error("Reconnection attempt failed:", error);
  }
}

async function ensureConnected() {
  if (connection.state !== HubConnectionState.Connected) {
    await startConnection();
  }
  return connection;
}

function invokeWithResponse<T>(
  hubMethod: string,
  responseEvent: string,
  args: any[],
  timeout: number = DEFAULT_TIMEOUT
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    await ensureConnected();
    const connectionId = connection.connectionId;

    // Handler to process the response event.
    const handler = (response: T & { success?: boolean; message?: string }) => {
      connection.off(responseEvent, handler);
      if (response && response.success) {
        resolve(response);
      } else {
        reject(response || { success: false, message: "Unknown error" });
      }
    };

    // Listen for the response.
    connection.on(responseEvent, handler);

    // Attempt to invoke the hub method.
    try {
      await connection.invoke(hubMethod, connectionId, ...args);
    } catch (error) {
      connection.off(responseEvent, handler);
      return reject(error);
    }

    // Set up a timeout in case no response arrives.
    setTimeout(() => {
      connection.off(responseEvent, handler);
      reject({ success: false, message: `${responseEvent} timeout` });
    }, timeout);
  });
}

// Create a game without expecting an immediate response event.
export async function createGame(code: string, username: string) {
  await ensureConnected();
  const connectionId = connection.connectionId;
  try {
    await connection.invoke("CreateGame", connectionId, code, username);
    console.log("CreateGame invoked");
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}

export function joinGame(code: string, blackUsername: string, timeout?: number) {
  return invokeWithResponse("JoinGame", "JoinGameResponse", [code, blackUsername], timeout);
}

export function disconnectGame(code: string, timeout?: number) {
  return invokeWithResponse("DisconnectGame", "DisconnectGameResponse", [code], timeout);
}

export function sendMove(playerTurn: any, code: string, board: any, timeout?: number) {
  return invokeWithResponse("SendMove", "SendMoveResponse", [playerTurn, code, board], timeout);
}

export function CheckUserExists(email: string, timeout?: number) {
  return invokeWithResponse("CheckUserExists", "CheckUserExistsResponse", [email], timeout);
}

export function AddUser(email: string, username: string, timeout?: number) {
  return invokeWithResponse("AddUser", "AddUserResponse", [email, username], timeout);
}
