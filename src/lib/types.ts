export type PlayerColor = "red" | "green" | "yellow" | "blue";

export interface Position {
  row: number;
  col: number;
}

export interface Token {
  id: number;
  color: PlayerColor;
  position: number; // -1 = home, 0-51 = on track, 52-56 = safe zone, 57 = finished
  isFinished: boolean;
  isHome: boolean;
}

export interface Player {
  color: PlayerColor;
  name: string;
  tokens: Token[];
  isActive: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  diceRolled: boolean;
  canMove: boolean;
  winner: PlayerColor | null;
  message: string;
  gameStarted: boolean;
}

// Map of positions on the board (0-51 main track, 52-56 safe zone entry, 57 = center/home)
export const BOARD_POSITIONS: Record<PlayerColor, {
  start: number;
  entry: number; // position on main track where they enter colored column
  homePath: number[]; // positions 52-56 leading to center
  homeBase: Position[]; // 4 positions in the corner
}> = {
  red: {
    start: 0,
    entry: 50,
    homePath: [52, 53, 54, 55, 56],
    homeBase: [
      { row: 13, col: 3 },
      { row: 13, col: 4 },
      { row: 14, col: 3 },
      { row: 14, col: 4 },
    ],
  },
  green: {
    start: 13,
    entry: 11,
    homePath: [52, 53, 54, 55, 56],
    homeBase: [
      { row: 3, col: 13 },
      { row: 3, col: 14 },
      { row: 4, col: 13 },
      { row: 4, col: 14 },
    ],
  },
  yellow: {
    start: 26,
    entry: 24,
    homePath: [52, 53, 54, 55, 56],
    homeBase: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
  },
  blue: {
    start: 39,
    entry: 37,
    homePath: [52, 53, 54, 55, 56],
    homeBase: [
      { row: 10, col: 10 },
      { row: 10, col: 11 },
      { row: 11, col: 10 },
      { row: 11, col: 11 },
    ],
  },
};

// Safe positions where tokens can't be captured
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

// Full track positions mapped to grid coordinates
// 0-51 around the board
export const TRACK_POSITIONS: Position[] = [
  // 0-5: Red start going up (right side)
  { row: 6, col: 13 },  // 0 - Red start
  { row: 6, col: 12 },  // 1
  { row: 6, col: 11 },  // 2
  { row: 6, col: 10 },  // 3
  { row: 6, col: 9 },   // 4
  { row: 6, col: 8 },   // 5
  // 6-12: Going left across top
  { row: 5, col: 8 },   // 6
  { row: 4, col: 8 },   // 7
  { row: 3, col: 8 },   // 8 - Safe
  { row: 2, col: 8 },   // 9
  { row: 1, col: 8 },   // 10
  { row: 0, col: 8 },   // 11 - Green entry
  { row: 0, col: 7 },   // 12
  // 13-18: Green start going down (top-middle)
  { row: 0, col: 6 },   // 13 - Green start
  { row: 1, col: 6 },   // 14
  { row: 2, col: 6 },   // 15
  { row: 3, col: 6 },   // 16
  { row: 4, col: 6 },   // 17
  { row: 5, col: 6 },   // 18
  // 19-25: Going right across top-right
  { row: 6, col: 6 },   // 19
  { row: 6, col: 5 },   // 20
  { row: 6, col: 4 },   // 21 - Safe
  { row: 6, col: 3 },   // 22
  { row: 6, col: 2 },   // 23
  { row: 6, col: 1 },   // 24 - Yellow entry
  { row: 6, col: 0 },   // 25
  // 26-31: Yellow start going right (bottom)
  { row: 7, col: 0 },   // 26 - Yellow start
  { row: 7, col: 1 },   // 27
  { row: 7, col: 2 },   // 28
  { row: 7, col: 3 },   // 29
  { row: 7, col: 4 },   // 30
  { row: 7, col: 5 },   // 31
  // 32-38: Going left across bottom-middle
  { row: 8, col: 6 },   // 32
  { row: 8, col: 7 },   // 33
  { row: 8, col: 8 },   // 34 - Safe
  { row: 8, col: 9 },   // 35
  { row: 8, col: 10 },  // 36
  { row: 8, col: 11 },  // 37 - Blue entry
  { row: 8, col: 12 },  // 38
  // 39-44: Blue start going up (right-bottom)
  { row: 8, col: 13 },  // 39 - Blue start
  { row: 8, col: 14 },  // 40
  { row: 9, col: 14 },  // 41
  { row: 10, col: 14},  // 42
  { row: 11, col: 14},  // 43
  { row: 12, col: 14},  // 44
  // 45-51: Going left across bottom-right to red finish
  { row: 12, col: 13},  // 45
  { row: 12, col: 12},  // 46
  { row: 12, col: 11},  // 47 - Safe
  { row: 12, col: 10},  // 48
  { row: 12, col: 9},   // 49
  { row: 12, col: 8},   // 50 - Red entry (finish line)
  { row: 13, col: 8},   // 51
];

// Home path positions (colored columns leading to center)
export const HOME_PATH_POSITIONS: Record<PlayerColor, Position[]> = {
  red: [
    { row: 13, col: 7 },  // 52
    { row: 13, col: 6 },  // 53
    { row: 13, col: 5 },  // 54
    { row: 13, col: 4 },  // 55
    { row: 13, col: 3 },  // 56
  ],
  green: [
    { row: 7, col: 13 },  // 52
    { row: 6, col: 13 },  // 53
    { row: 5, col: 13 },  // 54
    { row: 4, col: 13 },  // 55
    { row: 3, col: 13 },  // 56
  ],
  yellow: [
    { row: 1, col: 7 },   // 52
    { row: 1, col: 6 },   // 53
    { row: 1, col: 5 },   // 54
    { row: 1, col: 4 },   // 55
    { row: 1, col: 3 },   // 56
  ],
  blue: [
    { row: 7, col: 1 },   // 52
    { row: 6, col: 1 },   // 53
    { row: 5, col: 1 },   // 54
    { row: 4, col: 1 },   // 55
    { row: 3, col: 1 },   // 56
  ],
};

// Center position (finish)
export const CENTER_POSITION: Position = { row: 7, col: 7 };
