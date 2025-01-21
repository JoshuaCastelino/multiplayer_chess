import React, { useEffect, useRef, useState } from "react";

import {
  updateThreatMaps,
  initialise,
  pointToCoordinate,
  isInBounds,
} from "./utils/Engine";
import { redrawBoard, colourThreatMap } from "./utils/Render";

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
  const [playerTurn, setPlayerTurn] = useState("white");
  const [legalMoves, setLegalMoves] = useState([]);

  // Called at first render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const { board, threatMapWhite, threatMapBlack } = initialise(
      ctx,
      boardSize
    );
    setBoard(board);
    setThreatMapWhite(threatMapWhite);
    setThreatMapBlack(threatMapBlack);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [board]);

  useEffect(() => {
    if (!canvasRef.current || !legalMoves) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Clear canvasRed overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawBoard(ctx, board, boardSize, tileSize);

    // Draw red transparent overlays for each legal move
    legalMoves.forEach(({ row, col }) => {
      const x = col * tileSize;
      const y = row * tileSize;

      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(x, y, tileSize, tileSize);
    });
  }, [selectedPiece, legalMoves]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear and redraw the board first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawBoard(ctx, board, boardSize, tileSize);

    // Draw threatened tiles for White
    colourThreatMap(ctx, tileSize, threatMapWhite, red);
    colourThreatMap(ctx, tileSize, threatMapBlack, blue);
  }, [threatMapWhite, threatMapBlack, tileSize]);


  const selectPiece = (e, tileSize, board) => {
    const { row, col } = pointToCoordinate(canvasRef, e, tileSize);
    if (!isInBounds(row, col, boardSize)) return;

    const piece = board[row][col];
    const isOwnPiece = piece.color === playerTurn;

    if (isOwnPiece) {
      setSelectedPiece(piece);
      let { legalMoves, _ } = piece.generateLegalMoves(board);
      setLegalMoves(legalMoves);

    } 
    else if (selectedPiece) {
      let newPos = { col, row };
      let { newBoard, isPositionFound } = selectedPiece.move(newPos, board, legalMoves);
      setLegalMoves([]);
      if (isPositionFound) {
        setBoard(newBoard);
        setPlayerTurn(playerTurn == "white" ? "black" : "white");
        const { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(newBoard,boardSize);
        setThreatMapWhite(newThreatMapWhite);
        setThreatMapBlack(newThreatMapBlack);
      }
      setSelectedPiece(undefined);
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
      <canvas
        ref={canvasRef}
        width={tileSize * boardSize}
        height={tileSize * boardSize}
        style={{ border: "1px solid black" }}
      ></canvas>
    </div>
  );
}

export default App;
