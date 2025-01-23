import Pawn from "../pieces/pawn";
import Rook from "../pieces/rook";
import Bishop from "../pieces/bishop";
import Queen from "../pieces/queen";
import King from "../pieces/king";
import Knight from "../pieces/knight";

function addThreats(legalMoves, colourThreatMap, piece) {
  for (let { row: moveRow, col: moveCol } of legalMoves) {
    const key = `${moveRow}${moveCol}`;
    colourThreatMap[key] = colourThreatMap[key] || [];
    colourThreatMap[key].push(piece);
  }
}

// This function appears in different places with the exact same functionality,
// Look into centralising defintion
export function isInBounds(row, col, boardSize) {
  return row >= 0 && col >= 0 && row < boardSize && col < boardSize;
}

export function generateThreatMapKey(row, col) {
  return `${row}${col}`;
}

export function updateThreatMaps(newBoard, boardSize, king) {
  console.log(king);
  const newThreatMapBlack = {};
  const newThreatMapWhite = {};

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = newBoard[row][col];
      if (piece === 0) continue;

      const pieceColour = piece.colour;
      const colourThreatMap =
        pieceColour === "white" ? newThreatMapWhite : newThreatMapBlack;

      if (piece instanceof Pawn) {
        const direction = pieceColour === "white" ? -1 : 1;
        const oneStepRow = row + direction;

        [-1, 1].forEach((offset) => {
          const captureCol = col + offset;
          if (isInBounds(captureCol, oneStepRow, boardSize)) {
            const key = generateThreatMapKey(oneStepRow, captureCol);
            colourThreatMap[key] = colourThreatMap[key] || [];
            colourThreatMap[key].push(piece);
          }
        });
      } else {
        const { legalMoves, isProtecting } = piece.generateLegalMoves(
          newBoard,
          king
        );

        addThreats(legalMoves, colourThreatMap, piece);
        addThreats(isProtecting, colourThreatMap, piece);
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

  for (let i = 0; i < 8; i++) {
    board[1][i] = new Pawn("black", { x: i, y: 1 }, ctx);
    board[6][i] = new Pawn("white", { x: i, y: 6 }, ctx);
  }

  let blackKing = null;
  let whiteKing = null;

  for (const { type, positions } of pieces) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const isEven = i % 2 === 0;
      const colour = isEven ? "black" : "white";
      let newPiece = new type(colour, position, ctx);
      board[position.y][position.x] = newPiece;
      if (type == King) {
        if (isEven) {
          blackKing = newPiece;
        } else {
          whiteKing = newPiece;
        }
      }
    }
  }

  let { newThreatMapWhite: threatMapWhite, newThreatMapBlack: threatMapBlack } =
    updateThreatMaps(board, boardSize);

  return { board, threatMapWhite, threatMapBlack, blackKing, whiteKing };
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

export function move(piece, newPosition, board, legalMoves) {
  const { col: targetCol, row: targetRow } = newPosition;
  const { x: currentCol, y: currentRow } = piece.position;

  if (
    !legalMoves.some((move) => move.col === targetCol && move.row === targetRow)
  ) {
    return { newBoard: board, isPositionFound: false };
  }

  const newBoard = board.map((row) => [...row]);

  // 0 is a really shit way to store an empty state
  newBoard[currentRow][currentCol] = 0;

  if (piece instanceof Pawn) {
    const promotionAvailable =
      targetRow === 0 || targetRow === board.length - 1;
    piece.firstMove = false;

    if (promotionAvailable) {
      piece = new Queen(
        piece.colour,
        { y: targetRow, x: targetCol },
        piece.context
      );
    }
  }

  piece.position = { x: targetCol, y: targetRow };
  newBoard[targetRow][targetCol] = piece;

  return { newBoard, isPositionFound: true };
}

export function isKingInCheck(king, board) {
  for (const row of board) {
    for (const piece of row) {
      if (piece.colour === king.colour || piece === 0) continue;

      const { legalMoves, _ } = piece.generateLegalMoves(board, king, true);
      for (const { col, row } of legalMoves) {
        if (col == king.position.x && row == king.position.y) {
          console.log("king in check");
          return true;
        }
      }
    }
  }

  return false;
}

export function findKing(board, color) {
  for (const row of board) {
    for (const piece of row) {
      if (piece === 0) continue;

      if (piece.type === "King" && piece.colour === color) {
        return piece;
      }
    }
  }

  return null;
}
