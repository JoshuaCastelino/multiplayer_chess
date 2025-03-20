/*
This file corresponds to the actual chess game itself. It makes use of the API calls, classes, and utilities defined in other files
to render the current state of the board as well as handle the selection of pieces on the board.
*/

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connection, disconnectGame, sendMove, KingCheckmated, GetHistory } from "./api";
import { deserialiseBoard, serialiseBoard } from "./utils/apiUtils";
import { useLocation } from "react-router-dom";
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
import CheckmateGraphic from "./CheckmateGraphic";
import BackButton from "./BackButton";
import UserCard from "./UserCard";
import GameStatus from "./GameStatus";
import ToggleThreatMap from "./ToggleThreatMap";

function App({ preventFlipping, multiplayer }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const tileSize = 80;
  const boardSize = 8;
  const red = "rgba(255, 0, 0, 0.5)";
  const blue = "rgba(0, 50, 255, 0.5)";
  const location = useLocation();
  const { colour, gameCode, whiteUsername } = location.state || {};
  const username = localStorage.getItem("finalUsername") ?? "Guest";

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
  const [blackUsername, setBlackUsername] = useState("Waiting...");
  const [wins, setWins] = useState({ white: 0, black: 0 });

  const topColour = colour === "white" ? "black" : "white";
  const topUsername = colour === "white" ? blackUsername : whiteUsername;
  const bottomColour = colour;
  const bottomUsername = username;

  const handleBeforeUnload = () => {
    if (connection && connection.state === "Connected") {
      KingCheckmated(gameCode, colour);
      disconnectGame(gameCode);
    }
  };

  const handleOpponentDisconected = () => {
    setEndMessage("Your opponent has resigned");
    setGameEnded(true);
  };

  useEffect(() => {
    const winner = playerTurn === "white" ? "Black" : "White";
  }, [gameEnded]);

  useEffect(() => {
    const whiteUser = colour === "white" ? username : whiteUsername;
    const blackUser = colour === "black" ? username : blackUsername;
    GetHistory(whiteUser, blackUser)
      .then((result) => {
        if (result.success) {
          setWins({
            white: result.whiteWins,
            black: result.blackWins,
          });
        } else {
          console.error("API call returned an error:", result.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching history:", error);
      });
  }, [whiteUsername, blackUsername, username]);

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
          const deserialisedBoard = deserialiseBoard(serialisedBoard, boardSize, ctx);
          const whiteKing = findKing(deserialisedBoard, "white");
          const blackKing = findKing(deserialisedBoard, "black");
          setKings({ white: whiteKing, black: blackKing });
          setIsWaitingForOpponent(false);
          setBoard(deserialisedBoard);
          setPlayerTurn((prev) => (prev === "white" ? "black" : "white"));
          setIsWaitingForOpponent(false);
        }
      } catch (error) {
        console.error("Move made error:", error.message);
        alert(error.message);
      }
    };
    const handleBlackJoined = (res) => {
      setIsWaitingForOpponent(!res.success);
      setBlackUsername(res.blackUsername);
      console.log(res);
    };

    if (multiplayer) {
      connection.on("BlackJoined", handleBlackJoined);
      connection.on("MoveMade", handleMoveMade);
      connection.on("OpponentDisconnected", handleOpponentDisconected);
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      if (multiplayer) {
        connection.off("BlackJoined", handleBlackJoined);
        connection.off("MoveMade", handleMoveMade);
        connection.on("OpponentDisconnected", handleOpponentDisconected);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, []);

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
    const { _, checkmated, stalemated } = endConditions;
    if (checkmated) {
      // Determine the winner: if the current player's move resulted in a checkmate,
      const winner = playerTurn === "white" ? "Black" : "White";
      // Make sure the checkmate only gets reported once
      if (colour == "white") {
        KingCheckmated(gameCode, winner);
      }
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

  const selectPiece = (e) => {
    // make sure that it is the players turn
    if (multiplayer && isWaitingForOpponent) return;

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

  async function handleSendMove(updatedBoard, mover, nextTurn) {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const serialisedBoard = serialiseBoard(updatedBoard);
      const response = await sendMove(mover, gameCode, serialisedBoard);
      if (response.success) {
        // Move sent successfully; wait for the opponent's move.
        console.log("Move sent sucessfully");
        setBoard(updatedBoard);
        setIsWaitingForOpponent(true);
        setPlayerTurn(nextTurn);
      } else {
        // Sending move failed; revert board and reset turn.
        console.log("Failed to send move");
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
    if (multiplayer) {
      handleBeforeUnload();
    }
    navigate("/");
  }

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
      <BackButton width={tileSize * boardSize + 40} onBackButton={() => onBackButton()} />

      {/* Central board container */}
      <div className="relative">
        <canvas
          className="bg-transparent"
          ref={canvasRef}
          width={tileSize * boardSize + 40}
          height={tileSize * boardSize + 40}
          onMouseDown={selectPiece}
        ></canvas>

        {gameEnded && <CheckmateGraphic message={endMessage} onRestart={restartHandler} />}
        {multiplayer && (
          <div
            className="absolute top-0 right-0 transform translate-x-[calc(100%+2rem)] flex flex-col justify-between"
            style={{ height: tileSize * boardSize + 40 }}
          >
            <UserCard
              color={topColour}
              username={topUsername}
              wins={topColour == "black" ? wins.black : wins.white}
              yourTurn={playerTurn === topColour}
            />
            <UserCard
              color={bottomColour}
              username={bottomUsername}
              wins={bottomColour == "black" ? wins.black : wins.white}
              yourTurn={playerTurn === bottomColour}
            />
          </div>
        )}
      </div>

      <GameStatus
        multiplayer={multiplayer}
        isWaitingForOpponent={isWaitingForOpponent}
        gameCode={gameCode}
      />

      <ToggleThreatMap
        gameCode={gameCode}
        colourThreats={colourThreats}
        setColourThreats={setColourThreats}
        tileSize={tileSize}
        boardSize={boardSize}
      />
    </div>
  );
}
export default App;
