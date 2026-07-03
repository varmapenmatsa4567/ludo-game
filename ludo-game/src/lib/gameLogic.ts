import { Token, Player, GameState, PlayerColor, BOARD_POSITIONS, SAFE_POSITIONS, TRACK_POSITIONS } from "./types";

export function createInitialGameState(): GameState {
  const players: Player[] = [
    createPlayer("red", "Red"),
    createPlayer("green", "Green"),
    createPlayer("yellow", "Yellow"),
    createPlayer("blue", "Blue"),
  ];

  return {
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolled: false,
    canMove: false,
    winner: null,
    message: "🎲 Click Roll Dice to start!",
    gameStarted: false,
  };
}

function createPlayer(color: PlayerColor, name: string): Player {
  const tokens: Token[] = [];
  for (let i = 0; i < 4; i++) {
    tokens.push({
      id: i,
      color,
      position: -1,
      isFinished: false,
      isHome: true,
    });
  }
  return { color, name, tokens, isActive: true };
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function getValidMoves(state: GameState): number[] {
  const player = state.players[state.currentPlayerIndex];
  const dice = state.diceValue!;
  const validTokens: number[] = [];

  for (const token of player.tokens) {
    if (token.isFinished) continue;

    if (token.isHome) {
      // Need a 6 to come out
      if (dice === 6) {
        validTokens.push(token.id);
      }
      continue;
    }

    // Token is on the board
    const newPos = token.position + dice;

    // Check if token can enter home path
    const colorInfo = BOARD_POSITIONS[player.color];
    if (token.position <= colorInfo.entry && newPos > colorInfo.entry) {
      // Moving into home path
      const homeSteps = newPos - colorInfo.entry;
      if (homeSteps <= 6) {
        if (homeSteps === 6) {
          // Exact roll to finish!
          validTokens.push(token.id);
        } else if (homeSteps < 6) {
          // Will land on home path
          validTokens.push(token.id);
        }
      }
      continue;
    }

    // Normal move
    if (newPos <= 51) {
      // Check if destination is occupied by own token
      const isBlocked = player.tokens.some(
        (t) => !t.isHome && !t.isFinished && t.id !== token.id && t.position === newPos
      );
      if (!isBlocked) {
        validTokens.push(token.id);
      }
    }
  }

  return validTokens;
}

export function getTokenGridPosition(token: Token): { row: number; col: number } | null {
  if (token.isHome) {
    const homeBase = BOARD_POSITIONS[token.color].homeBase;
    return homeBase[token.id];
  }

  if (token.isFinished) {
    return { row: 7, col: 7 }; // Center
  }

  // On home path (52-56)
  if (token.position >= 52 && token.position <= 56) {
    const index = token.position - 52;
    const path = BOARD_POSITIONS[token.color].homePath;
    // Map to actual grid positions
    const homePositions: Record<PlayerColor, { row: number; col: number }[]> = {
      red: [
        { row: 13, col: 7 },
        { row: 13, col: 6 },
        { row: 13, col: 5 },
        { row: 13, col: 4 },
        { row: 13, col: 3 },
      ],
      green: [
        { row: 7, col: 13 },
        { row: 6, col: 13 },
        { row: 5, col: 13 },
        { row: 4, col: 13 },
        { row: 3, col: 13 },
      ],
      yellow: [
        { row: 1, col: 7 },
        { row: 1, col: 6 },
        { row: 1, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 3 },
      ],
      blue: [
        { row: 7, col: 1 },
        { row: 6, col: 1 },
        { row: 5, col: 1 },
        { row: 4, col: 1 },
        { row: 3, col: 1 },
      ],
    };
    return homePositions[token.color][index];
  }

  // On main track (0-51)
  return TRACK_POSITIONS[token.position];
}

export function moveToken(state: GameState, tokenId: number): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const player = newState.players[newState.currentPlayerIndex];
  const token = player.tokens.find((t) => t.id === tokenId)!;
  const dice = newState.diceValue!;

  if (token.isHome && dice === 6) {
    // Move out of home to start position
    token.isHome = false;
    token.position = BOARD_POSITIONS[player.color].start;
    newState.message = `${player.name} rolled a 6! Token out! 🎉`;
  } else if (!token.isHome) {
    const colorInfo = BOARD_POSITIONS[player.color];
    const newPos = token.position + dice;

    // Check if crossing into home path
    if (token.position <= colorInfo.entry && newPos > colorInfo.entry) {
      const homeSteps = newPos - colorInfo.entry;
      if (homeSteps < 6) {
        token.position = 51 + homeSteps; // 52, 53, 54, 55, 56
        newState.message = `${player.name} moved into home path! 🏠`;
      } else if (homeSteps === 6) {
        token.isFinished = true;
        token.position = 57; // Finished
        newState.message = `${player.name} got a token home! 🏆`;
      }
    } else if (newPos <= 51) {
      token.position = newPos;
      newState.message = `${player.name} moved to position ${newPos}`;

      // Check for capturing opponent tokens
      for (const otherPlayer of newState.players) {
        if (otherPlayer.color === player.color) continue;
        for (const otherToken of otherPlayer.tokens) {
          if (!otherToken.isHome && !otherToken.isFinished && otherToken.position === newPos) {
            // Check if position is safe
            if (!SAFE_POSITIONS.includes(newPos)) {
              otherToken.isHome = true;
              otherToken.position = -1;
              newState.message = `${player.name} captured ${otherPlayer.name}'s token! 💥`;
            }
          }
        }
      }
    } else {
      // Overshoot - can't move
      newState.message = `Can't move that token!`;
      newState.diceRolled = false;
      newState.canMove = false;
      newState.diceValue = null;
      return newState;
    }
  }

  // Check for winner
  if (player.tokens.every((t) => t.isFinished)) {
    newState.winner = player.color;
    newState.message = `🎉🎉 ${player.name} wins the game! 🎉🎉`;
    return newState;
  }

  // Check for extra turn on 6
  if (dice === 6) {
    newState.message += " 🎲 Roll again!";
    newState.diceRolled = false;
    newState.canMove = false;
    newState.diceValue = null;
    return newState;
  }

  // Move to next player
  newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 4;
  newState.diceRolled = false;
  newState.canMove = false;
  newState.diceValue = null;

  return newState;
}

export function handleDiceRoll(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const dice = rollDice();
  newState.diceValue = dice;
  newState.diceRolled = true;
  newState.gameStarted = true;

  const player = newState.players[newState.currentPlayerIndex];
  newState.message = `${player.name} rolled a ${dice}! 🎲`;

  const validMoves = getValidMoves(newState);

  if (validMoves.length === 0) {
    if (dice === 6) {
      newState.message = `${player.name} rolled a 6 but can't move! 😕`;
    } else {
      newState.message = `${player.name} rolled a ${dice} - No valid moves! 😕`;
    }
    // Move to next player
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 4;
    newState.diceRolled = false;
    newState.diceValue = null;
    return newState;
  }

  if (validMoves.length === 1) {
    // Auto-move if only one option
    return moveToken(newState, validMoves[0]);
  }

  newState.canMove = true;
  newState.message = `${player.name} rolled a ${dice}! Choose a token to move. 👆`;
  return newState;
}
