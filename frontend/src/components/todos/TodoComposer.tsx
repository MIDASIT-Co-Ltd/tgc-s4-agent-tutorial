"use client";

import { useTodoContext } from "@/components/todos/TodoContext";

export default function TodoComposer() {
  const { title, setTitle, addTodo, inputRef } = useTodoContext();
  return (
    <div className="card-glass rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const nativeEvt = e.nativeEvent as unknown as {
              isComposing?: boolean;
              keyCode?: number;
            };
            if (nativeEvt?.isComposing || nativeEvt?.keyCode === 229) return;
            addTodo();
          }
        }}
        placeholder="할 일을 입력하세요..."
        aria-label="새 할 일"
        className="input-glass ring-focus w-full rounded-lg px-3 py-2 text-[15px]"
      />
      <button
        type="button"
        onClick={addTodo}
        className="btn-primary ring-focus rounded-lg px-4 py-2 text-sm font-medium shadow-sm w-20 cursor-pointer"
      >
        추가
      </button>
    </div>
  );
}
