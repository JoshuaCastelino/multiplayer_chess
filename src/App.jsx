import React, { useEffect, useRef, useState } from "react";

import {
  updateThreatMaps,
  initialise,
  pointToCoordinate,
  isInBounds,
} from "./utils/Engine";
import { redrawBoard, colourThreatMap, drawLegalMoves } from "./utils/Render";

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
    redrawBoard(canvas, board, boardSize, tileSize);
    colourThreatMap(ctx, tileSize, threatMapWhite, red);
    colourThreatMap(ctx, tileSize, threatMapBlack, blue);
  }, [threatMapWhite, threatMapBlack, tileSize]);

  const selectPiece = (e, tileSize, board) => {
    const { row, col } = pointToCoordinate(canvasRef, e, tileSize);
    if (!isInBounds(row, col, boardSize)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const piece = board[row][col];

    const pieceColour = piece.colour;
    const isOwnPiece = pieceColour === playerTurn;
    const threatMap = pieceColour === "white" ? threatMapBlack : threatMapWhite;

    if (isOwnPiece) {
      setSelectedPiece(piece);
      // This is some funky JS sheizer, passing a param which most functions don't even take, brilliant!
      let { legalMoves, _ } = piece.generateLegalMoves(board, threatMap);
      setLegalMoves(legalMoves);
      redrawBoard(canvas, board, boardSize, tileSize);
      drawLegalMoves(legalMoves, tileSize, ctx, red);
    } else if (selectedPiece) {
      let newPos = { col, row };
      let { newBoard, isPositionFound } = selectedPiece.move(
        newPos,
        board,
        legalMoves
      );
      setLegalMoves([]);
      if (isPositionFound) {
        setBoard(newBoard);
        setPlayerTurn(playerTurn == "white" ? "black" : "white");
        const { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(
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
