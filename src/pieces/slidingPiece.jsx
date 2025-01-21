class SlidingPiece {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
  }

  isOnBoard(colToCheck, rowToCheck) {
    return (
      colToCheck >= 0 && colToCheck < 8 && rowToCheck >= 0 && rowToCheck < 8
    );
  }

  // Function to generate legal moves for the piece
  generateLegalMoves(board) {
    const { x: currentCol, y: currentRow } = this.position;
    const directions = this.directions;
    // The moves that the piece can take when it is its turn
    const legalMoves = [];
    // The positions occupied by pieces of the same colour that this piece protects
    const isProtecting = [];

    for (let [colOffset, rowOffset] of directions) {
      let colToCheck = currentCol + colOffset;
      let rowToCheck = currentRow + rowOffset;
      let pathBlocked = false;
      let moveInBounds = this.isOnBoard(colToCheck, rowToCheck);

      while (moveInBounds && !pathBlocked) {
        let pieceInTile = board[rowToCheck][colToCheck];
        let tileIsNotEmpty = pieceInTile !== 0;
        if (tileIsNotEmpty) {
          pathBlocked = true;
          if (pieceInTile.colour == this.colour) {
            isProtecting.push({ col: colToCheck, row: rowToCheck });
            break;
          }
        }

        legalMoves.push({ col: colToCheck, row: rowToCheck });

        colToCheck += colOffset;
        rowToCheck += rowOffset;
        moveInBounds = this.isOnBoard(colToCheck, rowToCheck);
      }
    }

    return { legalMoves, isProtecting };
  }

  // Function to move the piece if the target position is valid
  move(newPosition, board, legalMoves) {
    const { col: targetCol, row: targetRow } = newPosition;
    const { x: currentCol, y: currentRow } = this.position;

    const newBoard = board.map((row) => [...row]);

    let isPositionFound = false;

    isPositionFound = legalMoves.some(
      (move) => move.col === targetCol && move.row === targetRow
    );

    if (isPositionFound) {
      newBoard[currentRow][currentCol] = 0;
      newBoard[targetRow][targetCol] = this;
      this.position = { x: targetCol, y: targetRow };
    }

    return { newBoard, isPositionFound };
  }
}

export default SlidingPiece;
