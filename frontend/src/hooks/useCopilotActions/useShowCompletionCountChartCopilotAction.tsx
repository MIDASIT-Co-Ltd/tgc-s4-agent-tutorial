import { useCopilotAction } from "@copilotkit/react-core";
import CompletionCountChart from "@/components/copilotActions/CompletionCountChart";

const useShowCompletionCountChartCopilotAction = () => {
  useCopilotAction({
    name: "showCompletionCountChart",
    description:
      "일별 할일 완료 수를 차트로 보여줍니다. 일주일은 월요일부터 일요일까지 입니다.",
    parameters: [
      {
        name: "startDate",
        type: "string",
        description: "시작 날짜 (YYYY-MM-DD)",
        required: false,
      },
      {
        name: "endDate",
        type: "string",
        description: "종료 날짜 (YYYY-MM-DD)",
        required: false,
      },
    ],
    render: ({ status, args }) => {
      const { startDate, endDate } = args;

      console.log(status);

      if (status === "inProgress") {
        return <div>loading...</div>; // Your own component for loading state
      } else {
        return <CompletionCountChart startDate={startDate} endDate={endDate} />;
      }
    },
    followUp: false,
  });
};

export default useShowCompletionCountChartCopilotAction;
