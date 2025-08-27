"use client";

import TodoComposer from "@/components/todos/TodoComposer";
import TodoFilters from "@/components/todos/TodoFilters";
import TodoBulkActions from "@/components/todos/TodoBulkActions";
import TodoList from "@/components/todos/TodoList";
import { TodoProvider } from "@/components/todos/TodoContext";

export default function TodoApp() {
  return (
    <div className="w-full max-w-[800px] mx-auto">
      <TodoProvider>
        <TodoComposer />
        <TodoFilters />
        <TodoBulkActions />
        <TodoList />
      </TodoProvider>
    </div>
  );
}
