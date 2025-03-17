import React from "react";
import whitePawn from "./assets/white_pawn.svg";
import blackPawn from "./assets/black_pawn.svg";

function UserCard({ color, username, wins = 0 }) {
  const isWhite = color === "white";
  const pawnIcon = isWhite ? whitePawn : blackPawn;

  return (
    <div className="w-64 p-4 bg-gray-800 border-6 border-gray-700 rounded-lg shadow-md flex items-center space-x-3">
      <div className="p-2 bg-gray-700 rounded">
        <img src={pawnIcon} alt={`${color} pawn icon`} className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-lg font-bold">{username.toUpperCase()}</h3>
        <p className="text-sm">Wins: {wins}</p>
      </div>
    </div>
  );
}

export default UserCard;
