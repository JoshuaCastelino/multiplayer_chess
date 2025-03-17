import React from "react";
import whiteQueen from "./assets/white_queen.svg";

const BackButton = ({ width, onBackButton }) => {
  return (
    <button
      className="flex items-center justify-center space-x-4 mb-12 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
      style={{ width: width }}
      onClick={onBackButton}
    >
      <img src={whiteQueen} alt="White Queen" className="w-12 h-12" />
      <h1 className="text-4xl font-bold">NotChess.com</h1>
    </button>
  );
};

export default BackButton;
