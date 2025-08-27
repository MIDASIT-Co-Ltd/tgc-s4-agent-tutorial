import { Todo } from "../readTodo/ReadTodoRs";

// PATCH /api/todos/[id]
export type UpdateTodoRq = Partial<
  Pick<Todo, "title" | "completed" | "dueAt" | "priority">
>;
