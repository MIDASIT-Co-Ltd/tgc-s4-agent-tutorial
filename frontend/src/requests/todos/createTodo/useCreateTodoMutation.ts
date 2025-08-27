import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTodoRq } from "./CreateTodoRq";
import { CreateTodoRs } from "./CreateTodoRs";
import { GetTodosRs, Priority } from "../readTodo/ReadTodoRs";
import { Todo } from "../readTodo/ReadTodoRs";

const useCreateTodoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      date,
      priority,
    }: {
      title: string;
      date: string;
      priority: Priority;
    }) => {
      const body: CreateTodoRq = { title, date, priority };
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      const json: CreateTodoRs = await res.json();
      return json.item;
    },
    onMutate: async ({ title, date, priority }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousAll = queryClient.getQueriesData<GetTodosRs>({
        queryKey: ["todos"],
      });

      const time = new Date(date).getTime();
      const optimistic: Todo = {
        id: `temp-${time}`,
        title,
        completed: false,
        createdAt: new Date().getTime(),
        dueAt: time,
        priority,
      };

      const isInRange = (key: unknown): boolean => {
        if (!Array.isArray(key)) return true;
        const maybeParams = key[1] as
          | { start?: string; end?: string }
          | undefined;
        if (!maybeParams) return true;
        const startMs = maybeParams.start
          ? Date.parse(maybeParams.start)
          : Number.NEGATIVE_INFINITY;
        const endMs = maybeParams.end
          ? Date.parse(maybeParams.end)
          : Number.POSITIVE_INFINITY;
        return optimistic.dueAt >= startMs && optimistic.dueAt <= endMs;
      };

      previousAll.forEach(([qk]) => {
        if (!isInRange(qk)) return;
        queryClient.setQueryData<GetTodosRs>(qk as any, (old) => ({
          items: [optimistic, ...(old?.items ?? [])],
        }));
      });

      return { previousAll };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousAll) {
        (ctx.previousAll as [unknown, GetTodosRs | undefined][])?.forEach(
          ([qk, data]) => {
            queryClient.setQueryData(qk as any, data);
          }
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export default useCreateTodoMutation;
