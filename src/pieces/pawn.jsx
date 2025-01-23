import Queen from "./queen";

class Pawn {
  constructor(colour, position, context) {
    this.colour = colour; // 'white' or 'black'
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
    this.context.fillStyle = this.colour === "white" ? "#FFFFFF" : "#000000";
    this.context.fill();

    // Draw the outline
    this.context.lineWidth = 2;
    this.context.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.context.stroke();

    this.context.closePath();
  }

  generateLegalMoves(board, enteringFromIsKingInCheck = false) {
    const { x: currentCol, y: currentRow } = this.position;
    const direction = this.colour === "white" ? -1 : 1;
    const legalMoves = [];
    const isProtecting = [];

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
        if (occupant !== 0) {
          if (occupant.colour !== this.colour) {
            legalMoves.push({ row: oneStepRow, col: captureCol });
          } else {
            isProtecting.push({ row: oneStepRow, col: captureCol });
          }
        }
      }
    });

    return { legalMoves, isProtecting };
  }

  isOnBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
}

export default Pawn;
