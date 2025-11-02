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
      <div className="flex flex-1 gap-4 px-8 py-8">
        {currentGame ? (
          <GameBoard game={currentGame} />
        ) : (
          <>
            {/* Left Pane - Welcome Section */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl px-8">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                  <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Let&apos;s Play Games!
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Start by choosing your game on chat
                  </p>
                </div>

                {/* Available Games Section */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    Available Games:
                  </h2>
                  <div className="space-y-2">
                    {Object.values(GAME_REGISTRY).map((game) => (
                      <div
                        key={game.id}
                        className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-md"
                      >
                        <span className="text-2xl">🎮</span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {game.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {game.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane - Chat Interface */}
            <div className="flex-1">
              <CopilotChat
                labels={{
                  title: "Game Assistant",
                  initial: "Hi! I'm your game assistant. Tell me which game you'd like to play!",
                }}
                className="h-full"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}