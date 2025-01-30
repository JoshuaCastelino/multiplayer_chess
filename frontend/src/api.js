import {
  HubConnectionBuilder,
  HubConnectionState
} from "@microsoft/signalr";

let connection;

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



export const sendMessage = async (user, message) => {
  if (connection.state === HubConnectionState.Connected) {
    await connection.invoke("SendMessage", user, message);
  } else {
    console.error("SignalR not connected");
  }
};

export const subscribeToMessages = (callback) => {
  connection.on("ReceiveMessage", callback);
};

export default connection;
