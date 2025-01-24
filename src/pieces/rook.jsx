import SlidingPiece from "./slidingPiece";

class Rook extends SlidingPiece {
  constructor(colour, position, ctx) {
    super(colour, position, ctx);
    this.directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
    ];
  }

  draw(tileSize, offset = 0) {
    let size = 40;
    const { x, y } = this.position;

    // Add 'offset' to shift the piece if the board is drawn with a margin
    const pixelX = offset + x * tileSize + (tileSize - size) / 2;
    const pixelY = offset + y * tileSize + (tileSize - size) / 2;

    this.ctx.beginPath();
    this.ctx.fillStyle = this.colour === "white" ? "#FFFFFF" : "#000000";
    this.ctx.fillRect(pixelX, pixelY, size, size);

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.colour === "white" ? "#000000" : "#FFFFFF";
    this.ctx.strokeRect(pixelX, pixelY, size, size);

    this.ctx.closePath();
  }
}

export default Rook;
