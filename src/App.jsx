import React, { useEffect, useRef, useState } from "react";

import { updateThreatMaps, initialise } from "./utils/Engine";
import { redrawBoard, colourThreatMap } from "./utils/Render";

function App() {
  const canvasRef = useRef(null);
  const tileSize = 70;
  const boardSize = 8;
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

    let red = "rgba(255, 0, 0, 0.5)";
    let blue = "rgba(0, 50, 255, 0.5)";

    // Draw threatened tiles for White
    colourThreatMap(ctx, tileSize, threatMapWhite, red);
    colourThreatMap(ctx, tileSize, threatMapBlack, blue);
  }, [threatMapWhite, threatMapBlack, tileSize]);

  // Look into refactoring this to move into the engine file
  const pointToCoordinate = (e, tileSize, board) => {
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    const isInBounds =
      row >= 0 && row < board.length && col >= 0 && col < board[0].length;

    if (!isInBounds) {
      return;
    }

    const piece = board[row][col];
    const isOwnPiece = piece.color === playerTurn;
    const isEmptyTile = piece == 0;

    if (isOwnPiece) {
      setSelectedPiece(piece);

      let { legalMoves, _ } = piece.generateLegalMoves(board);
      setLegalMoves(legalMoves);
    } else if (selectedPiece && (isEmptyTile || !isOwnPiece)) {
      let newPos = { col, row };
      let { newBoard, isPositionFound } = selectedPiece.move(
        newPos,
        board,
        legalMoves
      );
      setLegalMoves([]);
      if (isPositionFound) {
        setPlayerTurn(playerTurn == "white" ? "black" : "white");
        setBoard(newBoard);
        let { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(
          newBoard,
          boardSize
        );
        setThreatMapWhite(newThreatMapWhite);
        setThreatMapBlack(newThreatMapBlack);
      }
      setSelectedPiece(undefined);
    }
  };

  return (
    <div
      onMouseDown={(event) => pointToCoordinate(event, tileSize, board)}
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
