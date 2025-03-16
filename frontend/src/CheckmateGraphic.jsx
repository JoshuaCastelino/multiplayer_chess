/*
The graphic that is shown when the game ends, not just checkmate as this will render when the enemy is stalemated too.
*/
import React from "react";

const CheckmateGraphic = ({ message, onRestart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="relative bg-gray-800 text-white rounded-lg shadow-md p-8 mx-4 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">{message}</h1>
        <button
          onClick={onRestart}
          className="mt-4 py-4 px-8 w-full rounded-lg shadow-md font-bold 
                     bg-blue-600 hover:bg-blue-700 text-white 
                     transition-all duration-200 transform hover:scale-105 
                     focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Exit to menu
        </button>
      </div>
    </div>
  );
};

export default CheckmateGraphic;
