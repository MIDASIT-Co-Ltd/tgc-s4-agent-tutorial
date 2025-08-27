"use client";

import TodoApp from "@/components/todos/TodoApp";
import dynamic from "next/dynamic";
import useCopilotActions from "@/hooks/useCopilotActions/useCopilotActions";

const CopilotPopupNoSSR = dynamic(
  () => import("@copilotkit/react-ui").then((m) => m.CopilotPopup),
  { ssr: false }
);

export default function Home() {
  useCopilotActions();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="mx-auto max-w-[960px] px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold">투두리스트</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>빠르고 가벼운 메모</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-6 sm:px-8 py-8">
        <section className="card-glass rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm text-[var(--muted-foreground)]">
              오늘의 할 일을 정리해 보세요.
            </p>
          </div>
          <TodoApp />
        </section>
      </main>

      <CopilotPopupNoSSR
        instructions={
          "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        }
        labels={{
          title: "투두 에이전트",
          initial: "무엇을 도와드릴까요?",
        }}
      />
    </div>
  );
}
