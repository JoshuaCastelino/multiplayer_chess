import SlidingPiece from "./slidingPiece";

class King extends SlidingPiece {
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

    // Adjust size for the diamond (equal width and height)
    const halfSize = 22.5;

    // Calculate the diamond points (rotated square)
    const points = [
      { x: centerX, y: centerY - halfSize }, // Top
      { x: centerX + halfSize, y: centerY }, // Right
      { x: centerX, y: centerY + halfSize }, // Bottom
      { x: centerX - halfSize, y: centerY }, // Left
    ];

    // Draw the diamond
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y); // Start at the top
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y); // Connect to the next point
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Add a border
    this.ctx.strokeStyle = this.color === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}

export default King;
