import { isInBounds } from "../utils/Engine";
import { loadImage } from "../utils/Render";
import blackKnightSVG from "../assets/black_knight.svg";
import whiteKnightSVG from "../assets/white_knight.svg";

class Knight {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
    this.firstMove = true;
    this.directions = [
      [-2, -1], // Up-left
      [-2, 1], // Up-right
      [-1, -2], // Left-up
      [-1, 2], // Right-up
      [1, -2], // Left-down
      [1, 2], // Right-down
      [2, -1], // Down-left
      [2, 1], // Down-right
    ];
    const src = colour === "white" ? whiteKnightSVG : blackKnightSVG;
    this.imagePromise = loadImage(src);
  }

  async draw(tileSize, offset = 0) {
    const img = await this.imagePromise;
    const { x, y } = this.position;
    // Calculate the center of the tile
    const centerX = offset + x * tileSize + tileSize / 2;
    const centerY = offset + y * tileSize + tileSize / 2;
    // Scale the piece to e.g. 80% of tile size
    const pieceSize = tileSize * 0.8;
    // Draw image at the correct position
    this.ctx.drawImage(img, centerX - pieceSize / 2, centerY - pieceSize / 2, pieceSize, pieceSize);
  }

  generateLegalMoves(board) {
    const { x: curCol, y: curRow } = this.position;
    const boardSize = board.length;
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
