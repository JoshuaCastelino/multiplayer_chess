export function redrawBoard(ctx, board, boardSize, tileSize) {
    // Draw the board again
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const isDark = (row + col) % 2 === 1;
        ctx.fillStyle = isDark ? "#769656" : "#eeeed2"; // dark and light colors
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }  
    // Draw each piece again
    for (let row of board) {
      for (let piece of row) {
        if (piece != 0) {
          piece.draw(tileSize);
        }
      }
    }
  }
  