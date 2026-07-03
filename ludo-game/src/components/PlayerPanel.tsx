"use client";

import React from "react";
import { Player, PlayerColor, GameState } from "@/lib/types";

interface PlayerPanelProps {
  gameState: GameState;
}

const COLORS: Record<PlayerColor, string> = {
  red: "#E74C3C",
  green: "#2ECC71",
  yellow: "#F1C40F",
  blue: "#3498DB",
};

const TOKEN_EMOJIS: Record<PlayerColor, string> = {
  red: "🔴",
  green: "🟢",
  yellow: "🟡",
  blue: "🔵",
};

export default function PlayerPanel({ gameState }: PlayerPanelProps) {
  const { players, currentPlayerIndex, winner } = gameState;

  return (
    <div className="w-full max-w-[600px] mx-auto mt-4">
      <div className="grid grid-cols-4 gap-2">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex && !winner;
          const isWinner = winner === player.color;
          const finishedCount = player.tokens.filter((t) => t.isFinished).length;

          return (
            <div
              key={player.color}
              style={{
                border: isWinner
                  ? "2px solid gold"
                  : isCurrentPlayer
                  ? `2px solid ${COLORS[player.color]}`
                  : "2px solid transparent",
                borderRadius: "8px",
                padding: "8px",
                backgroundColor: isCurrentPlayer
                  ? `${COLORS[player.color]}15`
                  : "#F8F9FA",
                textAlign: "center",
                transition: "all 0.3s",
                boxShadow: isCurrentPlayer
                  ? `0 0 10px ${COLORS[player.color]}33`
                  : "none",
              }}
            >
              <div className="text-lg">{TOKEN_EMOJIS[player.color]}</div>
              <div
                className="font-bold text-sm"
                style={{ color: COLORS[player.color] }}
              >
                {player.name}
                {isWinner && " 👑"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {finishedCount}/4 home
              </div>
              <div className="flex justify-center gap-1 mt-1">
                {player.tokens.map((token) => (
                  <span
                    key={token.id}
                    style={{
                      fontSize: "12px",
                      opacity: token.isFinished ? 1 : token.isHome ? 0.4 : 0.8,
                    }}
                  >
                    {TOKEN_EMOJIS[player.color]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
