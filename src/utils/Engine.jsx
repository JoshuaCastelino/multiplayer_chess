import Pawn from "../pieces/pawn";
import Rook from "../pieces/rook";
import Bishop from "../pieces/bishop";
import Queen from "../pieces/queen";
import King from "../pieces/king";
import Knight from "../pieces/knight";

function addThreats(legalMoves, colorThreatMap, piece) {
  for (let { row: moveRow, col: moveCol } of legalMoves) {
    const key = `${moveRow}${moveCol}`;
    colorThreatMap[key] = colorThreatMap[key] || [];
    colorThreatMap[key].push(piece);
  }
}

// This function appears in different places with the exact same functionality,
// Look into centralising defintion
export function isInBounds(row, col, boardSize) {
  return row >= 0 && col >= 0 && row < boardSize && col < boardSize;
}

export function updateThreatMaps(newBoard, boardSize) {
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
        const direction = pieceColour === "white" ? -1 : 1;
        const oneStepRow = row + direction;

        [-1, 1].forEach((offset) => {
          const captureCol = col + offset;
          if (isInBounds(captureCol, oneStepRow, boardSize)) {
            const key = `${oneStepRow}${captureCol}`;
            colorThreatMap[key] = colorThreatMap[key] || [];
            colorThreatMap[key].push(piece);
          }
        });
      } else {
        const { legalMoves, isProtecting } = piece.generateLegalMoves(newBoard);

        addThreats(legalMoves, colorThreatMap, piece);
        addThreats(isProtecting, colorThreatMap, piece);
      }
    }
  }

  return {
    newThreatMapWhite,
    newThreatMapBlack,
  };
}

export function initialise(ctx, boardSize) {
  const board = new Array(boardSize)
    .fill(null)
    .map(() => new Array(boardSize).fill(0));
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

  let { newThreatMapWhite: threatMapWhite, newThreatMapBlack: threatMapBlack } =
    updateThreatMaps(board, boardSize);

  return { board, threatMapWhite, threatMapBlack };
}

export function pointToCoordinate(canvasRef, e, tileSize) {
  const canvas = canvasRef.current;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / tileSize);
  const row = Math.floor(y / tileSize);
  return { row, col };
}
