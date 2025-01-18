import SlidingPiece from "./slidingPiece";

class Queen extends SlidingPiece {
  //   constructor(color, position, ctx) {
  //     this.color = color; // 'white' or 'black'
  //     this.position = position; // { x, y }
  //     this.ctx = ctx; // Canvas rendering context
  //   }

  draw(tileSize) {
    const { x, y } = this.position;

    // Calculate the center of the tile
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;

    // Radius of the hexagon
    const radius = tileSize * 0.3;

    // Calculate the coordinates of the hexagon
    const angleStep = (2 * Math.PI) / 6; // 360° divided by 6
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = angleStep * i;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    // Draw the hexagon
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Add a border
    this.ctx.strokeStyle = this.color === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  move(newPosition, board) {
    const directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
      [-1, -1], // Bottom-left corner
      [1, -1], // Bottom-right corner
      [-1, 1], // Top-left corner
      [1, 1], // Top-right corner
    ];

    // Deep copy the board
    const newBoard = board.map((row) => [...row]);
    const validMoves = [];
    let isPositionFound = false;

    const currentRow = this.position.y;
    const currentCol = this.position.x;

    const targetCol = newPosition.col;
    const targetRow = newPosition.row;

    for (let [colOffset, rowOffset] of directions) {
      let colToCheck = currentCol + colOffset;
      let rowToCheck = currentRow + rowOffset;
      let isPathBlocked = false;

      while (
        colToCheck >= 0 &&
        colToCheck < 8 &&
        rowToCheck >= 0 &&
        rowToCheck < 8 &&
        !isPathBlocked
      ) {
        if (board[rowToCheck][colToCheck] !== 0) {
          isPathBlocked = true;
        }

        validMoves.push({ col: colToCheck, row: rowToCheck });

        if (targetCol === colToCheck && targetRow === rowToCheck) {
          isPositionFound = true;
          newBoard[currentRow][currentCol] = 0; // Clear current position
          newBoard[targetRow][targetCol] = this; // Move to new position
          this.position = { x: targetCol, y: targetRow }; // Update piece's position
        }

        colToCheck += colOffset;
        rowToCheck += rowOffset;
      }
    }

    console.log(isPositionFound);
    return { newBoard, isPositionFound };
  }
}

export default Queen;
