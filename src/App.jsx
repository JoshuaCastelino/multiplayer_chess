import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import whiteQueen from "./assets/white_queen.svg";

import {
  updateThreatMaps,
  initialise,
  isInBounds,
  move,
  generateAllLegalMoves,
  generateThreatMapKey,
} from "./utils/Engine";
import {
  colourThreatMap,
  redrawBoard,
  pointToCoordinate,
  drawLegalMoves,
  colourCheck,
} from "./utils/Render";
import King from "./pieces/king";

function App({ preventFlipping, debug }) {
  const canvasRef = useRef(null);
  const tileSize = 80;
  const boardSize = 8;
  const red = "rgba(255, 0, 0, 0.5)";
  const blue = "rgba(0, 50, 255, 0.5)";

  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(undefined);
  const [playerTurn, setPlayerTurn] = useState("black");
  const [legalMoves, setLegalMoves] = useState([]);
  const [kings, setKings] = useState({ white: null, black: null });
  const [allLegalMoves, setAllLegalMoves] = useState(null);
  const navigate = useNavigate();

  // Called at first render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { board, blackKing, whiteKing } = initialise(ctx, boardSize);
    setBoard(board);
    // In an ideal world I would use an enum for player turn, causing me so much pain to keep using strings
    setKings({ white: whiteKing, black: blackKing });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!board.length || !canvas) return;

    if (selectedPiece instanceof King) {
      setKings((prev) => ({
        ...prev,
        pieceColour: selectedPiece,
      }));
    }

    setLegalMoves([]);
    setSelectedPiece(undefined);

    const ctx = canvas.getContext("2d");
    const nextTurn = playerTurn == "white" ? "black" : "white";
    const king = kings[nextTurn];
    const { legalMovesByPosition, checkmated, checked, stalemated } = generateAllLegalMoves(
      board,
      king,
      nextTurn
    );
    const isFlipped = nextTurn === "black" && preventFlipping;
    if (debug) {
      redrawBoard(canvas, board, boardSize, tileSize, isFlipped);
      const { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(board, boardSize, king);
      colourThreatMap(ctx, tileSize, newThreatMapWhite, red, boardSize, isFlipped);
      colourThreatMap(ctx, tileSize, newThreatMapBlack, blue, boardSize, isFlipped);
    }
    setPlayerTurn(nextTurn);
    setAllLegalMoves(legalMovesByPosition);

    if (checked) {
      colourCheck(ctx, tileSize, king, boardSize, isFlipped);
      if (checkmated) {
        console.log(`${nextTurn} has been checkmated`);
      }
    } else if (stalemated) {
      console.log(`${nextTurn} has been stalemated`);
    }
  }, [board]);

  const selectPiece = (e, tileSize, board) => {
    const isFlipped = playerTurn === "black" && preventFlipping;
    const { row, col } = pointToCoordinate(canvasRef, e, tileSize, isFlipped);
    if (!isInBounds(row, col, boardSize)) return;

    const positionKey = generateThreatMapKey(row, col);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const piece = board[row][col];
    const pieceColour = piece.colour;
    const isOwnPiece = pieceColour === playerTurn;

    if (isOwnPiece) {
      const legalMoves = allLegalMoves[positionKey];
      setSelectedPiece(piece);
      setLegalMoves(allLegalMoves[positionKey]);
      redrawBoard(canvas, board, boardSize, tileSize, isFlipped);
      drawLegalMoves(legalMoves, tileSize, ctx, red, boardSize, isFlipped);
    } else if (selectedPiece) {
      let { newBoard, isPositionFound } = move(ctx, selectedPiece, { col, row }, board, legalMoves);
      if (isPositionFound) {
        setBoard(newBoard);
      }
    }
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
      <button
        className="flex items-center justify-center space-x-4 mb-12 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
        style={{ width: tileSize * boardSize + 40 }}
        onClick={() => navigate("/")}
      >
        <img src={whiteQueen} alt="White Queen" className="w-12 h-12" />
        <h1 className="text-4xl font-bold">NotChess.com</h1>
      </button>

      <div className="bg-gray-900">
        <canvas
          className="bg-transparent"
          ref={canvasRef}
          width={tileSize * boardSize}
          height={tileSize * boardSize}
          onMouseDown={(event) => selectPiece(event, tileSize, board)}
        ></canvas>
      </div>
    </div>
  );
}

export default App;
