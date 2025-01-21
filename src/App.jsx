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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    // Clear and redraw the board first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawBoard(ctx);

    let red = "rgba(255, 0, 0, 0.5)"
    let blue = "rgba(0, 50, 255, 0.5)"

    function colourThreatMap(threatMap, colour) {
      Object.keys(threatMap).forEach((key) => {
        const threats = threatMap[key];
        if (threats && threats.length > 0) {
          const row = key[0]
          const col = key[1]
          const x = col * tileSize;
          const y = row * tileSize;
          ctx.fillStyle = colour;
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      });
    }
  
    // Draw threatened tiles for White
    colourThreatMap(threatMapWhite, red);
    colourThreatMap(threatMapBlack, blue)

  }, [threatMapWhite, threatMapBlack, tileSize]);
  


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

      let {legalMoves, _} = piece.generateLegalMoves(board)
      setLegalMoves(legalMoves)

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
        let {newThreatMapWhite, newThreatMapBlack} =  updateThreatMaps(newBoard, boardSize)
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
        width={tileSize * boardSize}
        height={tileSize * boardSize}
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
  const board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(0));

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
  
    
  let {newThreatMapWhite: threatMapWhite, newThreatMapBlack: threatMapBlack} =  updateThreatMaps(board, boardSize)

  return {board, threatMapWhite, threatMapBlack};
}

function updateThreatMaps(newBoard, boardSize) {
  function isOnBoard(colToCheck, rowToCheck) {
    return (
      colToCheck >= 0 &&
      colToCheck < boardSize &&
      rowToCheck >= 0 &&
      rowToCheck < boardSize
    );
  }

  // Use string keys (row,col) in place of 2D arrays
  const newThreatMapBlack = {};
  const newThreatMapWhite = {};

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = newBoard[row][col];
      if (piece === 0) continue;

      const pieceColour = piece.color;
      const colorThreatMap =
        pieceColour === "white" ? newThreatMapWhite : newThreatMapBlack;

      if (piece instanceof Pawn) {
        console.log("in here")
        const direction = pieceColour === "white" ? -1 : 1;
        const oneStepRow = row + direction;

        [-1, 1].forEach((offset) => {
          const captureCol = col + offset;
          if (isOnBoard(captureCol, oneStepRow)) {
            const key = `${oneStepRow}${captureCol}`;
            colorThreatMap[key] = colorThreatMap[key] || [];
            colorThreatMap[key].push(piece);
          }
        });
      } else {
        const { legalMoves, isProtecting } = piece.generateLegalMoves(newBoard);
        
        for (let { row: moveRow, col: moveCol } of legalMoves) {
          const key = `${moveRow}${moveCol}`;
          colorThreatMap[key] = colorThreatMap[key] || [];
          colorThreatMap[key].push(piece);
        }

        for (let { row: protectRow, col: protectCol } of isProtecting) {
          const key = `${protectRow}${protectCol}`;
          colorThreatMap[key] = colorThreatMap[key] || [];
          colorThreatMap[key].push(piece);
        }
      }
    }
  }

  return {
    newThreatMapWhite,
    newThreatMapBlack,
  };
}
