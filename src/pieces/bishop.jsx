import SlidingPiece from "./slidingPiece";

class Bishop extends SlidingPiece {
  constructor(colour, position, ctx) {
    super(colour, position, ctx);
    this.directions = [
      [-1, -1], // Top-left
      [-1, 1], // Top-right
      [1, -1], // Bottom-left
      [1, 1], // Bottom-right
    ];
  }

  draw(tileSize, offset = 0) {
    const { x, y } = this.position;

    // Calculate the center of the tile
    const centerX = offset + x * tileSize + tileSize / 2;
    const centerY = offset + y * tileSize + tileSize / 2;

    // Calculate triangle points
    const halfSize = tileSize / 3.5;
    const topX = centerX;
    const topY = centerY - halfSize;
    const leftX = centerX - halfSize;
    const leftY = centerY + halfSize;
    const rightX = centerX + halfSize;
    const rightY = centerY + halfSize;

    // Draw the triangle (fill)
    this.ctx.fillStyle = this.colour;
    this.ctx.beginPath();
    this.ctx.moveTo(topX, topY); // Top point
    this.ctx.lineTo(leftX, leftY); // Bottom-left point
    this.ctx.lineTo(rightX, rightY); // Bottom-right point
    this.ctx.closePath();
    this.ctx.fill();

    // Add a border to the triangle
    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2; // Border thickness
    this.ctx.stroke();
  }
}

export default Bishop;
