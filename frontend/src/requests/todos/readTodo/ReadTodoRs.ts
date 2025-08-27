export type Priority = "low" | "medium" | "high";

// DB entity as used in app
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number; // epoch ms
  dueAt: number; // epoch ms
  priority: Priority;
};

// GET /api/todos
export type GetTodosRs = {
  items: Todo[];
};
