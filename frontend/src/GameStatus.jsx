import React from "react";

function GameStatus({ multiplayer, isWaitingForOpponent, gameCode }) {
  return (
    <>
      {gameCode && (
        <div className="mt-4">
          <div className="inline-flex items-center space-x-2 border border-blue-500 rounded px-3 py-2 bg-gray-800">
            <span className="text-white font-semibold">Game Code:</span>
            <span className="text-blue-400 font-bold">{gameCode}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default GameStatus;
