import React, { useEffect, useRef, useState } from "react";

import {
  updateThreatMaps,
  initialise,
  pointToCoordinate,
  isInBounds,
  move
} from "./utils/Engine";
import {
  redrawBoard,
  colourThreatMap,
  drawLegalMoves,
  colourCheck,
} from "./utils/Render";
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
    const { board, threatMapWhite, threatMapBlack, blackKing, whiteKing } =
      initialise(ctx, boardSize);
    setBoard(board);
    setThreatMapWhite(threatMapWhite);
    setThreatMapBlack(threatMapBlack);
    // In an ideal world I would store this in an enum, causing me so much pain to keep using strings
    setKings({ white: whiteKing, black: blackKing });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!board.length || !canvas) return;

    const ctx = canvas.getContext("2d");
    const { newThreatMapWhite, newThreatMapBlack } = updateThreatMaps(
      board,
      boardSize
    );

    setThreatMapWhite(newThreatMapWhite);
    setThreatMapBlack(newThreatMapBlack);

    redrawBoard(canvas, board, boardSize, tileSize);
    colourThreatMap(ctx, tileSize, newThreatMapWhite, red);
    colourThreatMap(ctx, tileSize, newThreatMapBlack, blue);

    const nextTurn = playerTurn == "white" ? "black" : "white";
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

    if (isOwnPiece) {
      setSelectedPiece(piece);
      let { legalMoves, _ } = piece.generateLegalMoves(board);
      setLegalMoves(legalMoves);
      redrawBoard(canvas, board, boardSize, tileSize);
      drawLegalMoves(legalMoves, tileSize, ctx, red);
    } else if (selectedPiece) {

      let newPos = { col, row };
      let { newBoard, isPositionFound } = move(
        selectedPiece,
        newPos,
        board,
        legalMoves
      );
      if (isPositionFound) {
        if (selectedPiece instanceof King){
          setKings(prev => ({
            ...prev,
            pieceColour: selectedPiece,
          }));        }
        setBoard(newBoard);
        setLegalMoves([]);
        setSelectedPiece(undefined);
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
