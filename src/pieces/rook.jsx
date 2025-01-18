class Rook {

    constructor(color, position, context) {
      this.color = color; // 'white' or 'black'
      this.position = position; // e.g., { x: 0, y: 0 } (board coordinates)
      this.context = context; // Canvas 2D rendering context
      this.size = 40; // Size of the square
    }
  
    draw(tileSize) {
      const { x, y } = this.position;
  
      // Calculate pixel position based on board tile size
      const pixelX = x * tileSize + (tileSize - this.size) / 2;
      const pixelY = y * tileSize + (tileSize - this.size) / 2;
  
      // Draw a square representing the rook
      this.context.beginPath();
      this.context.fillStyle = this.color === 'white' ? '#FFFFFF' : '#000000'; // White or black rook
      this.context.fillRect(pixelX, pixelY, this.size, this.size);

      // Draw the outline
      this.context.lineWidth = 2;
      this.context.strokeStyle = this.color === 'white' ? '#000000' : '#FFFFFF'; // Black outline for white rook, white outline for black rook
      this.context.strokeRect(pixelX, pixelY, this.size, this.size);

      this.context.closePath();
    }
  
    // Method to move the rook
    move(newPosition) {
      this.position = newPosition; 
    }
  }
  
export default Rook;