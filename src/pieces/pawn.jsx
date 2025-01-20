import Queen from "./queen";

class Pawn {
  constructor(color, position, context) {
    this.color = color; // 'white' or 'black'
    this.position = position;
    this.context = context;
    this.firstMove = true;
  }

  draw(tileSize) {
    const { x, y } = this.position;

    const radius = 20;

    // Calculate pixel position based on board tile size
    const pixelX = x * tileSize + tileSize / 2;
    const pixelY = y * tileSize + tileSize / 2;

    // Draw a circle representing the pawn
    this.context.beginPath();
    this.context.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
    this.context.fillStyle = this.color === "white" ? "#FFFFFF" : "#000000"; // White or black pawn
    this.context.fill();

    // Draw the outline
    this.context.lineWidth = 2;
    this.context.strokeStyle = this.color === "white" ? "#000000" : "#FFFFFF"; // Black outline for white pawn, white outline for black pawn
    this.context.stroke();

    this.context.closePath();
  }

  move(newPosition, board) {
    const { col: targetCol, row: targetRow } = newPosition;
    const newBoard = board.map((row) => [...row]);

    const isMoveLegal = legalMoves.some(
      (m) => m.col === targetCol && m.row === targetRow
    );

    if (isMoveLegal) {
      this.firstMove = false;

      const promotionAvailable =
        (this.color === "white" && targetRow === 0) ||
        (this.color === "black" && targetRow === board.length - 1);

      this.updatePositions(
        newBoard,
        this.position.y,
        this.position.x,
        targetRow,
        targetCol,
        promotionAvailable
      );

      return {
        newBoard,
        isPositionFound: true,
        legalMoves,
      };
    }

    return {
      newBoard,
      isPositionFound: false,
      legalMoves,
    };
  }

  generateLegalMoves(board) {
    const { x: currentCol, y: currentRow } = this.position;
    const direction = this.color === "white" ? -1 : 1;
    const legalMoves = [];

    const oneStepRow = currentRow + direction;

    // Forward 1 step (if empty)
    if (
      this.isOnBoard(oneStepRow, currentCol) &&
      board[oneStepRow][currentCol] === 0
    ) {
      legalMoves.push({ row: oneStepRow, col: currentCol });

      // Forward 2 steps (if empty and first move)
      if (this.firstMove) {
        const twoStepRow = currentRow + 2 * direction;
        if (
          this.isOnBoard(twoStepRow, currentCol) &&
          board[twoStepRow][currentCol] === 0
        ) {
          legalMoves.push({ row: twoStepRow, col: currentCol });
        }
      }
    }

    // Capture diagonals (left and right)
    [-1, 1].forEach((offset) => {
      const captureCol = currentCol + offset;
      if (this.isOnBoard(oneStepRow, captureCol)) {
        const occupant = board[oneStepRow][captureCol];
        if (occupant !== 0 && occupant.color !== this.color) {
          legalMoves.push({ row: oneStepRow, col: captureCol });
        }
      }
    });

    return legalMoves;
  }

  isOnBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  updatePositions(
    newBoard,
    oldRow,
    oldCol,
    newRow,
    newCol,
    promotionAvailable
  ) {
    let piece = this;
    if (promotionAvailable) {
      piece = new Queen(this.color, { y: newRow, x: newCol }, this.context);
    }
    newBoard[oldRow][oldCol] = 0;
    newBoard[newRow][newCol] = piece;
    this.position = { x: newCol, y: newRow };
  }
}

export default Pawn;
