import { generateThreatMapKey } from "../utils/Engine";
import { isKingInCheck } from "../utils/Engine";

class King {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
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

  draw(tileSize) {
    const { x, y } = this.position;

    // Calculate the center of the tile
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;

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

  isOnBoard(colToCheck, rowToCheck) {
    return (
      colToCheck >= 0 && colToCheck < 8 && rowToCheck >= 0 && rowToCheck < 8
    );
  }

  generateLegalMoves(board, king = null, enteringFromIsKingInCheck = false) {
    const { x: currentCol, y: currentRow } = this.position;
    const legalMoves = [];
    const isProtecting = [];

    for (let [colOffset, rowOffset] of this.directions) {
      let col = currentCol + colOffset;
      let row = currentRow + rowOffset;
      let position = { row, col };
      let key = generateThreatMapKey(row, col);
      const moveNotInBounds = !this.isOnBoard(col, row);

      if (moveNotInBounds) {
        continue;
      }

      const pieceInTile = board[row][col];
      const tileIsEmpty = pieceInTile == 0;
      const tileOccupiedBySameColour =
        !tileIsEmpty && pieceInTile.colour == this.colour;

      if (!tileOccupiedBySameColour || tileIsEmpty) {
        if (!enteringFromIsKingInCheck) {
          const newBoard = board.map((row) => [...row]);
          newBoard[currentRow][currentCol] = 0;
          newBoard[row][col] = this;
          this.position = { x: col, y: row };
          // Could use this here, but leaving king in for testing.
          let kingInCheck = isKingInCheck(king, newBoard);
          this.position = { x: currentCol, y: currentRow };
          if (!kingInCheck) {
            legalMoves.push(position);
          }
        } else {
          legalMoves.push(position);
        }
      } else {
        isProtecting.push(position);
      }
    }

    return { legalMoves, isProtecting };
  }
}

export default King;
