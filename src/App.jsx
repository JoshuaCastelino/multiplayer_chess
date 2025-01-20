import React, { useEffect, useRef, useState } from "react";
import Pawn from "./pieces/pawn";
import Rook from "./pieces/rook";
import Bishop from "./pieces/bishop";
import Queen from "./pieces/queen";
import King from "./pieces/king";
import Knight from "./pieces/knight";

function App() {
  const canvasRef = useRef(null);
  const tileSize = 70;
  const boardSize = 8;
  const [board, setBoard] = useState([]);

  const [selectedPiece, setSelectedPiece] = useState(undefined);
  const [playerTurn, setPlayerTurn] = useState("white");
  const [legalMoves, setLegalMoves] = useState([])
  // Called at first render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    let initialBoard = initialise(ctx, tileSize, boardSize);
    setBoard(initialBoard);
  }, []);


  // Called when the board is updated
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawBoard(ctx);
  }, [board]);

  // Called when a new piece is selected
  useEffect(() => {
    if (!canvasRef.current || !legalMoves) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Clear canvasRed overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawBoard(ctx);

    // Draw red transparent overlays for each legal move
    legalMoves.forEach(({ row, col }) => {
      const x = col * tileSize;
      const y = row * tileSize;
  
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red with 50% transparency
      ctx.fillRect(x, y, tileSize, tileSize);
    });
  }, [selectedPiece, legalMoves]);
  

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

    let piece = board[row][col];

    const isOwnPiece = piece.color == playerTurn;
    const isEmptyTile = piece == 0;

    if (isOwnPiece) {
      setSelectedPiece(piece);
      setLegalMoves(piece.generateLegalMoves(board))

    } else if (selectedPiece && (isEmptyTile || !isOwnPiece)) {
      let { newBoard, isPositionFound } = selectedPiece.move(
        { col, row },
        board,
        legalMoves
      );
      setLegalMoves([])
      if (isPositionFound) {
        // setPlayerTurn(playerTurn == "white" ? "black" : "white")
        setBoard(newBoard);
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
        width={tileSize * 8}
        height={tileSize * 8}
        style={{ border: "1px solid black" }}
      ></canvas>
    </div>
  );

  function redrawBoard(ctx) {
    drawBoard(boardSize, ctx, tileSize);
    for (let row of board) {
      for (let piece of row) {
        if (piece != 0) {
          piece.draw(tileSize);
        }
      }
    }
  }
}

export default App;

function drawBoard(boardSize, ctx, tileSize) {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const isDark = (row + col) % 2 === 1;
      ctx.fillStyle = isDark ? "#769656" : "#eeeed2"; // dark and light colors
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

function initialise(ctx, tileSize, boardSize) {
  const board = [];
  for (let i = 0; i < boardSize; i++) {
    const innerBoard = [];
    for (var j = 0; j < boardSize; j++) {
      innerBoard.push(0);
    }
    board.push(innerBoard);
  }

  drawBoard(boardSize, ctx, tileSize);

  const pieces = [
    {
      type: Rook,
      positions: [
        { x: 0, y: 0 },
        { x: 0, y: 7 },
        { x: 7, y: 0 },
        { x: 7, y: 7 },
      ],
    },
    {
      type: Knight,
      positions: [
        { x: 6, y: 0 },
        { x: 6, y: 7 },
        { x: 1, y: 0 },
        { x: 1, y: 7 },
      ],
    },
    {
      type: Bishop,
      positions: [
        { x: 2, y: 0 },
        { x: 2, y: 7 },
        { x: 5, y: 0 },
        { x: 5, y: 7 },
      ],
    },
    {
      type: Queen,
      positions: [
        { x: 3, y: 0 },
        { x: 3, y: 7 },
      ],
    },
    {
      type: King,
      positions: [
        { x: 4, y: 0 },
        { x: 4, y: 7 },
      ],
    },
  ];

  // Draw the pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = new Pawn("black", { x: i, y: 1 }, ctx);
    board[6][i] = new Pawn("white", { x: i, y: 6 }, ctx);
  }

  for (const { type, positions } of pieces) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const color = i % 2 === 0 ? "black" : "white";
      board[position.y][position.x] = new type(color, position, ctx);
    }
  }

  return board;
}
