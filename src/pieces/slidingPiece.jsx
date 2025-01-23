class SlidingPiece {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
  }

  isOnBoard(col, row) {
    return (
      col >= 0 && col < 8 && row >= 0 && row < 8
    );
  }

  // Function to generate legal moves for the piece
  generateLegalMoves(board, enteringFromIsKingInCheck = false) {
    const { x: currentCol, y: currentRow } = this.position;
    const directions = this.directions;
    // The moves that the piece can take when it is its turn
    const legalMoves = [];
    // The positions occupied by pieces of the same colour that this piece protects
    const isProtecting = [];

    for (const [colOffset, rowOffset] of directions) {
      let col = currentCol + colOffset;
      let row = currentRow + rowOffset;
      let pathBlocked = false;
      let moveInBounds = this.isOnBoard(col, row);

      while (moveInBounds && !pathBlocked) {
        let position = {row, col}
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
        moveInBounds = this.isOnBoard(col, row);
      }
    }

    return { legalMoves, isProtecting };
  }

  // Function to move the piece if the target position is valid
  move(newPosition, board, legalMoves) {
    const { col: targetCol, row: targetRow } = newPosition;
    const { x: currentCol, y: currentRow } = this.position;

    let isPositionFound = false;

    isPositionFound = legalMoves.some(
      (move) => move.col === targetCol && move.row === targetRow
    );

    const newBoard = board.map((row) => [...row]);

    if (isPositionFound) {
      newBoard[currentRow][currentCol] = 0;
      newBoard[targetRow][targetCol] = this;
      this.position = { x: targetCol, y: targetRow };
    }

    return { newBoard, isPositionFound };
  }
}

export default SlidingPiece;
