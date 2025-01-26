/*
Parent class which the Bishop, Queen and Rook inherit from. 
Previously the king also inherited from this class, however, this led to too much abstraction.
*/

import { isInBounds } from "../utils/Engine";

class SlidingPiece {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
    this.firstMove = true;
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
    const { x: currentCol, y: currentRow } = this.position;
    const directions = this.directions;
    const legalMoves = [];
    const isProtecting = [];

    for (const [colOffset, rowOffset] of directions) {
      let col = currentCol + colOffset;
      let row = currentRow + rowOffset;
      let pathBlocked = false;
      const boardSize = board.length;
      let moveInBounds = isInBounds(row, col, boardSize);

      while (moveInBounds && !pathBlocked) {
        let position = { row, col };
        let pieceInTile = board[row][col];
        let tileIsNotEmpty = pieceInTile !== 0;
        if (tileIsNotEmpty) {
          pathBlocked = true;
          if (pieceInTile.colour == this.colour) {
            isProtecting.push(position);
            break;
          }
        }

        legalMoves.push(position);

        col += colOffset;
        row += rowOffset;
        moveInBounds = isInBounds(row, col, boardSize);
      }
    }

    return { legalMoves, isProtecting };
  }
}

export default SlidingPiece;
