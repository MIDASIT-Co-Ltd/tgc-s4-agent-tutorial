"use client";

import { useCopilotChat, useFrontendTool } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { useState, useEffect, useCallback } from "react";

/**
 * Parse text-based tic-tac-toe board representation to a 2D array
 * Example input:
 *  X | O | X
 * -----------
 *  O | X | E
 * -----------
 *  E | O | X
 */
function parseBoardText(boardText: string): string[][] {
  if (!boardText.trim()) {
    return [];
  }

  const lines = boardText.split('\n').filter(line => !line.includes('---'));
  const board: string[][] = [];

  for (const line of lines) {
    const cells = line.split('|').map(cell => {
      const trimmed = cell.trim();
      return trimmed === '' ? 'E' : trimmed;
    });
    board.push(cells);
  }

  return board;
}

/**
 * Convert a 2D array board to text representation
 */
function boardToText(board: string[][]): string {
  if (board.length === 0) return "";

  const lines: string[] = [];
  for (let i = 0; i < board.length; i++) {
    const row = board[i].map(cell => ` ${cell} `).join('|');
    lines.push(row);
    if (i < board.length - 1) {
      lines.push('-'.repeat(row.length));
    }
  }

  return lines.join('\n');
}

/**
 * Update a specific grid cell to empty (E), X, or O
 */
function updateGridCell(board: string[][], row: number, col: number, value: 'E' | 'X' | 'O'): string[][] {
  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = value;
  return newBoard;
}

export default function TicTacToeBoard() {
  const [size, setSize] = useState<number>(3);
  const [boardText, setBoardText] = useState<string>("");
  const [lastClickedCell, setLastClickedCell] = useState<{row: number, col: number} | null>(null);
  const [gameEndMessage, setGameEndMessage] = useState<string | null>(null);
  const { appendMessage, isLoading } = useCopilotChat();

  // Parse the board text or create an empty board
  const board = boardText.trim()
    ? parseBoardText(boardText)
    : Array(size).fill(null).map(() => Array(size).fill("E"));

  // Handle click on a grid cell - draws O, or cancels if clicking the most recent cell
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    // Check if clicking the most recently clicked cell
    if (lastClickedCell?.row === rowIndex && lastClickedCell?.col === colIndex) {
      // Cancel the change - clear the cell
      const updatedBoard = updateGridCell(board, rowIndex, colIndex, 'E');
      setBoardText(boardToText(updatedBoard));
      setLastClickedCell(null);
    } else {
      // Add O to the clicked cell
      const updatedBoard = updateGridCell(board, rowIndex, colIndex, 'O');
      setBoardText(boardToText(updatedBoard));
      setLastClickedCell({row: rowIndex, col: colIndex});
    }
  };

  // Function for AI opponent - draws X, or cancels if clicking the most recent AI move
  // This function is exported via window object for external AI agents to use
  const clickGridCellByAI = useCallback((rowIndex: number, colIndex: number) => {
    const currentBoard = boardText.trim()
      ? parseBoardText(boardText)
      : Array(size).fill(null).map(() => Array(size).fill("E"));
    
    // Check if clicking the most recently clicked cell
    if (lastClickedCell?.row === rowIndex && lastClickedCell?.col === colIndex) {
      // Cancel the change - clear the cell
      const updatedBoard = updateGridCell(currentBoard, rowIndex, colIndex, 'E');
      setBoardText(boardToText(updatedBoard));
      setLastClickedCell(null);
    } else {
      // Add X to the clicked cell
      const updatedBoard = updateGridCell(currentBoard, rowIndex, colIndex, 'X');
      setBoardText(boardToText(updatedBoard));
      setLastClickedCell({row: rowIndex, col: colIndex});
    }
  }, [boardText, size, lastClickedCell]);

  // Expose clickGridCellByAI to window for AI agent access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).clickGridCellByAI = clickGridCellByAI;
    }
  }, [clickGridCellByAI]);

  // Register CopilotKit tool for AI to make moves
  useFrontendTool({
    name: "click_grid_cell_by_ai",
    description: `Place an X on the tic-tac-toe board at the specified position. Use this to make your move as the AI opponent. Clicking the same position again cancels the most recent move (shown in red). Current board size is ${size}x${size}.`,
    parameters: [
      {
        name: "row",
        type: "number",
        description: `The row index (0-${size - 1}) where to place X. 0 is top row, ${size - 1} is bottom row.`,
        required: true,
      },
      {
        name: "col",
        type: "number",
        description: `The column index (0-${size - 1}) where to place X. 0 is left column, ${size - 1} is right column.`,
        required: true,
      },
    ],
    handler: async ({ row, col }: { row: number; col: number }) => {
      clickGridCellByAI(row, col);
      return `Successfully placed X at position (${row}, ${col})`;
    },
  });

  // Register CopilotKit tool for showing game end popup
  useFrontendTool({
    name: "show_game_end_popup",
    description: "Show a popup message when the game ends. Call this when someone wins or the game is a draw. Use 'ai_won' when AI (X) wins, 'player_won' when the player (O) wins, or 'draw' for a tie.",
    parameters: [
      {
        name: "result",
        type: "string",
        description: "The game result: 'ai_won' if AI wins, 'player_won' if player wins, or 'draw' for a tie.",
        required: true,
      },
    ],
    handler: async ({ result }: { result: string }) => {
      if (result === "ai_won") {
        setGameEndMessage("You lost! Try Again.");
      } else if (result === "player_won") {
        setGameEndMessage("You won!");
      } else if (result === "draw") {
        setGameEndMessage("It's a draw!");
      }
      return `Game end popup shown with result: ${result}`;
    },
  });

  // Handle confirm button click - send board text to chat
  const handleConfirm = () => {
    if (!isLoading) {
      const currentBoardText = boardText.trim() || boardToText(board);
      appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: `Current tic-tac-toe board state:\n${currentBoardText}`
        })
      );
    }
  };

  // Handle clear button click - clear board
  const handleClear = () => {
    if (!isLoading) {
      setBoardText("");
      setLastClickedCell(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Game End Popup */}
      {gameEndMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <h2 className="text-3xl font-bold">{gameEndMessage}</h2>
            <button
              onClick={() => {
                setGameEndMessage(null);
                setBoardText("");
                setLastClickedCell(null);
              }}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="board-size" className="font-semibold">
          Board Size:
        </label>
        <input
          id="board-size"
          type="number"
          min="3"
          max="10"
          value={size}
          onChange={(e) => {
            const newSize = parseInt(e.target.value) || 3;
            setSize(newSize);
            setBoardText(""); // Reset board when size changes
          }}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="inline-block relative">
        <div
          className="grid border-2 border-gray-800"
          style={{
            gridTemplateColumns: `repeat(${board.length}, 80px)`,
            gridTemplateRows: `repeat(${board.length}, 80px)`,
            gap: 0,
          }}
        >
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isLastClicked = lastClickedCell?.row === rowIndex && lastClickedCell?.col === colIndex;
              const textColor = isLastClicked ? 'text-red-600' : 'text-black';
              const displayCell = cell === 'E' ? '' : cell;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`flex items-center justify-center text-6xl font-bold border border-gray-400 bg-white hover:bg-gray-100 cursor-pointer transition-colors ${textColor}`}
                  style={{
                    borderRight: colIndex === board.length - 1 ? 'none' : undefined,
                    borderBottom: rowIndex === board.length - 1 ? 'none' : undefined,
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {displayCell}
                </div>
              );
            })
          ))}
        </div>

        <div className="absolute bottom-0 right-0 translate-y-full mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
              isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
              isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? "Please Wait..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
