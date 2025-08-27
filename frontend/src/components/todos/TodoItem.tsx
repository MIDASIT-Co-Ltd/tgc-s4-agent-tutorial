"use client";

import { startOfDay, isSameDay } from "date-fns";
import DatePicker from "@/components/_shared/DatePicker";
import { Priority, Todo } from "@/requests/todos/readTodo/ReadTodoRs";
import { useTodoContext } from "@/components/todos/TodoContext";

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const {
    editingId,
    editingTitle,
    setEditingTitle,
    startEdit,
    commitEdit,
    cancelEdit,
    toggleTodo,
    removeTodo,
    updateDueAt,
    updatePriority,
  } = useTodoContext();
  const dueDate = new Date(todo.dueAt);
  const overdue =
    !todo.completed && todo.dueAt < startOfDay(new Date()).getTime();
  const dueToday = !todo.completed && isSameDay(dueDate, new Date());
  const accentClass = overdue
    ? "border-l-4 border-gray-400"
    : dueToday
    ? "border-l-4 border-rose-400"
    : "";
  const priorityBgClass =
    todo.priority === "high"
      ? "!bg-rose-50"
      : todo.priority === "low"
      ? "!bg-gray-100"
      : "!bg-blue-50";

  return (
    <li
      className={`group card-glass ${priorityBgClass} rounded-xl px-3 py-2 flex items-center gap-3 ${accentClass}`}
    >
      <input
        id={`todo-${todo.id}`}
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="size-4 accent-[var(--tint)]"
      />
      {(overdue || dueToday) && (
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] ${
            overdue
              ? "bg-gray-100 text-gray-700 border-gray-200"
              : "bg-rose-100 text-rose-700 border-rose-200"
          }`}
        >
          {overdue ? "지남" : "오늘"}
        </span>
      )}

      {editingId === todo.id ? (
        <input
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const nativeEvt = e.nativeEvent as unknown as {
                isComposing?: boolean;
                keyCode?: number;
              };
              if (nativeEvt?.isComposing || nativeEvt?.keyCode === 229) return;
              commitEdit();
            }
            if (e.key === "Escape") {
              cancelEdit();
            }
          }}
          onBlur={() => {
            commitEdit();
          }}
          autoFocus
          className="flex-1 bg-transparent outline-none border-b border-[var(--surface-border)] focus:border-[var(--tint)]"
          aria-label="항목 제목 편집"
        />
      ) : (
        <label
          htmlFor={`todo-${todo.id}`}
          className={`flex-1 select-none cursor-text ${
            todo.completed
              ? "line-through text-[var(--muted-foreground-2)]"
              : ""
          }`}
          onClick={() => startEdit(todo)}
        >
          {todo.title}
        </label>
      )}

      <div className="ml-auto flex items-center gap-2">
        <DatePicker
          value={new Date(todo.dueAt)}
          onChange={(d) => updateDueAt(todo.id, d)}
        />
        <select
          className="input-glass ring-focus rounded-lg px-3 py-2 text-sm"
          aria-label="중요도"
          value={todo.priority}
          onChange={(e) => updatePriority(todo.id, e.target.value as Priority)}
        >
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </select>
      </div>

      {editingId === todo.id ? (
        <button
          type="button"
          onClick={commitEdit}
          className="btn-primary rounded-md px-2 py-1 text-sm"
        >
          저장
        </button>
      ) : (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => removeTodo(todo.id)}
            className="rounded-md px-2 py-1 text-sm border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            aria-label="삭제"
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
}
