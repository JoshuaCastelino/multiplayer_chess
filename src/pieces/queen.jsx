import SlidingPiece from "./slidingPiece";

class Queen extends SlidingPiece {
  constructor(colour, position, ctx) {
    super(colour, position, ctx);
    this.directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
      [-1, -1], // Bottom-left corner
      [1, -1], // Bottom-right corner
      [-1, 1], // Top-left corner
      [1, 1], // Top-right corner
    ];
  }

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
    this.ctx.fillStyle = this.colour;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Add a border
    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}

export default Queen;
