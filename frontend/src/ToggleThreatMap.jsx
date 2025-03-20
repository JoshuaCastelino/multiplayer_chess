import React from "react";

function ToggleThreatMap({ gameCode, colourThreats, setColourThreats, tileSize, boardSize }) {
  if (gameCode) return null;

  return (
    <button
      className={`mt-4 py-3 px-8 rounded-lg shadow-md font-bold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${
        colourThreats
          ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
          : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
      }`}
      style={{ width: tileSize * boardSize + 40 }}
      onClick={() => setColourThreats((prev) => !prev)}
    >
      {colourThreats ? "Disable Threat Colouring" : "Enable Threat Colouring"}
    </button>
  );
}

export default ToggleThreatMap;
