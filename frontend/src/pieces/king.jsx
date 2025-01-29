import { isInBounds } from "../utils/Engine";
import { loadImage } from "../utils/Render";
import blackKingSVG from "../assets/black_king.svg";
import whiteKingSVG from "../assets/white_king.svg";
import Rook from "./rook";

class King {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
    this.firstMove = true;
    this.directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
      [-1, -1], // Top-left
      [-1, 1], // Top-right
      [1, -1], // Bottom-left
      [1, 1], // Bottom-right
    ];

    const src = colour === "white" ? whiteKingSVG : blackKingSVG;
    this.imagePromise = loadImage(src);
    this.strRepresentation = "K"
  }

  checkCastle(board, kingRow, kingCol) {
    if (!this.firstMove) return false;

    function walk(board, row, col, direction) {
      const boardSize = board.length;
      while (isInBounds(row, col, boardSize)) {
        const curPiece = board[row][col];

        if (curPiece === 0) {
          col += direction;
          continue;
        }
        if (curPiece instanceof Rook && curPiece.firstMove) {
          return true;
        }
        break;
      }
      return false;
    }

    // Check towards the right (increasing x)
    const right = walk(board, kingRow, kingCol + 1, 1);
    // Check towards the left (decreasing x)
    const left = walk(board, kingRow, kingCol - 1, -1);

    return { left, right };
  }

  generateLegalMoves(board) {
    const { x: curCol, y: curRow } = this.position;
    const boardSize = board.length;
    const legalMoves = [];
    const isProtecting = [];
    const kingRow = this.position.y;
    const kingCol = this.position.x;

    for (const [colOffset, rowOffset] of this.directions) {
      let col = curCol + colOffset;
      let row = curRow + rowOffset;
      let position = { row, col };

      if (!isInBounds(row, col, boardSize)) {
        continue;
      }

      const pieceInTile = board[row][col];
      const tileIsEmpty = pieceInTile == 0;
      const tileOccupiedBySameColour = !tileIsEmpty && pieceInTile.colour == this.colour;

      if (!tileOccupiedBySameColour || tileIsEmpty) {
        legalMoves.push(position);
      } else {
        isProtecting.push(position);
      }
    }

    const { left, right } = this.checkCastle(board, kingRow, kingCol);
    if (left) {
      legalMoves.push({ row: kingRow, col: kingCol - 2 });
    }
    if (right) {
      legalMoves.push({ row: kingRow, col: kingCol + 2 });
    }
    return { legalMoves, isProtecting };
  }
}

export default King;
