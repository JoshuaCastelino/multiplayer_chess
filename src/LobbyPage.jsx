import React from "react";
import { useNavigate } from "react-router-dom";
import whiteQueen from "./assets/white_queen.svg";

function LobbyPage() {
  const navigate = useNavigate();

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateGame = () => {
    // Need to check if this game code is in use
    const gameCode = generateGameCode(8);
    navigate(`/multiplayer/?code=${gameCode}`);
  };

  const handleJoinGame = (event) => {
    event.preventDefault();
    const gameCode = event.target.gameCode.value;
    // Before navigating need to check this code actually exists on the server
    navigate(`/multiplayer/?code=${gameCode}`);
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
      <button
        className="flex items-center justify-center space-x-4 mb-12 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50 w-full max-w-md"
        onClick={() => navigate("/")}
      >
        <img src={whiteQueen} alt="White Queen" className="w-12 h-12" />
        <h1 className="text-4xl font-bold">NotChess.com</h1>
      </button>

      <div className="flex flex-col space-y-8 px-8 w-full max-w-md">
        <button
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 w-full transition-all duration-200 transform hover:scale-105"
          onClick={handleCreateGame}
        >
          Create Game
        </button>

        <form onSubmit={handleJoinGame} className="flex flex-col space-y-4 w-full">
          <input
            type="text"
            name="gameCode"
            placeholder="Enter Game Code"
            maxLength={8}
            pattern="[A-Z0-9]+"
            className="bg-gray-700 text-white font-bold py-4 px-8 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-center placeholder-gray-400 w-full border border-gray-600 transition-all duration-200"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 w-full transition-all duration-200 transform hover:scale-105"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

export default LobbyPage;
