/*
The entry point for the application, allows the user to toggle between 1 of 3 modes.

1. Single player
- Normal chess, the board does not flip
- Scope to add a simple bot in the future
2. Pass and play
- Intended for local multiplayer, the board flips to render from the perspective of the colour playing
3. Multiplayer
- Currently limited to local machine
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import whiteQueen from "./assets/white_queen.svg";

function ModeSelection() {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
            <div className="flex items-center space-x-4 mb-12">
                <img src={whiteQueen} alt="White Queen" className="w-12 h-12" />
                <h1 className="text-4xl font-bold">NotChess.com</h1>
            </div>
            <div className="flex space-x-8 px-8">
                <button
                    className="bg-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
                    onClick={() => navigate("/singlePlayer")} // Navigate to Game page
                >
                    Single Player
                </button>
                <button
                    className="bg-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
                    onClick={() => navigate("/passAndPlay")}
                >
                    Pass and Play
                </button>
                <button
                    className="bg-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
                    onClick={() => navigate("/connectToLobby")}
                >
                    Multiplayer
                </button>
            </div>
        </div>
    );
}

export default ModeSelection;
