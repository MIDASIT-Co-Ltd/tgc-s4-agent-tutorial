"use client";

import "@copilotkit/react-ui/styles.css";
import { CopilotChat } from "@copilotkit/react-ui";
import { useFrontendTool } from "@copilotkit/react-core";
import { useState } from "react";
import GameBoard from "./components/GameBoard";
import { GAME_REGISTRY, type Game } from "./types/game";

export default function Home() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Register a single CopilotKit tool for game selection
  useFrontendTool({
    name: "select_game",
    description: `Select and display a game board. Available games: ${Object.values(GAME_REGISTRY).map(g => `${g.name} (${g.description})`).join(', ')}. Call this when the user wants to play a game.`,
    parameters: [
      {
        name: "game_id",
        type: "string",
        description: `The ID of the game to display. Available options: ${Object.keys(GAME_REGISTRY).join(', ')}`,
        required: true,
      },
    ],
    handler: async ({ game_id }: { game_id: string }) => {
      const game = GAME_REGISTRY[game_id];
      if (!game) {
        return `Game '${game_id}' not found. Available games: ${Object.keys(GAME_REGISTRY).join(', ')}`;
      }
      setCurrentGame(game);
      return `${game.name} board is now displayed. The game is ready to start!`;
    },
  });

  return (
    <main className="min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold p-8 pb-4">Let's play games</h1>
      <div className="flex flex-1 gap-4 px-8 pb-8">
        {currentGame ? (
          <GameBoard game={currentGame} />
        ) : (
          <div className="flex-1">
            <CopilotChat
              labels={{
                title: "Game Assistant",
                initial: "Hi! I'm your assistant. What game would you like to play today?",
              }}
              className="h-full"
            />
          </div>
        )}
      </div>
    </main>
  );
}