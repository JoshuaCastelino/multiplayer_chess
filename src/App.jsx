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
  const [threatMapBlack, setThreatMapBlack] = useState([])
  const [threatMapWhite, setThreatMapWhite] = useState([])

  const [selectedPiece, setSelectedPiece] = useState(undefined);
  const [playerTurn, setPlayerTurn] = useState("white");
  const [legalMoves, setLegalMoves] = useState([])
  // Called at first render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const { board, threatMapWhite, threatMapBlack } = initialise(ctx, tileSize, boardSize);
    setBoard(board);
    setThreatMapWhite(threatMapWhite)
    setThreatMapBlack(threatMapBlack)
  }, []);


  // Called when the board is updated
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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


  useEffect(() => {
    if (!canvasRef.current || !threatMapWhite || !threatMapBlack) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Clear canvasRed overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawBoard(ctx);


    for (let row = 0 ; row < threatMapWhite.length ; row ++){
      for (let col = 0 ; col < threatMapWhite.length ; col ++){
        const x = col * tileSize;
        const y = row * tileSize;
        if (threatMapWhite[row][col] === 1){
          ctx.fillStyle = "rgba(255, 0, 0, 0.25)"; 
          ctx.fillRect(x, y, tileSize, tileSize);
        }
        if (threatMapBlack[row][col] === 1){
          ctx.fillStyle = "rgba(0, 51, 255, 0.25)"; // Red with 50% transparency
          ctx.fillRect(x, y, tileSize, tileSize);
        }        
      }
    }

  }, [threatMapWhite]);



  function updateThreatMaps(newBoard){
    function isOnBoard(colToCheck, rowToCheck) {
      return colToCheck >= 0 && colToCheck < 8 && rowToCheck >= 0 && rowToCheck < 8;
    }
    const newThreatMapBlack = new Array(8).fill(null).map(() => new Array(8).fill(0));
    const newThreatMapWhite = new Array(8).fill(null).map(() => new Array(8).fill(0));

    for (let row = 0; row < boardSize; row ++){
      for (let col = 0; col < boardSize; col ++){
        let piece = newBoard[row][col]

        if (piece === 0) continue;
        let pieceColour = piece.color
        let colorThreatMap = pieceColour == "white" ? newThreatMapWhite : newThreatMapBlack
        
        if (piece instanceof Pawn){
          const direction = pieceColour === "white" ? -1 : 1;
          const oneStepRow = row + direction;

          [-1, 1].forEach((offset) => {
            const captureCol = col + offset;
            console.log({oneStepRow, captureCol})
            if (isOnBoard(oneStepRow, captureCol)) {
              colorThreatMap[oneStepRow][captureCol] = 1
            }
          });
        }
        else{
          let threatPositions = piece.generateLegalMoves(newBoard)
          for (let {row, col} of threatPositions){
            colorThreatMap[row][col] = 1
          }
        }
      }
    }
    console.log(newThreatMapBlack)
    return {newThreatMapWhite, newThreatMapBlack}
  }
  

  const pointToCoordinate = (e, tileSize, board) => {
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    const isInBounds = row >= 0 && row < board.length && col >= 0 && col < board[0].length;

    if (!isInBounds) {
      return;
    }

    const piece = board[row][col];
    const isOwnPiece = piece.color === playerTurn;
    const isEmptyTile = piece == 0;

    if (isOwnPiece) {
      setSelectedPiece(piece);
      setLegalMoves(piece.generateLegalMoves(board))

    } else if (selectedPiece && (isEmptyTile || !isOwnPiece)) {
      let newPos = { col, row }
      let { newBoard, isPositionFound } = selectedPiece.move(
        newPos,
        board,
        legalMoves
      );
      setLegalMoves([])
      if (isPositionFound) {
        setPlayerTurn(playerTurn == "white" ? "black" : "white")
        setBoard(newBoard);
        let {newThreatMapWhite, newThreatMapBlack} =  updateThreatMaps(newBoard)
        setThreatMapWhite(newThreatMapWhite)
        setThreatMapBlack(newThreatMapBlack)
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
  const board = new Array(8).fill(null).map(() => new Array(8).fill(0));
  const threatMapWhite = new Array(8).fill(null).map(() => new Array(8).fill(0));
  const threatMapBlack = new Array(8).fill(null).map(() => new Array(8).fill(0));

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

    threatMapBlack[2][i] = 1
    threatMapWhite[5][i] = 1

  }


  for (const { type, positions } of pieces) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const color = i % 2 === 0 ? "black" : "white";
      board[position.y][position.x] = new type(color, position, ctx);
    }
  }
  

  return {board, threatMapWhite, threatMapBlack};
}
