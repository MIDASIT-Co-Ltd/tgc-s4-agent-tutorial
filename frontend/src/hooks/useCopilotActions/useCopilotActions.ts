import useAddTodoCopilotAction from "./useAddTodoCopilotAction";
import useUpdateTodoCopilotAction from "./useUpdateTodoCopilotAction";
import useRemoveTodoCopilotAction from "./useRemoveTodoCopilotAction";
import useShowCompletionRateCopilotAction from "./useShowCompletionCountChartCopilotAction";
import useShowTodoListCopilotAction from "./useShowTodoListCopilotAction";

const useCopilotActions = () => {
  useAddTodoCopilotAction();
  useUpdateTodoCopilotAction();
  useRemoveTodoCopilotAction();
  useShowCompletionRateCopilotAction();
  useShowTodoListCopilotAction();
};

export default useCopilotActions;
