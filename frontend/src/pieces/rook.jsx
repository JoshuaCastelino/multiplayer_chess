import SlidingPiece from "./slidingPiece";
import blackRookSVG from "../assets/black_rook.svg";
import whiteRookSVG from "../assets/white_rook.svg";
import { loadImage } from "../utils/Render";

class Rook extends SlidingPiece {
  constructor(colour, position, ctx) {
    super(colour, position, ctx);
    this.directions = [
      [-1, 0], // Left
      [1, 0], // Right
      [0, -1], // Down
      [0, 1], // Up
    ];
    const src = colour === "white" ? whiteRookSVG : blackRookSVG;
    this.imagePromise = loadImage(src);
  }
}

export default Rook;
