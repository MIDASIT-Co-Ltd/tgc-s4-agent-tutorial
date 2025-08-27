import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateTodoRq } from "./UpdateTodoRq";
import { GetTodosRs } from "../readTodo/ReadTodoRs";
import { UpdateTodoRs } from "./UpdateTodoRs";

const useUpdateTodoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; patch: UpdateTodoRq }) => {
      const res = await fetch(`/api/todos/${args.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.patch),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const json: UpdateTodoRs = await res.json();
      return json.item;
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousAll = queryClient.getQueriesData<GetTodosRs>({
        queryKey: ["todos"],
      });
      previousAll.forEach(([qk]) => {
        queryClient.setQueryData<GetTodosRs>(qk as any, (old) => ({
          items: (old?.items ?? []).map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
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

export default useUpdateTodoMutation;
