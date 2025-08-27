"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useTodoQuery from "@/requests/todos/readTodo/useTodoQuery";
import useCreateTodoMutation from "@/requests/todos/createTodo/useCreateTodoMutation";
import useUpdateTodoMutation from "@/requests/todos/updateTodo/useUpdateTodoMutation";
import useDeleteTodoMutation from "@/requests/todos/deleteTodo/useDeleteTodoMutation";
import { Priority, Todo } from "@/requests/todos/readTodo/ReadTodoRs";
import { Filter } from "@/components/todos/types";
import { useCopilotReadable } from "@copilotkit/react-core";

export const useTodos = () => {
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("active");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const { data } = useTodoQuery();
  const todos = useMemo(() => data?.items ?? [], [data?.items]);

  useCopilotReadable({
    description: "The current user's todos",
    value: todos,
  });

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const sortedTodos = useMemo(() => {
    const arr = [...filteredTodos];
    arr.sort((a, b) => a.dueAt - b.dueAt);
    return arr;
  }, [filteredTodos]);

  const remaining = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  const createMutation = useCreateTodoMutation();
  const updateMutation = useUpdateTodoMutation();
  const deleteMutation = useDeleteTodoMutation();

  const startEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }, []);

  const addTodo = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) return;
    createMutation.mutate({
      title: trimmed,
      date: new Date().toISOString(),
      priority: "medium",
    });
    setTitle("");
    inputRef.current?.focus();
  }, [title, createMutation]);

  const toggleTodo = useCallback(
    (id: string) => {
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      updateMutation.mutate({ id, patch: { completed: !current.completed } });
    },
    [todos, updateMutation]
  );

  const removeTodo = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      if (editingId === id) {
        setEditingId(null);
        setEditingTitle("");
      }
    },
    [editingId, deleteMutation]
  );

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      deleteMutation.mutate(editingId);
    } else {
      updateMutation.mutate({ id: editingId, patch: { title: trimmed } });
    }
    setEditingId(null);
    setEditingTitle("");
  }, [editingId, editingTitle, deleteMutation, updateMutation]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingTitle("");
  }, []);

  const clearCompleted = useCallback(async () => {
    const completed = todos.filter((t) => t.completed);
    await Promise.all(completed.map((t) => deleteMutation.mutateAsync(t.id)));
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  }, [todos, deleteMutation, queryClient]);

  const setAll = useCallback(
    async (completed: boolean) => {
      await Promise.all(
        todos.map((t) =>
          updateMutation.mutateAsync({ id: t.id, patch: { completed } })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    [todos, updateMutation, queryClient]
  );

  const updateDueAt = useCallback(
    (id: string, date: Date | null) => {
      const safe =
        date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
      updateMutation.mutate({ id, patch: { dueAt: safe.getTime() } });
    },
    [updateMutation]
  );

  const updatePriority = useCallback(
    (id: string, value: Priority) => {
      updateMutation.mutate({ id, patch: { priority: value } });
    },
    [updateMutation]
  );

  return {
    // state
    title,
    setTitle,
    filter,
    setFilter,
    editingId,
    editingTitle,
    setEditingTitle,
    inputRef,
    // derived
    todos,
    sortedTodos,
    remaining,
    // actions
    addTodo,
    toggleTodo,
    removeTodo,
    startEdit,
    commitEdit,
    cancelEdit,
    clearCompleted,
    setAll,
    updateDueAt,
    updatePriority,
  } as const;
};

export type UseTodosReturn = ReturnType<typeof useTodos>;
