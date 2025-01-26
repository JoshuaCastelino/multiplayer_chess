import { isInBounds } from "../utils/Engine";
import { loadImage } from "../utils/Render";
import blackPawnSVG from "../assets/black_pawn.svg";
import whitePawnSVG from "../assets/white_pawn.svg";

class Pawn {
  constructor(colour, position, ctx) {
    this.colour = colour; // 'white' or 'black'
    this.position = position;
    this.ctx = ctx;
    this.firstMove = true;
    const src = colour === "white" ? whitePawnSVG : blackPawnSVG;
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
    const direction = this.colour === "white" ? -1 : 1;
    const legalMoves = [];
    const isProtecting = [];
    const oneStepRow = curRow + direction;
    const oneStepInBounds = this.isOnBoard(oneStepRow, curCol);
    const oneStepTileIsEmpty = board[oneStepRow][curCol] === 0;
    const boardSize = 8;

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
