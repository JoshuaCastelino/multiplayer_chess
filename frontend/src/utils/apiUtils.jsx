export function serialiseBoard(board) {
  let serialisedBoard = "";
  for (const row of board) {
    for (const piece of row) {
      if (piece === 0) {
        serialisedBoard += "00";
      } else {
        const colour = piece.colour[0];
        serialisedBoard += colour + piece.strRepresentation;
      }
    }
  }
  console.log(serialisedBoard);
  return serialisedBoard;
}

export function deserialiseBoard(serialisedBoard, boardSize, ctx) {
  const newBoard = [];
  let row = [];

  for (let i = 0; i < serialisedBoard.length; i += 2) {
    const colourCode = serialisedBoard.charAt(i);
    const pieceCode = serialisedBoard.charAt(i + 1);

    const colour = colourCode === "w" ? "white" : "black";
    let piece = null;

    if (pieceCode === "0") {
      piece = 0; // Empty square
    } else {
      const position = {
        x: (i / 2) % boardSize,
        y: Math.floor(i / 2 / boardSize),
      };

      switch (pieceCode) {
        case "P":
          piece = new Pawn(colour, position, ctx);
          break;
        case "R":
          piece = new Rook(colour, position, ctx);
          break;
        case "N":
          piece = new Knight(colour, position, ctx);
          break;
        case "B":
          piece = new Bishop(colour, position, ctx);
          break;
        case "Q":
          piece = new Queen(colour, position, ctx);
          break;
        case "K":
          piece = new King(colour, position, ctx);
          break;
        default:
          piece = null; // Unknown piece
      }
    }

    row.push(piece);

    // If the row is complete, add it to the board and reset the row
    if (row.length === boardSize) {
      newBoard.push(row);
      row = [];
    }
  }

  // If there's an incomplete row, add it to the board
  if (row.length > 0) {
    newBoard.push(row);
  }

  return newBoard;
}
