/*
Contains functionality surrounding intiialising the game, moving pieces, 
as well as utility functions that are required to compute legal moves
*/

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

export function isInBounds(row, col, boardSize) {
  return row >= 0 && col >= 0 && row < boardSize && col < boardSize;
}

export function generateThreatMapKey(row, col) {
  return `${row}${col}`;
}

export function updateThreatMaps(newBoard, boardSize) {
  const newThreatMapBlack = {};
  const newThreatMapWhite = {};

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = newBoard[row][col];
      if (piece === 0) continue;

      const pieceColour = piece.colour;
      const colourThreatMap = pieceColour === "white" ? newThreatMapWhite : newThreatMapBlack;

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
        const { legalMoves, isProtecting } = piece.generateLegalMoves(newBoard);

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
  const board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(0));
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

  return { board, blackKing, whiteKing };
}

export function generateAllLegalMoves(board, king, playerTurn) {
  const legalMovesByPosition = {};
  let stalemated = true;
  let checked = isKingInCheck(king, board);
  for (const row of board) {
    for (const piece of row) {
      if (piece === 0 || piece.colour !== playerTurn) continue;

      const { x, y } = piece.position;
      const key = generateThreatMapKey(y, x);
      const { legalMoves: candidateMoves, _ } = piece.generateLegalMoves(board);
      const legalMoves = candidateMoves.filter((move) => {
        return !isPiecePinned(king, piece, board, y, x, move.row, move.col);
      });
      // King needs to have no moves and also be in check
      if (legalMoves.length > 0) {
        stalemated = false;
      }
      legalMovesByPosition[key] = legalMoves;
    }
  }

  const checkmated = checked && stalemated;

  return { legalMovesByPosition, checkmated, checked, stalemated };
}

export function isPiecePinned(king, curPiece, board, curRow, curCol, newRow, newCol) {
  // Update the pieces position and simulate board state after
  const newBoard = board.map((row) => [...row]);
  newBoard[curRow][curCol] = 0;
  newBoard[newRow][newCol] = curPiece;
  curPiece.position = { x: newCol, y: newRow };

  let kingInCheck = isKingInCheck(king, newBoard);
  curPiece.position = { x: curCol, y: curRow };
  return kingInCheck;
}

export function isKingInCheck(king, board) {
  for (const row of board) {
    for (const piece of row) {
      if (piece.colour === king.colour || piece === 0) continue;

      const { legalMoves, _ } = piece.generateLegalMoves(board);
      for (const { col, row } of legalMoves) {
        if (col == king.position.x && row == king.position.y) {
          return true;
        }
      }
    }
  }

  return false;
}

export function move(piece, newPosition, board, legalMoves) {
  // Cheeky bit of polymorphism
  const { col: targetCol, row: targetRow } = newPosition;
  const { x: currentCol, y: currentRow } = piece.position;

  if (!legalMoves.some((move) => move.col === targetCol && move.row === targetRow)) {
    return { newBoard: board, isPositionFound: false };
  }

  const newBoard = board.map((row) => [...row]);
  const boardSize = board.length;

  // Handle Pawn promotion
  if (piece instanceof Pawn) {
    const promotionAvailable = targetRow === 0 || targetRow === boardSize - 1;
    if (promotionAvailable) {
      piece = new Queen(piece.colour, { y: targetRow, x: targetCol }, piece.context);
    }
  }

  // For castling, move the rook to the correct square
  if (piece instanceof King) {
    if (targetCol - currentCol === 2) {
      const rook = newBoard[currentRow][boardSize - 1];
      newBoard[currentRow][boardSize - 1] = 0;
      rook.position = { x: targetCol - 1, y: currentRow };
      newBoard[currentRow][targetCol - 1] = rook;
    } else if (targetCol - currentCol === -2) {
      const rook = newBoard[currentRow][0];
      newBoard[currentRow][0] = 0;
      rook.position = { x: targetCol + 1, y: currentRow };
      newBoard[currentRow][targetCol + 1] = rook;
    }
  }

  newBoard[currentRow][currentCol] = 0;

  piece.position = { x: targetCol, y: targetRow };
  newBoard[targetRow][targetCol] = piece;
  piece.firstMove = false;

  return { newBoard, isPositionFound: true };
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
