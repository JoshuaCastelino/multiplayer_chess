import { isInBounds } from "../utils/Engine";
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
  }

  draw(tileSize, offset = 0) {
    const { x, y } = this.position;

    // Calculate the center of the tile
    const centerX = offset + x * tileSize + tileSize / 2;
    const centerY = offset + y * tileSize + tileSize / 2;

    // Adjust size for the diamond
    const halfSize = 22.5;

    // Calculate the diamond points
    const points = [
      { x: centerX, y: centerY - halfSize }, // Top
      { x: centerX + halfSize, y: centerY }, // Right
      { x: centerX, y: centerY + halfSize }, // Bottom
      { x: centerX - halfSize, y: centerY }, // Left
    ];

    // Draw the diamond
    this.ctx.fillStyle = this.colour;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y); // Start at the top
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y); // Connect to the next point
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Add a border
    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
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
    if (right){
      legalMoves.push({ row: kingRow, col: kingCol + 2 })
    }
    return { legalMoves, isProtecting };
  }
}

export default King;
