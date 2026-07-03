"use client";

import React from "react";
import { GameState, Player, Token, PlayerColor, TRACK_POSITIONS, SAFE_POSITIONS, BOARD_POSITIONS } from "@/lib/types";
import { getTokenGridPosition } from "@/lib/gameLogic";

interface LudoBoardProps {
  gameState: GameState;
  onTokenClick: (tokenId: number) => void;
  validMoves: number[];
}

const COLORS: Record<PlayerColor, string> = {
  red: "#E74C3C",
  green: "#2ECC71",
  yellow: "#F1C40F",
  blue: "#3498DB",
};

const LIGHT_COLORS: Record<PlayerColor, string> = {
  red: "#FADBD8",
  green: "#D5F5E3",
  yellow: "#FEF9E7",
  blue: "#D6EAF8",
};

const TOKEN_EMOJIS: Record<PlayerColor, string> = {
  red: "🔴",
  green: "🟢",
  yellow: "🟡",
  blue: "🔵",
};

export default function LudoBoard({ gameState, onTokenClick, validMoves }: LudoBoardProps) {
  const { players } = gameState;

  // Create a 15x15 grid
  const grid: React.ReactNode[][] = [];

  for (let row = 0; row < 15; row++) {
    const columns: React.ReactNode[] = [];
    for (let col = 0; col < 15; col++) {
      columns.push(renderCell(row, col));
    }
    grid.push(columns);
  }

  function getCellColor(row: number, col: number): string {
    // Red zone (bottom-right corner) - rows 9-14, cols 0-5
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return LIGHT_COLORS.red;
    // Green zone (top-right corner) - rows 0-5, cols 9-14
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return LIGHT_COLORS.green;
    // Yellow zone (top-left corner) - rows 0-5, cols 0-5
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return LIGHT_COLORS.yellow;
    // Blue zone (bottom-left corner) - rows 9-14, cols 9-14
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return LIGHT_COLORS.blue;
    return "white";
  }

  function isTrackCell(row: number, col: number): boolean {
    return TRACK_POSITIONS.some((pos) => pos.row === row && pos.col === col);
  }

  function isSafeCell(row: number, col: number): boolean {
    return SAFE_POSITIONS.some((pos) => {
      const p = TRACK_POSITIONS[pos];
      return p && p.row === row && p.col === col;
    });
  }

  function getTrackIndex(row: number, col: number): number | null {
    for (let i = 0; i < TRACK_POSITIONS.length; i++) {
      if (TRACK_POSITIONS[i].row === row && TRACK_POSITIONS[i].col === col) return i;
    }
    return null;
  }

  function isHomePath(row: number, col: number): PlayerColor | null {
    const homePaths: Record<PlayerColor, { row: number; col: number }[]> = {
      red: [
        { row: 13, col: 7 }, { row: 13, col: 6 }, { row: 13, col: 5 },
        { row: 13, col: 4 }, { row: 13, col: 3 },
      ],
      green: [
        { row: 7, col: 13 }, { row: 6, col: 13 }, { row: 5, col: 13 },
        { row: 4, col: 13 }, { row: 3, col: 13 },
      ],
      yellow: [
        { row: 1, col: 7 }, { row: 1, col: 6 }, { row: 1, col: 5 },
        { row: 1, col: 4 }, { row: 1, col: 3 },
      ],
      blue: [
        { row: 7, col: 1 }, { row: 6, col: 1 }, { row: 5, col: 1 },
        { row: 4, col: 1 }, { row: 3, col: 1 },
      ],
    };

    for (const [color, positions] of Object.entries(homePaths)) {
      if (positions.some((p) => p.row === row && p.col === col)) return color as PlayerColor;
    }
    return null;
  }

  function isCenterCell(row: number, col: number): boolean {
    return row >= 6 && row <= 8 && col >= 6 && col <= 8;
  }

  function getTokensAtCell(row: number, col: number): { token: Token; player: Player }[] {
    const tokens: { token: Token; player: Player }[] = [];
    for (const player of players) {
      for (const token of player.tokens) {
        const pos = getTokenGridPosition(token);
        if (pos && pos.row === row && pos.col === col) {
          tokens.push({ token, player });
        }
      }
    }
    return tokens;
  }

  function renderCell(row: number, col: number) {
    const bgColor = getCellColor(row, col);
    const isTrack = isTrackCell(row, col);
    const isSafe = isSafeCell(row, col);
    const homePathColor = isHomePath(row, col);
    const isCenter = isCenterCell(row, col);
    const tokens = getTokensAtCell(row, col);
    const trackIdx = getTrackIndex(row, col);

    let cellStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      position: "relative",
      border: "0.5px solid #ddd",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      cursor: "default",
      backgroundColor: bgColor,
    };

    // Style for center area
    if (isCenter) {
      cellStyle.backgroundColor = "#2C3E50";
      cellStyle.border = "0.5px solid #34495E";
    }

    // Style for home path
    if (homePathColor) {
      cellStyle.backgroundColor = COLORS[homePathColor];
      cellStyle.opacity = 0.7;
    }

    // Style for track
    if (isTrack) {
      cellStyle.backgroundColor = "#F5F5F5";
      if (isSafe) {
        cellStyle.backgroundColor = "#FFEB3B";
        cellStyle.border = "1px solid #FF9800";
      }
    }

    // Center cell styling
    if (row === 7 && col === 7) {
      cellStyle.backgroundColor = "#2C3E50";
    }

    // Tokens in cell
    const tokenElements = tokens.map(({ token, player }) => {
      const isValid = validMoves.includes(token.id);
      return (
        <span
          key={`${player.color}-${token.id}`}
          onClick={() => isValid && onTokenClick(token.id)}
          style={{
            fontSize: "14px",
            cursor: isValid ? "pointer" : "default",
            filter: isValid ? "brightness(1.3) drop-shadow(0 0 3px gold)" : "none",
            transition: "transform 0.2s",
            transform: isValid ? "scale(1.2)" : "scale(1)",
            padding: "1px",
          }}
          title={`${player.name} Token ${token.id + 1}${isValid ? " (click to move)" : ""}`}
        >
          {TOKEN_EMOJIS[player.color]}
        </span>
      );
    });

    return (
      <div key={`${row}-${col}`} style={cellStyle}>
        {isCenter && row === 6 && col === 7 && (
          <span style={{ color: "white", fontSize: "8px" }}>🏆</span>
        )}
        {isCenter && row === 7 && col === 6 && (
          <span style={{ color: "white", fontSize: "8px" }}>🎯</span>
        )}
        {tokenElements.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1px" }}>
            {tokenElements}
          </div>
        )}
        {isTrack && !isSafe && tokenElements.length === 0 && trackIdx !== null && (
          <span style={{ fontSize: "6px", color: "#ccc", position: "absolute", bottom: 0, right: 1 }}>
            {trackIdx}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(15, 1fr)",
          gridTemplateRows: "repeat(15, 1fr)",
          aspectRatio: "1",
          border: "3px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {grid.flatMap((row, rIdx) =>
          row.map((cell, cIdx) => (
            <React.Fragment key={`${rIdx}-${cIdx}`}>{cell}</React.Fragment>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs">
        {(["red", "green", "yellow", "blue"] as PlayerColor[]).map((color) => (
          <div key={color} className="flex items-center gap-1">
            <span style={{ color: COLORS[color], fontSize: "16px" }}>
              {TOKEN_EMOJIS[color]}
            </span>
            <span className="font-medium capitalize">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
