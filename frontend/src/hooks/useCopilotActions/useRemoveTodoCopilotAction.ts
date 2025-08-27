import { useCopilotAction } from "@copilotkit/react-core";
import useDeleteTodoMutation from "@/requests/todos/deleteTodo/useDeleteTodoMutation";

const useRemoveTodoCopilotAction = () => {
  const deleteMutation = useDeleteTodoMutation();

  useCopilotAction({
    name: "removeTodo",
    description: "Removes a todo item",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Todo ID",
        required: true,
      },
    ],
    handler: async (args) => {
      const { id } = args;
      deleteMutation.mutate(id);
    },
  });
};

export default useRemoveTodoCopilotAction;
