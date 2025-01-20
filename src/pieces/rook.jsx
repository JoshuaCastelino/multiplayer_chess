import SlidingPiece from "./slidingPiece";

class Rook extends SlidingPiece {
  constructor(color, position, ctx) {
    super(color, position, ctx);
    this.directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
    ];
  }

  draw(tileSize) {
    let size = 40;
    const { x, y } = this.position;

    // Calculate pixel position based on board tile size
    const pixelX = x * tileSize + (tileSize - size) / 2;
    const pixelY = y * tileSize + (tileSize - size) / 2;

    // Draw a square representing the rook
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color === "white" ? "#FFFFFF" : "#000000"; // White or black rook
    this.ctx.fillRect(pixelX, pixelY, size, size);

    // Draw the outline
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.color === "white" ? "#000000" : "#FFFFFF"; // Black outline for white rook, white outline for black rook
    this.ctx.strokeRect(pixelX, pixelY, size, size);

    this.ctx.closePath();
  }
}

export default Rook;
