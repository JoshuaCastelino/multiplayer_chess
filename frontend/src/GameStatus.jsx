import React from "react";

function GameStatus({ multiplayer, isWaitingForOpponent, gameCode }) {
  return (
    <>
      {multiplayer && (
        <div className="mt-4 text-lg font-semibold">
          {isWaitingForOpponent ? (
            <span className="text-red-400">Waiting for opponent</span>
          ) : (
            <span className="text-green-400">Your move!</span>
          )}
        </div>
      )}

      {gameCode && (
        <div className="mt-4 text-lg font-semibold">
          Game Code: <span className="text-blue-400">{gameCode}</span>
        </div>
      )}
    </>
  );
}

export default GameStatus;
