import { isInBounds } from "../utils/Engine";

class Knight {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
    this.firstMove = true
    this.directions = [
      [-2, -1], // Up-left
      [-2, 1],  // Up-right
      [-1, -2], // Left-up
      [-1, 2],  // Right-up
      [1, -2],  // Left-down
      [1, 2],   // Right-down
      [2, -1],  // Down-left
      [2, 1],   // Down-right
    ];
    
  }

  draw(tileSize, offset = 0) {
    const { x, y } = this.position;
    const centerX = offset + x * tileSize + tileSize / 2;
    const centerY = offset + y * tileSize + tileSize / 2;

    const topWidth = tileSize / 2.5;
    const bottomWidth = tileSize / 1.5;
    const height = tileSize / 2;

    const topX1 = centerX - topWidth / 2;
    const topY = centerY - height / 2;
    const topX2 = centerX + topWidth / 2;

    const bottomX1 = centerX - bottomWidth / 2;
    const bottomY = centerY + height / 2;
    const bottomX2 = centerX + bottomWidth / 2;

    this.ctx.fillStyle = this.colour;
    this.ctx.beginPath();
    this.ctx.moveTo(topX1, topY);
    this.ctx.lineTo(topX2, topY);
    this.ctx.lineTo(bottomX2, bottomY);
    this.ctx.lineTo(bottomX1, bottomY);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  generateLegalMoves(board) {
    const { x: curCol, y: curRow } = this.position;
    const boardSize = board.length
    const legalMoves = [];
    const isProtecting = [];

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

    return { legalMoves, isProtecting };
  }
}

export default Knight;
