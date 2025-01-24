import { isInBounds } from "../utils/Engine";

class SlidingPiece {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
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
      const boardSize = board.length
      let moveInBounds = isInBounds(row, col, boardSize)

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
