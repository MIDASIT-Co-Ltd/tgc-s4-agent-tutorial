import { useCopilotAction } from "@copilotkit/react-core";
import useCreateTodoMutation from "@/requests/todos/createTodo/useCreateTodoMutation";
import { Priority } from "@/requests/todos/readTodo/ReadTodoRs";

const useAddTodoCopilotAction = () => {
  const createMutation = useCreateTodoMutation();

  useCopilotAction({
    name: "addTodo",
    description: "Adds a todo item",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Todo title (제목에 날짜 정보는 제거하고 입력해주세요.)",
        required: true,
      },
      {
        name: "date",
        type: "string",
        description: "Todo date (YYYY-MM-DD), default is today",
        required: false,
      },
      {
        name: "priority",
        type: "string",
        description: "Todo priority (low | medium | high), default is medium",
        required: false,
      },
    ],
    handler: async (args) => {
      const { title, date, priority } = args;
      createMutation.mutate({
        title: title ?? "",
        date: date ?? new Date().toISOString(),
        priority: (priority as Priority) ?? "medium",
      });
    },
  });
};

export default useAddTodoCopilotAction;
