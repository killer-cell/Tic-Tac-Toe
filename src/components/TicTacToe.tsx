"use client";

import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

type Player = "X" | "O";
type Board = (Player | null)[];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [players, setPlayers] = useState<{ X: string; O: string }>({
    X: "Player 1",
    O: "AI",
  });
  const [scores, setScores] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [gameMode, setGameMode] = useState<"AI" | "Player" | null>(null);

  const handleClick = (index: number): void => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updateScores(gameWinner);
      return;
    }

    if (newBoard.every(cell => cell !== null)) {
      // Game is a draw, no winner
      setWinner(null);
      startNewGame(); // Automatically reset the game after a draw
      return;
    }

    if (gameMode === "AI" && !gameWinner) {
      setTimeout(() => aiMove(newBoard), 500); // AI moves after a short delay
    }
  };

  const calculateWinner = (board: Board): Player | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const aiMove = (newBoard: Board) => {
    const bestMove = minimax(newBoard, true); // AI is maximizing
    newBoard[bestMove] = "O";
    setBoard(newBoard);
    setXIsNext(true);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updateScores(gameWinner);
    } else if (newBoard.every(cell => cell !== null)) {
      // Check if game is a draw
      startNewGame(); // Reset game automatically after a draw
    }
  };

  // Minimax algorithm
  const minimax = (board: Board, isMaximizing: boolean): number => {
    const winner = calculateWinner(board);
    if (winner === "X") return -10; // Player wins
    if (winner === "O") return 10;  // AI wins
    if (board.every(cell => cell !== null)) return 0; // Draw

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove = -1;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = isMaximizing ? "O" : "X"; // AI or player move
        const score = minimax(board, !isMaximizing);
        board[i] = null; // Undo the move

        if (isMaximizing && score > bestScore) {
          bestScore = score;
          bestMove = i;
        } else if (!isMaximizing && score < bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove!;
  };

  const updateScores = (gameWinner: Player) => {
    setScores((prevScores) => ({
      ...prevScores,
      [gameWinner]: prevScores[gameWinner] + 1,
    }));
  };

  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
  };

  const resetGame = (): void => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setScores({ X: 0, O: 0 });
    setGameStarted(false);
    setGameMode(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startGame = (mode: "AI" | "Player") => {
    setGameMode(mode);
    setPlayers({
      X: "Player 1",
      O: mode === "AI" ? "AI" : "Player 2",
    });
    setGameStarted(true);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-5 transition-all ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <button onClick={toggleTheme} className="absolute top-5 right-5 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-all">
        {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
      </button>
      {!gameStarted ? (
        <div className="mb-5 flex flex-col items-center">
          <button onClick={() => startGame("Player")} className="bg-blue-500 text-white p-4 rounded w-60 mb-3 hover:bg-blue-600 transition-all">Play with Real Person</button>
          <button onClick={() => startGame("AI")} className="bg-green-500 text-white p-4 rounded w-60 hover:bg-green-600 transition-all">Play with AI</button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-5">Tic Tac Toe</h1>
          <p className="text-lg mb-3">{winner ? `Winner: ${players[winner]}!` : `${xIsNext ? players.X : players.O}'s turn.`}</p>
          <div className="grid grid-cols-3 gap-2 mb-5 max-w-sm">
            {board.map((cell, index) => (
              <button
                key={index}
                className={`w-20 h-20 border text-4xl flex items-center justify-center ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-100 text-black'} rounded transition-all hover:bg-blue-200`}
                onClick={() => handleClick(index)}
                disabled={!!cell || winner !== null}
              >
                {cell}
              </button>
            ))}
          </div>
          {winner && (
            <div>
              <button onClick={startNewGame} className="mt-3 bg-blue-500 text-white p-2 rounded w-full sm:w-80 hover:bg-blue-600 transition-all">Start New Game</button>
            </div>
          )}
          <button onClick={resetGame} className="mt-3 bg-red-500 text-white p-2 rounded w-full sm:w-80 hover:bg-red-600 transition-all">Select Mode</button>
          <div className="mt-5 w-full sm:w-80 text-center">
            <p>{players.X}: {scores.X} Wins</p>
            <p>{players.O}: {scores.O} Wins</p>
          </div>
        </>
      )}
    </div>
  );
}
