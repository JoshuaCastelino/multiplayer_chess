import SlidingPiece from "./slidingPiece";

class Rook extends SlidingPiece {
  // constructor(color, position, context) {
  //   this.color = color; // 'white' or 'black'
  //   this.position = position; // e.g., { x: 0, y: 0 } (board coordinates)
  //   this.context = context; // Canvas 2D rendering context
  // }

  draw(tileSize) {
    let size = 40;
    const { x, y } = this.position;

    // Calculate pixel position based on board tile size
    const pixelX = x * tileSize + (tileSize - size) / 2;
    const pixelY = y * tileSize + (tileSize - size) / 2;

    // Draw a square representing the rook
    this.context.beginPath();
    this.context.fillStyle = this.color === "white" ? "#FFFFFF" : "#000000"; // White or black rook
    this.context.fillRect(pixelX, pixelY, size, size);

    // Draw the outline
    this.context.lineWidth = 2;
    this.context.strokeStyle = this.color === "white" ? "#000000" : "#FFFFFF"; // Black outline for white rook, white outline for black rook
    this.context.strokeRect(pixelX, pixelY, size, size);

    this.context.closePath();
  }

  // Method to move the rook
  move(newPosition) {
    this.position = newPosition;
  }
}

export default Rook;
