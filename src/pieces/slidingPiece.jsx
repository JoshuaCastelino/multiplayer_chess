class SlidingPiece {
  constructor(color, position, ctx) {
    this.color = color;
    this.position = position;
    this.ctx = ctx;
    this.moveCount = 8;
  }

  checkBounds(colToCheck, rowToCheck) {
    return (
      colToCheck >= 0 && colToCheck < 8 && rowToCheck >= 0 && rowToCheck < 8
    );
  }

  move(newPosition, board) {
    const directions = this.directions;

    // Deep copy the board
    const newBoard = board.map((row) => [...row]);
    const validMoves = [];
    let isPositionFound = false;

    const currentRow = this.position.y;
    const currentCol = this.position.x;

    const targetCol = newPosition.col;
    const targetRow = newPosition.row;

    const didExceedMaxMoves =
      Math.abs(targetCol - currentCol) > this.moveCount &&
      Math.abs(targetRow - currentRow) > this.moveCount;

    if (didExceedMaxMoves) {
      return { newBoard, isPositionFound };
    }

    for (let [colOffset, rowOffset] of directions) {
      let colToCheck = currentCol + colOffset;
      let rowToCheck = currentRow + rowOffset;
      let isPathBlocked = false;

      while (this.checkBounds(colToCheck, rowToCheck) && !isPathBlocked) {
        if (board[rowToCheck][colToCheck] !== 0) {
          isPathBlocked = true;
        }

        validMoves.push({ col: colToCheck, row: rowToCheck });

        if (targetCol === colToCheck && targetRow === rowToCheck) {
          isPositionFound = true;
          newBoard[currentRow][currentCol] = 0;
          newBoard[targetRow][targetCol] = this;
          this.position = { x: targetCol, y: targetRow };
        }

        colToCheck += colOffset;
        rowToCheck += rowOffset;
      }
    }

    return { newBoard, isPositionFound };
  }
}

export default SlidingPiece;
