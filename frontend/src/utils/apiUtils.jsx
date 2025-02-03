/*
Contains helper functions associated with the API. In this case, to efficiently send the board and store it in the backend, the
board is first encoded as a string which then can be decoded back into a 2d array of objects. 

I regret this design choice, and wish I had though ahead about how best to store the board state.
*/

import Bishop from "../pieces/bishop";
import King from "../pieces/king";
import Knight from "../pieces/knight";
import Pawn from "../pieces/pawn";
import Queen from "../pieces/queen";
import Rook from "../pieces/rook";

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
  return serialisedBoard;
}

export function deserialiseBoard(serialisedBoard, boardSize, ctx) {
  console.log("----------------");
  console.log(serialisedBoard);
  console.log(boardSize);

  const newBoard = [];
  // Loop over each row
  for (let rowIndex = 0; rowIndex < boardSize; rowIndex++) {
    const row = [];
    // Loop over each column in the row
    for (let colIndex = 0; colIndex < boardSize; colIndex++) {
      // Calculate the index into the string.
      // Each piece is represented by 2 characters.
      const i = (rowIndex * boardSize + colIndex) * 2;
      const colourCode = serialisedBoard.charAt(i);
      const pieceCode = serialisedBoard.charAt(i + 1);
      let piece = null;

      if (pieceCode === "0") {
        piece = 0; // Empty square
      } else {
        const position = { x: colIndex, y: rowIndex };
        const colour = colourCode === "w" ? "white" : "black";

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
            // Optionally handle unknown piece codes here.
            piece = null;
        }
      }
      row.push(piece);
    }
    newBoard.push(row);
  }
  console.log("New board: ", newBoard);
  return newBoard;
}
