import { useCopilotAction } from "@copilotkit/react-core";
import useUpdateTodoMutation from "@/requests/todos/updateTodo/useUpdateTodoMutation";
import { Priority } from "@/requests/todos/readTodo/ReadTodoRs";

const useUpdateTodoCopilotAction = () => {
  const updateMutation = useUpdateTodoMutation();

  useCopilotAction({
    name: "updateTodo",
    description: "Updates a todo item",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Todo ID",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Todo title",
        required: false,
      },
      {
        name: "completed",
        type: "boolean",
        description: "Todo completed (true | false)",
        required: false,
      },
      {
        name: "priority",
        type: "string",
        description: "Todo priority (low | medium | high)",
        required: false,
      },
      {
        name: "date",
        type: "string",
        description: "Todo date (YYYY-MM-DD)",
        required: false,
      },
    ],
    handler: async (args) => {
      const { id, title, completed, priority, date } = args;
      updateMutation.mutate({
        id,
        patch: {
          title: title ?? undefined,
          completed: completed ?? undefined,
          priority: (priority as Priority) ?? undefined,
          dueAt: date ? new Date(date).getTime() : undefined,
        },
      });
    },
  });
};

export default useUpdateTodoCopilotAction;
