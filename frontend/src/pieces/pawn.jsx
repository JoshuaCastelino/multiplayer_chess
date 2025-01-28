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

  generateLegalMoves(board) {
    const { x: curCol, y: curRow } = this.position;
    const boardSize = 8
    const direction = this.colour === "white" ? -1 : 1;
    const legalMoves = [];
    const isProtecting = [];
    const oneStepRow = curRow + direction;
    const oneStepInBounds = isInBounds(oneStepRow, curCol, boardSize);
    const oneStepTileIsEmpty = board[oneStepRow][curCol] === 0;

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
}

export default Pawn;
