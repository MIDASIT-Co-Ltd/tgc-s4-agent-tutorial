"use client";

import { Filter } from "@/components/todos/types";
import { useTodoContext } from "@/components/todos/TodoContext";

export default function TodoFilters() {
  const { filter, setFilter, remaining } = useTodoContext();
  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="text-sm text-[var(--muted-foreground)]">
        남은 작업: {remaining}
      </div>
      <div
        className="flex flex-wrap gap-1 text-sm"
        role="tablist"
        aria-label="필터"
      >
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 transition-colors border ${
              filter === f
                ? "btn-primary border-transparent"
                : "btn-outline hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            }`}
          >
            {f === "all" ? "전체" : f === "active" ? "진행중" : "완료"}
          </button>
        ))}
      </div>
    </div>
  );
}
