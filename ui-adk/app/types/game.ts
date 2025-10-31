import TicTacToeBoard from "../components/games/TicTacToeBoard";

/**
 * Represents a game that can be played in the system
 */
export interface Game {
  /** Unique identifier for the game */
  id: string;
  /** Display name of the game */
  name: string;
  /** Description of the game for the AI assistant */
  description: string;
  /** Component to render for this game */
  component: React.ComponentType;
}

/**
 * Game registry - add new games here
 */
export const GAME_REGISTRY: Record<string, Game> = {
  "tic-tac-toe": {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe",
    description: "A classic 3x3 (or larger) grid game where players take turns placing X's and O's",
    component: TicTacToeBoard,
  },
  // Add more games here as needed
  // "chess": { ... },
  // "checkers": { ... },
};
