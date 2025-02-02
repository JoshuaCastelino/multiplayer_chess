import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import whiteQueen from "./assets/white_queen.svg";
import { connection, sendMove } from "./api";
import {
  initialise,
  isInBounds,
  move,
  generateAllLegalMoves,
  generateThreatMapKey,
} from "./utils/Engine";
import {
  renderThreatMaps,
  redrawBoard,
  pointToCoordinate,
  drawLegalMoves,
  checkGameEndCondition,
} from "./utils/Render";
import { deserialiseBoard, serialiseBoard } from "./utils/apiUtils";

function App({ preventFlipping, multiplayer }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const tileSize = 80;
  const boardSize = 8;
  const red = "rgba(255, 0, 0, 0.5)";
  const blue = "rgba(0, 50, 255, 0.5)";
  const gameCode = new URLSearchParams(location.search).get("code");

  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(undefined);
  const [playerTurn, setPlayerTurn] = useState("white");
  const [legalMoves, setLegalMoves] = useState([]);
  const [kings, setKings] = useState({ white: null, black: null });
  const [allLegalMoves, setAllLegalMoves] = useState(null);
  const [colourThreats, setColourThreats] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(multiplayer);

  // ── REMOTE MOVE HANDLER ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Initialise the board and kings
    const { board: initBoard, blackKing, whiteKing } = initialise(ctx, boardSize);
    setBoard(initBoard);
    setKings({ white: whiteKing, black: blackKing });

    const handleMoveMade = (gameState) => {
      try {
        console.log("Game state", gameState);
        if (gameState.success) {
          const serialisedBoard = gameState.message;
          const deserialisedBoard = deserialiseBoard(serialisedBoard, boardSize, ctx);
          setBoard(deserialisedBoard);
          // Toggle turn for a remote move.
          setPlayerTurn((prev) => (prev === "white" ? "black" : "white"));
          setIsWaitingForOpponent(false);
        } else {
          console.log("Failure to send move");
        }
      } catch (error) {
        console.error("Move made error:", error.message);
        alert(error.message);
      }
    };
    if (multiplayer) {
      connection.on("BlackJoined", (res) => setIsWaitingForOpponent(!res.success));
      connection.on("MoveMade", handleMoveMade);
    }

    return () => {
      if (multiplayer) {
        connection.off("BlackJoined", (res) => setIsWaitingForOpponent(!res.success));
        connection.off("MoveMade", handleMoveMade);
      }
    };
  }, []);

  // ── BOARD RENDERING EFFECT ─────────────────────────────────────────
  // Redraw the board and update legal moves whenever the board or
  // related flags change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!board.length || !canvas) return;
    const ctx = canvas.getContext("2d");
    const isFlipped = playerTurn === "black" && preventFlipping;
    // Use the current player's king for rendering legal moves/threat maps.
    const king = kings[playerTurn];
    redrawBoard(canvas, board, boardSize, tileSize, isFlipped);
    if (colourThreats && king) {
      renderThreatMaps(board, king, ctx, tileSize, red, isFlipped, blue);
    }
    const { movesByPosition, endConditions } = king
      ? generateAllLegalMoves(board, king)
      : { movesByPosition: {}, endConditions: {} };
    setAllLegalMoves(movesByPosition);
    checkGameEndCondition(ctx, king, endConditions, isFlipped, playerTurn, tileSize, boardSize);
    setLegalMoves([]);
    setSelectedPiece(undefined);
  }, [board, colourThreats, playerTurn, kings]);

  // ── LOCAL MOVE HANDLER ──────────────────────────────────────────────
  const selectPiece = (e) => {
    if (multiplayer && isWaitingForOpponent) return;

    const isFlipped = playerTurn === "black" && preventFlipping;
    const { row, col } = pointToCoordinate(canvasRef, e, tileSize, isFlipped);
    if (!isInBounds(row, col, boardSize)) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const piece = board[row][col];

    // If selecting one of your own pieces, show its legal moves.
    if (piece && piece.colour === playerTurn) {
      const positionKey = generateThreatMapKey(row, col);
      const legalMovesForPiece = allLegalMoves ? allLegalMoves[positionKey] : [];
      setSelectedPiece(piece);
      setLegalMoves(legalMovesForPiece);
      redrawBoard(canvas, board, boardSize, tileSize, isFlipped);
      drawLegalMoves(legalMovesForPiece, tileSize, ctx, red, boardSize, isFlipped);
    }
    // Else if a piece is already selected, attempt a move.
    else if (selectedPiece) {
      const { newBoard, isPositionFound } = move(
        ctx,
        selectedPiece,
        { col, row },
        board,
        legalMoves
      );
      if (isPositionFound) {
        // Capture the mover's colour before toggling.
        const mover = playerTurn;
        const nextTurn = mover === "white" ? "black" : "white";
        setBoard(newBoard);
        setPlayerTurn(nextTurn);
        // Send the move using the mover's colour.
        handleSendMove(newBoard, mover);
      }
    }
  };

  // ── SEND MOVE FUNCTION ─────────────────────────────────────────────
  async function handleSendMove(updatedBoard, mover) {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const serialisedBoard = serialiseBoard(updatedBoard);
      const response = await sendMove(mover, gameCode, serialisedBoard);
      if (response.success) {
        // Move sent successfully; wait for the opponent's move.
        setIsWaitingForOpponent(true);
        console.log("Waiting for opponent...");
      } else {
        // Sending move failed; revert board and reset turn.
        const previousBoard = deserialiseBoard(serialisedBoard, boardSize, ctx);
        setBoard(previousBoard);
        setPlayerTurn(mover); // Revert turn back to mover.
      }
    } catch (error) {
      console.error("Send move error:", error.message);
      alert(error.message);
    }
  }

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
      <button
        className="flex items-center justify-center space-x-4 mb-12 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
        style={{ width: tileSize * boardSize + 40 }}
        onClick={() => navigate("/")}
      >
        <img src={whiteQueen} alt="White Queen" className="w-12 h-12" />
        <h1 className="text-4xl font-bold">NotChess.com</h1>
      </button>

      <div className="bg-gray-900">
        <canvas
          className="bg-transparent"
          ref={canvasRef}
          width={tileSize * boardSize}
          height={tileSize * boardSize}
          onMouseDown={selectPiece}
        ></canvas>
      </div>

      {multiplayer &&
        (isWaitingForOpponent ? (
          <div className="mt-4 text-lg font-semibold text-red-400">Waiting for opponent...</div>
        ) : (
          <div className="mt-4 text-lg font-semibold text-green-400">Your move!</div>
        ))}

      {gameCode ? (
        <div className="mt-4 text-lg font-semibold">
          Game Code: <span className="text-blue-400">{gameCode}</span>
        </div>
      ) : (
        <button
          className={`mt-4 py-3 px-8 rounded-lg shadow-md font-bold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${
            colourThreats
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
          }`}
          style={{ width: tileSize * boardSize + 40 }}
          onClick={() => setColourThreats((prev) => !prev)}
        >
          {colourThreats ? "Disable Threat Colouring" : "Enable Threat Colouring"}
        </button>
      )}
    </div>
  );
}

export default App;
