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
    this.context.fillStyle = this.color === "white" ? "#FFFFFF" : "#000000"; 
    this.context.fill();

    // Draw the outline
    this.context.lineWidth = 2;
    this.context.strokeStyle = this.color === "white" ? "#000000" : "#FFFFFF"; 
    this.context.stroke();

    this.context.closePath();
  }

  move(newPosition, board, legalMoves) {
    const { col: targetCol, row: targetRow } = newPosition;
    const { x: currentCol, y: currentRow } = this.position;

    const newBoard = board.map((row) => [...row]);

    const isPositionFound = legalMoves.some(
      (m) => m.col === targetCol && m.row === targetRow
    );
    // Don't need to check colour, although this feels a little hacky, dont really want to add the additional condition
    const promotionAvailable = targetRow === 0 || targetRow === board.length - 1

    if (isPositionFound) {
      this.firstMove = false;
      let piece = this;
      if (promotionAvailable) {
        piece = new Queen(this.color, { y: targetRow, x: targetCol }, this.context);
      }

      newBoard[currentRow][currentCol] = 0;
      newBoard[targetRow][targetCol] = piece;
      this.position = { x: targetCol, y: targetRow };
    }

    return {
      newBoard, isPositionFound,
    };
  }

  generateLegalMoves(board) {
    const { x: currentCol, y: currentRow } = this.position;
    const direction = this.color === "white" ? -1 : 1;
    const legalMoves = [];
    const isProtecting = [];

    const oneStepRow = currentRow + direction;

    // Forward 1 step (if empty)
    if (this.isOnBoard(oneStepRow, currentCol) && board[oneStepRow][currentCol] === 0) {
      legalMoves.push({ row: oneStepRow, col: currentCol });
      // Forward 2 steps (if empty and first move)
      if (this.firstMove) {
        const twoStepRow = currentRow + 2 * direction;
        if (this.isOnBoard(twoStepRow, currentCol) && board[twoStepRow][currentCol] === 0
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
        if (occupant !== 0){
          if (occupant.color !== this.color){
            legalMoves.push({ row: oneStepRow, col: captureCol });

          }
          else{
            isProtecting.push({ row: oneStepRow, col: captureCol });
          }
        }
      }
    });

    return {legalMoves, isProtecting};
  }

  isOnBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

}

export default Pawn;
