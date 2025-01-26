import React, { useEffect, useRef, useState } from "react";

import {
  updateThreatMaps,
  initialise,
  isInBounds,
  move,
  generateAllLegalMoves,
  generateThreatMapKey,
} from "./utils/Engine";
import { redrawBoard, pointToCoordinate, drawLegalMoves, colourCheck } from "./utils/Render";
import King from "./pieces/king";

function App() {
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
    // const { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(board, boardSize, king);
    const { legalMovesByPosition, checkmated, checked, stalemated } = generateAllLegalMoves(
      board,
      king,
      nextTurn
    );

    redrawBoard(canvas, board, boardSize, tileSize);
    // colourThreatMap(ctx, tileSize, newThreatMapWhite, red);
    // colourThreatMap(ctx, tileSize, newThreatMapBlack, blue);
    setPlayerTurn(nextTurn);
    setAllLegalMoves(legalMovesByPosition);

    if (checked) {
      colourCheck(ctx, tileSize, king);
      if (checkmated) {
        console.log(`${nextTurn} has been checmkated, L + RATIO`);
      }
    } else if (stalemated) {
      console.log(`${nextTurn} has been checmkated, L + RATIO`);
    }
  }, [board]);

  const selectPiece = (e, tileSize, board) => {
    const { row, col } = pointToCoordinate(canvasRef, e, tileSize);
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
      setLegalMoves(legalMoves);
      redrawBoard(canvas, board, boardSize, tileSize);
      drawLegalMoves(legalMoves, tileSize, ctx, red);
    } else if (selectedPiece) {
      let { newBoard, isPositionFound } = move(selectedPiece, { col, row }, board, legalMoves);
      if (isPositionFound) {
        setBoard(newBoard);
      }
    }
  };

  return (
    <div style={{ background: "red" }}>
      <canvas
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        ref={canvasRef}
        width={tileSize * boardSize}
        height={tileSize * boardSize}
        onMouseDown={(event) => selectPiece(event, tileSize, board)}
      ></canvas>
    </div>
  );
}

export default App;
