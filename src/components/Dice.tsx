"use client";

import React from "react";

interface DiceProps {
  value: number | null;
  onClick: () => void;
  disabled: boolean;
  rolled: boolean;
}

const DICE_DOTS: Record<number, number[][]> = {
  1: [[1, 1, 1], [1, 0, 1], [1, 1, 1]], // center dot
  2: [[0, 0, 1], [1, 0, 1], [1, 0, 0]], // diagonal
  3: [[0, 0, 1], [1, 0, 1], [1, 1, 0]], // diagonal plus center
  4: [[1, 0, 1], [1, 0, 1], [1, 0, 1]], // four corners
  5: [[1, 0, 1], [1, 0, 1], [1, 0, 1]], // four corners + center
  6: [[1, 0, 1], [1, 0, 1], [1, 0, 1]], // six
};

// More accurate dot patterns
const DICE_PATTERNS: Record<number, { row: number; col: number }[]> = {
  1: [{ row: 1, col: 1 }],
  2: [{ row: 0, col: 2 }, { row: 2, col: 0 }],
  3: [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }],
  4: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  5: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  6: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
};

const DICE_COLORS = [
  "#E74C3C", // red
  "#2ECC71", // green
  "#3498DB", // blue
  "#F39C12", // orange
  "#9B59B6", // purple
  "#1ABC9C", // teal
];

export default function Dice({ value, onClick, disabled, rolled }: DiceProps) {
  const dots = value ? DICE_PATTERNS[value] : [];
  const colorIndex = value ? value - 1 : 0;
  const diceColor = value ? DICE_COLORS[colorIndex] : "#95A5A6";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={disabled ? undefined : onClick}
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: rolled ? diceColor : "#ECF0F1",
          borderRadius: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          padding: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: rolled
            ? `0 4px 15px ${diceColor}66, inset 0 -2px 5px rgba(0,0,0,0.2)`
            : "0 4px 10px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          transform: rolled ? "scale(1.05)" : "scale(1)",
          border: `2px solid ${rolled ? diceColor : "#BDC3C7"}`,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dots.some((d) => d.row === row && d.col === col);
            return (
              <div
                key={`${row}-${col}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasDot && (
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: rolled ? "white" : "#2C3E50",
                      borderRadius: "50%",
                      boxShadow: rolled
                        ? "inset 0 1px 3px rgba(0,0,0,0.3)"
                        : "inset 0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      <span className="text-sm font-medium text-gray-600">
        {disabled
          ? "Not your turn"
          : rolled
          ? "Click a token to move"
          : "Click to roll! 🎲"}
      </span>
    </div>
  );
}
