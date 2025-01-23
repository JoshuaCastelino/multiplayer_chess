import React, { useEffect, useRef, useState } from "react";

import { updateThreatMaps, initialise, pointToCoordinate, isInBounds, move, isPiecePinned } from "./utils/Engine";
import { redrawBoard, colourThreatMap, drawLegalMoves, colourCheck } from "./utils/Render";
import King from "./pieces/king";

function App() {
  const canvasRef = useRef(null);
  const tileSize = 70;
  const boardSize = 8;
  const red = "rgba(255, 0, 0, 0.5)";
  const blue = "rgba(0, 50, 255, 0.5)";

  const [board, setBoard] = useState([]);
  const [threatMapBlack, setThreatMapBlack] = useState([]);
  const [threatMapWhite, setThreatMapWhite] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(undefined);
  const [playerTurn, setPlayerTurn] = useState("black");
  const [legalMoves, setLegalMoves] = useState([]);
  const [kings, setKings] = useState({ white: null, black: null });

  // Called at first render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { board, threatMapWhite, threatMapBlack, blackKing, whiteKing } = initialise(ctx, boardSize);
    setBoard(board);
    setThreatMapWhite(threatMapWhite);
    setThreatMapBlack(threatMapBlack);
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
    const { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(board, boardSize, king);

    setThreatMapWhite(newThreatMapWhite);
    setThreatMapBlack(newThreatMapBlack);

    redrawBoard(canvas, board, boardSize, tileSize);
    colourThreatMap(ctx, tileSize, newThreatMapWhite, red);
    colourThreatMap(ctx, tileSize, newThreatMapBlack, blue);

    setPlayerTurn(nextTurn);
  }, [board]);

  const selectPiece = (e, tileSize, board) => {
    const { row, col } = pointToCoordinate(canvasRef, e, tileSize);
    if (!isInBounds(row, col, boardSize)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const piece = board[row][col];
    const pieceColour = piece.colour;
    const isOwnPiece = pieceColour === playerTurn;
    const king = kings[playerTurn];
    if (isOwnPiece) {
      setSelectedPiece(piece);
      let { legalMoves: candidateMoves, isProtecting } = piece.generateLegalMoves(board);
      const legalMoves = candidateMoves.filter((move) => {
        return !isPiecePinned(king, piece, board, piece.position.y, piece.position.x, move.row, move.col);
      });
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
    <div
      onMouseDown={(event) => selectPiece(event, tileSize, board)}
      style={{
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <canvas ref={canvasRef} width={tileSize * boardSize} height={tileSize * boardSize} style={{ border: "1px solid black" }}></canvas>
    </div>
  );
}

export default App;
