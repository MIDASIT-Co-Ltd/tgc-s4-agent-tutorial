"use client";

import { useTodoContext } from "@/components/todos/TodoContext";

export default function TodoBulkActions() {
  const { setAll, clearCompleted, todos } = useTodoContext();
  if (todos.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setAll(true)}
        className="btn-outline rounded-full px-3 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      >
        모두 완료
      </button>
      <button
        type="button"
        onClick={() => setAll(false)}
        className="btn-outline rounded-full px-3 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      >
        모두 취소
      </button>
      <button
        type="button"
        onClick={clearCompleted}
        className="rounded-full px-3 py-1 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        완료 삭제
      </button>
    </div>
  );
}
