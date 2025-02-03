import React from "react";

const CheckmateGraphic = ({ message, onRestart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="relative p-8 max-w-md mx-4 bg-white bg-opacity-95 rounded-xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{message}</h1>
        <button
          onClick={onRestart}
          className="mt-4 py-3 px-8 rounded-lg shadow-md font-bold bg-blue-500 
                     text-white transition-all duration-200 transform hover:scale-105 
                     hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 
                     focus:ring-opacity-50"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default CheckmateGraphic;
