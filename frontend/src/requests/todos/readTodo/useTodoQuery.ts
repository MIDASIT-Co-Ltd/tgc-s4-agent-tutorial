import { useQuery } from "@tanstack/react-query";
import { GetTodosRs } from "./ReadTodoRs";

type Params = {
  start?: Date | string | number | null;
  end?: Date | string | number | null;
};

const useTodoQuery = (params?: Params) => {
  const toIso = (v?: Date | string | number | null) => {
    if (!v && v !== 0) return undefined;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const startIso = toIso(params?.start ?? undefined);
  const endIso = toIso(params?.end ?? undefined);

  return useQuery<GetTodosRs>({
    queryKey: [
      "todos",
      startIso || endIso ? { start: startIso, end: endIso } : undefined,
    ],
    queryFn: async (): Promise<GetTodosRs> => {
      const url = new URL("/api/todos", window.location.origin);
      if (startIso) url.searchParams.set("start", startIso);
      if (endIso) url.searchParams.set("end", endIso);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch todos");
      return res.json();
    },
  });
};

export default useTodoQuery;
