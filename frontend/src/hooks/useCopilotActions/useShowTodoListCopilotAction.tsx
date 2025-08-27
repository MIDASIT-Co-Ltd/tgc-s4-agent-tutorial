import { useCopilotAction } from "@copilotkit/react-core";
import CompletionCountChart from "@/components/copilotActions/CompletionCountChart";
import TodoListInAgent from "@/components/copilotActions/TodoListInAgent";

const useShowCompletionCountChartCopilotAction = () => {
  useCopilotAction({
    name: "showTodoList",
    description: "할 일 목록을 리스트로 보여줍니다.",
    parameters: [
      // {
      //   name: "startDate",
      //   type: "string",
      //   description: "시작 날짜 (YYYY-MM-DD)",
      //   required: false,
      // },
      // {
      //   name: "endDate",
      //   type: "string",
      //   description: "종료 날짜 (YYYY-MM-DD)",
      //   required: false,
      // },
      {
        name: "todos",
        description: "할일 목록",
        type: "object[]",
        attributes: [
          {
            name: "id",
            type: "string",
            description: "할일 id",
          },
          {
            name: "title",
            type: "string",
            description: "할일 제목",
          },
          {
            name: "completed",
            type: "boolean",
            description: "할일 완료 여부",
          },
        ],
        required: true,
      },
    ],
    render: ({ status, args }) => {
      const { todos } = args;

      if (status === "inProgress") {
        return <div>loading...</div>; // Your own component for loading state
      } else {
        return <TodoListInAgent todos={todos ?? []} />;
      }
    },
    followUp: false,
  });
};

export default useShowCompletionCountChartCopilotAction;
