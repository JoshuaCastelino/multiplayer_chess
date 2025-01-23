import { generateThreatMapKey } from "../utils/Engine";
import SlidingPiece from "./slidingPiece";

class King {
  constructor(colour, position, ctx) {
    this.colour = colour;
    this.position = position;
    this.ctx = ctx;
    this.directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
      [-1, -1], // Top-left
      [-1, 1], // Top-right
      [1, -1], // Bottom-left
      [1, 1], // Bottom-right
    ];
  }

  draw(tileSize) {
    const { x, y } = this.position;

    // Calculate the center of the tile
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;

    // Adjust size for the diamond
    const halfSize = 22.5;

    // Calculate the diamond points
    const points = [
      { x: centerX, y: centerY - halfSize }, // Top
      { x: centerX + halfSize, y: centerY }, // Right
      { x: centerX, y: centerY + halfSize }, // Bottom
      { x: centerX - halfSize, y: centerY }, // Left
    ];

    // Draw the diamond
    this.ctx.fillStyle = this.colour;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y); // Start at the top
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y); // Connect to the next point
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Add a border
    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  isOnBoard(colToCheck, rowToCheck) {
    return (
      colToCheck >= 0 && colToCheck < 8 && rowToCheck >= 0 && rowToCheck < 8
    );
  }

  generateLegalMoves(board, threatMap) {
    const { x: currentCol, y: currentRow } = this.position;
    const directions = this.directions;
    const legalMoves = [];
    const isProtecting = [];

    for (let [colOffset, rowOffset] of directions) {
      let colToCheck = currentCol + colOffset;
      let rowToCheck = currentRow + rowOffset;
      let key = generateThreatMapKey(rowToCheck, colToCheck);
      const moveNotInBounds = !this.isOnBoard(colToCheck, rowToCheck);

      if (moveNotInBounds) {
        continue;
      }

      // This is pretty fucking horrendous
      if (threatMap && key in threatMap) {
        continue;
      }

      const pieceInTile = board[rowToCheck][colToCheck];
      const tileIsEmpty = pieceInTile == 0;
      const tileOccupiedBySameColour =
        !tileIsEmpty && pieceInTile.colour == this.colour;

      if (!tileOccupiedBySameColour || tileIsEmpty) {
        legalMoves.push({ col: colToCheck, row: rowToCheck });
      } else {
        isProtecting.push({ col: colToCheck, row: rowToCheck });
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

export default King;
