import Queen from "./queen";

class Pawn {

    constructor(color, position, context) {
      this.color = color; // 'white' or 'black'
      this.position = position; 
      this.context = context; 
      this.radius = 20; 
      this.firstMove = true
    }
  
    draw(tileSize) {
      const { x, y } = this.position;
  
      // Calculate pixel position based on board tile size
      const pixelX = x * tileSize + tileSize / 2;
      const pixelY = y * tileSize + tileSize / 2;
  
      // Draw a circle representing the pawn
      this.context.beginPath();
      this.context.arc(pixelX, pixelY, this.radius, 0, Math.PI * 2);
      this.context.fillStyle = this.color === 'white' ? '#FFFFFF' : '#000000'; // White or black pawn
      this.context.fill();

      // Draw the outline
      this.context.lineWidth = 2;
      this.context.strokeStyle = this.color === 'white' ? '#000000' : '#FFFFFF'; // Black outline for white pawn, white outline for black pawn
      this.context.stroke();

      this.context.closePath();
    }
  
    // Method to move the pawn
    move(newPosition, board) {
      const direction = this.color == 'white' ? -1 : 1
      const maxVerticalMovement = this.firstMove == true ? 2 : 1
      const { x: currentCol, y: currentRow } = this.position;

      const newRow = newPosition.row
      const newCol = newPosition.col
      
      const rowDiff = newRow - currentRow
      const colDiff = newCol - currentCol

      const pieceAtNewPosition = board[newRow][newCol]
      const newBoard = board.map(row => [...row]); 


      const isEmptyTile = pieceAtNewPosition == 0

      const validCapture = !isEmptyTile && Math.abs(colDiff) == 1 && rowDiff == direction && pieceAtNewPosition.color != this.color
      const isValidMove = rowDiff == direction && colDiff == 0 || rowDiff == direction * maxVerticalMovement && colDiff == 0
      const canBePromoted = isValidMove && newRow == board[0].length || newRow == 0

      let moveMade = true

      if (validCapture || isValidMove && isEmptyTile){
        this.firstMove = false
        this.updatePositions(newBoard, currentRow, currentCol, newRow, newCol, canBePromoted);
      } 
      else{
        console.log("No valid move made")
        moveMade = false
      }

      return {newBoard, moveMade}
    }
      


  updatePositions(newBoard, row, col, newRow, newCol, canBePromoted) {
    let piece = this

    if (canBePromoted) {
      piece = new Queen(this.color, {y: newRow, x: newCol}, this.context)
    }
    newBoard[row][col] = 0;
    newBoard[newRow][newCol] = piece;
    this.position = { x: newCol, y: newRow };
  }
}
  
  
export default Pawn