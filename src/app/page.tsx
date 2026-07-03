"use client";

import React, { useState, useCallback } from "react";
import LudoBoard from "@/components/LudoBoard";
import Dice from "@/components/Dice";
import PlayerPanel from "@/components/PlayerPanel";
import { GameState, PlayerColor } from "@/lib/types";
import { createInitialGameState, handleDiceRoll, moveToken, getValidMoves } from "@/lib/gameLogic";

const COLORS: Record<PlayerColor, string> = {
  red: "#E74C3C",
  green: "#2ECC71",
  yellow: "#F1C40F",
  blue: "#3498DB",
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rolling, setRolling] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleRollDice = useCallback(() => {
    if (gameState.winner) return;
    if (gameState.diceRolled) return;
    if (rolling) return;

    setRolling(true);
    
    // Animate dice roll
    let count = 0;
    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        diceValue: Math.floor(Math.random() * 6) + 1,
      }));
      count++;
      if (count > 8) {
        clearInterval(interval);
        setGameState((prev) => {
          const newState = handleDiceRoll(prev);
          const moves = newState.canMove ? getValidMoves(newState) : [];
          setValidMoves(moves);
          if (newState.winner) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
          setRolling(false);
          return newState;
        });
      }
    }, 80);
  }, [gameState.winner, gameState.diceRolled, rolling]);

  const handleTokenClick = useCallback((tokenId: number) => {
    if (!gameState.canMove) return;
    if (!validMoves.includes(tokenId)) return;

    setGameState((prev) => {
      const newState = moveToken(prev, tokenId);
      if (newState.winner) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setValidMoves([]);
      return newState;
    });
  }, [gameState.canMove, validMoves]);

  const handleNewGame = () => {
    setGameState(createInitialGameState());
    setValidMoves([]);
    setShowConfetti(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-6 px-4">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉🎊🏆🎊🎉</div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-green-400 to-blue-500 bg-clip-text text-transparent">
            🎲 Ludo Game 🎲
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Classic board game — Roll the dice, move your tokens, be the first to get all 4 home!
          </p>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
          <LudoBoard
            gameState={gameState}
            onTokenClick={handleTokenClick}
            validMoves={validMoves}
          />
        </div>

        {/* Player Panel */}
        <PlayerPanel gameState={gameState} />

        {/* Controls */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {gameState.winner ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-4">
                🎉 {gameState.players.find((p) => p.color === gameState.winner)?.name} Wins! 🎉
              </div>
              <button
                onClick={handleNewGame}
                className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🔄 Play Again
              </button>
            </div>
          ) : (
            <>
              <Dice
                value={gameState.diceValue}
                onClick={handleRollDice}
                disabled={gameState.canMove || !gameState.gameStarted === false}
                rolled={gameState.diceRolled}
              />

              <div
                className="text-center px-6 py-3 rounded-lg font-medium max-w-md"
                style={{
                  backgroundColor: gameState.diceRolled
                    ? `${COLORS[currentPlayer.color]}15`
                    : "#F3F4F6",
                  color: gameState.diceRolled ? COLORS[currentPlayer.color] : "#6B7280",
                  borderLeft: `4px solid ${
                    gameState.diceRolled ? COLORS[currentPlayer.color] : "#D1D5DB"
                  }`,
                }}
              >
                {gameState.message}
              </div>

              {!gameState.gameStarted && (
                <p className="text-sm text-gray-400 animate-pulse">
                  Click the dice to start! 🎲
                </p>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleNewGame}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  🔄 New Game
                </button>
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>🎯 Roll a 6 to bring a token out | 🏠 Get all 4 tokens home to win</p>
          <p>💥 Land on opponent to capture | ⭐ Safe spots protect your tokens</p>
        </div>
      </div>
    </div>
  );
}
