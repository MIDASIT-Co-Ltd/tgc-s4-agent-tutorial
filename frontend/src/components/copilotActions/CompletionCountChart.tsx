import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useTodoQuery from "@/requests/todos/readTodo/useTodoQuery";
import { useMemo } from "react";
import { isSameDay } from "date-fns";

const chartConfig = {
  count: {
    label: "완료 수",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const CompletionCountChart = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = useTodoQuery({
    start: startDate,
    end: endDate,
  });

  const chartData = useMemo(() => {
    const chartData: { date: string; count: number }[] = [];
    const start = new Date(startDate ?? data?.items[0].dueAt ?? "");
    const end = new Date(
      endDate ?? data?.items[data.items.length - 1].dueAt ?? ""
    );

    console.log(start, end);
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      chartData.push({
        date: d.toISOString().split("T")[0],
        count:
          data?.items.filter(
            (item) => isSameDay(new Date(item.dueAt), d) && item.completed
          ).length ?? 0,
      });
    }

    return chartData;
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(5, 10)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

export default CompletionCountChart;
