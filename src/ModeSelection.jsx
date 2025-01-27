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
                    onClick={() => navigate("/multiplayer")}
                >
                    Multiplayer
                </button>
                <button
                    className="bg-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
                    onClick={() => navigate("/debug")}
                >
                    Debug
                </button>
            </div>
        </div>
    );
}

export default ModeSelection;
