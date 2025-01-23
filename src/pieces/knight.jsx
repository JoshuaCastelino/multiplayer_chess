import { isInBounds } from "../utils/Engine";

class Knight {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
  }

  draw(tileSize) {
    const { x, y } = this.position;
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;

    const topWidth = tileSize / 2.5;
    const bottomWidth = tileSize / 1.5;
    const height = tileSize / 2;

    const topX1 = centerX - topWidth / 2;
    const topY = centerY - height / 2;
    const topX2 = centerX + topWidth / 2;

    const bottomX1 = centerX - bottomWidth / 2;
    const bottomY = centerY + height / 2;
    const bottomX2 = centerX + bottomWidth / 2;

    this.ctx.fillStyle = this.colour;
    this.ctx.beginPath();
    this.ctx.moveTo(topX1, topY);
    this.ctx.lineTo(topX2, topY);
    this.ctx.lineTo(bottomX2, bottomY);
    this.ctx.lineTo(bottomX1, bottomY);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  generateLegalMoves(board, threatMap) {
    const { x: currentCol, y: currentRow } = this.position;
    const boardSize = board.length;

    const potentialMoves = [
      { row: currentRow - 2, col: currentCol - 1 },
      { row: currentRow - 2, col: currentCol + 1 },
      { row: currentRow - 1, col: currentCol - 2 },
      { row: currentRow - 1, col: currentCol + 2 },
      { row: currentRow + 1, col: currentCol - 2 },
      { row: currentRow + 1, col: currentCol + 2 },
      { row: currentRow + 2, col: currentCol - 1 },
      { row: currentRow + 2, col: currentCol + 1 },
    ];

    const legalMoves = [];
    const isProtecting = [];
    for (const move of potentialMoves) {
      const { row, col } = move;
      if (isInBounds(row, col, boardSize)) {
        const occupant = board[row][col];
        if (occupant === 0 || occupant.colour !== this.colour) {
          legalMoves.push({ row, col });
        } else {
          isProtecting.push({ row, col });
        }
      }
    }

    return { legalMoves, isProtecting };
  }

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

export default Knight;
