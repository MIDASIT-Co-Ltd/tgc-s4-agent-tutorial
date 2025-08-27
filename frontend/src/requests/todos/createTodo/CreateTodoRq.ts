import { Priority } from "../readTodo/ReadTodoRs";

export type CreateTodoRq = {
  title: string;
  date: string;
  priority: Priority;
};
