"use client";

import TodoItem from "@/components/todos/TodoItem";
import { useTodoContext } from "@/components/todos/TodoContext";

export default function TodoList() {
  const { sortedTodos: items } = useTodoContext();
  return (
    <ul className="mt-4 space-y-2" aria-live="polite">
      {items.length === 0 && (
        <li className="text-sm text-[var(--muted-foreground)]">
          표시할 항목이 없습니다.
        </li>
      )}
      {items.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
