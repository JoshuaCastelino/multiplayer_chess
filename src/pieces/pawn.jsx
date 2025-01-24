import { isInBounds, isPiecePinned } from "../utils/Engine";
import Queen from "./queen";

class Pawn {
  constructor(colour, position, context) {
    this.colour = colour; // 'white' or 'black'
    this.position = position;
    this.context = context;
    this.firstMove = true;
  }

  draw(tileSize, offset = 0) {
    const { x, y } = this.position;

    const radius = 20;

    // Calculate pixel position based on board tile size
    const pixelX = offset + x * tileSize + tileSize / 2;
    const pixelY = offset + y * tileSize + tileSize / 2;

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

  generateLegalMoves(board) {
    const { x: curCol, y: curRow } = this.position;
    const direction = this.colour === "white" ? -1 : 1;
    const legalMoves = [];
    const isProtecting = [];
    const oneStepRow = curRow + direction;
    const oneStepInBounds = this.isOnBoard(oneStepRow, curCol);
    const oneStepTileIsEmpty = board[oneStepRow][curCol] === 0;
    const boardSize = 8

    if (oneStepInBounds && oneStepTileIsEmpty) {
      legalMoves.push({ row: oneStepRow, col: curCol });
      // Forward 2 steps (if empty and first move)
      if (this.firstMove) {
        const twoStepRow = curRow + 2 * direction;
        if (isInBounds(twoStepRow, curCol, boardSize) && board[twoStepRow][curCol] === 0) {
          legalMoves.push({ row: twoStepRow, col: curCol });
        }
      }
    }

    // Capture diagonals (left and right)
    [-1, 1].forEach((offset) => {
      const captureCol = curCol + offset;
      if (isInBounds(oneStepRow, captureCol, boardSize)) {
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
