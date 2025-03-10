/*
This file corresponds to the actual chess game itself. It makes use of the API calls, classes, and utilities defined in other files
to render the current state of the board as well as handle the selection of pieces on the board.
*/

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connection, disconnectGame, sendMove } from "./api";
import {
  initialise,
  isInBounds,
  move,
  generateAllLegalMoves,
  generateThreatMapKey,
  findKing,
} from "./utils/Engine";
import {
  renderThreatMaps,
  redrawBoard,
  pointToCoordinate,
  drawLegalMoves,
  checkGameEndCondition,
} from "./utils/Render";
import { deserialiseBoard, serialiseBoard } from "./utils/apiUtils";
import { useLocation } from "react-router-dom";
import whiteQueen from "./assets/white_queen.svg";
import CheckmateGraphic from "./CheckmateGraphic";

function App({ preventFlipping, multiplayer }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const tileSize = 80;
  const boardSize = 8;
  const red = "rgba(255, 0, 0, 0.5)";
  const blue = "rgba(0, 50, 255, 0.5)";
  const location = useLocation();
  const { colour, gameCode } = location.state || {};

  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(undefined);
  const [playerTurn, setPlayerTurn] = useState("white");
  const [legalMoves, setLegalMoves] = useState([]);
  const [kings, setKings] = useState({ white: null, black: null });
  const [allLegalMoves, setAllLegalMoves] = useState(null);
  const [colourThreats, setColourThreats] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(multiplayer);
  const [gameEnded, setGameEnded] = useState(false);
  const [endMessage, setEndMessage] = useState("");

  const handleBeforeUnload = () => {
    if (connection && connection.state === "Connected") {
      disconnectGame(gameCode);
    }
  };

  const handleOpponentDisconected = () => {
    setEndMessage("Your opponent has resigned");
    setGameEnded(true);
  };

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
        if (gameState.success) {
          const serialisedBoard = gameState.message;
          const nextTurn = gameState.nextTurn;
          const deserialisedBoard = deserialiseBoard(serialisedBoard, boardSize, ctx);
          const whiteKing = findKing(deserialisedBoard, "white");
          const blackKing = findKing(deserialisedBoard, "black");
          setKings({ white: whiteKing, black: blackKing });
          setIsWaitingForOpponent(false);
          setBoard(deserialisedBoard);
          // Toggle turn for a remote move.
          setPlayerTurn(nextTurn);
        }
      } catch (error) {
        console.error("Move made error:", error.message);
        alert(error.message);
      }
    };
    if (multiplayer) {
      connection.on("BlackJoined", (res) => setIsWaitingForOpponent(!res.success));
      connection.on("MoveMade", handleMoveMade);
      connection.on("OpponentDisconnected", handleOpponentDisconected);
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (multiplayer) {
        connection.off("BlackJoined", (res) => setIsWaitingForOpponent(!res.success));
        connection.off("MoveMade", handleMoveMade);
        connection.on("OpponentDisconnected", handleOpponentDisconected);
        window.removeEventListener("beforeunload", handleBeforeUnload);
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
    const isFlipped =
      (playerTurn === "black" && preventFlipping) || (colour == "black" && multiplayer);
    // Use the current player's king for rendering legal moves/threat maps.
    const king = kings[playerTurn];
    redrawBoard(canvas, board, boardSize, tileSize, isFlipped);
    if (colourThreats && king) {
      renderThreatMaps(board, king, ctx, tileSize, red, isFlipped, blue);
    }
    const { movesByPosition, endConditions } = king
      ? generateAllLegalMoves(board, king)
      : { movesByPosition: {}, endConditions: {} };
    const { checked, checkmated, stalemated } = endConditions;
    if (checkmated) {
      // Determine the winner: if the current player's move resulted in a checkmate,
      const winner = playerTurn === "white" ? "Black" : "White";
      setEndMessage(`Checkmate! ${winner} wins!`);
      setGameEnded(true);
    } else if (stalemated) {
      setEndMessage("Stalemate!");
      setGameEnded(true);
    }

    setAllLegalMoves(movesByPosition);
    checkGameEndCondition(ctx, king, endConditions, isFlipped, playerTurn, tileSize, boardSize);
    setLegalMoves([]);
    setSelectedPiece(undefined);
  }, [board, colourThreats, playerTurn, kings]);

  const restartHandler = () => {
    navigate("/");
  };

  // ── LOCAL MOVE HANDLER ──────────────────────────────────────────────
  const selectPiece = (e) => {
    // make sure that it is the players turn
    if (multiplayer && playerTurn !== colour) return;

    const isFlipped =
      (playerTurn === "black" && preventFlipping) || (colour == "black" && multiplayer);
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
        // Send the move using the mover's colour.
        if (multiplayer) {
          handleSendMove(newBoard, mover, nextTurn);
        } else {
          setBoard(newBoard);
          setPlayerTurn(nextTurn);
        }
      }
    }
  };

  // ── SEND MOVE FUNCTION ─────────────────────────────────────────────
  async function handleSendMove(updatedBoard, mover, nextTurn) {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const serialisedBoard = serialiseBoard(updatedBoard);
      const response = await sendMove(mover, gameCode, serialisedBoard);
      if (response.success) {
        // Move sent successfully; wait for the opponent's move.
        setBoard(updatedBoard);
        setPlayerTurn(nextTurn);
        setIsWaitingForOpponent(false);
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

  function onBackButton() {
    handleBeforeUnload();
    navigate("/");
  }

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
      <button
        className="flex items-center justify-center space-x-4 mb-12 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
        style={{ width: tileSize * boardSize + 40 }}
        onClick={onBackButton}
      >
        <img src={whiteQueen} alt="White Queen" className="w-12 h-12" />
        <h1 className="text-4xl font-bold">NotChess.com</h1>
      </button>

      <div className="relative">
        <div className="bg-gray-900">
          <canvas
            className="bg-transparent"
            ref={canvasRef}
            width={tileSize * boardSize}
            height={tileSize * boardSize}
            onMouseDown={selectPiece}
          ></canvas>
        </div>

        {gameEnded && <CheckmateGraphic message={endMessage} onRestart={restartHandler} />}
      </div>

      {multiplayer && (
        <div className="mt-4 text-lg font-semibold">
          {isWaitingForOpponent ? (
            <span className="text-red-400">Waiting for opponent to join...</span>
          ) : playerTurn === colour ? (
            <span className="text-green-400">Your move!</span>
          ) : (
            <span className="text-yellow-400">Opponent's turn...</span>
          )}
        </div>
      )}

      {gameCode && (
        <div className="mt-4 text-lg font-semibold">
          Game Code: <span className="text-blue-400">{gameCode}</span>
        </div>
      )}

      {!gameCode && (
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
