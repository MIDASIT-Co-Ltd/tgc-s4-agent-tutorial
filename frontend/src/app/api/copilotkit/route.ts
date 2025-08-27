import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import "@copilotkit/react-ui/styles.css";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: "gpt-5-nano",
});
const runtime = new CopilotRuntime();
// const runtime = new CopilotRuntime({
//   actions: ({ properties, url }) => {
//     return [
//       {
//         name: "addTodo",
//         description: "Adds a todo item",
//         parameters: [
//           {
//             name: "title",
//             type: "string",
//             description: "Todo title",
//             required: true,
//           },
//           {
//             name: "date",
//             type: "string",
//             description: "Todo date (YYYY-MM-DD), default is today",
//             required: false,
//           },
//           {
//             name: "priority",
//             type: "string",
//             description:
//               "Todo priority (low | medium | high), default is medium",
//             required: false,
//           },
//         ],
//         handler: async (args: any) => {
//           const { title, date, priority } = args;
//           console.log(title, date, priority);
//           const res = await fetch(`${url}/api/todos`, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               title,
//               date: date ?? new Date().toISOString(),
//               priority: priority ?? "medium",
//             }),
//           });

//           if (!res.ok) {
//             throw new Error("할 일을 추가하는데 실패했습니다.");
//           }

//           const data = await res.json();
//           return data;
//           // createMutation.mutate({
//           //   title: title ?? "",
//           //   date: date ?? new Date().toISOString(),
//           //   priority: (priority as Priority) ?? "medium",
//           // });
//         },
//       },
//     ];
//   },
// });

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
