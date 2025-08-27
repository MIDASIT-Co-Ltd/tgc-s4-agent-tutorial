import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteTodoRs } from "./DeleteTodoRs";
import { GetTodosRs } from "../readTodo/ReadTodoRs";

const useDeleteTodoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
      const _json: DeleteTodoRs = await res.json();
      return _json.ok;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousAll = queryClient.getQueriesData<GetTodosRs>({
        queryKey: ["todos"],
      });
      previousAll.forEach(([qk]) => {
        queryClient.setQueryData<GetTodosRs>(qk as any, (old) => ({
          items: (old?.items ?? []).filter((t) => t.id !== id),
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

export default useDeleteTodoMutation;
