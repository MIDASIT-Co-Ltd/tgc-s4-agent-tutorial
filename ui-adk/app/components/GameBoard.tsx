"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import type { Game } from "../types/game";

interface GameBoardProps {
  game: Game;
}

/**
 * Generic wrapper component for rendering game boards with the chat interface
 */
export default function GameBoard({ game }: GameBoardProps) {
  const GameComponent = game.component;

  return (
    <>
      <div className="flex-1">
        <GameComponent />
      </div>
      <div className="flex-1">
        <CopilotChat
          labels={{
            title: "Game Assistant",
            initial: `Hi! I'm your opponent. Let's play ${game.name}!`,
          }}
          className="h-full"
        />
      </div>
    </>
  );
}
