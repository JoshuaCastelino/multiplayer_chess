/*
Contains rendering related functionality, e.g. drawing the board, or converting 
a click into a coordinate on the board
*/

const offset = 20;
const cornerRadius = 20;
const boardSize = 8;

export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function redrawBoard(canvas, board, boardSize, tileSize, isFlipped) {
  const totalSize = boardSize * tileSize + offset * 2;
  canvas.width = totalSize;
  canvas.height = totalSize;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, cornerRadius);

  ctx.fillStyle = "#5C4033";
  ctx.fill();

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const x = col * tileSize + offset;
      const y = row * tileSize + offset;
      const isDark = (row + col) % 2 === 1;
      ctx.fillStyle = isDark ? "#8B4513" : "#D2B48C";
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  ctx.fillStyle = "white";
  ctx.font = "14px Arial";

  // Adjust rank and file labels based on flipped state
  for (let row = 0; row < boardSize; row++) {
    const rankLabel = isFlipped ? (row + 1).toString() : (boardSize - row).toString();
    const labelY = row * tileSize + offset + tileSize * 0.6;
    ctx.fillText(rankLabel, offset * 0.4, labelY);
    ctx.fillText(rankLabel, offset + boardSize * tileSize + 5, labelY);
  }

  for (let col = 0; col < boardSize; col++) {
    const fileLabel = String.fromCharCode(
      "a".charCodeAt(0) + (isFlipped ? boardSize - 1 - col : col)
    );
    const labelX = col * tileSize + offset + tileSize * 0.45;
    ctx.fillText(fileLabel, labelX, offset + boardSize * tileSize + 15);
    ctx.fillText(fileLabel, labelX, offset * 0.7);
  }

  for (let row of board) {
    for (let piece of row) {
      if (piece !== 0) {
        drawPiece(piece, tileSize, offset, isFlipped);
      }
    }
  }
}


export function colourThreatMap(ctx, tileSize, threatMap, colour, boardSize, isFlipped) {
  Object.keys(threatMap).forEach((key) => {
    const threats = threatMap[key];
    if (threats && threats.length > 0) {
      const row = key[0];
      const col = key[1];

      // Adjust row and col if the board is flipped
      const adjustedRow = isFlipped ? boardSize - 1 - row : row;
      const adjustedCol = isFlipped ? boardSize - 1 - col : col;

      // Calculate x and y positions
      const x = offset + adjustedCol * tileSize;
      const y = offset + adjustedRow * tileSize;

      // Draw the highlighted square
      ctx.fillStyle = colour;
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  });
}

export function colourCheck(ctx, tileSize, king, boardSize, isFlipped = false) {
  const row = king.position.y;
  const col = king.position.x;

  // Adjust row and col if the board is flipped
  const adjustedRow = isFlipped ? boardSize - 1 - row : row;
  const adjustedCol = isFlipped ? boardSize - 1 - col : col;

  // Calculate x and y positions
  const x = offset + adjustedCol * tileSize;
  const y = offset + adjustedRow * tileSize;

  // Draw the highlighted square
  const green = "rgba(0, 255, 0, 0.5)";
  ctx.fillStyle = green;
  ctx.fillRect(x, y, tileSize, tileSize);
}

export function drawLegalMoves(legalMoves, tileSize, ctx, red, boardSize, isFlipped = false) {
  legalMoves.forEach(({ row, col }) => {
    // Adjust row and col if the board is flipped
    const adjustedRow = isFlipped ? boardSize - 1 - row : row;
    const adjustedCol = isFlipped ? boardSize - 1 - col : col;

    // Calculate x and y positions
    const x = offset + adjustedCol * tileSize;
    const y = offset + adjustedRow * tileSize;

    // Draw the highlighted square
    ctx.fillStyle = red;
    ctx.fillRect(x, y, tileSize, tileSize);
  });
}
export function pointToCoordinate(canvasRef, e, tileSize, isFlipped) {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - offset;
  const y = e.clientY - rect.top - offset;

  // Calculate raw column and row
  let col = Math.floor(x / tileSize);
  let row = Math.floor(y / tileSize);

  // Adjust for flipped board
  if (isFlipped) {
    col = boardSize - 1 - col;
    row = boardSize - 1 - row;
  }

  return { row, col };
}
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function drawPiece(piece, tileSize, offset = 0, isFlipped = false) {
  const img = await piece.imagePromise;
  const { x, y } = piece.position;
  // Adjust position based on flipped state
  const adjustedX = isFlipped ? boardSize - 1 - x : x;
  const adjustedY = isFlipped ? boardSize - 1 - y : y;
  // Calculate the center of the tile
  const centerX = offset + adjustedX * tileSize + tileSize / 2;
  const centerY = offset + adjustedY * tileSize + tileSize / 2;
  // Scale the piece to e.g. 80% of tile size
  const pieceSize = tileSize * 0.8;
  // Draw image at the correct position
  piece.ctx.drawImage(img, centerX - pieceSize / 2, centerY - pieceSize / 2, pieceSize, pieceSize);
}
