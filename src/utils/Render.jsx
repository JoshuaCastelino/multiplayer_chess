export function redrawBoard(canvas, board, boardSize, tileSize) {
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

export function colourThreatMap(ctx, tileSize, threatMap, colour) {
  Object.keys(threatMap).forEach((key) => {
    const threats = threatMap[key];
    if (threats && threats.length > 0) {
      const row = key[0];
      const col = key[1];
      const x = col * tileSize;
      const y = row * tileSize;
      ctx.fillStyle = colour;
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  });
}

export function drawLegalMoves(legalMoves, tileSize, ctx, red) {
  legalMoves.forEach(({ row, col }) => {
    const x = col * tileSize;
    const y = row * tileSize;

    ctx.fillStyle = red;
    ctx.fillRect(x, y, tileSize, tileSize);
  });
}
