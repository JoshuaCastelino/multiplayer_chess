import { loadImage } from "../utils/Render";

import SlidingPiece from "./slidingPiece";
import blackBishopSVG from "../assets/black_bishop.svg";
import whiteBishopSVG from "../assets/white_bishop.svg";

class Bishop extends SlidingPiece {
  constructor(colour, position, ctx) {
    super(colour, position, ctx);
    this.directions = [
      [-1, -1], // Top-left
      [-1, 1], // Top-right
      [1, -1], // Bottom-left
      [1, 1], // Bottom-right
    ];

    const src = colour === "white" ? whiteBishopSVG : blackBishopSVG;
    this.imagePromise = loadImage(src);
  }
}

export default Bishop;
