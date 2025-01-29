import SlidingPiece from "./slidingPiece";
import { loadImage } from "../utils/Render";
import blackQueenSVG from "../assets/black_queen.svg";
import whiteQueenSVG from "../assets/white_queen.svg";
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
    const src = colour === "white" ? whiteQueenSVG : blackQueenSVG;
    this.imagePromise = loadImage(src);
    this.strRepresentation = "Q"
  }
}

export default Queen;
