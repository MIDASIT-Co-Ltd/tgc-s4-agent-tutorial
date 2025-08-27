"use client";

import { createContext, useContext, PropsWithChildren } from "react";
import { useTodos, UseTodosReturn } from "@/components/todos/useTodos";

const TodoContext = createContext<UseTodosReturn | null>(null);

export function TodoProvider({ children }: PropsWithChildren) {
  const value = useTodos();
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodoContext(): UseTodosReturn {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }
  return ctx;
}
